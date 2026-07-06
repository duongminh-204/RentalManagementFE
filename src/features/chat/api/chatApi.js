import api from '../../../utils/api';

const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8090';
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  `${apiOrigin.replace(/\/+$/, '')}/api`;

export const toAssetUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
};

export const createConversation = async (payload) => {
  const response = await api.post('/chat/conversations', payload);
  return response.data;
};

export const getVisitorMessages = async (publicToken) => {
  const response = await api.get(`/chat/conversations/${encodeURIComponent(publicToken)}/messages`);
  return response.data;
};

export const sendVisitorMessage = async (publicToken, payload) => {
  const response = await api.post(`/chat/conversations/${encodeURIComponent(publicToken)}/messages`, payload);
  return response.data;
};

export const uploadVisitorAttachment = async (publicToken, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/chat/conversations/${encodeURIComponent(publicToken)}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createVisitorStreamUrl = (publicToken) =>
  `${apiBaseUrl.replace(/\/+$/, '')}/chat/conversations/${encodeURIComponent(publicToken)}/stream`;

export const getAdminConversations = async () => {
  const response = await api.get('/admin/chat/conversations');
  return response.data;
};

export const getAdminMessages = async (conversationId) => {
  const response = await api.get(`/admin/chat/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendAdminMessage = async (conversationId, payload) => {
  const response = await api.post(`/admin/chat/conversations/${conversationId}/messages`, payload);
  return response.data;
};

export const markAdminConversationRead = async (conversationId) => {
  await api.post(`/admin/chat/conversations/${conversationId}/read`);
};

export const renameAdminConversation = async (conversationId, visitorName) => {
  const response = await api.patch(`/admin/chat/conversations/${conversationId}`, { visitorName });
  return response.data;
};

export const deleteAdminConversation = async (conversationId) => {
  await api.delete(`/admin/chat/conversations/${conversationId}`);
};

export const uploadAdminAttachment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/admin/chat/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createAdminStreamUrl = () => {
  const token = localStorage.getItem('token') || '';
  return `${apiBaseUrl.replace(/\/+$/, '')}/admin/chat/stream?access_token=${encodeURIComponent(token)}`;
};

export const getOwnerContacts = async (q = '') => {
  const response = await api.get('/owner/chat/contacts', { params: q ? { q } : {} });
  return response.data;
};

export const getOwnerConversations = async () => {
  const response = await api.get('/owner/chat/conversations');
  return response.data;
};

export const createOwnerConversation = async (payload) => {
  const response = await api.post('/owner/chat/conversations', payload);
  return response.data;
};

export const getOwnerMessages = async (conversationId) => {
  const response = await api.get(`/owner/chat/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendOwnerMessage = async (conversationId, payload) => {
  const response = await api.post(`/owner/chat/conversations/${conversationId}/messages`, payload);
  return response.data;
};

export const uploadOwnerAttachment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/owner/chat/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createOwnerStreamUrl = () => {
  const token = localStorage.getItem('token') || '';
  return `${apiBaseUrl.replace(/\/+$/, '')}/owner/chat/stream?access_token=${encodeURIComponent(token)}`;
};

export const getTenantChatContacts = async (q = '') => {
  const response = await api.get('/tenant/chat/contacts', { params: q ? { q } : {} });
  return response.data;
};

export const getTenantChatConversations = async () => {
  const response = await api.get('/tenant/chat/conversations');
  return response.data;
};

export const createTenantChatConversation = async (payload) => {
  const response = await api.post('/tenant/chat/conversations', payload);
  return response.data;
};

export const getTenantChatMessages = async (conversationId) => {
  const response = await api.get(`/tenant/chat/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendTenantChatMessage = async (conversationId, payload) => {
  const response = await api.post(`/tenant/chat/conversations/${conversationId}/messages`, payload);
  return response.data;
};

export const uploadTenantChatAttachment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/tenant/chat/attachments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createTenantChatStreamUrl = () => {
  const token = localStorage.getItem('token') || '';
  return `${apiBaseUrl.replace(/\/+$/, '')}/tenant/chat/stream?access_token=${encodeURIComponent(token)}`;
};
