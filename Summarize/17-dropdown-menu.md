# Dropdown Menu System Design

*System design interview question: Design a dropdown menu component that can reveal a menu containing a list of actions.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Architecture & High-Level Design](#architecture--high-level-design)
4. [Data Model](#data-model)
5. [Interface Definition (API)](#interface-definition-api)
6. [Rendering, Positioning, and State Management](#rendering-positioning-and-state-management)
7. [Accessibility (a11y)](#accessibility-a11y)
8. [Customization, Theming, and Animation](#customization-theming-and-animation)
9. [Performance, Security, and Analytics](#performance-security-and-analytics)
10. [Internationalization (i18n)](#internationalization-i18n)
11. [References](#references)

---

## 1. Overview

Dropdown menus are a fundamental UI component for revealing a list of actions or options. They are used in navigation bars, toolbars, context menus, and more. A robust dropdown menu must be accessible, customizable, performant, and work across all devices. This document provides a deep, technical dive into the architecture, data model, APIs, rendering, accessibility, customization, and real-world trade-offs for building a modern dropdown menu component.

![Dropdown Menu Example](https://www.gfecdn.net/img/questions/dropdown-menu/dropdown-menu-example.png)

---

## 2. Requirements Exploration

### Core Features
- Reveal a menu containing a list of actions
- Multiple dropdowns can be open at once
- Menu contains only text (no focusable elements inside items)
- No fixed maximum number of items, but UX best with <20
- Customizable: colors, fonts, padding, icons, animation, etc. for branding
- Works on all devices: mobile, tablet, desktop
- Keyboard, mouse, and touch support
- Support for right-to-left (RTL) languages
- Menu can be opened by click, tap, or keyboard
- Menu closes on outside click, escape, or item selection

### Real-Life Examples
- [Bootstrap Dropdowns](https://getbootstrap.com/docs/5.3/components/dropdowns)
- [Material UI Menu](https://mui.com/material-ui/react-menu/)
- [Radix UI Dropdown Menu](https://www.radix-ui.com/docs/primitives/components/dropdown-menu)

---

## 3. Architecture & High-Level Design

### Example Usage (React)
```jsx
<DropdownMenu>
  <DropdownMenu.Button>Actions</DropdownMenu.Button>
  <DropdownMenu.List>
    <DropdownMenu.Item>New File</DropdownMenu.Item>
    <DropdownMenu.Item>Save</DropdownMenu.Item>
    <DropdownMenu.Item>Delete</DropdownMenu.Item>
  </DropdownMenu.List>
</DropdownMenu>
```

### Component Roles
| Component                | Role                                                                 |
|--------------------------|----------------------------------------------------------------------|
| DropdownMenu             | Root, coordinates events, provides context, manages state            |
| DropdownMenu.Button      | Button that toggles menu open/close                                   |
| DropdownMenu.List        | Contains the list of items                                            |
| DropdownMenu.Item        | Individual list items                                                 |

- Use React context to share state (open, active item, config) between components
- Context provider in `<DropdownMenu>` supplies state to children
- State and event handlers are colocated for predictable updates

---

## 4. Data Model

| State      | Type     | Description                                                                 |
|------------|----------|-----------------------------------------------------------------------------|
| isOpen     | boolean  | Whether the menu is currently open or closed                                |
| activeItem | string   | Menu item that is focused (for keyboard/hover navigation)                   |
| items      | array    | List of menu items (text, value, disabled, icon, etc.)                      |
| config     | object   | Customization options (theme, size, direction, animation, etc.)             |

- State is managed in `<DropdownMenu>` and provided via context
- Configuration options (customization) are also part of the data model
- Items can be static or dynamic (fetched from API)

---

## 5. Interface Definition (API)

### General Props
| Prop       | Type                | Description                                                        |
|------------|---------------------|--------------------------------------------------------------------|
| children   | React.Node          | Children of the component                                          |
| as         | string  | Component | Customize underlying DOM element/component                        |
| className  | string              | Custom classnames for styling                                      |

### DropdownMenu
| Prop            | Type     | Description                                      |
|-----------------|----------|--------------------------------------------------|
| isInitiallyOpen | boolean  | Whether the menu is initially open or closed      |
| size            | string   | Customize size (optional)                         |
| direction       | string   | 'ltr' or 'rtl' for language support               |
| theme           | string   | Theme name or object for theming                  |

### DropdownMenu.Button
| Prop      | Type      | Description                                                        |
|-----------|-----------|--------------------------------------------------------------------|
| onClick   | function  | Additional logic on click (analytics, etc.)                         |
| ...button | *         | All standard `<button>` props (e.g., disabled)                      |

### DropdownMenu.List
| Prop      | Type                | Description                                                        |
|-----------|---------------------|--------------------------------------------------------------------|
| maxHeight | number  | undefined | Max height of menu list (default 200-300px)                        |
| position  | string              | Position of list relative to button                                 |
| animation | string              | Animation style (fade, slide, scale, etc.)                          |

### DropdownMenu.Item
| Prop      | Type      | Description                                                        |
|-----------|-----------|--------------------------------------------------------------------|
| onClick   | function  | Triggered when item is activated                                    |
| disabled  | boolean   | Whether item is disabled (skipped in keyboard navigation)            |
| icon      | React.Node| Optional icon for the item                                           |

### Customizing Appearance
- Customization via props, className, CSS variables, or theme provider
- See [UI Components API Design Principles](https://frontendinterviewhandbook.com/user-interface-components-api-design-principles)

---

## 6. Rendering, Positioning, and State Management

### Rendering
- **Relative to Button:**
  - Menu is absolutely positioned relative to a parent `<div>` with `position: relative`
  - Simple, but can be clipped by parent with `overflow: hidden` or have z-index issues
  - Used by [Headless UI](https://headlessui.com/react/menu), [Bootstrap](https://getbootstrap.com/docs/5.3/components/dropdowns/)
- **Relative to Page (Portal):**
  - Menu is rendered as a child of `<body>`, positioned absolutely to the page
  - Use [React Portal](https://react.dev/reference/react-dom/createPortal)
  - Avoids clipping/z-index issues, but must recalculate position on resize/scroll
  - Used by [Radix UI](https://www.radix-ui.com/docs/primitives/components/dropdown-menu), [Reach UI](https://reach.tech/menu-button)

### Positioning
- Support alignment in all directions (top, bottom, left, right)
- Customizable via `position` prop
- Example: left/right-aligned menus
- **Automatic Flipping:**
  - Menu flips if not enough space below button (autoflipping)
  - Calculate menu position using `window.innerHeight`, `getBoundingClientRect()`
  - ![Dropdown Menu Autoflipping example](https://www.gfecdn.net/img/questions/dropdown-menu/dropdown-menu-autoflip.png)
  - Optionally, disable window scroll when menu is open (Material UI)

### Maximum Height
- Default max height (200-300px), scrollable if more items
- Customizable via `maxHeight` prop

### Rendering in HTML vs. JavaScript
- **HTML:** Menu is in DOM, hidden via `display: none`/`opacity: 0` until shown
- **JS:** Menu is rendered on demand when opened
- HTML approach is better for performance, JS for lighter DOM

### State Management
- State colocated in root, shared via context
- Menu open/close state, active item, focus management
- Support for controlled/uncontrolled open state
- Support for multiple open menus (independent state)

---

## 7. Accessibility (a11y)

### Mouse Interactions
- Click button toggles menu
- Click outside closes menu (except clicks inside menu/button)
- Use event listeners to detect outside clicks

### Touch Interactions
- Tap to open/close menu
- Tap outside to close
- Support for touch devices (mobile/tablet)

### Focus Management
- Trap focus in menu when open
- Return focus to button when closed
- Focus indicators for all interactive elements

### Keyboard Interactions
- **Button:**
  - Enter/Space: Open menu, focus first item
  - ArrowDown/ArrowUp: Open menu, focus first/last item
- **Menu:**
  - Enter/Space: Activate item, close menu
  - ArrowDown/ArrowUp: Move focus, wrap if needed
  - Home/End: Jump to first/last item
  - Esc: Close menu, return focus to button

### WAI-ARIA Roles, States, and Properties
- Button: `role="button"`, `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`
- Menu: `role="menu"`, `aria-labelledby` or `aria-label`
- Menu items: `role="menuitem"`, `aria-disabled` if disabled

---

## 8. Customization, Theming, and Animation
- **Customizable appearance:** Colors, fonts, padding, border, icons, etc.
- **Theming:** Support for dark/light mode, theme provider, CSS variables
- **Animation:** Fade, slide, scale, or custom transitions for menu open/close
- **Icon support:** Optional icons for menu items
- **Responsive design:** Adapts to device size, touch targets

---

## 9. Performance, Security, and Analytics
- **Performance:**
  - Minimize DOM nodes, lazy render menus
  - Virtualize long lists if >20 items
  - Code splitting for menu logic
- **Security:**
  - Prevent XSS in menu item labels
  - Sanitize user-provided content
  - Avoid leaking sensitive data in menu
- **Analytics:**
  - Track menu open/close, item selection
  - A/B test menu placement, animation, item order

---

## 10. Internationalization (i18n)
- User-facing strings can be long in some languages; truncate or wrap as needed
- For RTL languages, flip menu/button horizontally (via `direction` prop)
- All ARIA labels and tooltips should be localizable
- ![Dropdown Menu Right-to-left example](https://www.gfecdn.net/img/questions/dropdown-menu/dropdown-menu-rtl.png)

---

## 11. References
- [Dropdowns · Bootstrap v5.3](https://getbootstrap.com/docs/5.3/components/dropdowns)
- [React Menu component - Material UI](https://mui.com/material-ui/react-menu/)
- [Dropdown Menu — Radix UI](https://www.radix-ui.com/docs/primitives/components/dropdown-menu)
- [Menu Button — Reach UI](https://reach.tech/menu-button)
- [Menu (Dropdown) - Headless UI](https://headlessui.com/react/menu)
- [Menu Button Pattern (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/)
- [Menu Pattern (WAI-ARIA)](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern dropdown menu component. It covers architectural decisions, data modeling, API, rendering, accessibility, customization, internationalization, security, analytics, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.