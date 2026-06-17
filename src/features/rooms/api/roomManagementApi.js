import api from '../../../utils/api';

export const getServiceCatalog = async () => {
  const { data } = await api.get('/room-management/services');
  return data;
};

export const getDeviceCatalog = async () => {
  const { data } = await api.get('/room-management/device-catalog');
  return data;
};

export const createDeviceCatalog = async (payload) => {
  const { data } = await api.post('/room-management/device-catalog', payload);
  return data;
};

export const updateDeviceCatalog = async (deviceCatalogId, payload) => {
  const { data } = await api.put(`/room-management/device-catalog/${deviceCatalogId}`, payload);
  return data;
};

export const deleteDeviceCatalog = async (deviceCatalogId) => {
  await api.delete(`/room-management/device-catalog/${deviceCatalogId}`);
};

export const getTenantCandidates = async () => {
  const { data } = await api.get('/room-management/tenants/candidates');
  return data;
};

export const addRoomImage = async (roomId, imageUrl) => {
  const { data } = await api.post(`/room-management/rooms/${roomId}/images`, { imageUrl });
  return data;
};

/** Upload ảnh phòng (PNG/JPG) */
export const uploadRoomImage = async (roomId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/room-management/rooms/${roomId}/images/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteRoomImage = async (roomId, imageId) => {
  await api.delete(`/room-management/rooms/${roomId}/images/${imageId}`);
};

export const addDevice = async (roomId, payload) => {
  const { data } = await api.post(`/room-management/rooms/${roomId}/devices`, payload);
  return data;
};

export const updateDevice = async (roomId, deviceId, payload) => {
  const { data } = await api.put(`/room-management/rooms/${roomId}/devices/${deviceId}`, payload);
  return data;
};

export const deleteDevice = async (roomId, deviceId) => {
  await api.delete(`/room-management/rooms/${roomId}/devices/${deviceId}`);
};

export const assignRoomService = async (roomId, payload) => {
  const { data } = await api.post(`/room-management/rooms/${roomId}/services`, payload);
  return data;
};

export const deleteRoomService = async (roomId, roomServiceId) => {
  await api.delete(`/room-management/rooms/${roomId}/services/${roomServiceId}`);
};

export const assignTenant = async (roomId, payload) => {
  const { data } = await api.post(`/room-management/rooms/${roomId}/tenants`, payload);
  return data;
};

export const removeTenant = async (roomId, contractId) => {
  await api.delete(`/room-management/rooms/${roomId}/tenants/${contractId}`);
};

/** Upload ảnh thiết bị (PNG/JPG) */
export const uploadDeviceImage = async (roomId, deviceId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(
    `/room-management/rooms/${roomId}/devices/${deviceId}/upload-image`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data;
};

export const createService = async (payload) => {
  const { data } = await api.post('/room-management/services', payload);
  return data;
};

export const updateService = async (serviceId, payload) => {
  const { data } = await api.put(`/room-management/services/${serviceId}`, payload);
  return data;
};

export const deleteService = async (serviceId) => {
  await api.delete(`/room-management/services/${serviceId}`);
};
