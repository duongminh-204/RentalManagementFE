import api from '../../../utils/api';

const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8090';

export const resolveMediaUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${apiOrigin.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getDecorStyles = async () => {
  const { data } = await api.get('/room-decor/styles');
  return data;
};

export const getDecorStatus = async () => {
  const { data } = await api.get('/room-decor/status');
  return data;
};

/** Upload ảnh phòng và gọi AI decor qua ComfyUI */
export const generateRoomDecor = async ({
  file,
  styleId,
  customPrompt,
  roomId,
  saveToRoom = false,
}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (styleId) formData.append('styleId', styleId);
  if (customPrompt) formData.append('customPrompt', customPrompt);
  if (roomId) formData.append('roomId', String(roomId));
  formData.append('saveToRoom', saveToRoom ? 'true' : 'false');

  const { data } = await api.post('/room-decor/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 240000,
  });
  return data;
};
