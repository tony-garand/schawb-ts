import { SchwabOAuth } from '../auth/oauth';
import {
  // Quote types
  QuoteResponse,
  QuoteResponseObject,

  // Option types
  OptionChain,
  ExpirationChain,

  // Instrument types
  InstrumentsResponse,
  Instrument,

  // Market hours types
  MarketHoursResponse,

  // Movers types
  MoversResponse,

  // Price history types
  CandleList,
  Candle,

  // New types
  OptionDeliverables,
  Expiration,
  Screener,
} from '../types/schemas';

// Request parameter types (not in schemas)
export interface QuoteRequestParams {
  symbols?: string;
  fields?: string;
  indicative?: boolean;
}

export interface OptionChainRequestParams {
  symbol: string;
  contractType?: 'CALL' | 'PUT' | 'ALL';
  strikeCount?: number;
  includeUnderlyingQuote?: boolean;
  strategy?:
    | 'SINGLE'
    | 'ANALYTICAL'
    | 'COVERED'
    | 'VERTICAL'
    | 'CALENDAR'
    | 'STRANGLE'
    | 'STRADDLE'
    | 'BUTTERFLY'
    | 'CONDOR'
    | 'DIAGONAL'
    | 'COLLAR'
    | 'ROLL';
  interval?: number;
  strike?: number;
  range?: string;
  fromDate?: string;
  toDate?: string;
  volatility?: number;
  underlyingPrice?: number;
  interestRate?: number;
  daysToExpiration?: number;
  expMonth?:
    | 'JAN'
    | 'FEB'
    | 'MAR'
    | 'APR'
    | 'MAY'
    | 'JUN'
    | 'JUL'
    | 'AUG'
    | 'SEP'
    | 'OCT'
    | 'NOV'
    | 'DEC'
    | 'ALL';
  optionType?: string;
  entitlement?: 'PN' | 'NP' | 'PP';
}

export interface PriceHistoryRequestParams {
  symbol: string;
  periodType?: 'day' | 'month' | 'year' | 'ytd';
  period?: number;
  frequencyType?: 'minute' | 'daily' | 'weekly' | 'monthly';
  frequency?: number;
  startDate?: number; // EPOCH milliseconds
  endDate?: number; // EPOCH milliseconds
  needExtendedHoursData?: boolean;
  needPreviousClose?: boolean;
}

export interface MoversRequestParams {
  symbolId:
    | '$DJI'
    | '$COMPX'
    | '$SPX'
    | 'NYSE'
    | 'NASDAQ'
    | 'OTCBB'
    | 'INDEX_ALL'
    | 'EQUITY_ALL'
    | 'OPTION_ALL'
    | 'OPTION_PUT'
    | 'OPTION_CALL';
  sort?: 'VOLUME' | 'TRADES' | 'PERCENT_CHANGE_UP' | 'PERCENT_CHANGE_DOWN';
  frequency?: 0 | 1 | 5 | 10 | 30 | 60;
}

export interface MarketHoursRequestParams {
  markets: ('equity' | 'option' | 'bond' | 'future' | 'forex')[];
  date?: string; // YYYY-MM-DD format
}

export interface InstrumentsRequestParams {
  symbol: string;
  projection:
    | 'symbol-search'
    | 'symbol-regex'
    | 'desc-search'
    | 'desc-regex'
    | 'search'
    | 'fundamental';
}

// Type aliases for backward compatibility
export type OptionChainResponse = OptionChain;
export type OptionExpirationChainResponse = ExpirationChain;
export type PriceHistoryResponse = CandleList;
export type MarketDataCandle = Candle;
export type MarketDataQuote = QuoteResponseObject;
export type PeriodType = 'day' | 'month' | 'year' | 'ytd';
export type FrequencyType = 'minute' | 'daily' | 'weekly' | 'monthly';
export type MoversSymbolId =
  | '$DJI'
  | '$COMPX'
  | '$SPX'
  | 'NYSE'
  | 'NASDAQ'
  | 'OTCBB'
  | 'INDEX_ALL'
  | 'EQUITY_ALL'
  | 'OPTION_ALL'
  | 'OPTION_PUT'
  | 'OPTION_CALL';
export type MoversSort = 'VOLUME' | 'TRADES' | 'PERCENT_CHANGE_UP' | 'PERCENT_CHANGE_DOWN';
export type MoversFrequency = 0 | 1 | 5 | 10 | 30 | 60;
export type InstrumentProjection =
  | 'symbol-search'
  | 'symbol-regex'
  | 'desc-search'
  | 'desc-regex'
  | 'search'
  | 'fundamental';
export type MarketType = 'equity' | 'option' | 'bond' | 'future' | 'forex';
export type MarketHoursSession = {
  start: string;
  end: string;
};
export type MarketHoursSessions = {
  preMarket?: MarketHoursSession[];
  regularMarket: MarketHoursSession[];
  postMarket?: MarketHoursSession[];
};
export type MarketHoursProduct = {
  date: string;
  marketType: string;
  exchange?: string;
  category?: string;
  product: string;
  productName: string;
  isOpen: boolean;
  sessionHours: MarketHoursSessions;
};
export type OptionExpiration = Expiration;
export type OptionDeliverable = OptionDeliverables;
export type {
  MoversResponse,
  InstrumentsResponse,
  Instrument,
  MarketHoursResponse,
} from '../types/schemas';
export type { OptionContract } from '../types/schemas';
export type { OptionChainExpDateMap } from '../types/schemas';
export type Mover = Screener;
export type { QuoteResponse } from '../types/schemas';

export class MarketDataAPI {
  private oauth: SchwabOAuth;
  private baseUrl: string;

