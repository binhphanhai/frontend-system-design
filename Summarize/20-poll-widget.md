# Poll Widget System Design

*System design interview question: Design a poll widget that can be easily embedded on websites, such as articles and blogs, to allow website viewers to vote on options.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Architecture & High-Level Design](#architecture--high-level-design)
4. [Data Model](#data-model)
5. [Interface Definition (API)](#interface-definition-api)
6. [Optimizations and Deep Dive](#optimizations-and-deep-dive)
7. [User Experience (UX)](#user-experience-ux)
8. [Performance, Scalability, and Security](#performance-scalability-and-security)
9. [Accessibility (a11y)](#accessibility-a11y)
10. [Internationalization (i18n)](#internationalization-i18n)
11. [Customization, Analytics, and Testing](#customization-analytics-and-testing)
12. [References](#references)

---

## 1. Overview

Poll widgets are interactive UI components that allow users to vote on options and view poll results. They are commonly embedded in articles, blogs, and community sites to gather opinions and increase engagement. A robust poll widget must be easy to embed, visually appealing, accessible, performant, secure, and production-ready. This document provides a deep technical dive into the architecture, data model, APIs, rendering, accessibility, security, analytics, and real-world trade-offs for building a modern poll widget.

![Poll Widget Example](https://www.gfecdn.net/img/questions/poll-widget/poll-widget-example.png)

---

## 2. Requirements Exploration

### Core Requirements
- Display a list of options for users to vote on
- Show the latest number of votes for each option (after voting)
- Support voting and unvoting (multiple options per user)
- Easy embedding for website owners (minimal setup)
- Fetch poll results, record new votes, and remove votes via backend APIs
- Maximum 6 options per poll
- Options are fixed at poll creation (no user-added options)
- Anyone can vote (no login required), but votes should persist for the same user
- Options shown in order of popularity
- Widget must be responsive and mobile-friendly
- Widget must be secure, privacy-friendly, and accessible

### Critical Aspects
- **Ease of embedding**: Minimal code, works on any website, no build tools required
- **User experience**: Fast, intuitive, visually clear, responsive, low bias
- **Data privacy**: No personal data required for voting, no tracking
- **Anti-abuse**: Prevent duplicate voting, basic fraud prevention

### Out of Scope
- No display of voter details (thumbnails, names)
- No option to add new poll options after creation
- No real-time collaborative voting (see advanced topics)

---

## 3. Architecture & High-Level Design

### Rendering Approaches
- **Iframe (different browser context)**: Most common for embeddable widgets (Facebook Like, Twitter Tweet, YouTube, Disqus)
  - Pros: Style and JS isolation, easy to embed, unaffected by host site CSS/JS, security sandbox
  - Cons: Needs a web server, slightly slower load, limited host customization, cross-origin communication needed for advanced integration
- **Direct DOM (same browser context)**: Widget JS runs in host page
  - Pros: Fast, can be styled by host, can access host context
  - Cons: Prone to CSS/JS conflicts, less isolation, more risk of breakage

**Best Practice:** Use iframe for encapsulation and reliability. Provide both JS SDK and direct iframe embed options for flexibility. For advanced users, offer an npm package for direct integration.

### Distribution Approaches
| Approach           | Pros                                  | Cons                                 |
|--------------------|---------------------------------------|--------------------------------------|
| Direct iframe      | Easiest, works everywhere              | Least customizable                   |
| JavaScript SDK     | Dynamic config, can auto-resize iframe | Slightly more complex, needs script  |
| npm package        | Full control, best for SPAs            | Requires build tools, not for blogs  |

### Example Embed Code
```html
<iframe
  src="https://greatpollwidget.com/embed/{poll_id}"
  title="Poll widget for your favorite JavaScript framework"
  frameborder="0"
  scrolling="no"
  style="border:none;overflow:hidden;height:200px;width:100%;max-width:450px;"
></iframe>
```

### Architecture Diagram
![Poll Widget Architecture](https://www.gfecdn.net/img/questions/poll-widget/poll-widget-architecture.png)

#### Component Responsibilities
| Component      | Responsibility                                                      |
|---------------|---------------------------------------------------------------------|
| Host Website  | Embeds the widget as an iframe                                      |
| App Server    | Serves the widget UI (HTML, CSS, JS)                                |
| API Server    | Provides poll data, records votes/unvotes                           |
| Client Store  | Manages poll state, interacts with API                              |
| Polls UI      | Renders poll options, handles user interaction                      |

#### Advanced: Cross-Origin Communication
- For advanced integration (e.g., analytics, resizing), use `postMessage` between iframe and host
- Consider security implications (validate message origins)

---

## 4. Data Model

### Poll State Example (TypeScript)
```ts
interface PollOption {
  id: number;
  label: string;
  count: number;
  userVotedForOption: boolean;
}

interface PollState {
  lastUpdated: number;
  totalVotes: number;
  question: string;
  options: PollOption[];
  selectedOptions: number[]; // client-only state
}
```

### Server API Data Example
```json
{
  "totalVotes": 421,
  "question": "Which is your favorite JavaScript library/framework?",
  "options": [
    { "id": 123, "label": "React", "count": 234, "userVotedForOption": false },
    { "id": 124, "label": "Vue", "count": 183, "userVotedForOption": false },
    { "id": 125, "label": "Svelte", "count": 51, "userVotedForOption": false }
  ]
}
```
- All fields except `selectedOptions` are server-originated.
- `selectedOptions` is client-only, used for UI state.

### Vote Persistence
- Use cookies or localStorage to assign a unique user ID (e.g., UUID)
- Persist user votes so they see their choices after reload
- Not foolproof (users can clear cookies or use different browsers)
- For stricter anti-abuse, require login (out of scope for this widget)

---

## 5. Interface Definition (API)

### Embed API
- Website owners copy-paste an iframe with a unique poll URL
- Optionally, provide a JS SDK for dynamic embedding and auto-resizing
- Allow configuration via query params (theme, language, etc.)

### Component API (for widget implementation)
| Component         | Props/Responsibilities                                         |
|-------------------|---------------------------------------------------------------|
| Poll              | `submitUrl`, children                                         |
| PollOptionList    | Renders up to 6 options                                       |
| PollOptionItem    | `label`, `count`, `isSelected`, `onVote`, `onUnvote`          |

**Example (React):**
```jsx
<Poll submitUrl="https://greatpollwidget.com/submit/{poll_id}">
  <PollOptionList>
    {options.map(option => (
      <PollOptionItem
        key={option.id}
        label={option.label}
        count={option.count}
        isSelected={option.userVotedForOption}
        onVote={() => submitVote(option.id)}
        onUnvote={() => removeVote(option.id)}
      />
    ))}
  </PollOptionList>
</Poll>
```

### Server APIs
| Endpoint                        | Method | Description                                 |
|----------------------------------|--------|---------------------------------------------|
| `/api/{poll_id}/results`         | GET    | Returns poll question, options, counts, user votes |
| `/api/{poll_id}/submit`          | POST   | Submits votes, returns updated results      |
| `/api/{poll_id}/unvote`          | POST   | Removes votes, returns updated results      |

- All APIs return tabulated results (not raw votes) for performance
- Use HTTP status codes and error payloads for error handling
- Secure endpoints with rate limiting and input validation

#### Example API Payloads
```json
// Submit vote
{
  "userId": "abc123",
  "optionIds": [124, 125]
}
// Response
{
  "success": true,
  "results": { ...poll data... }
}
```

---

## 6. Optimizations and Deep Dive

### Persisting Votes Across Sessions
- Use cookies or localStorage to assign a unique user ID (e.g., UUID)
- Persist user votes so they see their choices after reload
- Note: Not foolproof (users can clear cookies or use different browsers)
- For stricter anti-abuse, require login (out of scope)

### Rendering Poll Options
- Render bars with dynamic widths based on vote proportion
- Two approaches:
  1. **Full bar = 100% of all votes** (common, e.g., Reddit, Twitter)
  2. **Full bar = top-voted option** (emphasizes leader, but can mislead)
- Use inline styles for dynamic widths:
  ```jsx
  <div style={{ width: '40%' }}>React</div>
  <div style={{ width: '30%' }}>Vue</div>
  ```
- Avoid hardcoded px values; use % for responsive resizing
- Animate bar width changes for visual clarity

### Optimistic UI Updates
- Show updated UI immediately after user votes, before server response
- Reconcile with server response when received
- Skip optimistic updates for large polls where a single vote has little impact
- Handle out-of-order network responses (ignore stale updates)

### Scalability
- Max 6 options: no need for virtualization
- For larger polls, use virtualized lists and capped container height
- Use CDN and caching (e.g., Redis) for popular polls

### SSR/SSG and SEO
- Prefer SSR for initial load for fast rendering
- Fallback to AJAX fetch if needed
- Widget content is not SEO-critical (inside iframe)

### Security and Privacy
- Prevent duplicate voting by same user (via cookies/localStorage)
- No personal data stored; privacy-friendly
- Secure API endpoints (rate limiting, input validation)
- Sanitize all user-generated content (question, options)
- Use HTTPS for all endpoints
- No tracking or analytics by default (opt-in only)

---

## 7. User Experience (UX)
- Use shimmer loading effect for bars while loading (not just spinners)
- Hide poll results until user votes (reduces bias)
- Optionally, allow "See responses" without voting
- Responsive design: works on mobile, tablet, desktop
- Show clear feedback for vote/unvote actions
- Animate bar width changes for visual clarity
- Show error messages if API calls fail
- High-contrast colors for bars and text
- Support for keyboard and touch interactions
- Support for theme customization (light/dark)
- Allow poll creators to preview widget before embedding

---

## 8. Performance, Scalability, and Security
- Server returns tabulated results for fast rendering
- Prefer SSR for initial load; fallback to AJAX fetch if needed
- Use CDN for widget assets (JS, CSS)
- Use caching (e.g., Redis) for popular polls
- Prevent duplicate voting by same user (via cookies/localStorage)
- No personal data stored; privacy-friendly
- Secure API endpoints (rate limiting, input validation)
- Handle out-of-order network responses (ignore stale updates)
- Show errors in UI if API submission fails
- Monitor widget performance (load time, interaction latency)
- Use Sentry or similar for error tracking

---

## 9. Accessibility (a11y)
- Use `aria-label`, `title`, `aria-describedby` for poll options
- Use `aria-live` to announce updates to screen readers
- Use `role="radiogroup"` and `role="radio"` for single-select polls
- Use `<button>` for options, or make `<div>`s focusable with `tabindex="0"` and `role="button"`
- Ensure keyboard navigation (Tab, Enter, Space)
- High-contrast colors for bars and text
- Announce errors and loading states
- Support for screen readers (NVDA, JAWS, VoiceOver)
- Test with axe, Lighthouse, or jest-axe

---

## 10. Internationalization (i18n)
- Support multiple languages via query param in iframe URL
- Localize all UI strings, ARIA labels, and error messages
- Support RTL layouts (flip bar direction, align text)
- Allow poll creators to provide translations for question/options
- Use CSS logical properties for layout (margin-inline, etc.)

---

## 11. Customization, Analytics, and Testing
- Theming: Support for CSS variables, theme objects, or design tokens
- Allow poll creators to customize colors, fonts, padding, etc.
- Analytics: Expose events for vote, unvote, error, load
- Allow opt-in analytics for poll creators (GDPR/CCPA compliant)
- Testing: unit tests for vote/unvote, rendering, a11y; integration tests for API, SSR
- Visual regression: Use Percy, Chromatic, or Storybook
- Performance monitoring: Track load times, interaction latency
- Anti-patterns: Avoid showing results before voting (bias), avoid too many options

---

## 12. References
- [Facebook Like Button](https://developers.facebook.com/docs/plugins/like-button/)
- [Twitter Embedded Tweets](https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/overview)
- [Disqus Universal Embed Code](https://help.disqus.com/en/articles/1717112-universal-embed-code)
- [ARIA Authoring Practices: Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radiogroup/)
- [Shimmer Loading Effect](https://docs.flutter.dev/cookbook/effects/shimmer-loading)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices/)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern poll widget. It covers architecture, data modeling, API, rendering, accessibility, customization, performance, security, analytics, testing, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.