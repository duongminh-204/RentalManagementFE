import api from '../../../utils/api';

export const getContracts = async (params = {}) => {
  const response = await api.get('/contracts', { params });
  return response.data;
};

export const getContractsByRoomId = async (roomId) => {
  const response = await api.get('/contracts', { params: { roomId } });
  return response.data;
};

export const getContractById = async (id) => {
  const response = await api.get(`/contracts/${id}`);
  return response.data;
};

export const getContractDetail = async (id) => {
  const response = await api.get(`/contracts/${id}/detail`);
  return response.data;
};

export const createContract = async (contractData) => {
  const response = await api.post('/contracts', contractData);
  return response.data;
};

export const updateContract = async (id, contractData) => {
  const response = await api.put(`/contracts/${id}`, contractData);
  return response.data;
};

export const deleteContract = async (id) => {
  const response = await api.delete(`/contracts/${id}`);
  return response.data;
};

export const uploadContractFile = async (contractId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/contracts/${contractId}/upload-file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadContractFile = async (contractId) => {
  const response = await api.get(`/contracts/${contractId}/download-file`, {
    responseType: 'blob',
    validateStatus: (status) => status >= 200 && status < 300,
  });
  return response.data;
};

export const getExpiringContracts = async (daysBeforeExpiry = 30) => {
  const response = await api.get('/contracts/expiring', {
    params: { days: daysBeforeExpiry },
  });
  return response.data;
};

export const getContractReminders = async () => {
  const response = await api.get('/contracts/reminders');
  return response.data;
};

export const renewContract = async (contractId, renewalData) => {
  const response = await api.post(`/contracts/${contractId}/renew`, renewalData);
  return response.data;
};

export const terminateContract = async (contractId, terminationData) => {
  const response = await api.post(`/contracts/${contractId}/terminate`, terminationData);
  return response.data;
};

export const updateContractDeposit = async (contractId, depositData) => {
  const response = await api.put(`/contracts/${contractId}/deposit`, depositData);
  return response.data;
};

export const generateContractFromTemplate = async (contractId, templateData = {}) => {
  const response = await api.post(`/contracts/${contractId}/generate`, templateData);
  return response.data;
};
