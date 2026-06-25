import { requestSubscription } from '../api/subscriptionsApi';
import { updateStoredUser } from '../../../hooks/useAuth';

export async function subscribeToPackage(packageId) {
  const subscription = await requestSubscription(packageId);
  const isUpgrade = subscription.isUpgrade ?? subscription.IsUpgrade;

  if (isUpgrade) {
    if (String(subscription.status).toLowerCase() === 'active') {
      updateStoredUser({
        hasPendingUpgrade: false,
        pendingPackageId: null,
        pendingPackageName: null,
        pendingPaymentAmount: null,
        subscriptionStatus: subscription.status,
        packageId: subscription.packageId,
        packageName: subscription.packageName,
      });
    } else {
      updateStoredUser({
        hasPendingUpgrade: true,
        pendingPackageId: subscription.packageId,
        pendingPackageName: subscription.packageName,
        pendingPaymentAmount: subscription.paymentAmount ?? subscription.PaymentAmount,
      });
    }
  } else {
    updateStoredUser({
      subscriptionStatus: subscription.status,
      packageId: subscription.packageId,
      packageName: subscription.packageName,
      hasPendingUpgrade: false,
      pendingPackageId: null,
      pendingPackageName: null,
      pendingPaymentAmount: null,
    });
  }

  return subscription;
}
