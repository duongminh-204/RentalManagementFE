import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Home,
  ImageIcon,
  Users,
  Package,
  Wrench,
  Plus,
  Trash2,
  Save,
  Loader2,
  FileText,
  Download,
  Pencil,
  RefreshCw,
  Eye,
} from 'lucide-react';
import RoomStatusBadge from '../../../components/common/RoomStatusBadge';
import { formatCurrency, getRoomDisplayName, resolveMediaUrl } from '../utils/roomHelpers';
import {
  openOrDownloadContractFile,
  isImageUrl,
  isPdfUrl,
} from '../../contracts/utils/contractFileHelpers';
import * as roomMgmtApi from '../api/roomManagementApi';
import {
  getContracts,
  getContractsByRoomId,
  createContract,
  updateContract,
  deleteContract,
  uploadContractFile,
  renewContract,
} from '../../contracts/api/contractsApi';
import {
  normalizeContractsList,
  filterContractsByRoomId,
  getActiveContractForRoom,
  getContractStatusLabel,
  formatDate as formatContractDate,
  calculateDaysUntilExpiry,
  calculateContractDuration,
  isContractEffective,
  prepareContractPayload,
  resolveContractStatus,
} from '../../contracts/utils/contractHelpers';
import { getTenants } from '../../tenants/api/tenantsApi';
import { normalizeTenantsList } from '../../tenants/utils/tenantHelpers';
import ContractForm from '../../contracts/components/ContractForm';

const contractStatusPanelClass = (status) => {
  const map = {
    active: 'border-accent-lime/40 bg-accent-lime/10 text-accent-lime',
    expiring_soon: 'border-orange-400/40 bg-orange-500/10 text-orange-400',
    expired: 'border-accent-pink/40 bg-accent-pink/10 text-accent-pink',
    terminated: 'border-hairline-cloud bg-surface-press text-muted',
    pending: 'border-accent-violet/40 bg-accent-violet/10 text-accent-violet',
  };
  return map[status] || 'border-hairline-cloud bg-surface-press text-muted';
};

const TABS = [
  { id: 'info', label: 'Thông tin', icon: Home },
  { id: 'images', label: 'Ảnh', icon: ImageIcon },
  { id: 'tenants', label: 'Người thuê', icon: Users },
  { id: 'devices', label: 'Thiết bị', icon: Wrench },
  { id: 'services', label: 'Dịch vụ', icon: Package },
];

const emptyInfo = () => ({
  roomNumber: '',
  buildingId: 2,
  rentalPrice: '',
  electricPrice: '',
  waterPrice: '',
  area: '',
  maxPeople: '',
  status: 'vacant',
  description: '',
});

