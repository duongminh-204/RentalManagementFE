const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api').replace(/\/api\/?$/, '') ||
  'http://localhost:8090';

export const resolveMediaUrl = (url) => {
  if (!url) return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) {
    return s;
  }
  return s.startsWith('/') ? `${API_ORIGIN}${s}` : `${API_ORIGIN}/${s}`;
};

export const getDefaultAvatar = (fullName = '') => {
  const initial = fullName.trim().charAt(0).toUpperCase() || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6B46C1&color=fff&size=160`;
};

export const normalizeProfile = (raw) => {
  if (!raw) return null;
  const data = raw.data ?? raw;
  return {
    userId: data.userId ?? data.UserId ?? null,
    fullName: data.fullName ?? data.FullName ?? '',
    email: data.email ?? data.Email ?? '',
    phoneNumber: data.phoneNumber ?? data.PhoneNumber ?? '',
    cccd: data.cccd ?? data.CCCD ?? data.Cccd ?? '',
    address: data.address ?? data.Address ?? '',
    avatar: resolveMediaUrl(data.avatar ?? data.Avatar) || '',
    role: data.role ?? data.Role ?? '',
    createdAt: data.createdAt ?? data.CreatedAt ?? null,
  };
};

// Cập nhật user trong localStorage để Header phản ánh thông tin mới
export const syncStoredUser = (profile) => {
  try {
    const raw = localStorage.getItem('user');
    const current = raw ? JSON.parse(raw) : {};
    const merged = {
      ...current,
      fullName: profile.fullName,
      FullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      avatar: profile.avatar,
      role: profile.role || current.role,
    };
    localStorage.setItem('user', JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('user-updated', { detail: merged }));
  } catch {
    // Bỏ qua nếu localStorage không khả dụng
  }
};
