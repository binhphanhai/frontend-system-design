# 06-designing-state: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of state management in React and your ability to design scalable state solutions.

Want to see:

- If you can break down state types, lifecycles, and management strategies.
- How you choose between local, lifted, context, and external state.
- If you can explain tradeoffs and best practices.

---

✅ **Answer Framework**

1. **Types of State**

   - Local (component), lifted (shared), derived, server, UI, form, cache
   - When to use useState, useReducer, context, external stores (Redux, Zustand)

2. **State Management Strategies**

   - Keep state as local as possible
   - Lift state up for shared data
   - Use context for global, non-frequently changing state
   - Use external stores for large/global/async state
   - Normalize and structure state for scalability

3. **Actionable Checklist**
   - Identify state type and scope
   - Choose the right tool (useState, useReducer, context, Redux, etc.)
   - Avoid prop drilling and unnecessary re-renders
   - Memoize selectors and derived data
   - Test state logic and edge cases

---

✅ **Example Content / Model Answer**

> “I design state by keeping it as local as possible, lifting it up when needed, and using context or external stores for global state. I choose useState for simple cases, useReducer for complex logic, and Redux/Zustand for app-wide state. I normalize state and memoize selectors to avoid unnecessary renders.”

---

**Pro Tips / Common Pitfalls**

- Don’t put everything in context or Redux—prefer local state.
- Avoid prop drilling by lifting state or using context.
- Test state logic thoroughly.
