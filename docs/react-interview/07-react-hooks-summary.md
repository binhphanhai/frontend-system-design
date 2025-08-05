# 07-react-hooks: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of React hooks, their use cases, and your ability to write custom hooks.

Want to see:

- If you can explain and use core hooks (useState, useEffect, useContext, etc.).
- How you design and use custom hooks for code reuse.
- If you understand hook rules, dependencies, and common pitfalls.

---

✅ **Answer Framework**

1. **Core Hooks**

   - useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useLayoutEffect, useImperativeHandle
   - When and why to use each

2. **Custom Hooks**

   - Encapsulate reusable logic (e.g., useForm, useFetch, useDebounce)
   - Naming: always start with "use"
   - Share logic, not state

3. **Rules & Best Practices**

   - Only call hooks at the top level, never in loops/conditions
   - Only call hooks from React functions
   - Manage dependencies in useEffect/useCallback
   - Clean up effects to avoid leaks

4. **Actionable Checklist**
   - Use core hooks for state, side effects, refs, context
   - Write custom hooks for shared logic
   - Follow hook rules and naming conventions
   - Test hooks in isolation
   - Avoid common pitfalls (stale closures, missing deps)

---

✅ **Example Content / Model Answer**

> “I use core hooks for state, effects, refs, and context. I write custom hooks to encapsulate reusable logic, always following the rules of hooks. I manage dependencies carefully and clean up effects. I test hooks in isolation and avoid common pitfalls like stale closures.”

---

**Pro Tips / Common Pitfalls**

- Don’t call hooks conditionally or in loops.
- Always clean up effects.
- Test custom hooks with different scenarios.
