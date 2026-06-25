import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, LoaderCircle, Plus, Search, ShieldCheck, Users } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import AccountListRow from '../components/AccountListRow';
import OwnerDetailPanel from '../components/OwnerDetailPanel';
import FilterSelect from '../../../components/common/FilterSelect';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import {
  activateAdminOwner,
  createAdminOwner,
  deleteAdminUser,
  disableAdminUser,
  enableAdminUser,
  getAdminOwnerById,
  getAdminPackages,
  getAdminUsers,
  lockAdminOwner,
  resetAdminUserPassword,
  suspendAdminOwner,
  unlockAdminOwner,
  updateAdminOwner,
} from '../api/adminApi';
import { normalizeAccount, normalizeOwner } from '../utils/adminHelpers';

const emptyForm = { fullName: '', email: '', phoneNumber: '', password: '', packageId: '' };

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'Owner', label: 'Chủ trọ' },
  { value: 'Admin', label: 'Quản trị' },
  { value: 'Tenant', label: 'Khách thuê' },
];

const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái gói' },
  { value: 'Active', label: 'Đang hoạt động' },
  { value: 'Expired', label: 'Hết hạn' },
  { value: 'Suspended', label: 'Tạm ngưng' },
  { value: 'None', label: 'Chưa đăng ký' },
];