  constructor(oauth: SchwabOAuth, environment: 'sandbox' | 'production' = 'production') {
    this.oauth = oauth;
    this.baseUrl =
      environment === 'sandbox'
        ? 'https://api-sandbox.schwab.com/marketdata/v1'
        : 'https://api.schwab.com/marketdata/v1';
  }

  private async makeRequest(
    url: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: string;
    } = {}
  ): Promise<unknown> {
    const tokens = this.oauth.getTokens();
    if (!tokens?.access_token) {
      throw new Error('No valid access token available');
    }

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
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
   * Get quotes for multiple symbols
   * GET /quotes
   * @param params - Query parameters for the quotes request
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
   * @returns Promise<QuoteResponseObject> - Quote data for the symbol
   */
  public async getQuoteBySymbol(symbolId: string, fields?: string): Promise<QuoteResponseObject> {
    const queryParams = new URLSearchParams();

    if (fields) {
      queryParams.append('fields', fields);
    }

    const url = `${this.baseUrl}/${encodeURIComponent(symbolId)}/quotes?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as QuoteResponseObject;
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
   * @returns Promise<OptionChain>
   */
  public async getOptionChains(params: OptionChainRequestParams): Promise<OptionChain> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const url = `${this.baseUrl}/chains?${queryParams.toString()}`;
    const response = await this.makeRequest(url);
    return response as OptionChain;
  }

  /**
   * Get option expiration chain for a symbol
   * GET /expirationchain
   * @param symbol - The symbol to get expiration chain for
   * @returns Promise<ExpirationChain>
   */
  public async getOptionExpirationChain(symbol: string): Promise<ExpirationChain> {
    const url = `${this.baseUrl}/expirationchain?symbol=${encodeURIComponent(symbol)}`;
    const response = await this.makeRequest(url);
    return response as ExpirationChain;
  }

  /**
   * Get price history for a symbol
   * GET /pricehistory
   * @param params - Query parameters for the price history request
   * @returns Promise<CandleList>
   */
  public async getPriceHistory(params: PriceHistoryRequestParams): Promise<CandleList> {
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
    return response as CandleList;
  }

  /**
   * Get price history with convenience method for common use cases
   * @param symbol - The symbol to get price history for
   * @param periodType - The chart period type
   * @param period - The number of periods
   * @param options - Additional options
   * @returns Promise<CandleList>
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
  ): Promise<CandleList> {
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
      sort: options?.sort,
      frequency: options?.frequency,
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
  public async getMarketHoursForMarket(
    marketId: MarketType,
    date?: string
  ): Promise<MarketHoursResponse> {
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

  // ==================== Price History Convenience Methods ====================

  /**
   * Get price history with minute-by-minute data
   *
   * Returns data for up to 48 days (35 days if extended hours data is included)
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryMinute(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'day',
      frequencyType: 'minute',
      frequency: 1,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    // Default to 10 days if no date range specified
    if (!startDate && !endDate) {
      params.period = 10;
    }

    return this.getPriceHistory(params);
  }

  /**
   * Get price history with 5-minute bars
   *
   * Returns data for up to 48 days (35 days if extended hours data is included)
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryFiveMinutes(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'day',
      frequencyType: 'minute',
      frequency: 5,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    if (!startDate && !endDate) {
      params.period = 10;
    }

    return this.getPriceHistory(params);
  }

  /**
   * Get price history with 10-minute bars
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryTenMinutes(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'day',
      frequencyType: 'minute',
      frequency: 10,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    if (!startDate && !endDate) {
      params.period = 10;
    }

    return this.getPriceHistory(params);
  }

  /**
   * Get price history with 15-minute bars
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryFifteenMinutes(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'day',
      frequencyType: 'minute',
      frequency: 15,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    if (!startDate && !endDate) {
      params.period = 10;
    }

    return this.getPriceHistory(params);
  }

  /**
   * Get price history with 30-minute bars
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryThirtyMinutes(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'day',
      frequencyType: 'minute',
      frequency: 30,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    if (!startDate && !endDate) {
      params.period = 10;
    }

    return this.getPriceHistory(params);
  }

  /**
   * Get price history with daily bars
   *
   * Returns up to 20 years of daily data
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryDay(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'year',
      frequencyType: 'daily',
      frequency: 1,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    if (!startDate && !endDate) {
      params.period = 20; // 20 years of daily data
    }

    return this.getPriceHistory(params);
  }

  /**
   * Get price history with weekly bars
   *
   * Returns up to 20 years of weekly data
   *
   * @param symbol - The symbol to get price history for
   * @param startDate - Optional start date (epoch milliseconds or Date)
   * @param endDate - Optional end date (epoch milliseconds or Date)
   * @param needExtendedHoursData - Include extended hours data (default: true)
   * @returns Promise<CandleList>
   */
  public async getPriceHistoryEveryWeek(
    symbol: string,
    startDate?: number | Date,
    endDate?: number | Date,
    needExtendedHoursData: boolean = true
  ): Promise<CandleList> {
    const params: PriceHistoryRequestParams = {
      symbol,
      periodType: 'year',
      frequencyType: 'weekly',
      frequency: 1,
      needExtendedHoursData,
    };

    if (startDate) {
      params.startDate = typeof startDate === 'number' ? startDate : startDate.getTime();
    }
    if (endDate) {
      params.endDate = typeof endDate === 'number' ? endDate : endDate.getTime();
    }

    if (!startDate && !endDate) {
      params.period = 20; // 20 years of weekly data
    }

    return this.getPriceHistory(params);
  }
}
