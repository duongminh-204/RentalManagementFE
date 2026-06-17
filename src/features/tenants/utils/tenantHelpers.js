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

export const normalizeTenantFromApi = (raw) => {
  if (!raw) return null;
  const id = raw.id ?? raw.userId ?? raw.UserId;
  return {
    id,
    fullName: raw.fullName ?? raw.FullName ?? '',
    phoneNumber: raw.phoneNumber ?? raw.PhoneNumber ?? '',
    email: raw.email ?? raw.Email ?? '',
    cccd: raw.cccd ?? raw.Cccd ?? raw.CCCD ?? '',
    idCardImage: resolveMediaUrl(raw.idCardImage ?? raw.IdCardImage ?? raw.cccdImage),
    avatar: resolveAvatarUrl(raw.avatar ?? raw.Avatar),
    address: raw.address ?? raw.Address ?? '',
    dateOfBirth: raw.dateOfBirth ?? raw.DateOfBirth ?? '',
    gender: raw.gender ?? raw.Gender ?? '',
    workplace: raw.workplace ?? raw.Workplace ?? '',
    occupation: raw.occupation ?? raw.Occupation ?? '',
    isActive: raw.isActive ?? raw.IsActive ?? true,
    status: raw.status ?? 'inactive',
    roomId: raw.roomId ?? raw.RoomId ?? null,
    roomNumber: raw.roomNumber ?? raw.RoomNumber ?? '',
    contractId: raw.contractId ?? raw.ContractId ?? null,
    moveInDate: raw.moveInDate ?? raw.MoveInDate ?? null,
    moveOutDate: raw.moveOutDate ?? raw.MoveOutDate ?? null,
    deposit: raw.deposit ?? raw.Deposit ?? 0,
    notes: raw.notes ?? raw.Notes ?? raw.note ?? '',
    createdAt: raw.createdAt ?? raw.CreatedAt ?? null,
    history: (raw.history ?? raw.History ?? []).map(normalizeHistoryFromApi),
  };
};

export const normalizeHistoryFromApi = (raw) => ({
  contractId: raw.contractId ?? raw.ContractId,
  roomId: raw.roomId ?? raw.RoomId,
  roomNumber: raw.roomNumber ?? raw.RoomNumber ?? '',
  startDate: raw.startDate ?? raw.StartDate,
  endDate: raw.endDate ?? raw.EndDate,
  deposit: raw.deposit ?? raw.Deposit ?? 0,
  status: raw.status ?? raw.Status ?? '',
  notes: raw.notes ?? raw.Notes ?? '',
  createdAt: raw.createdAt ?? raw.CreatedAt,
});

export const normalizeTenantsList = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.data ?? [];
  return list.map(normalizeTenantFromApi).filter(Boolean);
};

export const denormalizeTenantForApi = (form) => ({
  fullName: form.fullName?.trim(),
  phoneNumber: form.phoneNumber?.trim() || null,
  email: form.email?.trim() || null,
  cccd: form.cccd?.replace(/\s/g, '') || null,
  address: form.address?.trim() || null,
  dateOfBirth: form.dateOfBirth || null,
  gender: form.gender || null,
  workplace: form.workplace?.trim() || null,
  occupation: form.occupation?.trim() || null,
  roomId: form.roomId ? Number(form.roomId) : null,
  moveInDate: form.moveInDate || null,
  moveOutDate: form.moveOutDate || null,
  deposit: Number(form.deposit) || 0,
  notes: form.notes?.trim() || null,
  isActive: form.isActive !== false,
  status: form.status || undefined,
});

export const formatPhoneNumber = (phone) => {
  if (!phone) return '—';
  return phone;
};

export const validatePhoneNumber = (phone) => {
  if (!phone?.trim()) return true;
  return /^(\+84|0)[0-9]{9,10}$/.test(phone.replace(/\s/g, ''));
};

export const validateCCCD = (cccd) => {
  if (!cccd?.trim()) return true;
  return /^\d{12}$/.test(cccd.replace(/\D/g, ''));
};

export const formatCCCD = (cccd) => {
  if (!cccd) return '';
  const cleaned = cccd.replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  return cccd;
};

export const getTenantStatusLabel = (status) => {
  const map = {
    active: 'Đang thuê',
    inactive: 'Chưa thuê',
    moved_out: 'Đã trả phòng',
    pending: 'Đang chờ',
  };
  return map[status] || status || '—';
};

export const getTenantStatusBadgeClass = (status) => {
  const map = {
    active: 'bg-accent-lime/20 text-ink-deep border-accent-lime/40',
    inactive: 'bg-surface-press text-muted border-hairline-cloud',
    moved_out: 'bg-accent-pink/15 text-ink-deep border-accent-pink/30',
    pending: 'bg-accent-violet-mid/20 text-ink-deep border-hairline-violet',
  };
  return map[status] || 'bg-surface-press text-muted border-hairline-cloud';
};

export const getTenantStatusColor = getTenantStatusBadgeClass;

export const calculateStayDuration = (moveInDate, moveOutDate = null) => {
  if (!moveInDate) return '—';
  const start = new Date(moveInDate);
  const end = moveOutDate ? new Date(moveOutDate) : new Date();
  const diffDays = Math.max(0, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;
  if (months > 0) return `${months} tháng ${days} ngày`;
  return `${diffDays} ngày`;
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(
    Number(amount) || 0
  );

export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
};

export const toInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export const resolveAvatarUrl = (url) => {
  return resolveMediaUrl(url); 
};


export const getDefaultAvatar = (fullName = '') => {
  if (!fullName) return null;
  const initial = fullName.trim().charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6B46C1&color=fff&size=128`;
};