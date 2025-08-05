# 20-poll-widget: Summary

---

**Interviewer’s Intention**  
Goal: Assess your ability to design an embeddable, accessible, and secure poll widget for websites.

Want to see:

- If you can break down the system into embed, vote, and result flows.
- How you handle iframe/SDK, anti-abuse, and accessibility.
- If you consider theming, analytics, and real-world tradeoffs.
- How you justify design decisions and communicate alternatives.

---

✅ **Answer Framework**

1. **Clarify Requirements**

   - Embed on any website (iframe/SDK), up to 6 options, vote/unvote
   - Show results after voting, persist votes per user (cookie/localStorage)
   - Responsive, mobile-friendly, accessible, privacy-friendly
   - Anti-abuse (prevent duplicate votes), no login required
   - Customization, analytics, error handling

2. **Architecture & Data Flow**

   - **Embed via iframe (default):** Style/JS isolation, easy to use
   - **SDK/npm for advanced:** Dynamic config, auto-resize, host integration
   - **Component breakdown:** Poll, option list, option item, results
   - **State management:** Client store for poll state, API for results/votes
   - **API:** Endpoints for results, submit, unvote; rate limiting, input validation

3. **Accessibility & Internationalization**

   - ARIA roles: radiogroup/radio, aria-label, aria-live for updates
   - Keyboard navigation: Tab, Enter, Space
   - High-contrast colors, screen reader support
   - RTL support, localizable UI, error messages

4. **Customization, Analytics, and Security**

   - Theming: CSS variables, theme objects, light/dark
   - Analytics: vote/unvote events, opt-in only
   - Security: prevent XSS, sanitize content, HTTPS, rate limiting
   - Error handling: show errors in UI, optimistic UI for votes
   - Unit/integration/accessibility tests, visual regression

5. **Tradeoffs & Alternatives**
   - Iframe vs. direct DOM: iframe is safer, DOM is more customizable
   - Cookie/localStorage for vote persistence: not foolproof, but privacy-friendly
   - Show results after voting vs. before: after reduces bias
   - SSR for initial load vs. AJAX fetch

---

✅ **Example Content / Model Answer**

> “For a poll widget, I’d use iframe embed for isolation, persist votes with cookies/localStorage, and show results after voting. Accessibility with ARIA roles and keyboard navigation. Theming via CSS variables. Tradeoff: iframe is more robust, but less customizable for host sites. Cookie-based persistence is privacy-friendly, but not foolproof.”

---

**Pro Tips / Common Pitfalls**

- Don’t forget ARIA, keyboard support, and anti-abuse.
- Test with screen readers, RTL, and error scenarios.
- Sanitize all user-provided content.
