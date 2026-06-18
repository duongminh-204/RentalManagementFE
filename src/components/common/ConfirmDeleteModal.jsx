import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmDeleteModal = ({
  open,
  title = 'Xác nhận xóa',
  targetLabel,
  description,
  consequences = [],
  note,
  confirmLabel = 'Xóa vĩnh viễn',
  cancelLabel = 'Hủy',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-hairline-cloud bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-hairline-cloud px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h3 id="confirm-delete-title" className="text-lg font-semibold text-ink-deep">
                {title}
              </h3>
              {targetLabel ? (
                <p className="mt-1 text-sm font-medium text-accent-violet-deep">{targetLabel}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-full p-1.5 text-muted transition hover:bg-surface-press hover:text-ink-deep disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {description ? <p className="text-sm text-ink-deep">{description}</p> : null}

          {consequences.length > 0 ? (
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                Dữ liệu sẽ bị xóa theo
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-red-900">
                {consequences.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {note ? (
            <p className="rounded-xl border border-hairline-cloud bg-surface-light px-3 py-2 text-xs text-muted">
              {note}
            </p>
          ) : null}

          <p className="text-xs text-muted">Hành động này không thể hoàn tác.</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-hairline-cloud px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-hairline-cloud px-4 py-2 text-sm font-medium text-ink-deep transition hover:bg-surface-press disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {loading ? 'Đang xóa…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
