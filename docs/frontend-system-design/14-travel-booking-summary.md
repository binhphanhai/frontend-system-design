# 14-travel-booking: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a scalable, performant, and user-friendly travel booking frontend (like Airbnb).

Want to see:

- If you can break down the system into search, filtering, booking, and map integration.
- How you handle SSR, map APIs, payments, and internationalization.
- If you consider accessibility, security, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Search, filtering, map-based discovery, listing details
   - Booking flow, payments, order management
   - Internationalization (multi-currency, multi-language)
   - SEO, performance, accessibility, security (PCI, HTTPS)
   - Scalability for millions of users/listings

2. **Architecture & Data Flow**

   - **SSR/MPA for initial load and SEO** (React, hydration)
   - **SPA for booking flow and interactivity**
   - **Map integration:** Google Maps, Mapbox, Leaflet
   - **Service Worker for offline support, caching**
   - **Component breakdown:** Search page, listing details, booking, map, account
   - **State management:** Client store for search, filters, bookings

3. **Performance, Caching, and Payments**

   - Code splitting, lazy loading, prefetching, image optimization
   - HTTP caching, API caching, edge caching, service worker
   - Payment integrations (Stripe, PayPal, Apple/Google Pay), tokenization, 3D Secure
   - Real-time availability, error handling, cross-device sync

4. **Accessibility & Internationalization**

   - Semantic HTML, alt text, keyboard navigation, ARIA roles
   - Localized prices, currencies, languages, address formats
   - RTL support, region-specific content, legal compliance

5. **Security, Analytics, and Scalability**

   - PCI compliance, HTTPS, tokenization, XSS/CSRF protection
   - Analytics, A/B testing, error reporting, performance monitoring
   - Horizontal scaling, microservices, database sharding, queueing

6. **Tradeoffs & Alternatives**
   - SSR vs. SPA: SSR for SEO, SPA for booking flow
   - Offset vs. cursor-based pagination: offset is simpler, cursor is more scalable
   - Map provider: Google Maps is robust, Mapbox is customizable, Leaflet is open source
   - Prefetching vs. lazy loading: balance speed and bandwidth

---

✅ **Example Content / Model Answer**

> “For a travel booking frontend, I’d use SSR for search and listing pages, SPA for booking. Map integration with Google Maps, Stripe for payments, and service worker for offline. Accessibility with ARIA and keyboard navigation. Tradeoff: SSR is best for SEO, but SPA is better for booking flow and interactivity.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget accessibility, PCI compliance, and map accessibility.
- Optimize for SEO, fast load, and mobile UX.
- Test with large datasets, slow networks, and screen readers.
