# Tech Stack Cheatsheet: affiliate-framework-fe-bo

---

## Tech Stack

- **Framework:** React 17 (Single-SPA Microfrontend)
  - Microfrontend architecture using single-spa and single-spa-react
  - Modular, independently deployable frontend modules
- **Language:** TypeScript (strict, modern, enforced via tsconfig)
- **State Management:** Redux Toolkit (RTK Query for API cache, async thunks)
- **Routing:** React Router v6 (SPA navigation)
- **UI Library:** Ant Design (antd, pro-layout, icons)
- **Styling:**
  - SCSS (global styles, modular .scss files)
  - styled-jsx (with SASS plugin)
  - Ant Design theming (custom primary color)
- **API Communication:**
  - Axios (custom axios instance, interceptors for error handling, auth, CSV download)
  - RTK Query (Redux Toolkit Query) for API abstraction and caching
- **File Handling:**
  - react-csv (CSV export)
- **Build/Tooling:**
  - Webpack 5 (custom config, single-spa integration, SCSS/LESS loaders)
  - Babel (TypeScript, React, styled-jsx, SASS plugin)
  - Yarn (dependency management)
  - Docker (multi-stage build, environment-based config)
- **Linting/Formatting:**
  - ESLint (Airbnb, Prettier integration, TypeScript rules)
  - Prettier (code formatting)
  - Husky (pre-commit hooks)

---

## Interview Talking Points

### Microfrontend Architecture

- Built as a microfrontend using single-spa, enabling independent deployment and integration with other apps.
- Each module (Program Creator, Program Setting, User Management, etc.) is lazy-loaded and can be developed in isolation.
- Webpack config and Dockerfile are optimized for modular builds and environment-based deployment.

### Domain-Driven Modularization

- Codebase is organized by business domains (Program, User, Evidence, Performance, Scheduler, etc.), each with its own UI, API, and logic.
- Each domain has its own filter, table, and modal components, making the codebase highly maintainable and scalable.
- Shared utilities and constants are extracted for DRYness and consistency.

### Advanced State Management

- Uses Redux Toolkit with RTK Query for API data fetching, caching, and state normalization.
- Async thunks and middleware handle side effects, API retries, and error handling.
- State is organized by domain, making it easy to reason about and extend.

### Robust API Layer

- All API calls are abstracted via RTK Query and a custom Axios instance.
- Global Axios interceptors handle authentication, error toasts, and CSV file downloads.
- API errors (including 401) trigger user feedback and session management.

### Dynamic Program & Campaign Management

- Supports creation and management of multiple "programs" (campaigns), each with its own configuration, assets, milestones, missions, and rewards.
- Dynamic routing and configuration loading based on program context.
- Modular steps for program creation: settings, scheme, milestones, missions, rewards, assets, and stages.

### Rich Admin Features

- **User Management:** Filter, export, and mass-update users; permission-based actions.
- **Evidence Management:** Review, approve/reject, assign, and mass-upload evidence; history logs for traceability.
- **Mission & Performance Tracking:** Real-time mission status, performance analytics, and leaderboard.
- **Scheduler:** Assign missions/events to specific days; supports custom, spike, and recurring schedules.
- **CSV Upload/Export:** Custom CSV upload modal with validation, and CSV export for reporting.
- **Dynamic UI:** Modular popups, drag-and-drop, and rich text editing for admin workflows.

### Permission & Role-Based Access

- All routes and actions are permission-guarded based on user roles.
- Permissions are defined in shared constants and checked before rendering UI/actions.

### Error Handling & User Feedback

- All API/network errors are caught and shown as user-friendly toasts (Ant Design message).
- Dedicated UI for error, not authorized, not found, and loading states.
- Form validation and feedback for all admin actions.

### Theming & Customization

- Ant Design theming with custom primary color and prefixCls for style isolation.
- styled-jsx and SCSS for modular, maintainable styles.

### Deployment & Scalability

- Dockerized for consistent builds and deployments.
- Environment-based config for API endpoints and static asset URLs.
- Designed for integration into a larger microfrontend platform (e.g., Shopee internal tools).

---

> Use these talking points to confidently explain the architecture, flows, and strengths of the project in interviews. Emphasize the microfrontend approach, domain-driven modularization, robust admin features, and production-grade deployment pipeline.
