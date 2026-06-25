import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import {
  createAdminPackage,
  disableAdminPackage,
  enableAdminPackage,
  getAdminPackages,
  updateAdminPackage,
} from '../api/adminApi';
import { formatVnd, statusClass } from '../utils/adminHelpers';

const emptyForm = { packageName: '', price: '', maxRooms: '', description: '' };

const AdminPackagesPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminPackages({ page, pageSize: 10 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải gói dịch vụ.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (pkg) => {
    setEditingId(pkg.packageId);
    setForm({
      packageName: pkg.packageName,
      price: String(pkg.price),
      maxRooms: String(pkg.maxRooms),
      description: pkg.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        packageName: form.packageName,
        price: Number(form.price),
        maxRooms: Number(form.maxRooms),
        description: form.description,
      };
      if (editingId) await updateAdminPackage(editingId, payload);
      else await createAdminPackage(payload);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu gói.');
    } finally {
      setActionLoading(false);
    }
  };

  const togglePackage = async (pkg) => {
    try {
      setActionLoading(true);
      if (pkg.isEnabled) await disableAdminPackage(pkg.packageId);
      else await enableAdminPackage(pkg.packageId);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái gói.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader title="Quản lý gói dịch vụ" description="Tạo, cập nhật, bật/tắt các gói SaaS.">
        <button type="button" className="dashboard-action-button dashboard-action-button--primary" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Tạo gói
        </button>
      </AdminPageHeader>

      <div className="dashboard-section-card">
        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
        {loading ? (
          <div className="flex justify-center py-12"><LoaderCircle className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-cloud text-left text-muted">
                  <th className="px-3 py-3">ID</th>
                  <th className="px-3 py-3">Tên gói</th>
                  <th className="px-3 py-3">Giá</th>
                  <th className="px-3 py-3">Max phòng</th>
                  <th className="px-3 py-3">Mô tả</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((pkg) => (
                  <tr key={pkg.packageId} className="border-b border-hairline-cloud/70">
                    <td className="px-3 py-3">{pkg.packageId}</td>
                    <td className="px-3 py-3 font-medium">{pkg.packageName}</td>
                    <td className="px-3 py-3">{formatVnd(pkg.price)}</td>
                    <td className="px-3 py-3">{pkg.maxRooms}</td>
                    <td className="max-w-xs truncate px-3 py-3">{pkg.description || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(pkg.isEnabled ? 'Active' : 'Disabled')}`}>
                        {pkg.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button type="button" className="dashboard-action-button" onClick={() => openEdit(pkg)}>Sửa</button>
                        <button type="button" className="dashboard-action-button" disabled={actionLoading} onClick={() => togglePackage(pkg)}>
                          {pkg.isEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
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

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">{editingId ? 'Cập nhật gói' : 'Tạo gói mới'}</h2>
            <div className="mt-4 space-y-3">
              <input required className="w-full rounded-xl border px-4 py-2.5" placeholder="Tên gói" value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} />
              <input required type="number" min="0" className="w-full rounded-xl border px-4 py-2.5" placeholder="Giá (VND)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input required type="number" min="1" className="w-full rounded-xl border px-4 py-2.5" placeholder="Số phòng tối đa" value={form.maxRooms} onChange={(e) => setForm({ ...form, maxRooms: e.target.value })} />
              <textarea className="w-full rounded-xl border px-4 py-2.5" placeholder="Mô tả" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="dashboard-action-button" onClick={() => setShowForm(false)}>Huỷ</button>
              <button type="submit" disabled={actionLoading} className="dashboard-action-button dashboard-action-button--primary">Lưu</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPackagesPage;
