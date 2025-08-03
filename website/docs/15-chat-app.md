# Chat Application System Design (e.g. Messenger)

*System design interview question: Design a chat application that allows users to send messages to each other.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Architecture & High-Level Design](#architecture--high-level-design)
4. [Data Model](#data-model)
5. [API & Interface Definition](#api--interface-definition)
6. [Deep Dive: Data Sync, Real-Time, and Offline](#deep-dive-data-sync-real-time-and-offline)
7. [Performance, Scalability, and Reliability](#performance-scalability-and-reliability)
8. [Security & Privacy](#security--privacy)
9. [Accessibility](#accessibility)
10. [User Experience (UX)](#user-experience-ux)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [Analytics, Observability, and A/B Testing](#analytics-observability-and-ab-testing)
13. [Advanced Topics](#advanced-topics)
14. [References](#references)

---

## 1. Overview

Chat applications like Messenger, WhatsApp, Slack, Discord, and Telegram are among the most demanding real-time web applications. They must deliver a seamless, performant, and reliable experience, supporting offline usage, real-time updates, cross-device synchronization, and robust error handling. This document provides a deep, technical dive into the architecture, data model, APIs, offline/online sync, real-time messaging, scalability, security, analytics, and real-world trade-offs for building a modern chat application frontend.

---

## 2. Requirements Exploration

### Core Functionalities
- **1:1 Messaging:** Send and receive messages in real-time
- **Chat History:** View conversation history, scrollback, search
- **Message Status:** Sending, sent, delivered, read, failed
- **Offline Support:** Queue outgoing messages, browse messages offline
- **Multi-Tab/Device Sync:** Consistent state across tabs/devices
- **Text & Emoji:** Support rich text, emojis (images, files as extension)

### Real-Time Messaging
- **Low Latency:** Messages delivered instantly, no page refresh
- **Reliable Delivery:** Retry, status indicators, error handling

### Offline Support
- **Outgoing Queue:** Store unsent messages, retry on reconnect
- **Local Browsing:** Access chat history offline

### Group Conversations
- **Assume 1:1 for this design** (group chat is an extension)

### Tricky Scenarios
- Multiple tabs, multiple devices, offline/online transitions, out-of-order delivery, stale clients

---

## 3. Architecture & High-Level Design

### Key Scenarios & Challenges
- **Multi-tab:** Shared client DB, sync via BroadcastChannel
- **Multi-device:** Sync with server on load, resolve conflicts
- **Offline:** Queue outgoing, sync on reconnect, show accurate status
- **Out-of-order:** Insert messages by timestamp, handle duplicates

### Architecture Diagram
![Chat Application Architecture](https://www.gfecdn.net/img/questions/chat-application-messenger/chat-application-architecture.png)

### Component Responsibilities
- **Chat UI:**
  - Conversations List: List of conversations (user, last message, timestamp)
  - Selected Conversation: List of messages, input box for new messages
- **Controller:**
  - Manages data flow, fetches from DB, writes to DB
- **Data Syncer:**
  - Syncs client DB with server, manages outgoing/incoming messages
  - **Client-side Database:** Stores all data needed for UI and offline
  - **Message Scheduler:** Tracks outgoing messages, schedules sending, manages statuses, retries, batching
- **Server:**
  - HTTP APIs and real-time APIs (WebSocket) for conversations, messages, and sync

### Rendering
- **SPA (Single Page App):** Pure client-side rendering for high interactivity
- **SSR (Server-Side Rendering):** Optional for performance, not needed for SEO

---

## 4. Data Model

### Client-Side Database (IndexedDB)

<!-- Chat Application Data Model image would go here -->

| Table/Entity         | Sync to Server | Used by            | Description                                                                 |
|----------------------|:--------------:|--------------------|-----------------------------------------------------------------------------|
| Conversation         | Yes            | Conversations List | Conversation between users (1:1 for now)                                    |
| Message              | Yes            | Conversation       | Text message, status: sending, sent, delivered, read, failed                |
| User                 | Yes            | All                | User identity                                                               |
| ConversationUser     | Yes            | -                  | Associates users and conversations (many-to-many, supports group chat)       |
| DraftMessage         | No             | Conversation       | Store half-written, unsent messages                                         |
| SendMessageRequest   | No             | Message Scheduler  | Tracks status of messages to be sent (pending, in_flight, fail, success)    |

- **DraftMessage:** Stores unsent messages, persisted for session recovery
- **SendMessageRequest:** Tracks outgoing messages, retries, failures, exponential backoff

### Client-Only State
- Selected conversation
- Conversation scroll position
- Outgoing message (debounced/throttled to DB)

---

## 5. API & Interface Definition

### Core APIs
- **Send message**: Insert to Message table, mark as sending, add to SendMessageRequest
- **Sync outgoing messages**: Scheduler watches SendMessageRequest, retries, batches
- **Server events (real-time updates)**: WebSocket events for new messages, status updates
- **Fetch conversations**: List all conversations
- **Fetch conversation messages**: Paginated, cursor-based for history

#### Example: Send Message Flow
1. Add row to `Message` table with `sending` status
2. Add row to `SendMessageRequest` table with `pending` status
3. UI shows new message as "Sending"
4. Delete any `DraftMessage` for the conversation
5. Message Scheduler syncs `pending` messages with server

#### Example: Server Events
- `message_sent`: Mark message as sent, clean up scheduler
- `message_delivered`: Mark message as delivered
- `message_failed`: Mark as fail, increment fail count, retry
- `incoming_message`: Add to `Message` table, update UI
- `sync`: On connect, server sends missing data to client

#### Example: Real-Time Event Payload
```json
{
  "event_name": "incoming_message",
  "payload": {
    "foo": "value_a",
    "bar": "value_b"
  }
}
```

#### Message Status Table
| Status     | Description                        | Messenger Icon         | WhatsApp Icon         |
|------------|------------------------------------|-----------------------|-----------------------|
| Sending    | Attempting to send                 | Empty circle          | Clock icon            |
| Sent       | Sent to server                     | Checkmark outline     | Single gray checkmark |
| Delivered  | Delivered to recipient             | Checkmark filled      | Double gray checkmark |
| Read       | Recipient has read                 | User profile picture  | Double blue checkmark |
| Failed     | Failed to send                     | Exclamation in circle | Exclamation in circle |

---

## 6. Deep Dive: Data Sync, Real-Time, and Offline

### Client Database
- **IndexedDB:** Structured, persistent, cross-tab storage
- **BroadcastChannel API:** Sync changes across tabs
- **Sync on load:** Last update timestamp or per-conversation cursor
- **Out-of-order:** Insert by timestamp, deduplicate
- **Drafts:** Persist unsent messages, recover after reload

### Real-Time Updates
- **WebSockets:** Preferred for real-time, bidirectional communication
- **Long Polling/Short Polling:** Fallbacks, less efficient
- **Server events:** Push new messages, status updates, sync events
- **Reconnect:** Auto-reconnect, exponential backoff

### Network & Offline
- **Offline detection:** Queue outgoing messages, mark as pending
- **Retry:** Exponential backoff, fail after N attempts
- **Batching:** Send multiple messages in one payload if sent in quick succession
- **Conflict resolution:** Server is source of truth, client merges
- **Sync on reconnect:** Fetch missed messages, resolve conflicts

### Error Handling
- **Failed messages:** Show error, allow manual retry
- **Stale clients:** Full sync or partial fetch (latest N messages)
- **Unsupported environments:** Handle private/incognito, storage limits

---

## 7. Performance, Scalability, and Reliability
- **Windowing/virtualization:** For long message lists
- **Lazy loading:** Emoji picker, popovers, modals
- **Optimistic UI:** Show messages as sent before server confirmation
- **Efficient rendering:** Only update changed parts of UI
- **Minimize bundle size:** Fast load, code splitting
- **Horizontal scaling:** Stateless APIs, sharded DBs, message queues
- **Monitoring:** Real-time metrics, alerting

---

## 8. Security & Privacy
- **HTTPS:** All communication encrypted
- **Authentication:** Secure login, JWT/session tokens
- **End-to-end encryption:** (Advanced) for privacy
- **API security:** Auth, rate limiting, CORS
- **XSS/CSRF:** Input validation, secure cookies
- **Session management:** Secure, httpOnly, sameSite
- **Privacy:** GDPR/CCPA compliance, user data rights

---

## 9. Accessibility
- **Keyboard shortcuts:**
  - Enter to send, Shift+Enter for new line
  - Ctrl/Cmd+Up/Down to switch conversations
  - Ctrl/Cmd+number to jump to nth conversation
- **Screen reader support:** Proper ARIA roles, labels
- **Focus management:** Maintain focus in input, restore after send
- **Color contrast:** Sufficient for all users
- **Message status indicators:** Accessible icons, text

---

## 10. User Experience (UX)
- **Scroll position:**
  - Keep at bottom for new messages
  - Maintain position when loading older messages
  - Handle window resize, media load, zoom
- **Scroll to bottom button:** Show when user scrolls up
- **Message status indicators:** Show sending, sent, delivered, read, failed
- **Draft recovery:** Restore unsent messages after reload
- **Responsive design:** Works on desktop and mobile
- **Gradient effects:** Messenger-style chat bubble gradients ([CSS Tricks](https://css-tricks.com/recreating-the-facebook-messenger-gradient-effect-with-css/))
- **Notifications:** Browser notifications for new messages
- **Typing indicators, reactions, disappearing messages:** (Advanced)

---

## 11. Internationalization (i18n)
- **Multi-language UI:** Translate all labels, error messages
- **RTL support:** Layout mirroring, logical CSS properties
- **Date/time:** Localized formats
- **Emoji support:** Unicode, fallback images
- **Accessibility:** Localized ARIA labels

---

## 12. Analytics, Observability, and A/B Testing
- **Analytics:** Track message send/receive, delivery times, errors
- **A/B testing:** UI, retry strategies, notification styles
- **Error reporting:** Sentry, custom logging
- **Performance monitoring:** Real user metrics
- **Privacy:** Anonymized data, opt-out options

---

## 13. Advanced Topics
- **Search:** Hybrid online/offline search
- **End-to-end encryption:** Security and privacy
- **Delivery/read receipts:** Real-time status
- **Reactions, typing indicators, disappearing messages, notifications**
- **Handling stale clients:** Full sync or partial fetch
- **Internationalization (i18n):** Multi-language support
- **Push notifications:** Mobile/desktop
- **Rich media:** Images, files, voice notes

---

## 14. References
- **Facebook & Messenger**
  - [Launching Instagram Messaging on desktop](https://engineering.fb.com/2022/07/26/web/launching-instagram-messaging-on-desktop/)
  - [Building Facebook Messenger](https://www.facebook.com/notes/10158791547142200/)
  - [Reverse engineering the Facebook Messenger API](https://intuitiveexplanations.com/tech/messenger)
  - [Facebook Messenger Engineering with Mohsen Agsen](https://softwareengineeringdaily.com/2020/03/31/facebook-messenger-engineering-with-mohsen-agsen/)
  - [F8 2019: Facebook: Lighter, Faster, Simpler Messenger](https://www.youtube.com/watch?v=ulVLD2yzCrc)
  - [Building Real Time Infrastructure at Facebook - SRECon2017](https://www.youtube.com/watch?v=ODkEWsO5I30)
  - [Facebook Messenger RTC – The Challenges and Opportunities of Scale](https://www.youtube.com/watch?v=F7UWvflUZoc)
  - [Building Mobile-First Infrastructure for Messenger](https://engineering.fb.com/2014/10/09/production-engineering/building-mobile-first-infrastructure-for-messenger/)
  - [MySQL for Message - @Scale 2014 - Data](https://www.youtube.com/watch?v=eADBCKKf8PA)
  - [Project LightSpeed: Rewriting the Messenger codebase](https://engineering.fb.com/2020/03/02/data-infrastructure/messenger/)
- **Slack**
  - [Managing Focus Transitions in Slack](https://slack.engineering/managing-focus-transitions-in-slack/)
  - [Gantry: Slack’s Fast-booting Frontend Framework](https://slack.engineering/gantry-slacks-fast-booting-frontend-framework/)
  - [Making Slack Faster By Being Lazy](https://slack.engineering/making-slack-faster-by-being-lazy/)
  - [Making Slack Faster By Being Lazy: Part 2](https://slack.engineering/making-slack-faster-by-being-lazy-part-2/)
  - [Getting to Slack faster with incremental boot](https://slack.engineering/getting-to-slack-faster-with-incremental-boot/)
  - [Service Workers at Slack: Our Quest for Faster Boot Times and Offline Support](https://slack.engineering/service-workers-at-slack-our-quest-for-faster-boot-times-and-offline-support/)
  - [Localizing Slack](https://slack.engineering/localizing-slack/)
- **Airbnb**
  - [Messaging Sync — Scaling Mobile Messaging at Airbnb](https://medium.com/airbnb-engineering/messaging-sync-scaling-mobile-messaging-at-airbnb-659142036f06)
- **General**
  - [WebSockets vs Long Polling](https://ably.com/blog/websockets-vs-long-polling)
  - [Best Practices for Using IndexedDB](https://web.dev/indexeddb-best-practices/)
  - [CSS Tricks: Messenger Gradient Effect](https://css-tricks.com/recreating-the-facebook-messenger-gradient-effect-with-css/)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern chat application frontend. It covers architectural decisions, data modeling, real-time messaging, offline/online sync, performance, accessibility, security, analytics, advanced features, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.