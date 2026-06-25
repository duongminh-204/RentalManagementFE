import { getStoredUser, isOwnerRole, isOwnerSubscriptionActive, isOwnerSubscriptionPending } from '../hooks/useAuth';

export const PACKAGE_TIER_ORDER = ['Starter', 'PRO', 'PREMIUM'];

const ROUTE_FEATURES = {
  '/vehicles': { label: 'Quản lý phương tiện', requiredPackage: 'PRO' },
  '/rooms/decor': { label: 'AI Decor phòng', requiredPackage: 'PREMIUM' },
  '/debts': { label: 'Báo cáo công nợ & doanh thu', requiredPackage: 'PRO' },
};

const API_FEATURES = [
  { pattern: /\/dashboard\/debt/i, label: 'Báo cáo công nợ', requiredPackage: 'PRO' },
  { pattern: /\/dashboard\/revenue/i, label: 'Báo cáo doanh thu', requiredPackage: 'PRO' },
  { pattern: /\/vehicles/i, label: 'Quản lý phương tiện', requiredPackage: 'PRO' },
  { pattern: /\/room-decor|\/rooms\/decor/i, label: 'AI Decor phòng', requiredPackage: 'PREMIUM' },
];

export const isForbiddenError = (error) => error?.response?.status === 403;

const matchApiFeature = (url = '') => {
  const entry = API_FEATURES.find(({ pattern }) => pattern.test(url));
  return entry ? { label: entry.label, requiredPackage: entry.requiredPackage } : null;
};

export const resolveForbiddenNotice = (error, options = {}) => {
  const user = options.user ?? getStoredUser();
  const status = String(user?.subscriptionStatus || '').toLowerCase();
  const requestUrl = options.requestUrl || error?.config?.url || '';
  const path = options.path || (typeof window !== 'undefined' ? window.location.pathname : '');

  if (status === 'pending') {
    const packageLabel = user?.packageName || 'dịch vụ';
    return {
      variant: 'pending',
      title: `Gói ${packageLabel} đang chờ admin kích hoạt`,
      message:
        'Yêu cầu gói của bạn đã được ghi nhận. Admin sẽ xem xét và mở khóa tính năng trong thời gian sớm nhất.',
      currentPackage: user?.packageName,
      actionLabel: 'Theo dõi trạng thái kích hoạt',
      actionPath: '/subscription/pending',
    };
  }

  if (status !== 'active') {
    return {
      variant: 'no_plan',
      title: 'Chưa có gói đang hoạt động',
      message: 'Vui lòng chọn gói dịch vụ và chờ admin kích hoạt trước khi sử dụng hệ thống.',
      actionLabel: 'Chọn gói dịch vụ',
      actionPath: '/register/select-plan',
    };
  }

  const feature =
    ROUTE_FEATURES[path] ||
    matchApiFeature(requestUrl) ||
    (options.featureLabel
      ? { label: options.featureLabel, requiredPackage: options.requiredPackage || 'PRO' }
      : null);

  const backendMessage = error?.response?.data?.message;
  const requiredPackage = feature?.requiredPackage || 'PRO';

  return {
    variant: 'upgrade',
    title: 'Tính năng chưa được mở',
    message:
      backendMessage && !String(backendMessage).includes('403')
        ? backendMessage
        : feature
          ? `"${feature.label}" không có trong gói ${user?.packageName || 'hiện tại'} của bạn.`
          : 'Tính năng này chưa có trong gói dịch vụ hiện tại của bạn.',
    featureLabel: feature?.label,
    currentPackage: user?.packageName,
    requiredPackage,
    actionLabel: 'Xem bảng giá',
    actionPath: '/#pricing',
  };
};

export const getOwnerSubscriptionNotice = (user = getStoredUser()) => {
  if (!isOwnerRole(user?.role)) return null;
  if (isOwnerSubscriptionPending(user) || !isOwnerSubscriptionActive(user)) {
    return resolveForbiddenNotice({ response: { status: 403 } }, { user });
  }
  return null;
};

export const getApiErrorMessage = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
  if (isForbiddenError(error)) {
    return resolveForbiddenNotice(error).message;
  }
  return error?.response?.data?.message || error?.message || fallback;
};
