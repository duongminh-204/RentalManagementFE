import { AlertTriangle, Bell, ChevronRight } from 'lucide-react';
import { ALERT_SEVERITY_STYLES } from '../utils/legalHelpers';

const LegalAlertsPanel = ({ alerts = [], onSelectAlert, compact = false }) => {
  if (!alerts.length) {
    return (
      <div className="rounded-xl border border-[#cfe7be] bg-[#f8fff0] p-4 text-sm text-[#4d7a14]">
        Không có việc cần xử lý ngay. Hồ sơ pháp lý đang ổn định.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-deep">
          <Bell size={18} className="text-accent-violet" />
          Việc cần xử lý ({alerts.length})
        </div>
      )}
      <div className={`grid gap-2 ${compact ? '' : 'md:grid-cols-2'}`}>
        {alerts.map((alert) => (
          <button
            key={alert.id}
            type="button"
            onClick={() => onSelectAlert?.(alert)}
            className={`flex items-start gap-3 rounded-xl border p-3 text-left transition hover:opacity-90 ${
              ALERT_SEVERITY_STYLES[alert.severity] || ALERT_SEVERITY_STYLES.info
            }`}
          >
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{alert.title}</p>
              <p className="mt-1 text-xs opacity-90">{alert.message}</p>
            </div>
            {onSelectAlert && <ChevronRight className="mt-1 shrink-0 opacity-60" size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegalAlertsPanel;
