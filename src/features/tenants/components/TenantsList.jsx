import { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Search, Loader2, Users, Building2 } from 'lucide-react';
import TenantListItem from './TenantListItem';
import TenantManagementPanel from './TenantManagementPanel';
import FilterSelect from '../../../components/common/FilterSelect';
import FeatureLockedNotice from '../../../components/common/FeatureLockedNotice';
import { useTenants } from '../hooks/useTenants';
import * as buildingsApi from '../../buildings/api/buildingsApi';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import { deleteConfirmPresets } from '../../../utils/deleteConfirmPresets';
import { isForbiddenError, resolveForbiddenNotice } from '../../../utils/apiError';

const TENANT_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Đang thuê' },
  { value: 'inactive', label: 'Chưa thuê' },
  { value: 'moved_out', label: 'Đã trả phòng' },
];

const TenantsList = () => {
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const {
    tenants,
    loading,
    error,
    accessNotice,
    fetchTenants,
    getTenant,
    addTenant,
    editTenant,
    removeTenant,
    uploadIDCard,
    uploadAvatar,
    removeIdCardImage,
  } = useTenants();

  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;
    buildingsApi
      .getAllBuildings()
      .then((data) => {
        if (active) setBuildings(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);
  const [panelMode, setPanelMode] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const countTenantsByBuilding = useCallback(
    (buildingId) =>
      tenants.filter((t) => String(t.buildingId) === String(buildingId)).length,
    [tenants]
  );

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        t.fullName?.toLowerCase().includes(q) ||
        t.phoneNumber?.includes(searchTerm) ||
        t.cccd?.includes(searchTerm);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchBuilding =
        selectedBuildingId === 'all' ||
        String(t.buildingId) === String(selectedBuildingId);
      return matchSearch && matchStatus && matchBuilding;
    });
  }, [tenants, searchTerm, statusFilter, selectedBuildingId]);

  const stats = useMemo(
    () => ({
      total: tenants.length,
      active: tenants.filter((t) => t.status === 'active').length,
      inactive: tenants.filter((t) => t.status === 'inactive').length,
      movedOut: tenants.filter((t) => t.status === 'moved_out').length,
    }),
    [tenants]
  );

  // const statCards = [
  //   { label: 'Tổng khách', value: stats.total, accent: 'border-l-accent-violet' },
  //   { label: 'Đang thuê', value: stats.active, accent: 'border-l-accent-lime' },
  //   { label: 'Chưa thuê', value: stats.inactive, accent: 'border-l-hairline-cloud' },
  //   { label: 'Đã trả phòng', value: stats.movedOut, accent: 'border-l-accent-pink' },
  // ];

  const loadTenantDetail = useCallback(
    async (tenantId, fallback) => {
      setPanelLoading(true);
      setSaveError(null);
      try {
        const detailed = await getTenant(tenantId);
        setSelectedTenant(detailed || fallback);
      } catch {
        setSelectedTenant(fallback);
      } finally {
        setPanelLoading(false);
      }
    },
    [getTenant]
  );

  const handleSelectTenant = async (tenant) => {
    setPanelMode('edit');
    setSelectedTenant(tenant);
    await loadTenantDetail(tenant.id, tenant);
  };

  const handleOpenCreate = () => {
    setPanelMode('create');
    setSelectedTenant(null);
    setSaveError(null);
  };

  const handleClosePanel = () => {
    setPanelMode(null);
    setSelectedTenant(null);
    setSaveError(null);
  };

  const handleSave = async (formData, idCardFile, avatarFile) => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      if (panelMode === 'create') {
        const created = await addTenant(formData);
        if (idCardFile && created?.id) {
          await uploadIDCard(created.id, idCardFile);
        }
        if (avatarFile && created?.id) {
          await uploadAvatar(created.id, avatarFile);
        }
        setPanelMode('edit');
        await loadTenantDetail(created.id, created);
      } else {
        const updated = await editTenant(selectedTenant.id, formData);
        if (idCardFile) {
          await uploadIDCard(selectedTenant.id, idCardFile);
        }
        if (avatarFile) {
          await uploadAvatar(selectedTenant.id, avatarFile);
        }
        await loadTenantDetail(selectedTenant.id, updated);
      }
      await fetchTenants({ status: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm || undefined });
    } catch (err) {
      if (isForbiddenError(err)) {
        setSaveError(resolveForbiddenNotice(err, { path: '/tenants' }).message);
      } else {
        setSaveError(err.response?.data?.message || 'Lỗi khi lưu khách thuê');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (tenantId) => {
    const tenant = tenants.find((item) => String(item.id) === String(tenantId)) ?? selectedTenant;
    const confirmed = await confirmDelete(deleteConfirmPresets.tenant(tenant));
    if (!confirmed) return;
    try {
      await removeTenant(tenantId);
      if (String(selectedTenant?.id) === String(tenantId)) handleClosePanel();
      await fetchTenants();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Lỗi khi xóa khách thuê');
    }
  };

  const handleUploadIdCard = async (tenantId, file) => {
    await uploadIDCard(tenantId, file);
    await loadTenantDetail(tenantId, selectedTenant);
    await fetchTenants();
  };

  const handleUploadAvatar = async (tenantId, file) => {
    await uploadAvatar(tenantId, file);
    await loadTenantDetail(tenantId, selectedTenant);
    await fetchTenants();
  };

  const handleDeleteIdCard = async (tenantId) => {
    const tenant = tenants.find((item) => String(item.id) === String(tenantId)) ?? selectedTenant;
    const confirmed = await confirmDelete(deleteConfirmPresets.tenantIdCard(tenant));
    if (!confirmed) return;
    try {
      setSaveError(null);
      await removeIdCardImage(tenantId);
      await loadTenantDetail(tenantId, selectedTenant);
      await fetchTenants();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Lỗi khi xóa ảnh CCCD');
    }
  };

  if (loading && !accessNotice && tenants.length === 0) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-light">
        <Loader2 className="animate-spin text-accent-violet" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content page-content--wide">
        {accessNotice ? (
          <FeatureLockedNotice {...accessNotice} fullPage />
        ) : (
        <>
        <div className="mb-6 rounded-xl border border-hairline-cloud bg-surface-light p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-deep">
            <Building2 size={18} className="text-accent-violet-mid" />
            Khách thuê theo tòa nhà
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedBuildingId('all')}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                selectedBuildingId === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'border border-hairline-cloud bg-surface-light text-ink-deep hover:bg-surface-press'
              }`}
            >
              Tất cả tòa nhà
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                  selectedBuildingId === 'all' ? 'bg-white/25 text-on-primary' : 'bg-surface-press text-gray-500'
                }`}
              >
                {tenants.length}
              </span>
            </button>
            {buildings.map((building) => {
              const active = String(selectedBuildingId) === String(building.buildingId);
              const count = countTenantsByBuilding(building.buildingId);
              return (
                <button
                  key={building.buildingId}
                  type="button"
                  onClick={() => setSelectedBuildingId(building.buildingId)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-on-primary'
                      : 'border border-hairline-cloud bg-surface-light text-ink-deep hover:bg-surface-press'
                  }`}
                >
                  {building.buildingName}
                  <span
                    className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                      active ? 'bg-white/25 text-on-primary' : 'bg-surface-press text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border border-hairline-cloud border-l-4 bg-surface-light px-4 py-3 shadow-sm ${card.accent}`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink-deep">{card.value}</p>
            </div>
          ))}
        </div> */}

        <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
          <div className="flex min-h-[560px] flex-col rounded-2xl border border-hairline-cloud bg-surface-light shadow-sm">
            <div className="border-b border-hairline-cloud bg-ink-deep px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-on-primary">Danh sách khách</p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline-violet bg-ink-deep text-accent-lime transition hover:border-accent-lime hover:shadow-[0_0_12px_rgba(194,239,78,0.35)]"
                  title="Thêm khách thuê"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 text-on-dark-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Tìm tên, SĐT, CCCD…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-hairline-violet bg-on-dark-faint py-2 pl-9 pr-3 text-sm text-on-primary placeholder:text-on-dark-muted focus:outline-none focus:ring-1 focus:ring-accent-lime"
                  />
                </div>
                <FilterSelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={TENANT_STATUS_OPTIONS}
                  className="w-[148px] shrink-0"
                  title="Lọc trạng thái"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {filteredTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="mb-3 text-accent-violet-mid" size={36} />
                  <p className="text-sm text-muted">Không có khách thuê</p>
                  <button type="button" onClick={handleOpenCreate} className="btn-primary mt-4 text-sm">
                    <Plus size={16} /> Thêm khách
                  </button>
                </div>
              ) : (
                filteredTenants.map((tenant) => (
                  <TenantListItem
                    key={tenant.id}
                    tenant={tenant}
                    selected={String(selectedTenant?.id) === String(tenant.id)}
                    onClick={handleSelectTenant}
                  />
                ))
              )}
            </div>
          </div>

          <TenantManagementPanel
            tenant={panelMode === 'create' ? null : selectedTenant}
            mode={panelMode === 'create' ? 'create' : 'edit'}
            loading={panelLoading}
            onClose={handleClosePanel}
            onSave={panelMode ? handleSave : undefined}
            onDelete={handleDelete}
            onUploadIdCard={handleUploadIdCard}
            onUploadAvatar={handleUploadAvatar}
            onDeleteIdCard={handleDeleteIdCard}
            onRefresh={() => selectedTenant && loadTenantDetail(selectedTenant.id, selectedTenant)}
            saveLoading={saveLoading}
            saveError={saveError}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm text-ink-deep">
            {error}
          </div>
        ) : null}
        </>
        )}
      </div>
      <ConfirmDeleteDialog />
    </div>
  );
};

export default TenantsList;
