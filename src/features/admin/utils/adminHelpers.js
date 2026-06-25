export const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
};

export const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['active', 'success', 'enabled'].includes(normalized)) return 'bg-[#e8f8ef] text-[#1f7a45]';
  if (['expired', 'cancelled', 'disabled', 'failed'].includes(normalized)) return 'bg-[#fff0f3] text-[#b4234a]';
  if (['suspended', 'pending'].includes(normalized)) return 'bg-[#fff7e6] text-[#b26a00]';
  return 'bg-surface-press text-muted';
};

export const subscriptionStatusLabel = (status) => {
  const map = {
    active: 'Đang hoạt động',
    expired: 'Hết hạn',
    suspended: 'Tạm ngưng',
    none: 'Chưa đăng ký',
    pending: 'Chờ duyệt',
    cancelled: 'Đã hủy',
  };
  return map[String(status || '').toLowerCase()] || status || '—';
};

export const normalizeOwner = (raw) => {
  if (!raw) return null;
  return {
    ownerId: raw.ownerId ?? raw.OwnerId ?? raw.userId ?? raw.UserId,
    fullName: raw.fullName ?? raw.FullName ?? '',
    email: raw.email ?? raw.Email ?? '',
    phone: raw.phone ?? raw.Phone ?? raw.phoneNumber ?? raw.PhoneNumber ?? '',
    avatar: raw.avatar ?? raw.Avatar ?? '',
    package: raw.package ?? raw.Package ?? '',
    packageId: raw.packageId ?? raw.PackageId ?? null,
    subscriptionId: raw.subscriptionId ?? raw.SubscriptionId ?? null,
    subscriptionStatus: raw.subscriptionStatus ?? raw.SubscriptionStatus ?? 'None',
    subscriptionStartDate: raw.subscriptionStartDate ?? raw.SubscriptionStartDate ?? null,
    createdDate: raw.createdDate ?? raw.CreatedDate ?? raw.createdAt ?? raw.CreatedAt ?? null,
    updatedAt: raw.updatedAt ?? raw.UpdatedAt ?? null,
    expiredDate: raw.expiredDate ?? raw.ExpiredDate ?? null,
    isActive: raw.isActive ?? raw.IsActive ?? true,
    isSuspended: raw.isSuspended ?? raw.IsSuspended ?? false,
    roomCount: raw.roomCount ?? raw.RoomCount ?? 0,
    buildingCount: raw.buildingCount ?? raw.BuildingCount ?? 0,
    cccd: raw.cccd ?? raw.CCCD ?? raw.Cccd ?? '',
    address: raw.address ?? raw.Address ?? '',
    role: raw.role ?? raw.Role ?? 'Owner',
  };
};

export const normalizeAccount = (raw) => {
  if (!raw) return null;
  const role = raw.role ?? raw.Role ?? '';
  const userId = raw.userId ?? raw.UserId ?? raw.ownerId ?? raw.OwnerId;
  return {
    userId,
    fullName: raw.fullName ?? raw.FullName ?? '',
    email: raw.email ?? raw.Email ?? '',
    phoneNumber: raw.phoneNumber ?? raw.PhoneNumber ?? raw.phone ?? raw.Phone ?? '',
    avatar: raw.avatar ?? raw.Avatar ?? '',
    role: role || (raw.ownerId || raw.OwnerId ? 'Owner' : ''),
    isActive: raw.isActive ?? raw.IsActive ?? true,
    isSuspended: raw.isSuspended ?? raw.IsSuspended ?? false,
    createdAt: raw.createdAt ?? raw.CreatedAt ?? raw.createdDate ?? raw.CreatedDate ?? null,
    package: raw.package ?? raw.Package ?? '',
    subscriptionStatus: raw.subscriptionStatus ?? raw.SubscriptionStatus ?? null,
    expiredDate: raw.expiredDate ?? raw.ExpiredDate ?? null,
    roomCount: raw.roomCount ?? raw.RoomCount ?? 0,
    buildingCount: raw.buildingCount ?? raw.BuildingCount ?? 0,
    isOwner: String(role || (raw.ownerId || raw.OwnerId ? 'Owner' : '')).toLowerCase() === 'owner',
    isAdmin: String(role).toLowerCase() === 'admin',
  };
};

export const roleLabel = (role) => {
  const map = { admin: 'Quản trị', owner: 'Chủ trọ', tenant: 'Khách thuê' };
  return map[String(role || '').toLowerCase()] || role || '—';
};
