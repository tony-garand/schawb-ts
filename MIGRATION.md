# Migrating from 1.x to 2.0

2.0 is a maintainability/correctness release. The headline: **API calls now
actually work against the real Schwab API** (1.x shipped wrong base URLs/hosts
and a header that Schwab rejects), built on a single shared HTTP client with
retries, timeouts, and a structured error type.

Most application code that used the `SchwabClient` facade keeps working. The
breaking changes are concentrated in return types, the error thrown, and the
removal of the legacy trading class.

## Breaking changes

### 1. `SchwabTradingAPI` removed
The legacy `SchwabTradingAPI` (`src/api/trading.ts`) duplicated `MarketDataAPI`
with a different, partly-broken API and has been deleted, along with its export.

- If you imported it directly: switch to `client.marketData` (a `MarketDataAPI`)
  or the `SchwabClient` convenience methods below.

### 2. Market-data convenience methods are now backed by `MarketDataAPI`
The `SchwabClient` method **names are unchanged**, but they now return the
`MarketDataAPI` response shapes (the legacy `Quote`/`MarketHours` shapes are gone):

| Method | 1.x return | 2.0 return | Notes |
| --- | --- | --- | --- |
| `getQuote(symbol)` | `Quote` | `MarketDataQuote` | via `getQuoteBySymbol` |
| `getQuotes(symbols)` | `Quote[]` | `QuoteResponse` | object keyed by symbol |
| `getMarketHours(date, market)` | `MarketHours` | `MarketHoursResponse` | uses the working `/markets?markets=` form |
| `searchInstruments(symbol, projection)` | `unknown[]` | `InstrumentsResponse` | |
| `getInstrument(id)` | `unknown` (by symbol) | `Instrument` | **now takes a CUSIP / instrument id**, not a symbol |

### 3. Tightened return types on the facade
These previously returned `unknown` / `unknown[]` and now return concrete types
(source-compatible at runtime; may require removing now-redundant casts):
`getOrder` → `OrderExtended`, `getOrdersForAccount`/`getAllOrders` →
`OrderExtended[]`, `previewOrder` → `OrderPreviewResponse`, `getTransaction` →
`Transaction`, the transaction helpers → `Transaction[]`, and the user-preference
methods → `UserPreference`/`AccountPreference`/`StreamerInfo`/`Offer`.

### 4. Errors are now `SchwabApiError`
All API calls throw `SchwabApiError` (which **extends `Error`**) on non-2xx
responses and network failures, instead of a plain `Error`.

- The message format is preserved (`HTTP <status>: <body>`), so existing
  substring checks still pass.
- You can now branch on structured fields:
  ```ts
  import { SchwabApiError } from 'schwab-ts';
  try {
    await client.getAccounts();
  } catch (e) {
    if (e instanceof SchwabApiError && e.status === 429) { /* back off */ }
  }
  ```

## Non-breaking improvements

- **Reliability:** automatic retry with backoff on `429/502/503/504` and network
  errors (honoring `Retry-After`), a per-request 30s timeout, and coalescing of
  concurrent token refreshes (no more refresh stampede).
- **Packaging fix:** the published package now resolves `dist/index.js` and the
  `schwab-generate-token` bin (`dist/cli/generate-token.js`) correctly, and no
  longer ships compiled test files.
- **New exports:** `SchwabApiError`, `HttpClient` (+ `RequestOptions`,
  `HttpClientOptions`), and `ENDPOINTS` / `getBaseUrl` (+ `SchwabEnvironment`,
  `SchwabApi`).
- **Stricter types:** the library now compiles under full TypeScript `strict`.
- `OrderBuilder.setPrice` now accepts `undefined` (ignored), which is correct
  for market orders.

## Notes

- **Sandbox endpoints remain unverified** — only production is proven against the
  live API. Use `environment: 'production'` for real usage.
- Node 18+ is still required (native `fetch`).
