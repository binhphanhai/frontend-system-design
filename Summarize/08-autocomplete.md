# System Design: Autocomplete

Autocomplete is a classic front end system design interview question, asked at top companies like Apple, Airbnb, Google, LinkedIn, Lyft, Microsoft, OpenAI, Twitter, and Uber. It tests your ability to design a robust, accessible, high-performance, and flexible UI component. This summary is a comprehensive, in-depth guide to designing a modern autocomplete system, covering requirements, architecture, data modeling, API, performance, UX, accessibility, and real-world best practices.

---

## 1. Problem Statement

**Design an autocomplete UI component** that allows users to enter a search term into a text box, see a list of search results in a popup, and select a result. The component should be generic, customizable, and suitable for use in a wide variety of applications.

**Real-life examples:**
- Google search bar (text-based suggestions)
- Facebook search input (rich results: friends, celebrities, groups, pages, etc.)

![Google search example](https://www.gfecdn.net/img/questions/autocomplete/google-search-autocomplete.png)

A backend API is provided to return a list of results based on the search query.

---

## 2. Requirements Exploration

### Key Questions to Clarify
- **What kind of results should be supported?**
  - Text, image, media (image + text), and potentially more. The component should be generic and extensible to support custom result types.
- **What devices will this component be used on?**
  - All: desktop, tablet, mobile. Must be responsive and touch-friendly.
- **Do we need to support fuzzy search?**
  - Not for the initial version, but should be extensible to support typo-tolerance and fuzzy matching in the future.
- **How should the component be customized?**
  - Theming, custom rendering, event hooks, and flexible API.
- **What are the performance and accessibility requirements?**
  - Fast, low-latency, accessible to all users, and scalable to large datasets.

### Core Requirements
- **Generic and reusable**: Usable across different websites and use cases.
- **Customizable UI**: Both the input field and results popup must be customizable (theming, rendering, etc.).
- **High performance**: Fast response, low latency, efficient memory usage.
- **Accessible**: Fully keyboard and screen reader accessible.
- **Mobile-friendly**: Works well on all device types.
- **Robust error handling**: Handles network errors, empty states, and offline gracefully.

---

## 3. Architecture

![Autocomplete architecture](https://www.gfecdn.net/img/questions/autocomplete/autocomplete-architecture.png)

### Main Components
- **Input Field UI**
  - Handles user input, focus, blur, and passes input to the controller.
  - Supports custom rendering, theming, and event hooks.
- **Results UI (Popup)**
  - Receives results from the controller and presents them to the user.
  - Handles user selection (mouse, touch, keyboard) and informs the controller.
  - Supports custom rendering for each result type (text, image, etc.).
- **Cache**
  - Stores results for previous queries to avoid unnecessary server requests and enable instant display.
  - Supports configurable cache strategies (TTL, eviction, etc.).
- **Controller**
  - The "brain" of the component (MVC pattern).
  - Coordinates user input, cache, network requests, and result rendering.
  - Handles debouncing, race conditions, and error states.

### Data Flow
1. User types in the input field.
2. Controller debounces input and checks cache for results.
3. If not cached, controller fetches results from the server.
4. Results are cached and passed to the Results UI for display.
5. User selects a result (via mouse, touch, or keyboard), controller notifies parent component.

---

## 4. Data Model

### Controller State
- **Props/options**: All configuration options passed to the component (API URL, debounce, theming, etc.).
- **Current search string**: The current value of the input field.
- **Loading state**: Whether a request is in progress.
- **Error state**: Any error message to display.
- **Selected index**: Which result is currently highlighted (for keyboard navigation).
- **Results**: The current list of results to display.
- **Cache**: See below.

### Cache Structure
- **Initial results**: Results to show when input is empty (e.g. trending, recent, or popular searches).
- **Cached results**: Results for previous queries.
- **Cache structure options**:
  1. **Hash map (query string → results)**: Fast lookup, but can use a lot of memory if not debounced.
  2. **Flat list of results**: Less duplication, but requires client-side filtering (can be slow for large datasets).
  3. **Normalized map (ID → result, query string → list of IDs)**: Combines fast lookup and deduplication. Inspired by Redux/Relay/normalizr.
- **Cache metadata**: Timestamps for TTL, source (network/cache), etc.

---

## 5. Interface Definition (API)

### Client-side Component API

#### Basic API
- **Number of results**: How many results to show in the popup.
- **API URL**: Endpoint to hit for queries.
- **Event listeners**: Hooks for `'input'`, `'focus'`, `'blur'`, `'change'`, `'select'`, etc.
- **Custom rendering**:
  - Theming options object (simple, less flexible)
  - Classnames (for custom CSS)
  - Render function/callback (maximum flexibility, e.g. React render prop)
- **Accessibility options**: ARIA attributes, keyboard navigation, etc.

#### Advanced API
- **Minimum query length**: Only trigger search after a minimum number of characters (e.g. 3+).
- **Debounce duration**: Debounce API calls to avoid excessive requests (e.g. 300ms after last keystroke).
- **API timeout duration**: How long to wait before showing an error.
- **Cache options**:
  - Initial results
  - Results source: network only, network+cache, cache only
  - Function to merge server and cache results
  - Cache duration (TTL)
  - Cache eviction strategy (LRU, TTL, manual)
- **Pagination**: Support for paginated results (infinite scroll or "load more").
- **Fuzzy search**: Optionally enable typo-tolerance (Levenshtein distance) on client or server.
- **Result selection callback**: Custom handler for when a result is selected.

### Server API
- **query**: The search string
- **limit**: Number of results per page
- **pagination**: Page number (for scrolling through more results)
- **Result format**: Should support flexible result types (text, image, etc.)

---

## 6. Optimizations and Deep Dive

### Network
#### Handling Concurrent Requests / Race Conditions
- If the user types quickly, multiple requests may be in flight. Responses can arrive out of order.
- **Solution:** Attach a timestamp or unique ID to each request. Only display results for the latest request.
- **Better:** Use a cache keyed by query string. Always display results matching the current input value.
- **Note:** Aborting requests (e.g. with `AbortController`) is not always effective, as the server may have already processed the request.

#### Failed Requests and Retries
- Automatically retry failed requests, possibly with exponential backoff to avoid overloading the server.
- Show error messages and allow user to retry manually.

#### Offline Usage
- If offline, read from cache if available.
- Indicate offline status in the UI.
- Do not fire network requests when offline.
- Optionally, show a "no network" message or icon.

### Cache
#### Why Cache?
- Improves performance and reduces server load by storing results for previous queries.
- Enables instant display of results for repeated queries.
- Allows for offline usage and better UX.

#### Cache Structure Options
1. **Hash map (query string → results)**
   - Fast O(1) lookup, but can use a lot of memory if not debounced.
   - Good for short-lived pages (e.g. Google search).
2. **Flat list of results**
   - Less duplication, but requires client-side filtering (can be slow for large datasets).
3. **Normalized map (ID → result, query string → list of IDs)**
   - Combines fast lookup and deduplication. Inspired by Redux/Relay/normalizr.
   - Good for long-lived SPAs (e.g. Facebook).

#### Initial Results
- Show relevant results when the input is focused but empty (e.g. trending searches, recent history).
- Store these in the cache with an empty string as the key.
- Examples:
  - Google: Popular/trending searches, recent history
  - Facebook: Recent searches
  - Stock/crypto: Trending tickers

#### Caching Strategy
- **Data source**: network only, network+cache, cache only
- **Cache duration/TTL**: How long to keep results before evicting (e.g. 30 minutes for Facebook, hours for Google, none for real-time data like stock tickers)
- **Eviction**: Purge cache when memory usage is high or entries are stale. Use LRU or TTL strategies.
- **Cache merging**: Optionally merge results from cache and network for best freshness and performance.

### Performance
- **Loading speed**: Use cache for instant results. Preload initial results if possible.
- **Debouncing/throttling**: Reduce network requests and CPU usage. Use a sensible debounce (e.g. 300ms).
- **Memory usage**: Purge cache as needed. Monitor memory usage in long-lived SPAs.
- **Virtualized lists**: Only render visible results for large result sets. Use libraries like `react-window` or `react-virtualized`.
- **Efficient DOM updates**: Minimize re-renders and DOM thrashing.

### User Experience (UX)
- **Autofocus**: Automatically focus input on search pages (e.g. Google).
- **Handle different states**: Show loading spinners, error messages, and offline indicators.
- **Handle long strings**: Truncate or wrap long result text. Use tooltips for overflow.
- **Mobile-friendliness**: Large tap targets, dynamic result count, helpful input attributes (`autocapitalize`, `autocomplete`, `autocorrect`, `spellcheck`).
- **Keyboard interaction**: Support navigation and selection via keyboard (arrow keys, enter, escape, global shortcut like `/`).
- **Fuzzy search**: Optionally support typo-tolerance (Levenshtein distance) on client or server. Useful for handling typos and misspellings.
- **Query results positioning**: Display popup above input if there's not enough space below. Use libraries like Popper.js for smart positioning.
- **Loading indicators**: Use skeletons or shimmer effects for better perceived performance.
- **Result highlighting**: Highlight matching substrings in results for better clarity.
- **Accessibility announcements**: Use ARIA live regions to announce new results to screen readers.

### Accessibility
- **Screen readers**:
  - Use semantic HTML (`<ul>`, `<li>`) or ARIA roles (`role="listbox"`, `role="option"`).
  - `aria-label` for input, `role="combobox"` for input.
  - `aria-haspopup`, `aria-expanded`, `aria-live`, `aria-autocomplete`.
  - Google uses `aria-autocomplete="both"`, Facebook/X use `aria-autocomplete="list"`.
  - Mark the results region with `aria-live` so screen readers are notified of updates.
- **Keyboard interaction**:
  - Enter to search, up/down to navigate, escape to dismiss, follow [WAI ARIA Combo Box](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) practices.
  - Support wrapping navigation, home/end keys, and typeahead selection.
- **Focus management**:
  - Ensure focus is managed correctly when results appear/disappear.
  - Trap focus within the popup when open.
- **Contrast and color**:
  - Ensure sufficient contrast for text and highlights.
  - Support high-contrast and dark mode themes.
- **Touch and pointer events**:
  - Ensure all interactions are accessible via touch, mouse, and keyboard.

---

## 7. Real-World Comparison: Google, Facebook, and X (Twitter)

| HTML Attribute         | Google         | Facebook         | X (Twitter)      |
|-----------------------|---------------|------------------|------------------|
| HTML Element          | `<textarea>`  | `<input>`        | `<input>`        |
| Within `<form>`       | Yes           | No               | Yes              |
| type                  | "text"        | "search"         | "text"           |
| autocapitalize        | "off"         | Absent           | "sentence"       |
| autocomplete          | "off"         | "off"            | "off"            |
| autocorrect           | "off"         | Absent           | "off"            |
| autofocus             | Present       | Absent           | Present          |
| placeholder           | Absent        | "Search Facebook"| "Search"         |
| role                  | "combobox"    | Absent           | "combobox"       |
| spellcheck            | "false"       | "false"          | "false"          |
| aria-activedescendant | Present       | Absent           | Present          |
| aria-autocomplete     | "both"        | "list"           | "list"           |
| aria-expanded         | Present       | Present          | Present          |
| aria-haspopup         | "false"       | Absent           | Absent           |
| aria-invalid          | Absent        | "false"          | Absent           |
| aria-label            | "Search"      | "Search Facebook"| "Search query"   |
| aria-owns             | Present       | Absent           | Present          |
| dir                   | Absent        | "ltr"/"rtl"      | "auto"           |
| enterkeyhint          | Absent        | Absent           | "search"         |

*Note: This table is accurate at the time of writing; companies may update their implementations.*

---

## 8. References
- [The Life of a Typeahead Query (Facebook Engineering)](https://engineering.fb.com/2010/05/17/web/the-life-of-a-typeahead-query/)
- [Building an accessible autocomplete control (Adam Silver)](https://adamsilver.io/blog/building-an-accessible-autocomplete-control/)
- [WAI ARIA Combo Box Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [Virtualize long lists with react-window](https://web.dev/virtualize-long-lists-react-window)
- [Popper.js for smart positioning](https://popper.js.org/)

---

*This summary is a standalone, in-depth reference for designing a modern, accessible, and high-performance autocomplete component for front end system design interviews. For even more detail (e.g., code samples, diagrams, or deep dives into accessibility or performance), just ask!*