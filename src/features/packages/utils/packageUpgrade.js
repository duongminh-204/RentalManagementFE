const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export const getCurrentPackage = (packages, packageId) =>
  packages.find((pkg) => pkg.packageId === packageId) || null;

export const isHigherPackage = (targetPkg, currentPkg) =>
  Boolean(targetPkg && currentPkg && targetPkg.price > currentPkg.price);

export const estimateUpgradeFee = (targetPkg, currentPkg, endDate) => {
  if (!isHigherPackage(targetPkg, currentPkg) || !endDate) return null;

  const end = new Date(endDate);
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const remainingDays = Math.max(0, Math.round((end.getTime() - today.getTime()) / 86400000));
  const rawFee = (targetPkg.price - currentPkg.price) * (remainingDays / 30);
  const upgradeFee = Math.max(0, rawFee);
  return Math.round(upgradeFee);
};

export const formatUpgradeFeeLabel = (fee) => {
  if (fee == null) return '';
  if (fee <= 0) return 'Miễn phí';
  return formatPrice(fee);
};
