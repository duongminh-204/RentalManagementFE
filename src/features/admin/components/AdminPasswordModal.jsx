import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';

const AdminPasswordModal = ({ account, loading, saving, onClose, onSave }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(true);
  const [showNew, setShowNew] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowCurrent(true);
    setShowNew(true);
  }, [account?.userId]);

  useEffect(() => {
    if (typeof account?.password === 'string') {
      setCurrentPassword(account.password);
    }
  }, [account?.password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    await onSave(newPassword);
  };

  if (!account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink-deep">Mật khẩu người dùng</h2>
            <p className="mt-1 text-sm text-muted">{account.fullName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-press">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                readOnly
                type={showCurrent ? 'text' : 'password'}
                value={loading ? 'Đang tải...' : (currentPassword || 'Chưa có mật khẩu lưu trữ')}
                className="w-full rounded-xl border border-hairline-cloud bg-surface-press/40 px-4 py-2.5 pr-10 text-sm text-ink-deep"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-surface-press"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 pr-10 text-sm outline-none focus:border-accent-violet"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:bg-surface-press"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Xác nhận mật khẩu mới
            </label>
            <input
              type={showNew ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
            />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-[#b4234a]">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="dashboard-action-button !w-auto !min-w-0" onClick={onClose}>
            Huỷ
          </button>
          <button type="submit" disabled={saving || loading} className="dashboard-action-button dashboard-action-button--primary !w-auto !min-w-0">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPasswordModal;
