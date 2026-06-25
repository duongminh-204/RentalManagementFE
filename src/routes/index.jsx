import { Route } from 'react-router-dom';
import { OwnerRoute } from './OwnerRoute';
import ContractsPage from '../features/contracts/pages/ContractsPage';
import CreateContractPage from '../features/contracts/pages/CreateContractPage';
import ContractDetailPage from '../features/contracts/pages/ContractDetailPage';

/** Contract module routes — import into App.jsx Routes */
export const contractRoutes = (
  <>
    <Route
      path="/contracts/create"
      element={
        <OwnerRoute>
          <CreateContractPage />
        </OwnerRoute>
      }
    />
    <Route
      path="/contracts/:id"
      element={
        <OwnerRoute>
          <ContractDetailPage />
        </OwnerRoute>
      }
    />
    <Route
      path="/contracts"
      element={
        <OwnerRoute>
          <ContractsPage />
        </OwnerRoute>
      }
    />
  </>
);

export default contractRoutes;
