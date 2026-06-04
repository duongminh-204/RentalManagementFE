# Frontend Architecture Rules

* Project stack: React 19, Vite, Tailwind CSS v4, Headless UI, Framer Motion
* Routing strategy: React Router DOM with PrivateRoute wrapper for protected access.
* State management strategy: Custom Hooks + React Context (No Redux/Zustand detected).
* API communication pattern: Axios instance with request/response interceptors for JWT.
* Component architecture: Feature-driven architecture (`src/features/{featureName}`).

# Dependency Rules

* Pages: Compose features and handle route-level logic. Located in `src/features/{featureName}/pages/`.
* Components: Reusable UI blocks in `src/components/` or feature-specific in `src/features/{featureName}/components/`.
* Hooks: Shared hooks in `src/hooks/`, feature-specific hooks in `src/features/{featureName}/hooks/`.
* Contexts: Use for global state like user authentication.
* Services: API calls located in `src/features/{featureName}/api/` or `src/utils/api.js`.
* Utils: Helper functions in `src/utils/`.

# Component Rules

* Reusable components: Must be stateless where possible, accept props for configuration.
* UI consistency: Use Tailwind classes and Headless UI for styling and accessibility.
* Separation of concerns: Keep business logic in custom hooks, keep components focused on rendering.

# API Rules

* How API calls are made: Using the configured Axios instance (`src/utils/api.js`).
* Axios/fetch conventions: Export async functions that return `response.data`.
* Error handling conventions: Catch errors in the component/hook layer, interceptors handle 401s.

# State Management Rules

* Context: Used for authentication and global user state.
* Hooks: Used for local state and data fetching.

# Routing Rules

* Public routes: `/login`, `/register`.
* Protected routes: Wrapped in `<PrivateRoute>` component.
* Role-based routes: Controlled within `<PrivateRoute>` or specific page components.

# Security Rules

* JWT handling: Token injected via Axios request interceptor.
* Token storage: Stored in `localStorage` as `token`.
* Authorization headers: `Authorization: Bearer {token}`.

# Coding Standards

* Naming conventions: PascalCase for components/pages (`MyComponent.jsx`), camelCase for hooks/utils (`useAuth.js`).
* Async patterns: `async/await` with try-catch blocks.
* Folder conventions: Group by feature (`src/features/*`).

# Feature Workflow

1. Identify affected files within the specific feature directory.
2. Read only affected files.
3. Modify minimum files required.

# Token Optimization Rules

* Never scan entire frontend
* Never analyze whole src folder unless requested
* Read only explicitly attached files
* Ask for missing files instead of scanning directories
* Reuse existing components, hooks, and services
* Follow existing patterns
