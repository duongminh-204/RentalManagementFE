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
import { LegalPage } from './features/legal';
import { RoomDecorPage } from './features/room-decor';
import {
  AdminAuditLogsPage,
  AdminDashboardPage,
  AdminOwnersPage,
  AdminPackagesPage,
  AdminPaymentsPage,
  AdminSubscriptionsPage,
  AdminUsersPage,
  ExcelTemplateAdminPage,
} from './features/admin';

import { PrivateRoute } from './routes/PrivateRoute';
import { OwnerRoute } from './routes/OwnerRoute';
import { AdminPrivateRoute } from './routes/AdminPrivateRoute';
import { contractRoutes } from './routes/index.jsx';
import SelectPlanPage from './features/packages/pages/SelectPlanPage';
import SubscriptionPendingPage from './features/packages/pages/SubscriptionPendingPage';
import ForbiddenNotifier from './components/common/ForbiddenNotifier';

function App() {
  return (
    <Router>
      <ForbiddenNotifier />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/register/select-plan"
          element={
            <PrivateRoute allowedRoles={['owner']} hideSidebar>
              <SelectPlanPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/subscription/pending"
          element={
            <PrivateRoute allowedRoles={['owner']}>
              <SubscriptionPendingPage />
            </PrivateRoute>
          }
        />

        {/* Protected Routes — Owner only (active subscription) */}
        <Route path="/dashboard" element={<OwnerRoute><Dashboard /></OwnerRoute>} />
        <Route path="/debts" element={<OwnerRoute><DebtDetailsPage /></OwnerRoute>} />
        <Route path="/rooms" element={<OwnerRoute><RoomsPage /></OwnerRoute>} />
        <Route path="/rooms/decor" element={<OwnerRoute><RoomDecorPage /></OwnerRoute>} />
        <Route path="/legal" element={<OwnerRoute><LegalPage /></OwnerRoute>} />
        <Route path="/buildings" element={<OwnerRoute><BuildingPage /></OwnerRoute>} />
        <Route path="/buildings/create" element={<OwnerRoute><BuildingCreate /></OwnerRoute>} />
        <Route path="/buildings/:id/edit" element={<OwnerRoute><BuildingEdit /></OwnerRoute>} />
        <Route path="/invoices" element={<OwnerRoute><InvoicesPage /></OwnerRoute>} />
        <Route path="/tenants" element={<OwnerRoute><TenantsPage /></OwnerRoute>} />
        {contractRoutes}
        <Route path="/vehicles" element={<OwnerRoute><VehiclesPage /></OwnerRoute>} />
        <Route path="/devices" element={<OwnerRoute><DevicesPage /></OwnerRoute>} />
        <Route path="/services" element={<Navigate to="/devices" replace />} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminPrivateRoute>
              <AdminDashboardPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/owners"
          element={
            <AdminPrivateRoute>
              <AdminOwnersPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/packages"
          element={
            <AdminPrivateRoute>
              <AdminPackagesPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/subscriptions"
          element={
            <AdminPrivateRoute>
              <AdminSubscriptionsPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminPrivateRoute>
              <AdminPaymentsPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminPrivateRoute>
              <AdminUsersPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <AdminPrivateRoute>
              <AdminAuditLogsPage />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/excel-template"
          element={
            <AdminPrivateRoute>
              <ExcelTemplateAdminPage />
            </AdminPrivateRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
