# The RADIO Framework

*Approach your front end system design interviews in a structured fashion. A good structure is half the battle won.*

---

A good beginning is half the battle won. By using the **RADIO framework** to answer front end system design questions, you will already be much closer to acing your interview.

In front end system design interviews, the systems you are asked to design are often products. The RADIO framework helps you structure your answer:

- **R**equirements
- **A**rchitecture
- **D**ata Model
- **I**nterfaces
- **O**ptimizations

![RADIO Framework Overview](https://raw.githubusercontent.com/GreatFrontEnd/assets/main/radio-framework.png)

## What is RADIO about?

1. **Requirements exploration**: Understand the problem thoroughly and determine the scope by asking clarifying questions.
2. **Architecture / High-level design**: Identify the key components of the product and how they relate to each other.
3. **Data model / Core entities**: Describe the core entities and their data—fields each entity contains and which component(s) they belong to.
4. **Interface definition (API)**: Define the interface (API) between components, the functionality of each API, their parameters, and responses.
5. **Optimizations and deep dive**: Discuss possible optimization opportunities and specific areas of interest when building the product.

---

## Requirements Exploration

**Objective:** Understand the problem thoroughly and determine the scope by asking clarifying questions.

**Recommended duration:** Not more than 15% of the session.

System design interview questions are open-ended and often vague by design. You must dig deeper and clarify ambiguities by asking useful questions. Treat your interviewer as a product manager—ask enough questions to know what problems you are solving and what you need to build.

**Key questions to ask:**
- What are the main use cases to focus on?
- What are the functional and non-functional requirements?
- What are the core features to focus on, and which are good-to-have?
- What devices/platforms need to be supported?
- Is offline support necessary?
- Who are the main users?
- What are the performance requirements?

Write down the agreed requirements to refer to throughout the interview.

---

## Architecture / High-level Design

**Objective:** Identify the key components of the product and how they are related.

**Recommended duration:** ~20% of the session.

With requirements in mind, design the product/system architecture by identifying key components, their interactions, and relationships. Focus on **client-side architecture**.

**Common components/modules:**
- **Server**: Treated as a black box exposing APIs.
- **View**: What the user sees; may contain subviews and client-only state.
- **Controller**: Handles user interactions and data processing.
- **Model/Client store**: Where data lives; stores app-wide or component-specific data.

**Consider:**
- Separation of concerns
- Where computation should occur (client vs. server)

**Example architecture diagram:**

![Example architecture diagram](https://www.gfecdn.net/img/questions/news-feed-facebook/news-feed-architecture.png)

**Component responsibilities:**
- **Server**: Serves feed data and provides HTTP API for new posts.
- **Controller**: Controls data flow and makes network requests.
- **Client store**: Stores data needed across the app.
- **Feed UI**: Displays feed posts and composer UI.
  - **Feed post**: Shows post data and interaction buttons.
  - **Post composer**: UI for creating new posts.

---

## Data Model

**Objective:** Describe the various data entities, their fields, and which component(s) they belong to.

**Recommended duration:** ~10% of the session.

There are two kinds of data in client applications:
- **Server-originated data**: From the server/database, e.g., user data, posts, comments.
- **Client-only data**: State that lives only on the client, e.g., form input, UI state.
  - **Persisted data**: User input to be sent to the server.
  - **Ephemeral data**: Temporary state, e.g., validation, navigation tab.

**Example data model for a News Feed:**

| Source         | Entity     | Belongs to         | Fields                                                      |
|---------------|------------|--------------------|-------------------------------------------------------------|
| Server        | `Post`     | Feed Post          | `id`, `created_time`, `content`, `image`, `author`, `reactions` |
| Server        | `Feed`     | Feed UI            | `posts` (list of `Post`s), `pagination`                     |
| Server        | `User`     | Client Store       | `id`, `name`, `profile_photo_url`                           |
| User input    | `NewPost`  | Feed Composer UI   | `message`, `image`                                          |

---

## Interface Definition (API)

**Objective:** Define the interface between components, the functionality of APIs, their parameters, and responses.

**Recommended duration:** ~15% of the session.

APIs define how components communicate. This can be server-client (HTTP/WebSockets) or client-client (JavaScript functions/events).

| Parts of an API         | Server-client           | Client-client           |
|------------------------|------------------------|-------------------------|
| Name and functionality | HTTP path              | JavaScript function     |
| Parameters             | HTTP GET/POST params   | Function parameters     |
| Return Value           | HTTP response (JSON)   | Function return value   |

**Server-client API example:**

| Field        | Value                                   |
|--------------|-----------------------------------------|
| HTTP Method  | `GET`                                   |
| Path         | `/feed`                                 |
| Description  | Fetches the feed results for a user.    |

**Parameters:**
```json
{
  "size": 10,
  "cursor": "=dXNlcjpXMDdRQ1JQQTQ"
}
```

**Response:**
```json
{
  "pagination": {
    "size": 10,
    "next_cursor": "=dXNlcjpVMEc5V0ZYTlo"
  },
  "results": [
    {
      "id": "123",
      "author": { "id": "456", "name": "John Doe" },
      "content": "Hello world",
      "image": "https://www.example.com/feed-images.jpg",
      "reactions": { "likes": 20, "haha": 15 },
      "created_time": 1620639583
    }
    // ... More posts.
  ]
}
```

**Client-client API:**
- JavaScript functions or events, with clear parameters and return values.
- For UI components, discuss customization options (like React props).

---

## Optimizations and Deep Dive

**Objective:** Discuss possible optimization opportunities and specific areas of interest when building the product.

**Recommended duration:** ~40% of the session.

You won't have time to cover every area, so focus on:
- The most important areas for the product (e.g., performance for e-commerce, collaboration for editors)
- Your strengths (e.g., accessibility, performance, security)

**General optimization/deep dive areas:**
- Performance
- User Experience
- Network
- Accessibility (a11y)
- Multilingual Support
- Multi-device Support
- Security

Refer to the [UI component questions cheatsheet](cheatsheet) for more details.

---

## Summary Table

| Step                        | Objective                                                                 | Recommended duration |
|-----------------------------|---------------------------------------------------------------------------|---------------------|
| Requirements exploration    | Understand the problem and determine the scope by asking clarifying questions. | &lt;15%                |
| Architecture / High-level   | Identify key components and their relationships.                              | ~20%                |
| Data model                  | Describe data entities, fields, and ownership.                                | ~10%                |
| Interface definition (API)  | Define APIs, their functionality, parameters, and responses.                  | ~15%                |
| Optimizations and deep dive | Discuss optimization opportunities and specific areas of interest.             | ~40%                |