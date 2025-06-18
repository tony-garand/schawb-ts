---
slug: /
sidebar_position: 1
---

# schwab-ts: An Unofficial Charles Schwab API Client

<div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
  <a href="https://github.com/tony-garand/schwab-ts" target="_blank" rel="noopener noreferrer">
    <img src="/_static/github-logo.png" alt="GitHub" width="40" />
  </a>
  <a href="https://www.patreon.com/TDAAPI" target="_blank" rel="noopener noreferrer">
    <img src="/_static/patreon.png" alt="Patreon" width="110" />
  </a>
  <a href="https://discord.gg/M3vjtHj" target="_blank" rel="noopener noreferrer">
    <img src="/_static/discord-logo.png" alt="Discord" width="50" />
  </a>
</div>

**schwab-ts** is a modern, TypeScript-first unofficial API client for Charles Schwab's trading platform. Built with full type safety and modern JavaScript features, it provides a clean and intuitive interface for accessing Schwab's trading APIs.

## 🚀 Features

- **Full TypeScript Support** - Complete type safety and IntelliSense
- **Modern Async/Await** - Built with modern JavaScript patterns
- **Real-time Streaming** - WebSocket-based market data streaming
- **Order Management** - Comprehensive order templates and builders
- **Authentication** - OAuth 2.0 flow with automatic token management
- **Error Handling** - Robust error handling and logging
- **Documentation** - Comprehensive documentation and examples

## 📦 Installation

```bash
npm install schwab-ts
```

## 🏃‍♂️ Quick Start

```typescript
import { easyClient } from 'schwab-ts';

// Create a client with automatic authentication
const client = await easyClient({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182',
  tokenPath: './token.json'
});

// Get account information
const accounts = await client.get_accounts();
console.log('Accounts:', accounts);

// Place a market order
import { equityBuyMarket } from 'schwab-ts';

const order = equityBuyMarket('AAPL', 10).build();
const result = await client.placeOrder(accounts[0].hashValue, order);
console.log('Order placed:', result);
```

## 📚 Documentation

- **[Getting Started](./getting-started.md)** - Setup and installation guide
- **[Authentication](./auth.md)** - OAuth flow and token management
- **[Client Usage](./client.md)** - API usage examples
- **[Streaming Data](./streaming.md)** - Real-time market data
- **[Order Templates](./order-templates.md)** - Pre-built order templates
- **[Order Builder](./order-builder.md)** - Custom order creation
- **[Utilities](./util.md)** - Helper functions and utilities

## 🔄 Migration from tda-api

If you're coming from the old TDAmeritrade API, check out our **[Migration Guide](./tda-transition.md)** for a smooth transition to schwab-ts.

## 🤝 Community

- **[Discord Server](https://discord.gg/M3vjtHj)** - Join our community for help and discussion
- **[GitHub Issues](https://github.com/tony-garand/schwab-ts/issues)** - Report bugs and request features
- **[GitHub Discussions](https://github.com/tony-garand/schwab-ts/discussions)** - Ask questions and share ideas

## 📋 Requirements

- **Node.js** 18.0 or higher
- **TypeScript** (recommended) or JavaScript
- **Schwab Developer Account** - [Apply here](https://beta-developer.schwab.com/)

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/tony-garand/schwab-ts.git
cd schwab-ts

# Install dependencies
npm install

# Run tests
npm test

# Start documentation
cd docs-docusaurus
npm run start
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/tony-garand/schwab-ts/blob/main/LICENSE) file for details.

## ⚠️ Disclaimer

**schwab-ts is an unofficial API wrapper. It is in no way endorsed by or affiliated with Charles Schwab or any associated organization. Make sure to read and understand the terms of service of the underlying API before using this package. The authors accept no responsibility for any damage that might stem from use of this package. See the LICENSE file for more details.**

## 🎯 What's New

### Latest Version Features

- **TypeScript First** - Built from the ground up with TypeScript
- **Modern Architecture** - Uses latest Node.js and JavaScript features
- **Improved Error Handling** - Better error messages and debugging
- **Enhanced Documentation** - Comprehensive guides and examples
- **Community Support** - Active Discord community and GitHub discussions

### Coming Soon

- **Advanced Order Types** - More sophisticated order templates
- **Backtesting Support** - Historical data and strategy testing
- **Web Dashboard** - Browser-based trading interface
- **Mobile Support** - React Native compatibility

## 🚀 Getting Help

- **[Help Guide](./help.md)** - Troubleshooting and common issues
- **[Contributing](./contributing.md)** - How to contribute to the project
- **[Discord Community](https://discord.gg/M3vjtHj)** - Real-time support

---

<div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
  <h3>Ready to get started?</h3>
  <p>Check out our <a href="./getting-started">Getting Started guide</a> to set up your first trading bot!</p>
</div>
