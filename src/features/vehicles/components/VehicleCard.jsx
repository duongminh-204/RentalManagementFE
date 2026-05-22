import React, { useState } from 'react';
import ImageModal from '../../../components/common/ImageModal';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import {
  getVehicleTypeLabel,
  getVehicleStatusLabel,
  getVehicleStatusColor,
  getVehicleTypeIcon,
  formatCurrency,
  formatDate,
  calculateParkingDays,
} from '../utils/vehicleHelpers';

const VehicleCard = ({ vehicle, tenant, room, onEdit, onDelete }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const parkingDays = calculateParkingDays(vehicle.registrationDate);
  const isUnknown = vehicle.status === 'unknown' || !vehicle.tenantId;

  return (
    <div className={`rounded-lg shadow hover:shadow-lg transition-shadow border overflow-hidden ${
      isUnknown ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{getVehicleTypeIcon(vehicle.type)}</span>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-mono">{vehicle.licensePlate}</h3>
              <p className="text-sm text-gray-600">{getVehicleTypeLabel(vehicle.type)}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVehicleStatusColor(vehicle.status)}`}>
            {getVehicleStatusLabel(vehicle.status)}
          </span>
        </div>

        {/* Alert for unknown vehicle */}
        {isUnknown && (
          <div className="mb-4 bg-red-100 border border-red-300 rounded p-3 flex items-start gap-2">
            <AlertCircle className="text-red-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-red-800">Xe lạ chưa xác nhận</p>
              <p className="text-xs text-red-700">Cần cập nhật thông tin khách thuê</p>
            </div>
          </div>
        )}

        {/* Image */}
        {vehicle.imageUrl && (
          <div className="mb-4">
            <img
              src={vehicle.imageUrl}
              alt={vehicle.licensePlate}
              className="w-full h-32 object-cover rounded-lg border border-gray-300 cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setShowImageModal(true)}
            />
          </div>
        )}

        {/* Details */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Hãng xe</p>
              <p className="text-sm font-medium text-gray-900">{vehicle.brand}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Màu sắc</p>
              <p className="text-sm font-medium text-gray-900">{vehicle.color}</p>
            </div>
          </div>

          {tenant && (
            <div>
              <p className="text-xs text-gray-500 font-medium">Khách thuê</p>
              <p className="text-sm font-medium text-gray-900">{tenant.fullName}</p>
            </div>
          )}

          {room && (
            <div>
              <p className="text-xs text-gray-500 font-medium">Phòng</p>
              <p className="text-sm font-medium text-gray-900">Phòng {room.roomNumber}</p>
            </div>
          )}
        </div>

        {/* Fee & Duration */}
        <div className="bg-gray-50 rounded p-3 mb-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Phí gửi xe:</span>
            <span className="font-medium text-gray-900">{formatCurrency(vehicle.parkingFee)}/tháng</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Đăng ký từ:</span>
            <span className="font-medium text-gray-900">{formatDate(vehicle.registrationDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Đã gửi:</span>
            <span className="font-medium text-accent-violet">{parkingDays} ngày</span>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Ghi chú</p>
            <p className="text-sm text-gray-600 line-clamp-2">{vehicle.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(vehicle)}
            className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Edit2 size={16} /> Sửa
          </button>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={vehicle.imageUrl}
        alt={vehicle.licensePlate}
      />
    </div>
  );
};

export default VehicleCard;
