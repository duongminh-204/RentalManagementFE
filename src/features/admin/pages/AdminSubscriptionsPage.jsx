import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import AdminOwnerSubscriptionsCard from '../components/AdminOwnerSubscriptionsCard';
import AdminChangePackageModal from '../components/AdminChangePackageModal';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import {
  activateAdminSubscription,
  cancelAdminSubscription,
  deleteAdminSubscription,
  downgradeAdminSubscription,
  getAdminPackages,
  getAdminSubscriptionsGrouped,
  renewAdminSubscription,
  upgradeAdminSubscription,
} from '../api/adminApi';

const STATUS_FILTERS = [
  { value: '', label: 'Tất cả', icon: Users },
  { value: 'Pending', label: 'Chờ duyệt', icon: Clock3 },
  { value: 'Active', label: 'Đang hoạt động', icon: CheckCircle2 },
  { value: 'Expired', label: 'Hết hạn', icon: AlertTriangle },
  { value: 'Cancelled', label: 'Đã hủy', icon: RefreshCw },
  { value: 'Suspended', label: 'Tạm ngưng', icon: AlertTriangle },
];

const normalizeGroup = (raw) => ({
  ownerId: raw.ownerId ?? raw.OwnerId,
  ownerName: raw.ownerName ?? raw.OwnerName ?? '',
  ownerEmail: raw.ownerEmail ?? raw.OwnerEmail ?? '',
  ownerRoomCount: raw.ownerRoomCount ?? raw.OwnerRoomCount ?? 0,
  subscriptions: (raw.subscriptions ?? raw.Subscriptions ?? []).map((sub) => ({
    subscriptionId: sub.subscriptionId ?? sub.SubscriptionId,
    ownerId: sub.ownerId ?? sub.OwnerId,
    ownerName: sub.ownerName ?? sub.OwnerName ?? '',
    packageId: sub.packageId ?? sub.PackageId,
    packageName: sub.packageName ?? sub.PackageName ?? '',
    startDate: sub.startDate ?? sub.StartDate,
    endDate: sub.endDate ?? sub.EndDate,
    status: sub.status ?? sub.Status ?? '',
    ownerRoomCount: sub.ownerRoomCount ?? sub.OwnerRoomCount ?? 0,
    maxRooms: sub.maxRooms ?? sub.MaxRooms ?? 0,
    createdAt: sub.createdAt ?? sub.CreatedAt,
  })),
});

const sortGroups = (groups) =>
  [...groups].sort((a, b) => {
    const score = (g) => {
      const subs = g.subscriptions || [];
      if (subs.some((s) => s.status === 'Pending')) return 0;
      if (subs.some((s) => s.status === 'Active')) return 1;
      return 2;
    };
    return score(a) - score(b);
  });

