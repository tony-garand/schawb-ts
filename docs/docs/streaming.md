---
sidebar_position: 5
---

# Streaming

**schwab-ts** provides real-time streaming capabilities for market data through Schwab's WebSocket API. This allows you to receive live updates for quotes, trades, and other market information.

## Overview

The streaming client uses WebSocket connections to receive real-time data. It's built on Node.js's EventEmitter pattern, making it easy to handle different types of market data events.

## Quick Start

```typescript
import { StreamClient, clientFromTokenFile } from 'schwab-ts';

async function startStreaming() {
  // Create the main client
  const client = await clientFromTokenFile(
    './token.json',
    'YOUR_API_KEY',
    'YOUR_CLIENT_SECRET'
  );

  // Create streaming client
  const streamClient = new StreamClient(client);

  // Set up event handlers
  streamClient.level_one_equity_handler((data) => {
    console.log('Equity data:', data);
  });

  // Connect and subscribe
  await streamClient.login();
  await streamClient.level_one_equity_subs(['AAPL', 'GOOGL'], ['0', '1', '2']);
}
```

## Available Services

### Level One Equity

Real-time quotes for stocks and ETFs:

```typescript
// Subscribe to equity data
await streamClient.level_one_equity_subs(['AAPL', 'GOOGL'], ['0', '1', '2']);

// Handle incoming data
streamClient.level_one_equity_handler((data) => {
  console.log('Equity update:', data);
});
```

### Level One Options

Real-time quotes for options:

```typescript
await streamClient.level_one_options_subs(['AAPL_240315C150'], ['0', '1', '2']);
streamClient.level_one_options_handler((data) => {
  console.log('Options update:', data);
});
```

### Account Activity

Real-time account updates:

```typescript
await streamClient.account_activity_subs(['YOUR_ACCOUNT_ID']);
streamClient.account_activity_handler((data) => {
  console.log('Account activity:', data);
});
```

## Data Fields

The streaming API uses numeric field codes. Here are some common ones:

| Field | Description |
|-------|-------------|
| 0 | Symbol |
| 1 | Bid Price |
| 2 | Ask Price |
| 3 | Last Price |
| 4 | Bid Size |
| 5 | Ask Size |
| 6 | Ask ID |
| 7 | Bid ID |
| 8 | Total Volume |
| 9 | Last Size |
| 10 | Trade Time |
| 11 | Quote Time |
| 12 | High Price |
| 13 | Low Price |
| 14 | Bid Tick |
| 15 | Close Price |

## Event Handling

The StreamClient extends Node.js EventEmitter, so you can listen for various events:

```typescript
// Handle errors
streamClient.on('error', (error) => {
  console.error('Stream error:', error);
});

// Handle unhandled messages
streamClient.on('unhandled_message', (message) => {
  console.log('Unhandled message:', message);
});

// Handle heartbeat messages
streamClient.on('heartbeat', (heartbeat) => {
  console.log('Heartbeat received:', heartbeat);
});
```

## Complete Example

Here's a complete example that streams level one equity data:

```typescript
import { StreamClient, clientFromTokenFile } from 'schwab-ts';

class MarketDataStreamer {
  private streamClient: StreamClient;
  private symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
  private fields = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

  constructor(private client: any) {
    this.streamClient = new StreamClient(client);
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle equity data
    this.streamClient.level_one_equity_handler((data) => {
      console.log('Equity Update:', {
        symbol: data.content[0].key,
        bid: data.content[0].fields[1],
        ask: data.content[0].fields[2],
        last: data.content[0].fields[3],
        volume: data.content[0].fields[8]
      });
    });

    // Handle errors
    this.streamClient.on('error', (error) => {
      console.error('Stream error:', error);
    });

    // Handle heartbeats
    this.streamClient.on('heartbeat', () => {
      console.log('Heartbeat received');
    });
  }

  async start() {
    try {
      await this.streamClient.login();
      await this.streamClient.level_one_equity_subs(this.symbols, this.fields);
      console.log('Streaming started for:', this.symbols);
    } catch (error) {
      console.error('Failed to start streaming:', error);
    }
  }

  async stop() {
    await this.streamClient.level_one_equity_unsubs(this.symbols);
  }
}

// Usage
async function main() {
  const client = await clientFromTokenFile(
    './token.json',
    'YOUR_API_KEY',
    'YOUR_CLIENT_SECRET'
  );

  const streamer = new MarketDataStreamer(client);
  await streamer.start();

  // Keep the process running
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await streamer.stop();
    process.exit(0);
  });
}

main().catch(console.error);
```

## Best Practices

### 1. Error Handling

Always handle errors and connection issues:

```typescript
streamClient.on('error', (error) => {
  console.error('Stream error:', error);
  // Implement reconnection logic
});
```

### 2. Rate Limiting

Be mindful of Schwab's rate limits:

- Don't subscribe to too many symbols at once
- Implement proper error handling for rate limit errors
- Consider using quality of service settings

### 3. Connection Management

```typescript
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down streams...');
  await streamClient.level_one_equity_unsubs(symbols);
  process.exit(0);
});
```

### 4. Data Processing

Process data efficiently to avoid blocking the event loop:

```typescript
streamClient.level_one_equity_handler((data) => {
  // Use setImmediate for heavy processing
  setImmediate(() => {
    processMarketData(data);
  });
});
```

## Troubleshooting

### Common Issues

1. **Connection failures**: Check your authentication token and API credentials
2. **No data received**: Verify you're subscribed to the correct symbols and fields
3. **High memory usage**: Implement proper data processing and cleanup
4. **Rate limiting**: Reduce the number of symbols or implement backoff logic

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// The StreamClient uses console.debug by default
// You can override the logger if needed
```

## Next Steps

- **[Client Documentation](./client.md)** - Learn about the main client functionality
- **[Order Management](./order-builder.md)** - Place and manage trades
- **[Examples](../examples/streaming/level_one_equity.ts)** - See complete working examples 