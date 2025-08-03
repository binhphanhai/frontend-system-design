# Pinterest System Design: Masonry Layout and Feed

*System design interview question: Design the Pinterest homepage, focusing on the masonry layout and infinite feed.*

---

Pinterest is a leading example of a visually rich, highly interactive web application. Its homepage features a **masonry layout**—a grid where items ("pins") of varying heights are arranged to optimize space and visual appeal. This document provides an in-depth system design for such a feed, covering requirements, architecture, data modeling, API, layout algorithms, virtualization, performance, accessibility, and more.

---

## 1. Problem Overview & Requirements Exploration

### Core Features
- **Masonry layout**: Display pins in a grid with variable heights, minimizing vertical gaps.
- **Infinite scrolling**: Seamless loading of additional pins as the user scrolls.
- **Order preservation**: Pins must appear in the order returned by the backend feed.
- **Image-centric**: Focus on images (not videos/GIFs for this scope).
- **Responsive**: Usable and visually consistent on desktop, mobile, and tablet.
- **Accessibility**: Keyboard navigation, screen reader support, and correct tab order.
- **Performance**: Fast initial load, smooth scrolling, and efficient resource usage.
- **Progressive enhancement**: Works with/without JavaScript, degrades gracefully.

### Glossary
- **Pin**: A content item (image, metadata, etc.) in the feed.
- **Feed**: The ordered list of pins returned by the backend.

---

## 2. High-Level Architecture

### Rendering Strategy
- **Hybrid SSR/CSR**: Use **Server-Side Rendering (SSR)** for the initial page load (improves SEO, time-to-content, and social sharing), then hydrate and switch to **Client-Side Rendering (CSR)** for interactivity and infinite scrolling.
- **SPA (Single-Page Application)**: The homepage and pin details are managed as a SPA to preserve scroll position, enable fast navigation, and cache in-memory data.
- **Hydration**: Initial HTML includes markup and data for pins; client JS calculates layout and attaches event handlers.

### Component Responsibilities

