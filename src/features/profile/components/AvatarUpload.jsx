import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { getDefaultAvatar } from '../utils/profileHelpers';

const ACCEPTED = ['image/jpeg', 'image/png'];
const MAX_SIZE = 5 * 1024 * 1024;

export default function AvatarUpload({ avatar, fullName, role, onUpload }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handlePick = () => inputRef.current?.click();

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    if (!ACCEPTED.includes(file.type)) {
      setError('Chỉ chấp nhận ảnh JPG hoặc PNG.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Ảnh tối đa 5MB.');
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Tải ảnh thất bại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <img
          src={avatar || getDefaultAvatar(fullName)}
          alt={fullName || 'Avatar'}
          className="h-32 w-32 rounded-full object-cover ring-4 ring-surface-press"
          onError={(e) => {
            e.currentTarget.src = getDefaultAvatar(fullName);
          }}
        />
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-transform hover:scale-105 disabled:opacity-60"
          aria-label="Đổi ảnh đại diện"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      <p className="mt-4 font-display text-lg font-semibold text-ink-deep">
        {fullName || 'Người dùng'}
      </p>
      {role && (
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-violet-mid">
          {role}
        </p>
      )}
      {error && <p className="mt-2 text-sm text-accent-pink">{error}</p>}
      <p className="mt-2 text-xs text-muted">Nhấn vào biểu tượng máy ảnh để đổi ảnh (JPG/PNG, tối đa 5MB).</p>
    </div>
  );
}
