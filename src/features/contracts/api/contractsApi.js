import api from '../../../utils/api';

// Get all contracts
export const getContracts = async (params = {}) => {
  try {
    const response = await api.get('/contracts', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get contracts for a specific room
export const getContractsByRoomId = async (roomId) => {
  try {
    const response = await api.get('/contracts', { params: { roomId } });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get contract by ID
export const getContractById = async (id) => {
  try {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new contract
export const createContract = async (contractData) => {
  try {
    const response = await api.post('/contracts', contractData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update contract
export const updateContract = async (id, contractData) => {
  try {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete contract
export const deleteContract = async (id) => {
  try {
    const response = await api.delete(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload contract file (PDF)
export const uploadContractFile = async (contractId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/contracts/${contractId}/upload-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Download contract file
export const downloadContractFile = async (contractId) => {
  try {
    const response = await api.get(`/contracts/${contractId}/download-file`, {
      responseType: 'blob',
      validateStatus: (status) => status >= 200 && status < 300,
    });
    return response.data;
  } catch (error) {
    if (error.response?.data instanceof Blob) {
      throw error;
    }
    throw error;
  }
};

// Get expiring contracts (for notifications)
export const getExpiringContracts = async (daysBeforeExpiry = 30) => {
  try {
    const response = await api.get('/contracts/expiring', {
      params: { days: daysBeforeExpiry },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Search contracts
export const searchContracts = async (query) => {
  try {
    const response = await api.get('/contracts/search', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Renew contract
export const renewContract = async (contractId, renewalData) => {
  try {
    const response = await api.post(`/contracts/${contractId}/renew`, renewalData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Terminate contract
export const terminateContract = async (contractId, terminationData) => {
  try {
    const response = await api.post(`/contracts/${contractId}/terminate`, terminationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
