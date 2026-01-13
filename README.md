# Schwab Trading API Client

A comprehensive TypeScript/Node.js client for the Schwab Trading API with full OAuth 2.0 support and order management capabilities. Built with minimal dependencies and leveraging Node.js built-in modules for HTTP operations.

## Features

- 🔐 **OAuth 2.0 Authentication** - Complete three-legged OAuth flow
- 📊 **Trading Operations** - Place, cancel, and manage orders
- 💼 **Account Management** - Get accounts, positions, and history
- 📈 **Market Data** - Real-time quotes and market hours
- 🎯 **Order Builders** - Fluent API for creating complex orders
- 📋 **Pre-built Templates** - Common order types ready to use
- 🔄 **Token Management** - Automatic token refresh and persistence
- 🛡️ **Type Safety** - Full TypeScript support with comprehensive types
- 📦 **Minimal Dependencies** - Built with Node.js core modules and minimal external packages

## Installation

```bash
npm install schwab-ts
```

## Quick Start

### 1. Basic Setup

```typescript
import { SchwabClient } from 'schwab-ts';

const client = new SchwabClient({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://your-app.com/callback',
  environment: 'sandbox', // or 'production'
});
```

### 2. OAuth Flow

```typescript
// Step 1: Get authorization URL
const authUrl = client.getAuthorizationUrl('optional_state');
console.log('Visit this URL to authorize:', authUrl);

// Step 2: After user authorizes, exchange code for tokens
const tokens = await client.completeOAuth('authorization_code_from_callback');
console.log('OAuth completed!');

// Step 3: Now you can make API calls
const accounts = await client.getAccounts();
console.log('Your accounts:', accounts);
```

### 3. Trading Operations

```typescript
// Get account information
const account = await client.getAccount('account_id');

// Get positions
const positions = await client.getPositions('account_id');

// Get market quote
const quote = await client.getQuote('AAPL');

// Place a market order
const order = client.templates.buyMarketStock('AAPL', 10);
const orderResponse = await client.placeOrder(order, 'account_id');
```

## OAuth Authentication

The Schwab API uses OAuth 2.0 for authentication. Here's the complete flow:

### 1. Get Authorization URL

```typescript
const authUrl = client.getAuthorizationUrl('optional_state_parameter');
// Redirect user to this URL
```

### 2. Handle Callback

After the user authorizes your application, Schwab will redirect them to your callback URL with an authorization code:

```typescript
// Extract code from callback URL
const code = 'authorization_code_from_callback';

// Exchange code for tokens
const tokens = await client.completeOAuth(code);
```

### 3. Token Management

```typescript
// Check if tokens are valid
if (client.hasValidTokens()) {
  console.log('Tokens are valid');
}

// Refresh tokens (automatic on API calls)
const newTokens = await client.refreshTokens();

// Store tokens for later use
const tokens = client.getTokens();
localStorage.setItem('schwab_tokens', JSON.stringify(tokens));

// Restore tokens
const savedTokens = JSON.parse(localStorage.getItem('schwab_tokens'));
client.setTokens(savedTokens);
```

## Order Management

### Simple Orders

```typescript
// Market order
const marketOrder = client.templates.buyMarketStock('AAPL', 10);

// Limit order
const limitOrder = client.createOrder()
  .setOrderType('LIMIT')
  .setSession('NORMAL')
  .setDuration('DAY')
  .setOrderStrategyType('SINGLE')
  .setPrice(150.00)
  .setOrderLegCollection([
    client.createOrderLeg()
      .setInstruction('BUY')
      .setQuantity(10)
      .setInstrument('AAPL', 'EQUITY')
      .build()
  ])
  .build();
```

### Complex Orders

```typescript
// One Cancels Another (OCO)
const ocoOrder = client.templates.oneCancelsAnother('AAPL', 10, 155.00, 145.00, 144.50);

// Trailing Stop
const trailingStopOrder = client.templates.sellTrailingStop('AAPL', 10, 5.00);

// Vertical Spread (Options)
const longOption = client.createOptionSymbol('AAPL', '240315', 'C', 150.00);
const shortOption = client.createOptionSymbol('AAPL', '240315', 'C', 155.00);
const spreadOrder = client.templates.buyVerticalSpread(longOption, shortOption, 1, 2.50);
```

### Option Symbols

