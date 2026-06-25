import { useCallback, useEffect, useMemo, useState } from 'react';
import { Clock3, LoaderCircle, Search } from 'lucide-react';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminPagination from '../components/AdminPagination';
import AdminOwnerSubscriptionsCard from '../components/AdminOwnerSubscriptionsCard';
import FilterSelect from '../../../components/common/FilterSelect';
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

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'Pending', label: 'Chờ duyệt' },
  { value: 'Active', label: 'Đang hoạt động' },
  { value: 'Expired', label: 'Hết hạn' },
  { value: 'Cancelled', label: 'Đã hủy' },
  { value: 'Suspended', label: 'Tạm ngưng' },
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
      setGroups((data.items || []).map(normalizeGroup));
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải đăng ký.');
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    load();
    getAdminPackages({ pageSize: 100, isEnabled: true }).then((data) => setPackages(data.items || [])).catch(() => {});
  }, [load]);

  const allSubscriptions = useMemo(
    () => groups.flatMap((group) => group.subscriptions || []),
    [groups],
  );

  const stats = useMemo(() => {
    const pending = allSubscriptions.filter((sub) => sub.status === 'Pending').length;
    const active = allSubscriptions.filter((sub) => sub.status === 'Active').length;
    const overLimit = allSubscriptions.filter((sub) => sub.ownerRoomCount > sub.maxRooms).length;
    return { owners: groups.length, pending, active, overLimit };
  }, [groups, allSubscriptions]);

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

  const handleChangePackage = async (event) => {
    event.preventDefault();
    const packageId = Number(new FormData(event.target).get('packageId'));
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
        title="Quản lý đăng ký"
        description="Mỗi chủ trọ hiển thị trong một khối với danh sách gói đăng ký của họ. Kích hoạt, hủy hoặc xóa từng gói riêng biệt."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-hairline-cloud border-l-4 border-l-accent-violet bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Chủ trọ (trang này)</p>
          <p className="mt-1 font-display text-3xl font-bold text-accent-violet">{stats.owners}</p>
        </div>
        <div className="rounded-2xl border border-hairline-cloud border-l-4 border-l-[#b26a00] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Chờ kích hoạt</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#b26a00]">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-hairline-cloud border-l-4 border-l-[#1f7a45] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Đang hoạt động</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#1f7a45]">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-hairline-cloud border-l-4 border-l-[#b4234a] bg-white px-5 py-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Vượt giới hạn</p>
          <p className="mt-1 font-display text-3xl font-bold text-[#b4234a]">{stats.overLimit}</p>
        </div>
      </div>

      <div className="dashboard-section-card">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-xl border border-hairline-cloud bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-violet"
              placeholder="Tìm theo tên hoặc email chủ trọ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <FilterSelect
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            className="lg:w-56"
          />
        </div>

        {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
        {message ? <div className="mb-4 rounded-xl bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-[#1f7a45]">{message}</div> : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Clock3 className="mb-3 h-10 w-10 text-muted" />
            <p className="font-semibold text-ink-deep">Không có đăng ký nào</p>
            <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc hoặc tìm kiếm khác.</p>
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
                onUpgrade={(sub) => setChangeTarget({ subscriptionId: sub.subscriptionId, mode: 'upgrade' })}
                onDowngrade={(sub) => setChangeTarget({ subscriptionId: sub.subscriptionId, mode: 'downgrade' })}
                onRenew={(sub) => runAction(() => renewAdminSubscription(sub.subscriptionId), 'Đã gia hạn gói.')}
                onCancel={handleCancel}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {changeTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleChangePackage}
            className="w-full max-w-md rounded-2xl border border-hairline-cloud bg-white p-6 shadow-xl"
          >
            <h2 className="font-display text-xl font-bold text-ink-deep">
              {changeTarget.mode === 'upgrade' ? 'Nâng cấp gói' : 'Hạ cấp gói'}
            </h2>
            <p className="mt-1 text-sm text-muted">Chọn gói mới cho đăng ký #{changeTarget.subscriptionId}</p>
            <select
              name="packageId"
              required
              className="mt-4 w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
            >
              <option value="">Chọn gói mới</option>
              {packages.map((pkg) => (
                <option key={pkg.packageId} value={pkg.packageId}>
                  {pkg.packageName} — {pkg.maxRooms} phòng
                </option>
              ))}
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="dashboard-action-button !w-auto !min-w-0" onClick={() => setChangeTarget(null)}>
                Huỷ
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="dashboard-action-button dashboard-action-button--primary !w-auto !min-w-0"
              >
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDeleteDialog />
    </div>
  );
};

export default AdminSubscriptionsPage;
