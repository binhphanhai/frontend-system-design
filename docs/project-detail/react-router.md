# React Router: Declarative Routing for React

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Under the Hood: How React Router Works](#under-the-hood-how-react-router-works)
- [Navigation System](#navigation-system)
- [Advanced Routing Patterns](#advanced-routing-patterns)
- [Hooks and Navigation](#hooks-and-navigation)
- [Performance Optimization](#performance-optimization)
- [Best Practices](#best-practices)
- [Conclusion](#conclusion)

## Introduction

React Router is a declarative routing library for React applications. As highlighted in the [React Router GitHub repository](https://github.com/remix-run/react-router), it serves as a multi-strategy router for React, bridging the gap from React 18 to React 19 and can be used maximally as a React framework or minimally as a library.

### Key Features

- **Declarative routing**: Define routes using JSX components
- **Nested routing**: Support for complex UI hierarchies
- **Dynamic routing**: Route parameters and programmatic navigation
- **Code splitting**: Lazy loading of route components
- **History management**: Browser history integration

## Getting Started

### Installation

```bash
# Install React Router DOM
npm install react-router-dom

# Or using yarn
yarn add react-router-dom

# Or using pnpm
pnpm add react-router-dom
```

### Basic Setup

```javascript
import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

// Components
const Home = () => <h1>Home Page</h1>;
const About = () => <h1>About Page</h1>;
const Contact = () => <h1>Contact Page</h1>;

// Layout component
const Layout = () => (
  <div>
    <nav>
      <a href="/">Home</a> | <a href="/about">About</a> |{" "}
      <a href="/contact">Contact</a>
    </nav>
    <main>
      <Outlet />
    </main>
  </div>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
    ],
  },
]);

// App component
function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

## Core Concepts

### Router Types

```javascript
import {
  createBrowserRouter,
  createHashRouter,
  createMemoryRouter,
} from "react-router-dom";

// Browser Router - Uses HTML5 History API
const browserRouter = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
]);

// Hash Router - Uses URL hash
const hashRouter = createHashRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
]);

// Memory Router - In-memory routing (testing)
const memoryRouter = createMemoryRouter([
  { path: "/", element: <Home /> },
  { path: "/about", element: <About /> },
]);
```

### Route Configuration

```javascript
// Declarative route configuration
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, // Index route
      { path: "about", element: <About /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "categories/*", element: <Categories /> }, // Splat route
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "analytics", element: <Analytics /> },
      { path: "settings", element: <Settings /> },
    ],
  },
  { path: "*", element: <NotFound /> }, // Catch-all route
];

const router = createBrowserRouter(routes);
```

## Under the Hood: How React Router Works

### Router Implementation Concept

```javascript
// Simplified Router implementation
class Router {
  constructor(routes) {
    this.routes = routes;
    this.history = window.history;
    this.location = window.location;
    this.listeners = [];

    // Listen for browser navigation
    window.addEventListener("popstate", this.handlePopState.bind(this));
  }

  // Match current URL to route configuration
  matchRoute(pathname) {
    for (const route of this.routes) {
      const match = this.matchPath(route.path, pathname);
      if (match) {
        return { route, match };
      }
    }
    return null;
  }

  // Path matching algorithm
  matchPath(routePath, pathname) {
    // Convert route path to regex pattern
    const pattern = routePath
      .replace(/:[^/]+/g, "([^/]+)") // :id -> ([^/]+)
      .replace(/\*/g, "(.*)"); // * -> (.*)

    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);

    if (match) {
      const [, ...params] = match;
      return { params, pathname };
    }

    return null;
  }

  // Navigation methods
  navigate(to, options = {}) {
    if (options.replace) {
      this.history.replaceState(null, "", to);
    } else {
      this.history.pushState(null, "", to);
    }

    this.notifyListeners();
  }

  // Browser back/forward handling
  handlePopState(event) {
    this.notifyListeners();
  }

  // Notify components of route changes
  notifyListeners() {
    const currentMatch = this.matchRoute(this.location.pathname);
    this.listeners.forEach((listener) => listener(currentMatch));
  }

  // Subscribe to route changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}
```

### Route Matching System

```javascript
// Path-to-RegExp style matching
const pathToRegexp = (path) => {
  // Handle dynamic segments
  const paramNames = [];
  const pattern = path.replace(/:([^/]+)/g, (match, paramName) => {
    paramNames.push(paramName);
    return "([^/]+)";
  });

  return {
    regex: new RegExp(`^${pattern}$`),
    paramNames,
  };
};

