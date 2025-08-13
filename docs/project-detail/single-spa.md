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

```bash
# Install Single-SPA CLI
npm install --global create-single-spa

# Create a new root config
npx create-single-spa --moduleType root-config

# Create a microfrontend application
npx create-single-spa --moduleType app-parcel

# Create a utility module
npx create-single-spa --moduleType util-module
```

### Basic Root Config Setup

```javascript
// src/root-config.js
import { registerApplication, start } from "single-spa";

// Register applications
registerApplication({
  name: "navbar",
  app: () => import("@org/navbar"),
  activeWhen: () => true, // Always mounted
});

registerApplication({
  name: "home-app",
  app: () => import("@org/home"),
  activeWhen: (location) => location.pathname === "/",
});

registerApplication({
  name: "dashboard-app",
  app: () => import("@org/dashboard"),
  activeWhen: (location) => location.pathname.startsWith("/dashboard"),
});

registerApplication({
  name: "profile-app",
  app: () => import("@org/profile"),
  activeWhen: "/profile",
});

// Start Single-SPA
start({
  urlRerouteOnly: true,
});
```

### HTML Setup with Import Maps

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Microfrontend Application</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Import maps for module resolution -->
    <script type="importmap">
      {
        "imports": {
          "single-spa": "https://cdn.jsdelivr.net/npm/single-spa@6.0.0/lib/system/single-spa.min.js",
          "react": "https://cdn.jsdelivr.net/npm/react@18.2.0/index.js",
          "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18.2.0/index.js",
          "@org/root-config": "/root-config.js",
          "@org/navbar": "/navbar.js",
          "@org/home": "/home.js",
          "@org/dashboard": "/dashboard.js",
          "@org/profile": "/profile.js"
        }
      }
    </script>

    <!-- Single-SPA root config -->
    <script type="module">
      import("@org/root-config");
    </script>
  </head>
  <body>
    <div id="single-spa-application:navbar"></div>
    <div id="main-content"></div>
  </body>
</html>
```

## Core Concepts

### Applications vs Parcels

```javascript
// Application - Routed by Single-SPA
const Application = {
  bootstrap: () => Promise.resolve(),
  mount: (props) => {
    // Mount your app
    return ReactDOM.render(<App {...props} />, props.domElement);
  },
  unmount: (props) => {
    // Cleanup
    ReactDOM.unmountComponentAtNode(props.domElement);
    return Promise.resolve();
  },
};

