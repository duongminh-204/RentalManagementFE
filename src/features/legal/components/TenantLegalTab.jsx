import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, User, X } from 'lucide-react';
import ChecklistItemCard from './ChecklistItemCard';
import { formatLegalDate } from '../utils/legalHelpers';

const TenantLegalDetailPanel = ({
  tenantId,
  onClose,
  fetchDetail,
  onSaveProfile,
  onUploadDoc,
}) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    tempResidenceCompleted: false,
  });
  const depositRef = useRef(null);
  const tempRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDetail(tenantId);
        if (!active) return;
        setDetail(data);
        setForm({
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
          emergencyContactRelation: data.emergencyContactRelation || '',
          tempResidenceCompleted: Boolean(data.tempResidenceCompleted),
        });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [tenantId, fetchDetail]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveProfile(tenantId, form);
      const refreshed = await fetchDetail(tenantId);
      setDetail(refreshed);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (docType, file) => {
    if (!file) return;
    await onUploadDoc(tenantId, docType, file);
    const refreshed = await fetchDetail(tenantId);
    setDetail(refreshed);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-accent-violet" size={28} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-hairline-cloud px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent-violet/10 p-2 text-accent-violet">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-ink-deep">{detail?.fullName}</h3>
            <p className="text-xs text-muted">
              Phòng {detail?.roomName || '—'} · Hoàn thiện {detail?.completionPercent}%
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-press">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline-cloud bg-surface-light p-3 text-sm">
            <p className="text-muted">CCCD</p>
            <p className="font-semibold">{detail?.cccd || 'Chưa có'}</p>
          </div>
          <div className="rounded-xl border border-hairline-cloud bg-surface-light p-3 text-sm">
            <p className="text-muted">Ngày vào ở</p>
            <p className="font-semibold">{formatLegalDate(detail?.moveInDate)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-ink-deep">Checklist hồ sơ</h4>
          {(detail?.items ?? []).map((item) => (
            <ChecklistItemCard
              key={item.key}
              item={item}
              onUpload={
                item.key === 'deposit_receipt'
                  ? () => depositRef.current?.click()
                  : item.key === 'temp_residence'
                    ? () => tempRef.current?.click()
                    : null
              }
              uploadLabel={item.key === 'temp_residence' ? 'Tải giấy tạm trú' : 'Tải biên nhận'}
            />
          ))}
        </div>

        <div className="rounded-xl border border-hairline-cloud p-4">
          <h4 className="mb-3 text-sm font-bold text-ink-deep">Liên hệ khẩn cấp</h4>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border border-hairline-cloud px-3 py-2 text-sm outline-none focus:border-accent-violet"
              placeholder="Họ tên"
              value={form.emergencyContactName}
              onChange={(e) => setForm((f) => ({ ...f, emergencyContactName: e.target.value }))}
            />
            <input
              className="rounded-lg border border-hairline-cloud px-3 py-2 text-sm outline-none focus:border-accent-violet"
              placeholder="Số điện thoại"
              value={form.emergencyContactPhone}
              onChange={(e) => setForm((f) => ({ ...f, emergencyContactPhone: e.target.value }))}
            />
            <input
              className="rounded-lg border border-hairline-cloud px-3 py-2 text-sm outline-none focus:border-accent-violet sm:col-span-2"
              placeholder="Mối quan hệ"
              value={form.emergencyContactRelation}
              onChange={(e) => setForm((f) => ({ ...f, emergencyContactRelation: e.target.value }))}
            />
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.tempResidenceCompleted}
              onChange={(e) => setForm((f) => ({ ...f, tempResidenceCompleted: e.target.checked }))}
            />
            Đã hoàn tất khai báo tạm trú
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-4 rounded-lg bg-accent-violet px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>

      <input
        ref={depositRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleUpload('deposit-receipt', e.target.files?.[0])}
      />
      <input
        ref={tempRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleUpload('temp-residence', e.target.files?.[0])}
      />
    </div>
  );
};

const TenantLegalTab = ({ tenants, onSelectTenant, search, onSearchChange }) => {
  const filtered = tenants.filter((t) =>
    !search || t.fullName.toLowerCase().includes(search.toLowerCase()) ||
    (t.roomName || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm khách thuê, phòng..."
          className="w-full rounded-xl border border-hairline-cloud py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-violet"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((tenant) => (
          <button
            key={tenant.tenantId}
            type="button"
            onClick={() => onSelectTenant(tenant.tenantId)}
            className="rounded-xl border border-hairline-cloud bg-white p-4 text-left transition hover:border-accent-violet/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-ink-deep">{tenant.fullName}</p>
                <p className="text-xs text-muted">Phòng {tenant.roomName || '—'}</p>
              </div>
              {tenant.tempResidencePending && (
                <span className="rounded-full bg-[#ffe0ea] px-2 py-0.5 text-[10px] font-bold text-[#b33f69]">
                  Tạm trú
                </span>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">Hoàn thiện</span>
                <span className="font-bold text-ink-deep">{tenant.completionPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-press">
                <div
                  className="h-full rounded-full bg-accent-violet transition-all"
                  style={{ width: `${tenant.completionPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted">
                {tenant.completedCount}/{tenant.totalCount} hạng mục
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export { TenantLegalTab, TenantLegalDetailPanel };
