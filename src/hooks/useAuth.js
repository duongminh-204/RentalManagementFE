export const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

export const getStoredRole = () => getStoredUser()?.role || '';

export const isAdminRole = (role) => role === 'Admin';
export const isOwnerRole = (role) => role === 'Owner';

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
