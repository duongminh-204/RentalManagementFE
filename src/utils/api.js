import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8090/api',
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
        }
        return Promise.reject(error);
    }
);

export default instance; 