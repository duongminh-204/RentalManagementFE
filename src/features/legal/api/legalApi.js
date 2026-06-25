import api from '../../../utils/api';

export const getLegalDashboard = async () => {
  const { data } = await api.get('/legal/dashboard');
  return data;
};

export const getLegalAlerts = async () => {
  const { data } = await api.get('/legal/alerts');
  return data;
};

export const getTenantLegalSummaries = async () => {
  const { data } = await api.get('/legal/tenants');
  return data;
};

export const getTenantLegalDetail = async (tenantId) => {
  const { data } = await api.get(`/legal/tenants/${tenantId}`);
  return data;
};

export const updateTenantLegalProfile = async (tenantId, payload) => {
  const { data } = await api.put(`/legal/tenants/${tenantId}/profile`, payload);
  return data;
};

export const uploadTenantLegalDocument = async (tenantId, docType, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/legal/tenants/${tenantId}/upload/${docType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getRoomLegalSummaries = async () => {
  const { data } = await api.get('/legal/rooms');
  return data;
};

export const getRoomLegalDetail = async (roomId) => {
  const { data } = await api.get(`/legal/rooms/${roomId}`);
  return data;
};

export const updateRoomLegalProfile = async (roomId, payload) => {
  const { data } = await api.put(`/legal/rooms/${roomId}/profile`, payload);
  return data;
};

export const uploadRoomHandover = async (roomId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/legal/rooms/${roomId}/upload/handover`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getBuildingLegalDocuments = async (buildingId) => {
  const path = buildingId ? `/legal/buildings/${buildingId}/documents` : '/legal/documents';
  const { data } = await api.get(path);
  return data;
};

export const createBuildingLegalDocument = async (buildingId, payload) => {
  const { data } = await api.post(`/legal/buildings/${buildingId}/documents`, payload);
  return data;
};

export const updateBuildingLegalDocument = async (documentId, payload) => {
  const { data } = await api.put(`/legal/documents/${documentId}`, payload);
  return data;
};

export const deleteBuildingLegalDocument = async (documentId) => {
  await api.delete(`/legal/documents/${documentId}`);
};

export const uploadBuildingLegalDocumentFile = async (documentId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/legal/documents/${documentId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const syncLegalNotifications = async () => {
  const { data } = await api.post('/legal/sync-notifications');
  return data;
};

export const getNotifications = async (unreadOnly = false) => {
  const { data } = await api.get('/notifications', { params: { unreadOnly } });
  return data;
};

export const getUnreadNotificationCount = async () => {
  const { data } = await api.get('/notifications/unread-count');
  return data?.count ?? 0;
};

export const markNotificationRead = async (id) => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.post('/notifications/read-all');
  return data;
};
