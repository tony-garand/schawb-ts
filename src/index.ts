// Main client
export { SchwabClient } from './client';

// OAuth authentication
export { SchwabOAuth } from './auth/oauth';

// Trading API
export { SchwabTradingAPI } from './api/trading';

// Order builders
export { OrderBuilder, OrderLegBuilder, OrderTemplates } from './builders/orderBuilder';

// API modules
export type { AccountsAPI } from './api/accounts';
export type { OrdersAPI, OrderQueryParams } from './api/orders';
export type { TransactionsAPI, TransactionQueryParams } from './api/transactions';
export type { UserPreferenceAPI } from './api/userPreference';
export type {
  MarketDataAPI,
  QuoteRequestParams,
  QuoteResponse,
  MarketDataQuote,
  MarketDataCandle,
  OptionChainRequestParams,
  OptionChainResponse,
  OptionContract,
  OptionDeliverable,
  OptionChainExpDateMap,
  OptionExpirationChainResponse,
  OptionExpiration,
  PriceHistoryRequestParams,
  PriceHistoryResponse,
  PeriodType,
  FrequencyType,
  MoversRequestParams,
  MoversResponse,
  MoversSymbolId,
  MoversSort,
  MoversFrequency,
  Mover,
  MarketHoursRequestParams,
  MarketHoursResponse,
  MarketType,
  MarketHoursSession,
  MarketHoursSessions,
  MarketHoursProduct,
  InstrumentsRequestParams,
  InstrumentsResponse,
  Instrument,
  InstrumentProjection
} from './api/marketData';

// Types
export type {
  SchwabClientConfig,
  OAuthConfig,
  OAuthTokens,
  Order,
  OrderResponse,
  Account,
  Position,
  Quote,
  MarketHours,
  AccountNumberMapping,
  SecuritiesAccount,
} from './types';

// UserPreference types
export type {
  AccountPreference,
  StreamerInfo,
  Offer,
  UserPreference,
} from './api/userPreference';

// Comprehensive API Schemas
export * from './types/schemas'; 