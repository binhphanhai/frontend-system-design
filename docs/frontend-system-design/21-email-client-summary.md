# 21-email-client: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a robust, extensible, and secure desktop email client (like Outlook).

Want to see:

- If you can break down the system into sync, offline, search, and extensibility.
- How you handle IMAP/SMTP, local storage, and security.
- If you consider accessibility, plugin architecture, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Send/receive via SMTP/IMAP, offline support, local search
   - Threading, folders, attachments, notifications
   - Multi-account (advanced), plugin/extensibility (advanced)
   - Security (TLS, OAuth2, spam filtering), privacy, accessibility
   - Cross-platform (Windows, macOS, Linux)

2. **Architecture & Data Flow**

   - **Native app (Electron/Tauri):** Menubar, notifications, system integration
   - **Flux/Redux for state:** Centralized store for messages, folders, settings
   - **Task queue:** Outbox for unsent, retry logic, sync engine for IMAP/SMTP
   - **Local DB (SQLite/LevelDB):** Cache for offline, full-text search
   - **Component breakdown:** Message list, thread view, composer, search, settings
   - **Plugin system:** For rules, integrations, custom actions

3. **Protocols, Sync, and Security**

   - IMAP for fetch/manage, SMTP for send, POP3 (optional)
   - TLS/SSL for all connections, OAuth2 for auth, local encryption (optional)
   - Sanitize HTML, block tracking pixels, spam filtering
   - Exponential backoff for retries, delta sync, conflict resolution

4. **Accessibility & Internationalization**

   - Keyboard navigation, ARIA roles, screen reader support
   - High-contrast themes, font scaling, RTL support
   - Localized UI, date/time, drag-and-drop accessibility

5. **Customization, Testing, and Analytics**

   - Theming: CSS variables, custom toolbar/layout
   - Plugin/extension system, opt-in analytics, error tracking
   - Unit/integration/e2e/accessibility tests, visual regression
   - Performance monitoring: sync latency, search speed, memory

6. **Tradeoffs & Alternatives**
   - IMAP vs. POP3: IMAP is server-centric, POP3 is client-centric
   - Native vs. Electron: Native is faster, Electron is cross-platform
   - Local vs. server search: local is faster offline, server is more up-to-date
   - Plugin system: more extensible, but increases complexity

---

✅ **Example Content / Model Answer**

> “For a desktop email client, I’d use Electron for cross-platform, Flux for state, and SQLite for local cache. IMAP/SMTP for sync, TLS/OAuth2 for security. Accessibility with ARIA and keyboard navigation. Plugin system for extensibility. Tradeoff: IMAP is more flexible than POP3, but needs sync logic. Electron is easier to build, but native is faster.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget offline, security, and accessibility.
- Optimize for fast search, sync, and error handling.
- Test with large mailboxes, slow networks, and screen readers.
