import { useState, useEffect, useCallback } from 'react';
import {
  X,
  User,
  IdCard,
  History,
  Save,
  Loader2,
  Upload,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  Banknote,
  FileText,
  Building2,
} from 'lucide-react';
import * as buildingsApi from '../../buildings/api/buildingsApi';
import {
  denormalizeTenantForApi,
  formatCurrency,
  formatDate,
  getTenantStatusBadgeClass,
  getTenantStatusLabel,
  getDefaultAvatar,
  normalizeHistoryFromApi,
  parseTenantAddressParts,
  resolveMediaUrl,
  toInputDate,
  validateCCCD,
  validatePhoneNumber,
} from '../utils/tenantHelpers';
import TenantAddressPicker from './TenantAddressPicker';
import DateInput from '../../../components/common/DateInput';
import CurrencyInput from '../../../components/common/CurrencyInput';
import { toMoneyInputValue } from '../../../utils/currencyInput';
import { getAllRooms } from '../../rooms/api/roomsApi';
import { normalizeRoomsList, groupRoomsByBuilding } from '../../rooms/utils/roomHelpers';
import { getTenantHistory } from '../api/tenantsApi';
import ImageModal from '../../../components/common/ImageModal';


const TABS = [
  { id: 'info', label: 'Thông tin', icon: User },
  { id: 'cccd', label: 'CCCD', icon: IdCard },
  { id: 'history', label: 'Lịch sử', icon: History },
];

const emptyForm = () => ({
  fullName: '',
  phoneNumber: '',
  email: '',
  cccd: '',
  address: '',
  province: '',
  district: '',
  ward: '',
  streetDetail: '',
  latitude: null,
  longitude: null,
  dateOfBirth: '',
  gender: '',
  workplace: '',
  occupation: '',
  roomId: '',
  moveInDate: '',
  moveOutDate: '',
  deposit: '',
  notes: '',
  status: 'active',
  isActive: true,
});

