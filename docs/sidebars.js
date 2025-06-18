/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started',
        'tda-transition',
      ],
    },
    {
      type: 'category',
      label: 'Core Features',
      items: [
        'auth',
        'client',
        'streaming',
      ],
    },
    {
      type: 'category',
      label: 'Trading',
      items: [
        'order-templates',
        'order-builder',
      ],
    },
    {
      type: 'category',
      label: 'Utilities',
      items: [
        'util',
      ],
    },
    {
      type: 'category',
      label: 'Support',
      items: [
        'help',
        'contributing',
      ],
    },
  ],
};

module.exports = sidebars; 