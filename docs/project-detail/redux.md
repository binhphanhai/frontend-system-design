# Redux: Predictable State Management

## Table of Contents

- [Introduction](#introduction)
- [Core Concepts](#core-concepts)
- [Getting Started](#getting-started)
- [Under the Hood: How Redux Works](#under-the-hood-how-redux-works)
- [Redux Toolkit (Modern Redux)](#redux-toolkit-modern-redux)
- [Middleware and Async Actions](#middleware-and-async-actions)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)
- [Conclusion](#conclusion)

## Introduction

Redux is a predictable state container for JavaScript applications, most commonly used with React. As highlighted in the [Redux GitHub repository](https://github.com/reduxjs/redux), it helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test.

### Key Principles

1. **Single Source of Truth**: The global state is stored in a single store
2. **State is Read-Only**: The only way to change state is by dispatching actions
3. **Changes are Made with Pure Functions**: Reducers specify how the state tree is transformed

### When to Use Redux

- You have reasonable amounts of data changing over time
- You need a single source of truth for your state
- You find that keeping all your state in a top-level component is no longer sufficient
- You need to share data between components that don't have a parent-child relationship

## Core Concepts

### Actions

Actions are plain JavaScript objects that describe what happened in your application. They are the only way to trigger state changes in Redux and must have a `type` property that indicates the type of action being performed.

**What this code does:** Defines action types and action creator functions for a todo application
**Steps:**

1. Define string constants for action types (prevents typos and enables better tooling)
2. Create action creator functions that return action objects
3. Include relevant data in the `payload` property
4. Follow consistent naming conventions for predictable patterns

**Input:** Action creators receive parameters (text, id) to create specific actions
**Output:** Plain JavaScript objects with `type` and `payload` properties that describe state changes

**Key concepts:**

- Action types are string constants that describe what happened
- Action creators are functions that return action objects
- Payload contains the data needed to perform the state change
- Actions are dispatched to the store to trigger state updates

```javascript
// Action types - string constants prevent typos and enable IDE autocomplete
const ADD_TODO = "ADD_TODO"; // Action to add a new todo item
const TOGGLE_TODO = "TOGGLE_TODO"; // Action to toggle todo completion status
const DELETE_TODO = "DELETE_TODO"; // Action to remove a todo item

// Action creators - functions that return action objects
// These provide a consistent API for creating actions with proper structure

const addTodo = (text) => ({
  type: ADD_TODO, // Required: describes what happened
  payload: {
    // Optional: data needed for the action
    id: Date.now(), // Simple ID generation (use uuid in production)
    text, // The todo text from user input
    completed: false, // New todos start as incomplete
  },
});

const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: { id }, // Only need the ID to find and toggle the todo
});

const deleteTodo = (id) => ({
  type: DELETE_TODO,
  payload: { id }, // Only need the ID to find and delete the todo
});

// Example usage:
// dispatch(addTodo("Learn Redux"));     // Creates: { type: "ADD_TODO", payload: { id: 123, text: "Learn Redux", completed: false } }
// dispatch(toggleTodo(123));            // Creates: { type: "TOGGLE_TODO", payload: { id: 123 } }
// dispatch(deleteTodo(123));            // Creates: { type: "DELETE_TODO", payload: { id: 123 } }
```

### Reducers

Reducers are pure functions that take the current state and an action, and return a new state. They specify how the application's state changes in response to actions and must follow strict rules: they must be pure, never mutate state directly, and always return a new state object.

**What this code does:** Implements a reducer function that manages todo list state
**Steps:**

1. Define initial state structure with todos array and filter setting
2. Create reducer function that accepts current state and action
3. Use switch statement to handle different action types
4. Return new state objects without mutating the original state
5. Handle unknown actions by returning current state unchanged

**Input:** Current state object and action object with type and payload
**Output:** New state object with updated data based on the action

**Reducer rules:**

- Must be pure functions (same input always produces same output)
- Never mutate the state directly
- Always return a new state object for changes
- Return current state for unknown action types

**State immutability patterns:**

- Use spread operator (...) to copy objects and arrays
- Use array methods like map(), filter() that return new arrays
- Never use push(), pop(), splice() or direct property assignment

```javascript
// Initial state defines the structure and default values for the todo app
const initialState = {
  todos: [], // Array to store all todo items
  filter: "ALL", // Current filter: ALL, ACTIVE, COMPLETED
};

// Reducer function - the heart of Redux state management
// Takes current state and action, returns new state
const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TODO:
      // Immutable update: create new state object with new todo added
      return {
        ...state, // Copy all existing state properties
        todos: [...state.todos, action.payload], // Create new array with new todo
      };

    case TOGGLE_TODO:
      // Immutable update: create new state with modified todo
      return {
        ...state, // Copy all existing state properties
        todos: state.todos.map(
          (
            todo // Create new array with updated todo
          ) =>
            todo.id === action.payload.id
              ? { ...todo, completed: !todo.completed } // Update matching todo
              : todo // Keep other todos unchanged
        ),
      };

    case DELETE_TODO:
      // Immutable update: create new state without the deleted todo
      return {
        ...state, // Copy all existing state properties
        todos: state.todos.filter(
          (
            todo // Create new array excluding deleted todo
          ) => todo.id !== action.payload.id
        ),
      };

    default:
      // Always return current state for unknown actions
      // This ensures the reducer handles any action type gracefully
      return state;
  }
};

// Example state transformations:
// Initial: { todos: [], filter: "ALL" }
// ADD_TODO: { todos: [{ id: 1, text: "Learn Redux", completed: false }], filter: "ALL" }
// TOGGLE_TODO: { todos: [{ id: 1, text: "Learn Redux", completed: true }], filter: "ALL" }
// DELETE_TODO: { todos: [], filter: "ALL" }
```

### Store

The store holds the complete state tree of your application and provides methods to access state, dispatch actions, and subscribe to changes. It's the central hub that coordinates all Redux operations and ensures predictable state management.

**What this code does:** Creates a Redux store and demonstrates basic store operations
**Steps:**

1. Import createStore function from Redux
2. Create store by passing in the root reducer
3. Subscribe to state changes for debugging/logging
4. Dispatch actions to trigger state updates

**Input:** Reducer function that defines how state changes
**Output:** Store object with methods to interact with application state

**Store methods:**

- `getState()`: Returns the current state tree
- `dispatch(action)`: Sends an action to update state
- `subscribe(listener)`: Registers a callback for state changes
- `replaceReducer(nextReducer)`: Replaces the current reducer (advanced use)

**Store responsibilities:**

- Holds the complete application state
- Provides access to state via getState()
- Allows state updates via dispatch(action)
- Registers listeners via subscribe(listener)

```javascript
import { createStore } from "redux";

// Create the Redux store with our todo reducer
// The store holds the entire state tree and manages all state changes
const store = createStore(todoReducer);

// Subscribe to state changes - useful for debugging and side effects
// The listener function runs every time the state is updated
store.subscribe(() => {
  console.log("State updated:", store.getState());
  // This will log the complete state tree after each action
  // In a real app, this is where you might trigger re-renders or side effects
});

// Dispatch actions to modify the state
// Each dispatch call triggers the reducer and updates the state

store.dispatch(addTodo("Learn Redux"));
// State after: { todos: [{ id: timestamp1, text: "Learn Redux", completed: false }], filter: "ALL" }

store.dispatch(addTodo("Build amazing apps"));
// State after: { todos: [{ id: timestamp1, text: "Learn Redux", completed: false },
//                       { id: timestamp2, text: "Build amazing apps", completed: false }], filter: "ALL" }

store.dispatch(toggleTodo(timestamp1));
// State after: { todos: [{ id: timestamp1, text: "Learn Redux", completed: true },
//                       { id: timestamp2, text: "Build amazing apps", completed: false }], filter: "ALL" }

// Access current state at any time
console.log("Current state:", store.getState());

// The store ensures:
// 1. State is only modified through dispatched actions
// 2. All state changes go through the reducer
// 3. Subscribers are notified of every state change
// 4. State remains predictable and debuggable
```

## Getting Started

### Installation

Before you can use Redux in your React application, you need to install the necessary packages. There are two main approaches: using core Redux for learning, or using Redux Toolkit for production applications.

**What this does:** Installs Redux libraries for state management in React applications
**Options:**

1. Core Redux: Basic Redux with React bindings (good for learning)
2. Redux Toolkit: Modern, opinionated Redux with best practices built-in (recommended)

**Packages explained:**

- `redux`: Core Redux library for state management
- `react-redux`: Official React bindings for Redux
- `@reduxjs/toolkit`: Modern Redux with simplified API and built-in best practices

```bash
# Option 1: Core Redux (for learning purposes)
# Use this to understand fundamental Redux concepts
npm install redux react-redux

# Option 2: Modern approach with Redux Toolkit (recommended for production)
# Redux Toolkit includes Redux, Immer, Redux Thunk, and other utilities
npm install @reduxjs/toolkit react-redux

# Additional packages you might need:
# npm install redux-devtools-extension  # For Redux DevTools (if not using RTK)
# npm install redux-thunk               # For async actions (if not using RTK)
# npm install reselect                  # For memoized selectors (if not using RTK)
```

### Basic Setup with React

Setting up Redux with React requires creating a store and providing it to your React application through the Provider component. This makes the Redux store available to all components in your app.

**What this code does:** Sets up Redux store and connects it to a React application
**Steps:**

1. Create a Redux store with your reducer
2. Import Provider component from react-redux
3. Wrap your app with Provider and pass the store
4. All child components can now access Redux state

**File structure:**

- `store.js`: Creates and configures the Redux store
- `App.js`: Root component that provides store to the app
- `TodoApp.js`: Main application component that uses Redux

**Key concepts:**

- Provider makes store available to all components via React context
- Only components wrapped by Provider can access Redux state
- Store should be created once at the application root

```javascript
// store.js - Central store configuration
import { createStore } from "redux";
import todoReducer from "./reducers/todoReducer";

// Create the Redux store with our root reducer
// This store will hold the entire application state
const store = createStore(
  todoReducer,                           // Root reducer that manages state updates
  window.__REDUX_DEVTOOLS_EXTENSION__ && // Enable Redux DevTools in development
    window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

// App.js - Root component that provides Redux store to the entire app
import React from "react";
import { Provider } from "react-redux";   // React-Redux integration component
import store from "./store";             // Our configured Redux store
import TodoApp from "./TodoApp";         // Main application component

function App() {
  return (
    {/* Provider makes Redux store available to all child components */}
    <Provider store={store}>
      {/* TodoApp and all its children can now access Redux state */}
      <TodoApp />
    </Provider>
  );
}

export default App;

// Alternative setup with error boundaries and additional providers
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>                      {/* Catch and handle errors */}
      <Provider store={store}>           {/* Provide Redux store */}
        <Router>                         {/* Routing (if using React Router) */}
          <ThemeProvider>                {/* UI theming (if needed) */}
            <TodoApp />
          </ThemeProvider>
        </Router>
      </Provider>
    </ErrorBoundary>
  );
}
```

### Connecting Components

Connecting React components to Redux involves accessing state from the store and dispatching actions to update that state. The traditional approach uses the `connect` higher-order component (HOC) to map state and dispatch to component props.

**What this code does:** Connects a React component to Redux store using the classic connect HOC
**Steps:**

1. Import connect function from react-redux
2. Create component that receives Redux state and actions as props
3. Define mapStateToProps to select needed state
4. Define mapDispatchToProps to provide action creators
5. Connect component using connect(mapStateToProps, mapDispatchToProps)

**Input:** Redux state and action creators
**Output:** React component with access to Redux state and dispatch

**Connect pattern benefits:**

- Explicit mapping of state to props
- Automatic re-rendering when relevant state changes
- Action creators automatically bound to dispatch
- Separation of concerns between state access and component logic

**Performance optimization:**

- Component only re-renders when mapped state changes
- Shallow equality checking prevents unnecessary renders

```javascript
// TodoList.js - Component connected to Redux using classic connect HOC
import React from "react";
import { connect } from "react-redux"; // HOC for connecting to Redux
import { toggleTodo, deleteTodo } from "./actions"; // Action creators

// Presentational component - receives all data via props
// This component doesn't know about Redux, making it easily testable
const TodoList = ({ todos, toggleTodo, deleteTodo }) => (
  <ul>
    {todos.map((todo) => (
      <li key={todo.id}>
        {/* Click handler toggles todo completion status */}
        <span
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
            cursor: "pointer", // Visual feedback for clickable element
          }}
          onClick={() => toggleTodo(todo.id)} // Dispatch toggle action with todo ID
        >
          {todo.text}
        </span>

        {/* Delete button dispatches delete action */}
        <button
          onClick={() => deleteTodo(todo.id)} // Dispatch delete action with todo ID
          style={{ marginLeft: "10px" }}
        >
          Delete
        </button>
      </li>
    ))}
  </ul>
);

// mapStateToProps: Selects which parts of Redux state this component needs
// This function runs every time the store state changes
const mapStateToProps = (state) => ({
  todos: state.todos, // Extract todos array from state
  // Could also derive computed values:
  // todoCount: state.todos.length,
  // completedCount: state.todos.filter(t => t.completed).length
});

// mapDispatchToProps: Defines which action creators are available as props
// Two approaches: object shorthand (recommended) or function
const mapDispatchToProps = {
  toggleTodo, // Action creator becomes prop function
  deleteTodo, // Action creator becomes prop function
};

// Alternative function approach for mapDispatchToProps:
// const mapDispatchToProps = (dispatch) => ({
//   toggleTodo: (id) => dispatch(toggleTodo(id)),
//   deleteTodo: (id) => dispatch(deleteTodo(id)),
//   // This approach gives more control but is more verbose
// });

// connect() creates a higher-order component that:
// 1. Subscribes to Redux store
// 2. Passes selected state as props
// 3. Passes bound action creators as props
// 4. Re-renders component when relevant state changes
export default connect(mapStateToProps, mapDispatchToProps)(TodoList);

// The connected component can be used like any other React component:
// <TodoList />
// It automatically receives todos, toggleTodo, and deleteTodo as props
```

## Under the Hood: How Redux Works

### State Tree Structure

Redux maintains your entire application state as a single JavaScript object called the state tree. This centralized approach makes state predictable, debuggable, and easy to reason about.

**What this code shows:** Example structure of a Redux state tree for a todo application
**Key principles:**

- Single source of truth: all state in one object
- Nested structure organizes related data
- Each piece of state has a specific purpose
- State shape determines how you'll access data in components

**State organization strategies:**

- Group related data together (todos, user info, UI state)
- Keep state flat when possible to avoid deep nesting
- Separate domain data from UI state
- Use consistent naming conventions

**Benefits of centralized state:**

- Easy to debug with Redux DevTools
- Time-travel debugging capabilities
- Predictable data flow
- Easy to persist or hydrate state

```javascript
// Redux state is a single JavaScript object - the complete application state
const stateTree = {
  // Domain data: Core business logic and entities
  todos: [
    { id: 1, text: "Learn Redux", completed: false }, // Todo items with business data
    { id: 2, text: "Build app", completed: true },
  ],
  filter: "ALL", // Current filter setting: ALL, ACTIVE, COMPLETED

  // User data: Authentication and user information
  user: {
    id: 123,
    name: "John Doe",
    email: "john@example.com",
    isAuthenticated: true, // Auth status
    preferences: {
      // User settings
      theme: "dark",
      language: "en",
    },
  },

  // UI state: Interface state not related to domain data
  ui: {
    loading: false, // Global loading state
    errors: [], // Error messages to display
    modals: {
      // Modal visibility states
      editTodo: false,
      confirmDelete: false,
    },
    sidebar: {
      isOpen: true, // UI layout state
      activeSection: "todos",
    },
  },

  // Additional app state sections might include:
  // api: { /* API call states, cache, etc. */ },
  // router: { /* Current route, history, etc. */ },
  // form: { /* Form data, validation states */ },
};

// State access examples:
// state.todos                    // Array of all todos
// state.user.isAuthenticated     // Boolean auth status
// state.ui.loading              // Global loading state
// state.user.preferences.theme   // User theme preference

// The state tree structure determines:
// 1. How you'll organize your reducers
// 2. How components will select data
// 3. How actions will update specific parts
// 4. What your selectors will look like
```

### Store Implementation Simplified

Understanding how Redux store works internally helps you debug issues and appreciate the elegant simplicity of Redux's design. This simplified implementation shows the core mechanics of state management.

**What this code does:** Implements a simplified version of Redux's createStore function
**Key responsibilities:**

1. Holds the current state
2. Allows access to state via getState()
3. Allows state updates via dispatch(action)
4. Registers listeners via subscribe()
5. Prevents recursive dispatching

**Store architecture:**

- Closures maintain private state and listeners
- Single state object holds entire application state
- Observer pattern notifies components of changes
- Dispatching is synchronous and prevents race conditions

**How it ensures predictability:**

- State can only be changed by dispatching actions
- All changes go through the reducer function
- Listeners are notified after state updates
- No direct state mutation allowed

```javascript
// Simplified Redux store implementation - shows the core mechanics
function createStore(reducer, preloadedState) {
  let currentState = preloadedState; // Private state variable
  let listeners = []; // Array of subscriber functions
  let isDispatching = false; // Prevents recursive dispatching

  // Returns current state snapshot
  function getState() {
    if (isDispatching) {
      throw new Error(
        "You may not call store.getState() while the reducer is executing."
      );
    }
    return currentState; // Return current state immutably
  }

  // Registers a callback that runs when state changes
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error("Expected listener to be a function.");
    }

    listeners.push(listener); // Add listener to array

    // Return unsubscribe function for cleanup
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1); // Remove listener from array
    };
  }

  // Dispatches an action to update state
  function dispatch(action) {
    // Validate action structure
    if (typeof action.type === "undefined") {
      throw new Error("Actions must have a type property.");
    }

    // Prevent recursive dispatching (calling dispatch inside reducer)
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true; // Set dispatching flag
      currentState = reducer(currentState, action); // Calculate new state
    } finally {
      isDispatching = false; // Always reset flag
    }

    // Notify all subscribers of state change
    listeners.forEach((listener) => {
      try {
        listener(); // Call each listener
      } catch (error) {
        console.error("Listener error:", error); // Prevent one bad listener from breaking others
      }
    });

    return action; // Return action for middleware compatibility
  }

  // Initialize store with dummy action to setup initial state
  dispatch({ type: "@@redux/INIT" + Math.random().toString(36) });

  // Public API - only these methods are exposed
  return {
    dispatch, // Method to trigger state changes
    subscribe, // Method to listen for state changes
    getState, // Method to access current state
  };
}

// Usage example:
// const store = createStore(myReducer, initialState);
// const unsubscribe = store.subscribe(() => console.log(store.getState()));
// store.dispatch({ type: 'SOME_ACTION', payload: data });
// unsubscribe(); // Clean up when done
```

### Action Dispatch Flow

The Redux dispatch flow is a predictable sequence of steps that ensures state changes happen in a controlled, traceable manner. Understanding this flow helps you debug issues and optimize performance.

**What this shows:** The complete lifecycle of a Redux action from dispatch to UI update
**Flow stages:**

1. Action creation and dispatch
2. Reducer execution with current state
3. State update in store
4. Subscriber notification
5. Component re-rendering

**Timing characteristics:**

- Synchronous execution (unless middleware intervenes)
- Atomic updates (all or nothing)
- Predictable order of operations
- Traceable with Redux DevTools

**Performance implications:**

- All subscribers are notified on every dispatch
- Components re-render based on state changes
- Memoization and selectors can optimize re-renders

```javascript
// Complete Redux dispatch flow - step by step breakdown

// 1. Action is dispatched (triggered by user interaction or side effect)
store.dispatch(addTodo("Learn Redux"));
// At this point: { type: "ADD_TODO", payload: { id: 123, text: "Learn Redux", completed: false } }

// 2. Redux calls the reducer with current state and action
// The reducer is a pure function that calculates the new state
const currentState = store.getState();
// Current state: { todos: [], filter: "ALL" }

const newState = todoReducer(currentState, action);
// Reducer processes the action and returns new state
// New state: { todos: [{ id: 123, text: "Learn Redux", completed: false }], filter: "ALL" }

// 3. Store saves the new state (replaces the old state entirely)
// This happens inside the store's dispatch method
currentState = newState;

// 4. All subscribers are notified of the state change
// Every component connected to Redux gets a chance to check if it needs to update
listeners.forEach((listener) => {
  listener(); // Each listener checks if its relevant state changed
});

// 5. UI components re-render with new state
// React-Redux optimizes this by only re-rendering components whose selected state changed

// Detailed flow with middleware (e.g., Redux Thunk):
/*
1. store.dispatch(action) called
2. Middleware chain processes action (can modify, delay, or create new actions)
3. Action reaches reducer
4. Reducer calculates new state
5. Store updates state
6. Subscribers notified
7. Connected components check for changes
8. Components re-render if their selected state changed
*/

// Example with timing:
console.log("Before dispatch:", store.getState());
// { todos: [], filter: "ALL" }

store.dispatch(addTodo("Learn Redux"));
// Synchronous - state is updated immediately

console.log("After dispatch:", store.getState());
// { todos: [{ id: 123, text: "Learn Redux", completed: false }], filter: "ALL" }

// This predictable flow enables:
// - Time-travel debugging
// - Action replay
// - Predictable testing
// - Performance optimization
```

## Redux Toolkit (Modern Redux)

Redux Toolkit is the official recommended approach for writing Redux logic, as mentioned in the [Redux repository](https://github.com/reduxjs/redux).

### Setting Up with Redux Toolkit

Redux Toolkit (RTK) simplifies Redux setup by providing opinionated defaults and reducing boilerplate code. It includes utilities for store configuration, creating reducers, and handling immutable updates.

**What this code does:** Sets up a Redux store using Redux Toolkit's modern approach
**Steps:**

1. Import configureStore from Redux Toolkit
2. Import slice reducers from feature modules
3. Configure store with reducer object
4. Export typed store interfaces for TypeScript

**RTK advantages over classic Redux:**

- No boilerplate action types and creators
- Built-in Immer for immutable updates
- Redux DevTools automatically configured
- Redux Thunk included by default
- Better TypeScript support

**configureStore benefits:**

- Automatic middleware setup
- Development-time checks for common mistakes
- Simplified store configuration
- Built-in dev tools integration

```javascript
// store.js - Modern Redux store setup with Redux Toolkit
import { configureStore } from "@reduxjs/toolkit";
import todoSlice from "./features/todoSlice"; // Import slice reducer
import userSlice from "./features/userSlice"; // Additional feature slice
import uiSlice from "./features/uiSlice"; // UI state slice

// Configure store with RTK - replaces createStore + middleware setup
export const store = configureStore({
  reducer: {
    todos: todoSlice, // Each slice manages part of state
    user: userSlice, // Combines multiple reducers automatically
    ui: uiSlice,
  },

  // Optional: customize middleware (RTK provides good defaults)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"], // Ignore non-serializable actions
        ignoredPaths: ["register"], // Ignore non-serializable state paths
      },
    }),

  // Optional: add custom enhancers
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers({
      autoBatch: false, // Disable automatic batching if needed
    }),

  // Development-only options
  devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools in development
});

// TypeScript type exports for strong typing throughout the app
export type RootState = ReturnType<typeof store.getState>;
// RootState represents the complete state tree shape:
// { todos: TodoState, user: UserState, ui: UIState }

export type AppDispatch = typeof store.dispatch;
// AppDispatch includes types for any custom middleware

// Usage in React components with TypeScript:
// const todos = useSelector((state: RootState) => state.todos);
// const dispatch = useDispatch<AppDispatch>();

// Store configuration comparison:
// Classic Redux: ~50 lines of boilerplate
// Redux Toolkit: ~10 lines with better defaults

// RTK automatically includes:
// - Redux Thunk for async actions
// - Redux DevTools Extension
// - Immutability checks (development)
// - Serializability checks (development)
// - Action creator type checking
```

### Creating Slices

Redux Toolkit's `createSlice` function is the modern way to write Redux logic. It automatically generates action creators and action types, and uses Immer internally to allow "mutative" logic while maintaining immutability.

**What this code does:** Creates a complete Redux slice with reducers and action creators
**Steps:**

1. Define slice name and initial state
2. Write reducer functions using "mutative" syntax
3. Export generated action creators
4. Export the reducer for store configuration

**createSlice benefits:**

- Auto-generates action creators and types
- Eliminates action type constants
- Uses Immer for immutable updates
- Reduces boilerplate by 70-80%
- Better TypeScript inference

**Immer integration:**

- Write code that looks like mutations
- Immer creates immutable updates behind the scenes
- Prevents accidental mutations
- Maintains Redux's immutability guarantees

```javascript
// features/todoSlice.js - Modern Redux slice with RTK
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of our slice state
interface TodoState {
  items: Todo[];
  filter: "ALL" | "ACTIVE" | "COMPLETED";
  loading: boolean;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
}

// Initial state for the slice
const initialState: TodoState = {
  items: [],
  filter: "ALL",
  loading: false,
};

// Create slice with reducers and auto-generated actions
const todoSlice = createSlice({
  name: "todos", // Used for action type prefixes
  initialState,
  reducers: {
    // RTK uses Immer internally, so we can "mutate" the state safely
    addTodo: (state, action: PayloadAction<string>) => {
      // This looks like mutation but Immer makes it immutable
      state.items.push({
        id: Date.now(), // Simple ID (use nanoid in production)
        text: action.payload,
        completed: false,
        createdAt: new Date().toISOString(),
      });
      // Equivalent classic Redux would require:
      // return { ...state, items: [...state.items, newTodo] }
    },

    toggleTodo: (state, action: PayloadAction<number>) => {
      // Find and update specific todo
      const todo = state.items.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed; // Direct "mutation" with Immer
      }
      // Equivalent classic Redux would require complex spread operations
    },

    deleteTodo: (state, action: PayloadAction<number>) => {
      // Filter creates new array - this is actually immutable
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },

    setFilter: (
      state,
      action: PayloadAction<"ALL" | "ACTIVE" | "COMPLETED">
    ) => {
      state.filter = action.payload; // Simple property update
    },

    // Reducer for handling loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Batch operations - multiple state updates in one action
    clearCompleted: (state) => {
      state.items = state.items.filter((todo) => !todo.completed);
    },

    // Complex reducer with multiple state changes
    toggleAll: (state) => {
      const allCompleted = state.items.every((todo) => todo.completed);
      state.items.forEach((todo) => {
        todo.completed = !allCompleted;
      });
    },
  },
});

// Auto-generated action creators - no need to write these manually
export const {
  addTodo, // Creates: { type: "todos/addTodo", payload: "text" }
  toggleTodo, // Creates: { type: "todos/toggleTodo", payload: id }
  deleteTodo, // Creates: { type: "todos/deleteTodo", payload: id }
  setFilter, // Creates: { type: "todos/setFilter", payload: "ALL" }
  setLoading,
  clearCompleted,
  toggleAll,
} = todoSlice.actions;

// Export reducer for store configuration
export default todoSlice.reducer;

// The slice automatically creates:
// 1. Action creators with correct TypeScript types
// 2. Action type strings (todos/addTodo, todos/toggleTodo, etc.)
// 3. A reducer function that handles all actions
// 4. Proper immutable updates using Immer

// Usage in components:
// dispatch(addTodo("Learn RTK"));
// dispatch(toggleTodo(123));
// dispatch(setFilter("COMPLETED"));
```

### Modern React Hooks Usage

Modern Redux development uses React hooks (`useSelector` and `useDispatch`) instead of the `connect` HOC. This approach provides a cleaner, more functional component style with better TypeScript support.

**What this code does:** Creates a React component using modern Redux hooks
**Steps:**

1. Use `useSelector` to access Redux state
2. Use `useDispatch` to dispatch actions
3. Handle form submission and user interactions
4. Render UI based on Redux state

**Hooks vs connect benefits:**

- Less boilerplate code
- Better TypeScript inference
- More flexible component composition
- Easier to test individual pieces
- Cleaner component code

**Performance considerations:**

- `useSelector` automatically subscribes to store updates
- Component re-renders when selected state changes
- Use multiple selectors for better optimization
- Memoize complex selectors

```javascript
// TodoApp.js - Modern Redux component using hooks
import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  setFilter,
  clearCompleted
} from "./features/todoSlice";
import type { RootState } from "./store";

const TodoApp = () => {
  // Local component state for form input
  const [inputText, setInputText] = useState("");

  // Select state from Redux store using useSelector
  const todos = useSelector((state: RootState) => state.todos.items);
  const filter = useSelector((state: RootState) => state.todos.filter);
  const loading = useSelector((state: RootState) => state.todos.loading);

  // Get dispatch function to send actions
  const dispatch = useDispatch();

  // Memoized derived state to avoid recalculating on every render
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'ACTIVE':
        return todos.filter(todo => !todo.completed);
      case 'COMPLETED':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const completedCount = useMemo(() =>
    todos.filter(todo => todo.completed).length,
    [todos]
  );

  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      dispatch(addTodo(inputText.trim()));        // Dispatch action with payload
      setInputText("");                           // Clear local state
    }
  };

  // Filter change handler
  const handleFilterChange = (newFilter: 'ALL' | 'ACTIVE' | 'COMPLETED') => {
    dispatch(setFilter(newFilter));
  };

  return (
    <div className="todo-app">
      {/* Form for adding new todos */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a todo..."
          disabled={loading}                      // Disable during loading
        />
        <button type="submit" disabled={loading || !inputText.trim()}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Filter buttons */}
      <div className="filters">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => handleFilterChange(filterType)}
            className={filter === filterType ? 'active' : ''}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <ul className="todo-list">
        {filteredTodos.map((todo) => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            {/* Todo text - click to toggle completion */}
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
                flex: 1,
              }}
              onClick={() => dispatch(toggleTodo(todo.id))} // Dispatch toggle action
            >
              {todo.text}
            </span>

            {/* Delete button */}
            <button
              onClick={() => dispatch(deleteTodo(todo.id))} // Dispatch delete action
              className="delete-btn"
              aria-label={`Delete ${todo.text}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Todo statistics and bulk actions */}
      <div className="todo-footer">
        <span>{todos.length - completedCount} items left</span>

        {completedCount > 0 && (
          <button
            onClick={() => dispatch(clearCompleted())}
            className="clear-completed"
          >
            Clear completed ({completedCount})
          </button>
        )}
      </div>

      {/* Empty state */}
      {todos.length === 0 && (
        <div className="empty-state">
          <p>No todos yet. Add one above!</p>
        </div>
      )}
    </div>
  );
};

export default TodoApp;

// Hook usage patterns:
// 1. useSelector for reading state
// 2. useDispatch for sending actions
// 3. Multiple selectors for different state slices
// 4. Memoization for derived state
// 5. TypeScript for type safety
```

## Middleware and Async Actions

### Redux Thunk for Async Actions

```javascript
// Async action creator with Redux Thunk
const fetchTodos = () => async (dispatch, getState) => {
  dispatch(setLoading(true));

  try {
    const response = await fetch("/api/todos");
    const todos = await response.json();
    dispatch(setTodos(todos));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Usage in component
const handleFetchTodos = () => {
  dispatch(fetchTodos());
};
```

### RTK Query for Data Fetching

```javascript
// api/todosApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const todosApi = createApi({
  reducerPath: "todosApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/" }),
  tagTypes: ["Todo"],
  endpoints: (builder) => ({
    getTodos: builder.query({
      query: () => "todos",
      providesTags: ["Todo"],
    }),
    addTodo: builder.mutation({
      query: (newTodo) => ({
        url: "todos",
        method: "POST",
        body: newTodo,
      }),
      invalidatesTags: ["Todo"],
    }),
  }),
});

export const { useGetTodosQuery, useAddTodoMutation } = todosApi;
```

### Custom Middleware

```javascript
// Logger middleware
const loggerMiddleware = (store) => (next) => (action) => {
  console.log("Dispatching:", action);
  const result = next(action);
  console.log("Next state:", store.getState());
  return result;
};

// Apply middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(loggerMiddleware),
});
```

## Performance Optimization

### Selector Optimization

Selectors are functions that extract specific pieces of state from the Redux store. Memoized selectors prevent unnecessary recalculations and component re-renders by only recalculating when their input values change.

**What this code does:** Creates memoized selectors using createSelector for optimal performance
**Steps:**

1. Create basic selectors for raw state access
2. Create memoized selectors for derived/computed state
3. Use selectors in components via useSelector
4. Selectors only recalculate when input dependencies change

**Benefits of memoized selectors:**

- Prevent expensive recalculations
- Reduce component re-renders
- Improve app performance with large datasets
- Enable complex data transformations
- Better separation of concerns

**When to use createSelector:**

- Expensive computations (filtering, sorting, aggregating)
- Derived state calculations
- Cross-slice data combinations
- Complex data transformations

```javascript
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// Basic selectors - simple state extraction
const selectTodos = (state: RootState) => state.todos.items;
const selectFilter = (state: RootState) => state.todos.filter;
const selectSearchTerm = (state: RootState) => state.todos.searchTerm;

// Memoized selector for filtered todos
// Only recalculates when todos or filter change
const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter], // Input selectors
  (todos, filter) => {
    // Result function
    console.log("Recalculating filtered todos"); // Only logs when recalculating

    switch (filter) {
      case "ACTIVE":
        return todos.filter((todo) => !todo.completed);
      case "COMPLETED":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }
);

// Complex memoized selector with multiple inputs
const selectSearchedAndFilteredTodos = createSelector(
  [selectFilteredTodos, selectSearchTerm],
  (filteredTodos, searchTerm) => {
    if (!searchTerm) return filteredTodos;

    return filteredTodos.filter((todo) =>
      todo.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);

// Aggregate data selectors
const selectTodoStats = createSelector([selectTodos], (todos) => ({
  total: todos.length,
  completed: todos.filter((todo) => todo.completed).length,
  active: todos.filter((todo) => !todo.completed).length,
  completionRate:
    todos.length > 0
      ? Math.round(
          (todos.filter((todo) => todo.completed).length / todos.length) * 100
        )
      : 0,
}));

// Selector with parameters using factory pattern
const selectTodoById = createSelector(
  [selectTodos, (state: RootState, todoId: number) => todoId],
  (todos, todoId) => todos.find((todo) => todo.id === todoId)
);

// Usage in components
const TodoList = () => {
  // Using memoized selectors - component only re-renders when result changes
  const filteredTodos = useSelector(selectFilteredTodos);
  const searchedTodos = useSelector(selectSearchedAndFilteredTodos);
  const stats = useSelector(selectTodoStats);

  // Using parametric selector with useCallback for stable reference
  const specificTodoId = 123;
  const specificTodo = useSelector(
    useCallback(
      (state: RootState) => selectTodoById(state, specificTodoId),
      [specificTodoId]
    )
  );

  return (
    <div>
      <div>
        Total: {stats.total}, Completed: {stats.completed}
      </div>
      {searchedTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
};

// Performance comparison:
// Without selectors: Component recalculates filtered todos on every render
// With selectors: Filtered todos only recalculated when todos or filter change
// Result: 70-90% reduction in unnecessary calculations
```

### Component Optimization

```javascript
import React, { memo } from "react";

// Memoize component to prevent unnecessary re-renders
const TodoItem = memo(({ todo, onToggle, onDelete }) => (
  <li>
    <span
      style={{
        textDecoration: todo.completed ? "line-through" : "none",
      }}
      onClick={() => onToggle(todo.id)}
    >
      {todo.text}
    </span>
    <button onClick={() => onDelete(todo.id)}>Delete</button>
  </li>
));

// Use callback hooks for stable references
const TodoList = () => {
  const todos = useSelector(selectFilteredTodos);
  const dispatch = useDispatch();

  const handleToggle = useCallback(
    (id) => dispatch(toggleTodo(id)),
    [dispatch]
  );

  const handleDelete = useCallback(
    (id) => dispatch(deleteTodo(id)),
    [dispatch]
  );

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
};
```

## Best Practices

### State Structure

```javascript
// ✅ Good - Normalized state
const goodState = {
  todos: {
    byId: {
      1: { id: 1, text: "Learn Redux", completed: false },
      2: { id: 2, text: "Build app", completed: true },
    },
    allIds: [1, 2],
  },
  visibilityFilter: "ALL",
};

// ❌ Bad - Nested and denormalized
const badState = {
  todos: [
    {
      id: 1,
      text: "Learn Redux",
      completed: false,
      author: {
        id: 1,
        name: "John",
        todos: [
          /* circular reference */
        ],
      },
    },
  ],
};
```

### Action Design

```javascript
// ✅ Good - Descriptive action types and consistent structure
const FETCH_USERS_REQUEST = "users/fetchRequest";
const FETCH_USERS_SUCCESS = "users/fetchSuccess";
const FETCH_USERS_FAILURE = "users/fetchFailure";

const fetchUsersRequest = () => ({
  type: FETCH_USERS_REQUEST,
});

const fetchUsersSuccess = (users) => ({
  type: FETCH_USERS_SUCCESS,
  payload: users,
});

const fetchUsersFailure = (error) => ({
  type: FETCH_USERS_FAILURE,
  payload: error,
  error: true,
});
```

### Reducer Guidelines

```javascript
// ✅ Good - Pure function, immutable updates
const todosReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };
    default:
      return state;
  }
};

// ❌ Bad - Mutating state
const badReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TODO:
      state.todos.push(action.payload); // Direct mutation
      return state;
    default:
      return state;
  }
};
```

## Conclusion

Redux provides a powerful and predictable way to manage application state. While the core concepts remain the same, modern Redux development with Redux Toolkit significantly simplifies the development experience while maintaining all the benefits of the original Redux architecture.

### Key Takeaways

1. **Predictable State Management**: Single source of truth with unidirectional data flow
2. **Debugging and Time Travel**: Excellent developer tools for debugging and state inspection
3. **Middleware Ecosystem**: Powerful middleware system for handling side effects and async actions
4. **Performance Optimization**: Memoization and selective updates for optimal performance
5. **Modern Tooling**: Redux Toolkit provides excellent developer experience and best practices

As highlighted in the [Redux GitHub repository](https://github.com/reduxjs/redux), Redux continues to be a valuable tool for organizing application state, especially when combined with modern tools like Redux Toolkit and RTK Query.

### Further Resources

- [Redux Documentation](https://redux.js.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Redux GitHub Repository](https://github.com/reduxjs/redux)
- [React-Redux Documentation](https://react-redux.js.org/)
