# 08-autocomplete: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design an efficient, accessible, and user-friendly autocomplete component for large-scale, real-world use.

Want to see:

- If you can handle async data, debouncing, caching, and edge cases.
- How you manage state, accessibility, and performance.
- If you consider SSR, keyboard support, and UX tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Async search or local filtering?
   - Minimum input length before search?
   - Loading, error, and empty states?
   - Keyboard navigation and ARIA accessibility?
   - SSR/SEO needed for public search?
   - Result ranking, highlighting, or grouping?

2. **Component & Data Flow Breakdown**

   - Input field (handles user input, focus, blur)
   - Suggestion list (renders results, handles selection)
   - Loading indicator, error message, empty state
   - State: input value, suggestions, loading, error, highlighted index, cache

3. **State Management & Data Fetching**

   - Local state for UI (input, highlight, open/close)
   - Global/cache state for suggestions (SWR, React Query, in-memory cache)
   - Debounce input to limit API calls (e.g., 300ms)
   - Cancel stale requests (abort controller or ignore outdated responses)
   - SSR: prefetch suggestions for initial render if SEO is needed

4. **Performance & UX Solutions**

   - Debouncing for input
   - Caching previous queries/results
   - Virtualize long suggestion lists
   - Skeleton or spinner for loading state
   - Optimistic UI for fast feedback

5. **Accessibility & Testing**

   - ARIA roles (combobox, listbox, option)
   - Keyboard navigation (arrow keys, enter, escape)
   - Announce results and errors to screen readers
   - Unit/integration tests for async, keyboard, and edge cases

6. **Tradeoffs & Alternatives**
   - Client vs. server filtering: client is faster for small datasets, server is scalable for large/remote data
   - Debounce vs. throttle: debounce for search, throttle for continuous input
   - SSR vs. CSR: SSR for SEO, CSR for dynamic/interactive UIs
   - Caching: in-memory for session, persistent for repeat queries

---

✅ **Example Content / Model Answer**

> “For a scalable autocomplete, I’d debounce input by 300ms, fetch suggestions async, and cache results for recent queries. I’d use ARIA roles for accessibility and support full keyboard navigation. For SSR, I’d prefetch suggestions for the initial query. I’d handle loading, error, and empty states, and use virtualization for long lists. Tradeoff: server filtering is more scalable, but client filtering is faster for small datasets.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget accessibility and keyboard support.
- Handle async edge cases (race conditions, stale results, rapid input changes).
- Test with slow networks, large datasets, and screen readers.
