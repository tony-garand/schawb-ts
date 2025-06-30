// Comprehensive Schwab Trader API Schema Types

// ============================================================================
// ENUM TYPES
// ============================================================================

export type AssetMainType = 'BOND' | 'EQUITY' | 'FOREX' | 'FUTURE' | 'FUTURE_OPTION' | 'INDEX' | 'MUTUAL_FUND' | 'OPTION';

export type AssetType = 'BOND' | 'EQUITY' | 'ETF' | 'EXTENDED' | 'FOREX' | 'FUTURE' | 'FUTURE_OPTION' | 'FUNDAMENTAL' | 'INDEX' | 'INDICATOR' | 'MUTUAL_FUND' | 'OPTION' | 'UNKNOWN';

export type EquityAssetSubType = 'COE' | 'PRF' | 'ADR' | 'GDR' | 'CEF' | 'ETF' | 'ETN' | 'UIT' | 'WAR' | 'RGT';

export type MutualFundAssetSubType = 'OEF' | 'CEF' | 'MMF';

export type ContractType = 'P' | 'C';

export type SettlementType = 'A' | 'P';

export type ExpirationType = 'M' | 'Q' | 'S' | 'W';

export type FundStrategy = 'A' | 'L' | 'P' | 'Q' | 'S';

export type ExerciseType = 'A' | 'E';

export type DivFreq = 1 | 2 | 3 | 4 | 6 | 11 | 12;

export type QuoteType = 'NBBO' | 'NFL';

export type PutCall = 'PUT' | 'CALL';

export type MoverDirection = 'up' | 'down';

// ============================================================================
// BASE TYPES
// ============================================================================

export interface Interval {
  start: string;
  end: string;
}

export interface ErrorSource {
  pointer?: string[];
  parameter?: string;
  header?: string;
}

export interface Error {
  id: string;
  status: string;
  title: string;
  detail: string;
  source?: ErrorSource;
}

export interface ErrorResponse {
  errors: Error[];
}

export interface QuoteError {
  invalidCusips?: string[];
  invalidSSIDs?: number[];
  invalidSymbols?: string[];
}

// ============================================================================
// INSTRUMENT TYPES
// ============================================================================

export interface Bond {
  cusip: string;
  symbol: string;
  description: string;
  exchange: string;
  assetType: AssetType;
  bondFactor: string;
  bondMultiplier: string;
  bondPrice: number;
  type: AssetType;
}

export interface FundamentalInst {
  symbol: string;
  high52: number;
  low52: number;
  dividendAmount: number;
  dividendYield: number;
  dividendDate: string;
  peRatio: number;
  pegRatio: number;
  pbRatio: number;
  prRatio: number;
  pcfRatio: number;
  grossMarginTTM: number;
  grossMarginMRQ: number;
  netProfitMarginTTM: number;
  netProfitMarginMRQ: number;
  operatingMarginTTM: number;
  operatingMarginMRQ: number;
  returnOnEquity: number;
  returnOnAssets: number;
  returnOnInvestment: number;
  quickRatio: number;
  currentRatio: number;
  interestCoverage: number;
  totalDebtToCapital: number;
  ltDebtToEquity: number;
  totalDebtToEquity: number;
  epsTTM: number;
  epsChangePercentTTM: number;
  epsChangeYear: number;
  epsChange: number;
  revChangeYear: number;
  revChangeTTM: number;
  revChangeIn: number;
  sharesOutstanding: number;
  marketCapFloat: number;
  marketCap: number;
  bookValuePerShare: number;
  shortIntToFloat: number;
  shortIntDayToCover: number;
  divGrowthRate3Year: number;
  dividendPayAmount: number;
  dividendPayDate: string;
  beta: number;
  vol1DayAvg: number;
  vol10DayAvg: number;
  vol3MonthAvg: number;
  avg10DaysVolume: number;
  avg1DayVolume: number;
  avg3MonthVolume: number;
  declarationDate: string;
  dividendFreq: number;
  eps: number;
  corpactionDate: string;
  dtnVolume: number;
  nextDividendPayDate: string;
  nextDividendDate: string;
  fundLeverageFactor: number;
  fundStrategy: string;
}

export interface Instrument {
  cusip: string;
  symbol: string;
  description: string;
  exchange: string;
  assetType: AssetType;
  type: AssetType;
}

export interface InstrumentResponse {
  cusip: string;
  symbol: string;
  description: string;
  exchange: string;
  assetType: AssetType;
  bondFactor?: string;
  bondMultiplier?: string;
  bondPrice?: number;
  fundamental?: FundamentalInst;
  instrumentInfo?: Instrument;
  bondInstrumentInfo?: Bond;
  type: AssetType;
}

