# Service Workers: The Gateway to Progressive Web Apps

## Table of Contents

- [Introduction](#introduction)
- [Getting Started with Service Workers](#getting-started-with-service-workers)
- [Service Worker Lifecycle](#service-worker-lifecycle)
- [Under the Hood: How Service Workers Work](#under-the-hood-how-service-workers-work)
- [Caching Strategies](#caching-strategies)
- [Offline Functionality](#offline-functionality)
- [Push Notifications and Background Sync](#push-notifications-and-background-sync)
- [Advanced Patterns and Best Practices](#advanced-patterns-and-best-practices)
- [Security Considerations](#security-considerations)
- [Debugging and Development](#debugging-and-development)
- [Real-World Implementation](#real-world-implementation)
- [Performance Optimization](#performance-optimization)
- [Conclusion](#conclusion)

## Introduction

Service Workers are a cornerstone technology of Progressive Web Apps (PWAs), acting as programmable proxy servers between web applications and the network. As outlined in the [MDN Service Worker API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), they enable powerful features like offline functionality, push notifications, and background synchronization.

Unlike regular Web Workers, Service Workers can intercept network requests, cache resources, and serve content even when the network is unavailable. They run in a separate thread from the main application, ensuring that intensive operations don't block the user interface.

### Key Capabilities

- **Network Interception**: Intercept and modify network requests
- **Resource Caching**: Store resources for offline access
- **Background Processing**: Handle tasks when the app isn't active
- **Push Notifications**: Receive and display notifications
- **Background Sync**: Sync data when connectivity is restored

### Service Worker vs Web Worker

**What this comparison demonstrates:** The fundamental difference between Service Workers and Web Workers in terms of network access capabilities.

**Key differences:**

- **Service Workers:** Run in a separate context and can intercept all network requests from your web app
- **Web Workers:** Execute JavaScript in background threads but cannot access the network layer directly
- **Use cases:** Service Workers for PWA features (offline, caching, push notifications), Web Workers for heavy computations

```javascript
// Service Worker - Can intercept network requests
// This code runs in the Service Worker context and demonstrates network interception
self.addEventListener("fetch", (event) => {
  // Intercept any fetch request made by the web app
  // event.request contains the full request object (URL, method, headers, etc.)
  event.respondWith(
    // Check if we have a cached version of this request
    caches.match(event.request)
    // If found in cache, return it; if not, this will return undefined
    // and the browser will proceed with the original network request
  );
});

// Web Worker - Cannot access network layer
// Regular Web Workers run in a different context without network interception capabilities
// They can use fetch() to make requests, but cannot intercept requests from the main thread
// Network interception is not possible in regular Web Workers
```

## Getting Started with Service Workers

### Feature Detection and Registration

**What this code does:** Safely registers a Service Worker with proper feature detection and update handling.

**Step-by-step process:**

1. **Feature Detection:** Check if the browser supports Service Workers
2. **Registration:** Register the Service Worker file (`/sw.js`) with a specific scope
3. **Update Detection:** Listen for new Service Worker versions and notify users
4. **Error Handling:** Gracefully handle registration failures

**Input:** Service Worker file path (`/sw.js`) and configuration options
**Output:** Registered Service Worker with update notifications

**When to use:** This should be your standard Service Worker registration pattern in production apps.

```javascript
// Check for Service Worker support before attempting registration
// This prevents errors in older browsers that don't support Service Workers
if ("serviceWorker" in navigator) {
  // Wait for the page to fully load before registering
  // This ensures the main thread isn't blocked during initial page render
  window.addEventListener("load", async () => {
    try {
      // Register the Service Worker file
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/", // Controls which pages the SW manages (all pages in this case)
        // Other options: updateViaCache: 'none' | 'imports' | 'all'
      });

      console.log("SW registered:", registration.scope);

      // Handle registration updates - crucial for deploying new versions
      registration.addEventListener("updatefound", () => {
        // A new Service Worker is being installed
        const newWorker = registration.installing;
        console.log("New service worker installing");

        // Monitor the installation progress
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed") {
            // Check if there's already an active Service Worker
            if (navigator.serviceWorker.controller) {
              // There's an update available
              console.log("New content available, please refresh");
              showUpdateNotification();
            } else {
              // First time installation - everything is cached
              console.log("Content cached for offline use");
            }
          }
        });
      });
    } catch (error) {
      // Registration failed - could be network issues, invalid SW file, etc.
      console.error("SW registration failed:", error);
    }
  });
} else {
  // Graceful degradation for unsupported browsers
  console.log("Service Workers not supported");
}

// User-friendly update notification
// This creates a simple UI element to inform users about available updates
function showUpdateNotification() {
  const notification = document.createElement("div");
  notification.innerHTML = `
    <div class="update-notification" style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #4CAF50; 
      color: white; 
      padding: 12px; 
      border-radius: 4px;
      z-index: 9999;
    ">
      New version available! 
      <button onclick="window.location.reload()" style="
        background: white; 
        color: #4CAF50; 
        border: none; 
        padding: 4px 8px; 
        border-radius: 2px;
        cursor: pointer;
      ">Refresh</button>
    </div>
  `;
  document.body.appendChild(notification);
}
```

### Basic Service Worker Structure

**What this Service Worker does:** Implements a complete caching strategy with installation, activation, and fetch handling.

**The three main lifecycle events:**

1. **Install:** Downloads and caches essential resources (app shell)
2. **Activate:** Cleans up old caches and takes control of all pages
3. **Fetch:** Intercepts network requests and serves cached content when available

**Input:** Network requests from the web application
**Output:** Cached responses or fresh network responses, with offline fallback

**Cache strategy:** Cache-first with network fallback and offline page support

```javascript
// sw.js - Service Worker file
// This file must be served from your domain's root or a directory you want to control

// Cache configuration
const CACHE_NAME = "my-app-v1"; // Version your cache names for easy updates
const urlsToCache = [
  "/", // Home page
  "/styles/main.css", // Critical CSS
  "/scripts/main.js", // Core JavaScript
  "/offline.html", // Offline fallback page
  // Add other essential resources your app needs to work offline
];

// INSTALL EVENT - Triggered when the Service Worker is first installed
// This is where you cache your app's essential resources ("app shell")
self.addEventListener("install", (event) => {
  console.log("Service Worker installing");

  // event.waitUntil() ensures the Service Worker doesn't finish installing
  // until the promise resolves (all caching is complete)
  event.waitUntil(
    caches
      .open(CACHE_NAME) // Create/open the cache with our version name
      .then((cache) => {
        console.log("Caching app shell");
        // cache.addAll() downloads and stores all URLs in the array
        // If any URL fails to cache, the entire installation fails
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting phase to activate immediately
        // Without this, the new SW waits until all tabs are closed
        return self.skipWaiting();
      })
  );
});

// ACTIVATE EVENT - Triggered when the Service Worker becomes active
// This is where you clean up old caches and prepare for new functionality
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating");

  event.waitUntil(
    // Get all existing cache names
    caches
      .keys()
      .then((cacheNames) => {
        // Delete old caches that don't match the current version
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep only the current cache, delete everything else
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
            // Return undefined for caches we want to keep
          })
        );
      })
      .then(() => {
        // Take control of all clients (open tabs/windows)
        // Without this, the SW only controls pages opened after activation
        return self.clients.claim();
      })
  );
});

// FETCH EVENT - Triggered for every network request made by the app
// This is where you implement your caching strategy
self.addEventListener("fetch", (event) => {
  // Intercept the request and provide a custom response
  event.respondWith(
    // First, check if we have this request in our cache
    caches
      .match(event.request)
      .then((response) => {
        // If found in cache, return it; otherwise fetch from network
        // This implements a "cache-first" strategy
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail (offline + not cached)
        // Show the offline page for HTML document requests
        if (event.request.destination === "document") {
          return caches.match("/offline.html");
        }
        // For other resources (images, CSS, JS), just let the request fail
        // The browser will handle this gracefully
      })
  );
});
```

## Service Worker Lifecycle

### Lifecycle States and Transitions

**What this ServiceWorkerManager does:** Provides a comprehensive system for managing Service Worker lifecycle events, updates, and user notifications.

**Key lifecycle states:**

- **Installing:** Service Worker is downloading and setting up
- **Installed:** Installation complete, waiting to activate
- **Activating:** Taking control of the application
- **Activated:** Fully operational and controlling network requests
- **Redundant:** Replaced by a newer version

**Features implemented:**

- Automatic update detection
- User-friendly update notifications
- Periodic update checks
- Graceful handling of Service Worker state transitions

**Input:** Service Worker registration and lifecycle events
**Output:** Managed Service Worker with user-controlled updates

```javascript
// Monitor service worker lifecycle with a comprehensive management class
class ServiceWorkerManager {
  constructor() {
    this.registration = null; // Stores the SW registration object
    this.isUpdateAvailable = false; // Flag to track update availability
    this.setupServiceWorker(); // Initialize immediately
  }

  // Main setup method - handles feature detection and registration
  async setupServiceWorker() {
    // Feature detection - graceful degradation for unsupported browsers
    if (!("serviceWorker" in navigator)) {
      console.log("Service Workers not supported");
      return;
    }

    try {
      // Register the Service Worker and store the registration
      this.registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully");

      // Start monitoring lifecycle events
      this.monitorLifecycle();
    } catch (error) {
      // Handle registration failures (network issues, invalid SW file, etc.)
      console.error("SW registration failed:", error);
    }
  }

  // Set up all lifecycle event listeners
  monitorLifecycle() {
    // Monitor for new Service Worker installations (updates)
    this.registration.addEventListener("updatefound", () => {
      console.log("New Service Worker version detected");
      const newWorker = this.registration.installing;
      this.trackWorkerState(newWorker, "Installing");
    });

    // Monitor when the active Service Worker changes
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      console.log("Controller changed - page refresh recommended");
      this.handleControllerChange();
    });

    // Periodically check for updates (production apps might do this less frequently)
    setInterval(() => {
      console.log("Checking for Service Worker updates...");
      this.registration.update();
    }, 60000); // Check every minute (adjust based on your update frequency needs)
  }

  // Track state changes for a specific Service Worker instance
  trackWorkerState(worker, phase) {
    worker.addEventListener("statechange", () => {
      console.log(`${phase} worker state:`, worker.state);

      switch (worker.state) {
        case "installed":
          // Service Worker is installed and ready
          if (navigator.serviceWorker.controller) {
            // There's already an active SW, so this is an update
            this.isUpdateAvailable = true;
            this.notifyUpdateAvailable();
          } else {
            // First installation - no previous SW
            console.log("Content cached for offline use");
          }
          break;

        case "activated":
          // Service Worker is now controlling the page
          console.log("Service Worker activated and controlling pages");
          this.isUpdateAvailable = false;
          break;

        case "redundant":
          // Service Worker has been replaced or failed
          console.log("Service Worker became redundant");
          break;
      }
    });
  }

  // Notify the application that an update is available
  notifyUpdateAvailable() {
    console.log("Dispatching update available event");
    const event = new CustomEvent("sw-update-available", {
      detail: {
        registration: this.registration,
        hasWaitingWorker: !!this.registration.waiting,
      },
    });
    window.dispatchEvent(event);
  }

  // Handle when the Service Worker controller changes
  handleControllerChange() {
    // Reload the page to ensure users get the latest version
    // In production, you might want to show a notification instead
    console.log("Reloading page due to Service Worker update");
    window.location.reload();
  }

  // Force the waiting Service Worker to become active
  async forceUpdate() {
    if (this.registration.waiting) {
      console.log("Forcing Service Worker update");
      // Send message to the waiting SW to skip waiting phase
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    } else {
      console.log("No waiting Service Worker found");
    }
  }
}

// Initialize the Service Worker manager
// This should be done early in your application startup
const swManager = new ServiceWorkerManager();

// Listen for update notifications and prompt user
window.addEventListener("sw-update-available", (event) => {
  console.log("Update available event received", event.detail);

  // Show user-friendly update prompt
  const userConfirmed = confirm(
    "A new version of the application is available. " +
      "Would you like to update now? (Recommended for the best experience)"
  );

  if (userConfirmed) {
    // User wants to update - force the new Service Worker to activate
    swManager.forceUpdate();
  } else {
    // User declined - they'll get the update next time they visit
    console.log("User declined update - will apply on next visit");
  }
});
```

## Under the Hood: How Service Workers Work

### Browser Architecture with Service Workers

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Process                      │
├─────────────────────────────────────────────────────────┤
│  Main Thread              │      Service Worker Thread  │
│  ├─── DOM/Rendering       │      ├─── Network Proxy     │
│  ├─── JavaScript Engine   │      ├─── Cache Management  │
│  ├─── Event Loop         │      ├─── Push Notifications │
│  └─── User Interactions   │      └─── Background Tasks  │
├─────────────────────────────────────────────────────────┤
│              Network Layer                              │
│         (All requests pass through SW)                  │
└─────────────────────────────────────────────────────────┘
```

### Service Worker Global Scope

```javascript
// Service Worker runs in ServiceWorkerGlobalScope
console.log(self); // ServiceWorkerGlobalScope
console.log(self.caches); // CacheStorage interface
console.log(self.clients); // Clients interface

// Available APIs in Service Worker context
const availableAPIs = {
  // Network APIs
  fetch: typeof fetch !== "undefined",
  XMLHttpRequest: typeof XMLHttpRequest !== "undefined",

  // Storage APIs
  caches: typeof caches !== "undefined",
  indexedDB: typeof indexedDB !== "undefined",

  // Messaging APIs
  postMessage: typeof self.postMessage !== "undefined",
  BroadcastChannel: typeof BroadcastChannel !== "undefined",

  // Notification APIs
  Notification: typeof Notification !== "undefined",
  showNotification: typeof self.registration?.showNotification !== "undefined",

  // Not available in Service Workers
  localStorage: typeof localStorage !== "undefined", // false
  sessionStorage: typeof sessionStorage !== "undefined", // false
  document: typeof document !== "undefined", // false
  window: typeof window !== "undefined", // false
};

console.log("Available APIs:", availableAPIs);
```

## Caching Strategies

### Cache-First Strategy

**What this strategy does:** Prioritizes cached content for fast loading, falling back to network only when necessary.

**Best use cases:**

- Static assets (images, fonts, CSS, JavaScript)
- Resources that don't change frequently
- When performance and speed are more important than freshness

**Flow:**

1. Check cache first
2. If found, return immediately (fastest response)
3. If not found, fetch from network
4. Cache the network response for future use
5. Return the network response

**Pros:** Very fast for cached resources, works offline
**Cons:** May serve stale content

```javascript
// Cache-First Strategy Implementation
// Best for static assets like images, fonts, and CSS files
self.addEventListener("fetch", (event) => {
  // Apply cache-first strategy specifically to image requests
  if (event.request.destination === "image") {
    event.respondWith(
      // Step 1: Check if the request is already in cache
      caches.match(event.request).then((cachedResponse) => {
        // Step 2: If found in cache, return immediately (fastest path)
        if (cachedResponse) {
          console.log("Serving from cache:", event.request.url);
          return cachedResponse;
        }

        // Step 3: Not in cache, fetch from network
        console.log("Not in cache, fetching from network:", event.request.url);
        return fetch(event.request).then((networkResponse) => {
          // Step 4: Cache the new response for future requests
          // Important: Clone the response because it can only be consumed once
          const responseClone = networkResponse.clone();

          // Cache asynchronously (don't block the response)
          caches.open(CACHE_NAME).then((cache) => {
            console.log("Caching new resource:", event.request.url);
            cache.put(event.request, responseClone);
          });

          // Step 5: Return the fresh network response
          return networkResponse;
        });
      })
    );
  }
});
```

### Network-First Strategy

**What this strategy does:** Always tries to fetch fresh content from the network first, using cache as a fallback when offline.

**Best use cases:**

- API calls and dynamic data
- Content that changes frequently
- When data freshness is critical
- Social media feeds, news articles, user-generated content

**Flow:**

1. Try network request first
2. If successful, update cache with fresh data
3. Return the fresh network response
4. If network fails, fall back to cached version
5. If no cache either, request fails gracefully

**Pros:** Always tries to serve fresh content
**Cons:** Slower when network is slow, requires network for first load

```javascript
// Network-First Strategy Implementation
// Best for API calls and dynamic content that changes frequently
self.addEventListener("fetch", (event) => {
  // Apply network-first strategy to API calls
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      // Step 1: Always try network first for fresh data
      fetch(event.request)
        .then((networkResponse) => {
          console.log("Network request successful:", event.request.url);

          // Step 2: Update cache with the fresh response
          // Clone because response body can only be read once
          const responseClone = networkResponse.clone();

          // Update cache asynchronously (don't block the response)
          caches
            .open(CACHE_NAME)
            .then((cache) => {
              console.log("Updating cache with fresh data:", event.request.url);
              cache.put(event.request, responseClone);
            })
            .catch((cacheError) => {
              // Handle cache update failures gracefully
              console.warn("Failed to update cache:", cacheError);
            });

          // Step 3: Return the fresh network response
          return networkResponse;
        })
        .catch((networkError) => {
          // Step 4: Network failed (offline, server error, etc.)
          console.log(
            "Network failed, trying cache:",
            event.request.url,
            networkError
          );

          // Step 5: Try to serve from cache as fallback
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("Serving stale data from cache:", event.request.url);
              return cachedResponse;
            } else {
              // No cache available either - let the request fail
              console.error("No cache available for:", event.request.url);
              throw networkError;
            }
          });
        })
    );
  }
});
```

### Stale-While-Revalidate Strategy

**What this strategy does:** Serves cached content immediately for speed, while updating the cache in the background for next time.

**Best use cases:**

- HTML pages and documents
- Content where slight staleness is acceptable
- When you want both speed AND freshness
- News sites, blogs, product catalogs

**Flow:**

1. Check cache first
2. If found, return cached version immediately (fast response)
3. Simultaneously fetch from network in background
4. Update cache with fresh content for next visit
5. If no cache, wait for network response

**Pros:** Fast responses + fresh content on next visit
**Cons:** Users might see outdated content briefly

```javascript
// Stale-While-Revalidate Strategy Implementation
// Best for HTML documents where slight staleness is acceptable
self.addEventListener("fetch", (event) => {
  // Apply stale-while-revalidate strategy to HTML documents
  if (event.request.destination === "document") {
    event.respondWith(
      // Step 1: Check cache for existing content
      caches.match(event.request).then((cachedResponse) => {
        // Step 2: Start network request in parallel (don't wait for it)
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Step 3: Update cache in background with fresh content
            const responseClone = networkResponse.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                console.log("Background cache update:", event.request.url);
                cache.put(event.request, responseClone);
              })
              .catch((cacheError) => {
                console.warn("Background cache update failed:", cacheError);
              });

            return networkResponse;
          })
          .catch((networkError) => {
            console.log("Background network update failed:", networkError);
            // Don't throw - this is a background update
            return null;
          });

        // Step 4: Return cached response immediately if available
        if (cachedResponse) {
          console.log(
            "Serving from cache (updating in background):",
            event.request.url
          );
          return cachedResponse;
        }

        // Step 5: No cache available, wait for network response
        console.log("No cache, waiting for network:", event.request.url);
        return fetchPromise;
      })
    );
  }
});
```

### Advanced Caching with Expiration

**What this CacheManager does:** Implements intelligent cache expiration and management to prevent stale data and storage bloat.

**Key features:**

- **Time-based expiration:** Automatically expire cached content after a specified time
- **Custom cache headers:** Add metadata to track when content was cached
- **Automatic cleanup:** Remove expired entries to free up storage space
- **Configurable TTL:** Different cache lifetimes for different types of content

**Use cases:**

- API responses with time-sensitive data
- Dynamic content that needs periodic refresh
- Storage-constrained environments
- Applications with strict data freshness requirements

**Input:** HTTP requests and responses with custom expiration logic
**Output:** Managed cache with automatic expiration and cleanup

```javascript
// Advanced Cache Manager with time-based expiration
class CacheManager {
  constructor(cacheName, maxAge = 24 * 60 * 60 * 1000) {
    // Default to 24 hours cache lifetime
    this.cacheName = cacheName;
    this.maxAge = maxAge; // Maximum age in milliseconds
    console.log(
      `CacheManager initialized: ${cacheName}, TTL: ${maxAge / 1000}s`
    );
  }

  // Retrieve from cache with expiration check
  async get(request) {
    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(request);

      // No cached response found
      if (!response) {
        console.log("Cache miss:", request.url);
        return null;
      }

      // Check if the cached response has expired
      const cachedTime = response.headers.get("sw-cache-time");
      if (cachedTime) {
        const age = Date.now() - parseInt(cachedTime);

        if (age > this.maxAge) {
          console.log(
            "Cache expired, removing:",
            request.url,
            `(age: ${age / 1000}s)`
          );
          // Cache expired - remove it and return null
          await cache.delete(request);
          return null;
        }

        console.log("Cache hit (valid):", request.url, `(age: ${age / 1000}s)`);
      }

      return response;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  // Store in cache with timestamp header
  async put(request, response) {
    try {
      const cache = await caches.open(this.cacheName);

      // Clone the response because it can only be consumed once
      const responseClone = response.clone();

      // Add custom timestamp header to track when this was cached
      const headers = new Headers(responseClone.headers);
      headers.set("sw-cache-time", Date.now().toString());
      headers.set("sw-cache-ttl", this.maxAge.toString());

      // Create new response with timestamp headers
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });

      // Store in cache
      await cache.put(request, responseWithTimestamp);
      console.log("Cached with timestamp:", request.url);

      // Return the original response to the caller
      return response;
    } catch (error) {
      console.error("Cache put error:", error);
      // Return original response even if caching fails
      return response;
    }
  }

  // Clean up expired cache entries
  async cleanup() {
    try {
      console.log("Starting cache cleanup for:", this.cacheName);
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();

      let deletedCount = 0;

      // Check each cached item for expiration
      const deletePromises = requests.map(async (request) => {
        try {
          const response = await cache.match(request);
          const cachedTime = response.headers.get("sw-cache-time");

          if (cachedTime) {
            const age = Date.now() - parseInt(cachedTime);

            if (age > this.maxAge) {
              console.log("Deleting expired cache entry:", request.url);
              await cache.delete(request);
              deletedCount++;
              return true;
            }
          }
          return false;
        } catch (error) {
          console.error("Error checking cache entry:", request.url, error);
          return false;
        }
      });

      await Promise.all(deletePromises);
      console.log(
        `Cache cleanup complete. Deleted ${deletedCount} expired entries.`
      );
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  // Get cache statistics
  async getStats() {
    try {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();

      let totalSize = 0;
      let expiredCount = 0;

      for (const request of requests) {
        const response = await cache.match(request);
        const blob = await response.blob();
        totalSize += blob.size;

        const cachedTime = response.headers.get("sw-cache-time");
        if (cachedTime && Date.now() - parseInt(cachedTime) > this.maxAge) {
          expiredCount++;
        }
      }

      return {
        name: this.cacheName,
        entryCount: requests.length,
        expiredCount,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return null;
    }
  }
}

// Usage in service worker with different TTLs for different content types
const apiCacheManager = new CacheManager("api-cache-v1", 30 * 60 * 1000); // 30 minutes for API
const imageCacheManager = new CacheManager(
  "image-cache-v1",
  7 * 24 * 60 * 60 * 1000
); // 7 days for images

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Handle API requests with short cache TTL
  if (request.url.includes("/api/")) {
    event.respondWith(
      apiCacheManager.get(request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log("Serving API response from cache");
          return cachedResponse;
        }

        // Not in cache or expired, fetch from network
        console.log("Fetching API response from network");
        return fetch(request).then((networkResponse) => {
          // Cache the response and return it
          return apiCacheManager.put(request, networkResponse);
        });
      })
    );
  }

  // Handle image requests with long cache TTL
  else if (request.destination === "image") {
    event.respondWith(
      imageCacheManager.get(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          return imageCacheManager.put(request, networkResponse);
        });
      })
    );
  }
});

