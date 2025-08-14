# Single-SPA: Microfrontend Framework

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
- [Under the Hood: How Single-SPA Works](#under-the-hood-how-single-spa-works)
- [Application Lifecycle](#application-lifecycle)
- [Inter-App Communication](#inter-app-communication)
- [Best Practices](#best-practices)
- [Advanced Patterns](#advanced-patterns)
- [Conclusion](#conclusion)

## Introduction

Single-SPA is a JavaScript framework for building microfrontends that allows multiple JavaScript applications to coexist and be written with their own frameworks. As highlighted in the [Single-SPA GitHub repository](https://github.com/single-spa/single-spa), it enables you to use multiple frameworks on the same page, write new code without rewriting existing apps, and lazy load code for improved performance.

### Key Benefits

- **Framework Agnostic**: Mix React, Angular, Vue, or any framework
- **Independent Deployment**: Deploy microfrontends separately
- **Lazy Loading**: Load applications on demand
- **Legacy Integration**: Gradually migrate existing applications
- **Team Autonomy**: Different teams can work independently

## Getting Started

### Installation and Setup

This section demonstrates how to set up Single-SPA from scratch. The CLI provides scaffolding for different types of modules in the microfrontend ecosystem.

**What this code does**: Sets up the Single-SPA development environment and creates different types of modules
**Input**: Command line instructions
**Output**: Generated project structures for root config, applications, and utility modules

```bash
# Step 1: Install Single-SPA CLI globally for project scaffolding
npm install --global create-single-spa

# Step 2: Create a new root config (orchestrates all microfrontends)
npx create-single-spa --moduleType root-config

# Step 3: Create a microfrontend application (individual app that can be mounted/unmounted)
npx create-single-spa --moduleType app-parcel

# Step 4: Create a utility module (shared code between microfrontends)
npx create-single-spa --moduleType util-module
```

### Basic Root Config Setup

The root config is the central orchestrator that manages when and how microfrontends are loaded. It defines which applications should be active based on the current URL and handles the lifecycle of mounting and unmounting applications.

**What this code does**: Registers multiple microfrontend applications with their loading strategies and activation conditions
**Input**: Application configurations with names, loading functions, and activation rules
**Output**: A configured Single-SPA instance that manages application lifecycles based on routing
**Steps**:

1. Import Single-SPA core functions
2. Register each microfrontend with its activation condition
3. Start the Single-SPA router

```javascript
// src/root-config.js
import { registerApplication, start } from "single-spa";

// Register applications with their routing logic

// Navbar: Always visible across all routes
registerApplication({
  name: "navbar", // Unique identifier for this microfrontend
  app: () => import("@org/navbar"), // Lazy loading function that returns the application
  activeWhen: () => true, // Always mounted - navbar should be visible everywhere
});

// Home application: Only active on the root path
registerApplication({
  name: "home-app",
  app: () => import("@org/home"), // Dynamic import enables code splitting
  activeWhen: (location) => location.pathname === "/", // Only mount on homepage
});

// Dashboard application: Active on all dashboard routes
registerApplication({
  name: "dashboard-app",
  app: () => import("@org/dashboard"),
  activeWhen: (location) => location.pathname.startsWith("/dashboard"), // Mount on /dashboard/*
});

// Profile application: Simple string-based routing
registerApplication({
  name: "profile-app",
  app: () => import("@org/profile"),
  activeWhen: "/profile", // Shorthand for exact path match
});

// Start Single-SPA with configuration options
start({
  urlRerouteOnly: true, // Only reroute on URL changes, not on popstate events
});
```

### HTML Setup with Import Maps

The HTML file serves as the entry point for the microfrontend application. Import maps provide a way to resolve module specifiers without bundlers, enabling native ES modules to work with friendly names instead of full URLs.

**What this code does**: Sets up the HTML structure and module resolution for the Single-SPA application
**Input**: HTML template with import maps and module loading
**Output**: A web page that can dynamically load and render microfrontends
**Steps**:

1. Define import maps for module resolution
2. Load the root config as an ES module
3. Provide DOM containers for applications

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Microfrontend Application</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Import maps for module resolution - maps friendly names to actual URLs -->
    <script type="importmap">
      {
        "imports": {
          <!-- Core Single-SPA framework from CDN -->
          "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@6.0.0/lib/system/single-spa.min.js",

          <!-- Shared dependencies - React ecosystem -->
          "react": "https://cdn.jsdelivr.net/npm/react@18.2.0/index.js",
          "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/index.js",

          <!-- Application modules - these will be loaded dynamically -->
          "@org/root-config": "/root-config.js", <!-- Main orchestrator -->
          "@org/navbar": "/navbar.js", <!-- Navigation component -->
          "@org/home": "/home.js", <!-- Home page application -->
          "@org/dashboard": "/dashboard.js", <!-- Dashboard application -->
          "@org/profile": "/profile.js" <!-- Profile application -->
        }
      }
    </script>

    <!-- Load and execute the root config to start Single-SPA -->
    <script type="module">
      import("@org/root-config"); // This starts the entire microfrontend orchestration
    </script>
  </head>
  <body>
    <!-- DOM containers for applications -->
    <div id="single-spa-application:navbar"></div>
    <!-- Navbar will mount here -->
    <div id="main-content"></div>
    <!-- Other apps will mount here -->
  </body>
</html>
```

## Core Concepts

### Applications vs Parcels

Single-SPA distinguishes between two types of microfrontends: Applications and Parcels. Applications are route-based and automatically managed by Single-SPA's router, while Parcels are manually controlled components that can be mounted anywhere.

**What this code does**: Demonstrates the difference between Applications (route-controlled) and Parcels (manually controlled)
**Input**: Lifecycle methods for both application types
**Output**: Functional microfrontend components that can be integrated into the Single-SPA ecosystem
**Key Differences**:

- Applications: Automatically mounted/unmounted based on routes
- Parcels: Manually controlled, can be used like regular components

```javascript
// Application - Routed by Single-SPA (automatically managed)
const Application = {
  // Initialize the application once when first loaded
  bootstrap: () => Promise.resolve(),

  // Mount the application when route becomes active
  mount: (props) => {
    // Props include: name, singleSpa, mountParcel, and custom props
    // domElement is automatically provided based on application name
    return ReactDOM.render(<App {...props} />, props.domElement);
  },

  // Unmount when route becomes inactive
  unmount: (props) => {
    // Clean up all React components and event listeners
    ReactDOM.unmountComponentAtNode(props.domElement);
    return Promise.resolve();
  },
};

// Parcel - Manually controlled component (like a reusable widget)
const Parcel = {
  // One-time initialization
  bootstrap: () => Promise.resolve(),

  // Mount the parcel when explicitly requested
  mount: (props) => {
    // Props are passed manually when mounting the parcel
    // domElement must be provided by the parent application
    return ReactDOM.render(<Widget {...props} />, props.domElement);
  },

  // Unmount when explicitly requested
  unmount: (props) => {
    ReactDOM.unmountComponentAtNode(props.domElement);
    return Promise.resolve();
  },

  // Optional: handle prop updates without full remount
  update: (props) => {
    // Re-render with new props for better performance
    return ReactDOM.render(<Widget {...props} />, props.domElement);
  },
};
```

### Creating a React Microfrontend

This section shows how to create a React-based microfrontend using the `single-spa-react` helper library. This library automatically generates the required lifecycle methods (bootstrap, mount, unmount) for React applications.

**What this code does**: Creates a React microfrontend with automatic lifecycle management and error handling
**Input**: React components and configuration
**Output**: A Single-SPA compatible application with bootstrap, mount, and unmount methods
**Steps**:

1. Import required dependencies and the root React component
2. Configure single-spa-react with error boundary
3. Export lifecycle methods for Single-SPA
4. Optionally export component for parcel usage

```javascript
// src/app.js - React microfrontend entry point
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react"; // Helper for React integration
import RootComponent from "./root.component";

// Generate Single-SPA lifecycle methods automatically
const lifecycles = singleSpaReact({
  React, // React library reference
  ReactDOM, // ReactDOM for rendering
  rootComponent: RootComponent, // Main React component to render

  // Error boundary for handling React errors gracefully
  errorBoundary(err, info, props) {
    console.error("React microfrontend error:", err, info);
    // Return fallback UI when component crashes
    return <div>Something went wrong: {err.message}</div>;
  },
});

// Export the generated lifecycle methods for Single-SPA
export const { bootstrap, mount, unmount } = lifecycles;

// Optional: export for parcel usage in other microfrontends
export const App = RootComponent;
```

## Under the Hood: How Single-SPA Works

### Application Registration and Routing

This section provides a simplified implementation of how Single-SPA works internally. Understanding this helps developers grasp the framework's core concepts: application registration, lifecycle management, and routing logic.

**What this code does**: Demonstrates Single-SPA's internal architecture for managing microfrontend lifecycles
**Input**: Application configurations and browser navigation events
**Output**: Automatic mounting/unmounting of applications based on current route
**Key Components**:

- Application registry with status tracking
- Route-based activation logic
- Lifecycle state management
- Error handling and recovery

```javascript
// Simplified Single-SPA implementation concept
class SingleSPA {
  constructor() {
    this.apps = []; // Registry of all registered applications
    this.started = false; // Flag to track if Single-SPA has been started
  }

  // Register a new microfrontend application
  registerApplication(appConfig) {
    const app = {
      name: appConfig.name, // Unique identifier
      loadApp: appConfig.app, // Function that loads the application
      activeWhen: appConfig.activeWhen, // Route matching logic
      customProps: appConfig.customProps || {}, // Props passed to application
      status: "NOT_LOADED", // Initial lifecycle status
    };

    this.apps.push(app);

    // If Single-SPA is already started, check if this app should be mounted
    if (this.started) {
      this.reroute();
    }
  }

  // Start Single-SPA and begin listening for route changes
  start(opts = {}) {
    this.started = true;
    this.urlRerouteOnly = opts.urlRerouteOnly;

    // Listen for browser navigation events
    window.addEventListener("hashchange", () => this.reroute()); // Hash-based routing
    window.addEventListener("popstate", () => this.reroute()); // History API navigation

    // Override pushState and replaceState to catch programmatic navigation
    this.overrideHistoryAPI();

    // Perform initial routing to mount appropriate applications
    this.reroute();
  }

  // Core routing logic - determines which apps to mount/unmount
  async reroute() {
    const currentLocation = window.location;

    // Find applications that should be active but aren't mounted
    const appsToMount = this.apps.filter(
      (app) =>
        this.shouldBeActive(app, currentLocation) && app.status !== "MOUNTED"
    );

    // Find applications that are mounted but should no longer be active
    const appsToUnmount = this.apps.filter(
      (app) =>
        !this.shouldBeActive(app, currentLocation) && app.status === "MOUNTED"
    );

    // Unmount inactive apps first to free up resources
    await Promise.all(appsToUnmount.map((app) => this.unmountApp(app)));

    // Mount newly active apps
    await Promise.all(appsToMount.map((app) => this.mountApp(app)));
  }

  // Determine if an application should be active based on current location
  shouldBeActive(app, location) {
    if (typeof app.activeWhen === "function") {
      // Custom function for complex routing logic
      return app.activeWhen(location);
    }
    if (typeof app.activeWhen === "string") {
      // Simple string matching for path prefixes
      return location.pathname.startsWith(app.activeWhen);
    }
    return false;
  }

  // Mount an application through its complete lifecycle
  async mountApp(app) {
    try {
      // Step 1: Load the application if not already loaded
      if (app.status === "NOT_LOADED") {
        app.status = "LOADING";
        app.instance = await app.loadApp(); // Dynamic import of the application
        app.status = "LOADED";
      }

      // Step 2: Bootstrap the application (one-time initialization)
      if (app.status === "LOADED") {
        app.status = "BOOTSTRAPPING";
        await app.instance.bootstrap(); // Initialize app resources
        app.status = "NOT_MOUNTED";
      }

      // Step 3: Mount the application to the DOM
      if (app.status === "NOT_MOUNTED") {
        app.status = "MOUNTING";
        await app.instance.mount({
          name: app.name, // Application name
          singleSpa: this, // Reference to Single-SPA instance
          ...app.customProps, // Custom properties
        });
        app.status = "MOUNTED";
      }
    } catch (error) {
      // Mark app as broken to prevent further mount attempts
      app.status = "SKIP_BECAUSE_BROKEN";
      console.error(`Failed to mount app ${app.name}:`, error);
    }
  }

  // Unmount an application and clean up resources
  async unmountApp(app) {
    if (app.status === "MOUNTED") {
      app.status = "UNMOUNTING";
      await app.instance.unmount(); // Clean up DOM and event listeners
      app.status = "NOT_MOUNTED"; // Ready to be mounted again later
    }
  }
}
```

## Application Lifecycle

### Lifecycle Functions

Every Single-SPA application must implement specific lifecycle functions that Single-SPA calls at different stages. These functions control how applications are initialized, mounted to the DOM, unmounted, and optionally updated.

**What this code does**: Implements the complete lifecycle for a React-based microfrontend
**Input**: Props object containing application name, DOM element, and custom properties
**Output**: Promises that resolve when each lifecycle phase completes
**Lifecycle Stages**:

1. **Bootstrap**: One-time initialization when app is first loaded
2. **Mount**: Render the application to the DOM when route becomes active
3. **Unmount**: Clean up and remove from DOM when route becomes inactive
4. **Update**: (Optional) Handle prop changes without full remount

```javascript
// Detailed lifecycle implementation for a React microfrontend
const MyApp = {
  // 1. Bootstrap - Initialize app (runs once per browser session)
  bootstrap: async (props) => {
    console.log("Bootstrapping app", props.name);

    // One-time setup operations:
    // - Initialize global state stores
    // - Setup error boundaries and monitoring
    // - Configure third-party libraries
    // - Setup shared resources that persist between mounts
    await initializeApp();

    return Promise.resolve();
  },

  // 2. Mount - Render app to DOM (called every time route becomes active)
  mount: async (props) => {
    console.log("Mounting app", props.name);

    // Find or create the DOM container for this application
    // Single-SPA automatically creates elements with id="single-spa-application:{name}"
    const domElement =
      props.domElement ||
      document.getElementById(`single-spa-application:${props.name}`);

    // Create React 18 root for concurrent features
    const root = ReactDOM.createRoot(domElement);

    // Render the application with all props passed from Single-SPA
    // Props may include: routing info, shared state, custom data
    root.render(
      <App
        {...props} // All Single-SPA props
        history={props.history} // Routing history object
        basename={props.basename} // Base path for routing
      />
    );

    // Store React root reference for cleanup during unmount
    props.reactRoot = root;

    return Promise.resolve();
  },

  // 3. Unmount - Cleanup and remove from DOM (called when route becomes inactive)
  unmount: async (props) => {
    console.log("Unmounting app", props.name);

    // Cleanup React application and free memory
    if (props.reactRoot) {
      props.reactRoot.unmount(); // React 18 cleanup
    }

    // Critical cleanup operations:
    // - Remove event listeners
    // - Clear intervals/timeouts
    // - Cancel pending requests
    // - Cleanup WebSocket connections
    // - Remove global state subscriptions
    cleanup();

    return Promise.resolve();
  },

  // 4. Update - Handle prop changes (optional, for performance optimization)
  update: async (props) => {
    console.log("Updating app", props.name);

    // Re-render with new props without full unmount/mount cycle
    // Useful for:
    // - Theme changes
    // - User preference updates
    // - Shared state updates
    if (props.reactRoot) {
      props.reactRoot.render(<App {...props} />);
    }

    return Promise.resolve();
  },
};
```

## Inter-App Communication

### 1. Custom Events

Custom events provide a decoupled way for microfrontends to communicate without direct dependencies. This pattern uses the browser's native event system to enable pub/sub communication across applications.

**What this code does**: Implements a cross-application event bus for microfrontend communication
**Input**: Event names and data payloads
**Output**: Dispatched events that any application can listen to
**Use Cases**: User authentication, theme changes, notifications, shared state updates
**Benefits**: Loose coupling, framework agnostic, no shared dependencies

```javascript
// Utility for cross-app communication using browser's native event system
class EventBus {
  // Emit an event that any microfrontend can listen to
  static emit(eventName, data) {
    // Use CustomEvent to send structured data between apps
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  // Listen for events from other microfrontends
  static on(eventName, callback) {
    window.addEventListener(eventName, callback);

    // Return cleanup function for proper memory management
    // This prevents memory leaks when components unmount
    return () => window.removeEventListener(eventName, callback);
  }
}

// Example: Authentication app publishes login events
const publishUserLogin = (user) => {
  // Emit event with user data and metadata
  EventBus.emit("user:login", {
    user, // User object with profile info
    timestamp: Date.now(), // When the login occurred
    source: "auth-app", // Which app published the event
  });
};

// Example: Navigation app subscribes to login events
const cleanup = EventBus.on("user:login", (event) => {
  // Extract data from the event detail
  const { user, timestamp } = event.detail;

  console.log("User logged in:", user);

  // Update UI based on the login event
  updateNavbarUser(user);
  showWelcomeMessage(user.name);
  updateUserMenuOptions(user.permissions);
});

// Critical: Always clean up event listeners in unmount
export const unmount = () => {
  cleanup(); // Remove event listener to prevent memory leaks
  return Promise.resolve();
};
```

### 2. Shared State Management

Shared state management allows microfrontends to share data through a centralized store. This pattern is useful for maintaining consistent state across applications while avoiding prop drilling through the Single-SPA boundary.

**What this code does**: Creates a global state store that multiple microfrontends can read from and write to
**Input**: State updates from any microfrontend
**Output**: Synchronized state across all subscribed applications
**Use Cases**: User authentication state, theme preferences, shopping cart data, notification queues
**Pattern**: Observer pattern with pub/sub for state synchronization

```javascript
// shared-store.js - Global state store for cross-application data sharing
class SharedStore {
  constructor() {
    // Initialize global application state
    this.state = {
      user: null, // Current authenticated user
      theme: "light", // UI theme preference
      notifications: [], // Global notification queue
      shoppingCart: [], // E-commerce cart items
      permissions: [], // User permissions
    };

    // Array of callback functions that get notified on state changes
    this.subscribers = [];
  }

  // Get current state snapshot (read-only)
  getState() {
    return this.state; // Return current state for reading
  }

  // Update state and notify all subscribers
  setState(newState) {
    // Merge new state with existing state (immutable update)
    this.state = { ...this.state, ...newState };

    // Notify all subscribed microfrontends of the change
    this.notifySubscribers();
  }

  // Subscribe to state changes (returns unsubscribe function)
  subscribe(callback) {
    this.subscribers.push(callback);

    // Return cleanup function for memory management
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  // Internal method to notify all subscribers of state changes
  notifySubscribers() {
    // Call each subscriber with the new state
    this.subscribers.forEach((callback) => callback(this.state));
  }
}

// Create singleton instance on window object to ensure one store per page
// This pattern ensures the same store instance across all microfrontends
window.__SHARED_STORE__ = window.__SHARED_STORE__ || new SharedStore();

export default window.__SHARED_STORE__;

// Usage in microfrontends - React component example
import sharedStore from "@org/shared-store";

// React component that subscribes to global user state
const UserProfile = () => {
  // Initialize with current user from shared store
  const [user, setUser] = useState(sharedStore.getState().user);

  useEffect(() => {
    // Subscribe to state changes when component mounts
    const unsubscribe = sharedStore.subscribe((state) => {
      // Update local state when global state changes
      setUser(state.user);
    });

    // Cleanup subscription when component unmounts
    return unsubscribe;
  }, []);

  return <div>{user ? `Welcome, ${user.name}` : "Please log in"}</div>;
};

// Update global state from any microfrontend
const handleLogin = (userData) => {
  // This will trigger updates in all subscribed components across all apps
  sharedStore.setState({
    user: userData,
    permissions: userData.permissions,
  });
};
```

### 3. Parcel Communication

Parcels are manually controlled microfrontend components that can be mounted anywhere in any application. They're perfect for reusable UI components that need to be shared across different microfrontends.

**What this code does**: Creates a reusable modal component that any microfrontend can use
**Input**: Props including title, content, and callback functions
**Output**: A mounted modal component that can be controlled programmatically
**Use Cases**: Shared modals, widgets, notifications, tooltips, confirmation dialogs
**Benefits**: Reusable across apps, framework agnostic, controlled lifecycle

```javascript
// Modal parcel that can be used across any microfrontend
const ModalParcel = {
  // One-time initialization
  bootstrap: () => Promise.resolve(),

  // Mount the modal to a specific DOM element
  mount: (props) => {
    // Extract props passed from the parent application
    const { domElement, title, content, onClose, theme = "light" } = props;

    // Create modal structure with dynamic content
    const modal = document.createElement("div");
    modal.className = `modal-overlay modal-overlay--${theme}`;

    // Build modal HTML with provided content
    modal.innerHTML = `
      <div class="modal modal--${theme}" role="dialog" aria-modal="true">
        <div class="modal__header">
          <h2 class="modal__title">${title}</h2>
          <button class="modal__close" aria-label="Close modal">&times;</button>
        </div>
        <div class="modal__content">${content}</div>
        <div class="modal__footer">
          <button class="btn btn--primary close-btn">Close</button>
        </div>
      </div>
    `;

    // Add event listeners for close functionality
    const closeBtn = modal.querySelector(".close-btn");
    const closeX = modal.querySelector(".modal__close");

    const handleClose = () => {
      onClose && onClose(); // Call parent's close handler
    };

    closeBtn.onclick = handleClose;
    closeX.onclick = handleClose;

    // Close on overlay click
    modal.onclick = (e) => {
      if (e.target === modal) handleClose();
    };

    // Add to DOM and focus for accessibility
    domElement.appendChild(modal);
    modal.querySelector(".modal").focus();

    return Promise.resolve();
  },

  // Cleanup when modal is closed
  unmount: (props) => {
    // Remove all content and event listeners
    props.domElement.innerHTML = "";
    return Promise.resolve();
  },
};

// Usage across different microfrontends
import { mountRootParcel } from "single-spa";

// Function to programmatically show a modal from any app
const showModal = async (title, content, options = {}) => {
  // Mount the modal parcel with configuration
  const parcel = mountRootParcel(ModalParcel, {
    domElement: document.getElementById("modal-container"), // Global modal container
    title, // Modal title
    content, // Modal body content
    theme: options.theme || "light", // Theme preference
    onClose: () => {
      // Cleanup function when modal is closed
      parcel.unmount();
      options.onClose && options.onClose(); // Custom close handler
    },
  });

  return parcel; // Return parcel reference for manual control
};

// Example usage in different microfrontends:

// From an e-commerce app:
const showProductDetails = (product) => {
  showModal(
    product.name,
    `<img src="${product.image}" alt="${product.name}" />
     <p>${product.description}</p>
     <p>Price: $${product.price}</p>`,
    { theme: "dark" }
  );
};

// From a user management app:
const showUserProfile = (user) => {
  showModal(
    `User: ${user.name}`,
    `<p>Email: ${user.email}</p>
     <p>Role: ${user.role}</p>
     <p>Last Login: ${user.lastLogin}</p>`,
    {
      onClose: () => console.log("User profile closed"),
    }
  );
};
```

## Best Practices

### 1. Application Structure

```javascript
// Recommended folder structure
/*
root-config/
├── src/
│   ├── index.ejs
│   ├── root-config.js
│   └── microfrontend-layout.html

shared-dependencies/
├── src/
│   ├── react.js
│   ├── react-dom.js
│   └── shared-utils.js

navbar/
├── src/
│   ├── app.js
│   ├── root.component.js
│   └── navbar.component.js

home-app/
├── src/
│   ├── app.js
│   ├── root.component.js
│   └── components/
*/
```

### 2. Error Boundaries and Resilience

Error handling is crucial in microfrontend architectures to prevent one failing application from breaking the entire system. This pattern implements graceful degradation and fallback mechanisms.

**What this code does**: Wraps application registration with error handling and fallback UI
**Input**: Application configuration with potential loading failures
**Output**: Either the successfully loaded application or a fallback error UI
**Benefits**: System resilience, graceful degradation, improved user experience
**Error Scenarios**: Network failures, JavaScript errors, missing dependencies, server downtime

```javascript
// Global error handling wrapper for application registration
const registerApplicationWithErrorHandling = (config) => {
  registerApplication({
    ...config, // Spread original config (name, activeWhen, etc.)

    // Wrap the app loading function with error handling
    app: async () => {
      try {
        // Attempt to load the application normally
        return await config.app();
      } catch (error) {
        // Log the error for debugging and monitoring
        console.error(`Failed to load ${config.name}:`, error);

        // Send error to monitoring service (optional)
        if (window.errorReporting) {
          window.errorReporting.captureException(error, {
            tags: {
              microfrontend: config.name,
              type: "loading_failure",
            },
          });
        }

        // Return a fallback application with basic lifecycle methods
        return {
          // No initialization needed for fallback
          bootstrap: () => Promise.resolve(),

          // Mount fallback UI instead of the failed application
          mount: (props) => {
            // Create user-friendly error message
            props.domElement.innerHTML = `
              <div class="error-fallback" role="alert">
                <div class="error-fallback__icon">⚠️</div>
                <h3 class="error-fallback__title">Unable to load ${config.name}</h3>
                <p class="error-fallback__message">
                  This feature is temporarily unavailable. Please try refreshing the page.
                </p>
                <button class="error-fallback__retry" onclick="window.location.reload()">
                  Refresh Page
                </button>
                <details class="error-fallback__details">
                  <summary>Technical Details</summary>
                  <pre>${error.message}</pre>
                </details>
              </div>
            `;
            return Promise.resolve();
          },

          // Clean up fallback UI
          unmount: (props) => {
            props.domElement.innerHTML = "";
            return Promise.resolve();
          },
        };
      }
    },
  });
};

// Usage with enhanced error handling
registerApplicationWithErrorHandling({
  name: "critical-dashboard",
  app: () => import("@org/dashboard"),
  activeWhen: "/dashboard",
  customProps: {
    fallbackMessage: "Dashboard temporarily unavailable",
  },
});
```

### 3. Performance Optimization

Performance optimization in microfrontends involves strategic loading, preloading, and caching strategies. These techniques reduce perceived load times and improve user experience.

**What this code does**: Implements preloading strategies to improve application performance
**Input**: User interactions and routing patterns
**Output**: Faster application loading through strategic resource preloading
**Techniques**: Module preloading, hover-based prefetching, route-based optimization
**Benefits**: Reduced time to interactive, better perceived performance, improved UX

```javascript
// Advanced lazy loading with intelligent preloading strategies

// Preload application modules based on user behavior
const preloadApp = (appName) => {
  // Check if already preloaded to avoid duplicate requests
  if (document.querySelector(`link[href*="${appName}"]`)) {
    return;
  }

  // Create modulepreload link for browser optimization
  const link = document.createElement("link");
  link.rel = "modulepreload"; // Browser hint for module preloading
  link.href = `/apps/${appName}.js`; // Path to the application bundle
  link.crossOrigin = "anonymous"; // CORS handling

  // Add to document head for browser processing
  document.head.appendChild(link);

  console.log(`Preloading ${appName} for faster navigation`);
};

// Register application with preloading strategy
registerApplication({
  name: "dashboard",
  app: () => import("@org/dashboard"), // Lazy load when actually needed
  activeWhen: "/dashboard",
});

// Strategy 1: Preload on user intent (hover)
document.addEventListener("DOMContentLoaded", () => {
  const dashboardLink = document.querySelector(".dashboard-link");

  if (dashboardLink) {
    // Preload when user hovers (indicates intent to navigate)
    dashboardLink.addEventListener("mouseenter", () => {
      preloadApp("dashboard");
    });

    // Also preload on focus for keyboard navigation
    dashboardLink.addEventListener("focus", () => {
      preloadApp("dashboard");
    });
  }
});

// Strategy 2: Preload based on user role/permissions
const preloadBasedOnUser = (user) => {
  // Preload applications the user is likely to access
  if (user.role === "admin") {
    preloadApp("admin-panel");
    preloadApp("user-management");
  }

  if (user.permissions.includes("analytics")) {
    preloadApp("analytics-dashboard");
  }
};

// Strategy 3: Preload during idle time
const preloadDuringIdle = () => {
  // Use requestIdleCallback for non-critical preloading
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      // Preload less critical applications during browser idle time
      preloadApp("settings");
      preloadApp("help-center");
    });
  }
};

// Strategy 4: Intelligent preloading based on navigation patterns
class NavigationPreloader {
  constructor() {
    this.navigationHistory = [];
    this.preloadCache = new Set();
  }

  // Track user navigation patterns
  trackNavigation(route) {
    this.navigationHistory.push({
      route,
      timestamp: Date.now(),
    });

    // Keep only recent history (last 10 navigations)
    if (this.navigationHistory.length > 10) {
      this.navigationHistory.shift();
    }

    // Predict and preload next likely route
    this.predictAndPreload();
  }

  // Predict next route based on patterns
  predictAndPreload() {
    const recentRoutes = this.navigationHistory.slice(-5);

    // If user visited dashboard -> analytics 3+ times, preload analytics when on dashboard
    const currentRoute = window.location.pathname;

    if (currentRoute === "/dashboard") {
      const analyticsPattern = recentRoutes.filter(
        (nav, index) =>
          nav.route === "/analytics" &&
          recentRoutes[index - 1]?.route === "/dashboard"
      );

      if (analyticsPattern.length >= 2 && !this.preloadCache.has("analytics")) {
        preloadApp("analytics");
        this.preloadCache.add("analytics");
      }
    }
  }
}

// Initialize navigation tracking
const navPreloader = new NavigationPreloader();

// Track navigation changes
window.addEventListener("single-spa:routing-event", (event) => {
  navPreloader.trackNavigation(window.location.pathname);
});
```

### 4. Development vs Production Configuration

Different environments require different configuration strategies. This pattern allows seamless switching between local development and production deployments while maintaining the same codebase.

**What this code does**: Configures application loading based on the current environment
**Input**: Environment variables and build configurations
**Output**: Environment-appropriate application loading strategies
**Use Cases**: Local development, staging, production, testing environments
**Benefits**: Unified codebase, environment-specific optimization, easier debugging

```javascript
// Environment-based app loading with comprehensive configuration
const isLocal = process.env.NODE_ENV === "development";
const isStaging = process.env.NODE_ENV === "staging";
const isProduction = process.env.NODE_ENV === "production";

// Environment-specific base URLs
const getAppUrl = (appName) => {
  if (isLocal) {
    // Local development URLs with hot reloading
    const localPorts = {
      navbar: 8080,
      dashboard: 8081,
      profile: 8082,
      analytics: 8083,
    };
    return `http://localhost:${localPorts[appName]}/${appName}.js`;
  }

  if (isStaging) {
    // Staging environment with version hashes for testing
    return `https://staging-cdn.myapp.com/apps/${appName}.${process.env.BUILD_HASH}.js`;
  }

  if (isProduction) {
    // Production CDN with optimized bundles
    return `https://cdn.myapp.com/apps/${appName}.min.js`;
  }

  // Fallback for unknown environments
  return `/apps/${appName}.js`;
};

// Register applications with environment-aware loading
registerApplication({
  name: "navbar",
  app: () => import(getAppUrl("navbar")),
  activeWhen: () => true,
  customProps: {
    // Pass environment info to applications
    environment: process.env.NODE_ENV,
    apiUrl: process.env.API_BASE_URL,
    debugMode: isLocal,
  },
});

registerApplication({
  name: "dashboard",
  app: () => {
    // Add development-specific features
    if (isLocal) {
      // Enable hot module replacement in development
      if (module.hot) {
        module.hot.accept();
      }

      // Load unminified version for better debugging
      return import(getAppUrl("dashboard"));
    }

    // Production optimizations
    return import(getAppUrl("dashboard"));
  },
  activeWhen: "/dashboard",
  customProps: {
    // Environment-specific feature flags
    enableAnalytics: isProduction,
    enableDebugPanel: isLocal,
    apiTimeout: isLocal ? 30000 : 10000, // Longer timeout in dev
  },
});

// Development-only applications
if (isLocal) {
  registerApplication({
    name: "dev-tools",
    app: () => import("http://localhost:9000/dev-tools.js"),
    activeWhen: () => window.location.search.includes("debug=true"),
    customProps: {
      showPerformanceMetrics: true,
      enableStateInspector: true,
    },
  });
}
```

## Advanced Patterns

### Module Federation Integration

Module Federation enables dynamic code sharing between applications at runtime. When combined with Single-SPA, it provides powerful capabilities for sharing components, libraries, and even entire applications.

**What this code does**: Integrates Webpack Module Federation with Single-SPA for dynamic module sharing
**Input**: Webpack configuration and federated module imports
**Output**: Applications that can share code and components at runtime
**Benefits**: Reduced bundle sizes, shared dependencies, runtime code sharing
**Use Cases**: Shared component libraries, micro-frontends with common dependencies

```javascript
// webpack.config.js for the shell application (host)
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  mode: "development",
  devServer: {
    port: 3000, // Shell application port
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "shell", // Name of this application

      // Define remote applications that this shell can consume
      remotes: {
        // Map friendly names to actual federated module URLs
        navbar: "navbar@http://localhost:3001/remoteEntry.js",
        dashboard: "dashboard@http://localhost:3002/remoteEntry.js",
        profile: "profile@http://localhost:3003/remoteEntry.js",
      },

      // Share dependencies to avoid duplication
      shared: {
        react: {
          singleton: true, // Only one React instance across all apps
          requiredVersion: "^18.0.0",
          eager: true, // Load immediately, don't wait for async
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "^18.0.0",
          eager: true,
        },
        "react-router-dom": {
          singleton: true, // Shared routing
          requiredVersion: "^6.0.0",
        },
        // Share utility libraries
        lodash: {
          requiredVersion: "^4.17.0",
        },
      },
    }),
  ],
};

// webpack.config.js for a microfrontend (remote)
module.exports = {
  mode: "development",
  devServer: {
    port: 3001, // Navbar application port
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "navbar",
      filename: "remoteEntry.js", // Entry point for federation

      // Expose components/modules for other applications to consume
      exposes: {
        "./App": "./src/App", // Main application
        "./Navigation": "./src/components/Navigation", // Shared component
        "./UserMenu": "./src/components/UserMenu", // Reusable widget
      },

      // Same shared dependencies as shell
      shared: {
        react: { singleton: true, requiredVersion: "^18.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^18.0.0" },
        "react-router-dom": { singleton: true },
      },
    }),
  ],
};

// Loading federated modules in Single-SPA with error handling
registerApplication({
  name: "dashboard",
  app: async () => {
    try {
      // Import the federated module
      const module = await import("dashboard/App");

      // The module might export Single-SPA lifecycle methods directly
      if (module.bootstrap && module.mount && module.unmount) {
        return module; // Return the lifecycle methods
      }

      // Or it might export a React component that needs wrapping
      const Component = module.default;

      // Wrap React component with Single-SPA lifecycle
      return singleSpaReact({
        React,
        ReactDOM,
        rootComponent: Component,
      });
    } catch (error) {
      console.error("Failed to load federated dashboard:", error);

      // Return fallback application
      return {
        bootstrap: () => Promise.resolve(),
        mount: (props) => {
          props.domElement.innerHTML =
            "<div>Dashboard temporarily unavailable</div>";
          return Promise.resolve();
        },
        unmount: (props) => {
          props.domElement.innerHTML = "";
          return Promise.resolve();
        },
      };
    }
  },
  activeWhen: "/dashboard",
});

// Advanced pattern: Dynamically discover and register federated modules
const registerFederatedApp = async (remoteName, remoteUrl, routePath) => {
  try {
    // Dynamically add remote to Module Federation
    const remoteContainer = await import(remoteUrl);

    registerApplication({
      name: remoteName,
      app: async () => {
        const module = await remoteContainer.get("./App");
        return module();
      },
      activeWhen: routePath,
      customProps: {
        federated: true,
        remoteUrl: remoteUrl,
      },
    });
  } catch (error) {
    console.error(`Failed to register federated app ${remoteName}:`, error);
  }
};

// Register multiple federated applications
const federatedApps = [
  {
    name: "analytics",
    url: "http://localhost:3004/remoteEntry.js",
    route: "/analytics",
  },
  {
    name: "reports",
    url: "http://localhost:3005/remoteEntry.js",
    route: "/reports",
  },
];

federatedApps.forEach((app) => {
  registerFederatedApp(app.name, app.url, app.route);
});
```

## Conclusion

Single-SPA provides a powerful foundation for building microfrontend architectures that enable independent development, deployment, and scaling of web applications. By understanding its lifecycle management, communication patterns, and best practices, teams can build maintainable and performant distributed frontend systems.

### Key Takeaways

1. **Application Lifecycle**: Proper implementation of bootstrap, mount, and unmount functions
2. **Communication Patterns**: Use custom events, shared state, and parcels for inter-app communication
3. **Error Resilience**: Implement proper error boundaries and fallback mechanisms
4. **Performance**: Leverage lazy loading, preloading, and shared dependencies
5. **Team Independence**: Enable autonomous development while maintaining integration

As referenced in the [Single-SPA GitHub repository](https://github.com/single-spa/single-spa), the framework continues to evolve with strong community support and comprehensive tooling for modern microfrontend development.

### Further Resources

- [Single-SPA Documentation](https://single-spa.js.org/)
- [Single-SPA GitHub Repository](https://github.com/single-spa/single-spa)
- [Single-SPA Workshop](https://single-spa.js.org/docs/getting-started-overview)
