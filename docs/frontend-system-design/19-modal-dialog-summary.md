# 19-modal-dialog: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design an accessible, customizable, and robust modal dialog component.

Want to see:

- If you can break down the system into overlay, content, and focus management.
- How you handle keyboard, mouse, and touch, as well as accessibility.
- If you consider theming, stacking, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Overlay window, customizable content (header, body, footer)
   - Close buttons, focus management, keyboard/mouse/touch
   - Theming, animation, stacking (multiple modals)
   - Accessibility (WCAG, ARIA, focus trap)
   - SSR/SSG support, security, analytics

2. **Architecture & Data Flow**

   - **Component breakdown:** Modal root, overlay, header, body, footer
   - **State management:** Open/close, animation, stack index, focus
   - **Portal rendering:** Render outside parent DOM, manage z-index
   - **API:** Props for open, close, animation, theming, overlay, stacking

3. **Accessibility & Internationalization**

   - ARIA roles: dialog, aria-modal, aria-labelledby/label
   - Focus trap, return focus on close, keyboard navigation (Tab, Esc)
   - Screen reader support, visible focus indicators
   - RTL support, localizable strings, tooltips

4. **Customization, Performance, and Security**

   - Theming: CSS variables, theme objects, slot-based composition
   - Animation: fade, slide, scale, custom transitions
   - Security: sanitize content, prevent XSS
   - Analytics: open/close events, error logging
   - Unit/integration/accessibility tests, visual regression

5. **Tradeoffs & Alternatives**
   - Portal vs. inline rendering: portal avoids clipping, but needs position logic
   - Controlled vs. uncontrolled open state
   - Native `<dialog>` vs. custom: native is simpler, but less flexible
   - Stacked modals: manage focus/z-index for multiple modals

---

✅ **Example Content / Model Answer**

> "For a modal dialog, I'd use a root component with portal rendering, focus trap, and ARIA roles for accessibility. Theming via CSS variables, animation via props. Support stacking for multiple modals. Tradeoff: portal rendering is more robust, but needs z-index and focus management. Native `<dialog>` is simpler, but less customizable."

---

**Pro Tips / Common Pitfalls**

- Don’t forget ARIA, focus trap, and keyboard navigation.
- Test with screen readers, RTL, and stacked modals.
- Sanitize all user-provided content.
