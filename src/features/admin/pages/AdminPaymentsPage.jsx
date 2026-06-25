import { useCallback, useEffect, useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import { exportAdminPaymentsExcel, getAdminPayments, getAdminRevenueReport } from '../api/adminApi';
import AdminPlatformPaymentSettings from '../components/AdminPlatformPaymentSettings';
import { formatDate, formatDateTime, formatVnd, statusClass } from '../utils/adminHelpers';

const AdminPaymentsPage = () => {
  const [items, setItems] = useState([]);
  const [report, setReport] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [payments, revenueReport] = await Promise.all([
        getAdminPayments({ page, pageSize: 10 }),
        getAdminRevenueReport(),
      ]);
      setItems(payments.items || []);
      setTotalPages(payments.totalPages || 1);
      setReport(revenueReport);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await exportAdminPaymentsExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xuất Excel.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader title="Quản lý thanh toán" description="Lịch sử thanh toán SaaS, báo cáo doanh thu và xuất Excel.">
        <button type="button" className="dashboard-action-button dashboard-action-button--primary" onClick={handleExport} disabled={exporting}>
          {exporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Xuất Excel
        </button>
      </AdminPageHeader>

      <AdminPlatformPaymentSettings />

      {report ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="dashboard-mini-card"><p className="text-sm text-muted">Tổng doanh thu</p><p className="mt-2 text-2xl font-bold">{formatVnd(report.totalRevenue)}</p></div>
          <div className="dashboard-mini-card"><p className="text-sm text-muted">Doanh thu tháng</p><p className="mt-2 text-2xl font-bold">{formatVnd(report.monthlyRevenue)}</p></div>
          <div className="dashboard-mini-card"><p className="text-sm text-muted">Số giao dịch</p><p className="mt-2 text-2xl font-bold">{report.totalPayments}</p></div>
        </div>
      ) : null}

      <div className="dashboard-section-card">
        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
        {loading ? (
          <div className="flex justify-center py-12"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-cloud text-left text-muted">
                  <th className="px-3 py-3">PaymentID</th>
                  <th className="px-3 py-3">Chủ trọ</th>
                  <th className="px-3 py-3">SubscriptionID</th>
                  <th className="px-3 py-3">Số tiền</th>
                  <th className="px-3 py-3">Phương thức</th>
                  <th className="px-3 py-3">Ngày</th>
                  <th className="px-3 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.map((payment) => (
                  <tr key={payment.paymentId} className="border-b border-hairline-cloud/70">
                    <td className="px-3 py-3">{payment.paymentId}</td>
                    <td className="px-3 py-3">{payment.ownerName}</td>
                    <td className="px-3 py-3">{payment.subscriptionId}</td>
                    <td className="px-3 py-3">{formatVnd(payment.amount)}</td>
                    <td className="px-3 py-3">{payment.paymentMethod}</td>
                    <td className="px-3 py-3">{formatDateTime(payment.paymentDate)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(payment.status)}`}>{payment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