```typescript
// Create option symbol from components
const optionSymbol = client.createOptionSymbol('AAPL', '240315', 'C', 150.00);
// Result: "AAPL  240315C00150000"

// Format: Underlying (6 chars) + Expiration (6 chars) + Type (1 char) + Strike (8 chars)
// AAPL  240315C00150000 = AAPL stock, March 15 2024, Call, $150.00 strike
```

## API Reference

### Client Configuration

```typescript
interface SchwabClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment?: 'sandbox' | 'production';
  rateLimiting?: RateLimitConfig;
  timeout?: number;
  retries?: number;
}
```

### Order Types

```typescript
type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'TRAILING_STOP' | 'NET_DEBIT' | 'NET_CREDIT';
type SessionType = 'NORMAL' | 'AM' | 'PM' | 'SEAMLESS';
type DurationType = 'DAY' | 'GOOD_TILL_CANCEL' | 'FILL_OR_KILL' | 'IMMEDIATE_OR_CANCEL';
type InstructionType = 'BUY' | 'SELL' | 'BUY_TO_OPEN' | 'BUY_TO_COVER' | 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_SHORT' | 'SELL_TO_CLOSE';
```

### Available Methods

#### OAuth Methods
- `getAuthorizationUrl(state?)` - Get OAuth authorization URL
- `completeOAuth(code)` - Exchange authorization code for tokens
- `refreshTokens(refreshToken?)` - Refresh access tokens
- `hasValidTokens()` - Check if tokens are valid
- `getTokens()` - Get current tokens
- `setTokens(tokens, expiryTime?)` - Set tokens manually
- `clearTokens()` - Clear stored tokens

#### Trading Methods
- `placeOrder(order, accountNumber)` - Place a new order
- `getOrder(orderId, accountNumber)` - Get order details
- `cancelOrder(orderId, accountNumber)` - Cancel an order
- `replaceOrder(orderId, accountNumber, newOrder)` - Replace an order
- `getOrdersForAccount(accountNumber, params?)` - Get all orders for an account
- `getAllOrders(params?)` - Get all orders for all accounts
- `previewOrder(accountNumber, order)` - Preview an order (Coming Soon)
- `getTransactions(accountNumber, params)` - Get all transactions for an account
- `getTransaction(accountNumber, transactionId)` - Get a specific transaction
- `getRecentTransactions(accountNumber, days, symbol?, types?)` - Get recent transactions
- `getTransactionsForMonth(accountNumber, year, month, symbol?, types?)` - Get transactions for a month
- `getTradeTransactions(accountNumber, startDate, endDate, symbol?)` - Get trade transactions only
- `getDividendTransactions(accountNumber, startDate, endDate, symbol?)` - Get dividend transactions only

#### Account Methods
- `getAccounts()` - Get all accounts
- `getAccount(accountId)` - Get account details
- `getPositions(accountId)` - Get account positions
- `getAccountHistory(accountId, options?)` - Get account history

#### Market Data Methods
- `getQuote(symbol)` - Get quote for a symbol
- `getQuotes(symbols)` - Get quotes for multiple symbols
- `getMarketHours(date, market?)` - Get market hours
- `searchInstruments(symbol, projection?)` - Search for instruments
- `getInstrument(symbol)` - Get instrument details

#### Market Data API Methods (New)
- `getMarketDataQuotes(params)` - Get market data quotes by list of symbols
- `getMarketDataQuoteBySymbol(symbolId, fields?)` - Get market data quote by single symbol
- `getMarketDataQuotesForSymbols(symbols, options?)` - Get market data quotes for multiple symbols with convenience method

#### Order Builders
- `createOrder()` - Create a new order builder
- `createOrderLeg()` - Create a new order leg builder
- `templates` - Access to pre-built order templates

#### Orders API Module

The Orders API provides comprehensive order management capabilities. You can access it directly through `client.orders`:

```typescript
// Access the orders module directly
const ordersAPI = client.orders;

// Get orders for a specific account with filters
const orders = await ordersAPI.getOrdersForAccount(accountNumber, {
  maxResults: 10,
  fromEnteredTime: '2024-01-01T00:00:00.000Z',
  toEnteredTime: '2024-12-31T23:59:59.000Z',
  status: 'FILLED'
});

// Get all orders across all accounts
const allOrders = await ordersAPI.getAllOrders({
  maxResults: 5,
  status: 'WORKING'
});

// Get a specific order
const orderDetails = await ordersAPI.getOrder(accountNumber, orderId);

// Place an order
const orderResponse = await ordersAPI.placeOrder(accountNumber, order);

// Cancel an order
await ordersAPI.cancelOrder(accountNumber, orderId);

// Replace an order
const replaceResponse = await ordersAPI.replaceOrder(accountNumber, orderId, newOrder);

// Preview an order (Coming Soon)
const preview = await ordersAPI.previewOrder(accountNumber, order);
```

