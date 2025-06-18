---
sidebar_position: 4
---

# HTTP Client

The **schwab-ts** client is a modern, type-safe wrapper around the [Schwab Individual Trader API](https://developer.schwab.com/products/trader-api--individual). It provides access to all endpoints in an easy and direct way.

> **Important**: Do not attempt to use more than one Client object per token file, as this will likely cause issues with the underlying OAuth2 session management.

## Quick Start

```typescript
import { easyClient } from 'schwab-ts';

// Create a client using the auth package
const client = await easyClient({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182',
  tokenPath: './token.json'
});

// Make API calls
const accounts = await client.get_accounts();
console.log('Accounts:', accounts);
```

## Async/Await Support

The client is built with modern async/await patterns for better performance and cleaner code:

```typescript
import { easyClient } from 'schwab-ts';

async function main() {
  const client = await easyClient({
    apiKey: 'YOUR_API_KEY',
    appSecret: 'YOUR_APP_SECRET',
    callbackUrl: 'https://127.0.0.1:8182',
    tokenPath: './token.json'
  });

  const accounts = await client.get_accounts();
  const positions = await client.get_account(accounts[0].hashValue, { fields: ['positions'] });
  
  console.log('Positions:', positions);
}

main().catch(console.error);
```

## Calling Conventions

### Required vs Optional Parameters

- **Required parameters** are passed as positional arguments
- **Optional parameters** are passed as keyword arguments in an options object

```typescript
// Required parameters
const account = await client.get_account(accountHash);

// Optional parameters
const accountWithPositions = await client.get_account(accountHash, {
  fields: ['positions', 'orders']
});
```

### Type Safety with Enums

The API uses TypeScript enums for parameters that have specific allowed values:

```typescript
import { Client } from 'schwab-ts';

// Using enums for type safety
const orders = await client.get_orders_for_account(accountHash, {
  status: Client.Order.Status.FILLED,
  maxResults: 50
});
```

By default, passing invalid enum values will raise a `TypeError`. You can disable this behavior with `setEnforceEnums(false)`, but this is not recommended.

## Return Values

All methods return a `Response` object that contains the API response data:

```typescript
const response = await client.get_accounts();

// Check if the request was successful
if (response.ok) {
  const accounts = response.data;
  console.log('Accounts:', accounts);
} else {
  console.error('Error:', response.status, response.statusText);
}
```

### Response Structure

The response object contains:

- `ok`: Boolean indicating if the request was successful
- `status`: HTTP status code
- `statusText`: HTTP status text
- `data`: Parsed JSON response data
- `headers`: Response headers

## Account Hashes

Many API methods require an account hash instead of a raw account number. You can fetch account hashes using the `get_account_numbers()` method:

```typescript
// Get account information
const accountInfo = await client.get_account_numbers();
console.log('Account info:', accountInfo);

// Extract the account hash
const accountHash = accountInfo[0].hashValue;

// Use the hash for other API calls
const positions = await client.get_account(accountHash, {
  fields: ['positions']
});
```

### Account Hash Structure

```typescript
interface AccountInfo {
  accountNumber: string;
  hashValue: string;
}
```

## Timeout Management

HTTP calls have a default timeout of 30 seconds. You can customize this:

```typescript
// Set a custom timeout (in milliseconds)
client.setTimeout(60000); // 60 seconds

// Reset to default
client.setTimeout(30000); // 30 seconds
```

## Token Management

### Check Token Age

```typescript
const tokenAge = client.tokenAge();
console.log(`Token is ${tokenAge} seconds old`);

// Tokens expire after 7 days (604800 seconds)
if (tokenAge > 604800) {
  console.log('Token is expired. Please create a new one.');
}
```

## Account Information

### Get All Accounts

```typescript
const accounts = await client.get_accounts();
```

### Get Specific Account

```typescript
const account = await client.get_account(accountHash, {
  fields: ['positions', 'orders', 'balances']
});
```

### Get Account Numbers

```typescript
const accountNumbers = await client.get_account_numbers();
```

## Order Management

### Get Orders

```typescript
// Get all orders for an account
const orders = await client.get_orders_for_account(accountHash, {
  fromEnteredTime: new Date('2024-01-01'),
  toEnteredTime: new Date('2024-12-31'),
  status: Client.Order.Status.FILLED,
  maxResults: 100
});
```

### Get Specific Order

```typescript
const order = await client.get_order(orderId, accountHash);
```

### Cancel Order

```typescript
await client.cancel_order(orderId, accountHash);
```

## Market Data

### Get Price History

```typescript
const history = await client.get_price_history({
  symbol: 'AAPL',
  periodType: Client.PriceHistory.PeriodType.DAY,
  period: 1,
  frequencyType: Client.PriceHistory.FrequencyType.DAILY,
  frequency: 1,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
```

### Get Quote

```typescript
const quote = await client.get_quote('AAPL');
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const accounts = await client.get_accounts();
  console.log('Success:', accounts);
} catch (error) {
  if (error.status === 401) {
    console.error('Authentication failed. Token may be expired.');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded. Please wait before retrying.');
  } else {
    console.error('API error:', error.message);
  }
}
```

### Response Validation

```typescript
const response = await client.get_accounts();

if (!response.ok) {
  throw new Error(`API request failed: ${response.status} ${response.statusText}`);
}

const accounts = response.data;
```

## Best Practices

### 1. Reuse Client Instances

```typescript
// Good: Reuse the same client
const client = await easyClient({ /* config */ });

// Use the same client for multiple requests
const accounts = await client.get_accounts();
const positions = await client.get_account(accounts[0].hashValue);

// Bad: Create new clients for each request
```

### 2. Handle Rate Limits

```typescript
try {
  const result = await client.someApiCall();
} catch (error) {
  if (error.status === 429) {
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await client.someApiCall();
  }
}
```

### 3. Use TypeScript Types

```typescript
import { Client } from 'schwab-ts';

// Use the provided types for better IntelliSense
const order: Client.Order = {
  // TypeScript will help you with the correct structure
};
```

### 4. Environment Variables

```typescript
import { easyClient } from 'schwab-ts';

const client = await easyClient({
  apiKey: process.env.SCHWAB_API_KEY!,
  appSecret: process.env.SCHWAB_APP_SECRET!,
  callbackUrl: process.env.SCHWAB_CALLBACK_URL!,
  tokenPath: process.env.SCHWAB_TOKEN_PATH || './token.json'
});
```

## Next Steps

- **[Streaming Data](./streaming.md)** - Set up real-time market data
- **[Order Builder](./order-builder.md)** - Create complex orders
- **[Order Templates](./order-templates.md)** - Use pre-built order templates 