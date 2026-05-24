import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

const roleHomePaths = {
  Admin: '/admin/excel-template',
  Owner: '/dashboard',
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
        throw new Error('Vui lòng nhập email hoặc số điện thoại và mật khẩu.');
      }

      const res = await authApi.login({ email: phoneOrEmail, password });

      if (!res?.token) {
        throw new Error('Server không trả về token. Vui lòng thử lại.');
      }

      const user = res.user || {};
      const destination = roleHomePaths[user.role];

      if (!destination) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Tài khoản này chưa được cấp quyền vào khu vực quản lý.');
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(destination, { replace: true });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
