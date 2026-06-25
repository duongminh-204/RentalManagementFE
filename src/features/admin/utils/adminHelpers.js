export const formatVnd = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
};

export const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['active', 'success', 'enabled'].includes(normalized)) return 'bg-[#e8f8ef] text-[#1f7a45]';
  if (['expired', 'cancelled', 'disabled', 'failed'].includes(normalized)) return 'bg-[#fff0f3] text-[#b4234a]';
  if (['suspended', 'pending'].includes(normalized)) return 'bg-[#fff7e6] text-[#b26a00]';
  return 'bg-surface-press text-muted';
};
