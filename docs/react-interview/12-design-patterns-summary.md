# 12-design-patterns: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of React design patterns, anti-patterns, and your ability to apply them in real-world code.

Want to see:

- If you can explain and use key React patterns (container/presentational, hooks, HOC, render props, compound components).
- How you avoid anti-patterns and write maintainable code.
- If you can discuss tradeoffs and best practices.

---

✅ **Answer Framework**

1. **Key Patterns**

   - Container/presentational separation
   - Custom hooks for logic reuse
   - Higher-order components (HOC), render props
   - Compound components for flexible APIs
   - Context for global state

2. **Anti-Patterns**

   - Prop drilling, overusing context
   - Large monolithic components
   - Uncontrolled side effects in render
   - Mutating state directly
   - Overusing HOCs or render props

3. **Actionable Checklist**
   - Use patterns for code reuse and flexibility
   - Avoid anti-patterns and refactor as needed
   - Test and document patterns in your codebase
   - Explain tradeoffs and alternatives in interviews

---

✅ **Example Content / Model Answer**

> “I use container/presentational separation, custom hooks, and compound components for flexibility and code reuse. I avoid prop drilling and large monolithic components. I’m familiar with HOCs and render props, but prefer hooks for most cases. I explain tradeoffs and document patterns in my code.”

---

**Pro Tips / Common Pitfalls**

- Don’t overuse context or HOCs—prefer hooks and composition.
- Refactor anti-patterns early.
- Document and test your patterns.