// Handle cleanup messages from the main thread
self.addEventListener("message", (event) => {
  const { data } = event;

  switch (data.type) {
    case "CLEANUP_CACHE":
      console.log("Manual cache cleanup requested");
      Promise.all([apiCacheManager.cleanup(), imageCacheManager.cleanup()]);
      break;

    case "GET_CACHE_STATS":
      Promise.all([
        apiCacheManager.getStats(),
        imageCacheManager.getStats(),
      ]).then((stats) => {
        // Send stats back to main thread
        event.ports[0].postMessage({ type: "CACHE_STATS", stats });
      });
      break;
  }
});

// Automatic cleanup every hour
setInterval(() => {
  console.log("Running scheduled cache cleanup");
  apiCacheManager.cleanup();
  imageCacheManager.cleanup();
}, 60 * 60 * 1000); // Every hour
```

## Offline Functionality

### Comprehensive Offline Strategy

**What this offline strategy does:** Provides a robust offline experience by handling different resource types with appropriate fallback mechanisms.

**Resource-specific strategies:**

- **Documents (HTML):** Network-first with offline page fallback
- **Images:** Cache-first with placeholder image fallback
- **Other resources:** Network-first with cache fallback

**Offline experience features:**

- Custom offline page for when users lose connectivity
- Placeholder images for missing resources
- Graceful degradation for different content types
- Intelligent caching based on resource characteristics

**Input:** Various types of network requests (documents, images, API calls, etc.)
**Output:** Appropriate responses with offline fallbacks for each resource type

```javascript
// Define fallback resources for offline scenarios
const OFFLINE_PAGE = "/offline.html"; // Custom offline page
const FALLBACK_IMAGE = "/images/offline-image.png"; // Placeholder for missing images
const CACHE_NAME = "offline-cache-v1";