// Parcel - Manually controlled component
const Parcel = {
  bootstrap: () => Promise.resolve(),
  mount: (props) => {
    // Mount parcel
    return ReactDOM.render(<Widget {...props} />, props.domElement);
  },
  unmount: (props) => {
    ReactDOM.unmountComponentAtNode(props.domElement);
    return Promise.resolve();
  },
  update: (props) => {
    // Optional: handle prop updates
    return ReactDOM.render(<Widget {...props} />, props.domElement);
  },
};
```

### Creating a React Microfrontend

```javascript
// src/app.js - React microfrontend
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import RootComponent from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: RootComponent,
  errorBoundary(err, info, props) {
    // Handle errors
    return <div>Something went wrong: {err.message}</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

// Optional: export for parcel usage
export const App = RootComponent;
```

## Under the Hood: How Single-SPA Works

### Application Registration and Routing

```javascript
// Simplified Single-SPA implementation concept
class SingleSPA {
  constructor() {
    this.apps = [];
    this.started = false;
  }

  registerApplication(appConfig) {
    const app = {
      name: appConfig.name,
      loadApp: appConfig.app,
      activeWhen: appConfig.activeWhen,
      customProps: appConfig.customProps || {},
      status: "NOT_LOADED",
    };

    this.apps.push(app);

    if (this.started) {
      this.reroute();
    }
  }

  start(opts = {}) {
    this.started = true;
    this.urlRerouteOnly = opts.urlRerouteOnly;

    // Listen for navigation events
    window.addEventListener("hashchange", () => this.reroute());
    window.addEventListener("popstate", () => this.reroute());

    // Override pushState and replaceState
    this.overrideHistoryAPI();

    // Initial route
    this.reroute();
  }

  async reroute() {
    const currentLocation = window.location;

    // Determine which apps should be active
    const appsToMount = this.apps.filter(
      (app) =>
        this.shouldBeActive(app, currentLocation) && app.status !== "MOUNTED"
    );

    const appsToUnmount = this.apps.filter(
      (app) =>
        !this.shouldBeActive(app, currentLocation) && app.status === "MOUNTED"
    );

    // Unmount inactive apps
    await Promise.all(appsToUnmount.map((app) => this.unmountApp(app)));

    // Mount active apps
    await Promise.all(appsToMount.map((app) => this.mountApp(app)));
  }

  shouldBeActive(app, location) {
    if (typeof app.activeWhen === "function") {
      return app.activeWhen(location);
    }
    if (typeof app.activeWhen === "string") {
      return location.pathname.startsWith(app.activeWhen);
    }
    return false;
  }

  async mountApp(app) {
    try {
      if (app.status === "NOT_LOADED") {
        app.status = "LOADING";
        app.instance = await app.loadApp();
        app.status = "LOADED";
      }

      if (app.status === "LOADED") {
        app.status = "BOOTSTRAPPING";
        await app.instance.bootstrap();
        app.status = "NOT_MOUNTED";
      }

      if (app.status === "NOT_MOUNTED") {
        app.status = "MOUNTING";
        await app.instance.mount({
          name: app.name,
          singleSpa: this,
          ...app.customProps,
        });
        app.status = "MOUNTED";
      }
    } catch (error) {
      app.status = "SKIP_BECAUSE_BROKEN";
      console.error(`Failed to mount app ${app.name}:`, error);
    }
  }

  async unmountApp(app) {
    if (app.status === "MOUNTED") {
      app.status = "UNMOUNTING";
      await app.instance.unmount();
      app.status = "NOT_MOUNTED";
    }
  }
}
```

## Application Lifecycle

### Lifecycle Functions

```javascript
// Detailed lifecycle implementation
const MyApp = {
  // 1. Bootstrap - Initialize app (runs once)
  bootstrap: async (props) => {
    console.log("Bootstrapping app", props.name);

    // Initialize global state, setup error boundaries, etc.
    await initializeApp();

    return Promise.resolve();
  },

  // 2. Mount - Render app to DOM
  mount: async (props) => {
    console.log("Mounting app", props.name);

    // Create DOM element if not provided
    const domElement =
      props.domElement ||
      document.getElementById(`single-spa-application:${props.name}`);

    // Mount React app
    const root = ReactDOM.createRoot(domElement);
    root.render(
      <App {...props} history={props.history} basename={props.basename} />
    );

    // Store root for cleanup
    props.reactRoot = root;

    return Promise.resolve();
  },

  // 3. Unmount - Cleanup and remove from DOM
  unmount: async (props) => {
    console.log("Unmounting app", props.name);

    // Cleanup React app
    if (props.reactRoot) {
      props.reactRoot.unmount();
    }

    // Cleanup event listeners, intervals, etc.
    cleanup();

    return Promise.resolve();
  },

  // 4. Update - Handle prop changes (optional)
  update: async (props) => {
    console.log("Updating app", props.name);

    // Re-render with new props
    if (props.reactRoot) {
      props.reactRoot.render(<App {...props} />);
    }

    return Promise.resolve();
  },
};
```

## Inter-App Communication

### 1. Custom Events

```javascript
// Utility for cross-app communication
class EventBus {
  static emit(eventName, data) {
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }

  static on(eventName, callback) {
    window.addEventListener(eventName, callback);

    // Return cleanup function
    return () => window.removeEventListener(eventName, callback);
  }
}

// App A - Publisher
const publishUserLogin = (user) => {
  EventBus.emit("user:login", { user, timestamp: Date.now() });
};

// App B - Subscriber
const cleanup = EventBus.on("user:login", (event) => {
  const { user, timestamp } = event.detail;
  console.log("User logged in:", user);
  updateNavbarUser(user);
});

// Cleanup on unmount
export const unmount = () => {
  cleanup();
  return Promise.resolve();
};
```

### 2. Shared State Management

```javascript
// shared-store.js - Global state store
class SharedStore {
  constructor() {
    this.state = {
      user: null,
      theme: "light",
      notifications: [],
    };
    this.subscribers = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.push(callback);

    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.state));
  }
}

