---
sidebar_position: 7
---

# Order Builder

The **Order Builder** is the most flexible way to create orders in **schwab-ts**. While [Order Templates](./order-templates.md) provide convenient shortcuts for common orders, the Order Builder gives you complete control over every aspect of your orders.

## Overview

The Order Builder uses a fluent interface that allows you to chain method calls to build complex orders:

```typescript
import { OrderBuilder } from 'schwab-ts';

const order = new OrderBuilder()
  .setOrderType(OrderType.LIMIT)
  .setSession(Session.NORMAL)
  .setDuration(Duration.DAY)
  .setOrderStrategyType(OrderStrategyType.SINGLE)
  .addLeg({
    instruction: 'BUY',
    quantity: 10,
    instrument: {
      symbol: 'AAPL',
      assetType: 'EQUITY'
    }
  })
  .build();
```

## Basic Order Structure

Every order consists of:

1. **Order Type**: Market, Limit, Stop, etc.
2. **Session**: When the order should execute
3. **Duration**: How long the order should remain active
4. **Strategy**: Single order or complex strategy
5. **Legs**: The actual trades to execute

## Order Types

### Market Orders

```typescript
import { OrderBuilder, OrderType } from 'schwab-ts';

const marketOrder = new OrderBuilder()
  .setOrderType(OrderType.MARKET)
  .addLeg({
    instruction: 'BUY',
    quantity: 10,
    instrument: {
      symbol: 'AAPL',
      assetType: 'EQUITY'
    }
  })
  .build();
```

### Limit Orders

```typescript
import { OrderBuilder, OrderType } from 'schwab-ts';

const limitOrder = new OrderBuilder()
  .setOrderType(OrderType.LIMIT)
  .setPrice(150.0)
  .addLeg({
    instruction: 'BUY',
    quantity: 10,
    instrument: {
      symbol: 'AAPL',
      assetType: 'EQUITY'
    }
  })
  .build();
```

## Complete Example

```typescript
import { OrderBuilder, OrderType, Session, Duration } from 'schwab-ts';

const order = new OrderBuilder()
  .setOrderType(OrderType.LIMIT)
  .setSession(Session.NORMAL)
  .setDuration(Duration.DAY)
  .setOrderStrategyType(OrderStrategyType.SINGLE)
  .setPrice(150.0)
  .addLeg({
    instruction: 'BUY',
    quantity: 10,
    instrument: {
      symbol: 'AAPL',
      assetType: 'EQUITY'
    }
  })
  .build();

await client.placeOrder(accountHash, order);
```

## Next Steps

- **[Order Templates](./order-templates.md)** - Use pre-built order templates
- **[Client Usage](./client.md)** - Learn more about the client API
- **[Streaming Data](./streaming.md)** - Monitor orders in real-time 