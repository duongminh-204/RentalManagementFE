import { useState, useEffect } from 'react';
import ImageModal from '../../../components/common/ImageModal';
import {
  X,
  Car,
  ImageIcon,
  Link2,
  Save,
  Loader2,
  Upload,
  Trash2,
  Calendar,
  Banknote,
  Home,
  User,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import {
  validateLicensePlate,
  VEHICLE_TYPES,
  VEHICLE_BRANDS,
  VEHICLE_COLORS,
  formatLicensePlate,
  formatCurrency,
  formatDate,
  calculateParkingDays,
  getVehicleStatusBadgeClass,
  getVehicleStatusLabel,
  getVehicleTypeLabel,
} from '../utils/vehicleHelpers';
import { resolveMediaUrl } from '../../rooms/utils/roomHelpers';
import DateInput from '../../../components/common/DateInput';
import { toApiDate } from '../../../utils/dateHelpers';

const TABS = [
  { id: 'info', label: 'Thông tin', icon: Car },
  { id: 'link', label: 'Liên kết', icon: Link2 },
  { id: 'photo', label: 'Ảnh xe', icon: ImageIcon },
];

const emptyForm = () => ({
  licensePlate: '',
  type: 'motorcycle',
  brand: '',
  color: '',
  registrationDate: '',
  parkingFee: '',
  tenantId: '',
  roomId: '',
  notes: '',
  status: 'active',
});

const VehicleManagementPanel = ({
  vehicle,
  mode = 'edit',
  tenants = [],
  rooms = [],
  loading = false,
  onClose,
  onSave,
  onDelete,
  onUploadImage,
  saveLoading = false,
  saveError = null,
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState(emptyForm());
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [localError, setLocalError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');

  const isCreate = mode === 'create';
  const vehicleId = vehicle?.id;

  useEffect(() => {
    if (vehicle && !isCreate) {
      setForm({
        licensePlate: vehicle.licensePlate || '',
        type: vehicle.type || 'motorcycle',
        brand: vehicle.brand || '',
        color: vehicle.color || '',
        registrationDate: toApiDate(vehicle.registrationDate),
        parkingFee: vehicle.parkingFee ?? '',
        tenantId: vehicle.tenantId ? String(vehicle.tenantId) : '',
        roomId: vehicle.roomId ? String(vehicle.roomId) : '',
        notes: vehicle.notes || '',
        status: vehicle.status || 'active',
      });
      setImagePreview(resolveMediaUrl(vehicle.imageUrl));
    } else if (isCreate) {
      setForm(emptyForm());
      setImagePreview(null);
      setActiveTab('info');
    }
    setImageFile(null);
    setValidationErrors({});
  }, [vehicle, isCreate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((p) => ({ ...p, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.licensePlate.trim()) {
      errors.licensePlate = 'Vui lòng nhập biển số';
    } else if (!validateLicensePlate(form.licensePlate)) {
      errors.licensePlate = 'Biển số không hợp lệ';
    }
    if (!form.brand.trim()) errors.brand = 'Vui lòng nhập hãng xe';
    if (!form.color) errors.color = 'Vui lòng chọn màu';
    if (!form.registrationDate) errors.registrationDate = 'Vui lòng chọn ngày đăng ký';
    if (!form.parkingFee && form.parkingFee !== 0) {
      errors.parkingFee = 'Vui lòng nhập phí gửi xe';
    } else if (Number(form.parkingFee) < 0) {
      errors.parkingFee = 'Phí phải là số dương';
    }
    if (form.status === 'active') {
      if (!form.tenantId) errors.tenantId = 'Chọn khách thuê';
      if (!form.roomId) errors.roomId = 'Chọn phòng';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave?.(
      {
        ...form,
        licensePlate: form.licensePlate.trim().toUpperCase(),
        parkingFee: Number(form.parkingFee),
        tenantId: form.tenantId || null,
        roomId: form.roomId || null,
      },
      imageFile
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalError('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalError('Ảnh tối đa 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setLocalError(null);
  };

  const handleUploadPhoto = async () => {
    if (!imageFile || !vehicleId) return;
    setUploading(true);
    setLocalError(null);
    try {
      await onUploadImage?.(vehicleId, imageFile);
      setImageFile(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Lỗi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const brandOptions = VEHICLE_BRANDS[form.type] || [];
  const parkingDays = vehicle ? calculateParkingDays(vehicle.registrationDate) : 0;
  const isUnknown = form.status === 'unknown' || (!form.tenantId && !isCreate);

  if (!vehicle && !isCreate) {
    return (
      <aside className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-2xl border border-dashed border-hairline-cloud bg-surface-press/50 p-8 text-center lg:min-h-[600px]">
        <Car className="mb-4 text-accent-violet-mid" size={40} />
        <p className="font-display text-lg font-semibold text-ink-deep">Chọn xe để quản lý</p>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Chọn một xe bên trái hoặc bấm + để đăng ký xe mới. Theo dõi xe lạ, phí gửi và liên kết phòng–khách thuê.
        </p>
      </aside>
    );
  }

  const displayImage = imagePreview || resolveMediaUrl(vehicle?.imageUrl);

  return (
    <aside className="flex h-full max-h-[calc(100vh-10rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)] lg:min-h-[600px]">
      <div className="border-b border-hairline-cloud bg-ink-deep px-5 py-4 text-on-primary">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div
              onClick={() => {
                if (displayImage) {
                  setModalImageSrc(displayImage);
                  setShowImageModal(true);
                }
              }}
              className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline-violet bg-on-dark-faint ${
                displayImage ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
              }`}
            >
              {displayImage ? (
                <img src={displayImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <Car size={28} className="text-accent-lime" />
              )}
            </div>
            <div className="min-w-0">
              <p className="eyebrow text-on-dark-muted">Quản lý xe</p>
              <h2 className="truncate font-display text-xl font-semibold font-mono tracking-wide">
                {isCreate ? 'Đăng ký xe mới' : formatLicensePlate(vehicle?.licensePlate)}
              </h2>
              {!isCreate && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${getVehicleStatusBadgeClass(vehicle?.status)}`}
                  >
                    {getVehicleStatusLabel(vehicle?.status)}
                  </span>
                  <span className="text-xs text-on-dark-muted">{getVehicleTypeLabel(vehicle?.type)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            {!isCreate && vehicleId && (
              <button
                type="button"
                onClick={() => onDelete?.(vehicleId)}
                className="rounded-md p-2 text-accent-pink hover:bg-on-dark-faint"
                title="Xóa xe"
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

        {!isCreate && vehicle && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-hairline-violet/40 pt-3">
            <div className="rounded-lg bg-on-dark-faint px-2 py-2 text-center">
              <p className="text-[10px] uppercase text-on-dark-muted">Phí/tháng</p>
              <p className="text-xs font-semibold text-accent-lime">{formatCurrency(vehicle.parkingFee)}</p>
            </div>
            <div className="rounded-lg bg-on-dark-faint px-2 py-2 text-center">
              <p className="text-[10px] uppercase text-on-dark-muted">Đã gửi</p>
              <p className="text-xs font-semibold">{parkingDays} ngày</p>
            </div>
            <div className="rounded-lg bg-on-dark-faint px-2 py-2 text-center">
              <p className="text-[10px] uppercase text-on-dark-muted">Đăng ký</p>
              <p className="text-xs font-semibold">{formatDate(vehicle.registrationDate) || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {isUnknown && !isCreate && (
        <div className="flex items-start gap-2 border-b border-accent-pink/30 bg-accent-pink/10 px-4 py-2.5 text-sm text-ink-deep">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-accent-pink" />
          <p>Xe lạ — cần gán khách thuê và phòng trong tab Liên kết.</p>
        </div>
      )}

      <nav className="flex gap-1 overflow-x-auto border-b border-hairline-cloud bg-surface-press/50 px-2 py-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const disabled = isCreate && id === 'photo';
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                activeTab === id
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

            {(activeTab === 'info' || activeTab === 'link') && (
              <form onSubmit={handleSave} className="space-y-4">
                {activeTab === 'info' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                          Biển số *
                        </label>
                        <input
                          name="licensePlate"
                          value={form.licensePlate}
                          onChange={handleChange}
                          className="text-input font-mono uppercase"
                          placeholder="30A-12345"
                        />
                        {validationErrors.licensePlate && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.licensePlate}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                          Loại xe *
                        </label>
                        <select name="type" value={form.type} onChange={handleChange} className="text-input">
                          {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                          Hãng xe *
                        </label>
                        {brandOptions.length > 0 ? (
                          <select name="brand" value={form.brand} onChange={handleChange} className="text-input">
                            <option value="">— Chọn hãng —</option>
                            {brandOptions.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input name="brand" value={form.brand} onChange={handleChange} className="text-input" />
                        )}
                        {validationErrors.brand && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.brand}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                          Màu xe *
                        </label>
                        <select name="color" value={form.color} onChange={handleChange} className="text-input">
                          <option value="">— Chọn màu —</option>
                          {VEHICLE_COLORS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {validationErrors.color && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.color}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                          <Calendar size={12} /> Ngày đăng ký *
                        </label>
                        <DateInput
                          name="registrationDate"
                          value={form.registrationDate}
                          onChange={handleChange}
                          className="text-input"
                        />
                        {validationErrors.registrationDate && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.registrationDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                          <Banknote size={12} /> Phí gửi (VNĐ/tháng) *
                        </label>
                        <input
                          type="number"
                          name="parkingFee"
                          value={form.parkingFee}
                          onChange={handleChange}
                          className="text-input"
                          min="0"
                          step="1000"
                        />
                        {validationErrors.parkingFee && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.parkingFee}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
                        Trạng thái
                      </label>
                      <select name="status" value={form.status} onChange={handleChange} className="text-input">
                        <option value="active">Đang gửi</option>
                        <option value="inactive">Ngừng gửi</option>
                        <option value="unknown">Xe lạ</option>
                      </select>
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
                        className="text-input resize-none"
                        placeholder="Ghi chú bảo vệ, vị trí đỗ…"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'link' && (
                  <div className="rounded-xl border border-hairline-violet/30 bg-ink-deep/5 p-4">
                    <p className="eyebrow mb-3 text-accent-violet-mid">Liên kết phòng & khách</p>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                          <User size={12} /> Khách thuê {form.status === 'active' && '*'}
                        </label>
                        <select name="tenantId" value={form.tenantId} onChange={handleChange} className="text-input">
                          <option value="">— Chọn khách —</option>
                          {tenants.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.fullName}
                            </option>
                          ))}
                        </select>
                        {validationErrors.tenantId && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.tenantId}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase text-accent-violet-mid">
                          <Home size={12} /> Phòng {form.status === 'active' && '*'}
                        </label>
                        <select name="roomId" value={form.roomId} onChange={handleChange} className="text-input">
                          <option value="">— Chọn phòng —</option>
                          {rooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              Phòng {r.roomNumber || r.roomName}
                            </option>
                          ))}
                        </select>
                        {validationErrors.roomId && (
                          <p className="mt-1 text-xs text-accent-pink">{validationErrors.roomId}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={saveLoading} className="btn-primary w-full">
                  {saveLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang lưu…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {isCreate ? 'Đăng ký xe' : 'Lưu thay đổi'}
                    </>
                  )}
                </button>
              </form>
            )}

            {activeTab === 'photo' && !isCreate && (
              <div className="space-y-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-hairline-cloud bg-surface-press/50 px-4 py-10 transition hover:border-accent-violet-mid hover:bg-surface-press">
                  <Upload size={28} className="mb-2 text-accent-violet-mid" />
                  <p className="text-sm font-medium text-ink-deep">Chọn ảnh xe</p>
                  <p className="mt-1 text-xs text-muted">JPG, PNG — tối đa 5MB</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {displayImage && (
                  <img
                    src={displayImage}
                    alt="Xe"
                    className="w-full max-h-64 rounded-xl border border-hairline-cloud object-cover cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => {
                      setModalImageSrc(displayImage);
                      setShowImageModal(true);
                    }}
                  />
                )}

                {imageFile && (
                  <button
                    type="button"
                    onClick={handleUploadPhoto}
                    disabled={uploading}
                    className="btn-primary w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Đang tải lên…
                      </>
                    ) : (
                      <>
                        <Upload size={16} /> Tải ảnh lên
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={modalImageSrc}
        alt="Vehicle Photo"
      />
    </aside>
  );
};

export default VehicleManagementPanel;