const RoomManagementPanel = ({
  room,
  mode = 'edit',
  loading = false,
  onClose,
  onSaveRoom,
  onRefresh,
  saveLoading = false,
  saveError = null,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [info, setInfo] = useState(emptyInfo());
  const [roomImageFile, setRoomImageFile] = useState(null);
  const [roomImagePreview, setRoomImagePreview] = useState(null);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceQty, setServiceQty] = useState(1);
  const [deviceForm, setDeviceForm] = useState({
    deviceName: '',
    quantity: 1,
    status: 'Working',
    note: '',
  });
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [roomContracts, setRoomContracts] = useState([]);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [tenantOptions, setTenantOptions] = useState([]);
  const [showContractForm, setShowContractForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [contractFormLoading, setContractFormLoading] = useState(false);
  const [contractFormError, setContractFormError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const roomId = room?.id ?? room?.roomId;
  const isCreate = mode === 'create';
  const canManageExtras = !isCreate && roomId;

  useEffect(() => {
    if (room) {
      setInfo({
        roomNumber: room.roomNumber || room.roomName || '',
        buildingId: room.buildingId ?? 2,
        rentalPrice: room.rentalPrice ?? room.price ?? '',
        electricPrice: room.electricPrice ?? room.electricityPrice ?? '',
        waterPrice: room.waterPrice ?? '',
        area: room.area ?? '',
        maxPeople: room.maxPeople ?? '',
        status: room.status || 'vacant',
        description: room.description || '',
      });
    } else if (isCreate) {
      setInfo(emptyInfo());
      setActiveTab('info');
    }
  }, [room, isCreate]);

  const loadCatalogs = useCallback(async () => {
    try {
      const services = await roomMgmtApi.getServiceCatalog();
      setServiceCatalog(Array.isArray(services) ? services : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (canManageExtras) loadCatalogs();
  }, [canManageExtras, loadCatalogs]);

  const loadRoomContracts = useCallback(async () => {
    if (!roomId) {
      setRoomContracts([]);
      return;
    }
    setContractsLoading(true);
    try {
      let payload;
      try {
        payload = await getContractsByRoomId(roomId);
      } catch {
        payload = await getContracts();
      }
      let list = filterContractsByRoomId(normalizeContractsList(payload), roomId);
      if (!list.length && room?.contracts?.length) {
        list = room.contracts;
      }
      setRoomContracts(list);
    } catch (e) {
      console.error(e);
      setRoomContracts(room?.contracts ?? []);
    } finally {
      setContractsLoading(false);
    }
  }, [roomId, room?.contracts]);

  const loadTenantOptions = useCallback(async () => {
    try {
      const data = await getTenants();
      setTenantOptions(normalizeTenantsList(data));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (canManageExtras) {
      loadRoomContracts();
      loadTenantOptions();
    } else {
      setRoomContracts([]);
    }
  }, [canManageExtras, loadRoomContracts, loadTenantOptions]);

  const activeContract = getActiveContractForRoom(roomContracts);

  const hasEffectiveContract = useMemo(
    () => roomContracts.some((c) => isContractEffective(c)),
    [roomContracts]
  );

  const hasTenantsOnRoom = useMemo(() => {
    const activeOnRoom = roomContracts.filter((c) => {
      const s = resolveContractStatus(c);
      return s === 'active' || s === 'expiring_soon';
    });
    if (activeOnRoom.length) return true;
    return (room?.users?.length ?? 0) > 0;
  }, [roomContracts, room?.users]);

  const canEditRoomStatus = !hasTenantsOnRoom && !hasEffectiveContract;

  const roomTenants = useMemo(() => {
    const activeOnRoom = roomContracts.filter((c) => {
      const s = resolveContractStatus(c);
      return s === 'active' || s === 'expiring_soon';
    });
    if (activeOnRoom.length) {
      return activeOnRoom.map((c) => {
        const tenant = tenantOptions.find((t) => String(t.id) === String(c.tenantId));
        const fromRoom = (room?.users || []).find(
          (u) => String(u.userId) === String(c.tenantId)
        );
        const fileUrl = resolveMediaUrl(c.fileUrl);
        const avatar = resolveMediaUrl(
          tenant?.avatar ?? fromRoom?.avatar ?? tenant?.idCardImage
        );
        return {
          contractId: c.id,
          contract: c,
          userId: c.tenantId,
          fullName: tenant?.fullName ?? fromRoom?.fullName ?? 'Khách thuê',
          phone: tenant?.phoneNumber ?? fromRoom?.phone,
          email: tenant?.email ?? fromRoom?.email,
          avatar,
          fileUrl,
          contractIsImage: fileUrl && isImageUrl(fileUrl),
          contractIsPdf: fileUrl && isPdfUrl(fileUrl),
          contractStatus: resolveContractStatus(c),
        };
      });
    }
    return [];
  }, [roomContracts, room?.users, tenantOptions]);

  const panelRoomOption = room
    ? [{ id: roomId, roomNumber: room.roomNumber || room.roomName }]
    : [];

  const tenantNameById = (tenantId) => {
    const fromRoom = (room?.users || []).find(
      (u) => String(u.userId) === String(tenantId)
    );
    if (fromRoom?.fullName) return fromRoom.fullName;
    return tenantOptions.find((t) => String(t.id) === String(tenantId))?.fullName;
  };

  const handleContractSubmit = async (formData) => {
    setContractFormLoading(true);
    setContractFormError(null);
    try {
      const { contractFile, ...contractData } = formData;
      const payload = prepareContractPayload({
        ...contractData,
        roomId: roomId ?? contractData.roomId,
      });
      if (editingContract?.id) {
        await updateContract(editingContract.id, payload);
        if (contractFile && typeof contractFile !== 'string') {
          await uploadContractFile(editingContract.id, contractFile);
        }
      } else {
        const created = await createContract(payload);
        const newId = created?.id ?? created?.Id ?? created?.data?.id;
        if (contractFile && newId) {
          await uploadContractFile(newId, contractFile);
        }
      }
      setShowContractForm(false);
      setEditingContract(null);
      await loadRoomContracts();
      await onRefresh?.();
    } catch (err) {
      setContractFormError(err.response?.data?.message || 'Lỗi khi lưu hợp đồng');
    } finally {
      setContractFormLoading(false);
    }
  };

  const handleContractDelete = async (contractId) => {
    if (!window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) return;
    await runAction(async () => {
      await deleteContract(contractId);
      await loadRoomContracts();
    });
  };

  const handleContractDownload = async (contract) => {
    try {
      setLocalError(null);
      await openOrDownloadContractFile(contract);
    } catch (err) {
      setLocalError(err.message || err.response?.data?.message || 'Lỗi khi xem/tải file hợp đồng');
    }
  };

  const handleContractRenew = async (contract) => {
    const newEndDate = new Date(contract.endDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    await runAction(async () => {
      await renewContract(contract.id, {
        newEndDate: newEndDate.toISOString().split('T')[0],
        notes: 'Gia hạn tự động 12 tháng',
      });
      await loadRoomContracts();
    });
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfo = (e) => {
    e.preventDefault();
    onSaveRoom?.({
      roomNumber: info.roomNumber,
      buildingId: Number(info.buildingId),
      rentalPrice: Number(info.rentalPrice),
      electricityPrice: Number(info.electricPrice),
      electricPrice: Number(info.electricPrice),
      waterPrice: Number(info.waterPrice),
      area: info.area !== '' ? Number(info.area) : null,
      maxPeople: info.maxPeople !== '' ? Number(info.maxPeople) : null,
      status: canEditRoomStatus ? info.status : (room?.status ?? info.status),
      description: info.description || null,
    });
  };

  const runAction = async (fn) => {
    setBusy(true);
    setLocalError(null);
    try {
      await fn();
      await onRefresh?.();
    } catch (err) {
      setLocalError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setBusy(false);
    }
  };

  const handleRoomImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const okType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
    const okExt = /\.(png|jpe?g)$/i.test(file.name);
    if (!okType && !okExt) {
      setLocalError('Chỉ chấp nhận ảnh PNG hoặc JPG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Ảnh tối đa 5MB');
      return;
    }
    setRoomImageFile(file);
    setRoomImagePreview(URL.createObjectURL(file));
    setLocalError(null);
  };

  const handleAddImage = () => {
    if (!roomImageFile) {
      setLocalError('Vui lòng chọn ảnh PNG hoặc JPG');
      return;
    }
    runAction(async () => {
      await roomMgmtApi.uploadRoomImage(roomId, roomImageFile);
      setRoomImageFile(null);
      setRoomImagePreview(null);
    });
  };

  const handleAddDevice = () =>
    runAction(async () => {
      await roomMgmtApi.addDevice(roomId, deviceForm);
      setDeviceForm({ deviceName: '', quantity: 1, status: 'Working', note: '' });
    });

  const handleAddService = () =>
    runAction(async () => {
      await roomMgmtApi.assignRoomService(roomId, {
        serviceId: Number(selectedServiceId),
        quantity: Number(serviceQty) || 1,
      });
      setSelectedServiceId('');
    });

  const handleRemoveRoomTenant = async (contractId) => {
    if (
      !window.confirm(
        'Hủy hợp đồng của khách thuê với phòng này? Khách vẫn còn trong danh sách quản lý khách thuê.'
      )
    ) {
      return;
    }
    await runAction(async () => {
      await roomMgmtApi.removeTenant(roomId, contractId);
      await loadRoomContracts();
    });
  };

  if (!room && !isCreate) {
    return (
      <aside className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline-cloud bg-surface-press/50 p-8 text-center lg:min-h-[600px]">
        <Home className="mb-4 text-accent-violet-mid" size={40} />
        <p className="font-display text-lg font-semibold text-ink-deep">Chọn một phòng</p>
        <p className="mt-2 text-sm text-muted">
          Click vào ô phòng trên sơ đồ hoặc bấm &quot;Thêm phòng&quot; để quản lý
        </p>
      </aside>
    );
  }

  return (
    <aside className="relative flex h-full max-h-[calc(100vh-10rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)] lg:min-h-[600px] xl:min-h-[640px]">
      <div className="border-b border-hairline-cloud bg-ink-deep px-5 py-4 text-on-primary">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-on-dark-muted">Quản lý phòng</p>
            <h2 className="font-display text-xl font-semibold">
              {isCreate ? (
                'Thêm phòng mới'
              ) : (
                <>
                  <span className="chip-lime text-ink-deep">{getRoomDisplayName(room)}</span>
                </>
              )}
            </h2>
            {room && !isCreate && (
              <div className="mt-2">
                <RoomStatusBadge status={room.status} />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-on-dark-muted transition hover:bg-on-dark-faint hover:text-on-primary"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-hairline-cloud bg-surface-press/50 px-2 py-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const disabled = isCreate && id !== 'info';
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${activeTab === id
                  ? 'bg-primary text-on-primary'
                  : disabled
                    ? 'cursor-not-allowed text-muted opacity-50'
                    : 'text-ink-deep hover:bg-surface-press'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
            <Loader2 className="animate-spin text-accent-violet" size={28} />
            <p className="text-sm">Đang tải…</p>
          </div>
        ) : (
          <>
            {(saveError || localError) && (
              <div className="mb-4 rounded-lg border border-accent-pink/40 bg-accent-pink/10 px-3 py-2 text-sm text-ink-deep">
                {saveError || localError}
              </div>
            )}

            {activeTab === 'info' && (
              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                    Tên / số phòng *
                  </label>
                  <input
                    name="roomNumber"
                    value={info.roomNumber}
                    onChange={handleInfoChange}
                    className="text-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Tòa nhà
                    </label>
                    <input
                      type="number"
                      name="buildingId"
                      value={info.buildingId}
                      onChange={handleInfoChange}
                      className="text-input"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={info.status}
                      onChange={handleInfoChange}
                      className="text-input disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!canEditRoomStatus}
                      title={
                        !canEditRoomStatus
                          ? 'Không thể đổi trạng thái khi phòng còn người thuê hoặc hợp đồng còn hiệu lực'
                          : undefined
                      }
                    >
                      <option value="vacant">Trống</option>
                      <option value="occupied">Đang thuê</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                    {!canEditRoomStatus && (
                      <p className="mt-1 text-xs text-muted">
                        Trạng thái bị khóa: phòng đang có người thuê hoặc hợp đồng còn hiệu lực.
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Giá thuê
                    </label>
                    <input
                      type="number"
                      name="rentalPrice"
                      value={info.rentalPrice}
                      onChange={handleInfoChange}
                      className="text-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Giá điện / kWh
                    </label>
                    <input
                      type="number"
                      name="electricPrice"
                      value={info.electricPrice}
                      onChange={handleInfoChange}
                      className="text-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Giá nước / m³
                    </label>
                    <input
                      type="number"
                      name="waterPrice"
                      value={info.waterPrice}
                      onChange={handleInfoChange}
                      className="text-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Diện tích m²
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={info.area}
                      onChange={handleInfoChange}
                      className="text-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Số người tối đa
                    </label>
                    <input
                      type="number"
                      name="maxPeople"
                      value={info.maxPeople}
                      onChange={handleInfoChange}
                      className="text-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={info.description}
                    onChange={handleInfoChange}
                    rows={3}
                    className="text-input resize-none"
                  />
                </div>

                {canManageExtras && (
                  <section className="space-y-3 rounded-xl border border-hairline-violet bg-ink-deep p-4 text-on-primary">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-accent-lime" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-on-dark-muted">
                          Hợp đồng thuê
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingContract(null);
                          setContractFormError(null);
                          setShowContractForm(true);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-accent-lime px-2.5 py-1.5 text-xs font-semibold text-ink-deep transition hover:opacity-90"
                      >
                        <Plus size={14} />
                        {activeContract ? 'Thêm' : 'Tạo HĐ'}
                      </button>
                    </div>

                    {contractsLoading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="animate-spin text-accent-lime" size={22} />
                      </div>
                    ) : activeContract ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-display text-lg font-semibold">
                              {activeContract.contractNumber}
                            </p>
                            <p className="mt-0.5 text-xs text-on-dark-muted">
                              {tenantNameById(activeContract.tenantId) || '—'}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${contractStatusPanelClass(activeContract.status)}`}
                          >
                            {getContractStatusLabel(activeContract.status)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-[10px] uppercase text-on-dark-muted">Thời hạn</p>
                            <p className="font-medium">
                              {formatContractDate(activeContract.startDate)} →{' '}
                              {formatContractDate(activeContract.endDate)}
                            </p>
                            <p className="text-xs text-on-dark-muted">
                              {calculateContractDuration(
                                activeContract.startDate,
                                activeContract.endDate
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase text-on-dark-muted">Tiền cọc</p>
                            <p className="font-medium text-accent-lime">
                              {formatCurrency(activeContract.deposit || activeContract.securityDeposit || 0)}
                            </p>
                          </div>
                        </div>
                        {activeContract.terms && (
                          <p className="border-t border-hairline-violet pt-2 text-xs text-on-dark-muted line-clamp-2">
                            {activeContract.terms}
                          </p>
                        )}
                        {activeContract.notes && (
                          <p className="text-xs italic text-on-dark-muted">{activeContract.notes}</p>
                        )}
                        {activeContract.endDate && (
                          <p className="text-xs">
                            {(() => {
                              const days = calculateDaysUntilExpiry(activeContract.endDate);
                              if (days < 0) {
                                return (
                                  <span className="text-accent-pink">
                                    Đã hết hạn {Math.abs(days)} ngày
                                  </span>
                                );
                              }
                              if (days <= 30) {
                                return (
                                  <span className="text-orange-400">
                                    Sắp hết hạn trong {days} ngày
                                  </span>
                                );
                              }
                              return (
                                <span className="text-on-dark-muted">Còn {days} ngày</span>
                              );
                            })()}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 border-t border-hairline-violet pt-3">
                          {activeContract.fileUrl && (
                            <button
                              type="button"
                              onClick={() => handleContractDownload(activeContract)}
                              className="flex items-center gap-1 rounded-lg border border-hairline-violet px-2.5 py-1.5 text-xs font-medium transition hover:bg-on-dark-faint"
                            >
                              <Download size={14} />
                              Tải file
                            </button>
                          )}
                          {(['expiring_soon', 'expired'].includes(
                            resolveContractStatus(activeContract)
                          )) && (
                              <button
                                type="button"
                                onClick={() => handleContractRenew(activeContract)}
                                disabled={busy}
                                className="flex items-center gap-1 rounded-lg border border-accent-lime/50 px-2.5 py-1.5 text-xs font-medium text-accent-lime transition hover:bg-on-dark-faint"
                              >
                                <RefreshCw size={14} />
                                Gia hạn
                              </button>
                            )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingContract(activeContract);
                              setContractFormError(null);
                              setShowContractForm(true);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-hairline-violet px-2.5 py-1.5 text-xs font-medium transition hover:bg-on-dark-faint"
                          >
                            <Pencil size={14} />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleContractDelete(activeContract.id)}
                            disabled={busy}
                            className="flex items-center gap-1 rounded-lg border border-accent-pink/40 px-2.5 py-1.5 text-xs font-medium text-accent-pink transition hover:bg-on-dark-faint"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        </div>
                        {roomContracts.length > 1 && (
                          <details className="text-xs text-on-dark-muted">
                            <summary className="cursor-pointer font-medium">
                              {roomContracts.length - 1} hợp đồng khác
                            </summary>
                            <ul className="mt-2 space-y-2">
                              {roomContracts
                                .filter((c) => c.id !== activeContract.id)
                                .map((c) => (
                                  <li
                                    key={c.id}
                                    className="flex items-center justify-between rounded-lg border border-hairline-violet/50 px-2 py-1.5"
                                  >
                                    <span>{c.contractNumber}</span>
                                    <span>{getContractStatusLabel(c.status)}</span>
                                  </li>
                                ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    ) : (
                      <p className="py-2 text-center text-sm text-on-dark-muted">
                        Chưa có hợp đồng cho phòng này
                      </p>
                    )}
                  </section>
                )}

                <button type="submit" disabled={saveLoading || busy} className="btn-primary w-full">
                  <Save size={18} />
                  {saveLoading ? 'Đang lưu…' : isCreate ? 'Tạo phòng' : 'Lưu thông tin'}
                </button>
              </form>
            )}

            {activeTab === 'images' && canManageExtras && (
              <div className="space-y-4">
                <div className="space-y-3 rounded-xl border border-hairline-cloud bg-surface-press/40 p-3">
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-hairline-cloud p-6 transition hover:border-accent-violet">
                    <ImageIcon className="text-accent-violet-mid" size={28} />
                    <span className="text-sm font-medium text-ink-deep">Chọn ảnh phòng</span>
                    <span className="text-xs text-muted">PNG, JPG — tối đa 5MB</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                      onChange={handleRoomImageSelect}
                      className="hidden"
                    />
                  </label>
                  {roomImagePreview && (
                    <img
                      src={roomImagePreview}
                      alt="Xem trước"
                      className="mx-auto max-h-32 rounded-lg border border-hairline-cloud object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={busy || !roomImageFile}
                    className="btn-primary w-full"
                  >
                    <Plus size={18} />
                    {busy ? 'Đang tải lên…' : 'Tải ảnh lên'}
                  </button>
                </div>
                <div className="stagger-layout grid grid-cols-2 gap-3">
                  {(room.roomImages || []).map((img) => (
                    <div
                      key={img.id ?? img.url}
                      className="group relative overflow-hidden rounded-xl border border-hairline-cloud"
                    >
                      <img
                        src={resolveMediaUrl(img.url)}
                        alt=""
                        className="h-28 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          runAction(() => roomMgmtApi.deleteRoomImage(roomId, img.id))
                        }
                        className="absolute right-2 top-2 rounded-full bg-primary/90 p-1.5 text-on-primary opacity-0 transition group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {!room.roomImages?.length && (
                  <p className="text-center text-sm text-muted">Chưa có ảnh</p>
                )}
              </div>
            )}

            {activeTab === 'tenants' && canManageExtras && (
              <div className="space-y-4">
                <p className="text-xs text-muted">
                  Khách thuê có hợp đồng còn hiệu lực tại phòng này
                </p>
                <ul className="space-y-3">
                  {roomTenants.map((u) => (
                    <li
                      key={u.contractId ?? u.userId}
                      className="rounded-xl border border-hairline-violet bg-ink-deep p-3 text-on-primary"
                    >
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => u.avatar && setPreviewImage(u.avatar)}
                          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
                          title="Xem ảnh khách thuê"
                          disabled={!u.avatar}
                        >
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.fullName}
                              className="h-14 w-14 rounded-full border-2 border-accent-lime object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-violet-deep text-lg font-bold">
                              {u.fullName?.[0]}
                            </div>
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{u.fullName}</p>
                          <p className="text-xs text-on-dark-muted">{u.phone || u.email || '—'}</p>
                          {u.contract && (
                            <p className="mt-1 text-xs text-on-dark-muted">
                              {formatContractDate(u.contract.startDate)} →{' '}
                              {formatContractDate(u.contract.endDate)}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col gap-1">
                          {u.fileUrl ? (
                            <button
                              type="button"
                              onClick={() => handleContractDownload(u.contract)}
                              className="flex items-center gap-1 rounded-lg border border-hairline-violet px-2 py-1 text-[10px] font-medium hover:bg-on-dark-faint"
                              title="Xem hợp đồng"
                            >
                              <Eye size={12} />
                              HĐ
                            </button>
                          ) : (
                            <span className="text-[10px] text-on-dark-muted">Chưa có file</span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveRoomTenant(u.contractId)}
                            disabled={busy}
                            className="rounded-md p-1.5 text-accent-pink hover:bg-on-dark-faint"
                            aria-label="Hủy hợp đồng"
                            title="Hủy hợp đồng"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {u.fileUrl && u.contractIsImage && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(u.fileUrl)}
                          className="mt-3 block w-full overflow-hidden rounded-lg border border-hairline-violet focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime"
                        >
                          <img
                            src={u.fileUrl}
                            alt="Hợp đồng"
                            className="max-h-36 w-full object-cover object-top"
                          />
                        </button>
                      )}
                      {u.fileUrl && u.contractIsPdf && (
                        <button
                          type="button"
                          onClick={() => handleContractDownload(u.contract)}
                          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-dashed border-hairline-violet bg-on-dark-faint/50 px-3 py-2 text-left text-xs hover:bg-on-dark-faint"
                        >
                          <FileText size={18} className="shrink-0 text-accent-lime" />
                          <span className="min-w-0 truncate">Xem file PDF hợp đồng</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                {!roomTenants.length && (
                  <p className="text-center text-sm text-muted">
                    Chưa có khách thuê với hợp đồng hiệu lực cho phòng này
                  </p>
                )}
              </div>
            )}

            {activeTab === 'devices' && canManageExtras && (
              <div className="space-y-4">
                <div className="space-y-2 rounded-xl border border-hairline-cloud bg-surface-press/40 p-3">
                  <input
                    placeholder="Tên thiết bị"
                    value={deviceForm.deviceName}
                    onChange={(e) =>
                      setDeviceForm((p) => ({ ...p, deviceName: e.target.value }))
                    }
                    className="text-input"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="SL"
                      value={deviceForm.quantity}
                      onChange={(e) =>
                        setDeviceForm((p) => ({ ...p, quantity: Number(e.target.value) }))
                      }
                      className="text-input"
                    />
                    <select
                      value={deviceForm.status}
                      onChange={(e) =>
                        setDeviceForm((p) => ({ ...p, status: e.target.value }))
                      }
                      className="text-input"
                    >
                      <option value="Working">Hoạt động</option>
                      <option value="Broken">Hỏng</option>
                      <option value="Repair">Đang sửa</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDevice}
                    disabled={busy || !deviceForm.deviceName.trim()}
                    className="btn-primary w-full"
                  >
                    <Plus size={16} /> Thêm thiết bị
                  </button>
                </div>
                <ul className="space-y-2">
                  {(room.devices || []).map((d) => (
                    <li
                      key={d.deviceId}
                      className="flex items-center justify-between rounded-lg border border-hairline-cloud px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-ink-deep">{d.deviceName}</p>
                        <p className="text-xs text-muted">
                          SL: {d.quantity} · {d.status}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          runAction(() => roomMgmtApi.deleteDevice(roomId, d.deviceId))
                        }
                        className="rounded-md p-2 text-accent-pink hover:bg-surface-press"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'services' && canManageExtras && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="text-input min-w-0 flex-1"
                  >
                    <option value="">Chọn dịch vụ…</option>
                    {serviceCatalog.map((s) => (
                      <option key={s.serviceId} value={s.serviceId}>
                        {s.serviceName} — {formatCurrency(s.unitPrice)}
                        {s.unit ? `/${s.unit}` : ''}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={serviceQty}
                    onChange={(e) => setServiceQty(e.target.value)}
                    className="text-input w-20"
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    disabled={busy || !selectedServiceId}
                    className="btn-primary"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <ul className="space-y-2">
                  {(room.roomServices || []).map((rs) => (
                    <li
                      key={rs.roomServiceId}
                      className="flex items-center justify-between rounded-lg border border-hairline-cloud bg-surface-press/30 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-ink-deep">{rs.serviceName}</p>
                        <p className="text-xs text-muted">
                          {formatCurrency(rs.unitPrice)}
                          {rs.unit ? `/${rs.unit}` : ''} · SL: {rs.quantity}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          runAction(() =>
                            roomMgmtApi.deleteRoomService(roomId, rs.roomServiceId)
                          )
                        }
                        className="rounded-md p-2 text-accent-pink hover:bg-surface-press"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
                {!room.roomServices?.length && (
                  <p className="text-center text-sm text-muted">Chưa có dịch vụ</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showContractForm && canManageExtras && (
        <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-surface-light">
          <ContractForm
            embedded
            contract={editingContract}
            tenants={tenantOptions}
            rooms={panelRoomOption}
            fixedRoomId={roomId}
            onSubmit={handleContractSubmit}
            onCancel={() => {
              setShowContractForm(false);
              setEditingContract(null);
              setContractFormError(null);
            }}
            loading={contractFormLoading}
            error={contractFormError}
          />
        </div>
      )}

      {previewImage && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-ink-deep/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full bg-on-dark-faint p-2 text-on-primary"
            onClick={() => setPreviewImage(null)}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
          <img
            src={previewImage}
            alt="Xem ảnh"
            className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </aside>
  );
};

export default RoomManagementPanel;
