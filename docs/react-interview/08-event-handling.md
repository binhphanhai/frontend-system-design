# Event Handling in React Interviews

*Guide to React's synthetic event system, covering best practices for handling, intercepting, and optimizing mouse, input, form, focus, and keyboard events for interview success*

---

---

React uses a **synthetic event system** to provide a consistent way to handle events across different browsers. Unlike native JavaScript events, React wraps native events into a standardized object called `SyntheticEvent`, which improves performance and ensures cross-browser compatibility.

---

## How React Handles Events

React's synthetic event system provides consistency across different browsers and optimizations for performance.

- **Vanilla JS:**
  ```js
  document.getElementById('btn').addEventListener('click', (event) => {
    console.log('Clicked!');
  });
  ```
- **React:**
  ```jsx
  <button onClick={() => console.log('Clicked!')}>Click Me</button>
  ```

React uses event delegation: events are attached to the root of the React application (not the document root) instead of individual elements to improve performance.

React wraps native events into a `SyntheticEvent` for efficiency and compatibility. Like event listeners in vanilla JavaScript, React's `SyntheticEvent`s are passed as the first argument to event handler callbacks. For the most part, they can be treated as raw browser `Event` objects and [Event attributes and methods](https://developer.mozilla.org/en-US/docs/Web/API/Event) can also be accessed on the `SyntheticEvent`.

```jsx
function handleClick(event) {
  console.log(event); // React SyntheticEvent
  console.log(event.nativeEvent); // Native browser event
  console.log(event.target); // <button>...</button>
}

<button onClick={handleClick}>Click me</button>;
```

