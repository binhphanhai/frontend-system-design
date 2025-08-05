import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  summarySidebar: [
    {
      type: "category",
      label: "Behavior Interview Summaries",
      items: [
        "behavior-interview/behavioral-interview-intro-summary",
        "behavior-interview/important-questions-summary",
        "behavior-interview/tell-me-about-yourself-summary",
        "behavior-interview/why-work-here-summary",
        "behavior-interview/questions-to-ask-summary",
        "behavior-interview/problem-solving-summary",
        "behavior-interview/collaboration-summary",
        "behavior-interview/growth-mindset-summary",
        "behavior-interview/self-answer-summary",
        "behavior-interview/self-answer-for-binance-summary",
      ],
    },
    {
      type: "category",
      label: "Frontend Interview Summaries",
      items: [
        "frontend-interview/frontend-interview-intro-summary",
        "frontend-interview/frontend-coding-interviews-summary",
        "frontend-interview/javascript-coding-interviews-summary",
        "frontend-interview/data-structures-algorithms-interviews-summary",
        "frontend-interview/user-interface-coding-interviews-summary",
        "frontend-interview/ui-interview-cheatsheet-summary",
        "frontend-interview/ui-component-api-design-summary",
        "frontend-interview/fe-system-design-quickstart-summary",
        "frontend-interview/fe-quiz-interview-questions-summary",
        "frontend-interview/frontend-engineer-resume-guide-summary",
      ],
    },
    {
      type: "category",
      label: "Frontend System Design Summaries",
      items: [
        "frontend-system-design/frontend-system-design-intro-summary",
        "frontend-system-design/types-of-frontend-system-design-questions-summary",
        "frontend-system-design/radio-framework-summary",
        "frontend-system-design/evaluation-criteria-summary",
        "frontend-system-design/common-mistakes-summary",
        "frontend-system-design/cheatsheet-summary",
        "frontend-system-design/news-feed-summary",
        "frontend-system-design/autocomplete-summary",
        "frontend-system-design/pinterest-summary",
        "frontend-system-design/rich-text-editor-summary",
        "frontend-system-design/google-docs-summary",
        "frontend-system-design/video-streaming-summary",
        "frontend-system-design/ecommerce-marketplace-summary",
        "frontend-system-design/travel-booking-summary",
        "frontend-system-design/chat-app-summary",
        "frontend-system-design/photo-sharing-summary",
        "frontend-system-design/dropdown-menu-summary",
        "frontend-system-design/image-carousel-summary",
        "frontend-system-design/modal-dialog-summary",
        "frontend-system-design/poll-widget-summary",
        "frontend-system-design/email-client-summary",
      ],
    },
    {
      type: "category",
      label: "React Interview Summaries",
      items: [
        "react-interview/react-interview-intro-summary",
        "react-interview/react-landscape-history-summary",
        "react-interview/how-to-prepare-for-react-interviews-summary",
        "react-interview/basic-react-concepts-summary",
        "react-interview/thinking-declaratively-summary",
        "react-interview/designing-state-summary",
        "react-interview/react-hooks-summary",
        "react-interview/event-handling-summary",
        "react-interview/forms-summary",
        "react-interview/signup-form-example-summary",
        "react-interview/data-fetching-summary",
        "react-interview/design-patterns-summary",
      ],
    },
  ],
  frontendSystemDesignSidebar: [
    "frontend-system-design/intro",
    {
      type: "category",
      label: "Fundamentals",
      items: [
        "frontend-system-design/frontend-system-design-intro",
        "frontend-system-design/types-of-frontend-system-design-questions",
        "frontend-system-design/radio-framework",
        "frontend-system-design/evaluation-criteria",
        "frontend-system-design/common-mistakes",
        "frontend-system-design/cheatsheet",
      ],
    },
    {
      type: "category",
      label: "Social & Content Platforms",
      items: [
        "frontend-system-design/news-feed",
        "frontend-system-design/photo-sharing",
        "frontend-system-design/chat-app",
        "frontend-system-design/pinterest",
      ],
    },
    {
      type: "category",
      label: "Text & Document Editing",
      items: [
        "frontend-system-design/rich-text-editor",
        "frontend-system-design/google-docs",
        "frontend-system-design/email-client",
      ],
    },
    {
      type: "category",
      label: "Search & Navigation",
      items: [
        "frontend-system-design/autocomplete",
        "frontend-system-design/dropdown-menu",
      ],
    },
    {
      type: "category",
      label: "Media & Entertainment",
      items: [
        "frontend-system-design/video-streaming",
        "frontend-system-design/image-carousel",
      ],
    },
    {
      type: "category",
      label: "E-commerce & Business",
      items: [
        "frontend-system-design/ecommerce-marketplace",
        "frontend-system-design/travel-booking",
      ],
    },
    {
      type: "category",
      label: "UI Components",
      items: [
        "frontend-system-design/modal-dialog",
        "frontend-system-design/poll-widget",
      ],
    },
  ],
  frontendInterviewSidebar: [
    "frontend-interview/frontend-interview-intro",
    {
      type: "category",
      label: "Coding interviews",
      items: [
        "frontend-interview/frontend-coding-interviews",
        "frontend-interview/javascript-coding-interviews",
        "frontend-interview/data-structures-algorithms-interviews",
      ],
    },
    {
      type: "category",
      label: "User interface interviews",
      items: [
        "frontend-interview/user-interface-coding-interviews",
        "frontend-interview/ui-interview-cheatsheet",
        "frontend-interview/ui-component-api-design",
      ],
    },
    "frontend-interview/fe-system-design-quickstart",
    "frontend-interview/fe-quiz-interview-questions",
    "frontend-interview/frontend-engineer-resume-guide",
  ],
  reactInterviewSidebar: [
    {
      type: "category",
      label: "Overview",
      items: [
        "react-interview/react-interview-intro",
        "react-interview/react-landscape-history",
        "react-interview/how-to-prepare-for-react-interviews",
      ],
    },
    {
      type: "category",
      label: "Essential topics",
      items: [
        "react-interview/basic-react-concepts",
        "react-interview/thinking-declaratively",
        "react-interview/designing-state",
        "react-interview/react-hooks",
        "react-interview/event-handling",
        "react-interview/forms",
        "react-interview/signup-form-example",
        "react-interview/data-fetching",
        "react-interview/design-patterns",
      ],
    },
  ],
  behaviorInterviewSidebar: [
    {
      type: "category",
      label: "Overview",
      items: [
        "behavior-interview/behavioral-interview-intro",
        "behavior-interview/important-questions",
      ],
    },
    {
      type: "category",
      label: "Solving common questions",
      items: [
        "behavior-interview/tell-me-about-yourself",
        "behavior-interview/why-work-here",
        "behavior-interview/questions-to-ask",
        "behavior-interview/problem-solving",
        "behavior-interview/collaboration",
        "behavior-interview/growth-mindset",
        "behavior-interview/self-answer",
        "behavior-interview/self-answer-for-binance",
      ],
    },
  ],
};

export default sidebars;
