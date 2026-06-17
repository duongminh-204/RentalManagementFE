import api from '../../../utils/api';

// Get all tenants
export const getTenants = async (params = {}) => {
  try {
    const response = await api.get('/tenants', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get tenant by ID
export const getTenantById = async (id) => {
  try {
    const response = await api.get(`/tenants/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new tenant
export const createTenant = async (tenantData) => {
  try {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update tenant
export const updateTenant = async (id, tenantData) => {
  try {
    const response = await api.put(`/tenants/${id}`, tenantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete tenant
export const deleteTenant = async (id) => {
  try {
    const response = await api.delete(`/tenants/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload tenant ID card image
export const uploadIdCardImage = async (tenantId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tenants/${tenantId}/upload-id-card`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get tenant history
export const getTenantHistory = async (tenantId) => {
  try {
    const response = await api.get(`/tenants/${tenantId}/history`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search tenants
export const searchTenants = async (query) => {
  try {
    const response = await api.get('/tenants/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatarImage = async (tenantId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/tenants/${tenantId}/upload-avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/** Xóa ảnh CCCD (không xóa khách thuê) */
export const deleteIdCardImage = async (tenantId) => {
  const response = await api.delete(`/tenants/${tenantId}/id-card`);
  return response.data;
};
