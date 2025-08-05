# 05-thinking-declaratively: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of declarative programming in React and your ability to apply it in UI design.

Want to see:

- If you can explain the difference between declarative and imperative code.
- How you structure UIs using React’s declarative model.
- If you can refactor imperative code to declarative patterns.

---

✅ **Answer Framework**

1. **Declarative vs. Imperative**

   - Declarative: describe what UI should look like (React, JSX)
   - Imperative: describe how to update UI step by step (DOM APIs)
   - React encourages declarative: state drives UI, not manual DOM updates

2. **Actionable Checklist**
   - Use state/props to drive rendering
   - Avoid manual DOM manipulation (except refs/effects)
   - Refactor imperative code to declarative patterns
   - Practice with conditional rendering, lists, derived state
   - Explain benefits: less error-prone, easier to reason about, more maintainable

---

✅ **Example Content / Model Answer**

> “React is declarative: I describe what the UI should look like based on state, and React updates the DOM. I avoid manual DOM manipulation and use state/props to drive rendering. This makes code easier to reason about and maintain. I practice by refactoring imperative code to declarative patterns.”

---

**Pro Tips / Common Pitfalls**

- Don’t use refs for most DOM updates—prefer state-driven rendering.
- Practice explaining declarative vs. imperative to others.
- Use examples to illustrate your points.
