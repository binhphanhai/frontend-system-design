# WebSockets: Real-Time Communication Under the Hood

## Table of Contents

- [Introduction](#introduction)
- [Getting Started with WebSockets](#getting-started-with-websockets)
- [WebSocket Protocol Deep Dive](#websocket-protocol-deep-dive)
- [Connection Establishment and Handshake](#connection-establishment-and-handshake)
- [Frame Structure and Message Types](#frame-structure-and-message-types)
- [Connection Management and Lifecycle](#connection-management-and-lifecycle)
- [Server-Side Implementation](#server-side-implementation)
- [Real-Time Communication Patterns](#real-time-communication-patterns)
- [Security Considerations](#security-considerations)
- [Performance Optimization](#performance-optimization)
- [Real-World Implementation Examples](#real-world-implementation-examples)
- [Error Handling and Debugging](#error-handling-and-debugging)
- [WebSocket Libraries and Frameworks](#websocket-libraries-and-frameworks)
- [Best Practices and Common Pitfalls](#best-practices-and-common-pitfalls)
- [Conclusion](#conclusion)

## Introduction

WebSockets provide a full-duplex communication channel between a client and server over a single TCP connection. Unlike traditional HTTP requests, WebSockets enable real-time, bidirectional communication with minimal overhead, making them ideal for applications requiring instant data exchange.

As defined in the [WebSocket API specification](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), WebSockets overcome the limitations of HTTP polling by establishing a persistent connection that allows both client and server to send data at any time.

### Key Advantages

- **Full-Duplex Communication**: Both client and server can send data simultaneously
- **Low Latency**: No HTTP header overhead after initial handshake
- **Real-Time Updates**: Instant data exchange without polling
- **Efficient Resource Usage**: Single persistent connection vs multiple HTTP requests
- **Binary and Text Support**: Flexible data transmission formats

### Common Use Cases

- Real-time chat applications
- Live gaming and multiplayer experiences
- Financial trading platforms
- Collaborative editing tools
- Live notifications and alerts
- IoT device communication
- Real-time analytics dashboards

## Getting Started with WebSockets

### Basic Client Implementation

This section demonstrates the fundamental WebSocket client implementation using the browser's native WebSocket API. The following code establishes a connection to a WebSocket server and handles the basic lifecycle events.

**What this code does:**

1. Creates a WebSocket connection to the specified server
2. Sets up event listeners for all WebSocket states (open, message, error, close)
3. Sends a greeting message when the connection is established
4. Logs received messages and connection status changes

**Input:** WebSocket server URL (ws://localhost:8080)
**Output:** Console logs showing connection status and received messages

```javascript
// Create a new WebSocket connection to the server
// The URL scheme is 'ws://' for unencrypted or 'wss://' for encrypted connections
const socket = new WebSocket("ws://localhost:8080");

// Event: Connection successfully established
socket.addEventListener("open", (event) => {
  console.log("Connected to WebSocket server");
  // Send an initial message to the server to confirm connectivity
  socket.send("Hello Server!");
});

// Event: Message received from the server
socket.addEventListener("message", (event) => {
  // event.data contains the message payload (string or binary data)
  console.log("Message from server:", event.data);
});

// Event: Connection error occurred
socket.addEventListener("error", (event) => {
  // Log any connection or communication errors
  console.error("WebSocket error:", event);
});

// Event: Connection closed by either client or server
socket.addEventListener("close", (event) => {
  // event.code: numeric code indicating close reason
  // event.reason: human-readable close reason
  console.log("Connection closed:", event.code, event.reason);
});
```

### Enhanced WebSocket Client Class

The following code demonstrates a production-ready WebSocket client class that handles reconnection, message queuing, and event management. This class provides a robust foundation for real-world applications requiring reliable WebSocket communication.

**What this class provides:**

1. **Automatic Reconnection**: Handles connection drops and retries with exponential backoff
2. **Message Queuing**: Buffers messages when disconnected and sends them upon reconnection
3. **Event Management**: Custom event system for handling connection states and messages
4. **Connection State Management**: Tracks and manages WebSocket connection states
5. **Error Handling**: Comprehensive error handling with retry logic

**Key Features:**

- Configurable reconnection attempts and intervals
- Message queue persistence during disconnections
- Custom event listeners for application-specific handling
- Connection state validation before sending messages

**Input:** WebSocket URL, optional protocols array, configuration options
**Output:** Reliable WebSocket connection with automatic reconnection and message queuing

```javascript
class WebSocketClient {
  constructor(url, protocols = []) {
    // Connection configuration
    this.url = url; // WebSocket server URL
    this.protocols = protocols; // Optional subprotocols
    this.socket = null; // Current WebSocket instance

    // Reconnection management
    this.reconnectAttempts = 0; // Current number of reconnection attempts
    this.maxReconnectAttempts = 5; // Maximum reconnection attempts before giving up
    this.reconnectInterval = 1000; // Base reconnection delay in milliseconds

    // Message handling
    this.messageQueue = []; // Queue for messages sent while disconnected
    this.eventListeners = {}; // Custom event listeners registry
  }

  connect() {
    try {
      // Create new WebSocket instance with configured URL and protocols
      this.socket = new WebSocket(this.url, this.protocols);
      this.setupEventListeners();
    } catch (error) {
      // Handle immediate connection errors (invalid URL, etc.)
      console.error("Failed to create WebSocket:", error);
      this.handleReconnect();
    }
  }

  setupEventListeners() {
    // Event: Connection successfully opened
    this.socket.onopen = (event) => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0; // Reset reconnection counter on successful connection
      this.processMessageQueue(); // Send any queued messages from disconnection period
      this.emit("open", event); // Notify application of successful connection
    };

    // Event: Message received from server
    this.socket.onmessage = (event) => {
      const data = this.parseMessage(event.data); // Parse JSON or return raw data
      this.emit("message", data); // Forward parsed message to application
    };

    // Event: WebSocket error occurred
    this.socket.onerror = (event) => {
      console.error("WebSocket error:", event);
      this.emit("error", event); // Forward error to application for handling
    };

    // Event: Connection closed
    this.socket.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      this.emit("close", event); // Notify application of connection closure

      // Attempt reconnection if closure was not clean (unexpected disconnection)
      if (!event.wasClean) {
        this.handleReconnect();
      }
    };
  }

  send(data) {
    // Check if WebSocket is currently connected and ready
    if (this.isConnected()) {
      const message = this.formatMessage(data); // Convert data to appropriate format
      this.socket.send(message); // Send immediately if connected
    } else {
      // Queue message for later delivery when connection is restored
      this.messageQueue.push(data);
      console.log("Message queued (disconnected):", data);
    }
  }

  isConnected() {
    // Verify socket exists and is in OPEN state (readyState === 1)
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  parseMessage(data) {
    try {
      // Attempt to parse as JSON for structured data
      return JSON.parse(data);
    } catch {
      // Return raw data if not valid JSON (could be plain text or binary)
      return data;
    }
  }

  formatMessage(data) {
    // Convert objects to JSON strings, leave primitives as-is
    return typeof data === "object" ? JSON.stringify(data) : data;
  }

  processMessageQueue() {
    // Send all queued messages upon reconnection
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift(); // Remove from queue and send
      this.send(message); // Recursive call, but now connected
    }
  }

  handleReconnect() {
    // Implement exponential backoff reconnection strategy
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

      // Exponential backoff: delay increases with each attempt
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval * this.reconnectAttempts);
    } else {
      console.error("Max reconnection attempts reached");
      this.emit("maxReconnectAttemptsReached"); // Notify application of permanent failure
    }
  }

  on(event, callback) {
    // Register event listener for custom events
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []; // Initialize event array if first listener
    }
    this.eventListeners[event].push(callback); // Add callback to event listeners
  }

  off(event, callback) {
    // Remove specific event listener
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback // Keep all callbacks except the one to remove
      );
    }
  }

  emit(event, data) {
    // Trigger all listeners for a specific event
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => {
        try {
          callback(data); // Call each registered callback with event data
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  close(code = 1000, reason = "Normal closure") {
    // Gracefully close WebSocket connection
    if (this.socket) {
      this.socket.close(code, reason); // Send close frame with specified code and reason
    }
  }

  getState() {
    // Return human-readable connection state
    if (!this.socket) return "UNINITIALIZED";

    // Map WebSocket readyState constants to descriptive strings
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: // 0: Connection is being established
        return "CONNECTING";
      case WebSocket.OPEN: // 1: Connection is open and ready
        return "OPEN";
      case WebSocket.CLOSING: // 2: Connection is being closed
        return "CLOSING";
      case WebSocket.CLOSED: // 3: Connection is closed
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }
}

// Usage example demonstrating the enhanced WebSocket client
const client = new WebSocketClient("ws://localhost:8080");

// Set up event handlers before connecting
client.on("open", () => {
  console.log("Connected successfully");
  // Send a structured message upon connection
  client.send({ type: "greeting", message: "Hello from client!" });
});

client.on("message", (data) => {
  console.log("Received:", data);
  // Handle different message types based on your application logic
});

client.on("error", (error) => {
  console.error("Connection error:", error);
});

client.on("maxReconnectAttemptsReached", () => {
  console.error("Failed to reconnect after maximum attempts");
  // Implement fallback logic or notify user
});

// Initiate the connection
client.connect();
```

## WebSocket Protocol Deep Dive

### Protocol Overview

This section explores the technical details of the WebSocket protocol, from the initial HTTP upgrade handshake to the frame-level communication format. Understanding these fundamentals is crucial for implementing robust WebSocket applications and debugging connection issues.

**Protocol Architecture:**

1. **HTTP Upgrade Handshake**: Initial negotiation using standard HTTP headers
2. **Protocol Switching**: Transition from HTTP to WebSocket binary protocol
3. **Frame-Based Communication**: Structured message format with minimal overhead
4. **Connection Persistence**: Long-lived bidirectional communication channel

WebSockets operate over TCP and use HTTP/1.1 for the initial handshake. Once established, the connection switches to the WebSocket protocol, enabling bidirectional communication with minimal overhead. This hybrid approach ensures compatibility with existing web infrastructure while providing the performance benefits of a persistent connection.

### HTTP to WebSocket Upgrade Process

The WebSocket handshake is a carefully orchestrated HTTP upgrade process that establishes the WebSocket connection while maintaining compatibility with HTTP infrastructure. The following example shows the complete request-response cycle.

**Handshake Process Steps:**

1. **Client Request**: HTTP GET request with WebSocket upgrade headers
2. **Server Validation**: Server validates headers and generates accept key
3. **Protocol Switch**: Server responds with 101 status code to confirm upgrade
4. **Connection Established**: Both parties switch to WebSocket frame protocol

**Input:** HTTP GET request with WebSocket headers
**Output:** HTTP 101 response confirming protocol upgrade

```
Client Request:
GET /chat HTTP/1.1                              # Standard HTTP GET request
Host: server.example.com                        # Target server hostname
Upgrade: websocket                              # Request protocol upgrade to WebSocket
Connection: Upgrade                             # Indicate connection should be upgraded
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==     # Random 16-byte value (base64 encoded)
Sec-WebSocket-Version: 13                      # WebSocket protocol version (RFC 6455)
Sec-WebSocket-Protocol: chat, superchat        # Optional: preferred subprotocols
Origin: http://example.com                      # Origin header for security validation

Server Response:
HTTP/1.1 101 Switching Protocols               # Successful protocol upgrade
Upgrade: websocket                              # Confirm upgrade to WebSocket
Connection: Upgrade                             # Confirm connection upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=  # SHA-1 hash of key + magic string
Sec-WebSocket-Protocol: chat                   # Selected subprotocol from client's list
```

### WebSocket Header Analysis

The following code demonstrates how to implement WebSocket handshake validation and key generation according to RFC 6455 specifications. This implementation shows the cryptographic process used to validate WebSocket connections and prevent connection hijacking.

**What this code demonstrates:**

1. **Security Key Generation**: Creates random 16-byte keys for handshake validation
2. **Accept Key Validation**: Implements the SHA-1 hashing algorithm for server response validation
3. **Header Parsing**: Extracts and validates WebSocket-specific headers
4. **Protocol Compliance**: Ensures adherence to RFC 6455 WebSocket standard

**Key Security Features:**

- Random key generation prevents replay attacks
- SHA-1 with magic string ensures server WebSocket capability
- Header validation prevents malicious upgrade attempts

**Input:** HTTP headers from WebSocket handshake
**Output:** Validated connection parameters and security keys

```javascript
// WebSocket handshake validation and key generation utilities
class WebSocketHandshake {
  static generateKey() {
    // Generate cryptographically secure 16-byte random value for handshake
    const bytes = new Uint8Array(16); // 16 bytes = 128 bits of entropy
    crypto.getRandomValues(bytes); // Use secure random number generator
    return btoa(String.fromCharCode(...bytes)); // Encode as base64 string
  }

  static validateAcceptKey(clientKey, serverAccept) {
    // RFC 6455 mandated magic string for WebSocket accept key generation
    const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const concatenated = clientKey + magicString; // Combine client key with magic string

    // Compute SHA-1 hash and base64 encode (as per RFC 6455)
    return crypto.subtle
      .digest("SHA-1", new TextEncoder().encode(concatenated))
      .then((hashBuffer) => {
        const hashArray = new Uint8Array(hashBuffer); // Convert ArrayBuffer to Uint8Array
        const expectedAccept = btoa(String.fromCharCode(...hashArray)); // Base64 encode
        return expectedAccept === serverAccept; // Validate server's accept key
      });
  }

  static parseUpgradeHeaders(headers) {
    // Extract and normalize WebSocket-specific headers from HTTP request
    return {
      upgrade: headers.get("Upgrade")?.toLowerCase(), // Should be "websocket"
      connection: headers.get("Connection")?.toLowerCase(), // Should contain "upgrade"
      key: headers.get("Sec-WebSocket-Key"), // Client's random key
      version: headers.get("Sec-WebSocket-Version"), // Should be "13"
      protocol: headers.get("Sec-WebSocket-Protocol"), // Optional subprotocols
      extensions: headers.get("Sec-WebSocket-Extensions"), // Optional extensions
    };
  }
}
```

## Connection Establishment and Handshake

### Client-Side Connection Process

This section demonstrates advanced client-side connection management with timeout handling, heartbeat mechanisms, and comprehensive state tracking. The implementation provides robust connection establishment with proper cleanup and error handling.

**Connection Management Features:**

1. **Timeout Protection**: Prevents hanging connections with configurable timeouts
2. **State Tracking**: Monitors connection lifecycle with descriptive states
3. **Heartbeat System**: Maintains connection health with periodic ping/pong
4. **Promise-Based API**: Modern async/await compatible connection interface
5. **Resource Cleanup**: Proper timer and event listener cleanup

**Connection States:**

- `IDLE`: Initial state before connection attempt
- `CONNECTING`: WebSocket handshake in progress
- `CONNECTED`: Connection established and ready
- `ERROR`: Connection failed or encountered error
- `CLOSED`: Connection terminated

**Input:** WebSocket URL and configuration options
**Output:** Promise resolving to established WebSocket connection

```javascript
class WebSocketConnection {
  constructor(url, options = {}) {
    this.url = url; // WebSocket server URL
    this.options = {
      protocols: options.protocols || [], // Optional WebSocket subprotocols
      timeout: options.timeout || 30000, // Connection timeout in milliseconds
      ...options, // Additional configuration options
    };
    this.connectionState = "IDLE"; // Initial connection state
  }

  async connect() {
    // Return Promise for modern async/await compatibility
    return new Promise((resolve, reject) => {
      this.connectionState = "CONNECTING"; // Update state to indicate connection attempt

      // Create WebSocket with configured URL and protocols
      const socket = new WebSocket(this.url, this.options.protocols);

      // Set up connection timeout to prevent hanging
      const timeout = setTimeout(() => {
        socket.close(); // Force close on timeout
        this.connectionState = "ERROR";
        reject(new Error("Connection timeout"));
      }, this.options.timeout);

      // Handle successful connection establishment
      socket.onopen = () => {
        clearTimeout(timeout); // Cancel timeout timer
        this.connectionState = "CONNECTED"; // Update connection state
        this.socket = socket; // Store socket reference
        this.setupHeartbeat(); // Initialize heartbeat mechanism
        resolve(socket); // Resolve promise with socket
      };

      // Handle connection errors
      socket.onerror = (error) => {
        clearTimeout(timeout); // Cancel timeout timer
        this.connectionState = "ERROR"; // Update state to error
        reject(error); // Reject promise with error
      };

      // Handle connection closure
      socket.onclose = () => {
        clearTimeout(timeout); // Cancel timeout timer
        this.connectionState = "CLOSED"; // Update state to closed
        this.cleanup(); // Clean up resources
      };
    });
  }

  setupHeartbeat() {
    // Establish periodic heartbeat to maintain connection health
    this.heartbeatInterval = setInterval(() => {
      // Only send ping if connection is open and ready
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "ping" })); // Send ping message
      }
    }, 30000); // Send ping every 30 seconds to detect stale connections
  }

  cleanup() {
    // Clean up resources and timers to prevent memory leaks
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval); // Stop heartbeat timer
      this.heartbeatInterval = null; // Clear reference
    }
  }
}
```

### Server-Side Handshake Validation

```javascript
// Node.js WebSocket server handshake handling
const crypto = require("crypto");
const { EventEmitter } = require("events");

class WebSocketServer extends EventEmitter {
  constructor(options = {}) {
    super();
    this.port = options.port || 8080;
    this.protocols = options.protocols || [];
  }

  handleUpgrade(request, socket, head) {
    const headers = request.headers;

    // Validate WebSocket headers
    if (!this.validateHeaders(headers)) {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    // Generate accept key
    const acceptKey = this.generateAcceptKey(headers["sec-websocket-key"]);

    // Select protocol
    const selectedProtocol = this.selectProtocol(
      headers["sec-websocket-protocol"]
    );

    // Send handshake response
    const responseHeaders = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
    ];

    if (selectedProtocol) {
      responseHeaders.push(`Sec-WebSocket-Protocol: ${selectedProtocol}`);
    }

    socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");

    // Create WebSocket connection
    const websocket = new WebSocketConnection(socket);
    this.emit("connection", websocket);
  }

  validateHeaders(headers) {
    return (
      headers.upgrade?.toLowerCase() === "websocket" &&
      headers.connection?.toLowerCase().includes("upgrade") &&
      headers["sec-websocket-key"] &&
      headers["sec-websocket-version"] === "13"
    );
  }

  generateAcceptKey(clientKey) {
    const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    const hash = crypto
      .createHash("sha1")
      .update(clientKey + magicString)
      .digest("base64");
    return hash;
  }

  selectProtocol(requestedProtocols) {
    if (!requestedProtocols) return null;

    const protocols = requestedProtocols.split(",").map((p) => p.trim());
    return protocols.find((protocol) => this.protocols.includes(protocol));
  }
}
```

## Frame Structure and Message Types

### WebSocket Frame Format

WebSocket communication uses a binary frame format that provides efficient message transmission with minimal overhead. Understanding this frame structure is essential for implementing custom WebSocket protocols or debugging connection issues.

**Frame Structure Purpose:**

1. **Efficient Encoding**: Minimal overhead for small and large messages
2. **Message Fragmentation**: Support for splitting large messages across multiple frames
3. **Security Masking**: Client-to-server frames are masked to prevent cache poisoning
4. **Control Frames**: Built-in support for ping/pong and connection management
5. **Extensibility**: Reserved bits for future protocol extensions

**Frame Components:**

- **FIN bit**: Indicates if this is the final frame in a message
- **RSV bits**: Reserved for extensions (must be 0 if no extension negotiated)
- **Opcode**: Defines frame type (text, binary, close, ping, pong)
- **MASK bit**: Indicates if payload is masked (required for client-to-server frames)
- **Payload Length**: Variable-length field supporting messages up to 64-bit size
- **Masking Key**: 32-bit key for payload masking (if MASK bit is set)
- **Payload Data**: The actual message content

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
```

### Frame Processing Implementation

The following implementation demonstrates how to create, parse, and manipulate WebSocket frames according to RFC 6455 specifications. This low-level frame handling is typically abstracted by WebSocket libraries but is crucial for understanding the protocol internals.

**What this implementation provides:**

1. **Frame Creation**: Build different types of WebSocket frames (text, binary, control)
2. **Payload Masking**: Implement client-side masking as required by the protocol
3. **Frame Serialization**: Convert frame objects to binary wire format
4. **Opcode Management**: Handle different frame types with appropriate opcodes
5. **Security Compliance**: Ensure proper masking for client-to-server communication

**Frame Types and Opcodes:**

- `0x0`: Continuation frame (for fragmented messages)
- `0x1`: Text frame (UTF-8 encoded text data)
- `0x2`: Binary frame (arbitrary binary data)
- `0x8`: Close frame (connection termination)
- `0x9`: Ping frame (connection keep-alive)
- `0xA`: Pong frame (response to ping)

**Input:** Message data and frame type parameters
**Output:** Properly formatted WebSocket frame ready for transmission

```javascript
class WebSocketFrame {
  constructor() {
    // Frame header flags
    this.fin = false; // Final fragment flag
    this.rsv1 = false; // Reserved bit 1 (extension use)
    this.rsv2 = false; // Reserved bit 2 (extension use)
    this.rsv3 = false; // Reserved bit 3 (extension use)
    this.opcode = 0; // Frame type (4 bits)
    this.masked = false; // Payload masking flag

    // Payload information
    this.payloadLength = 0; // Length of payload data
    this.maskingKey = null; // 32-bit masking key (if masked)
    this.payload = null; // Actual payload data
  }

  // WebSocket frame opcodes as defined in RFC 6455
  static OPCODES = {
    CONTINUATION: 0x0, // Continuation frame for fragmented messages
    TEXT: 0x1, // Text data frame (UTF-8 encoded)
    BINARY: 0x2, // Binary data frame
    CLOSE: 0x8, // Connection close frame
    PING: 0x9, // Ping frame for keep-alive
    PONG: 0xa, // Pong frame (response to ping)
  };

  static createTextFrame(data, masked = true) {
    // Create a new text frame with UTF-8 encoded data
    const frame = new WebSocketFrame();
    frame.fin = true; // Mark as final frame
    frame.opcode = WebSocketFrame.OPCODES.TEXT; // Set text opcode
    frame.masked = masked; // Apply masking if required
    frame.payload = Buffer.from(data, "utf8"); // Encode text as UTF-8
    frame.payloadLength = frame.payload.length; // Set payload length

    // Apply masking for client-to-server frames (security requirement)
    if (masked) {
      frame.maskingKey = crypto.randomBytes(4); // Generate random 32-bit key
      frame.payload = WebSocketFrame.maskPayload(
        // Apply XOR masking
        frame.payload,
        frame.maskingKey
      );
    }

    return frame;
  }

  static createBinaryFrame(data, masked = true) {
    // Create a new binary frame for arbitrary data
    const frame = new WebSocketFrame();
    frame.fin = true; // Mark as final frame
    frame.opcode = WebSocketFrame.OPCODES.BINARY; // Set binary opcode
    frame.masked = masked; // Apply masking if required
    frame.payload = Buffer.isBuffer(data) ? data : Buffer.from(data); // Ensure Buffer format
    frame.payloadLength = frame.payload.length; // Set payload length

    // Apply masking for client-to-server frames
    if (masked) {
      frame.maskingKey = crypto.randomBytes(4); // Generate random masking key
      frame.payload = WebSocketFrame.maskPayload(
        // Apply XOR masking
        frame.payload,
        frame.maskingKey
      );
    }

    return frame;
  }

  static createPingFrame(data = Buffer.alloc(0)) {
    // Create ping frame for connection keep-alive
    const frame = new WebSocketFrame();
    frame.fin = true; // Ping frames are always complete
    frame.opcode = WebSocketFrame.OPCODES.PING; // Set ping opcode
    frame.payload = data; // Optional ping payload
    frame.payloadLength = data.length; // Set payload length
    return frame;
  }

  static createPongFrame(data = Buffer.alloc(0)) {
    // Create pong frame in response to ping
    const frame = new WebSocketFrame();
    frame.fin = true; // Pong frames are always complete
    frame.opcode = WebSocketFrame.OPCODES.PONG; // Set pong opcode
    frame.payload = data; // Echo ping payload
    frame.payloadLength = data.length; // Set payload length
    return frame;
  }

  static maskPayload(payload, maskingKey) {
    // Apply XOR masking to payload data as required by RFC 6455
    const masked = Buffer.alloc(payload.length); // Allocate buffer for masked data
    for (let i = 0; i < payload.length; i++) {
      masked[i] = payload[i] ^ maskingKey[i % 4]; // XOR with rotating masking key
    }
    return masked;
  }

  toBuffer() {
    // Serialize the frame to binary format for transmission
    let headerLength = 2; // Minimum header size (2 bytes)
    let payloadLengthBytes = 0; // Additional bytes for extended length

    // Determine payload length representation
    if (this.payloadLength < 126) {
      payloadLengthBytes = 0;
    } else if (this.payloadLength < 65536) {
      payloadLengthBytes = 2;
      headerLength += 2;
    } else {
      payloadLengthBytes = 8;
      headerLength += 8;
    }

    if (this.masked) {
      headerLength += 4;
    }

    const buffer = Buffer.alloc(headerLength + this.payloadLength);
    let offset = 0;

    // First byte: FIN + RSV + Opcode
    buffer[offset] =
      (this.fin ? 0x80 : 0) |
      (this.rsv1 ? 0x40 : 0) |
      (this.rsv2 ? 0x20 : 0) |
      (this.rsv3 ? 0x10 : 0) |
      (this.opcode & 0x0f);
    offset++;

    // Second byte: MASK + Payload length
    if (this.payloadLength < 126) {
      buffer[offset] = (this.masked ? 0x80 : 0) | this.payloadLength;
    } else if (this.payloadLength < 65536) {
      buffer[offset] = (this.masked ? 0x80 : 0) | 126;
      offset++;
      buffer.writeUInt16BE(this.payloadLength, offset);
      offset += 2;
    } else {
      buffer[offset] = (this.masked ? 0x80 : 0) | 127;
      offset++;
      buffer.writeUInt32BE(0, offset); // High 32 bits
      buffer.writeUInt32BE(this.payloadLength, offset + 4); // Low 32 bits
      offset += 8;
    }
    offset++;

    // Masking key
    if (this.masked && this.maskingKey) {
      this.maskingKey.copy(buffer, offset);
      offset += 4;
    }

    // Payload
    if (this.payload) {
      this.payload.copy(buffer, offset);
    }

    return buffer;
  }
}
```

## Connection Management and Lifecycle

### Keep-Alive and Heartbeat

```javascript
class WebSocketKeepAlive {
  constructor(socket, options = {}) {
    this.socket = socket;
    this.pingInterval = options.pingInterval || 30000;
    this.pongTimeout = options.pongTimeout || 5000;
    this.maxMissedPongs = options.maxMissedPongs || 3;
    this.missedPongs = 0;
    this.isAlive = true;
  }

  start() {
    this.heartbeatTimer = setInterval(() => {
      if (!this.isAlive) {
        this.missedPongs++;

        if (this.missedPongs >= this.maxMissedPongs) {
          console.log("Connection appears dead, closing");
          this.socket.terminate();
          return;
        }
      }

      this.isAlive = false;
      this.socket.ping();

      // Set timeout for pong response
      this.pongTimer = setTimeout(() => {
        console.log("Pong timeout");
        this.isAlive = false;
      }, this.pongTimeout);
    }, this.pingInterval);

    this.socket.on("pong", () => {
      this.isAlive = true;
      this.missedPongs = 0;
      if (this.pongTimer) {
        clearTimeout(this.pongTimer);
      }
    });
  }

  stop() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.pongTimer) {
      clearTimeout(this.pongTimer);
    }
  }
}
```

### Connection Pool Management

```javascript
class WebSocketPool {
  constructor(options = {}) {
    this.connections = new Map();
    this.groups = new Map();
    this.maxConnections = options.maxConnections || 1000;
    this.cleanupInterval = options.cleanupInterval || 60000;
    this.startCleanup();
  }

  addConnection(id, socket, metadata = {}) {
    if (this.connections.size >= this.maxConnections) {
      throw new Error("Maximum connections reached");
    }

    const connection = {
      id,
      socket,
      metadata,
      connectedAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.connections.set(id, connection);
    this.setupConnectionHandlers(connection);

    console.log(`Connection added: ${id} (Total: ${this.connections.size})`);
    return connection;
  }

  removeConnection(id) {
    const connection = this.connections.get(id);
    if (connection) {
      connection.socket.terminate();
      this.connections.delete(id);
      this.removeFromAllGroups(id);
      console.log(
        `Connection removed: ${id} (Total: ${this.connections.size})`
      );
    }
  }

  setupConnectionHandlers(connection) {
    connection.socket.on("message", (data) => {
      connection.lastActivity = Date.now();
    });

    connection.socket.on("close", () => {
      this.removeConnection(connection.id);
    });

    connection.socket.on("error", (error) => {
      console.error(`Connection error for ${connection.id}:`, error);
      this.removeConnection(connection.id);
    });
  }

  broadcast(message, excludeId = null) {
    const data =
      typeof message === "string" ? message : JSON.stringify(message);
    let sent = 0;

    this.connections.forEach((connection) => {
      if (connection.id !== excludeId && connection.socket.readyState === 1) {
        connection.socket.send(data);
        sent++;
      }
    });

    return sent;
  }

  broadcastToGroup(groupId, message, excludeId = null) {
    const group = this.groups.get(groupId);
    if (!group) return 0;

    const data =
      typeof message === "string" ? message : JSON.stringify(message);
    let sent = 0;

    group.forEach((connectionId) => {
      if (connectionId !== excludeId) {
        const connection = this.connections.get(connectionId);
        if (connection && connection.socket.readyState === 1) {
          connection.socket.send(data);
          sent++;
        }
      }
    });

    return sent;
  }

  addToGroup(groupId, connectionId) {
    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, new Set());
    }
    this.groups.get(groupId).add(connectionId);
  }

  removeFromGroup(groupId, connectionId) {
    const group = this.groups.get(groupId);
    if (group) {
      group.delete(connectionId);
      if (group.size === 0) {
        this.groups.delete(groupId);
      }
    }
  }

  removeFromAllGroups(connectionId) {
    this.groups.forEach((group, groupId) => {
      group.delete(connectionId);
      if (group.size === 0) {
        this.groups.delete(groupId);
      }
    });
  }

  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const staleConnections = [];

      this.connections.forEach((connection) => {
        // Remove connections inactive for more than 10 minutes
        if (now - connection.lastActivity > 600000) {
          staleConnections.push(connection.id);
        }
      });

      staleConnections.forEach((id) => this.removeConnection(id));

      if (staleConnections.length > 0) {
        console.log(`Cleaned up ${staleConnections.length} stale connections`);
      }
    }, this.cleanupInterval);
  }

  getStats() {
    const now = Date.now();
    let activeConnections = 0;
    let totalGroups = this.groups.size;

    this.connections.forEach((connection) => {
      if (connection.socket.readyState === 1) {
        activeConnections++;
      }
    });

    return {
      totalConnections: this.connections.size,
      activeConnections,
      totalGroups,
      uptime: now - this.startTime,
    };
  }
}
```

## Server-Side Implementation

### Node.js WebSocket Server

```javascript
const WebSocket = require("ws");
const http = require("http");
const crypto = require("crypto");

class CustomWebSocketServer {
  constructor(options = {}) {
    this.port = options.port || 8080;
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    this.connectionPool = new WebSocketPool();
    this.messageHandlers = new Map();
    this.middleware = [];

    this.setupRoutes();
    this.setupWebSocketHandlers();
  }

  setupRoutes() {
    this.server.on("request", (req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(this.connectionPool.getStats()));
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });
  }

  setupWebSocketHandlers() {
    this.wss.on("connection", (ws, req) => {
      const connectionId = this.generateConnectionId();
      const connection = this.connectionPool.addConnection(connectionId, ws, {
        userAgent: req.headers["user-agent"],
        ip: req.connection.remoteAddress,
      });

      // Setup keep-alive
      const keepAlive = new WebSocketKeepAlive(ws);
      keepAlive.start();

      ws.on("message", async (data) => {
        try {
          await this.processMessage(connection, data);
        } catch (error) {
          console.error("Error processing message:", error);
          this.sendError(ws, "Message processing failed");
        }
      });

      ws.on("close", () => {
        keepAlive.stop();
        console.log(`Client disconnected: ${connectionId}`);
      });

      // Send welcome message
      this.send(ws, {
        type: "connection",
        id: connectionId,
        message: "Connected successfully",
      });
    });
  }

  async processMessage(connection, rawData) {
    // Apply middleware
    for (const middleware of this.middleware) {
      const result = await middleware(connection, rawData);
      if (result === false) return; // Middleware rejected the message
    }

    let message;
    try {
      message = JSON.parse(rawData.toString());
    } catch (error) {
      this.sendError(connection.socket, "Invalid JSON");
      return;
    }

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      await handler(connection, message);
    } else {
      this.sendError(
        connection.socket,
        `Unknown message type: ${message.type}`
      );
    }
  }

  addMessageHandler(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  sendError(ws, message) {
    this.send(ws, { type: "error", message });
  }

  broadcast(message, excludeId = null) {
    return this.connectionPool.broadcast(message, excludeId);
  }

  generateConnectionId() {
    return crypto.randomBytes(16).toString("hex");
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`WebSocket server listening on port ${this.port}`);
    });
  }
}

// Usage example
const server = new CustomWebSocketServer({ port: 8080 });

// Add authentication middleware
server.addMiddleware(async (connection, data) => {
  // Check authentication token
  const message = JSON.parse(data.toString());
  if (message.type !== "auth" && !connection.authenticated) {
    server.sendError(connection.socket, "Authentication required");
    return false;
  }
  return true;
});

// Add message handlers
server.addMessageHandler("auth", async (connection, message) => {
  // Validate token
  if (message.token === "valid-token") {
    connection.authenticated = true;
    server.send(connection.socket, { type: "auth", status: "success" });
  } else {
    server.sendError(connection.socket, "Invalid token");
    connection.socket.close();
  }
});

server.addMessageHandler("chat", async (connection, message) => {
  if (!connection.authenticated) return;

  const chatMessage = {
    type: "chat",
    id: crypto.randomUUID(),
    user: connection.metadata.userId,
    message: message.content,
    timestamp: Date.now(),
  };

  server.broadcast(chatMessage, connection.id);
});

server.start();
```

## Real-Time Communication Patterns

### Request-Response Pattern

WebSocket connections are bidirectional, but sometimes you need request-response semantics similar to HTTP. This pattern implements RPC (Remote Procedure Call) functionality over WebSocket connections, enabling asynchronous method calls with promise-based responses.

**RPC Pattern Benefits:**

1. **Asynchronous Operations**: Non-blocking remote method calls
2. **Promise-Based API**: Modern async/await compatibility
3. **Request Tracking**: Automatic correlation of requests and responses
4. **Timeout Handling**: Prevents hanging requests with configurable timeouts
5. **Error Propagation**: Proper error handling across the connection

**How it works:**

1. Client sends request with unique ID and method name
2. Server processes request and sends response with matching ID
3. Client correlates response with pending request using ID
4. Promise resolves with result or rejects with error

**Input:** Method name, parameters, optional timeout
**Output:** Promise resolving to method result or rejecting with error

```javascript
class WebSocketRPC {
  constructor(socket) {
    this.socket = socket; // WebSocket connection instance
    this.pendingRequests = new Map(); // Track ongoing requests by ID
    this.requestId = 0; // Counter for unique request IDs
    this.setupMessageHandler(); // Initialize response handling
  }

  setupMessageHandler() {
    this.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.id && this.pendingRequests.has(data.id)) {
        const { resolve, reject } = this.pendingRequests.get(data.id);
        this.pendingRequests.delete(data.id);

        if (data.error) {
          reject(new Error(data.error));
        } else {
          resolve(data.result);
        }
      }
    });
  }

  async call(method, params = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error("Request timeout"));
      }, timeout);

      this.pendingRequests.set(id, {
        resolve: (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });

      this.socket.send(
        JSON.stringify({
          id,
          method,
          params,
        })
      );
    });
  }
}

