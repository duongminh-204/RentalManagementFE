import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { getRoleHomePath } from '../../../hooks/useAuth';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Tải script Google Identity Services một lần (không thêm dependency npm)
const loadGsiScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Không tải được Google Sign-In.')));
      return;
    }
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Không tải được Google Sign-In.'));
    document.head.appendChild(script);
  });

// Chuẩn hóa response giống luồng đăng nhập hiện tại (AuthResponseDto)
const normalizeAuthResponse = (res) => {
  const result = res?.data || res;
  return {
    token: result?.token || result?.accessToken || result?.authToken,
    user: result?.user || {},
  };
};

export default function GoogleLoginButton() {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    const handleCredential = async (response) => {
      try {
        const data = await authApi.googleLogin(response.credential);
        const { token, user } = normalizeAuthResponse(data);

        if (!token) {
          throw new Error('Server không trả về token. Vui lòng thử lại.');
        }

        // Lưu phiên đăng nhập giống hệt luồng login hiện tại
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user || {}));

        navigate(getRoleHomePath(user?.role || '', user), { replace: true });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Đăng nhập Google thất bại! Vui lòng thử lại.'
        );
      }
    };

    loadGsiScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={buttonRef} />
      {error && <p className="text-sm text-accent-pink">{error}</p>}
    </div>
  );
}
