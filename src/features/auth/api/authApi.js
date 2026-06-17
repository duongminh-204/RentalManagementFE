import axios from '../../../utils/api';

const authApi = {
    login: async (credentials) => {
        const response = await axios.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData) => {
        const response = await axios.post('/auth/register', userData);
        return response.data;
    },

    googleLogin: async (credential) => {
        const response = await axios.post('/auth/google', { credential });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await axios.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async ({ email, otp, newPassword }) => {
        const response = await axios.post('/auth/reset-password', { email, otp, newPassword });
        return response.data;
    }
};

export default authApi;