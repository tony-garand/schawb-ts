# `schwab-ts`: A Charles Schwab API Wrapper for TypeScript/Node.js
[![npm version](https://badge.fury.io/js/schwab-ts.svg)](https://badge.fury.io/js/schwab-ts)
[![Build Status](https://github.com/tony-garand/schwab-ts/workflows/tests/badge.svg)](https://github.com/yourusername/schwab-ts/actions?query=workflow%3Atests)
[![Coverage](https://codecov.io/gh/tony-garand/schwab-ts/branch/main/graph/badge.svg)](https://codecov.io/gh/tony-garand/schwab-ts)

## What is `schwab-ts`?

`schwab-ts` is an unofficial TypeScript/Node.js wrapper around the Charles Schwab Consumer APIs. It provides a type-safe and modern interface to interact with Schwab's trading platform. Notable functionality includes:

* Login and authentication
* Quotes, fundamentals, and historical pricing data
* Options chains
* Streaming quotes and order book depth data
* Trades and trade management
* Account info

## Installation

```bash
npm install schwab-ts
# or
yarn add schwab-ts
```

## Quick Start

Before you begin, you'll need to:
1. Create an account on the [Charles Schwab developer site](https://developer.schwab.com/login)
2. Create an application to receive your API key and app secret
3. Note your callback URI for the OAuth flow
4. Wait for Schwab to approve your application (this can take several days)

Here's a quick example of how to use the library:

```typescript
import { SchwabClient } from 'schwab-ts';

const client = new SchwabClient({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182/',
  tokenPath: '/path/to/token.json'
});

// Get historical price data for Apple
const priceHistory = await client.getPriceHistory({
  symbol: 'AAPL',
  periodType: 'day',
  period: 1,
  frequencyType: 'daily',
  frequency: 1
});

console.log(priceHistory);
```

## Features

1. **Type Safety**: Full TypeScript support with comprehensive type definitions
2. **Modern Async/Await**: Built with modern JavaScript/TypeScript features
3. **Safe Authentication**: Handles OAuth token management and refresh flows
4. **Minimal API Wrapping**: Direct access to Schwab's API with minimal abstraction
5. **Streaming Support**: Real-time data streaming capabilities

## Limitations

While Schwab's API is powerful, there are some limitations to be aware of:

* This API is unaffiliated with thinkorswim (TOS). While you can access the same accounts, some TOS features are not available
* Paper trading is not supported
* Historical options pricing data is not available

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## Support

Join our [Discord server](https://discord.gg/BEr6y6Xqyv) for help and discussion.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

*schwab-ts is an unofficial API wrapper. It is in no way endorsed by or affiliated with Charles Schwab or any associated organization. Make sure to read and understand the terms of service of the underlying API before using this package. The authors accept no responsibility for any damage that might stem from use of this package.*
