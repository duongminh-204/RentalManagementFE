import api from '../../../utils/api';

export const getProfile = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/profile/me', data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/profile/change-password', data);
  return response.data;
};
