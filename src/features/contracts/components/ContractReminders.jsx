import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';
import { formatDate } from '../utils/contractHelpers';

const reminderLabels = {
  expires_in_7_days: 'Hết hạn trong 7 ngày',
  expires_in_3_days: 'Hết hạn trong 3 ngày',
  expires_in_1_days: 'Hết hạn trong 1 ngày',
  expired_not_renewed: 'Đã hết hạn, chưa gia hạn',
};

const ContractReminders = ({ reminders = [], onSelect }) => {
  if (!reminders.length) return null;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Bell size={18} className="text-orange-600" />
        Nhắc nhở hợp đồng ({reminders.length})
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {reminders.map((r) => (
          <button
            key={`${r.contractId}-${r.reminderType}`}
            type="button"
            onClick={() => onSelect?.(r.contractId)}
            className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-left transition hover:bg-orange-100"
          >
            <AlertTriangle className="mt-0.5 shrink-0 text-orange-600" size={18} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-orange-900">
                {r.tenantName} — {r.roomName}
              </p>
              <p className="text-xs text-orange-800">
                {reminderLabels[r.reminderType] || r.reminderType} · Hết hạn {formatDate(r.endDate)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContractReminders;
