import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { Dashboard } from './features/dashboard';
import RoomsPage from "./features/rooms/pages/RoomsPage";
import TenantsPage from "./features/tenants/pages/TenantsPage";
import ContractsPage from "./features/contracts/pages/ContractsPage";
import VehiclesPage from "./features/vehicles/pages/VehiclesPage";
import DevicesPage from "./features/devices/pages/DevicesPage";
import InvoicesPage from "./features/invoices/pages/InvoicesPage";
import { ProfilePage } from './features/profile';

import { PrivateRoute } from './routes/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoute>
              <RoomsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <InvoicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenants"
          element={
            <PrivateRoute>
              <TenantsPage />
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
        <Route
          path="/vehicles"
          element={
            <PrivateRoute>
              <VehiclesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <PrivateRoute>
              <DevicesPage />
            </PrivateRoute>
          }
        />
        <Route path="/services" element={<Navigate to="/devices" replace />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;