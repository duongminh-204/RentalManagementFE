import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2 } from 'lucide-react';
import RoomStatusBadge from '../common/RoomStatusBadge';

const RoomTable = ({ 
  rooms, 
  loading, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg font-medium">Chưa có phòng nào</p>
        <p className="text-gray-400 text-sm mt-2">Bắt đầu bằng cách thêm phòng mới</p>
      </div>
    );
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-[2100px] w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Số phòng</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Giá thuê</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Điện/m³</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nước/m³</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Internet</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <motion.tr
              key={room.id != null ? String(room.id) : `room-row-${room.roomNumber ?? index}`}
              variants={rowVariants}
              initial="hidden"
              animate="show"
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 font-semibold text-gray-900">{room.roomNumber}</td>
              <td className="px-6 py-4 text-gray-600">{room.rentalPrice?.toLocaleString('vi-VN')} ₫</td>
              <td className="px-6 py-4 text-gray-600">{room.electricityPrice?.toLocaleString('vi-VN')} ₫</td>
              <td className="px-6 py-4 text-gray-600">{room.waterPrice?.toLocaleString('vi-VN')} ₫</td>
              <td className="px-6 py-4 text-gray-600">{room.internetPrice?.toLocaleString('vi-VN')} ₫</td>
              <td className="px-6 py-4">
                <RoomStatusBadge status={room.status} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(room)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-50 text-accent-violet hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa phòng này?')) {
                        onDelete(room.id);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomTable;
