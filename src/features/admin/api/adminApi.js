import api from '../../../utils/api';

const adminBase = '/admin';

// Dashboard
export const getAdminDashboardSummary = () => api.get(`${adminBase}/dashboard/summary`).then((r) => r.data);
export const getAdminDashboardCharts = () => api.get(`${adminBase}/dashboard/charts`).then((r) => r.data);

// Owners
export const getAdminOwners = (params) => api.get(`${adminBase}/owners`, { params }).then((r) => r.data);
export const getAdminOwnerById = (id) => api.get(`${adminBase}/owners/${id}`).then((r) => r.data);
export const createAdminOwner = (data) => api.post(`${adminBase}/owners`, data).then((r) => r.data);
export const updateAdminOwner = (id, data) => api.put(`${adminBase}/owners/${id}`, data).then((r) => r.data);
export const deleteAdminOwner = (id) => api.delete(`${adminBase}/owners/${id}`);
export const suspendAdminOwner = (id) => api.post(`${adminBase}/owners/${id}/suspend`).then((r) => r.data);
export const activateAdminOwner = (id) => api.post(`${adminBase}/owners/${id}/activate`).then((r) => r.data);
export const lockAdminOwner = (id) => api.post(`${adminBase}/owners/${id}/lock`).then((r) => r.data);
export const unlockAdminOwner = (id) => api.post(`${adminBase}/owners/${id}/unlock`).then((r) => r.data);

// Packages
export const getAdminPackages = (params) => api.get(`${adminBase}/packages`, { params }).then((r) => r.data);
export const createAdminPackage = (data) => api.post(`${adminBase}/packages`, data).then((r) => r.data);
export const updateAdminPackage = (id, data) => api.put(`${adminBase}/packages/${id}`, data).then((r) => r.data);
export const enableAdminPackage = (id) => api.post(`${adminBase}/packages/${id}/enable`).then((r) => r.data);
export const disableAdminPackage = (id) => api.post(`${adminBase}/packages/${id}/disable`).then((r) => r.data);

// Subscriptions
export const getAdminSubscriptions = (params) => api.get(`${adminBase}/subscriptions`, { params }).then((r) => r.data);
export const upgradeAdminSubscription = (id, packageId) =>
  api.post(`${adminBase}/subscriptions/${id}/upgrade`, { packageId }).then((r) => r.data);
export const downgradeAdminSubscription = (id, packageId) =>
  api.post(`${adminBase}/subscriptions/${id}/downgrade`, { packageId }).then((r) => r.data);
export const renewAdminSubscription = (id) => api.post(`${adminBase}/subscriptions/${id}/renew`).then((r) => r.data);
export const activateAdminSubscription = (id) => api.post(`${adminBase}/subscriptions/${id}/activate`).then((r) => r.data);
export const cancelAdminSubscription = (id) => api.post(`${adminBase}/subscriptions/${id}/cancel`).then((r) => r.data);

// Payments
export const getAdminPayments = (params) => api.get(`${adminBase}/payments`, { params }).then((r) => r.data);
export const getAdminRevenueReport = (params) => api.get(`${adminBase}/payments/revenue-report`, { params }).then((r) => r.data);
export const exportAdminPaymentsExcel = async (params = {}) => {
  const response = await api.get(`${adminBase}/payments/export-excel`, { params, responseType: 'blob' });
  return response.data;
};

// Users
export const getAdminUsers = (params) => api.get(`${adminBase}/users`, { params }).then((r) => r.data);
export const enableAdminUser = (id) => api.post(`${adminBase}/users/${id}/enable`).then((r) => r.data);
export const disableAdminUser = (id) => api.post(`${adminBase}/users/${id}/disable`).then((r) => r.data);
export const resetAdminUserPassword = (id) => api.post(`${adminBase}/users/${id}/reset-password`).then((r) => r.data);

// Audit logs
export const getAdminAuditLogs = (params) => api.get(`${adminBase}/audit-logs`, { params }).then((r) => r.data);
