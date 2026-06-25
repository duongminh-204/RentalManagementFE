import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gift, Loader2, Save } from 'lucide-react';
import { getAdminOwnerFeatureGrants, updateAdminOwnerFeatureGrants } from '../api/adminApi';
import { formatDate } from '../utils/adminHelpers';

const toDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const AdminOwnerFeatureGrants = ({ ownerId, packageName, onSaved }) => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!ownerId) return;
    try {
      setLoading(true);
      setError('');
      const data = await getAdminOwnerFeatureGrants(ownerId);
      setFeatures(data.features || []);
    } catch (err) {
      if (!err.response) {
        setError(
          'Không thể kết nối API cấp quyền. Thường do backend chưa deploy bản mới hoặc database chưa chạy migration OwnerFeatureGrants.',
        );
      } else {
        setError(err.response?.data?.message || 'Không thể tải quyền tính năng.');
      }
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    load();
  }, [load]);

  const trialFeatures = useMemo(
    () => features.filter((item) => !item.includedInPackage),
    [features],
  );

  const toggleGrant = (featureKey, granted) => {
    setFeatures((prev) =>
      prev.map((item) =>
        item.feature === featureKey
          ? { ...item, manuallyGranted: granted, isEffective: granted || item.includedInPackage }
          : item,
      ),
    );
  };

  const updateExpiry = (featureKey, expiresAt) => {
    setFeatures((prev) =>
      prev.map((item) => (item.feature === featureKey ? { ...item, expiresAt: expiresAt || null } : item)),
    );
  };

  const updateNote = (featureKey, note) => {
    setFeatures((prev) =>
      prev.map((item) => (item.feature === featureKey ? { ...item, note } : item)),
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      const grants = trialFeatures.map((item) => ({
        feature: item.feature,
        granted: Boolean(item.manuallyGranted),
        expiresAt: item.manuallyGranted && item.expiresAt ? item.expiresAt : null,
        note: item.manuallyGranted ? item.note || null : null,
      }));
      const data = await updateAdminOwnerFeatureGrants(ownerId, { grants });
      setFeatures(data.features || []);
      setMessage('Đã cập nhật quyền dùng thử.');
      onSaved?.();
    } catch (err) {
      if (!err.response) {
        setError(
          'Không thể kết nối API cấp quyền. Thường do backend chưa deploy bản mới hoặc database chưa chạy migration OwnerFeatureGrants.',
        );
      } else {
        setError(err.response?.data?.message || 'Không thể lưu quyền tính năng.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted">Cấp quyền dùng thử</h4>
        {packageName ? (
          <span className="rounded-full bg-surface-press px-2.5 py-0.5 text-[11px] font-semibold text-muted">
            Gói: {packageName}
          </span>
        ) : null}
      </div>

      <p className="mb-3 text-xs leading-relaxed text-muted">
        Bật từng tính năng ngoài gói để chủ trọ trải nghiệm trước khi nâng cấp. Có thể đặt ngày hết hạn cho mỗi quyền.
      </p>

      {error ? <div className="mb-3 rounded-lg bg-[#fff6f9] px-3 py-2 text-xs text-[#b4234a]">{error}</div> : null}
      {message ? <div className="mb-3 rounded-lg bg-[#f8fff0] px-3 py-2 text-xs font-semibold text-[#1f7a45]">{message}</div> : null}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-hairline-cloud p-3">
          {features.map((item) => {
            const isPackageFeature = item.includedInPackage;
            const isTrialActive = item.manuallyGranted && !isPackageFeature;

            return (
              <div
                key={item.feature}
                className={`rounded-lg border px-3 py-2.5 ${
                  isPackageFeature
                    ? 'border-hairline-cloud/80 bg-surface-light/60'
                    : isTrialActive
                      ? 'border-[#d4e8ff] bg-[#f5faff]'
                      : 'border-hairline-cloud bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-hairline-cloud text-accent-violet focus:ring-accent-violet"
                    checked={isPackageFeature || Boolean(item.manuallyGranted)}
                    disabled={isPackageFeature}
                    onChange={(e) => toggleGrant(item.feature, e.target.checked)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-deep">{item.label}</p>
                      <span className="rounded-full bg-surface-press px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                        {item.requiredPackage}
                      </span>
                      {isPackageFeature ? (
                        <span className="rounded-full bg-[#e8f8ef] px-2 py-0.5 text-[10px] font-semibold text-[#1f7a45]">
                          Có trong gói
                        </span>
                      ) : null}
                      {isTrialActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#3b5bdb]">
                          <Gift className="h-3 w-3" /> Dùng thử
                        </span>
                      ) : null}
                    </div>

                    {!isPackageFeature && item.manuallyGranted ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <label className="block text-xs text-muted">
                          Hết hạn (tuỳ chọn)
                          <input
                            type="date"
                            className="mt-1 w-full rounded-lg border border-hairline-cloud px-2.5 py-1.5 text-sm text-ink-deep outline-none focus:border-accent-violet"
                            value={toDateInputValue(item.expiresAt)}
                            onChange={(e) =>
                              updateExpiry(item.feature, e.target.value ? new Date(e.target.value).toISOString() : null)
                            }
                          />
                        </label>
                        <label className="block text-xs text-muted sm:col-span-2">
                          Ghi chú
                          <input
                            type="text"
                            className="mt-1 w-full rounded-lg border border-hairline-cloud px-2.5 py-1.5 text-sm text-ink-deep outline-none focus:border-accent-violet"
                            placeholder="VD: Dùng thử 7 ngày"
                            value={item.note || ''}
                            onChange={(e) => updateNote(item.feature, e.target.value)}
                          />
                        </label>
                      </div>
                    ) : null}

                    {isPackageFeature && item.isEffective ? (
                      <p className="mt-1 text-xs text-muted">Tính năng đã được bao gồm trong gói hiện tại.</p>
                    ) : null}
                    {!isPackageFeature && item.expiresAt && item.manuallyGranted ? (
                      <p className="mt-1 text-xs text-muted">Hết hạn: {formatDate(item.expiresAt)}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={loading || saving}
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent-violet bg-accent-violet px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? 'Đang lưu...' : 'Lưu quyền dùng thử'}
        </button>
      </div>
    </div>
  );
};

export default AdminOwnerFeatureGrants;
