import { useCallback, useEffect, useRef, useState } from 'react';
import { getMySubscription } from '../features/packages/api/subscriptionsApi';
import {
  getStoredUser,
  hasOwnerTrialAccess,
  isOwnerRole,
  isOwnerSubscriptionActive,
  isOwnerSubscriptionPending,
  needsSubscriptionPayment,
  updateStoredUser,
} from './useAuth';

const POLL_INTERVAL_MS = 15000;

export const syncSubscriptionFromApi = async () => {
  const user = getStoredUser();
  if (!isOwnerRole(user?.role)) return null;

  try {
    const data = await getMySubscription();
    const currentStatus = String(user?.subscriptionStatus || '').toLowerCase();
    const newStatus = String(data?.status || '').toLowerCase();

    const hasChanges =
      (data?.status && newStatus !== currentStatus) ||
      (data?.packageId != null && data.packageId !== user?.packageId) ||
      (data?.packageName && data.packageName !== user?.packageName) ||
      Boolean(data?.hasPendingUpgrade) !== Boolean(user?.hasPendingUpgrade) ||
      Boolean(data?.hasTrialAccess) !== Boolean(user?.hasTrialAccess) ||
      JSON.stringify(data?.effectiveFeatures || []) !== JSON.stringify(user?.effectiveFeatures || []);

    if (hasChanges) {
      const merged = updateStoredUser({
        subscriptionStatus: data.status,
        packageId: data.packageId,
        packageName: data.packageName,
        hasPendingUpgrade: Boolean(data.hasPendingUpgrade),
        pendingPackageId: data.pendingPackageId ?? null,
        pendingPackageName: data.pendingPackageName ?? null,
        pendingPaymentAmount: data.pendingPaymentAmount ?? null,
        hasTrialAccess: Boolean(data.hasTrialAccess),
        effectiveFeatures: data.effectiveFeatures || [],
      });
      return {
        data,
        user: merged,
        activated:
          (newStatus === 'active' && currentStatus === 'pending') ||
          (newStatus === 'active' &&
            data?.packageId != null &&
            data.packageId !== user?.packageId),
      };
    }

    return { data, user, activated: false };
  } catch {
    return null;
  }
};

export const useSubscriptionSync = ({ poll = true, onActivated } = {}) => {
  const [subscription, setSubscription] = useState(null);
  const [checking, setChecking] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const onActivatedRef = useRef(onActivated);
  onActivatedRef.current = onActivated;

  const refresh = useCallback(async (silent = false) => {
    const user = getStoredUser();
    if (!isOwnerRole(user?.role)) {
      setInitialized(true);
      return null;
    }

    if (!silent) setChecking(true);
    try {
      const result = await syncSubscriptionFromApi();
      if (result?.data) setSubscription(result.data);
      if (result?.activated) onActivatedRef.current?.(result.data);
      return result;
    } finally {
      if (!silent) setChecking(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    const user = getStoredUser();
    if (!isOwnerRole(user?.role)) return undefined;

    refresh(true);

    if (!poll) return undefined;

    const shouldPollAccess = (currentUser) =>
      needsSubscriptionPayment(currentUser) ||
      (isOwnerRole(currentUser?.role) &&
        !isOwnerSubscriptionActive(currentUser) &&
        !hasOwnerTrialAccess(currentUser));

    if (!shouldPollAccess(user)) return undefined;

    const intervalId = setInterval(async () => {
      const currentUser = getStoredUser();
      if (!shouldPollAccess(currentUser)) {
        clearInterval(intervalId);
        return;
      }

      const result = await syncSubscriptionFromApi();
      if (result?.data) setSubscription(result.data);
      if (result?.activated) {
        onActivatedRef.current?.(result.data);
        clearInterval(intervalId);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [poll, refresh]);

  return { subscription, checking, initialized, refresh };
};
