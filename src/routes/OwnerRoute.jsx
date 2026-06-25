import { Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import OwnerSubscriptionGate from '../components/common/OwnerSubscriptionGate';
import {
  getOwnerAccessPath,
  getStoredUser,
  isOwnerRole,
  isOwnerSubscriptionReady,
} from '../hooks/useAuth';

export const OwnerRoute = ({ children }) => {
  const user = getStoredUser();

  if (!isOwnerRole(user?.role)) {
    return <Navigate to="/" replace />;
  }

  if (!isOwnerSubscriptionReady(user)) {
    return <Navigate to={getOwnerAccessPath(user)} replace />;
  }

  return (
    <PrivateRoute allowedRoles={['owner']}>
      <OwnerSubscriptionGate>{children}</OwnerSubscriptionGate>
    </PrivateRoute>
  );
};

export default OwnerRoute;
