# Designing State in React Interviews

*How to think about state in React, detailing best practices for structuring, resetting, and updating state to build efficient, maintainable, and performant applications*

---

---

State is the backbone of any React application, dictating how components behave and render over time. Unlike static data, state enables dynamic updates, user interactions, and real-time changes without requiring a full page reload.

A well-structured state improves code maintainability, enhances performance, and prevents unnecessary re-renders. Poor state management, on the other hand, can lead to buggy code, sluggish applications, and unpredictable behavior.

---

## How to Structure State

When creating a stateful component, you need to decide how many state variables to use and how to structure their data. While a suboptimal state design can still produce a functioning application, following these key principles can help you make better decisions and improve maintainability.

### Keep State Local Where Possible

❌ **Bad:** Unnecessarily lifting state up when it's only used in one component.

```jsx
function App() {
  const [count, setCount] = useState(0);
  return <Child count={count} setCount={setCount} />;
}

function Child({ count, setCount }) {
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

✅ **Good:** Keep the state inside the component that uses it. When the count changes, only `Child` needs to be re-rendered.

```jsx
function App() {
  return <Child />;
}

function Child() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Group Related State Together

❌ **Bad:** Using separate `useState` calls for related values.

```jsx
function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  return (
    <div
      onPointerMove={e => {
        setX(e.clientX);
        setY(e.clientY);
      }}
    >
      <p>Point: ({x}, {y})</p>
    </div>
  );
}
```

✅ **Good:** Use an object to group related state. Since `x` and `y` together define a single point, they should be managed as a unit.

```jsx
function App() {
  const [point, setPoint] = useState({ x: 0, y: 0 });
  return (
    <div
      onPointerMove={e => {
        setPoint({ x: e.clientX, y: e.clientY });
      }}
    >
      <p>Point: ({point.x}, {point.y})</p>
    </div>
  );
}
```

### Avoid Possible Contradictions in State

❌ **Bad:** Separate `isSubmitting` and `isSubmitted` state

```jsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isError, setIsError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    fetch('/api/submit', { method: 'POST' })
      .then(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      })
      .catch(() => {
        setIsSubmitting(false);
        setIsError(true);
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isSubmitting}>Submit</button>
      {isSubmitted && <p>Form submitted successfully!</p>}
    </form>
  );
}
```

In this example, contradictory states are possible given there are 3 state values used to represent the state of the form. If new code somehow accidentally does `setIsSubmitting(true); setIsSubmitted(true);` then the component is both submitting and submitted, which does not make sense.

✅ **Good:** Using a single `status` state

```jsx
function ContactForm() {
  const [status, setStatus] = useState('idle'); // "idle", "submitting", "success", "error"

  function handleSubmit(event) {
    event.preventDefault();
    setStatus('submitting');
    fetch('/api/submit', { method: 'POST' })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={status === 'submitting'}>Submit</button>
      {status === 'success' && <p>Form submitted successfully!</p>}
      {status === 'error' && <p>Submission failed. Please try again.</p>}
    </form>
  );
}
```

**Why is this better?**
- **Prevents contradictions:** The form can only be in one state at a time
- **Handles errors properly:** The UI can react to errors without incorrectly marking the form as "submitted"
- **Simpler logic:** No need to sync multiple boolean states manually

### Derive State Instead of Storing Redundant Values

❌ **Bad:** Storing both the list and a count when count can be derived.

```jsx
const [todos, setTodos] = useState(['Task 1', 'Task 2']);
const [count, setCount] = useState(2); // Unnecessary state that needs to be synced

useEffect(() => {
  setCount(todos.length);
}, [todos]);
```

✅ **Good:** Derive count from the `todos` array.

```jsx
const [todos, setTodos] = useState(['Task 1', 'Task 2']);
const count = todos.length; // No need to store it separately
```

