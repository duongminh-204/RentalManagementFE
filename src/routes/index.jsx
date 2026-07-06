import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import ContractsPage from '../features/contracts/pages/ContractsPage';
import CreateContractPage from '../features/contracts/pages/CreateContractPage';
import ContractDetailPage from '../features/contracts/pages/ContractDetailPage';

const OWNER_ROLES = ['Owner'];

/** Contract module routes — import into App.jsx Routes */
export const contractRoutes = (
  <>
    <Route
      path="/contracts/create"
      element={
        <PrivateRoute allowedRoles={OWNER_ROLES}>
          <CreateContractPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/contracts/:id"
      element={
        <PrivateRoute allowedRoles={OWNER_ROLES}>
          <ContractDetailPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/contracts"
      element={
        <PrivateRoute allowedRoles={OWNER_ROLES}>
          <ContractsPage />
        </PrivateRoute>
      }
    />
  </>
);

export default contractRoutes;
