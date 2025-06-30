import { SchwabOAuth } from '../auth/oauth';

// Market Data Types
export interface MarketDataQuote {
  symbol: string;
  empty: boolean;
  previousClose: number;
  previousCloseDate: number;
  candles: MarketDataCandle[];
}

export interface MarketDataCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  datetime: number;
}

export interface QuoteResponse {
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
      contractType?: string;
      daysToExpiration?: number;
      expirationDay?: number;
      expirationMonth?: number;
      expirationYear?: number;
      isPennyPilot?: boolean;
      lastTradingDay?: number;
      multiplier?: number;
      settlementType?: string;
      strikePrice?: number;
      underlying?: string;
      uvExpirationType?: string;
      otcMarketTier?: string;
      futureActiveSymbol?: string;
      futureExpirationDate?: number;
      futureIsActive?: boolean;
      futureIsTradable?: boolean;
      futureMultiplier?: number;
      futurePriceFormat?: string;
      futureSettlementPrice?: number;
      futureTradingHours?: string;
      product?: string;
      isTradable?: boolean;
      marketMaker?: string;
      tradingHours?: string;
    };
    quote: {
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
      nAV?: number;
      delta?: number;
      gamma?: number;
      impliedYield?: number;
      indAskPrice?: number;
      indBidPrice?: number;
      indQuoteTime?: number;
      moneyIntrinsicValue?: number;
      openInterest?: number;
      rho?: number;
      theoreticalOptionValue?: number;
      theta?: number;
      timeValue?: number;
      underlyingPrice?: number;
      vega?: number;
      futurePercentChange?: number;
      settleTime?: number;
      tick?: number;
      tickAmount?: number;
    };
    regular?: {
      regularMarketLastPrice?: number;
      regularMarketLastSize?: number;
      regularMarketNetChange?: number;
      regularMarketPercentChange?: number;
      regularMarketTradeTime?: number;
    };
    fundamental?: {
      avg10DaysVolume?: number;
      avg1YearVolume?: number;
      declarationDate?: string;
      divAmount?: number;
      divExDate?: string;
      divFreq?: number;
      divPayAmount?: number;
      divPayDate?: string;
      divYield?: number;
      eps?: number;
      fundLeverageFactor?: number;
      nextDivExDate?: string;
      nextDivPayDate?: string;
      peRatio?: number;
      fundStrategy?: string;
    };
  };
}

export interface QuoteRequestParams {
  symbols?: string;
  fields?: string;
  indicative?: boolean;
}

// Option Chains Types
export interface OptionChainRequestParams {
  symbol: string;
  contractType?: 'CALL' | 'PUT' | 'ALL';
  strikeCount?: number;
  includeUnderlyingQuote?: boolean;
  strategy?: 'SINGLE' | 'ANALYTICAL' | 'COVERED' | 'VERTICAL' | 'CALENDAR' | 'STRANGLE' | 'STRADDLE' | 'BUTTERFLY' | 'CONDOR' | 'DIAGONAL' | 'COLLAR' | 'ROLL';
  interval?: number;
  strike?: number;
  range?: string;
  fromDate?: string;
  toDate?: string;
  volatility?: number;
  underlyingPrice?: number;
  interestRate?: number;
  daysToExpiration?: number;
  expMonth?: 'JAN'|'FEB'|'MAR'|'APR'|'MAY'|'JUN'|'JUL'|'AUG'|'SEP'|'OCT'|'NOV'|'DEC'|'ALL';
  optionType?: string;
  entitlement?: 'PN'|'NP'|'PP';
}

export interface OptionDeliverable {
  symbol: string;
  assetType: string;
  deliverableUnits: string;
  currencyType: string;
}

export interface OptionContract {
  putCall: 'PUT' | 'CALL';
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
  optionDeliverablesList: OptionDeliverable[];
  strikePrice: number;
  expirationDate: string;
  daysToExpiration: number;
  expirationType: string;
  lastTradingDay: number;
  multiplier: number;
  settlementType: string;
  deliverableNote: string;
  isIndexOption: boolean;
  percentChange: number;
  markChange: number;
  markPercentChange: number;
  isPennyPilot: boolean;
  intrinsicValue: number;
  optionRoot: string;
}

export interface OptionChainExpDateMap {
  [expiration: string]: {
    [strike: string]: OptionContract;
  };
}

