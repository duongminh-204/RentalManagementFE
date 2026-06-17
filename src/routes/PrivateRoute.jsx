import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { getStoredRole, getRoleHomePath } from '../hooks/useAuth';

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
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role?.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map((allowedRole) => String(allowedRole).trim().toLowerCase()) || [];

  if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes(normalizedRole)) {
    const fallbackPath = getRoleHomePath(role);

    if (!fallbackPath) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-light">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default PrivateRoute;
