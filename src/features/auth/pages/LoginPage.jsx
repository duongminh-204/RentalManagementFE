import { Navigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import AuthIllustration from '../components/AuthIllustration';
import { useAuth, getRoleHomePath } from '../../../hooks/useAuth';
import logo from '../../../assets/LOGOEXE.png';

export default function LoginPage() {
  const { isAuthenticated, role } = useAuth();
  const hasGoogleLogin = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return (
    <div className="auth-canvas flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
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
