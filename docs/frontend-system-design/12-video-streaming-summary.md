# 12-video-streaming: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design a scalable, performant, and accessible video streaming frontend (like Netflix/YouTube).

Want to see:

- If you can break down the system into discovery, playback, and analytics.
- How you handle adaptive streaming, SSR, CDN, and device compatibility.
- If you consider accessibility, security, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Discovery, recommendations, personalized homepage
   - Adaptive streaming (multiple resolutions, ABR)
   - Subtitles, multi-language, accessibility (WCAG/ARIA)
   - Device compatibility (desktop, mobile, TV)
   - Offline support, analytics, security (DRM)
   - SEO for public pages, fast startup, low buffering

2. **Architecture & Data Flow**

   - **SSR for SEO and fast initial load** (Next.js, Remix)
   - **SPA for watch page and player controls**
   - **CDN for video segments, posters, thumbnails**
   - **Service Worker for offline support and caching**
   - **Component breakdown:** Discover page, watch page, video player, subtitles, recommendations
   - **State management:** Client store for recommendations, playback session, user profile

3. **Adaptive Streaming & Player Internals**

   - **Protocols:** DASH, HLS, CMAF for segmented delivery
   - **Media Source Extensions (MSE):** For ABR and custom player logic
   - **Player features:** Play, pause, seek, skip, PiP, mini-player, subtitles, audio tracks
   - **Performance:** Buffering, preloading, lazy loading, code splitting, prefetching
   - **Analytics:** Playback events, A/B testing, error reporting

4. **Accessibility & Internationalization**

   - Subtitles/CC (WebVTT, SRT), multi-language UI, ARIA roles
   - Keyboard navigation, screen reader support, color contrast
   - Region-based content, geo-restrictions, localization

5. **Security, CDN, and Scalability**

   - DRM (Widevine, PlayReady, FairPlay), HTTPS, signed URLs
   - CDN/edge caching for low latency
   - Horizontal scaling, microservices, API versioning
   - Real-time monitoring, error handling, device compatibility

6. **Tradeoffs & Alternatives**
   - SSR vs. CSR: SSR for SEO, CSR for interactivity
   - DASH vs. HLS: DASH is more flexible, HLS is widely supported
   - SPA vs. MPA: SPA for fast navigation, MPA for SEO
   - Prefetching vs. lazy loading: balance startup time and bandwidth

---

✅ **Example Content / Model Answer**

> “For a video streaming frontend, I’d use SSR for the homepage and SPA for the player. I’d use adaptive streaming (DASH/HLS) with MSE, and CDN for video delivery. The player supports ABR, subtitles, and PiP. Accessibility is ensured with ARIA roles and keyboard navigation. Service Worker enables offline support. Tradeoff: SSR is best for SEO, but SPA is better for interactivity and fast navigation.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget accessibility, device compatibility, and analytics.
- Optimize for startup time, buffering, and bandwidth.
- Test with slow networks, different devices, and screen readers.
