# Tech Stack Cheatsheet: tomtep-talk-fe

---

## Tech Stack

- **Framework:** Next.js (v12)
  - Server-side rendering (SSR), static site generation (SSG), standalone Docker build
- **Language:** TypeScript (strict), React 18
- **State Management:** Redux Toolkit, React-Redux, RTK Query (for API caching)
- **Styling:** Ant Design (antd), styled-components, SCSS (Sass)
- **Component Libraries:**
  - Ant Design (UI components)
  - Framer Motion (animation)
  - react-virtualized, react-virtuoso, react-window (virtualized lists)
  - @ant-design/icons (icon set)
- **API Communication:** Axios (custom instance with interceptors), RTK Query
- **WebSocket:** Centrifuge (real-time messaging), SIP.js (VoIP calls), sockette (fallback)
- **IndexedDB/Local Storage:** Dexie (IndexedDB wrapper), dexie-react-hooks (for local message search/cache)
- **Utilities:** lodash, dayjs, moment, papaparse, file-saver, howler (audio), mousetrap (keyboard), classnames
- **File Handling:** File upload (multi-type, preview, validation), file preview (images, docs, video, audio)
- **Testing:** Jest, @testing-library/react, @testing-library/jest-dom, miragejs (mock server)
- **Build/Deployment:** Docker (multi-stage), Yarn, GitLab CI/CD, Google Cloud Storage (static assets)
- **Linting/Formatting:** ESLint (Airbnb, Prettier), Husky (pre-commit), TypeScript type checking
- **PWA/Service Worker:** workbox-webpack-plugin, custom service worker
- **Other:** Remote web workers, custom hooks, modular domain structure

---

## Interview Talking Points (How It Works)

### 1. Message Search & Local Storage (IndexedDB/Dexie)

- **Purpose:** Enable fast, offline-capable search of chat messages, even for large histories.
- **How it works:**
  - On message receipt (from server or sent by user), messages are stored in IndexedDB using **Dexie**.
  - The schema includes indexes for conversation_id, time, and composite keys for efficient queries.
  - **Web Workers** are used for search operations:
    - When a user searches, the query is sent to a dedicated worker (e.g., `searchLocalMessageWorker.ts`).
    - The worker runs Dexie queries and regex filters, returning only matching messages.
    - This keeps the UI responsive, even for thousands of messages.
  - Supports global search (across all conversations) and scoped search (within a conversation, by sender/type).
  - Search results are paginated and sorted by time (most recent first).
  - Local cache enables instant search and offline access to recent messages.
  - **Sync logic:** On reconnect or page load, missing messages are fetched from the server and merged into IndexedDB.

### 2. Real-Time Messaging & WebSocket (Centrifuge, SIP.js)

- **Purpose:** Provide instant updates for chat, presence, and call events.
- **How it works:**
  - **Centrifuge** is used as the main WebSocket client:
    - On login, a JWT token is retrieved and stored in localStorage.
    - The WebSocket URL and token are injected from environment variables.
    - The client connects and subscribes to relevant channels (e.g., user, conversation, group).
    - Listens for events: new message, message update, typing, presence, etc.
    - On receiving an event, dispatches Redux actions to update the UI and local IndexedDB.
    - Handles reconnect, backoff, and error events gracefully (with user feedback if needed).
  - **SIP.js** and **ecmascript-webrtc-sipml** are used for VoIP:
    - On call initiation, a SIP/WebRTC connection is established to the backend call server.
    - Handles call events: created, hangup, bye, server disconnect, etc.
    - Audio streams are managed via WebRTC and HTML audio elements.
    - Call credentials and signaling are environment-configurable.

### 3. API/Web Service Communication (Axios, RTK Query)

- **Purpose:** Communicate with backend for all CRUD, business logic, and file operations.
- **How it works:**
  - **Axios** is used for most HTTP requests:
    - A custom Axios instance injects the JWT token into every request via an interceptor.
    - Handles 401/403 errors by redirecting to login or showing a toast.
    - Centralized error handling: business errors (e.g., deactivation) are mapped to user-friendly messages.
    - Supports multipart/form-data for file uploads, and file-saver for downloads.
  - **RTK Query** is used for some domains (e.g., users, customers):
    - Provides caching, invalidation, and auto-refetching.
    - Integrates with Redux state for seamless updates.
  - **API endpoints** are environment-configurable (test, uat, live, etc.).

### 4. Authentication & Session Management

