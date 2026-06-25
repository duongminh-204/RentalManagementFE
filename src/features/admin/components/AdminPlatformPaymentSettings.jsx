import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Save } from 'lucide-react';
import { getAdminPaymentSettings, updateAdminPaymentSettings } from '../api/adminApi';
import { BANK_OPTIONS } from '../../../utils/paymentMethods';
import { buildVietQrImageUrl } from '../../../utils/vietqr';

const emptyForm = {
  bankName: '',
  bankId: '',
  accountNumber: '',
  accountName: '',
};

export default function AdminPlatformPaymentSettings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminPaymentSettings()
      .then((data) => {
        setForm({
          bankName: data.bankName || '',
          bankId: data.bankId || '',
          accountNumber: data.accountNumber || '',
          accountName: data.accountName || '',
        });
      })
      .catch(() => setError('Không thể tải cấu hình tài khoản.'))
      .finally(() => setLoading(false));
  }, []);

  const previewQrUrl = useMemo(
    () =>
      buildVietQrImageUrl({
        bankId: form.bankId,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        template: 'compact',
      }),
    [form.accountName, form.accountNumber, form.bankId],
  );

  const handleBankChange = (bankName) => {
    const bank = BANK_OPTIONS.find((item) => item.name === bankName);
    setForm((prev) => ({
      ...prev,
      bankName,
      bankId: bank?.logoCode || '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const saved = await updateAdminPaymentSettings(form);
      setForm({
        bankName: saved.bankName || '',
        bankId: saved.bankId || '',
        accountNumber: saved.accountNumber || '',
        accountName: saved.accountName || '',
      });
      setMessage('Đã lưu tài khoản nhận tiền. Chủ trọ sẽ thấy VietQR khi đăng ký gói.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section-card mb-6 flex justify-center py-10">
        <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dashboard-section-card mb-6">
      <div className="mb-5">
        <h2 className="font-display text-lg font-bold text-ink-deep">Tài khoản nhận tiền đăng ký gói</h2>
        <p className="mt-1 text-sm text-muted">
          Cấu hình tài khoản ngân hàng Admin. Khi chủ trọ chọn gói, hệ thống sinh VietQR với số tiền và nội dung tự động.
        </p>
      </div>

      {error ? <div className="mb-4 rounded-xl bg-[#fff6f9] px-4 py-3 text-sm text-[#b4234a]">{error}</div> : null}
      {message ? <div className="mb-4 rounded-xl bg-[#f2fff7] px-4 py-3 text-sm text-[#1f7a45]">{message}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-deep">Ngân hàng</span>
            <select
              className="text-input"
              value={form.bankName}
              onChange={(e) => handleBankChange(e.target.value)}
              required
            >
              <option value="">Chọn ngân hàng</option>
              {BANK_OPTIONS.map((bank) => (
                <option key={bank.name} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-deep">Mã VietQR (logoCode)</span>
            <input className="text-input" value={form.bankId} readOnly placeholder="Tự điền khi chọn ngân hàng" />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-deep">Số tài khoản</span>
            <input
              className="text-input"
              value={form.accountNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
              required
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink-deep">Tên chủ tài khoản</span>
            <input
              className="text-input"
              value={form.accountName}
              onChange={(e) => setForm((prev) => ({ ...prev, accountName: e.target.value }))}
              required
            />
          </label>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline-cloud bg-surface-press p-4">
          {previewQrUrl ? (
            <img src={previewQrUrl} alt="Xem trước VietQR Admin" className="h-44 w-44 object-contain" />
          ) : (
            <p className="text-center text-xs text-muted">Nhập đủ thông tin để xem trước QR</p>
          )}
          <p className="mt-3 text-center text-xs text-muted">Xem trước mã VietQR tĩnh</p>
        </div>

        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Lưu tài khoản nhận tiền
          </button>
        </div>
      </form>
    </div>
  );
}
