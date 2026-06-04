## Pages
* LoginPage
* RegisterPage
* Dashboard
* RoomsPage
* TenantsPage
* ContractsPage
* VehiclesPage
* InvoicesPage
* ProfilePage

## Components
* Common UI Components (`src/components/ui/`, `src/components/common/`)
* Form Components (`src/components/forms/`)
* Table Components (`src/components/tables/`)

## Layouts
* AuthLayout
* MainLayout
* TenantLayout

## Hooks
* useAuth
* useDebounce
* useFetch

## Contexts
* AuthContext / UserContext (Implicit via useAuth)

## Services
* API Instance (`src/utils/api.js`)
* Feature-specific API Services (`src/features/*/api/`)

## Utils
* api.js
* constants.js
* dateHelpers.js
* format.js
* helpers.js
* roomConstants.js

## Routes
* Public Routes (/login, /register)
* Protected Routes (/dashboard, /rooms, /invoices, /tenants, /contracts, /vehicles, /profile)

## Important Flows

* Authentication Flow: Login/Register -> JWT stored in localStorage -> Interceptor attaches token -> PrivateRoute validates token.
* User Profile Flow: Fetch current user -> Display in ProfilePage -> Update via API.
* File Upload Flow: Convert to FormData -> Axios post with multipart/form-data.
* Dashboard Flow: Fetch aggregate metrics -> Render dashboard charts/stats.
