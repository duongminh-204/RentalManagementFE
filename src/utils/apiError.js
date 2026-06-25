import { getStoredUser, isOwnerRole, isOwnerSubscriptionActive, isOwnerSubscriptionPending } from '../hooks/useAuth';
import { getFeatureLockConfig, resolveFeatureKey } from './featureLockConfig';

export const PACKAGE_TIER_ORDER = ['Starter', 'PRO', 'PREMIUM'];

const ROUTE_FEATURES = {
  '/vehicles': { label: 'Quản lý phương tiện', requiredPackage: 'PRO', featureKey: 'vehicles' },
  '/rooms/decor': { label: 'AI Decor phòng', requiredPackage: 'PREMIUM', featureKey: 'roomDecor' },
  '/debts': { label: 'Báo cáo công nợ & doanh thu', requiredPackage: 'PRO', featureKey: 'debtPage' },
};

const API_FEATURES = [
  { pattern: /\/dashboard\/debt/i, label: 'Báo cáo công nợ', requiredPackage: 'PRO', featureKey: 'debtReports' },
  { pattern: /\/dashboard\/revenue/i, label: 'Báo cáo doanh thu', requiredPackage: 'PRO', featureKey: 'revenueReports' },
  { pattern: /\/vehicles/i, label: 'Quản lý phương tiện', requiredPackage: 'PRO', featureKey: 'vehicles' },
  { pattern: /\/room-decor|\/rooms\/decor/i, label: 'AI Decor phòng', requiredPackage: 'PREMIUM', featureKey: 'roomDecor' },
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
    const pendingConfig = getFeatureLockConfig('pending');
    return {
      variant: 'pending',
      featureKey: 'pending',
      title: `Gói ${packageLabel} đang chờ admin kích hoạt`,
      message: pendingConfig?.description,
      currentPackage: user?.packageName,
      actionLabel: 'Theo dõi trạng thái kích hoạt',
      actionPath: '/subscription/pending',
      fullPage: true,
    };
  }

  if (status !== 'active') {
    const noPlanConfig = getFeatureLockConfig('noPlan');
    return {
      variant: 'no_plan',
      featureKey: 'noPlan',
      title: noPlanConfig?.title,
      message: noPlanConfig?.description,
      actionLabel: 'Xem bảng giá',
      actionType: 'pricing',
      fullPage: true,
    };
  }

  const feature =
    ROUTE_FEATURES[path] ||
    matchApiFeature(requestUrl) ||
    (options.featureLabel
      ? {
          label: options.featureLabel,
          requiredPackage: options.requiredPackage || 'PRO',
          featureKey: options.featureKey || resolveFeatureKey({ featureLabel: options.featureLabel }),
        }
      : null);

  const featureKey =
    options.featureKey ||
    options.lockedKey ||
    feature?.featureKey ||
    resolveFeatureKey({ path, requestUrl, featureLabel: feature?.label || options.featureLabel });
  const lockConfig = getFeatureLockConfig(featureKey);

  const backendMessage = error?.response?.data?.message;
  const requiredPackage = feature?.requiredPackage || lockConfig?.requiredPackage || 'PRO';
  const isFullPage = Boolean(path && ROUTE_FEATURES[path]);

  return {
    variant: 'upgrade',
    featureKey,
    title: lockConfig?.title,
    message:
      backendMessage && !String(backendMessage).includes('403')
        ? backendMessage
        : feature
          ? `"${feature.label}" không có trong gói ${user?.packageName || 'hiện tại'} của bạn.`
          : lockConfig?.description,
    featureLabel: feature?.label || lockConfig?.label,
    currentPackage: user?.packageName,
    requiredPackage,
    actionLabel: 'Xem bảng giá',
    actionType: 'pricing',
    fullPage: isFullPage || options.fullPage,
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
