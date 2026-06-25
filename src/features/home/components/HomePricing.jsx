import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, LoaderCircle, Sparkles } from 'lucide-react';
import { getPublicPackages } from '../../packages/api/packagesApi';
import { subscribeToPackage } from '../../packages/utils/subscribePackage';
import {
  getStoredUser,
  isOwnerRole,
  isOwnerSubscriptionActive,
  isOwnerSubscriptionPending,
} from '../../../hooks/useAuth';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ/tháng';

const FALLBACK_PACKAGES = [
  {
    packageId: 0,
    packageName: 'Starter',
    roomRange: '<=20 phòng',
    targetAudience: 'Chủ trọ non-tech',
    price: 149000,
    recommended: false,
    features: [
      'Dashboard dữ liệu',
      'Quản lý khách thuê',
      'Quản lý điện nước & hoá đơn',
      'Quản lý hợp đồng',
      'Tạo hoá đơn thanh toán',
    ],
  },
  {
    packageId: 0,
    packageName: 'PRO',
    roomRange: '21-50 phòng',
    targetAudience: 'Chủ trọ đang mở rộng',
    price: 299000,
    recommended: true,
    features: [
      'Toàn bộ tính năng Starter',
      'Báo cáo doanh thu & công nợ',
      'Quản lý phương tiện người thuê',
      'Hỗ trợ 24/7',
    ],
  },
  {
    packageId: 0,
    packageName: 'PREMIUM',
    roomRange: '51-100 phòng',
    targetAudience: 'Quản lý chuyên nghiệp',
    price: 599000,
    recommended: false,
    features: [
      'Toàn bộ tính năng Pro',
      'AI decor phòng',
      'Checklist pháp lý',
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePricing() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState('');
  const user = getStoredUser();
  const isOwner = isOwnerRole(user?.role);
  const isActive = isOwnerSubscriptionActive(user);
  const isPending = isOwnerSubscriptionPending(user);
  const currentPackageId = user?.packageId;

  useEffect(() => {
    getPublicPackages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPackages(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (packageId) => {
    if (!packageId) return;

    try {
      setSubmittingId(packageId);
      setError('');
      await subscribeToPackage(packageId);
      navigate('/subscription/pending');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đăng ký gói. Vui lòng thử lại.');
    } finally {
      setSubmittingId(null);
    }
  };

  const renderPackageAction = (pkg, isRecommended) => {
    const registerLink = pkg.packageId
      ? `/register?role=owner&packageId=${pkg.packageId}`
      : '/register?role=owner';
    const buttonClass = `w-full text-center no-underline ${
      isRecommended ? 'btn-primary' : 'dashboard-action-button justify-center'
    }`;

    if (!isOwner) {
      return (
        <Link to={registerLink} className={buttonClass}>
          Chọn gói {pkg.packageName}
        </Link>
      );
    }

    if (isActive) {
      if (pkg.packageId && pkg.packageId === currentPackageId) {
        return (
          <span className={`${buttonClass} opacity-60 cursor-default`}>Gói hiện tại</span>
        );
      }
      return (
        <span className={`${buttonClass} opacity-60 cursor-default`}>
          Liên hệ admin để nâng cấp
        </span>
      );
    }

    if (isPending && pkg.packageId === currentPackageId) {
      return (
        <Link to="/subscription/pending" className={buttonClass}>
          Xem mã VietQR thanh toán
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={buttonClass}
        disabled={!pkg.packageId || submittingId === pkg.packageId}
        onClick={() => handleSubscribe(pkg.packageId)}
      >
        {submittingId === pkg.packageId ? 'Đang xử lý...' : 'Đăng ký & thanh toán VietQR'}
      </button>
    );
  };

  return (
    <section id="pricing" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Bảng giá</p>
          <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
            Chọn gói phù hợp <span className="text-accent-violet">quy mô trọ</span>
          </h2>
          <p className="mt-4 text-muted">
            {isOwner
              ? 'Chọn gói và quét VietQR để thanh toán — hệ thống tự kích hoạt sau khi nhận tiền.'
              : 'Đăng ký tài khoản → chọn gói → quét VietQR thanh toán.'}
          </p>
        </div>

        {error ? (
          <div className="mx-auto mt-6 max-w-xl rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((pkg, index) => {
              const isRecommended = pkg.recommended || pkg.packageName === 'PRO';

              return (
                <motion.article
                  key={pkg.packageName}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.08 }}
                  className={`home-feature-card relative flex flex-col ${
                    isRecommended ? 'home-feature-card--violet ring-2 ring-accent-violet/30' : ''
                  }`}
                >
                  {isRecommended ? (
                    <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent-violet px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-3.5 w-3.5" />
                      Khuyên dùng
                    </span>
                  ) : null}

                  <div className="mb-6">
                    <h3 className="font-display text-2xl font-bold text-ink-deep">{pkg.packageName}</h3>
                    <p className="mt-1 text-sm font-semibold text-accent-violet">{pkg.roomRange}</p>
                    <p className="mt-1 text-sm text-muted">{pkg.targetAudience}</p>
                    <p className="mt-4 font-display text-3xl font-bold text-ink-deep">
                      {formatPrice(pkg.price)}
                    </p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3">
                    {(pkg.features || []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-ink-deep">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-lime" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {renderPackageAction(pkg, isRecommended)}
                </motion.article>
              );
            })}
          </div>
        )}

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
          {isPending ? (
            <>
              Bạn đang chờ thanh toán.{' '}
              <Link to="/subscription/pending" className="font-medium text-ink-deep underline">
                Xem mã VietQR
              </Link>
            </>
          ) : (
            'Sau khi chuyển khoản, hệ thống tự kích hoạt gói trong vài phút — không cần admin xác nhận thủ công.'
          )}
        </p>
      </div>
    </section>
  );
}
