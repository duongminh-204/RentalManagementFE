import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Home,
  LoaderCircle,
  Package,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { getStoredUser } from '../../../hooks/useAuth';
import { useSubscriptionSync } from '../../../hooks/useSubscriptionSync';
import SubscriptionPaymentPanel from '../components/SubscriptionPaymentPanel';

const BASE_STEPS = [
  {
    title: 'Đăng ký & chọn gói',
    description: 'Thông tin tài khoản và gói dịch vụ đã được ghi nhận.',
  },
  {
    title: 'Thanh toán VietQR',
    description: 'Quét mã QR — app ngân hàng tự điền số tiền và nội dung chuyển khoản.',
  },
  {
    title: 'Bắt đầu sử dụng',
    description: 'Hệ thống tự kích hoạt gói ngay khi nhận được tiền.',
  },
];

export default function SubscriptionPendingPage() {
  const navigate = useNavigate();

  const { subscription, checking, initialized, refresh } = useSubscriptionSync({
    poll: true,
    onActivated: () => {
      navigate('/dashboard', { replace: true });
    },
  });

  const user = getStoredUser();
  const packageName = subscription?.packageName || user?.packageName || 'Chưa chọn gói';
  const statusLabel = subscription?.status || user?.subscriptionStatus || 'Pending';
  const features = subscription?.features || [];
  const isActive = String(statusLabel).toLowerCase() === 'active';

  const steps = useMemo(() => {
    const doneCount = isActive ? 3 : 1;
    return BASE_STEPS.map((step, index) => ({
      ...step,
      done: index < doneCount,
    }));
  }, [isActive]);

  return (
    <div className="page-content page-content--wide">
      <div className="subscription-pending-page__card w-full max-w-none">
        {!initialized ? (
          <div className="flex flex-col items-center py-16">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted">Đang tải trạng thái đăng ký...</p>
          </div>
        ) : (
          <>
            <div className="subscription-pending-page__hero">
              <span className={`subscription-pending-page__icon ${isActive ? 'subscription-pending-page__icon--active' : ''}`}>
                {isActive ? <CheckCircle2 className="h-8 w-8" /> : <Clock3 className="h-8 w-8" />}
              </span>
              <div>
                <p className="subscription-pending-page__eyebrow">Trạng thái tài khoản</p>
                <h1 className="subscription-pending-page__title">
                  {isActive ? 'Gói đã được kích hoạt' : 'Hoàn tất thanh toán để kích hoạt gói'}
                </h1>
                <p className="subscription-pending-page__subtitle">
                  {isActive
                    ? 'Bạn có thể sử dụng đầy đủ tính năng trong gói đã chọn.'
                    : 'Quét VietQR bên dưới và chuyển khoản. Hệ thống tự kiểm tra mỗi 15 giây.'}
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
                <ShieldCheck className={`h-5 w-5 ${isActive ? 'text-[#1f7a45]' : 'text-[#b26a00]'}`} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Trạng thái</p>
                  <p className={`text-lg font-bold ${isActive ? 'text-[#1f7a45]' : 'text-[#b26a00]'}`}>
                    {isActive ? 'Đang hoạt động' : 'Chờ thanh toán'}
                  </p>
                  <p className="text-xs text-muted">Mã hệ thống: {statusLabel}</p>
                </div>
              </div>
            </div>

            {!isActive ? <SubscriptionPaymentPanel /> : null}

            {features.length > 0 ? (
              <div className="subscription-pending-page__features">
                <p className="mb-3 text-sm font-semibold text-ink-deep">
                  {isActive ? 'Tính năng trong gói của bạn' : 'Tính năng sẽ được mở sau khi thanh toán'}
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
                {steps.map((step, index) => (
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

            <div className="subscription-pending-page__actions">
              {!isActive ? (
                <button
                  type="button"
                  className="btn-primary justify-center"
                  disabled={checking}
                  onClick={() => refresh(false)}
                >
                  {checking ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Kiểm tra thanh toán
                    </>
                  )}
                </button>
              ) : (
                <Link to="/dashboard" className="btn-primary justify-center no-underline">
                  <Home className="h-4 w-4" />
                  Vào tổng quan
                </Link>
              )}
              {!isActive ? (
                <Link to="/dashboard" className="dashboard-action-button justify-center no-underline">
                  <Home className="h-4 w-4" />
                  Duyệt menu
                </Link>
              ) : null}
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
