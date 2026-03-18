# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

schwab-ts is a TypeScript client library for the Schwab Trading API. It provides OAuth 2.0 authentication, market data access, order management, and account operations. The library uses Node.js built-in modules (fetch, http, url, Buffer) for core HTTP operations with minimal external dependencies (ws, node-cron, open).

**Target Environment:** Node.js 18+
**Build Output:** CommonJS modules in `dist/`

## Development Commands

```bash
# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Run a single test file
npx jest tests/marketData.test.ts

# Clean build artifacts
npm run clean

# Run examples (after building or use ts-node)
npx ts-node examples/basic-usage.ts
npx ts-node examples/oauth-server.ts
npx ts-node examples/market-data-example.ts
```

## Architecture

### Core Client Pattern

The library uses a **facade pattern** with `SchwabClient` as the main entry point. The client is composed of specialized API modules that handle different aspects of the Schwab API:

```
SchwabClient (src/client.ts)
├── SchwabOAuth (src/auth/oauth.ts) - OAuth 2.0 flow
├── AccountsAPI (src/api/accounts.ts) - Account operations
├── OrdersAPI (src/api/orders.ts) - Order management
├── TransactionsAPI (src/api/transactions.ts) - Transaction history
├── UserPreferenceAPI (src/api/userPreference.ts) - User preferences
├── MarketDataAPI (src/api/marketData.ts) - Market data & quotes
└── SchwabTradingAPI (src/api/trading.ts) - Legacy trading operations
```

### Authentication Flow

OAuth management is centralized in `SchwabOAuth` class:
1. Token storage is managed in-memory (application can persist tokens externally via `getTokens()`/`setTokens()`)
2. All API modules receive the `SchwabOAuth` instance to access tokens
3. Each API request automatically includes Authorization header via `oauth.getAuthorizationHeader()`
4. Token refresh is manual - applications must call `refreshTokens()` when needed

### API Module Pattern

All API modules follow the same pattern:
- Accept `SchwabOAuth` instance and environment ('sandbox' | 'production') in constructor
- Set `baseUrl` based on environment
- Use private `makeRequest()` method that adds auth headers via `this.oauth.getAuthorizationHeader()`
- All methods are async and return typed responses

Example from `AccountsAPI`:
```typescript
constructor(oauth: SchwabOAuth, environment: 'sandbox' | 'production' = 'production') {
  this.oauth = oauth;
  this.baseUrl = environment === 'sandbox'
    ? 'https://api.schwabapi.com/v1/sandbox'
    : 'https://api.schwabapi.com/v1';
}
```

### Order Builder Pattern

The library provides a **fluent builder API** for constructing orders:

- `OrderBuilder` - Main builder for creating orders with method chaining
- `OrderLegBuilder` - Builder for individual order legs (buy/sell instructions)
- `OrderTemplates` - Static class with pre-configured templates for common order types

Templates include: market buy/sell, limit buy/sell, stop loss, trailing stop, bracket orders, etc.

### Type System

Two type definition files:
1. **`src/types/index.ts`** - Core types used throughout the library (Order, Account, Position, etc.)
2. **`src/types/schemas.ts`** - Comprehensive API response schemas matching Schwab's API specification

The schemas file contains extensive enum types and interfaces representing the complete Schwab API data model (AssetType, QuoteType, Instrument types, etc.).

### Environment Support

The client supports both sandbox and production environments:
- Sandbox: `https://api.schwabapi.com/v1/sandbox`
- Production: `https://api.schwabapi.com/v1`

Environment is set via `SchwabClientConfig.environment` and passed to all API modules.

## Key Implementation Details

### HTTP Client
- Uses native `fetch()` API (Node.js 18+)
- No axios or other HTTP dependencies
- Error handling via HTTP status codes and error text parsing

### OAuth Token Management
- Tokens stored in-memory in `SchwabOAuth` class
- Applications responsible for persistence across restarts
- Token expiry tracking via `tokenExpiryTime` field
- `hasValidTokens()` checks expiry time against current time

### Order Leg Structure
Each order contains `orderLegCollection` which is an array of legs. Each leg specifies:
- `instruction` - BUY, SELL, BUY_TO_OPEN, etc.
- `quantity` - Number of shares/contracts
- `instrument` - The security being traded (symbol, assetType, etc.)

### Market Data Operations
`MarketDataAPI` handles:
- Quote retrieval (single or bulk)
- Option chains with extensive filtering
- Price history with configurable periods/frequencies
- Market movers
- Market hours
- Instrument search

## Testing

- Test framework: Jest with ts-jest preset
- Test files: `tests/**/*.test.ts`
- Coverage collection from `src/**/*.ts` (excluding .d.ts files)
- Current test coverage focuses on market data operations

## Important Notes

- **Node.js 18+ required** for native fetch API support
- **OAuth flow requires manual integration** - the library provides `getAuthorizationUrl()` and `completeOAuth()`, but applications must handle the redirect callback
- **No automatic token refresh** - applications must implement refresh logic using `refreshTokens()`
- **Sandbox vs Production** - Be careful to use correct environment in config to avoid accidental production trades
- **Type safety** - Library is fully typed but has relaxed strict mode settings (see tsconfig.json)

## Common Patterns

### Initializing the client
```typescript
const client = new SchwabClient({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://your-app.com/callback',
  environment: 'sandbox' // or 'production'
});
```

### Using the Order Builder
```typescript
const order = new OrderBuilder()
  .setOrderType('LIMIT')
  .setSession('NORMAL')
  .setDuration('DAY')
  .setPrice(150.00)
  .setQuantity(10)
  .setOrderLegCollection([/* legs */])
  .build();
```

### Using Order Templates
```typescript
const order = OrderTemplates.marketBuy('AAPL', 10, accountNumber);
const limitOrder = OrderTemplates.limitBuy('TSLA', 5, 250.00, accountNumber);
```

## Export Structure

All public APIs are exported from `src/index.ts`:
- Main client class: `SchwabClient`
- Auth: `SchwabOAuth`
- Builders: `OrderBuilder`, `OrderLegBuilder`, `OrderTemplates`
- Types: All interfaces and types from `types/index.ts` and `types/schemas.ts`
- API modules exported as types only (accessed via SchwabClient instance)
