# Tech Stack Cheatsheet: urchin-fe

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19 Compiler, Turbopack)
  - Modern SSR/SSG, route-based code splitting, optimized for containerized deployment
- **Language:** TypeScript 5.3 (strict mode, modern JS features)
- **UI Library:** Ant Design 5.24 (with @ant-design/icons, custom themes, and React 19 patch)
- **State Management:** Redux Toolkit 2.3, RTK Query (API state, caching, auto-generated hooks)
- **API Communication:** Axios (custom base query, JWT auth, interceptors)
- **Styling:** Sass (SCSS), CSS variables for theming, Ant Design theming
- **Component Patterns:**
  - Modular: Shared, UI, and feature components (compound, modal, layout)
  - Modal conventions: Create/Edit/Action modals, reusable props interfaces
- **Utilities:**
  - Fuse.js (fuzzy search)
  - Day.js (date/time)
  - Lodash (utility functions)
  - Mousetrap (keyboard shortcuts)
  - React Virtuoso (virtualized lists)
  - Recharts (charts/visualization)
- **Build/Deployment:** Docker (multi-stage, standalone Next.js), Yarn, Turbopack, environment-specific builds (test/uat/live)
- **Linting/Formatting:** ESLint (Airbnb, Prettier), Husky (pre-commit hooks), lint-staged, TypeScript type checking
- **Other:**
  - Responsive design (desktop/mobile)
  - Google Fonts (Roboto)
  - Real-time updates (RTK Query live sync)
  - Git hooks for code quality

---

## Interview Talking Points

### Test Case Management & Domain Model

- **Hierarchical Test Case Organization:** Unlimited nesting of sections/subsections for test cases, supporting complex QA structures.
- **Rich Test Case Details:** Each test case supports steps, preconditions, expected results, automation flags, and metadata (estimate, milestone, user story, etc.).
- **Bulk Import/Export:** Enables large-scale test case migration and backup.
- **Version Control:** Tracks changes and updates to test cases for auditability.
- **Advanced Search & Filter:** Uses Fuse.js for fuzzy search, enabling quick retrieval even in large datasets.
- **Interactive Tree View:** Expand/collapse navigation for deep test case hierarchies.

### Test Planning & Execution

- **Test Plans & Runs:** Organize test execution into plans and runs, with status tracking (Passed, Failed, Blocked, Retest).
- **Statistics Dashboard:** Real-time progress and statistics for test runs and plans.
- **Comprehensive Execution Tracking:** Detailed reporting and history for each test run.

### Project & Team Management

- **Multi-Project Support:** Manage multiple projects, each with its own test case hierarchy and team.
- **Role-Based Access Control:** Granular permissions for users, roles, and groups.
- **Team Collaboration:** Assign users to projects, manage groups, and bookmark frequently used projects.

### UI/UX & Theming

- **Modern UI:** Built with Ant Design, leveraging its component library and icon set.
- **Theme System:** Light/Dark mode with 8 color schemes, user preferences synced across devices, and automatic adaptation to system theme.
- **Responsive Design:** Fully functional on both desktop and mobile.
- **Virtual Scrolling:** Uses React Virtuoso for efficient rendering of large lists (test cases, runs, etc.).
- **Performance Optimizations:** Code splitting, memoization (React.memo, useMemo), and Turbopack for fast builds.

### State Management & Data Flow

- **Redux Toolkit + RTK Query:**
  - Each domain (projects, test cases, plans, runs, users, roles, groups) has its own API slice.
  - Auto-generated hooks for queries and mutations.
  - Tag-based cache invalidation for efficient data updates.
  - Centralized store configuration and middleware.
- **API Integration:**
  - Axios with JWT authentication, environment-based API URLs, and global error handling.
  - RTK Query for data fetching, caching, and synchronization.
- **Error Handling:**
  - User-friendly error messages (Ant Design message API).
  - Loading and fallback states for all async operations.
  - Global error handling via Axios interceptors.

### Component & Code Patterns

- **Component Architecture:**
  - Shared components in a dedicated directory, feature components colocated with routes.
  - Consistent modal patterns (Create/Edit/Action), reusable prop interfaces.
- **UI Consistency:**
  - Ant Design for layout, forms, tables, and feedback.
  - Custom SCSS for global styles and theme variables.
- **Quick Development Patterns:**
  - Page and component scaffolding conventions.
  - Permission guards for protected routes/components.

### Build, Quality, and Deployment

- **Build System:**
  - Multi-stage Dockerfile for dependency, build, and production images.
  - Standalone Next.js output for containerized deployment.
  - Environment-specific builds (test, UAT, live).
- **Code Quality:**
  - ESLint (Airbnb), Prettier, Husky, lint-staged for pre-commit checks.
  - TypeScript strict mode for type safety.
  - Automatic import sorting and organization.
- **CI/CD Ready:**
  - Yarn scripts for all major workflows.
  - Production builds remove console logs (except errors).

---

> Use these talking points to confidently explain the architecture, flows, and strengths of the project in interviews. Emphasize the deep test management features, robust state/API patterns, modular component architecture, advanced theming, and production-grade build pipeline.