export interface OptionChainResponse {
  symbol: string;
  status: string;
  underlying: {
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
  };
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

// Option Expiration Chain Types
export interface OptionExpiration {
  expirationDate: string;
  daysToExpiration: number;
  expirationType: string;
  standard: boolean;
}

export interface OptionExpirationChainResponse {
  expirationList: OptionExpiration[];
}

// Price History Types
export type PeriodType = 'day' | 'month' | 'year' | 'ytd';
export type FrequencyType = 'minute' | 'daily' | 'weekly' | 'monthly';

export interface PriceHistoryRequestParams {
  symbol: string;
  periodType?: PeriodType;
  period?: number;
  frequencyType?: FrequencyType;
  frequency?: number;
  startDate?: number; // EPOCH milliseconds
  endDate?: number; // EPOCH milliseconds
  needExtendedHoursData?: boolean;
  needPreviousClose?: boolean;
}

export interface PriceHistoryResponse {
  symbol: string;
  empty: boolean;
  previousClose: number;
  previousCloseDate: number;
  candles: MarketDataCandle[];
}

// Movers Types
export type MoversSymbolId = '$DJI' | '$COMPX' | '$SPX' | 'NYSE' | 'NASDAQ' | 'OTCBB' | 'INDEX_ALL' | 'EQUITY_ALL' | 'OPTION_ALL' | 'OPTION_PUT' | 'OPTION_CALL';
export type MoversSort = 'VOLUME' | 'TRADES' | 'PERCENT_CHANGE_UP' | 'PERCENT_CHANGE_DOWN';
export type MoversFrequency = 0 | 1 | 5 | 10 | 30 | 60;

export interface MoversRequestParams {
  symbolId: MoversSymbolId;
  sort?: MoversSort;
  frequency?: MoversFrequency;
}

export interface Mover {
  change: number;
  description: string;
  direction: 'up' | 'down';
  last: number;
  symbol: string;
  totalVolume: number;
}

export interface MoversResponse {
  screeners: Mover[];
}

// Market Hours Types
export type MarketType = 'equity' | 'option' | 'bond' | 'future' | 'forex';

export interface MarketHoursRequestParams {
  markets: MarketType[];
  date?: string; // YYYY-MM-DD format
}

export interface MarketHoursSession {
  start: string;
  end: string;
}

export interface MarketHoursSessions {
  preMarket?: MarketHoursSession[];
  regularMarket: MarketHoursSession[];
  postMarket?: MarketHoursSession[];
}

export interface MarketHoursProduct {
  date: string;
  marketType: string;
  exchange?: string;
  category?: string;
  product: string;
  productName: string;
  isOpen: boolean;
  sessionHours: MarketHoursSessions;
}

export interface MarketHoursResponse {
  [marketType: string]: {
    [productCode: string]: MarketHoursProduct;
  };
}

// Instruments Types
export type InstrumentProjection = 'symbol-search' | 'symbol-regex' | 'desc-search' | 'desc-regex' | 'search' | 'fundamental';

export interface InstrumentsRequestParams {
  symbol: string;
  projection: InstrumentProjection;
}

export interface Instrument {
  cusip: string;
  symbol: string;
  description: string;
  exchange: string;
  assetType: string;
}

export interface InstrumentsResponse {
  instruments: Instrument[];
}

export class MarketDataAPI {
  private oauth: SchwabOAuth;
  private baseUrl: string;

  constructor(oauth: SchwabOAuth, environment: 'sandbox' | 'production' = 'production') {
    this.oauth = oauth;
    this.baseUrl = environment === 'sandbox' 
      ? 'https://api.schwabapi.com/marketdata/v1/sandbox' 
      : 'https://api.schwabapi.com/marketdata/v1';
  }

  private async makeRequest(url: string, options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}): Promise<unknown> {
    const authHeader = await this.oauth.getAuthorizationHeader();
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      body: options.body,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  /**
   * Get quotes by list of symbols
   * GET /quotes
   * 
   * @param params - Query parameters for the quote request
   * @returns Promise<QuoteResponse> - Object with symbol keys and quote data
   */
  public async getQuotes(params: QuoteRequestParams): Promise<QuoteResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.symbols) {
      queryParams.append('symbols', params.symbols);
    }
    
    if (params.fields) {
      queryParams.append('fields', params.fields);
    }
    
