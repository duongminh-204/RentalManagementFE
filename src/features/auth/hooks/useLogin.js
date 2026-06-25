import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { getRoleHomePath } from '../../../hooks/useAuth';

const normalizeLoginResponse = (res) => {
  const result = res?.data?.data || res?.data || res;
  return {
    token: result?.token || result?.accessToken || result?.access_token || result?.authToken,
    user: result?.user || result?.data || result,
  };
};

export const useLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const login = async (phoneOrEmail, password) => {
        setLoading(true);
        setError('');

        try {
            if (!phoneOrEmail || !password) {
                throw new Error('Vui lòng nhập email/số điện thoại và mật khẩu');
            }

            const res = await authApi.login({ email: phoneOrEmail, password });
            const { token, user } = normalizeLoginResponse(res);

            if (!token) {
                throw new Error('Server không trả về token. Vui lòng thử lại.');
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user || {}));

            const redirectPath = getRoleHomePath(user?.role || '', user);
            navigate(redirectPath, { replace: true });

        } catch (err) {
            console.error('Login error details:', err);

            const errorMessage = 
                err.response?.data?.message || 
                err.message || 
                'Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.';

            setError(errorMessage);
        } finally {
            setLoading(false);   
        }
    };

    return { login, loading, error };
};