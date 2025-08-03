# Google Docs System Design: Real-Time Collaborative Document Editing

*System design interview question: Design a collaborative document editor that allows users to collaborate on a document in real-time.*

---

## Overview

Google Docs and similar collaborative editors (e.g., Notion, Quip, Etherpad) enable multiple users to edit documents simultaneously, with changes reflected in real-time. This document provides a deep, technical dive into the architecture, data model, protocols, and conflict resolution strategies that power such systems, focusing on the collaboration aspects rather than the text editing core. It covers all major and minor aspects, trade-offs, and real-world considerations.

---

## 1. Requirements Exploration

### Functional Requirements
- Any participant can edit/view the document
- Updates by peers are reflected automatically and in real-time
- Conflicts are resolved if participants edit the same part
- All participants eventually see the same document revision (eventual consistency)
- (Optional) Offline usage

### Non-Functional Requirements
- Real-time updates (sub-500ms latency)
- Support up to 100 concurrent editors ([Google's documented limit](https://support.google.com/docs/answer/2494822))

---

## 2. Collaboration Challenges & Background

- **Responsiveness:** Local edits must appear instantly (zero-latency UX)
- **Real-time updates:** Peer edits must propagate quickly
- **Conflict-prone:** Simultaneous edits to the same region are common
- **Distributed:** Users are globally distributed, each on their own device
- **Ad hoc:** Participants can join/leave at any time
- **Unpredictable:** Editing patterns are not pre-scripted

> **Main challenge:** How to correctly apply remote edits that were made on different document versions, possibly conflicting with local changes?

### Groupware Systems
- Collaborative editors are a type of "groupware system"
- Each browser tab/session is treated as a separate participant
- Complexity arises from network latency and the need for instant local feedback

---

## 3. Rendering and Editing Rich Text

- Most web-based editors use `contenteditable` with a custom document model and event handling
- Google Docs is moving towards a `<canvas>`-based renderer for performance and consistency ([announcement](https://workspaceupdates.googleblog.com/2021/05/Google-Docs-Canvas-Based-Rendering-Update.html))
- The document model is typically a tree (root → paragraphs/headings → text nodes)
- See the [Rich Text Editor system design article](./10-rich-text-editor.md) for a deep dive on the editing core

---

## 4. Network Architecture & Communication Model

### Client-Server Model
![Client-server architecture](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/client-server-architecture.png)
- Central server holds the source of truth
- All clients communicate only with the server
- New participants fetch the latest document from the server
- Robust, scalable, and enables database persistence
- Server can broadcast updates, handle late joiners, and persist history

### Peer-to-Peer Model
![Peer-to-peer architecture](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/peer-to-peer-architecture.png)
- Peers communicate directly
- Harder to synchronize, not ideal for document editing
- Security, consensus, and persistence are more complex

> **Client-server is preferred for collaborative document editing.**

---

## 5. Request Payloads: Full Document vs. Deltas

- **Full document:** Easy to reason about, but not scalable for large docs; inefficient for real-time
- **Deltas (operations):** Only send the changes (insert, delete, format, etc.)
  - Small, efficient, but require version tracking and conflict resolution
  - Each operation includes type, position, and payload (e.g., insert, delete, format)

---

## 6. Concurrency Control & Conflict Resolution

### Concurrency Models
- **Pessimistic:** Locking, floor control (token-based, chair-controlled)
- **Optimistic:** Local edits applied instantly, conflicts resolved after the fact
- **Version-detection:** Each update includes the document revision it was based on; server transforms or rejects as needed

### Conflict Resolution Approaches
- **Operational Transformations (OT):** Transform operations to preserve intent and causality
- **Conflict-free Replicated Data Types (CRDTs):** Use data structures that guarantee convergence regardless of operation order

#### Example: Alice & Bob Edit
![Alice and Bob network diagram without operational transformations](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/alice-bob-without-ot.png)
- Without OT, order of operations can lead to divergent states

![Alice and Bob network diagram with operational transformations](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/alice-bob-with-ot.png)
- With OT, operations are transformed so all replicas converge

#### OT vs. CRDTs
- **OT:** Mature, used by Google Docs, excels for text editing; requires transformation functions and revision tracking
- **CRDTs:** Modern, used by Figma, more general but complex for text; commutative/associative operations, metadata overhead

#### Conflict Resolution Properties
- **Convergence:** All replicas eventually reach the same state
- **Causality preservation:** Order of operations respects dependencies
- **Intention preservation:** User intent is maintained after merging

---

## 7. Collaboration Protocol & Update Scheduling

- **Local updates buffer:** Edits are batched locally
- **Sent updates buffer:** Tracks in-flight operations
- **Only one in-flight request per client:** Ensures ordered delivery
- **Server broadcasts updates to all clients**
- **Clients transform incoming operations as needed**
- **Revision numbers:** Used to track document state and synchronize

#### Fast vs. Slow Connections
![Fast vs slow connection for edit requests](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/fast-slow-connection-requests.png)
- Fast clients send more frequent, smaller requests
- Slow clients send less frequent, larger requests

#### Collaboration Example
![Collaboration part 1](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/collaboration-part-1.png)
![Collaboration part 2](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/collaboration-part-2.png)

#### Operation Granularity
- Coalesce continuous typing/deletion into single operations
- Each request can contain multiple operations
- Operations are intention-based (insert, delete, format, etc.)

---

## 8. Data Model

- **Document state:** Tree structure (root → paragraphs/headings → text nodes)
- **Revision log:** Append-only log of operations (insert, delete, format, etc.)
- **Clients:** Track initial state, local/sent/received operations, and current revision
- **Server:** Tracks pending updates, revision log, and current document state

#### Example Revision Log
| Rev no. | User    | Operations              | Timestamp           | Document state           |
|---------|---------|-------------------------|---------------------|-------------------------|
| 0       | N/A     | N/A                     | 2024-08-03 10:00    | <EMPTY>                 |
| 1       | Charlie | INS "Hello" @0         | 2024-08-03 10:05    | "Hello"                |
| 2       | Alice   | INS " world" @5        | 2024-08-03 10:10    | "Hello world"           |
| 3       | Bob     | INS "!" @11            | 2024-08-03 10:15    | "Hello world!"          |

#### Joining a Session
![User joins a collaborative editing session](https://www.gfecdn.net/img/questions/collaborative-editor-google-docs/join-session.png)
- New users are initialized with the latest document state
- Local/sent/received operation buffers are empty on join

#### Operational Transformations on Document Trees
- OTs can be applied to both character lists and tree structures (e.g., paragraphs, headings)
- Conflicts arise when the same node is modified; OTs resolve these at the list level

---

## 9. API & Interface Definition

### Initialization API
```json
{
  "revision": 145,
  "document": "..." // Rich text editor format
}
```

### Update/Save API (WebSocket)
```json
{
  "type": "UPDATE",
  "requestId": 2,
  "revision": 146,
  "isUndo": false,
  "operations": [
    { "type": "INSERT", "nodeId": 24, "payload": { "characters": "Hello", "index": 4 } },
    { "type": "INSERT", "nodeId": 25, "payload": { "characters": "Bye", "index": 2 } }
  ]
}
```

### Update Acknowledgement
```json
{
  "type": "ACK",
  "requestIdAcknowledged": 2,
  "requestId": 3,
  "revision": 147
}
```

### Peer Update
```json
{
  "type": "PEER_UPDATE",
  "revision": 148,
  "userId": 6543,
  "operations": [ ... ]
}
```

### On Reconnect
```json
{
  "type": "SYNC",
  "revisions": [ ... ]
}
```

---

## 10. Optimizations & Deep Dive

### History & Versioning
- Store as a log of operations (event sourcing)
- Enables time travel/version history
- Group revisions into user-facing "versions"

#### Example Version Log
| Version | Time              | Last edited by         |
|---------|-------------------|-----------------------|
| 1       | 2024-08-03 10:15  | Charlie, Bob, Alice   |
| 2       | 2024-08-05 09:10  | Donald, Erin          |

### Undo/Redo
- Per-user undo/redo (not global)
- Undo is implemented by appending the negation of the previous operation
- `isUndo` flag differentiates undo operations
- Undo/redo granularity is at the intention level

#### Example Undo Log
| Rev no. | User  | Operation              | Is undo | Document                  |
|---------|-------|------------------------|---------|--------------------------|
| 4       | Donald| INS " Goodbye" @12     | False   | "Hello world! Goodbye"   |
| 5       | Erin  | INS " earth" @20       | False   | "Hello world! Goodbye earth" |
| 6       | Erin  | INS "..." @26          | False   | "Hello world! Goodbye earth…" |
| 7       | Erin  | DEL 3 @29              | True    | "Hello world! Goodbye earth" |
| 8       | Erin  | DEL 6 @26              | True    | "Hello world! Goodbye"   |

### Reliability
- Clients track their own revision number and include it in requests
- Server can send missing updates on reconnect
- WebSockets + application logic (e.g., Socket.io) for ordered, reliable delivery
- Each update operation has a unique ID for deduplication

### Offline Editing
- Edits are buffered locally when offline
- On reconnect, local updates are sent and missing updates are fetched

### Document Formats
- Internal model is tree-based; import/export to `.docx`, `.odt`, etc.
- Example: `.odt` is a ZIP archive of XML files (content, styles, meta, settings, manifest)
- `content.xml`: Document content; `styles.xml`: Styles; `meta.xml`: Metadata; `settings.xml`: Settings; `manifest.xml`: File manifest
- Images and embedded objects are stored as separate files in the archive

---

## 11. Transport Mechanisms

- **WebSockets:** Full-duplex, low-latency, bidirectional; best for collaborative editing
- **Server-Sent Events (SSE):** Unidirectional (server-to-client); can be combined with HTTP for client-to-server
- **Long polling:** Inefficient, higher latency, not recommended for modern apps
- **Reliability & Ordering:** Application logic (e.g., Socket.io) ensures in-order delivery, retries, and reconnections

---

## 12. Architecture / High-Level Design (RADIO Framework)

- **Requirements:** Real-time, multi-user, conflict-resilient, scalable, reliable
- **Architecture:** Client-server, central revision log, WebSockets for transport
- **Data Model:** Tree-based document, append-only revision log, operation buffers
- **Interfaces:** Initialization, update, acknowledgement, peer update, sync on reconnect
- **Optimizations:** Coalescing, batching, intention-based granularity, per-user undo/redo, version history

---

## 13. References & Further Reading
- [Concurrency Control in Groupware Systems (ACM)](https://dl.acm.org/doi/pdf/10.1145/67544.66963)
- [High-Latency, Low-Bandwidth Windowing in the Jupiter Collaboration System (ACM)](https://dl.acm.org/doi/pdf/10.1145/215585.215706)
- [What’s different about the new Google Docs: Conflict resolution](https://drive.googleblog.com/2010/09/whats-different-about-new-google-docs_22.html)
- [Operational Transformations as an algorithm for automatic conflict resolution](https://medium.com/coinmonks/operational-transformations-as-an-algorithm-for-automatic-conflict-resolution-3bf8920ea447)
- [Visualization of OT with a central server](https://operational-transformation.github.io/)

---

This document provides a comprehensive, technical overview of the design and implementation of a real-time collaborative document editor like Google Docs. It covers architectural decisions, data modeling, update flows, conflict resolution, reliability, and real-world trade-offs, serving as a reference for advanced system design interviews and real-world implementations.