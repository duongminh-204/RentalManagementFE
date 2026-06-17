import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Ruler,
  Users,
  Zap,
  Droplets,
  Banknote,
  Package,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  StickyNote,
} from 'lucide-react';
import RoomStatusBadge from '../../../components/common/RoomStatusBadge';
import ImageModal from '../../../components/common/ImageModal';
import {
  formatCurrency,
  getRoomDisplayName,
  getDeviceStatusLabel,
} from '../utils/roomHelpers';

const InfoRow = ({ icon: Icon, label, value, highlight }) => (
  <div className="flex items-start gap-3 rounded-lg border border-hairline-cloud bg-surface-light px-4 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-press text-accent-violet">
      <Icon size={18} aria-hidden />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wide text-accent-violet-mid">{label}</p>
      <p
        className={`mt-0.5 text-base font-medium leading-snug ${
          highlight ? 'text-accent-violet' : 'text-ink-deep'
        }`}
      >
        {value}
      </p>
    </div>
  </div>
);

const ImageGallery = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  if (!images?.length) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-hairline-cloud bg-surface-press/80 text-center">
        <p className="text-sm font-medium text-muted">Chưa có ảnh phòng</p>
      </div>
    );
  }

  const current = images[index];
  const hasMultiple = images.length > 1;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hairline-cloud bg-ink-deep">
      <img
        src={current.url}
        alt={current.caption || `Ảnh phòng ${index + 1}`}
        className="h-52 w-full object-contain cursor-pointer transition hover:opacity-90"
        onClick={() => setShowImageModal(true)}
      />
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={current.url}
        alt={current.caption || `Ảnh phòng ${index + 1}`}
      />
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-primary/80 p-2 text-on-primary backdrop-blur-sm transition hover:bg-primary"
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary/80 p-2 text-on-primary backdrop-blur-sm transition hover:bg-primary"
            aria-label="Ảnh sau"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-6 bg-accent-lime' : 'w-1.5 bg-on-primary/50'
                }`}
                aria-label={`Xem ảnh ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const DevicesList = ({ devices }) => {
  if (!devices?.length) {
    return (
      <p className="rounded-lg border border-dashed border-hairline-cloud px-4 py-6 text-center text-sm text-muted">
        Chưa có thiết bị trong phòng
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hairline-cloud">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-hairline-cloud bg-surface-press">
            <th className="px-4 py-2.5 font-semibold text-ink-deep">Thiết bị</th>
            <th className="px-4 py-2.5 font-semibold text-ink-deep">SL</th>
            <th className="px-4 py-2.5 font-semibold text-ink-deep">Trạng thái</th>
            <th className="hidden px-4 py-2.5 font-semibold text-ink-deep sm:table-cell">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr
              key={device.deviceId ?? device.deviceName}
              className="border-b border-hairline-cloud last:border-0"
            >
              <td className="px-4 py-3 font-medium text-ink-deep">{device.deviceName}</td>
              <td className="px-4 py-3 text-muted">{device.quantity}</td>
              <td className="px-4 py-3">
                <span className="pill-violet text-xs">{getDeviceStatusLabel(device.status)}</span>
              </td>
              <td className="hidden px-4 py-3 text-muted sm:table-cell">{device.note || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserAvatar = ({ user, size = 'md' }) => {
  const initials = user.fullName
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-base';
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className={`${sizeClass} shrink-0 rounded-full border-2 border-accent-lime object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border-2 border-accent-lime bg-accent-violet-deep font-display font-bold`}
    >
      {initials || <User size={size === 'lg' ? 28 : 22} />}
    </div>
  );
};

const UsersList = ({ users }) => (
  <div>
    <div className="mb-3 flex items-center gap-2">
      <Users size={18} className="text-accent-violet" />
      <h3 className="font-display text-lg font-semibold text-ink-deep">Người thuê phòng</h3>
      {users?.length > 0 && <span className="pill-violet">{users.length}</span>}
    </div>
    {!users?.length ? (
      <p className="rounded-lg border border-dashed border-hairline-cloud px-4 py-6 text-center text-sm text-muted">
        Chưa có người thuê trong phòng
      </p>
    ) : (
      <ul className="space-y-3">
        {users.map((user) => (
          <li
            key={user.userId ?? user.fullName}
            className="flex items-center gap-4 rounded-xl border border-hairline-violet bg-ink-deep p-4 text-on-primary"
          >
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold leading-tight">{user.fullName}</p>
              {user.phone && <p className="mt-0.5 text-sm text-on-dark-muted">{user.phone}</p>}
              {user.email && <p className="text-sm text-on-dark-muted">{user.email}</p>}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const RoomDetailModal = ({ room, isOpen, onClose, onEdit, loading = false }) => {
  if (!room && !isOpen) return null;

  const displayName = room ? getRoomDisplayName(room) : '—';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="room-detail-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-transparent"
            onClick={onClose}
            aria-label="Đóng"
          />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex max-h-[min(90vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)]"
          >
            <div className="border-b border-hairline-cloud px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="eyebrow mb-1">Chi tiết phòng</p>
                  <h2
                    id="room-detail-title"
                    className="font-display text-2xl font-semibold leading-tight text-ink-deep sm:text-3xl"
                  >
                    <span className="chip-lime">{displayName}</span>
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {room && <RoomStatusBadge status={room.status} />}
                    {room?.buildingId != null && (
                      <span className="inline-flex items-center gap-1 rounded-xs bg-surface-press px-2 py-1 text-xs font-medium text-muted">
                        <Building2 size={12} />
                        Tòa #{room.buildingId}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-2 text-muted transition hover:bg-surface-press hover:text-ink-deep"
                  aria-label="Dong"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {loading ? (
                <motion.div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
                  <Loader2 size={32} className="animate-spin text-accent-violet" />
                  <p className="text-sm font-medium">Đang tải thông tin phòng…</p>
                </motion.div>
              ) : room ? (
                <div className="space-y-6">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Building2 size={18} className="text-accent-violet" />
                      <h3 className="font-display text-lg font-semibold text-ink-deep">Ảnh phòng</h3>
                      {room.roomImages?.length > 0 && (
                        <span className="pill-violet">{room.roomImages.length}</span>
                      )}
                    </div>
                    <ImageGallery images={room.roomImages} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      icon={Banknote}
                      label="Giá thuê / tháng"
                      value={formatCurrency(room.price ?? room.rentalPrice)}
                      highlight
                    />
                    <InfoRow
                      icon={Zap}
                      label="Giá điện"
                      value={`${formatCurrency(room.electricPrice ?? room.electricityPrice)} / kWh`}
                    />
                    <InfoRow
                      icon={Droplets}
                      label="Giá nước"
                      value={`${formatCurrency(room.waterPrice)} / m³`}
                    />
                    {room.area != null && (
                      <InfoRow icon={Ruler} label="Diện tích" value={`${room.area} m²`} />
                    )}
                    {room.maxPeople != null && (
                      <InfoRow icon={Users} label="Số người tối đa" value={room.maxPeople} />
                    )}
                  </div>

                  {room.description && (
                    <div className="rounded-xl border border-hairline-cloud bg-surface-press/60 p-4">
                      <div className="mb-2 flex items-center gap-2 text-accent-violet-mid">
                        <StickyNote size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Mô tả</span>
                      </div>
                      <p className="text-sm leading-relaxed text-ink-deep">{room.description}</p>
                    </div>
                  )}

                  <UsersList users={room.users} />

                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Package size={18} className="text-accent-violet" />
                      <h3 className="font-display text-lg font-semibold text-ink-deep">
                        Thiết bị trong phòng
                      </h3>
                      {room.devices?.length > 0 && (
                        <span className="pill-violet">{room.devices.length}</span>
                      )}
                    </div>
                    <DevicesList devices={room.devices} />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3 border-t border-hairline-cloud px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-hairline-cloud px-4 py-3 text-sm font-semibold text-ink-deep transition hover:bg-surface-press"
              >
                Đóng
              </button>
              {onEdit && room && (
                <button type="button" onClick={() => { onEdit(room); onClose(); }} className="btn-primary flex-1">
                  Chỉnh sửa
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoomDetailModal;
