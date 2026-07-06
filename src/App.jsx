import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { HomePage } from './features/home';
import { Dashboard } from './features/dashboard';
import DebtDetailsPage from './features/dashboard/pages/DebtDetailsPage';
import RoomsPage from "./features/rooms/pages/RoomsPage";
import { BuildingPage, BuildingCreate, BuildingEdit } from "./features/buildings";
import TenantsPage from "./features/tenants/pages/TenantsPage";
import VehiclesPage from "./features/vehicles/pages/VehiclesPage";
import DevicesPage from "./features/devices/pages/DevicesPage";
import InvoicesPage from "./features/invoices/pages/InvoicesPage";
import { ProfilePage } from './features/profile';
import { RoomDecorPage } from './features/room-decor';
import ExcelTemplateAdminPage from './features/admin/pages/ExcelTemplateAdminPage';
import AdminPlaceholderPage from './features/admin/pages/AdminPlaceholderPage';
import ChatAdminPage from './features/chat/pages/ChatAdminPage';
import ChatWidget from './components/common/ChatWidget';

import { PrivateRoute } from './routes/PrivateRoute';
import { contractRoutes } from './routes/index.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
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
          path="/debts"
          element={
            <PrivateRoute>
              <DebtDetailsPage />
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
          path="/rooms/decor"
          element={
            <PrivateRoute>
              <RoomDecorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings"
          element={
            <PrivateRoute>
              <BuildingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings/create"
          element={
            <PrivateRoute>
              <BuildingCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings/:id/edit"
          element={
            <PrivateRoute>
              <BuildingEdit />
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
        {contractRoutes}
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
        <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
        <Route
          path="/admin/overview"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="overview" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="users" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/monitoring"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="monitoring" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="tickets" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="plans" />
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
          path="/admin/chat"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <ChatAdminPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="settings" />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <PrivateRoute allowedRoles={['Admin']}>
              <AdminPlaceholderPage type="auditLogs" />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ChatWidget />
    </Router>
  );
}

export default App;
