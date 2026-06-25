import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import { getAdminAuditLogs } from '../api/adminApi';
import { formatDateTime } from '../utils/adminHelpers';

const AdminAuditLogsPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminAuditLogs({ action, entity, page, pageSize: 20 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải nhật ký.');
    } finally {
      setLoading(false);
    }
  }, [action, entity, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader
        title="Nhật ký hệ thống"
        description="Theo dõi Login, Logout, Create, Update, Delete, Payment và thay đổi đăng ký."
      />

      <div className="dashboard-section-card">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <select className="rounded-xl border border-hairline-cloud px-4 py-2.5" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
            <option value="">Tất cả hành động</option>
            <option value="Login">Login</option>
            <option value="Logout">Logout</option>
            <option value="Create">Create</option>
            <option value="Update">Update</option>
            <option value="Delete">Delete</option>
            <option value="Payment">Payment</option>
            <option value="Subscription">Subscription</option>
          </select>
          <select className="rounded-xl border border-hairline-cloud px-4 py-2.5" value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}>
            <option value="">Tất cả entity</option>
            <option value="User">User</option>
            <option value="Owner">Owner</option>
            <option value="Package">Package</option>
            <option value="Subscription">Subscription</option>
            <option value="SubscriptionPayment">SubscriptionPayment</option>
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
                  <th className="px-3 py-3">LogID</th>
                  <th className="px-3 py-3">User</th>
                  <th className="px-3 py-3">Action</th>
                  <th className="px-3 py-3">Entity</th>
                  <th className="px-3 py-3">EntityID</th>
                  <th className="px-3 py-3">IP</th>
                  <th className="px-3 py-3">Thời gian</th>
                  <th className="px-3 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.logId} className="border-b border-hairline-cloud/70">
                    <td className="px-3 py-3">{log.logId}</td>
                    <td className="px-3 py-3">{log.userName || log.userId || '—'}</td>
                    <td className="px-3 py-3 font-medium">{log.action}</td>
                    <td className="px-3 py-3">{log.entity || '—'}</td>
                    <td className="px-3 py-3">{log.entityId ?? '—'}</td>
                    <td className="px-3 py-3">{log.ipAddress || '—'}</td>
                    <td className="px-3 py-3">{formatDateTime(log.timestamp)}</td>
                    <td className="max-w-xs truncate px-3 py-3">{log.details || '—'}</td>
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

export default AdminAuditLogsPage;