// Main fetch event handler with resource-type routing
self.addEventListener("fetch", (event) => {
  const { request } = event;

  console.log("Handling request:", request.url, "Type:", request.destination);

  // Route different resource types to appropriate handlers
  if (request.destination === "document") {
    // HTML pages - prioritize fresh content but provide offline fallback
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === "image") {
    // Images - prioritize cache for performance, provide placeholder fallback
    event.respondWith(handleImageRequest(request));
  } else {
    // CSS, JS, fonts, and other resources
    event.respondWith(handleOtherRequests(request));
  }
});

// Handle HTML document requests with network-first strategy
async function handleDocumentRequest(request) {
  console.log("Handling document request:", request.url);

  try {
    // Step 1: Try network first for fresh content
    console.log("Attempting network request for document");
    const networkResponse = await fetch(request);

    // Step 2: Cache successful responses for offline access
    if (networkResponse.ok) {
      console.log("Caching successful document response");
      const cache = await caches.open(CACHE_NAME);
      // Clone because response can only be consumed once
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed for document, trying cache:", error.message);

    // Step 3: Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Serving cached document");
      return cachedResponse;
    }

    // Step 4: No cache available, show offline page
    console.log("No cache available, serving offline page");
    const offlinePage = await caches.match(OFFLINE_PAGE);

    if (offlinePage) {
      return offlinePage;
    } else {
      // Fallback if offline page isn't cached
      return new Response(
        `<html><body><h1>Offline</h1><p>You are offline and this page is not cached.</p></body></html>`,
        {
          headers: { "Content-Type": "text/html" },
          status: 503,
          statusText: "Service Unavailable",
        }
      );
    }
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  console.log("Handling image request:", request.url);

  try {
    // Step 1: Try cache first for images (performance optimization)
    console.log("Checking cache for image");
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Serving cached image");
      return cachedResponse;
    }

    // Step 2: Not in cache, try network
    console.log("Image not cached, fetching from network");
    const networkResponse = await fetch(request);

    // Step 3: Cache the image for future use
    if (networkResponse.ok) {
      console.log("Caching new image");
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Image request failed, serving fallback:", error.message);

    // Step 4: Both cache and network failed, return fallback image
    const fallbackImage = await caches.match(FALLBACK_IMAGE);

    if (fallbackImage) {
      return fallbackImage;
    } else {
      // Create a simple SVG placeholder if fallback image isn't available
      const svgFallback = `
        <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
                fill="#666" text-anchor="middle" dy=".3em">
            Image not available offline
          </text>
        </svg>`;

      return new Response(svgFallback, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache",
        },
      });
    }
  }
}

