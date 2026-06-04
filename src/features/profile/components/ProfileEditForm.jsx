import { useState } from 'react';
import { Save } from 'lucide-react';

const buildForm = (profile) => ({
  fullName: profile?.fullName || '',
  email: profile?.email || '',
  phoneNumber: profile?.phoneNumber || '',
  cccd: profile?.cccd || '',
  address: profile?.address || '',
});

export default function ProfileEditForm({ profile, onSave }) {
  const [form, setForm] = useState(() => buildForm(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
      setSuccess('Cập nhật thông tin thành công.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cập nhật thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-ink-deep">Thông tin cá nhân</h3>

      {error && (
        <div className="rounded-md border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-sm text-ink-deep">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md border border-accent-lime/40 bg-accent-lime/10 px-4 py-3 text-sm text-ink-deep">
          {success}
        </div>
      )}

      <div>
        <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Họ và tên</label>
        <input
          type="text"
          value={form.fullName}
          onChange={handleChange('fullName')}
          className="text-input"
          placeholder="Nhập họ và tên"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            className="text-input"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Số điện thoại</label>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={handleChange('phoneNumber')}
            className="text-input"
            placeholder="03xxxxxxxx"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-left text-sm font-medium text-ink-deep">CCCD</label>
        <input
          type="text"
          value={form.cccd}
          onChange={handleChange('cccd')}
          className="text-input"
          placeholder="Số căn cước công dân"
        />
      </div>

      <div>
        <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Địa chỉ</label>
        <input
          type="text"
          value={form.address}
          onChange={handleChange('address')}
          className="text-input"
          placeholder="Địa chỉ liên hệ"
        />
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        {!saving && <Save size={18} />}
      </button>
    </form>
  );
}
