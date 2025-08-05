# 17-dropdown-menu: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design an accessible, customizable, and robust dropdown menu component.

Want to see:

- If you can break down the system into state, rendering, and accessibility.
- How you handle keyboard, mouse, and touch interactions.
- If you consider theming, RTL, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Reveal a menu of actions, multiple open at once
   - Keyboard, mouse, and touch support
   - Customizable: colors, icons, animation, RTL
   - Accessibility (ARIA, focus, keyboard)
   - Performance, security, analytics

2. **Architecture & Data Flow**

   - **Component breakdown:** DropdownMenu, Button, List, Item
   - **State management:** Root manages open/close, active item, config (context)
   - **Rendering:** Relative to button (simple) or portal to body (avoids clipping)
   - **Positioning:** Autoflipping, max height, scrollable, customizable
   - **API:** Props for customization, theming, animation, direction

3. **Accessibility & Internationalization**

   - ARIA roles: button (`aria-haspopup`), menu (`role="menu"`), items (`role="menuitem"`)
   - Keyboard: Enter/Space to open, Arrow keys to navigate, Esc to close
   - Focus trap, return focus to button, visible indicators
   - RTL support, localizable labels, tooltips

4. **Customization, Performance, and Security**

   - Theming: CSS variables, theme provider, dark/light mode
   - Animation: fade, slide, scale, custom transitions
   - Virtualize long lists, code splitting for menu logic
   - Prevent XSS in labels, sanitize content
   - Analytics: track open/close, item selection

5. **Tradeoffs & Alternatives**
   - HTML vs. JS rendering: HTML is faster, JS is lighter
   - Relative vs. portal rendering: portal avoids clipping but needs position recalculation
   - Controlled vs. uncontrolled open state
   - Static vs. dynamic items (API fetch)

---

✅ **Example Content / Model Answer**

> “For a dropdown menu, I’d use a root component with context for state, render menu as a portal to avoid clipping, and support ARIA roles for accessibility. Keyboard, mouse, and touch are all supported. Theming via CSS variables, animation via props. Tradeoff: portal rendering is more robust but needs position logic. Virtualize long lists for performance.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget ARIA, focus management, and keyboard support.
- Test with screen readers, RTL, and long lists.
- Sanitize all user-provided content.