// Usage
const rpc = new WebSocketRPC(socket);

try {
  const result = await rpc.call("getUserProfile", { userId: 123 });
  console.log("User profile:", result);
} catch (error) {
  console.error("RPC error:", error);
}
```

### Pub/Sub Pattern

The Publish/Subscribe pattern enables event-driven communication where clients can subscribe to specific channels and receive real-time updates. This pattern is ideal for implementing features like live notifications, chat rooms, or real-time data feeds.

**Pub/Sub Pattern Benefits:**

1. **Decoupled Communication**: Publishers and subscribers don't need direct knowledge of each other
2. **Scalable Broadcasting**: One message can reach multiple subscribers efficiently
3. **Channel-Based Filtering**: Clients only receive messages from subscribed channels
4. **Dynamic Subscriptions**: Subscribe and unsubscribe from channels at runtime
5. **Event-Driven Architecture**: Reactive programming model for real-time applications

**How it works:**

1. Client subscribes to one or more channels
2. Server maintains subscription mappings for each client
3. When events occur, server publishes to relevant channels
4. All subscribers to a channel receive the published message
5. Clients can unsubscribe to stop receiving updates

**Use Cases:**

- Live chat applications with multiple rooms
- Real-time notifications and alerts
- Live data feeds (stock prices, sports scores)
- Collaborative editing with multi-user updates

**Input:** Channel name and subscription callback
**Output:** Real-time messages from subscribed channels

```javascript
class WebSocketPubSub {
  constructor(socket) {
    this.socket = socket; // WebSocket connection instance
    this.subscriptions = new Map(); // Channel subscriptions registry
    this.setupMessageHandler(); // Initialize message routing
  }

