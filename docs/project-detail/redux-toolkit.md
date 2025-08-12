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

```javascript
// Traditional Redux store setup
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import todosReducer from "./todosReducer";
import usersReducer from "./usersReducer";

const rootReducer = combineReducers({
  todos: todosReducer,
  users: usersReducer,
});

const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

// RTK simplified version
import { configureStore } from "@reduxjs/toolkit";
import todosSlice from "./todosSlice";
import usersSlice from "./usersSlice";

const store = configureStore({
  reducer: {
    todos: todosSlice,
    users: usersSlice,
  },
});
```

### 2. Boilerplate Reduction

```javascript
// Traditional Redux - Action types, creators, and reducer
const ADD_TODO = "todos/addTodo";
const TOGGLE_TODO = "todos/toggleTodo";

const addTodo = (text) => ({ type: ADD_TODO, payload: text });
const toggleTodo = (id) => ({ type: TOGGLE_TODO, payload: id });

const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        { id: Date.now(), text: action.payload, completed: false },
      ];
    case TOGGLE_TODO:
      return state.map((todo) =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
};

// RTK equivalent
import { createSlice } from "@reduxjs/toolkit";

const todosSlice = createSlice({
  name: "todos",
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ id: Date.now(), text: action.payload, completed: false });
    },
    toggleTodo: (state, action) => {
      const todo = state.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
  },
});

export const { addTodo, toggleTodo } = todosSlice.actions;
export default todosSlice.reducer;
```

## Installation and Setup

```bash
# Install Redux Toolkit and React-Redux
npm install @reduxjs/toolkit react-redux

# Using RTK templates for new projects
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app
```

### Store Configuration

```javascript
// store.js
import { configureStore } from "@reduxjs/toolkit";
import todosSlice from "./features/todos/todosSlice";
import usersSlice from "./features/users/usersSlice";

export const store = configureStore({
  reducer: {
    todos: todosSlice,
    users: usersSlice,
  },
  // RTK includes these by default:
  // - redux-thunk middleware
  // - Redux DevTools Extension
  // - Immutability and serializability middleware (in dev)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Core APIs Deep Dive

### createSlice() - The Heart of RTK

```javascript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodosState {
  items: Todo[];
  filter: "all" | "active" | "completed";
}

const initialState: TodosState = {
  items: [],
  filter: "all",
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    // RTK uses Immer internally - you can "mutate" the state
    addTodo: (state, action: PayloadAction<string>) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false,
      });
    },

    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.items.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    removeTodo: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((todo) => todo.id !== action.payload);
    },

    setFilter: (
      state,
      action: PayloadAction<"all" | "active" | "completed">
    ) => {
      state.filter = action.payload;
    },

    // Prepare callback for more complex action payloads
    addTodoWithId: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.items.push(action.payload);
      },
      prepare: (text: string) => ({
        payload: {
          id: Math.random(),
          text,
          completed: false,
        },
      }),
    },
  },
});

export const { addTodo, toggleTodo, removeTodo, setFilter, addTodoWithId } =
  todosSlice.actions;
