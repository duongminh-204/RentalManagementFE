import React from 'react';
import { formatCurrency, formatDate } from '../utils/contractHelpers';

const PaymentHistoryTable = ({ payments = [] }) => {
  if (!payments.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-500 shadow-sm">
        Chưa có lịch sử thanh toán cho phòng này.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b px-5 py-3">
        <h3 className="text-lg font-semibold text-gray-900">Lịch sử thanh toán</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Kỳ</th>
              <th className="px-4 py-3">Tổng tiền</th>
              <th className="px-4 py-3">Đã trả</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.invoiceId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.monthYear}</td>
                <td className="px-4 py-3">{formatCurrency(p.totalAmount)}</td>
                <td className="px-4 py-3">{formatCurrency(p.paidAmount)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">{p.paymentDate ? formatDate(p.paymentDate) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
