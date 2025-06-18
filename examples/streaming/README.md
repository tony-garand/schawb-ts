# Streaming Examples

This directory contains examples of how to use the Schwab API streaming functionality.

## Files

- `level_one_equity.ts` - TypeScript example for streaming level one equity data

## Prerequisites

Before running these examples, you need to:

1. Set up your Schwab API credentials
2. Generate an authentication token
3. Update the configuration variables in the example files

### Setting up API Credentials

1. Go to the Schwab Developer Portal
2. Create a new application
3. Note your API Key and Client Secret
4. Set up your callback URL

### Generating an Authentication Token

You'll need to generate a token file before running the streaming examples. You can do this using the authentication utilities in the main library.

## Installation

### For TypeScript Example

```bash
npm install schwab-ts
npm install -D typescript ts-node @types/node
```

## Configuration

Update the following variables in both example files:

```typescript
const API_KEY = "YOUR_API_KEY";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const CALLBACK_URL = "YOUR_CALLBACK_URL";
```

## Running the Examples

### Python Example

```bash
cd examples/streaming
python level_one_equity.py
```

### TypeScript Example

```bash
cd examples/streaming
npx ts-node level_one_equity.ts
```

## Module Usage

The TypeScript example demonstrates how to import and use the library as a published npm module:

```typescript
import { StreamClient, clientFromTokenFile } from 'schwab-ts';
```

This is the same way you would use it in your own projects after installing the package.

## How It Works

Both examples demonstrate:

1. **Authentication**: Loading credentials from a token file
2. **Account Setup**: Getting account information from the API
3. **Streaming Client**: Creating and configuring a streaming client
4. **Data Subscription**: Subscribing to level one equity data for multiple symbols
5. **Message Handling**: Processing incoming streaming messages
6. **Event Management**: Handling errors, heartbeats, and unhandled messages

### TypeScript 
- Uses EventEmitter pattern for message handling
- Processes messages directly in event handlers
- Uses Node.js process management for keeping the application alive

## Symbol List

Both examples subscribe to the same set of symbols:
- Technology: GOOG, GOOGL, ADBE, CRM, SNAP, AMZN, BABA, DIS, TWTR, AAPL, NFLX, TSLA, FB, BIDU, ROKU
- Energy: BP, USO, X
- Healthcare: CVS
- Retail: M
- Automotive: F, FDX
- Transportation: UBER
- ETFs: SPY
- Other: GE, FIT

## Fields

The TypeScript example subscribes to fields 0-15, which typically include:
- Bid/Ask prices and sizes
- Last trade price and size
- Volume information
- High/Low prices
- Open price
- And more

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Make sure your token file is valid and not expired
2. **Connection Issues**: Check your internet connection and API endpoint availability
3. **Rate Limiting**: The API may have rate limits on streaming connections

### Debugging

Both examples include error handling and logging. Check the console output for:
- Authentication status
- Connection establishment
- Message processing
- Error messages

## Next Steps

Once you have the basic streaming working, you can:

1. Add more sophisticated message processing
2. Implement data storage or analysis
3. Add more streaming services (options, futures, etc.)
4. Build a real-time trading application 