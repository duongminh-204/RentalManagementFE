import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Home,
  Package,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import UserAvatar from '../../../components/common/UserAvatar';
import AdminSubscriptionAction from './AdminSubscriptionAction';
import {
  daysUntil,
  formatDate,
  roomUsagePercent,
  roomUsageTone,
  statusClass,
  subscriptionStatusLabel,
} from '../utils/adminHelpers';

const STATUS_ORDER = { Pending: 0, Active: 1, Suspended: 2, Expired: 3, Cancelled: 4 };

const sortSubscriptions = (subs) =>
  [...(subs || [])].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] ?? 99;
    const orderB = STATUS_ORDER[b.status] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0);
  });

const USAGE_BAR = {
  success: 'bg-[#22c55e]',
  warning: 'bg-[#f59e0b]',
  danger: 'bg-[#ef4444]',
};

const RoomUsageBar = ({ used, max }) => {
  const percent = roomUsagePercent(used, max);
  const tone = roomUsageTone(percent);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted">Sử dụng phòng</span>
        <span className={`font-semibold ${tone === 'danger' ? 'text-[#b4234a]' : 'text-ink-deep'}`}>
          {used}/{max} ({percent}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-press">
        <div
          className={`h-full rounded-full transition-all ${USAGE_BAR[tone]}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
};

const SubscriptionRow = ({
  sub,
  actionLoading,
  isPrimary,
  onActivate,
  onUpgrade,
  onDowngrade,
  onRenew,
  onCancel,
  onDelete,
}) => {
  const isPending = sub.status === 'Pending';
  const isActive = sub.status === 'Active';
  const daysLeft = isActive ? daysUntil(sub.endDate) : null;
  const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 14;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isPrimary
          ? isPending
            ? 'border-[#f0d9a8] bg-gradient-to-br from-[#fffaf0] to-white'
            : isActive
              ? 'border-[#c8ead6] bg-gradient-to-br from-[#f8fff9] to-white'
              : 'border-hairline-cloud bg-white'
          : 'border-hairline-cloud/80 bg-surface-press/20'
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-display text-base font-bold text-ink-deep">
              <Package className="h-4 w-4 text-accent-violet" />
              {sub.packageName}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(sub.status)}`}>
              {subscriptionStatusLabel(sub.status)}
            </span>
            {expiringSoon ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7e6] px-2.5 py-1 text-xs font-semibold text-[#b26a00]">
                <Clock3 className="h-3 w-3" />
                Còn {daysLeft} ngày
              </span>
            ) : null}
            {daysLeft !== null && daysLeft < 0 ? (
              <span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-xs font-semibold text-[#b4234a]">
                Quá hạn {Math.abs(daysLeft)} ngày
              </span>
            ) : null}
          </div>

          <RoomUsageBar used={sub.ownerRoomCount} max={sub.maxRooms} />

          <div className="grid gap-2 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-hairline-cloud/60">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
              <div>
                <p className="text-[11px] text-muted">Bắt đầu</p>
                <p className="text-sm font-semibold text-ink-deep">{formatDate(sub.startDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-hairline-cloud/60">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
              <div>
                <p className="text-[11px] text-muted">Kết thúc</p>
                <p className="text-sm font-semibold text-ink-deep">{formatDate(sub.endDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-hairline-cloud/60">
              <div>
                <p className="text-[11px] text-muted">Mã đăng ký</p>
                <p className="text-sm font-semibold text-ink-deep">#{sub.subscriptionId}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:min-w-[220px]">
          {isPending ? (
            <AdminSubscriptionAction
              variant="success"
              label="Kích hoạt ngay"
              disabled={actionLoading}
              onClick={() => onActivate(sub)}
              className="!h-10 w-full !justify-center !text-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
            </AdminSubscriptionAction>
          ) : null}

          {isActive || sub.status === 'Expired' || sub.status === 'Suspended' ? (
            <div className="grid grid-cols-2 gap-2">
              <AdminSubscriptionAction
                variant="default"
                label="Nâng cấp"
                disabled={actionLoading}
                onClick={() => onUpgrade(sub)}
                className="!justify-center"
              >
                <ArrowUp className="h-4 w-4" />
              </AdminSubscriptionAction>
              <AdminSubscriptionAction
                variant="warning"
                label="Gia hạn"
                disabled={actionLoading}
                onClick={() => onRenew(sub)}
                className="!justify-center"
              >
                <RefreshCw className="h-4 w-4" />
              </AdminSubscriptionAction>
              <AdminSubscriptionAction
                variant="default"
                label="Hạ cấp"
                disabled={actionLoading}
                onClick={() => onDowngrade(sub)}
                className="!justify-center"
              >
                <ArrowDown className="h-4 w-4" />
              </AdminSubscriptionAction>
              {isActive ? (
                <AdminSubscriptionAction
                  variant="danger"
                  label="Hủy gói"
                  disabled={actionLoading}
                  onClick={() => onCancel(sub)}
                  className="!justify-center"
                >
                  <XCircle className="h-4 w-4" />
                </AdminSubscriptionAction>
              ) : (
                <AdminSubscriptionAction
                  variant="danger"
                  label="Xóa"
                  disabled={actionLoading}
                  onClick={() => onDelete(sub)}
                  className="!justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </AdminSubscriptionAction>
              )}
            </div>
          ) : null}

          {!isPending && !isActive && sub.status !== 'Expired' && sub.status !== 'Suspended' ? (
            <AdminSubscriptionAction
              variant="danger"
              label="Xóa bản ghi"
              disabled={actionLoading}
              onClick={() => onDelete(sub)}
              className="!h-10 w-full !justify-center"
            >
              <Trash2 className="h-4 w-4" />
            </AdminSubscriptionAction>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const AdminOwnerSubscriptionsCard = ({
  group,
  actionLoading,
  onActivate,
  onUpgrade,
  onDowngrade,
  onRenew,
  onCancel,
  onDelete,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);

  const sorted = useMemo(() => sortSubscriptions(group.subscriptions), [group.subscriptions]);
  const primarySub = sorted.find((s) => s.status === 'Pending' || s.status === 'Active') || sorted[0];
  const historySubs = sorted.filter((s) => s.subscriptionId !== primarySub?.subscriptionId);

  const hasPending = group.subscriptions?.some((sub) => sub.status === 'Pending');
  const activeSub = group.subscriptions?.find((sub) => sub.status === 'Active');
  const overLimit = activeSub && group.ownerRoomCount > activeSub.maxRooms;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        hasPending ? 'border-[#f0d9a8] ring-1 ring-[#f0d9a8]/50' : 'border-hairline-cloud'
      }`}
    >
      <div
        className={`border-b px-5 py-4 ${
          hasPending ? 'bg-gradient-to-r from-[#fffaf0] via-white to-white' : 'bg-surface-press/30'
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar name={group.ownerName} size="md" className="!h-12 !w-12 ring-2 ring-white shadow-sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-display text-lg font-bold text-ink-deep">{group.ownerName}</h3>
                {hasPending ? (
                  <span className="rounded-full bg-[#fff7e6] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#b26a00]">
                    Cần duyệt
                  </span>
                ) : null}
              </div>
              <p className="truncate text-sm text-muted">{group.ownerEmail || `ID #${group.ownerId}`}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-deep shadow-sm ring-1 ring-hairline-cloud">
              <Home className="h-3.5 w-3.5 text-accent-violet" />
              {group.ownerRoomCount} phòng
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-deep shadow-sm ring-1 ring-hairline-cloud">
              <Package className="h-3.5 w-3.5 text-accent-violet" />
              {group.subscriptions?.length || 0} đăng ký
            </span>
            {overLimit ? (
              <span className="rounded-full bg-[#fff0f3] px-3 py-1.5 text-xs font-semibold text-[#b4234a] ring-1 ring-[#f5d0d8]">
                Vượt giới hạn phòng
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-5">
        {primarySub ? (
          <SubscriptionRow
            sub={primarySub}
            isPrimary
            actionLoading={actionLoading}
            onActivate={onActivate}
            onUpgrade={onUpgrade}
            onDowngrade={onDowngrade}
            onRenew={onRenew}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ) : null}

        {historySubs.length > 0 ? (
          <div>
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-dashed border-hairline-cloud px-4 py-2.5 text-sm font-semibold text-muted transition hover:border-accent-violet/40 hover:text-ink-deep"
            >
              <span>Lịch sử đăng ký ({historySubs.length})</span>
              {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {historyOpen ? (
              <div className="mt-3 space-y-3">
                {historySubs.map((sub) => (
                  <SubscriptionRow
                    key={sub.subscriptionId}
                    sub={sub}
                    isPrimary={false}
                    actionLoading={actionLoading}
                    onActivate={onActivate}
                    onUpgrade={onUpgrade}
                    onDowngrade={onDowngrade}
                    onRenew={onRenew}
                    onCancel={onCancel}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default AdminOwnerSubscriptionsCard;
