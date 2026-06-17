import React from 'react';
import { Edit2, Trash2, Download, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import {
  getContractStatusLabel,
  getContractStatusColor,
  resolveContractStatus,
  formatDate,
  formatCurrency,
  calculateDaysUntilExpiry,
  calculateContractDuration,
} from '../utils/contractHelpers';

const ContractCard = ({ contract, tenant, room, onEdit, onDelete, onDownload, onRenew }) => {
  const status = resolveContractStatus(contract);
  const daysUntilExpiry = calculateDaysUntilExpiry(contract.endDate);
  const duration = calculateContractDuration(contract.startDate, contract.endDate);
  const isExpiringsSoon = status === 'expiring_soon';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{contract.contractNumber}</h3>
            <p className="text-sm text-gray-500">{tenant?.fullName || 'N/A'}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getContractStatusColor(status)}`}>
            {getContractStatusLabel(status)}
          </span>
        </div>

        {/* Alert for expiring soon */}
        {isExpiringsSoon && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded p-3 flex items-start gap-2">
            <AlertCircle className="text-orange-600 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-medium text-orange-800">Sắp hết hạn</p>
              <p className="text-xs text-orange-700">Còn {daysUntilExpiry} ngày</p>
            </div>
          </div>
        )}

        {/* Contract Info */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium">Phòng</p>
              <p className="text-sm font-medium text-gray-900">Phòng {room?.roomNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Thời hạn</p>
              <p className="text-sm font-medium text-gray-900">{duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span className="text-sm">
              {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign size={18} />
            <span className="text-sm">{formatCurrency(contract.rentalPrice)}/tháng</span>
          </div>
        </div>

        {/* Terms Preview */}
        {contract.terms && (
          <div className="bg-gray-50 rounded p-3 mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Điều khoản</p>
            <p className="text-sm text-gray-600 line-clamp-2">{contract.terms}</p>
          </div>
        )}

        {/* Notes */}
        {contract.notes && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-medium mb-1">Ghi chú</p>
            <p className="text-sm text-gray-600 line-clamp-2">{contract.notes}</p>
          </div>
        )}

        {/* Expiry Status */}
        <div className="mb-4 text-xs">
          {daysUntilExpiry < 0 && (
            <p className="text-red-600 font-medium">Hợp đồng đã hết hạn {Math.abs(daysUntilExpiry)} ngày trước</p>
          )}
          {daysUntilExpiry >= 0 && daysUntilExpiry <= 30 && (
            <p className="text-orange-600 font-medium">Hợp đồng sẽ hết hạn trong {daysUntilExpiry} ngày</p>
          )}
          {daysUntilExpiry > 30 && (
            <p className="text-green-600 font-medium">Hợp đồng còn {daysUntilExpiry} ngày</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {contract.fileUrl && (
            <button
              onClick={() => onDownload(contract)}
              className="flex-1 min-w-[100px] px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              <Download size={16} /> Download
            </button>
          )}
          {isExpiringsSoon && (
            <button
              onClick={() => onRenew(contract)}
              className="flex-1 min-w-[100px] px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors text-sm font-medium"
            >
              Gia hạn
            </button>
          )}
          <button
            onClick={() => onEdit(contract)}
            className="flex-1 min-w-[100px] px-3 py-2 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Edit2 size={16} /> Sửa
          </button>
          <button
            onClick={() => onDelete(contract.id)}
            className="flex-1 min-w-[100px] px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
          >
            <Trash2 size={16} /> Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