const AdminUsersPage = () => {
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const accounts = useMemo(() => items.map(normalizeAccount), [items]);

  const pageStats = useMemo(() => ({
    owners: accounts.filter((a) => a.isOwner).length,
    active: accounts.filter((a) => a.isActive).length,
    suspended: accounts.filter((a) => a.isSuspended).length,
    totalRooms: accounts.reduce((sum, a) => sum + (a.roomCount || 0), 0),
  }), [accounts]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminUsers({
        search,
        role,
        subscriptionStatus: role === 'Owner' || role === '' ? subscriptionStatus : undefined,
        page,
        pageSize: 10,
      });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [search, role, subscriptionStatus, page]);

  useEffect(() => {
    load();
    getAdminPackages({ pageSize: 100 }).then((data) => setPackages(data.items || [])).catch(() => {});
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (account) => {
    setEditingId(account.userId);
    setForm({
      fullName: account.fullName,
      email: account.email || '',
      phoneNumber: account.phoneNumber || '',
      password: '',
      packageId: '',
    });
    setShowForm(true);
  };

  const openDetail = async (account) => {
    setDetail(normalizeOwner(account));
    setDetailLoading(true);
    try {
      const data = await getAdminOwnerById(account.userId);
      setDetail(normalizeOwner(data));
    } catch {
      // Giữ dữ liệu từ danh sách
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      if (editingId) {
        await updateAdminOwner(editingId, {
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          packageId: form.packageId ? Number(form.packageId) : undefined,
        });
      } else {
        await createAdminOwner({
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          packageId: form.packageId ? Number(form.packageId) : undefined,
        });
      }
      setShowForm(false);
      setMessage(editingId ? 'Đã cập nhật chủ trọ.' : 'Đã thêm chủ trọ mới.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu chủ trọ.');
    } finally {
      setActionLoading(false);
    }
  };

  const runAction = async (fn, successMessage) => {
    try {
      setActionLoading(true);
      setError('');
      const result = await fn();
      if (successMessage) setMessage(successMessage);
      await load();
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại.');
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const runOwnerAction = async (fn, id) => {
    try {
      setActionLoading(true);
      setError('');
      await fn(id);
      if (detail?.ownerId === id) {
        const data = await getAdminOwnerById(id);
        setDetail(normalizeOwner(data));
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (account) => {
    if (account.isActive) {
      await runAction(() => disableAdminUser(account.userId), 'Đã vô hiệu hóa người dùng.');
    } else {
      await runAction(() => enableAdminUser(account.userId), 'Đã kích hoạt người dùng.');
    }
  };

  const handleResetPassword = async (userId) => {
    const result = await runAction(() => resetAdminUserPassword(userId));
    if (result?.temporaryPassword) {
      setMessage(`Mật khẩu tạm: ${result.temporaryPassword}`);
    }
  };

  const handleDelete = async (account) => {
    const confirmed = await confirmDelete({
      title: 'Xóa người dùng',
      targetLabel: account.fullName,
      description: account.isOwner
        ? 'Chủ trọ sẽ bị xóa khỏi hệ thống cùng dữ liệu đăng ký liên quan.'
        : 'Tài khoản sẽ bị xóa vĩnh viễn khỏi hệ thống.',
      consequences: account.isOwner && account.roomCount > 0
        ? ['Không thể xóa nếu chủ trọ còn phòng đang quản lý.']
        : ['Hành động này không thể hoàn tác.'],
      confirmLabel: 'Xóa',
    });
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      await deleteAdminUser(account.userId);
      if (detail?.ownerId === account.userId) setDetail(null);
      setMessage(`Đã xóa ${account.fullName}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa người dùng.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản Admin, chủ trọ và khách thuê — tìm kiếm, lọc, chỉnh sửa và xóa."
      >
        <button type="button" className="dashboard-action-button dashboard-action-button--primary !w-auto !min-w-0" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm chủ trọ
        </button>
      </AdminPageHeader>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-hairline-cloud border-l-4 border-l-accent-violet bg-surface-light px-4 py-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Users className="h-3.5 w-3.5" /> Tổng người dùng
          </p>
          <p className="mt-1 text-2xl font-bold text-ink-deep">{totalCount}</p>
        </div>
        <div className="rounded-xl border border-hairline-cloud border-l-4 border-l-[#6366f1] bg-surface-light px-4 py-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <ShieldCheck className="h-3.5 w-3.5" /> Chủ trọ (trang)
          </p>
          <p className="mt-1 text-2xl font-bold text-ink-deep">{pageStats.owners}</p>
        </div>
        <div className="rounded-xl border border-hairline-cloud border-l-4 border-l-[#1f7a45] bg-surface-light px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Đang hoạt động (trang)</p>
          <p className="mt-1 text-2xl font-bold text-ink-deep">{pageStats.active}</p>
        </div>
        <div className="rounded-xl border border-hairline-cloud border-l-4 border-l-accent-lime bg-surface-light px-4 py-3 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
            <Building2 className="h-3.5 w-3.5" /> Phòng (trang)
          </p>
          <p className="mt-1 text-2xl font-bold text-ink-deep">{pageStats.totalRooms}</p>
        </div>
      </div>

      <div className="dashboard-section-card">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-xl border border-hairline-cloud bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-violet"
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <FilterSelect
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); setSubscriptionStatus(''); }}
            options={ROLE_OPTIONS}
            className="lg:w-48"
          />
          {(role === 'Owner' || role === '') ? (
            <FilterSelect
              value={subscriptionStatus}
              onChange={(e) => { setSubscriptionStatus(e.target.value); setPage(1); }}
              options={SUBSCRIPTION_STATUS_OPTIONS}
              className="lg:w-52"
            />
          ) : null}
        </div>

        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
        {message ? <div className="mb-4 rounded-xl bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-[#1f7a45]">{message}</div> : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted" />
            <p className="font-semibold text-ink-deep">Không tìm thấy người dùng</p>
            <p className="mt-1 text-sm text-muted">Thử thay đổi bộ lọc hoặc thêm chủ trọ mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-hairline-cloud">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-cloud bg-surface-press/50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Gói</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tòa / Phòng</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Hết hạn</th>
                  <th className="px-4 py-3 min-w-[10rem]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <AccountListRow
                    key={account.userId}
                    account={account}
                    actionLoading={actionLoading}
                    onView={openDetail}
                    onEdit={openEdit}
                    onSuspend={(id) => runOwnerAction(suspendAdminOwner, id)}
                    onActivate={(id) => runOwnerAction(activateAdminOwner, id)}
                    onLock={(id) => runOwnerAction(lockAdminOwner, id)}
                    onUnlock={(id) => runOwnerAction(unlockAdminOwner, id)}
                    onToggleActive={handleToggleActive}
                    onResetPassword={handleResetPassword}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-ink-deep">{editingId ? 'Cập nhật chủ trọ' : 'Thêm chủ trọ'}</h2>
            <p className="mt-1 text-sm text-muted">
              {editingId ? 'Chỉnh sửa thông tin tài khoản chủ trọ.' : 'Tạo tài khoản chủ trọ mới trên hệ thống.'}
            </p>
            <div className="mt-4 space-y-3">
              <input required className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input required type="email" className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet" placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              {!editingId ? (
                <input required type="password" className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              ) : null}
              <select className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet" value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })}>
                <option value="">Chọn gói (tuỳ chọn)</option>
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>{pkg.packageName}</option>
                ))}
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="dashboard-action-button !w-auto !min-w-0" onClick={() => setShowForm(false)}>Huỷ</button>
              <button type="submit" disabled={actionLoading} className="dashboard-action-button dashboard-action-button--primary !w-auto !min-w-0">
                {actionLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detail ? (
        <OwnerDetailPanel
          owner={detail}
          loading={detailLoading}
          actionLoading={actionLoading}
          onClose={() => setDetail(null)}
          onEdit={(owner) => { setDetail(null); openEdit(normalizeAccount(owner)); }}
          onSuspend={(id) => runOwnerAction(suspendAdminOwner, id)}
          onActivate={(id) => runOwnerAction(activateAdminOwner, id)}
          onLock={(id) => runOwnerAction(lockAdminOwner, id)}
          onUnlock={(id) => runOwnerAction(unlockAdminOwner, id)}
          onDelete={(owner) => handleDelete(normalizeAccount(owner))}
        />
      ) : null}

      <ConfirmDeleteDialog />
    </div>
  );
};

export default AdminUsersPage;
