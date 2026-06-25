import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Check, LoaderCircle, Sparkles, X } from 'lucide-react';
import { getPublicPackages } from '../../features/packages/api/packagesApi';
import { getMySubscription } from '../../features/packages/api/subscriptionsApi';
import { subscribeToPackage } from '../../features/packages/utils/subscribePackage';
import {
  estimateUpgradeFee,
  formatUpgradeFeeLabel,
  getCurrentPackage,
  isHigherPackage,
} from '../../features/packages/utils/packageUpgrade';
import {
  getStoredUser,
  hasOwnerPendingUpgrade,
  isOwnerRole,
  isOwnerSubscriptionActive,
  isOwnerSubscriptionPending,
} from '../../hooks/useAuth';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ/tháng';

const FALLBACK_PACKAGES = [
  {
    packageId: 0,
    packageName: 'Starter',
    roomRange: '<=20 phòng',
    price: 149000,
    recommended: false,
    features: ['Dashboard', 'Quản lý khách thuê', 'Điện nước & hoá đơn', 'Hợp đồng'],
  },
  {
    packageId: 0,
    packageName: 'PRO',
    roomRange: '21-50 phòng',
    price: 299000,
    recommended: true,
    features: ['Toàn bộ Starter', 'Báo cáo doanh thu & công nợ', 'Quản lý phương tiện', 'Hỗ trợ 24/7'],
  },
  {
    packageId: 0,
    packageName: 'PREMIUM',
    roomRange: '51-100 phòng',
    price: 599000,
    recommended: false,
    features: ['Toàn bộ PRO', 'AI decor phòng', 'Checklist pháp lý'],
  },
];