// Handle other resource requests (CSS, JS, fonts, etc.)
async function handleOtherRequests(request) {
  console.log(
    "Handling other resource:",
    request.url,
    "Type:",
    request.destination
  );

  try {
    // Step 1: Try network first for most resources
    console.log("Attempting network request");
    const networkResponse = await fetch(request);

    // Step 2: Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed for resource, trying cache:", error.message);

    // Step 3: Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log("Serving cached resource");
      return cachedResponse;
    } else {
      console.log("Resource not available offline:", request.url);

      // For CSS files, return empty stylesheet to prevent broken styles
      if (request.destination === "style" || request.url.includes(".css")) {
        return new Response("/* Stylesheet not available offline */", {
          headers: { "Content-Type": "text/css" },
        });
      }

      // For JavaScript files, return empty script
      if (request.destination === "script" || request.url.includes(".js")) {
        return new Response("// Script not available offline", {
          headers: { "Content-Type": "application/javascript" },
        });
      }

      // For other resources, let the request fail
      throw error;
    }
  }
}
```

## Push Notifications and Background Sync

### Push Notification Implementation

**What this push notification system does:** Handles incoming push messages from a server and displays rich, interactive notifications to users.

**Key components:**

- **Push event handler:** Receives messages from push service and creates notifications
- **Notification click handler:** Manages user interactions with notifications
- **Rich notification options:** Icons, images, action buttons, and custom data
- **Window management:** Intelligently handles app focus and window opening

**Notification flow:**

1. Server sends push message to browser's push service
2. Browser delivers message to Service Worker
3. Service Worker creates and displays notification
4. User interacts with notification
5. Service Worker handles the interaction (open app, perform action, etc.)

**Input:** Push messages from server with notification payload
**Output:** Rich, interactive notifications with proper click handling

```javascript
// PUSH EVENT HANDLER - Receives push messages and displays notifications
self.addEventListener("push", (event) => {
  console.log("Push message received", event);

  // Extract notification data from push message
  let notificationData = {};

  if (event.data) {
    try {
      // Parse JSON payload from push service
      notificationData = event.data.json();
      console.log("Push data:", notificationData);
    } catch (error) {
      console.error("Failed to parse push data:", error);
      // Use text data as fallback
      notificationData = { body: event.data.text() };
    }
  } else {
    console.log("Push message has no data");
  }

  // Configure notification options with fallbacks
  const options = {
    // Basic notification content
    title: notificationData.title || "New Notification",
    body: notificationData.body || "You have a new message",

    // Visual elements
    icon: notificationData.icon || "/images/icon-192x192.png", // App icon
    badge: notificationData.badge || "/images/badge-72x72.png", // Small monochrome icon
    image: notificationData.image, // Large image (optional)

    // Custom data to pass to click handler
    data: {
      url: notificationData.url || "/", // URL to open when clicked
      timestamp: Date.now(),
      ...notificationData.data, // Additional custom data
    },

    // Action buttons (max 2 on most platforms)
    actions: notificationData.actions || [
      {
        action: "view", // Unique identifier
        title: "View", // Button text
        icon: "/images/view-icon.png", // Button icon (optional)
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/images/dismiss-icon.png",
      },
    ],

    // Behavior options
    requireInteraction: notificationData.requireInteraction || false, // Stay visible until interaction
    silent: notificationData.silent || false, // No sound/vibration
    renotify: false, // Don't replace existing notifications with same tag
    tag: notificationData.tag || "default", // Group related notifications

    // Additional options
    dir: "auto", // Text direction
    lang: "en-US", // Language
    vibrate: notificationData.vibrate || [200, 100, 200], // Vibration pattern
  };

  // Display the notification
  // event.waitUntil ensures the Service Worker stays alive until notification is shown
  event.waitUntil(
    self.registration
      .showNotification(options.title, options)
      .then(() => {
        console.log("Notification displayed successfully");
      })
      .catch((error) => {
        console.error("Failed to show notification:", error);
      })
  );
});

