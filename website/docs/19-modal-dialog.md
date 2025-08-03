# Modal Dialog System Design

*System design interview question: Design a modal/dialog component that shows content in a window overlaying the page.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Architecture & High-Level Design](#architecture--high-level-design)
4. [Data Model](#data-model)
5. [Interface Definition (API)](#interface-definition-api)
6. [Optimizations and Deep Dive](#optimizations-and-deep-dive)
7. [Accessibility (a11y)](#accessibility-a11y)
8. [Internationalization (i18n)](#internationalization-i18n)
9. [Customization, Theming, and Extensibility](#customization-theming-and-extensibility)
10. [Performance, Security, and Testing](#performance-security-and-testing)
11. [Stacked Modals & Advanced Topics](#stacked-modals--advanced-topics)
12. [References](#references)

---

## 1. Overview

Modal dialogs are essential UI components for displaying content in a window overlaying the main page. They are used for confirmations, forms, alerts, onboarding, and more. A robust modal must be accessible, customizable, performant, secure, and work across all devices and locales. This document provides a deep technical dive into the architecture, data model, APIs, rendering, accessibility, real-world trade-offs, and production considerations for building a modern, enterprise-grade modal dialog component.

![Modal Dialog Example](https://www.gfecdn.net/img/questions/modal-dialog/modal-dialog-example.png)

**Real-life Examples:**
- [Bootstrap Modal](https://getbootstrap.com/docs/5.3/components/modal)
- [Material UI Modal](https://mui.com/material-ui/react-modal/)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)

---

## 2. Requirements Exploration

### Core Features
- Overlay window that displays content above the main page
- Customizable content (header, body, footer)
- Support for close buttons, titles, and footer actions
- Customizable appearance (colors, fonts, padding, etc.)
- Works on all devices: mobile, tablet, desktop
- Support for keyboard, mouse, and touch interactions
- Focus management and accessibility
- Theming and branding support
- Support for controlled and uncontrolled usage
- Support for SSR/SSG (server-side rendering/static site generation)

### Advanced/Optional Features
- Animation and transitions (fade, slide, scale)
- Scroll locking and background interaction prevention
- Portal rendering and z-index management
- Stacked modals (multiple open at once)
- Customizable overlay and close behavior
- Analytics hooks for open/close, action events
- Security and XSS prevention in user content
- Integration with design systems and theming
- RTL (right-to-left) support
- Accessibility (WCAG, ARIA, keyboard, screen reader)
- Error handling and fallback UI

### Flexibility
- Users can customize modal structure and content
- Optional built-in support for header, footer, close button
- Customizable via props, className, theme, or style
- Slot-based composition for advanced use cases

---

## 3. Architecture & High-Level Design

### Component Structure
A modal dialog typically consists of:
- **Modal Root (`<Modal>`)**: Coordinates events and state, provides context
- **Modal Overlay**: Dims the background, blocks interaction
- **Modal Header (`<Modal.Header>`)**: Title and close button
- **Modal Body (`<Modal.Body>`)**: Main content
- **Modal Footer (`<Modal.Footer>`)**: Actions (e.g., Close, Confirm)

**Example React Usage:**
```jsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>My Modal Title</Modal.Header>
  <Modal.Body>
    <p>Modal body text goes here.</p>
  </Modal.Body>
  <Modal.Footer>
    <button onClick={handleClose}>Close</button>
    <button>Confirm</button>
  </Modal.Footer>
</Modal>
```

**Component Roles Table:**
| Component         | Role                                                        |
|-------------------|-------------------------------------------------------------|
| Modal Root        | Coordinates events, provides context, manages open/close     |
| Modal Overlay     | Renders background overlay, dims page, blocks interaction    |
| Modal Header      | Top section, contains title and close button                |
| Modal Body        | Main content area                                          |
| Modal Footer      | Bottom section, contains actions (close, submit, etc.)      |

### Event Handling & Context
- Use React Context to provide config/options to all child components
- Decouple trigger source from modal contents (can be opened by user or background action)
- Controlled component: open/close state managed outside the modal
- Support for imperative open/close via refs or context

### Portal Rendering
- Render modal outside parent DOM hierarchy (e.g., via React Portals)
- Prevents parent styles (overflow, z-index) from interfering with modal
- Allows stacking and global z-index management

---

## 4. Data Model

### State
| State                | Type         | Description                                                      |
|----------------------|--------------|------------------------------------------------------------------|
| previousFocusElement | HTMLElement  | Element in focus before modal was shown (for focus return)       |
| isOpen               | boolean      | Whether the modal is open or closed                              |
| animationState       | string       | 'entering', 'entered', 'exiting', 'exited' (for transitions)     |
| stackIndex           | number       | Index in modal stack (for stacked modals)                        |

### Configuration (Props)
| Prop         | Type                | Description                                                      |
|--------------|---------------------|------------------------------------------------------------------|
| isOpen       | boolean             | Whether the modal is open or closed                              |
| onClose      | Function            | Callback when modal is closed (close button, Esc, overlay click) |
| maxHeight    | number/undefined    | Max height of modal (default ~80% viewport height)               |
| width        | number/undefined    | Width of modal (default 500-600px)                               |
| children     | React.Node          | Modal content (header, body, footer)                             |
| as           | string/Component    | Custom underlying DOM element/component                          |
| className    | string              | Custom class names for styling                                   |
| overlayClassName | string           | Custom class for overlay                                        |
| closeOnOverlayClick | boolean       | Whether clicking overlay closes modal                            |
| closeOnEsc   | boolean             | Whether Esc key closes modal                                     |
| animation    | string/object       | Animation type or config                                         |
| theme        | string/object       | Theming options                                                  |

#### Example TypeScript Types
```ts
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxHeight?: number;
  width?: number;
  as?: string | React.ComponentType;
  className?: string;
  overlayClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | object;
  theme?: string | object;
  children: React.ReactNode;
}
```

---

## 5. Interface Definition (API)

### General Props
| Prop        | Type                | Description                                      |
|-------------|---------------------|--------------------------------------------------|
| children    | React.Node          | Children of the component                        |
| as          | string/Component    | Custom DOM element/component                     |
| className   | string              | Custom class names for styling                   |

### Modal Root (`<Modal>`) Props
| Prop      | Type      | Description                                                      |
|-----------|-----------|------------------------------------------------------------------|
| isOpen    | boolean   | Whether the modal is open or closed                              |
| onClose   | Function  | Callback when modal is closed                                    |
| maxHeight | number    | Max height of modal (default ~80% viewport height)               |
| width     | number    | Width of modal (default 500-600px)                               |
| overlayClassName | string | Custom class for overlay                                      |
| closeOnOverlayClick | boolean | Whether clicking overlay closes modal                      |
| closeOnEsc | boolean | Whether Esc key closes modal                                     |
| animation | string/object | Animation type or config                                     |
| theme     | string/object | Theming options                                              |

### Header, Body, Footer
- Usually only require `children` prop
- Can accept `as`, `className`, and style props for customization

### Customizing Appearance
- Customization via className, theme, or style props
- Most content is user-provided, so default styling is minimal
- Support for design tokens, CSS variables, or theme objects

---

## 6. Optimizations and Deep Dive

### Rendering Outside DOM Hierarchy
- Modals must render outside parent DOM hierarchy to avoid clipping (e.g., via React Portals)
- Prevents parent styles (overflow, z-index) from interfering with modal
- Allows stacking and global z-index management

**Example:**
```js
import { createPortal } from 'react-dom';
createPortal(<ModalContents />, document.body);
```

### Overlay Implementation
- Overlay/backdrop dims the page and blocks interaction
- CSS example:
```css
.modal-overlay {
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 1000;
}
```

### Centering the Modal
- Use flexbox to center modal contents within overlay
```css
.modal-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
```

### Maximum Height and Scroll Lock
- Set max height for modal, make body scrollable if content overflows
- Lock background scroll when modal is open (`body { overflow: hidden; }`)
- Consider iOS quirks (e.g., overscroll, viewport units)

### Rendering Strategies
- Render modal in HTML (hidden by default) or dynamically via JS
- Pre-rendering: better performance, but can bloat HTML
- Dynamic: less HTML, but more DOM operations
- SSR/SSG: Ensure modal does not break hydration

### Animations and Transitions
- Animate overlay and modal contents independently (fade, slide, scale)
- Use React Transition Group, Framer Motion, or CSS transitions
- Animate entrance and exit (handle unmounting for exit transitions)
- Respect user preferences for reduced motion
- Example animation config:
```js
const animation = {
  enter: { opacity: 1, transform: 'scale(1)' },
  exit: { opacity: 0, transform: 'scale(0.95)' },
  duration: 200
};
```

### Scroll Lock and Focus Trap
- Add `overflow: hidden` to `<body>` when modal is open
- Use libraries like `body-scroll-lock` for cross-browser support
- Trap focus within modal (see Accessibility section)

### Z-Index and Layering
- Use high z-index for modal overlay and contents
- Manage stacking context for multiple modals
- Consider portal root stacking for integration with other overlays (dropdowns, tooltips)

---

## 7. Accessibility (a11y)

### Mouse Interactions
- Clicking overlay closes modal (but not clicks inside modal)
- Remove event listeners when modal closes
- Support for pointer events and touch devices

### Focus Management
- Trap focus within modal (focus trap)
- On open: save previous focus, move focus to modal
- On close: return focus to previous element
- Use libraries like [focus-trap](https://focus-trap.github.io/focus-trap/) or [react-focus-lock](https://github.com/theKashey/react-focus-lock)
- Example focus trap logic:
```js
function trapFocus(modalRef) {
  const focusableEls = modalRef.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  // ...cycle focus logic
}
```

### Keyboard Interactions
| Key         | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| Tab         | Move focus to next tabbable element in modal                                |
| Shift+Tab   | Move focus to previous tabbable element in modal                            |
| Esc         | Close modal                                                                |
| Arrow Keys  | (Optional) Navigate between modal actions                                   |

### WAI-ARIA Roles and Properties
- Modal container: `role="dialog"`, `aria-modal="true"`
- Label modal with `aria-labelledby` (title) or `aria-label`
- Optionally use `aria-describedby` for additional context
- All modal content should be descendants of the dialog
- Hide background content from screen readers (e.g., `aria-hidden`)

### Native `<dialog>` Element
- Native HTML dialog element provides some accessibility features
- Still requires manual focus management and is not fully supported everywhere
- Polyfills may be needed for legacy browsers

### Best Practices
- Ensure all actions are accessible via keyboard
- Provide visible focus indicators
- Announce modal open/close to screen readers (ARIA live regions)
- Avoid auto-focusing elements that disrupt user flow
- Test with screen readers (NVDA, JAWS, VoiceOver)

---

## 8. Internationalization (i18n)
- All user-facing strings should be customizable
- Support for long strings (truncate or wrap as needed)
- RTL support: flip layout for right-to-left languages
- Use CSS logical properties (margin-inline, padding-inline)
- Localize all visible text, tooltips, and error messages
- Support for different number/date/currency formats in modal content

![Modal Dialog RTL Example](https://www.gfecdn.net/img/questions/modal-dialog/modal-dialog-rtl.png)

---

## 9. Customization, Theming, and Extensibility
- Theming: Support for CSS variables, theme objects, or design tokens
- Custom transitions: Allow user to provide custom animation logic
- Slot-based composition: Allow custom header, footer, overlay, close button
- Extensible event system: Custom hooks for analytics, logging, etc.
- Integration: Compatible with design systems (e.g., Material UI, Chakra)
- SSR/SSG support: Render correctly in Next.js, Gatsby, etc.
- Plugin architecture: Allow for plugins (e.g., alert dialogs, drawers, side panels)
- Support for custom overlays, backgrounds, and close icons

---

## 10. Performance, Security, and Testing
- Defer rendering of modal until needed (lazy mount)
- Minimize re-renders by memoizing modal content
- Optimize for mobile: avoid layout thrashing, use passive event listeners
- Security: prevent XSS in user content, sanitize HTML if rendering raw
- Analytics hooks: Expose events for open, close, action, error
- Error handling: Show fallback UI on error, log errors
- Testing: unit tests for open/close, focus, keyboard, a11y; integration tests for stacking, animation, SSR
- Visual regression: Use Percy, Chromatic, or Storybook
- Performance monitoring: Track open/close latency, animation smoothness

---

## 11. Stacked Modals & Advanced Topics

### Stacked Modals
- Support multiple modals open at once (e.g., modal in modal)
- Overlay per modal level (darker backdrop for higher stack)
- Only topmost modal closes on Esc or overlay click
- Dismissing lower modal can close all above (or make customizable)
- Manage focus and z-index for each modal in stack
- Example stack management:
```ts
interface ModalStackItem {
  id: string;
  zIndex: number;
  onClose: () => void;
}
```

### Advanced Topics
- Tooltips and dropdowns within modals (manage z-index and focus)
- Alert dialogs and ARIA patterns ([Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/))
- Animations: entrance/exit, independent overlay/content transitions
- Performance: avoid unnecessary re-renders, optimize for mobile
- Security: prevent XSS in user content, avoid leaking focus
- SSR/SSG: Hydration-safe modal rendering
- Testing: unit/integration tests for open/close, focus, keyboard, a11y
- Anti-patterns: Avoid modals for critical flows, avoid nested modals unless necessary

---

## 12. References
- [Bootstrap Modal](https://getbootstrap.com/docs/5.3/components/modal)
- [Material UI Modal](https://mui.com/material-ui/react-modal/)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Reach UI Dialog](https://reach.tech/dialog)
- [Headless UI Dialog](https://headlessui.com/react/dialog)
- [WAI-ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI-ARIA Alert Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)
- [MDN: dialog element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [focus-trap](https://focus-trap.github.io/focus-trap/)
- [react-focus-lock](https://github.com/theKashey/react-focus-lock)
- [body-scroll-lock](https://github.com/willmcpo/body-scroll-lock)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern modal dialog component. It covers architecture, data modeling, API, rendering, accessibility, customization, performance, security, analytics, testing, advanced topics, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.