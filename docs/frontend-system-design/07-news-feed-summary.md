# 07-news-feed: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a scalable, performant, and user-friendly news feed UI, similar to Facebook, Twitter, or LinkedIn.

Want to see:

- If you can break down the problem into components, data flow, and state management.
- How you handle real-time updates, pagination, and performance at scale.
- If you consider SSR, caching, accessibility, and edge cases.
- How you justify tradeoffs and communicate your design.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Real-time updates? (WebSockets, polling, or push)
   - Pagination: infinite scroll, cursor-based, or numbered pages?
   - Personalization, sorting, filtering?
   - Error/loading states, offline support?
   - Accessibility (keyboard, ARIA, color contrast)?
   - SEO/SSR needed for public feeds?

2. **Component & Data Flow Breakdown**

   - Feed container (fetches data, manages state)
   - Post item (renders each post, handles actions: like, comment, share)
   - Loader/skeleton (for loading states)
   - Error message (for fetch failures)
   - Pagination controls (if not infinite scroll)
   - Notification/toast for real-time updates

3. **State Management**

   - Local state for UI (loading, error, current page/cursor)
   - Global state (Redux, Zustand, Context) for feed data if shared
   - Caching strategies (in-memory, SWR/React Query, browser cache)

4. **Performance & Scalability Solutions**

   - **Virtualization/windowing** (e.g., react-window, react-virtualized) for large lists
   - **SSR/SSG** for SEO and faster first paint (Next.js, Remix)
   - **Debouncing** for search/filter input
   - **Batching** network requests for likes/comments
   - **CDN** for images/media
   - **Cursor-based pagination** (better for real-time, avoids duplicate/skip issues)
   - **Skeleton loading** for perceived performance

5. **Real-Time Updates**

   - WebSockets for push updates (new posts, comments)
   - Polling as a fallback
   - Optimistic UI for actions (like, comment)

6. **Accessibility & Testing**

   - ARIA roles for feed and posts
   - Keyboard navigation for feed and actions
   - Color contrast and font size checks
   - Unit/integration tests for data fetching, rendering, and actions

7. **Tradeoffs & Alternatives**
   - Infinite scroll vs. pagination: Infinite scroll is more engaging but harder for SEO and deep linking; pagination is easier for navigation/history.
   - SSR vs. CSR: SSR is better for SEO and initial load, but more complex to implement with real-time updates.
   - WebSockets vs. polling: WebSockets are real-time but require backend support; polling is simpler but less efficient.

---

✅ **Example Content / Model Answer**

> “For a scalable news feed, I’d start by clarifying if we need real-time updates and SEO. I’d use a FeedContainer component to fetch posts with cursor-based pagination for reliability and real-time compatibility. Each PostItem would be memoized for performance. I’d use react-window for virtualization, skeleton loaders for perceived speed, and WebSockets for real-time updates. For SSR, I’d use Next.js to render the initial feed for SEO, then hydrate on the client. Accessibility would be ensured with ARIA roles and keyboard navigation. I’d cache posts with SWR and handle optimistic updates for likes/comments. Tradeoff: infinite scroll is more engaging but harder for SEO; I’d use SSR with infinite scroll and update the URL with the current cursor for deep linking.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget error/loading states and accessibility.
- Always clarify requirements before designing.
- Be explicit about tradeoffs (SSR vs. CSR, infinite scroll vs. pagination).
- Practice drawing the component/data flow diagram and explaining it.
