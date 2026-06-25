import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, LoaderCircle, Package, X } from 'lucide-react';

const formatPriceShort = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ/tháng';

const AdminChangePackageModal = ({
  open,
  mode,
  subscriptionId,
  currentPackageId,
  packages,
  loading,
  onClose,
  onSubmit,
}) => {
  const [selectedId, setSelectedId] = useState('');

  if (!open) return null;

  const isUpgrade = mode === 'upgrade';
  const sortedPackages = [...packages].sort((a, b) => a.maxRooms - b.maxRooms);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedId) return;
    onSubmit(Number(selectedId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-hairline-cloud bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline-cloud px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-violet/10 px-3 py-1 text-xs font-semibold text-accent-violet">
              {isUpgrade ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
              {isUpgrade ? 'Nâng cấp gói' : 'Hạ cấp gói'}
            </div>
            <h2 className="mt-2 font-display text-xl font-bold text-ink-deep">
              Chọn gói mới
            </h2>
            <p className="mt-1 text-sm text-muted">
              Đăng ký #{subscriptionId} — chọn gói phù hợp với nhu cầu chủ trọ.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-press hover:text-ink-deep"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {sortedPackages.map((pkg) => {
              const isCurrent = pkg.packageId === currentPackageId;
              const isSelected = String(pkg.packageId) === String(selectedId);
              const disabled = isCurrent;

              return (
                <button
                  key={pkg.packageId}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedId(String(pkg.packageId))}
                  className={`relative rounded-xl border p-4 text-left transition-all ${
                    disabled
                      ? 'cursor-not-allowed border-hairline-cloud bg-surface-press/40 opacity-60'
                      : isSelected
                        ? 'border-accent-violet bg-accent-violet/5 ring-2 ring-accent-violet/20'
                        : 'border-hairline-cloud bg-white hover:border-accent-violet/40 hover:shadow-sm'
                  }`}
                >
                  {isCurrent ? (
                    <span className="absolute right-3 top-3 rounded-full bg-surface-press px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                      Hiện tại
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-accent-violet text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}

                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-accent-violet" />
                    <p className="font-semibold text-ink-deep">{pkg.packageName}</p>
                  </div>
                  <p className="mt-2 text-lg font-bold text-ink-deep">{formatPriceShort(pkg.price)}</p>
                  <p className="mt-1 text-sm text-muted">Tối đa {pkg.maxRooms} phòng</p>
                  {pkg.roomRange ? (
                    <p className="mt-1 text-xs font-medium text-accent-violet">{pkg.roomRange}</p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-hairline-cloud px-6 py-4">
          <button
            type="button"
            className="dashboard-action-button !w-auto !min-w-0"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={loading || !selectedId}
            className="dashboard-action-button dashboard-action-button--primary !w-auto !min-w-0"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Xác nhận {isUpgrade ? 'nâng cấp' : 'hạ cấp'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminChangePackageModal;
