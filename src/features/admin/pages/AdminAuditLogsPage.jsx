import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import { clearAdminAuditLogs, getAdminAuditLogs } from '../api/adminApi';
import { formatDateTime } from '../utils/adminHelpers';

const AdminAuditLogsPage = () => {
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

  const hasFilters = Boolean(action || entity);
  const clearTargetLabel = hasFilters ? 'nhật ký theo bộ lọc hiện tại' : 'toàn bộ nhật ký hệ thống';

  const handleClearLogs = async () => {
    const confirmed = await confirmDelete({
      title: 'Xóa nhật ký hệ thống',
      targetLabel: clearTargetLabel,
      description: hasFilters
        ? 'Các bản ghi khớp với bộ lọc hành động/entity đang chọn sẽ bị xóa vĩnh viễn.'
        : 'Tất cả bản ghi nhật ký sẽ bị xóa vĩnh viễn.',
      consequences: [
        'Không thể khôi phục dữ liệu đã xóa.',
        'Một bản ghi mới sẽ được tạo để ghi nhận thao tác xóa.',
      ],
      confirmLabel: 'Xóa nhật ký',
    });
    if (!confirmed) return;

    try {
      setClearing(true);
      setError('');
      setMessage('');
      const params = {};
      if (action) params.action = action;
      if (entity) params.entity = entity;
      const result = await clearAdminAuditLogs(params);
      const deletedCount = result?.deletedCount ?? 0;
      setMessage(deletedCount > 0 ? `Đã xóa ${deletedCount} bản ghi nhật ký.` : 'Không có bản ghi nào cần xóa.');
      setPage(1);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa nhật ký.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader
        title="Nhật ký hệ thống"
        description="Theo dõi Login, Logout, Create, Update, Delete, Payment và thay đổi đăng ký."
      >
        <button
          type="button"
          onClick={handleClearLogs}
          disabled={loading || clearing}
          className="inline-flex items-center gap-2 rounded-xl border border-[#f4c7d4] bg-[#fff6f9] px-4 py-2.5 text-sm font-medium text-[#b4234a] transition hover:bg-[#ffe8ef] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {clearing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {hasFilters ? 'Xóa theo bộ lọc' : 'Xóa toàn bộ'}
        </button>
      </AdminPageHeader>

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

        {message ? <div className="mb-4 rounded-xl bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">{message}</div> : null}
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
      <ConfirmDeleteDialog />
    </div>
  );
};

export default AdminAuditLogsPage;
