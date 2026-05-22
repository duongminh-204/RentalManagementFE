import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { validatePhoneNumber, validateCCCD, formatCCCD } from '../utils/tenantHelpers';

const TenantForm = ({ tenant = null, onSubmit, onCancel, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    cccd: '',
    moveInDate: '',
    moveOutDate: '',
    deposit: '',
    notes: '',
    roomId: '',
  });

  const [idCardImage, setIdCardImage] = useState(null);
  const [idCardPreview, setIdCardPreview] = useState(tenant?.idCardImage || null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (tenant) {
      setFormData({
        fullName: tenant.fullName || '',
        phoneNumber: tenant.phoneNumber || '',
        email: tenant.email || '',
        cccd: tenant.cccd || '',
        moveInDate: tenant.moveInDate ? new Date(tenant.moveInDate).toISOString().split('T')[0] : '',
        moveOutDate: tenant.moveOutDate ? new Date(tenant.moveOutDate).toISOString().split('T')[0] : '',
        deposit: tenant.deposit || '',
        notes: tenant.notes || '',
        roomId: tenant.roomId || '',
      });
      if (tenant.idCardImage) {
        setIdCardPreview(tenant.idCardImage);
      }
    }
  }, [tenant]);

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.cccd.trim()) {
      errors.cccd = 'Vui lòng nhập CCCD';
    } else if (!validateCCCD(formData.cccd)) {
      errors.cccd = 'CCCD phải là 12 chữ số';
    }

    if (!formData.moveInDate) {
      errors.moveInDate = 'Vui lòng chọn ngày vào ở';
    }

    if (formData.moveOutDate && formData.moveInDate && new Date(formData.moveOutDate) <= new Date(formData.moveInDate)) {
      errors.moveOutDate = 'Ngày trả phòng phải sau ngày vào ở';
    }

    if (!formData.deposit) {
      errors.deposit = 'Vui lòng nhập tiền cọc';
    } else if (isNaN(formData.deposit) || formData.deposit < 0) {
      errors.deposit = 'Tiền cọc phải là số dương';
    }

    if (!formData.roomId) {
      errors.roomId = 'Vui lòng chọn phòng';
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
          idCardImage: 'Vui lòng chọn file ảnh',
        }));
        return;
      }
      setIdCardImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIdCardPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        idCardImage,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {tenant ? 'Chỉnh sửa khách thuê' : 'Thêm khách thuê mới'}
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
            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Họ tên *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập họ tên"
              />
              {validationErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0xxxxxxxxx"
              />
              {validationErrors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            {/* CCCD */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                CCCD *
              </label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.cccd ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123456789012"
              />
              {validationErrors.cccd && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cccd}</p>
              )}
            </div>

            {/* Ngày vào ở */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày vào ở *
              </label>
              <input
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.moveInDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.moveInDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.moveInDate}</p>
              )}
            </div>

            {/* Ngày trả phòng */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày trả phòng
              </label>
              <input
                type="date"
                name="moveOutDate"
                value={formData.moveOutDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.moveOutDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.moveOutDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.moveOutDate}</p>
              )}
            </div>

            {/* Tiền cọc */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tiền cọc (VNĐ) *
              </label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.deposit ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1000000"
              />
              {validationErrors.deposit && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.deposit}</p>
              )}
            </div>

            {/* Phòng */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phòng *
              </label>
              <select
                name="roomId"
                value={formData.roomId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.roomId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">-- Chọn phòng --</option>
                <option value="1">Phòng 101</option>
                <option value="2">Phòng 102</option>
                <option value="3">Phòng 103</option>
              </select>
              {validationErrors.roomId && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.roomId}</p>
              )}
            </div>
          </div>

          {/* Upload ảnh CCCD */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Upload ảnh CCCD
            </label>
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-700">Chọn ảnh</p>
                    <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB</p>
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

              {idCardPreview && (
                <div className="w-32">
                  <img
                    src={idCardPreview}
                    alt="CCCD Preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
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
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập ghi chú (nếu có)"
            />
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
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : tenant ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;
