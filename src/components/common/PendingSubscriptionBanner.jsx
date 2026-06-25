import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3 } from 'lucide-react';
import { getStoredUser, isOwnerSubscriptionPending } from '../../hooks/useAuth';
import { useSubscriptionSync } from '../../hooks/useSubscriptionSync';

const PendingSubscriptionBanner = () => {
  const [user, setUser] = useState(getStoredUser);
  const [justActivated, setJustActivated] = useState(false);

  useSubscriptionSync({
    poll: isOwnerSubscriptionPending(user),
    onActivated: () => {
      setJustActivated(true);
      setUser(getStoredUser());
      window.setTimeout(() => setJustActivated(false), 8000);
    },
  });

  useEffect(() => {
    const refresh = () => setUser(getStoredUser());
    window.addEventListener('storage', refresh);
    window.addEventListener('user-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('user-updated', refresh);
    };
  }, []);

  if (justActivated) {
    return (
      <div className="pending-subscription-banner pending-subscription-banner--active" role="status" aria-live="polite">
        <div className="pending-subscription-banner__content">
          <span className="pending-subscription-banner__icon pending-subscription-banner__icon--active" aria-hidden="true">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="pending-subscription-banner__eyebrow">Gói đã được kích hoạt</p>
            <p className="pending-subscription-banner__title">
              Gói {user?.packageName || 'dịch vụ'} đã sẵn sàng — bạn có thể dùng đầy đủ tính năng.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            Hệ thống tự kiểm tra trạng thái mỗi 15 giây. Tính năng sẽ mở ngay khi admin xác nhận.
          </p>
        </div>
        <Link to="/subscription/pending" className="pending-subscription-banner__link">
          Chi tiết
        </Link>
      </div>
    </div>
  );
};

export default PendingSubscriptionBanner;
