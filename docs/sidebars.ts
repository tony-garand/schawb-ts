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
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'auth',
      label: 'Authentication',
    },
    {
      type: 'doc',
      id: 'client',
      label: 'Client',
    },
    {
      type: 'doc',
      id: 'streaming',
      label: 'Streaming',
    },
    {
      type: 'doc',
      id: 'order-templates',
      label: 'Order Templates',
    },
    {
      type: 'doc',
      id: 'order-builder',
      label: 'Order Builder',
    },
    {
      type: 'doc',
      id: 'util',
      label: 'Utilities',
    },
  ],
};

export default sidebars;
