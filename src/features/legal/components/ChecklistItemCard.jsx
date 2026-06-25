import { CheckCircle2, Circle, ExternalLink, FileText } from 'lucide-react';

const ChecklistItemCard = ({ item, onUpload, uploadLabel }) => {
  const completed = item.isCompleted;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 transition ${
        completed
          ? 'border-[#cfe7be] bg-[#f8fff0]'
          : 'border-hairline-cloud bg-white hover:border-accent-violet/30'
      }`}
    >
      <div className={`mt-0.5 shrink-0 ${completed ? 'text-[#4d7a14]' : 'text-muted'}`}>
        {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${completed ? 'text-[#4d7a14]' : 'text-ink-deep'}`}>
          {item.label}
        </p>
        {item.status && (
          <p className="mt-1 text-xs text-muted">Trạng thái: {item.status}</p>
        )}
        {item.note && <p className="mt-1 text-xs text-muted">{item.note}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {item.fileUrl && (
            <a
              href={item.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-surface-press px-2.5 py-1 text-xs font-medium text-accent-violet-deep hover:bg-accent-violet/10"
            >
              <FileText size={14} />
              Xem file
              <ExternalLink size={12} />
            </a>
          )}
          {onUpload && !completed && (
            <button
              type="button"
              onClick={onUpload}
              className="inline-flex items-center gap-1 rounded-lg bg-accent-violet px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
            >
              {uploadLabel || 'Tải lên'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItemCard;
