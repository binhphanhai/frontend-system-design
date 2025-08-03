import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

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
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Fundamentals',
      items: [
        'frontend-system-design-intro',
        'types-of-frontend-system-design-questions',
        'radio-framework',
        'evaluation-criteria',
        'common-mistakes',
        'cheatsheet',
      ],
    },
    {
      type: 'category',
      label: 'Social & Content Platforms',
      items: [
        'news-feed',
        'photo-sharing',
        'chat-app',
        'pinterest',
      ],
    },
    {
      type: 'category',
      label: 'Text & Document Editing',
      items: [
        'rich-text-editor',
        'google-docs',
        'email-client',
      ],
    },
    {
      type: 'category',
      label: 'Search & Navigation',
      items: [
        'autocomplete',
        'dropdown-menu',
      ],
    },
    {
      type: 'category',
      label: 'Media & Entertainment',
      items: [
        'video-streaming',
        'image-carousel',
      ],
    },
    {
      type: 'category',
      label: 'E-commerce & Business',
      items: [
        'ecommerce-marketplace',
        'travel-booking',
      ],
    },
    {
      type: 'category',
      label: 'UI Components',
      items: [
        'modal-dialog',
        'poll-widget',
      ],
    },
  ],
};

export default sidebars;
