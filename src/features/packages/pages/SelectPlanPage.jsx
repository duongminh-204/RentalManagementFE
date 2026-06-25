import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, LoaderCircle } from 'lucide-react';
import { getPublicPackages } from '../api/packagesApi';
import { requestSubscription } from '../api/subscriptionsApi';
import { getStoredUser, isOwnerRole } from '../../../hooks/useAuth';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ/tháng';

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getStoredUser();
    if (!isOwnerRole(user?.role)) {
      navigate('/', { replace: true });
      return;
    }
    if (user?.subscriptionStatus === 'Active') {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (user?.subscriptionStatus === 'Pending') {
      navigate('/dashboard', { replace: true });
      return;
    }

    getPublicPackages()
      .then((data) => setPackages(Array.isArray(data) ? data : []))
      .catch(() => setError('Không thể tải danh sách gói.'))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSelect = async (packageId) => {
    try {
      setSubmittingId(packageId);
      setError('');
      const subscription = await requestSubscription(packageId);
      const user = getStoredUser() || {};
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          subscriptionStatus: subscription.status,
          packageId: subscription.packageId,
          packageName: subscription.packageName,
        }),
      );
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi yêu cầu gói.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light px-5 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="eyebrow mb-2">Bước cuối</p>
          <h1 className="font-display text-3xl font-bold text-ink-deep">Chọn gói dịch vụ</h1>
          <p className="mt-3 text-muted">
            Chọn gói phù hợp quy mô trọ. Admin sẽ kích hoạt trước khi bạn dùng được hệ thống.
          </p>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div>
        ) : null}

        {loading ? (
          <div className="mt-12 flex justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <article
                key={pkg.packageId}
                className={`dashboard-section-card relative flex flex-col ${pkg.recommended ? 'ring-2 ring-accent-violet/30' : ''}`}
              >
                {pkg.recommended ? (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-violet px-3 py-1 text-xs font-semibold text-white">
                    Khuyên dùng
                  </span>
                ) : null}
                <h2 className="font-display text-xl font-bold text-ink-deep">{pkg.packageName}</h2>
                <p className="mt-1 text-sm text-accent-violet">{pkg.roomRange}</p>
                <p className="text-sm text-muted">{pkg.targetAudience}</p>
                <p className="mt-4 text-2xl font-bold">{formatPrice(pkg.price)}</p>
                <ul className="my-6 flex-1 space-y-2">
                  {(pkg.features || []).map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 text-accent-lime" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn-primary w-full justify-center"
                  disabled={submittingId === pkg.packageId}
                  onClick={() => handleSelect(pkg.packageId)}
                >
                  {submittingId === pkg.packageId ? 'Đang gửi...' : `Chọn ${pkg.packageName}`}
                </button>
              </article>
            ))}
          </div>
        )}

        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-sm text-muted">
          <Link to="/" className="font-medium text-ink-deep underline">
            Quay về trang chủ
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/dashboard" className="font-medium text-ink-deep underline">
            Vào hệ thống
          </Link>
        </p>
      </div>
    </div>
  );
}
