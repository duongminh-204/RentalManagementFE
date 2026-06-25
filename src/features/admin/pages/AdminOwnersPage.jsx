import { useCallback, useEffect, useState } from 'react';
import { Eye, LoaderCircle, Lock, LockOpen, Pause, Play, Plus, Search } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import {
  activateAdminOwner,
  createAdminOwner,
  getAdminOwnerById,
  getAdminOwners,
  getAdminPackages,
  lockAdminOwner,
  suspendAdminOwner,
  unlockAdminOwner,
  updateAdminOwner,
} from '../api/adminApi';
import { formatDate, statusClass } from '../utils/adminHelpers';

const emptyForm = { fullName: '', email: '', phoneNumber: '', password: '', packageId: '' };

const AdminOwnersPage = () => {
  const [items, setItems] = useState([]);
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminOwners({ search, status, page, pageSize: 10 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách chủ trọ.');
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
    getAdminPackages({ pageSize: 100 }).then((data) => setPackages(data.items || [])).catch(() => {});
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = async (owner) => {
    setEditingId(owner.ownerId);
    setForm({
      fullName: owner.fullName,
      email: owner.email || '',
      phoneNumber: owner.phone || '',
      password: '',
      packageId: '',
    });
    setShowForm(true);
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
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu chủ trọ.');
    } finally {
      setActionLoading(false);
    }
  };

  const runAction = async (fn, id) => {
    try {
      setActionLoading(true);
      await fn(id);
      if (detail?.ownerId === id) setDetail(await getAdminOwnerById(id));
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader title="Quản lý chủ trọ" description="CRUD, tìm kiếm, lọc, tạm ngưng và khóa tài khoản chủ trọ.">
        <button type="button" className="dashboard-action-button dashboard-action-button--primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm chủ trọ
        </button>
      </AdminPageHeader>

      <div className="dashboard-section-card">
        <div className="mb-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-xl border border-hairline-cloud py-2.5 pl-10 pr-4"
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="rounded-xl border border-hairline-cloud px-4 py-2.5"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Suspended">Suspended</option>
            <option value="None">None</option>
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
                  <th className="px-3 py-3">Họ tên</th>
                  <th className="px-3 py-3">Email</th>
                  <th className="px-3 py-3">Gói</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Hết hạn</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((owner) => (
                  <tr key={owner.ownerId} className="border-b border-hairline-cloud/70">
                    <td className="px-3 py-3">{owner.ownerId}</td>
                    <td className="px-3 py-3 font-medium">{owner.fullName}</td>
                    <td className="px-3 py-3">{owner.email}</td>
                    <td className="px-3 py-3">{owner.package || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(owner.subscriptionStatus)}`}>
                        {owner.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-3 py-3">{formatDate(owner.expiredDate)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <button type="button" className="dashboard-action-button" onClick={() => getAdminOwnerById(owner.ownerId).then(setDetail)} title="Chi tiết"><Eye className="h-4 w-4" /></button>
                        <button type="button" className="dashboard-action-button" onClick={() => openEdit(owner)}>Sửa</button>
                        {owner.isSuspended ? (
                          <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(activateAdminOwner, owner.ownerId)}><Play className="h-4 w-4" /></button>
                        ) : (
                          <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(suspendAdminOwner, owner.ownerId)}><Pause className="h-4 w-4" /></button>
                        )}
                        {owner.isActive ? (
                          <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(lockAdminOwner, owner.ownerId)}><Lock className="h-4 w-4" /></button>
                        ) : (
                          <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => runAction(unlockAdminOwner, owner.ownerId)}><LockOpen className="h-4 w-4" /></button>
                        )}
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

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">{editingId ? 'Cập nhật chủ trọ' : 'Thêm chủ trọ'}</h2>
            <div className="mt-4 space-y-3">
              <input required className="w-full rounded-xl border px-4 py-2.5" placeholder="Họ tên" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input required type="email" className="w-full rounded-xl border px-4 py-2.5" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="w-full rounded-xl border px-4 py-2.5" placeholder="Số điện thoại" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              {!editingId ? (
                <input required type="password" className="w-full rounded-xl border px-4 py-2.5" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              ) : null}
              <select className="w-full rounded-xl border px-4 py-2.5" value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })}>
                <option value="">Chọn gói (tuỳ chọn)</option>
                {packages.map((pkg) => (
                  <option key={pkg.packageId} value={pkg.packageId}>{pkg.packageName}</option>
                ))}
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="dashboard-action-button" onClick={() => setShowForm(false)}>Huỷ</button>
              <button type="submit" disabled={actionLoading} className="dashboard-action-button dashboard-action-button--primary">
                {actionLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Chi tiết chủ trọ #{detail.ownerId}</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Họ tên</dt><dd>{detail.fullName}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{detail.email}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">SĐT</dt><dd>{detail.phone || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Gói</dt><dd>{detail.package || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Trạng thái</dt><dd>{detail.subscriptionStatus}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Số phòng</dt><dd>{detail.roomCount}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Số tòa nhà</dt><dd>{detail.buildingCount}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Ngày tạo</dt><dd>{formatDate(detail.createdDate)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Hết hạn</dt><dd>{formatDate(detail.expiredDate)}</dd></div>
            </dl>
            <div className="mt-5 flex justify-end">
              <button type="button" className="dashboard-action-button" onClick={() => setDetail(null)}>Đóng</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminOwnersPage;
