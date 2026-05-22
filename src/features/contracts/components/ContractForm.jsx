import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, AlertCircle, FileText } from 'lucide-react';
import ImageModal from '../../../components/common/ImageModal';
import DateInput from '../../../components/common/DateInput';
import { toApiDate } from '../../../utils/dateHelpers';
import { resolveMediaUrl } from '../../tenants/utils/tenantHelpers';
import {
  getContractFileName,
  isImageUrl,
  isPdfUrl,
} from '../utils/contractFileHelpers';
import {
  validateContractDates,
  getContractStatusLabel,
  getContractStatusColor,
  resolveContractStatus,
} from '../utils/contractHelpers';

const ContractForm = ({
  contract = null,
  tenants = [],
  rooms = [],
  fixedRoomId = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  embedded = false,
}) => {
  const [formData, setFormData] = useState({
    // contractNumber: '',
    tenantId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    // rentalPrice: '',
    deposit: '',
    terms: '',
    notes: '',
  });

  const [contractFile, setContractFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (fixedRoomId != null && fixedRoomId !== '') {
      setFormData((prev) => ({
        ...prev,
        roomId: String(fixedRoomId),
      }));
    }
  }, [fixedRoomId]);

  useEffect(() => {
    if (contract) {
      setFormData({
        // contractNumber: contract.contractNumber || '',
        tenantId: contract.tenantId || '',
        roomId: contract.roomId || fixedRoomId || '',
        startDate: toApiDate(contract.startDate),
        endDate: toApiDate(contract.endDate),
        deposit: contract.deposit ?? '',
        rentalPrice: contract.rentalPrice || '',
        terms: contract.terms || '',
        notes: contract.notes || '',
      });
      if (contract.fileUrl) {
        const resolved = resolveMediaUrl(contract.fileUrl);
        setFilePreview(resolved);
        setUploadedFileName(getContractFileName(contract));
      } else {
        setFilePreview(null);
        setUploadedFileName('');
      }
      setContractFile(null);
    }
  }, [contract]);

  const computedStatus = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 'pending';
    return resolveContractStatus({
      startDate: formData.startDate,
      endDate: formData.endDate,
      isTerminated: contract?.isTerminated,
      status: contract?.status,
    });
  }, [formData.startDate, formData.endDate, contract]);

  const validateForm = () => {
    const errors = {};

    // if (!formData.contractNumber.trim()) {
    //   errors.contractNumber = 'Vui lòng nhập số hợp đồng';
    // } else if (!validateContractNumber(formData.contractNumber)) {
    //   errors.contractNumber = 'Số hợp đồng không hợp lệ';
    // }

    if (!formData.tenantId) {
      errors.tenantId = 'Vui lòng chọn khách thuê';
    }

    if (!formData.roomId && !fixedRoomId) {
      errors.roomId = 'Vui lòng chọn phòng';
    }

    if (!formData.startDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      errors.endDate = 'Vui lòng chọn ngày hết hạn';
    }

    if (formData.startDate && formData.endDate && !validateContractDates(formData.startDate, formData.endDate)) {
      errors.endDate = 'Ngày hết hạn phải sau ngày bắt đầu';
    }

    if (!formData.deposit) {
      errors.deposit = 'Vui lòng nhập tiền cọc';
    } else if (isNaN(formData.deposit) || formData.deposit < 0) {
      errors.deposit = 'Tiền cọc phải là số dương';
    }
    // if (!formData.rentalPrice) {
    //   errors.rentalPrice = 'Vui lòng nhập giá thuê';
    // } else if (isNaN(formData.rentalPrice) || formData.rentalPrice < 0) {
    //   errors.rentalPrice = 'Giá thuê phải là số dương';
    // }

    if (!formData.terms.trim()) {
      errors.terms = 'Vui lòng nhập điều khoản';
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        setValidationErrors((prev) => ({
          ...prev,
          contractFile: 'Vui lòng chọn file PDF hoặc ảnh',
        }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          contractFile: 'File không được vượt quá 10MB',
        }));
        return;
      }
      setContractFile(file);
      setUploadedFileName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFilePreview(ev.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('__pdf__');
      }
    }
  };

  const previewIsImage =
    filePreview &&
    filePreview !== '__pdf__' &&
    (filePreview.startsWith('data:image') || isImageUrl(filePreview));

  const previewIsPdf =
    filePreview === '__pdf__' ||
    (filePreview &&
      !previewIsImage &&
      (isPdfUrl(filePreview) || String(uploadedFileName).toLowerCase().endsWith('.pdf')));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        roomId: fixedRoomId ?? formData.roomId,
        deposit: Number(formData.deposit),
        contractFile,
      });
    }
  };

  const formShell = (
    <>
      <div
        className={`flex h-full w-full flex-col overflow-hidden bg-surface-light ${
          embedded ? '' : 'max-h-[90vh] rounded-lg shadow-lg'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-hairline-cloud bg-surface-light px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-ink-deep">
            {contract?.id ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md p-2 text-muted transition hover:bg-surface-press hover:text-ink-deep"
            disabled={loading}
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Số hợp đồng */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Số hợp đồng *
              </label>
              <input
                type="text"
                name="contractNumber"
                value={formData.contractNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${
                  validationErrors.contractNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="HD/2024/01/001"
              />
              {validationErrors.contractNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.contractNumber}</p>
              )}
            </div> */}

            {/* Khách thuê */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Khách thuê *
              </label>
              <select
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${validationErrors.tenantId ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">-- Chọn khách thuê --</option>
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
            {fixedRoomId == null || fixedRoomId === '' ? (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phòng *
                </label>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${validationErrors.roomId ? 'border-red-500' : 'border-gray-300'
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
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phòng</label>
                <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {rooms.find((r) => String(r.id) === String(fixedRoomId))?.roomNumber
                    ? `Phòng ${rooms.find((r) => String(r.id) === String(fixedRoomId)).roomNumber}`
                    : `Phòng #${fixedRoomId}`}
                </p>
              </div>
            )}

            {/* Trạng thái (tự động theo ngày) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trạng thái
              </label>
              <p
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${getContractStatusColor(computedStatus)}`}
              >
                {getContractStatusLabel(computedStatus)}
                <span className="ml-1 block text-xs font-normal opacity-80">
                  Tự động theo ngày bắt đầu / hết hạn
                </span>
              </p>
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày bắt đầu *
              </label>
              <DateInput
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${validationErrors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {validationErrors.startDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.startDate}</p>
              )}
            </div>

            {/* Ngày hết hạn */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Ngày hết hạn *
              </label>
              <DateInput
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${validationErrors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              {validationErrors.endDate && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.endDate}</p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${validationErrors.deposit ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="3000000"
              />
              {validationErrors.deposit && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.deposit}</p>
              )}
            </div>
          </div>

          {/* Điều khoản */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Điều khoản hợp đồng *
            </label>
            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
              rows="6"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet ${validationErrors.terms ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Nhập các điều khoản (thanh toán, chính sách hủy, bảo hành nhà cửa, v.v.)"
            />
            {validationErrors.terms && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.terms}</p>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Ghi chú thêm
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

          {/* Upload file */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Upload hợp đồng (PDF/Ảnh)
            </label>
            <div className="flex min-w-0 gap-4">
              <div className="min-w-0 flex-1">
                <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 transition-colors hover:border-gray-400">
                  <div className="text-center">
                    <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Chọn file</p>
                    <p className="text-xs text-gray-500">PDF hoặc ảnh, tối đa 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>

              {filePreview && (
                <div className="flex w-36 min-w-0 shrink-0 flex-col gap-1">
                  {previewIsImage ? (
                    <img
                      src={filePreview}
                      alt="Xem trước hợp đồng"
                      className="h-32 w-full rounded-lg border border-gray-300 object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setShowImageModal(true)}
                    />
                  ) : (
                    <div className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-2">
                      <FileText size={28} className="shrink-0 text-gray-500" />
                      <p
                        className="w-full truncate text-center text-xs text-gray-600"
                        title={uploadedFileName || getContractFileName(contract)}
                      >
                        {uploadedFileName || getContractFileName(contract)}
                      </p>
                    </div>
                  )}
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
              {loading ? 'Đang xử lý...' : contract ? 'Cập nhật' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        src={filePreview}
        alt="Contract Preview"
      />
    </>
  );

  if (embedded) {
    return formShell;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full">{formShell}</div>
    </div>
  );
};

export default ContractForm;
