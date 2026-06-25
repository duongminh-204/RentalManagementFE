import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3, LoaderCircle, Package } from 'lucide-react';
import { getMySubscription } from '../api/subscriptionsApi';
import { getStoredUser, isOwnerRole } from '../../../hooks/useAuth';

export default function SubscriptionPendingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!isOwnerRole(user?.role)) return;

    getMySubscription()
      .then((data) => {
        setSubscription(data);
        if (data?.status === 'Active') {
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...user,
              subscriptionStatus: data.status,
              packageId: data.packageId,
              packageName: data.packageName,
            }),
          );
          window.location.href = '/dashboard';
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const user = getStoredUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light px-5 py-12">
      <div className="dashboard-section-card max-w-lg text-center">
        {loading ? (
          <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-primary" />
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-violet/10 text-accent-violet">
              <Clock3 className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-deep">Đang chờ admin kích hoạt</h1>
            <p className="mt-3 text-muted">
              Yêu cầu gói của bạn đã được ghi nhận. Quản trị viên sẽ xem xét và mở khóa tính năng trong gói bạn đăng ký.
            </p>

            <div className="mt-6 rounded-xl bg-surface-press px-4 py-3 text-left text-sm">
              <div className="flex items-center gap-2 font-semibold text-ink-deep">
                <Package className="h-4 w-4" />
                {subscription?.packageName || user?.packageName || 'Chưa chọn gói'}
              </div>
              <p className="mt-2 text-muted">
                Trạng thái:{' '}
                <span className="font-semibold text-accent-violet">
                  {subscription?.status || user?.subscriptionStatus || 'Pending'}
                </span>
              </p>
            </div>

            <button
              type="button"
              className="dashboard-action-button mt-6"
              onClick={() => window.location.reload()}
            >
              Kiểm tra lại
            </button>

            <p className="mt-4 text-sm text-muted">
              <Link to="/" className="text-ink-deep underline">
                Về trang chủ
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
