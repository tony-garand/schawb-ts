---
sidebar_position: 8
---

# Utilities

**schwab-ts** provides several utility functions and classes to help with common tasks when working with the Schwab API.

## Date Utilities

### Formatting Dates

```typescript
import { formatDate } from 'schwab-ts';

// Format date for API calls
const formattedDate = formatDate(new Date('2024-01-15'));
console.log(formattedDate); // "2024-01-15"
```

### Parsing Dates

```typescript
import { parseDate } from 'schwab-ts';

// Parse date from API response
const date = parseDate('2024-01-15T10:30:00Z');
console.log(date); // Date object
```

## Number Utilities

### Formatting Numbers

```typescript
import { formatNumber } from 'schwab-ts';

// Format numbers for API calls
const formattedPrice = formatNumber(150.123456, 2);
console.log(formattedPrice); // "150.12"
```

### Parsing Numbers

```typescript
import { parseNumber } from 'schwab-ts';

// Parse numbers from API response
const price = parseNumber('150.12');
console.log(price); // 150.12
```

## Symbol Utilities

### Validate Symbols

```typescript
import { validateSymbol } from 'schwab-ts';

// Check if a symbol is valid
const isValid = validateSymbol('AAPL');
console.log(isValid); // true

const isInvalid = validateSymbol('INVALID_SYMBOL');
console.log(isInvalid); // false
```

### Normalize Symbols

```typescript
import { normalizeSymbol } from 'schwab-ts';

// Normalize symbol format
const normalized = normalizeSymbol('aapl');
console.log(normalized); // "AAPL"
```

## Error Utilities

### API Error Handling

```typescript
import { isApiError, getErrorMessage } from 'schwab-ts';

try {
  const accounts = await client.get_accounts();
} catch (error) {
  if (isApiError(error)) {
    const message = getErrorMessage(error);
    console.error('API Error:', message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Retry Logic

```typescript
import { retry } from 'schwab-ts';

// Retry a function with exponential backoff
const result = await retry(
  async () => {
    return await client.get_accounts();
  },
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2
  }
);
```

## Validation Utilities

### Validate Order

```typescript
import { validateOrder } from 'schwab-ts';

const order = new OrderBuilder()
  .setOrderType(OrderType.LIMIT)
  .setPrice(150.0)
  .addLeg({
    instruction: 'BUY',
    quantity: 10,
    instrument: { symbol: 'AAPL', assetType: 'EQUITY' }
  })
  .build();

const validation = validateOrder(order);
if (!validation.isValid) {
  console.error('Order validation failed:', validation.errors);
}
```

### Validate Account

```typescript
import { validateAccount } from 'schwab-ts';

const accountInfo = await client.get_account_numbers();
const validation = validateAccount(accountInfo[0]);

if (!validation.isValid) {
  console.error('Account validation failed:', validation.errors);
}
```

## Logging Utilities

### Debug Logging

```typescript
import { setLogLevel, logger } from 'schwab-ts';

// Set log level
setLogLevel('debug');

// Use logger
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

### Request Logging

```typescript
import { enableRequestLogging } from 'schwab-ts';

// Enable detailed request/response logging
enableRequestLogging();

// All API calls will now be logged
const accounts = await client.get_accounts();
```

## Configuration Utilities

### Environment Configuration

```typescript
import { loadConfig } from 'schwab-ts';

// Load configuration from environment variables
const config = loadConfig({
  apiKey: process.env.SCHWAB_API_KEY,
  appSecret: process.env.SCHWAB_APP_SECRET,
  callbackUrl: process.env.SCHWAB_CALLBACK_URL,
  tokenPath: process.env.SCHWAB_TOKEN_PATH
});

const client = await easyClient(config);
```

### Configuration Validation

```typescript
import { validateConfig } from 'schwab-ts';

const config = {
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182'
};

const validation = validateConfig(config);
if (!validation.isValid) {
  console.error('Config validation failed:', validation.errors);
}
```

## Complete Example

Here's a complete example showing how to use various utilities:

```typescript
import { 
  easyClient, 
  formatDate, 
  validateSymbol, 
  retry, 
  logger,
  setLogLevel 
} from 'schwab-ts';

async function example() {
  // Set up logging
  setLogLevel('info');
  
  // Create client
  const client = await easyClient({
    apiKey: 'YOUR_API_KEY',
    appSecret: 'YOUR_APP_SECRET',
    callbackUrl: 'https://127.0.0.1:8182',
    tokenPath: './token.json'
  });

  // Validate symbol before using
  const symbol = 'AAPL';
  if (!validateSymbol(symbol)) {
    throw new Error(`Invalid symbol: ${symbol}`);
  }

  // Get price history with retry logic
  const history = await retry(
    async () => {
      logger.info(`Fetching price history for ${symbol}`);
      return await client.get_price_history({
        symbol,
        startDate: formatDate(new Date('2024-01-01')),
        endDate: formatDate(new Date('2024-12-31'))
      });
    },
    { maxAttempts: 3, delay: 1000 }
  );

  logger.info('Price history retrieved successfully');
  return history;
}

example().catch(console.error);
```

## Best Practices

### 1. Always Validate Input

```typescript
// Validate symbols before API calls
if (!validateSymbol(symbol)) {
  throw new Error(`Invalid symbol: ${symbol}`);
}

// Validate orders before placing
const validation = validateOrder(order);
if (!validation.isValid) {
  throw new Error(`Invalid order: ${validation.errors.join(', ')}`);
}
```

### 2. Use Retry Logic for Unreliable Operations

```typescript
const result = await retry(
  async () => await client.get_accounts(),
  { maxAttempts: 3, delay: 1000 }
);
```

### 3. Proper Error Handling

```typescript
try {
  const result = await client.someApiCall();
} catch (error) {
  if (isApiError(error)) {
    logger.error('API Error:', getErrorMessage(error));
  } else {
    logger.error('Unexpected error:', error);
  }
}
```

### 4. Use Logging for Debugging

```typescript
setLogLevel('debug');
logger.debug('Making API call with params:', { symbol, quantity });
```

## Next Steps

- **[Client Usage](./client.md)** - Learn more about the client API
- **[Order Templates](./order-templates.md)** - Use pre-built order templates
- **[Streaming Data](./streaming.md)** - Set up real-time market data 