// Route matching function
const matchRoute = (routePath, currentPath) => {
  const { regex, paramNames } = pathToRegexp(routePath);
  const match = currentPath.match(regex);

  if (!match) return null;

  const [, ...values] = match;
  const params = paramNames.reduce((acc, name, index) => {
    acc[name] = values[index];
    return acc;
  }, {});

  return { params, path: currentPath };
};

// Example usage
const routes = [
  { path: "/users/:id", component: UserProfile },
  { path: "/products/:category/:id", component: ProductDetail },
  { path: "/search/*", component: SearchResults },
];

const currentPath = "/users/123";
const match = matchRoute("/users/:id", currentPath);
// Result: { params: { id: "123" }, path: "/users/123" }
```

## Navigation System

### History Management

```javascript
// History abstraction
class History {
  constructor() {
    this.index = 0;
    this.entries = [{ pathname: "/", state: null }];
    this.listeners = [];
  }

  // Navigate to new location
  push(to, state = null) {
    this.index++;
    this.entries = this.entries.slice(0, this.index);
    this.entries.push({ pathname: to, state });

    window.history.pushState(state, "", to);
    this.notify();
  }

  // Replace current location
  replace(to, state = null) {
    this.entries[this.index] = { pathname: to, state };
    window.history.replaceState(state, "", to);
    this.notify();
  }

  // Go back/forward
  go(n) {
    const newIndex = this.index + n;
    if (newIndex >= 0 && newIndex < this.entries.length) {
      this.index = newIndex;
      const entry = this.entries[this.index];
      window.history.go(n);
      this.notify();
    }
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }

  // Get current location
  get location() {
    return this.entries[this.index];
  }

  // Listen for changes
  listen(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.location));
  }
}
```

### Link and Navigation Components

```javascript
// Link component implementation
const Link = ({ to, children, replace = false, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();

    // Handle modifier keys
    if (event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    navigate(to, { replace });
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

// NavLink with active state
const NavLink = ({ to, children, activeClassName, ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={isActive ? activeClassName : ""} {...props}>
      {children}
    </Link>
  );
};
```

## Advanced Routing Patterns

### Nested Routes and Outlets

```javascript
// Layout with nested routes
const DashboardLayout = () => {
  return (
    <div className="dashboard">
      <aside>
        <nav>
          <Link to="/dashboard">Overview</Link>
          <Link to="/dashboard/analytics">Analytics</Link>
          <Link to="/dashboard/settings">Settings</Link>
        </nav>
      </aside>
      <main>
        <Outlet /> {/* Renders child routes */}
      </main>
    </div>
  );
};

// Route configuration with nesting
const routes = [
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "analytics", element: <Analytics /> },
      { path: "settings", element: <Settings /> },
      {
        path: "users",
        element: <UsersLayout />,
        children: [
          { index: true, element: <UsersList /> },
          { path: ":id", element: <UserDetail /> },
          { path: ":id/edit", element: <UserEdit /> },
        ],
      },
    ],
  },
];
```

### Dynamic Route Loading

```javascript
// Lazy loading with React.lazy
const LazyDashboard = React.lazy(() => import("./Dashboard"));
const LazySettings = React.lazy(() => import("./Settings"));

// Route configuration with lazy loading
const routes = [
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <LazyDashboard />
      </Suspense>
    ),
  },
  {
    path: "/settings",
    element: (
      <Suspense fallback={<div>Loading Settings...</div>}>
        <LazySettings />
      </Suspense>
    ),
  },
];

