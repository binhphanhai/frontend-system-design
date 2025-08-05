# 08-event-handling: Summary

---

**Interviewer’s Intention**  
Goal: Assess your understanding of React’s event system and your ability to handle events in a robust, accessible way.

Want to see:

- If you can explain React’s synthetic event system and event delegation.
- How you handle common events (click, change, submit, keyboard, etc.).
- If you consider accessibility, performance, and best practices.

---

✅ **Answer Framework**

1. **React Event System**

   - Synthetic events: cross-browser normalization, event pooling
   - Event delegation: events attached at root, bubble up
   - Supported events: mouse, keyboard, form, focus, clipboard, etc.

2. **Handling Events**

   - Use camelCase for event props (onClick, onChange)
   - Pass event handler functions, avoid inline arrow functions for performance
   - Use event.preventDefault(), event.stopPropagation() as needed
   - Access event.target, event.currentTarget for context

3. **Accessibility & Performance**

   - Keyboard events for accessibility (onKeyDown, onKeyUp)
   - Focus management, ARIA roles for interactive elements
   - Debounce/throttle high-frequency events (scroll, resize)
   - Avoid unnecessary re-renders in event handlers

4. **Actionable Checklist**
   - Use synthetic events for cross-browser support
   - Handle all relevant events for your component
   - Ensure accessibility with keyboard/focus events
   - Optimize event handlers for performance
   - Test with screen readers and keyboard navigation

---

✅ **Example Content / Model Answer**

> “React uses a synthetic event system for cross-browser support and event delegation. I handle events using camelCase props, manage accessibility with keyboard/focus events, and optimize handlers for performance. I test with screen readers and ensure all interactive elements are accessible.”

---

**Pro Tips / Common Pitfalls**

- Don’t use inline arrow functions in render for handlers.
- Always consider accessibility for interactive elements.
- Test event handling with keyboard and assistive tech.
