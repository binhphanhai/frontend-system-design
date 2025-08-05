# 16-photo-sharing: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a scalable, performant, and accessible photo sharing frontend (like Instagram).

Want to see:

- If you can break down the system into feed, upload, image handling, and editing.
- How you handle SSR, infinite scroll, image optimization, and accessibility.
- If you consider security, privacy, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Feed of image/video posts, infinite scroll (cursor-based)
   - Post creation: upload, edit, filter, caption
   - Responsive, mobile-first, SEO, accessibility
   - Image optimization, privacy, security
   - Personalization, notifications, error handling

2. **Architecture & Data Flow**

   - **SSR + hydration for feed:** SEO, fast load, indexable content
   - **SPA for post creation/editing:** Interactive, image editing
   - **Component breakdown:** Feed, post composer, image carousel, user profile
   - **State management:** Client store for feed, posts, upload state
   - **Image upload:** Separate APIs for upload and post creation, presigned URLs

3. **Image Handling & Performance**

   - Modern formats (WebP, AVIF), responsive images (`srcset`), adaptive loading
   - Lazy load, prefetch, blurhash for placeholders
   - Image editing: cropping, resizing (canvas), CSS filters
   - CDN for images, HTTP caching, service worker for offline
   - Virtualized lists for feed, optimistic UI for new posts

4. **Accessibility & Internationalization**

   - Alt text (user or ML-generated), ARIA labels, keyboard navigation
   - Carousel: focusable, left/right keys, screen reader support
   - Localized UI, RTL support, date/time formats

5. **Security, Privacy, and Analytics**

   - HTTPS, authentication, API security, XSS/CSRF protection
   - Image validation, privacy compliance (GDPR/CCPA)
   - Analytics, A/B testing, error reporting, performance monitoring
   - Horizontal scaling, sharded DBs, edge caching

6. **Tradeoffs & Alternatives**
   - SSR vs. SPA: SSR for SEO, SPA for post creation
   - Single vs. separate upload APIs: separate is more scalable
   - Offset vs. cursor-based pagination: cursor is more scalable
   - Prefetching vs. lazy loading: balance speed and bandwidth

---

✅ **Example Content / Model Answer**

> “For a photo sharing app, I’d use SSR for the feed and SPA for post creation. Images are uploaded via presigned URLs, optimized with WebP, and served from CDN. Feed uses infinite scroll with cursor-based pagination and virtualized lists. Accessibility is ensured with alt text and ARIA. Tradeoff: SSR is best for SEO, but SPA is better for interactive editing and uploads.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget accessibility, image optimization, and privacy.
- Optimize for fast load, mobile UX, and error handling.
- Test with slow networks, large images, and screen readers.