const TenantManagementPanel = ({
  tenant,
  mode = 'edit',
  loading = false,
  onClose,
  onSave,
  onDelete,
  onUploadIdCard,
  onUploadAvatar,
  onDeleteIdCard,
  onRefresh,
  saveLoading = false,
  saveError = null,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState(emptyForm());
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewAlt, setPreviewAlt] = useState('');


  const isCreate = mode === 'create';
  const tenantId = tenant?.id;

  useEffect(() => {
    Promise.all([getAllRooms(), buildingsApi.getAllBuildings()])
      .then(([roomsPayload, buildingsPayload]) => {
        setRooms(normalizeRoomsList(roomsPayload));
        setBuildings(Array.isArray(buildingsPayload) ? buildingsPayload : []);
      })
      .catch(console.error);
  }, []);

  const roomsByBuilding = groupRoomsByBuilding(rooms, buildings);

  useEffect(() => {
    if (tenant && !isCreate) {
      const addressParts = parseTenantAddressParts(tenant.address || '');
      setForm({
        fullName: tenant.fullName || '',
        phoneNumber: tenant.phoneNumber || '',
        email: tenant.email || '',
        cccd: tenant.cccd || '',
        address: tenant.address || '',
        province: addressParts.province,
        district: addressParts.district,
        ward: addressParts.ward,
        streetDetail: addressParts.streetDetail,
        latitude: tenant.latitude ?? null,
        longitude: tenant.longitude ?? null,
        dateOfBirth: toInputDate(tenant.dateOfBirth),
        gender: tenant.gender || '',
        workplace: tenant.workplace || '',
        occupation: tenant.occupation || '',
        roomId: tenant.roomId ? String(tenant.roomId) : '',
        moveInDate: toInputDate(tenant.moveInDate),
        moveOutDate: toInputDate(tenant.moveOutDate),
        deposit: toMoneyInputValue(tenant.deposit ?? ''),
        notes: tenant.notes || '',
        status: tenant.status || 'active',
        isActive: tenant.isActive !== false,
      });
      setIdCardPreview(tenant.idCardImage || null);
      setAvatarPreview(resolveMediaUrl(tenant.avatar) || null);
      setHistory(tenant.history || []);
    } else if (isCreate) {
      setForm(emptyForm());
      setIdCardPreview(null);
      setAvatarPreview(null);
      setHistory([]);
      setActiveTab('info');
    }
    setIdCardFile(null);
    setAvatarFile(null);
    setValidationErrors({});
  }, [tenant, isCreate]);

  const loadHistory = useCallback(async () => {
    if (!tenantId || isCreate) return;
    setHistoryLoading(true);
    try {
      const data = await getTenantHistory(tenantId);
      const list = Array.isArray(data) ? data : data?.data ?? [];
      setHistory(list.map(normalizeHistoryFromApi));
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  }, [tenantId, isCreate]);

  useEffect(() => {
    if (activeTab === 'history' && tenantId && !isCreate) loadHistory();
  }, [activeTab, tenantId, isCreate, loadHistory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (validationErrors[name]) {
      setValidationErrors((p) => ({ ...p, [name]: '' }));
    }
  };

  const handleAddressChange = (addressData) => {
    setForm((prev) => ({
      ...prev,
      address: addressData.address,
      province: addressData.province,
      district: addressData.district,
      ward: addressData.ward,
      streetDetail: addressData.streetDetail,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
    }));
  };

  const validate = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
    if (!validatePhoneNumber(form.phoneNumber)) errors.phoneNumber = 'Số điện thoại không hợp lệ';
    if (!validateCCCD(form.cccd)) errors.cccd = 'CCCD phải có 12 chữ số';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave?.(denormalizeTenantForApi(form), idCardFile, avatarFile);
  };

  const isAllowedImage = (file) => {
    const okType = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
    const okExt = /\.(png|jpe?g)$/i.test(file.name);
    return okType || okExt;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedImage(file)) {
      setLocalError('Chỉ chấp nhận ảnh PNG hoặc JPG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Ảnh tối đa 5MB');
      return;
    }
    setIdCardFile(file);
    setIdCardPreview(URL.createObjectURL(file));
    setLocalError(null);
  };

  const handleUploadCccd = async () => {
    if (!idCardFile || !tenantId) return;
    setUploading(true);
    setLocalError(null);
    try {
      await onUploadIdCard?.(tenantId, idCardFile);
      setIdCardFile(null);
      await onRefresh?.();
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Lỗi upload ảnh CCCD');
    } finally {
      setUploading(false);
    }
  };
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedImage(file)) {
      setLocalError('Avatar chỉ chấp nhận PNG hoặc JPG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Ảnh avatar tối đa 5MB');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setLocalError(null);

    if (!isCreate && tenantId && onUploadAvatar) {
      setUploading(true);
      try {
        await onUploadAvatar(tenantId, file);
        setAvatarFile(null);
        await onRefresh?.();
      } catch (err) {
        setLocalError(err.response?.data?.message || 'Lỗi upload ảnh đại diện');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteIdCardImage = async () => {
    if (!tenantId || !onDeleteIdCard) return;
    setUploading(true);
    setLocalError(null);
    try {
      await onDeleteIdCard(tenantId);
      setIdCardFile(null);
      setIdCardPreview(null);
      await onRefresh?.();
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Lỗi khi xóa ảnh CCCD');
    } finally {
      setUploading(false);
    }
  };

  if (!tenant && !isCreate) {
    return (
      <aside className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline-cloud bg-surface-press/50 p-8 text-center lg:min-h-[600px]">
        <User className="mb-4 text-accent-violet-mid" size={40} />
        <p className="font-display text-lg font-semibold text-ink-deep">Chọn khách thuê</p>
        <p className="mt-2 text-sm text-muted">
          Chọn một khách bên trái hoặc bấm + để thêm khách mới
        </p>
      </aside>
    );
  }

  const cccdDisplay = idCardPreview || resolveMediaUrl(tenant?.idCardImage);
  const avatarDisplay =
    avatarPreview || resolveMediaUrl(tenant?.avatar) || getDefaultAvatar();

  return (
    <aside className="flex h-full max-h-[calc(100vh-10rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)] lg:min-h-[600px]">
      {/* Header với Avatar */}
      <div className="border-b border-hairline-cloud bg-ink-deep px-5 py-4 text-on-primary">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={avatarDisplay}
                alt={tenant?.fullName || 'Avatar'}
                className="h-32 w-32 rounded-2xl border-2 border-accent-lime/50 object-cover shadow-md cursor-pointer transition hover:opacity-90"
                onClick={() => {
                  if (avatarDisplay) {
                    setPreviewImage(avatarDisplay);
                    setPreviewAlt(`Ảnh đại diện của ${tenant?.fullName || 'khách thuê'}`);
                  }
                }}
                onError={(e) => {
                  e.target.src = getDefaultAvatar();
                }}
              />

              {!isCreate && tenantId && (
                <label
                  className={`absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-accent-lime p-2 text-ink-deep shadow-lg transition hover:opacity-90 ${uploading ? 'pointer-events-none opacity-60' : ''}`}
                  title="Tải ảnh đại diện (PNG/JPG)"
                >
                  <Upload size={18} />
                  <input
                    type="file"
                    accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Phần còn lại giữ nguyên */}
            <div>
              <p className="eyebrow text-on-dark-muted">Quản lý khách thuê</p>
              <h2 className="font-display text-xl font-semibold">
                {isCreate ? 'Thêm khách mới' : tenant.fullName}
              </h2>
              {tenant && !isCreate && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${getTenantStatusBadgeClass(tenant.status)}`}>
                    {getTenantStatusLabel(tenant.status)}
                  </span>
                  {tenant.buildingName && (
                    <span className="inline-flex items-center gap-1 rounded-xs bg-on-dark-faint px-2 py-0.5 text-[10px] font-medium text-on-dark-muted">
                      <Building2 size={11} />
                      {tenant.buildingName}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1">
            {!isCreate && tenantId && activeTab !== 'cccd' && (
              <button
                type="button"
                onClick={() => onDelete?.(tenantId)}
                className="rounded-md p-2 text-accent-pink hover:bg-on-dark-faint"
                title="Xóa khách thuê"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-on-dark-muted hover:bg-on-dark-faint hover:text-on-primary"
            >
              <X size={20} />
            </button>
          </div>
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
                  ? 'cursor-not-allowed opacity-50 text-muted'
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
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                    <User size={12} /> Họ tên *
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="text-input"
                    required
                  />
                  {validationErrors.fullName && (
                    <p className="mt-1 text-xs text-accent-pink">{validationErrors.fullName}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                      <Phone size={12} /> Số điện thoại
                    </label>
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className="text-input"
                      placeholder="09xxxxxxxx"
                    />
                    {validationErrors.phoneNumber && (
                      <p className="mt-1 text-xs text-accent-pink">{validationErrors.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                      <Mail size={12} /> Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      className="text-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                    <IdCard size={12} /> Số CCCD
                  </label>
                  <input
                    name="cccd"
                    value={form.cccd}
                    onChange={handleChange}
                    className="text-input"
                    placeholder="12 chữ số"
                    maxLength={14}
                  />
                  {validationErrors.cccd && (
                    <p className="mt-1 text-xs text-accent-pink">{validationErrors.cccd}</p>
                  )}
                </div>

                <TenantAddressPicker
                  value={{
                    address: form.address,
                    province: form.province,
                    district: form.district,
                    ward: form.ward,
                    streetDetail: form.streetDetail,
                    latitude: form.latitude,
                    longitude: form.longitude,
                  }}
                  onChange={handleAddressChange}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                      <Calendar size={12} /> Ngày sinh
                    </label>
                    <DateInput
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      className="text-input"
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                      <User size={12} /> Giới tính
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="text-input"
                    >
                      <option value="">— Chọn giới tính —</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                      <FileText size={12} /> Nghề nghiệp
                    </label>
                    <input
                      name="occupation"
                      value={form.occupation}
                      onChange={handleChange}
                      className="text-input"
                      placeholder="Ví dụ: Sinh viên, Kỹ sư..."
                    />
                  </div>
                  <div>
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                      <MapPin size={12} /> Nơi làm việc
                    </label>
                    <input
                      name="workplace"
                      value={form.workplace}
                      onChange={handleChange}
                      className="text-input"
                      placeholder="Trường học hoặc Công ty..."
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-hairline-violet/30 bg-ink-deep/5 p-4">
                  <p className="eyebrow mb-3 text-accent-violet-mid">Liên kết phòng</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                        <Home size={12} /> Phòng
                      </label>
                      <select name="roomId" value={form.roomId} onChange={handleChange} className="text-input">
                        <option value="">— Chưa gán phòng —</option>
                        {roomsByBuilding.map((group) => (
                          <optgroup key={group.buildingId ?? group.buildingName} label={group.buildingName}>
                            {group.rooms.map((r) => (
                              <option key={r.id} value={r.id}>
                                Phòng {r.roomNumber || r.roomName}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                        <Calendar size={12} /> Ngày vào
                      </label>
                      <DateInput
                        name="moveInDate"
                        value={form.moveInDate}
                        onChange={handleChange}
                        className="text-input"
                      />
                    </div>
                    <div>
                      <label className="mb-1 text-xs font-semibold uppercase text-accent-violet-mid">
                        Ngày ra (dự kiến)
                      </label>
                      <DateInput
                        name="moveOutDate"
                        value={form.moveOutDate}
                        onChange={handleChange}
                        className="text-input"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                        <Banknote size={12} /> Tiền cọc (₫)
                      </label>
                      <CurrencyInput
                        name="deposit"
                        value={form.deposit}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                    <FileText size={12} /> Ghi chú
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="text-input resize-y"
                    placeholder="Ghi chú về khách thuê, thói quen, yêu cầu đặc biệt…"
                  />
                </div>

                {!isCreate && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                      Trạng thái
                    </label>
                    <select name="status" value={form.status} onChange={handleChange} className="text-input">
                      <option value="active">Đang thuê</option>
                      <option value="moved_out">Đã trả phòng</option>
                      <option value="inactive">Chưa / ngừng thuê</option>
                    </select>
                  </div>
                )}

                <button type="submit" disabled={saveLoading} className="btn-primary w-full">
                  <Save size={18} />
                  {saveLoading ? 'Đang lưu…' : isCreate ? 'Tạo khách thuê' : 'Lưu thông tin'}
                </button>
              </form>
            )}

            {activeTab === 'cccd' && !isCreate && (
              <div className="space-y-4">
                {cccdDisplay ? (
                  <div className="relative overflow-hidden rounded-xl border border-hairline-cloud">
                    <img
                      src={cccdDisplay}
                      alt="CCCD"
                      className="max-h-64 w-full object-contain bg-surface-press cursor-pointer transition hover:opacity-95"
                      onClick={() => {
                        setPreviewImage(cccdDisplay);
                        setPreviewAlt(`Ảnh CCCD của ${tenant?.fullName || 'khách thuê'}`);
                      }}
                    />
                    {cccdDisplay && tenant?.idCardImage && !idCardFile && onDeleteIdCard && (
                      <button
                        type="button"
                        onClick={handleDeleteIdCardImage}
                        disabled={uploading}
                        className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-accent-pink/90 px-2.5 py-1.5 text-xs font-semibold text-on-primary shadow hover:opacity-90"
                        title="Chỉ xóa ảnh CCCD"
                      >
                        <Trash2 size={14} />
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted">Chưa có ảnh CCCD</p>
                )}
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-hairline-cloud bg-surface-press/40 p-8 transition hover:border-accent-violet">
                  <Upload className="text-accent-violet-mid" size={28} />
                  <span className="text-sm font-medium text-ink-deep">Chọn ảnh CCCD</span>
                  <span className="text-xs text-muted">PNG, JPG — tối đa 5MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {idCardFile && (
                  <button
                    type="button"
                    onClick={handleUploadCccd}
                    disabled={uploading}
                    className="btn-primary w-full"
                  >
                    {uploading ? 'Đang tải lên…' : 'Lưu ảnh CCCD'}
                  </button>
                )}
              </div>
            )}

            {activeTab === 'history' && !isCreate && (
              <div className="space-y-3">
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-accent-violet" size={24} />
                  </div>
                ) : history.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">Chưa có lịch sử thuê phòng</p>
                ) : (
                  <ul className="space-y-2">
                    {history.map((h) => (
                      <li
                        key={h.contractId}
                        className="rounded-xl border border-hairline-cloud bg-ink-deep p-4 text-on-primary"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {h.buildingName && (
                              <p className="mb-1 flex items-center gap-1.5 text-xs text-on-dark-muted">
                                <Building2 size={12} />
                                {h.buildingName}
                              </p>
                            )}
                            <p className="font-semibold">
                              Phòng <span className="chip-lime text-ink-deep">{h.roomNumber}</span>
                            </p>
                          </div>
                          <span className="text-xs uppercase text-on-dark-muted">{h.status}</span>
                        </div>
                        <p className="mt-2 text-xs text-on-dark-muted">
                          {formatDate(h.startDate)} → {formatDate(h.endDate)}
                        </p>
                        <p className="mt-1 text-sm">
                          Cọc: <span className="font-medium text-accent-lime">{formatCurrency(h.deposit)}</span>
                        </p>
                        {h.notes && (
                          <p className="mt-2 border-t border-hairline-violet pt-2 text-xs text-on-dark-muted">
                            {h.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage}
        alt={previewAlt}
      />
    </aside>
  );
};

export default TenantManagementPanel;
