# API Design Principles for UI Components

*Best practices for designing developer interface component APIs, useful for UI components coding and system design interviews*


---

User Interface component libraries like [Bootstrap](https://getbootstrap.com/) and [Material UI](https://mui.com/) help developers build UI faster by providing commonly used components like buttons, tabs, modals, etc., so that developers do not have to reinvent the wheel by building these components from scratch whenever they start on a new project.

Often during front end interviews, you will be asked to build UI components and design an API to initialize them. Designing good component APIs is bread and butter for Front End Engineers. This page covers some of the top tips and best practices for designing UI component APIs. Some of these tips may be framework-specific but can be generalized for other component-based UI frameworks.

---

## Initialization
There are multiple ways to initialize a UI component:

### jQuery-style
Before modern JavaScript UI libraries/frameworks like [React](https://react.dev/), [Angular](https://angular.io/), and [Vue](https://vuejs.org/) came into the picture, [jQuery](https://jquery.com/) (and [jQuery UI](https://jqueryui.com/)) was the most popular way to build UI. jQuery UI popularized the idea of initializing UI components via "constructors" which involved two arguments:

1. **Root element**: A root DOM element to render the contents
2. **Customization options**: Optional, additional, customization options usually in the form of a plain JavaScript object

Example:
```html
<div id="gfe-slider"></div>
<script>
  $('#gfe-slider').slider();
</script>
```

The slider can be customized by passing in a plain JavaScript object of options:
```html
<div id="gfe-slider"></div>
<script>
  $('#gfe-slider').slider({
    animate: true,
    max: 50,
    min: 10,
    // See other options here: https://api.jqueryui.com/slider/
  });
</script>
```

### Vanilla JavaScript style
There's no vanilla JavaScript standard for initializing components, but a common pattern is similar to jQuery's:
```js
function slider(rootEl, options) {
  // Do something with rootEl and options.
}
```

### React (Or similar component-based libraries)
React forces you to write UI as components where the logic and structure is contained within. React components are JavaScript functions that return markup, a description of how to render itself. Components can take in `props`, which are essentially customization options for a component.

```jsx
function Slider({ min, max }) {
  // Use the props to render a customized component.
  return <div>...</div>;
}

<Slider max={50} min={10} />;
```

To render the element into the page, a separate API is used:
```js
import { createRoot } from 'react-dom/client';
import Slider from './Slider';

const domNode = document.getElementById('#gfe-slider');
const root = createRoot(domNode);
root.render(<Slider max={50} min={10} />);
```

---

## Customizing Appearance
Even though UI components in UI libraries provide default styling, developers will usually want to customize them with their company/product's branding and theme colors. Most UI components (especially those built as 3rd-party libraries) allow for customization of the appearance via several methods:

### Class Injection
Components accept a prop/option to allow the developer to provide their own classes, which are added to the actual DOM elements. This approach is not very robust because if the component also adds its own styling via classes, there could be conflicting properties within the component's classes and developer-provided classes.

#### React Example
```jsx
import clsx from 'clsx';
function Slider({ className, value }) {
  return (
    <div className={clsx('gfe-slider', className)}>
      <input type="range" value={value} />
    </div>
  );
}
<Slider className="my-custom-slider" value={50} />;
```

```css
/* UI library default stylesheet */
.gfe-slider { height: 12px; }
/* Developer's custom stylesheet */
.my-custom-slider { color: red; }
```

If there are many DOM elements within the component to be targeted, you can also have multiple differently-named props for `className`s of different elements.

#### jQuery Example
In jQuery, classes can also be passed as a field on the options:
```js
$('#gfe-slider').slider({
  // In reality, jQuery UI takes in a `classes` field instead
  // since there are multiple elements.
  class: 'my-custom-slider',
});
```

jQuery UI's component initializers take in the `classes` field to allow adding additional classes to individual elements:
```js
$('#gfe-slider').slider({
  classes: {
    'ui-slider': 'highlight',
    'ui-slider-handle': 'ui-corner-all',
    'ui-slider-range': 'ui-corner-all ui-widget-header',
  },
});
```

#### Downside: Non-deterministic styling
Class injection can lead to non-deterministic results if multiple classes have conflicting styles and the loading order of stylesheets is not guaranteed. This can lead to hacks like `!important` or increased selector specificity, making CSS unmaintainable.

---

### CSS Selector Hooks
Developers can "hook" into a component's selectors by using published class names or data attributes in their stylesheets. If UI library authors make these selectors part of their API and guarantee their stability, this is an acceptable practice.

Example:
```jsx
function Slider({ label, value }) {
  const id = useId();
  return (
    <div className="gfe-slider">
      <label className="gfe-slider-label" htmlFor={id}>{label}</label>
      <input className="gfe-slider-range" id={id} type="range" value={value} />
    </div>
  );
}
```
```css
.gfe-slider { font-size: 12px; }
.gfe-slider-label { color: red; }
.gfe-slider-range { height: 20px; }
```

[Reach UI](https://reach.tech/styling) uses `data-reach-*` attributes for styling hooks:
```css
[data-reach-menu-item] { color: blue; }
```

---

### Theme Object
Instead of taking in classes, the component takes in an object of key/values for styling. This is useful if there is only a strict subset of properties to customize, or if you want to restrict styling to only a few properties.

```jsx
const defaultTheme = { color: 'black', height: 12 };
function Slider({ value, label, theme }) {
  const mergedTheme = { ...defaultTheme, ...theme };
  return (
    <div className="gfe-slider">
      <label style={{ color: mergedTheme.color }}>{label}</label>
      <input type="range" value={value} style={{ height: mergedTheme.height }} />
    </div>
  );
}
<Slider theme={{ color: 'red', height: 24 }} {...props} />;
```

---

### CSS Preprocessor Compilation
UI libraries are often written with CSS preprocessors like [Sass](https://sass-lang.com/) and [Less](https://lesscss.org/). [Bootstrap](https://getbootstrap.com/) is written with Sass and provides a way to [customize the Sass variables](https://getbootstrap.com/docs/5.3/customize/sass/) used so that developers can generate a custom UI library stylesheet. This approach avoids selector overrides and results in less CSS, but requires a compilation step.

---

### CSS Variables / Custom Properties
[CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) (custom properties) are entities defined by CSS authors that contain specific values to be reused throughout a document. The `var()` function accepts fallback values if the given variable is not set.

```jsx
function Slider({ value, label }) {
  return (
    <div className="gfe-slider">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="range" value={value} />
    </div>
  );
}
```
```css
.gfe-slider {
  font-size: var(--gfe-slider-font-size, 12px);
}
:root {
  --gfe-slider-font-size: 15px;
}
```

---

### Render Props
In React, render props are function props that a component uses to know what to render. It is useful for separating behavior from presentation. Many behavioral/headless UI libraries like [Radix](https://www.radix-ui.com/), [Headless UI](https://headlessui.com/), and [Reach UI](https://reach.tech/menu-button) make heavy use of render props.

---

## Internationalization (i18n)
Does your UI work for multiple languages? How easy is it to add support for more languages?

### Avoid hardcoding of labels in a certain language
Some UI components have label strings within them (e.g. image carousel has labels for prev/next buttons). It'd be good to allow customization of these label strings by making them part of component props/options.

### Right-to-left languages
Some languages (e.g. Arabic, Hebrew) are read from right-to-left and the UI has to be flipped horizontally. The component can take in a `direction` prop/option and change the order of how elements are rendered. For example, the prev and next buttons will be on the right and left respectively in an RTL language.

Use [CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties) to futureproof your styles and let your layout work for different [writing modes](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Writing_Modes).