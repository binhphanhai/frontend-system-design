# Tech Stack Cheatsheet: koc-landing-site-fe-fo

---

## Tech Stack

- **Framework:** Next.js (v14)
  - Hybrid SSR/SSG, standalone Docker build, custom server.js for advanced deployment
- **Language:** TypeScript (modern, strictNullChecks enabled)
- **State Management:** Redux Toolkit, React-Redux
  - Modular slices for user, courses, articles, zooms, app info, etc.
- **Styling:** SCSS (Sass), styled-jsx (CSS-in-JS, with plugin for Sass)
- **API Communication:** Axios (custom wrapper with Shopee login flow), native fetch for some server-side calls
- **Native App Bridge:** @shopee/web-bridge-sdk
  - Detects Shopee app, enables login, navigation, popups, BI event tracking, and more
- **Component Libraries:**
  - Swiper (carousel/slider)
  - styled-jsx (component-scoped CSS)
  - react-indiana-drag-scroll (drag-to-scroll, for lists)
- **Utilities:** js-cookie (cookie management), moment (date/time), visibilityjs (tab visibility)
- **Error Monitoring:** Sentry (via @sentry/nextjs, with custom config for Shopee’s Sentry instance)
- **Build/Deployment:** Docker (multi-stage, production-optimized), Yarn, Next.js standalone output, custom environment variables for region/env
- **Linting/Formatting:** ESLint (Airbnb, Prettier), Husky (pre-commit hooks), TypeScript type checking
- **Other Notables:**
  - Custom tracking SDK integration (window.trackingSDK, fallback to Shopee bridge)
  - Dynamic environment config (Vietnam-focused, but scalable for other Shopee regions)
  - Static asset optimization (fonts, images, cache headers)
  - Modular, domain-driven folder structure

---

## SEO (Search Engine Optimization)

- **Comprehensive Metadata:**
  - Uses Next.js `Metadata` API for global and per-page meta tags (title, description, keywords, canonical, Open Graph, etc.).
  - Dynamic metadata for articles and courses, including Open Graph and Twitter Card tags for rich sharing.
- **Open Graph & Social Sharing:**
  - All main pages and dynamic content (articles, courses) include Open Graph meta tags (title, description, image, type, URL) for optimal social sharing and previews.
- **Structured Data (Schema.org):**
  - Article detail pages inject JSON-LD schema (`type: Article`) for enhanced search result appearance (rich snippets).
- **Canonical URLs:**
  - Canonical links are set for all main pages and dynamic content to prevent duplicate content issues.
- **Robots & Indexing:**
  - Robots meta tags (`index, follow`) are set globally to ensure the site is crawlable.
  - `next-sitemap` is used to generate `sitemap.xml` and `robots.txt` automatically, with daily change frequency and priority set.
- **Sitemap Generation:**
  - Automated sitemap generation via `next-sitemap`, with support for dynamic routes (articles, courses, etc.).
- **Performance & Accessibility:**
  - Optimized images (with alt text), semantic HTML, and mobile-friendly viewport settings.
  - Apple Web App and format detection meta tags for better mobile and device support.
- **Internationalization:**
  - Language alternates and canonical URLs are set for Vietnamese, with structure ready for multi-language expansion.

---

## Interview Talking Points

### Shopee Native App Integration

- **WebView Bridge:** Detects if running inside Shopee app using `@shopee/web-bridge-sdk`.
- **Native Actions:** Can trigger native login, navigation, popups, and toasts. If not in-app, redirects to Shopee universal link for seamless experience.
- **BI/Analytics:** Sends business intelligence events via both Shopee bridge and custom tracking SDK, with fallback logic.

### Authentication & Login Flow

- **Custom Axios Wrapper:** All API requests are intercepted for 401 errors.
- **Native Login:** On 401, triggers Shopee native login popup (via bridge) or redirects to Shopee login page.
- **Session Handling:** After login, failed API calls are retried automatically. Session is managed via Shopee cookies and native context.
- **User State:** Redux slice for user info, with tags for affiliate status, approval, and more.

### Dynamic Program & Content Structure

- **Multi-Program Support:** Supports multiple “programs” (campaigns), each with its own config, assets, and stages.
- **Dynamic Routing:** Uses Next.js dynamic routes for articles, courses, webinars, etc.
- **Config-Driven UI:** Page sections (slider, intro, programs, webinars, courses, FAQ, contact, etc.) are rendered based on backend config.

### Key Features & UI Zones

- **Slider:** Dynamic banners, filtered by user tags/levels, with BI tracking on impressions/clicks.
- **Introduction:** Program intro, benefits, and banners, with registration CTA and tracking.
- **Programs:** Lists affiliate programs and game programs, filtered by user tags/levels.
- **Webinars (Zooms):** Lists online classes, filtered and tracked by user level.
- **Courses & Articles:** Modular course/article system, with dynamic loading and tracking.
- **FAQ & Contact:** Dynamic FAQ and contact channels, with tracking for user interactions.
- **Testimonials:** Carousel of user testimonials (Swiper), responsive for mobile/desktop.
- **Register Section:** Handles registration flow, approval status, and Shopee login integration.

### State Management

- **Redux Toolkit:** State is organized by domain (user, courses, zooms, etc.) for maintainability.
- **Async Thunks:** Used for API calls and side effects (e.g., fetching user info, courses, etc.).
- **Selectors:** Used throughout for efficient state access and reactivity.

### Tracking & Analytics

- **Dual Tracking:** Sends BI events via Shopee bridge if available, otherwise via custom tracking SDK.
- **Contextual Events:** Tracks impressions, clicks, and user actions with rich context (user, section, action, etc.).
- **Custom Hook:** Ensures consistent event structure and context.

### Error Handling

- **API Error Interception:** All API errors are handled gracefully, with user-friendly toasts (native or web).
- **Dedicated UI States:** Error, no permission, onboarding, and loading states are handled with dedicated components.
- **Sentry Integration:** Real-time error monitoring and alerting, with custom Sentry config for Shopee.

### Deployment & Scalability

- **Dockerized:** Multi-stage Docker build for production, with standalone Next.js output.
- **CI/CD Ready:** Yarn-based workflow, with hooks for linting and formatting.
- **Static Assets:** Fonts and images are optimized and served with long cache headers.
- **Environment Config:** Supports multiple Shopee regions and environments via env vars.

### Modular & Maintainable Codebase

- **Domain-Driven Structure:** Each business domain (home, program, course, article, zoom, etc.) is isolated for clarity and scalability.
- **Reusable Components:** Shared components for header, footer, popups, user info, etc.
- **Type Safety:** Extensive use of TypeScript interfaces/types for all data models and Redux state.

---

> Use these talking points to confidently explain the architecture, flows, and strengths of the project in interviews. Emphasize the deep integration with Shopee’s native app, robust authentication, modular campaign support, and production-grade deployment pipeline. Highlight the dynamic, config-driven UI and the dual tracking/analytics system as key differentiators.
