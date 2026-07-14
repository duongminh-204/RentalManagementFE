const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    return {
      ...user,
      userId: user.userId ?? user.UserId ?? user.id ?? user.Id,
      fullName: user.fullName ?? user.FullName,
      email: user.email ?? user.Email,
      phoneNumber: user.phoneNumber ?? user.PhoneNumber,
      role: user.role ?? user.Role,
      subscriptionStatus: user.subscriptionStatus ?? user.SubscriptionStatus,
      packageId: user.packageId ?? user.PackageId,
      packageName: user.packageName ?? user.PackageName,
      hasTrialAccess: user.hasTrialAccess ?? user.HasTrialAccess ?? false,
      hasPendingUpgrade: user.hasPendingUpgrade ?? user.HasPendingUpgrade ?? false,
      effectiveFeatures: user.effectiveFeatures ?? user.EffectiveFeatures ?? [],
    };
  } catch {
    return null;
  }
};

export const updateStoredUser = (patch) => {
  try {
    const current = getStoredUser() || {};
    const merged = { ...current, ...patch };
    localStorage.setItem('user', JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('user-updated', { detail: merged }));
    return merged;
  } catch {
    return getStoredUser();
  }
};

export const getStoredRole = () => getStoredUser()?.role || '';

export const isAdminRole = (role) => normalizeRole(role) === 'admin';
export const isOwnerRole = (role) => normalizeRole(role) === 'owner';

export const isOwnerSubscriptionActive = (user) =>
  isOwnerRole(user?.role) && normalizeRole(user?.subscriptionStatus) === 'active';

export const hasOwnerTrialAccess = (user) =>
  isOwnerRole(user?.role) && Boolean(user?.hasTrialAccess);

export const canOwnerUseApp = (user) =>
  isOwnerSubscriptionActive(user) || hasOwnerTrialAccess(user);

export const isOwnerSubscriptionPending = (user) =>
  isOwnerRole(user?.role) && normalizeRole(user?.subscriptionStatus) === 'pending';

export const hasOwnerPendingUpgrade = (user) =>
  isOwnerRole(user?.role) && user?.hasPendingUpgrade === true;

export const needsSubscriptionPayment = (user) =>
  isOwnerSubscriptionPending(user) || hasOwnerPendingUpgrade(user);

export const isOwnerSubscriptionReady = (user) =>
  isOwnerSubscriptionActive(user) || isOwnerSubscriptionPending(user);

export const getOwnerAccessPath = (user) => {
  if (!isOwnerRole(user?.role)) return '/dashboard';
  const status = normalizeRole(user?.subscriptionStatus);
  if (status === 'active' || hasOwnerTrialAccess(user)) return '/dashboard';
  if (status === 'pending') return '/subscription/pending';
  return '/register/select-plan';
};

export const getRoleLabel = (role) => {
  switch (normalizeRole(role)) {
    case 'admin':
      return 'Quản trị hệ thống';
    case 'owner':
      return 'Chủ trọ';
    case 'tenant':
      return 'Người thuê trọ';
    default:
      return 'Chưa có quyền';
  }
};

export const getRoleHomePath = (role, user) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'owner') return getOwnerAccessPath(user || getStoredUser());
  if (normalizedRole === 'tenant') return '/profile';
  return '';

};

export const useAuth = () => {
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const role = user?.role || '';

  return {
    token,
    user,
    role,
    isAuthenticated: Boolean(token),
    isAdmin: isAdminRole(role),
    isOwner: isOwnerRole(role),
    isOwnerSubscriptionActive: isOwnerSubscriptionActive(user),
  };
};
