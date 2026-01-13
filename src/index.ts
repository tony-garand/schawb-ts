// Main client
export { SchwabClient } from './client';

// OAuth authentication
export { SchwabOAuth } from './auth/oauth';

// Easy authentication (token file management, browser flow, manual flow)
export {
  easyClient,
  clientFromTokenFile,
  clientFromLoginFlow,
  clientFromManualFlow,
  clientFromAccessFunctions,
  readTokenFile,
  writeTokenFile,
  getTokenAge,
  TOKEN_EXPIRY,
} from './auth/easyAuth';
export type { EasyClientOptions, LoginFlowOptions, TokenFileData } from './auth/easyAuth';

// Trading API
export { SchwabTradingAPI } from './api/trading';

// Streaming Client
export { StreamClient } from './streaming/streamClient';
export {
  LevelOneEquityFields,
  LevelOneOptionFields,
  LevelOneFuturesFields,
  LevelOneFuturesOptionsFields,
  LevelOneForexFields,
  ChartEquityFields,
  ChartFuturesFields,
  ScreenerFields,
  AccountActivityFields,
} from './streaming/streamClient';
export type {
  StreamMessage,
  StreamMessageHandler,
  StreamerInfo as StreamerInfoType,
} from './streaming/streamClient';

// Order builders
export { OrderBuilder, OrderLegBuilder, OrderTemplates } from './builders/orderBuilder';

// Equity order templates
export {
  equityBuyMarket,
  equitySellMarket,
  equityBuyLimit,
  equitySellLimit,
  equitySellShortMarket,
  equitySellShortLimit,
  equityBuyToCoverMarket,
  equityBuyToCoverLimit,
  equityBuyStop,
  equitySellStop,
  equityBuyStopLimit,
  equitySellStopLimit,
  equitySellTrailingStop,
  equitySellTrailingStopPercent,
} from './orders/equities';

// Options utilities and templates
export { OptionSymbol } from './orders/options';
export {
  optionBuyToOpenMarket,
  optionBuyToOpenLimit,
  optionSellToOpenMarket,
  optionSellToOpenLimit,
  optionBuyToCloseMarket,
  optionBuyToCloseLimit,
  optionSellToCloseMarket,
  optionSellToCloseLimit,
  bullCallVerticalOpen,
  bullCallVerticalClose,
  bearCallVerticalOpen,
  bearCallVerticalClose,
  bullPutVerticalOpen,
  bullPutVerticalClose,
  bearPutVerticalOpen,
  bearPutVerticalClose,
} from './orders/options';

// Common order utilities (composite orders)
export {
  oneCancelsOther,
  firstTriggersSecond,
  oneTriggerOCO,
  DurationValue,
  SessionValue,
  OrderTypeValue,
} from './orders/common';

// Utils
export {
  Utils,
  formatPrice,
  toISODate,
  formatDate,
  formatDateTime,
  getMarketOpen,
  getMarketClose,
  isDuringMarketHours,
} from './utils/utils';
export type { PlaceOrderResponse } from './utils/utils';

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
  InstrumentProjection,
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
export type { AccountPreference, StreamerInfo, Offer, UserPreference } from './api/userPreference';

// Comprehensive API Schemas
export * from './types/schemas';