  setupMessageHandler() {
    this.socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "publish") {
        const callbacks = this.subscriptions.get(data.channel);
        if (callbacks) {
          callbacks.forEach((callback) => {
            try {
              callback(data.payload);
            } catch (error) {
              console.error("Subscription callback error:", error);
            }
          });
        }
      }
    });
  }

  subscribe(channel, callback) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());

      // Send subscription request to server
      this.socket.send(
        JSON.stringify({
          type: "subscribe",
          channel,
        })
      );
    }

    this.subscriptions.get(channel).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(channel);
      if (callbacks) {
        callbacks.delete(callback);

        if (callbacks.size === 0) {
          this.subscriptions.delete(channel);

          // Send unsubscription request to server
          this.socket.send(
            JSON.stringify({
              type: "unsubscribe",
              channel,
            })
          );
        }
      }
    };
  }

  publish(channel, payload) {
    this.socket.send(
      JSON.stringify({
        type: "publish",
        channel,
        payload,
      })
    );
  }
}

// Usage
const pubsub = new WebSocketPubSub(socket);

// Subscribe to user events
const unsubscribe = pubsub.subscribe("user.events", (data) => {
  console.log("User event:", data);
});

// Publish a message
pubsub.publish("user.events", {
  action: "login",
  userId: 123,
  timestamp: Date.now(),
});

