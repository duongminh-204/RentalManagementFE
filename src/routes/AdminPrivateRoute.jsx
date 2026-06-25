import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AdminSidebar from '../features/admin/components/AdminSidebar';
import { getStoredRole, getRoleHomePath, isAdminRole } from '../hooks/useAuth';

export const AdminPrivateRoute = ({ children }) => {
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
    window.addEventListener('storage', checkAuth);
    window.addEventListener('unauthorized', () => {
      setIsAuthenticated(false);
      setRole('');
    });

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-light">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-hairline-cloud border-t-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdminRole(role)) {
    return <Navigate to={getRoleHomePath(role) || '/'} replace />;
  }

  return (
    <div className="min-h-screen min-w-0 overflow-x-clip bg-surface-light">
      <AdminSidebar />
      <div className="min-w-0 lg:pl-64">
        <main className="min-h-screen min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminPrivateRoute;
