import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, LoaderCircle, Sparkles } from 'lucide-react';
import { getPublicPackages } from '../../packages/api/packagesApi';

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
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPackages()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPackages(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="pricing" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Bảng giá</p>
          <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
            Chọn gói phù hợp <span className="text-accent-violet">quy mô trọ</span>
          </h2>
          <p className="mt-4 text-muted">
            Đăng ký gói → Admin xác nhận → Mở khóa đúng tính năng trong gói bạn chọn.
          </p>
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((pkg, index) => {
              const isRecommended = pkg.recommended || pkg.packageName === 'PRO';
              const registerLink = pkg.packageId
                ? `/register?role=owner&packageId=${pkg.packageId}`
                : '/register?role=owner';

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

                  <Link
                    to={registerLink}
                    className={`w-full text-center no-underline ${
                      isRecommended ? 'btn-primary' : 'dashboard-action-button justify-center'
                    }`}
                  >
                    Chọn gói {pkg.packageName}
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
          Sau khi đăng ký, hệ thống ghi nhận yêu cầu gói của bạn. Quản trị viên sẽ kích hoạt tài khoản để bạn sử dụng các tính năng tương ứng.
        </p>
      </div>
    </section>
  );
}
