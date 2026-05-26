import api from '../../../utils/api';

export const createInvoiceFromUtilityUsage = async (invoiceData) => {
  const response = await api.post('/invoices/utility-usage', invoiceData);
  return response.data;
};

export const getInvoiceByRoomAndMonth = async (roomId, monthYear) => {
  const response = await api.get(`/invoices/room/${roomId}/month/${encodeURIComponent(monthYear)}`);
  return response.data;
};

export const searchInvoices = async (filters) => {
  const params = new URLSearchParams();

  if (filters.roomId) params.append('roomId', filters.roomId);
  if (filters.tenantName) params.append('tenantName', filters.tenantName);
  if (filters.monthFrom) params.append('monthFrom', filters.monthFrom);
  if (filters.monthTo) params.append('monthTo', filters.monthTo);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);

  const response = await api.get(`/invoices/history?${params.toString()}`);
  return response.data;
};
