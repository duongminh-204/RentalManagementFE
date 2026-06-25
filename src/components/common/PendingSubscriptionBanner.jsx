import { Link } from 'react-router-dom';
import { Clock3, RefreshCw } from 'lucide-react';
import { getStoredUser, isOwnerSubscriptionPending } from '../../hooks/useAuth';

const PendingSubscriptionBanner = () => {
  const user = getStoredUser();

  if (!isOwnerSubscriptionPending(user)) return null;

  return (
    <div className="pending-subscription-banner" role="status" aria-live="polite">
      <div className="pending-subscription-banner__content">
        <span className="pending-subscription-banner__icon" aria-hidden="true">
          <Clock3 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="pending-subscription-banner__eyebrow">Thông tin tài khoản</p>
          <p className="pending-subscription-banner__title">
            Gói {user?.packageName || 'dịch vụ'} đang chờ admin kích hoạt
          </p>
          <p className="pending-subscription-banner__text">
            Bạn vẫn duyệt được menu quản lý. Tính năng trong gói sẽ mở sau khi admin xác nhận.
          </p>
        </div>
        <Link to="/subscription/pending" className="pending-subscription-banner__link">
          <RefreshCw className="h-4 w-4" />
          Theo dõi
        </Link>
      </div>
    </div>
  );
};

export default PendingSubscriptionBanner;
