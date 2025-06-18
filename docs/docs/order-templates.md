---
sidebar_position: 6
---

# Order Templates

**schwab-ts** strives to be easy to use while still allowing for complex functionality. Order construction is a major challenge to this mission: both simple and complicated orders use the same format, meaning simple orders require a surprising amount of sophistication to place.

We solve this by providing templates that make it easy to place common orders, while allowing advanced users to modify the orders returned from the templates to create more complex ones. Very advanced users can even create their own orders from scratch.

## Using These Templates

These templates serve two purposes:

1. **Immediate Use**: They are designed with sensible defaults so you can immediately place them
2. **Starting Points**: They serve as starting points for building more complex order types

### Default Behavior

All templates use these defaults:

- **Execution**: During the current normal trading session (or next session if outside trading hours)
- **Time-in-Force**: `DAY`
- **Other Fields**: Left unset to receive default treatment from Schwab

### Template Modification

All templates return a pre-populated `OrderBuilder` object, meaning you can modify them for complex functionality:

```typescript
import { equityBuyLimit } from 'schwab-ts';
import { Duration, Session } from 'schwab-ts';

// Place an order to buy GOOG for no more than $1250 at any time in the next 6 months
const order = equityBuyLimit('GOOG', 1, 1250.0)
  .setDuration(Duration.GOOD_TILL_CANCEL)
  .setSession(Session.SEAMLESS)
  .build();

await client.placeOrder(accountHash, order);
```

## Equity Templates

### Buy Orders

#### Market Buy

```typescript
import { equityBuyMarket } from 'schwab-ts';

// Buy 10 shares of AAPL at market price
const order = equityBuyMarket('AAPL', 10).build();
await client.placeOrder(accountHash, order);
```

#### Limit Buy

```typescript
import { equityBuyLimit } from 'schwab-ts';

// Buy 10 shares of AAPL at $150 or better
const order = equityBuyLimit('AAPL', 10, 150.0).build();
await client.placeOrder(accountHash, order);
```

### Sell Orders

#### Market Sell

```typescript
import { equitySellMarket } from 'schwab-ts';

// Sell 10 shares of AAPL at market price
const order = equitySellMarket('AAPL', 10).build();
await client.placeOrder(accountHash, order);
```

#### Limit Sell

```typescript
import { equitySellLimit } from 'schwab-ts';

// Sell 10 shares of AAPL at $160 or better
const order = equitySellLimit('AAPL', 10, 160.0).build();
await client.placeOrder(accountHash, order);
```

### Sell Short Orders

#### Market Sell Short

```typescript
import { equitySellShortMarket } from 'schwab-ts';

// Sell short 10 shares of AAPL at market price
const order = equitySellShortMarket('AAPL', 10).build();
await client.placeOrder(accountHash, order);
```

#### Limit Sell Short

```typescript
import { equitySellShortLimit } from 'schwab-ts';

// Sell short 10 shares of AAPL at $160 or better
const order = equitySellShortLimit('AAPL', 10, 160.0).build();
await client.placeOrder(accountHash, order);
```

### Buy to Cover Orders

#### Market Buy to Cover

```typescript
import { equityBuyToCoverMarket } from 'schwab-ts';

// Buy to cover 10 shares of AAPL at market price
const order = equityBuyToCoverMarket('AAPL', 10).build();
await client.placeOrder(accountHash, order);
```

#### Limit Buy to Cover

```typescript
import { equityBuyToCoverLimit } from 'schwab-ts';

// Buy to cover 10 shares of AAPL at $150 or better
const order = equityBuyToCoverLimit('AAPL', 10, 150.0).build();
await client.placeOrder(accountHash, order);
```

## Options Templates

Schwab supports over a dozen options strategies, each involving a precise structure. **schwab-ts** is gradually adding support for these strategies. In the meantime, you can construct all supported options orders using the [Order Builder](./order-builder.md).

> **Note**: Orders placed using these templates may be rejected depending on the user's options trading authorization.

### Building Options Symbols

Options symbols are more complex than equity symbols. They encode the underlying, expiration date, option type (put or call), and strike price.

#### Using OptionSymbol Helper

```typescript
import { OptionSymbol } from 'schwab-ts';

const symbol = new OptionSymbol({
  underlying: 'TSLA',
  expirationDate: new Date('2024-11-20'),
  optionType: 'P', // Put
  strikePrice: 1360
}).build();

console.log(symbol); // TSLA_112024P1360
```

#### OptionSymbol Constructor

```typescript
interface OptionSymbolConfig {
  underlying: string;        // Stock symbol (e.g., 'TSLA')
  expirationDate: Date;      // Expiration date
  optionType: 'P' | 'C';     // 'P' for Put, 'C' for Call
  strikePrice: number;       // Strike price
}
```

### Single Options

#### Buy to Open

```typescript
import { optionBuyToOpenMarket, optionBuyToOpenLimit } from 'schwab-ts';

// Market buy to open
const marketOrder = optionBuyToOpenMarket('TSLA_112024C1500', 1).build();

// Limit buy to open
const limitOrder = optionBuyToOpenLimit('TSLA_112024C1500', 1, 5.50).build();
```

