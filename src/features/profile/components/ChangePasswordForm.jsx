import { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordForm({ onChangePassword }) {
  const [form, setForm] = useState(EMPTY);
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const toggle = (field) => () => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword || !form.newPassword) {
      setError('Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setSaving(true);
    try {
      await onChangePassword(form.currentPassword, form.newPassword);
      setSuccess('Đổi mật khẩu thành công.');
      setForm(EMPTY);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'currentPassword', label: 'Mật khẩu hiện tại', toggleKey: 'current', placeholder: 'Nhập mật khẩu hiện tại' },
    { key: 'newPassword', label: 'Mật khẩu mới', toggleKey: 'next', placeholder: 'Tối thiểu 6 ký tự' },
    { key: 'confirmPassword', label: 'Xác nhận mật khẩu mới', toggleKey: 'confirm', placeholder: 'Nhập lại mật khẩu mới' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="font-display text-lg font-semibold text-ink-deep">Đổi mật khẩu</h3>

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

      {fields.map((field) => (
        <div key={field.key}>
          <label className="mb-1 block text-left text-sm font-medium text-ink-deep">{field.label}</label>
          <div className="relative">
            <input
              type={show[field.toggleKey] ? 'text' : 'password'}
              value={form[field.key]}
              onChange={handleChange(field.key)}
              className="text-input pr-12"
              placeholder={field.placeholder}
              autoComplete={field.key === 'currentPassword' ? 'current-password' : 'new-password'}
              required
            />
            <button
              type="button"
              onClick={toggle(field.toggleKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            >
              {show[field.toggleKey] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      ))}

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
        {!saving && <KeyRound size={18} />}
      </button>
    </form>
  );
}
