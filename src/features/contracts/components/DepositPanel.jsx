import React, { useState } from 'react';
import { formatCurrency, formatDate, getDepositStatusLabel } from '../utils/contractHelpers';

const DepositPanel = ({ contract, onUpdateDeposit, loading = false }) => {
  const [status, setStatus] = useState(contract?.depositStatus || 'Holding');
  const [note, setNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateDeposit({
      depositStatus: status,
      note: note.trim() || undefined,
      refundAmount: status === 'Refunded' ? contract.deposit : undefined,
      deductionAmount: status === 'Deducted' ? contract.deposit : undefined,
    });
    setNote('');
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Quản lý tiền cọc</h3>
      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Tiền cọc</p>
          <p className="font-semibold">{formatCurrency(contract?.deposit || 0)}</p>
        </div>
        <div>
          <p className="text-gray-500">Trạng thái</p>
          <p className="font-semibold">{getDepositStatusLabel(contract?.depositStatus)}</p>
        </div>
        <div>
          <p className="text-gray-500">Đã hoàn</p>
          <p className="font-semibold text-green-700">{formatCurrency(contract?.depositRefundAmount || 0)}</p>
        </div>
        <div>
          <p className="text-gray-500">Đã khấu trừ</p>
          <p className="font-semibold text-red-700">{formatCurrency(contract?.depositDeductionAmount || 0)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Cập nhật trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="Holding">Đang giữ cọc</option>
            <option value="Refunded">Đã hoàn cọc</option>
            <option value="Deducted">Đã khấu trừ</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="min-w-[160px] flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Lưu
        </button>
      </form>

      {contract?.depositHistory?.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Lịch sử cọc</p>
          <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {contract.depositHistory.map((item, idx) => (
              <li key={idx} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="font-medium">
                  {getDepositStatusLabel(item.fromStatus || '—')} → {getDepositStatusLabel(item.toStatus)}
                </p>
                <p className="text-xs text-gray-600">
                  {formatDate(item.changedAt)} · {formatCurrency(item.amount || 0)}
                  {item.note ? ` · ${item.note}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DepositPanel;
