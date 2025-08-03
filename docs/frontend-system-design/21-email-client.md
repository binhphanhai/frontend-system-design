# Email Client System Design (e.g. Microsoft Outlook)

*System design interview question: Design a desktop email client that can send and receive email messages given an email provider service.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Background Knowledge](#background-knowledge)
4. [Architecture & High-Level Design](#architecture--high-level-design)
5. [Data Model](#data-model)
6. [Interface Definition (API)](#interface-definition-api)
7. [Optimizations and Deep Dive](#optimizations-and-deep-dive)
8. [User Experience (UX)](#user-experience-ux)
9. [Performance, Security, and Testing](#performance-security-and-testing)
10. [Accessibility (a11y) and Internationalization (i18n)](#accessibility-a11y-and-internationalization-i18n)
11. [Customization, Extensibility, and Analytics](#customization-extensibility-and-analytics)
12. [References](#references)

---

## 1. Overview

Desktop email clients (e.g., Microsoft Outlook, Apple Mail, Mailspring) are applications installed on a user's computer that allow sending, receiving, and managing email messages from multiple providers. Unlike webmail, desktop clients work offline, support multiple accounts, and offer advanced features like local search, notifications, keyboard shortcuts, and plugin support. This document provides a deep technical dive into the architecture, protocols, data model, APIs, rendering, synchronization, security, extensibility, and real-world trade-offs for building a modern desktop email client.

![Email Client Example](https://www.gfecdn.net/img/questions/email-client-outlook/email-client-example.png)

**Real-life Examples:**
- [Outlook for Windows/macOS](https://apps.microsoft.com/store/detail/outlook-for-windows/9NRX63209R7B)
- [Apple Mail](https://support.apple.com/en-sg/guide/mail/welcome/mac)
- [Airmail](https://airmailapp.com/)
- [Mailspring](https://getmailspring.com/)

---

## 2. Requirements Exploration

### Core Functionalities
- Send email messages to an SMTP server
- Retrieve email messages from an IMAP server
- Access and search email messages already on the device (offline support)
- Support for Windows, macOS, and Linux
- Threading of message conversations (optional but recommended)
- Support for multiple accounts/services (advanced)
- Local storage and search
- Attachments (send, receive, preview)
- Drafts, folders, labels, and rules
- Notifications, menubar integration, keyboard shortcuts
- Security: encryption, spam filtering, privacy

### Out of Scope
- Webmail (browser-based email)
- Building the email provider service itself
- Multi-account support (can be added as an extension)

---

## 3. Background Knowledge

### Email System Components
| Component         | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| Mail User Agent (MUA) | Application for composing, sending, receiving, and reading emails (e.g., Outlook) |
| Mail Transfer Agent (MTA) | Software that transfers email messages between hosts using SMTP                |
| Mail Server       | Hosts MTAs and stores email messages in mailboxes                           |
| Mailbox           | Conceptual entity identified by an email address, stores messages           |

### Email Protocols
- **SMTP (Simple Mail Transfer Protocol):** Outgoing email protocol for sending messages
- **IMAP (Internet Message Access Protocol):** Incoming protocol for retrieving/managing messages (server is source of truth)
- **POP3 (Post Office Protocol):** Incoming protocol for downloading and deleting messages from server (client is source of truth)

#### SMTP Example Conversation
```shell
$ openssl s_client -connect smtp.example.com:465 -crlf
S: 220 smtp.example.com ESMTP Postfix
C: HELO relay.example.org
S: 250 Hello relay.example.org, I am glad to meet you
C: AUTH LOGIN
S: 334 VXNlcm5hbWU6
C: dXNlcm5hbWUuY29t # Username (Base64)
S: 334 UGFzc3dvcmQ6
C: bXlwYXNzd29yZA== # Password (Base64)
S: 235 Authentication succeeded
C: MAIL FROM:<bob@example.org>
S: 250 Ok
C: RCPT TO:<alice@example.com>
S: 250 Ok
C: DATA
S: 354 End data with <CR><LF>.<CR><LF>
C: ...message...
C: .
S: 250 Ok: queued as 12345
C: QUIT
S: 221 Bye
```

#### POP3 vs IMAP Comparison
| Feature                | POP3         | IMAP         |
|------------------------|--------------|--------------|
| Source of truth        | Client(s)    | Server       |
| Simultaneous clients   | One          | Multiple     |
| No. of mailboxes       | One          | Multiple     |
| Message downloading    | Entire msg   | Individual   |
| Message flagging       | No           | Yes          |
| Deleted from server    | Yes (default)| No           |
| Server-side search     | No           | Yes          |
| Server storage usage   | Low          | High         |

#### Email Server Configurations
| Service   | SMTP                   | IMAP                  | POP                  |
|-----------|------------------------|-----------------------|----------------------|
| Gmail     | smtp.gmail.com         | imap.gmail.com        | pop.gmail.com        |
| Outlook   | smtp-mail.outlook.com  | outlook.office365.com | outlook.office365.com|
| iCloud    | smtp.mail.me.com       | imap.mail.me.com      | Unsupported          |

#### Email Flow Diagram
![Email flow](https://www.gfecdn.net/img/questions/email-client-outlook/email-flow.png)

#### Types of Email Systems
- **Store and forward servers (POP3):** Messages downloaded and deleted from server; local storage is source of truth
- **Server-only mailboxes (IMAP/webmail):** Server is source of truth; clients do not persist messages
- **Server mailbox with client-side cache (IMAP + local cache):** Hybrid; server is source of truth, but clients cache messages for offline access (most desktop clients)

#### Native HTML Apps
- Electron, Tauri, or Nativefier for cross-platform desktop apps
- Differences: Electron (Node.js, Chromium), Tauri (Rust, WebView), Nativefier (wraps web app)

---

## 4. Architecture & High-Level Design

### Desktop Client vs Webmail
- Desktop client is a native app (Electron, Tauri, or native code)
- Abstract database layer for local storage (SQLite, LevelDB, etc.)
- Native app advantages: menubar, notifications, keyboard shortcuts, offline access, system integration
- Plugin architecture for extensibility (e.g., spellcheck, mail rules)

### Core Architectural Patterns
- **Flux/Redux Architecture:**
  - Centralized store for all app state (messages, folders, settings)
  - Namespaced commands for actions (send, fetch, delete, mark read, etc.)
  - Supports undo/redo, action history, and multiple trigger sources (UI, menu, keyboard)
  - Example: [Mailspring's actions](https://github.com/Foundry376/Mailspring/blob/master/app/src/flux/actions.ts)
- **Task Queue:**
  - Mutable operations update local store immediately, queue changes to sync with server
  - Outbox for unsent messages (send when online)
  - Retry logic with exponential backoff
- **Rendering:**
  - Client-side rendering (CSR) for app UI
  - Virtual lists for large mailboxes
  - Lazy loading for message content, attachments, emoji pickers, etc.
- **Sync Engine:**
  - Handles IMAP/SMTP/POP protocol logic, sync frequency, conflict resolution
  - Offline mode: queue outgoing messages, sync when online
  - Exponential backoff for retries
- **Security:**
  - TLS/SSL for all server connections
  - OAuth2 for authentication (where supported)
  - Local encryption for stored messages (optional)
  - Sanitize HTML emails (block scripts, tracking pixels)
  - Block open tracking ([How open tracking works](https://nylas-mail-lives.gitbooks.io/nylas-mail-docs/content/tracking_and_notifications/226411088-how-does-nylas-perform-open-tracking.html))

### Multi-Account Support (Advanced)
- Abstract account layer for multiple providers
- Per-account sync, folders, settings
- Unified inbox and search

### Plugin/Extension System (Advanced)
- Allow third-party plugins for mail rules, custom actions, integrations
- Plugin sandboxing and permissions

---

## 5. Data Model

### Email Message Example (TypeScript)
```ts
interface EmailMessage {
  id: string;
  accountId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string; // HTML or plain text
  date: number;
  flags: string[]; // e.g., ['seen', 'answered', 'flagged']
  threadId?: string;
  folder: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
}

interface Thread {
  id: string;
  messageIds: string[];
  subject: string;
  participants: string[];
  lastUpdated: number;
}
```

### Local Store Example
- SQLite/LevelDB for messages, threads, contacts, settings
- Indexed by message ID, thread ID, folder, date
- Full-text search index for local search
- Per-account and unified views

---

## 6. Interface Definition (API)

### Core APIs
| API                | Description                                 |
|--------------------|---------------------------------------------|
| fetchMessages      | Retrieve messages from IMAP server           |
| sendMessage        | Send message via SMTP                        |
| saveDraft          | Save draft locally or on server              |
| deleteMessage      | Delete message locally and on server         |
| markAsRead         | Mark message as read/unread                  |
| moveToFolder       | Move message to folder                       |
| searchMessages     | Search messages locally and/or on server     |
| sync               | Synchronize local store with server          |
| addAccount         | Add new email account                        |
| removeAccount      | Remove email account                         |
| listFolders        | List folders/labels for an account           |

### Example: Fetching Messages
```ts
async function fetchMessages(accountId: string, folder: string, since: number): Promise<EmailMessage[]> {
  // Connect to IMAP, fetch messages, update local store
}
```

### Example: Sending Message
```ts
async function sendMessage(accountId: string, msg: EmailMessage): Promise<void> {
  // Connect to SMTP, send message, update local store
}
```

---

## 7. Optimizations and Deep Dive

### Synchronization
- IMAP/SMTP/POP protocol handling (see [RFC4549](https://www.rfc-editor.org/rfc/rfc4549))
- Sync frequency: configurable (push, periodic, manual)
- Conflict resolution: last-write-wins, merge drafts
- Offline mode: queue outgoing messages, sync when online
- Exponential backoff for retries
- Per-account and per-folder sync
- Delta sync for efficiency (fetch only new/changed messages)

### Email List
- Threading: group messages by subject/senders ([JWZ threading](https://www.jwz.org/doc/threading.html), [RFC5256](https://www.rfc-editor.org/rfc/rfc5256))
- Searching: local full-text search, server-side search
- Sorting: by date, sender, subject, unread, flagged
- Virtualized lists for large mailboxes
- Conversation view (threaded UI)

### Reading
- Render HTML email safely (sanitize, block scripts, images, tracking pixels)
- Use browser default stylesheet or webview for rendering
- Support for inline images, attachments, and rich formatting
- Show security warnings for suspicious content

### Composing
- Email address autocompletion (from contacts, previous recipients)
- Undo send feature (delay actual send, allow cancel)
- Rich text/WYSIWYG editor (bold, italics, lists, links, images)
- Attachments: async upload, progress, drag-and-drop, preview
- Save drafts locally and/or on server
- Spellcheck integration ([Mailspring spellchecker](https://github.com/Foundry376/Mailspring/app/src/spellchecker.ts))
- Support for S/MIME or PGP encryption (advanced)

### Performance
- Virtual lists for message list
- Lazy load message content, attachments, emoji pickers
- Minimize memory usage for large mailboxes
- Efficient indexing for search and threading

### Security and Privacy
- Sanitize HTML emails (block scripts, tracking pixels)
- Block open tracking ([How open tracking works](https://nylas-mail-lives.gitbooks.io/nylas-mail-docs/content/tracking_and_notifications/226411088-how-does-nylas-perform-open-tracking.html))
- TLS/SSL for all server connections
- OAuth2 for authentication (where supported)
- Local encryption for stored messages (optional)
- Spam filtering and phishing detection (advanced)
- No analytics/tracking by default

### Notifications
- Native notifications for new mail, reminders
- Badge count in menubar/taskbar
- Customizable notification settings
- Do Not Disturb mode

### Undo/Redo
- Centralized store enables undo/redo for actions
- Toasts for undoable actions (delete, move, send)
- Action history for debugging and audit

### Keyboard Shortcuts
- Customizable shortcuts (Gmail, Outlook, Apple Mail style)
- Support for navigation, actions, composing, search
- Shortcut cheat sheet/help overlay

### Extra Features
- Theming (light/dark, custom CSS, high-contrast)
- Mail rules (filters, auto-labeling, auto-archive)
- Playing sounds for new mail
- Saving drafts automatically
- Swipe gestures (touch devices)
- Offline indicator
- Plugin/extension system for custom features
- Multi-account unified inbox
- Calendar and contact integration (advanced)

---

## 8. User Experience (UX)
- Responsive, native-feeling UI
- Fast search and navigation
- Offline indicator and error feedback
- Drag-and-drop for attachments and folders
- Preview pane, split view, and customizable layout
- Menubar integration (quick actions, unread count)
- Accessibility: keyboard navigation, screen reader support
- Internationalization: RTL support, localized UI
- Customizable toolbar, layout, and themes
- Onboarding flow for account setup
- In-app help and support

---

## 9. Performance, Security, and Testing
- Virtualized lists for large mailboxes
- Lazy loading for message content and attachments
- Secure all network connections (TLS/SSL)
- Sanitize all HTML content
- Rate limit sync and outgoing requests
- Unit and integration tests for all core features
- Visual regression testing for UI
- Error tracking and crash reporting
- Performance monitoring (sync latency, search speed, memory usage)
- Fuzz testing for protocol handling
- End-to-end tests for multi-account, offline, and sync scenarios

---

## 10. Accessibility (a11y) and Internationalization (i18n)
- Keyboard navigation for all actions
- Screen reader support (ARIA roles, labels, live regions)
- High-contrast themes and font scaling
- Announce new mail and errors via ARIA live regions
- Localize all UI strings, support multiple languages
- RTL layout support (CSS logical properties)
- Accessible drag-and-drop and attachment handling
- Customizable font sizes and color schemes

---

## 11. Customization, Extensibility, and Analytics
- Theming: Support for CSS variables, theme objects, or design tokens
- Allow users to customize colors, fonts, layout, toolbar
- Plugin/extension system for custom features, integrations, and automations
- Analytics: Expose opt-in events for usage, error, performance (GDPR/CCPA compliant)
- Allow enterprise deployment with custom branding and policies
- Testing: unit, integration, e2e, accessibility, and performance
- Visual regression: Use Percy, Chromatic, or Storybook
- Performance monitoring: Track load times, sync latency, memory usage
- Anti-patterns: Avoid blocking UI on sync, avoid excessive notifications, avoid storing sensitive data unencrypted

---

## 12. References
- [Email Overload: Building My Own Email App](http://www.slate.com/articles/technology/technology/2015/02/email_overload_building_my_own_email_app_to_reach_inbox_zero.html)
- [NinjaMail: High-Performance Clustered Email System](https://people.eecs.berkeley.edu/~kubitron/papers/ninja/pdf/ninjamail-workshop.pdf)
- [Nylas Mail (open source)](https://github.com/nylas/nylas-mail)
- [Internet Message Access Protocol (IMAP)](https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol)
- [RFC3501: IMAP4rev1](https://www.rfc-editor.org/rfc/rfc3501)
- [Mailspring (open source)](https://github.com/Foundry376/Mailspring)
- [Mail.ru Core Web Vitals](https://web.dev/mailru-cwv/)
- [Best Email Clients for Mac](https://zapier.com/blog/best-email-client-for-mac/)
- [Email Architecture, Gmail Two Step Verification, SMTP POP3 IMAP](https://www.electroniclinic.com/email-architecture-gmail-two-step-verification-smtp-pop3-imap)
- [Email Program Classifications](https://web.mit.edu/rhel-doc/5/RHEL-5-manual/Deployment_Guide-en-US/s1-email-types.html)
- [How does email work?](https://www.namecheap.com/guru-guides/how-does-email-work)
- [JWZ Threading Algorithm](https://www.jwz.org/doc/threading.html)
- [RFC5256: IMAP Thread Extension](https://www.rfc-editor.org/rfc/rfc5256)
- [RFC4549: Synchronization Operations for Disconnected IMAP4 Clients](https://www.rfc-editor.org/rfc/rfc4549)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern desktop email client. It covers architecture, protocols, data modeling, API, rendering, synchronization, extensibility, accessibility, customization, performance, security, analytics, testing, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.