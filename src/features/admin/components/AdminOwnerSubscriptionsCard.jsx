import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Home,
  Package,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import UserAvatar from '../../../components/common/UserAvatar';
import AdminSubscriptionAction from './AdminSubscriptionAction';
import { formatDate, statusClass, subscriptionStatusLabel } from '../utils/adminHelpers';

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
  const hasPending = group.subscriptions?.some((sub) => sub.status === 'Pending');
  const activeSub = group.subscriptions?.find((sub) => sub.status === 'Active');
  const overLimit = activeSub && group.ownerRoomCount > activeSub.maxRooms;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        hasPending ? 'border-[#f0d9a8]' : 'border-hairline-cloud'
      }`}
    >
      <div
        className={`border-b px-5 py-4 ${
          hasPending ? 'bg-gradient-to-r from-[#fffaf0] to-white' : 'bg-surface-press/35'
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <UserAvatar name={group.ownerName} size="md" className="!h-12 !w-12 ring-2 ring-white" />
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-bold text-ink-deep">{group.ownerName}</h3>
              <p className="truncate text-sm text-muted">{group.ownerEmail || `ID #${group.ownerId}`}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-deep ring-1 ring-hairline-cloud">
              <Home className="h-3.5 w-3.5 text-accent-violet" />
              {group.ownerRoomCount} phòng
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-deep ring-1 ring-hairline-cloud">
              <Package className="h-3.5 w-3.5 text-accent-violet" />
              {group.subscriptions?.length || 0} đăng ký
            </span>
            {overLimit ? (
              <span className="rounded-full bg-[#fff0f3] px-3 py-1 text-xs font-semibold text-[#b4234a]">
                Vượt giới hạn phòng
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="divide-y divide-hairline-cloud/70">
        {(group.subscriptions || []).map((sub) => {
          const isPending = sub.status === 'Pending';
          const isActive = sub.status === 'Active';
          const subOverLimit = sub.ownerRoomCount > sub.maxRooms;

          return (
            <div
              key={sub.subscriptionId}
              className={`px-5 py-4 ${isPending ? 'bg-[#fffdf7]' : ''}`}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted">#{sub.subscriptionId}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(sub.status)}`}>
                      {subscriptionStatusLabel(sub.status)}
                    </span>
                    {subOverLimit ? (
                      <span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-xs font-semibold text-[#b4234a]">
                        Vượt giới hạn
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 font-semibold text-ink-deep">{sub.packageName}</p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl bg-surface-press/50 px-3 py-2">
                      <p className="text-xs text-muted">Phòng / giới hạn</p>
                      <p className="text-sm font-bold text-ink-deep">
                        {sub.ownerRoomCount}/{sub.maxRooms}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface-press/50 px-3 py-2">
                      <p className="text-xs text-muted">Bắt đầu</p>
                      <p className="text-sm font-bold text-ink-deep">{formatDate(sub.startDate)}</p>
                    </div>
                    <div className="rounded-xl bg-surface-press/50 px-3 py-2">
                      <p className="text-xs text-muted">Kết thúc</p>
                      <p className="text-sm font-bold text-ink-deep">{formatDate(sub.endDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 xl:max-w-md xl:justify-end">
                  {isPending ? (
                    <AdminSubscriptionAction
                      variant="success"
                      label="Kích hoạt"
                      disabled={actionLoading}
                      onClick={() => onActivate(sub)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </AdminSubscriptionAction>
                  ) : null}

                  {isActive || sub.status === 'Expired' || sub.status === 'Suspended' ? (
                    <>
                      <AdminSubscriptionAction
                        variant="default"
                        label="Nâng cấp"
                        disabled={actionLoading}
                        onClick={() => onUpgrade(sub)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </AdminSubscriptionAction>
                      <AdminSubscriptionAction
                        variant="default"
                        label="Hạ cấp"
                        disabled={actionLoading}
                        onClick={() => onDowngrade(sub)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </AdminSubscriptionAction>
                      <AdminSubscriptionAction
                        variant="warning"
                        label="Gia hạn"
                        disabled={actionLoading}
                        onClick={() => onRenew(sub)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </AdminSubscriptionAction>
                    </>
                  ) : null}

                  {isActive ? (
                    <AdminSubscriptionAction
                      variant="danger"
                      label="Hủy"
                      disabled={actionLoading}
                      onClick={() => onCancel(sub)}
                    >
                      <XCircle className="h-4 w-4" />
                    </AdminSubscriptionAction>
                  ) : (
                    <AdminSubscriptionAction
                      variant="danger"
                      label="Xóa"
                      disabled={actionLoading}
                      onClick={() => onDelete(sub)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </AdminSubscriptionAction>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default AdminOwnerSubscriptionsCard;