// Unsubscribe later
unsubscribe();
```

## Security Considerations

### Secure WebSocket Implementation

WebSocket security requires careful consideration of authentication, authorization, and protection against various attack vectors. This implementation demonstrates comprehensive security measures for production WebSocket applications.

**Security Measures Implemented:**

1. **Secure Transport**: Always use WSS (WebSocket Secure) for encrypted connections
2. **Authentication**: Token-based authentication with proper validation
3. **CSRF Protection**: Cross-Site Request Forgery tokens for additional security
4. **Message Validation**: Strict validation of incoming message structure
5. **Token Refresh**: Automatic handling of authentication token renewal
6. **Input Sanitization**: Prevention of malicious message content

**Security Threats Addressed:**

- **Man-in-the-Middle Attacks**: WSS encryption prevents eavesdropping
- **Cross-Site WebSocket Hijacking**: Origin validation and CSRF tokens
- **Authentication Bypass**: Proper token validation and refresh
- **Message Injection**: Strict message structure validation
- **Denial of Service**: Rate limiting and connection management

**Authentication Flow:**

1. Client authenticates with credentials to obtain tokens
2. WebSocket connection includes authentication headers
3. Server validates tokens before accepting connection
4. Ongoing token refresh maintains session security

**Input:** User credentials and security configuration
**Output:** Secure WebSocket connection with validated authentication

```javascript
class SecureWebSocketClient {
  constructor(url, options = {}) {
    this.url = url; // WebSocket server URL
    this.options = options; // Security configuration options
    this.authToken = null; // JWT or similar authentication token
    this.csrfToken = null; // Cross-Site Request Forgery token
  }

