import { Route } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import ContractsPage from '../features/contracts/pages/ContractsPage';
import CreateContractPage from '../features/contracts/pages/CreateContractPage';
import ContractDetailPage from '../features/contracts/pages/ContractDetailPage';

/** Contract module routes — import into App.jsx Routes */
export const contractRoutes = (
  <>
    <Route
      path="/contracts/create"
      element={
        <PrivateRoute>
          <CreateContractPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/contracts/:id"
      element={
        <PrivateRoute>
          <ContractDetailPage />
        </PrivateRoute>
      }
    />
    <Route
      path="/contracts"
      element={
        <PrivateRoute>
          <ContractsPage />
        </PrivateRoute>
      }
    />
  </>
);

export default contractRoutes;
