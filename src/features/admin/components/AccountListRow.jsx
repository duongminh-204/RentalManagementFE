import {
  Building2,
  Eye,
  Home,
  KeyRound,
  Lock,
  LockOpen,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
} from 'lucide-react';
import UserAvatar from '../../../components/common/UserAvatar';
import { formatDate, formatDateTime, roleLabel, statusClass, subscriptionStatusLabel } from '../utils/adminHelpers';

const IconBtn = ({ title, onClick, disabled, children, danger }) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
      danger
        ? 'border-[#f5d0d8] bg-[#fff6f9] text-[#b4234a] hover:border-[#b4234a]'
        : 'border-hairline-cloud bg-white text-muted hover:border-accent-violet hover:text-accent-violet'
    }`}
  >
    {children}
  </button>
);

const AccountListRow = ({
  account,
  actionLoading,
  onView,
  onEdit,
  onLock,
  onUnlock,
  onManagePassword,
  onDelete,
}) => (
  <tr className="border-b border-hairline-cloud/60 transition-colors hover:bg-surface-press/30">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <UserAvatar user={account} size="lg" className="!h-11 !w-11" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-deep">{account.fullName}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
            <Mail className="h-3 w-3 shrink-0" />
            {account.email || '—'}
          </p>
          {account.phoneNumber ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <Phone className="h-3 w-3 shrink-0" />
              {account.phoneNumber}
            </p>
          ) : null}
        </div>
      </div>
    </td>
    <td className="max-w-[14rem] px-4 py-3">
      {account.address ? (
        <p className="flex items-start gap-1 text-xs text-muted" title={account.address}>
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-2">{account.address}</span>
        </p>
      ) : (
        <span className="text-xs text-muted">—</span>
      )}
    </td>
    <td className="px-4 py-3">
      <span className="inline-flex rounded-lg bg-surface-press px-2.5 py-1 text-xs font-semibold text-ink-deep">
        {roleLabel(account.role)}
      </span>
    </td>
    <td className="px-4 py-3">
      {account.isOwner ? (
        <span className="inline-flex rounded-lg bg-surface-press px-2.5 py-1 text-xs font-semibold text-ink-deep">
          {account.package || '—'}
        </span>
      ) : (
        <span className="text-xs text-muted">—</span>
      )}
    </td>
    <td className="px-4 py-3">
      {account.isOwner ? (
        <>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(account.subscriptionStatus)}`}>
            {subscriptionStatusLabel(account.subscriptionStatus)}
          </span>
          {!account.isActive ? (
            <span className={`ml-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass('Disabled')}`}>
              Khóa
            </span>
          ) : null}
        </>
      ) : (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(account.isActive ? 'Active' : 'Disabled')}`}>
          {account.isActive ? 'Hoạt động' : 'Đã khóa'}
        </span>
      )}
    </td>
    <td className="px-4 py-3">
      {account.isOwner ? (
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {account.buildingCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            {account.roomCount ?? 0}
          </span>
        </div>
      ) : (
        <span className="text-xs text-muted">—</span>
      )}
    </td>
    <td className="px-4 py-3 text-sm text-muted">{formatDateTime(account.createdAt)}</td>
    <td className="px-4 py-3 text-sm text-muted">
      {account.isOwner ? formatDate(account.expiredDate) : '—'}
    </td>
    <td className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-1">
        {account.isOwner ? (
          <>
            <IconBtn title="Xem chi tiết" onClick={() => onView(account)}>
              <Eye className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Sửa" onClick={() => onEdit(account)}>
              <Pencil className="h-4 w-4" />
            </IconBtn>
          </>
        ) : null}
        {!account.isAdmin ? (
          <>
            {account.isActive ? (
              <IconBtn title="Khóa tài khoản" danger disabled={actionLoading} onClick={() => onLock(account)}>
                <Lock className="h-4 w-4" />
              </IconBtn>
            ) : (
              <IconBtn title="Mở khóa tài khoản" disabled={actionLoading} onClick={() => onUnlock(account)}>
                <LockOpen className="h-4 w-4" />
              </IconBtn>
            )}
            <IconBtn title="Mật khẩu" disabled={actionLoading} onClick={() => onManagePassword(account)}>
              <KeyRound className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Xóa" danger disabled={actionLoading} onClick={() => onDelete(account)}>
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </>
        ) : null}
      </div>
    </td>
  </tr>
);

export default AccountListRow;
