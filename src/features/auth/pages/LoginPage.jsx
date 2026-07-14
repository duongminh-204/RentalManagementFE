import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AuthIllustration from '../components/AuthIllustration';
import { useAuth, getRoleHomePath, getStoredUser } from '../../../hooks/useAuth';
import logo from '../../../assets/LOGOEXE.png';

export default function LoginPage() {
  const { isAuthenticated, role } = useAuth();
  const hasGoogleLogin = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const storedUser = getStoredUser();
  const redirectPath = isAuthenticated ? getRoleHomePath(role, storedUser) : '';

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="auth-canvas flex min-h-screen items-center justify-center px-4 py-6 sm:p-4">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
        <AuthIllustration title={<span className="text-white">TRO</span>} highlight="EZ" logoSrc={logo} />
        <div className="flex flex-col items-center gap-4">
          <LoginForm />
          {hasGoogleLogin && (
            <>
              <div className="flex w-full items-center gap-3">
                <span className="h-px flex-1 bg-hairline-cloud" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted">Hoặc</span>
                <span className="h-px flex-1 bg-hairline-cloud" />
              </div>
              <GoogleLoginButton />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
