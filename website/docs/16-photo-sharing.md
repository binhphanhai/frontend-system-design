# Photo Sharing Application System Design (e.g. Instagram)

*System design interview question: Design a photo sharing application that contains a list of photo posts created by users. Users can create new posts containing photos.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Architecture & High-Level Design](#architecture--high-level-design)
4. [Data Model](#data-model)
5. [API & Interface Definition](#api--interface-definition)
6. [Feed, Image, and Upload Deep Dive](#feed-image-and-upload-deep-dive)
7. [Performance, Caching, and Scalability](#performance-caching-and-scalability)
8. [Security & Privacy](#security--privacy)
9. [Accessibility (a11y)](#accessibility-a11y)
10. [User Experience (UX)](#user-experience-ux)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [Analytics, Observability, and A/B Testing](#analytics-observability-and-ab-testing)
13. [References](#references)

---

## 1. Overview

Photo sharing platforms like Instagram and Flickr allow users to upload, edit, and share images and videos, browse a feed of posts, and interact with content. These applications must deliver a seamless, performant, and visually rich experience, supporting mobile-first design, infinite scrolling, image editing, accessibility, and global scale. This document provides a deep, technical dive into the architecture, data model, APIs, image handling, performance, security, analytics, and real-world trade-offs for building a modern photo sharing frontend.

---

## 2. Requirements Exploration

### Core Features
- **Feed:** Browse a feed of image/video posts by people a user follows
- **Post Creation:** Upload photos, add captions, apply filters, post
- **Infinite Scrolling:** Feed loads more posts as user scrolls (cursor-based pagination)
- **Single Caption:** One overall caption per post (not per image)
- **Device Support:** Mobile-first, but also desktop and tablet
- **SEO:** Posts are viewable by non-logged in users and indexable by search engines

### Real-Life Examples
- [Instagram](https://www.instagram.com/)
- [Flickr](https://www.flickr.com/)

![Photo Sharing Example](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-example.png)

### Notes
- Shares many similarities with News Feed and Image Carousel system designs
- Focus here is on image/photo-specific aspects, upload, and editing

---

## 3. Architecture & High-Level Design

### Rendering Approach
- **SSR + Hydration:**
  - SEO, fast initial load, interactive after hydration
  - Used by Instagram and Facebook (React SSR + hydration)
- **Client-Side Rendering:**
  - For post creation, editing, and heavy interactions

### Architecture Diagram
![Photo Sharing Architecture Diagram](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-architecture.png)

#### Component Responsibilities
- **Server:** HTTP APIs for feed, image upload, post creation, user profiles
- **Controller:** Manages data flow, network requests, error handling
- **Client Store:** Shares data across app (feed, user, posts, upload state)
- **Feed UI:**
  - List of image posts (virtualized, infinite scroll)
  - Post composer: upload, edit, filter, caption, submit
  - Image post: one or more images (carousel)

---

## 4. Data Model

| Entity     | Source         | Belongs to         | Fields                                                      |
|------------|---------------|--------------------|-------------------------------------------------------------|
| Feed       | Server        | Feed UI            | posts (Post[]), pagination                                  |
| Post       | Server        | Feed Post          | id, created_time, caption, images (Image[]), author (User)  |
| User       | Server        | Client store       | id, name, profile_photo_url                                 |
| NewPost    | User (Client) | Post composer UI   | caption, images (Image)                                     |
| Image      | Server/client | Multiple           | url, alt, width, height, format, size, blurhash             |

- **Feed:** Server-originated, paginated, normalized for efficient updates
- **Post:** May contain multiple images (carousel)
- **Image:** Responsive, multiple sizes, alt text (user or ML-generated), blurhash for placeholders
- **NewPost:** Client-side state for upload, editing, and submission

---

## 5. API & Interface Definition

### Feed List API
- **GET /feed**: Cursor-based pagination (e.g., `?cursor=...`)
- **Infinite scroll:** Loads more posts as user scrolls
- **Response:**
  ```json
  {
    "posts": [
      { "id": 1, "caption": "Sunset!", "images": [ ... ], "author": { ... }, "created_time": "..." },
      // ...
    ],
    "pagination": { "next_cursor": "..." }
  }
  ```

### Post Creation API
- **Two approaches:**
  1. **Single API for image upload + post creation**
     - Simple, all data in one request
     - Slower, more complex backend logic
     - API must handle both text and media
     - ![Single API Diagram](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-api-single.png)
  2. **Separate APIs for image upload and post creation**
     - Async image upload, parallel uploads
     - Reusable image upload API (e.g., for profile photos)
     - Can upload directly to blob storage (S3, R2) via presigned URLs
     - ![Separate API Diagram](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-api-separate.png)

#### Recommended: Separate APIs
- More flexible, scalable, and cost-effective
- Upload images in parallel, use presigned URLs, reduce server load

---

## 6. Feed, Image, and Upload Deep Dive

### Feed Optimizations
- **SSR + hydration:** SEO, fast load, indexable content
- **Infinite scrolling:** Cursor-based pagination, virtualized lists
- **Optimistic updates:** Show new posts instantly, update on server confirmation
- **Preserve scroll position:** When navigating away and back
- **Loading indicators:** Skeletons, spinners for async fetches
- **Timestamp rendering:** Relative ("2m ago"), absolute on hover
- **Icon rendering:** SVGs, accessible labels

### Image Carousel Optimizations
- **Carousel for multi-image posts:** Touch, keyboard, and mouse support
- **Virtualize carousel items:** For performance
- **Lazy load images:** Only load visible/nearby images
- **Prefetch next images:** For smooth swiping

### Image Handling & Editing
- **Modern formats:** WebP, AVIF for compression and quality
- **Responsive images:** Use `srcset` for different device sizes
- **Adaptive loading:** Send browser dimensions, serve optimal size
- **Network-aware loading:**
  - Good connection: prefetch offscreen images
  - Poor connection: show low-res placeholder, load high-res on click
- **Blurhash:** Show blurred placeholder while loading
- **Alt text:** User-provided or ML-generated for accessibility
- **Image editing:**
  - **Cropping/Resizing:** Use HTML5 `<canvas>`
    ```js
    const canvas = document.getElementById('image-editor');
    const context = canvas.getContext('2d');
    const image = new Image();
    image.src = 'https://greatimages.com/example.jpg';
    context.drawImage(image /* ...params */);
    ```
  - **Filters:** Use CSS `filter` property for effects (blur, contrast, hue, sepia, etc.)
    ```css
    .filter-1977 {
      filter: sepia(0.5) hue-rotate(-30deg) saturate(1.4);
    }
    .filter-brannan {
      filter: sepia(0.4) contrast(1.25) brightness(1.1) saturate(0.9) hue-rotate(-2deg);
    }
    ```
  - **Filter Previews:**
    | Original | 1977 | Brannan |
    |----------|------|---------|
    | ![Original](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-air-balloon.jpg) | ![1977](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-air-balloon.jpg) | ![Brannan](https://www.gfecdn.net/img/questions/photo-sharing-instagram/photo-sharing-air-balloon.jpg) |
  - **Final image:** Convert to blob before upload (e.g., with [html2canvas](https://github.com/niklasvh/html2canvas))

---

## 7. Performance, Caching, and Scalability
- **Code splitting:** By route/page, reduce JS bundle size
- **Lazy loading:** Images, below-the-fold content, non-critical JS
- **Prefetching:** Data/assets for next likely page
- **Critical rendering path:** Prioritize above-the-fold content
- **CDN:** Serve images and static assets from edge locations
- **HTTP caching:** CDN, browser cache, cache-control headers
- **Service Worker:** Offline support, background sync
- **API caching:** Feed data, user profiles
- **Edge caching:** For global low-latency
- **Horizontal scaling:** Stateless APIs, sharded DBs, message queues
- **Monitoring:** Real-time metrics, alerting

---

## 8. Security & Privacy
- **HTTPS:** All communication encrypted
- **Authentication:** Secure login, JWT/session tokens
- **API security:** Auth, rate limiting, CORS
- **XSS/CSRF:** Input validation, secure cookies
- **Session management:** Secure, httpOnly, sameSite
- **Image upload security:** Validate file type, size, scan for malware
- **Privacy:** GDPR/CCPA compliance, user data rights

---

## 9. Accessibility (a11y)

### Screen Readers
- `<img>` tags with meaningful `alt` or empty string
- `aria-label` for carousel prev/next buttons
- Icon-only buttons with `aria-label`

### Keyboard Support
- Use `<button>` for focusable controls
- `<div role="region" aria-label="Image Carousel" tabindex="0">` for focusable carousel
- Left/Right keydown handlers for carousel navigation
- Focus indicators for all interactive elements

---

## 10. User Experience (UX)
- **Mobile-first:** Responsive layout, touch targets
- **Fast interactions:** Optimistic UI, instant feedback
- **Image upload progress:** Show upload status, allow cancel/retry
- **Draft recovery:** Restore unsent posts after reload
- **Notifications:** Browser/mobile notifications for likes/comments
- **Personalization:** Feed ranking, recommendations
- **Error feedback:** Clear, actionable messages
- **Dark mode:** Accessible color schemes

---

## 11. Internationalization (i18n)
- **Multi-language UI:** Translate all labels, error messages
- **RTL support:** Layout mirroring, logical CSS properties
- **Date/time:** Localized formats
- **Alt text:** Localized or ML-generated
- **Accessibility:** Localized ARIA labels

---

## 12. Analytics, Observability, and A/B Testing
- **Analytics:** Track post creation, image upload, feed engagement
- **A/B testing:** UI, feed ranking, upload flows
- **Error reporting:** Sentry, custom logging
- **Performance monitoring:** Real user metrics
- **Privacy:** Anonymized data, opt-out options

---

## 13. References
- [Making Instagram.com faster: Part 1](https://instagram-engineering.com/making-instagram-com-faster-part-1-62cc0c327538)
- [Making Instagram.com faster: Part 2](https://instagram-engineering.com/making-instagram-com-faster-part-2-f350c8fba0d4)
- [Making Instagram.com faster: Part 3 — cache first](https://instagram-engineering.com/making-instagram-com-faster-part-3-cache-first-6f3f130b9669)
- [Making instagram.com faster: Code size and execution optimizations (Part 4)](https://instagram-engineering.com/making-instagram-com-faster-code-size-and-execution-optimizations-part-4-57668be796a8)
- [Launching Instagram Messaging on desktop](https://about.instagram.com/blog/engineering/launching-instagram-messaging-on-desktop)
- [Crafting an Accessible Instagram Feed](https://about.instagram.com/blog/engineering/crafting-an-accessible-instagram-feed)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern photo sharing frontend. It covers architectural decisions, data modeling, feed and image handling, upload, editing, performance, security, accessibility, analytics, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.