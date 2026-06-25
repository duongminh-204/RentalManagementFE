import { Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import OwnerSubscriptionGate from '../components/common/OwnerSubscriptionGate';
import { getStoredUser, isOwnerRole } from '../hooks/useAuth';

export const OwnerRoute = ({ children }) => {
  const user = getStoredUser();

  if (!isOwnerRole(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <PrivateRoute allowedRoles={['owner']}>
      <OwnerSubscriptionGate>{children}</OwnerSubscriptionGate>
    </PrivateRoute>
  );
};

export default OwnerRoute;
