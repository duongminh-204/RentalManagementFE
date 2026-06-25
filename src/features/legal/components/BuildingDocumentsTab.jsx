import { useEffect, useState } from 'react';
import { Building2, FilePlus, Loader2, Pencil, Trash2, Upload } from 'lucide-react';
import { getAllBuildings } from '../../buildings/api/buildingsApi';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_OPTIONS, formatLegalDate } from '../utils/legalHelpers';
import DateInput from '../../../components/common/DateInput';

const BuildingDocumentsTab = ({
  documents,
  onCreate,
  onUpdate,
  onDelete,
  onUploadFile,
  loading,
}) => {
  const [buildings, setBuildings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    buildingId: '',
    documentType: 'PCCC',
    title: '',
    issueDate: '',
    expiryDate: '',
    note: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllBuildings()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBuildings(list.map((b) => ({
          id: b.id ?? b.buildingId ?? b.BuildingId,
          buildingName: b.buildingName ?? b.BuildingName ?? b.name ?? '',
        })));
      })
      .catch(() => setBuildings([]));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      buildingId: buildings[0]?.id?.toString() || '',
      documentType: 'PCCC',
      title: '',
      issueDate: '',
      expiryDate: '',
      note: '',
    });
    setShowForm(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({
      buildingId: String(doc.buildingId),
      documentType: doc.documentType,
      title: doc.title,
      issueDate: doc.issueDate ? doc.issueDate.slice(0, 10) : '',
      expiryDate: doc.expiryDate ? doc.expiryDate.slice(0, 10) : '',
      note: doc.note || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        documentType: form.documentType,
        title: form.title,
        issueDate: form.issueDate || null,
        expiryDate: form.expiryDate || null,
        note: form.note || null,
      };
      if (editing) {
        await onUpdate(editing.id, payload);
      } else {
        await onCreate(Number(form.buildingId), payload);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (docId, file) => {
    if (!file) return;
    await onUploadFile(docId, file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink-deep">Giấy tờ pháp lý khu trọ</h3>
          <p className="text-sm text-muted">PCCC, giấy phép kinh doanh, hồ sơ điện nước...</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-accent-violet px-4 py-2.5 text-sm font-semibold text-white"
        >
          <FilePlus size={18} />
          Thêm giấy tờ
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-accent-violet" size={28} />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={`rounded-xl border p-4 ${
                doc.isExpired
                  ? 'border-[#f3c3d3] bg-[#fff5f8]'
                  : doc.isExpiringSoon
                    ? 'border-[#f0d6a8] bg-[#fff9ee]'
                    : 'border-hairline-cloud bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-surface-press p-2 text-accent-violet">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-ink-deep">{doc.title}</p>
                    <p className="text-xs text-muted">
                      {doc.buildingName} · {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(doc)} className="rounded-lg p-2 hover:bg-surface-press">
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(doc.id)}
                    className="rounded-lg p-2 text-[#b33f69] hover:bg-[#ffe0ea]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted">Ngày cấp</span>
                  <p className="font-medium">{formatLegalDate(doc.issueDate)}</p>
                </div>
                <div>
                  <span className="text-muted">Hết hạn</span>
                  <p className={`font-medium ${doc.isExpired ? 'text-[#b33f69]' : ''}`}>
                    {formatLegalDate(doc.expiryDate)}
                    {doc.daysUntilExpiry != null && doc.daysUntilExpiry >= 0 && (
                      <span className="text-muted"> ({doc.daysUntilExpiry} ngày)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-accent-violet-deep underline"
                  >
                    Xem file đính kèm
                  </a>
                ) : null}
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-press px-2.5 py-1 text-xs font-medium hover:bg-accent-violet/10">
                  <Upload size={14} />
                  Tải file
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => handleFileUpload(doc.id, e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>
          ))}
          {!documents.length && (
            <div className="col-span-full rounded-xl border border-dashed border-hairline-cloud py-12 text-center text-sm text-muted">
              Chưa có giấy tờ nào. Nhấn &quot;Thêm giấy tờ&quot; để bắt đầu.
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 className="text-lg font-bold text-ink-deep">
              {editing ? 'Cập nhật giấy tờ' : 'Thêm giấy tờ mới'}
            </h3>
            <div className="mt-4 space-y-3">
              {!editing && (
                <select
                  required
                  value={form.buildingId}
                  onChange={(e) => setForm((f) => ({ ...f, buildingId: e.target.value }))}
                  className="w-full rounded-lg border border-hairline-cloud px-3 py-2 text-sm"
                >
                  <option value="">Chọn tòa nhà</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.buildingName || b.name}</option>
                  ))}
                </select>
              )}
              <select
                value={form.documentType}
                onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value }))}
                className="w-full rounded-lg border border-hairline-cloud px-3 py-2 text-sm"
              >
                {DOCUMENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Tên giấy tờ"
                className="w-full rounded-lg border border-hairline-cloud px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Ngày cấp</label>
                  <DateInput
                    value={form.issueDate}
                    onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Ngày hết hạn</label>
                  <DateInput
                    value={form.expiryDate}
                    onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Ghi chú"
                className="w-full rounded-lg border border-hairline-cloud px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-surface-press"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-accent-violet px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BuildingDocumentsTab;
