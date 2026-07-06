import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';
import { getOwnerAccessPath, isOwnerRole } from '../../../hooks/useAuth';

export const useRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const register = async (userData) => {
        setLoading(true);
        setError('');

        try {
            const res = await authApi.register(userData);
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
            window.dispatchEvent(new CustomEvent('auth-changed'));

            if (isOwnerRole(res.user?.role)) {
                navigate(getOwnerAccessPath(res.user), { replace: true });
            } else {
                navigate('/profile', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return { register, loading, error };
};
