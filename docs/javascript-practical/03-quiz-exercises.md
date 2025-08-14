# Quiz Exercises

Challenge yourself with these advanced JavaScript problems and scenarios.

---

## Cheatsheet: Cookie vs localStorage vs sessionStorage

**All three are client-side storage mechanisms, but they differ in usage, scope, and behavior.**

### Quick Comparison Table

| Property                                 | Cookie                                 | localStorage                        | sessionStorage                      |
|------------------------------------------|----------------------------------------|-------------------------------------|-------------------------------------|
| **Initiator**                            | Client or server (Set-Cookie header)   | Client                              | Client                              |
| **Lifespan**                             | As specified (can be session or fixed) | Until deleted                       | Until tab/window closed             |
| **Persistent across browser sessions**    | If expiry set                          | Yes                                 | No                                  |
| **Sent to server with every HTTP request**| Yes                                    | No                                  | No                                  |
| **Total capacity (per domain)**           | ~4KB                                   | ~5MB                                | ~5MB                                |
| **Access**                               | All windows/tabs (domain-specific)     | All windows/tabs (same origin)      | Same tab/window only                |
| **Security**                             | HttpOnly/secure flags, JS can’t access HttpOnly | No built-in security, JS access    | No built-in security, JS access     |

---

### TL;DR
- **Cookies**: Small, sent to server, can be HttpOnly/Secure, used for auth/session, set by server or JS.
- **localStorage**: Large, persistent, not sent to server, for long-term client data (e.g. themes, settings).
- **sessionStorage**: Large, temporary, per-tab, not sent to server, for session-only data (e.g. form state).

---

### Common Properties
- All are key-value stores (values are always strings; use `JSON.stringify` for objects).
- All are accessible by client-side JS (except HttpOnly cookies).
- All are origin/domain-scoped.

---

### Use Cases
- **Cookies**: Auth tokens, session IDs, server-required data, tracking IDs, language preferences.
- **localStorage**: User preferences, themes, layouts, data to persist across sessions.
- **sessionStorage**: Temporary form data, per-tab state, data that should disappear when tab closes.

---

