# 13-ecommerce-marketplace: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a scalable, performant, and secure e-commerce marketplace frontend (like Amazon).

Want to see:

- If you can break down the system into product discovery, cart, checkout, and order management.
- How you handle SSR, caching, payments, and internationalization.
- If you consider accessibility, security, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Product discovery, search, recommendations, filters, and sorting
   - Product details, reviews, Q&A, images
   - Cart, checkout, payments, order management
   - Internationalization (multi-currency, multi-language)
   - SEO, performance, accessibility, security (PCI, HTTPS)
   - Scalability for millions of users/products

2. **Architecture & Data Flow**

   - **SSR for PLP/PDP and SEO** (Next.js, hybrid rendering)
   - **SPA for cart/checkout for fast transitions**
   - **CDN for images, static assets**
   - **Service Worker for offline support, caching**
   - **Component breakdown:** PLP, PDP, cart, checkout, order history
   - **State management:** Client store for cart, user, products

3. **Performance, Caching, and Payments**

   - Code splitting, lazy loading, prefetching, image optimization
   - HTTP caching, API caching, edge caching, service worker
   - Payment integrations (Stripe, PayPal, Apple/Google Pay), tokenization, 3D Secure
   - Real-time cart sync, cross-device persistence

4. **Accessibility & Internationalization**

   - Semantic HTML, alt text, keyboard navigation, ARIA roles
   - Localized prices, currencies, languages, address formats
   - RTL support, region-specific content, legal compliance

5. **Security, Analytics, and Scalability**

   - PCI compliance, HTTPS, tokenization, XSS/CSRF protection
   - Analytics, A/B testing, error reporting, performance monitoring
   - Horizontal scaling, microservices, database sharding, queueing

6. **Tradeoffs & Alternatives**
   - SSR vs. CSR: SSR for SEO, CSR for dynamic cart/checkout
   - Offset vs. cursor-based pagination: offset is simpler, cursor is more scalable
   - Prefetching vs. lazy loading: balance speed and bandwidth
   - SPA vs. MPA: SPA for fast navigation, MPA for SEO

---

✅ **Example Content / Model Answer**

> “For an e-commerce frontend, I’d use SSR for product pages and SPA for cart/checkout. I’d use CDN for images, service worker for offline, and Stripe for payments. Accessibility is ensured with semantic HTML and ARIA. Cart is synced across devices. Tradeoff: SSR is best for SEO, but SPA is better for fast checkout and cart updates.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget accessibility, PCI compliance, and performance.
- Optimize for SEO, fast load, and mobile UX.
- Test with large catalogs, slow networks, and screen readers.