#### Sell to Open

```typescript
import { optionSellToOpenMarket, optionSellToOpenLimit } from 'schwab-ts';

// Market sell to open
const marketOrder = optionSellToOpenMarket('TSLA_112024P1400', 1).build();

// Limit sell to open
const limitOrder = optionSellToOpenLimit('TSLA_112024P1400', 1, 3.25).build();
```

#### Buy to Close

```typescript
import { optionBuyToCloseMarket, optionBuyToCloseLimit } from 'schwab-ts';

// Market buy to close
const marketOrder = optionBuyToCloseMarket('TSLA_112024C1500', 1).build();

// Limit buy to close
const limitOrder = optionBuyToCloseLimit('TSLA_112024C1500', 1, 2.75).build();
```

#### Sell to Close

```typescript
import { optionSellToCloseMarket, optionSellToCloseLimit } from 'schwab-ts';

// Market sell to close
const marketOrder = optionSellToCloseMarket('TSLA_112024P1400', 1).build();

// Limit sell to close
const limitOrder = optionSellToCloseLimit('TSLA_112024P1400', 1, 1.50).build();
```

### Vertical Spreads

Vertical spreads are complex option strategies that provide both limited upside and limited downside. They are constructed by buying an option at one strike while simultaneously selling another option with the same underlying and expiration date but a different strike.

#### Call Verticals

```typescript
import { 
  bullCallVerticalOpen, 
  bullCallVerticalClose,
  bearCallVerticalOpen,
  bearCallVerticalClose 
} from 'schwab-ts';

// Bull call vertical spread (bullish strategy)
const bullCallOrder = bullCallVerticalOpen(
  'TSLA_112024C1500', // Lower strike (buy)
  'TSLA_112024C1600', // Higher strike (sell)
  1
).build();

// Bear call vertical spread (bearish strategy)
const bearCallOrder = bearCallVerticalOpen(
  'TSLA_112024C1500', // Lower strike (sell)
  'TSLA_112024C1600', // Higher strike (buy)
  1
).build();
```

#### Put Verticals

```typescript
import { 
  bullPutVerticalOpen, 
  bullPutVerticalClose,
  bearPutVerticalOpen,
  bearPutVerticalClose 
} from 'schwab-ts';

// Bull put vertical spread (bullish strategy)
const bullPutOrder = bullPutVerticalOpen(
  'TSLA_112024P1400', // Lower strike (sell)
  'TSLA_112024P1500', // Higher strike (buy)
  1
).build();

// Bear put vertical spread (bearish strategy)
const bearPutOrder = bearPutVerticalOpen(
  'TSLA_112024P1400', // Lower strike (buy)
  'TSLA_112024P1500', // Higher strike (sell)
  1
).build();
```

## Complete Example

Here's a complete example showing how to use order templates:

```typescript
import { easyClient, equityBuyLimit, equitySellLimit } from 'schwab-ts';

async function placeOrders() {
  // Create client
  const client = await easyClient({
    apiKey: 'YOUR_API_KEY',
    appSecret: 'YOUR_APP_SECRET',
    callbackUrl: 'https://127.0.0.1:8182',
    tokenPath: './token.json'
  });

  // Get account hash
  const accountInfo = await client.get_account_numbers();
  const accountHash = accountInfo[0].hashValue;

  // Place a limit buy order
  const buyOrder = equityBuyLimit('AAPL', 10, 150.0).build();
  const buyResponse = await client.placeOrder(accountHash, buyOrder);
  console.log('Buy order placed:', buyResponse);

  // Place a limit sell order
  const sellOrder = equitySellLimit('GOOGL', 5, 2800.0).build();
  const sellResponse = await client.placeOrder(accountHash, sellOrder);
  console.log('Sell order placed:', sellResponse);
}

placeOrders().catch(console.error);
```

## Best Practices

### 1. Always Check Order Status

```typescript
const order = await client.placeOrder(accountHash, buyOrder);
console.log('Order status:', order.status);

// Check for rejections
if (order.status === 'REJECTED') {
  console.error('Order rejected:', order.rejectionReason);
}
```

### 2. Use Limit Orders for Better Control

```typescript
// Better: Use limit orders to control price
const limitOrder = equityBuyLimit('AAPL', 10, 150.0).build();

// Riskier: Market orders can execute at unexpected prices
const marketOrder = equityBuyMarket('AAPL', 10).build();
```

### 3. Handle Options Carefully

```typescript
// Always verify options symbols before placing orders
const optionChain = await client.get_option_chain('TSLA');
const validSymbols = optionChain.callExpDateMap['2024-11-20:1'].map(
  strike => strike[0].symbol
);

// Only place orders with valid symbols
if (validSymbols.includes('TSLA_112024C1500')) {
  const order = optionBuyToOpenMarket('TSLA_112024C1500', 1).build();
  await client.placeOrder(accountHash, order);
}
```

## Next Steps

- **[Order Builder](./order-builder.md)** - Create complex custom orders
- **[Client Usage](./client.md)** - Learn more about the client API
- **[Streaming Data](./streaming.md)** - Monitor orders in real-time 