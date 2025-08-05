# 11-data-fetching: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of data fetching in React, including async flows, caching, and error handling.

Want to see:

- If you can explain and implement data fetching strategies.
- How you handle loading, error, and success states.
- If you consider caching, performance, and best practices.

---

✅ **Answer Framework**

1. **Fetching Strategies**

   - useEffect for fetch on mount/update
   - useSWR, React Query for caching, revalidation, background fetch
   - SSR/SSG for initial data (Next.js, Remix)
   - Suspense for async data (experimental)

2. **State Management**

   - useState/useReducer for loading, error, data
   - Show loading indicators, error messages, retry options
   - Memoize and cache data for performance
   - Prefetch and background fetch for UX

3. **Actionable Checklist**
   - Use hooks for data fetching
   - Handle all states: loading, error, success
   - Use caching libraries for complex apps
   - Optimize for performance (debounce, batching, prefetch)
   - Test with slow networks and error scenarios

---

✅ **Example Content / Model Answer**

> “I fetch data in React using useEffect or libraries like React Query for caching and background fetch. I handle loading, error, and success states, show appropriate UI, and optimize with memoization and prefetching. I test with slow networks and handle errors gracefully.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget to handle all states (loading, error, success).
- Use caching for performance and UX.
- Test with real APIs and error scenarios.
