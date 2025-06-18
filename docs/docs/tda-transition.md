---
sidebar_position: 1
---

# Transitioning from TDAmeritrade and tda-api

> **Note**: If you are reading this and you are not a former tda-api user, please see [Getting Started](./getting-started.md).

As of May 13th, 2024, the underlying API that powered `tda-api` is no longer working. All former `tda-api` users must now transition to **schwab-ts**. Fortunately, this library was heavily modeled on `tda-api`, and so most users will find it a relatively smooth transition. However, there are some important differences. This page will explain them and provide guidance for adjusting.

## You Must Create a New App

TDAmeritrade developer apps created for use with `tda-api` are not valid for use with **schwab-ts**. In order to use the new library, you must create a new app by following the instructions outlined in [Getting Started](./getting-started.md). Note a few important differences:

### Application Approval Process

**Application approval is no longer instant.** New apps must be approved by Schwab, and from the outside this process appears to be manual. Once you create your app, you can expect to linger in the "Approved - Pending" state for multiple days. Until your app status changes to "Ready For Use," you cannot do anything. If you encounter any issues, please check this first **before** you ask for help on our Discord server.

### Callback URL Changes

**localhost cannot be used as a callback URL.** You can still use your local machine, but you must enter `127.0.0.1` instead.

### Token Invalidation

**Old tokens are invalid.** Once you create your first app, you cannot re-use your old tokens that worked under `tda-api`. You must delete that one and create a new one.

## Token Lifetimes Are Much Shorter

When you create a token using `tda-api`, you had up to ninety days before it would expire and require replacing. What's more, `tda-api` implemented a mechanism by which tokens could be refreshed beyond ninety days, meaning for most users tokens were effectively eternal.

This is no longer the case. Schwab's documentation indicates that tokens are valid for only **seven days**, after which they must be deleted and regenerated using the login flow described above. There appears to be no equivalent mechanism to the one that allowed for indefinite token use.

### Best Practice for Token Management

If your code works during trading hours, we recommend making a habit of pre-emptively cycling your token on Sunday before the market opens so that you aren't surprised by an invalid token on Monday morning.

> **Important**: This is a constraint imposed and enforced by Schwab. **The library authors have no control over this.** Please do not pollute our Discord server with requests to extend token lifecycles.

## Some Endpoints Are Gone Forever

While most endpoints have been carried over from the old API, some endpoints were not. In particular, **saved orders and watchlists are not provided by Schwab**. If you did not export your saved orders and watchlists from TDAmeritrade before May 10th, we're sorry, but we're pretty sure your data is gone. You're welcome to contact Schwab to confirm this.

> **Important**: This is not a choice by the library authors. Please do not go to our Discord server asking to recover your data or add this functionality.

## Options Symbols Are Formatted Differently

Options symbols on Schwab use a different format than they did on TDAmeritrade. Code that manipulates them may need to be updated. **schwab-ts** provides a [helper class](./order-templates.md#building-options-symbols) to make parsing and generating options symbols easier.

### Example: Options Symbol Changes

```typescript
// Old TDAmeritrade format
// AAPL_240315C150

// New Schwab format  
// AAPL_112024C150

import { OptionSymbol } from 'schwab-ts';

const symbol = new OptionSymbol({
  underlying: 'AAPL',
  expirationDate: new Date('2024-11-20'),
  optionType: 'C',
  strikePrice: 150
}).build();
```

## Equity Index Symbols Are Different

TDAmeritrade used equity index symbols that ended in `.X`. For instance, the symbol for the S&P 500 index used to be `$SPX.X`. Now, these indices are referred to without that suffix, so S&P 500 is just `$SPX`.

### Common Index Symbol Changes

| Old TDAmeritrade | New Schwab |
|------------------|------------|
| `$SPX.X` | `$SPX` |
| `$VIX.X` | `$VIX` |
| `$RUT.X` | `$RUT` |

## schwab-ts Only Supports Node.js 18+

**schwab-ts** depends heavily on modern JavaScript/TypeScript features and async/await syntax. The Node.js ecosystem has been migrating from older, less elegant implementations of these concepts for years. At the time of `tda-api`'s writing (early 2020), support for these features was still evolving, and so the library was written with many concessions to the older style in mind.

Fast forward to 2024, and the Node.js ecosystem has pretty much fully transitioned to the modern async/await style. Since **schwab-ts** is a brand-new library with no legacy users, the authors decided to shed all the old code and write it only in modern style and libraries. This broke support for versions of Node.js older than 18.

### Version Requirements

If you attempt to `npm install schwab-ts` on a Node.js installation older than 18, you will be greeted with something to the effect of `Could not find a version that satisfies the requirement schwab-ts`. You must install a newer version of Node.js before you can use **schwab-ts**. We recommend using `nvm` to manage your Node.js installations.

### TypeScript Support

**schwab-ts** is written in TypeScript and provides full type safety. This is a significant improvement over the Python version, offering better IntelliSense, compile-time error checking, and improved developer experience.

## Code Migration Examples

### Authentication

**Old tda-api (Python):**
```python
from tda import auth
import tda

client = auth.client_from_token_file('token.json', 'API_KEY')
```

**New schwab-ts (TypeScript):**
```typescript
import { clientFromTokenFile } from 'schwab-ts';

const client = await clientFromTokenFile(
  './token.json',
  'API_KEY',
  'APP_SECRET'
);
```

### Getting Account Information

**Old tda-api (Python):**
```python
accounts = client.get_accounts().json()
```

**New schwab-ts (TypeScript):**
```typescript
const accounts = await client.get_accounts();
```

### Placing Orders

**Old tda-api (Python):**
```python
from tda.orders import equity_buy_market

order = equity_buy_market('AAPL', 10)
client.place_order(account_id, order)
```

**New schwab-ts (TypeScript):**
```typescript
import { equityBuyMarket } from 'schwab-ts';

const order = equityBuyMarket('AAPL', 10).build();
await client.placeOrder(accountHash, order);
```

### Streaming Data

**Old tda-api (Python):**
```python
import tda.streaming

stream_client = tda.streaming.StreamClient(client, account_id=account_id)
stream_client.level_one_equity_subs(['AAPL'])
```

**New schwab-ts (TypeScript):**
```typescript
import { StreamClient } from 'schwab-ts';

const streamClient = new StreamClient(client, { accountId });
await streamClient.login();
await streamClient.level_one_equity_subs(['AAPL'], ['0', '1', '2']);
```

## Getting Help

If you encounter issues during the transition:

1. **Check the documentation** - Most common issues are covered here
2. **Join our Discord** - [Community server](https://discord.gg/M3vjtHj)
3. **GitHub Issues** - Report bugs or request features
4. **Search existing issues** - Your problem might already be solved

## Next Steps

- **[Getting Started](./getting-started.md)** - Set up your new Schwab API access
- **[Authentication](./auth.md)** - Learn the new authentication flow
- **[Client Usage](./client.md)** - Explore the updated API
- **[Streaming Data](./streaming.md)** - Set up real-time market data 