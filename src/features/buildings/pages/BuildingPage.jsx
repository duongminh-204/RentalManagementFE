import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import * as buildingsApi from '../api/buildingsApi';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN');
};

const BuildingPage = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await buildingsApi.getAllBuildings();
      setBuildings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tòa nhà');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);

  const handleDelete = async (building) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tòa nhà "${building.buildingName}"?`)) return;
    setDeletingId(building.buildingId);
    setError(null);
    try {
      await buildingsApi.deleteBuilding(building.buildingId);
      await loadBuildings();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa tòa nhà');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content page-content--wide">
        <section
          className="bg-white p-8"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 size={24} />
              </span>
              <div>
                <h1 className="text-[28px] font-bold leading-tight text-ink-deep">Quản lý tòa nhà</h1>
                <p className="mt-1 text-gray-500">Tạo, chỉnh sửa và xóa các tòa nhà trong hệ thống.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buildings/create')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Thêm tòa nhà
            </button>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-accent-pink/40 bg-accent-pink/10 px-3 py-2 text-sm text-accent-pink">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-hairline-cloud">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-muted">
                <Loader2 className="animate-spin text-accent-violet" size={24} />
                <span className="text-sm">Đang tải danh sách tòa nhà…</span>
              </div>
            ) : buildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Building2 size={36} className="text-gray-300" />
                <p className="text-sm font-medium text-gray-600">Chưa có tòa nhà nào</p>
                <p className="text-sm text-gray-400">Bấm &quot;Thêm tòa nhà&quot; để bắt đầu.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-press/60 text-xs font-semibold uppercase tracking-wide text-accent-violet-mid">
                  <tr>
                    <th className="px-4 py-3">Tên tòa nhà</th>
                    <th className="px-4 py-3">Địa chỉ</th>
                    <th className="px-4 py-3">Mô tả</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-cloud">
                  {buildings.map((building) => (
                    <tr key={building.buildingId} className="transition hover:bg-surface-press/40">
                      <td className="px-4 py-3 font-semibold text-ink-deep">{building.buildingName}</td>
                      <td className="px-4 py-3 text-gray-600">{building.address || '—'}</td>
                      <td className="max-w-xs px-4 py-3 text-gray-500">
                        <span className="line-clamp-1">{building.description || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(building.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/buildings/${building.buildingId}/edit`)}
                            className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-ink-deep transition hover:bg-surface-press"
                            title="Sửa"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(building)}
                            disabled={deletingId === building.buildingId}
                            className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-accent-pink transition hover:bg-surface-press disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === building.buildingId ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BuildingPage;
