import { isOwnerRole, isOwnerSubscriptionPending } from '../../hooks/useAuth';

const PACKAGE_BADGE_CLASS = {
  STARTER: 'owner-package-badge--starter',
  PRO: 'owner-package-badge--pro',
  PREMIUM: 'owner-package-badge--premium',
};

const OwnerPackageBadge = ({ user, className = '' }) => {
  if (!isOwnerRole(user?.role) || !user?.packageName) return null;

  const normalized = String(user.packageName).trim().toUpperCase();
  const toneClass = PACKAGE_BADGE_CLASS[normalized] || 'owner-package-badge--default';
  const isPending = isOwnerSubscriptionPending(user);

  return (
    <span
      className={`owner-package-badge ${toneClass} ${isPending ? 'owner-package-badge--pending' : ''} ${className}`.trim()}
      title={isPending ? 'Gói đang chờ thanh toán hoặc kích hoạt' : `Gói ${user.packageName}`}
    >
      {user.packageName}
    </span>
  );
};

export default OwnerPackageBadge;