export default todosSlice.reducer;
```

### createAsyncThunk() - Async Logic

```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Async thunk for API calls
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}/todos`);
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTodoAsync = createAsyncThunk(
  'todos/addTodo',
  async (text: string, { getState, dispatch }) => {
    const state = getState() as RootState;
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, userId: state.auth.user.id }),
    });
    return await response.json();
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Sync reducers here
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

## Under the Hood: How RTK Works

### createSlice Implementation Concept

```javascript
// Simplified createSlice implementation
function createSlice({ name, initialState, reducers, extraReducers }) {
  const actionCreators = {};
  const actionTypes = {};

  // Generate action types and creators
  Object.keys(reducers).forEach((reducerName) => {
    const type = `${name}/${reducerName}`;
    actionTypes[reducerName] = type;

    // Create action creator
    actionCreators[reducerName] = (payload) => ({
      type,
      payload,
    });
  });

  // Create the reducer function
  const reducer = (state = initialState, action) => {
    // Use Immer's produce for immutable updates
    return produce(state, (draft) => {
      const caseReducer = reducers[action.type];
      if (caseReducer) {
        caseReducer(draft, action);
      }
    });
  };

  // Handle extraReducers (for async thunks)
  if (extraReducers) {
    const extraReducerMap = {};
    const builder = {
      addCase: (actionCreator, reducer) => {
        extraReducerMap[actionCreator.type] = reducer;
      },
    };
    extraReducers(builder);

    // Merge extra reducers with main reducer
    const originalReducer = reducer;
    reducer = (state, action) => {
      const extraReducer = extraReducerMap[action.type];
      if (extraReducer) {
        return produce(state, (draft) => extraReducer(draft, action));
      }
      return originalReducer(state, action);
    };
  }

  return {
    actions: actionCreators,
    reducer,
    actionTypes,
  };
}
```

### Immer Integration

```javascript
// What RTK does internally with Immer
import produce from "immer";

// Your "mutative" code
const reducer = (state, action) => {
  state.items.push(newItem); // Looks like mutation
};

// What Immer actually does
const actualReducer = (state, action) => {
  return produce(state, (draft) => {
    draft.items.push(newItem); // Safe "mutation" on draft
  });
};
```

## RTK Query: Data Fetching Solution

RTK Query is included in Redux Toolkit and provides powerful data fetching and caching capabilities.

### Basic RTK Query Setup

```javascript
// api/apiSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Todo", "User"],
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
    updateTodo: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `todos/${id}`,
        method: "PATCH",
        body: patch,
      }),
      invalidatesTags: ["Todo"],
    }),
  }),
});

export const { useGetTodosQuery, useAddTodoMutation, useUpdateTodoMutation } =
  apiSlice;
```

### Using RTK Query Hooks

```javascript
import { useGetTodosQuery, useAddTodoMutation } from "./api/apiSlice";

const TodoList = () => {
  const { data: todos, error, isLoading, refetch } = useGetTodosQuery();

  const [addTodo, { isLoading: isAdding }] = useAddTodoMutation();

  const handleAddTodo = async (text) => {
    try {
      await addTodo({ text }).unwrap();
    } catch (error) {
      console.error("Failed to add todo:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {todos?.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      <button onClick={() => handleAddTodo("New todo")} disabled={isAdding}>
        {isAdding ? "Adding..." : "Add Todo"}
      </button>
    </div>
  );
};
```

## Advanced Patterns and Best Practices

### Feature-Based File Structure

```
src/
  features/
    todos/
      todosSlice.js
      todosApi.js
      TodoList.jsx
      TodoItem.jsx
    users/
      usersSlice.js
      usersApi.js
  app/
    store.js
    rootReducer.js
```

### Type-Safe Redux Hooks

```typescript
// app/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

### Slice Composition

```javascript
// Combining multiple slices
import { combineSlices } from "@reduxjs/toolkit";
import { todosSlice } from "./todosSlice";
import { usersSlice } from "./usersSlice";

export const rootReducer = combineSlices(todosSlice, usersSlice);

// Lazy slice loading
const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
});

// Later, inject a new slice
store.dispatch({
  type: "reducer/inject",
  payload: { key: "users", reducer: usersSlice.reducer },
});
```

## Performance Optimizations

### Selector Optimization

```javascript
import { createSelector } from "@reduxjs/toolkit";

// Memoized selectors
const selectTodos = (state) => state.todos.items;
const selectFilter = (state) => state.todos.filter;

export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
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
```

### RTK Query Cache Configuration

```javascript
const apiSlice = createApi({
  // Cache data for 60 seconds
  keepUnusedDataFor: 60,

  // Refetch on mount/focus
  refetchOnMountOrArgChange: true,
  refetchOnFocus: true,
  refetchOnReconnect: true,

  endpoints: (builder) => ({
    getTodos: builder.query({
      query: () => "todos",
      // Custom cache behavior
      keepUnusedDataFor: 30,
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
