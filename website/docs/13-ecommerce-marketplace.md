# E-commerce Marketplace System Design (e.g. Amazon)

*System design interview question: Design an e-commerce website that allows users to browse products and purchase them.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Architecture & High-Level Design](#architecture--high-level-design)
4. [Data Model](#data-model)
5. [API & Interface Definition](#api--interface-definition)
6. [Deep Dive: Product Catalog, Search, and Recommendations](#deep-dive-product-catalog-search-and-recommendations)
7. [Cart, Checkout, and Payments](#cart-checkout-and-payments)
8. [Performance, Caching, and Scalability](#performance-caching-and-scalability)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Accessibility](#accessibility)
11. [Security & Compliance](#security--compliance)
12. [User Experience (UX)](#user-experience-ux)
13. [Analytics, Observability, and A/B Testing](#analytics-observability-and-ab-testing)
14. [References](#references)
15. [Changelog](#changelog)

---

## 1. Overview

E-commerce marketplaces like Amazon, eBay, Walmart, and Flipkart are among the most complex, high-traffic web applications. They must deliver a seamless, performant, and secure shopping experience to a global audience, supporting millions of products, real-time inventory, personalized recommendations, and robust checkout flows. This document provides a deep, technical dive into the architecture, data model, APIs, performance, accessibility, internationalization, security, analytics, and real-world trade-offs for building a modern e-commerce frontend.

---

## 2. Requirements Exploration

### Core Features
- **Product Discovery:** Browse/search products, filter/sort, view recommendations
- **Product Details:** View detailed product info, images, reviews, Q&A
- **Cart:** Add/remove products, update quantities, view cart summary
- **Checkout:** Address entry, payment, order review, guest checkout
- **Order Management:** View order history, track shipments, returns
- **User Accounts:** Registration, login, profile, wishlists (optional)
- **Internationalization:** Multi-currency, multi-language, region-specific content
- **Mobile & Desktop:** Responsive design, touch and keyboard support

### Pages & Flows
- **Product Listing Page (PLP):**
  - Product name, image, price, rating, quick add to cart
  - Filters (category, price, brand, rating, etc.), sort options
  - Pagination or infinite scroll
  - SEO-optimized URLs and metadata
  - ![PLP Example](https://www.gfecdn.net/img/questions/e-commerce-amazon/e-commerce-amazon-plp.png)
- **Product Details Page (PDP):**
  - Multiple images, description, price, reviews, Q&A, add to cart
  - ![PDP Example](https://www.gfecdn.net/img/questions/e-commerce-amazon/e-commerce-amazon-pdp.png)
- **Cart Page:**
  - List of items, quantity controls, remove, subtotal, proceed to checkout
  - ![Cart Example](https://www.gfecdn.net/img/questions/e-commerce-amazon/e-commerce-amazon-cart.png)
- **Checkout Page:**
  - Address form, payment form, order summary, place order
  - ![Checkout Example](https://www.gfecdn.net/img/questions/e-commerce-amazon/e-commerce-amazon-checkout.png)

### User Demographics & Devices
- International, all ages, all devices (laptop, tablet, mobile)
- Accessibility for users with disabilities

### Non-Functional Requirements
- **Performance:** &lt;2s page load, fast interactions, smooth navigation
- **SEO:** High discoverability, indexable content, structured data
- **Security:** PCI compliance, HTTPS, secure payments
- **Scalability:** Handle millions of users and products
- **Reliability:** High availability, error handling, graceful degradation

---

## 3. Architecture & High-Level Design

### System Diagram
![E-commerce Website Architecture Diagram](https://www.gfecdn.net/img/questions/e-commerce-amazon/e-commerce-amazon-architecture.png)

### Rendering Approaches
- **SSR (Server-Side Rendering):**
  - Fast initial load, SEO, personalized content
  - Used for PLP, PDP, and landing pages
- **CSR (Client-Side Rendering):**
  - SPA navigation, fast transitions, dynamic cart/checkout
- **Universal/Hybrid (SSR + SPA):**
  - SSR for first load, hydration for interactivity
  - Used by Amazon, Walmart, Flipkart, eBay

#### Real-World Examples
| Site      | Architecture | Rendering | UI Framework |
|-----------|--------------|-----------|--------------|
| Amazon    | MPA          | SSR       | In-house     |
| eBay      | MPA          | SSR       | Marko        |
| Walmart   | SPA          | SSR       | React        |
| Flipkart  | SPA          | SSR       | React        |

### Component Responsibilities
- **Server:** HTTP APIs for products, cart, orders, search, recommendations
- **Controller:** Manages data flow, network requests, error handling
- **Client Store:** Shares data across pages (cart, user, products, filters)
- **Pages:** PLP, PDP, Cart, Checkout, Order History, Profile
- **Service Worker:** Caching, offline support, push notifications

### Data Flows
- **Initial Load:** SSR fetches data, renders HTML, injects initial state
- **Navigation:** SPA router updates URL, fetches new data, updates store
- **Cart/Checkout:** Client store syncs with server, persists across sessions
- **Prefetching:** Prefetch PDP data on PLP hover, prefetch checkout on cart

---

## 4. Data Model

| Entity           | Source         | Belongs To            | Fields                                                                 |
|------------------|---------------|----------------------|------------------------------------------------------------------------|
| ProductList      | Server        | PLP                   | products (Product[]), pagination, filters, sort                         |
| Product          | Server        | PLP, PDP              | id, name, description, unit_price, currency, images, rating, reviews, stock, category, brand, attributes |
| Cart             | Server/Client | Cart, Checkout        | items (CartItem[]), total_price, currency, discounts, taxes            |
| CartItem         | Server/Client | Cart                  | quantity, product, price, currency, options (size, color, etc.)         |
| AddressDetails   | User (Client) | Checkout              | name, country, street, city, postal_code, phone, ...                    |
| PaymentDetails   | User (Client) | Checkout              | card_number, card_expiry, card_cvv, billing_address                     |
| Order            | Server        | Order History         | id, items, total_price, currency, address, payment, status, tracking    |
| UserProfile      | Server        | Profile, Orders       | id, name, email, addresses, payment_methods, preferences                |

- **Cart**: Client store enables cart badge, popups, cross-page access; server-side for persistence
- **Price computation**: Server-side for discounts, promos, currency, taxes
- **Internationalization**: All prices have a `currency` field; localized formats
- **Product attributes**: Support for variants (size, color), stock, options

---

## 5. API & Interface Definition

### Product APIs
- **GET `/products`**: List products (pagination, filters, sort, country)
- **GET `/products/{productId}`**: Product details (country, currency)
- **GET `/search`**: Search products (query, filters, sort)
- **GET `/recommendations`**: Personalized or contextual recommendations

#### Example: Fetch Products Listing
```json
{
  "pagination": { "size": 5, "page": 2, "total_pages": 4, "total": 20 },
  "results": [
    {
      "id": 123,
      "name": "Cotton T-shirt",
      "primary_image": "https://www.greatcdn.com/img/t-shirt.jpg",
      "unit_price": 12,
      "currency": "USD",
      "rating": 4.5,
      "stock": 100
    }
    // ... More products
  ]
}
```

### Cart APIs
- **POST `/cart/products`**: Add product to cart (productId, quantity, options)
- **PUT `/cart/products/{productId}`**: Change quantity/options
- **DELETE `/cart/products/{productId}`**: Remove product
- **GET `/cart`**: Get current cart

#### Example: Add Product to Cart
```json
{
  "id": 789,
  "total_price": 24,
  "currency": "USD",
  "items": [
    {
      "quantity": 2,
      "price": 24,
      "currency": "USD",
      "product": {
        "id": 123,
        "name": "Cotton T-shirt",
        "primary_image": "https://www.greatcdn.com/img/t-shirt.jpg",
        "options": { "size": "M", "color": "Black" }
      }
    }
  ]
}
```

### Order APIs
- **POST `/order`**: Place order (cartID, address_details, payment_details)
- **GET `/orders`**: List user orders
- **GET `/orders/{orderId}`**: Order details, tracking

#### Example: Place Order
```json
{
  "id": 456,
  "total_price": 36,
  "currency": "USD",
  "items": [ /* ... */ ],
  "address_details": {
    "name": "John Doe",
    "country": "US",
    "address": "1600 Market Street",
    "city": "San Francisco"
  },
  "payment_details": {
    "card_last_four_digits": "1234"
  },
  "status": "Processing",
  "tracking": null
}
```

---

## 6. Deep Dive: Product Catalog, Search, and Recommendations

### Product Catalog
- **Hierarchical categories:** (e.g., Electronics > Phones > Smartphones)
- **Attributes:** Brand, color, size, material, etc.
- **Variants:** SKUs for each combination (size/color)
- **Stock management:** Real-time inventory, out-of-stock handling
- **Bulk import/export:** For large catalogs

### Search
- **Full-text search:** By name, description, attributes
- **Filters:** Faceted search (category, price, brand, rating, etc.)
- **Sort:** By price, popularity, rating, newest
- **Autocomplete:** Suggest products/categories as user types
- **SEO:** Clean URLs, canonical tags, structured data

### Recommendations
- **Personalized:** Based on user history, preferences
- **Contextual:** Related products, frequently bought together
- **Trending:** Popular, new arrivals, deals
- **A/B testing:** Different recommendation algorithms

---

## 7. Cart, Checkout, and Payments

### Cart
- **Persistence:** Store in client (localStorage/cookies) and server (for logged-in users)
- **Sync:** Merge guest and user cart on login
- **Real-time updates:** Reflect stock/price changes
- **Cross-device:** Cart follows user across devices

### Checkout
- **Address forms:** Localized, country-specific fields, validation
- **Payment forms:** Credit card, PayPal, Apple Pay, Google Pay, etc.
- **Guest checkout:** No login required
- **Order review:** Summary, shipping, taxes, discounts
- **Error handling:** Payment failures, invalid addresses
- **Security:** PCI compliance, HTTPS, tokenization

#### Example: Accessible Error Message
```html
<form>
  <div>
    <label for="name">Name</label>
    <input required minlength="6" type="text" id="name" name="name" aria-describedby="name-error-message" />
    <span id="name-error-message" aria-live="assertive" class="name-error-message">
      Name must have at least 6 characters!
    </span>
  </div>
  <button>Submit</button>
</form>
```

### Payments
- **Integrations:** Stripe, Adyen, Braintree, PayPal, Apple/Google Pay
- **Tokenization:** Never store raw card data
- **3D Secure:** Extra authentication for cards
- **Fraud detection:** Risk scoring, velocity checks
- **Order confirmation:** Email, SMS, in-app

---

## 8. Performance, Caching, and Scalability

### Performance
- **Code splitting:** By route/page, reduce JS bundle size
- **Lazy loading:** Images, below-the-fold content, non-critical JS
- **Prefetching:** Data/assets for next likely page
- **Critical rendering path:** Prioritize above-the-fold content
- **Image optimization:** WebP, CDN, responsive images, adaptive loading
- **Core Web Vitals:**
  - **LCP:** Optimize largest image/text, JS, CSS, fonts
  - **FID:** Minimize JS on load
  - **CLS:** Reserve space for images/videos, use aspect-ratio/min-height

### Caching
- **HTTP caching:** CDN, browser cache, cache-control headers
- **Service Worker:** Offline support, background sync
- **API caching:** Product data, recommendations, search results
- **Edge caching:** For global low-latency

### Scalability
- **Horizontal scaling:** Stateless APIs, microservices
- **Database sharding:** For product, order, user data
- **Queueing:** For order processing, emails, analytics
- **Rate limiting:** Prevent abuse, bot traffic
- **Monitoring:** Real-time metrics, alerting

---

## 9. Internationalization (i18n)
- **Languages:** Translate UI, product data, error messages
- **Currency:** Localized prices, multi-currency support
- **RTL support:** CSS logical properties, layout mirroring
- **Address formats:** Country-specific fields, validation
- **Date/time:** Localized formats
- **Legal/compliance:** Region-specific policies, taxes

---

## 10. Accessibility
- **Semantic HTML:** Headings, buttons, links, inputs
- **Alt text:** All images, especially product images
- **Forms:** Labels, error messages linked via `aria-describedby`, `aria-live="assertive"`
- **Keyboard navigation:** Tab order, focus states
- **Screen reader support:** ARIA roles, landmarks
- **Contrast:** Sufficient color contrast for text/UI
- **Visual order:** Matches DOM order
- **Testing:** Automated and manual a11y tests

---

## 11. Security & Compliance
- **HTTPS:** All communication encrypted
- **PCI DSS:** Payment Card Industry compliance
- **Tokenization:** Never store raw card data
- **API security:** Auth, rate limiting, CORS
- **XSS/CSRF:** Input validation, secure cookies
- **Session management:** Secure, httpOnly, sameSite
- **Fraud prevention:** Risk scoring, device fingerprinting
- **Privacy:** GDPR/CCPA compliance, user data rights

---

## 12. User Experience (UX)
- **Clean checkout:** Minimal distractions, clear steps
- **Persist cart:** Across sessions/devices
- **Promo codes:** De-emphasize to reduce drop-off
- **Fast, responsive UI:** Optimistic updates, skeleton loaders
- **Mobile-first:** Touch targets, responsive layout
- **Error feedback:** Clear, actionable messages
- **Order tracking:** Real-time status, notifications
- **Personalization:** Recommendations, recently viewed

---

## 13. Analytics, Observability, and A/B Testing
- **Analytics:** Track page views, conversions, funnel drop-off
- **A/B testing:** UI, recommendation algorithms, checkout flows
- **Error reporting:** Sentry, custom logging
- **Performance monitoring:** Real user metrics, Core Web Vitals
- **Privacy:** Anonymized data, opt-out options

---

## 14. References
- [Shopping for speed on eBay.com | web.dev](https://web.dev/shopping-for-speed-on-ebay/)
- [Case Study | web.dev](https://web.dev/tags/case-study/)
- [Rakuten Core Web Vitals Case Study](https://web.dev/rakuten/)
- [Speed By A Thousand Cuts | eBay Engineering](https://tech.ebayinc.com/engineering/speed-by-a-thousand-cuts/)
- [Tokopedia Performance Case Study](https://web.dev/tokopedia/)
- [Autofill on Browsers: A Deep Dive | eBay Engineering](https://tech.ebayinc.com/engineering/autofill-deep-dive/)
- [Rendering on the Web | web.dev](https://web.dev/rendering-on-the-web/)

---

## 15. Changelog
- **2024/08/21:** Add product API supports `quantity`
- **2024/02/27:** Revised API routes to be more REST-ful
- **2024/01/12:** Fix PDP image, update architecture and rendering choices