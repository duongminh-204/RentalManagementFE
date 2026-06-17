import React, { useState } from 'react';
import { Phone, Home, Building2 } from 'lucide-react';
import ImageModal from '../../../components/common/ImageModal';
import {
  formatCCCD,
  getDefaultAvatar,
  getTenantStatusBadgeClass,
  getTenantStatusLabel,
} from '../utils/tenantHelpers';

const TenantListItem = ({ tenant, selected, onClick }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => onClick?.(tenant)}
        className={`w-full rounded-xl border p-4 text-left transition ${
          selected
            ? 'border-accent-violet bg-ink-deep text-on-primary shadow-[var(--shadow-card)]'
            : 'border-hairline-cloud bg-surface-light hover:border-accent-violet-mid hover:bg-surface-press/60'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(true);
            }}
            className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${
              tenant.avatar || getDefaultAvatar()
                ? 'cursor-pointer hover:opacity-90 transition-opacity'
                : ''
            } ${
              selected ? 'border border-accent-lime/60' : 'border border-hairline-cloud'
            }`}
          >
            <img
              src={tenant.avatar || getDefaultAvatar()}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = getDefaultAvatar();
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className={`truncate font-semibold ${selected ? 'text-on-primary' : 'text-ink-deep'}`}>
                {tenant.fullName}
              </p>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getTenantStatusBadgeClass(tenant.status)}`}
              >
                {getTenantStatusLabel(tenant.status)}
              </span>
            </div>
            {tenant.phoneNumber && (
              <p className={`mt-1 flex items-center gap-1.5 text-xs ${selected ? 'text-on-dark-muted' : 'text-muted'}`}>
                <Phone size={12} />
                {tenant.phoneNumber}
              </p>
            )}
            {tenant.buildingName && (
              <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${selected ? 'text-on-dark-muted' : 'text-muted'}`}>
                <Building2 size={12} />
                <span className="truncate">{tenant.buildingName}</span>
              </p>
            )}
            {tenant.roomNumber && (
              <p className={`mt-0.5 flex items-center gap-1.5 text-xs ${selected ? 'text-on-dark-muted' : 'text-muted'}`}>
                <Home size={12} />
                Phòng {tenant.roomNumber}
              </p>
            )}
            {tenant.cccd && (
              <p className={`mt-0.5 text-xs ${selected ? 'text-on-dark-faint' : 'text-muted'}`}>
                CCCD {formatCCCD(tenant.cccd)}
              </p>
            )}
          </div>
        </div>
      </button>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={tenant.avatar || getDefaultAvatar()}
        alt={tenant.fullName}
      />
    </>
  );
};

export default TenantListItem;
