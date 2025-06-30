# Schwab Trader API Comprehensive Schemas

This directory contains comprehensive TypeScript type definitions for the Schwab Trader API based on the official API schemas.

## Files

- `schemas.ts` - Complete type definitions for all Schwab Trader API endpoints and responses

## Schema Categories

### Enum Types
- `AssetMainType` - Main asset types (BOND, EQUITY, FOREX, etc.)
- `AssetType` - Extended asset types including ETF, EXTENDED, etc.
- `ContractType` - Option contract types (P for Put, C for Call)
- `SettlementType` - Settlement types (A for AM, P for PM)
- `ExpirationType` - Option expiration types (M, Q, S, W)
- `FundStrategy` - Fund strategy types (A, L, P, Q, S)
- `ExerciseType` - Option exercise types (A for American, E for European)
- `DivFreq` - Dividend frequency values (1, 2, 3, 4, 6, 11, 12)
- `QuoteType` - Quote types (NBBO, NFL)
- `PutCall` - Put/Call indicators
- `MoverDirection` - Mover direction (up, down)

### Base Types
- `Interval` - Time interval with start/end times
- `Error`, `ErrorResponse`, `ErrorSource` - Error handling types
- `QuoteError` - Quote-specific error information

### Instrument Types
- `Bond` - Bond instrument details
- `FundamentalInst` - Comprehensive fundamental data
- `Instrument` - Basic instrument information
- `InstrumentResponse` - Complete instrument response

### Market Hours Types
- `Hours` - Market hours information
- `MarketHoursResponse` - Market hours response structure

### Movers Types
- `Screener` - Individual mover/screener data
- `MoversResponse` - Movers response structure

### Price History Types
- `Candle` - OHLCV candle data
- `CandleList` - Price history response

### Fundamental Types
- `Fundamental` - Basic fundamental data

### Reference Types
- `ReferenceEquity` - Equity reference data
- `ReferenceForex` - Forex reference data
- `ReferenceFuture` - Future reference data
- `ReferenceFutureOption` - Future option reference data
- `ReferenceIndex` - Index reference data
- `ReferenceMutualFund` - Mutual fund reference data
- `ReferenceOption` - Option reference data

### Quote Types
- `QuoteEquity` - Equity quote data
- `QuoteForex` - Forex quote data
- `QuoteFuture` - Future quote data
- `QuoteFutureOption` - Future option quote data
- `QuoteIndex` - Index quote data
- `QuoteMutualFund` - Mutual fund quote data
- `QuoteOption` - Option quote data
- `ExtendedMarket` - Extended hours market data
- `RegularMarket` - Regular market data

### Response Types
- `EquityResponse` - Complete equity response
- `ForexResponse` - Complete forex response
- `FutureResponse` - Complete future response
- `FutureOptionResponse` - Complete future option response
- `IndexResponse` - Complete index response
- `MutualFundResponse` - Complete mutual fund response
- `OptionResponse` - Complete option response
- `QuoteResponseObject` - Union of all quote response types
- `QuoteResponse` - Main quote response structure

### Request Types
- `QuoteRequest` - Quote request parameters

### Option Types
- `OptionDeliverables` - Option deliverable information
- `OptionContract` - Individual option contract data
- `OptionContractMap` - Map of strike prices to contracts
- `OptionChainExpDateMap` - Map of expiration dates to contract maps
- `Underlying` - Underlying security information
- `OptionChain` - Complete option chain response
- `Expiration` - Option expiration information
- `ExpirationChain` - Option expiration chain response

## Usage

```typescript
import { 
  QuoteResponse, 
  EquityResponse, 
  OptionResponse,
  QuoteRequest,
  OptionChain,
  MoversResponse,
  MarketHoursResponse,
  InstrumentsResponse
} from 'schwab-ts';

// Use the types in your application
const quoteRequest: QuoteRequest = {
  symbols: ['AAPL', 'MSFT'],
  fields: 'quote,fundamental,reference'
};

const equityResponse: EquityResponse = {
  assetMainType: 'EQUITY',
  ssid: 1234567890,
  symbol: 'AAPL',
  realtime: true,
  quote: {
    lastPrice: 150.25,
    netChange: 2.50,
    totalVolume: 50000000
  }
};
```

## Benefits

1. **Type Safety** - Full TypeScript support with comprehensive type checking
2. **IntelliSense** - Complete autocomplete and documentation in IDEs
3. **API Compliance** - Types match the official Schwab Trader API schemas exactly
4. **Maintainability** - Centralized type definitions for easy updates
5. **Documentation** - Self-documenting code with clear type structures

## Integration

These schemas can be used alongside the existing API client methods to provide enhanced type safety and better developer experience when working with the Schwab Trader API. 