# Front End System Design: An Introduction

*Learn useful techniques and how to approach top front end system design questions. Written by ex-interviewers at FAANG.*

---

System design interviews differ significantly from coding and quiz questions. They are open-ended, with no single correct answer. Candidates are presented with a broad problem or scenario and are expected to collaborate with the interviewer to develop a suitable software design—often on a whiteboard or a collaborative drawing app in virtual interviews. This process is similar to writing technical design documents in real-world engineering, where possible approaches, technical decisions, and tradeoffs are discussed, but condensed into a 30-60 minute session.

System design interviews are typically reserved for candidates with professional experience (not fresh graduates). Performance in these interviews heavily influences the job level offered, and failing them often leads to rejection. Therefore, excelling in system design interviews is crucial!

However, the open-ended nature of these interviews makes them harder to practice for than coding interviews. Many candidates lack real-world experience building complex systems, making it difficult to draw from experience. Additionally, most available resources focus on general software engineering and distributed systems, not front end system design.

**GreatFrontEnd's front end system design resources aim to fill this gap, providing comprehensive guidance to help you succeed in front end system design interviews.**

![System Design Interview Illustration](https://raw.githubusercontent.com/GreatFrontEnd/assets/main/system-design-interview.png)

## Front End vs Back End / Full Stack System Design

Traditional system design interviews for Software Engineers focus on distributed systems—web servers, API gateways, load balancers, caches, databases, microservices, message queues, streams, and more. For Front End Engineers, the emphasis shifts to client-side concerns and the design of APIs between client and server, rather than deep backend architecture.

| Area                              | Back end / Full stack                                      | Front end                                   |
|------------------------------------|------------------------------------------------------------|---------------------------------------------|
| Gather requirements                | Required                                                   | Required                                    |
| Architecture / High-level entities | Distributed cloud services                                 | Application/Component                       |
| Back-of-the-envelope estimation    | May be required                                            | Not required                                |
| Components of the system           | Cloud services (Load balancer, DB, Caches, etc.)           | Application modules (Model, View, Controller)|
| Data model                         | Database schema                                            | Application state                           |
| Type of APIs between components    | Network (Any protocol)                                     | Network (HTTP, WebSocket), JS functions     |
| Deep dives / focus areas           | Scalability, Reliability, Consistency, Availability         | Performance, UX, Accessibility, i18n        |
| Less important (black box)         | Client                                                     | Server                                      |

For example, when asked to design a Facebook news feed:
- **Back end / Full stack:** Focuses on capacity estimation, database schema, microservice APIs, scalability, and handling posts from users with varying numbers of followers.
- **Front end:** Focuses on the HTTP API for the feed, implementing pagination, post interactions, creating new posts, and user experience/accessibility.

As shown, front end system design interviews require a different approach and focus compared to back end interviews.

## What You Will Learn in This Guide

This Front End System Design guide is structured in two parts. First, you'll gain a deeper understanding of system design interviews. Then, you'll explore front end system design case studies using the RADIO framework.

- [Types of questions](types-of-frontend-system-design-questions): Types of Front End System Design interview questions and examples
- [RADIO framework](radio-framework): A framework for answering Front End System Design interview questions
- [Evaluation criteria](evaluation-criteria): How you are being evaluated and what interviewers are looking for
- [Common mistakes](common-mistakes): Common mistakes to avoid during Front End System Design interviews