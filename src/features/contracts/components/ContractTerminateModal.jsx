import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/contractHelpers';
import CurrencyInput from '../../../components/common/CurrencyInput';
import { parseMoneyInputNumber } from '../../../utils/currencyInput';

const ContractTerminateModal = ({ contract, onSubmit, onCancel, loading = false }) => {
  const [reason, setReason] = useState('');
  const [deduction, setDeduction] = useState('0');
  const [notes, setNotes] = useState('');

  const refund = useMemo(() => {
    const deposit = Number(contract?.deposit) || 0;
    const deduct = Math.max(0, parseMoneyInputNumber(deduction));
    return Math.max(0, deposit - deduct);
  }, [contract?.deposit, deduction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({
      reason: reason.trim(),
      depositDeductionAmount: parseMoneyInputNumber(deduction),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold text-red-700">Chấm dứt hợp đồng</h3>
          <button type="button" onClick={onCancel} className="rounded p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Lý do chấm dứt *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Khấu trừ cọc (VNĐ) — Cọc hiện tại: {formatCurrency(contract?.deposit || 0)}
            </label>
            <CurrencyInput
              name="deduction"
              value={deduction}
              onChange={(e) => setDeduction(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="0"
            />
          </div>
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
            Hoàn cọc dự kiến: <strong>{formatCurrency(refund)}</strong>
          </p>
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
              disabled={loading || !reason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận chấm dứt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractTerminateModal;
