import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { Dashboard } from './features/dashboard';
import DebtDetailsPage from './features/dashboard/pages/DebtDetailsPage';
import ExcelTemplateAdminPage from './features/admin/pages/ExcelTemplateAdminPage';
import RoomsPage from './features/rooms/pages/RoomsPage';
import TenantsPage from './features/tenants/pages/TenantsPage';
import ContractsPage from './features/contracts/pages/ContractsPage';
import VehiclesPage from './features/vehicles/pages/VehiclesPage';
import { PrivateRoute } from './routes/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['Owner', 'Admin']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/debts"
          element={
            <PrivateRoute allowedRoles={['Owner', 'Admin']}>
              <DebtDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/excel-template"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <ExcelTemplateAdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <RoomsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenants"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <TenantsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <ContractsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <PrivateRoute allowedRoles={['Owner']}>
              <VehiclesPage />
            </PrivateRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