Other good principles for structuring state include:
- [Avoid duplication in state](https://react.dev/learn/choosing-the-state-structure#avoid-duplication-in-state)
- [Avoid deeply nested state](https://react.dev/learn/choosing-the-state-structure#avoid-deeply-nested-state)

---

## Resetting State

The simplest way to reset state is by setting it back to its initial value. However, when there are multiple state values, it can be troublesome to have to call multiple setters to reset to the initial state. You might miss out certain state fields. That's why it's important to group state and also define functions for each possible action.

One way of doing a full reset of a component is to change the `key` property when rendering. When the `key` changes, React will discard the element and recreate it from scratch. `key`s are useful beyond rendering lists.

```jsx
function Form() {
  return (
    <form>
      <input type="text" placeholder="John Doe" />
      <button>Submit</button>
    </form>
  );
}

function App() {
  const [key, setKey] = useState(0);
  return (
    <div>
      <Form key={key} />
      <button onClick={() => setKey(prev => prev + 1)}>Reset form</button>
    </div>
  );
}
```

**How it works:**
- Changing the `key` forces React to **unmount and remount** the `Form` component
- `<form>`s have built-in ways to reset its state (e.g. `formElement.reset()`), but the `key` approach works for any component

Further reading: [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)

---

## Controlled vs Uncontrolled Components

In React, a component can be described as controlled or uncontrolled based on how its state is managed. These terms are not strict technical definitions but rather a way to understand how components interact with their parents.

> **Note:** The legacy definition of uncontrolled components was restricted to form `<input>` elements and whether the state lived within the DOM or was controlled by React. The [modern definition](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components) expands the definition of uncontrolled to be more than form `<input>` elements.

| **Type**      | **Who controls state?**      | **Pros**                                 | **Cons**                        |
|--------------|------------------------------|------------------------------------------|----------------------------------|
| **Controlled**   | Parent via props                | Flexible, easily coordinated with other components | Requires more props/configuration |
| **Uncontrolled** | Component itself via local state | Simpler to use, fewer props needed       | Less flexible, harder to coordinate |

A **controlled component** is one where its behavior is fully determined by its props rather than its own local state. This allows the parent component to have full control over how the component behaves.

An **uncontrolled component** manages its own state internally, making it independent of the parent component. The parent cannot directly modify the state of an uncontrolled component.

Most components are not strictly controlled or uncontrolled; they often use a mix of both. A good practice is to start with local state (uncontrolled) and lift state up when needed.

**Example:** Accordions can be controlled or uncontrolled. On marketing pages, accordions for FAQ sections can be uncontrolled. On dashboards, accordions might need to be controlled for coordinated expansion/collapse.

---

## Context

React context is used for managing global or shared data that needs to be accessible to its descendants without passing props manually through each level of the component tree.

Context is commonly paired with state and used at the top of the app to make app-level data available to the entire app such as theming and authentication. Whenever the context provider value changes, all descendants consuming the context (`useContext(...)`) will be re-rendered.

```jsx
const ThemeContext = React.createContext();

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Child />
    </ThemeContext.Provider>
  );
}

function Child() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Pitfalls of Context

Context is an easier (but not necessarily best) way to make data available to multiple components because of the following pitfalls:
- **Not statically analyzable:** Unlike props, which are explicitly passed down to components, context is dynamically provided at runtime. This means you can't easily determine at build time whether a component has access to the necessary context, leading to potential errors that only appear when the app is running
- **May cause unnecessary re-renders:** When a context value updates, all consuming components re-render, even if they don't use the changed part of the context. This can lead to performance issues, especially when the provider holds a large object or updates frequently. Splitting context or memoizing values can help mitigate this
- **Easy to add but hard to remove:** Context is convenient for managing global state, but once added, removing it or refactoring can be difficult, especially in large applications. Child components could be relying on a removed context provider but static analysis will not be able to flag the issue
- **Should not be used for frequent updates:** Context is not optimized for state that updates frequently, such as form input, animations, or rapidly changing data (e.g., typing in a search bar). Instead, use `useState` or `useReducer` locally and only update context when necessary to avoid unnecessary renders
- **Do not put too much data into a single provider:** If too much unrelated data is stored in one context provider, it increases the likelihood of unnecessary re-renders and makes the state harder to manage. Instead, split context into multiple providers, each handling a specific concern (e.g., separate providers for authentication, theme, and notifications)

### Use Cases for Context
- **Theming:** App-wide theme switching (dark mode, high contrast)
- **Current user (Authentication):** User info available throughout the app
- **Language and localization:** Store and provide the current language and translations
- **Routing:** Navigation state for custom routers
- **Notifications and alerts:** Centralized logic for showing/dismissing alerts
- **Global modals and dialogs:** Open/close state for modals triggered from anywhere
- **Saving user preferences:** UI preferences like sidebar state, sorting options
- **Managing complex state with reducers:** Use `useReducer` with context for global state

Further reading: [Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)

---

## Reducers

As an app grows, the amount of state in the app increases and these things happen:
- **Complex state transitions:** The number of ways state can change increases proportionately or even exponentially
- **Multiple origins for transitions:** State updates can be triggered from multiple places (UI, background events, etc.)
- **Inconsistent state transitions:** It becomes harder to see at a glance all the different ways a component's state can get updated. Certain state values should be modified together (e.g. request state and error message) but the logic might not be consistent in various parts of the UI

One way to manage state at a larger scale is to consolidate the possible changes into "actions" and consolidate the logic for how state should change in response to these actions.

A reducer in React is a function that manages complex state logic by taking the current state and an action, then returning a new state based on that action. It follows the Redux pattern and is commonly used with the `useReducer` hook, which makes state updates more predictable and easier to debug. All changes to the state have to be made through an action, the state should not be modified directly.

```js
const newState = reducer(currentState, action);
```

A reducer function follows this structure:

```js
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    default:
      return state; // Return current state if action is unknown
  }
}
```
- `state`: Represents the current state
- `action`: An object describing the update (e.g., `{ type: "INCREMENT" }` with an optional payload field)
- `reducer`: Pure function that takes in the current `state` and `action` and returns a new state based on the action

Here's an example of a counter implemented using reducers:

```jsx
function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return (
    <div>
      <p>Count: {state.count}</p>
      <button aria-label="Increment" onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button aria-label="Decrement" onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

1. `useReducer(reducer, initialState)` initializes state using the `reducer` function
2. `dispatch({ type: "INCREMENT" })` triggers the reducer, updating state accordingly
3. State updates **do not mutate** the previous state but return a new object

### Use Cases of Reducers

`useReducer` is useful for managing complex state updates where multiple actions modify the state in a structured way. Here's how reducers help in different use cases:

1. **Complex multi-step forms:** Forms with multiple steps or dependent fields can be hard to manage with useState. Reducers help reduce repetitive state updates by centralizing form logic. Keeps form submission, validation, and step navigation logic clean.
2. **State-driven UI (e.g. Handling modals, notifications, dropdown menus):** Managing modals, notifications, dropdown menus, with only `useState` can get messy. Multiple UI elements (e.g., opening modals, dismissing notifications) share state, making it harder to track.
3. **Finite state machines and flows requiring transition:** Flows with well-defined behavior (e.g., authentication, multi-step processes) follow a finite number of states. Using `useState` for each authentication step results in too many independent state variables. `useReducer` helps to structure state transitions so that they are predictable.

### Benefits of Reducers
- **Readability:** Reducers centralize state logic changes and this separation of actions vs. reducers improves readability
- **Debugging:** Easier to debug with `useReducer` as you can add a `console.log` at the top to see every state update and which action caused it
- **Complex state changes:** Use reducers when state changes involve multiple steps or dependencies
- **State management:** Reducers work well with React Context for non-local state management. However, there are better alternatives like Redux, Zustand, and Jotai
- **Pure:** Reducers should not have side effects, return the same output for the same input, and always return a new state object, as React depends on immutability for re-renders
- **Testing:** Reducers don't depend on the UI and being pure functions, they don't require a React environment or much set up to be tested

Further reading: [Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)

---

## What You Need to Know for Interviews

Given the close-ended and limited nature of UI coding questions during interviews, bear the following in mind:

- **State design is crucial:** Since the question is small, there are usually not many fields needed and hence limited in the ways state can be structured. You absolutely have to come up with the most efficient and minimal state for the question. Remember the suggested practice – derive state where you can, avoid possible contradictions in state, and group state fields appropriately.
- **State lives at the top level:** Given that most questions will be small, it is highly likely that the state should live at the top level / app level and most children should be stateless, receiving data as props. The few cases where state should live within children are ephemeral state in form inputs or state that isn't needed across the whole app.
- **You probably won't need context:** Most interview questions are small and prop passing will probably not be deeper than two or three levels in the worst case. Stick with prop passing since it's simpler.
- **You probably won't need reducers:** Most UI coding questions are small and will not require that many different state changes. You can consolidate state updates within action functions without the need for `useReducer`. The exception being games since game logic can get pretty complex.

---

## Practice Questions

**Quiz:**
- [What is the difference between controlled and uncontrolled React Components?](/questions/quiz/what-is-the-difference-between-controlled-and-uncontrolled-react-components?framework=react&tab=quiz)
- [What are some pitfalls about using context in React?](/questions/quiz/what-are-some-pitfalls-about-using-context-in-react?framework=react&tab=quiz)
- [How do you reset a component's state in React?](/questions/quiz/how-do-you-reset-a-components-state-in-react?framework=react&tab=quiz)
- [How do you decide between using React state, context, and external state managers?](/questions/quiz/how-do-you-decide-between-using-react-state-context-and-external-state-managers?framework=react&tab=quiz)

**Coding:**
- [Data Table](/questions/user-interface/data-table/react?framework=react&tab=coding)
- [Data Table II](/questions/user-interface/data-table-ii/react?framework=react&tab=coding)
- [Todo List](/questions/user-interface/todo-list/react?framework=react&tab=coding)
- [Traffic Light](/questions/user-interface/traffic-light/react?framework=react&tab=coding)
- [Tic-tac-toe](/questions/user-interface/tic-tac-toe/react?framework=react&tab=coding)
- [Connect Four](/questions/user-interface/connect-four/react?framework=react&tab=coding)
- [Image Carousel](/questions/user-interface/image-carousel/react?framework=react&tab=coding)
- [Pixel Art](/questions/user-interface/pixel-art/react?framework=react&tab=coding)
- [Transfer List](/questions/user-interface/transfer-list/react?framework=react&tab=coding)
- [Undoable Counter](/questions/user-interface/undoable-counter/react?framework=react&tab=coding)
- [Users Database](/questions/user-interface/users-database/react?framework=react&tab=coding)
- [Whack-A-Mole](/questions/user-interface/whack-a-mole/react?framework=react&tab=coding)
- [Memory Game](/questions/user-interface/memory-game/react?framework=react&tab=coding)
- [Nested Checkboxes](/questions/user-interface/nested-checkboxes/react?framework=react&tab=coding)
- [Wordle](/questions/user-interface/wordle/react?framework=react&tab=coding)