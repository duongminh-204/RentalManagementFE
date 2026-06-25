import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Home,
  LoaderCircle,
  Mail,
  Package,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { getMySubscription } from '../api/subscriptionsApi';
import { getStoredUser, isOwnerRole } from '../../../hooks/useAuth';

const PENDING_STEPS = [
  {
    title: 'Đăng ký & chọn gói',
    description: 'Thông tin tài khoản và gói dịch vụ đã được ghi nhận.',
    done: true,
  },
  {
    title: 'Admin xem xét',
    description: 'Quản trị viên kiểm tra và kích hoạt gói cho tài khoản của bạn.',
    done: false,
  },
  {
    title: 'Bắt đầu sử dụng',
    description: 'Sau khi kích hoạt, bạn có thể dùng đúng tính năng trong gói đã chọn.',
    done: false,
  },
];

export default function SubscriptionPendingPage() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const refreshStatus = async () => {
    const user = getStoredUser();
    if (!isOwnerRole(user?.role)) return;

    try {
      setChecking(true);
      const data = await getMySubscription();
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
    } catch {
      // keep current UI state
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const user = getStoredUser();
  const packageName = subscription?.packageName || user?.packageName || 'Chưa chọn gói';
  const statusLabel = subscription?.status || user?.subscriptionStatus || 'Pending';
  const features = subscription?.features || [];

  return (
    <div className="page-content page-content--wide">
      <div className="subscription-pending-page__card w-full max-w-none">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted">Đang tải trạng thái đăng ký...</p>
          </div>
        ) : (
          <>
            <div className="subscription-pending-page__hero">
              <span className="subscription-pending-page__icon">
                <Clock3 className="h-8 w-8" />
              </span>
              <div>
                <p className="subscription-pending-page__eyebrow">Trạng thái tài khoản</p>
                <h1 className="subscription-pending-page__title">Đang chờ admin kích hoạt gói</h1>
                <p className="subscription-pending-page__subtitle">
                  Bạn vẫn có thể mở các trang quản lý từ menu bên trái, nhưng dữ liệu và tính năng
                  chỉ hoạt động sau khi admin kích hoạt gói.
                </p>
              </div>
            </div>

            <div className="subscription-pending-page__summary">
              <div className="subscription-pending-page__summary-item">
                <Package className="h-5 w-5 text-accent-violet" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Gói đã chọn</p>
                  <p className="text-lg font-bold text-ink-deep">{packageName}</p>
                </div>
              </div>
              <div className="subscription-pending-page__summary-item">
                <ShieldCheck className="h-5 w-5 text-[#b26a00]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trạng thái</p>
                  <p className="text-lg font-bold text-[#b26a00]">Chờ kích hoạt</p>
                  <p className="text-xs text-muted">Mã hệ thống: {statusLabel}</p>
                </div>
              </div>
            </div>

            {features.length > 0 ? (
              <div className="subscription-pending-page__features">
                <p className="mb-3 text-sm font-semibold text-ink-deep">
                  Tính năng sẽ được mở sau khi kích hoạt
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {features.map((feature) => (
                    <li key={feature} className="subscription-pending-page__feature-item">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-lime" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="subscription-pending-page__steps">
              <p className="mb-4 text-sm font-semibold text-ink-deep">Quy trình kích hoạt</p>
              <ol className="space-y-4">
                {PENDING_STEPS.map((step, index) => (
                  <li key={step.title} className="subscription-pending-page__step">
                    <span
                      className={`subscription-pending-page__step-index ${
                        step.done ? 'subscription-pending-page__step-index--done' : ''
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-ink-deep">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="subscription-pending-page__notice">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent-violet" />
              <p className="text-sm leading-6 text-muted">
                Sau khi admin kích hoạt, bấm <strong>Kiểm tra lại</strong> hoặc tải lại trang để vào
                dashboard với đầy đủ quyền theo gói <strong>{packageName}</strong>.
              </p>
            </div>

            <div className="subscription-pending-page__actions">
              <button
                type="button"
                className="btn-primary justify-center"
                disabled={checking}
                onClick={refreshStatus}
              >
                {checking ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Kiểm tra lại
                  </>
                )}
              </button>
              <Link to="/dashboard" className="dashboard-action-button justify-center no-underline">
                <Home className="h-4 w-4" />
                Vào tổng quan
              </Link>
              <Link to="/" className="dashboard-action-button justify-center no-underline">
                Về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
