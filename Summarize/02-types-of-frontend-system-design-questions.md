# Types of Front End System Design Questions

*Question formats you can expect in a front end system design interview.*

---

Front end system design interviews typically feature two main types of questions:

1. **Applications**
2. **UI Components**

![Types of Front End System Design Questions](https://raw.githubusercontent.com/GreatFrontEnd/assets/main/frontend-system-design-types.png)

## Applications

Designing applications in front end system design interviews is similar to general Software Engineering system design interviews, but with a focus on the client side. Instead of distributed systems, you should discuss application architecture and client-side implementation details.

Modern web apps (like Gmail, Facebook, YouTube, ChatGPT, Google Calendar) are highly interactive and dynamic, often rivaling desktop applications in complexity. These apps use JavaScript to fetch data and update the page dynamically, avoiding full page reloads.

Common application architectures such as Model-View-Controller (MVC) and Model-View-ViewModel (MVVM) are relevant for web apps. React, a popular JavaScript library, often uses a unidirectional Flux/Redux-based architecture.

When answering application design questions:
- Focus on unique aspects of the application, not just general patterns.
- Start with high-level architecture, identify system components, and define APIs between them.
- Dive into interesting or unique areas and discuss implementation or optimization strategies.

### Examples of Application Questions

| Application         | Examples                                 | Important Areas                                      |
|--------------------|------------------------------------------|------------------------------------------------------|
| News Feed          | Facebook, Twitter                        | Feed interactions, pagination, post composer         |
| Messaging/Chat     | Messenger, Slack, Discord                | Real-time chat, message syncing, chat/message lists  |
| E-commerce         | Amazon, eBay                             | Product listing/detail, cart, checkout               |
| Photo Sharing      | Instagram, Flickr, Google Photos         | Browsing, editing, uploading photos                  |
| Travel Booking     | Airbnb, Skyscanner                       | Search UI/results, booking UI                        |
| Video Streaming    | Netflix, YouTube                         | Video player, streaming, recommendations             |
| Pinterest          | Pinterest                                | Masonry layout, media feed optimizations             |
| Collaborative Apps | Google Docs/Sheets/Slides, Notion        | Real-time collaboration, conflict resolution         |
| Email Client       | Outlook, Apple Mail, Gmail               | Mailbox syncing/UI, email composer                   |
| Drawing            | Figma, Excalidraw, Canva                 | Rendering, state/data model, state management        |
| Maps               | Google/Apple Maps, Foursquare            | Map rendering, displaying locations                  |
| File Storage       | Google Drive, Dropbox                    | Uploading/downloading files, file explorer           |
| Video Conferencing | Zoom, Google Meet                        | Video streaming, viewing modes                       |
| Ridesharing        | Uber, Lyft                               | Trip booking, driver location, app states            |
| Music Streaming    | Spotify, Apple Music                     | Audio streaming, player UI, playlists                |
| Games              | Tetris, Snake                            | Game state, loop, logic                              |

## UI Components

Modern front end development relies heavily on component libraries (e.g., jQuery UI, Bootstrap, Material UI, Chakra UI). Front End Engineers are expected to build a variety of UI components, ranging from simple (text, button, badge) to complex (autocomplete, dropdown, modal).

When designing a UI component:
- Identify subcomponents (e.g., for an image carousel: image, pagination buttons, thumbnails)
- Define the external API (props/options)
- Describe internal state and APIs between subcomponents
- Discuss optimizations for performance, accessibility, user experience, and security

You may be asked to write code to:
1. Describe the component hierarchy
2. Define the component state shape
3. Explain non-trivial logic

#### Example: Image Carousel Component (JSX)
```jsx
<ImageCarousel
  images={...}
  onPrev={...}
  onNext={...}
  layout="horizontal"
>
  <ImageCarouselImage style={...} />
  <ImageThumbnail onClick={...} />
</ImageCarousel>
```

### Customizing Theming

You will likely be expected to design a way for developers to customize the component's appearance. For more, see the [UI Components API Design Principles Section](https://greatfrontend.com/front-end-interview-guidebook/user-interface-components-api-design-principles).

### Examples of UI Component Questions
- Design an [autocomplete component](/questions/system-design/autocomplete)
- Design a [dropdown menu component](/questions/system-design/dropdown-menu)
- Design an [embeddable poll widget](/questions/system-design/poll-widget)
- Design an [image carousel](/questions/system-design/image-carousel)
- Design a [modal component](/questions/system-design/modal-dialog)
- Design a [rich text editor](/questions/system-design/rich-text-editor)
- Design a data table with sorting and pagination
- Design a datepicker
- Design a multiselect component

## What to Do During Interviews?

Now that you know the types of questions, how should you answer them? Use the [RADIO framework](/system-design/framework), a structured approach designed to help you ace front end system design interviews.