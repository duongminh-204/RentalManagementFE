import { getStoredUser, canOwnerUseApp } from '../hooks/useAuth';
import { getFeatureLockConfig, resolveFeatureKey } from './featureLockConfig';

export const PACKAGE_TIER_ORDER = ['Starter', 'PRO', 'PREMIUM'];

const ROUTE_PACKAGE_FEATURE = {
  '/dashboard': 'Dashboard',
  '/buildings': 'TenantManagement',
  '/rooms': 'TenantManagement',
  '/tenants': 'TenantManagement',
  '/contracts': 'Contracts',
  '/devices': 'UtilitiesInvoices',
  '/invoices': 'PaymentInvoices',
  '/vehicles': 'VehicleManagement',
  '/rooms/decor': 'AiRoomDecor',
  '/debts': 'RevenueDebtReports',
};

const ROUTE_FEATURES = {
  '/buildings': { label: 'Quản lý tòa nhà', requiredPackage: 'Starter', featureKey: 'buildings' },
  '/rooms': { label: 'Quản lý phòng trọ', requiredPackage: 'Starter', featureKey: 'rooms' },
  '/tenants': { label: 'Quản lý khách thuê', requiredPackage: 'Starter', featureKey: 'tenants' },
  '/contracts': { label: 'Quản lý hợp đồng', requiredPackage: 'Starter', featureKey: 'contracts' },
  '/devices': { label: 'Thiết bị & Dịch vụ', requiredPackage: 'Starter', featureKey: 'devices' },
  '/invoices': { label: 'Quản lý hoá đơn', requiredPackage: 'Starter', featureKey: 'invoices' },
  '/vehicles': { label: 'Quản lý phương tiện', requiredPackage: 'PRO', featureKey: 'vehicles' },
  '/rooms/decor': { label: 'AI Decor phòng', requiredPackage: 'PREMIUM', featureKey: 'roomDecor' },
  '/debts': { label: 'Báo cáo công nợ & doanh thu', requiredPackage: 'PRO', featureKey: 'debtPage' },
};

const ROUTE_PREFIX_FEATURES = [
  { prefix: '/buildings', feature: ROUTE_FEATURES['/buildings'] },
  { prefix: '/contracts', feature: ROUTE_FEATURES['/contracts'] },
];

export const resolveRouteFeature = (path = '') => {
  if (ROUTE_FEATURES[path]) return ROUTE_FEATURES[path];
  const prefixMatch = ROUTE_PREFIX_FEATURES.find(({ prefix }) => path.startsWith(prefix));
  return prefixMatch?.feature || null;
};

const ownerHasPackageFeature = (user, packageFeatureName) => {
  if (!packageFeatureName) return true;
  const features = user?.effectiveFeatures || [];
  return features.some(
    (feature) => String(feature).toLowerCase() === String(packageFeatureName).toLowerCase(),
  );
};

const resolveRoutePackageFeature = (path = '') => {
  if (ROUTE_PACKAGE_FEATURE[path]) return ROUTE_PACKAGE_FEATURE[path];
  const prefixMatch = ROUTE_PREFIX_FEATURES.find(({ prefix }) => path.startsWith(prefix));
  return prefixMatch ? ROUTE_PACKAGE_FEATURE[prefixMatch.prefix] : null;
};

export const canOwnerAccessRoute = (path, user = getStoredUser()) => {
  if (!canOwnerUseApp(user)) return false;
  const status = String(user?.subscriptionStatus || '').toLowerCase();
  if (status === 'active') return true;
  if (!user?.hasTrialAccess) return false;
  const packageFeature = resolveRoutePackageFeature(path);
  return ownerHasPackageFeature(user, packageFeature);
};

const API_FEATURES = [
  { pattern: /\/buildings/i, label: 'Quản lý tòa nhà', requiredPackage: 'Starter', featureKey: 'buildings' },
  { pattern: /\/room(?!-decor|s\/decor)/i, label: 'Quản lý phòng trọ', requiredPackage: 'Starter', featureKey: 'rooms' },
  { pattern: /\/contracts/i, label: 'Quản lý hợp đồng', requiredPackage: 'Starter', featureKey: 'contracts' },
  { pattern: /\/room-management|\/device-catalog|\/devices/i, label: 'Thiết bị & Dịch vụ', requiredPackage: 'Starter', featureKey: 'devices' },
  { pattern: /\/invoices/i, label: 'Quản lý hoá đơn', requiredPackage: 'Starter', featureKey: 'invoices' },
  { pattern: /\/dashboard\/debt/i, label: 'Báo cáo công nợ', requiredPackage: 'PRO', featureKey: 'debtReports' },
  { pattern: /\/dashboard\/revenue/i, label: 'Báo cáo doanh thu', requiredPackage: 'PRO', featureKey: 'revenueReports' },
  { pattern: /\/vehicles/i, label: 'Quản lý phương tiện', requiredPackage: 'PRO', featureKey: 'vehicles' },
  { pattern: /\/room-decor|\/rooms\/decor/i, label: 'AI Decor phòng', requiredPackage: 'PREMIUM', featureKey: 'roomDecor' },
];

