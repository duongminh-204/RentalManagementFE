const normalizeRole = (role) => String(role || '').trim().toLowerCase();

export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const getStoredRole = () => getStoredUser()?.role || '';

export const isAdminRole = (role) => normalizeRole(role) === 'admin';
export const isOwnerRole = (role) => normalizeRole(role) === 'owner';

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

export const getRoleHomePath = (role) => {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'owner') return '/dashboard';
  return '/dashboard';
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
  };
};