#### Order Status Types

```typescript
type OrderStatus = 
  | 'AWAITING_PARENT_ORDER' 
  | 'AWAITING_CONDITION' 
  | 'AWAITING_STOP_CONDITION' 
  | 'AWAITING_MANUAL_REVIEW' 
  | 'ACCEPTED' 
  | 'AWAITING_UR_OUT' 
  | 'PENDING_ACTIVATION' 
  | 'QUEUED' 
  | 'WORKING' 
  | 'REJECTED' 
  | 'PENDING_CANCEL' 
  | 'CANCELED' 
  | 'PENDING_REPLACE' 
  | 'REPLACED' 
  | 'FILLED' 
  | 'EXPIRED' 
  | 'NEW' 
  | 'AWAITING_RELEASE_TIME' 
  | 'PENDING_ACKNOWLEDGEMENT' 
  | 'PENDING_RECALL' 
  | 'UNKNOWN';
```

#### Order Query Parameters

```typescript
interface OrderQueryParams {
  maxResults?: number;           // Max number of orders to retrieve (default: 3000)
  fromEnteredTime?: string;      // ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ
  toEnteredTime?: string;        // ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ
  status?: OrderStatus;          // Filter by order status
}
```

#### Helper Methods

The Orders API includes helper methods for date formatting:

```typescript
// Format date to ISO-8601
const formattedDate = OrdersAPI.formatDateTime(new Date());

// Create date range for queries
const dateRange = OrdersAPI.createDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
// Returns: { fromEnteredTime: '2024-01-01T00:00:00.000Z', toEnteredTime: '2024-01-31T00:00:00.000Z' }
```

#### Transactions API Module

The Transactions API provides comprehensive transaction history and analysis capabilities. You can access it directly through `client.transactions`:

```typescript
// Access the transactions module directly
const transactionsAPI = client.transactions;

// Get transactions for a specific account with filters
const transactions = await transactionsAPI.getTransactions(accountNumber, {
  startDate: '2024-01-01T00:00:00.000Z',
  endDate: '2024-12-31T23:59:59.000Z',
  symbol: 'AAPL', // Optional: filter by symbol
  types: 'TRADE' // Optional: filter by transaction type
});

// Get a specific transaction
const transactionDetails = await transactionsAPI.getTransaction(accountNumber, transactionId);

// Get recent transactions (last N days)
const recentTransactions = await transactionsAPI.getRecentTransactions(accountNumber, 30);

// Get transactions for a specific month
const monthlyTransactions = await transactionsAPI.getTransactionsForMonth(accountNumber, 2024, 1);

// Get only trade transactions
const tradeTransactions = await transactionsAPI.getTradeTransactions(
  accountNumber, 
  new Date('2024-01-01'), 
  new Date('2024-12-31')
);

// Get only dividend transactions
const dividendTransactions = await transactionsAPI.getDividendTransactions(
  accountNumber, 
  new Date('2024-01-01'), 
  new Date('2024-12-31')
);
```

#### Transaction Types

```typescript
type TransactionType = 
  | 'TRADE' 
  | 'RECEIVE_AND_DELIVER' 
  | 'DIVIDEND_OR_INTEREST' 
  | 'ACH_RECEIPT' 
  | 'ACH_DISBURSEMENT' 
  | 'CASH_RECEIPT' 
  | 'CASH_DISBURSEMENT' 
  | 'ELECTRONIC_FUND' 
  | 'WIRE_OUT' 
  | 'WIRE_IN' 
  | 'JOURNAL' 
  | 'MEMORANDUM' 
  | 'MARGIN_CALL' 
  | 'MONEY_MARKET' 
  | 'SMA_ADJUSTMENT';
```

#### Transaction Query Parameters

```typescript
interface TransactionQueryParams {
  startDate: string;           // Required: ISO-8601 format
  endDate: string;             // Required: ISO-8601 format
  symbol?: string;             // Optional: Filter by symbol
  types?: TransactionType;     // Optional: Filter by transaction type
}
```

#### Transaction Data Structure

