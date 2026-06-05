import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Check,
  AlertCircle,
  Wifi,
  Snowflake,
  Refrigerator,
  WashingMachine,
  Tv,
  BedDouble,
  Sofa,
  Shirt,
  Flame,
  ParkingCircle,
  ShieldCheck,
  Camera,
} from 'lucide-react';

const AMENITIES = [
  { id: 'wifi', label: 'Wifi miễn phí', icon: Wifi },
  { id: 'airConditioner', label: 'Máy lạnh', icon: Snowflake },
  { id: 'fridge', label: 'Tủ lạnh', icon: Refrigerator },
  { id: 'washingMachine', label: 'Máy giặt', icon: WashingMachine },
  { id: 'tv', label: 'Tivi', icon: Tv },
  { id: 'bed', label: 'Giường ngủ', icon: BedDouble },
  { id: 'furniture', label: 'Nội thất', icon: Sofa },
  { id: 'wardrobe', label: 'Tủ quần áo', icon: Shirt },
  { id: 'waterHeater', label: 'Bình nóng lạnh', icon: Flame },
  { id: 'parking', label: 'Chỗ để xe', icon: ParkingCircle },
  { id: 'security', label: 'An ninh 24/7', icon: ShieldCheck },
  { id: 'camera', label: 'Camera giám sát', icon: Camera },
];

const INITIAL_VISIBLE_AMENITIES = 6;

const RoomFormComponent = ({ 
  onSubmit, 
  onCancel, 
  initialData = null,
  loading = false,
  error = null
}) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    buildingId: 1,
    rentalPrice: '',
    electricityPrice: '',
    waterPrice: '',
    area: '',
    maxPeople: '',
    status: 'vacant',
    description: '',
    amenities: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const toggleAmenity = (amenityId) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenityId);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter(id => id !== amenityId)
          : [...prev.amenities, amenityId]
      };
    });
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        roomNumber: initialData.roomNumber || initialData.roomName || '',
        buildingId: initialData.buildingId ?? 1,
        rentalPrice: initialData.rentalPrice ?? initialData.price ?? '',
        electricityPrice: initialData.electricityPrice ?? initialData.electricPrice ?? '',
        waterPrice: initialData.waterPrice ?? '',
        area: initialData.area ?? '',
        maxPeople: initialData.maxPeople ?? '',
        status: initialData.status || 'vacant',
        description: initialData.description || '',
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities : []
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.roomNumber.trim()) {
      errors.roomNumber = 'Số phòng là bắt buộc';
    }
    
    if (!formData.rentalPrice || formData.rentalPrice <= 0) {
      errors.rentalPrice = 'Giá thuê phải lớn hơn 0';
    }
    
    if (!formData.electricityPrice || formData.electricityPrice < 0) {
      errors.electricityPrice = 'Giá điện không hợp lệ';
    }
    
    if (!formData.waterPrice || formData.waterPrice < 0) {
      errors.waterPrice = 'Giá nước không hợp lệ';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts editing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Sửa thông tin phòng' : 'Thêm phòng mới'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-gap gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Số phòng */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Số phòng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            placeholder="Ví dụ: 101, 102A, 201B..."
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              validationErrors.roomNumber
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus-visible:outline-accent-violet'
            }`}
          />
          {validationErrors.roomNumber && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.roomNumber}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tòa nhà (ID) <span className="text-red-500">*</span>
          </label>
          <input type="number" name="buildingId" min="1" value={formData.buildingId} onChange={handleChange} className="text-input" />
        </div>

        <motion.div className="grid grid-cols-2 gap-6">
          {/* Giá thuê */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá thuê (₫/tháng) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="rentalPrice"
              value={formData.rentalPrice}
              onChange={handleChange}
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                validationErrors.rentalPrice
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus-visible:outline-accent-violet'
              }`}
            />
            {validationErrors.rentalPrice && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.rentalPrice}</p>
            )}
          </div>

          {/* Giá điện */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá điện (₫/kWh) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="electricityPrice"
              value={formData.electricityPrice}
              onChange={handleChange}
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                validationErrors.electricityPrice
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus-visible:outline-accent-violet'
              }`}
            />
            {validationErrors.electricityPrice && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.electricityPrice}</p>
            )}
          </div>

          {/* Giá nước */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Giá nước (₫/m³) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="waterPrice"
              value={formData.waterPrice}
              onChange={handleChange}
              placeholder="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                validationErrors.waterPrice
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus-visible:outline-accent-violet'
              }`}
            />
            {validationErrors.waterPrice && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.waterPrice}</p>
            )}
          </div>
        </motion.div>
        {/* Diện tích & sức chứa */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Diện tích (m²)</label>
            <input type="number" name="area" min="0" step="0.1" value={formData.area} onChange={handleChange} className="text-input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Số người tối đa</label>
            <input type="number" name="maxPeople" min="1" value={formData.maxPeople} onChange={handleChange} className="text-input" />
          </div>
        </div>
        {/* Trạng thái */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Trạng thái phòng
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet transition-all"
          >
            <option value="vacant">Trống</option>
            <option value="occupied">Đang thuê</option>
            <option value="maintenance">Đang bảo trì</option>
          </select>
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Thêm ghi chú hoặc mô tả chi tiết về phòng..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet transition-all resize-none"
          />
        </div>

        {/* Tiện ích */}
        <section
          className="bg-white p-8"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          <h3 className="text-[32px] font-bold leading-tight text-gray-900">Tiện ích</h3>
          <p className="mt-1 text-gray-500">
            Chọn các tiện ích có sẵn trong phòng để khách thuê dễ dàng tham khảo.
          </p>
          <hr className="my-6 border-t border-gray-200" />

          <div className="grid grid-cols-1 gap-y-6 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {(showAllAmenities ? AMENITIES : AMENITIES.slice(0, INITIAL_VISIBLE_AMENITIES)).map(
              ({ id, label, icon: Icon }) => {
                const checked = formData.amenities.includes(id);
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 select-none"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(id)}
                      className="h-5 w-5 shrink-0 cursor-pointer rounded border-gray-300 text-primary focus-visible:outline-accent-violet"
                    />
                    <Icon size={20} className="shrink-0 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                );
              }
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowAllAmenities(prev => !prev)}
            className="mt-8 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-500"
          >
            {showAllAmenities ? 'Thu gọn' : 'Xem thêm tiện ích'}
          </button>
        </section>

        {/* Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg hover:opacity-90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={20} />
            {loading ? 'Đang xử lý...' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Hủy
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default RoomFormComponent;