- **Purpose:** Secure the app, manage user sessions, and handle permissions.
- **How it works:**
  - On login, the user submits credentials and receives a JWT token and profile.
  - The token is stored in localStorage and injected into all API/WebSocket requests.
  - On app load, the AuthProvider checks for a valid token:
    - If valid, fetches user profile and permissions, and registers the service worker.
    - If invalid/expired, clears session, unregisters service worker, and redirects to splash/login.
  - Handles session expiry and deactivation:
    - If the backend returns a deactivation code, shows a toast, logs out, and reloads the app.
  - Permissions are stored in Redux and used to control UI access (e.g., features, routes).

### 5. Error Handling & User Notification

- **Purpose:** Provide robust, user-friendly error feedback and ensure app stability.
- **How it works:**
  - **API/network errors:**
    - All Axios responses are intercepted; errors are mapped to user-friendly messages and shown via Ant Design toasts (TomTepToast).
    - Special handling for deactivation, permission, and network errors (with reload or redirect).
  - **UI errors:**
    - A global React ErrorBoundary catches rendering errors and shows a fallback UI with reload option.
  - **Business logic errors:**
    - Custom error mapping for domain-specific issues (e.g., file type, size, permission, role mismatch).
  - **Notifications:**
    - In-app banners and toasts are used for status, warnings, and success messages.

### 6. State Management (Redux Toolkit, RTK Query)

- **Purpose:** Maintain predictable, scalable, and modular state across the app.
- **How it works:**
  - **Redux Toolkit** organizes state into slices per domain (app, UI, chat, contacts, etc.).
  - Async thunks and RTK Query are used for side effects and API calls.
  - State selectors are used for efficient, memoized component updates.
  - Logger middleware is enabled in development for debugging state changes.
  - RTK Query provides normalized caching and auto-refetch for API data.
  - State is persisted in memory (not localStorage), but critical data (token, profile) is synced to localStorage.

### 7. File Upload & Preview

- **Purpose:** Allow users to share and preview files in chat and customer management.
- **How it works:**
  - **Upload:**
    - Users can upload up to 20 files at once (max 3MB each, type-validated).
    - Files are validated for type and size before upload; unsupported files show a warning toast.
    - Images are previewed as thumbnails before sending (base64 preview).
    - Files are sent as multipart/form-data to the backend.
  - **Preview:**
    - Images, videos, audio, and documents (PDF, Office) are previewed in custom modals.
    - File type is detected by extension and MIME type; unsupported types show a fallback or download link.
    - File download uses file-saver and custom logic for retry/fallback.
  - **Error handling:**
    - Upload and preview errors are caught and shown to the user (e.g., size, type, network).

### 8. Deployment & Environment

- **Purpose:** Ensure reliable, scalable, and environment-specific deployments.
- **How it works:**
  - **Docker:**
    - Multi-stage Dockerfile builds a standalone Next.js app for production.
    - Node 14 is used for build and runtime; static assets are separated for CDN upload.
  - **Environment config:**
    - .env files and Next.js config manage environment variables (API URLs, WebSocket, etc.).
    - Supports multiple environments: development, test, uat, live.
  - **CI/CD:**
    - GitLab CI/CD pipeline automates build, test, Docker image push, and static asset upload to Google Cloud Storage.
    - Static assets are served from GCS for scalability and performance.
    - Helm and GitOps are used for deployment orchestration.

### 9. Main Features & UI Zones

- **Chat/Conversations:**
  - Real-time chat with message search, emoji/sticker support, file sharing, message pinning, reactions, and "My Cloud" (personal storage).
  - Sidebar for conversation navigation, filter/search panel, and unread/assigned sections.
  - Message history with infinite scroll, virtualized lists for performance.
- **Call/VoIP:**
  - Audio call integration using SIP/WebRTC, with call logs and device management.
  - Call events are handled in real-time, with UI feedback for call state (ringing, busy, hangup, etc.).
- **Customer Management:**
  - Customer profiles, activity logs, mass messaging (with preview and scheduling), segmentation.
  - Mass message sending supports file attachments and preview.
- **Groups:**
  - Group chat, group management, mass group creation, and group profile editing.
- **Consents:**
  - Consent management, statistics, and reporting for compliance.
- **Notifications:**
  - In-app notifications, error/status banners, and toast messages for user feedback.
- **Download Center:**
  - File and report download management, with progress and error handling.
- **Responsive UI:**
  - Desktop and mobile layouts, dynamic modals, drawers, and adaptive navigation.

---

> Use these talking points to confidently explain the architecture, flows, and strengths of the project in interviews. Emphasize the use of IndexedDB for local search, robust real-time messaging, modular state management, and production-grade deployment pipeline.
