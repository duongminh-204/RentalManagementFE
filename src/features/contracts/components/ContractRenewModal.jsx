import { useState } from 'react';
import { X } from 'lucide-react';
import CurrencyInput from '../../../components/common/CurrencyInput';
import { parseMoneyInputNumber, toMoneyInputValue } from '../../../utils/currencyInput';

const ContractRenewModal = ({ contract, onSubmit, onCancel, loading = false }) => {
  const [extendMonths, setExtendMonths] = useState(12);
  const [newRentPrice, setNewRentPrice] = useState(toMoneyInputValue(contract?.rentPrice ?? ''));
  const [cloneContract, setCloneContract] = useState(true);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      extendMonths: Number(extendMonths),
      newRentPrice: newRentPrice ? parseMoneyInputNumber(newRentPrice) : undefined,
      cloneContract,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Gia hạn hợp đồng</h3>
          <button type="button" onClick={onCancel} className="rounded p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Gia hạn thêm (tháng)</label>
            <input
              type="number"
              min="1"
              value={extendMonths}
              onChange={(e) => setExtendMonths(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Giá thuê mới (VNĐ)</label>
            <CurrencyInput
              name="newRentPrice"
              value={newRentPrice}
              onChange={(e) => setNewRentPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="3.000.000"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={cloneContract}
              onChange={(e) => setCloneContract(e.target.checked)}
            />
            Tạo hợp đồng mới (clone) và lưu lịch sử gia hạn
          </label>
          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onCancel} className="rounded-lg bg-gray-100 px-4 py-2 text-sm">
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Gia hạn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractRenewModal;
