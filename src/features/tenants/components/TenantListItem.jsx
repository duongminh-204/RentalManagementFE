import React, { useState } from 'react';
import { User, Phone, Home } from 'lucide-react';
import ImageModal from '../../../components/common/ImageModal';
import {
  formatCCCD,
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
              if (tenant.avatar) {
                e.stopPropagation();
                setShowImageModal(true);
              }
            }}
            className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${
              tenant.avatar ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
            } ${
              selected ? 'bg-accent-lime text-ink-deep' : 'bg-accent-violet-deep text-on-primary'
            }`}
          >
            {tenant.avatar ? (
              <img src={tenant.avatar} alt="" className="h-full w-full object-contain" />
            ) : (
              tenant.fullName?.[0]?.toUpperCase() || <User size={20} />
            )}
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
        src={tenant.avatar}
        alt={tenant.fullName}
      />
    </>
  );
};

export default TenantListItem;
