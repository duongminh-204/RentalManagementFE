import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Building, PlusLg, PencilSquare, Trash, ArrowRepeat, GeoAlt, XLg } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';
import * as buildingsApi from '../api/buildingsApi';
import BuildingMapRoutes from '../components/BuildingMapRoutes';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import { deleteConfirmPresets } from '../../../utils/deleteConfirmPresets';
import FeatureLockedNotice from '../../../components/common/FeatureLockedNotice';
import {
  isForbiddenError,
  resolveForbiddenNotice,
  resolveFeatureRouteNotice,
} from '../../../utils/apiError';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN');
};

const BuildingPage = () => {
  const navigate = useNavigate();
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [mapRouteBuilding, setMapRouteBuilding] = useState(null);
  const [mapLayoutReady, setMapLayoutReady] = useState(false);
  const [accessNotice, setAccessNotice] = useState(() => resolveFeatureRouteNotice('/buildings'));

  useEffect(() => {
    if (!mapRouteBuilding) {
      setMapLayoutReady(false);
      return undefined;
    }

    const fallbackTimer = window.setTimeout(() => {
      setMapLayoutReady(true);
    }, 450);

    return () => window.clearTimeout(fallbackTimer);
  }, [mapRouteBuilding]);

  const loadBuildings = useCallback(async () => {
    const routeNotice = resolveFeatureRouteNotice('/buildings');
    if (routeNotice) {
      setAccessNotice(routeNotice);
      setBuildings([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setAccessNotice(null);
    try {
      const data = await buildingsApi.getAllBuildings();
      setBuildings(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isForbiddenError(err)) {
        setAccessNotice(resolveForbiddenNotice(err, { path: '/buildings' }));
        setError(null);
      } else {
        setError(err.response?.data?.message || 'Không thể tải danh sách tòa nhà');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBuildings();
  }, [loadBuildings]);

  const handleDelete = async (building) => {
    const confirmed = await confirmDelete(deleteConfirmPresets.building(building));
    if (!confirmed) return;
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
        {accessNotice ? (
          <FeatureLockedNotice {...accessNotice} fullPage />
        ) : (
        <>
        <section
          className="bg-white p-8"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building size={24} />
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
              <PlusLg size={18} />
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
                <ArrowRepeat className="animate-spin text-accent-violet" size={24} />
                <span className="text-sm">Đang tải danh sách tòa nhà…</span>
              </div>
            ) : buildings.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Building size={36} className="text-gray-300" />
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
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span>{building.address || '—'}</span>
                          {building.latitude && building.longitude && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${building.latitude},${building.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-primary hover:text-indigo-600 transition-colors"
                              title="Xem trên Google Maps"
                            >
                              <GeoAlt size={14} className="shrink-0" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-gray-500">
                        <span className="line-clamp-1">{building.description || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(building.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setMapRouteBuilding(building)}
                            className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-indigo-600 transition hover:bg-surface-press hover:text-indigo-500"
                            title="Bản đồ & Tuyến đường"
                          >
                            <GeoAlt size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/buildings/${building.buildingId}/edit`)}
                            className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-ink-deep transition hover:bg-surface-press"
                            title="Sửa"
                          >
                            <PencilSquare size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(building)}
                            disabled={deletingId === building.buildingId}
                            className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-accent-pink transition hover:bg-surface-press disabled:opacity-50"
                            title="Xóa"
                          >
                            {deletingId === building.buildingId ? (
                              <ArrowRepeat size={16} className="animate-spin" />
                            ) : (
                              <Trash size={16} />
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

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {mapRouteBuilding && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
                role="dialog"
                aria-modal="true"
              >
                <button
                  type="button"
                  className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-sm transition-opacity"
                  onClick={() => setMapRouteBuilding(null)}
                  aria-label="Đóng"
                />

                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 16 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 16 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="relative z-10 my-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-2xl"
                  style={{ maxHeight: 'min(90vh, 860px)' }}
                  onAnimationComplete={() => setMapLayoutReady(true)}
                >
                  {/* Modal Header */}
                  <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                        Bản đồ & Tuyến đường
                      </p>
                      <h3 className="mt-0.5 text-lg font-bold text-gray-900">
                        {mapRouteBuilding.buildingName}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMapRouteBuilding(null)}
                      className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600"
                    >
                      <XLg size={20} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="min-h-0 shrink bg-gray-50 px-4 py-4 sm:px-6 sm:py-5">
                    <BuildingMapRoutes
                      embedded
                      layoutReady={mapLayoutReady}
                      buildingName={mapRouteBuilding.buildingName}
                      address={mapRouteBuilding.address}
                      latitude={mapRouteBuilding.latitude}
                      longitude={mapRouteBuilding.longitude}
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white px-6 py-3">
                    <button
                      type="button"
                      onClick={() => setMapRouteBuilding(null)}
                      className="rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      Đóng
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
        </>
        )}
      </div>
      <ConfirmDeleteDialog />
    </div>
  );
};

export default BuildingPage;
