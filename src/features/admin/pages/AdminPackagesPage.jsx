import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  LoaderCircle,
  Package,
  Pencil,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import AdminPagination from '../components/AdminPagination';
import {
  deleteAdminPackage,
  disableAdminPackage,
  enableAdminPackage,
  getAdminPackages,
  updateAdminPackage,
} from '../api/adminApi';

const emptyForm = {
  packageName: '',
  price: '',
  maxRooms: '',
  description: '',
  roomRange: '',
  targetAudience: '',
  isRecommended: false,
  features: '',
};

const formatPriceShort = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ/tháng';

const AdminPackagesPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminPackages({ page, pageSize: 12 });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải gói dịch vụ.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (pkg) => {
    setEditingId(pkg.packageId);
    setForm({
      packageName: pkg.packageName,
      price: String(pkg.price),
      maxRooms: String(pkg.maxRooms),
      description: pkg.description || '',
      roomRange: pkg.roomRange || '',
      targetAudience: pkg.targetAudience || '',
      isRecommended: Boolean(pkg.isRecommended),
      features: (pkg.features || []).join('\n'),
    });
    setShowForm(true);
  };

  const buildPayload = () => ({
    packageName: form.packageName,
    price: Number(form.price),
    maxRooms: Number(form.maxRooms),
    description: form.description,
    roomRange: form.roomRange,
    targetAudience: form.targetAudience,
    isRecommended: form.isRecommended,
    features: form.features
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      const payload = buildPayload();
      if (editingId) {
        await updateAdminPackage(editingId, payload);
        setMessage('Đã cập nhật gói dịch vụ.');
      }
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
      setError('');
      if (pkg.isEnabled) await disableAdminPackage(pkg.packageId);
      else await enableAdminPackage(pkg.packageId);
      setMessage(pkg.isEnabled ? `Đã tắt gói ${pkg.packageName}.` : `Đã bật gói ${pkg.packageName}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật trạng thái gói.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (pkg) => {
    const confirmed = window.confirm(`Xóa gói "${pkg.packageName}"? Hành động này không thể hoàn tác.`);
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');
      await deleteAdminPackage(pkg.packageId);
      setMessage(`Đã xóa gói ${pkg.packageName}.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa gói.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-content page-content--wide">
      <div className="dashboard-section-card">
        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
        {message ? <div className="mb-4 rounded-xl bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-[#1f7a45]">{message}</div> : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="mb-3 h-10 w-10 text-muted" />
            <p className="font-semibold text-ink-deep">Chưa có gói dịch vụ</p>
            <p className="mt-1 text-sm text-muted">Chưa có gói dịch vụ trong hệ thống.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((pkg) => {
              const isRecommended = pkg.isRecommended;
              return (
                <article
                  key={pkg.packageId}
                  className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
                    isRecommended ? 'border-accent-violet/40 ring-2 ring-accent-violet/15' : 'border-hairline-cloud'
                  } ${!pkg.isEnabled ? 'opacity-75' : ''}`}
                >
                  {isRecommended ? (
                    <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-accent-violet px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      Khuyên dùng
                    </span>
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-muted">#{pkg.packageId}</p>
                      <h3 className="font-display text-xl font-bold text-ink-deep">{pkg.packageName}</h3>
                      {pkg.roomRange ? (
                        <p className="mt-1 text-sm font-semibold text-accent-violet">{pkg.roomRange}</p>
                      ) : null}
                      {pkg.targetAudience ? (
                        <p className="mt-0.5 text-sm text-muted">{pkg.targetAudience}</p>
                      ) : null}
                    </div>
                  </div>

                  <p className="mt-4 font-display text-2xl font-bold text-ink-deep">{formatPriceShort(pkg.price)}</p>
                  {pkg.description ? <p className="mt-2 text-sm leading-6 text-muted">{pkg.description}</p> : null}

                  <div
                    className={`package-enable-toggle mt-4 ${pkg.isEnabled ? 'package-enable-toggle--on' : 'package-enable-toggle--off'}`}
                  >
                    <div className="package-enable-toggle__info">
                      <p className="package-enable-toggle__label">Hiển thị gói dịch vụ</p>
                      <p className="package-enable-toggle__hint">
                        {pkg.isEnabled
                          ? 'Đang bật — hiển thị trên trang chủ và trang chọn gói'
                          : 'Đã tắt — chủ trọ không thể chọn gói này'}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={pkg.isEnabled}
                      aria-label={pkg.isEnabled ? 'Tắt gói dịch vụ' : 'Bật gói dịch vụ'}
                      className="package-enable-toggle__switch"
                      disabled={actionLoading}
                      onClick={() => togglePackage(pkg)}
                    >
                      <span className="package-enable-toggle__track">
                        <span className="package-enable-toggle__thumb" />
                      </span>
                      <span className="package-enable-toggle__state">
                        {pkg.isEnabled ? 'Bật' : 'Tắt'}
                      </span>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-press px-2.5 py-1 font-medium text-ink-deep">
                      Tối đa {pkg.maxRooms} phòng
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-press px-2.5 py-1 font-medium text-ink-deep">
                      <Users className="h-3.5 w-3.5" />
                      {pkg.subscriberCount || 0} người dùng
                    </span>
                  </div>

                  {(pkg.features || []).length > 0 ? (
                    <ul className="mt-4 flex-1 space-y-2 border-t border-hairline-cloud/70 pt-4">
                      {(pkg.features || []).slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-ink-deep">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {(pkg.features || []).length > 4 ? (
                        <li className="text-xs text-muted">+{(pkg.features || []).length - 4} tính năng khác</li>
                      ) : null}
                    </ul>
                  ) : (
                    <div className="mt-4 flex-1 border-t border-hairline-cloud/70 pt-4 text-sm text-muted">
                      Chưa có danh sách tính năng.
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2 border-t border-hairline-cloud/70 pt-4">
                    <button
                      type="button"
                      className="dashboard-action-button !w-auto !min-w-0"
                      onClick={() => openEdit(pkg)}
                    >
                      <Pencil className="h-4 w-4" /> Sửa
                    </button>
                    <button
                      type="button"
                      className="dashboard-action-button !w-auto !min-w-0 text-[#b4234a]"
                      disabled={actionLoading}
                      onClick={() => handleDelete(pkg)}
                      title="Xóa gói"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-hairline-cloud bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-xl font-bold text-ink-deep">Cập nhật gói</h2>
            <div className="mt-4 space-y-3">
              <input
                required
                className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                placeholder="Tên gói"
                value={form.packageName}
                onChange={(e) => setForm({ ...form, packageName: e.target.value })}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                  placeholder="Giá (VND)"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
                <input
                  required
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                  placeholder="Số phòng tối đa"
                  value={form.maxRooms}
                  onChange={(e) => setForm({ ...form, maxRooms: e.target.value })}
                />
              </div>
              <input
                className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                placeholder="Quy mô phòng (vd: 21-50 phòng)"
                value={form.roomRange}
                onChange={(e) => setForm({ ...form, roomRange: e.target.value })}
              />
              <input
                className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                placeholder="Đối tượng (vd: Chủ trọ đang mở rộng)"
                value={form.targetAudience}
                onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
              />
              <textarea
                className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                placeholder="Mô tả ngắn"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <textarea
                className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
                placeholder="Tính năng (mỗi dòng một mục)"
                rows={5}
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
              />
              <label className="flex items-center gap-2 rounded-xl border border-hairline-cloud bg-surface-press/40 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isRecommended}
                  onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
                />
                Đánh dấu là gói khuyên dùng
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="dashboard-action-button !w-auto !min-w-0" onClick={() => setShowForm(false)}>
                Huỷ
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="dashboard-action-button dashboard-action-button--primary !w-auto !min-w-0"
              >
                {actionLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default AdminPackagesPage;