  async connect(credentials) {
    // Use WSS for secure connections
    const secureUrl = this.url.replace("ws://", "wss://");

    // Get authentication token
    this.authToken = await this.authenticate(credentials);
    this.csrfToken = await this.getCSRFToken();

    const socket = new WebSocket(secureUrl, [], {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "X-CSRF-Token": this.csrfToken,
      },
    });

    return new Promise((resolve, reject) => {
      socket.onopen = () => {
        this.socket = socket;
        this.setupSecurityHandlers();
        resolve(socket);
      };

      socket.onerror = reject;
    });
  }

  setupSecurityHandlers() {
    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        // Validate message structure
        if (!this.validateMessage(data)) {
          console.warn("Invalid message structure received");
          return;
        }

        // Check for token refresh
        if (data.type === "token_refresh") {
          this.authToken = data.token;
        }

        this.handleMessage(data);
      } catch (error) {
        console.error("Message processing error:", error);
      }
    });
  }

  validateMessage(data) {
    // Implement message validation logic
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.type === "string" &&
      data.type.length > 0
    );
  }

  sendSecureMessage(data) {
    const message = {
      ...data,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
      auth: this.authToken,
    };

    this.socket.send(JSON.stringify(message));
  }

  async authenticate(credentials) {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    return data.token;
  }

  async getCSRFToken() {
    const response = await fetch("/api/csrf-token");
    const data = await response.json();
    return data.token;
  }
}
```

### Rate Limiting and DDoS Protection

```javascript
class WebSocketRateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.clients = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
  }

  checkLimit(clientId) {
    const now = Date.now();
    const client = this.clients.get(clientId) || {
      requests: [],
      blocked: false,
    };

    // Remove old requests outside the window
    client.requests = client.requests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    // Check if client is blocked
    if (client.blocked && client.blockExpiry > now) {
      return false;
    }

    // Check rate limit
    if (client.requests.length >= this.maxRequests) {
      client.blocked = true;
      client.blockExpiry = now + this.windowMs;
      this.clients.set(clientId, client);
      return false;
    }

    // Add current request
    client.requests.push(now);
    client.blocked = false;
    this.clients.set(clientId, client);

    return true;
  }

  cleanup() {
    const now = Date.now();
    for (const [clientId, client] of this.clients.entries()) {
      // Remove expired blocks and old request records
      if (client.blocked && client.blockExpiry <= now) {
        client.blocked = false;
        client.requests = [];
      }

      // Remove clients with no recent activity
      if (client.requests.length === 0 && !client.blocked) {
        this.clients.delete(clientId);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Server integration
const rateLimiter = new WebSocketRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 50, // 50 requests per minute
});

server.addMiddleware(async (connection, data) => {
  const clientId = connection.metadata.ip;

  if (!rateLimiter.checkLimit(clientId)) {
    server.sendError(connection.socket, "Rate limit exceeded");
    return false;
  }

  return true;
});
```

## Performance Optimization

### Connection Pooling and Load Balancing

```javascript
class WebSocketLoadBalancer {
  constructor(servers) {
    this.servers = servers.map((server, index) => ({
      ...server,
      id: index,
      connections: 0,
      healthy: true,
    }));
    this.currentIndex = 0;
    this.healthCheckInterval = setInterval(() => this.healthCheck(), 30000);
  }

  getServer() {
    // Round-robin with health check
    const healthyServers = this.servers.filter((server) => server.healthy);

    if (healthyServers.length === 0) {
      throw new Error("No healthy servers available");
    }

    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex = (this.currentIndex + 1) % healthyServers.length;

    return server;
  }

  async healthCheck() {
    for (const server of this.servers) {
      try {
        const response = await fetch(
          `http://${server.host}:${server.port}/health`
        );
        server.healthy = response.ok;
      } catch (error) {
        server.healthy = false;
      }
    }
  }

  connect(url) {
    const server = this.getServer();
    const serverUrl = `ws://${server.host}:${server.port}${url}`;

    const socket = new WebSocket(serverUrl);

    socket.addEventListener("open", () => {
      server.connections++;
    });

    socket.addEventListener("close", () => {
      server.connections--;
    });

    return socket;
  }
}
```

### Message Compression and Batching

```javascript
class WebSocketOptimizer {
  constructor(socket, options = {}) {
    this.socket = socket;
    this.batchSize = options.batchSize || 10;
    this.batchTimeout = options.batchTimeout || 100;
    this.compressionThreshold = options.compressionThreshold || 1024;
    this.messageQueue = [];
    this.batchTimer = null;
  }

  send(data) {
    this.messageQueue.push({
      data,
      timestamp: Date.now(),
    });

    if (this.messageQueue.length >= this.batchSize) {
      this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchTimeout);
    }
  }

  flush() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    if (this.messageQueue.length === 0) return;

    const messages = this.messageQueue.splice(0);

    if (messages.length === 1) {
      this.sendSingle(messages[0].data);
    } else {
      this.sendBatch(messages.map((m) => m.data));
    }
  }

  sendSingle(data) {
    const serialized = JSON.stringify(data);

    if (serialized.length > this.compressionThreshold) {
      this.sendCompressed(serialized);
    } else {
      this.socket.send(serialized);
    }
  }

  sendBatch(messages) {
    const batchMessage = {
      type: "batch",
      messages,
      count: messages.length,
    };

    this.sendSingle(batchMessage);
  }

  async sendCompressed(data) {
    try {
      // Use compression (browser CompressionStream API)
      const stream = new CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const chunks = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }

      const compressed = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );

      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }

      this.socket.send(compressed);
    } catch (error) {
      console.warn("Compression failed, sending uncompressed:", error);
      this.socket.send(data);
    }
  }
}
```

## Real-World Implementation Examples

### Real-Time Chat Application

This comprehensive chat application demonstrates practical WebSocket usage with advanced features like typing indicators, user presence, and room management. The implementation showcases real-world patterns and best practices for building production-ready chat systems.

**Chat Application Features:**

1. **Multi-Room Support**: Users can join different chat rooms
2. **Real-Time Messaging**: Instant message delivery and display
3. **User Presence**: Track online users in each room
4. **Typing Indicators**: Show when users are typing
5. **Message History**: Maintain local message cache
6. **Connection Management**: Robust connection handling with reconnection

**Application Architecture:**

- **Client-Side**: Manages UI, local state, and WebSocket communication
- **Message Types**: Structured message protocol for different actions
- **Event Handling**: Comprehensive event system for all chat features
- **State Management**: Track users, messages, and room information

**Message Protocol:**

- `join`: User joins a chat room
- `message`: Text message in a room
- `typing`/`stopTyping`: Typing indicator status
- `userJoined`/`userLeft`: User presence updates

**Input:** Username, room name, and message content
**Output:** Real-time chat interface with live updates

```javascript
class ChatApplication {
  constructor() {
    this.socket = null; // WebSocket connection instance
    this.messages = []; // Local message history cache
    this.users = new Map(); // Active users in current room
    this.currentRoom = null; // Currently active chat room
    this.typing = new Set(); // Users currently typing
  }

