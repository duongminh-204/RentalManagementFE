import axios from 'axios';
import { getStoredUser, isOwnerRole, isOwnerSubscriptionActive } from '../hooks/useAuth';

const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8090';
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  `${apiOrigin.replace(/\/+$/, '')}/api`;

const instance = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - thêm token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Dispatch custom event để PrivateRoute biết token không hợp lệ
            window.dispatchEvent(new CustomEvent('unauthorized'));

            const requestUrl = String(error.config?.url || '');
            if (requestUrl.includes('/subscriptions')) {
                error.response.data = {
                    ...(error.response.data || {}),
                    message: 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại để đăng ký gói.',
                };
            }
        }

        if (error.response?.status === 403 && String(error.config?.method || 'get').toLowerCase() !== 'get') {
            const user = getStoredUser();
            const skipSubscriptionPopup =
                isOwnerRole(user?.role) && !isOwnerSubscriptionActive(user);

            if (!skipSubscriptionPopup) {
                window.dispatchEvent(
                    new CustomEvent('forbidden', {
                        detail: {
                            message: error.response?.data?.message,
                            url: error.config?.url,
                            status: 403,
                        },
                    }),
                );
            }
        }
        return Promise.reject(error);
    }
);

export default instance; 