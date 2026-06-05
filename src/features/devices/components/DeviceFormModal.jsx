import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Upload, ImageOff, Trash2 } from 'lucide-react';
import { DEVICE_STATUS_OPTIONS, DEVICE_TYPES } from '../constants';

const EMPTY_FORM = {
  name: '',
  type: DEVICE_TYPES[0],
  roomNumber: '',
  status: 'active',
  image: null,
  description: '',
};

const DeviceFormModal = ({ mode = 'create', initialData = null, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({ ...EMPTY_FORM, ...initialData });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'Vui lòng chọn tệp ảnh hợp lệ' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setErrors((prev) => ({ ...prev, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = 'Tên thiết bị là bắt buộc';
    if (!formData.roomNumber.toString().trim()) next.roomNumber = 'Phòng là bắt buộc';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-deep/40" onClick={onClose} aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-[var(--shadow-card)]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'edit' ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ảnh thiết bị */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Ảnh thiết bị</label>
            <div className="flex items-center gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                {formData.image ? (
                  <img src={formData.image} alt="Xem trước" className="h-full w-full object-cover" />
                ) : (
                  <ImageOff size={26} className="text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-500"
                >
                  <Upload size={16} />
                  Tải ảnh lên
                </button>
                {formData.image && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent-pink hover:underline"
                  >
                    <Trash2 size={15} />
                    Xóa ảnh
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
          </div>

          {/* Tên thiết bị */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Tên thiết bị <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Máy lạnh Daikin, Tủ lạnh Toshiba..."
              className={`w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus-visible:outline-accent-violet'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Loại thiết bị */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Loại thiết bị</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Phòng */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="VD: 101"
                className={`w-full rounded-lg border px-4 py-2 transition-all focus:outline-none focus:ring-2 ${
                  errors.roomNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus-visible:outline-accent-violet'
                }`}
              />
              {errors.roomNumber && <p className="mt-1 text-sm text-red-500">{errors.roomNumber}</p>}
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-all focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
            >
              {DEVICE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mô tả */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Ghi chú về tình trạng, ngày mua, bảo hành..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 transition-all focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
            />
          </div>

          {/* Nút */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              <Check size={20} />
              {mode === 'edit' ? 'Cập nhật' : 'Thêm thiết bị'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-gray-200 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DeviceFormModal;