  async connect(username, room) {
    const socket = new WebSocketClient("ws://localhost:8080/chat");

    socket.on("open", () => {
      socket.send({
        type: "join",
        username,
        room,
      });
    });

    socket.on("message", (data) => {
      this.handleMessage(data);
    });

    this.socket = socket;
    await socket.connect();
    this.currentRoom = room;
  }

  handleMessage(data) {
    switch (data.type) {
      case "message":
        this.addMessage(data);
        break;
      case "userJoined":
        this.addUser(data.user);
        break;
      case "userLeft":
        this.removeUser(data.user);
        break;
      case "typing":
        this.handleTyping(data);
        break;
      case "stopTyping":
        this.handleStopTyping(data);
        break;
    }
  }

  sendMessage(content) {
    const message = {
      type: "message",
      content,
      room: this.currentRoom,
      timestamp: Date.now(),
    };

    this.socket.send(message);
  }

  startTyping() {
    this.socket.send({
      type: "typing",
      room: this.currentRoom,
    });
  }

  stopTyping() {
    this.socket.send({
      type: "stopTyping",
      room: this.currentRoom,
    });
  }

  addMessage(message) {
    this.messages.push(message);
    this.renderMessage(message);
  }

  addUser(user) {
    this.users.set(user.id, user);
    this.updateUserList();
  }