// NOTIFICATION CLICK HANDLER - Manages user interactions with notifications
self.addEventListener("notificationclick", (event) => {
  console.log(
    "Notification clicked:",
    event.notification.title,
    "Action:",
    event.action
  );

  // Close the notification
  event.notification.close();

  // Handle different actions
  if (event.action === "view") {
    // User clicked "View" action button
    console.log("Opening specific URL from notification data");
    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
      clients
        .openWindow(targetUrl)
        .then((windowClient) => {
          if (windowClient) {
            console.log("Opened new window:", targetUrl);
          } else {
            console.log("Failed to open window (popup blocked?)");
          }
        })
        .catch((error) => {
          console.error("Error opening window:", error);
        })
    );
  } else if (event.action === "dismiss") {
    // User clicked "Dismiss" action button
    console.log("Notification dismissed by user");

    // Optional: Send analytics or perform cleanup
    // Example: track dismissal event
    // sendAnalytics('notification_dismissed', event.notification.data);

    return; // Just close notification, no other action needed
  } else {
    // Default action - user clicked notification body (not an action button)
    console.log("Default notification click - finding or opening app window");

    event.waitUntil(
      // First, try to find an existing window to focus
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true, // Include windows not controlled by this SW
        })
        .then((clientList) => {
          console.log(`Found ${clientList.length} existing windows`);

          // Look for an existing window from our app
          for (const client of clientList) {
            if (
              client.url.includes(self.location.origin) &&
              "focus" in client
            ) {
              console.log("Focusing existing window:", client.url);
              return client.focus();
            }
          }

          // No existing window found, open new one
          console.log("No existing window found, opening new one");
          const targetUrl = event.notification.data?.url || "/";
          return clients.openWindow(targetUrl);
        })
        .then((windowClient) => {
          if (windowClient) {
            console.log("Successfully handled notification click");

            // Optional: Send message to the opened/focused window
            windowClient.postMessage({
              type: "NOTIFICATION_CLICKED",
              data: event.notification.data,
            });
          }
        })
        .catch((error) => {
          console.error("Error handling notification click:", error);
        })
    );
  }
});

