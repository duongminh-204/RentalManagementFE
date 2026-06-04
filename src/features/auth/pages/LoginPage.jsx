import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
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
        <div className="flex flex-col items-center gap-4">
          <LoginForm />
          <div className="flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-hairline-cloud" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Hoặc</span>
            <span className="h-px flex-1 bg-hairline-cloud" />
          </div>
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
}
