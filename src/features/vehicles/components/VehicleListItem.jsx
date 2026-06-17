import React, { useState } from 'react';
import { Car, Home, User, Banknote, AlertTriangle } from 'lucide-react';
import ImageModal from '../../../components/common/ImageModal';
import {
  formatCurrency,
  formatLicensePlate,
  getVehicleStatusBadgeClass,
  getVehicleStatusLabel,
  getVehicleTypeLabel,
} from '../utils/vehicleHelpers';
import { resolveMediaUrl } from '../../rooms/utils/roomHelpers';

const VehicleListItem = ({ vehicle, tenant, room, selected, onClick }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const isUnknown = vehicle.status === 'unknown' || !vehicle.tenantId;
  const imageUrl = resolveMediaUrl(vehicle.imageUrl);

  return (
    <>
    <button
      type="button"
      onClick={() => onClick?.(vehicle)}
      className={`w-full rounded-xl border p-3 text-left transition ${
        selected
          ? 'border-accent-violet bg-ink-deep text-on-primary shadow-[var(--shadow-card)]'
          : isUnknown
            ? 'border-accent-pink/50 bg-accent-pink/5 hover:border-accent-pink hover:bg-accent-pink/10'
            : 'border-hairline-cloud bg-surface-light hover:border-accent-violet-mid hover:bg-surface-press/60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          onClick={(e) => {
            if (imageUrl) {
              e.stopPropagation();
              setShowImageModal(true);
            }
          }}
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${
            imageUrl ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
          } ${
            selected ? 'border-hairline-violet bg-on-dark-faint' : 'border-hairline-cloud bg-surface-press'
          }`}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <Car size={22} className={selected ? 'text-accent-lime' : 'text-accent-violet'} />
          )}
          {isUnknown && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-pink text-on-primary">
              <AlertTriangle size={11} />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`truncate font-mono text-sm font-bold tracking-wide ${
                selected ? 'text-on-primary' : 'text-ink-deep'
              }`}
            >
              {formatLicensePlate(vehicle.licensePlate)}
            </p>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getVehicleStatusBadgeClass(vehicle.status)}`}
            >
              {getVehicleStatusLabel(vehicle.status)}
            </span>
          </div>

          <p className={`mt-0.5 text-xs ${selected ? 'text-on-dark-muted' : 'text-muted'}`}>
            {getVehicleTypeLabel(vehicle.type)}
            {vehicle.brand ? ` · ${vehicle.brand}` : ''}
            {vehicle.color ? ` · ${vehicle.color}` : ''}
          </p>

          {tenant && (
            <p
              className={`mt-1 flex items-center gap-1.5 text-xs ${selected ? 'text-on-dark-muted' : 'text-muted'}`}
            >
              <User size={12} />
              <span className="truncate">{tenant.fullName}</span>
            </p>
          )}

          {room && (
            <p
              className={`mt-0.5 flex items-center gap-1.5 text-xs ${selected ? 'text-on-dark-faint' : 'text-muted'}`}
            >
              <Home size={12} />
              Phòng {room.roomNumber || room.roomName}
            </p>
          )}

          <p
            className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${
              selected ? 'text-accent-lime' : 'text-accent-violet'
            }`}
          >
            <Banknote size={12} />
            {formatCurrency(vehicle.parkingFee)}/tháng
          </p>
        </div>
      </div>
    </button>
    <ImageModal
      isOpen={showImageModal}
      onClose={() => setShowImageModal(false)}
      src={imageUrl}
      alt={vehicle.licensePlate}
    />
    </>
  );
};

export default VehicleListItem;