// NOTIFICATION CLOSE HANDLER - Track when notifications are closed
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.title);

  // Optional: Track notification close events for analytics
  // This helps understand user engagement with notifications
  const notificationData = {
    title: event.notification.title,
    tag: event.notification.tag,
    timestamp: Date.now(),
  };

  // Example: Send to analytics service
  // sendAnalytics('notification_closed', notificationData);
});
```

### Background Sync

**What Background Sync does:** Ensures reliable data synchronization by retrying failed network requests when connectivity is restored.

**Key benefits:**

- **Reliable data delivery:** Guarantees important data reaches the server eventually
- **Offline resilience:** Handles network failures gracefully
- **Battery efficient:** Browser optimizes sync timing
- **User-friendly:** No manual retry needed

**Use cases:**

- Form submissions
- Chat messages
- Analytics events
- User-generated content
- Critical API calls

**Background Sync flow:**

1. App attempts network request while offline
2. Request fails, data is stored locally (IndexedDB)
3. Service Worker registers a sync event
4. When connectivity returns, browser triggers sync event
5. Service Worker processes pending data
6. Successfully synced data is removed from local storage

**Input:** Failed network requests and their data
**Output:** Reliable delivery of data when connectivity is available

```javascript
// BACKGROUND SYNC EVENT HANDLER
// Triggered by the browser when connectivity is restored
self.addEventListener("sync", (event) => {
  console.log("Sync event triggered, tag:", event.tag);

  // Handle different types of sync operations
  switch (event.tag) {
    case "background-sync":
      // General purpose background sync
      event.waitUntil(doBackgroundSync());
      break;

    case "chat-messages":
      // Specific sync for chat messages
      event.waitUntil(syncChatMessages());
      break;

    case "user-actions":
      // Sync user interactions (likes, shares, etc.)
      event.waitUntil(syncUserActions());
      break;

    default:
      console.log("Unknown sync tag:", event.tag);
  }
});

