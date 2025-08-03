# Video Streaming System Design (e.g. Netflix, YouTube)

*System design interview question: Design a video streaming application similar to Netflix or YouTube that allows users to browse, discover, and watch video content.*

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Exploration](#requirements-exploration)
3. [Background & Glossary](#background--glossary)
4. [Architecture / High-Level Design](#architecture--high-level-design)
5. [Data Model](#data-model)
6. [API & Interface Definition](#api--interface-definition)
7. [Video Player Internals](#video-player-internals)
8. [Streaming Protocols & Adaptive Bitrate](#streaming-protocols--adaptive-bitrate)
9. [Subtitles & Closed Captions](#subtitles--closed-captions)
10. [Performance Optimizations](#performance-optimizations)
11. [User Experience (UX)](#user-experience-ux)
12. [Accessibility (a11y)](#accessibility-a11y)
13. [Internationalization (i18n)](#internationalization-i18n)
14. [Security & DRM](#security--drm)
15. [CDN, Caching, and Edge Delivery](#cdn-caching-and-edge-delivery)
16. [Analytics, A/B Testing, and Observability](#analytics-ab-testing-and-observability)
17. [Device Compatibility & Offline Support](#device-compatibility--offline-support)
18. [Error Handling & Edge Cases](#error-handling--edge-cases)
19. [Scalability & Future-Proofing](#scalability--future-proofing)
20. [References & Further Reading](#references--further-reading)

---

## 1. Overview

Video streaming platforms like Netflix, YouTube, Hulu, and Prime Video are among the most demanding web applications, requiring high performance, reliability, and scalability. They deliver video content to millions of users worldwide, supporting a wide range of devices, network conditions, and accessibility needs. This document provides a deep, technical dive into the architecture, data model, protocols, video player design, streaming optimizations, accessibility, security, analytics, and real-world trade-offs for building a modern video streaming frontend.

---

## 2. Requirements Exploration

### Core Features
- **Discovery:** Browse recommended videos on the homepage (discovery/recommendations page)
- **Billboard:** Autoplaying billboard video at the top of the recommendations page
- **Playback:** Standalone watch page for video playback
- **Adaptive Streaming:** Support for multiple video resolutions and adaptive streaming (ABR)
- **Player Features:** Play, pause, seek, skip, playback rate, volume, audio language, subtitles, PiP (Picture-in-Picture), mini-player
- **Subtitles/CC:** Subtitles and closed captions in multiple languages
- **Multi-device:** Usable on desktop, tablet, mobile, smart TVs, and game consoles
- **User Profiles:** Personalized recommendations, watch history, continue watching
- **Authentication:** Secure login, parental controls, geo-restrictions
- **Offline Support:** Download for offline viewing (where allowed)

### Non-Functional Requirements
- **Performance:** Smooth, low-latency video watching experience
- **Startup Time:** Fast video startup and minimal buffering
- **Resilience:** Graceful handling of network errors, device limitations
- **Scalability:** Support millions of concurrent users
- **Security:** DRM, anti-piracy, secure APIs
- **Accessibility:** WCAG/ARIA compliance, keyboard navigation, screen reader support
- **Analytics:** Real-time playback analytics, A/B testing, error reporting

---

## 3. Background & Glossary

| Term         | Description |
|--------------|-------------|
| Streaming    | Delivering video/audio in real-time over the internet, allowing playback before the full file is downloaded |
| Buffering    | Preloading video segments to prevent playback interruptions |
| Bitrate      | Data transferred per second; higher bitrate = better quality, larger files |
| Frame rate   | Frames per second (fps), e.g., 24, 30, 60 |
| Resolution   | Video dimensions (e.g., 1920x1080) |
| Codec        | Software/hardware for encoding/decoding video/audio (e.g., H.264, VP9, AV1) |
| Bandwidth    | Network data transfer capacity |
| Poster       | Static thumbnail image for a video |
| Closed captions (CC) | Text-based subtitles for accessibility |
| Manifest     | File listing available video qualities, segment URLs, audio/subtitle tracks |
| DRM          | Digital Rights Management, prevents unauthorized copying |
| CDN          | Content Delivery Network, distributes content closer to users |

---

## 4. Architecture / High-Level Design

### System Diagram
![Video streaming client architecture](https://www.gfecdn.net/img/questions/video-streaming-netflix/video-streaming-netflix-architecture.png)

### Rendering Approach
- **SSR (Server-Side Rendering):** For SEO and fast initial load on public pages (e.g., Netflix title page, YouTube homepage)
- **CSR (Client-Side Rendering):** For interactive watch pages, player controls
- **SPA (Single-Page Application):** For fast navigation, persistent state, and prefetching

| Service  | Page                  | Access    | Rendering                |
|----------|-----------------------|-----------|--------------------------|
| Netflix  | Video title page      | Public    | SSR full page            |
| Netflix  | Browse/discover page  | Logged in | SSR above the fold       |
| Netflix  | Watch page            | Logged in | SSR app data (JSON)      |
| YouTube  | Homepage              | Public    | SSR skeleton             |
| YouTube  | Watch page            | Public    | SSR UI skeleton + poster |

#### SPA Benefits
- Data persists across navigation (e.g., recommendations cache)
- Prefetching improves video startup time
- Seamless transitions between discovery and watch pages

### Component Responsibilities
- **Server:** HTTP APIs for recommendations, video metadata, authentication, analytics
- **Video CDN server:** Delivers video segments, posters, thumbnails
- **Client store:** Caches recommendations, persists across navigation
- **Discover page:** Browses categories, billboard video, video lists
- **Watch page:** Full-screen video player, playback controls, subtitles
- **Service Worker:** For offline support, caching, background sync

---

## 5. Data Model

| Entity            | Source  | Belongs to      | Fields                                      |
|-------------------|---------|----------------|---------------------------------------------|
| Recommendations   | Server  | Discover page  | lists (VideoList[]), pagination              |
| VideoList         | Server  | Discover page  | videos (VideoMetadata[]), pagination         |
| VideoMetadata     | Server  | Discover page  | id, title, boxart_url, duration, rating, genres, description, release_date, cast, crew, ... |
| UserProfile       | Server  | All pages      | id, name, preferences, watch history, ...    |
| PlaybackSession   | Client  | Watch page     | currentTime, quality, subtitles, ...         |

- Recommendations are cached in the client store for fast navigation
- Video player has its own state model (see below)
- User profile and playback session are persisted for personalization and resume

---

## 6. API & Interface Definition

### Video Recommendations API
```json
{
  "recommendations": {
    "items": [
      {
        "name": "TV Shows",
        "videos": {
          "items": [
            { "videoId": 123, "title": "...", "boxArtUrl": "..." },
            { "videoId": 124, "title": "...", "boxArtUrl": "..." }
          ],
          "pagination": {}
        }
      },
      {
        "name": "New Releases",
        "videos": {
          "items": [
            { "videoId": 125, "title": "...", "boxArtUrl": "..." },
            { "videoId": 126, "title": "...", "boxArtUrl": "..." }
          ],
          "pagination": {}
        }
      }
    ],
    "pagination": {}
  }
}
```
- Cursor-based or offset-based pagination
- First page is SSR'd and injected into the client store

### Media Streaming & Subtitles API
- Depends on streaming protocol (DASH, HLS)
- Manifest files (MPD for DASH, M3U8 for HLS) list available qualities, segment URLs, audio/subtitle tracks
- Secure signed URLs for DRM-protected content

### Authentication & User Profile API
- OAuth2, JWT tokens, session management
- Parental controls, geo-restrictions, device management

---

## 7. Video Player Internals

![Video player UI example and their parts](https://www.gfecdn.net/img/questions/video-streaming-netflix/video-streaming-netflix-video-player-parts.png)
![Video player architecture](https://www.gfecdn.net/img/questions/video-streaming-netflix/video-streaming-netflix-video-player-architecture.png)

### Player Architecture
- **View/UI:** Progress control, control bar, media, overlays, error messages
- **State:** Player state, buffered frames, current time, duration, playback rate, volume, audio/subtitle language, tracks, poster, dimensions, PiP, mini-player
- **Dispatcher:** Dispatches actions to reducer (e.g., play, pause, seek, adjust volume)
- **Actions:** Play, pause, skip, seek, adjust volume, mute, toggle fullscreen, PiP, select quality, select audio/subtitle
- **Keyboard events:** Space (play/pause), volume keys, arrow keys (skip), fullscreen shortcut, accessibility shortcuts
- **Background events:** `loadstart`, `loadeddata`, `ended`, `error`, `stalled`, `waiting`, `encrypted`, `resize`, `visibilitychange`
- **Pattern:** Flux-like unidirectional flow (Redux, useReducer)
- **State sync:** UI state is source of truth, sync with DOM video state
- **Error Handling:** Graceful fallback for unsupported codecs, network errors, DRM issues

#### Example: Player State Model (TypeScript)
```ts
interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  quality: string;
  audioTrack: string;
  subtitleTrack: string;
  isFullscreen: boolean;
  isPiP: boolean;
  error?: string;
}
```

#### Libraries
- [Shaka Player](https://github.com/shaka-project/shaka-player): Adaptive streaming (DASH, HLS)
- [Video.js](https://videojs.com/): Customizable video player
- [Media Chrome](https://www.media-chrome.org/): Web components for media players
- [hls.js](https://github.com/video-dev/hls.js): HLS playback in browsers

---

## 8. Streaming Protocols & Adaptive Bitrate

### Native `<video>` Elements
- Progressive download: `<video src="movie.mp4">`
- Limited adaptive streaming support, restricted customization, no advanced features

### Media Source Extensions (MSE)
- Enables streaming via JavaScript, appends video segments dynamically
- Used with DASH/HLS for adaptive streaming
- Example:
```js
const videoEl = document.getElementById('my-video');
const mediaSource = new MediaSource();
videoEl.src = URL.createObjectURL(mediaSource);
// ...
```

### Adaptive Bitrate Streaming (ABR)
- Player selects best quality based on bandwidth, device, playback rate
- Monitors bandwidth, connection, player size, device capabilities
- [Media Capabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API) helps select optimal codec/resolution
- Seamless switching between qualities to minimize buffering
- Buffer health monitoring, rebuffering strategies

### Streaming Protocols
- **DASH:** MPD manifest (XML), used by Netflix, YouTube, Prime Video
- **HLS:** M3U8 manifest (text), used by Apple, supported by most browsers
- Both use segmented media files, HTTP delivery, manifest files
- **CMAF:** Common Media Application Format, enables low-latency streaming

#### Example DASH MPD
```xml
<MPD ...>
  <Period start="PT0S">
    <AdaptationSet mimeType="video/mp4" ...>
      <Representation id="video_1" width="1920" height="1080" ...>
        <SegmentTemplate media="video_1_$Number$.m4s" ... />
      </Representation>
      <!-- ... -->
    </AdaptationSet>
    <AdaptationSet mimeType="audio/mp4" lang="en">
      <Representation id="audio_1" ...>
        <SegmentTemplate media="audio_1_$Number$.m4s" ... />
      </Representation>
    </AdaptationSet>
  </Period>
</MPD>
```

#### Example HLS M3U8
```m3u8
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
http://example.com/low.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=960x540
http://example.com/medium.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
http://example.com/high.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
http://example.com/hd.m3u8
```

---

## 9. Subtitles & Closed Captions

- **Subtitles:** For translation, dialogue only
- **Closed captions:** For accessibility, includes sound effects, speaker IDs
- **Formats:** SRT, VTT, TTML, SCC
- **WebVTT:** Used with `<track>` in HTML5 video
```html
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track label="English" kind="subtitles" srclang="en" src="subtitles.vtt" default />
</video>
```
- **Streaming protocols:** DASH/HLS can deliver subtitles as separate tracks
- **Accessibility:** Customizable, multi-language, includes non-speech elements
- **Live captions:** Real-time generation for live streams

---

## 10. Performance Optimizations

- **Minimize latency:** Fast video loading, adaptive streaming, buffer ahead
- **Buffering:** Optimize buffer size, preload segments, efficient algorithms
- **Network efficiency:** Use modern codecs (AV1, VP9), CDN delivery, lazy load videos
- **Player responsiveness:** UI remains interactive during playback
- **Preloading:** Use `preload` attribute or link preload for posters/thumbnails
- **Separate audio/video streams:** Allows for language switching, background playback
- **Image optimizations:** Preload posters, responsive thumbnails
- **Bandwidth efficiency:** Selective autoplay, buffer only as needed
- **Memory usage:** Release buffers, clean up resources, avoid leaks
- **Startup time:** Separate video lifecycle from UI lifecycle for faster playback
- **Prefetching:** Predict and prefetch next likely videos
- **Service Worker:** Cache assets, enable offline playback

---

## 11. User Experience (UX)

- **Playback controls:** Play, pause, seek, volume, fullscreen, PiP
- **Consistent UI:** Familiar controls, responsive design, dark/light mode
- **Seeking/scrubbing:** Accurate, with thumbnail previews
- **Customization:** Quality, speed, subtitles, error handling
- **Enhanced experience:** Prevent layout shifts, use poster images, thumbnail previews
- **Continue watching:** Resume from last position
- **Mini-player:** Floating player for browsing while watching
- **Recommendations:** Personalized, context-aware
- **Error feedback:** User-friendly error messages, retry options

---

## 12. Accessibility (a11y)

- **Subtitles:** Multi-language, customizable, accessible
- **Visual assistance:** Contrast, progress/buffering indicators, descriptive labels
- **Screen readers:** Labeled controls, playback info, TTS compatibility
- **Keyboard support:** Full navigation, shortcuts, focus management
- **External controls:** Touch, keyboard, remote, media keys
- **Compliance:** Follows accessibility standards (WCAG, ARIA)
- **Audio descriptions:** For visually impaired users
- **Focus management:** Trap focus in player, visible focus indicators

---

## 13. Internationalization (i18n)

- **Language support:** UI, subtitles, audio tracks
- **RTL support:** Layout adapts for right-to-left languages
- **Region-based content:** Geo-restrictions, content ratings
- **Localization:** Metadata, labels, compliance
- **Multi-currency:** For transactional platforms

---

## 14. Security & DRM

- **DRM:** Widevine, PlayReady, FairPlay for encrypted content
- **Secure APIs:** HTTPS, signed URLs, token-based access
- **Anti-piracy:** Watermarking, fingerprinting, playback restrictions
- **Geo-restrictions:** Enforce content licensing
- **Parental controls:** Restrict mature content
- **Session management:** Prevent sharing, device limits
- **CORS:** Secure cross-origin requests
- **Vulnerability handling:** XSS, CSRF, clickjacking

---

## 15. CDN, Caching, and Edge Delivery

- **CDN:** Distribute video segments, posters, manifests close to users
- **Edge caching:** Reduces latency, offloads origin servers
- **Cache busting:** For updated content
- **Prefetching:** Predictive fetch of next likely videos
- **Multi-CDN:** Failover, geo-load balancing
- **Service Worker:** Client-side caching for offline/poor network
- **Cache control headers:** Fine-tune browser and CDN caching

---

## 16. Analytics, A/B Testing, and Observability

- **Playback analytics:** Startup time, buffering events, errors, engagement
- **A/B testing:** UI/feature experiments, player algorithms
- **Real-time monitoring:** Detect outages, performance regressions
- **User behavior:** Recommendations, personalization
- **Error reporting:** Sentry, custom logging
- **Privacy:** GDPR/CCPA compliance, anonymized data

---

## 17. Device Compatibility & Offline Support

- **Device matrix:** Desktop, mobile, tablet, smart TVs, game consoles
- **Feature detection:** Use [Media Capabilities API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capabilities_API)
- **Polyfills:** For unsupported features (e.g., hls.js for HLS in Chrome)
- **Offline support:** Service Worker caches video segments, metadata
- **Download manager:** For offline viewing, progress tracking
- **Adaptive UI:** Responsive design, touch/remote controls

---

## 18. Error Handling & Edge Cases

- **Network errors:** Retry logic, fallback to lower quality
- **Codec errors:** Fallback to supported codecs
- **Manifest errors:** Graceful error messages
- **Playback errors:** User feedback, auto-recovery
- **DRM errors:** Inform user, suggest troubleshooting
- **Edge cases:** Device sleep, tab switch, network change, battery saver
- **Testing:** Automated and manual tests for all scenarios

---

## 19. Scalability & Future-Proofing

- **Horizontal scaling:** Stateless APIs, CDN scaling
- **Microservices:** Modular backend for recommendations, metadata, analytics
- **API versioning:** Backward compatibility
- **Progressive enhancement:** New features for capable devices
- **WebAssembly:** For performance-critical video processing
- **Low-latency streaming:** CMAF, WebRTC for live events
- **Modular player:** Plugin architecture for extensibility
- **Continuous integration:** Automated deployment, canary releases

---

## 20. References & Further Reading
- [How video works](https://howvideo.works/)
- [Building a Better Web - Part 1: A faster YouTube on web](https://web.dev/better-youtube-web-part1/)
- [How YouTube improved video performance with the Media Capabilities API](https://web.dev/youtube-media-capabilities/)
- [Media Source API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)
- [UI frameworks and Media Elements](https://medium.com/axon-enterprise/ui-frameworks-and-media-elements-c0c6832528e5)
- [Modernizing the Web Playback UI | Netflix Tech Blog](https://netflixtechblog.com/modernizing-the-web-playback-ui-1ad2f184a5a0)
- [Setting up adaptive streaming media sources - Developer guides](https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources)

---

This document provides an exhaustive, technical overview of the design and implementation of a modern video streaming frontend. It covers architectural decisions, data modeling, video player internals, streaming protocols, performance, accessibility, security, analytics, device compatibility, and real-world trade-offs, serving as a reference for advanced system design interviews and production-grade implementations.