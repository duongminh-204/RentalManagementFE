export const normalizeContractFromApi = (raw) => {
  if (!raw) return null;
  const id = raw.id ?? raw.contractId ?? raw.ContractId;
  const isTerminated =
    raw.isTerminated ?? raw.IsTerminated ?? raw.status === 'terminated';
  const startDate = raw.startDate ?? raw.StartDate;
  const endDate = raw.endDate ?? raw.EndDate;
  const status = getContractStatus(startDate, endDate, isTerminated);

  return {
    id,
    // contractNumber: raw.contractNumber ?? raw.ContractNumber ?? '',
    tenantId: raw.tenantId ?? raw.TenantId ?? null,
    roomId: raw.roomId ?? raw.RoomId ?? null,
    startDate,
    endDate,
    deposit: Number(raw.deposit ?? raw.Deposit) || 0,
    terms: raw.terms ?? raw.Terms ?? '',
    notes: raw.notes ?? raw.Notes ?? '',
    status,
    fileUrl: raw.fileUrl ?? raw.FileUrl ?? null,
    isTerminated,
  };
};

export const normalizeContractsList = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.data ?? [];
  return list.map(normalizeContractFromApi).filter(Boolean);
};

export const filterContractsByRoomId = (contracts, roomId) => {
  if (!roomId) return [];
  return contracts.filter((c) => String(c.roomId) === String(roomId));
};

export const resolveContractStatus = (contract) => {
  if (!contract) return null;
  const isTerminated =
    contract.isTerminated ?? contract.status === 'terminated';
  return getContractStatus(contract.startDate, contract.endDate, isTerminated);
};

/** Hợp đồng còn hiệu lực (đang trong thời hạn thuê) */
export const isContractEffective = (contract) => {
  const status = resolveContractStatus(contract);
  return status === 'active' || status === 'expiring_soon';
};

export const withResolvedContractStatus = (contract) => {
  if (!contract) return contract;
  return { ...contract, status: resolveContractStatus(contract) };
};

export const getActiveContractForRoom = (contracts) => {
  if (!contracts?.length) return null;
  const resolved = contracts.map(withResolvedContractStatus);
  const priority = ['active', 'expiring_soon', 'pending'];
  for (const key of priority) {
    const found = resolved.find((c) => c.status === key);
    if (found) return found;
  }
  return [...resolved].sort(
    (a, b) => new Date(b.endDate || 0) - new Date(a.endDate || 0)
  )[0];
};

/** Loại trạng thái thủ công — hệ thống tự tính theo ngày */
export const prepareContractPayload = (data) => {
  const { status: _status, ...rest } = data ?? {};
  return rest;
};

// Get contract status label
export const getContractStatusLabel = (status) => {
  const statusMap = {
    active: 'Còn hiệu lực',
    expiring_soon: 'Sắp hết hạn',
    expired: 'Hết hạn',
    terminated: 'Đã chấm dứt',
    pending: 'Chờ ký',
  };
  return statusMap[status] || status;
};

// Get contract status color
export const getContractStatusColor = (status) => {
  const colorMap = {
    active: 'bg-green-100 text-green-800',
    expiring_soon: 'bg-orange-100 text-orange-800',
    expired: 'bg-red-100 text-red-800',
    terminated: 'bg-gray-100 text-gray-800',
    pending: 'bg-blue-100 text-blue-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// Calculate days until expiry
export const calculateDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get contract status based on dates vs today
export const getContractStatus = (startDate, endDate, isTerminated = false) => {
  if (isTerminated) return 'terminated';
  if (!startDate || !endDate) return 'pending';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'pending';
  if (today < start) return 'pending';
  if (today > end) return 'expired';

  const daysUntilExpiry = calculateDaysUntilExpiry(endDate);
  if (daysUntilExpiry <= 30) return 'expiring_soon';
  return 'active';
};

// Calculate contract duration
export const calculateContractDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;
  
  if (months > 0) {
    return `${months} tháng ${days} ngày`;
  }
  return `${days} ngày`;
};

// Format contract number
export const formatContractNumber = (number) => {
  if (!number) return '';
  // Format: HD/YYYY/MM/001
  return `HD/${number}`;
};

// Format date (dd/MM/yyyy)
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Validate contract number format
export const validateContractNumber = (number) => {
  // Simple validation - alphanumeric with slashes
  return /^[A-Z0-9\-\/]+$/.test(number);
};

// Validate contract dates
export const validateContractDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
};

// Get status badge
export const getStatusBadge = (status) => {
  const badges = {
    active: { label: 'Còn hiệu lực', icon: '✓', color: 'green' },
    expiring_soon: { label: 'Sắp hết hạn', icon: '⚠', color: 'orange' },
    expired: { label: 'Hết hạn', icon: '✕', color: 'red' },
    terminated: { label: 'Đã chấm dứt', icon: '⊗', color: 'gray' },
    pending: { label: 'Chờ ký', icon: '?', color: 'blue' },
  };
  return badges[status] || { label: status, icon: '?', color: 'gray' };
};

// Calculate renewal date
export const calculateRenewalDate = (expiryDate, months = 12) => {
  const date = new Date(expiryDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};