// Main background sync function
async function doBackgroundSync() {
  console.log("Starting background sync process");

  try {
    // Step 1: Get all pending data from local storage (IndexedDB)
    const pendingData = await getPendingData();
    console.log(`Found ${pendingData.length} pending sync items`);

    if (pendingData.length === 0) {
      console.log("No pending data to sync");
      return;
    }

    // Step 2: Process each pending item
    let successCount = 0;
    let failureCount = 0;

    for (const item of pendingData) {
      try {
        console.log(`Syncing item ${item.id}:`, item.type);

        // Step 3: Attempt to send data to server
        const response = await fetch(item.endpoint || "/api/sync", {
          method: item.method || "POST",
          body: JSON.stringify(item.data),
          headers: {
            "Content-Type": "application/json",
            "X-Sync-Item-ID": item.id,
            "X-Sync-Timestamp": item.timestamp.toString(),
            ...item.headers, // Additional headers from original request
          },
        });

        if (response.ok) {
          // Step 4: Success - remove from pending queue
          console.log(`Successfully synced item ${item.id}`);
          await removePendingData(item.id);
          successCount++;

          // Optional: Store sync result for app to use
          await storeSyncResult(item.id, {
            success: true,
            timestamp: Date.now(),
            response: await response.json(),
          });
        } else {
          // Server error - keep in queue for retry
          console.log(
            `Server error for item ${item.id}:`,
            response.status,
            response.statusText
          );
          failureCount++;

          // Update retry count and timestamp
          await updatePendingItem(item.id, {
            retryCount: (item.retryCount || 0) + 1,
            lastAttempt: Date.now(),
            lastError: `HTTP ${response.status}: ${response.statusText}`,
          });
        }
      } catch (networkError) {
        // Network error - keep in queue for retry
        console.log(`Network error for item ${item.id}:`, networkError.message);
        failureCount++;

        await updatePendingItem(item.id, {
          retryCount: (item.retryCount || 0) + 1,
          lastAttempt: Date.now(),
          lastError: networkError.message,
        });
      }
    }

    console.log(
      `Background sync complete. Success: ${successCount}, Failed: ${failureCount}`
    );

    // Step 5: Notify the app about sync results
    await notifyAppOfSyncResults({
      totalItems: pendingData.length,
      successCount,
      failureCount,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Background sync process failed:", error);

    // Re-register sync for retry if the entire process failed
    await self.registration.sync.register("background-sync");
  }
}

// Specialized sync function for chat messages
async function syncChatMessages() {
  console.log("Syncing chat messages");

  try {
    const pendingMessages = await getPendingDataByType("chat-message");

    for (const message of pendingMessages) {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({
          text: message.text,
          timestamp: message.timestamp,
          roomId: message.roomId,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${message.token}`,
        },
      });

      if (response.ok) {
        await removePendingData(message.id);
        console.log("Chat message synced:", message.id);
      }
    }
  } catch (error) {
    console.error("Chat message sync failed:", error);
  }
}

// Notify the application about sync results
async function notifyAppOfSyncResults(results) {
  try {
    // Send message to all open windows/tabs
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: "window",
    });

    clients.forEach((client) => {
      client.postMessage({
        type: "BACKGROUND_SYNC_COMPLETE",
        results: results,
      });
    });

    console.log("Notified", clients.length, "clients about sync results");
  } catch (error) {
    console.error("Failed to notify app of sync results:", error);
  }
}

// Helper functions for IndexedDB operations
// Note: These would typically be imported from a separate module

async function getPendingData() {
  // Implementation would use IndexedDB to retrieve all pending sync items
  // Example structure:
  return [
    {
      id: "sync-item-1",
      type: "user-action",
      endpoint: "/api/users/action",
      method: "POST",
      data: { action: "like", postId: "123" },
      timestamp: Date.now() - 60000,
      retryCount: 0,
    },
    // ... more items
  ];
}

async function removePendingData(itemId) {
  // Remove successfully synced item from IndexedDB
  console.log("Removing synced item from storage:", itemId);
}

async function updatePendingItem(itemId, updates) {
  // Update retry count and error info for failed items
  console.log("Updating pending item:", itemId, updates);
}

async function storeSyncResult(itemId, result) {
  // Store sync results for the app to access
  console.log("Storing sync result:", itemId, result);
}

async function getPendingDataByType(type) {
  // Get pending items of a specific type
  const allPending = await getPendingData();
  return allPending.filter((item) => item.type === type);
}
```

## Advanced Patterns and Best Practices

### Service Worker Update Pattern

```javascript
// Handle service worker updates gracefully
self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// In main application
class ServiceWorkerUpdateManager {
  constructor() {
    this.refreshing = false;
    this.setupUpdateHandling();
  }

  setupUpdateHandling() {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.refreshing) return;
      this.refreshing = true;
      window.location.reload();
    });
  }

  async checkForUpdates() {
    const registration = await navigator.serviceWorker.ready;
    registration.update();
  }

  async promptUpdate() {
    const registration = await navigator.serviceWorker.ready;

    if (registration.waiting) {
      const userWantsUpdate = confirm(
        "A new version is available. Would you like to update?"
      );

      if (userWantsUpdate) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    }
  }
}
```

### Resource Versioning Strategy

```javascript
const CACHE_VERSION = "v2.1.0";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_FILES = [
  "/",
  "/styles/main.css",
  "/scripts/main.js",
  "/images/logo.png",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_FILES)),
      caches.open(DYNAMIC_CACHE), // Create dynamic cache
    ])
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            !cacheName.includes(CACHE_VERSION) &&
            (cacheName.startsWith("static-") ||
              cacheName.startsWith("dynamic-"))
          ) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## Security Considerations

### Secure Service Worker Implementation

```javascript
// Validate requests in service worker
self.addEventListener("fetch", (event) => {
  // Only handle same-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Validate request method
  if (!["GET", "POST", "PUT", "DELETE"].includes(event.request.method)) {
    return;
  }

  // Handle different request types securely
  if (event.request.url.includes("/api/")) {
    event.respondWith(handleAPIRequest(event.request));
  } else {
    event.respondWith(handleStaticRequest(event.request));
  }
});

async function handleAPIRequest(request) {
  // Don't cache sensitive API requests
  if (request.url.includes("/auth/") || request.url.includes("/user/")) {
    return fetch(request);
  }

  // Use network-first for API requests
  try {
    const response = await fetch(request);

    // Only cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return caches.match(request);
  }
}

// Content Security Policy headers
self.addEventListener("fetch", (event) => {
  if (event.request.destination === "document") {
    event.respondWith(
      fetch(event.request).then((response) => {
        // Add security headers
        const headers = new Headers(response.headers);
        headers.set(
          "Content-Security-Policy",
          "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
        );
        headers.set("X-Frame-Options", "DENY");
        headers.set("X-Content-Type-Options", "nosniff");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
      })
    );
  }
});
```

## Debugging and Development

### Service Worker Debugging Tools

```javascript
// Development utilities
class ServiceWorkerDebugger {
  static logCacheContents() {
    caches.keys().then((cacheNames) => {
      console.group("Cache Contents");

      cacheNames.forEach((cacheName) => {
        caches.open(cacheName).then((cache) => {
          cache.keys().then((requests) => {
            console.group(cacheName);
            requests.forEach((request) => {
              console.log(request.url);
            });
            console.groupEnd();
          });
        });
      });

      console.groupEnd();
    });
  }

  static clearAllCaches() {
    return caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log("Deleting cache:", cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }

  static async getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  }
}

// Expose debugging tools in development
if (self.location.hostname === "localhost") {
  self.debug = ServiceWorkerDebugger;
}
```

## Real-World Implementation

### Complete PWA Service Worker

**What this production-ready Service Worker does:** Implements a comprehensive caching strategy suitable for real-world Progressive Web Apps.

**Production features implemented:**

- **Version-based cache management:** Automatic cleanup of old cache versions
- **Resource-specific strategies:** Different caching approaches for different content types
- **Offline resilience:** Graceful handling of network failures
- **Performance optimization:** Strategic precaching of critical resources
- **Error handling:** Robust error recovery and fallback mechanisms

**Architecture overview:**

- **App Shell Pattern:** Critical resources cached during installation
- **Runtime Caching:** Dynamic content cached as needed
- **Offline First:** Local content served first when available
- **Network Resilience:** Fallbacks for every type of failure

**Input:** All application network requests
**Output:** Fast, reliable responses with offline capability

```javascript
// CONFIGURATION - Update version to trigger cache updates
const APP_VERSION = "1.0.0";
const CACHE_NAME = `pwa-cache-${APP_VERSION}`; // Static resources cache
const API_CACHE = `api-cache-${APP_VERSION}`; // API responses cache
const RUNTIME_CACHE = `runtime-cache-${APP_VERSION}`; // Dynamic resources cache

// PRECACHE URLS - Critical resources for offline functionality (App Shell)
const PRECACHE_URLS = [
  "/", // Home page
  "/index.html", // Main HTML file
  "/styles/app.css", // Critical CSS
  "/scripts/app.js", // Core JavaScript
  "/images/icon-192.png", // App icon
  "/manifest.json", // PWA manifest
  "/offline.html", // Offline fallback page
  // Add other critical resources your app needs to work offline
];

// INSTALL EVENT - Cache critical resources (App Shell)
self.addEventListener("install", (event) => {
  console.log(`Service Worker ${APP_VERSION} installing...`);

  event.waitUntil(
    // Open the static cache and precache all critical resources
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Precaching app shell resources");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log("App shell cached successfully");
        // Skip waiting to activate immediately (optional - be careful in production)
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to precache app shell:", error);
        throw error;
      })
  );
});

// ACTIVATE EVENT - Clean up old caches and take control
self.addEventListener("activate", (event) => {
  console.log(`Service Worker ${APP_VERSION} activating...`);

  event.waitUntil(
    Promise.all([
      // Step 1: Clean up old cache versions
      caches.keys().then((cacheNames) => {
        console.log("Existing caches:", cacheNames);

        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match current version
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== API_CACHE &&
              cacheName !== RUNTIME_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Step 2: Take control of all clients immediately
      self.clients.claim().then(() => {
        console.log("Service Worker now controlling all pages");
      }),
    ])
  );
});

// FETCH EVENT - Main request handler with intelligent routing
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests (unless specifically configured)
  if (url.origin !== self.location.origin) {
    return;
  }

  console.log("Handling request:", url.pathname, "Type:", request.destination);

  // Route to appropriate handler based on request type
  if (url.pathname.startsWith("/api/")) {
    // API requests - network-first with cache fallback
    event.respondWith(handleAPIRequest(request));
  } else if (request.destination === "document") {
    // HTML pages - network-first with offline fallback
    event.respondWith(handleDocumentRequest(request));
  } else {
    // Static resources - cache-first with network fallback
    event.respondWith(handleResourceRequest(request));
  }
});

// API REQUEST HANDLER - Network-first strategy for dynamic data
async function handleAPIRequest(request) {
  console.log("Handling API request:", request.url);
  const cache = await caches.open(API_CACHE);

  try {
    // Step 1: Try network first for fresh data
    const response = await fetch(request);
    console.log("API network response:", response.status);

    // Step 2: Cache successful responses
    if (response.ok) {
      // Clone response for caching (response can only be consumed once)
      const responseClone = response.clone();

      // Add timestamp header for cache management
      const headers = new Headers(responseClone.headers);
      headers.set("sw-cached-at", Date.now().toString());

      const timestampedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });

      cache.put(request, timestampedResponse);
      console.log("API response cached");
    }

    return response;
  } catch (error) {
    // Step 3: Network failed, try cache
    console.log("API network failed, trying cache:", error.message);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log("Serving stale API data from cache");
      return cachedResponse;
    } else {
      // No cache available, return error response
      console.log("No API cache available");
      return new Response(
        JSON.stringify({
          error: "Offline",
          message: "This feature requires an internet connection",
        }),
        {
          status: 503,
          statusText: "Service Unavailable",
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
}

// DOCUMENT REQUEST HANDLER - Network-first for HTML pages
async function handleDocumentRequest(request) {
  console.log("Handling document request:", request.url);

  try {
    // Step 1: Try network first for fresh content
    const response = await fetch(request);
    console.log("Document network response:", response.status);

    // Step 2: Cache successful HTML responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      console.log("Document cached");
    }

    return response;
  } catch (error) {
    // Step 3: Network failed, try cache
    console.log("Document network failed, trying cache:", error.message);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Serving cached document");
      return cachedResponse;
    }

    // Step 4: No cache, serve offline page
    console.log("No document cache, serving offline page");
    return caches.match("/offline.html");
  }
}

// RESOURCE REQUEST HANDLER - Cache-first for static assets
async function handleResourceRequest(request) {
  console.log(
    "Handling resource request:",
    request.url,
    "Type:",
    request.destination
  );

  // Step 1: Try cache first for performance
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("Serving resource from cache:", request.url);
    return cachedResponse;
  }

  try {
    // Step 2: Not in cache, fetch from network
    console.log("Resource not cached, fetching from network");
    const response = await fetch(request);

    // Step 3: Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      console.log("Caching new resource:", request.url);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log("Resource network failed:", error.message);

    // Step 4: Provide appropriate fallbacks
    if (request.destination === "image") {
      // Return fallback image
      const fallbackImage = await caches.match("/images/fallback.png");
      if (fallbackImage) {
        return fallbackImage;
      }
    }

    // For other resources, let the request fail
    throw error;
  }
}

// ERROR HANDLING - Global error handler
self.addEventListener("error", (event) => {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker unhandled promise rejection:", event.reason);
});

// MESSAGING - Handle messages from main thread
self.addEventListener("message", (event) => {
  const { data } = event;

  switch (data.type) {
    case "GET_VERSION":
      event.ports[0].postMessage({ version: APP_VERSION });
      break;

    case "CLEAR_CACHE":
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;

    case "SKIP_WAITING":
      self.skipWaiting();
      break;
  }
});

console.log(`Service Worker ${APP_VERSION} loaded and ready`);
```

## Performance Optimization

### Cache Management Best Practices

```javascript
// Efficient cache management
class OptimizedCacheManager {
  constructor() {
    this.maxCacheSize = 50 * 1024 * 1024; // 50MB
    this.maxCacheAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  async maintainCache() {
    await this.removeExpiredEntries();
    await this.enforcesCacheLimit();
  }

  async removeExpiredEntries() {
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response.headers.get("date");

        if (dateHeader) {
          const age = Date.now() - new Date(dateHeader).getTime();
          if (age > this.maxCacheAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }

  async enforcesCacheLimit() {
    const totalSize = await this.calculateCacheSize();

    if (totalSize > this.maxCacheSize) {
      await this.removeOldestEntries(totalSize - this.maxCacheSize);
    }
  }

  async calculateCacheSize() {
    // Implementation for calculating total cache size
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  }
}

// Run cache maintenance periodically
const cacheManager = new OptimizedCacheManager();
setInterval(() => {
  cacheManager.maintainCache();
}, 24 * 60 * 60 * 1000); // Daily
```

## Conclusion

Service Workers are a fundamental technology for building modern web applications that provide native-like experiences. They enable powerful features like offline functionality, push notifications, and background synchronization while maintaining security and performance.

### Key Takeaways

1. **Lifecycle Management**: Understanding the install, activate, and fetch phases is crucial for effective Service Worker implementation.

2. **Caching Strategies**: Different caching strategies (cache-first, network-first, stale-while-revalidate) serve different use cases and performance requirements.

3. **Security First**: Service Workers require HTTPS and careful consideration of security implications, including proper scope management and input validation.

4. **Progressive Enhancement**: Service Workers should enhance the user experience without breaking functionality for unsupported browsers.

5. **Performance Impact**: While Service Workers can significantly improve performance through caching, they require careful management to avoid bloating storage and degrading performance.

### When to Use Service Workers

- Building Progressive Web Apps (PWAs)
- Implementing offline functionality
- Optimizing resource loading and caching
- Adding push notification capabilities
- Performing background data synchronization

As detailed in the [MDN Service Worker API documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API), Service Workers represent a paradigm shift toward more resilient, performant web applications that can compete with native mobile apps in terms of user experience and reliability.

### Further Resources

- [MDN Service Worker API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google Developers - Service Worker Guide](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Service Worker Specification](https://w3c.github.io/ServiceWorker/)
- [Workbox - Production-ready Service Worker Libraries](https://developers.google.com/web/tools/workbox)
