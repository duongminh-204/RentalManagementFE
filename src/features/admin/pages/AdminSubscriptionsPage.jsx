import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, LoaderCircle, RefreshCw, XCircle } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import {
  cancelAdminSubscription,
  downgradeAdminSubscription,
  getAdminPackages,
  getAdminSubscriptions,
  renewAdminSubscription,
  upgradeAdminSubscription,
} from '../api/adminApi';
import { formatDate, statusClass } from '../utils/adminHelpers';

const AdminSubscriptionsPage = () => {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [changeTarget, setChangeTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminSubscriptions({ status, page, pageSize: 10 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải đăng ký.');
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
    getAdminPackages({ pageSize: 100, isEnabled: true }).then((data) => setPackages(data.items || [])).catch(() => {});
  }, [load]);

  const runAction = async (fn) => {
    try {
      setActionLoading(true);
      await fn();
      setChangeTarget(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePackage = async (event) => {
    event.preventDefault();
    const packageId = Number(new FormData(event.target).get('packageId'));
    if (!changeTarget || !packageId) return;
    await runAction(() =>
      changeTarget.mode === 'upgrade'
        ? upgradeAdminSubscription(changeTarget.subscriptionId, packageId)
        : downgradeAdminSubscription(changeTarget.subscriptionId, packageId),
    );
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader
        title="Quản lý đăng ký"
        description="Nâng/hạ cấp, gia hạn, hủy gói. Tự động kiểm tra hết hạn và giới hạn phòng."
      />

      <div className="dashboard-section-card">
        <div className="mb-4">
          <select className="rounded-xl border border-hairline-cloud px-4 py-2.5" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}

        {loading ? (
          <div className="flex justify-center py-12"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-cloud text-left text-muted">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Chủ trọ</th>
                  <th className="px-3 py-3">Gói</th>
                  <th className="px-3 py-3">Phòng</th>
                  <th className="px-3 py-3">Bắt đầu</th>
                  <th className="px-3 py-3">Kết thúc</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sub) => (
                  <tr key={sub.subscriptionId} className="border-b border-hairline-cloud/70">
                    <td className="px-3 py-3">{sub.subscriptionId}</td>
                    <td className="px-3 py-3">{sub.ownerName}</td>
                    <td className="px-3 py-3">{sub.packageName}</td>
                    <td className="px-3 py-3">
                      {sub.ownerRoomCount}/{sub.maxRooms}
                      {sub.ownerRoomCount > sub.maxRooms ? (
                        <span className="ml-1 text-xs text-[#b4234a]">Vượt giới hạn</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">{formatDate(sub.startDate)}</td>
                    <td className="px-3 py-3">{formatDate(sub.endDate)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(sub.status)}`}>{sub.status}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => setChangeTarget({ subscriptionId: sub.subscriptionId, mode: 'upgrade' })} title="Upgrade"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => setChangeTarget({ subscriptionId: sub.subscriptionId, mode: 'downgrade' })} title="Downgrade"><ArrowDown className="h-4 w-4" /></button>
                        <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(() => renewAdminSubscription(sub.subscriptionId))} title="Renew"><RefreshCw className="h-4 w-4" /></button>
                        <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(() => cancelAdminSubscription(sub.subscriptionId))} title="Cancel"><XCircle className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {changeTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleChangePackage} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">{changeTarget.mode === 'upgrade' ? 'Nâng cấp gói' : 'Hạ cấp gói'}</h2>
            <select name="packageId" required className="mt-4 w-full rounded-xl border px-4 py-2.5">
              <option value="">Chọn gói mới</option>
              {packages.map((pkg) => (
                <option key={pkg.packageId} value={pkg.packageId}>{pkg.packageName} — {pkg.maxRooms} phòng</option>
              ))}
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="dashboard-action-button" onClick={() => setChangeTarget(null)}>Huỷ</button>
              <button type="submit" disabled={actionLoading} className="dashboard-action-button dashboard-action-button--primary">Xác nhận</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default AdminSubscriptionsPage;