// Route-based code splitting
const createLazyRoute = (importFunc, fallback = <div>Loading...</div>) => {
  const LazyComponent = React.lazy(importFunc);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

// Usage
const routes = [
  {
    path: "/products",
    element: createLazyRoute(() => import("./Products")),
  },
  {
    path: "/orders",
    element: createLazyRoute(() => import("./Orders")),
  },
];
```

## Hooks and Navigation

### Core Router Hooks

```javascript
import {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

// Navigation hook
const Navigation = () => {
  const navigate = useNavigate();

  const handleNavigation = () => {
    // Programmatic navigation
    navigate("/dashboard");

    // Navigation with state
    navigate("/profile", { state: { from: "dashboard" } });

    // Replace current entry
    navigate("/login", { replace: true });

    // Go back
    navigate(-1);
  };

  return <button onClick={handleNavigation}>Navigate</button>;
};

// Location and params hooks
const UserProfile = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  console.log("Current path:", location.pathname);
  console.log("User ID:", params.id);
  console.log("Search query:", searchParams.get("q"));

  const updateSearch = () => {
    setSearchParams({ q: "new search", filter: "active" });
  };

  return (
    <div>
      <h1>User Profile: {params.id}</h1>
      <button onClick={updateSearch}>Update Search</button>
    </div>
  );
};
```

### Custom Router Hooks

```javascript
// Custom hook for route guards
const useAuthGuard = (redirectTo = "/login") => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuth(); // Your auth logic

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo, {
        state: { from: location },
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, redirectTo, location]);

  return isAuthenticated;
};

// Custom hook for query parameters
const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key) => searchParams.get(key);

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === undefined) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const removeParam = (key) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
  };

  return { getParam, setParam, removeParam, searchParams };
};
```

## Performance Optimization

### Route Preloading

```javascript
// Route preloading strategy
const preloadRoute = (routePath) => {
  const route = routes.find((r) => r.path === routePath);
  if (route && route.lazy) {
    route.lazy(); // Preload the component
  }
};

// Preload on hover
const PreloadLink = ({ to, children, ...props }) => {
  const handleMouseEnter = () => {
    preloadRoute(to);
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter} {...props}>
      {children}
    </Link>
  );
};

// Intersection Observer for preloading
const useIntersectionPreload = (routes) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const routePath = entry.target.dataset.preloadRoute;
          if (routePath) {
            preloadRoute(routePath);
          }
        }
      });
    });

    document.querySelectorAll("[data-preload-route]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [routes]);
};
```

### Memory Management

```javascript
// Route cleanup and memory management
const useRouteCleanup = () => {
  const location = useLocation();

  useEffect(() => {
    // Cleanup previous route resources
    return () => {
      // Cancel any pending requests
      // Clear intervals/timeouts
      // Cleanup event listeners
    };
  }, [location.pathname]);
};

// Memoized route components
const MemoizedRoute = React.memo(({ children }) => {
  return children;
});

// Virtual scrolling for large route lists
const VirtualRouteList = ({ routes, itemHeight = 50 }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  const visibleRoutes = routes.slice(visibleRange.start, visibleRange.end);

  return (
    <div>
      {visibleRoutes.map((route, index) => (
        <MemoizedRoute key={route.path}>
          <route.component />
        </MemoizedRoute>
      ))}
    </div>
  );
};
```

## Best Practices

### Route Organization

```javascript
// Feature-based route organization
const createFeatureRoutes = (basePath, routes) => ({
  path: basePath,
  children: routes,
});

// Auth routes
const authRoutes = createFeatureRoutes("/auth", [
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "forgot-password", element: <ForgotPassword /> },
]);

// Dashboard routes
const dashboardRoutes = createFeatureRoutes("/dashboard", [
  { index: true, element: <DashboardHome /> },
  { path: "analytics", element: <Analytics /> },
  { path: "settings", element: <Settings /> },
]);

// Combine all routes
const appRoutes = [
  { path: "/", element: <Home /> },
  authRoutes,
  dashboardRoutes,
  { path: "*", element: <NotFound /> },
];
```

### Error Boundaries

```javascript
// Route-level error boundary
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap routes with error boundary
const SafeRoute = ({ element }) => (
  <RouteErrorBoundary>{element}</RouteErrorBoundary>
);
```

## Conclusion

React Router provides a powerful and flexible routing solution for React applications. By understanding its declarative API, history management, and internal routing mechanisms, developers can build sophisticated navigation systems that enhance user experience.

### Key Takeaways

1. **Declarative Routing**: Define routes using JSX configuration objects
2. **History Management**: Leverages browser History API for seamless navigation
3. **Route Matching**: Powerful pattern matching with parameters and wildcards
4. **Component Composition**: Nested routes and outlet patterns for complex layouts
5. **Performance**: Code splitting and lazy loading for optimal bundle sizes

As referenced in the [React Router GitHub repository](https://github.com/remix-run/react-router), React Router continues to evolve as a comprehensive routing solution, bridging modern React patterns with robust navigation capabilities.

### Further Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Router GitHub Repository](https://github.com/remix-run/react-router)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
