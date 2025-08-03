# System Design: News Feed (e.g. Facebook)

Designing a news feed application is a classic system design question, frequently asked at companies like Twitter, Google, Amazon, TikTok, LinkedIn, and OpenAI. This expanded summary covers the **front end design** of a news feed, including requirements, architecture, data model, APIs, rendering strategies, optimizations, accessibility, and advanced topics.

---

## 1. Problem Statement

**Design a news feed application** that contains a list of feed posts users can interact with.

![News Feed Example](https://www.gfecdn.net/img/questions/news-feed-facebook/news-feed-example.png)

**Real-life examples:**
- [Facebook](https://www.facebook.com/)
- [Twitter](https://www.twitter.com/)
- [Quora](https://www.quora.com/)
- [Reddit](https://www.reddit.com/)

---

## 2. Requirements Exploration

### Core Features
- **Browse news feed** containing posts by the user and their friends.
- **Liking and reacting** to feed posts.
- **Creating and publishing** new posts.
- *Commenting and sharing are out of core scope but can be discussed if time permits.*

### Supported Post Types
- **Text and image-based posts** (other types can be discussed if time permits).

### Pagination UX
- **Infinite scrolling**: More posts are loaded as the user scrolls to the end of the feed.

### Mobile Support
- Not a priority, but a good mobile experience is desirable.

### Other Considerations
- **Performance**: Fast load times, smooth scrolling, and quick interactions.
- **Accessibility**: Usable by all users, including those with disabilities.
- **Scalability**: Should handle large numbers of posts and users.

---

## 3. Architecture / High-level Design

![News Feed Architecture Diagram](https://www.gfecdn.net/img/questions/news-feed-facebook/news-feed-architecture.png)

### Component Responsibilities

- **Server**: Provides HTTP APIs to fetch and create feed posts.
- **Controller**: Manages data flow and network requests.
- **Client store**: Stores application-wide data (mainly server-originated).
- **Feed UI**: Displays feed posts and post composer.
  - **Feed posts**: Shows post data and interaction buttons (like, react, share).
  - **Post composer**: WYSIWYG editor for creating new posts.

### Rendering Approach

- **Server-side rendering (SSR)**: Renders HTML on the server for fast initial load and SEO. Best for static content.
- **Client-side rendering (CSR)**: Renders in the browser using JavaScript. Best for interactive content.
- **Hybrid (SSR + CSR)**: Used by Facebook for fast initial load (SSR) and interactive updates (CSR). Modern frameworks like React, Vue, Next.js, and Nuxt support this.

**Example:** Facebook uses SSR for the initial page load, then hydrates the page to attach event listeners for user interactions. Subsequent content and navigation use CSR.

---

## 4. Data Model

A news feed shows a list of posts fetched from the server. Most data is server-originated; client-side data is mainly form state for the composer.

| Entity    | Source         | Belongs to         | Fields                                                      |
|-----------|----------------|--------------------|-------------------------------------------------------------|
| Feed      | Server         | Feed UI            | posts (list of Post), pagination                            |
| Post      | Server         | Feed post          | id, created_time, content, author (User), reactions, image_url |
| User      | Server         | Client store       | id, name, profile_photo_url                                 |
| NewPost   | User input     | Post composer UI   | message, image                                              |

### Advanced: Normalized Store

- **Normalized stores** (like Redux or Relay) reduce duplicated data and make updates easier.
- Each type of data is stored in its own table, and references use IDs (like a database).
- Not strictly necessary for a simple feed, but useful for large, complex apps.

---

## 5. Interface Definition (API)

| Source        | Destination   | API type   | Functionality                |
|---------------|--------------|------------|------------------------------|
| Server        | Controller   | HTTP       | Fetch feed posts             |
| Controller    | Server       | HTTP       | Create new post              |
| Controller    | Feed UI      | JavaScript | Pass feed posts data, reactions |
| Post composer | Controller   | JavaScript | Pass new post data           |

### Pagination

#### Offset-based Pagination
- Uses `page` and `size` parameters.
- Simple, allows jumping to pages, but can have duplicate/missing data and performance issues on large datasets.
- Example SQL: `SELECT * FROM posts LIMIT 5 OFFSET 10;`

#### Cursor-based Pagination
- Uses a `cursor` (unique identifier, e.g., post ID or timestamp) and `size`.
- More efficient for dynamic, infinite feeds; avoids duplicates and is used by Facebook, Slack, Zendesk, etc.
- Example SQL: `SELECT * FROM posts WHERE id > cursor LIMIT 5;`
- **Preferred for news feeds.**

**Example API Response:**
```json
{
  "pagination": {
    "size": 10,
    "next_cursor": "=dXNlcjpVMEc5V0ZYTlo"
  },
  "results": [
    {
      "id": "123",
      "author": { "id": "456", "name": "John Doe" },
      "content": "Hello world",
      "image": "https://www.example.com/feed-images.jpg",
      "reactions": { "likes": 20, "haha": 15 },
      "created_time": 1620639583
    }
    // ... More posts.
  ]
}
```

---

## 6. Optimizations and Deep Dive

### General Optimizations

- **Code splitting & lazy loading**: Load only what's needed, in tiers (above-the-fold, interactive, background).
- **Keyboard shortcuts**: Improve navigation and accessibility.
  - ![Facebook news feed shortcuts](https://www.gfecdn.net/img/questions/news-feed-facebook/facebook-shortcuts.png)
- **Error states**: Clearly display network or data errors.

### Feed List Optimizations

- **Infinite scrolling**: Use Intersection Observer API for efficient loading.
- **Virtualized lists**: Render only visible posts to improve performance.
- **Loading indicators**: Use shimmer effects for better UX.
  - ![Facebook shimmer](https://www.gfecdn.net/img/questions/news-feed-facebook/facebook-shimmer.jpg)
- **Dynamic loading count**: Adjust number of posts fetched based on viewport.
- **Preserve scroll position**: Cache feed and scroll state for seamless navigation.
- **Handle stale feeds**: Prompt refresh or auto-update after long inactivity.

### Feed Post Optimizations

- **Data-driven dependencies**: Lazy load components based on post type (e.g., text, image).
- **Rich text rendering**: Use robust formats for mentions/hashtags (e.g., Draft.js, Lexical).
  - ![Facebook post with mention and hashtag](https://www.gfecdn.net/img/questions/news-feed-facebook/facebook-post-rich-text.png)
- **Image optimization**: Use CDNs, modern formats (WebP), responsive images, and alt text.
- **Lazy load non-critical code**: Download code for popovers, menus, etc., only when needed.
- **Optimistic updates**: Instantly reflect user actions (like, react) and revert on error.
- **Timestamp rendering**: Use browser Intl APIs for multilingual, up-to-date timestamps.
- **Icon rendering**: Prefer inlined SVGs for crisp, scalable icons.
- **Post truncation**: Abbreviate long posts and reaction counts.

### Feed Comments & Live Updates

- **Cursor-based pagination** for comments.
- **Optimistic updates** for new comments and reactions.
- **Live updates**: Use WebSockets for real-time comments and reactions.
- **Subscribe/unsubscribe** to updates based on post visibility.
- **Debounce/throttle** updates for high-activity posts.

### Feed Composer Optimizations

- **Rich text editing**: Use libraries like Lexical, TipTap, or Slate for WYSIWYG editing.
- **Lazy load dependencies**: Load code for image/GIF/emoji/sticker pickers on demand.

### Accessibility

- **Feed list**: Add `role="feed"`.
- **Feed posts**: Add `role="article"`, `aria-labelledby`, and keyboard focus support.
- **Feed interactions**: Use accessible buttons and ARIA labels.

---

## 7. Advanced Topics

### Rendering Mentions/Hashtags

- Avoid storing HTML for security and flexibility.
- Use custom syntax or rich text editor formats (e.g., Draft.js, Lexical) for mentions and hashtags.
- Example: `[[#1234: HBO Max]]` for mentions.

### Image Handling

- Use CDNs for fast delivery.
- Use `srcset` for responsive images.
- Provide `alt` text, possibly generated by AI.

### Live Comment Updates

- Use WebSockets for real-time updates.
- Subscribe/unsubscribe based on post visibility.
- Throttle updates for high-activity posts.

### Internationalization

- Use browser `Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` for timestamps.
- Consider server-side translation for static content.

---

## 8. References

- [Rebuilding our tech stack for the new Facebook.com](https://engineering.fb.com/2020/05/08/web/facebook-redesign/)
- [Making Facebook.com accessible to as many people as possible](https://engineering.fb.com/2020/07/30/web/facebook-com-accessibility/)
- [Dissecting Twitter's Redux Store](https://medium.com/statuscode/dissecting-twitters-redux-store-d7280b62c6b1)
- [Evolving API Pagination at Slack](https://slack.engineering/evolving-api-pagination-at-slack)
- [Draft.js](https://draftjs.org/)
- [Lexical](https://lexical.dev/)
- [Intersection Observer API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

*This expanded summary covers the essential and advanced front end system design considerations for a modern, scalable, and user-friendly news feed application. If you need even more detail on any specific section (e.g., code samples, more diagrams, or deep dives into rendering, state management, or accessibility), let me know!*