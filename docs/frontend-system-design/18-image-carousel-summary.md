# 18-image-carousel: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design an accessible, performant, and customizable image carousel component.

Want to see:

- If you can break down the system into state, rendering, and navigation.
- How you handle keyboard, mouse, and touch, as well as accessibility.
- If you consider theming, animation, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Display images one at a time, navigation (Prev/Next, dots)
   - Infinite cycling, autoplay, custom transitions
   - Responsive, mobile/desktop, keyboard/touch/mouse
   - Accessibility (WCAG, ARIA, focus)
   - Customization, theming, analytics

2. **Architecture & Data Flow**

   - **Component breakdown:** Carousel root, image, Prev/Next, dots, timer
   - **State management:** Index, timer, loading/error, focus
   - **API:** Props for images, transitions, autoplay, theming, ARIA labels
   - **Rendering:** Flexbox/grid, scroll snap, virtualization for large sets
   - **Performance:** Lazy load, preload, CDN, minimize reflows

3. **Accessibility & Internationalization**

   - Alt text for images, ARIA labels for buttons, focus management
   - Keyboard navigation: Arrow keys, Home/End, tab order
   - Screen reader support, reduced motion, skip links
   - RTL support, localizable labels

4. **Customization, Testing, and Analytics**

   - Theming: CSS variables, theme objects, slot-based composition
   - Custom transitions: slide, fade, zoom, user-provided
   - Analytics hooks for navigation, image load, error
   - Unit/integration/accessibility tests, visual regression

5. **Tradeoffs & Alternatives**
   - Controlled vs. uncontrolled state
   - Flexbox vs. grid for layout
   - Lazy load vs. preload: balance speed and bandwidth
   - SSR/SSG support for static sites

---

✅ **Example Content / Model Answer**

> “For an image carousel, I’d use a root component with state for index, lazy load images, and support keyboard/touch navigation. Alt text and ARIA for accessibility. Theming via CSS variables, custom transitions via props. Tradeoff: lazy load saves bandwidth, but preload improves UX. Virtualize for large sets.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget alt text, ARIA, and keyboard navigation.
- Test with screen readers, RTL, and large image sets.
- Optimize for performance and mobile UX.
