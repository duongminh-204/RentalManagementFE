export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatCompactCurrency = (value = 0) => {
  const amount = Number(value) || 0;

  if (Math.abs(amount) >= 1000000000) {
    return `${(amount / 1000000000).toFixed(amount % 1000000000 === 0 ? 0 : 1)} tỷ`;
  }

  if (Math.abs(amount) >= 1000000) {
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)} triệu`;
  }

  return formatCurrency(amount);
};

export const formatCount = (value = 0) =>
  new Intl.NumberFormat('vi-VN').format(Number(value) || 0);

export const formatMonthLabel = (date = new Date()) =>
  new Intl.DateTimeFormat('vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(date);
