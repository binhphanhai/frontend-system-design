# 11-google-docs: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a real-time collaborative document editor (like Google Docs) with strong consistency, low latency, and robust conflict resolution.

Want to see:

- If you can break down collaboration, data flow, and conflict resolution.
- How you handle real-time updates, offline, and multi-user scenarios.
- If you understand OT/CRDT, SSR, and tradeoffs in distributed systems.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Real-time multi-user editing (100+ concurrent users)
   - Low latency (&lt;500ms), instant local feedback
   - Conflict resolution (eventual consistency, intention preservation)
   - Offline editing, late joiners, version history, undo/redo
   - Access control, security, and scalability

2. **Architecture & Data Flow**

   - **Client-server model** (preferred): server as source of truth, clients sync via WebSockets
   - **Peer-to-peer** (rare): harder to synchronize, not ideal for docs
   - **Document model:** tree (root → paragraphs/headings → text nodes)
   - **Operation-based updates:** send deltas (insert, delete, format) instead of full doc
   - **Buffers:** local, sent, and received operation queues
   - **Revision log:** append-only, enables time travel/version history

3. **Real-Time Protocols & Conflict Resolution**

   - **Operational Transformation (OT):** Used by Google Docs, transforms ops to preserve intent/causality
   - **CRDTs:** Used by Figma, guarantees convergence, more metadata overhead
   - **Version detection:** Each op includes base revision; server transforms/rejects as needed
   - **Properties:** Convergence, causality, intention preservation

4. **Performance, Offline, and SSR**

   - **Local-first:** Edits applied instantly, batched to server
   - **WebSockets:** For low-latency, bidirectional updates
   - **Offline:** Buffer edits, sync on reconnect
   - **SSR:** For public docs, SEO, and fast initial load
   - **Optimizations:** Coalescing, batching, intention-based granularity, per-user undo/redo

5. **Accessibility & Testing**

   - ARIA roles for editor, toolbar, and content
   - Keyboard shortcuts for formatting and navigation
   - Screen reader support, color contrast, focus management
   - Unit/integration tests for formatting, plugins, and collaboration

6. **Tradeoffs & Alternatives**
   - OT vs. CRDT: OT is mature for text, CRDT is more general but complex
   - Full doc vs. deltas: deltas are efficient but require version tracking
   - SSR for SEO, CSR for interactivity
   - Centralized vs. decentralized: centralized is simpler for docs

---

✅ **Example Content / Model Answer**

> “For a collaborative editor, I’d use a client-server model with WebSockets for real-time sync. Each client applies edits locally, sends deltas to the server, and receives peer updates. I’d use OT for conflict resolution, ensuring convergence and intention preservation. Offline edits are buffered and synced on reconnect. SSR is used for public docs. Accessibility is ensured with ARIA roles and keyboard shortcuts. Tradeoff: OT is mature for text, CRDT is more general but more complex.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget offline, undo/redo, and version history.
- Be explicit about OT/CRDT and why you’d choose one.
- Test with high concurrency, network partitions, and accessibility tools.
