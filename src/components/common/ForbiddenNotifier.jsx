import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import FeatureLockedNotice from './FeatureLockedNotice';
import { resolveForbiddenNotice } from '../../utils/apiError';
import { getStoredUser, isOwnerRole, isOwnerSubscriptionActive } from '../../hooks/useAuth';

const ForbiddenNotifier = () => {
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const handleForbidden = (event) => {
      const user = getStoredUser();
      if (isOwnerRole(user?.role) && !isOwnerSubscriptionActive(user)) {
        return;
      }

      const detail = event.detail || {};
      const notice = resolveForbiddenNotice(
        {
          response: { status: 403, data: { message: detail.message } },
          config: { url: detail.url },
        },
        { path: window.location.pathname, user },
      );

      if (!notice || notice.variant === 'no_plan') return;

      setNotice(notice);
    };

    window.addEventListener('forbidden', handleForbidden);
    return () => window.removeEventListener('forbidden', handleForbidden);
  }, []);

  if (!notice) return null;

  return (
    <div className="forbidden-notifier">
      <div className="forbidden-notifier__panel">
        <button
          type="button"
          className="forbidden-notifier__close"
          aria-label="Đóng thông báo"
          onClick={() => setNotice(null)}
        >
          <X className="h-4 w-4" />
        </button>
        <FeatureLockedNotice {...notice} compact />
      </div>
    </div>
  );
};

export default ForbiddenNotifier;
