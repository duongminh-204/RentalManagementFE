import api from '../../../utils/api';

const monthlyRevenueRequestCache = new Map();

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getRoomStats = async () => {
  const response = await api.get('/dashboard/rooms/stats');
  return response.data;
};

export const getDebtInfo = async () => {
  const response = await api.get('/dashboard/debt/info');
  return response.data;
};

export const recordDebtPayment = async (invoiceId, payload = {}) => {
  const response = await api.post(`/dashboard/debt/invoices/${invoiceId}/payments`, payload);
  return response.data;
};

export const restoreDebtItem = async (invoiceId, itemKey) => {
  const response = await api.post(`/dashboard/debt/invoices/${invoiceId}/items/${itemKey}/restore`);
  return response.data;
};

export const getMonthlyRevenue = async (month, year) => {
  const cacheKey = `${year}-${month}`;

  if (!monthlyRevenueRequestCache.has(cacheKey)) {
    monthlyRevenueRequestCache.set(
      cacheKey,
      api
        .get(`/dashboard/revenue/${month}/${year}`)
        .then((response) => response.data)
        .finally(() => {
          monthlyRevenueRequestCache.delete(cacheKey);
        })
    );
  }

  return monthlyRevenueRequestCache.get(cacheKey);
};

export const getMonthlyRevenueSeries = async (months) => {
  const rows = [];

  for (const monthInfo of months) {
    const revenue = await getMonthlyRevenue(monthInfo.month, monthInfo.year);

    rows.push({
      ...monthInfo,
      amount: Number(revenue?.monthlyRevenue ?? 0),
    });
  }

  return rows;
};

export const importDashboardExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/dashboard/import-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const uploadDashboardTemplateFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/dashboard/import/template-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const downloadDashboardImportTemplate = async () => {
  const response = await api.get('/dashboard/import/template', {
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'] || '';
  const matchedFileName = contentDisposition.match(/filename="?([^"]+)"?/i);
  const fileName = matchedFileName?.[1] || 'dashboard-import-template.xlsx';

  return {
    blob: response.data,
    fileName,
  };
};

export const exportDashboardExcel = async (month, year) => {
  const response = await api.get('/dashboard/export-excel', {
    params: { month, year },
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'] || '';
  const matchedFileName = contentDisposition.match(/filename="?([^"]+)"?/i);
  const fileName = matchedFileName?.[1] || `dashboard-${year}-${month}.xlsx`;

  return {
    blob: response.data,
    fileName,
  };
};

export const getAllDashboardData = async (month, year) => {
  const [roomStats, debtInfo, revenue] = await Promise.all([
    getRoomStats(),
    getDebtInfo(),
    getMonthlyRevenue(month, year),
  ]);

  const stats = {
    totalRooms: roomStats?.totalRooms ?? 0,
    occupiedRooms: roomStats?.occupiedRooms ?? 0,
    emptyRooms: roomStats?.emptyRooms ?? 0,
    monthlyRevenue: revenue?.monthlyRevenue ?? 0,
    unpaidTenantsCount: debtInfo?.unpaidTenantsCount ?? 0,
    totalDebt: debtInfo?.totalDebt ?? 0,
  };

  return {
    stats,
    roomStats,
    debtInfo,
    revenue,
  };
};
