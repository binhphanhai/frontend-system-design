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

Actions are plain JavaScript objects that describe what happened in your application.

```javascript
// Action types
const ADD_TODO = "ADD_TODO";
const TOGGLE_TODO = "TOGGLE_TODO";
const DELETE_TODO = "DELETE_TODO";

// Action creators
const addTodo = (text) => ({
  type: ADD_TODO,
  payload: {
    id: Date.now(),
    text,
    completed: false,
  },
});

const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: { id },
});

const deleteTodo = (id) => ({
  type: DELETE_TODO,
  payload: { id },
});
```

### Reducers

Reducers are pure functions that take the current state and an action, and return a new state.

```javascript
const initialState = {
  todos: [],
  filter: "ALL", // ALL, ACTIVE, COMPLETED
};

const todoReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [...state.todos, action.payload],
      };

    case TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      };

    default:
      return state;
  }
};
```

### Store

The store holds the complete state tree of your application.

```javascript
import { createStore } from "redux";

const store = createStore(todoReducer);

// Subscribe to state changes
store.subscribe(() => {
  console.log("State updated:", store.getState());
});

// Dispatch actions
store.dispatch(addTodo("Learn Redux"));
store.dispatch(addTodo("Build amazing apps"));
store.dispatch(toggleTodo(1));
```

## Getting Started

### Installation

```bash
# Core Redux (for learning purposes)
npm install redux react-redux

# Modern approach with Redux Toolkit (recommended)
npm install @reduxjs/toolkit react-redux
```

### Basic Setup with React

```javascript
// store.js
import { createStore } from "redux";
import { Provider } from "react-redux";
import todoReducer from "./reducers/todoReducer";

const store = createStore(todoReducer);

// App.js
import { Provider } from "react-redux";
import store from "./store";
import TodoApp from "./TodoApp";

function App() {
  return (
    <Provider store={store}>
      <TodoApp />
    </Provider>
  );
}

export default App;
```

### Connecting Components

```javascript
// TodoList.js
import React from "react";
import { connect } from "react-redux";
import { toggleTodo, deleteTodo } from "./actions";

const TodoList = ({ todos, toggleTodo, deleteTodo }) => (
  <ul>
    {todos.map((todo) => (
      <li key={todo.id}>
        <span
          style={{
            textDecoration: todo.completed ? "line-through" : "none",
          }}
          onClick={() => toggleTodo(todo.id)}
        >
          {todo.text}
        </span>
        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
      </li>
    ))}
  </ul>
);

const mapStateToProps = (state) => ({
  todos: state.todos,
});

const mapDispatchToProps = {
  toggleTodo,
  deleteTodo,
};

export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
```

## Under the Hood: How Redux Works

### State Tree Structure

```javascript
// Redux state is a single JavaScript object
const stateTree = {
  todos: [
    { id: 1, text: "Learn Redux", completed: false },
    { id: 2, text: "Build app", completed: true },
  ],
  filter: "ALL",
  user: {
    id: 123,
    name: "John Doe",
    isAuthenticated: true,
  },
  ui: {
    loading: false,
    errors: [],
  },
};
```

### Store Implementation Simplified

```javascript
// Simplified Redux store implementation
function createStore(reducer, preloadedState) {
  let currentState = preloadedState;
  let listeners = [];
  let isDispatching = false;

  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    listeners.push(listener);

    // Return unsubscribe function
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function dispatch(action) {
    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true;
      currentState = reducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    // Notify all subscribers
    listeners.forEach((listener) => listener());
    return action;
  }

  // Initialize store with dummy action
  dispatch({ type: "@@redux/INIT" });

  return { dispatch, subscribe, getState };
}
```

### Action Dispatch Flow

```javascript
// 1. Action is dispatched
store.dispatch(addTodo("Learn Redux"));

// 2. Redux calls the reducer with current state and action
const newState = todoReducer(currentState, action);

// 3. Store saves the new state
currentState = newState;

// 4. All subscribers are notified
listeners.forEach((listener) => listener());

// 5. UI components re-render with new state
```

## Redux Toolkit (Modern Redux)

Redux Toolkit is the official recommended approach for writing Redux logic, as mentioned in the [Redux repository](https://github.com/reduxjs/redux).

### Setting Up with Redux Toolkit

```javascript
// store.js
import { configureStore } from "@reduxjs/toolkit";
import todoSlice from "./features/todoSlice";

export const store = configureStore({
  reducer: {
    todos: todoSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Creating Slices

```javascript
// features/todoSlice.js
import { createSlice } from "@reduxjs/toolkit";

const todoSlice = createSlice({
  name: "todos",
  initialState: {
    items: [],
    filter: "ALL",
  },
  reducers: {
    addTodo: (state, action) => {
      // RTK uses Immer internally, so we can "mutate" the state
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
});

export const { addTodo, toggleTodo, deleteTodo, setFilter } = todoSlice.actions;
export default todoSlice.reducer;
```

### Modern React Hooks Usage

```javascript
// TodoApp.js
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTodo, toggleTodo, deleteTodo } from "./features/todoSlice";

const TodoApp = () => {
  const [inputText, setInputText] = useState("");
  const todos = useSelector((state) => state.todos.items);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      dispatch(addTodo(inputText));
      setInputText("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
              }}
              onClick={() => dispatch(toggleTodo(todo.id))}
            >
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
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

```javascript
import { createSelector } from "@reduxjs/toolkit";

// Memoized selectors
const selectTodos = (state) => state.todos.items;
const selectFilter = (state) => state.todos.filter;

const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
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

// Usage in component
const filteredTodos = useSelector(selectFilteredTodos);
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