// ============================================================================
// MARKET HOURS TYPES
// ============================================================================

export interface Hours {
  date: string;
  marketType: string;
  exchange: string;
  category: string;
  product: string;
  productName: string;
  isOpen: boolean;
  sessionHours: {
    [key: string]: Interval[];
  };
}

// ============================================================================
// MOVERS TYPES
// ============================================================================

export interface Screener {
  change: number;
  description: string;
  direction: MoverDirection;
  last: number;
  symbol: string;
  totalVolume: number;
}

// ============================================================================
// PRICE HISTORY TYPES
// ============================================================================

export interface Candle {
  close: number;
  datetime: number;
  datetimeISO8601: string;
  high: number;
  low: number;
  open: number;
  volume: number;
}

export interface CandleList {
  candles: Candle[];
  empty: boolean;
  previousClose: number;
  previousCloseDate: number;
  previousCloseDateISO8601: string;
  symbol: string;
}

// ============================================================================
// FUNDAMENTAL TYPES
// ============================================================================

export interface Fundamental {
  avg10DaysVolume: number;
  avg1YearVolume: number;
  declarationDate: string;
  divAmount: number;
  divExDate: string;
  divFreq?: DivFreq;
  divPayAmount: number;
  divPayDate: string;
  divYield: number;
  eps: number;
  fundLeverageFactor: number;
  fundStrategy?: FundStrategy;
  nextDivExDate: string;
  nextDivPayDate: string;
  peRatio: number;
}

// ============================================================================
// REFERENCE TYPES
// ============================================================================

export interface ReferenceEquity {
  cusip: string;
  description: string;
  exchange: string;
  exchangeName: string;
  fsiDesc?: string;
  htbQuantity?: number;
  htbRate?: number;
  isHardToBorrow?: boolean;
  isShortable?: boolean;
  otcMarketTier?: string;
}

export interface ReferenceForex {
  description: string;
  exchange: string;
  exchangeName: string;
  isTradable: boolean;
  marketMaker?: string;
  product?: string;
  tradingHours?: string;
}

export interface ReferenceFuture {
  description: string;
  exchange: string;
  exchangeName: string;
  futureActiveSymbol?: string;
  futureExpirationDate?: number;
  futureIsActive?: boolean;
  futureMultiplier?: number;
  futurePriceFormat?: string;
  futureSettlementPrice?: number;
  futureTradingHours?: string;
  product?: string;
}

export interface ReferenceFutureOption {
  contractType: ContractType;
  description: string;
  exchange: string;
  exchangeName: string;
  multiplier: number;
  expirationDate: number;
  expirationStyle: string;
  strikePrice: number;
  underlying: string;
}

export interface ReferenceIndex {
  description: string;
  exchange: string;
  exchangeName: string;
}

export interface ReferenceMutualFund {
  cusip: string;
  description: string;
  exchange: string;
  exchangeName: string;
}

export interface ReferenceOption {
  contractType: ContractType;
  cusip: string;
  daysToExpiration: number;
  deliverables?: string;
  description: string;
  exchange: string;
  exchangeName: string;
  exerciseType: ExerciseType;
  expirationDay: number;
  expirationMonth: number;
  expirationType: ExpirationType;
  expirationYear: number;
  isPennyPilot: boolean;
  lastTradingDay: number;
  multiplier: number;
  settlementType: SettlementType;
  strikePrice: number;
  underlying: string;
}

// ============================================================================
// QUOTE TYPES
// ============================================================================

export interface QuoteEquity {
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  askMICId?: string;
  askPrice?: number;
  askSize?: number;
  askTime?: number;
  bidMICId?: string;
  bidPrice?: number;
  bidSize?: number;
  bidTime?: number;
  closePrice?: number;
  highPrice?: number;
  lastMICId?: string;
  lastPrice?: number;
  lastSize?: number;
  lowPrice?: number;
  mark?: number;
  markChange?: number;
  markPercentChange?: number;
  netChange?: number;
  netPercentChange?: number;
  openPrice?: number;
  quoteTime?: number;
  securityStatus?: string;
  totalVolume?: number;
  tradeTime?: number;
  volatility?: number;
}

