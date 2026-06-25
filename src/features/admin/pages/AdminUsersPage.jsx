import { useCallback, useEffect, useState } from 'react';
import { KeyRound, LoaderCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import { disableAdminUser, enableAdminUser, getAdminUsers, resetAdminUserPassword } from '../api/adminApi';
import { formatDateTime, statusClass } from '../utils/adminHelpers';

const AdminUsersPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers({ search, role, page, pageSize: 10 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải người dùng.');
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (fn, successMessage) => {
    try {
      setActionLoading(true);
      setMessage('');
      const result = await fn();
      setMessage(successMessage || result.message || 'Thành công.');
      await load();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại.');
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader title="Quản lý người dùng" description="Quản lý tài khoản ADMIN, OWNER, TENANT — tìm kiếm, lọc, bật/tắt, reset mật khẩu." />

      <div className="dashboard-section-card">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="w-full rounded-xl border border-hairline-cloud py-2.5 pl-10 pr-4" placeholder="Tìm kiếm..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="rounded-xl border border-hairline-cloud px-4 py-2.5" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">Tất cả vai trò</option>
            <option value="Admin">ADMIN</option>
            <option value="Owner">OWNER</option>
            <option value="Tenant">TENANT</option>
          </select>
        </div>

        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
        {message ? <div className="mb-4 rounded-xl bg-[#f8fff0] px-4 py-3 text-sm font-semibold">{message}</div> : null}

        {loading ? (
          <div className="flex justify-center py-12"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-cloud text-left text-muted">
                  <th className="px-3 py-3">UserID</th>
                  <th className="px-3 py-3">Họ tên</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Vai trò</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Ngày tạo</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.userId} className="border-b border-hairline-cloud/70">
                    <td className="px-3 py-3">{user.userId}</td>
                    <td className="px-3 py-3 font-medium">{user.fullName}</td>
                    <td className="px-3 py-3">{user.email}</td>
                    <td className="px-3 py-3">{user.role}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(user.isActive ? 'Active' : 'Disabled')}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-3 py-3">{formatDateTime(user.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        {user.isActive ? (
                          <button type="button" className="dashboard-action-button" disabled={actionLoading || user.role === 'Admin'} onClick={() => runAction(() => disableAdminUser(user.userId), 'Đã vô hiệu hóa người dùng.')}><ToggleRight className="h-4 w-4" /></button>
                        ) : (
                          <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(() => enableAdminUser(user.userId), 'Đã kích hoạt người dùng.')}><ToggleLeft className="h-4 w-4" /></button>
                        )}
                        <button
                          type="button"
                          className="dashboard-action-button"
                          disabled={actionLoading}
                          onClick={async () => {
                            const result = await runAction(() => resetAdminUserPassword(user.userId));
                            if (result?.temporaryPassword) {
                              setMessage(`Mật khẩu tạm: ${result.temporaryPassword}`);
                            }
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
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
    </div>
  );
};

export default AdminUsersPage;
