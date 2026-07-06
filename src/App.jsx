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
import OwnerChatPage from './features/chat/pages/OwnerChatPage';
import ChatWidget from './components/common/ChatWidget';

import { PrivateRoute } from './routes/PrivateRoute';
import { contractRoutes } from './routes/index.jsx';
import { getStoredRole, isOwnerRole } from './hooks/useAuth';

const OWNER_ROLES = ['Owner'];
const INTERNAL_CHAT_ROLES = ['Owner', 'Tenant'];

const InternalChatRoute = () => (
  <OwnerChatPage mode={isOwnerRole(getStoredRole()) ? 'owner' : 'tenant'} />
);

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
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/debts"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <DebtDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <RoomsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/rooms/decor"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <RoomDecorPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <BuildingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings/create"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <BuildingCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/buildings/:id/edit"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <BuildingEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <InvoicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenants"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <TenantsPage />
            </PrivateRoute>
          }
        />
        {contractRoutes}
        <Route
          path="/vehicles"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <VehiclesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/devices"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <DevicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute allowedRoles={INTERNAL_CHAT_ROLES}>
              <InternalChatRoute />
            </PrivateRoute>
          }
        />
        <Route
          path="/services"
          element={
            <PrivateRoute allowedRoles={OWNER_ROLES}>
              <Navigate to="/devices" replace />
            </PrivateRoute>
          }
        />
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
