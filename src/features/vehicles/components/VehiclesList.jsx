import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  Loader2,
  Car,
  AlertTriangle,
  Banknote,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import * as buildingsApi from '../../buildings/api/buildingsApi';
import VehicleListItem from './VehicleListItem';
import VehicleManagementPanel from './VehicleManagementPanel';
import FilterSelect from '../../../components/common/FilterSelect';
import { useVehicles } from '../hooks/useVehicles';

const VEHICLE_STATUS_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'active', label: 'Đang gửi' },
  { value: 'inactive', label: 'Ngừng gửi' },
  { value: 'unknown', label: 'Xe lạ' },
];

const VEHICLE_TYPE_OPTIONS = [
  { value: 'all', label: 'Mọi loại xe' },
  { value: 'motorcycle', label: 'Xe máy' },
  { value: 'scooter', label: 'Xe tay ga' },
  { value: 'bicycle', label: 'Xe đạp' },
  { value: 'car', label: 'Ô tô' },
  { value: 'other', label: 'Khác' },
];
import { useTenants } from '../../tenants';
import { useRooms } from '../../rooms';
import { formatCurrency } from '../utils/vehicleHelpers';

const VehiclesList = () => {
  const { tenants } = useTenants();
  const { rooms } = useRooms();
  const {
    vehicles,
    unknownVehicles,
    parkingFeeSummary,
    loading,
    error,
    fetchVehicles,
    getVehicle,
    addVehicle,
    editVehicle,
    removeVehicle,
    uploadImage,
    fetchUnknownVehicles,
    fetchParkingFeeSummary,
  } = useVehicles();

  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const tenantById = useMemo(() => {
    const map = {};
    tenants.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [tenants]);

  const roomById = useMemo(() => {
    const map = {};
    rooms.forEach((r) => {
      map[r.id] = r;
    });
    return map;
  }, [rooms]);

  const countVehiclesByBuilding = useCallback(
    (buildingId) =>
      vehicles.filter((v) => String(v.buildingId) === String(buildingId)).length,
    [vehicles]
  );

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return vehicles.filter((v) => {
      const tenant = tenantById[v.tenantId];
      const matchSearch =
        !q ||
        v.licensePlate?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q) ||
        tenant?.fullName?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchType = typeFilter === 'all' || v.type === typeFilter;
      const matchBuilding =
        selectedBuildingId === 'all' ||
        String(v.buildingId) === String(selectedBuildingId);
      return matchSearch && matchStatus && matchType && matchBuilding;
    });
  }, [vehicles, searchTerm, statusFilter, typeFilter, tenantById, selectedBuildingId]);

  const stats = useMemo(
    () => ({
      total: vehicles.length,
      active: vehicles.filter((v) => v.status === 'active').length,
      inactive: vehicles.filter((v) => v.status === 'inactive').length,
      unknown: unknownVehicles.length,
    }),
    [vehicles, unknownVehicles]
  );

  // const statCards = [
  //   { label: 'Tổng xe', value: stats.total, accent: 'border-l-accent-violet' },
  //   { label: 'Đang gửi', value: stats.active, accent: 'border-l-accent-lime' },
  //   { label: 'Ngừng gửi', value: stats.inactive, accent: 'border-l-hairline-cloud' },
  //   { label: 'Xe lạ', value: stats.unknown, accent: 'border-l-accent-pink', highlight: stats.unknown > 0 },
  // ];

  const loadVehicleDetail = useCallback(
    async (vehicleId, fallback) => {
      setPanelLoading(true);
      setSaveError(null);
      try {
        const detailed = await getVehicle(vehicleId);
        setSelectedVehicle(detailed || fallback);
      } catch {
        setSelectedVehicle(fallback);
      } finally {
        setPanelLoading(false);
      }
    },
    [getVehicle]
  );

  const refreshMeta = async () => {
    await Promise.all([fetchVehicles(), fetchUnknownVehicles(), fetchParkingFeeSummary()]);
  };

  const handleSelectVehicle = async (vehicle) => {
    setPanelMode('edit');
    setSelectedVehicle(vehicle);
    await loadVehicleDetail(vehicle.id, vehicle);
  };

  const handleOpenCreate = () => {
    setPanelMode('create');
    setSelectedVehicle(null);
    setSaveError(null);
  };

  const handleClosePanel = () => {
    setPanelMode(null);
    setSelectedVehicle(null);
    setSaveError(null);
  };

  const handleSave = async (formData, imageFile) => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      if (panelMode === 'create') {
        const created = await addVehicle(formData);
        if (imageFile && created?.id) {
          await uploadImage(created.id, imageFile);
        }
        setPanelMode('edit');
        await loadVehicleDetail(created.id, created);
      } else {
        const updated = await editVehicle(selectedVehicle.id, formData);
        if (imageFile) {
          await uploadImage(selectedVehicle.id, imageFile);
        }
        await loadVehicleDetail(selectedVehicle.id, updated);
      }
      await refreshMeta();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Lỗi khi lưu thông tin xe');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc muốn xóa xe này?')) return;
    try {
      await removeVehicle(vehicleId);
      if (String(selectedVehicle?.id) === String(vehicleId)) handleClosePanel();
      await refreshMeta();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Lỗi khi xóa xe');
    }
  };

  const handleUploadImage = async (vehicleId, file) => {
    await uploadImage(vehicleId, file);
    await loadVehicleDetail(vehicleId, selectedVehicle);
    await refreshMeta();
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-light">
        <Loader2 className="animate-spin text-accent-violet" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content page-content--wide">
        <div className="mb-6">
          {/* <p className="eyebrow">An ninh & phí gửi xe</p>
          <h1 className="font-display text-2xl font-semibold text-ink-deep sm:text-3xl">
            Quản lý xe người thuê
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Lưu biển số, loại xe, ảnh và phí gửi — liên kết phòng & khách để kiểm soát xe lạ và tra cứu nhanh.
          </p> */}
        </div>

        {/* <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl border border-hairline-cloud border-l-4 bg-surface-light px-4 py-3 shadow-sm ${card.accent} ${
                card.highlight ? 'ring-1 ring-accent-pink/40' : ''
              }`}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted">{card.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink-deep">{card.value}</p>
            </div>
          ))}
        </div> */}

        {stats.unknown > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-accent-pink/40 bg-accent-pink/10 px-4 py-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-accent-pink" size={22} />
            <div>
              <p className="font-semibold text-ink-deep">
                {stats.unknown} xe lạ chưa xác nhận
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Gán khách thuê và phòng để tăng cường an ninh khu trọ.
              </p>
            </div>
          </div>
        )}

        <div className="mb-6 rounded-xl border border-hairline-cloud bg-surface-light p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-deep">
            <Building2 size={18} className="text-accent-violet-mid" />
            Phương tiện theo tòa nhà
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
                {vehicles.length}
              </span>
            </button>
            {buildings.map((building) => {
              const active = String(selectedBuildingId) === String(building.buildingId);
              const count = countVehiclesByBuilding(building.buildingId);
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

        {parkingFeeSummary && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline-cloud bg-ink-deep px-5 py-4 text-on-primary">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-on-dark-faint">
                <Banknote size={22} className="text-accent-lime" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-on-dark-muted">Tổng phí gửi xe / tháng</p>
                <p className="font-display text-xl font-semibold text-accent-lime">
                  {formatCurrency(parkingFeeSummary.totalMonthlyFee || 0)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-on-dark-muted">
              <ShieldCheck size={16} className="text-accent-lime" />
              Từ {stats.active} xe đang gửi
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
          <div className="flex min-h-[560px] flex-col rounded-2xl border border-hairline-cloud bg-surface-light shadow-sm">
            <div className="border-b border-hairline-cloud bg-ink-deep px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-on-primary">Danh sách xe</p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline-violet bg-ink-deep text-accent-lime transition hover:border-accent-lime hover:shadow-[0_0_12px_rgba(194,239,78,0.35)]"
                  title="Thêm xe"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 text-on-dark-muted" size={16} />
                  <input
                    type="text"
                    placeholder="Biển số, hãng, tên khách…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-hairline-violet bg-on-dark-faint py-2 pl-9 pr-3 text-sm text-on-primary placeholder:text-on-dark-muted focus:outline-none focus:ring-1 focus:ring-accent-lime"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FilterSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={VEHICLE_STATUS_OPTIONS}
                    title="Lọc trạng thái"
                  />
                  <FilterSelect
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    options={VEHICLE_TYPE_OPTIONS}
                    title="Lọc loại xe"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {filteredVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Car className="mb-3 text-accent-violet-mid" size={36} />
                  <p className="text-sm text-muted">Chưa có xe nào</p>
                  <button type="button" onClick={handleOpenCreate} className="btn-primary mt-4 text-sm">
                    <Plus size={16} /> Đăng ký xe
                  </button>
                </div>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <VehicleListItem
                    key={vehicle.id}
                    vehicle={vehicle}
                    tenant={tenantById[vehicle.tenantId]}
                    room={roomById[vehicle.roomId]}
                    selected={String(selectedVehicle?.id) === String(vehicle.id)}
                    onClick={handleSelectVehicle}
                  />
                ))
              )}
            </div>
          </div>

          <VehicleManagementPanel
            vehicle={panelMode === 'create' ? null : selectedVehicle}
            mode={panelMode === 'create' ? 'create' : 'edit'}
            tenants={tenants}
            rooms={rooms}
            buildings={buildings}
            loading={panelLoading}
            onClose={handleClosePanel}
            onSave={panelMode ? handleSave : undefined}
            onDelete={handleDelete}
            onUploadImage={handleUploadImage}
            saveLoading={saveLoading}
            saveError={saveError}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-sm text-ink-deep">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclesList;