![Pinterest Architecture Diagram](https://www.gfecdn.net/img/questions/pinterest/pinterest-architecture.png)

- **Server**: Provides HTTP APIs for fetching pins and paginated data.
- **Client Store**: Caches all loaded pins and feed data in memory (e.g., Redux, Zustand, or React Context).
- **Homepage**: Hosts the Masonry component and manages feed state, scroll, and pagination.
- **Masonry Component**: Arranges pins in a masonry layout, handles virtualization, and manages layout calculations.
- **Pin Component**: Renders individual pins, handles image loading, error states, and accessibility.

---

## 3. Data Model

| Entity   | Source  | Belongs to | Fields                                                                 |
|----------|---------|------------|------------------------------------------------------------------------|
| Feed     | Server  | Homepage   | `pins` (list of `Pin`s), `pagination`                                  |
| Pin      | Server  | Homepage   | `id`, `created_time`, `image_url`, `alt_text`, `dominant_color`, ...   |

**Pinterest-specific data:**
- **Image dimensions**: Used for layout calculation and aspect ratio preservation.
- **Ordering**: Maintains the order of pins as returned by the backend.
- **Responsive image URLs**: Multiple URLs for different device sizes (e.g., `srcset`).
- **Pin state**: Tracks loading, painted, and error states for each pin.
- **Dominant color**: Used for placeholder backgrounds while images load.

---

## 4. API & Interface Definition

### Feed API
| Field        | Value         |
|--------------|--------------|
| HTTP Method  | `GET`        |
| Path         | `/feed`      |
| Description  | Fetches pins |

#### Parameters
| Parameter | Type   | Description                        |
|-----------|--------|------------------------------------|
| size      | number | Number of results per page         |
| cursor    | string | Identifier for last item fetched   |

#### Sample Response
```json
{
  "pagination": { "size": 20, "next_cursor": "=dXNlcjpVMEc5V0ZYTlo" },
  "pins": [
    {
      "id": 123,
      "created_at": "Sun, 01 Oct 2023 17:59:58 +0000",
      "alt_text": "Pixel art turnip",
      "dominant_color": "#ffd4ec",
      "image_url": "https://www.greatcdn.com/img/941b3f3d917f598577b4399b636a5c26.jpg"
      // ... more metadata
    }
    // ... more pins
  ]
}
```

- **Pagination**: Cursor-based for infinite scrolling, avoids issues with offset-based pagination (e.g., duplicates, missing items).

---

## 5. Masonry Layout Implementation

### Layout Approaches
- **Row of columns (Flexbox/Grid)**: Simple, but poor for keyboard navigation and accessibility. Columns may become unbalanced.
- **Absolute positioning**: Calculate exact `top` and `left` for each pin. Allows for correct tab order, easier virtualization, and better performance. Pinterest uses CSS transforms for positioning.

#### Example: Absolute Positioning
```html
<div class="container">
  <div class="item" style="height:250px; top:0; left:0;">1</div>
  <div class="item" style="height:300px; top:0; left:80px;">2</div>
  <!-- ... -->
</div>
```

### Pin Ordering Algorithms
- **Round robin**: Place pins in columns in order. Simple, but can lead to unbalanced columns.
- **Height balancing**: Place each pin in the shortest column. Produces a more visually pleasing, balanced layout.

#### Height Balancing Algorithm (JS)
```js
const NUM_COLS = 3;
const columnHeights = Array(NUM_COLS).fill(0);
pins.forEach(pin => {
  let shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
  // Set pin position based on shortestCol
  columnHeights[shortestCol] += pin.height;
});
```

### Responsiveness
- Recalculate positions on window resize (debounced for performance).
- Pre-calculate positions for common breakpoints (mobile, tablet, desktop).
- Use `srcset` and responsive image sizes for optimal loading.

---

## 6. List Virtualization

- **Why**: Rendering hundreds/thousands of pins in the DOM is slow and memory-intensive.
- **How**: Only render pins visible in the viewport (plus a small buffer above/below for smooth scrolling).
- **Pinterest**: Keeps ~40 pins in the DOM on desktop, ~10-20 on mobile.
- **Container height**: Set to the tallest column, so removing offscreen pins doesn't affect scroll position.

![Pinterest Virtualization](https://www.gfecdn.net/img/questions/pinterest/pinterest-virtualization-video.mp4)

#### Example: Virtualized List (Pseudo-React)
```jsx
<Masonry
  items={visiblePins}
  containerHeight={tallestColumnHeight}
  onScroll={handleScroll}
/>
```

---

## 7. Resource Loading & Optimization

### SSR for Initial Load
- Pins and images are included in the initial HTML for fast first paint and SEO.

### Image Loading
- **Preloading**: Use `<link rel="preload">` for critical images.
- **Progressive JPEGs**: Images load blurry and sharpen as more data arrives.
- **Responsive images**: Use `srcset` and multiple image sizes for different devices.
- **Image formats**: JPEG for compatibility, WebP for performance if supported.
- **Dominant color placeholders**: Show a colored box while the image loads, reducing layout shift and perceived latency.

### Paint Scheduling
- **Default**: Render all `<img>` tags; images appear as they load (can be jarring on slow networks).
- **Ideal**: Load images in parallel, but paint them in order so earlier pins appear first. Use React Suspense/SuspenseList for coordination.

### Performance Techniques
- Batch DOM changes to reduce reflows/repaints.
- Use CSS transforms for positioning (GPU-accelerated).
- Debounce/throttle layout recalculation on resize.
- List virtualization to keep DOM size small.
- Lazy load code for non-essential actions (e.g., modals, pin creation).

---

## 8. User Experience & Accessibility

### Loading States
- Use dominant color as a placeholder while images load.

![Pinterest Loading State](https://www.gfecdn.net/img/questions/pinterest/pinterest-loading.png)

### Error Handling
- Ignore failed images, retry, or show an error message.

### Accessibility
- Use `alt` for images, `role="list"` for container, `role="listitem"` for pins.
- Ensure tab order matches visual order (especially with absolute positioning).
- Keyboard navigation: Allow users to move between pins using arrow/tab keys.
- Screen reader support: Announce pin metadata and actions.

### Internationalization
- For RTL (right-to-left) languages, start layout from the right and mirror column order.

---

## 9. Advanced Interactions

- **Pin details modal**: Open pin details in a modal, preserving scroll position and background state.
- **Optimistic updates**: When saving/creating pins, update UI immediately and reconcile with server response.
- **Infinite scroll**: Trigger API calls as the user nears the bottom of the feed, with loading spinners and error recovery.
- **PWA features**: Pinterest is a Progressive Web App, offering offline access, push notifications, and fast loading.

---

## 10. Progressive Web App (PWA) Features
- **Offline support**: Cache assets and data for offline browsing.
- **Push notifications**: Engage users with updates.
- **Add to home screen**: Installable on mobile devices.
- **Performance**: Fast load times, even on slow networks.
- [PWA case study](https://medium.com/dev-channel/a-pinterest-progressive-web-app-performance-case-study-3bd6ed2e6154)
- [PWA retrospective](https://medium.com/pinterest-engineering/a-one-year-pwa-retrospective-f4a2f4129e05)

---

## 11. Real-World Challenges & Trade-offs

### Layout
- **Absolute positioning**: Best for performance and accessibility, but requires careful calculation and reflow management.
- **Flexbox/Grid**: Easier to implement, but less control over tab order and virtualization.

### Virtualization
- **Windowing**: Only render visible items, but must manage container height and scroll position.
- **Recycling**: Reuse DOM nodes for offscreen pins to reduce memory usage.

### Image Loading
- **Progressive loading**: Improves perceived performance, but may require additional image processing.
- **Responsive images**: Increases complexity, but saves bandwidth and improves UX.

### Accessibility
- **Tab order**: Must match visual order, especially with absolute positioning.
- **Screen readers**: Provide meaningful metadata and ARIA roles.

### SEO
- **SSR**: Ensures content is indexable by search engines.
- **Hydration**: Must match server and client markup to avoid flicker.

---

## 12. References & Further Reading
- [Pinterest Masonry component](https://gestalt.pinterest.systems/web/masonry)
- [Masonry source code](https://github.com/pinterest/gestalt/blob/master/packages/gestalt/src/Masonry.js)
- [How Masonry works](https://github.com/pinterest/gestalt/blob/master/packages/gestalt/src/Masonry/README.md)
- [Improving GIF performance on Pinterest](https://medium.com/pinterest-engineering/improving-gif-performance-on-pinterest-8dad74bf92f1)

---

This document provides a comprehensive, technical overview of the Pinterest homepage system design, focusing on the unique challenges and solutions for implementing a performant, accessible, and visually appealing masonry layout feed. It covers architectural decisions, layout algorithms, virtualization, resource loading, user experience, accessibility, and real-world trade-offs, serving as a reference for advanced system design interviews and real-world implementations.