export interface QuoteForex {
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  askPrice?: number;
  askSize?: number;
  bidPrice?: number;
  bidSize?: number;
  closePrice?: number;
  highPrice?: number;
  lastPrice?: number;
  lastSize?: number;
  lowPrice?: number;
  mark?: number;
  netChange?: number;
  netPercentChange?: number;
  openPrice?: number;
  quoteTime?: number;
  securityStatus?: string;
  tick?: number;
  tickAmount?: number;
  totalVolume?: number;
  tradeTime?: number;
}

export interface QuoteFuture {
  askMICId?: string;
  askPrice?: number;
  askSize?: number;
  askTime?: number;
  bidMICId?: string;
  bidPrice?: number;
  bidSize?: number;
  bidTime?: number;
  closePrice?: number;
  futurePercentChange?: number;
  highPrice?: number;
  lastMICId?: string;
  lastPrice?: number;
  lastSize?: number;
  lowPrice?: number;
  mark?: number;
  netChange?: number;
  openInterest?: number;
  openPrice?: number;
  quoteTime?: number;
  quotedInSession?: boolean;
  securityStatus?: string;
  settleTime?: number;
  tick?: number;
  tickAmount?: number;
  totalVolume?: number;
  tradeTime?: number;
}

export interface QuoteFutureOption {
  askMICId?: string;
  askPrice?: number;
  askSize?: number;
  bidMICId?: string;
  bidPrice?: number;
  bidSize?: number;
  closePrice?: number;
  highPrice?: number;
  lastMICId?: string;
  lastPrice?: number;
  lastSize?: number;
  lowPrice?: number;
  mark?: number;
  markChange?: number;
  netChange?: number;
  netPercentChange?: number;
  openInterest?: number;
  openPrice?: number;
  quoteTime?: number;
  securityStatus?: string;
  settlemetPrice?: number;
  tick?: number;
  tickAmount?: number;
  totalVolume?: number;
  tradeTime?: number;
}

export interface QuoteIndex {
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  closePrice?: number;
  highPrice?: number;
  lastPrice?: number;
  lowPrice?: number;
  netChange?: number;
  netPercentChange?: number;
  openPrice?: number;
  securityStatus?: string;
  totalVolume?: number;
  tradeTime?: number;
}

export interface QuoteMutualFund {
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  closePrice?: number;
  nAV?: number;
  netChange?: number;
  netPercentChange?: number;
  securityStatus?: string;
  totalVolume?: number;
  tradeTime?: number;
}

export interface QuoteOption {
  '52WeekHigh'?: number;
  '52WeekLow'?: number;
  askPrice?: number;
  askSize?: number;
  bidPrice?: number;
  bidSize?: number;
  closePrice?: number;
  delta?: number;
  gamma?: number;
  highPrice?: number;
  indAskPrice?: number;
  indBidPrice?: number;
  indQuoteTime?: number;
  impliedYield?: number;
  lastPrice?: number;
  lastSize?: number;
  lowPrice?: number;
  mark?: number;
  markChange?: number;
  markPercentChange?: number;
  moneyIntrinsicValue?: number;
  netChange?: number;
  netPercentChange?: number;
  openInterest?: number;
  openPrice?: number;
  quoteTime?: number;
  rho?: number;
  securityStatus?: string;
  theoreticalOptionValue?: number;
  theta?: number;
  timeValue?: number;
  totalVolume?: number;
  tradeTime?: number;
  underlyingPrice?: number;
  vega?: number;
  volatility?: number;
}

export interface ExtendedMarket {
  askPrice?: number;
  askSize?: number;
  bidPrice?: number;
  bidSize?: number;
  lastPrice?: number;
  lastSize?: number;
  mark?: number;
  quoteTime?: number;
  totalVolume?: number;
  tradeTime?: number;
}

