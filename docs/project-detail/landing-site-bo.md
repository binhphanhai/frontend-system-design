# Tech Stack Cheatsheet: koc-landing-site-fe-bo

---

## Tech Stack

- **Framework:** React 17 (SPA, micro-frontend ready via single-spa)
  - Modular architecture, supports dynamic section rendering, micro-frontend integration
- **Language:** TypeScript (strict, modern, with custom types for business domains)
- **State Management:** Redux Toolkit (with RTK Query for API data fetching/caching)
  - Typed hooks (`useAppDispatch`, `useAppSelector`)
- **UI Library:** Ant Design (v5)
  - Pro Layout, Table, Modal, Form, Tabs, Switch, etc.
- **Styling:** SCSS (modular, global), styled-jsx (CSS-in-JS, with SASS plugin)
- **API Communication:** Axios (custom instance, interceptors for error handling, 401 logout)
- **Routing:** React Router DOM (v6, lazy loading, Suspense)
- **Component Libraries:**
  - react-sortable-hoc (drag-and-drop for lists)
  - jodit-react, react-quill (rich text editors)
  - antd icons, pro-layout
- **Utilities:**
  - dayjs (date/time), lodash, custom utility functions
- **Build/Deployment:**
  - Webpack 5 (custom config, single-spa-react-ts presets)
  - Docker (multi-stage build, environment variables)
  - Yarn (dependency management)
- **Linting/Formatting:**
  - ESLint (Airbnb, Prettier, TypeScript plugin)
  - Prettier (code formatting)
  - Husky (pre-commit hooks), lint-staged
- **Testing:** (minimal, not a focus in this codebase)
- **Other:**
  - Environment-based config (API URLs, roles, etc.)
  - Image asset management (local, CDN)

---

## Interview Talking Points

### Modular Page Setting System

- **Dynamic Section Management:**
  - Admins can configure which sections (Navigation Bar, Sliding Banner, Introduction, Iframe, Course, Contact, FAQ & Link, CTA, Program, Game Program, Zoom Class) are visible per page type (Acquire/Affiliate).
  - Each section is a modular React component, rendered based on config and user role.
  - Section visibility is toggleable via UI switches, persisted to backend.
- **Role-based Configuration:**
  - Supports different layouts and available sections for "NON_AFFILIATE" and "AFFILIATE" user types.
  - Hardcoded sections (e.g., top header, benefits) always visible; others are configurable.
- **Drag-and-Drop Ordering:**
  - Uses `react-sortable-hoc` for reordering items (e.g., banners, menus, FAQ, courses) with smooth animations.
  - Supports item duplication, deletion, and inline editing.
- **Save Confirmation & Navigation Guard:**
  - Unsaved changes trigger a modal before navigation or page close, ensuring data integrity.
  - Custom hook (`useSaveConfirmation`) manages this logic.

### Course & Article Management

- **Course CRUD:**
  - Admins can create, edit, delete, and reorder courses.
  - Each course can have multiple articles, categories, and tags.
- **Article Management:**
  - Rich text editing (Jodit, Quill), status (draft/published), thumbnail upload.
  - Pagination, filtering, and category assignment.

### Zoom Class Management

- **Zoom Class CRUD:**
  - Admins can create, edit, delete, and schedule Zoom classes.
  - Supports registration window, start time, duration, and status (ongoing, scheduled, ended).
  - Level tags for audience targeting.

### Section-Specific Features

- **Navigation Bar:**
  - Dynamic, multi-level menu with drag-and-drop and inline editing.
- **Sliding Banner:**
  - Configurable banners with scheduling, image upload, and links.
- **Introduction, Iframe, Contact, FAQ & Link:**
  - Each section has its own form, validation, and preview logic.
- **Program/Game Program:**
  - List of ongoing or scheduled programs, with tags and scheduling.
- **CTA:**
  - Configurable call-to-action text and approval flow.

### API & State Management

- **RTK Query:**
  - All API calls (CRUD for courses, page settings, zoom classes, etc.) are managed via RTK Query endpoints.
  - Automatic caching, invalidation, and loading state management.
- **Axios Interceptors:**
  - Handles global error messaging, 401 logout, and CSV file download edge cases.

### UX & UI

- **Ant Design Pro Layout:**
  - Consistent, modern admin UI with responsive design.
- **Customizable Table Views:**
  - Pagination, filtering, and dynamic columns for all major lists.
- **Image Uploads:**
  - Drag-and-drop, preview, and CDN integration for all image fields.
- **Accessibility & Feedback:**
  - Tooltips, badges, and status indicators throughout the UI.

### Deployment & Scalability

- **Micro-Frontend Ready:**
  - Built with single-spa for integration into larger admin platforms.
- **Dockerized Build:**
  - Multi-stage Dockerfile for reproducible builds and environment separation.
- **Environment Config:**
  - Supports dev, test, UAT, and live environments with different API endpoints and roles.

---

> Use these talking points to confidently explain the architecture, modularity, and admin-focused features of the project. Emphasize the dynamic section management, robust state/API handling, and production-grade deployment pipeline.
