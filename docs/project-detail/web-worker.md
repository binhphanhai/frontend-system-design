# Web Workers: Background Threading in the Browser

## Table of Contents

- [Introduction](#introduction)
- [Getting Started with Web Workers](#getting-started-with-web-workers)
- [Types of Web Workers](#types-of-web-workers)
- [Under the Hood: Threading Model](#under-the-hood-threading-model)
- [Message Passing and Data Transfer](#message-passing-and-data-transfer)
- [Worker Lifecycle Management](#worker-lifecycle-management)
- [Advanced Features and Patterns](#advanced-features-and-patterns)
- [Performance Optimization](#performance-optimization)
- [Real-World Implementation Examples](#real-world-implementation-examples)
- [Error Handling and Debugging](#error-handling-and-debugging)
- [Best Practices and Limitations](#best-practices-and-limitations)
- [Conclusion](#conclusion)

## Introduction

Web Workers provide a way to run JavaScript code in background threads, separate from the main execution thread of a web page. This enables true parallel processing in web applications, allowing intensive computations to be performed without blocking the user interface.

As outlined in the [MDN Web Workers documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), Web Workers solve the fundamental problem of JavaScript's single-threaded nature by providing isolated execution contexts that can communicate with the main thread through message passing.

### Key Benefits

- **Non-blocking Operations**: Heavy computations don't freeze the UI
- **True Parallelism**: Multiple workers can run simultaneously
- **Isolated Execution**: Workers can't accidentally interfere with the main thread
- **Network Access**: Workers can make HTTP requests independently
- **Shared Processing**: Multiple scripts can share worker resources

### Common Use Cases

- Image/video processing
- Cryptographic operations
- Data parsing and analysis
- Background data synchronization
- Real-time data processing
- Mathematical calculations

## Getting Started with Web Workers

### Browser Support Check

Before implementing Web Workers, it's crucial to check if the browser supports this feature. Not all browsers (especially older ones) support Web Workers, so feature detection is essential for graceful degradation.

**What this code does:**

- Checks if the `Worker` constructor is available in the global scope
- Provides a boolean result that can be used for conditional logic
- Allows you to implement fallback strategies for unsupported browsers

**Input:** None (feature detection function)  
**Output:** Boolean indicating Web Worker support  
**When to use:** At the start of your application or before creating any workers

```javascript
// Feature detection for Web Workers
// This function checks if the browser supports the Worker API
function supportsWebWorkers() {
  // Check if Worker constructor exists and is not undefined
  // typeof returns "function" for constructors, "undefined" for missing features
  return typeof Worker !== "undefined";
}

// Use the detection function to conditionally enable worker features
if (supportsWebWorkers()) {
  console.log("Web Workers are supported");
  // Safe to proceed with Web Worker implementation
  // Initialize your worker-based features here
} else {
  console.log("Web Workers are not supported");
  // Provide fallback functionality for older browsers
  // Could use setTimeout for async operations, or process data synchronously
  // Example fallback: use requestAnimationFrame for chunked processing
}

// Alternative: More comprehensive feature detection
function checkWorkerSupport() {
  const features = {
    webWorkers: typeof Worker !== "undefined",
    sharedWorkers: typeof SharedWorker !== "undefined",
    serviceWorkers: "serviceWorker" in navigator,
    transferableObjects: typeof ArrayBuffer !== "undefined",
  };

  console.log("Browser support:", features);
  return features;
}
```

### Basic Worker Implementation

This example demonstrates the fundamental pattern for creating and communicating with a Web Worker. The implementation consists of two parts: the main thread code that creates and manages the worker, and the worker script that runs in the background.

**What this implementation does:**

- Creates a worker that runs independently from the main UI thread
- Sends computational tasks to the worker without blocking the user interface
- Receives results back from the worker and updates the UI
- Handles errors gracefully to prevent application crashes

**Communication Flow:**

1. Main thread creates worker and sends initial data
2. Worker receives data, processes it, and sends results back
3. Main thread receives results and updates the UI
4. Error handlers catch and manage any issues that occur

#### Main Thread (app.js)

**Input:** Array of numbers to process  
**Output:** Processed result displayed in the UI  
**Purpose:** Coordinates worker creation, data sending, and result handling

```javascript
// Check for Web Worker support before attempting to create one
if (window.Worker) {
  // Step 1: Create a new worker instance
  // The worker will load and execute the specified JavaScript file
  const worker = new Worker("worker.js");

  // Step 2: Send data to worker using postMessage
  // The data is serialized using the structured clone algorithm
  // This example sends a command object with task instructions and data array
  worker.postMessage({
    command: "start", // Task identifier for the worker
    data: [1, 2, 3, 4, 5], // Array of numbers to process
  });

  // Step 3: Listen for messages from worker
  // The worker will send results back using postMessage
  worker.onmessage = function (event) {
    console.log("Message from worker:", event.data);

    // Update the UI with the processed result
    // event.data contains the worker's response
    const resultElement = document.getElementById("result");
    if (resultElement) {
      // Display the result (could be a number, object, or formatted string)
      resultElement.textContent = JSON.stringify(event.data);
    }
  };

  // Step 4: Handle worker runtime errors
  // This catches errors that occur during worker execution
  worker.onerror = function (error) {
    console.error("Worker error:", {
      message: error.message, // Error description
      filename: error.filename, // File where error occurred
      lineno: error.lineno, // Line number of error
    });

    // Optionally show user-friendly error message
    const resultElement = document.getElementById("result");
    if (resultElement) {
      resultElement.textContent = "Processing failed. Please try again.";
    }
  };

  // Step 5: Handle message serialization errors
  // This occurs when data cannot be cloned between threads
  worker.onmessageerror = function (event) {
    console.error("Message serialization error:", event);
    // This typically happens when trying to send functions or DOM elements
  };

  // Optional: Clean up worker when page unloads
  window.addEventListener("beforeunload", () => {
    worker.terminate(); // Immediately stop the worker
  });
} else {
  console.log("Web Workers not supported");
  // Fallback: Process data synchronously on main thread
  processDataSynchronously([1, 2, 3, 4, 5]);
}

// Fallback function for browsers without Web Worker support
function processDataSynchronously(data) {
  const result = data.reduce((sum, num) => sum + num * num, 0);
  document.getElementById("result").textContent = result;
}
```

#### Worker Script (worker.js)

**Purpose:** Runs computationally intensive tasks in background without blocking the UI  
**Input:** Command objects with task instructions and data  
**Output:** Processed results sent back to main thread  
**Key Features:** Command routing, error handling, and self-termination capability

This worker script demonstrates a command-based architecture that can handle multiple types of operations. It runs in the WorkerGlobalScope, which is isolated from the main thread and doesn't have access to DOM or window objects.

```javascript
// Worker global scope - isolated from main thread
// No access to DOM, window, or parent objects
// 'self' refers to the WorkerGlobalScope
console.log("Worker started and ready to receive commands");

// Step 1: Set up message listener for communication with main thread
// This is the primary way the worker receives instructions and data
self.onmessage = function (event) {
  console.log("Worker received message:", event.data);

  // Extract command and data from the message object
  // This uses destructuring to get specific properties
  const { command, data } = event.data;

  // Step 2: Route commands to appropriate handlers
  // Using a switch statement for clear command routing
  switch (command) {
    case "start":
      // Process the data and send result back to main thread
      const result = processData(data);
      self.postMessage(result);
      break;

    case "stop":
      // Gracefully terminate the worker from inside
      console.log("Worker stopping...");
      self.close(); // This terminates the worker
      break;

    case "ping":
      // Simple health check command
      self.postMessage({ status: "alive", timestamp: Date.now() });
      break;

    default:
      // Handle unknown commands gracefully
      console.error("Unknown command received:", command);
      self.postMessage({
        error: `Unknown command: ${command}`,
        availableCommands: ["start", "stop", "ping"],
      });
  }
};

// Step 3: Core data processing function
// This simulates a CPU-intensive operation that would block the UI if run on main thread
function processData(numbers) {
  console.log(`Processing ${numbers.length} numbers...`);

  // Validate input data
  if (!Array.isArray(numbers)) {
    throw new Error("Input must be an array of numbers");
  }

  // Start performance measurement
  const startTime = performance.now();

  // Simulate intensive computation: sum of squares
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    // Validate each number
    if (typeof numbers[i] !== "number") {
      throw new Error(`Invalid number at index ${i}: ${numbers[i]}`);
    }

    sum += numbers[i] * numbers[i];

    // Simulate heavy computational work
    // This would normally be your actual complex algorithm
    for (let j = 0; j < 1000000; j++) {
      Math.random(); // CPU-intensive operation
    }

    // Optional: Report progress for long operations
    if (i % 10 === 0 && numbers.length > 10) {
      self.postMessage({
        type: "progress",
        completed: i,
        total: numbers.length,
        percentage: Math.round((i / numbers.length) * 100),
      });
    }
  }

  // Calculate processing time
  const endTime = performance.now();
  const processingTime = endTime - startTime;

  console.log(`Processing completed in ${processingTime.toFixed(2)}ms`);

  // Return comprehensive result object
  return {
    type: "result",
    result: sum,
    processed: numbers.length,
    processingTime: processingTime,
    average: sum / numbers.length,
    timestamp: Date.now(),
  };
}

// Step 4: Global error handler for the worker
// This catches any unhandled errors in the worker script
self.onerror = function (error) {
  console.error("Unhandled error in worker:", {
    message: error.message,
    filename: error.filename,
    lineno: error.lineno,
    colno: error.colno,
  });

  // Send error information back to main thread
  self.postMessage({
    type: "error",
    error: error.message,
    details: {
      filename: error.filename,
      line: error.lineno,
      column: error.colno,
    },
  });
};

// Step 5: Handle unhandled promise rejections
// Important for async operations within the worker
self.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection in worker:", event.reason);

  self.postMessage({
    type: "error",
    error: "Unhandled promise rejection",
    details: event.reason,
  });

  // Prevent the default handling
  event.preventDefault();
});

// Optional: Worker initialization code
// This runs when the worker is first loaded
(function initializeWorker() {
  console.log("Worker initialized successfully");

  // Send ready signal to main thread
  self.postMessage({
    type: "ready",
    capabilities: ["start", "stop", "ping"],
    workerInfo: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      onLine: navigator.onLine,
    },
  });
})();
```

## Types of Web Workers

### Dedicated Workers

Dedicated workers are bound to a single script/context and provide isolated execution environments. Unlike shared workers, they can only communicate with the script that created them. This class-based approach provides a clean, Promise-based API for worker communication.

**What this implementation provides:**

- Promise-based worker communication (async/await support)
- Automatic message ID tracking to match requests with responses
- Proper cleanup and error handling
- Simplified API that abstracts away the complexity of worker messaging

**Use cases:**

- CPU-intensive calculations for a specific component
- Data processing tasks that need dedicated resources
- Image/video processing workflows
- Mathematical computations that shouldn't block the UI

**Input:** Worker script path, commands, and data objects  
**Output:** Promise-wrapped results from worker execution  
**Key Features:** Message correlation, error propagation, resource cleanup

```javascript
// Advanced worker manager with Promise-based API and message correlation
class DedicatedWorkerManager {
  constructor(workerScript) {
    // Initialize the worker with the specified script
    this.worker = new Worker(workerScript);

    // Message tracking for correlating requests with responses
    this.messageId = 0; // Counter for unique message IDs
    this.pendingMessages = new Map(); // Store Promise resolvers/rejectors

    // Set up communication handlers
    this.setupEventHandlers();

    console.log(`Dedicated worker created: ${workerScript}`);
  }

  setupEventHandlers() {
    // Handle messages from worker
    this.worker.onmessage = (event) => {
      const { messageId, result, error, type } = event.data;

      // Handle different message types
      if (type === "progress") {
        // Handle progress updates (optional)
        this.handleProgress(event.data);
        return;
      }

      // Find the corresponding pending message
      if (this.pendingMessages.has(messageId)) {
        const { resolve, reject, timestamp } =
          this.pendingMessages.get(messageId);

        // Calculate response time for performance monitoring
        const responseTime = Date.now() - timestamp;
        console.log(`Worker response received in ${responseTime}ms`);

        // Clean up the pending message
        this.pendingMessages.delete(messageId);

        // Resolve or reject the Promise based on worker response
        if (error) {
          reject(new Error(error));
        } else {
          resolve(result);
        }
      } else {
        console.warn("Received message with unknown ID:", messageId);
      }
    };

    // Handle worker runtime errors
    this.worker.onerror = (error) => {
      console.error("Worker runtime error:", {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
      });

      // Reject all pending messages since worker is in error state
      this.rejectAllPending(new Error(`Worker error: ${error.message}`));
    };

    // Handle message serialization errors
    this.worker.onmessageerror = (event) => {
      console.error("Worker message serialization error:", event);
      this.rejectAllPending(new Error("Message serialization failed"));
    };
  }

  // Promise-based execution method
  async execute(command, data, options = {}) {
    return new Promise((resolve, reject) => {
      // Generate unique message ID
      const messageId = ++this.messageId;
      const timestamp = Date.now();

      // Store Promise resolvers for later use
      this.pendingMessages.set(messageId, {
        resolve,
        reject,
        timestamp,
        command,
        timeout: options.timeout || 30000, // Default 30 second timeout
      });

      // Set up timeout to prevent hanging promises
      setTimeout(() => {
        if (this.pendingMessages.has(messageId)) {
          this.pendingMessages.delete(messageId);
          reject(
            new Error(`Worker timeout after ${options.timeout || 30000}ms`)
          );
        }
      }, options.timeout || 30000);

      // Send message to worker
      this.worker.postMessage({
        messageId, // For response correlation
        command, // Operation to perform
        data, // Data to process
        options, // Additional options
      });

      console.log(`Sent command '${command}' to worker with ID ${messageId}`);
    });
  }

  // Handle progress updates from worker
  handleProgress(progressData) {
    const { messageId, completed, total, percentage } = progressData;

    if (this.pendingMessages.has(messageId)) {
      // Emit progress event if listeners are set up
      this.emit("progress", {
        completed,
        total,
        percentage,
        messageId,
      });
    }
  }

  // Utility method to reject all pending messages
  rejectAllPending(error) {
    this.pendingMessages.forEach(({ reject, command }, messageId) => {
      console.log(`Rejecting pending command '${command}' (ID: ${messageId})`);
      reject(error);
    });
    this.pendingMessages.clear();
  }

  // Clean shutdown of the worker
  terminate() {
    console.log("Terminating dedicated worker...");

    // Reject all pending messages before termination
    this.rejectAllPending(new Error("Worker terminated"));

    // Terminate the worker
    this.worker.terminate();

    console.log("Worker terminated successfully");
  }

  // Check if worker has pending operations
  hasPendingOperations() {
    return this.pendingMessages.size > 0;
  }

  // Get statistics about worker usage
  getStats() {
    return {
      pendingMessages: this.pendingMessages.size,
      totalMessagesSent: this.messageId,
      isActive: !!this.worker,
    };
  }

  // Simple event emitter for progress updates
  emit(event, data) {
    if (this.listeners && this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  // Add event listener for progress updates
  on(event, callback) {
    if (!this.listeners) this.listeners = {};
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
}

// Example usage of the DedicatedWorkerManager
/*
const workerManager = new DedicatedWorkerManager('math-worker.js');

// Listen for progress updates
workerManager.on('progress', (progress) => {
  console.log(`Progress: ${progress.percentage}%`);
});

// Execute commands with async/await
try {
  const result = await workerManager.execute('fibonacci', { n: 40 });
  console.log('Fibonacci result:', result);
} catch (error) {
  console.error('Worker execution failed:', error);
}

// Clean up when done
workerManager.terminate();
*/
```

### Shared Workers

Shared workers enable multiple browser contexts (tabs, iframes, windows) to communicate with a single worker instance. This is powerful for cross-tab communication, shared state management, and coordinating activities across multiple parts of a web application.

**Key advantages of Shared Workers:**

- Single worker instance shared across multiple browser contexts
- Persistent state that survives tab navigation and closing
- Real-time synchronization between different tabs/windows
- Resource efficiency by avoiding duplicate worker instances
- Central coordination hub for distributed web app features

**Common use cases:**

- Live chat systems that sync across tabs
- Real-time collaborative features (like Google Docs)
- Cross-tab notification systems
- Shared caching and data synchronization
- Multi-tab shopping cart management

#### Shared Worker Script (shared-worker.js)

**Purpose:** Central hub that manages connections from multiple browser contexts  
**Input:** Action-based messages from connected ports  
**Output:** Broadcasted updates to all connected contexts  
**State Management:** Persistent shared data across all connections

```javascript
// Shared worker maintains connections and shared state
const connections = []; // Array to track all active port connections
let sharedData = {
  // Centralized data shared across all contexts
  counter: 0, // Example counter that all tabs can modify
  messages: [], // Chat-like message system
  activeUsers: new Set(), // Track active users across tabs
  lastActivity: Date.now(), // Track when worker was last active
};

// Handle new connections from browser contexts (tabs, iframes, etc.)
self.onconnect = function (event) {
  // Get the MessagePort for this new connection
  const port = event.ports[0];

  // Generate unique connection ID for tracking
  const connectionId = `conn_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  // Store connection with metadata
  const connectionInfo = {
    port: port,
    id: connectionId,
    connectedAt: Date.now(),
    lastSeen: Date.now(),
    userAgent: "unknown", // Could be passed from client
  };

  connections.push(connectionInfo);
  console.log(
    `New connection established: ${connectionId} (Total: ${connections.length})`
  );

  // Set up message handler for this specific port
  port.onmessage = function (event) {
    const { action, data, userId } = event.data;

    // Update last seen timestamp for this connection
    connectionInfo.lastSeen = Date.now();
    sharedData.lastActivity = Date.now();

    // Route actions to appropriate handlers
    switch (action) {
      case "increment":
        // Increment shared counter and broadcast to all connected tabs
        sharedData.counter++;
        console.log(
          `Counter incremented to ${sharedData.counter} by ${connectionId}`
        );

        broadcastToAllPorts({
          type: "counter",
          value: sharedData.counter,
          updatedBy: connectionId,
          timestamp: Date.now(),
        });
        break;

      case "addMessage":
        // Add message to shared chat and broadcast to all tabs
        const message = {
          id: `msg_${Date.now()}`,
          content: data,
          author: userId || "Anonymous",
          timestamp: Date.now(),
          connectionId: connectionId,
        };

        sharedData.messages.push(message);
        console.log(`New message added: ${message.content}`);

        // Limit message history to prevent memory growth
        if (sharedData.messages.length > 100) {
          sharedData.messages = sharedData.messages.slice(-50); // Keep last 50
        }

        broadcastToAllPorts({
          type: "newMessage",
          message: message,
        });
        break;

      case "getData":
        // Send current shared data only to requesting port
        port.postMessage({
          type: "data",
          data: sharedData,
          connectionInfo: {
            id: connectionId,
            totalConnections: connections.length,
          },
        });
        break;

      case "setUser":
        // Track active users across tabs
        if (data.userId) {
          sharedData.activeUsers.add(data.userId);
          connectionInfo.userId = data.userId;

          broadcastToAllPorts({
            type: "userUpdate",
            activeUsers: Array.from(sharedData.activeUsers),
            action: "joined",
            userId: data.userId,
          });
        }
        break;

      case "ping":
        // Health check - respond only to sender
        port.postMessage({
          type: "pong",
          timestamp: Date.now(),
          connectionId: connectionId,
        });
        break;

      default:
        console.warn(`Unknown action received: ${action}`);
        port.postMessage({
          type: "error",
          error: `Unknown action: ${action}`,
          availableActions: [
            "increment",
            "addMessage",
            "getData",
            "setUser",
            "ping",
          ],
        });
    }
  };

  // Handle port disconnection
  port.onmessageerror = function (event) {
    console.error(`Message error on connection ${connectionId}:`, event);
    removeConnection(connectionId);
  };

  // Start the port communication
  port.start();

  // Send initial connection confirmation with current state
  port.postMessage({
    type: "connected",
    data: sharedData,
    connectionId: connectionId,
    totalConnections: connections.length,
  });
};

// Broadcast message to all connected ports
function broadcastToAllPorts(message) {
  console.log(
    `Broadcasting to ${connections.length} connections:`,
    message.type
  );

  // Iterate through all connections and send message
  connections.forEach((connectionInfo, index) => {
    try {
      connectionInfo.port.postMessage(message);
    } catch (error) {
      // Port might be closed - remove it from connections
      console.warn(
        `Failed to send message to connection ${connectionInfo.id}:`,
        error
      );
      connections.splice(index, 1);

      // Clean up user data if connection had a user
      if (connectionInfo.userId) {
        sharedData.activeUsers.delete(connectionInfo.userId);

        // Notify other connections about user leaving
        broadcastToAllPorts({
          type: "userUpdate",
          activeUsers: Array.from(sharedData.activeUsers),
          action: "left",
          userId: connectionInfo.userId,
        });
      }
    }
  });
}

// Remove specific connection
function removeConnection(connectionId) {
  const index = connections.findIndex((conn) => conn.id === connectionId);
  if (index !== -1) {
    const removedConnection = connections.splice(index, 1)[0];
    console.log(`Connection removed: ${connectionId}`);

    // Clean up associated user data
    if (removedConnection.userId) {
      sharedData.activeUsers.delete(removedConnection.userId);
    }
  }
}

// Periodic cleanup of stale connections (every 30 seconds)
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 60000; // 1 minute

  const staleConnections = connections.filter(
    (conn) => now - conn.lastSeen > staleThreshold
  );

  staleConnections.forEach((conn) => {
    console.log(`Removing stale connection: ${conn.id}`);
    removeConnection(conn.id);
  });

  if (staleConnections.length > 0) {
    console.log(`Cleaned up ${staleConnections.length} stale connections`);
  }
}, 30000);

// Log worker status periodically
setInterval(() => {
  console.log(
    `Shared Worker Status: ${connections.length} active connections, ${sharedData.activeUsers.size} active users`
  );
}, 60000);
```

#### Using Shared Workers

This client class provides a clean interface for connecting to and communicating with shared workers. Multiple instances of this class (across different tabs/windows) will all connect to the same shared worker instance, enabling real-time cross-tab synchronization.

**What this client provides:**

- Clean API for shared worker communication
- Automatic reconnection handling
- Event-driven architecture for real-time updates
- Type-safe message handling
- Connection lifecycle management

**Input:** User actions and data from the browser context  
**Output:** UI updates based on shared worker state changes  
**Key Features:** Real-time synchronization, connection management, error recovery

```javascript
// Client class for connecting to and communicating with shared workers
class SharedWorkerClient {
  constructor(userId = null) {
    this.userId =
      userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.connectionId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second delay

    this.initializeWorker();
  }

  initializeWorker() {
    try {
      // Create connection to shared worker
      this.worker = new SharedWorker("shared-worker.js");
      this.port = this.worker.port;

      // Set up event handlers
      this.setupEventHandlers();

      console.log("Attempting to connect to shared worker...");
    } catch (error) {
      console.error("Failed to create shared worker:", error);
      this.handleConnectionError(error);
    }
  }

  setupEventHandlers() {
    // Handle messages from shared worker
    this.port.onmessage = (event) => {
      const { type, data, value, message, connectionId, totalConnections } =
        event.data;

      // Handle different message types from shared worker
      switch (type) {
        case "connected":
          // Successfully connected to shared worker
          this.connectionId = connectionId;
          this.isConnected = true;
          this.reconnectAttempts = 0;

          console.log(`Connected to shared worker as ${connectionId}`);
          console.log(`Total connections: ${totalConnections}`);
          console.log("Initial shared data:", data);

          // Initialize UI with current state
          this.initializeUI(data);

          // Register this user with the shared worker
          this.setUser(this.userId);
          break;

        case "counter":
          // Counter value updated by another tab
          console.log(`Counter updated to ${value} by ${event.data.updatedBy}`);
          this.updateCounter(value);

          // Visual feedback for updates from other tabs
          if (event.data.updatedBy !== this.connectionId) {
            this.showUpdateNotification("Counter updated by another tab");
          }
          break;

        case "newMessage":
          // New message added by any connected tab
          console.log("New message received:", message);
          this.displayMessage(message);

          // Show notification if message is from another tab
          if (message.connectionId !== this.connectionId) {
            this.showUpdateNotification(`New message from ${message.author}`);
          }
          break;

        case "userUpdate":
          // Active users list updated
          console.log(`User ${event.data.action}: ${event.data.userId}`);
          this.updateActiveUsers(event.data.activeUsers);
          break;

        case "data":
          // Response to getData request
          console.log("Received current shared data:", data);
          this.updateAllUI(data);
          break;

        case "pong":
          // Health check response
          console.log(
            `Health check OK (${Date.now() - event.data.timestamp}ms)`
          );
          break;

        case "error":
          // Error from shared worker
          console.error("Shared worker error:", event.data.error);
          this.handleWorkerError(event.data.error);
          break;

        default:
          console.warn("Unknown message type:", type);
      }
    };

    // Handle connection errors
    this.port.onmessageerror = (event) => {
      console.error("Port message error:", event);
      this.handleConnectionError(event);
    };

    // Start the port communication
    this.port.start();
  }

  // Initialize UI elements with current shared state
  initializeUI(data) {
    this.updateCounter(data.counter);

    // Display existing messages
    data.messages.forEach((message) => {
      this.displayMessage(message);
    });

    // Update active users
    this.updateActiveUsers(Array.from(data.activeUsers));
  }

  // Update entire UI with fresh data
  updateAllUI(data) {
    // Clear existing messages
    const messagesList = document.getElementById("messages");
    if (messagesList) {
      messagesList.innerHTML = "";
    }

    // Reinitialize with fresh data
    this.initializeUI(data);
  }

  // Send increment command to shared worker
  increment() {
    if (!this.isConnected) {
      console.warn("Not connected to shared worker");
      return;
    }

    console.log("Sending increment command");
    this.port.postMessage({ action: "increment" });
  }

  // Send new message to shared worker
  addMessage(messageContent) {
    if (!this.isConnected) {
      console.warn("Not connected to shared worker");
      return;
    }

    if (!messageContent.trim()) {
      console.warn("Cannot send empty message");
      return;
    }

    console.log("Sending new message:", messageContent);
    this.port.postMessage({
      action: "addMessage",
      data: messageContent,
      userId: this.userId,
    });
  }

  // Request current data from shared worker
  getData() {
    if (!this.isConnected) {
      console.warn("Not connected to shared worker");
      return;
    }

    console.log("Requesting current data");
    this.port.postMessage({ action: "getData" });
  }

  // Register user with shared worker
  setUser(userId) {
    this.userId = userId;
    this.port.postMessage({
      action: "setUser",
      data: { userId: userId },
    });
  }

  // Health check
  ping() {
    if (!this.isConnected) {
      console.warn("Not connected to shared worker");
      return;
    }

    this.port.postMessage({ action: "ping" });
  }

  // UI update methods
  updateCounter(value) {
    const counterElement = document.getElementById("counter");
    if (counterElement) {
      counterElement.textContent = value;

      // Add visual feedback for updates
      counterElement.classList.add("updated");
      setTimeout(() => counterElement.classList.remove("updated"), 500);
    }
  }

  displayMessage(message) {
    const messagesList = document.getElementById("messages");
    if (!messagesList) return;

    // Create message element
    const messageElement = document.createElement("div");
    messageElement.className = "message";

    // Style differently if it's from current tab
    if (message.connectionId === this.connectionId) {
      messageElement.classList.add("own-message");
    }

    // Format message content
    messageElement.innerHTML = `
      <div class="message-header">
        <span class="author">${message.author}</span>
        <span class="timestamp">${new Date(
          message.timestamp
        ).toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${message.content}</div>
    `;

    messagesList.appendChild(messageElement);
    messagesList.scrollTop = messagesList.scrollHeight; // Auto-scroll to bottom
  }

  updateActiveUsers(users) {
    const usersElement = document.getElementById("active-users");
    if (usersElement) {
      usersElement.innerHTML = `Active users: ${users.join(", ")}`;
    }
  }

  showUpdateNotification(message) {
    // Simple notification system
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  // Error handling and reconnection
  handleConnectionError(error) {
    console.error("Connection error:", error);
    this.isConnected = false;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(
        `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.initializeWorker();
      }, delay);
    } else {
      console.error(
        "Max reconnection attempts reached. Please refresh the page."
      );
      this.showUpdateNotification("Connection lost. Please refresh the page.");
    }
  }

  handleWorkerError(error) {
    console.error("Worker error:", error);
    this.showUpdateNotification("Worker error occurred");
  }

  // Clean disconnect
  disconnect() {
    if (this.port) {
      this.port.close();
    }
    this.isConnected = false;
    console.log("Disconnected from shared worker");
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      connectionId: this.connectionId,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Example usage and initialization
/*
// Create client instance with optional user ID
const sharedClient = new SharedWorkerClient('user123');

// Set up UI event handlers
document.getElementById('increment-btn').addEventListener('click', () => {
  sharedClient.increment();
});

document.getElementById('send-message-btn').addEventListener('click', () => {
  const input = document.getElementById('message-input');
  if (input.value.trim()) {
    sharedClient.addMessage(input.value);
    input.value = '';
  }
});

// Refresh data button
document.getElementById('refresh-btn').addEventListener('click', () => {
  sharedClient.getData();
});

// Health check button
document.getElementById('ping-btn').addEventListener('click', () => {
  sharedClient.ping();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  sharedClient.disconnect();
});
*/
```

## Under the Hood: Threading Model

### Browser Threading Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser Process                      │
├─────────────────────────────────────────────────────────┤
│  Main Thread              │      Worker Threads         │
│  ├─── DOM Manipulation    │      ├─── Worker 1          │
│  ├─── Event Handling      │      ├─── Worker 2          │
│  ├─── JavaScript Engine   │      ├─── Worker N          │
│  └─── Rendering Pipeline  │      └─── Shared Workers    │
├─────────────────────────────────────────────────────────┤
│              Message Passing Layer                      │
│              (Structured Clone Algorithm)               │
└─────────────────────────────────────────────────────────┘
```

### Worker Global Scope

Workers run in a different global context than the main thread:

```javascript
// In worker context - these are available
console.log(self); // WorkerGlobalScope
console.log(location); // WorkerLocation
console.log(navigator); // WorkerNavigator

// These are NOT available in workers
// console.log(window); // undefined
// console.log(document); // undefined
// console.log(parent); // undefined

// Worker-specific APIs available
importScripts("https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js");

// Network requests are available
fetch("/api/data")
  .then((response) => response.json())
  .then((data) => {
    self.postMessage({ type: "dataLoaded", data });
  });

// IndexedDB is available for storage
const request = indexedDB.open("WorkerDB", 1);
request.onsuccess = (event) => {
  const db = event.target.result;
  // Use IndexedDB in worker
};
```

## Message Passing and Data Transfer

### Structured Clone Algorithm

The structured clone algorithm is the browser's mechanism for safely transferring data between different execution contexts (like main thread to worker). Understanding what can and cannot be transferred is crucial for effective worker communication.

**How it works:**

- Creates a deep copy of the data structure
- Maintains object references and circular dependencies
- Preserves most built-in JavaScript types
- Throws errors for non-cloneable data types
- More robust than JSON.stringify/parse for complex objects

**Performance considerations:**

- Cloning large objects can be expensive
- Complex nested structures take longer to clone
- Use transferable objects for large binary data
- Consider sending only necessary data to minimize clone overhead

**Input:** Any cloneable JavaScript value  
**Output:** Deep copy of the input in the target context  
**Limitations:** Cannot clone functions, DOM elements, or other non-serializable objects

```javascript
// Comprehensive example of data types and their cloning behavior
const transferableData = {
  // ✅ Primitive types - these clone perfectly
  string: "Hello World",
  number: 42,
  bigint: 123n, // BigInt support varies by browser
  boolean: true,
  null: null,
  undefined: undefined,

  // ✅ Basic objects and arrays
  object: {
    key: "value",
    nested: {
      data: true,
      deepNesting: {
        level3: "works fine",
      },
    },
  },
  array: [1, 2, 3, { nested: "array" }],
  mixedArray: ["string", 42, true, { object: "in array" }],

  // ✅ Date objects
  date: new Date(),
  specificDate: new Date("2023-01-01"),

  // ✅ Regular expressions
  regexp: /pattern/gi,
  complexRegexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // ✅ Binary data types
  arrayBuffer: new ArrayBuffer(8),
  int8Array: new Int8Array([1, 2, 3, 4]),
  uint8Array: new Uint8Array([1, 2, 3, 4]),
  uint8ClampedArray: new Uint8ClampedArray([255, 0, 128]),
  int16Array: new Int16Array([1000, 2000]),
  uint16Array: new Uint16Array([1000, 2000]),
  int32Array: new Int32Array([100000, 200000]),
  uint32Array: new Uint32Array([100000, 200000]),
  float32Array: new Float32Array([1.5, 2.7, 3.14]),
  float64Array: new Float64Array([1.5, 2.7, 3.14159265359]),

  // ✅ Complex built-in objects
  map: new Map([
    ["key1", "value1"],
    ["key2", { nested: "object" }],
    [42, "number key"],
  ]),
  set: new Set([1, 2, 3, "string", { object: "in set" }]),

  // ✅ Error objects (with limitations)
  error: new Error("This error can be cloned"),
  typeError: new TypeError("Type errors work too"),

  // ✅ Circular references are handled correctly
  // Note: We'll create this below to avoid issues in static definition
};

// Add circular reference example
transferableData.circular = { reference: transferableData };

// Examples of data that CANNOT be transferred (will cause DataCloneError)
const nonTransferableData = {
  // ❌ Functions of any kind
  // regularFunction: function() { return "hello"; },
  // arrowFunction: () => "hello",
  // asyncFunction: async () => "hello",
  // generatorFunction: function*() { yield 1; },
  // ❌ DOM elements and nodes
  // domElement: document.createElement('div'),
  // textNode: document.createTextNode('text'),
  // documentFragment: document.createDocumentFragment(),
  // ❌ Symbols
  // symbol: Symbol('test'),
  // symbolFor: Symbol.for('global'),
  // ❌ Window and other global objects
  // windowObject: window,
  // documentObject: document,
  // ❌ Objects with non-cloneable properties
  // objectWithFunction: {
  //   data: "this is fine",
  //   method: function() { return "this breaks cloning"; }
  // },
  // ❌ Promises and other async objects
  // promise: Promise.resolve("value"),
  // proxy: new Proxy({}, {}),
  // ❌ WeakMap and WeakSet
  // weakMap: new WeakMap(),
  // weakSet: new WeakSet()
};

// Safe worker communication with error handling
function sendToWorker(worker, data) {
  try {
    // Attempt to send data - this will throw if data is not cloneable
    worker.postMessage(data);
    console.log("Data sent successfully:", data);
  } catch (error) {
    if (error.name === "DataCloneError") {
      console.error("Data cloning failed:", error.message);
      console.error("The data contains non-cloneable objects");

      // Try to send a sanitized version
      const sanitizedData = sanitizeForCloning(data);
      worker.postMessage(sanitizedData);
    } else {
      console.error("Unexpected error:", error);
    }
  }
}

// Helper function to sanitize data for cloning
function sanitizeForCloning(data) {
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      // Handle functions
      if (typeof value === "function") {
        return `[Function: ${value.name || "anonymous"}]`;
      }

      // Handle symbols
      if (typeof value === "symbol") {
        return `[Symbol: ${value.toString()}]`;
      }

      // Handle DOM elements
      if (value instanceof Element) {
        return `[Element: ${value.tagName}]`;
      }

      // Handle other non-cloneable types
      if (value instanceof Promise) {
        return "[Promise]";
      }

      if (value instanceof WeakMap || value instanceof WeakSet) {
        return `[${value.constructor.name}]`;
      }

      return value;
    })
  );
}

// Example usage
const worker = new Worker("worker.js");

// This will work fine
sendToWorker(worker, transferableData);

// This would normally fail, but our helper handles it
// sendToWorker(worker, nonTransferableData);

// Performance testing for large data structures
function testCloningPerformance() {
  const largeArray = new Array(100000).fill(0).map((_, i) => ({
    id: i,
    data: `Item ${i}`,
    nested: {
      value: Math.random(),
      timestamp: Date.now(),
    },
  }));

  console.time("Large data cloning");

  try {
    worker.postMessage({
      type: "performance-test",
      data: largeArray,
    });
    console.timeEnd("Large data cloning");
  } catch (error) {
    console.timeEnd("Large data cloning");
    console.error("Cloning failed:", error);
  }
}

// Run performance test
// testCloningPerformance();
```

### Transferable Objects for Performance

Transferable objects provide a zero-copy mechanism for moving large binary data between threads. Instead of cloning the data (which can be expensive), ownership is transferred from one context to another. This is crucial for performance when dealing with large datasets like images, audio, or video data.

**Key benefits:**

- Zero-copy transfer for maximum performance
- Ideal for large binary data (ArrayBuffers, ImageData, etc.)
- Reduces memory usage by avoiding duplication
- Essential for real-time applications with large data flows

**Important considerations:**

- Original object becomes "neutered" (unusable) after transfer
- Only specific object types can be transferred
- Transfer is one-way - data cannot be easily sent back
- Planning data flow is crucial in transferable object architecture

**Transferable object types:**

- ArrayBuffer and its views (Uint8Array, Float32Array, etc.)
- MessagePort objects
- ImageData objects
- OffscreenCanvas (in supported browsers)

**Input:** ArrayBuffer or other transferable objects  
**Output:** Zero-copy transfer with original object neutered  
**Performance:** Dramatically faster than cloning for large data

```javascript
// Comprehensive example of transferable objects usage

// Example 1: Basic ArrayBuffer transfer
function demonstrateBasicTransfer() {
  console.log("=== Basic ArrayBuffer Transfer ===");

  // Create a large buffer (1MB) in main thread
  const largeBuffer = new ArrayBuffer(1024 * 1024); // 1MB
  const uint8View = new Uint8Array(largeBuffer);

  // Fill buffer with some pattern data
  console.log("Filling buffer with data...");
  for (let i = 0; i < uint8View.length; i++) {
    uint8View[i] = i % 256; // Create a repeating pattern
  }

  console.log(`Buffer created: ${largeBuffer.byteLength} bytes`);
  console.log(`First few values: ${uint8View.slice(0, 10)}`);

  // Transfer ownership to worker (zero-copy operation)
  console.log("Transferring buffer to worker...");
  worker.postMessage(
    {
      command: "processLargeData",
      buffer: largeBuffer,
      metadata: {
        originalSize: largeBuffer.byteLength,
        pattern: "incremental",
        timestamp: Date.now(),
      },
    },
    [largeBuffer] // Transferable objects list - this is the key!
  );

  // Note: largeBuffer is now neutered and unusable in main thread
  console.log(`Buffer after transfer: ${largeBuffer.byteLength} bytes`); // 0
  console.log("Buffer has been neutered - ownership transferred to worker");

  // Attempting to use the buffer will now fail
  try {
    const failedView = new Uint8Array(largeBuffer);
    console.log("This won't execute");
  } catch (error) {
    console.log("Expected error - buffer is neutered:", error.message);
  }
}

// Example 2: Multiple buffer transfer
function transferMultipleBuffers() {
  console.log("\n=== Multiple Buffer Transfer ===");

  // Create multiple buffers for different data types
  const imageData = new ArrayBuffer(1920 * 1080 * 4); // RGBA image data
  const audioData = new ArrayBuffer(44100 * 2 * 4); // 1 second of stereo audio
  const metaData = new ArrayBuffer(1024); // Small metadata buffer

  // Fill with different patterns
  new Uint8Array(imageData).fill(128); // Gray image
  new Int16Array(audioData).fill(0); // Silent audio
  new Uint8Array(metaData).fill(255); // Metadata

  console.log(`Transferring:
    - Image data: ${imageData.byteLength} bytes
    - Audio data: ${audioData.byteLength} bytes  
    - Meta data: ${metaData.byteLength} bytes
    - Total: ${
      (imageData.byteLength + audioData.byteLength + metaData.byteLength) /
      1024 /
      1024
    } MB`);

  // Transfer all buffers at once
  worker.postMessage(
    {
      command: "processMultipleBuffers",
      buffers: {
        image: imageData,
        audio: audioData,
        meta: metaData,
      },
      info: {
        imageFormat: "RGBA",
        audioFormat: "16-bit stereo",
        sampleRate: 44100,
      },
    },
    [imageData, audioData, metaData]
  ); // All buffers in transferable list

  // All buffers are now neutered
  console.log("All buffers transferred and neutered");
}

// Example 3: TypedArray transfer (transfers underlying ArrayBuffer)
function transferTypedArrays() {
  console.log("\n=== TypedArray Transfer ===");

  // Create different typed arrays
  const floatData = new Float32Array(100000);
  const intData = new Int32Array(50000);

  // Fill with computed values
  for (let i = 0; i < floatData.length; i++) {
    floatData[i] = Math.sin(i * 0.01); // Sine wave
  }

  for (let i = 0; i < intData.length; i++) {
    intData[i] = i * i; // Square numbers
  }

  console.log(
    `Float data: ${floatData.length} elements (${floatData.buffer.byteLength} bytes)`
  );
  console.log(
    `Int data: ${intData.length} elements (${intData.buffer.byteLength} bytes)`
  );

  // Transfer the underlying ArrayBuffers
  worker.postMessage(
    {
      command: "processTypedArrays",
      data: {
        floats: floatData,
        integers: intData,
      },
      info: {
        floatType: "Float32Array",
        intType: "Int32Array",
      },
    },
    [floatData.buffer, intData.buffer]
  ); // Transfer underlying buffers

  // TypedArrays are now unusable (their buffers were transferred)
  console.log(
    `Float buffer after transfer: ${floatData.buffer.byteLength} bytes`
  ); // 0
  console.log(`Int buffer after transfer: ${intData.buffer.byteLength} bytes`); // 0
}

// Example 4: Error handling for non-transferable objects
function demonstrateTransferErrors() {
  console.log("\n=== Transfer Error Handling ===");

  const validBuffer = new ArrayBuffer(1024);
  const invalidObject = { data: "this cannot be transferred" };

  try {
    // This will fail because regular objects are not transferable
    worker.postMessage(
      {
        command: "test",
        data: invalidObject,
      },
      [invalidObject]
    ); // This will throw an error
  } catch (error) {
    console.error("Expected error for non-transferable object:", error.message);
  }

  try {
    // This will work
    worker.postMessage(
      {
        command: "test",
        data: validBuffer,
      },
      [validBuffer]
    );

    console.log("Valid buffer transferred successfully");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Example 5: Performance comparison
function compareTransferMethods() {
  console.log("\n=== Performance Comparison ===");

  const dataSize = 10 * 1024 * 1024; // 10MB
  const testData = new ArrayBuffer(dataSize);
  new Uint8Array(testData).fill(42);

  // Test 1: Regular cloning (will clone the data)
  console.time("Regular cloning");
  worker.postMessage({
    command: "performanceTest",
    method: "clone",
    data: testData.slice(), // Create a copy to avoid neutering original
  });
  console.timeEnd("Regular cloning");

  // Test 2: Transferable object (zero-copy)
  console.time("Transferable object");
  worker.postMessage(
    {
      command: "performanceTest",
      method: "transfer",
      data: testData, // This will be transferred
    },
    [testData]
  );
  console.timeEnd("Transferable object");

  console.log(
    "Note: Transferable objects are significantly faster for large data"
  );
}

// Example 6: Practical image processing setup
function setupImageProcessingTransfer() {
  console.log("\n=== Image Processing Setup ===");

  // Simulate getting ImageData from a canvas
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  // Fill with gradient for testing
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, "blue");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  console.log(
    `Image data: ${imageData.width}x${imageData.height}, ${imageData.data.byteLength} bytes`
  );

  // Transfer ImageData to worker for processing
  worker.postMessage(
    {
      command: "processImage",
      imageData: imageData,
      operations: ["grayscale", "blur"],
      settings: {
        blurRadius: 2,
        preserveAlpha: true,
      },
    },
    [imageData.data.buffer]
  ); // Transfer the underlying buffer

  console.log("Image data transferred to worker for processing");
}

// Example usage - uncomment to run individual examples
const worker = new Worker("processing-worker.js");

// demonstrateBasicTransfer();
// transferMultipleBuffers();
// transferTypedArrays();
// demonstrateTransferErrors();
// compareTransferMethods();
// setupImageProcessingTransfer();

// Utility function to check if an object is transferable
function isTransferable(obj) {
  const transferableTypes = [
    "ArrayBuffer",
    "MessagePort",
    "ImageData",
    "OffscreenCanvas",
  ];

  return transferableTypes.some((type) => {
    try {
      return obj instanceof globalThis[type];
    } catch {
      return false;
    }
  });
}

// Helper to safely transfer objects
function safeTransfer(worker, data, transferables = []) {
  // Validate transferable objects
  const validTransferables = transferables.filter((obj) => {
    if (isTransferable(obj)) {
      return true;
    } else {
      console.warn("Non-transferable object found:", obj);
      return false;
    }
  });

  try {
    worker.postMessage(data, validTransferables);
    console.log(
      `Transferred ${validTransferables.length} objects successfully`
    );
  } catch (error) {
    console.error("Transfer failed:", error);
    // Fallback to regular cloning
    worker.postMessage(data);
  }
}
```

### Advanced Message Handler

```javascript
class WorkerMessageHandler {
  constructor(worker) {
    this.worker = worker;
    this.messageQueue = [];
    this.isProcessing = false;
    this.responseTimeout = 30000; // 30 seconds
    this.setupMessageHandling();
  }

  setupMessageHandling() {
    this.worker.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  async sendMessage(message, transferable = []) {
    return new Promise((resolve, reject) => {
      const messageId = this.generateMessageId();
      const timeoutId = setTimeout(() => {
        reject(new Error("Message timeout"));
      }, this.responseTimeout);

      const messageData = {
        id: messageId,
        payload: message,
        timestamp: Date.now(),
        resolve: (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
      };

      this.messageQueue.push(messageData);

      this.worker.postMessage(
        {
          id: messageId,
          payload: message,
          timestamp: Date.now(),
        },
        transferable
      );
    });
  }

  handleMessage(data) {
    const { id, result, error } = data;
    const message = this.messageQueue.find((msg) => msg.id === id);

    if (message) {
      this.messageQueue = this.messageQueue.filter((msg) => msg.id !== id);

      if (error) {
        message.reject(new Error(error));
      } else {
        message.resolve(result);
      }
    }
  }

  generateMessageId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueueLength() {
    return this.messageQueue.length;
  }
}
```

## Worker Lifecycle Management

### Worker Pool Implementation

```javascript
class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.activeTasksCount = 0;

    this.initializePool();
  }

  initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      const workerWrapper = {
        id: i,
        worker: worker,
        busy: false,
        currentTask: null,
      };

      worker.onmessage = (event) => {
        this.handleWorkerMessage(workerWrapper, event);
      };

      worker.onerror = (error) => {
        this.handleWorkerError(workerWrapper, error);
      };

      this.workers.push(workerWrapper);
      this.availableWorkers.push(workerWrapper);
    }
  }

  async execute(task, transferable = []) {
    return new Promise((resolve, reject) => {
      const taskData = {
        id: this.generateTaskId(),
        task,
        transferable,
        resolve,
        reject,
        createdAt: Date.now(),
      };

      if (this.availableWorkers.length > 0) {
        this.assignTaskToWorker(taskData);
      } else {
        this.taskQueue.push(taskData);
      }
    });
  }

  assignTaskToWorker(taskData) {
    const workerWrapper = this.availableWorkers.shift();
    workerWrapper.busy = true;
    workerWrapper.currentTask = taskData;
    this.activeTasksCount++;

    workerWrapper.worker.postMessage(
      {
        taskId: taskData.id,
        ...taskData.task,
      },
      taskData.transferable
    );
  }

  handleWorkerMessage(workerWrapper, event) {
    const { taskId, result, error } = event.data;
    const task = workerWrapper.currentTask;

    if (task && task.id === taskId) {
      workerWrapper.busy = false;
      workerWrapper.currentTask = null;
      this.activeTasksCount--;
      this.availableWorkers.push(workerWrapper);

      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }

      // Process next task in queue
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift();
        this.assignTaskToWorker(nextTask);
      }
    }
  }

  handleWorkerError(workerWrapper, error) {
    console.error(`Worker ${workerWrapper.id} error:`, error);

    if (workerWrapper.currentTask) {
      workerWrapper.currentTask.reject(error);
    }

    // Restart the worker
    this.restartWorker(workerWrapper);
  }

  restartWorker(workerWrapper) {
    workerWrapper.worker.terminate();

    const newWorker = new Worker(this.workerScript);
    workerWrapper.worker = newWorker;
    workerWrapper.busy = false;
    workerWrapper.currentTask = null;

    newWorker.onmessage = (event) => {
      this.handleWorkerMessage(workerWrapper, event);
    };

    newWorker.onerror = (error) => {
      this.handleWorkerError(workerWrapper, error);
    };
  }

  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getStats() {
    return {
      poolSize: this.poolSize,
      activeWorkers: this.workers.filter((w) => w.busy).length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      activeTasks: this.activeTasksCount,
    };
  }

  terminate() {
    this.workers.forEach((workerWrapper) => {
      workerWrapper.worker.terminate();
    });

    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }
}
```

## Performance Optimization

### Fibonacci Calculation Example

```javascript
// Optimized worker for mathematical calculations
// fibonacci-worker.js
const fibonacciCache = new Map();

self.onmessage = function (event) {
  const { taskId, command, data } = event.data;

  try {
    let result;

    switch (command) {
      case "fibonacci":
        result = calculateFibonacci(data.n);
        break;
      case "fibonacciSequence":
        result = calculateFibonacciSequence(data.start, data.end);
        break;
      case "clearCache":
        fibonacciCache.clear();
        result = "Cache cleared";
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    self.postMessage({ taskId, result });
  } catch (error) {
    self.postMessage({ taskId, error: error.message });
  }
};

function calculateFibonacci(n) {
  if (n < 0) throw new Error("Negative numbers not supported");
  if (n <= 1) return n;

  if (fibonacciCache.has(n)) {
    return fibonacciCache.get(n);
  }

  let a = 0,
    b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }

  fibonacciCache.set(n, b);
  return b;
}

function calculateFibonacciSequence(start, end) {
  const sequence = [];
  for (let i = start; i <= end; i++) {
    sequence.push(calculateFibonacci(i));
  }
  return sequence;
}
```

### Usage with Performance Monitoring

```javascript
class FibonacciCalculator {
  constructor() {
    this.workerPool = new WorkerPool("fibonacci-worker.js", 2);
  }

  async calculateFibonacci(n) {
    const startTime = performance.now();

    try {
      const result = await this.workerPool.execute({
        command: "fibonacci",
        data: { n },
      });

      const endTime = performance.now();
      console.log(
        `Fibonacci(${n}) = ${result} (took ${endTime - startTime}ms)`
      );

      return result;
    } catch (error) {
      console.error("Fibonacci calculation failed:", error);
      throw error;
    }
  }

  async calculateSequence(start, end) {
    const startTime = performance.now();

    try {
      const result = await this.workerPool.execute({
        command: "fibonacciSequence",
        data: { start, end },
      });

      const endTime = performance.now();
      console.log(
        `Fibonacci sequence [${start}-${end}] calculated in ${
          endTime - startTime
        }ms`
      );

      return result;
    } catch (error) {
      console.error("Fibonacci sequence calculation failed:", error);
      throw error;
    }
  }
}

// Usage
const calculator = new FibonacciCalculator();

// Calculate individual Fibonacci numbers
calculator.calculateFibonacci(40).then(console.log);

// Calculate sequence
calculator.calculateSequence(10, 20).then(console.log);
```

## Real-World Implementation Examples

### Image Processing Worker

```javascript
// image-processor-worker.js
self.onmessage = function (event) {
  const { taskId, command, imageData, options } = event.data;

  try {
    let result;

    switch (command) {
      case "grayscale":
        result = applyGrayscale(imageData);
        break;
      case "blur":
        result = applyBlur(imageData, options.radius || 1);
        break;
      case "brightness":
        result = adjustBrightness(imageData, options.factor || 1);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    self.postMessage({ taskId, result }, [result.data.buffer]);
  } catch (error) {
    self.postMessage({ taskId, error: error.message });
  }
};

function applyGrayscale(imageData) {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray; // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // Alpha channel (data[i + 3]) remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}

function applyBlur(imageData, radius) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  const output = new Uint8ClampedArray(data.length);

  // Simple box blur implementation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        count = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }
      }

      const idx = (y * width + x) * 4;
      output[idx] = r / count;
      output[idx + 1] = g / count;
      output[idx + 2] = b / count;
      output[idx + 3] = a / count;
    }
  }

  return new ImageData(output, width, height);
}

function adjustBrightness(imageData, factor) {
  const data = new Uint8ClampedArray(imageData.data);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor); // Red
    data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
    data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
    // Alpha channel remains unchanged
  }

  return new ImageData(data, imageData.width, imageData.height);
}
```

## Error Handling and Debugging

### Comprehensive Error Handling

```javascript
class RobustWorkerManager {
  constructor(workerScript) {
    this.workerScript = workerScript;
    this.worker = null;
    this.isTerminated = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000;

    this.initializeWorker();
  }

  initializeWorker() {
    try {
      this.worker = new Worker(this.workerScript);
      this.setupEventHandlers();
      this.retryCount = 0;
    } catch (error) {
      console.error("Failed to create worker:", error);
      this.handleWorkerCreationError(error);
    }
  }

  setupEventHandlers() {
    this.worker.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.worker.onerror = (error) => {
      console.error("Worker runtime error:", error);
      this.handleWorkerError(error);
    };

    this.worker.onmessageerror = (event) => {
      console.error("Worker message error:", event);
      this.handleMessageError(event);
    };
  }

  handleWorkerCreationError(error) {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(
        `Retrying worker creation (${this.retryCount}/${this.maxRetries})`
      );

      setTimeout(() => {
        this.initializeWorker();
      }, this.retryDelay * this.retryCount);
    } else {
      console.error("Max retries reached. Worker creation failed permanently.");
    }
  }

  handleWorkerError(error) {
    console.error("Worker error occurred:", {
      message: error.message,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
    });

    // Attempt to restart worker
    this.restartWorker();
  }

  handleMessageError(event) {
    console.error("Message serialization error:", event);
    // Handle cases where message couldn't be cloned
  }

  restartWorker() {
    if (!this.isTerminated && this.retryCount < this.maxRetries) {
      console.log("Restarting worker...");
      this.terminate();
      this.initializeWorker();
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isTerminated = true;
  }
}
```

## Best Practices and Limitations

### Best Practices

```javascript
// ✅ Good: Minimize data transfer
class EfficientWorkerManager {
  constructor() {
    this.worker = new Worker("worker.js");
    this.cache = new Map();
  }

  async processLargeDataset(data) {
    // Send only necessary data
    const essentialData = data.map((item) => ({
      id: item.id,
      value: item.computeValue,
    }));

    return await this.sendMessage({
      command: "process",
      data: essentialData,
    });
  }

  // ✅ Good: Reuse workers
  async batchProcess(tasks) {
    const results = [];

    for (const task of tasks) {
      results.push(await this.processTask(task));
    }

    return results;
  }
}

// ❌ Bad: Creating new workers for each task
class InefficientWorkerManager {
  async processTask(data) {
    const worker = new Worker("worker.js"); // Don't do this

    return new Promise((resolve) => {
      worker.postMessage(data);
      worker.onmessage = (event) => {
        resolve(event.data);
        worker.terminate(); // Wasteful
      };
    });
  }
}
```

### Limitations and Considerations

```javascript
// Worker limitations demonstration
// worker-limitations.js

// ❌ These will cause errors in workers:
try {
  // DOM access not allowed
  document.getElementById("test");
} catch (error) {
  console.error("DOM access failed:", error.message);
}

try {
  // Window object not available
  window.alert("Hello");
} catch (error) {
  console.error("Window access failed:", error.message);
}

try {
  // Parent object not available
  parent.postMessage("test");
} catch (error) {
  console.error("Parent access failed:", error.message);
}

// ✅ These work in workers:
console.log("Console works");
setTimeout(() => console.log("Timers work"), 1000);
fetch("/api/data").then((response) => console.log("Fetch works"));

// Import external scripts
importScripts("/lib/utility.js");

// Use Web APIs available to workers
const db = indexedDB.open("WorkerDB");
const cache = caches.open("worker-cache");
```

## Conclusion

Web Workers provide a powerful mechanism for achieving true parallelism in web applications, enabling developers to perform intensive computations without blocking the main thread. By understanding their threading model, message passing mechanisms, and best practices, developers can create responsive applications that effectively utilize modern multi-core processors.

### Key Takeaways

1. **Threading Model**: Web Workers run in isolated contexts with their own global scope, providing true parallel execution.

2. **Message Passing**: The structured clone algorithm enables efficient data transfer, while transferable objects provide zero-copy transfers for large data.

3. **Worker Types**: Dedicated workers serve single scripts, while shared workers enable cross-context communication.

4. **Performance**: Proper worker pool management and data transfer optimization are crucial for performance.

5. **Limitations**: Workers cannot access DOM or window objects, requiring careful architecture planning.

### When to Use Web Workers

- CPU-intensive calculations that would block the UI
- Data processing tasks that can run independently
- Background data synchronization
- Image/video processing
- Cryptographic operations

Web Workers represent a fundamental shift toward multi-threaded web applications, enabling developers to build more responsive and capable web experiences. As outlined in the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), proper implementation of Web Workers can significantly improve application performance and user experience.

### Further Resources

- [MDN Web Workers API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [HTML Living Standard - Web Workers](https://html.spec.whatwg.org/multipage/workers.html)
- [Can I Use - Web Workers](https://caniuse.com/webworkers)
- [Worker Playground - Test Worker APIs](https://worker-playground.glitch.me/)
