# Dexie.js and IndexedDB: Under the Hood

## Table of Contents

- [Introduction](#introduction)
- [IndexedDB Fundamentals](#indexeddb-fundamentals)
- [How IndexedDB Works Under the Hood](#how-indexeddb-works-under-the-hood)
- [Browser Storage Architecture](#browser-storage-architecture)
- [Storage Limits and Quota Management](#storage-limits-and-quota-management)
- [Native IndexedDB API Deep Dive](#native-indexeddb-api-deep-dive)
- [Dexie.js: The Wrapper Library](#dexiejs-the-wrapper-library)
- [How Dexie Wraps IndexedDB](#how-dexie-wraps-indexeddb)
- [Dexie Source Code Analysis](#dexie-source-code-analysis)
- [Performance Considerations](#performance-considerations)
- [Advanced Features and Patterns](#advanced-features-and-patterns)
- [Real-World Implementation Examples](#real-world-implementation-examples)
- [Debugging and Development Tools](#debugging-and-development-tools)
- [Best Practices and Gotchas](#best-practices-and-gotchas)
- [Conclusion](#conclusion)

## Introduction

IndexedDB is the cornerstone of client-side storage in modern web browsers, providing a robust, transactional database system that can handle large amounts of structured data. While powerful, its native API can be complex and verbose. Dexie.js emerges as a sophisticated wrapper that simplifies IndexedDB interactions while preserving its full capabilities.

This comprehensive guide explores both technologies from the ground up, examining their internal mechanisms, architectural decisions, and practical implementations.

## IndexedDB Fundamentals

### What is IndexedDB?

IndexedDB is a low-level web API for client-side storage of significant amounts of structured data. Unlike simple key-value stores like localStorage, IndexedDB is a full-featured database system that supports:

- **Object-oriented storage**: Stores JavaScript objects directly
- **Indexing**: Enables efficient queries on object properties
- **Transactions**: Ensures data integrity through ACID properties
- **Asynchronous operations**: Non-blocking database operations
- **Large storage capacity**: Much larger limits than localStorage

### Core Concepts

#### Database Hierarchy

```
Database
└── Object Stores (like tables)
    ├── Records (key-value pairs)
    └── Indexes (for efficient querying)
```

#### Data Storage Model

IndexedDB can store complex JavaScript objects directly, unlike traditional databases that require serialization. This example demonstrates the various data types and structures that IndexedDB natively supports.

**What this code demonstrates:**

- Primary key definition (id field)
- Indexed properties for efficient querying
- Nested object storage capabilities
- Complex data type support (Date objects, Blobs)
- Unique constraints on indexed fields

**Input:** JavaScript object with mixed data types
**Output:** Stored record that maintains data types and structure
**Use case:** User profile storage with preferences and binary avatar data

```javascript
// Example object structure in IndexedDB
// This object shows all the data types IndexedDB can handle natively
const userRecord = {
  id: 1, // Primary key - used for direct record access
  name: "John Doe", // Indexed property - allows fast searching by name
  email: "john@example.com", // Unique indexed property - ensures no duplicates
  preferences: {
    // Nested object (fully supported) - no need to serialize/deserialize
    theme: "dark",
    notifications: true,
  },
  lastLogin: new Date(), // Complex data types supported - Date objects preserved
  avatar: blob, // Binary data supported - images, files, etc.
  tags: ["developer", "manager"], // Arrays are fully supported
  metadata: new Map([["role", "admin"]]), // Even Map objects can be stored
};
```

## How IndexedDB Works Under the Hood

### Browser Implementation Architecture

IndexedDB is implemented differently across browser engines, but they share common architectural patterns:

#### Chromium/Blink (Chrome, Edge)

- **Storage Engine**: LevelDB (Google's key-value store)
- **File Location**: `{Profile}/IndexedDB/`
- **Internal Format**: Binary format with metadata
- **Transaction Isolation**: Snapshot isolation

#### Firefox/Gecko

- **Storage Engine**: SQLite with custom schema
- **File Location**: `{Profile}/storage/default/{origin}/idb/`
- **Internal Format**: SQLite database files
- **Transaction Isolation**: Read committed with locks

#### Safari/WebKit

- **Storage Engine**: SQLite-based implementation
- **File Location**: `~/Library/Safari/Databases/`
- **Internal Format**: SQLite with IndexedDB-specific schema

### Data Storage Mechanisms

#### B+ Tree Indexing

IndexedDB implementations typically use B+ tree structures for indexing:

```
B+ Tree Example for User Index by Age:
                [25, 50]
               /    |    \
        [18,21,24] [30,35,40] [55,60,65]
         |  |  |    |  |  |     |  |  |
       data data data ...    data data data
```

#### Transaction Processing

IndexedDB transactions are the foundation of data integrity. Understanding the transaction lifecycle helps you write reliable database operations and avoid common pitfalls like inactive transaction errors.

**What this code demonstrates:**

- Complete transaction lifecycle from creation to completion
- Operation queueing vs. immediate execution
- Atomic commit/rollback behavior
- Event-driven transaction state management

**Transaction Phases:**

1. **Creation** - Browser allocates transaction context and locks
2. **Queueing** - Operations are queued but not executed yet
3. **Execution** - Browser processes all queued operations atomically
4. **Completion** - Transaction either commits all changes or rolls back completely

**Input:** Database reference and store names
**Output:** Transaction object with event handlers
**Use case:** Ensuring data consistency across multiple operations

```javascript
// Transaction lifecycle in IndexedDB
// This example shows how transactions work behind the scenes
const transaction = db.transaction(["users"], "readwrite");

// Phase 1: Transaction creation
// - Browser allocates transaction context
// - Acquires necessary locks on object stores
// - Sets up internal state tracking

// Phase 2: Operation queueing
// These operations are NOT executed immediately - they're queued
transaction.objectStore("users").add(userData); // Queued: add operation
transaction.objectStore("users").get(1); // Queued: get operation

// Phase 3: Execution phase happens automatically
// Browser processes all queued operations in order
// If any operation fails, entire transaction rolls back

// Phase 4: Commit/Rollback phase
// All operations succeed = commit, any failure = rollback
transaction.oncomplete = () => {
  console.log("Transaction committed - all operations succeeded");
  // All changes are now permanent
};

transaction.onerror = (event) => {
  console.log("Transaction rolled back - error:", event.target.error);
  // No changes were made to the database
};

transaction.onabort = () => {
  console.log("Transaction aborted - manually cancelled");
  // Can be triggered by calling transaction.abort()
};
```

### Memory Management

#### Page-based Storage

IndexedDB stores data in pages (typically 4KB or 8KB), similar to traditional databases:

```
Page Structure:
[Header][Record1][Record2][...][FreeSpace][PageFooter]
```

#### Cache Management

Browsers implement sophisticated caching strategies:

- **Buffer Pool**: In-memory cache of frequently accessed pages
- **Write-Ahead Logging**: Ensures durability before commit
- **Checkpoint Processing**: Periodic flushing of dirty pages to disk

## Browser Storage Architecture

### Storage Partitioning

Modern browsers implement storage partitioning to enhance security and performance:

```javascript
// Storage is partitioned by origin
const origin1 = "https://example.com"; // Separate storage
const origin2 = "https://subdomain.example.com"; // Separate storage
const origin3 = "http://example.com"; // Separate storage (different protocol)
```

### Persistence Models

#### Temporary Storage

```javascript
// Default behavior - subject to browser eviction
navigator.storage.estimate().then((estimate) => {
  console.log("Available:", estimate.quota);
  console.log("Used:", estimate.usage);
});
```

#### Persistent Storage

```javascript
// Request persistent storage (won't be evicted)
navigator.storage.persist().then((persistent) => {
  if (persistent) {
    console.log("Storage will persist across browser sessions");
  } else {
    console.log("Storage may be evicted by the browser");
  }
});
```

## Storage Limits and Quota Management

### Browser-Specific Limits

#### Chrome/Chromium

- **Default Quota**: 60% of available disk space (shared across all origins)
- **Per-Origin Limit**: 20% of total quota
- **Minimum Guarantee**: 1GB if available
- **Eviction Policy**: LRU (Least Recently Used)

#### Firefox

- **Default Quota**: 50% of available disk space
- **Per-Origin Limit**: 2GB initially, can grow
- **Group Limit**: 20% of global quota per origin group
- **Eviction Policy**: LRU with usage-based weighting

#### Safari

- **Default Quota**: More conservative, around 1GB
- **Per-Origin Limit**: Varies, typically 1GB
- **User Prompts**: May prompt user for additional storage
- **Eviction Policy**: Strict LRU

### Quota API Usage

Modern browsers provide a Storage API to help applications monitor and manage their storage usage. This is crucial for production applications that store significant amounts of data and need to handle storage limits gracefully.

**What this code demonstrates:**

- How to check current storage usage and available quota
- Converting bytes to human-readable megabytes
- Implementing proactive storage monitoring
- Handling quota exceeded errors gracefully

**Storage Monitoring Steps:**

1. **Feature Detection** - Check if Storage API is available
2. **Usage Estimation** - Get current usage and total quota
3. **Calculation** - Convert to readable format and percentages
4. **Threshold Monitoring** - Alert when approaching limits
5. **Error Handling** - Graceful degradation when quota exceeded

**Input:** None (reads browser storage state)
**Output:** Storage usage statistics and warnings
**Use case:** Proactive storage management in data-heavy applications

```javascript
// Check current storage usage and quota
// Essential for applications that store large amounts of data
async function checkStorageQuota() {
  // Feature detection - not all browsers support Storage API
  if ("storage" in navigator && "estimate" in navigator.storage) {
    // Get current storage estimate from browser
    const estimate = await navigator.storage.estimate();

    // Convert bytes to more readable megabytes (1024 * 1024 = 1MB)
    const usageInMB = (estimate.usage / (1024 * 1024)).toFixed(2);
    const quotaInMB = (estimate.quota / (1024 * 1024)).toFixed(2);
    const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(2);

    // Log storage statistics for monitoring
    console.log(`Storage used: ${usageInMB} MB`);
    console.log(`Storage quota: ${quotaInMB} MB`);
    console.log(`Percentage used: ${percentUsed}%`);

    // Proactive monitoring - warn when approaching 80% capacity
    if (estimate.usage / estimate.quota > 0.8) {
      console.warn("Storage usage is above 80% - consider cleanup");
      // Could trigger background cleanup or user notification
      return { status: "warning", usage: usageInMB, quota: quotaInMB };
    }

    return { status: "ok", usage: usageInMB, quota: quotaInMB };
  } else {
    console.warn("Storage API not supported in this browser");
    return { status: "unsupported" };
  }
}

// Handle quota exceeded errors
// This function should be called in your error handling middleware
function handleQuotaError(error) {
  if (error.name === "QuotaExceededError") {
    console.error("Storage quota exceeded - cannot store more data");

    // Implement cleanup strategies:
    // 1. Clear expired cache data
    // 2. Remove old log entries
    // 3. Compress or archive old data
    // 4. Prompt user to free up space

    cleanupOldData()
      .then(() => {
        console.log("Cleanup completed - retrying operation");
        // Could retry the failed operation here
      })
      .catch((cleanupError) => {
        console.error("Cleanup failed:", cleanupError);
        // Show user notification about storage being full
        showStorageFullNotification();
      });
  }
}

// Example cleanup function
async function cleanupOldData() {
  // Remove cache entries older than 7 days
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  await db.cache.where("timestamp").below(weekAgo).delete();

  console.log("Removed cache entries older than 7 days");
}
```

## Native IndexedDB API Deep Dive

### Database Connection Management

Opening an IndexedDB database is more complex than other storage APIs because it involves version management, schema migrations, and handling concurrent access from multiple tabs. This function demonstrates a production-ready approach to database connection management.

**What this code demonstrates:**

- Robust database opening with comprehensive error handling
- Version control and schema upgrade handling
- Multi-tab coordination and conflict resolution
- Promise-based API wrapper for easier async/await usage

**Connection Process Steps:**

1. **Open Request** - Initiate database connection with version
2. **Version Check** - Browser compares requested vs existing version
3. **Upgrade Handling** - Run migrations if version is newer
4. **Success/Error** - Resolve with database or reject with error
5. **Event Setup** - Configure ongoing error and version change handlers

**Input Parameters:**

- `name`: Database name (string)
- `version`: Schema version number (integer)
- `upgradeCallback`: Function to handle schema changes

**Output:** Promise resolving to database connection
**Use case:** Establishing reliable database connections with proper error handling

```javascript
// Advanced database opening with version control
// This function handles all the complexities of IndexedDB connection management
function openDatabase(name, version, upgradeCallback) {
  return new Promise((resolve, reject) => {
    // Step 1: Initiate database open request
    // indexedDB.open() is asynchronous and event-driven
    const request = indexedDB.open(name, version);

    // Step 2: Handle connection errors
    // This fires if the database cannot be opened at all
    request.onerror = () => {
      reject(new Error(`Failed to open database: ${request.error}`));
    };

    // Step 3: Handle successful connection
    // This fires when database is successfully opened
    request.onsuccess = () => {
      const db = request.result;

      // Set up global error handler for ongoing operations
      // This catches errors from transactions and operations
      db.onerror = (event) => {
        console.error("Database error:", event.target.error);
        // Could implement error reporting or user notification here
      };

      // Handle version change from another tab/window
      // Critical for multi-tab applications
      db.onversionchange = () => {
        console.warn("Database version changed by another tab");
        db.close(); // Close this connection to allow upgrade
        // Should reload the page or reconnect with new version
        window.location.reload();
      };

      resolve(db);
    };

    // Step 4: Handle schema upgrades
    // This fires when requested version > existing version
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const transaction = event.target.transaction;

      console.log(
        `Upgrading database from version ${event.oldVersion} to ${event.newVersion}`
      );

      // Call user-provided upgrade callback with context
      // This is where you create/modify object stores and indexes
      if (upgradeCallback) {
        try {
          upgradeCallback(db, transaction, event.oldVersion, event.newVersion);
        } catch (error) {
          console.error("Schema upgrade failed:", error);
          transaction.abort(); // Abort the upgrade
        }
      }
    };

    // Step 5: Handle blocking situations
    // This fires when upgrade is blocked by open connections
    request.onblocked = () => {
      console.warn("Database upgrade blocked by other connections");
      // In production, might show user notification to close other tabs
      alert("Please close other tabs to allow database upgrade");
    };
  });
}

// Example usage with schema upgrade
async function initializeDatabase() {
  try {
    const db = await openDatabase(
      "MyApp",
      2,
      (db, transaction, oldVersion, newVersion) => {
        // Handle different upgrade paths
        if (oldVersion < 1) {
          // Create initial schema
          const userStore = db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true,
          });
          userStore.createIndex("email", "email", { unique: true });
        }

        if (oldVersion < 2) {
          // Add new features in version 2
          const userStore = transaction.objectStore("users");
          userStore.createIndex("lastName", "lastName");
        }
      }
    );

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}
```

### Transaction Management

IndexedDB transactions can fail for various reasons - network issues, quota limits, or timing problems. This TransactionManager class provides enterprise-grade transaction handling with automatic retry logic and robust error recovery.

**What this code demonstrates:**

- Automatic retry logic for transient failures
- Exponential backoff strategy to avoid overwhelming the system
- Proper transaction lifecycle management
- Error classification and retry decision making

**Transaction Retry Strategy:**

1. **Execute** - Try the transaction operation
2. **Classify Error** - Determine if error is retryable
3. **Backoff** - Wait with exponential delay between retries
4. **Retry** - Attempt operation again up to max retries
5. **Fail** - Throw error if all retries exhausted

**Input Parameters:**

- `storeNames`: Array of object store names to access
- `mode`: Transaction mode ("readonly" or "readwrite")
- `operations`: Function containing database operations
- `maxRetries`: Maximum number of retry attempts

**Output:** Promise resolving to transaction results
**Use case:** Reliable transaction execution in unreliable network conditions

```javascript
// Advanced transaction handling with retry logic
// Essential for production applications dealing with network instability
class TransactionManager {
  constructor(db) {
    this.db = db;
    this.retryStats = new Map(); // Track retry statistics
  }

  // Main method with automatic retry logic
  async executeWithRetry(storeNames, mode, operations, maxRetries = 3) {
    const operationId = this.generateOperationId();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Transaction attempt ${attempt}/${maxRetries} for operation ${operationId}`
        );

        // Execute the transaction
        const result = await this.executeTransaction(
          storeNames,
          mode,
          operations
        );

        // Success - log statistics and return result
        this.recordSuccess(operationId, attempt);
        return result;
      } catch (error) {
        console.warn(`Transaction attempt ${attempt} failed:`, error.message);

        // Check if we should retry this error
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          this.recordFailure(operationId, attempt, error);
          throw error;
        }

        // Exponential backoff: 100ms, 400ms, 1600ms, etc.
        const delayMs = Math.pow(2, attempt) * 100;
        console.log(`Retrying in ${delayMs}ms...`);
        await this.delay(delayMs);
      }
    }
  }

  // Core transaction execution
  executeTransaction(storeNames, mode, operations) {
    return new Promise((resolve, reject) => {
      // Create transaction with specified stores and mode
      const transaction = this.db.transaction(storeNames, mode);
      const results = {}; // Collect operation results

      // Set up transaction event handlers
      transaction.oncomplete = () => {
        console.log("Transaction completed successfully");
        resolve(results);
      };

      transaction.onerror = (event) => {
        console.error("Transaction error:", event.target.error);
        reject(transaction.error);
      };

      transaction.onabort = () => {
        console.warn("Transaction was aborted");
        reject(new Error("Transaction aborted"));
      };

      try {
        // Execute user-provided operations within transaction context
        // All operations must complete before transaction auto-commits
        operations(transaction, results);
      } catch (syncError) {
        // Handle synchronous errors in operations
        console.error(
          "Synchronous error in transaction operations:",
          syncError
        );
        transaction.abort();
        reject(syncError);
      }
    });
  }

  // Determine if an error is worth retrying
  isRetryableError(error) {
    const retryableErrors = [
      "TransactionInactiveError", // Transaction timed out
      "InvalidStateError", // Database in invalid state
      "AbortError", // Transaction was aborted
      "UnknownError", // Generic network/system error
    ];

    return retryableErrors.includes(error.name);
  }

  // Utility methods
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  generateOperationId() {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  recordSuccess(operationId, attempts) {
    console.log(
      `Operation ${operationId} succeeded after ${attempts} attempts`
    );
  }

  recordFailure(operationId, attempts, error) {
    console.error(
      `Operation ${operationId} failed after ${attempts} attempts:`,
      error
    );
  }
}

// Example usage
async function useTransactionManager() {
  const tm = new TransactionManager(db);

  try {
    const result = await tm.executeWithRetry(
      ["users", "orders"],
      "readwrite",
      (transaction, results) => {
        // These operations execute atomically
        const userStore = transaction.objectStore("users");
        const orderStore = transaction.objectStore("orders");

        // Add user and get the generated ID
        const userRequest = userStore.add({
          name: "John",
          email: "john@example.com",
        });
        userRequest.onsuccess = () => {
          const userId = userRequest.result;
          results.userId = userId;

          // Add order linked to the user
          const orderRequest = orderStore.add({
            userId: userId,
            total: 99.99,
            items: ["item1", "item2"],
          });
          orderRequest.onsuccess = () => {
            results.orderId = orderRequest.result;
          };
        };
      }
    );

    console.log("User and order created:", result);
  } catch (error) {
    console.error("Failed to create user and order:", error);
  }
}
```

### Cursor Operations

Cursors are IndexedDB's primary mechanism for iterating through large datasets efficiently. Unlike loading all records into memory, cursors allow you to process data one record at a time, making them essential for handling large datasets and implementing pagination.

**What this code demonstrates:**

- Memory-efficient pagination using cursors
- Range queries with custom filtering
- Key-based navigation for next/previous functionality
- Streaming data processing without memory overload

**Cursor Benefits:**

1. **Memory Efficiency** - Process one record at a time
2. **Performance** - No need to load entire datasets
3. **Flexibility** - Skip, filter, and transform data on-the-fly
4. **Pagination** - Implement infinite scroll and data tables
5. **Streaming** - Real-time processing of large datasets

**Input Parameters:**

- `pageSize`: Number of records per page
- `startKey`: Key to start pagination from (for next page)
- `filter`: Optional function to filter records

**Output:** Paginated results with navigation metadata
**Use case:** Data tables, infinite scroll, large dataset processing

```javascript
// Advanced cursor usage for range queries and pagination
// Essential for handling large datasets without memory issues
class CursorQuery {
  constructor(objectStore) {
    this.objectStore = objectStore;
    this.stats = { recordsProcessed: 0, queriesExecuted: 0 };
  }

  // Paginated query with cursor - memory efficient pagination
  async paginate(pageSize = 20, startKey = null, direction = "next") {
    this.stats.queriesExecuted++;

    return new Promise((resolve, reject) => {
      const results = [];
      let cursor;

      // Create appropriate cursor based on start key and direction
      if (startKey) {
        if (direction === "next") {
          // Get records after startKey (exclusive bound)
          const range = IDBKeyRange.lowerBound(startKey, true);
          cursor = this.objectStore.openCursor(range);
        } else {
          // Get records before startKey (for previous page)
          const range = IDBKeyRange.upperBound(startKey, true);
          cursor = this.objectStore.openCursor(range, "prev");
        }
      } else {
        // First page - start from beginning
        cursor = this.objectStore.openCursor(
          null,
          direction === "next" ? "next" : "prev"
        );
      }

      cursor.onsuccess = (event) => {
        const cursorResult = event.target.result;

        if (cursorResult && results.length < pageSize) {
          // Add current record to results
          results.push({
            key: cursorResult.key,
            value: cursorResult.value,
          });

          this.stats.recordsProcessed++;

          // Move to next record
          cursorResult.continue();
        } else {
          // Pagination complete - return results with metadata
          const response = {
            results: direction === "prev" ? results.reverse() : results,
            nextKey: cursorResult ? cursorResult.key : null,
            hasMore: cursorResult !== null,
            direction: direction,
            pageSize: pageSize,
            totalProcessed: this.stats.recordsProcessed,
          };

          resolve(response);
        }
      };

      cursor.onerror = (event) => {
        console.error("Cursor error during pagination:", event.target.error);
        reject(cursor.error);
      };
    });
  }

  // Range query with filtering - process data without loading everything
  async rangeQuery(lowerBound, upperBound, filter = null, transform = null) {
    return new Promise((resolve, reject) => {
      const results = [];
      let processedCount = 0;
      let filteredCount = 0;

      // Create bounded range for efficient querying
      const range = IDBKeyRange.bound(lowerBound, upperBound);
      const cursor = this.objectStore.openCursor(range);

      cursor.onsuccess = (event) => {
        const cursorResult = event.target.result;

        if (cursorResult) {
          processedCount++;
          const value = cursorResult.value;

          // Apply filter if provided
          if (!filter || filter(value)) {
            filteredCount++;

            // Apply transformation if provided
            const finalValue = transform ? transform(value) : value;
            results.push(finalValue);
          }

          // Continue to next record
          cursorResult.continue();
        } else {
          // Query complete - return results with statistics
          resolve({
            results: results,
            statistics: {
              totalProcessed: processedCount,
              totalFiltered: filteredCount,
              range: { lower: lowerBound, upper: upperBound },
            },
          });
        }
      };

      cursor.onerror = (event) => {
        console.error("Cursor error during range query:", event.target.error);
        reject(cursor.error);
      };
    });
  }

  // Advanced cursor operations for complex queries
  async complexQuery(options = {}) {
    const {
      indexName = null, // Use specific index
      range = null, // Key range to query
      direction = "next", // Cursor direction
      limit = null, // Maximum results
      offset = 0, // Skip first N records
      filter = null, // Filter function
      transform = null, // Transform function
      onProgress = null, // Progress callback
    } = options;

    return new Promise((resolve, reject) => {
      const results = [];
      let skipped = 0;
      let processed = 0;

      // Choose source: index or object store
      const source = indexName
        ? this.objectStore.index(indexName)
        : this.objectStore;

      // Open cursor with range and direction
      const cursor = source.openCursor(range, direction);

      cursor.onsuccess = (event) => {
        const cursorResult = event.target.result;

        if (cursorResult) {
          processed++;

          // Handle offset (skip first N records)
          if (skipped < offset) {
            skipped++;
            cursorResult.continue();
            return;
          }

          // Check limit
          if (limit && results.length >= limit) {
            resolve({
              results: results,
              hasMore: true,
              totalProcessed: processed,
            });
            return;
          }

          const value = cursorResult.value;

          // Apply filter
          if (!filter || filter(value, cursorResult.key)) {
            // Apply transformation
            const finalValue = transform
              ? transform(value, cursorResult.key)
              : value;

            results.push(finalValue);
          }

          // Progress callback
          if (onProgress && processed % 100 === 0) {
            onProgress(processed, results.length);
          }

          cursorResult.continue();
        } else {
          // Query complete
          resolve({
            results: results,
            hasMore: false,
            totalProcessed: processed,
          });
        }
      };

      cursor.onerror = (event) => {
        reject(cursor.error);
      };
    });
  }
}

// Example usage patterns
async function demonstrateCursorUsage() {
  const userStore = db.transaction("users", "readonly").objectStore("users");
  const cursor = new CursorQuery(userStore);

  // 1. Basic pagination
  const page1 = await cursor.paginate(10);
  console.log("First page:", page1.results.length, "records");

  if (page1.hasMore) {
    const page2 = await cursor.paginate(10, page1.nextKey);
    console.log("Second page:", page2.results.length, "records");
  }

  // 2. Filtered range query
  const activeUsers = await cursor.rangeQuery(
    1,
    1000,
    (user) => user.isActive && user.lastLogin > Date.now() - 86400000,
    (user) => ({ id: user.id, name: user.name }) // Transform to minimal data
  );

  // 3. Complex query with progress
  const complexResults = await cursor.complexQuery({
    indexName: "lastName",
    range: IDBKeyRange.bound("A", "M"),
    limit: 50,
    filter: (user) => user.age >= 18,
    transform: (user) => user.email,
    onProgress: (processed, found) => {
      console.log(`Processed ${processed}, found ${found} matches`);
    },
  });
}
```

## Dexie.js: The Wrapper Library

### Architecture Overview

Dexie.js provides a sophisticated abstraction layer over IndexedDB while maintaining high performance and full feature access. Its architecture consists of several key components:

```
Dexie Architecture:
┌─────────────────────────────────────┐
│           User API Layer            │
├─────────────────────────────────────┤
│         Promise Wrapper             │
├─────────────────────────────────────┤
│       Transaction Manager           │
├─────────────────────────────────────┤
│         Query Engine                │
├─────────────────────────────────────┤
│       Schema Management             │
├─────────────────────────────────────┤
│         IndexedDB Core              │
└─────────────────────────────────────┘
```

### Core Design Principles

#### 1. Promise-First API

```javascript
// Native IndexedDB (callback-based)
const request = objectStore.get(key);
request.onsuccess = (event) => {
  const result = event.target.result;
  // Handle result
};
request.onerror = (event) => {
  // Handle error
};

// Dexie (Promise-based)
const result = await db.table.get(key);
```

#### 2. Fluent Query Interface

Dexie's fluent query interface allows you to chain operations in a readable, SQL-like manner. This approach builds a query plan that's optimized before execution, providing both excellent performance and developer experience.

**What this code demonstrates:**

- Chainable query operations for readable code
- Automatic query optimization by Dexie
- Mixed indexed and filtered operations
- Seamless conversion to arrays, counting, or iteration

**Query Building Process:**

1. **Index Selection** - `where("age")` chooses the age index
2. **Range Filtering** - `between(18, 65)` uses IndexedDB key ranges
3. **Additional Filtering** - `and()` applies JavaScript filters
4. **Sorting** - `orderBy()` specifies result ordering
5. **Limiting** - `limit()` controls result set size
6. **Execution** - `toArray()` executes and returns results

**Input:** Query criteria and constraints
**Output:** Array of filtered and sorted records
**Use case:** Building complex queries with readable syntax

```javascript
// Complex query in Dexie - demonstrates the power of fluent interface
const results = await db.users
  .where("age") // Use the 'age' index for efficient range query
  .between(18, 65) // Range query: 18 <= age <= 65 (uses IndexedDB range)
  .and((user) => user.isActive) // Additional filter using JavaScript (post-index)
  .orderBy("name") // Sort results by name (can use index if available)
  .limit(50) // Limit to first 50 results
  .toArray(); // Execute query and return as array

// Alternative execution methods:
// .count()           - Get count without loading data
// .first()           - Get first matching record
// .last()            - Get last matching record
// .each(callback)    - Iterate without loading all into memory
// .keys()            - Get only the keys, not values
// .modify({...})     - Update matching records
// .delete()          - Delete matching records

// More complex query examples:
// Multi-column queries
const recentActiveUsers = await db.users
  .where(["lastLoginDate", "isActive"])
  .between([new Date("2023-01-01"), true], [new Date(), true])
  .toArray();

// Text search with partial matching
const searchResults = await db.users
  .where("name")
  .startsWithIgnoreCase("john")
  .or("email")
  .startsWithIgnoreCase("john")
  .toArray();

// Complex filtering with pagination
const paginatedQuery = await db.orders
  .where("customerId")
  .equals(123)
  .and((order) => order.total > 100)
  .offset(20) // Skip first 20 results
  .limit(10) // Take next 10 results
  .reverse() // Reverse order
  .toArray();
```

#### 3. Automatic Transaction Management

One of Dexie's most powerful features is its automatic transaction management. Unlike raw IndexedDB where you must manually handle transaction lifecycles, Dexie creates transactions automatically and ensures proper commit/rollback behavior.

**What this code demonstrates:**

- Automatic transaction creation and management
- Multi-table atomic operations
- Automatic commit on success / rollback on error
- Clean async/await syntax within transactions

**Transaction Management Process:**

1. **Auto-Creation** - Dexie creates transactions as needed
2. **Context Preservation** - Maintains transaction context across await calls
3. **Atomic Operations** - Multiple operations execute atomically
4. **Auto-Commit** - Successful completion commits automatically
5. **Auto-Rollback** - Any error rolls back all changes

**Input:** Transaction mode, tables, and operation function
**Output:** Promise resolving to function return value
**Use case:** Ensuring data consistency across multiple operations

```javascript
// Dexie automatically manages transactions
// This function demonstrates ACID properties in client-side storage
await db.transaction("rw", db.users, db.orders, async () => {
  // All operations within this function are atomic
  // If any operation fails, entire transaction rolls back

  const user = await db.users.add({
    name: "John",
    email: "john@example.com",
    createdAt: new Date(),
  });

  // user variable contains the auto-generated ID
  await db.orders.add({
    userId: user, // Reference to the created user
    total: 100,
    status: "pending",
    items: ["item1", "item2"],
  });

  // Update user's order count
  await db.users.update(user, {
    orderCount: 1,
  });

  // All operations succeed = automatic commit
  // Any operation fails = automatic rollback
  // No need to manually call commit() or rollback()
});

// Advanced transaction examples:

// 1. Transaction with error handling
try {
  const result = await db.transaction("rw", [db.users, db.orders], async () => {
    const userId = await db.users.add({ name: "Jane" });

    // Simulate a business logic error
    if (userId > 1000) {
      throw new Error("Too many users!");
    }

    await db.orders.add({ userId, total: 50 });
    return { userId, message: "User and order created" };
  });

  console.log("Transaction succeeded:", result);
} catch (error) {
  console.log("Transaction failed and rolled back:", error.message);
  // Database state is unchanged - atomic rollback occurred
}

// 2. Read-only transaction for consistency
const summary = await db.transaction("r", [db.users, db.orders], async () => {
  // Consistent snapshot across multiple tables
  const userCount = await db.users.count();
  const orderCount = await db.orders.count();
  const totalRevenue = await db.orders
    .toCollection()
    .reduce((sum, order) => sum + order.total, 0);

  return { userCount, orderCount, totalRevenue };
});

// 3. Implicit transactions for single operations
// These automatically create minimal transactions:
await db.users.add({ name: "Bob" }); // Auto-creates "rw" transaction
const user = await db.users.get(1); // Auto-creates "r" transaction
await db.users.update(1, { lastLogin: new Date() }); // Auto-creates "rw" transaction

// 4. Transaction spanning multiple async operations
await db.transaction("rw", db.users, async () => {
  const users = await db.users.where("isActive").equals(false).toArray();

  for (const user of users) {
    // Each update happens within the same transaction
    await db.users.update(user.id, {
      isActive: true,
      reactivatedAt: new Date(),
    });

    // Could call external APIs here while maintaining transaction
    // await notificationService.sendWelcomeBack(user.email);
  }

  console.log(`Reactivated ${users.length} users`);
});
```

## How Dexie Wraps IndexedDB

### Promise Wrapper Implementation

Dexie's promise wrapper is one of its most sophisticated features. Here's a simplified version of how it works:

```javascript
// Simplified Promise wrapper (based on Dexie source concepts)
class DexiePromise extends Promise {
  constructor(executor) {
    super(executor);
    this._zone = getCurrentZone(); // Transaction context
  }

  then(onFulfilled, onRejected) {
    return this._zone.run(() => {
      return super.then(onFulfilled, onRejected);
    });
  }

  catch(onRejected) {
    return this._zone.run(() => {
      return super.catch(onRejected);
    });
  }
}

// Zone implementation for transaction context
class Zone {
  constructor(parent = null) {
    this.parent = parent;
    this.transaction = null;
    this.props = {};
  }

  run(fn) {
    const previousZone = currentZone;
    currentZone = this;
    try {
      return fn();
    } finally {
      currentZone = previousZone;
    }
  }
}
```

### Query Engine Implementation

```javascript
// Dexie's Collection class (simplified)
class Collection {
  constructor(table, where) {
    this.table = table;
    this.where = where;
    this.filters = [];
    this.ordering = null;
    this.limitValue = null;
  }

  // Fluent query methods
  and(filterFunction) {
    return new Collection(this.table, this.where).addFilter(filterFunction);
  }

  orderBy(keyPath) {
    const collection = this.clone();
    collection.ordering = keyPath;
    return collection;
  }

  limit(count) {
    const collection = this.clone();
    collection.limitValue = count;
    return collection;
  }

  // Execute query
  async toArray() {
    const strategy = this.optimizeQuery();
    return await strategy.execute();
  }

  // Query optimization
  optimizeQuery() {
    if (this.where && this.table.schema.hasIndex(this.where.keyPath)) {
      return new IndexStrategy(this);
    } else {
      return new ScanStrategy(this);
    }
  }
}
```

### Transaction Context Management

```javascript
// Dexie's transaction management (conceptual)
class Transaction {
  constructor(mode, tables, db) {
    this.mode = mode;
    this.tables = tables;
    this.db = db;
    this.idbtrans = null;
    this.active = false;
  }

  async execute(fn) {
    this.idbtrans = this.db.idbdb.transaction(this.tables, this.mode);
    this.active = true;

    // Set up transaction event handlers
    this.idbtrans.oncomplete = () => this.complete();
    this.idbtrans.onerror = (event) => this.error(event);
    this.idbtrans.onabort = () => this.abort();

    try {
      // Execute user function in transaction context
      const result = await this.runInContext(fn);
      return result;
    } catch (error) {
      this.idbtrans.abort();
      throw error;
    }
  }

  runInContext(fn) {
    return new Zone(currentZone).run(() => {
      currentZone.transaction = this;
      return fn();
    });
  }
}
```

## Dexie Source Code Analysis

### Schema Definition and Versioning

Looking at Dexie's source code, schema management is handled through a sophisticated versioning system:

```javascript
// From Dexie source: Version class
class Version {
  constructor(versionNumber) {
    this._cfg = {
      version: versionNumber,
      storeNames: [],
      dbschema: {},
      tables: {},
    };
  }

  stores(stores) {
    Object.keys(stores).forEach((tableName) => {
      const schema = stores[tableName];
      this.parseStoreSchema(tableName, schema);
    });
    return this;
  }

  parseStoreSchema(tableName, schema) {
    // Parse schema string like "++id,name,*tags"
    const parts = schema.split(",").map((s) => s.trim());
    const primKey = this.parsePrimaryKey(parts[0]);
    const indexes = this.parseIndexes(parts.slice(1));

    this._cfg.dbschema[tableName] = {
      primKey,
      indexes,
      mappedClass: null,
    };
  }
}
```

### Bulk Operations Optimization

Dexie implements sophisticated bulk operations that significantly outperform individual operations:

```javascript
// Dexie's bulk add implementation (conceptual)
class Table {
  async bulkAdd(objects, keys) {
    const trans = getCurrentTransaction();
    const store = trans.objectStore(this.name);

    // Use browser's native bulk capabilities when available
    if (store.addAll) {
      return await this.nativeBulkAdd(store, objects, keys);
    }

    // Fallback to optimized batch processing
    return await this.batchAdd(store, objects, keys);
  }

  async batchAdd(store, objects, keys) {
    const batchSize = 100; // Optimal batch size
    const results = [];

    for (let i = 0; i < objects.length; i += batchSize) {
      const batch = objects.slice(i, i + batchSize);
      const batchKeys = keys ? keys.slice(i, i + batchSize) : undefined;

      const batchResults = await Promise.all(
        batch.map((obj, idx) => {
          const key = batchKeys ? batchKeys[idx] : undefined;
          return this.promisifyRequest(store.add(obj, key));
        })
      );

      results.push(...batchResults);
    }

    return results;
  }
}
```

### Error Handling and Recovery

```javascript
// Dexie's error handling system
class DexieError extends Error {
  constructor(name, message) {
    super(message);
    this.name = name;
  }
}

// Specific error types
class QuotaExceededError extends DexieError {
  constructor() {
    super("QuotaExceededError", "Storage quota exceeded");
  }
}

class TransactionInactiveError extends DexieError {
  constructor() {
    super("TransactionInactiveError", "Transaction is no longer active");
  }
}

// Error recovery mechanisms
class ErrorRecovery {
  static async handleQuotaExceeded(operation) {
    // Attempt to free up space
    await this.cleanupExpiredData();

    // Retry operation
    try {
      return await operation();
    } catch (error) {
      if (error.name === "QuotaExceededError") {
        throw new Error("Storage quota exceeded even after cleanup");
      }
      throw error;
    }
  }
}
```

## Performance Considerations

### Indexing Strategies

Proper indexing is the foundation of IndexedDB performance. Understanding how to design indexes for your query patterns can mean the difference between millisecond and second response times, especially with large datasets.

**What this code demonstrates:**

- Strategic index design for different query patterns
- Compound indexes for multi-column queries
- Multientry indexes for array-based searches
- Index reuse for optimal performance

**Index Design Principles:**

1. **Query-First Design** - Design indexes based on your most common queries
2. **Compound Indexes** - Combine frequently queried columns
3. **Selectivity** - More selective (unique) columns should come first
4. **Array Support** - Use multientry indexes for array properties
5. **Avoid Over-Indexing** - Each index has storage and update costs

**Performance Impact:**

- **With Proper Index**: O(log n) lookup time
- **Without Index**: O(n) scan time
- **Storage Overhead**: ~20-30% per index
- **Write Performance**: Slight decrease per additional index

**Input:** Schema definition with strategic index placement
**Output:** Optimized query performance for common use cases
**Use case:** High-performance applications with complex query requirements

```javascript
// Optimal indexing for different query patterns
// Each index is designed for specific query scenarios
const db = new Dexie("PerformanceDB");
db.version(1).stores({
  // Compound index for multi-column queries
  // Order matters: most selective column first
  orders:
    "++id, " + // Primary key with auto-increment
    "[customerId+status], " + // Compound: filter by customer AND status
    "[createdAt+status], " + // Compound: date range AND status
    "customerId, " + // Single: customer-specific queries
    "status, " + // Single: status-based queries
    "createdAt", // Single: date range queries

  // Multientry index for array properties
  // The * prefix creates a multientry index
  products:
    "++id, " + // Primary key
    "name, " + // Text search by product name
    "*tags, " + // Multientry: search within tag arrays
    "categoryId, " + // Category-based filtering
    "[categoryId+price], " + // Category with price range
    "price", // Price-based sorting/filtering

  // Indexes optimized for user search and authentication
  users:
    "++id, " + // Primary key
    "email, " + // Unique login identifier
    "[lastName+firstName], " + // Full name searches
    "lastActiveAt, " + // Activity-based queries
    "registrationDate", // Registration cohort analysis
});

// Query optimization examples demonstrating index usage
async function optimizedQueries() {
  console.time("Query Performance Test");

  // 1. Compound index usage: [customerId+status]
  // This query uses the compound index for O(log n) performance
  const activeOrders = await db.orders
    .where(["customerId", "status"]) // Uses compound index
    .equals([123, "active"]) // Exact match on both columns
    .toArray();
  console.log(`Found ${activeOrders.length} active orders for customer 123`);

  // 2. Multientry index usage: *tags
  // Efficiently finds products with any of the specified tags
  const taggedProducts = await db.products
    .where("tags") // Uses multientry index
    .anyOf(["electronics", "gadgets"]) // Searches within array values
    .toArray();
  console.log(`Found ${taggedProducts.length} products with specified tags`);

  // 3. Range query with single index: createdAt
  // Uses btree index for efficient range scanning
  const recentOrders = await db.orders
    .where("createdAt") // Uses createdAt index
    .above(Date.now() - 86400000) // Range query: last 24 hours
    .toArray();
  console.log(`Found ${recentOrders.length} orders in last 24 hours`);

  // 4. Complex query with compound index optimization
  const expensiveRecentOrders = await db.orders
    .where(["createdAt", "status"]) // Uses [createdAt+status] compound index
    .between(
      [Date.now() - 604800000, "confirmed"], // Last week, confirmed status
      [Date.now(), "delivered"] // Now, delivered status
    )
    .and((order) => order.total > 500) // Additional filter (post-index)
    .toArray();

  // 5. User search with name compound index
  const usersByName = await db.users
    .where(["lastName", "firstName"]) // Uses compound name index
    .between(["Smith", "A"], ["Smith", "Z"]) // All Smiths with first name A-Z
    .toArray();

  console.timeEnd("Query Performance Test");
}

// Performance monitoring for index effectiveness
async function analyzeQueryPerformance() {
  const startTime = performance.now();

  // Query that benefits from indexing
  const indexedQuery = await db.orders.where("customerId").equals(123).count();

  const indexedTime = performance.now() - startTime;

  // Equivalent query without index (table scan)
  const scanStart = performance.now();
  const scanQuery = await db.orders
    .filter((order) => order.customerId === 123)
    .count();

  const scanTime = performance.now() - scanStart;

  console.log(`Indexed query: ${indexedTime.toFixed(2)}ms`);
  console.log(`Table scan: ${scanTime.toFixed(2)}ms`);
  console.log(
    `Performance improvement: ${(scanTime / indexedTime).toFixed(1)}x faster`
  );
}

// Index maintenance and optimization tips
const indexOptimizationTips = {
  // 1. Monitor index usage
  monitorIndexUsage: async () => {
    // Use browser dev tools to monitor which indexes are used
    // Look for "index not found" warnings in console
  },

  // 2. Avoid redundant indexes
  avoidRedundancy: () => {
    // If you have [a, b] compound index, you don't need separate [a] index
    // The compound index can serve single-column queries on 'a'
  },

  // 3. Consider query frequency
  designForFrequency: () => {
    // Index the most frequently used query patterns first
    // Less common queries can use table scans if necessary
  },

  // 4. Update performance impact
  updateCosts: () => {
    // Each index must be updated on every record modification
    // Balance query performance vs. write performance
  },
};
```

### Memory Management

Memory management is crucial when working with large datasets in IndexedDB. Poor memory management can lead to browser crashes, especially on mobile devices with limited RAM. These patterns help you process large amounts of data efficiently.

**What this code demonstrates:**

- Streaming data processing to avoid memory exhaustion
- Pagination techniques for handling large result sets
- Memory-efficient batch processing strategies
- Progress tracking for long-running operations

**Memory Management Strategies:**

1. **Stream Processing** - Process one record at a time using `.each()`
2. **Pagination** - Break large queries into smaller chunks
3. **Batch Processing** - Process data in manageable batches
4. **Memory Monitoring** - Track and limit memory usage
5. **Garbage Collection** - Allow browser to clean up between batches

**Performance Benefits:**

- **Prevents OOM**: Avoids out-of-memory crashes
- **Better UX**: Allows progress reporting and cancellation
- **Mobile Friendly**: Works on low-memory devices
- **Responsive UI**: Doesn't block the main thread

**Input:** Large datasets that exceed available memory
**Output:** Processed data without memory issues
**Use case:** Data migration, analytics, bulk operations

```javascript
// Efficient large dataset processing
// Prevents memory exhaustion when handling millions of records
async function processLargeDataset() {
  let processed = 0;
  let startTime = Date.now();

  // Use .each() for memory-efficient streaming
  // Only one record is in memory at a time
  await db.largeTable.each((record) => {
    // Process each record individually
    // This could be data transformation, validation, etc.
    processRecord(record);
    processed++;

    // Progress reporting every 1000 records
    if (processed % 1000 === 0) {
      const elapsed = Date.now() - startTime;
      const rate = (processed / elapsed) * 1000; // records per second
      console.log(
        `Processed ${processed} records (${rate.toFixed(0)} rec/sec)`
      );

      // Optional: Allow UI updates and garbage collection
      // return new Promise(resolve => setTimeout(resolve, 0));
    }
  });

  console.log(`Total processing completed: ${processed} records`);
}

// Advanced streaming with memory monitoring
async function streamWithMemoryMonitoring() {
  let processed = 0;
  const batchSize = 1000;

  await db.largeTable.each(async (record) => {
    await processRecord(record);
    processed++;

    // Monitor memory usage every batch
    if (processed % batchSize === 0) {
      // Check memory usage if available
      if ("memory" in performance && performance.memory.usedJSHeapSize) {
        const memoryMB = performance.memory.usedJSHeapSize / (1024 * 1024);
        console.log(`Memory usage: ${memoryMB.toFixed(1)}MB`);

        // Force garbage collection if memory usage is high
        if (memoryMB > 100) {
          // 100MB threshold
          console.log("High memory usage detected, yielding to GC");
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    }
  });
}

// Pagination for large result sets
// Handles datasets too large to load into memory at once
async function paginatedQuery(pageSize = 100) {
  let lastKey = null;
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    console.log(`Processing page starting from key: ${lastKey || "beginning"}`);

    // Build query with pagination
    const query = db.table.orderBy("id");

    if (lastKey) {
      // Continue from where we left off (exclusive)
      query.where("id").above(lastKey);
    }

    // Fetch next page
    const results = await query.limit(pageSize).toArray();

    // Check if we have more data
    if (results.length < pageSize) {
      hasMore = false;
      console.log("Reached end of dataset");
    } else {
      // Update cursor for next iteration
      lastKey = results[results.length - 1].id;
    }

    // Process current page
    if (results.length > 0) {
      await processBatch(results);
      totalProcessed += results.length;

      console.log(
        `Processed batch: ${results.length} records, total: ${totalProcessed}`
      );

      // Optional: yield to event loop between batches
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return totalProcessed;
}

// Memory-efficient bulk operations
class BulkProcessor {
  constructor(db, batchSize = 1000) {
    this.db = db;
    this.batchSize = batchSize;
    this.stats = {
      processed: 0,
      errors: 0,
      startTime: Date.now(),
    };
  }

  // Process records in batches to manage memory
  async processBatches(tableName, processFn, filterFn = null) {
    const table = this.db[tableName];

    await table.each(async (record, cursor) => {
      try {
        // Apply filter if provided
        if (filterFn && !filterFn(record)) {
          return; // Skip this record
        }

        // Process the record
        await processFn(record);
        this.stats.processed++;

        // Batch boundary - check memory and yield
        if (this.stats.processed % this.batchSize === 0) {
          await this.handleBatchComplete();
        }
      } catch (error) {
        this.stats.errors++;
        console.error(`Error processing record ${cursor.key}:`, error);
      }
    });

    // Final statistics
    this.logFinalStats();
  }

  async handleBatchComplete() {
    const elapsed = Date.now() - this.stats.startTime;
    const rate = (this.stats.processed / elapsed) * 1000;

    console.log(
      `Batch complete: ${this.stats.processed} processed, ` +
        `${this.stats.errors} errors, ${rate.toFixed(0)} rec/sec`
    );

    // Yield to allow UI updates and garbage collection
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  logFinalStats() {
    const elapsed = Date.now() - this.stats.startTime;
    const rate = (this.stats.processed / elapsed) * 1000;

    console.log(`Bulk processing complete:
      Total processed: ${this.stats.processed}
      Total errors: ${this.stats.errors}
      Total time: ${(elapsed / 1000).toFixed(1)}s
      Average rate: ${rate.toFixed(0)} records/second`);
  }
}

// Example usage of bulk processor
async function runBulkDataMigration() {
  const processor = new BulkProcessor(db, 500); // 500 records per batch

  await processor.processBatches(
    "oldTable",
    async (record) => {
      // Transform and migrate each record
      const transformed = {
        id: record.id,
        newField: record.oldField?.toUpperCase(),
        migrationDate: new Date(),
      };

      await db.newTable.put(transformed);
    },
    (record) => record.shouldMigrate === true // Only migrate flagged records
  );
}

// Memory-efficient aggregation
async function calculateAggregatesEfficiently() {
  let totals = {
    count: 0,
    sum: 0,
    min: Infinity,
    max: -Infinity,
  };

  // Stream through all records without loading into memory
  await db.orders.each((order) => {
    totals.count++;
    totals.sum += order.total;
    totals.min = Math.min(totals.min, order.total);
    totals.max = Math.max(totals.max, order.total);
  });

  return {
    count: totals.count,
    sum: totals.sum,
    average: totals.sum / totals.count,
    min: totals.min,
    max: totals.max,
  };
}

// Helper functions
function processRecord(record) {
  // Simulate record processing
  // This could be validation, transformation, or computation
  return {
    ...record,
    processedAt: new Date(),
    processed: true,
  };
}

async function processBatch(records) {
  // Simulate batch processing
  console.log(`Processing batch of ${records.length} records`);

  // Could be bulk updates, external API calls, etc.
  for (const record of records) {
    processRecord(record);
  }

  // Simulate async work
  await new Promise((resolve) => setTimeout(resolve, 10));
}
```

## Advanced Features and Patterns

### Live Queries with dexie-react-hooks

```javascript
// Real-time data synchronization
import { useLiveQuery } from "dexie-react-hooks";

function UserList() {
  // Automatically re-runs when data changes
  const users = useLiveQuery(() =>
    db.users.where("isActive").equals(true).sortBy("name")
  );

  if (!users) return <div>Loading...</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Database Synchronization Patterns

```javascript
// Offline-first sync pattern
class SyncManager {
  constructor(db, apiClient) {
    this.db = db;
    this.api = apiClient;
    this.syncQueue = [];
  }

  async syncToServer() {
    // Get pending changes
    const pendingChanges = await this.db.syncLog
      .where("synced")
      .equals(false)
      .toArray();

    for (const change of pendingChanges) {
      try {
        await this.applySyncChange(change);
        await this.db.syncLog.update(change.id, { synced: true });
      } catch (error) {
        console.error("Sync failed for change:", change.id, error);
      }
    }
  }

  async applySyncChange(change) {
    switch (change.operation) {
      case "create":
        await this.api.create(change.table, change.data);
        break;
      case "update":
        await this.api.update(change.table, change.id, change.data);
        break;
      case "delete":
        await this.api.delete(change.table, change.id);
        break;
    }
  }
}
```

### Custom Middleware and Hooks

```javascript
// Dexie middleware for logging and validation
db.use({
  name: "LoggingMiddleware",
  create: function (down, ctx, table) {
    return function (data) {
      console.log(`Creating record in ${table}:`, data);
      return down.create.call(this, data);
    };
  },
  read: function (down, ctx, table) {
    return function (key) {
      console.log(`Reading from ${table} with key:`, key);
      return down.read.call(this, key);
    };
  },
  update: function (down, ctx, table) {
    return function (data) {
      console.log(`Updating record in ${table}:`, data);
      return down.update.call(this, data);
    };
  },
  delete: function (down, ctx, table) {
    return function (key) {
      console.log(`Deleting from ${table} with key:`, key);
      return down.delete.call(this, key);
    };
  },
});
```

## Real-World Implementation Examples

### E-commerce Application

This comprehensive e-commerce implementation demonstrates how to build a robust offline-capable shopping system using Dexie.js. The application handles complex business logic including inventory management, cart persistence, and atomic transaction processing.

**What this implementation demonstrates:**

- Multi-table relational data modeling in IndexedDB
- Complex business transactions with ACID properties
- Shopping cart persistence across browser sessions
- Inventory tracking and product catalog management
- Order processing with referential integrity

**Application Architecture:**

1. **Product Catalog** - Hierarchical categories with tagging system
2. **Shopping Cart** - Persistent cart with quantity management
3. **Order System** - Multi-table transactions for order creation
4. **Inventory Management** - Stock tracking with optimistic updates
5. **Customer Management** - User sessions and order history

**Data Flow:**

1. **Browse Products** - Query by category, tags, or search terms
2. **Add to Cart** - Update quantities or create new cart items
3. **Calculate Totals** - Join cart items with current product prices
4. **Checkout Process** - Atomic transaction across multiple tables
5. **Order Fulfillment** - Update inventory and create order records

**Input:** User interactions (browse, add to cart, checkout)
**Output:** Persistent shopping experience with data integrity
**Use case:** E-commerce PWAs, offline shopping applications

```javascript
// E-commerce database schema
// Designed for complex queries and referential integrity
const ecommerceDB = new Dexie("EcommerceApp");
ecommerceDB.version(1).stores({
  // Products with multi-criteria search capabilities
  products:
    "++id, " + // Auto-increment primary key
    "name, " + // Product name search
    "price, " + // Price range queries
    "categoryId, " + // Category filtering
    "*tags, " + // Multi-entry tag search
    "inStock, " + // Availability filtering
    "[categoryId+price], " + // Category + price range
    "[inStock+categoryId]", // Available products by category

  // Hierarchical category structure
  categories:
    "++id, " + // Category ID
    "name, " + // Category name
    "parentId, " + // Parent category (for hierarchy)
    "sortOrder", // Display ordering

  // Persistent shopping cart
  cart:
    "++id, " + // Cart item ID
    "productId, " + // Product reference (indexed for fast lookup)
    "quantity, " + // Item quantity
    "addedAt", // Timestamp for cart cleanup

  // Order management
  orders:
    "++id, " + // Order ID
    "customerId, " + // Customer reference
    "status, " + // Order status (pending, confirmed, shipped, etc.)
    "total, " + // Order total amount
    "createdAt, " + // Order timestamp
    "[customerId+status], " + // Customer orders by status
    "[createdAt+status]", // Time-based status queries

  // Order line items (normalized design)
  orderItems:
    "++id, " + // Line item ID
    "orderId, " + // Order reference
    "productId, " + // Product reference
    "quantity, " + // Ordered quantity
    "price", // Price at time of order (price history)
});

// Shopping cart implementation with advanced features
class ShoppingCart {
  constructor() {
    this.cache = new Map(); // In-memory cache for performance
  }

  // Add item to cart with duplicate handling
  async addItem(productId, quantity = 1) {
    try {
      // Validate product exists and is in stock
      const product = await ecommerceDB.products.get(productId);
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }
      if (!product.inStock) {
        throw new Error(`Product ${product.name} is out of stock`);
      }

      // Check for existing cart item
      const existingItem = await ecommerceDB.cart
        .where("productId")
        .equals(productId)
        .first();

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = existingItem.quantity + quantity;
        await ecommerceDB.cart.update(existingItem.id, {
          quantity: newQuantity,
          addedAt: new Date(), // Update timestamp for recent activity
        });

        console.log(
          `Updated cart: Product ${productId} quantity now ${newQuantity}`
        );
        return existingItem.id;
      } else {
        // Add new cart item
        const cartItemId = await ecommerceDB.cart.add({
          productId,
          quantity,
          addedAt: new Date(),
        });

        console.log(`Added to cart: Product ${productId} x${quantity}`);
        return cartItemId;
      }
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    }
  }

  // Calculate cart total with current prices
  async getCartTotal() {
    try {
      const cartItems = await ecommerceDB.cart.toArray();
      let total = 0;
      let itemCount = 0;

      // Use transaction for consistent price calculation
      await ecommerceDB.transaction(
        "r",
        [ecommerceDB.cart, ecommerceDB.products],
        async () => {
          for (const item of cartItems) {
            const product = await ecommerceDB.products.get(item.productId);

            if (product) {
              total += product.price * item.quantity;
              itemCount += item.quantity;
            } else {
              // Handle deleted products
              console.warn(
                `Product ${item.productId} no longer exists, removing from cart`
              );
              await ecommerceDB.cart.delete(item.id);
            }
          }
        }
      );

      return {
        total: parseFloat(total.toFixed(2)),
        itemCount,
        items: cartItems.length,
      };
    } catch (error) {
      console.error("Failed to calculate cart total:", error);
      throw error;
    }
  }

  // Get detailed cart contents with product information
  async getCartDetails() {
    const cartItems = await ecommerceDB.cart
      .orderBy("addedAt")
      .reverse()
      .toArray();
    const cartDetails = [];

    for (const item of cartItems) {
      const product = await ecommerceDB.products.get(item.productId);

      if (product) {
        cartDetails.push({
          cartItemId: item.id,
          productId: item.productId,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
          addedAt: item.addedAt,
          inStock: product.inStock,
        });
      }
    }

    return cartDetails;
  }

  // Remove item from cart
  async removeItem(productId) {
    const deletedCount = await ecommerceDB.cart
      .where("productId")
      .equals(productId)
      .delete();

    console.log(`Removed ${deletedCount} items from cart`);
    return deletedCount > 0;
  }

  // Update item quantity
  async updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      return await this.removeItem(productId);
    }

    const updateCount = await ecommerceDB.cart
      .where("productId")
      .equals(productId)
      .modify({ quantity: newQuantity, addedAt: new Date() });

    return updateCount > 0;
  }

  // Complete checkout process with atomic transaction
  async checkout(customerId) {
    try {
      // Validate customer and cart
      if (!customerId) {
        throw new Error("Customer ID required for checkout");
      }

      const cartItems = await ecommerceDB.cart.toArray();
      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Execute atomic checkout transaction
      const orderId = await ecommerceDB.transaction(
        "rw",
        [
          ecommerceDB.cart,
          ecommerceDB.orders,
          ecommerceDB.orderItems,
          ecommerceDB.products,
        ],
        async () => {
          // Calculate final total within transaction for consistency
          const cartTotal = await this.getCartTotal();

          // Validate inventory availability
          for (const item of cartItems) {
            const product = await ecommerceDB.products.get(item.productId);
            if (!product || !product.inStock) {
              throw new Error(
                `Product ${item.productId} is no longer available`
              );
            }
          }

          // Create order record
          const orderId = await ecommerceDB.orders.add({
            customerId,
            status: "pending",
            total: cartTotal.total,
            createdAt: new Date(),
            itemCount: cartTotal.itemCount,
          });

          console.log(`Created order ${orderId} for customer ${customerId}`);

          // Create order items with price at time of purchase
          for (const item of cartItems) {
            const product = await ecommerceDB.products.get(item.productId);

            await ecommerceDB.orderItems.add({
              orderId,
              productId: item.productId,
              quantity: item.quantity,
              price: product.price, // Lock in current price
              productName: product.name, // Denormalize for order history
            });

            // Optional: Update inventory (if tracking stock levels)
            // await ecommerceDB.products.update(item.productId, {
            //   stockLevel: product.stockLevel - item.quantity
            // });
          }

          // Clear the cart after successful order creation
          await ecommerceDB.cart.clear();

          console.log(
            `Checkout completed: Order ${orderId}, Total: $${cartTotal.total}`
          );
          return orderId;
        }
      );

      return {
        orderId,
        success: true,
        message: "Order placed successfully",
      };
    } catch (error) {
      console.error("Checkout failed:", error);
      return {
        orderId: null,
        success: false,
        message: error.message,
      };
    }
  }

  // Clear entire cart
  async clearCart() {
    const count = await ecommerceDB.cart.clear();
    console.log(`Cleared ${count} items from cart`);
    return count;
  }
}

// Product catalog management
class ProductCatalog {
  // Search products with multiple criteria
  async searchProducts(criteria = {}) {
    const {
      categoryId,
      tags = [],
      priceMin,
      priceMax,
      inStockOnly = true,
      searchTerm,
      limit = 50,
    } = criteria;

    let query = ecommerceDB.products.toCollection();

    // Apply category filter
    if (categoryId) {
      query = ecommerceDB.products.where("categoryId").equals(categoryId);
    }

    // Apply stock filter
    if (inStockOnly) {
      query = query.and((product) => product.inStock);
    }

    // Apply price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      query = query.and((product) => {
        const price = product.price;
        return (
          (priceMin === undefined || price >= priceMin) &&
          (priceMax === undefined || price <= priceMax)
        );
      });
    }

    // Apply tag filter
    if (tags.length > 0) {
      query = query.and(
        (product) =>
          product.tags && tags.some((tag) => product.tags.includes(tag))
      );
    }

    // Apply text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      query = query.and((product) =>
        product.name.toLowerCase().includes(searchLower)
      );
    }

    // Execute query with limit
    const results = await query.limit(limit).toArray();
    return results;
  }

  // Get product hierarchy for navigation
  async getCategoryHierarchy() {
    const categories = await ecommerceDB.categories
      .orderBy("sortOrder")
      .toArray();

    // Build hierarchy tree
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create category objects
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build parent-child relationships
    categories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id));
      }
    });

    return rootCategories;
  }
}

// Usage example
async function demonstrateEcommerce() {
  const cart = new ShoppingCart();
  const catalog = new ProductCatalog();

  // Add products to cart
  await cart.addItem(1, 2); // Product ID 1, quantity 2
  await cart.addItem(3, 1); // Product ID 3, quantity 1

  // Get cart details
  const cartDetails = await cart.getCartDetails();
  console.log("Cart contents:", cartDetails);

  // Calculate total
  const total = await cart.getCartTotal();
  console.log(`Cart total: $${total.total} (${total.itemCount} items)`);

  // Search products
  const searchResults = await catalog.searchProducts({
    categoryId: 1,
    priceMin: 10,
    priceMax: 100,
    tags: ["electronics"],
    inStockOnly: true,
  });

  // Complete checkout
  const checkoutResult = await cart.checkout("customer123");
  if (checkoutResult.success) {
    console.log(`Order placed: ${checkoutResult.orderId}`);
  }
}
```

### Collaborative Document Editor

```javascript
// Document editor with operational transformation
const docDB = new Dexie("DocumentEditor");
docDB.version(1).stores({
  documents: "++id, title, content, lastModified, version",
  operations: "++id, documentId, type, position, content, timestamp, userId",
  conflicts: "++id, documentId, operationId, resolvedAt",
});

class OperationalTransform {
  async applyOperation(docId, operation) {
    return await docDB.transaction(
      "rw",
      docDB.documents,
      docDB.operations,
      async () => {
        // Get current document state
        const doc = await docDB.documents.get(docId);

        // Get all operations after this operation's base version
        const laterOps = await docDB.operations
          .where("documentId")
          .equals(docId)
          .and((op) => op.timestamp > operation.baseTimestamp)
          .sortBy("timestamp");

        // Transform operation against later operations
        const transformedOp = this.transform(operation, laterOps);

        // Apply transformed operation to document
        const newContent = this.applyToContent(doc.content, transformedOp);

        // Update document
        await docDB.documents.update(docId, {
          content: newContent,
          lastModified: new Date(),
          version: doc.version + 1,
        });

        // Store operation in log
        await docDB.operations.add({
          ...transformedOp,
          documentId: docId,
          timestamp: new Date(),
        });
      }
    );
  }

  transform(operation, laterOperations) {
    let transformedOp = { ...operation };

    for (const laterOp of laterOperations) {
      transformedOp = this.transformPair(transformedOp, laterOp);
    }

    return transformedOp;
  }

  transformPair(op1, op2) {
    // Implement operational transformation logic
    // This is a simplified version
    if (op1.type === "insert" && op2.type === "insert") {
      if (op2.position <= op1.position) {
        return { ...op1, position: op1.position + op2.content.length };
      }
    }

    return op1;
  }
}
```

## Debugging and Development Tools

### Database Inspection Tools

```javascript
// Development utilities for debugging
class DexieDebugger {
  static async inspectDatabase(db) {
    console.group("Database Inspection");

    // List all tables
    const tables = db.tables.map((table) => table.name);
    console.log("Tables:", tables);

    // Count records in each table
    for (const tableName of tables) {
      const count = await db.table(tableName).count();
      console.log(`${tableName}: ${count} records`);
    }

    // Check storage usage
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      console.log("Storage estimate:", estimate);
    }

    console.groupEnd();
  }

  static async exportData(db) {
    const data = {};

    for (const table of db.tables) {
      data[table.name] = await table.toArray();
    }

    return JSON.stringify(data, null, 2);
  }

  static async importData(db, jsonData) {
    const data = JSON.parse(jsonData);

    await db.transaction("rw", db.tables, async () => {
      // Clear all tables first
      for (const table of db.tables) {
        await table.clear();
      }

      // Import data
      for (const [tableName, records] of Object.entries(data)) {
        if (db[tableName]) {
          await db[tableName].bulkAdd(records);
        }
      }
    });
  }

  static enableQueryLogging(db) {
    db.use({
      name: "QueryLogger",
      read: function (down, ctx, table) {
        return function (...args) {
          console.time(`Read from ${table}`);
          return down.read.apply(this, args).finally(() => {
            console.timeEnd(`Read from ${table}`);
          });
        };
      },
    });
  }
}
```

### Performance Monitoring

```javascript
// Performance monitoring utilities
class PerformanceMonitor {
  constructor(db) {
    this.db = db;
    this.metrics = new Map();
  }

  startMonitoring() {
    this.db.use({
      name: "PerformanceMonitor",
      create: this.wrapOperation("create"),
      read: this.wrapOperation("read"),
      update: this.wrapOperation("update"),
      delete: this.wrapOperation("delete"),
    });
  }

  wrapOperation(operation) {
    return (down, ctx, table) => {
      return function (...args) {
        const start = performance.now();
        const key = `${table}.${operation}`;

        return down[operation].apply(this, args).finally(() => {
          const duration = performance.now() - start;
          this.recordMetric(key, duration);
        });
      }.bind(this);
    };
  }

  recordMetric(operation, duration) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    this.metrics.get(operation).push(duration);

    // Keep only last 100 measurements
    const measurements = this.metrics.get(operation);
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  getStats() {
    const stats = {};

    for (const [operation, measurements] of this.metrics) {
      const avg = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const max = Math.max(...measurements);
      const min = Math.min(...measurements);

      stats[operation] = { avg, max, min, count: measurements.length };
    }

    return stats;
  }
}
```

## Best Practices and Gotchas

### Common Pitfalls and Solutions

#### 1. Transaction Scope Issues

```javascript
// ❌ Wrong: Operations outside transaction scope
async function badExample() {
  const transaction = db.transaction("rw", db.users, db.orders);

  setTimeout(async () => {
    // This will fail - transaction may already be committed
    await db.users.add({ name: "John" });
  }, 100);
}

// ✅ Correct: Keep all operations synchronous within transaction
async function goodExample() {
  await db.transaction("rw", db.users, db.orders, async () => {
    await db.users.add({ name: "John" });
    await db.orders.add({ userId: 1, total: 100 });
    // All operations complete before transaction ends
  });
}
```

#### 2. Memory Leaks with Large Queries

```javascript
// ❌ Wrong: Loading entire large dataset
async function memoryHog() {
  const allRecords = await db.largeTable.toArray(); // Could be millions
  return allRecords.filter((record) => record.isActive);
}

// ✅ Correct: Use streaming or pagination
async function memoryEfficient() {
  const activeRecords = [];

  await db.largeTable
    .where("isActive")
    .equals(true)
    .each((record) => {
      activeRecords.push(record);
    });

  return activeRecords;
}
```

#### 3. Index Design Mistakes

```javascript
// ❌ Wrong: Missing compound indexes for multi-column queries
db.version(1).stores({
  orders: "++id, customerId, status, createdAt",
});

// This query will be slow
await db.orders
  .where("customerId")
  .equals(123)
  .and((order) => order.status === "active")
  .toArray();

// ✅ Correct: Add compound index
db.version(1).stores({
  orders: "++id, [customerId+status], customerId, status, createdAt",
});

// This query will be fast
await db.orders
  .where(["customerId", "status"])
  .equals([123, "active"])
  .toArray();
```

### Production Deployment Checklist

```javascript
// Production-ready Dexie setup
class ProductionDB {
  constructor() {
    this.db = new Dexie("ProductionApp");
    this.setupSchema();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
  }

  setupSchema() {
    this.db.version(1).stores({
      // Carefully designed schema with proper indexes
      users: "++id, email, [lastName+firstName], lastActiveAt",
      sessions: "++id, userId, token, expiresAt",
      cache: "key, data, expiresAt",
    });

    // Handle schema upgrades gracefully
    this.db
      .version(2)
      .stores({
        users: "++id, email, [lastName+firstName], lastActiveAt, preferences",
      })
      .upgrade((trans) => {
        return trans.users.toCollection().modify((user) => {
          user.preferences = {};
        });
      });
  }

  setupErrorHandling() {
    this.db.use({
      name: "ErrorHandler",
      stack: "dbcore",
      create: this.handleOperation("create"),
      read: this.handleOperation("read"),
      update: this.handleOperation("update"),
      delete: this.handleOperation("delete"),
    });
  }

  handleOperation(operationType) {
    return (req) => {
      return new Promise((resolve, reject) => {
        try {
          const result = req.operation.apply(req, req.args);

          if (result && typeof result.then === "function") {
            result.then(resolve).catch((error) => {
              this.logError(operationType, error, req);
              reject(error);
            });
          } else {
            resolve(result);
          }
        } catch (error) {
          this.logError(operationType, error, req);
          reject(error);
        }
      });
    };
  }

  logError(operation, error, request) {
    console.error("Database operation failed:", {
      operation,
      error: error.message,
      table: request.objectStoreName,
      stack: error.stack,
    });

    // Send to error reporting service
    if (window.errorReporter) {
      window.errorReporter.captureException(error, {
        tags: { operation, table: request.objectStoreName },
      });
    }
  }
}
```

## Conclusion

IndexedDB and Dexie.js represent a powerful combination for client-side data storage in modern web applications. IndexedDB provides the robust, transactional foundation with its sophisticated storage engine, while Dexie.js offers an elegant, developer-friendly interface that doesn't sacrifice performance or capabilities.

### Key Takeaways

1. **IndexedDB Architecture**: Understanding the underlying B+ tree structures, transaction management, and browser storage mechanisms helps in making informed design decisions.

2. **Dexie's Value Proposition**: The wrapper doesn't just simplify the API—it provides transaction management, query optimization, and error handling that would be complex to implement correctly with raw IndexedDB.

3. **Performance Considerations**: Proper indexing strategies, transaction scoping, and memory management are crucial for production applications.

4. **Browser Differences**: While IndexedDB is standardized, browser implementations vary in storage limits, eviction policies, and performance characteristics.

5. **Future-Proofing**: Both technologies continue to evolve, with new features like partitioned storage, improved quota management, and enhanced debugging tools.

The combination of IndexedDB's power and Dexie's elegance provides a robust foundation for building sophisticated offline-first web applications with complex data requirements. Whether you're building a simple cache or a full-featured collaborative application, understanding both the underlying mechanisms and the abstraction layer ensures you can build performant, reliable data storage solutions.

### Further Reading

- [Dexie.js Official Documentation](https://dexie.org)
- [IndexedDB API Reference](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js GitHub Repository](https://github.com/dexie/Dexie.js)
- [Web Storage API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Storage for the Web](https://web.dev/storage-for-the-web/)
