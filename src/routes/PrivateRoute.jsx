import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { getStoredRole, getRoleHomePath, getStoredUser } from '../hooks/useAuth';

export const PrivateRoute = ({ children, allowedRoles }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(Boolean(token));
      setRole(getStoredRole());
      setIsChecking(false);
    };

    checkAuth();

    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setRole('');
    };

    window.addEventListener('storage', checkAuth);
    window.addEventListener('unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('unauthorized', handleUnauthorized);
    };
  }, []);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-light">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-hairline-cloud border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const normalizedRole = role?.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map((allowedRole) => String(allowedRole).trim().toLowerCase()) || [];

  if (normalizedRole === 'admin' && normalizedAllowedRoles.length === 0) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes(normalizedRole)) {
    const fallbackPath = getRoleHomePath(role, getStoredUser());

    if (!fallbackPath) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/" replace />;
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-surface-light">
      <Sidebar />
      <div className="min-w-0 lg:pl-64">
        <main className="min-h-screen min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default PrivateRoute;
