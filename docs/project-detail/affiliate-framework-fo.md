# Tech Stack Cheatsheet: affiliate-framework-fe-fo

---

## Tech Stack

- **Framework:** Next.js (v14)
  - Server-side rendering (SSR), static site generation (SSG), optimized for performance, standalone Docker build
- **Language:** TypeScript (strict, modern JavaScript superset)
- **State Management:** Redux Toolkit, React-Redux
- **Styling:** SCSS (Sass), styled-jsx (CSS-in-JS)
- **API Communication:** Axios (robust HTTP client)
- **Native App Bridge:** @shopee/web-bridge-sdk (enables communication with Shopee native app)
- **Component Libraries:**
  - Swiper (carousel)
  - react-virtuoso (virtualized lists)
  - react-indiana-drag-scroll (drag-to-scroll)
- **Utilities:** js-cookie (cookie management), moment (date/time), visibilityjs (tab visibility)
- **Error Monitoring:** Sentry (via @sentry/nextjs)
- **Build/Deployment:** Docker (multi-stage), Yarn, GitLab CI/CD, Google Cloud Storage
- **Linting/Formatting:** ESLint (Airbnb, Prettier), Husky (pre-commit hooks), TypeScript type checking

---

## Interview Talking Points

### Native App Communication

- Detects if running inside the Shopee app using a WebView bridge SDK.
- Initializes the bridge and retrieves app context (e.g., build type, user info).
- Can trigger native actions such as login, navigation, popups, and toast notifications.
- If not running in the Shopee app, automatically redirects users to open the page in-app using a universal link.
- Enables seamless integration between web and native app for a consistent user experience.

### Authentication & Login Flow

- All API requests are intercepted for authentication errors (401 Unauthorized).
- On 401, triggers the Shopee native login popup via the bridge SDK, passing the current URL for redirect after login.
- After successful login, failed API calls are retried automatically, ensuring a smooth user journey.
- Session is managed using Shopee cookies and native session context.

### Dynamic Program Structure

- Supports multiple “programs” or campaigns, each with its own configuration, assets, and stages.
- Dynamic routing and configuration loading based on URL and app context.
- Allows for easy scaling and onboarding of new campaigns without codebase changes.

### Key Features & UI Zones

- **Header:** Dynamic, program-aware header for navigation and branding.
- **Stage & Milestones:** Visualizes user progress, milestones, and rewards in a gamified way.
- **Missions:** Task system with evidence submission, guidelines, and feedback popups.
- **Leaderboard:** Real-time ranking with virtualized lists for performance.
- **Referral Code:** User-specific referral code sharing and tracking.
- **FAQ & Announcements:** Dynamic content for user support and updates.
- **Popups:** Modular popups for evidence, feedback, guidelines, and rewards.
- **Temporary Rewards:** Shows ongoing and last-month rewards in context.
- **Error/No Permission/Onboarding:** Dedicated UI for special user states.

### State Management

- Uses Redux Toolkit for scalable, predictable state management.
- State is organized by domain (user, missions, milestones, popups, etc.) for maintainability.
- Async thunks are used for API calls and side effects.

### Error Handling

- All API errors are intercepted and handled gracefully.
- Network and business logic errors show user-friendly toasts (via native bridge).
- Dedicated UI for error, no permission, not eligible, onboarding, and loading states.
- Sentry integration for real-time error monitoring and alerting.

### Analytics & Tracking

- Sends business intelligence (BI) events to Shopee’s analytics backend via the bridge SDK.
- Tracks user actions, impressions, mission progress, and program-specific events.
- Custom hook ensures consistent event structure and context (user, stage, action, etc.).

### Deployment & Scalability

- Built as a Dockerized Next.js standalone app for easy deployment.
- CI/CD pipeline with GitLab automates build, test, and deployment steps.
- Static assets are served from Google Cloud Storage for scalability and performance.
- Environment-based configuration supports multiple regions and campaigns.

---

> Use these talking points to confidently explain the architecture, flows, and strengths of the project in interviews. Emphasize the deep integration with Shopee’s native app, robust authentication, modular campaign support, and production-grade deployment pipeline.