const PackagePricingModal = ({ open, onClose, highlightPackage }) => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState('');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const user = getStoredUser();
  const isLoggedIn = Boolean(user?.role);
  const isOwner = isOwnerRole(user?.role);
  const isActive = isOwnerSubscriptionActive(user);
  const isPending = isOwnerSubscriptionPending(user);
  const hasPendingUpgrade = hasOwnerPendingUpgrade(user);
  const currentPackageId = user?.packageId;
  const currentPackage = getCurrentPackage(packages, currentPackageId);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError('');
    getPublicPackages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPackages(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (isOwner && isOwnerSubscriptionActive(getStoredUser())) {
      getMySubscription()
        .then((data) => setSubscriptionEndDate(data?.endDate ?? null))
        .catch(() => {});
    } else {
      setSubscriptionEndDate(null);
    }
  }, [open, isOwner]);

  const handleSubscribe = async (packageId) => {
    if (!packageId) return;

    try {
      setSubmittingId(packageId);
      setError('');
      const result = await subscribeToPackage(packageId);
      onClose?.();
      if (String(result.status).toLowerCase() === 'active' && (result.isUpgrade ?? result.IsUpgrade)) {
        navigate('/dashboard');
      } else {
        navigate('/subscription/pending');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đăng ký gói. Vui lòng thử lại.');
    } finally {
      setSubmittingId(null);
    }
  };

  const renderPackageAction = (pkg) => {
    const registerLink = pkg.packageId
      ? `/register?role=owner&packageId=${pkg.packageId}`
      : '/register?role=owner';

    if (!isLoggedIn) {
      return (
        <Link to={registerLink} className="package-pricing-modal__cta" onClick={onClose}>
          Chọn gói {pkg.packageName}
        </Link>
      );
    }

    if (!isOwner) {
      return (
        <p className="package-pricing-modal__owner-note">
          Liên hệ quản trị viên để đăng ký gói <strong>{pkg.packageName}</strong>
        </p>
      );
    }

    if (isActive) {
      if (pkg.packageId && pkg.packageId === currentPackageId) {
        return <p className="package-pricing-modal__owner-note">Đây là gói bạn đang sử dụng</p>;
      }

      if (isHigherPackage(pkg, currentPackage)) {
        const estimatedFee = estimateUpgradeFee(pkg, currentPackage, subscriptionEndDate);
        const isSelectedPendingUpgrade =
          hasPendingUpgrade && user?.pendingPackageId === pkg.packageId;

        if (isSelectedPendingUpgrade) {
          return (
            <Link
              to="/subscription/pending"
              className="package-pricing-modal__cta"
              onClick={onClose}
            >
              Xem mã VietQR nâng cấp
            </Link>
          );
        }

        return (
          <button
            type="button"
            className="package-pricing-modal__cta"
            disabled={!pkg.packageId || submittingId === pkg.packageId}
            onClick={() => handleSubscribe(pkg.packageId)}
          >
            {submittingId === pkg.packageId ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              `Nâng cấp — ${formatUpgradeFeeLabel(estimatedFee)}`
            )}
          </button>
        );
      }

      return (
        <p className="package-pricing-modal__owner-note">
          Liên hệ admin để chuyển sang gói <strong>{pkg.packageName}</strong>
        </p>
      );
    }

    if (isPending && pkg.packageId === currentPackageId) {
      return (
        <Link
          to="/subscription/pending"
          className="package-pricing-modal__cta"
          onClick={onClose}
        >
          Xem mã VietQR thanh toán
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="package-pricing-modal__cta"
        disabled={!pkg.packageId || submittingId === pkg.packageId}
        onClick={() => handleSubscribe(pkg.packageId)}
      >
        {submittingId === pkg.packageId ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          `Đăng ký & thanh toán VietQR`
        )}
      </button>
    );
  };

  if (!open) return null;

  return createPortal(
    <div
      className="package-pricing-modal__overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="package-pricing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-pricing-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="package-pricing-modal__header">
          <div>
            <p className="package-pricing-modal__eyebrow">Bảng giá dịch vụ</p>
            <h2 id="package-pricing-title" className="package-pricing-modal__title">
              Chọn gói phù hợp quy mô trọ
            </h2>
            <p className="package-pricing-modal__subtitle">
              {isOwner
                ? isActive
                  ? 'Nâng cấp bất kỳ lúc nào — chỉ thanh toán phần chênh lệch theo số ngày còn lại của chu kỳ.'
                  : 'Chọn gói và quét VietQR để thanh toán — hệ thống tự kích hoạt sau khi nhận tiền.'
                : 'Đăng ký tài khoản → chọn gói → quét VietQR thanh toán.'}
            </p>
          </div>
          <button
            type="button"
            className="package-pricing-modal__close"
            aria-label="Đóng"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error ? (
          <div className="mx-6 mb-2 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="package-pricing-modal__grid">
            {packages.map((pkg) => {
              const isRecommended = pkg.recommended || pkg.packageName === 'PRO';
              const isHighlighted =
                highlightPackage && pkg.packageName?.toUpperCase() === highlightPackage.toUpperCase();

              return (
                <article
                  key={pkg.packageName}
                  className={`package-pricing-modal__card ${
                    isHighlighted ? 'package-pricing-modal__card--highlight' : ''
                  } ${isRecommended ? 'package-pricing-modal__card--recommended' : ''}`}
                >
                  {isHighlighted ? (
                    <span className="package-pricing-modal__badge package-pricing-modal__badge--need">
                      Cần gói này
                    </span>
                  ) : isRecommended ? (
                    <span className="package-pricing-modal__badge package-pricing-modal__badge--recommended">
                      <Sparkles className="h-3.5 w-3.5" />
                      Khuyên dùng
                    </span>
                  ) : null}

                  <h3 className="package-pricing-modal__plan">{pkg.packageName}</h3>
                  <p className="package-pricing-modal__range">{pkg.roomRange}</p>
                  <p className="package-pricing-modal__price">{formatPrice(pkg.price)}</p>

                  <ul className="package-pricing-modal__features">
                    {(pkg.features || []).map((feature) => (
                      <li key={feature}>
                        <Check className="h-4 w-4 shrink-0 text-accent-lime" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {renderPackageAction(pkg)}
                </article>
              );
            })}
          </div>
        )}

        {isLoggedIn && isOwner ? (
          <p className="package-pricing-modal__footer">
            Gói hiện tại: <strong>{user?.packageName || 'Chưa có'}</strong>
            {isPending ? (
              <>
                {' '}
                — <Link to="/subscription/pending" onClick={onClose}>Xem mã VietQR</Link>
              </>
            ) : null}
            {hasPendingUpgrade ? (
              <>
                {' '}
                — Đang chờ thanh toán nâng cấp lên <strong>{user?.pendingPackageName}</strong>.{' '}
                <Link to="/subscription/pending" onClick={onClose}>Xem VietQR</Link>
              </>
            ) : null}
            {highlightPackage ? (
              <>
                {' '}
                — Cần nâng lên <strong>{highlightPackage}</strong> trở lên để dùng tính năng này.
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
};

export default PackagePricingModal;