  removeUser(user) {
    this.users.delete(user.id);
    this.updateUserList();
  }

  handleTyping(data) {
    this.typing.add(data.user);
    this.updateTypingIndicator();
  }

  handleStopTyping(data) {
    this.typing.delete(data.user);
    this.updateTypingIndicator();
  }

  renderMessage(message) {
    const messagesContainer = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = "message";
    messageElement.innerHTML = `
      <span class="username">${message.username}:</span>
      <span class="content">${message.content}</span>
      <span class="timestamp">${new Date(
        message.timestamp
      ).toLocaleTimeString()}</span>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  updateUserList() {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    this.users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.className = "user";
      userElement.textContent = user.username;
      userList.appendChild(userElement);
    });
  }

  updateTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");

    if (this.typing.size > 0) {
      const users = Array.from(this.typing).join(", ");
      indicator.textContent = `${users} ${
        this.typing.size === 1 ? "is" : "are"
      } typing...`;
      indicator.style.display = "block";
    } else {
      indicator.style.display = "none";
    }
  }
}

// Initialize chat application
const chat = new ChatApplication();

document.getElementById("joinButton").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const room = document.getElementById("room").value;

  if (username && room) {
    await chat.connect(username, room);
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("chatContainer").style.display = "block";
  }
});

document.getElementById("messageInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const content = e.target.value.trim();
    if (content) {
      chat.sendMessage(content);
      e.target.value = "";
    }
  }
});

// Typing indicators
let typingTimer;
document.getElementById("messageInput").addEventListener("input", () => {
  chat.startTyping();

  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    chat.stopTyping();
  }, 1000);
});
```

## Error Handling and Debugging

### Comprehensive Error Handling

```javascript
class WebSocketErrorHandler {
  constructor(socket) {
    this.socket = socket;
    this.errorCounts = new Map();
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    this.socket.addEventListener("error", (event) => {
      this.handleError("connection", event);
    });

    this.socket.addEventListener("close", (event) => {
      if (!event.wasClean) {
        this.handleError("close", event);
      }
    });

    // Catch message parsing errors
    const originalOnMessage = this.socket.onmessage;
    this.socket.onmessage = (event) => {
      try {
        if (originalOnMessage) {
          originalOnMessage.call(this.socket, event);
        }
      } catch (error) {
        this.handleError("message", error, event.data);
      }
    };
  }

  handleError(type, error, context = null) {
    const errorInfo = {
      type,
      error: error.message || error.toString(),
      timestamp: Date.now(),
      context,
      stack: error.stack,
    };

    // Track error frequency
    const key = `${type}:${error.message}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

    // Log error
    console.error("WebSocket error:", errorInfo);

    // Report to error tracking service
    this.reportError(errorInfo);

    // Handle specific error types
    switch (type) {
      case "connection":
        this.handleConnectionError(error);
        break;
      case "close":
        this.handleCloseError(error);
        break;
      case "message":
        this.handleMessageError(error, context);
        break;
    }
  }

  handleConnectionError(error) {
    // Implement connection error recovery
    console.log("Attempting to recover from connection error");
  }

  handleCloseError(event) {
    const closeReasons = {
      1000: "Normal closure",
      1001: "Going away",
      1002: "Protocol error",
      1003: "Unsupported data",
      1004: "Reserved",
      1005: "No status received",
      1006: "Abnormal closure",
      1007: "Invalid frame payload data",
      1008: "Policy violation",
      1009: "Message too big",
      1010: "Missing extension",
      1011: "Internal error",
      1015: "TLS handshake failure",
    };

    const reason = closeReasons[event.code] || "Unknown reason";
    console.log(`Connection closed: ${event.code} - ${reason}`);
  }

  handleMessageError(error, data) {
    console.error("Failed to process message:", data, error);
  }

  reportError(errorInfo) {
    // Send to error tracking service
    if (window.errorTracker) {
      window.errorTracker.captureException(errorInfo);
    }
  }

  getErrorStats() {
    return Object.fromEntries(this.errorCounts);
  }
}
```

### WebSocket Debugging Tools

```javascript
class WebSocketDebugger {
  constructor(socket) {
    this.socket = socket;
    this.logs = [];
    this.stats = {
      messagesSent: 0,
      messagesReceived: 0,
      bytesSent: 0,
      bytesReceived: 0,
      connectTime: null,
      lastActivity: null,
    };

    this.setupLogging();
  }

  setupLogging() {
    const originalSend = this.socket.send.bind(this.socket);
    this.socket.send = (data) => {
      this.logMessage("sent", data);
      this.stats.messagesSent++;
      this.stats.bytesSent += this.getDataSize(data);
      this.stats.lastActivity = Date.now();
      return originalSend(data);
    };

    this.socket.addEventListener("open", (event) => {
      this.stats.connectTime = Date.now();
      this.logEvent("connected", event);
    });

    this.socket.addEventListener("message", (event) => {
      this.logMessage("received", event.data);
      this.stats.messagesReceived++;
      this.stats.bytesReceived += this.getDataSize(event.data);
      this.stats.lastActivity = Date.now();
    });

    this.socket.addEventListener("close", (event) => {
      this.logEvent("closed", event);
    });

    this.socket.addEventListener("error", (event) => {
      this.logEvent("error", event);
    });
  }

  logMessage(direction, data) {
    const entry = {
      type: "message",
      direction,
      data: this.formatData(data),
      size: this.getDataSize(data),
      timestamp: Date.now(),
    };

    this.logs.push(entry);
    this.trimLogs();

    console.log(`WebSocket ${direction}:`, entry);
  }