```typescript
interface Transaction {
  activityId: number;
  time: string;
  user: TransactionUser;
  description: string;
  accountNumber: string;
  type: TransactionType;
  status: TransactionStatus;
  subAccount: SubAccountType;
  tradeDate: string;
  settlementDate: string;
  positionId: number;
  orderId: number;
  netAmount: number;
  activityType: ActivityType;
  transferItems: TransferItem[];
}
```

#### Helper Methods

The Transactions API includes helper methods for common use cases:

```typescript
// Format date to ISO-8601
const formattedDate = TransactionsAPI.formatDateTime(new Date());

// Create date range for queries
const dateRange = TransactionsAPI.createDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
// Returns: { startDate: '2024-01-01T00:00:00.000Z', endDate: '2024-01-31T00:00:00.000Z' }

// Get recent transactions (last 30 days)
const recent = await client.getRecentTransactions(accountNumber, 30);

// Get transactions for specific month
const monthly = await client.getTransactionsForMonth(accountNumber, 2024, 1);

// Get only trade transactions
const trades = await client.getTradeTransactions(accountNumber, startDate, endDate);

// Get only dividend transactions
const dividends = await client.getDividendTransactions(accountNumber, startDate, endDate);
```

## Examples

### Complete OAuth Flow with Node.js HTTP Server

```typescript
import http from 'http';
import url from 'url';
import { SchwabClient } from 'schwab-ts';

const client = new SchwabClient({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'http://localhost:3000/callback',
  environment: 'sandbox',
});

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname;

  switch (pathname) {
    case '/auth':
      const authUrl = client.getAuthorizationUrl('state123');
      res.writeHead(302, { Location: authUrl });
      res.end();
      break;

    case '/callback':
      const { code } = parsedUrl.query;
      if (code && typeof code === 'string') {
        try {
          const tokens = await client.completeOAuth(code);
          console.log('OAuth successful!');
          
          const accounts = await client.getAccounts();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, accounts }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      }
      break;
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Trading Bot Example

```typescript
import { SchwabClient } from 'schwab-ts';

const client = new SchwabClient(config);

async function tradingBot() {
  try {
    // Get account
    const accounts = await client.getAccounts();
    const accountId = accounts[0].accountId;
    
    // Get current positions
    const positions = await client.getPositions(accountId);
    
    // Get market data
    const quote = await client.getQuote('AAPL');
    
    // Place a limit order if conditions are met
    if (quote.lastPrice < 150) {
      const order = client.templates.buyMarketStock('AAPL', 10);
      const result = await client.placeOrder(order, accountId);
      console.log('Order placed:', result);
    }
  } catch (error) {
    console.error('Trading bot error:', error);
  }
}
```

### Complex Order Example

```typescript
// Create a conditional order: Buy AAPL at $150, then sell at $155
const conditionalOrder = client.templates.conditionalOneTriggersAnother('AAPL', 10, 150.00, 155.00);

// Create a trailing stop order
const trailingStopOrder = client.templates.sellTrailingStop('AAPL', 10, 5.00);

// Create an option spread
const callSpread = client.templates.buyVerticalSpread(
  client.createOptionSymbol('AAPL', '240315', 'C', 150.00),
  client.createOptionSymbol('AAPL', '240315', 'C', 155.00),
  1,
  2.50
);
```

### Comprehensive Orders API Example

```typescript
import { SchwabClient } from 'schwab-ts';
import { OrderBuilder, OrderTemplates, OrderLegBuilder } from 'schwab-ts';
import { OrdersAPI, OrderStatus } from 'schwab-ts';

const client = new SchwabClient(config);
const accountNumber = 'your-account-number';

