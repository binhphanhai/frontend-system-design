# Redux Toolkit: Modern Redux Development

## Table of Contents

- [Introduction](#introduction)
- [Core Problems Redux Toolkit Solves](#core-problems-redux-toolkit-solves)
- [Installation and Setup](#installation-and-setup)
- [Core APIs Deep Dive](#core-apis-deep-dive)
- [Under the Hood: How RTK Works](#under-the-hood-how-rtk-works)
- [RTK Query: Data Fetching Solution](#rtk-query-data-fetching-solution)
- [Advanced Patterns and Best Practices](#advanced-patterns-and-best-practices)
- [Performance Optimizations](#performance-optimizations)
- [Conclusion](#conclusion)

## Introduction

Redux Toolkit (RTK) is the official, opinionated, batteries-included toolset for efficient Redux development. As stated in the [Redux Toolkit GitHub repository](https://github.com/reduxjs/redux-toolkit), it was created to address three common concerns about Redux: complex store configuration, excessive boilerplate code, and the need for multiple packages to make Redux useful.

Since you already understand Redux fundamentals, RTK essentially provides a layer of abstraction that simplifies Redux development while maintaining all the core principles and benefits of Redux.

## Core Problems Redux Toolkit Solves

### 1. Store Configuration Complexity

Traditional Redux store configuration requires multiple imports and manual setup of middleware, dev tools, and reducers. This comparison demonstrates how Redux Toolkit dramatically simplifies store creation by providing sensible defaults and automatic configuration.

**What this code demonstrates:**

- **Input**: Multiple reducer functions that need to be combined into a single store
- **Process**: Store creation with middleware and development tools setup
- **Output**: A configured Redux store ready for use in your application
- **Key differences**: RTK reduces ~15 lines to ~8 lines while providing the same functionality

```javascript
// Traditional Redux store setup - Manual configuration required
// This approach requires importing multiple Redux utilities and manually
// configuring middleware, dev tools, and combining reducers
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk"; // For async actions
import { composeWithDevTools } from "redux-devtools-extension"; // Dev tools
import todosReducer from "./todosReducer";
import usersReducer from "./usersReducer";

// Step 1: Manually combine all reducers into a root reducer
const rootReducer = combineReducers({
  todos: todosReducer,
  users: usersReducer,
});

// Step 2: Create store with middleware and dev tools manually configured
const store = createStore(
  rootReducer, // The combined reducer
  composeWithDevTools(applyMiddleware(thunk)) // Manual middleware setup
);

// RTK simplified version - Automatic configuration with sensible defaults
// Redux Toolkit automatically includes thunk middleware, dev tools integration,
// and immutability/serializability checks in development
import { configureStore } from "@reduxjs/toolkit";
import todosSlice from "./todosSlice";
import usersSlice from "./usersSlice";

// Single function call creates a fully configured store
// Automatically includes: redux-thunk, Redux DevTools, and development checks
const store = configureStore({
  reducer: {
    todos: todosSlice, // Slice reducers are automatically combined
    users: usersSlice,
  },
  // All middleware and dev tools are included by default!
});
```

### 2. Boilerplate Reduction

Traditional Redux requires separate action types, action creators, and reducer logic, resulting in repetitive boilerplate code. This example shows how Redux Toolkit's `createSlice` eliminates this redundancy by automatically generating action creators and types while allowing you to write simpler reducer logic.

**What this code demonstrates:**

- **Input**: Todo operations (add new todo, toggle completion status)
- **Traditional approach**: ~30 lines with manual action types, creators, and immutable updates
- **RTK approach**: ~15 lines with automatic action generation and "mutable" syntax
- **Key benefit**: 50% code reduction while maintaining the same functionality

```javascript
// Traditional Redux - Manual action types, creators, and reducer
// This approach requires defining action types as constants, creating action creators,
// and writing reducer logic with manual immutable updates

// Step 1: Define action type constants to avoid typos
const ADD_TODO = "todos/addTodo";
const TOGGLE_TODO = "todos/toggleTodo";

// Step 2: Create action creator functions that return action objects
const addTodo = (text) => ({ type: ADD_TODO, payload: text });
const toggleTodo = (id) => ({ type: TOGGLE_TODO, payload: id });

// Step 3: Write reducer with switch statement and manual immutable updates
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      // Must manually create new array and object (immutable update)
      return [
        ...state, // Spread existing todos
        { id: Date.now(), text: action.payload, completed: false }, // Add new todo
      ];
    case TOGGLE_TODO:
      // Must map over array and create new objects for immutability
      return state.map(
        (todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed } // Update matching todo
            : todo // Keep other todos unchanged
      );
    default:
      return state; // Always return current state for unknown actions
  }
};

// RTK equivalent - Automatic action generation with simpler syntax
// createSlice automatically generates action types, action creators, and
// uses Immer internally to handle immutable updates behind the scenes
import { createSlice } from "@reduxjs/toolkit";

const todosSlice = createSlice({
  name: "todos", // Used to generate action types: "todos/addTodo", "todos/toggleTodo"
  initialState: [], // Starting state value
  reducers: {
    // Each property becomes an action creator and reducer case
    addTodo: (state, action) => {
      // Looks like mutation but Immer makes it immutable under the hood
      state.push({ id: Date.now(), text: action.payload, completed: false });
    },
    toggleTodo: (state, action) => {
      // Direct property assignment - Immer handles immutability
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed; // "Mutate" directly
      }
    },
  },
});

// Action creators are automatically generated and exported
export const { addTodo, toggleTodo } = todosSlice.actions;
// Reducer is automatically created and exported
export default todosSlice.reducer;
```

## Installation and Setup

Getting started with Redux Toolkit requires minimal setup. These commands will install the necessary packages and optionally bootstrap a new project with RTK already configured.

**What these commands do:**

- **npm install**: Adds Redux Toolkit and React-Redux to your project dependencies
- **npx degit**: Creates a new project using an official RTK template with best practices pre-configured
- **Result**: A fully functional Redux setup ready for development

```bash
# Install Redux Toolkit and React-Redux
# @reduxjs/toolkit: Core RTK package with createSlice, configureStore, etc.
# react-redux: React bindings for Redux (useSelector, useDispatch hooks)
npm install @reduxjs/toolkit react-redux

# Using RTK templates for new projects (optional)
# This creates a new project with RTK, TypeScript, and Vite pre-configured
# Includes proper folder structure and example code
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app
```

### Store Configuration

This code demonstrates how to set up a Redux store using `configureStore`. The store configuration is the central hub that combines all your feature slices and provides them to your React application through the provider pattern.

**What this code does:**

- **Input**: Individual slice reducers from different features
- **Process**: Combines reducers and automatically configures middleware
- **Output**: A Redux store ready to be provided to your React app
- **TypeScript benefit**: Automatic type inference for state and dispatch

```javascript
// store.js - Central store configuration
import { configureStore } from "@reduxjs/toolkit";
import todosSlice from "./features/todos/todosSlice"; // Todo feature reducer
import usersSlice from "./features/users/usersSlice"; // User feature reducer

// Create and configure the Redux store
export const store = configureStore({
  reducer: {
    // Each property becomes a slice of state accessible via state.todos, state.users
    todos: todosSlice,
    users: usersSlice,
  },
  // RTK includes these by default (no manual configuration needed):
  // - redux-thunk middleware: Enables async actions and functions as actions
  // - Redux DevTools Extension: Browser dev tools integration for debugging
  // - Immutability and serializability middleware (in dev): Catches common mistakes
});

// TypeScript type definitions for type-safe Redux usage
// RootState: Represents the shape of your entire Redux state tree
export type RootState = ReturnType<typeof store.getState>;
// AppDispatch: Represents the type of your store's dispatch function
export type AppDispatch = typeof store.dispatch;
```

## Core APIs Deep Dive

### createSlice() - The Heart of RTK

The `createSlice` function is Redux Toolkit's most powerful API, combining action creators, action types, and reducers into a single declaration. This comprehensive example shows how to build a feature-complete todo slice with TypeScript, multiple reducer types, and advanced patterns like the prepare callback.

**What this code demonstrates:**

- **Input**: Various todo operations (add, toggle, remove, filter) with different payload types
- **Process**: Automatic action creator generation, type-safe reducers, and immutable state updates
- **Output**: Action creators and a reducer function ready for store integration
- **Advanced features**: Custom payload preparation and complex state management

```javascript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// TypeScript interfaces for type safety and better developer experience
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// State shape definition - helps with type inference and documentation
interface TodosState {
  items: Todo[]; // Array of todo items
  filter: "all" | "active" | "completed"; // Current filter for displaying todos
}

// Initial state that matches our TodosState interface
const initialState: TodosState = {
  items: [], // Start with empty todo list
  filter: "all", // Show all todos by default
};

// createSlice automatically generates action creators and action types
const todosSlice = createSlice({
  name: "todos", // Used as prefix for action types: "todos/addTodo", etc.
  initialState,
  reducers: {
    // RTK uses Immer internally - you can "mutate" the state safely
    // Immer converts these mutations into immutable updates behind the scenes

    // Simple reducer: takes a string and adds a new todo
    addTodo: (state, action: PayloadAction<string>) => {
      state.items.push({
        id: Date.now(), // Simple ID generation (use proper UUID in production)
        text: action.payload, // Todo text from action
        completed: false, // New todos start as incomplete
      });
    },

    // Reducer that finds and updates a specific todo by ID
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find((todo) => todo.id === action.payload);
      if (todo) {
        // Direct property mutation - Immer makes this immutable
        todo.completed = !todo.completed;
      }
      // If todo not found, state remains unchanged
    },

    // Reducer that removes a todo by filtering it out
    removeTodo: (state, action: PayloadAction<number>) => {
      // Reassign the items array to a filtered version
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },

    // Reducer that updates the filter setting
    setFilter: (
      state,
      action: PayloadAction<"all" | "active" | "completed">
    ) => {
      state.filter = action.payload; // Update filter state
    },

    // Advanced pattern: Prepare callback for complex action payloads
    // This pattern is useful when you need to transform or validate input
    addTodoWithId: {
      // The actual reducer function
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload); // Add the complete todo object
      },
      // Prepare function runs before the reducer, transforms input
      prepare: (text: string) => ({
        payload: {
          id: Math.random(), // Generate ID in prepare function
          text,
          completed: false,
        },
      }),
    },
  },
});

// Destructure and export action creators (automatically generated)
// These functions can be imported and dispatched from components
export const { addTodo, toggleTodo, removeTodo, setFilter, addTodoWithId } =
  todosSlice.actions;

// Export the reducer function to be included in store configuration
export default todosSlice.reducer;
```

### createAsyncThunk() - Async Logic

`createAsyncThunk` is Redux Toolkit's solution for handling asynchronous operations like API calls. It automatically generates action creators for pending, fulfilled, and rejected states, eliminating the need to manually manage loading states and error handling in async operations.

**What this code demonstrates:**

- **Input**: User ID for fetching todos, todo text for creating new todos
- **Process**: HTTP requests with proper error handling and state management integration
- **Output**: Automatic action dispatching for loading/success/error states
- **Key benefits**: Simplified async logic, automatic loading states, built-in error handling

```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Async thunk for fetching todos from API
// createAsyncThunk automatically generates three action types:
// - 'todos/fetchTodos/pending' (when request starts)
// - 'todos/fetchTodos/fulfilled' (when request succeeds)
// - 'todos/fetchTodos/rejected' (when request fails)
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos', // Action type prefix
  async (userId: number, { rejectWithValue }) => {
    try {
      // Make HTTP request to fetch user's todos
      const response = await fetch(`/api/users/${userId}/todos`);

      // Check if response is successful
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }

      // Return response data - this becomes action.payload in fulfilled case
      return await response.json();
    } catch (error) {
      // Use rejectWithValue to return custom error payload
      // This becomes action.payload in rejected case
      return rejectWithValue(error.message);
    }
  }
);

// More complex async thunk with access to state and dispatch
export const addTodoAsync = createAsyncThunk(
  'todos/addTodo',
  async (text: string, { getState, dispatch }) => {
    // Access current Redux state using getState()
    const state = getState() as RootState;

    // Make POST request to create new todo
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        userId: state.auth.user.id // Access nested state
      }),
    });

    // Return the created todo data
    return await response.json();
  }
);

// Slice that handles both sync and async actions
const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [], // Array of todo items
    loading: false, // Loading state for async operations
    error: null, // Error message if operations fail
  },
  reducers: {
    // Synchronous reducers would go here
    // e.g., clearError, resetTodos, etc.
  },
  // extraReducers handles actions created outside this slice
  // (like async thunks or actions from other slices)
  extraReducers: (builder) => {
    builder
      // Handle fetchTodos async thunk lifecycle
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true; // Show loading indicator
        state.error = null; // Clear previous errors
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false; // Hide loading indicator
        state.items = action.payload; // Update todos with fetched data
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false; // Hide loading indicator
        state.error = action.payload as string; // Store error message
      })

      // Handle addTodoAsync lifecycle
      .addCase(addTodoAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTodoAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload); // Add new todo to list
      })
      .addCase(addTodoAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add todo';
      });
  },
});
```

## Under the Hood: How RTK Works

### createSlice Implementation Concept

Understanding how `createSlice` works internally helps appreciate the magic it performs. This simplified implementation shows the core concepts: automatic action creator generation, reducer creation with Immer integration, and the builder pattern for handling external actions.

**What this implementation demonstrates:**

- **Input**: Slice configuration object with name, initial state, and reducers
- **Process**: Dynamic action creator generation, reducer function creation, and Immer integration
- **Output**: Object containing action creators and a combined reducer function
- **Key insight**: RTK automates what developers previously had to write manually

```javascript
// Simplified createSlice implementation to understand the internal mechanics
// This shows the core concepts without all the TypeScript and edge case handling
function createSlice({ name, initialState, reducers, extraReducers }) {
  const actionCreators = {}; // Will store generated action creators
  const actionTypes = {}; // Will store action type constants

  // Step 1: Generate action types and creators for each reducer
  Object.keys(reducers).forEach((reducerName) => {
    // Create action type string: "sliceName/reducerName"
    const type = `${name}/${reducerName}`;
    actionTypes[reducerName] = type;

    // Create action creator function that returns an action object
    actionCreators[reducerName] = (payload) => ({
      type, // The generated action type
      payload, // The data passed to the action creator
    });
  });

  // Step 2: Create the main reducer function that handles slice actions
  const reducer = (state = initialState, action) => {
    // Use Immer's produce for immutable updates
    // This allows writing "mutative" code that's actually immutable
    return produce(state, (draft) => {
      const caseReducer = reducers[action.type];
      if (caseReducer) {
        // Call the case reducer with the draft state and action
        caseReducer(draft, action);
      }
      // If no matching reducer, Immer returns the original state
    });
  };

  // Step 3: Handle extraReducers (for async thunks or external actions)
  if (extraReducers) {
    const extraReducerMap = {}; // Map action types to their reducers

    // Builder pattern implementation
    const builder = {
      addCase: (actionCreator, reducer) => {
        // Store the reducer function keyed by action type
        extraReducerMap[actionCreator.type] = reducer;
      },
    };

    // Call the extraReducers function with our builder
    extraReducers(builder);

    // Step 4: Merge extra reducers with main reducer
    const originalReducer = reducer;
    reducer = (state, action) => {
      // First check if this action should be handled by extraReducers
      const extraReducer = extraReducerMap[action.type];
      if (extraReducer) {
        // Use Immer to handle the extra reducer
        return produce(state, (draft) => extraReducer(draft, action));
      }
      // Fall back to original reducer for slice-specific actions
      return originalReducer(state, action);
    };
  }

  // Return the complete slice object
  return {
    actions: actionCreators, // All generated action creators
    reducer, // The combined reducer function
    actionTypes, // Action type constants (for debugging)
  };
}
```

### Immer Integration

Immer is the secret sauce that makes Redux Toolkit's "mutative" syntax work. It creates a draft copy of your state that you can safely mutate, then produces an immutable result. This eliminates the verbose spread syntax required in traditional Redux while maintaining immutability.

**What this code demonstrates:**

- **Input**: State object and "mutative" operations
- **Process**: Immer creates a draft proxy, tracks changes, and produces immutable result
- **Output**: New immutable state object with changes applied
- **Key benefit**: Write simple mutation code that automatically becomes immutable updates

```javascript
// What RTK does internally with Immer
import produce from "immer";

// Your "mutative" code in RTK reducers
// This looks like direct mutation but is actually safe
const reducer = (state, action) => {
  state.items.push(newItem); // Appears to mutate state directly
  state.count += 1; // Appears to modify properties directly
};

// What Immer actually does behind the scenes
const actualReducer = (state, action) => {
  return produce(state, (draft) => {
    // `draft` is a special proxy object that tracks changes
    draft.items.push(newItem); // Mutation tracked by Immer
    draft.count += 1; // Property changes tracked by Immer

    // Immer creates a new immutable state with only changed parts replaced
    // Unchanged parts are structurally shared for performance
  });
};

// Example: How Immer handles nested state updates
const complexReducer = (state, action) => {
  // Traditional Redux would require deep spreading:
  // return {
  //   ...state,
  //   user: {
  //     ...state.user,
  //     profile: {
  //       ...state.user.profile,
  //       name: action.payload
  //     }
  //   }
  // }

  // With Immer (what RTK allows):
  state.user.profile.name = action.payload; // Simple assignment!
};
```

## RTK Query: Data Fetching Solution

RTK Query is Redux Toolkit's powerful data fetching and caching solution that eliminates the need to write data fetching logic manually. It provides automatic caching, background updates, and optimistic updates while integrating seamlessly with Redux DevTools.

**Key RTK Query benefits:**

- **Automatic caching**: Avoid redundant network requests
- **Background refetching**: Keep data fresh automatically
- **Optimistic updates**: Instant UI updates with rollback on errors
- **Generated hooks**: Type-safe hooks for React components

### Basic RTK Query Setup

This example shows how to set up a complete API slice with queries (for fetching data) and mutations (for creating/updating data). RTK Query automatically generates React hooks and manages all the complex caching logic for you.

**What this code creates:**

- **Input**: API endpoint definitions and caching strategies
- **Process**: Automatic hook generation, caching, and cache invalidation
- **Output**: React hooks ready to use in components
- **Generated hooks**: `useGetTodosQuery`, `useAddTodoMutation`, `useUpdateTodoMutation`

```javascript
// api/apiSlice.js - Centralized API definition
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  // Unique key for this API slice in the Redux store
  reducerPath: "api",

  // Base query configuration for all endpoints
  baseQuery: fetchBaseQuery({
    baseUrl: "/api", // Base URL for all API calls

    // Function to prepare headers for each request
    prepareHeaders: (headers, { getState }) => {
      // Access current state to get authentication token
      const token = getState().auth.token;
      if (token) {
        // Add authorization header if token exists
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // Define tag types for cache invalidation system
  // Tags help RTK Query know which cached data to invalidate when mutations occur
  tagTypes: ["Todo", "User"],

  // Define API endpoints (queries for fetching, mutations for modifying)
  endpoints: (builder) => ({
    // Query endpoint for fetching todos
    getTodos: builder.query({
      query: () => "todos", // GET /api/todos
      providesTags: ["Todo"], // This query provides "Todo" data
    }),

    // Mutation endpoint for creating new todos
    addTodo: builder.mutation({
      query: (newTodo) => ({
        url: "todos", // POST /api/todos
        method: "POST",
        body: newTodo, // Request body with todo data
      }),
      // After successful creation, invalidate Todo cache to refetch fresh data
      invalidatesTags: ["Todo"],
    }),

    // Mutation endpoint for updating existing todos
    updateTodo: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `todos/${id}`, // PATCH /api/todos/:id
        method: "PATCH",
        body: patch, // Only the fields to update
      }),
      // After successful update, invalidate Todo cache
      invalidatesTags: ["Todo"],
    }),

    // Additional query with more complex caching
    getTodoById: builder.query({
      query: (id) => `todos/${id}`, // GET /api/todos/:id
      providesTags: (result, error, id) => [{ type: "Todo", id }], // Specific tag for this todo
    }),
  }),
});

// Export auto-generated hooks for use in React components
// These hooks handle loading states, errors, caching, and refetching automatically
export const {
  useGetTodosQuery,
  useAddTodoMutation,
  useUpdateTodoMutation,
  useGetTodoByIdQuery,
} = apiSlice;
```

### Using RTK Query Hooks

RTK Query hooks make data fetching incredibly simple in React components. They automatically handle loading states, errors, caching, and re-fetching, eliminating the need for useEffect and manual state management for API calls.

**What this component demonstrates:**

- **Input**: No manual setup needed - hooks handle everything
- **Process**: Automatic data fetching, caching, loading/error state management
- **Output**: Reactive UI that updates when data changes
- **Key features**: Automatic refetching, optimistic updates, error handling

```javascript
import { useGetTodosQuery, useAddTodoMutation } from "./api/apiSlice";

const TodoList = () => {
  // useGetTodosQuery automatically handles:
  // - Making the initial API call
  // - Caching the result
  // - Providing loading and error states
  // - Re-fetching when cache is invalidated
  const {
    data: todos, // The fetched todo data (undefined while loading)
    error, // Any error that occurred during fetching
    isLoading, // True during the initial fetch
    isFetching, // True during any fetch (including background refetches)
    refetch, // Function to manually trigger a refetch
  } = useGetTodosQuery();

  // useAddTodoMutation returns a trigger function and state
  const [
    addTodo, // Function to trigger the mutation
    {
      isLoading: isAdding, // Loading state specific to this mutation
      error: addError, // Error state specific to this mutation
    },
  ] = useAddTodoMutation();

  // Handle adding a new todo with error handling
  const handleAddTodo = async (text) => {
    try {
      // Call the mutation and unwrap the result
      // unwrap() throws an error if the mutation fails, allowing us to catch it
      const result = await addTodo({ text }).unwrap();
      console.log("Todo added successfully:", result);

      // The todos list will automatically update due to cache invalidation
      // No manual state updates needed!
    } catch (error) {
      // Handle the error (could show a toast notification)
      console.error("Failed to add todo:", error);
    }
  };

  // Handle different UI states
  if (isLoading) return <div>Loading todos...</div>;
  if (error) return <div>Error loading todos: {error.message}</div>;

  return (
    <div>
      <h2>Todo List</h2>

      {/* Render todos with optional chaining for safety */}
      {todos?.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}

      {/* Add new todo button with loading state */}
      <button onClick={() => handleAddTodo("New todo")} disabled={isAdding}>
        {isAdding ? "Adding..." : "Add Todo"}
      </button>

      {/* Manual refetch button (useful for pull-to-refresh) */}
      <button onClick={() => refetch()}>Refresh Todos</button>

      {/* Show add error if any */}
      {addError && (
        <div style={{ color: "red" }}>
          Failed to add todo: {addError.message}
        </div>
      )}
    </div>
  );
};
```

## Advanced Patterns and Best Practices

### Feature-Based File Structure

Organizing Redux Toolkit code by features rather than by file types creates better maintainability and makes it easier to understand the codebase. This structure groups related functionality together and promotes code reusability.

**What this structure provides:**

- **Input**: Related functionality grouped by domain (todos, users, etc.)
- **Process**: Co-location of slices, API definitions, and components
- **Output**: More maintainable and scalable codebase
- **Benefits**: Easier to find code, better separation of concerns, reusable feature modules

```
src/
  features/                    # Feature-based organization
    todos/                     # Everything related to todos
      todosSlice.js           # Redux slice for todo state management
      todosApi.js             # RTK Query API definitions for todos
      TodoList.jsx            # React components for todo functionality
      TodoItem.jsx
      hooks/                  # Feature-specific custom hooks
        useTodoFilters.js
      types/                  # TypeScript types for this feature
        todo.types.ts
    users/                     # Everything related to users
      usersSlice.js           # User state management
      usersApi.js             # User API definitions
      UserProfile.jsx         # User-related components
      UserSettings.jsx
    auth/                      # Authentication feature
      authSlice.js
      authApi.js
      LoginForm.jsx
      ProtectedRoute.jsx
  app/                         # App-level configuration
    store.js                  # Redux store configuration
    rootReducer.js            # Root reducer (if needed)
    middleware.js             # Custom middleware
  shared/                      # Shared utilities and components
    components/               # Reusable UI components
    hooks/                    # App-wide custom hooks
    utils/                    # Utility functions
    types/                    # Shared TypeScript types
```

### Type-Safe Redux Hooks

These custom hooks provide type safety for Redux operations in TypeScript projects. They ensure that `useSelector` and `useDispatch` are properly typed with your specific store configuration, enabling better IntelliSense and catching type errors at compile time.

**What these hooks provide:**

- **Input**: Redux store state and dispatch function
- **Process**: Type-safe wrappers around standard Redux hooks
- **Output**: Fully typed hooks that provide autocomplete and type checking
- **Benefits**: Better developer experience, fewer runtime errors, improved IntelliSense

```typescript
// app/hooks.ts - Type-safe Redux hooks for better TypeScript experience
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Type-safe dispatch hook
// Use this instead of the plain `useDispatch` from react-redux
// Provides autocomplete for thunk actions and proper typing
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Type-safe selector hook
// Use this instead of the plain `useSelector` from react-redux
// Provides autocomplete for state properties and type checking
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Example usage in a component:
// const dispatch = useAppDispatch(); // Fully typed dispatch
// const todos = useAppSelector(state => state.todos.items); // Fully typed selector

// Optional: Pre-configured selectors for common patterns
export const useAppStore = () => useAppSelector((state) => state);
export const useAppLoading = () => useAppSelector((state) => state.loading);
```

### Slice Composition

Slice composition allows you to combine multiple slices and even implement lazy loading for better code splitting. This is particularly useful in large applications where you want to load features on demand rather than including everything in the initial bundle.

**What this pattern enables:**

- **Input**: Multiple independent slices from different features
- **Process**: Dynamic combination and lazy loading of slices
- **Output**: Optimized bundle size and runtime slice injection
- **Benefits**: Better performance, code splitting, feature-based loading

```javascript
// Combining multiple slices using combineSlices (RTK 2.0+)
import { combineSlices } from "@reduxjs/toolkit";
import { todosSlice } from "./features/todos/todosSlice";
import { usersSlice } from "./features/users/usersSlice";

// Automatically combines slice reducers and infers state shape
export const rootReducer = combineSlices(todosSlice, usersSlice);

// Alternative: Manual combination for older RTK versions
export const manualRootReducer = {
  todos: todosSlice.reducer,
  users: usersSlice.reducer,
};

// Lazy slice loading pattern for code splitting
const store = configureStore({
  reducer: {
    // Start with essential slices only
    todos: todosSlice.reducer,
    // Users slice will be loaded later when needed
  },
});

// Function to dynamically inject new slices at runtime
export const injectSlice = (sliceName, sliceReducer) => {
  // Add the new slice to the store dynamically
  store.replaceReducer({
    ...store.getState(),
    [sliceName]: sliceReducer,
  });
};

// Example: Load users slice when user navigates to user section
const loadUsersFeature = async () => {
  // Lazy import the slice (enables code splitting)
  const { usersSlice } = await import("./features/users/usersSlice");

  // Inject the slice into the running store
  injectSlice("users", usersSlice.reducer);

  return usersSlice;
};

// Usage in a React component with lazy loading
const UserSection = () => {
  const [usersLoaded, setUsersLoaded] = useState(false);

  useEffect(() => {
    loadUsersFeature().then(() => {
      setUsersLoaded(true);
    });
  }, []);

  if (!usersLoaded) return <div>Loading users feature...</div>;

  return <UserList />;
};
```

## Performance Optimizations

### Selector Optimization

Memoized selectors prevent unnecessary re-computations and re-renders by only recalculating when their input dependencies change. This is crucial for performance in larger applications where expensive calculations might run on every state change.

**What this optimization provides:**

- **Input**: Raw state slices that need transformation or filtering
- **Process**: Memoized computation that only runs when dependencies change
- **Output**: Optimized derived state that prevents unnecessary re-renders
- **Benefits**: Better performance, fewer component re-renders, cached calculations

```javascript
import { createSelector } from "@reduxjs/toolkit";

// Basic input selectors - these extract data from state
const selectTodos = (state) => state.todos.items;
const selectFilter = (state) => state.todos.filter;
const selectSearchTerm = (state) => state.todos.searchTerm;

// Memoized selector that combines multiple inputs
// Only recalculates when todos or filter changes
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    // This expensive filtering only runs when todos or filter changes
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }
);

// More complex selector with multiple dependencies
export const selectFilteredAndSearchedTodos = createSelector(
  [selectFilteredTodos, selectSearchTerm],
  (filteredTodos, searchTerm) => {
    if (!searchTerm) return filteredTodos;

    // Only runs when filteredTodos or searchTerm changes
    return filteredTodos.filter((todo) =>
      todo.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);

// Selector for computed statistics
export const selectTodoStats = createSelector([selectTodos], (todos) => ({
  total: todos.length,
  completed: todos.filter((todo) => todo.completed).length,
  active: todos.filter((todo) => !todo.completed).length,
  completionPercentage:
    todos.length > 0
      ? Math.round(
          (todos.filter((todo) => todo.completed).length / todos.length) * 100
        )
      : 0,
}));
```

### RTK Query Cache Configuration

RTK Query's caching system is highly configurable, allowing you to optimize for different use cases like real-time data, infrequently changing data, or user-specific content. Proper cache configuration can dramatically improve user experience and reduce server load.

**What these configurations control:**

- **Input**: API endpoints and their specific caching requirements
- **Process**: Automatic cache management, background updates, and invalidation
- **Output**: Optimized data fetching with minimal redundant requests
- **Benefits**: Faster UX, reduced bandwidth, better offline experience

```javascript
const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),

  // Global cache settings
  keepUnusedDataFor: 60, // Cache data for 60 seconds after last component unmounts

  // Global refetch settings
  refetchOnMountOrArgChange: true, // Refetch when component mounts or args change
  refetchOnFocus: true, // Refetch when window regains focus
  refetchOnReconnect: true, // Refetch when network connection is restored

  tagTypes: ["Todo", "User"],

  endpoints: (builder) => ({
    // Endpoint with custom cache behavior
    getTodos: builder.query({
      query: () => "todos",
      // Override global settings for this endpoint
      keepUnusedDataFor: 30, // Cache for only 30 seconds

      // Advanced caching: provide specific tags for fine-grained invalidation
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Todo" as const, id })),
              { type: "Todo", id: "LIST" },
            ]
          : [{ type: "Todo", id: "LIST" }],
    }),

    // Endpoint with polling for real-time updates
    getLiveTodos: builder.query({
      query: () => "todos/live",
      // Poll every 5 seconds for real-time updates
      pollingInterval: 5000,
      // Skip polling when tab is not visible
      skipPollingIfUnfocused: true,
    }),

    // Endpoint with transformation and caching
    getTodoWithStats: builder.query({
      query: (id) => `todos/${id}`,
      // Transform response before caching
      transformResponse: (response, meta, arg) => ({
        ...response,
        // Add computed properties
        isOverdue: new Date(response.dueDate) < new Date(),
        daysRemaining: Math.ceil((new Date(response.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      }),
      // Cache for a longer time since this data doesn't change often
      keepUnusedDataFor: 300, // 5 minutes
    }),

    // Mutation with optimistic updates
    updateTodo: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `todos/${id}`,
        method: "PATCH",
        body: patch,
      }),
      // Optimistic update - immediately update cache before API response
      onQueryStarted: async ({ id, ...patch }, { dispatch, queryFulfilled }) => {
        // Optimistically update the cache
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getTodos", undefined, (draft) => {
            const todo = draft.find((todo) => todo.id === id);
            if (todo) {
              Object.assign(todo, patch);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Rollback optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: "Todo", id }],
    }),
  }),
});
```

## Conclusion

Redux Toolkit transforms Redux development from a verbose, configuration-heavy experience into a streamlined, developer-friendly process. By abstracting away common patterns and providing sensible defaults, RTK allows you to focus on your application logic rather than Redux boilerplate.

### Key RTK Advantages

1. **Dramatic Boilerplate Reduction**: `createSlice` eliminates action types and creators
2. **Simplified Store Setup**: `configureStore` provides sensible defaults
3. **Built-in Immer**: Write "mutative" logic that's actually immutable
4. **Powerful Data Fetching**: RTK Query handles caching, loading states, and cache invalidation
5. **Excellent TypeScript Support**: First-class TypeScript integration
6. **Performance Optimized**: Built-in memoization and optimization strategies

As highlighted in the [Redux Toolkit repository](https://github.com/reduxjs/redux-toolkit), RTK is now the recommended approach for all Redux development, providing the benefits of Redux with significantly improved developer experience and reduced complexity.

### Further Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [RTK Query Overview](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit GitHub](https://github.com/reduxjs/redux-toolkit)