  logEvent(type, event) {
    const entry = {
      type: "event",
      event: type,
      details: this.formatEvent(event),
      timestamp: Date.now(),
    };

    this.logs.push(entry);
    this.trimLogs();

    console.log(`WebSocket ${type}:`, entry);
  }

  formatData(data) {
    if (typeof data === "string") {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }

  formatEvent(event) {
    return {
      type: event.type,
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean,
    };
  }

  getDataSize(data) {
    if (typeof data === "string") {
      return new Blob([data]).size;
    } else if (data instanceof ArrayBuffer) {
      return data.byteLength;
    } else if (data instanceof Blob) {
      return data.size;
    }
    return 0;
  }

  trimLogs() {
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-500);
    }
  }

  exportLogs() {
    return {
      logs: this.logs,
      stats: this.stats,
      exportTime: Date.now(),
    };
  }

  printStats() {
    console.table(this.stats);
  }
}

// Usage
const debugger = new WebSocketDebugger(socket);

// Export logs for analysis
const logs = debugger.exportLogs();
console.log("WebSocket debug data:", logs);
```

## Best Practices and Common Pitfalls

### Connection Management Best Practices

This section outlines essential best practices for WebSocket development and highlights common mistakes that can lead to unreliable connections, memory leaks, or security vulnerabilities. Following these patterns will ensure robust, production-ready WebSocket applications.

**Key Best Practices:**

1. **Proper Lifecycle Management**: Handle all connection states gracefully
2. **Resource Cleanup**: Always clean up timers, listeners, and references
3. **Error Handling**: Implement comprehensive error handling and recovery
4. **Connection Timeouts**: Prevent hanging connections with timeouts
5. **Graceful Shutdown**: Properly close connections with appropriate codes

**Common Pitfalls to Avoid:**

- Forgetting to handle connection errors and cleanup
- Not implementing reconnection logic for production use
- Missing proper event listener management
- Inadequate message validation and error handling
- Poor connection state management

**Comparison: Good vs Bad Practices**

```javascript
// ✅ GOOD: Proper connection lifecycle management
class RobustWebSocketClient {
  constructor(url, options = {}) {
    this.url = url; // Store connection parameters
    this.options = options; // Configuration options
    this.socket = null; // WebSocket instance reference
    this.reconnectEnabled = true; // Control reconnection behavior
    this.eventListeners = new Map(); // Track event listeners for cleanup
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url);

        const timeout = setTimeout(() => {
          this.socket.close();
          reject(new Error("Connection timeout"));
        }, 10000);

        this.socket.onopen = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          reject(error);
        };

        this.setupEventHandlers();
      } catch (error) {
        reject(error);
      }
    });
  }

  setupEventHandlers() {
    this.socket.onclose = (event) => {
      if (this.reconnectEnabled && !event.wasClean) {
        this.handleReconnect();
      }
    };
  }

  disconnect() {
    this.reconnectEnabled = false;
    if (this.socket) {
      this.socket.close(1000, "Normal closure");
    }
  }
}

// ❌ BAD: No error handling or connection management
class BadWebSocketClient {
  constructor(url) {
    this.socket = new WebSocket(url); // Can throw immediately - no try/catch
    // Missing: Error handling, reconnection logic, state management
    // Missing: Timeout protection, resource cleanup
    // Missing: Proper event listener setup
  }
}
```

### Message Handling Best Practices

Proper message handling is crucial for building reliable WebSocket applications. This section demonstrates the difference between robust message processing and common mistakes that can lead to application crashes or security vulnerabilities.

**Message Handling Best Practices:**

1. **Input Validation**: Always validate message structure and content
2. **Error Isolation**: Catch and handle parsing errors gracefully
3. **Middleware Support**: Implement extensible message processing pipeline
4. **Type Safety**: Ensure message types are properly defined and handled
5. **Async Processing**: Support asynchronous message handlers

```javascript
// ✅ GOOD: Structured message handling with validation
class MessageHandler {
  constructor() {
    this.handlers = new Map(); // Message type to handler mapping
    this.middleware = []; // Message processing middleware
  }

  addHandler(type, handler) {
    this.handlers.set(type, handler);
  }

  async processMessage(rawData) {
    try {
      let message = this.parseMessage(rawData);

      // Apply middleware
      for (const middleware of this.middleware) {
        message = await middleware(message);
        if (!message) return; // Middleware rejected message
      }

      // Validate message structure
      if (!this.validateMessage(message)) {
        throw new Error("Invalid message structure");
      }

      // Handle message
      const handler = this.handlers.get(message.type);
      if (handler) {
        await handler(message);
      } else {
        console.warn(`No handler for message type: ${message.type}`);
      }
    } catch (error) {
      console.error("Message processing error:", error);
    }
  }

  parseMessage(data) {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  }

  validateMessage(message) {
    return message && typeof message.type === "string";
  }
}

// ❌ BAD: No error handling or validation
class BadMessageHandler {
  handleMessage(data) {
    const message = JSON.parse(data); // Can throw on invalid JSON
    this.handlers[message.type](message); // Can be undefined - will crash
    // Missing: Error handling, input validation, null checks
    // Missing: Async support, middleware, proper error isolation
  }
}
```

### Performance Optimization Tips

```javascript
// ✅ Good: Efficient message batching and throttling
class OptimizedWebSocket {
  constructor(socket) {
    this.socket = socket;
    this.messageQueue = [];
    this.batchTimer = null;
    this.lastSend = 0;
    this.minInterval = 16; // ~60fps
  }

  send(data) {
    const now = Date.now();

    if (now - this.lastSend < this.minInterval) {
      // Batch messages to avoid flooding
      this.messageQueue.push(data);
      this.scheduleBatch();
    } else {
      this.sendImmediate(data);
    }
  }

  sendImmediate(data) {
    this.socket.send(JSON.stringify(data));
    this.lastSend = Date.now();
  }

  scheduleBatch() {
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushBatch();
      }, this.minInterval);
    }
  }

  flushBatch() {
    if (this.messageQueue.length > 0) {
      const batch = {
        type: "batch",
        messages: this.messageQueue.splice(0),
      };
      this.sendImmediate(batch);
    }
    this.batchTimer = null;
  }
}

// ❌ Bad: Sending messages without any throttling
class BadWebSocket {
  send(data) {
    this.socket.send(JSON.stringify(data)); // Can flood the connection
  }
}
```

## Conclusion

WebSockets provide a powerful foundation for real-time web applications, enabling efficient bidirectional communication between clients and servers. Understanding the underlying protocol, from the initial HTTP handshake to frame-level communication, is crucial for building robust applications.

### Key Takeaways

1. **Protocol Understanding**: The WebSocket handshake process and frame structure enable efficient real-time communication while maintaining compatibility with existing web infrastructure.

2. **Connection Management**: Proper connection lifecycle management, including reconnection strategies and heartbeat mechanisms, ensures reliable real-time communication.

3. **Security Considerations**: Implementing proper authentication, rate limiting, and using secure connections (WSS) is essential for production applications.

4. **Performance Optimization**: Message batching, compression, and efficient connection pooling can significantly improve application performance.

5. **Error Handling**: Comprehensive error handling and debugging tools are crucial for maintaining stable WebSocket connections in production environments.

### Future Considerations

WebSocket technology continues to evolve with new standards like WebTransport providing enhanced capabilities for specific use cases. However, WebSockets remain the standard choice for most real-time web applications due to their widespread support and proven reliability.

### Further Resources

- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [RFC 6455 - The WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [WebSocket Security Considerations](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
- [Socket.IO Documentation](https://socket.io/docs/)
- [WebTransport API](https://developer.mozilla.org/en-US/docs/Web/API/WebTransport)

The WebSocket ecosystem continues to grow with libraries and frameworks that simplify development while providing advanced features like automatic reconnection, room management, and scaling solutions for production applications.