async function comprehensiveOrdersExample() {
  try {
    // 1. Get orders for a specific account with filters
    const orders = await client.getOrdersForAccount(accountNumber, {
      maxResults: 10,
      fromEnteredTime: '2024-01-01T00:00:00.000Z',
      toEnteredTime: '2024-12-31T23:59:59.000Z',
      status: 'FILLED' as OrderStatus,
    });
    console.log(`Found ${orders.length} filled orders`);

    // 2. Get all working orders across all accounts
    const workingOrders = await client.getAllOrders({
      status: 'WORKING' as OrderStatus,
      maxResults: 5,
    });
    console.log(`Found ${workingOrders.length} working orders`);

    // 3. Create and place a market order using OrderBuilder
    const orderBuilder = new OrderBuilder();
    const marketOrder = orderBuilder
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setOrderLegCollection([
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(100)
          .setInstrument('AAPL', 'EQUITY')
          .build()
      ])
      .build();

    const orderResponse = await client.placeOrder(marketOrder, accountNumber);
    console.log('Market order placed:', orderResponse);

    // 4. Get order details
    if (orderResponse.orderId) {
      const orderDetails = await client.getOrder(parseInt(orderResponse.orderId), accountNumber);
      console.log('Order details:', orderDetails);
    }

    // 5. Create and place a limit order using templates
    const limitOrder = OrderTemplates.buyMarketStock('MSFT', 50);
    const limitOrderResponse = await client.placeOrder(limitOrder, accountNumber);
    console.log('Limit order placed:', limitOrderResponse);

    // 6. Replace an order (modify existing order)
    if (limitOrderResponse.orderId) {
      const replacementOrder = orderBuilder
        .setOrderType('LIMIT')
        .setSession('NORMAL')
        .setDuration('DAY')
        .setOrderStrategyType('SINGLE')
        .setPrice(155.00) // New price
        .setOrderLegCollection([
          new OrderLegBuilder()
            .setInstruction('SELL')
            .setQuantity(50)
            .setInstrument('MSFT', 'EQUITY')
            .build()
        ])
        .build();

      const replaceResponse = await client.replaceOrder(
        parseInt(limitOrderResponse.orderId), 
        accountNumber, 
        replacementOrder
      );
      console.log('Order replaced:', replaceResponse);
    }

    // 7. Cancel an order
    if (orderResponse.orderId) {
      await client.cancelOrder(parseInt(orderResponse.orderId), accountNumber);
      console.log('Order canceled successfully');
    }

    // 8. Using helper methods for date formatting
    const dateRange = OrdersAPI.createDateRange(
      new Date('2024-01-01'),
      new Date('2024-01-31')
    );
    console.log('Date range:', dateRange);

    // 9. Access orders module directly
    const ordersAPI = client.orders;
    const recentOrders = await ordersAPI.getOrdersForAccount(accountNumber, {
      fromEnteredTime: OrdersAPI.formatDateTime(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago
      toEnteredTime: OrdersAPI.formatDateTime(new Date()),
    });
    console.log(`Found ${recentOrders.length} orders in the last 7 days`);

  } catch (error) {
    console.error('Orders API example error:', error);
  }
}
```

### Comprehensive Transactions API Example

```typescript
import { SchwabClient } from 'schwab-ts';
import { TransactionsAPI, TransactionType } from 'schwab-ts';

const client = new SchwabClient(config);
const accountNumber = 'your-account-number';

async function comprehensiveTransactionsExample() {
  try {
    // 1. Get all transactions for a specific account with filters
    const transactions = await client.getTransactions(accountNumber, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
      symbol: 'AAPL', // Optional: filter by symbol
      types: 'TRADE' as TransactionType, // Optional: filter by transaction type
    });
    console.log(`Found ${transactions.length} transactions`);

    // 2. Get a specific transaction by ID
    if (transactions.length > 0) {
      const transactionId = transactions[0].activityId;
      const transactionDetails = await client.getTransaction(accountNumber, transactionId);
      console.log('Transaction details:', transactionDetails);
    }

    // 3. Get recent transactions (last 30 days)
    const recentTransactions = await client.getRecentTransactions(accountNumber, 30);
    console.log(`Found ${recentTransactions.length} recent transactions`);

    // 4. Get transactions for a specific month
    const januaryTransactions = await client.getTransactionsForMonth(accountNumber, 2024, 1);
    console.log(`Found ${januaryTransactions.length} transactions in January 2024`);

    // 5. Get only trade transactions
    const tradeTransactions = await client.getTradeTransactions(
      accountNumber,
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );
    console.log(`Found ${tradeTransactions.length} trade transactions`);

    // 6. Get only dividend transactions
    const dividendTransactions = await client.getDividendTransactions(
      accountNumber,
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );
    console.log(`Found ${dividendTransactions.length} dividend transactions`);

    // 7. Analyze transaction types
    const allTransactions = await client.getTransactions(accountNumber, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
    });

    const transactionTypeCounts = allTransactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Transaction type breakdown:', transactionTypeCounts);

    // 8. Calculate total net amount
    const totalNetAmount = allTransactions.reduce((sum, transaction) => {
      return sum + (transaction.netAmount || 0);
    }, 0);
    console.log(`Total net amount: $${totalNetAmount.toFixed(2)}`);

    // 9. Access transactions module directly
    const transactionsAPI = client.transactions;
    
    // Get transactions with custom filters
    const customTransactions = await transactionsAPI.getTransactions(accountNumber, {
      startDate: '2024-06-01T00:00:00.000Z',
      endDate: '2024-06-30T23:59:59.000Z',
      types: 'DIVIDEND_OR_INTEREST' as TransactionType,
    });
    console.log(`Found ${customTransactions.length} dividend/interest transactions in June 2024`);

    // 10. Generate monthly breakdown
    const monthlyBreakdown = allTransactions.reduce((acc, transaction) => {
      const month = new Date(transaction.time).getMonth();
      const monthName = new Date(2024, month).toLocaleString('default', { month: 'long' });
      
      if (!acc[monthName]) {
        acc[monthName] = {
          count: 0,
          totalAmount: 0,
          types: {} as Record<string, number>,
        };
      }
      
      acc[monthName].count++;
      acc[monthName].totalAmount += transaction.netAmount || 0;
      acc[monthName].types[transaction.type] = (acc[monthName].types[transaction.type] || 0) + 1;
      
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number; types: Record<string, number> }>);

    console.log('Monthly transaction breakdown:', monthlyBreakdown);

  } catch (error) {
    console.error('Transactions API example error:', error);
  }
}
```

## Error Handling

```typescript
try {
  const order = await client.placeOrder(orderData, accountId);
  console.log('Order placed successfully:', order);
} catch (error) {
  if (error.message.includes('401')) {
    // Token expired, refresh and retry
    await client.refreshTokens();
    const order = await client.placeOrder(orderData, accountId);
  } else {
    console.error('Order failed:', error.message);
  }
}
```

## Rate Limiting

The Schwab API has rate limits. The client automatically handles token refresh, but you should implement your own rate limiting for API calls:

```typescript
// Example rate limiting
const rateLimiter = {
  lastCall: 0,
  minInterval: 100, // 100ms between calls
  
  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    
    this.lastCall = Date.now();
  }
};