export const isForbiddenError = (error) => error?.response?.status === 403;

const getPackageTierIndex = (packageName) => {
  const normalized = String(packageName || '').trim().toUpperCase();
  const index = PACKAGE_TIER_ORDER.indexOf(normalized);
  return index >= 0 ? index : -1;
};

const hasRequiredPackageTier = (userPackage, requiredPackage) => {
  const userTier = getPackageTierIndex(userPackage);
  const requiredTier = getPackageTierIndex(requiredPackage);
  if (userTier < 0 || requiredTier < 0) return false;
  return userTier >= requiredTier;
};

const matchApiFeature = (url = '') => {
  const entry = API_FEATURES.find(({ pattern }) => pattern.test(url));
  return entry ? { label: entry.label, requiredPackage: entry.requiredPackage, featureKey: entry.featureKey } : null;
};

const buildFeatureLockNotice = (feature, user, status) => {
  const lockConfig = getFeatureLockConfig(feature.featureKey);
  const tierOk = hasRequiredPackageTier(user?.packageName, feature.requiredPackage);

  if (status === 'pending') {
    return {
      variant: tierOk ? 'pending' : 'upgrade',
      featureKey: feature.featureKey,
      title: lockConfig?.title,
      message: tierOk
        ? `Gói ${user?.packageName || 'dịch vụ'} đang chờ admin kích hoạt. Sau khi được duyệt, bạn có thể sử dụng "${feature.label}".`
        : `"${feature.label}" cần gói ${feature.requiredPackage} trở lên. Gói ${user?.packageName || 'hiện tại'} của bạn chưa đủ để dùng tính năng này.`,
      featureLabel: feature.label,
      currentPackage: user?.packageName,
      requiredPackage: feature.requiredPackage,
      actionLabel: tierOk ? 'Theo dõi trạng thái kích hoạt' : 'Xem bảng giá',
      actionPath: tierOk ? '/subscription/pending' : undefined,
      actionType: tierOk ? undefined : 'pricing',
      fullPage: true,
    };
  }

  return {
    variant: 'upgrade',
    featureKey: feature.featureKey,
    title: lockConfig?.title,
    message: `"${feature.label}" không có trong gói ${user?.packageName || 'hiện tại'} của bạn.`,
    featureLabel: feature.label,
    currentPackage: user?.packageName,
    requiredPackage: feature.requiredPackage,
    actionLabel: 'Xem bảng giá',
    actionType: 'pricing',
    fullPage: true,
  };
};

export const resolveForbiddenNotice = (error, options = {}) => {
  const user = options.user ?? getStoredUser();
  const status = String(user?.subscriptionStatus || '').toLowerCase();
  const requestUrl = options.requestUrl || error?.config?.url || '';
  const path = options.path || (typeof window !== 'undefined' ? window.location.pathname : '');

  const feature =
    resolveRouteFeature(path) ||
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

  if (feature && (status === 'pending' || !canOwnerUseApp(user))) {
    return buildFeatureLockNotice(feature, user, status);
  }

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

  if (!canOwnerUseApp(user)) {
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

  if (user?.hasTrialAccess) {
    const packageFeature = resolveRoutePackageFeature(path);
    if (packageFeature && !ownerHasPackageFeature(user, packageFeature)) {
      const lockConfig = getFeatureLockConfig(featureKey);
      return {
        variant: 'upgrade',
        featureKey,
        title: lockConfig?.title || feature?.label,
        message: `"${feature?.label || lockConfig?.label || 'Tính năng này'}" chưa được admin cấp dùng thử cho tài khoản của bạn.`,
        featureLabel: feature?.label || lockConfig?.label,
        currentPackage: 'Dùng thử',
        requiredPackage: feature?.requiredPackage || lockConfig?.requiredPackage || 'PRO',
        actionLabel: 'Xem bảng giá',
        actionType: 'pricing',
        fullPage: Boolean(resolveRouteFeature(path)),
      };
    }
  }

  const lockConfig = getFeatureLockConfig(featureKey);

  const backendMessage = error?.response?.data?.message;
  const requiredPackage = feature?.requiredPackage || lockConfig?.requiredPackage || 'PRO';
  const isFullPage = Boolean(resolveRouteFeature(path));

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

export const resolveFeatureRouteNotice = (path, user = getStoredUser()) => {
  const feature = resolveRouteFeature(path);
  if (!feature) return null;

  const status = String(user?.subscriptionStatus || '').toLowerCase();
  if (status === 'active') return null;
  if (user?.hasTrialAccess && canOwnerAccessRoute(path, user)) return null;
  if (status === 'pending' || !canOwnerUseApp(user)) {
    return buildFeatureLockNotice(feature, user, status);
  }

  return buildFeatureLockNotice(feature, user, status);
};

export const getOwnerSubscriptionNotice = () => null;

export const getApiErrorMessage = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
  if (isForbiddenError(error)) {
    return resolveForbiddenNotice(error).message;
  }
  return error?.response?.data?.message || error?.message || fallback;
};