// Create global instance
window.__SHARED_STORE__ = window.__SHARED_STORE__ || new SharedStore();

export default window.__SHARED_STORE__;

// Usage in microfrontends
import sharedStore from "@org/shared-store";

// In React component
const [user, setUser] = useState(sharedStore.getState().user);

useEffect(() => {
  const unsubscribe = sharedStore.subscribe((state) => {
    setUser(state.user);
  });

  return unsubscribe;
}, []);

// Update global state
const handleLogin = (userData) => {
  sharedStore.setState({ user: userData });
};
```

### 3. Parcel Communication

```javascript
// Modal parcel that can be used across apps
const ModalParcel = {
  bootstrap: () => Promise.resolve(),

  mount: (props) => {
    const { domElement, title, content, onClose } = props;

    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal">
        <h2>${title}</h2>
        <div class="modal-content">${content}</div>
        <button class="close-btn">Close</button>
      </div>
    `;

    modal.querySelector(".close-btn").onclick = () => {
      onClose && onClose();
    };

    domElement.appendChild(modal);

    return Promise.resolve();
  },

  unmount: (props) => {
    props.domElement.innerHTML = "";
    return Promise.resolve();
  },
};

// Usage across different apps
import { mountRootParcel } from "single-spa";

const showModal = async (title, content) => {
  const parcel = mountRootParcel(ModalParcel, {
    domElement: document.getElementById("modal-container"),
    title,
    content,
    onClose: () => parcel.unmount(),
  });

  return parcel;
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

```javascript
// Global error handling
const registerApplicationWithErrorHandling = (config) => {
  registerApplication({
    ...config,
    app: async () => {
      try {
        return await config.app();
      } catch (error) {
        console.error(`Failed to load ${config.name}:`, error);

        // Return fallback app
        return {
          bootstrap: () => Promise.resolve(),
          mount: (props) => {
            props.domElement.innerHTML = `
              <div class="error-fallback">
                <h3>Unable to load ${config.name}</h3>
                <p>Please try refreshing the page.</p>
              </div>
            `;
            return Promise.resolve();
          },
          unmount: (props) => {
            props.domElement.innerHTML = "";
            return Promise.resolve();
          },
        };
      }
    },
  });
};
```

### 3. Performance Optimization

```javascript
// Lazy loading with preloading
const preloadApp = (appName) => {
  const link = document.createElement("link");
  link.rel = "modulepreload";
  link.href = `/apps/${appName}.js`;
  document.head.appendChild(link);
};

// Preload likely routes
registerApplication({
  name: "dashboard",
  app: () => import("@org/dashboard"),
  activeWhen: "/dashboard",
});

// Preload on hover
document.querySelector(".dashboard-link").addEventListener("mouseenter", () => {
  preloadApp("dashboard");
});
```

### 4. Development vs Production Configuration

```javascript
// Environment-based app loading
const isLocal = process.env.NODE_ENV === "development";

registerApplication({
  name: "navbar",
  app: () =>
    isLocal
      ? import("http://localhost:8080/navbar.js")
      : import("https://cdn.myapp.com/navbar.js"),
  activeWhen: () => true,
});
```

## Advanced Patterns

### Module Federation Integration

```javascript
// webpack.config.js for microfrontend
const ModuleFederationPlugin = require("@module-federation/webpack");

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        navbar: "navbar@http://localhost:3001/remoteEntry.js",
        dashboard: "dashboard@http://localhost:3002/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
      },
    }),
  ],
};

// Loading federated modules in Single-SPA
registerApplication({
  name: "dashboard",
  app: async () => {
    const module = await import("dashboard/App");
    return module.default;
  },
  activeWhen: "/dashboard",
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