    if (params.indicative !== undefined) {
      queryParams.append('indicative', params.indicative.toString());
    }

    const url = `${this.baseUrl}/quotes?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as QuoteResponse;
  }

  /**
   * Get quote by single symbol
   * GET /{symbol_id}/quotes
   * 
   * @param symbolId - The symbol to get quote for
   * @param fields - Optional comma-separated list of fields to include
   * @returns Promise<MarketDataQuote> - Quote data for the symbol
   */
  public async getQuoteBySymbol(symbolId: string, fields?: string): Promise<MarketDataQuote> {
    const queryParams = new URLSearchParams();
    
    if (fields) {
      queryParams.append('fields', fields);
    }

    const url = `${this.baseUrl}/${encodeURIComponent(symbolId)}/quotes?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as MarketDataQuote;
  }

  /**
   * Get quotes for multiple symbols with convenience method
   * 
   * @param symbols - Array of symbols to get quotes for
   * @param options - Optional parameters for the request
   * @returns Promise<QuoteResponse> - Object with symbol keys and quote data
   */
  public async getQuotesForSymbols(
    symbols: string[], 
    options?: {
      fields?: string;
      indicative?: boolean;
    }
  ): Promise<QuoteResponse> {
    const symbolsString = symbols.join(',');
    return this.getQuotes({
      symbols: symbolsString,
      fields: options?.fields,
      indicative: options?.indicative,
    });
  }

  /**
   * Get option chains for a symbol
   * GET /chains
   * @param params - Query parameters for the option chain request
   * @returns Promise<OptionChainResponse>
   */
  public async getOptionChains(params: OptionChainRequestParams): Promise<OptionChainResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const url = `${this.baseUrl}/chains?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as OptionChainResponse;
  }

  /**
   * Get option expiration chain for a symbol
   * GET /expirationchain
   * @param symbol - The symbol to get expiration chain for
   * @returns Promise<OptionExpirationChainResponse>
   */
  public async getOptionExpirationChain(symbol: string): Promise<OptionExpirationChainResponse> {
    const url = `${this.baseUrl}/expirationchain?symbol=${encodeURIComponent(symbol)}`;
    const response = await this.makeRequest(url);
    return response as OptionExpirationChainResponse;
  }

  /**
   * Get price history for a symbol
   * GET /pricehistory
   * @param params - Query parameters for the price history request
   * @returns Promise<PriceHistoryResponse>
   */
  public async getPriceHistory(params: PriceHistoryRequestParams): Promise<PriceHistoryResponse> {
    const queryParams = new URLSearchParams();
    
    // Required parameter
    queryParams.append('symbol', params.symbol);
    
    // Optional parameters
    if (params.periodType) {
      queryParams.append('periodType', params.periodType);
    }
    
    if (params.period !== undefined) {
      queryParams.append('period', params.period.toString());
    }
    
    if (params.frequencyType) {
      queryParams.append('frequencyType', params.frequencyType);
    }
    
    if (params.frequency !== undefined) {
      queryParams.append('frequency', params.frequency.toString());
    }
    
    if (params.startDate !== undefined) {
      queryParams.append('startDate', params.startDate.toString());
    }
    
    if (params.endDate !== undefined) {
      queryParams.append('endDate', params.endDate.toString());
    }
    
    if (params.needExtendedHoursData !== undefined) {
      queryParams.append('needExtendedHoursData', params.needExtendedHoursData.toString());
    }
    
    if (params.needPreviousClose !== undefined) {
      queryParams.append('needPreviousClose', params.needPreviousClose.toString());
    }

    const url = `${this.baseUrl}/pricehistory?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as PriceHistoryResponse;
  }

  /**
   * Get price history with convenience method for common use cases
   * @param symbol - The symbol to get price history for
   * @param periodType - The chart period type
   * @param period - The number of periods
   * @param options - Additional options
   * @returns Promise<PriceHistoryResponse>
   */
  public async getPriceHistoryForSymbol(
    symbol: string,
    periodType: PeriodType = 'day',
    period: number = 10,
    options?: {
      frequencyType?: FrequencyType;
      frequency?: number;
      startDate?: number;
      endDate?: number;
      needExtendedHoursData?: boolean;
      needPreviousClose?: boolean;
    }
  ): Promise<PriceHistoryResponse> {
    return this.getPriceHistory({
      symbol,
      periodType,
      period,
      ...options,
    });
  }

  /**
   * Get movers for a specific index
   * GET /movers/{symbol_id}
   * @param params - Query parameters for the movers request
   * @returns Promise<MoversResponse>
   */
  public async getMovers(params: MoversRequestParams): Promise<MoversResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.sort) {
      queryParams.append('sort', params.sort);
    }
    
    if (params.frequency !== undefined) {
      queryParams.append('frequency', params.frequency.toString());
    }

    const url = `${this.baseUrl}/movers/${encodeURIComponent(params.symbolId)}?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as MoversResponse;
  }

  /**
   * Get movers with convenience method
   * @param symbolId - The index symbol to get movers for
   * @param options - Optional parameters for sorting and frequency
   * @returns Promise<MoversResponse>
   */
  public async getMoversForIndex(
    symbolId: MoversSymbolId,
    options?: {
      sort?: MoversSort;
      frequency?: MoversFrequency;
    }
  ): Promise<MoversResponse> {
    return this.getMovers({
      symbolId,
      ...options,
    });
  }

  /**
   * Get market hours for multiple markets
   * GET /markets
   * @param params - Query parameters for the market hours request
   * @returns Promise<MarketHoursResponse>
   */
  public async getMarketHours(params: MarketHoursRequestParams): Promise<MarketHoursResponse> {
    const queryParams = new URLSearchParams();
    
    // Required parameter - join markets array with comma
    queryParams.append('markets', params.markets.join(','));
    
    if (params.date) {
      queryParams.append('date', params.date);
    }

    const url = `${this.baseUrl}/markets?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as MarketHoursResponse;
  }

  /**
   * Get market hours for a single market
   * GET /markets/{market_id}
   * @param marketId - The market ID to get hours for
   * @param date - Optional date in YYYY-MM-DD format
   * @returns Promise<MarketHoursResponse>
   */
  public async getMarketHoursForMarket(marketId: MarketType, date?: string): Promise<MarketHoursResponse> {
    const queryParams = new URLSearchParams();
    
    if (date) {
      queryParams.append('date', date);
    }

    const url = `${this.baseUrl}/markets/${encodeURIComponent(marketId)}?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as MarketHoursResponse;
  }

  /**
   * Get market hours with convenience method for common markets
   * @param markets - Array of markets to get hours for
   * @param date - Optional date in YYYY-MM-DD format
   * @returns Promise<MarketHoursResponse>
   */
  public async getMarketHoursForMarkets(
    markets: MarketType[],
    date?: string
  ): Promise<MarketHoursResponse> {
    return this.getMarketHours({ markets, date });
  }

  /**
   * Get instruments by symbols and projections
   * GET /instruments
   * @param params - Query parameters for the instruments request
   * @returns Promise<InstrumentsResponse>
   */
  public async getInstruments(params: InstrumentsRequestParams): Promise<InstrumentsResponse> {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('symbol', params.symbol);
    queryParams.append('projection', params.projection);

    const url = `${this.baseUrl}/instruments?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as InstrumentsResponse;
  }

  /**
   * Get instrument by specific CUSIP
   * GET /instruments/{cusip_id}
   * @param cusipId - The CUSIP of the security
   * @returns Promise<Instrument>
   */
  public async getInstrumentByCusip(cusipId: string): Promise<Instrument> {
    const url = `${this.baseUrl}/instruments/${encodeURIComponent(cusipId)}`;
    const response = await this.makeRequest(url);
    return response as Instrument;
  }

  /**
   * Get instruments with convenience method for symbol search
   * @param symbol - The symbol to search for
   * @param projection - The projection type (defaults to 'symbol-search')
   * @returns Promise<InstrumentsResponse>
   */
  public async searchInstruments(
    symbol: string,
    projection: InstrumentProjection = 'symbol-search'
  ): Promise<InstrumentsResponse> {
    return this.getInstruments({ symbol, projection });
  }

  /**
   * Get instruments with fundamental projection
   * @param symbol - The symbol to get fundamental data for
   * @returns Promise<InstrumentsResponse>
   */
  public async getFundamentalInstruments(symbol: string): Promise<InstrumentsResponse> {
    return this.getInstruments({ symbol, projection: 'fundamental' });
  }
} 