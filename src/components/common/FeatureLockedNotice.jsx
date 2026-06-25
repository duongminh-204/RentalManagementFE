import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock3, LockKeyhole, Sparkles } from 'lucide-react';

const variantStyles = {
  pending: {
    icon: Clock3,
    iconWrap: 'feature-locked-notice__icon--pending',
    badge: 'Đang chờ admin',
    badgeClass: 'feature-locked-notice__badge--pending',
  },
  no_plan: {
    icon: LockKeyhole,
    iconWrap: 'feature-locked-notice__icon--pending',
    badge: 'Chưa có gói',
    badgeClass: 'feature-locked-notice__badge--pending',
  },
  upgrade: {
    icon: Sparkles,
    iconWrap: 'bg-accent-lime/15 text-[#4a7c1b]',
    badge: 'Chưa mở khóa',
    badgeClass: 'bg-accent-violet/10 text-accent-violet',
  },
};

const FeatureLockedNotice = ({
  variant = 'upgrade',
  title,
  message,
  currentPackage,
  requiredPackage,
  featureLabel,
  actionLabel,
  actionPath,
  compact = false,
}) => {
  const styles = variantStyles[variant] || variantStyles.upgrade;
  const Icon = styles.icon;
  const isExternalHash = actionPath?.startsWith('/#');

  const isInformational = variant === 'pending' || variant === 'no_plan';

  return (
    <div
      className={`feature-locked-notice feature-locked-notice--${variant} ${compact ? 'feature-locked-notice--compact' : ''}`}
      role={isInformational ? 'status' : 'alert'}
      aria-live={isInformational ? 'polite' : 'assertive'}
    >
      <div className="feature-locked-notice__icon-wrap">
        <span className={`feature-locked-notice__icon ${styles.iconWrap}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>

      <div className="feature-locked-notice__body">
        <div className="feature-locked-notice__meta">
          <span className={`feature-locked-notice__badge ${styles.badgeClass}`}>{styles.badge}</span>
          {featureLabel ? (
            <span className="feature-locked-notice__feature">{featureLabel}</span>
          ) : null}
        </div>

        <h3 className="feature-locked-notice__title">{title}</h3>
        <p className="feature-locked-notice__message">{message}</p>

        {(currentPackage || requiredPackage) && variant === 'upgrade' ? (
          <div className="feature-locked-notice__packages">
            {currentPackage ? (
              <span>
                Gói hiện tại: <strong>{currentPackage}</strong>
              </span>
            ) : null}
            {requiredPackage ? (
              <span>
                Cần gói: <strong>{requiredPackage}</strong> trở lên
              </span>
            ) : null}
          </div>
        ) : null}

        {currentPackage && variant === 'pending' ? (
          <p className="feature-locked-notice__packages">
            Gói đã chọn: <strong>{currentPackage}</strong>
          </p>
        ) : null}

        {actionLabel && actionPath ? (
          isExternalHash ? (
            <a href={actionPath} className="feature-locked-notice__action">
              {actionLabel}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <Link to={actionPath} className="feature-locked-notice__action">
              {actionLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )
        ) : null}
      </div>
    </div>
  );
};

export default FeatureLockedNotice;
