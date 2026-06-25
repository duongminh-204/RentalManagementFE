import { requestSubscription } from '../api/subscriptionsApi';
import { updateStoredUser } from '../../../hooks/useAuth';

export async function subscribeToPackage(packageId) {
  const subscription = await requestSubscription(packageId);
  updateStoredUser({
    subscriptionStatus: subscription.status,
    packageId: subscription.packageId,
    packageName: subscription.packageName,
  });
  return subscription;
}