const AdminSubscriptionsPage = () => {
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const [groups, setGroups] = useState([]);
  const [packages, setPackages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [changeTarget, setChangeTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminSubscriptionsGrouped({ status, search, page, pageSize: 8 });
      setGroups(sortGroups((data.items || []).map(normalizeGroup)));
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải đăng ký.');
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    load();
    getAdminPackages({ pageSize: 100, isEnabled: true })
      .then((data) => setPackages(data.items || []))
      .catch(() => {});
  }, [load]);

  const changeTargetSub = useMemo(() => {
    if (!changeTarget) return null;
    for (const group of groups) {
      const sub = group.subscriptions?.find((s) => s.subscriptionId === changeTarget.subscriptionId);
      if (sub) return sub;
    }
    return null;
  }, [changeTarget, groups]);

  const runAction = async (fn, successMessage) => {
    try {
      setActionLoading(true);
      setError('');
      await fn();
      setChangeTarget(null);
      if (successMessage) setMessage(successMessage);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Thao tác thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePackage = async (packageId) => {
    if (!changeTarget || !packageId) return;
    await runAction(
      () =>
        changeTarget.mode === 'upgrade'
          ? upgradeAdminSubscription(changeTarget.subscriptionId, packageId)
          : downgradeAdminSubscription(changeTarget.subscriptionId, packageId),
      changeTarget.mode === 'upgrade' ? 'Đã nâng cấp gói.' : 'Đã hạ cấp gói.',
    );
  };

  const handleDelete = async (sub) => {
    const confirmed = await confirmDelete({
      title: 'Xóa đăng ký gói',
      targetLabel: `${sub.packageName} — ${sub.ownerName}`,
      description: 'Bản ghi đăng ký và lịch sử thanh toán liên quan sẽ bị xóa vĩnh viễn.',
      consequences: ['Không thể hoàn tác sau khi xóa.'],
      confirmLabel: 'Xóa đăng ký',
    });
    if (!confirmed) return;

    await runAction(() => deleteAdminSubscription(sub.subscriptionId), 'Đã xóa đăng ký gói.');
  };

  const handleCancel = async (sub) => {
    const confirmed = await confirmDelete({
      title: 'Hủy đăng ký đang hoạt động',
      targetLabel: `${sub.packageName} — ${sub.ownerName}`,
      description: 'Gói sẽ chuyển sang trạng thái Đã hủy. Sau đó bạn có thể xóa bản ghi nếu cần.',
      consequences: ['Chủ trọ sẽ mất quyền dùng gói này.'],
      confirmLabel: 'Hủy đăng ký',
    });
    if (!confirmed) return;

    await runAction(() => cancelAdminSubscription(sub.subscriptionId), 'Đã hủy đăng ký.');
  };

  return (
    <div className="page-content page-content--wide">
      <AdminPageHeader
        title="Quản lý đăng ký gói"
        description="Duyệt, kích hoạt, nâng cấp và gia hạn gói dịch vụ cho chủ trọ. Ưu tiên xử lý các đăng ký đang chờ duyệt."
      >
        <button
          type="button"
          className="dashboard-action-button !w-auto !min-w-0"
          onClick={load}
          disabled={loading}
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Làm mới
        </button>
      </AdminPageHeader>

      <div className="dashboard-section-card">
        <div className="mb-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-xl border border-hairline-cloud bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-accent-violet focus:ring-2 focus:ring-accent-violet/15"
              placeholder="Tìm theo tên hoặc email chủ trọ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(({ value, label, icon: Icon }) => {
              const active = status === value;
              return (
                <button
                  key={value || 'all'}
                  type="button"
                  onClick={() => {
                    setStatus(value);
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-accent-violet text-white shadow-sm'
                      : 'bg-surface-press/60 text-muted hover:bg-surface-press hover:text-ink-deep'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-[#f5d0d8] bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-xl border border-[#c8ead6] bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-[#1f7a45]">
            {message}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline-cloud bg-surface-press/20 py-16 text-center">
            <Clock3 className="mb-3 h-10 w-10 text-muted" />
            <p className="font-semibold text-ink-deep">Không có đăng ký nào</p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Thử đổi bộ lọc trạng thái hoặc tìm kiếm với từ khóa khác.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group) => (
              <AdminOwnerSubscriptionsCard
                key={group.ownerId}
                group={group}
                actionLoading={actionLoading}
                onActivate={(sub) =>
                  runAction(
                    () => activateAdminSubscription(sub.subscriptionId),
                    `Đã kích hoạt gói ${sub.packageName} cho ${group.ownerName}.`,
                  )
                }
                onUpgrade={(sub) =>
                  setChangeTarget({ subscriptionId: sub.subscriptionId, mode: 'upgrade' })
                }
                onDowngrade={(sub) =>
                  setChangeTarget({ subscriptionId: sub.subscriptionId, mode: 'downgrade' })
                }
                onRenew={(sub) => runAction(() => renewAdminSubscription(sub.subscriptionId), 'Đã gia hạn gói.')}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminChangePackageModal
        open={Boolean(changeTarget)}
        mode={changeTarget?.mode}
        subscriptionId={changeTarget?.subscriptionId}
        currentPackageId={changeTargetSub?.packageId}
        packages={packages}
        loading={actionLoading}
        onClose={() => setChangeTarget(null)}
        onSubmit={handleChangePackage}
      />

      <ConfirmDeleteDialog />
    </div>
  );
};

export default AdminSubscriptionsPage;
