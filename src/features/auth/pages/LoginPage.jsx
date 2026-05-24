import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import AuthIllustration from '../components/AuthIllustration';
import { useAuth, getRoleHomePath } from '../../../hooks/useAuth';

export default function LoginPage() {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return (
    <div className="auth-canvas flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
        <AuthIllustration title="Quản lý nhà trọ" highlight="Quản lý nhà trọ" icon="🏠" />
        <LoginForm />
      </div>
    </div>
  );
}
