import {
  Building2,
  Calendar,
  CreditCard,
  Home,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';
import UserAvatar from '../../../components/common/UserAvatar';
import { formatDate, formatDateTime, statusClass, subscriptionStatusLabel } from '../utils/adminHelpers';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-press text-muted">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 break-words text-sm font-medium text-ink-deep">{value || '—'}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-xl border border-hairline-cloud bg-surface-light px-4 py-3 ${accent}`}>
    <p className="text-xs font-medium text-muted">{label}</p>
    <p className="mt-1 text-2xl font-bold text-ink-deep">{value}</p>
  </div>
);

const IconAction = ({ title, onClick, disabled, children, variant = 'default' }) => {
  const variants = {
    default: 'border-hairline-cloud bg-white text-muted hover:border-accent-violet hover:text-accent-violet',
    danger: 'border-[#f5d0d8] bg-[#fff6f9] text-[#b4234a] hover:border-[#b4234a]',
    success: 'border-[#c8ead6] bg-[#f0faf4] text-[#1f7a45] hover:border-[#1f7a45]',
  };
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
    >
      {children}
    </button>
  );
};

const OwnerDetailPanel = ({ owner, loading, actionLoading, onClose, onEdit, onLock, onUnlock, onManagePassword, onDelete }) => {
  if (!owner) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Đóng" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline-cloud px-5 py-4">
          <h2 className="text-lg font-bold text-ink-deep">Chi tiết chủ trọ</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-press"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="flex items-center gap-4">
              <UserAvatar user={owner} size="lg" className="!h-20 !w-20 ring-4 ring-surface-press" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xl font-bold text-ink-deep">{owner.fullName}</h3>
                <p className="text-sm text-muted">ID #{owner.ownerId}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(owner.subscriptionStatus)}`}>
                    {subscriptionStatusLabel(owner.subscriptionStatus)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(owner.isActive ? 'Active' : 'Disabled')}`}>
                    {owner.isActive ? 'Tài khoản mở' : 'Tài khoản khóa'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <StatCard label="Tòa nhà" value={owner.buildingCount} accent="border-l-4 border-l-accent-violet" />
              <StatCard label="Phòng" value={owner.roomCount} accent="border-l-4 border-l-accent-lime" />
            </div>

            <div className="mt-6">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Thông tin liên hệ</h4>
              <div className="divide-y divide-hairline-cloud/70 rounded-xl border border-hairline-cloud px-3">
                <InfoRow icon={Mail} label="Email" value={owner.email} />
                <InfoRow icon={Phone} label="Số điện thoại" value={owner.phone} />
                <InfoRow icon={User} label="CCCD" value={owner.cccd} />
                <InfoRow icon={MapPin} label="Địa chỉ" value={owner.address} />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted">Gói đăng ký</h4>
              <div className="divide-y divide-hairline-cloud/70 rounded-xl border border-hairline-cloud px-3">
                <InfoRow icon={CreditCard} label="Gói hiện tại" value={owner.package} />
                <InfoRow icon={Calendar} label="Ngày bắt đầu" value={formatDate(owner.subscriptionStartDate)} />
                <InfoRow icon={Calendar} label="Ngày hết hạn" value={formatDate(owner.expiredDate)} />
                <InfoRow icon={Calendar} label="Ngày tạo tài khoản" value={formatDateTime(owner.createdDate)} />
                <InfoRow icon={Calendar} label="Cập nhật lần cuối" value={formatDateTime(owner.updatedAt)} />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-hairline-cloud px-5 py-4">
          <IconAction title="Chỉnh sửa" onClick={() => onEdit(owner)} disabled={actionLoading}>
            Sửa thông tin
          </IconAction>
          <IconAction title="Mật khẩu" onClick={() => onManagePassword(owner)} disabled={actionLoading}>
            <KeyRound className="h-3.5 w-3.5" /> Mật khẩu
          </IconAction>
          {owner.isActive ? (
            <IconAction title="Khóa tài khoản" variant="danger" disabled={actionLoading} onClick={() => onLock(owner.ownerId)}>
              <Lock className="h-3.5 w-3.5" /> Khóa
            </IconAction>
          ) : (
            <IconAction title="Mở khóa tài khoản" variant="success" disabled={actionLoading} onClick={() => onUnlock(owner.ownerId)}>
              <LockOpen className="h-3.5 w-3.5" /> Mở khóa
            </IconAction>
          )}
          {onDelete ? (
            <IconAction title="Xóa chủ trọ" variant="danger" disabled={actionLoading} onClick={() => onDelete(owner)}>
              Xóa
            </IconAction>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OwnerDetailPanel;
