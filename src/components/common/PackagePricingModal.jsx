import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Check, LoaderCircle, Sparkles, X } from 'lucide-react';
import { getPublicPackages } from '../../features/packages/api/packagesApi';
import { getStoredUser } from '../../hooks/useAuth';

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
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const isLoggedIn = Boolean(user?.role);

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
    getPublicPackages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPackages(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

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
              {isLoggedIn
                ? 'Liên hệ quản trị viên để nâng cấp gói. Sau khi admin kích hoạt, tính năng sẽ được mở khóa tự động.'
                : 'Đăng ký gói → Admin xác nhận → Mở khóa đúng tính năng trong gói bạn chọn.'}
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
              const registerLink = pkg.packageId
                ? `/register?role=owner&packageId=${pkg.packageId}`
                : '/register?role=owner';

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

                  {isLoggedIn ? (
                    <p className="package-pricing-modal__owner-note">
                      Liên hệ admin để nâng cấp lên gói <strong>{pkg.packageName}</strong>
                    </p>
                  ) : (
                    <Link to={registerLink} className="package-pricing-modal__cta" onClick={onClose}>
                      Chọn gói {pkg.packageName}
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {isLoggedIn ? (
          <p className="package-pricing-modal__footer">
            Gói hiện tại: <strong>{user?.packageName || 'Chưa có'}</strong>
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
