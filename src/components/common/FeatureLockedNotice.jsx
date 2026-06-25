import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, LockKeyhole } from 'lucide-react';
import PackagePricingModal from './PackagePricingModal';
import { getFeatureLockConfig } from '../../utils/featureLockConfig';

const variantStyles = {
  pending: {
    badge: 'Đang chờ admin',
    badgeClass: 'feature-locked-notice__badge--pending',
  },
  no_plan: {
    badge: 'Chưa có gói',
    badgeClass: 'feature-locked-notice__badge--pending',
  },
  upgrade: {
    badge: 'Chưa mở khóa',
    badgeClass: 'bg-accent-violet/10 text-accent-violet',
  },
};

const FeatureLockedNotice = ({
  variant = 'upgrade',
  featureKey,
  title,
  message,
  currentPackage,
  requiredPackage,
  featureLabel,
  actionLabel,
  actionPath,
  actionType,
  compact = false,
  fullPage = false,
}) => {
  const [pricingOpen, setPricingOpen] = useState(false);
  const config = getFeatureLockConfig(featureKey);
  const styles = variantStyles[variant] || variantStyles.upgrade;
  const Icon = config?.icon || LockKeyhole;
  const accentClass = config ? `feature-locked-notice--${config.accent}` : '';
  const featureClass = config ? `feature-locked-notice--feature-${config.key}` : '';
  const displayTitle = title || config?.title || 'Tính năng chưa được mở';
  const displayMessage = message || config?.description || 'Tính năng này chưa có trong gói dịch vụ hiện tại của bạn.';
  const displayLabel = featureLabel || config?.label;
  const displayRequired = requiredPackage || config?.requiredPackage;
  const isPricingAction = actionType === 'pricing' || actionPath === '/#pricing';
  const isExternalHash = actionPath?.startsWith('/#');
  const isInformational = variant === 'pending' || variant === 'no_plan';
  const showPreview = Boolean(config?.previewItems?.length) && !compact;

  const handleActionClick = () => {
    if (isPricingAction) {
      setPricingOpen(true);
      return;
    }

    if (isExternalHash) {
      window.location.href = actionPath;
      return;
    }
  };

  return (
    <>
      <div
        className={`feature-locked-notice feature-locked-notice--${variant} ${accentClass} ${featureClass} ${
          compact ? 'feature-locked-notice--compact' : ''
        } ${fullPage ? 'feature-locked-notice--full-page' : ''}`}
        role={isInformational ? 'status' : 'alert'}
        aria-live={isInformational ? 'polite' : 'assertive'}
      >
        <div className="feature-locked-notice__icon-wrap">
          <span className={`feature-locked-notice__icon feature-locked-notice__icon--${config?.accent || 'default'}`}>
            <Icon className="h-7 w-7" />
          </span>
          {showPreview ? (
            <div className="feature-locked-notice__preview" aria-hidden="true">
              <p className="feature-locked-notice__preview-label">Bạn sẽ có</p>
              <ul>
                {config.previewItems.map((item) => (
                  <li key={item}>
                    <Check className="h-3.5 w-3.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="feature-locked-notice__body">
          <div className="feature-locked-notice__meta">
            <span className={`feature-locked-notice__badge ${styles.badgeClass}`}>{styles.badge}</span>
            {displayLabel ? (
              <span className="feature-locked-notice__feature">{displayLabel}</span>
            ) : null}
          </div>

          <h3 className="feature-locked-notice__title">{displayTitle}</h3>
          {config?.subtitle && !compact ? (
            <p className="feature-locked-notice__subtitle">{config.subtitle}</p>
          ) : null}
          <p className="feature-locked-notice__message">{displayMessage}</p>

          {(currentPackage || displayRequired) && variant === 'upgrade' ? (
            <div className="feature-locked-notice__packages">
              {currentPackage ? (
                <span>
                  Gói hiện tại: <strong>{currentPackage}</strong>
                </span>
              ) : null}
              {displayRequired ? (
                <span>
                  Cần gói: <strong>{displayRequired}</strong> trở lên
                </span>
              ) : null}
            </div>
          ) : null}

          {currentPackage && variant === 'pending' ? (
            <p className="feature-locked-notice__packages">
              Gói đã chọn: <strong>{currentPackage}</strong>
            </p>
          ) : null}

          {actionLabel && (actionPath || isPricingAction) ? (
            isPricingAction ? (
              <button type="button" className="feature-locked-notice__action" onClick={handleActionClick}>
                {actionLabel}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : isExternalHash ? (
              <button type="button" className="feature-locked-notice__action" onClick={handleActionClick}>
                {actionLabel}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            ) : (
              <Link to={actionPath} className="feature-locked-notice__action">
                {actionLabel}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )
          ) : null}
        </div>
      </div>

      <PackagePricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        highlightPackage={displayRequired}
      />
    </>
  );
};

export default FeatureLockedNotice;