// Use in your trading logic
await rateLimiter.throttle();
const quote = await client.getQuote('AAPL');
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Running Examples

```bash
# Run the OAuth server example
npx ts-node examples/oauth-server.ts

# Run basic usage example
npx ts-node examples/basic-usage.ts

# Run orders API example
npx ts-node examples/orders-example.ts

# Run transactions API example
npx ts-node examples/transactions-example.ts
```

## Dependencies

This library uses Node.js built-in modules for core functionality with minimal external dependencies:

### Runtime Dependencies
- `ws` - WebSocket client for real-time streaming data
- `node-cron` - Task scheduling for automated operations
- `open` - Cross-platform command to open URLs (used for OAuth flow)

### Built-in Modules
- `fetch` - For HTTP requests (Node.js 18+)
- `http` - For creating HTTP servers
- `url` - For URL parsing
- `Buffer` - For base64 encoding

No external HTTP libraries like axios or express are required for API operations.

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [https://github.com/tony-garand/schwab-ts/issues](https://github.com/tony-garand/schwab-ts/issues)
- Documentation: [https://github.com/tony-garand/schwab-ts](https://github.com/tony-garand/schwab-ts)

## Disclaimer

This library is not officially affiliated with Charles Schwab & Co., Inc. Use at your own risk. Always test thoroughly in sandbox environment before using in production.

## UserPreference API

The UserPreference API provides access to user preference information, account settings, streamer configuration, and permission details.

### Basic Usage

```typescript
import { SchwabClient } from 'schwab-ts';

const client = new SchwabClient(config);

// Get all user preferences
const userPreferences = await client.getUserPreferences();

// Get primary account
const primaryAccount = await client.getPrimaryAccount();

// Get account preferences
const accountPreferences = await client.getAccountPreferences();

// Get streamer information
const streamerInfo = await client.getStreamerInfo();

// Check permissions
const hasLevel2 = await client.hasLevel2Permissions();
```

### UserPreference API Methods

#### Core Methods

- `getUserPreferences()` - Get all user preference information
- `getPrimaryAccount()` - Get the user's primary account preference
- `getAccountPreferences()` - Get all account preferences
- `getAccountPreference(accountNumber)` - Get preference for specific account
- `getStreamerInfo()` - Get streamer configuration information
- `getOffers()` - Get user offers and permissions

#### Account Management

- `getAccountNicknames()` - Get account number to nickname mapping
- `getAccountColors()` - Get account number to color mapping
- `getAccountsByType(type)` - Get accounts filtered by type
- `getAccountsWithAutoPositionEffect()` - Get accounts with auto position effect enabled

#### Permission Checks

- `hasLevel2Permissions()` - Check if user has level 2 permissions
- `getMarketDataPermissions()` - Get market data permission strings

#### Streamer Configuration

- `getStreamerSocketUrl()` - Get streamer socket URL for real-time data
- `getSchwabClientCustomerId()` - Get Schwab client customer ID
- `getSchwabClientCorrelId()` - Get Schwab client correlation ID
- `getSchwabClientChannel()` - Get Schwab client channel
- `getSchwabClientFunctionId()` - Get Schwab client function ID

### Types

```typescript
interface AccountPreference {
  accountNumber: string;
  primaryAccount: boolean;
  type: string;
  nickName: string;
  accountColor: string;
  displayAcctId: string;
  autoPositionEffect: boolean;
}

interface StreamerInfo {
  streamerSocketUrl: string;
  schwabClientCustomerId: string;
  schwabClientCorrelId: string;
  schwabClientChannel: string;
  schwabClientFunctionId: string;
}

interface Offer {
  level2Permissions: boolean;
  mktDataPermission: string;
}

interface UserPreference {
  accounts: AccountPreference[];
  streamerInfo: StreamerInfo[];
  offers: Offer[];
}
```

### Advanced Usage Examples

#### Account Analysis

```typescript
// Analyze account types and preferences
const accountPreferences = await client.getAccountPreferences();

// Get account type breakdown
const accountTypeCounts = accountPreferences.reduce((acc, account) => {
  acc[account.type] = (acc[account.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Account type breakdown:', accountTypeCounts);

// Find accounts with specific features
const accountsWithNicknames = accountPreferences.filter(account => account.nickName);
const accountsWithColors = accountPreferences.filter(account => account.accountColor);
const accountsWithAutoPosition = accountPreferences.filter(account => account.autoPositionEffect);
```

#### Real-time Data Setup

```typescript
// Get streamer configuration for real-time data
const streamerSocketUrl = await client.getStreamerSocketUrl();
const customerId = await client.getSchwabClientCustomerId();
const channel = await client.getSchwabClientChannel();

if (streamerSocketUrl) {
  console.log('Real-time data available at:', streamerSocketUrl);
  // Use these parameters for WebSocket connections
}
```

#### Permission-based Operations

```typescript
// Check permissions before attempting operations
const hasLevel2 = await client.hasLevel2Permissions();
const marketDataPermissions = await client.getMarketDataPermissions();

if (hasLevel2) {
  console.log('User has level 2 permissions - can access advanced market data');
  // Perform advanced operations
} else {
  console.log('User has basic permissions only');
  // Perform basic operations
}
```

#### Account Management

```typescript
// Get primary account for default operations
const primaryAccount = await client.getPrimaryAccount();
if (primaryAccount) {
  console.log(`Using primary account: ${primaryAccount.accountNumber} (${primaryAccount.nickName})`);
  
  // Use primary account for trading operations
  const order = client.templates.buyMarketStock('AAPL', 10);
  const orderResponse = await client.placeOrder(order, primaryAccount.accountNumber);
}

// Get account nicknames and colors for UI
const accountNicknames = await client.getAccountNicknames();
const accountColors = await client.getAccountColors();

// Use for UI theming and display
Object.entries(accountNicknames).forEach(([accountNumber, nickname]) => {
  const color = accountColors[accountNumber] || '#000000';
  console.log(`Account ${accountNumber}: ${nickname} (Color: ${color})`);
});
```

#### Direct Module Access

```typescript
// Access the user preference module directly
const userPreferenceAPI = client.userPreference;

// Use module methods directly
const preferences = await userPreferenceAPI.getUserPreferences();
const primaryAccount = await userPreferenceAPI.getPrimaryAccount();
const streamerInfo = await userPreferenceAPI.getStreamerInfo();
```

### Error Handling

```typescript
try {
  const userPreferences = await client.getUserPreferences();
  console.log('User preferences:', userPreferences);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed - check your OAuth tokens');
  } else if (error.message.includes('403')) {
    console.error('Access forbidden - check your permissions');
  } else {
    console.error('Error getting user preferences:', error);
  }
}
```

### Integration with Other APIs

```typescript
// Use user preferences to enhance other API calls
const primaryAccount = await client.getPrimaryAccount();
if (primaryAccount) {
  // Get account details using the primary account
  const accountDetails = await client.getAccount(primaryAccount.accountNumber);
  
  // Get positions for the primary account
  const positions = await client.getPositions(primaryAccount.accountNumber);
  
  // Place orders on the primary account
  const order = client.templates.buyMarketStock('AAPL', 10);
  const orderResponse = await client.placeOrder(order, primaryAccount.accountNumber);
}

// Use account preferences for filtering
const individualAccounts = await client.getAccountsByType('INDIVIDUAL');
for (const account of individualAccounts) {
  const transactions = await client.getTransactions(
    account.accountNumber,
    new Date('2024-01-01'),
    new Date('2024-12-31')
  );
  console.log(`Transactions for ${account.nickName}:`, transactions.length);
}
```

## Transactions API 

#### Market Data API Module

The Market Data API provides comprehensive real-time market data capabilities. You can access it directly through `client.marketData`:

```typescript
// Access the market data module directly
const marketDataAPI = client.marketData;

// Get quotes for multiple symbols
const quotes = await marketDataAPI.getQuotes({
  symbols: 'AAPL,MSFT,GOOGL,TSLA',
  fields: 'quote,reference,fundamental',
  indicative: false
});

// Get quote for a single symbol
const singleQuote = await marketDataAPI.getQuoteBySymbol('AAPL', 'quote,reference');

// Get quotes using convenience method
const convenienceQuotes = await marketDataAPI.getQuotesForSymbols(
  ['AAPL', 'MSFT', 'GOOGL'],
  {
    fields: 'quote,reference',
    indicative: true
  }
);
```

#### Market Data Query Parameters

```typescript
interface QuoteRequestParams {
  symbols?: string;        // Comma-separated list of symbols
  fields?: string;         // Comma-separated list of fields (quote, fundamental, extended, reference, regular)
  indicative?: boolean;    // Include indicative symbol quotes for ETFs
}
```

#### Supported Asset Types

The Market Data API supports various asset types:

- **EQUITY** - Common stocks, preferred stocks
- **OPTION** - Stock options, index options
- **FUTURE** - Futures contracts
- **FOREX** - Foreign exchange pairs
- **INDEX** - Market indices (S&P 500, Dow Jones, etc.)
- **MUTUAL_FUND** - Mutual funds
- **ETF** - Exchange-traded funds

#### Quote Data Structure

```typescript
interface QuoteResponse {
  [symbol: string]: {
    assetMainType: string;
    symbol: string;
    quoteType?: string;
    realtime: boolean;
    ssid: number;
    reference: {
      cusip?: string;
      description: string;
      exchange: string;
      exchangeName: string;
      // ... additional reference fields
    };
    quote: {
      lastPrice?: number;
      bidPrice?: number;
      askPrice?: number;
      bidSize?: number;
      askSize?: number;
      netChange?: number;
      netPercentChange?: number;
      totalVolume?: number;
      // ... additional quote fields
    };
    regular?: {
      regularMarketLastPrice?: number;
      regularMarketNetChange?: number;
      regularMarketPercentChange?: number;
      // ... additional regular market fields
    };
    fundamental?: {
      peRatio?: number;
      divYield?: number;
      eps?: number;
      // ... additional fundamental fields
    };
  };
}
```

#### Example Usage

```typescript
// Get quotes for different asset types
const mixedQuotes = await client.getMarketDataQuotes({
  symbols: 'AAPL,SPY,TSLA 240315C00250000,EUR/USD',
  fields: 'quote,reference'
});

// Process quote data
for (const [symbol, quoteData] of Object.entries(mixedQuotes)) {
  console.log(`Symbol: ${symbol}`);
  console.log(`Asset Type: ${quoteData.assetMainType}`);
  console.log(`Last Price: $${quoteData.quote?.lastPrice || 'N/A'}`);
  console.log(`Change: ${quoteData.quote?.netChange || 0} (${quoteData.quote?.netPercentChange || 0}%)`);
}

// Filter quotes by asset type
const equityQuotes = Object.fromEntries(
  Object.entries(mixedQuotes).filter(([_, data]) => data.assetMainType === 'EQUITY')
);
``` 