Further reading: [Responding to Events](https://react.dev/learn/responding-to-events)

---

## Event Handlers in React

Event handlers in React are functions that respond to user interactions, such as clicks, key presses, form submissions, or mouse movements.

### Mouse Events

Mouse event handlers fire when users interact with the mouse (clicks, hovers, etc.). Mouse events can be added to most elements but for accessibility purposes, certain handlers like `onClick` should only be added to interactive elements such as `<button>`, `<a>`, `<input>`; otherwise, screen reader users will not be able to trigger those interactions.

Mouse event handlers receive the [`MouseEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) argument.

```jsx
function ClickButton() {
  function handleClick() {
    alert('Button clicked!');
  }
  return <button onClick={handleClick}>Click me</button>;
}
```

You should know the following mouse events:
- `onClick`: Fires when an element is clicked (mousedown + mouseup). Commonly used in interviews
- `onMouseEnter`: Fires when the mouse enters an element. Does not bubble (useful for hover interactions)
- `onMouseLeave`: Fires when the mouse leaves an element. Does not bubble
- `onMouseOver`: Fires when the mouse enters an element or its children. Does bubble
- `onMouseOut`: Fires when the mouse leaves an element or its children. Does bubble
- `onMouseDown`: Fires when the mouse button is pressed down. Rarely used in interviews
- `onMouseUp`: Fires when the mouse button is released. Rarely used in interviews
- `onDoubleClick`: Fires when an element is double-clicked. Rarely used in interviews

**Key difference:** `onMouseEnter`/`onMouseLeave` do **not** [bubble up the DOM](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling), while `onMouseOver`/`onMouseOut` do.

**Accessibility:**
- Do not add `onClick` handlers to non-interactive (non-clickable and non-focusable) elements.
- 90% of the time, use `onClick` only on `<button>`s. `<a href="#" onClick={...}>` is an anti-pattern; use `<button onClick={...}>` and style accordingly.
- For hover styles, prefer CSS's `:hover` pseudo-class over JS event handlers.

---

### Input Events

Input event handlers are fired when user input changes (typing, pasting, etc.) and can be attached on `<input>` and `<textarea>` elements.

Input event handlers receive the [`InputEvent`](https://developer.mozilla.org/en-US/docs/Web/API/InputEvent) as argument.

```jsx
function Foo() {
  const [value, setValue] = useState('');
  return (
    <input
      onChange={event => setValue(event.target.value)}
      value={value}
      placeholder="Type here"
    />
  );
}
```

You should know the following input events:
- `onChange`: Fires when the value of an input changes
- `onInput`: Fires when the user inputs data (similar to `onChange`). Most of the time, use `onChange` instead

#### What's the difference between 'change' and 'input' events?

For most event handlers in React, the `onEventName` attribute is the same as doing `element.addEventListener('eventname', ...)` in the browser. But not for `onChange` and `onInput`!

- The browser `'change'` event is fired when the value is committed (e.g. loses focus):
  - Not fired on every keystroke
  - Works for `<input>`, `<textarea>`, `<select>`, etc
- The browser `'input'` event fires on every input change, including typing, pasting, and voice input:
  - Works in both React and vanilla JS
  - Fires immediately on every character input (like React's `onChange`)
  - Triggers even when using voice input, drag-and-drop, and pasting

**Key differences:**

| Feature                                 | `onChange` (React) | `onInput` |
|-----------------------------------------|:------------------:|:---------:|
| Triggers on every keystroke?            | ✅                 | ✅        |
| Triggers on copy-paste?                 | ✅                 | ✅        |
| Triggers on IME (Chinese, Japanese...)? | ❌ (only on commit)| ✅        |
| Triggers on speech-to-text input?       | ❌ (only on commit)| ✅        |
| Works with `contenteditable`?           | ❌                 | ✅        |
| Detects programmatic value updates?     | ❌                 | ✅        |

When in doubt during interviews, use `onChange`.

---

### Form Events

Form event handlers (`onSubmit` and `onReset`) only work on `<form>` elements.

- `onSubmit` receives the [`SubmitEvent`](https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent) argument
- `onReset` handler receives the generic [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) argument

```jsx
function SimpleForm() {
  const [input, setInput] = useState('');
  function handleSubmit(event) {
    event.preventDefault(); // Prevents page reload
    alert(`Form submitted with: ${input}`);
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter something"
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

You should know the following form events:
- `onSubmit`: Fires when a form is submitted. Only fires when triggered by a `<button type="submit">` or `<input type="submit">` within a `<form>`
- `onReset`: Fires when a form is reset. Only fires when triggered by a `<button type="reset">` or `<input type="reset">` within a `<form>`

Most of the time, you need to do `event.preventDefault()` within the `onSubmit` handler to prevent a full-page refresh.

---

### Focus Events

Focus event handlers work with elements that can receive focus such as form elements and interactive elements like `<input>`, `<textarea>`, `<select>`, `<button>`.

Focus event handlers receive the [`FocusEvent`](https://developer.mozilla.org/en-US/docs/Web/API/FocusEvent) argument.

```jsx
function FocusBlurExample() {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <input
        type="text"
        placeholder="Click to focus..."
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: focused ? '2px solid blue' : '2px solid gray',
          outline: 'none',
          padding: '5px',
        }}
      />
      <p>{focused ? 'Input is focused' : 'Input is blurred'}</p>
    </div>
  );
}
```

You should know the following focus events:
- `onFocus`: Fires when an element gains focus
- `onBlur`: Fires when an element loses focus

While the above example uses `onFocus`/`onBlur` for adding focus styles, it's better to use CSS's `:focus` pseudo-class. There is no need to use JavaScript when CSS is able to do the job.

**Tabbable elements:**
- Elements with `tabIndex` defined become focusable
- Non-focusable elements (like `<div>`, `<span>`, `<p>`) need `tabIndex` to receive focus

| Element type                                 | Supports `onFocus` | Supports `onBlur` | Notes                        |
|----------------------------------------------|:------------------:|:----------------:|------------------------------|
| Form Inputs (`<input>`, `<textarea>`, etc)   | ✅ Yes             | ✅ Yes           | Standard usage               |
| Interactive Elements (`<button>`, `<a>`, etc)| ✅ Yes             | ✅ Yes           | Automatically focusable      |
| Elements with `tabIndex` defined             | ✅ Yes             | ✅ Yes           | Becomes focusable            |
| Non-focusable elements (`<div>`, `<span>`)   | ❌ No              | ❌ No            | Needs `tabIndex`             |

Focus handling is an important accessibility topic that goes beyond the scope of this guide.

---

### Keyboard Events

Keyboard event handlers are used to detect keyboard interactions inside input fields, buttons, or any focusable elements.

Keyboard event handlers receive the [`KeyboardEvent`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) argument.

```jsx
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    alert('Enter key pressed!');
  }
}

<input type="text" onKeyPress={handleKeyPress} />;
```

You should know the following keyboard events:
- `onKeyDown`: Fires when a key is pressed down. Fires continuously if the key is held
- `onKeyUp`: Fires when a key is released after being pressed
- `onKeyPress`: (Deprecated) Similar to `onKeyDown`, but does not detect special keys

**KeyboardEvent properties:**

| Property         | Description                        | Example output (`A` key) |
|------------------|------------------------------------|-------------------------|
| `event.key`      | The key as a string                | `'a'` or `'A'`          |
| `event.code`     | The physical key on the keyboard   | `'KeyA'`                |
| `event.which`    | (deprecated) Numeric code          | `65`                    |
| `event.keyCode`  | (deprecated) Numeric code          | `65`                    |
| `event.shiftKey` | `true` if `Shift` is held          | `true` / `false`        |
| `event.ctrlKey`  | `true` if `Ctrl` is held           | `true` / `false`        |

See the [full list of KeyboardEvent properties on MDN](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent#instance_properties).

**Best practices for handling keyboard events in React:**
- Use `onKeyDown` instead of `onKeyPress` (since `onKeyPress` is deprecated)
- Use `event.key` instead of `event.which` or `event.keyCode` (they're deprecated)
- Use `event.preventDefault()` when needed (e.g., prevent `Enter` from submitting a form)
- Add `tabIndex` for non-focusable elements (e.g., `<div>` needs it to receive keyboard events)
- Handle accessibility properly (keyboard navigation should be consistent)

In most cases, you shouldn't need to use keyboard events during interviews. Detecting text changes within `<input>`s is better done using `onChange`/`onInput` and detecting Enter key for the purpose of form submission is better done using `onSubmit` on `<form>`s.

---

## Event Interception

Event interception in React refers to the ability to capture, modify, or stop an event's behavior before it reaches its final target.

### Stopping Event Propagation

One way to intercept an event in React is by using `event.stopPropagation()`, which prevents the event from bubbling up to parent components. By default, events in React follow the bubbling phase, meaning they propagate from the target element up through its ancestors.

This is useful, for example, when clicking inside a dropdown should not close the entire menu because the click event bubbles up to a parent listener.

```jsx
function Dropdown() {
  function handleParentClick() {
    console.log('Parent div clicked!');
  }
  function handleChildClick(event) {
    event.stopPropagation(); // Prevents bubbling to the parent
    console.log('Dropdown item clicked!');
  }
  return (
    <div onClick={handleParentClick} style={{ padding: '20px', border: '2px solid black' }}>
      <div onClick={handleChildClick} style={{ padding: '10px', border: '1px solid blue' }}>
        Click inside dropdown
      </div>
    </div>
  );
}
```

In interviews, there shouldn't be many instances where you need to nest `onClick` handlers. If you ever do so, consider if you need `event.stopPropagation()` in the inner event handler.

Further reading: [Event propagation](https://react.dev/learn/responding-to-events#event-propagation)

### Preventing Default Behavior

Another form of event interception is preventing default browser actions using `event.preventDefault()`. Certain HTML elements, like `<form>`, `<a>`, and `<input>`, have built-in behaviors (e.g., form submission, link navigation). If you want to handle these interactions with custom logic in React, you must prevent their default behavior.

```jsx
function PreventFormSubmit() {
  function handleSubmit(event) {
    event.preventDefault(); // Prevents full-page reload
    console.log('Form submitted without reloading!');
  }
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Enter something" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

Without `event.preventDefault()`, clicking "Submit" would cause the page to refresh, disrupting the React application. By intercepting the event, we can handle the form submission programmatically without affecting the user experience.

Further reading: [Preventing default behavior](https://react.dev/learn/responding-to-events#preventing-default-behavior)

---

## Best Practices for Interviews

- If there's a performance issue with excessive re-rendering, avoid inline event handlers and memoize using `useCallback`
- Use `onChange` instead of `onInput` for form inputs
- Use `onMouseEnter`/`onMouseLeave` instead of `onMouseOver`/`onMouseOut` to prevent bubbling issues
- For performance-sensitive events like `onScroll`, debounce or throttle the event handlers

---

## What You Need to Know for Interviews

- **Event system:** Explain how the event system in React works and how it is different from the browser event system
- **Common events:** Mouse (`onClick`, `onMouseEnter`, `onMouseLeave`), input (`onChange`), form events (`onSubmit`), and keyboard events (`onKeyDown`)
- **Event interception:** When and how to use event interception

---

## Practice Questions

**Coding:**
- [Temperature Converter](/questions/user-interface/temperature-converter/react?framework=react&tab=coding)
- [Dice Roller](/questions/user-interface/dice-roller/react?framework=react&tab=coding)
- [Grid Lights](/questions/user-interface/grid-lights/react?framework=react&tab=coding)
- [Star Rating](/questions/user-interface/star-rating/react?framework=react&tab=coding)
- [Stopwatch](/questions/user-interface/stopwatch/react?framework=react&tab=coding)
- [Auth Code Input](/questions/user-interface/auth-code-input/react?framework=react&tab=coding)
- [Selectable Cells](/questions/user-interface/selectable-cells/react?framework=react&tab=coding)
