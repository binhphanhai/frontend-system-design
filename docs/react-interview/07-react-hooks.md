# React Hooks for Interviews

*Master React hooks for interviews, covering key hooks like useState, useEffect, useContext, common pitfalls, and best practices for building reusable logic*

---

---

React hooks are special functions that start with `use`. Introduced in React 16.8, they allow developers to use state and lifecycle features in function components. This simplifies code organization, reduces boilerplate, and enables better logic reuse. This guide will help you tackle React hooks interview questions.

Familiarize yourself with the common hooks: `useState`, `useEffect`, `useContext`, `useRef`, `useId`—you will probably have to use some of them during interviews.

---

## `useState`

`useState` enables function components to track state within component instances. State is isolated and private. Use `useState` when a component needs local state that is contained within the component instance and not meant to be shared with siblings/parents. If you render a component in two separate places, each instance gets its own state.

```js
const [state, setState] = useState(initialState);
```

**Parameters:**
- `initialState` (Required): The initial value of the state. If it is a function, that function will be called to lazily initialize the state.

When updating based on the previous state, use the function version of `setState`:

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(prevCount => prevCount + 1)}>
      Count: {count}
    </button>
  );
}
```

**Pitfalls:**
- Directly mutating state instead of using the setter function (`setState`) or not passing a new object to the setter function
- Referencing stale values in closures and updating with stale values; use the function version of `setState` if possible
- Using `useState` when a value doesn't affect rendering; use [`useRef`](#useref) instead

Further reading: [useState - React](https://react.dev/reference/react/useState)

### Common mistake: mutating state directly

```js
const [user, setUser] = useState({ name: 'Alice', age: 25 });
user.age = 26; // ❌ This won't trigger a re-render
```

It is also not a good practice to re-use state objects:

```js
function onClick() {
  user.age = 26;
  setUser(user); // ❌ Calling setter with the same object
}
```

Instead, create a new object:

```js
setUser(prevUser => ({ ...prevUser, age: 26 }));
```

### Common mistake: updating state without considering previous state

```js
setCount(count + 1); // Potential stale state issue if used within intervals or async functions
```

One way to fix this is to use the functional version of the setter if your new state relies on the previous state:

```js
setCount(prevCount => prevCount + 1);
```

---

## `useEffect`

`useEffect` is a hook primarily for synchronizing a component with an external system. It can be used for executing side effects, such as fetching data, subscribing to events, or interacting with the DOM.

```js
useEffect(effectFunction, dependencyArray);
```

**Parameters:**
1. `effectFunction` (Required): A function that contains the side effect logic
2. `dependencies` (Optional): An array of values that determine when the effect runs

Depending on when the effect should run, the `dependencies` array is defined accordingly:

| When should the effect run?         | Dependency array      | Example                                   |
|-------------------------------------|----------------------|-------------------------------------------|
| After every render                  | None                 | `useEffect(() => {...});`                 |
| Once on mount                       | `[]` (empty)         | `useEffect(() => {...}, []);`             |
| When any dependency changes         | `[var1, var2]`       | `useEffect(() => {...}, [var1, var2]);`   |
| Cleaning up (on unmount or re-run)  | Varies               | `useEffect(() => { return () => {...}; }, []);` |

`useEffect` is primarily for side effects / interacting with external services and that isn't too common during interviews. If you find yourself reaching for `useEffect` in your solutions, consider if there are alternatives.

```jsx
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(response => response.json())
      .then(setData);
  }, []);

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
```

**Pitfalls:**
- Not adding dependencies in the dependency array leading to stale closures
- Causing infinite loops by updating state inside `useEffect` without proper dependency management
- Unnecessary re-renders due to using objects/arrays in the dependency array
- Not cleaning up side effects such as clearing timers and unsubscribing from events

It's a good practice to provide a dependency array in `useEffect`, `useCallback`, and `useMemo` to avoid unexpected behavior. However, in the future, the [React compiler](https://react.dev/learn/react-compiler) aims to remove the need for writing `useCallback` and `useMemo` manually.

#### Read the manual

The unfortunate truth is that `useEffect` is just full of footguns and is hard to use, even for experienced engineers. Our recommendation is to avoid using `useEffect` in interviews if there are alternatives.

Given that interview questions are mostly self-contained, `useEffect`s aren't too commonly needed. Hence you will find that the official solutions by GreatFrontEnd's React user interface questions do not have too much `useEffect` usage. If you are using `useEffect` in your code, compare with the official solutions to see how you can possibly avoid using it.

Either way, it's best to read the following pages of the React documentation to understand `useEffect` better:

1. [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
2. [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
3. [Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects)
4. [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects)
5. [Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)

Further reading: [useEffect - React](https://react.dev/reference/react/useEffect)

### Common mistake: missing dependencies leading to stale closures

```js
useEffect(() => {
  fetchData();
}, []); // What if fetchData depends on props?
```

Ensure dependencies are correct, or use a callback inside `useEffect`:

```js
useEffect(() => {
  fetchData(someProp);
}, [someProp]);
```

### Common mistake: unnecessary effect invocations due to object/array dependency in `useEffect`

In the following example, the effect should only run when `filteredTodos` change, but the effect still runs when the "Force re-render" button is triggered. This is because a new `filteredTodos` array is recreated on every render, causing `useEffect` to run unnecessarily.

```jsx
function TodoList({ todos }) {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('in_progress');
  const filteredTodos = todos.filter(todo => todo.status === status);

  useEffect(() => {
    console.log('filteredTodos have changed');
  }, [filteredTodos]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Force re-render</button>
      <button onClick={() => setStatus('complete')}>Change status</button>
    </div>
  );
}
```

Use `useMemo` to memoize the object, ensuring that `filteredTodos` retain the same reference unless the `todos` or `status` change:

```jsx
function TodoList({ todos }) {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('in_progress');
  const filteredTodos = useMemo(
    () => todos.filter(todo => todo.status === status),
    [todos, status]
  );

  useEffect(() => {
    console.log('filteredTodos have changed');
  }, [filteredTodos]);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Force re-render</button>
      <button onClick={() => setStatus('complete')}>Change status</button>
    </div>
  );
}
```

### Common mistake: memory leaks due to missing cleanup

```js
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Running...');
  }, 1000);
}, []); // No cleanup
```

Return a cleanup function when needed:

```js
useEffect(() => {
  const interval = setInterval(() => {
    console.log('Running...');
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

---

## `useContext`

`useContext` provides a way to share state across components without prop drilling. It's useful for global state like themes, authentication, or user settings.

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle theme
      </button>
      <ThemedComponent />
    </ThemeContext.Provider>
  );
}

function ThemedComponent() {
  const theme = useContext(ThemeContext);
  return (
    <div style={{ backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>
      Theme: {theme}
    </div>
  );
}
```

> In React 19, Context providers can use `<ThemeContext>` directly without doing `<ThemeContext.Provider>`.

React automatically re-renders all the children that use a particular context starting from the provider that receives a different value.

**Pitfalls:**
- Using objects/functions as context values without memoization, leading to unnecessary re-renders
- Overusing `useContext` for deeply nested state that might be better managed with a state management library

Further reading: [useContext - React](https://react.dev/reference/react/useContext)

### Common mistake: using objects/functions as context values without memoization

Here the context value is a list of todos. Whenever `TodoListContainer` re-renders (for example, on a route update), this will be a new array created thanks to the filtering, so React will also have to re-render all components deep in the tree that call `useContext(TodoListContext)`.

```jsx
function TodoListContainer() {
  const [todos, setTodos] = useState([
    { title: 'Fix bug', status: 'in_progress' },
    { title: 'Add button', status: 'completed' },
  ]);
  const [status, setStatus] = useState('in_progress');
  const filteredTodos = todos.filter(todo => todo.status === status);

  return (
    <TodoListContext.Provider value={filteredTodos}>
      <TodoList />
    </TodoListContext.Provider>
  );
}
```

We can use `useMemo` to memoize `filteredTodos`, so it's only recalculated when `todos` or `status` change. This optimization can be significant for large lists.

```jsx
function TodoListContainer() {
  const [todos, setTodos] = useState([
    { title: 'Fix bug', status: 'in_progress' },
    { title: 'Add button', status: 'completed' },
  ]);
  const [status, setStatus] = useState('in_progress');
  const filteredTodos = useMemo(
    () => todos.filter(todo => todo.status === status),
    [todos, status]
  );

  return (
    <TodoListContext.Provider value={filteredTodos}>
      <TodoList />
    </TodoListContext.Provider>
  );
}
```

---

## `useRef`

`useRef` stores a mutable reference that persists across renders, commonly used for:
- References data that is specific to the component instance
- Storing references to the DOM
- Storing data that does not affect the UI of the component (e.g. timeout or interval IDs). Mutating the ref values does not cause re-renders

```jsx
import { useRef } from 'react';

function FocusInput() {
  const inputRef = useRef(null);
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus Input</button>
    </div>
  );
}
```

**Pitfalls:**
- Overusing `useRef` for state instead of [`useState`](#usestate)

Further reading: [useRef - React](https://react.dev/reference/react/useRef)

---

## `useId`

`useId` is a hook introduced in React 18 that generates unique IDs for accessibility attributes and form elements. It ensures that the IDs are unique within a component tree, even when server-rendering.

```jsx
import { useId } from 'react';

function Form() {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>Name:</label>
      <input id={id} type="text" />
    </div>
  );
}
```

- Primarily for design system components where IDs are used for accessibility attributes (like `aria-labelledby`) yet they need to have unique values because there can be multiple component instances on the page
- Generating unique IDs for form inputs, especially in server-rendered applications
- Avoiding having to manually generate unique IDs with libraries or global counters

**Pitfalls:**
- Do not use `useId` for keys in lists. Use stable values like database IDs instead
- It is only useful for generating static IDs and should not be used to track dynamic state

Further reading: [useId - React](https://react.dev/reference/react/useId)

---

## Rules of Hooks

React hooks follow a strict set of rules to ensure they function correctly and maintain state consistency across renders. Violating these rules can lead to bugs, unintended behavior, or broken components.

1. **Only call hooks at the top level:** Do not call hooks inside loops, conditions, nested functions, or `try`/`catch`/`finally` blocks
2. **Only call hooks from React function components or custom hooks:** Avoid using hooks in regular JavaScript functions

---

### Examples of incorrect vs correct hooks usage

#### Do not call hooks inside conditions

❌ **Wrong: Call hooks inside a condition**

```js
if (someCondition) {
  // ❌ Wrong: Hook inside a condition
  const [count, setCount] = useState(0);
}
```

✅ **Correct: Call hooks at the top level**

```js
const [count, setCount] = useState(0);
if (someCondition) {
  console.log(count);
}
```

Hooks must be called in the same order on every render. Conditional hooks may cause React to misalign state updates.

#### Only call hooks within React components or custom hooks

❌ **Wrong: Call a hook outside a component**

```js
// ❌ Wrong: Outside of the component
const count = useState(0);

function App() {
  // ...
}
```

✅ **Correct: Call hooks inside functional components or custom hooks**

```js
function App() {
  const [count, setCount] = useState(0);
  return <p>{count}</p>;
}

function useCounter() {
  const [count, setCount] = useState(0);
  return [count, () => setCount(x => x + 1)];
}
```

Hooks rely on React's render cycle and component state. Calling hooks outside a component prevents React from tracking state.

#### Do not call hooks after a conditional return

❌ **Wrong: Call hooks conditionally**

```js
function Counter({ hidden }) {
  if (hidden) {
    return;
  }
  // ❌ Wrong: After a conditional return
  const [count, setCount] = useState(0);
  // ...
}
```

✅ **Correct: Call hooks without a condition**

```js
function Counter({ hidden }) {
  const [count, setCount] = useState(0);
  if (hidden) {
    return;
  }
  // ...
}
```

#### Do not call hooks within loops

❌ **Wrong: Call hooks inside a loop**

```js
for (let i = 0; i < 2; i++) {
  // ❌ Wrong: Hook inside a loop
  const [count, setCount] = useState(0);
}
```

✅ **Correct: Call hooks without a loop**

```js
const [count1, setCount1] = useState(0);
const [count2, setCount2] = useState(0);
```

React assumes hooks are called in the same order every render. Calling them in a different order or different number of calls can break React's internal state tracking.

#### Do not call in event handlers

❌ **Wrong: Call hooks inside an event handler**

```js
function Counter() {
  function handleClick() {
    // ❌ Wrong: Inside an event handler
    const theme = useContext(ThemeContext);
  }
  // ...
}
```

✅ **Correct: Call hooks outside event handler**

```js
function Counter() {
  const theme = useContext(ThemeContext);
  function handleClick() {
    // ...
  }
  // ...
}
```

Further reading: [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)

---

## Custom Hooks

Custom hooks in React allow you to extract reusable logic from components while maintaining state and side effects using built-in hooks like `useState`, `useEffect`, `useMemo`, and others.

They follow the same rules as React hooks but enable better code reuse, abstraction, and separation of concerns in a clean and maintainable way.

1. **Code reusability:** Instead of duplicating logic across components, a custom Hook encapsulates the logic and makes it reusable
2. **Separation of concerns:** Components should focus on UI rendering, while custom hooks handle logic (state management, fetching data, event listeners, etc.)
3. **Cleaner & more readable components:** Extracting logic into a Hook makes components less cluttered and more focused on presentation
4. **Encapsulation of side effects:** Custom hooks allow managing side effects (like API calls) separately, making debugging and testing easier

A custom hook:
- Is a JavaScript function that starts with `use` (e.g., `useCounter`, `useFetch`)
- Must call other React hooks (e.g., `useState`, `useEffect`). If a custom hook does not call any React hooks, then it doesn't need to be a hook
- Keep them focused – one purpose per hook
- Optionally, returns state or functions that components can use

Here's an example of a `useCounter` custom hook. The value of such a hook is that it does not expose the `setCount` function and users of the hook are restricted to the exposed operations, they can only increment, decrement, or reset the value.

```js
import { useState } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
}

function CounterComponent() {
  const { count, increment, decrement, reset } = useCounter(10);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

Further reading: [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## What You Need to Know for Interviews

1. **Explain the purpose of hooks:** Why React introduced hooks and how they replace class component lifecycle methods
2. **Know the common hooks:** Understand when and why to use `useState`, `useEffect`, `useContext`, and `useRef`.
   - `useState`: Use the functional update form of `setState` when state depends on the previous state e.g. `setCount((prevCount) => prevCount + 1)`. This also eliminates the problem of stale closures within the event handlers
3. **Understand re-rendering issues:** Recognize how dependency arrays impact performance and how `useMemo`/`useCallback` optimize rendering
4. **Implement a custom hook:** Be able to write and explain a reusable custom hook in an interview
5. **Debug common hook pitfalls:** Identify and fix common mistakes like missing dependencies in `useEffect` or unnecessary state updates causing re-renders

---

## Practice Questions

**Quiz:**
- [What are the benefits of using hooks in React?](/questions/quiz/what-are-the-benefits-of-using-hooks-in-react?framework=react&tab=quiz)
- [What are the rules of React hooks?](/questions/quiz/what-are-the-rules-of-react-hooks?framework=react&tab=quiz)
- [What is the difference between `useEffect` and `useLayoutEffect` in React?](/questions/quiz/what-is-the-difference-between-useeffect-and-uselayouteffect-in-react?framework=react&tab=quiz)
- [What is the purpose of callback function argument format of `setState()` in React and when should it be used?](/questions/quiz/what-is-the-purpose-of-callback-function-argument-format-of-setstate-in-react-and-when-should-it-be-used?framework=react&tab=quiz)
- [What does the dependency array of `useEffect` affect?](/questions/quiz/what-does-the-dependency-array-of-useeffect-affect?framework=react&tab=quiz)
- [What is the `useRef` hook in React and when should it be used?](/questions/quiz/what-is-the-useref-hook-in-react-and-when-should-it-be-used?framework=react&tab=quiz)
- [What is the `useCallback` hook in React and when should it be used?](/questions/quiz/what-is-the-usecallback-hook-in-react-and-when-should-it-be-used?framework=react&tab=quiz)
- [What is the `useMemo` hook in React and when should it be used?](/questions/quiz/what-is-the-usememo-hook-in-react-and-when-should-it-be-used?framework=react&tab=quiz)
- [What is the `useReducer` hook in React and when should it be used?](/questions/quiz/what-is-the-usereducer-hook-in-react-and-when-should-it-be-used?framework=react&tab=quiz)
- [What is the `useId` hook in React and when should it be used?](/questions/quiz/what-is-the-useid-hook-in-react-and-when-should-it-be-used?framework=react&tab=quiz)
- [What is `forwardRef()` in React used for?](/questions/quiz/what-is-forwardref-in-react-used-for?framework=react&tab=quiz)

**Coding:**
- [Progress Bars](/questions/user-interface/progress-bars/react?framework=react&tab=coding)
- [Tabs](/questions/user-interface/tabs/react?framework=react&tab=coding)
- [Analog Clock](/questions/user-interface/analog-clock/react?framework=react&tab=coding)
- [Digital Clock](/questions/user-interface/digital-clock/react?framework=react&tab=coding)