### Cookie Example
```js
// Set a cookie (expires in the future)
document.cookie = 'auth_token=abc123def; expires=Fri, 31 Dec 2024 23:59:59 GMT; path=/';

// Read all cookies (returns a string)
console.log(document.cookie); // e.g. 'auth_token=abc123def; ...'

// Delete a cookie (set expiry in the past)
document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
```
**Note:** `document.cookie` is a string; you must parse it to get specific values. Use [js-cookie](https://github.com/js-cookie/js-cookie) for easier handling.

#### Modern Cookie API (Cookie Store API)
```js
// Set a cookie
cookieStore.set('auth_token', 'abc123def');
// Get a cookie
cookieStore.get('auth_token').then(cookie => console.log(cookie));
// Delete a cookie
cookieStore.delete('auth_token');
```
*Note: Cookie Store API is new and not supported in all browsers (as of June 2024).*

---

### localStorage Example
```js
// Set
localStorage.setItem('key', 'value');
// Get
console.log(localStorage.getItem('key'));
// Remove
localStorage.removeItem('key');
// Clear all
localStorage.clear();
```

---

### sessionStorage Example
```js
// Set
sessionStorage.setItem('key', 'value');
// Get
console.log(sessionStorage.getItem('key'));
// Remove
sessionStorage.removeItem('key');
// Clear all
sessionStorage.clear();
```

---

### Security Notes
- **Cookies**: Use `HttpOnly` to prevent JS access, `Secure` to require HTTPS, and `SameSite` to control cross-site sending.
- **localStorage/sessionStorage**: Accessible by any JS on the page; do **not** store sensitive data (e.g. auth tokens) here.

---

### Interview Tips
- Know the differences in persistence, scope, and security.
- Cookies are for server communication; Web Storage is for client-only data.
- Only cookies can be set by the server and sent automatically with requests.
- Web Storage (local/session) is much easier to use in JS, but not for server-required data.

---

### Related APIs
- [Web Storage API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Cookie Store API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API)
- [IndexedDB (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) – for large, structured data.

---

### References
- [What is the difference between localStorage, sessionStorage, session and cookies? (StackOverflow)](https://stackoverflow.com/questions/19867599/what-is-the-difference-between-localstorage-sessionstorage-session-and-cookies)
- [js-cookie library](https://github.com/js-cookie/js-cookie)

---

## Cheatsheet: `<script>` vs `<script async>` vs `<script defer>`

**All three are ways to load JavaScript in HTML, but they differ in how and when scripts are loaded and executed.**

### Quick Comparison Table

| Feature                | `<script>`                | `<script async>`           | `<script defer>`           |
|------------------------|-------------------------|--------------------------|--------------------------|
| Parsing behavior       | Blocks HTML parsing     | Runs parallel to parsing | Runs parallel to parsing |
| Execution order        | In order of appearance  | Not guaranteed           | In order of appearance   |
| DOM dependency         | No                      | No                       | Yes (waits for DOM)      |
| When executed          | Immediately after fetch | As soon as available     | After HTML parsed        |
| Use case               | Critical/inline scripts | Independent scripts      | DOM-dependent scripts    |

---

### TL;DR
- **`<script>`**: Blocks HTML parsing until script is downloaded and executed. Use for critical scripts needed before rendering.
- **`<script async>`**: Downloads script in parallel, executes as soon as available (order not guaranteed). Use for independent scripts (e.g. analytics, ads).
- **`<script defer>`**: Downloads in parallel, executes after HTML parsing, in order. Use for scripts that depend on DOM or on each other.

---

### `<script>` Example
```html
<!doctype html>
<html>
  <head>
    <title>Regular Script</title>
  </head>
  <body>
    <h1>Regular Script Example</h1>
    <p>This content will be rendered before the script executes.</p>
    <script src="regular.js"></script>
    <p>This content will be rendered after the script executes.</p>
  </body>
</html>
```

---

### `<script async>` Example
```html
<!doctype html>
<html>
  <head>
    <title>Async Script</title>
  </head>
  <body>
    <h1>Async Script Example</h1>
    <p>This content may be rendered before or after the async script executes.</p>
    <script async src="async.js"></script>
  </body>
</html>
```

---

### `<script defer>` Example
```html
<!doctype html>
<html>
  <head>
    <title>Deferred Script</title>
  </head>
  <body>
    <h1>Deferred Script Example</h1>
    <p>This content will be rendered before the deferred script executes.</p>
    <script defer src="deferred.js"></script>
  </body>
</html>
```

---

### Key Notes
- `async` and `defer` only work for external scripts (with `src`).
- `defer` scripts always execute in order, after HTML is parsed and before `DOMContentLoaded`.
- `async` scripts execute as soon as they finish downloading, order is not guaranteed.
- Scripts with `document.write()` should not use `async` or `defer`.
- For best performance, use `defer` for scripts that depend on DOM or on each other, and `async` for independent scripts.

---

### Interview Tips
- Know the difference in execution timing and order.
- Use `defer` for scripts that need the DOM or must run in order.
- Use `async` for scripts that are independent and can run anytime.
- Inline scripts (no `src`) ignore `async` and `defer`.

---

### Further Reading
- [MDN: `<script>` The Script element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#defer)
- [async vs defer attributes](https://www.growingwiththeweb.com/2014/02/async-vs-defer-attributes.html)
- [Web Workers (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) – for off-main-thread script execution

---

## Cheatsheet: Hoisting in JavaScript

**Hoisting** is JavaScript's behavior of moving declarations (not initializations) to the top of their scope during the compile phase.

### Quick Reference Table

| Declaration Type         | Hoisted?         | Initialized?         | Access Before Declaration      |
|-------------------------|------------------|----------------------|-------------------------------|
| `var`                   | Yes              | No (set to `undefined`)| `undefined`                   |
| `let`                   | Yes              | No                   | `ReferenceError` (TDZ)        |
| `const`                 | Yes              | No                   | `ReferenceError` (TDZ)        |
| `function` declaration  | Yes (full)       | Yes                  | Usable                        |
| `function` expression   | Yes (var only)   | No                   | `undefined`                   |
| `class` declaration     | Yes              | No                   | `ReferenceError` (TDZ)        |
| `import`                | Yes              | Yes                  | Usable                        |

---

### TL;DR
- **Declarations** are hoisted, **initializations** are not.
- `var` is hoisted and initialized to `undefined`.
- `let`, `const`, and `class` are hoisted but not initialized (temporal dead zone).
- Function declarations are fully hoisted (can call before definition).
- Function expressions (with `var`) are hoisted as variables only (value is `undefined` until assignment).
- Imports are hoisted and available throughout the module.

---

### Code Examples

#### `var` Hoisting
```js
console.log(foo); // undefined
var foo = 1;
console.log(foo); // 1
// Interpreted as:
// var foo;
// console.log(foo); // undefined
// foo = 1;
// console.log(foo); // 1
```

#### `let` and `const` Hoisting (Temporal Dead Zone)
```js
console.log(bar); // ReferenceError: Cannot access 'bar' before initialization
let bar = 2;

console.log(baz); // ReferenceError: Cannot access 'baz' before initialization
const baz = 3;
```

#### `class` Hoisting (Temporal Dead Zone)
```js
console.log(MyClass); // ReferenceError: Cannot access 'MyClass' before initialization
class MyClass {}
```

#### Function Declaration Hoisting
```js
foo(); // 'Hello from foo'
function foo() {
  console.log('Hello from foo');
}
```

#### Function Expression Hoisting
```js
console.log(bar); // undefined
bar(); // TypeError: bar is not a function
var bar = function() {
  console.log('Hello from bar');
};
```

#### Import Hoisting
```js
// foo.doSomething(); // Works
import foo from './foo.js';
```

---

### Key Concepts
- **Temporal Dead Zone (TDZ):** The period between entering scope and actual declaration for `let`, `const`, and `class`. Accessing the variable in this zone throws a `ReferenceError`.
- **Only declarations are hoisted, not initializations.**
- **Function declarations** are fully hoisted (can call before definition), but **function expressions** are not.
- **Modern best practice:** Use `let` and `const` instead of `var` to avoid hoisting confusion.

---

### Interview Tips
- Be able to explain the difference between hoisting for `var`, `let`, `const`, functions, and classes.
- Know what the temporal dead zone is and when it applies.
- Demonstrate with code examples what happens when accessing variables before declaration.
- Emphasize that only declarations are hoisted, not assignments.

---

### Further Reading
- [MDN: Hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting)
- [What is Hoisting in JavaScript? (freeCodeCamp)](https://www.freecodecamp.org/news/what-is-hoisting-in-javascript)
- [ECMAScript Spec: let and const](https://tc39.es/ecma262/#sec-let-and-const-declarations)
- [ECMAScript Spec: var](https://tc39.es/ecma262/#sec-variable-statement)

---

## Cheatsheet: Differences between `let`, `var`, and `const` in JavaScript

**`let`, `var`, and `const` are all used to declare variables, but they differ in scope, hoisting, redeclaration, reassignment, and initialization.**

### Quick Comparison Table

| Behavior                      | `var`                | `let`              | `const`            |
|-------------------------------|----------------------|--------------------|--------------------|
| Scope                         | Function/Global      | Block              | Block              |
| Hoisted?                      | Yes (initialized to `undefined`) | Yes (TDZ)         | Yes (TDZ)         |
| Redeclaration                 | Yes                  | No                 | No                 |
| Reassignment                  | Yes                  | Yes                | No                 |
| Initialization required       | No                   | No                 | Yes                |
| Access before declaration     | `undefined`          | ReferenceError     | ReferenceError     |

---

### TL;DR
- **`var`**: Function-scoped, hoisted and initialized to `undefined`, can be redeclared and reassigned, avoid in modern code.
- **`let`**: Block-scoped, hoisted but not initialized (TDZ), cannot be redeclared in same scope, can be reassigned.
- **`const`**: Block-scoped, hoisted but not initialized (TDZ), cannot be redeclared or reassigned, must be initialized at declaration.

---

### Scope Example
```js
function testScope() {
  if (true) {
    var a = 1;
    let b = 2;
    const c = 3;
  }
  console.log(a); // 1
  console.log(b); // ReferenceError: b is not defined
  console.log(c); // ReferenceError: c is not defined
}
testScope();
```

---

### Hoisting & Temporal Dead Zone Example
```js
console.log(x); // undefined (var is hoisted)
var x = 10;

console.log(y); // ReferenceError (let is hoisted but not initialized)
let y = 20;

console.log(z); // ReferenceError (const is hoisted but not initialized)
const z = 30;
```

---

### Redeclaration Example
```js
var foo = 1;
var foo = 2; // OK

let bar = 1;
// let bar = 2; // SyntaxError: Identifier 'bar' has already been declared

const baz = 1;
// const baz = 2; // SyntaxError: Identifier 'baz' has already been declared
```

---

### Reassignment Example
```js
var a = 1;
a = 2; // OK

let b = 1;
b = 2; // OK

const c = 1;
c = 2; // TypeError: Assignment to constant variable.
```

---

### Initialization Example
```js
var x; // OK
let y; // OK
// const z; // SyntaxError: Missing initializer in const declaration
```

---

### Best Practices
- Use `const` by default for variables that should not be reassigned.
- Use `let` for variables that need to be reassigned.
- Avoid `var` to prevent scoping and hoisting issues.
- Always declare variables at the top of their scope.

---

### Interview Tips
- Be able to explain the differences in scope, hoisting, redeclaration, and reassignment.
- Know what the temporal dead zone (TDZ) is and how it affects `let` and `const`.
- Demonstrate with code what happens when accessing variables before declaration.
- Emphasize why `var` is discouraged in modern JavaScript.

---

### Further Reading
- [The Difference of "var" vs "let" vs "const" in Javascript (Medium)](https://medium.com/swlh/the-difference-of-var-vs-let-vs-const-in-javascript-abe37e214d66)
- [MDN: var](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN: let](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: const](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)

---

## Cheatsheet: Closures in JavaScript

**A closure is a function that remembers and accesses variables from its lexical scope, even after the outer function has finished executing.**

### TL;DR
- A closure is created when a function retains access to its outer (lexical) scope, even after the outer function has returned.
- Closures allow functions to "remember" the environment in which they were created.
- Used for data encapsulation, maintaining state, callbacks, event handlers, and module patterns.

---

### Closure Example
```js
function outerFunction() {
  const outerVar = 'I am outside of innerFunction';
  function innerFunction() {
    console.log(outerVar); // innerFunction can access outerVar
  }
  return innerFunction;
}
const inner = outerFunction();
inner(); // "I am outside of innerFunction"
// Even though outerFunction has finished, inner still has access to outerVar
```

---

### ES6 Arrow Function Closure Example
```js
const createCounter = () => {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
};
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

---

### Closures in React Example
```jsx
import React, { useState } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1); // handleClick forms a closure over count and setCount
  }
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

---

### Why Use Closures?
- **Data encapsulation:** Create private variables/functions not accessible from outside.
- **Maintain state:** Functions can "remember" values between calls.
- **Functional programming:** Enable currying, partial application, and higher-order functions.
- **Event handlers/callbacks:** Retain access to variables at the time the handler was defined.
- **Module pattern:** Create modules with private and public parts.

---

### Key Points
- Closures are created every time a function is created, at function creation time.
- The inner function retains access to the variables of the outer function, even after the outer function has returned.
- Variables captured by closures are not garbage collected as long as the closure exists.
- Be careful with closures in loops (classic interview gotcha: using `var` in a loop with closures).

---

### Interview Tips
- Be able to define a closure and explain lexical scope.
- Show how closures are used for data privacy and state.
- Demonstrate with code how a closure "remembers" its environment.
- Know common use cases: callbacks, event handlers, module pattern.

---

### Further Reading
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [JavaScript.info: Closures](https://javascript.info/closure)
- [Eloquent JavaScript: Functions and Closures](https://eloquentjavascript.net/03_functions.html)
- [You Don't Know JS: Scope & Closures](https://github.com/getify/You-Dont-Know-JS/tree/2nd-ed/scope-closures)

---

## Cheatsheet: Event Bubbling in JavaScript

**Event bubbling is a DOM event propagation mechanism where an event starts at the target element and bubbles up to the root, allowing ancestor elements to also respond to the event.**

### TL;DR
- Events (like `click`) triggered on an element first run handlers on that element, then bubble up to its ancestors (parent, grandparent, etc.), all the way to `document`.
- Enables event delegation: one handler on a parent can manage events for many children.
- Use `event.stopPropagation()` to stop bubbling.

---

### Event Bubbling Example
```js
// HTML:
// <div id="parent">
//   <button id="child">Click me!</button>
// </div>

const parent = document.getElementById('parent');
const child = document.getElementById('child');

parent.addEventListener('click', () => {
  console.log('Parent element clicked');
});

child.addEventListener('click', () => {
  console.log('Child element clicked');
});

// Clicking the button logs:
// Child element clicked
// Parent element clicked
```

---

### Stopping Bubbling
```js
child.addEventListener('click', (event) => {
  console.log('Child element clicked');
  event.stopPropagation(); // Prevents event from bubbling to parent
});
```

---

### Event Delegation Example
```js
// HTML:
// <ul id="product-list">
//   <li><button id="item1-buy">Buy Now</button></li>
//   <li><button id="item2-buy">Buy Now</button></li>
// </ul>

const productList = document.getElementById('product-list');
productList.addEventListener('click', (event) => {
  if (event.target.tagName.toLowerCase() === 'button') {
    console.log('Buy button clicked for item:', event.target.textContent);
  }
});
```

---

### Benefits
- **Cleaner code:** Fewer event listeners, easier maintenance.
- **Efficient:** Less memory usage, better performance for many elements.
- **Flexible:** Handles dynamic elements added after initial render.

---

### Pitfalls
- **Unintended event handling:** Parent may capture events meant for children. Use `event.target` to check the source.
- **Event order:** Events bubble up in DOM order; multiple parent listeners fire in hierarchy order.
- **Over-delegation:** Attaching listeners too high in the DOM may catch unwanted events.

---

### Use Cases
- **Event delegation:** Manage many child events with one parent handler (e.g., lists, tables).
- **Dropdowns/Accordions:** Handle open/close logic with a single parent listener.
- **Dynamic UIs:** Efficiently handle events for elements created/removed at runtime.

---

### Interview Tips
- Be able to explain the event flow: capturing → target → bubbling.
- Show how to use event delegation for performance and code simplicity.
- Know how to stop bubbling with `event.stopPropagation()`.
- Demonstrate with code how bubbling works and how to use `event.target`.

---

### Further Reading
- [MDN: Event Bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling)
- [JavaScript.info: Bubbling and Capturing](https://javascript.info/bubbling-and-capturing)
- [W3C DOM Level 3 Events](https://www.w3.org/TR/DOM-Level-3-Events/#event-flow)

---

## Cheatsheet: Event Delegation in JavaScript

**Event delegation is a technique where a single event listener is attached to a parent element to handle events for multiple child elements, leveraging event bubbling.**

### TL;DR
- Attach one event listener to a common ancestor instead of many listeners to individual children.
- Use `event.target` to determine which child triggered the event.
- Works for bubbling events (e.g., `click`, `input`), not for non-bubbling events (e.g., `focus`, `blur`).
- Great for dynamic lists and performance.

---

### How Event Delegation Works
1. Attach a listener to a parent (ancestor) element.
2. When a child is interacted with, the event bubbles up to the parent.
3. The parent handler inspects `event.target` to determine which child was acted on.
4. Perform logic based on the target.

---

### Example: Delegating Clicks on a List
```js
// HTML:
// <ul id="item-list">
//   <li>Item 1</li>
//   <li>Item 2</li>
//   <li>Item 3</li>
// </ul>

const itemList = document.getElementById('item-list');
itemList.addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    console.log(`Clicked on ${event.target.textContent}`);
  }
});
```

---

### Example: Handling Dynamic Content
```js
// HTML:
// <div id="button-container">
//   <button>Button 1</button>
//   <button>Button 2</button>
// </div>
// <button id="add-button">Add Button</button>

const buttonContainer = document.getElementById('button-container');
const addButton = document.getElementById('add-button');

buttonContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    console.log(`Clicked on ${event.target.textContent}`);
  }
});

addButton.addEventListener('click', () => {
  const newButton = document.createElement('button');
  newButton.textContent = `Button ${buttonContainer.children.length + 1}`;
  buttonContainer.appendChild(newButton);
});
```

---

### Example: Form Input Delegation
```js
// HTML:
// <form id="user-form">
//   <input type="text" name="username" placeholder="Username">
//   <input type="email" name="email" placeholder="Email">
//   <input type="password" name="password" placeholder="Password">
// </form>

const userForm = document.getElementById('user-form');
userForm.addEventListener('input', (event) => {
  const { name, value } = event.target;
  console.log(`Changed ${name}: ${value}`);
});
```

---

### Benefits
- **Performance:** Fewer event listeners, less memory usage.
- **Dynamic elements:** Handles events for elements added/removed at runtime.
- **Simpler code:** Centralized event logic, easier maintenance.

---

### Pitfalls
- **Not all events bubble:** Cannot delegate non-bubbling events (e.g., `focus`, `blur`, `mouseenter`).
- **Target confusion:** Must check `event.target` to avoid acting on the wrong element.
- **Complexity:** For deeply nested or complex DOM, logic can get tricky.

---

### Event Delegation in Frameworks
- **React:** Uses event delegation internally by attaching listeners to the root and dispatching events to components.

---

### Interview Tips
- Be able to explain how event delegation leverages bubbling.
- Show how to use `event.target` to identify the source.
- Know which events can/cannot be delegated.
- Demonstrate with code how to handle dynamic content efficiently.

---

### Further Reading
- [MDN: Event Delegation](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_delegation)
- [JavaScript.info: Event Delegation](https://javascript.info/event-delegation)

---

## Cheatsheet: `null` vs `undefined` vs Undeclared in JavaScript

**`null`, `undefined`, and undeclared are three distinct states for variables in JavaScript.**

### Quick Comparison Table

| Trait                | `null`                                      | `undefined`                                 | Undeclared                        |
|----------------------|---------------------------------------------|---------------------------------------------|-----------------------------------|
| Meaning              | Explicitly set to indicate no value         | Declared but not assigned a value           | Not declared at all               |
| Type (`typeof`)      | `'object'`                                  | `'undefined'`                               | `'undefined'` (if using `typeof`) |
| Equality             | `null == undefined` is `true`               | `undefined == null` is `true`               | Throws `ReferenceError`           |
| How to check         | `x === null`                                | `x === undefined` or `typeof x === 'undefined'` | Use `typeof x` in try/catch      |

---

### TL;DR
- **`null`**: Explicitly assigned by developer to mean "no value". Type is `'object'` (quirk).
- **`undefined`**: Variable declared but not assigned, or function returns nothing. Type is `'undefined'`.
- **Undeclared**: Variable never declared. Accessing it throws `ReferenceError` (except with `typeof`).

---

### Code Examples

#### `null`
```js
const foo = null;
console.log(foo === null); // true
console.log(typeof foo);   // 'object'
```

#### `undefined`
```js
let bar;
console.log(bar); // undefined
console.log(bar === undefined); // true
console.log(typeof bar === 'undefined'); // true

function baz() {}
console.log(baz()); // undefined
```

#### Undeclared
```js
try {
  console.log(x); // ReferenceError: x is not defined
} catch (e) {
  console.log(e instanceof ReferenceError); // true
}

console.log(typeof y === 'undefined'); // true (no error)
```

---

### Checking for Each State
- **`null`**: Use `x === null`.
- **`undefined`**: Use `x === undefined` or `typeof x === 'undefined'`.
- **Undeclared**: Use `typeof x` (returns `'undefined'`), or wrap access in try/catch to catch `ReferenceError`.

---

### Best Practices
- Always declare variables before use.
- Assign `null` explicitly if you want to indicate "no value yet".
- Avoid leaving variables undeclared or unassigned.
- Use strict equality (`===`) for checks.
- Use static analysis tools (ESLint, TypeScript) to catch undeclared variables.

---

### Interview Tips
- Be able to explain the difference between `null`, `undefined`, and undeclared.
- Know how to check for each state and the quirks of `typeof`.
- Demonstrate with code how each state behaves.
- Emphasize why undeclared variables are bad practice.

---

### Further Reading
- [MDN: null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null)
- [MDN: undefined](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined)
- [MDN: ReferenceError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError)

---

## Cheatsheet: CommonJS vs ES Modules in JavaScript

**JavaScript modules allow you to organize code into reusable, encapsulated files. The two main module systems are CommonJS (CJS) and ES Modules (ESM).**

### Quick Comparison Table

| Feature         | CommonJS (CJS)                | ES Modules (ESM)                  |
|-----------------|-------------------------------|-----------------------------------|
| Import syntax   | `const x = require('x')`      | `import x from 'x'`               |
| Export syntax   | `module.exports = ...`        | `export ...`                      |
| Environment     | Node.js (server-side)         | Browser & Node.js (modern)        |
| Loading         | Synchronous                   | Asynchronous                      |
| Structure       | Dynamic (can be conditional)  | Static (top-level only)           |
| File extension  | `.js`                         | `.mjs` or `.js` (with `type:module`)|
| Browser support | Not native                    | Native in modern browsers         |
| Optimization    | Limited (dynamic)             | Tree-shaking, static analysis     |
| Interop         | Widely used in legacy Node.js | Standard for new projects         |

---

### TL;DR
- **CommonJS**: Uses `require()`/`module.exports`, synchronous, Node.js default, not natively supported in browsers, dynamic structure.
- **ES Modules**: Uses `import`/`export`, asynchronous, works in browsers and Node.js, static structure (better for tooling and optimization).

---

### CommonJS Example
```js
// my-module.js
const value = 42;
module.exports = { value };

// main.js
const myModule = require('./my-module.js');
console.log(myModule.value); // 42
```

---

### ES Modules Example
```js
// my-module.js
export const value = 42;

// main.js
import { value } from './my-module.js';
console.log(value); // 42
```

---

### Key Differences
- **Syntax**: CJS uses `require`/`module.exports`; ESM uses `import`/`export`.
- **Loading**: CJS loads modules synchronously (blocking); ESM loads asynchronously (non-blocking).
- **Static vs Dynamic**: ESM imports/exports must be at the top level and are statically analyzed; CJS can load modules conditionally.
- **Interop**: Mixing CJS and ESM can be tricky; use one system per project when possible.
- **Optimization**: ESM enables tree-shaking and better static analysis by bundlers.

---

### When to Use Which?
- **CommonJS**: Legacy Node.js projects, existing npm packages.
- **ES Modules**: Modern JavaScript (browser or Node.js), new projects, better tooling and performance.

---

### Interview Tips
- Be able to write both CJS and ESM import/export syntax.
- Know the main differences: environment, loading, syntax, optimization.
- Explain why ESM is preferred for modern code (tree-shaking, browser support, static analysis).
- Understand that CJS is still common in legacy Node.js codebases.

---

### Further Reading
- [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [CommonJS vs ES Modules: The shift from require to import](https://nikolasbarwicki.com/articles/commonjs-vs-es-modules-the-shift-from-require-to-import/)
- [JavaScript.info: Modules](https://javascript.info/modules-intro)
- [Eloquent JavaScript: Modules](https://eloquentjavascript.net/10_modules.html)
- [LogRocket: CommonJS vs. ES modules in Node.js](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)

---

## Cheatsheet: The Event Loop, Call Stack, and Task Queue in JavaScript

**The event loop is the core mechanism that enables asynchronous, non-blocking behavior in JavaScript, despite its single-threaded nature.**

### TL;DR
- **Call stack:** Where JS executes functions (LIFO stack). Only one thing runs at a time.
- **Task queue (macrotask queue):** Where callbacks from async APIs (e.g., setTimeout, DOM events) wait to be executed.
- **Microtask queue:** Where promise callbacks and microtasks wait (higher priority than macrotasks).
- **Event loop:** Continuously checks if the call stack is empty, then pushes tasks from the microtask queue (first) or macrotask queue (second) onto the stack.

---

### Quick Comparison Table

| Component         | What is it?                                 | Examples                                 | Priority |
|-------------------|---------------------------------------------|------------------------------------------|----------|
| Call Stack        | Executes JS code (LIFO stack)               | Function calls, synchronous code         | Highest  |
| Microtask Queue   | Holds microtasks (run after stack is empty) | Promises, queueMicrotask, MutationObserver| 2nd      |
| Macrotask Queue   | Holds macrotasks (run after microtasks)     | setTimeout, setInterval, DOM events      | 3rd      |
| Event Loop        | Orchestrates the above                      | N/A                                      | N/A      |

---

### How the Event Loop Works
1. JS engine runs code, pushing function calls onto the call stack.
2. When async APIs are called, their callbacks are queued (macrotask or microtask queue).
3. When the call stack is empty, the event loop:
   - Runs all microtasks in order (empties the microtask queue).
   - Runs the next macrotask (if any), then checks microtasks again.
4. This cycle repeats indefinitely.

---

### Example: Event Loop in Action
```js
console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');
});

setTimeout(() => {
  console.log('Timeout 2');
}, 0);

console.log('End');

// Output:
// Start
// End
// Promise 1
// Timeout 1
// Timeout 2
```
**Explanation:**
- 'Start' and 'End' run first (call stack).
- Promise callback (microtask) runs next.
- setTimeout callbacks (macrotasks) run after microtasks.

---

### Visual Diagram
```
[Call Stack] <--- Event Loop <--- [Microtask Queue] <--- [Macrotask Queue]
```
- Call stack runs code.
- Event loop moves tasks from queues to stack when stack is empty.
- Microtasks always run before the next macrotask.

---

### Key Points
- JS is single-threaded, but async APIs (Web APIs/Node APIs) run in the background.
- Microtasks (promises) have higher priority than macrotasks (setTimeout, events).
- The event loop enables non-blocking I/O and UI updates.
- Understanding the event loop is crucial for debugging async code and avoiding race conditions.

---

### Interview Tips
- Be able to explain the order of execution for sync, microtask, and macrotask code.
- Know the difference between the call stack, microtask queue, and macrotask queue.
- Demonstrate with code how promises and setTimeout interact.
- Mention that not all async APIs are equal (e.g., process.nextTick in Node.js).

---

### Further Reading & Visuals
- [MDN: The event loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop)
- [JavaScript Visualized: Event Loop (Lydia Hallie)](https://www.lydiahallie.com/blog/event-loop)
- [JSConf: What the heck is the event loop anyway? (Philip Roberts)](https://2014.jsconf.eu/speakers/philip-roberts-what-the-heck-is-the-event-loop-anyway.html)
- [JavaScript.info: Event loop](https://javascript.info/event-loop)

---

## Cheatsheet: Promises vs Callbacks in JavaScript

**Promises provide a cleaner, more robust way to handle asynchronous operations compared to traditional callbacks.**

### TL;DR
- **Promises**: Avoid callback hell, enable chaining, better error handling, easier to write sequential/parallel async code.
- **Callbacks**: Simple for basic async, but can lead to deeply nested, hard-to-maintain code (callback hell).

---

### Quick Comparison Table

| Feature                | Callbacks                        | Promises                                 |
|------------------------|----------------------------------|------------------------------------------|
| Syntax                 | Function passed as argument      | `.then()`, `.catch()`, `.finally()`      |
| Readability            | Can get deeply nested            | Flat, chainable                          |
| Error handling         | Must handle in every callback    | Centralized with `.catch()`              |
| Sequential async       | Nested callbacks                 | Chained `.then()`                        |
| Parallel async         | Manual counting/tracking         | `Promise.all()`                          |
| Cleanup                | Manual, scattered                | `.finally()` for guaranteed cleanup      |
| Common pitfalls        | Callback hell, multiple calls, error swallowing | Fewer, more predictable                 |

---

### Callback Hell Example
```js
getFirstData(function(data1) {
  getSecondData(data1, function(data2) {
    getThirdData(data2, function(result) {
      console.log(result);
    });
  });
});
```

---

### Promises Example (Sequential)
```js
getFirstData()
  .then(getSecondData)
  .then(getThirdData)
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error('Error:', error);
  })
  .finally(() => {
    console.log('Cleanup runs no matter what');
  });
```

---

### Promises Example (Parallel)
```js
Promise.all([getData1(), getData2(), getData3()])
  .then(results => {
    console.log(results); // Array of results
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

---

### Pros of Promises
- Avoid callback hell (pyramid of doom)
- Easier to write/read sequential and parallel async code
- Centralized error handling with `.catch()`
- Guaranteed cleanup with `.finally()`
- More predictable: Promises can only settle once (resolve or reject)
- Composable: Can chain and combine with `Promise.all`, `Promise.race`, etc.

---

### Cons of Promises
- Slightly more complex syntax for very simple async tasks
- Still requires understanding of async flow and error propagation
- Not all legacy APIs use Promises (may need to wrap with `Promise`)

---

### Interview Tips
- Be able to explain callback hell and how Promises solve it
- Show how to chain Promises for sequential and parallel tasks
- Know how `.catch()` and `.finally()` work
- Mention that Promises are the foundation for `async`/`await` (even cleaner async code)

---

### Further Reading
- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: Callback function](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)

---

## Cheatsheet: Block Formatting Context (BFC) in CSS

**A Block Formatting Context (BFC) is a part of the CSS visual rendering where block boxes are laid out. Understanding BFC is crucial for controlling layout, floats, and margin behavior.**

### TL;DR
- BFC is a region in the page where block-level boxes are laid out according to specific rules.
- BFCs help contain floats, prevent margin collapsing, and control layout quirks.
- You can trigger a BFC by setting certain CSS properties on an element.

---

### How to Create a BFC
An element becomes a BFC if it satisfies **any** of the following:
- `float` is not `none` (e.g., `float: left;`)
- `position` is `absolute` or `fixed`
- `display` is `inline-block`, `table-cell`, `table-caption`, `flex`, `inline-flex`, `grid`, or `inline-grid`
- `overflow` is not `visible` (e.g., `overflow: hidden;`)

---

### Why BFC Matters
- **Contain floats:** A BFC will expand to contain floated children, preventing parent collapse.
- **Prevent margin collapsing:** Margins between elements inside a BFC can collapse, but margins between a BFC and outside elements do not collapse.
- **Layout control:** Useful for sidebars, multi-column layouts, and clearing floats.

---

### Example: Containing Floats
```html
<style>
.container {
  overflow: hidden; /* triggers BFC */
  border: 1px solid #333;
}
.floated {
  float: left;
  width: 100px;
  height: 100px;
  background: #8cf;
}
</style>
<div class="container">
  <div class="floated"></div>
</div>
```
**Without BFC:** The container would collapse and not wrap the floated child.
**With BFC:** The container expands to contain the float.

---

### Example: Preventing Margin Collapsing
```html
<style>
.bfc {
  overflow: hidden; /* triggers BFC */
  background: #eee;
}
.child {
  margin-top: 30px;
  margin-bottom: 30px;
  background: #cfc;
}
</style>
<div style="margin-bottom: 50px; background: #fcc;">Outside</div>
<div class="bfc">
  <div class="child">Inside BFC</div>
</div>
```
**Result:** The margin between `.child` and the outside element does not collapse.

---

### When to Use BFC
- To contain floats (classic clearfix alternative)
- To prevent margin collapsing between parent and child
- To create side-by-side layouts (e.g., float + block)
- To isolate layout sections (e.g., sidebar, main content)

---

### Key Points
- BFC is a fundamental CSS concept for layout and float management.
- Trigger BFC with `overflow`, `display`, `float`, or `position`.
- BFC prevents margin collapsing with outside elements.
- Each BFC is independent: floats and margins inside do not affect outside elements.

---

### Interview Tips
- Be able to list ways to trigger a BFC.
- Explain how BFC helps with float containment and margin collapsing.
- Show code examples for common BFC use cases.
- Know that BFC is essential for robust, cross-browser CSS layouts.

---

### Further Reading
- [MDN: Block Formatting Context](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context)
- [MDN: Mastering margin collapsing](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Mastering_margin_collapsing)

---

## Cheatsheet: `z-index` and Stacking Context in CSS

**`z-index` controls the vertical stacking order of overlapping elements. Stacking context determines how `z-index` is interpreted and which elements can overlap.**

### TL;DR
- `z-index` only works on positioned elements (`position: relative|absolute|fixed|sticky`) or flex/grid items.
- A stacking context is a self-contained 3D space for stacking child elements.
- New stacking contexts are triggered by certain CSS properties (not just `z-index`).
- `z-index` is only compared within the same stacking context.

---

### How Stacking Context is Formed
A new stacking context is created when an element:
- Has a `position` value other than `static` **and** a `z-index` value other than `auto`.
- Has `opacity` less than 1 (e.g., `opacity: 0.9`)
- Has a `transform`, `filter`, or `perspective` value other than `none`.
- Has `isolation: isolate`.
- Has `will-change` set to certain properties.
- Is a flex/grid container with `z-index` set (for children).
- (See [MDN full list](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context#the_stacking_context))

---

### How `z-index` Works
- `z-index` only applies to elements in the same stacking context.
- Higher `z-index` means the element appears above others in the same context.
- Child elements cannot escape their parent's stacking context, no matter how high their `z-index` is.

---

### Example: Basic `z-index`
```html
<style>
.box1 {
  position: relative;
  z-index: 1;
  background: #8cf;
  width: 100px; height: 100px;
}
.box2 {
  position: relative;
  z-index: 2;
  background: #fc8;
  width: 100px; height: 100px;
  margin-left: 50px; margin-top: -50px;
}
</style>
<div class="box1"></div>
<div class="box2"></div>
```
**Result:** `.box2` appears above `.box1` because it has a higher `z-index`.

---

### Example: Stacking Context Trap
```html
<style>
.parent {
  position: relative;
  z-index: 1;
}
.child {
  position: absolute;
  z-index: 999;
}
.sibling {
  position: relative;
  z-index: 2;
}
</style>
<div class="parent">
  <div class="child">Child</div>
</div>
<div class="sibling">Sibling</div>
```
**Result:** `.sibling` will always appear above `.child`, even though `.child` has a higher `z-index`, because `.child` is trapped in the parent's stacking context.

---

### When to Use `z-index` and Stacking Context
- To control which elements appear above others (modals, dropdowns, tooltips, overlays)
- To prevent stacking bugs by intentionally creating stacking contexts
- To debug overlapping issues (use browser dev tools to inspect stacking context)

---

### Key Points
- `z-index` only works on positioned/flex/grid elements.
- Stacking context is a local coordinate system for stacking order.
- Child elements cannot escape their parent's stacking context.
- Many CSS properties (not just `z-index`) can create stacking contexts.
- Use stacking context intentionally to avoid z-index wars.

---

### Interview Tips
- Be able to explain what a stacking context is and how it is created.
- Show how `z-index` works within and across stacking contexts.
- Demonstrate with code how stacking context traps can occur.
- Know how to debug stacking issues in browser dev tools.

---

### Further Reading
- [MDN: Understanding z-index and stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index)
- [CSS Tricks: What You May Not Know About Z-Index](https://css-tricks.com/almanac/properties/z/z-index/)

---

## Cheatsheet: How Browsers Match Elements to CSS Selectors

**Browsers determine which elements match a CSS selector by evaluating selectors from right to left (key selector to ancestor), filtering and traversing the DOM efficiently.**

### TL;DR
- Browsers match selectors from the rightmost (key selector) to the left.
- The rightmost part of the selector is used to filter candidate elements.
- For each candidate, the browser traverses up the DOM tree to check if ancestor relationships match the selector.
- Shorter, more specific selectors are faster to match.

---

### How Selector Matching Works
1. **Start with the rightmost selector** (the key selector):
   - For `div .item span`, the key selector is `span`.
2. **Find all elements matching the key selector** in the DOM.
3. **For each candidate element**, traverse up its parent chain:
   - Check if its parent matches the next selector to the left (`.item`), then its parent (`div`), etc.
   - If all parts match in order, the element matches the selector.
4. **Stop as soon as a part does not match** (no need to check further up).

---

### Example: Selector Matching
```css
/* Selector: p span */
```
- Browser finds all `<span>` elements (key selector).
- For each `<span>`, it checks if any ancestor is a `<p>`.
- If yes, the `<span>` matches `p span`.

---

### Example: Complex Selector
```css
/* Selector: .container > ul li.active a */
```
- Key selector: `a`
- For each `<a>`, check if its parent is `li.active`, grandparent is `ul`, great-grandparent is `.container` (with direct child `>` relationship for `ul`).

---

### Performance Tips
- **Rightmost selector should be specific** (e.g., class or tag, not universal `*`).
- **Avoid long descendant chains** (e.g., `div div div span`).
- **ID selectors are fastest** (unique in DOM).
- **Avoid universal selectors** (`*`) and overly broad selectors at the rightmost position.
- **Browsers optimize selector matching, but complex selectors can still impact performance in large DOMs.**

---

### Key Points
- Browsers match selectors right-to-left, not left-to-right.
- The rightmost selector is the most important for performance.
- For each candidate, browsers traverse up the DOM to check ancestor relationships.
- Efficient CSS = short, specific selectors with a specific key selector.

---

### Interview Tips
- Be able to explain right-to-left selector matching.
- Show how browsers filter and traverse for a given selector.
- Know why selector efficiency matters for large/complex DOMs.
- Demonstrate with code or selector examples.

---

### Further Reading
- [MDN: CSS Selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)
- [CSS Tricks: Efficiently Rendering CSS](https://css-tricks.com/efficiently-rendering-css/)
- [Google Developers: Writing Efficient CSS Selectors](https://developers.google.com/speed/docs/insights/UseEfficientCSSSelectors)

---

## Cheatsheet: CSS Box Model & Box Sizing

**The CSS box model describes how elements are rendered as rectangular boxes, including content, padding, border, and margin. Understanding the box model is essential for layout and sizing in CSS.**

### TL;DR
- Every element is a box: `content` + `padding` + `border` + `margin`.
- The `box-sizing` property controls how width/height are calculated.
- Margins are outside the box, borders and padding are inside.

---

### Box Model Structure
```
+---------------------------+
|        margin             |
|  +---------------------+  |
|  |     border          |  |
|  |  +---------------+  |  |
|  |  |   padding     |  |  |
|  |  |  +--------+   |  |  |
|  |  |  |content |   |  |  |
|  |  |  +--------+   |  |  |
|  |  +---------------+  |  |
|  +---------------------+  |
+---------------------------+
```

---

### Box Sizing: `content-box` vs `border-box`
- **`box-sizing: content-box` (default):**
  - `width`/`height` = content only. Padding and border are added outside.
  - Example: `width: 100px; padding: 10px; border: 5px solid` → total width = 130px.
- **`box-sizing: border-box`:**
  - `width`/`height` = content + padding + border. (Total width is what you set.)
  - Example: `width: 100px; padding: 10px; border: 5px solid` → total width = 100px (content shrinks).

---

### Code Examples
```css
/* Default: content-box */
.box1 {
  box-sizing: content-box;
  width: 100px;
  padding: 10px;
  border: 5px solid black;
}
/* Total width: 130px */

/* border-box */
.box2 {
  box-sizing: border-box;
  width: 100px;
  padding: 10px;
  border: 5px solid black;
}
/* Total width: 100px */
```

---

### Margin and Border Behavior
- **Margins** are outside the border and do not affect the box's width/height, but affect spacing between elements.
- **Vertical margins** between block elements can collapse (only the largest margin is used).
- **Borders** never collapse or overlap; each box's border is rendered separately.

---

### How to Set Box Model in CSS
```css
/* Set all elements to border-box (recommended for layouts) */
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

### Key Points
- The box model affects layout, sizing, and spacing.
- `box-sizing: border-box` is more intuitive for most layouts and is used by most CSS frameworks.
- Margins collapse vertically, but not horizontally.
- Borders and padding are always inside the box; margins are always outside.

---

### Interview Tips
- Be able to draw and explain the box model.
- Know the difference between `content-box` and `border-box`.
- Show how to calculate total width/height for both box models.
- Explain margin collapsing and border behavior.

---

### Further Reading
- [MDN: The box model](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/The_box_model#the_standard_css_box_model)

---

## Cheatsheet: `translate()` vs `absolute` Positioning in CSS

**`transform: translate()` and `position: absolute` both move elements, but they have different effects on layout, performance, and use cases.**

### TL;DR
- **`translate()` (via `transform`)**: Moves the element visually, but it still occupies its original space in the document flow. No reflow, only compositing (GPU-accelerated, better for animation).
- **`position: absolute`**: Removes the element from the normal document flow and positions it relative to the nearest positioned ancestor. Triggers reflow, affects layout of other elements.

---

### Key Differences
| Feature                | `transform: translate()`         | `position: absolute`                |
|------------------------|----------------------------------|-------------------------------------|
| Affects layout flow?   | No (original space preserved)    | Yes (removed from flow)             |
| Triggers reflow?       | No (only composite/paint)        | Yes (layout/reflow)                 |
| Animation performance  | GPU-accelerated, smooth          | CPU, can be janky                   |
| Use for animation?     | Yes (preferred)                  | No (avoid for smooth animation)     |
| Stacking context?      | Creates new stacking context     | May create stacking context         |
| Accessibility/Tab order| Unchanged                        | Unchanged                           |

---

### Example: translate() vs absolute
```css
/* Using translate() */
.box {
  transform: translate(50px, 0);
  transition: transform 0.3s;
}

/* Using absolute positioning */
.box {
  position: absolute;
  left: 50px;
  transition: left 0.3s;
}
```

---

### When to Use Each
- **Use `translate()` when:**
  - You want to move an element visually but keep its original space (e.g., for smooth animations, drag-and-drop, tooltips).
  - You want better performance (no reflow, GPU-accelerated).
- **Use `absolute` positioning when:**
  - You want to remove the element from the normal flow and position it precisely relative to an ancestor.
  - You need the element to overlap or be layered independently of the document flow.

---

### Performance Notes
- **`transform: translate()`**: Only triggers compositing, not layout or paint. This is why it's preferred for animations and transitions.
- **`position: absolute`**: Changing `top`, `left`, etc. triggers layout (reflow), which is more expensive and can cause jank in animations.

---

### Key Points
- `translate()` is best for smooth, performant movement/animation.
- `absolute` is best for layout and precise positioning outside the normal flow.
- Both can be combined for advanced UI effects, but understand their impact on layout and performance.

---

### Interview Tips
- Be able to explain the difference in layout and performance.
- Show code for both approaches and explain when to use each.
- Mention GPU acceleration and browser reflow/compositing.

---

### Further Reading
- [MDN: transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN: position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [CSS Tricks: Animating with transform vs top/left](https://css-tricks.com/animating-css-properties/)

---

## Cheatsheet: `* { box-sizing: border-box; }` in CSS

**`* { box-sizing: border-box; }` sets all elements to use the `border-box` box model, making layouts more predictable and easier to manage.**

### TL;DR
- By default, CSS uses `box-sizing: content-box` (width/height = content only).
- `box-sizing: border-box` makes width/height include padding and border.
- `* { box-sizing: border-box; }` applies this to all elements, making layouts more intuitive.

---

### Box Sizing Comparison Table
| Property   | `content-box` (default) | `border-box`         |
|------------|-------------------------|----------------------|
| content    | Yes                     | Yes                 |
| padding    | No                      | Yes                 |
| border     | No                      | Yes                 |
| margin     | No                      | No                  |

---

### Example
```css
/* Default: content-box */
.box1 {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
}
/* Total width: 250px (200 + 20*2 + 5*2) */

/* border-box */
.box2 {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #333;
}
/* Total width: 200px (content shrinks to fit) */

/* Apply to all elements */
* {
  box-sizing: border-box;
}
```

---

### Advantages of `border-box`
- **Predictable layouts:** Width/height includes padding and border, so elements never overflow their set size.
- **Easier grid/layout math:** No need to subtract padding/border from width/height.
- **Matches design tools:** Designers expect boxes to include padding/border in their size.
- **Used by frameworks:** Most modern CSS frameworks (Bootstrap, Tailwind, etc.) set this globally.

---

### Key Points
- `border-box` is more intuitive for most layouts.
- Margins are always outside the box and not included in width/height.
- Use `* { box-sizing: border-box; }` as a best practice for consistent layouts.

---

### Interview Tips
- Be able to explain the difference between `content-box` and `border-box`.
- Show how `border-box` simplifies layout math.
- Know why frameworks use it by default.

---

### Further Reading
- [CSS Tricks: Box Sizing](https://css-tricks.com/box-sizing/)
- [MDN: box-sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing)

---

## Cheatsheet: The CSS `display` Property

**The `display` property determines how an element is rendered and participates in the layout flow. It is one of the most fundamental CSS properties.**

### TL;DR
- `display` controls if/how an element is rendered (block, inline, flex, grid, etc.).
- Changing `display` can dramatically affect layout and element behavior.

---

### Common `display` Values
| Value         | Description                                                                 |
|-------------- |-----------------------------------------------------------------------------|
| `none`        | Element is not rendered; removed from layout flow.                          |
| `block`       | Element takes full line, starts on new line.                                |
| `inline`      | Element flows with text, no line break, width/height not respected.         |
| `inline-block`| Like `inline`, but width/height can be set.                                 |
| `flex`        | Element becomes a flex container (flexbox layout).                          |
| `grid`        | Element becomes a grid container (CSS grid layout).                         |
| `table`       | Behaves like a `<table>`.                                                   |
| `table-row`   | Behaves like a `<tr>`.                                                      |
| `table-cell`  | Behaves like a `<td>`.                                                      |
| `list-item`   | Behaves like a `<li>`, supports list styles.                                |

---

### Code Examples
```css
/* Hide an element */
.hidden {
  display: none;
}

/* Make a block-level container */
.container {
  display: block;
}

/* Inline element with custom width/height */
.inline-block {
  display: inline-block;
  width: 100px;
  height: 30px;
}

/* Flexbox layout */
.flex-row {
  display: flex;
  flex-direction: row;
}

/* Grid layout */
.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
```

---

### Key Points
- `display: none` removes the element from the layout and accessibility tree.
- `block` and `inline` are the most basic values; `flex` and `grid` enable modern layouts.
- `inline-block` is useful for inline elements that need width/height.
- Table and list-item values allow non-table elements to behave like tables/lists.
- Changing `display` can affect margin collapsing, box model, and stacking context.

---

### Interview Tips
- Be able to explain the difference between `block`, `inline`, and `inline-block`.
- Know when to use `flex` or `grid` for layouts.
- Show how `display: none` differs from `visibility: hidden` (the latter hides but keeps space).
- Demonstrate with code how changing `display` affects layout.

---

### Further Reading
- [MDN: CSS display](https://developer.mozilla.org/en-US/docs/Web/CSS/display)

---

## Cheatsheet: CSS Position Values (`static`, `relative`, `absolute`, `fixed`, `sticky`)

**The `position` property in CSS controls how an element is placed in the document flow and how it responds to top/right/bottom/left/z-index.**

### TL;DR
- `static`: Default, normal flow, ignores top/right/bottom/left/z-index.
- `relative`: Offset from its normal position, but still takes up space.
- `absolute`: Removed from flow, positioned relative to nearest positioned ancestor.
- `fixed`: Removed from flow, positioned relative to viewport, stays fixed on scroll.
- `sticky`: Acts as `relative` until a threshold, then `fixed`.

---

### Comparison Table
| Value      | In Flow? | Offset? | Reference | Scrolls with Page? | z-index? | Use Case |
|------------|---------|---------|-----------|--------------------|----------|----------|
| static     | Yes     | No      | N/A       | Yes                | No       | Default, normal layout |
| relative   | Yes     | Yes     | Itself    | Yes                | Yes      | Nudge element, tooltips |
| absolute   | No      | Yes     | Nearest positioned ancestor | No | Yes | Dropdowns, overlays |
| fixed      | No      | Yes     | Viewport  | No                 | Yes      | Sticky nav, modals |
| sticky     | Yes/No  | Yes     | Scroll container | Yes/No (hybrid) | Yes | Sticky headers |

---

### Code Examples
```css
/* static (default) */
.static-box {
  position: static;
}

/* relative */
.relative-box {
  position: relative;
  top: 10px; left: 20px;
}

/* absolute */
.absolute-box {
  position: absolute;
  top: 0; right: 0;
}

/* fixed */
.fixed-box {
  position: fixed;
  bottom: 0; right: 0;
}

/* sticky */
.sticky-box {
  position: sticky;
  top: 0;
}
```

---

### Key Points
- `static` is the default; top/right/bottom/left/z-index have no effect.
- `relative` moves the element visually, but its original space is preserved.
- `absolute` and `fixed` remove the element from the normal flow.
- `absolute` is positioned relative to the nearest ancestor with `position` other than `static`.
- `fixed` is always relative to the viewport and does not move on scroll.
- `sticky` toggles between `relative` and `fixed` based on scroll position.

---

### Interview Tips
- Be able to explain the difference between all position values.
- Know when to use each for layout, overlays, sticky headers, etc.
- Show how `absolute` and `fixed` are removed from flow, but `relative` is not.
- Demonstrate with code how each value affects layout and stacking.

---

### Further Reading
- [MDN: position](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [CSS Tricks: position](https://css-tricks.com/almanac/properties/p/position/)

---

## Cheatsheet: Key Considerations for Multilingual Sites (i18n)

**Designing and developing for multilingual sites (internationalization, i18n) requires careful attention to language, locale, layout, and user experience.**

### TL;DR
- Use the `lang` attribute and locale in URLs for SEO and accessibility.
- Account for text length, direction, and formatting differences.
- Never concatenate translated strings; use templates.
- Allow users to change language/region easily.

---

### SEO & Accessibility
- Set `<html lang="en">` (or appropriate language code) for every page.
- Use locale in URLs (e.g., `/en-US/`, `/zh-CN/`).
- Add `<link rel="alternate" hreflang="..." href="...">` for each language/region version.
- Provide a fallback with `hreflang="x-default"`.

---

### Locale vs Language
- **Locale**: Region-specific settings (date, time, currency, etc.).
- **Language**: The spoken/written language (may have multiple locales, e.g., `en-US`, `en-GB`).
- Always distinguish between language and locale for accurate formatting and translation.

---

### Language Variants
- Don't assume one language fits all regions (e.g., `en-US` ≠ `en-GB`, `zh-CN` ≠ `zh-TW`).
- Provide translations for each target locale.

---

### Predict, But Don't Restrict
- Use HTTP `Accept-Language` and IP for best-guess locale, but always let users switch language/region.

---

### Layout & Text Length
- Text can be much longer or shorter in different languages (e.g., German, French).
- Avoid fixed-width containers for text-heavy UI (headlines, buttons).
- Test layouts with real translations.

---

### Reading Direction
- Support both LTR (e.g., English, French) and RTL (e.g., Arabic, Hebrew) languages.
- Use `dir="rtl"` on `<html>` or containers for RTL languages.
- Mirror layouts and icons as needed for RTL.

---

### String Handling
- **Never concatenate translated strings** (e.g., avoid `"Hello " + name`).
- Use template strings with parameter substitution for each language.
- Example:
  - English: `"I will travel on {date}"`
  - Chinese: `"我会在{date}出发"`

---

### Date, Time, and Currency Formatting
- Use locale-aware formatting (e.g., `Intl.DateTimeFormat`, `Intl.NumberFormat`).
- Example:
  ```js
  const date = new Date('2024-05-31');
  console.log(new Intl.DateTimeFormat('en-US').format(date)); // May 31, 2024
  console.log(new Intl.DateTimeFormat('en-GB').format(date)); // 31/05/2024
  ```

---

### Images & Text
- Avoid putting text in images; use real text for easy translation and accessibility.

---

### Color & Culture
- Be aware that color meanings vary by culture; avoid color-only cues for important info.

---

### Key Points
- Always use proper language/locale codes and attributes.
- Design flexible layouts for variable text length and direction.
- Use locale-aware APIs for formatting.
- Never hardcode or concatenate UI strings.
- Test with real translations and RTL languages.

---

### Interview Tips
- Be able to list common i18n pitfalls (text length, direction, formatting, SEO).
- Show code for locale-aware formatting and string templates.
- Explain why user choice is critical for language/region.

---

### Further Reading
- [MDN: HTML lang attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/lang)
- [The Differences between Locales and Languages (Microsoft)](https://devblogs.microsoft.com/setup/the-differences-between-locales-and-languages)
- [MDN: Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

---

## Cheatsheet: `block` vs `inline` vs `inline-block` in CSS

**`block`, `inline`, and `inline-block` are the most common values for the CSS `display` property, each affecting layout and sizing differently.**

### TL;DR
- `block`: Fills parent width, starts on new line, all margins/paddings respected, can set width/height.
- `inline`: Flows with text, only horizontal margins/paddings respected, ignores width/height.
- `inline-block`: Flows with text, all margins/paddings respected, can set width/height.

---

### Comparison Table
| Property                        | `block`                                 | `inline-block`                              | `inline`                                 |
|----------------------------------|-----------------------------------------|---------------------------------------------|------------------------------------------|
| Size                            | Fills parent width                      | Depends on content                         | Depends on content                       |
| Positioning                     | Starts on new line                      | Flows with content, allows elements beside | Flows with content, allows elements beside |
| Can set width/height            | Yes                                     | Yes                                        | No (ignored)                             |
| Margins/paddings (vertical)     | All sides respected                     | All sides respected                        | Not respected (vertical)                 |
| Margins/paddings (horizontal)   | All sides respected                     | All sides respected                        | Respected                                |
| Aligned with `vertical-align`   | No                                      | Yes                                        | Yes                                      |
| Use cases                       | Layout containers (`div`, `section`)    | Buttons, images, form fields               | Text, links, spans, formatting tags      |

---

### Code Examples
```css
.block-example {
  display: block;
  width: 100%;
  margin: 10px 0;
}

.inline-example {
  display: inline;
  width: 100px; /* ignored */
  margin: 10px 0; /* vertical ignored */
}

.inline-block-example {
  display: inline-block;
  width: 100px;
  height: 40px;
  margin: 10px 0;
}
```

---

### Key Points
- `block` elements stack vertically, take full width, and respect all box model properties.
- `inline` elements flow with text, ignore width/height, and only respect horizontal spacing.
- `inline-block` combines inline flow with block sizing and spacing.
- Use `inline-block` for elements that need to size like blocks but flow like text (e.g., buttons in a row).

---

### Interview Tips
- Be able to explain the difference in layout, sizing, and spacing.
- Show code for each and describe use cases.
- Know that `inline-block` is a hybrid and very useful for custom UI components.

---

### Further Reading
- [MDN: display](https://developer.mozilla.org/en-US/docs/Web/CSS/display)
- [CSS Tricks: display](https://css-tricks.com/almanac/properties/d/display/)