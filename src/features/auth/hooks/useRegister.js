import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const register = async (userData) => {
        setLoading(true);
        setError('');

        try {
            const res = await authApi.register(userData);
            
            // Lưu token và thông tin user
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            window.dispatchEvent(new CustomEvent('auth-changed'));

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error };
};
