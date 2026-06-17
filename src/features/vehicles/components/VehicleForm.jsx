import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import ImageModal from '../../../components/common/ImageModal';
import {
  validateLicensePlate,
  VEHICLE_TYPES,
  VEHICLE_BRANDS,
  VEHICLE_COLORS,
} from '../utils/vehicleHelpers';
import DateInput from '../../../components/common/DateInput';
import CurrencyInput from '../../../components/common/CurrencyInput';
import { toApiDate } from '../../../utils/dateHelpers';
import { parseMoneyInputNumber, toMoneyInputValue } from '../../../utils/currencyInput';

const VehicleForm = ({
  vehicle = null,
  tenants = [],
  rooms = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    type: 'motorcycle',
    brand: '',
    color: '',
    registrationDate: '',
    parkingFee: '',
    tenantId: '',
    roomId: '',
    notes: '',
    status: 'active',
  });

  const [vehicleImage, setVehicleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(vehicle?.imageUrl || null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        type: vehicle.type || 'motorcycle',
        brand: vehicle.brand || '',
        color: vehicle.color || '',
        registrationDate: toApiDate(vehicle.registrationDate),
        parkingFee: toMoneyInputValue(vehicle.parkingFee ?? ''),
        tenantId: vehicle.tenantId || '',
        roomId: vehicle.roomId || '',
        notes: vehicle.notes || '',
        status: vehicle.status || 'active',
      });
      if (vehicle.imageUrl) {
        setImagePreview(vehicle.imageUrl);
      }
    }
  }, [vehicle]);

  const validateForm = () => {
    const errors = {};

    if (!formData.licensePlate.trim()) {
      errors.licensePlate = 'Vui lòng nhập biển số xe';
    } else if (!validateLicensePlate(formData.licensePlate)) {
      errors.licensePlate = 'Biển số xe không hợp lệ';
    }

    if (!formData.type) {
      errors.type = 'Vui lòng chọn loại xe';
    }

    if (!formData.brand.trim()) {
      errors.brand = 'Vui lòng nhập hãng xe';
    }

    if (!formData.color) {
      errors.color = 'Vui lòng chọn màu xe';
    }

    if (!formData.registrationDate) {
      errors.registrationDate = 'Vui lòng chọn ngày đăng ký';
    }

    if (!formData.parkingFee && parseMoneyInputNumber(formData.parkingFee) !== 0) {
      errors.parkingFee = 'Vui lòng nhập phí gửi xe';
    } else if (parseMoneyInputNumber(formData.parkingFee) < 0) {
      errors.parkingFee = 'Phí gửi xe phải là số dương';
    }

    // Tenant và room là optional nhưng nếu là xe đang gửi thì bắt buộc
    if (formData.status === 'active') {
      if (!formData.tenantId) {
        errors.tenantId = 'Vui lòng chọn khách thuê';
      }
      if (!formData.roomId) {
        errors.roomId = 'Vui lòng chọn phòng';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationErrors((prev) => ({
          ...prev,
          vehicleImage: 'Vui lòng chọn file ảnh',
        }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          vehicleImage: 'File ảnh không được vượt quá 5MB',
        }));
        return;
      }
      setVehicleImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        tenantId: formData.tenantId ? parseInt(formData.tenantId, 10) : null,
        roomId: formData.roomId ? parseInt(formData.roomId, 10) : null,
        parkingFee: parseMoneyInputNumber(formData.parkingFee),
        vehicleImage,
      });
    }
  };

  const brandOptions = VEHICLE_BRANDS[formData.type] || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {vehicle ? 'Chỉnh sửa thông tin xe' : 'Thêm xe mới'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Biển số xe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Biển số xe *
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet uppercase ${
                  validationErrors.licensePlate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30A-12345"
              />
              {validationErrors.licensePlate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.licensePlate}</p>
              )}
            </div>

            {/* Loại xe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Loại xe *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {Object.entries(VEHICLE_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {validationErrors.type && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.type}</p>
              )}
            </div>

            {/* Hãng xe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Hãng xe *
              </label>
              {brandOptions.length > 0 ? (
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                    validationErrors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Chọn hãng xe --</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                    validationErrors.brand ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập hãng xe"
                />
              )}
              {validationErrors.brand && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.brand}</p>
              )}
            </div>

            {/* Màu xe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Màu xe *
              </label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.color ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn màu --</option>
                {VEHICLE_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              {validationErrors.color && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.color}</p>
              )}
            </div>

            {/* Ngày đăng ký */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày đăng ký *
              </label>
              <DateInput
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.registrationDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.registrationDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.registrationDate}</p>
              )}
            </div>

            {/* Phí gửi xe */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phí gửi xe (VNĐ/tháng) *
              </label>
              <CurrencyInput
                name="parkingFee"
                value={formData.parkingFee}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.parkingFee ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100.000"
              />
              {validationErrors.parkingFee && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.parkingFee}</p>
              )}
            </div>

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
              >
                <option value="active">Đang gửi</option>
                <option value="inactive">Ngừng gửi</option>
                <option value="unknown">Xe lạ</option>
              </select>
            </div>

            {/* Khách thuê */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Khách thuê {formData.status === 'active' && '*'}
              </label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.tenantId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn khách --</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.fullName}
                  </option>
                ))}
              </select>
              {validationErrors.tenantId && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.tenantId}</p>
              )}
            </div>

            {/* Phòng */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phòng {formData.status === 'active' && '*'}
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.roomId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Phòng {room.roomNumber}
                  </option>
                ))}
              </select>
              {validationErrors.roomId && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.roomId}</p>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
              placeholder="Ghi chú bổ sung (nếu có)"
            />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Upload ảnh xe
            </label>
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Chọn ảnh</p>
                    <p className="text-xs text-gray-500">JPG, PNG tối đa 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>

              {imagePreview && (
                <div className="w-32">
                  <img
                    src={imagePreview}
                    alt="Vehicle Preview"
                    className="w-full h-32 object-contain rounded-lg border border-gray-300 cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setShowImageModal(true)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : vehicle ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={imagePreview}
        alt="Vehicle Preview"
      />
    </div>
  );
};

export default VehicleForm;