export interface RegularMarket {
  regularMarketLastPrice?: number;
  regularMarketLastSize?: number;
  regularMarketNetChange?: number;
  regularMarketPercentChange?: number;
  regularMarketTradeTime?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface EquityResponse {
  assetMainType: AssetMainType;
  assetSubType?: EquityAssetSubType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  quoteType?: QuoteType;
  extended?: ExtendedMarket;
  fundamental?: Fundamental;
  quote?: QuoteEquity;
  reference?: ReferenceEquity;
  regular?: RegularMarket;
}

export interface ForexResponse {
  assetMainType: AssetMainType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  quote?: QuoteForex;
  reference?: ReferenceForex;
}

export interface FutureResponse {
  assetMainType: AssetMainType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  quote?: QuoteFuture;
  reference?: ReferenceFuture;
}

export interface FutureOptionResponse {
  assetMainType: AssetMainType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  quote?: QuoteFutureOption;
  reference?: ReferenceFutureOption;
}

export interface IndexResponse {
  assetMainType: AssetMainType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  quote?: QuoteIndex;
  reference?: ReferenceIndex;
}

export interface MutualFundResponse {
  assetMainType: AssetMainType;
  assetSubType?: MutualFundAssetSubType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  fundamental?: Fundamental;
  quote?: QuoteMutualFund;
  reference?: ReferenceMutualFund;
}

export interface OptionResponse {
  assetMainType: AssetMainType;
  ssid: number;
  symbol: string;
  realtime: boolean;
  quote?: QuoteOption;
  reference?: ReferenceOption;
}

export type QuoteResponseObject = 
  | EquityResponse 
  | OptionResponse 
  | ForexResponse 
  | FutureResponse 
  | FutureOptionResponse 
  | IndexResponse 
  | MutualFundResponse;

export interface QuoteResponse {
  [symbol: string]: QuoteResponseObject;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface QuoteRequest {
  cusips?: string[];
  fields?: string;
  ssids?: number[];
  symbols?: string[];
  realtime?: boolean;
  indicative?: boolean;
}

// ============================================================================
// OPTION TYPES
// ============================================================================

export interface OptionDeliverables {
  symbol: string;
  assetType: string;
  deliverableUnits: string;
  currencyType: string;
}

export interface OptionContract {
  putCall: PutCall;
  symbol: string;
  description: string;
  exchangeName: string;
  bidPrice: number;
  askPrice: number;
  lastPrice: number;
  markPrice: number;
  bidSize: number;
  askSize: number;
  lastSize: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  closePrice: number;
  totalVolume: number;
  tradeDate: number;
  quoteTimeInLong: number;
  tradeTimeInLong: number;
  netChange: number;
  volatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  timeValue: number;
  openInterest: number;
  isInTheMoney: boolean;
  theoreticalOptionValue: number;
  theoreticalVolatility: number;
  isMini: boolean;
  isNonStandard: boolean;
  optionDeliverablesList: OptionDeliverables[];
  strikePrice: number;
  expirationDate: string;
  daysToExpiration: number;
  expirationType: ExpirationType;
  lastTradingDay: number;
  multiplier: number;
  settlementType: SettlementType;
  deliverableNote?: string;
  isIndexOption: boolean;
  percentChange: number;
  markChange: number;
  markPercentChange: number;
  isPennyPilot: boolean;
  intrinsicValue: number;
  optionRoot: string;
}

export interface OptionContractMap {
  [strike: string]: OptionContract;
}

export interface OptionChainExpDateMap {
  [expiration: string]: OptionContractMap;
}

export interface Underlying {
  ask: number;
  askSize: number;
  bid: number;
  bidSize: number;
  change: number;
  close: number;
  delayed: boolean;
  description: string;
  exchangeName: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  highPrice: number;
  last: number;
  lowPrice: number;
  mark: number;
  markChange: number;
  markPercentChange: number;
  openPrice: number;
  percentChange: number;
  quoteTime: number;
  symbol: string;
  totalVolume: number;
  tradeTime: number;
}

export interface OptionChain {
  symbol: string;
  status: string;
  underlying: Underlying;
  strategy: string;
  interval: number;
  isDelayed: boolean;
  isIndex: boolean;
  daysToExpiration: number;
  interestRate: number;
  underlyingPrice: number;
  volatility: number;
  callExpDateMap: OptionChainExpDateMap;
  putExpDateMap: OptionChainExpDateMap;
}

export interface Expiration {
  daysToExpiration: number;
  expiration: string;
  expirationType: ExpirationType;
  standard: boolean;
  settlementType: SettlementType;
  optionRoots: string;
}

export interface ExpirationChain {
  status: string;
  expirationList: Expiration[];
}

// ============================================================================
// INSTRUMENTS TYPES
// ============================================================================

export interface InstrumentsResponse {
  instruments: Instrument[];
}

// ============================================================================
// MOVERS TYPES
// ============================================================================

export interface MoversResponse {
  screeners: Screener[];
}

// ============================================================================
// MARKET HOURS TYPES
// ============================================================================

export interface MarketHoursResponse {
  [marketType: string]: {
    [productCode: string]: {
      date: string;
      marketType: string;
      exchange?: string;
      category?: string;
      product: string;
      productName: string;
      isOpen: boolean;
      sessionHours: {
        preMarket?: Interval[];
        regularMarket: Interval[];
        postMarket?: Interval[];
      };
    };
  };
} 