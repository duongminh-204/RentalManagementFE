import React, { useState } from 'react';
import { Edit2, Trash2, Phone, Mail, MapPin, Calendar, User } from 'lucide-react';
import { getTenantStatusLabel, getTenantStatusColor, formatDate, formatCurrency, calculateStayDuration } from '../utils/tenantHelpers';
import ImageModal from '../../../components/common/ImageModal';

const TenantCard = ({ tenant, onEdit, onDelete, onViewDetails }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-inner">
              <User size={22} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">{tenant.fullName}</h3>
              <p className="text-sm text-gray-500 mt-0.5">CCCD: {tenant.cccd}</p>
            </div>
          </div>

          <span className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${getTenantStatusColor(tenant.status)}`}>
            {getTenantStatusLabel(tenant.status)}
          </span>
        </div>

        {/* ID Card Image */}
        {tenant.idCardImage && (
          <div className="mb-5 rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer transition hover:opacity-90">
            <img
              src={tenant.idCardImage}
              alt="CCCD"
              className="w-full h-36 object-contain"
              onClick={() => setShowImageModal(true)}
            />
          </div>
        )}

        {/* Modal Preview */}
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          src={tenant.idCardImage}
          alt={`Ảnh CCCD của ${tenant.fullName}`}
        />

        {/* Info */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Phone size={18} className="text-gray-400" />
            <span>{tenant.phoneNumber}</span>
          </div>
          
          {tenant.email && (
            <div className="flex items-center gap-3 text-gray-600">
              <Mail size={18} className="text-gray-400" />
              <span>{tenant.email}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-600">
            <MapPin size={18} className="text-gray-400" />
            <span>Phòng <span className="font-semibold text-gray-900">{tenant.roomNumber}</span></span>
          </div>

          <div className="flex items-center gap-3 text-gray-600">
            <Calendar size={18} className="text-gray-400" />
            <span>{formatDate(tenant.moveInDate)}</span>
          </div>
        </div>

        {/* Details Box */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100 rounded-xl p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Tiền cọc</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(tenant.deposit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Thời gian ở</span>
            <span className="font-semibold text-gray-700">{calculateStayDuration(tenant.moveInDate, tenant.moveOutDate)}</span>
          </div>
        </div>

        {/* Notes */}
        {tenant.notes && (
          <div className="mb-5">
            <p className="text-xs font-medium text-gray-400 mb-1">GHI CHÚ</p>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{tenant.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onViewDetails(tenant.id)}
            className="flex-1 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-medium text-sm transition-all active:scale-[0.985]"
          >
            Chi tiết
          </button>
          <button
            onClick={() => onEdit(tenant)}
            className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.985]"
          >
            <Edit2 size={16} /> Sửa
          </button>
          <button
            onClick={() => onDelete(tenant.id)}
            className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 active:scale-[0.985]"
          >
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantCard;