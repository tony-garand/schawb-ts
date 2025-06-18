# schwab-ts Documentation

This directory contains the documentation for **schwab-ts**, an unofficial Charles Schwab API client written in TypeScript.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build

# Serve built files
npm run serve
```

## 📁 Structure

```
docs-docusaurus/
├── docs/                    # Documentation markdown files
│   ├── intro.md            # Homepage
│   ├── getting-started.md  # Setup guide
│   ├── auth.md             # Authentication
│   ├── client.md           # Client usage
│   ├── streaming.md        # Streaming data
│   ├── order-templates.md  # Order templates
│   ├── order-builder.md    # Order builder
│   ├── util.md             # Utilities
│   ├── tda-transition.md   # Migration guide
│   ├── help.md             # Help and troubleshooting
│   └── contributing.md     # Contributing guide
├── static/                 # Static assets
│   └── _static/            # Images and files
├── src/                    # Custom React components
├── docusaurus.config.ts    # Docusaurus configuration
├── sidebars.js             # Documentation navigation
└── package.json            # Dependencies and scripts
```

## 🛠️ Development

### Adding New Documentation

1. Create a new `.md` file in the `docs/` directory
2. Add frontmatter with metadata:

```markdown
---
sidebar_position: 5
---

# Your Page Title

Content goes here...
```

3. Update `sidebars.js` to include the new page in navigation

### Styling and Components

- Use standard Markdown syntax
- For custom React components, add them to `src/components/`
- For custom CSS, modify `src/css/custom.css`

### Images and Assets

- Place images in `static/_static/`
- Reference them in markdown: `![Alt text](/_static/image.png)`

## 📚 Documentation Guidelines

### Writing Style

- Use clear, concise language
- Include code examples for all features
- Add TypeScript type annotations in examples
- Use proper heading hierarchy (H1 → H2 → H3)

### Code Examples

```typescript
// Always include imports
import { easyClient } from 'schwab-ts';

// Use realistic examples
const client = await easyClient({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182',
  tokenPath: './token.json'
});

// Show error handling
try {
  const accounts = await client.get_accounts();
  console.log('Accounts:', accounts);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Links and Navigation

- Use relative links for internal pages: `./getting-started.md`
- Use absolute URLs for external links
- Update sidebar navigation when adding new pages

## 🔧 Configuration

### Docusaurus Config

The main configuration is in `docusaurus.config.ts`:

- Site metadata (title, description, etc.)
- Theme customization
- Plugin configuration
- Deployment settings

### Sidebar Navigation

Edit `sidebars.js` to organize documentation:

```javascript
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['getting-started', 'tda-transition'],
    },
    // ... more categories
  ],
};
```

## 🚀 Deployment

### Local Development

```bash
npm run start
```

This starts a development server at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates a static build in the `build/` directory

### Deploy to GitHub Pages

```bash
npm run deploy
```

This deploys to GitHub Pages (requires proper configuration)

## 📝 Migration from RST

This documentation was migrated from reStructuredText (RST) format. Key changes:

- **Format**: RST → Markdown
- **Platform**: Sphinx → Docusaurus
- **Examples**: Python → TypeScript
- **Navigation**: Manual TOC → Automatic sidebar
- **Styling**: Custom CSS → Docusaurus theme

### Migration Checklist

- [x] Convert all RST files to Markdown
- [x] Update code examples to TypeScript
- [x] Modernize content and examples
- [x] Set up Docusaurus configuration
- [x] Create responsive navigation
- [x] Add search functionality
- [x] Optimize for mobile devices

## 🤝 Contributing

When contributing to documentation:

1. Follow the existing style and format
2. Test your changes locally
3. Update the sidebar if adding new pages
4. Include code examples
5. Add proper TypeScript types

See [Contributing Guide](../docs/contributing.md) for more details.

## 📞 Support

- **Discord**: [Join our community](https://discord.gg/M3vjtHj)
- **GitHub Issues**: [Report documentation issues](https://github.com/tony-garand/schwab-ts/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/tony-garand/schwab-ts/discussions)

## 📄 License

This documentation is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
