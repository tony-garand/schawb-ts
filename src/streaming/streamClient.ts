import WebSocket = require('ws');
import { SchwabClient } from '../client';

/**
 * Field enums for Level One Equity quotes (LEVELONE_EQUITIES)
 * Based on official Schwab Streamer API documentation
 */
export enum LevelOneEquityFields {
  SYMBOL = 0,
  BID_PRICE = 1,
  ASK_PRICE = 2,
  LAST_PRICE = 3,
  BID_SIZE = 4,
  ASK_SIZE = 5,
  ASK_ID = 6,
  BID_ID = 7,
  TOTAL_VOLUME = 8,
  LAST_SIZE = 9,
  HIGH_PRICE = 10,
  LOW_PRICE = 11,
  CLOSE_PRICE = 12,
  EXCHANGE_ID = 13,
  MARGINABLE = 14,
  DESCRIPTION = 15,
  LAST_ID = 16,
  OPEN_PRICE = 17,
  NET_CHANGE = 18,
  HIGH_52_WEEK = 19,
  LOW_52_WEEK = 20,
  PE_RATIO = 21,
  DIVIDEND_AMOUNT = 22,
  DIVIDEND_YIELD = 23,
  NAV = 24,
  EXCHANGE_NAME = 25,
  DIVIDEND_DATE = 26,
  REGULAR_MARKET_QUOTE = 27,
  REGULAR_MARKET_TRADE = 28,
  REGULAR_MARKET_LAST_PRICE = 29,
  REGULAR_MARKET_LAST_SIZE = 30,
  REGULAR_MARKET_NET_CHANGE = 31,
  SECURITY_STATUS = 32,
  MARK_PRICE = 33,
  QUOTE_TIME_IN_LONG = 34,
  TRADE_TIME_IN_LONG = 35,
  REGULAR_MARKET_TRADE_TIME_IN_LONG = 36,
  BID_TIME = 37,
  ASK_TIME = 38,
  ASK_MIC_ID = 39,
  BID_MIC_ID = 40,
  LAST_MIC_ID = 41,
  NET_PERCENT_CHANGE = 42,
  REGULAR_MARKET_PERCENT_CHANGE = 43,
  MARK_PRICE_NET_CHANGE = 44,
  MARK_PRICE_PERCENT_CHANGE = 45,
  HARD_TO_BORROW_QUANTITY = 46,
  HARD_TO_BORROW_RATE = 47,
  HARD_TO_BORROW = 48,
  SHORTABLE = 49,
  POST_MARKET_NET_CHANGE = 50,
  POST_MARKET_PERCENT_CHANGE = 51,
}

/**
 * Field enums for Level One Option quotes (LEVELONE_OPTIONS)
 */
export enum LevelOneOptionFields {
  SYMBOL = 0,
  DESCRIPTION = 1,
  BID_PRICE = 2,
  ASK_PRICE = 3,
  LAST_PRICE = 4,
  HIGH_PRICE = 5,
  LOW_PRICE = 6,
  CLOSE_PRICE = 7,
  TOTAL_VOLUME = 8,
  OPEN_INTEREST = 9,
  VOLATILITY = 10,
  MONEY_INTRINSIC_VALUE = 11,
  EXPIRATION_YEAR = 12,
  MULTIPLIER = 13,
  DIGITS = 14,
  OPEN_PRICE = 15,
  BID_SIZE = 16,
  ASK_SIZE = 17,
  LAST_SIZE = 18,
  NET_CHANGE = 19,
  STRIKE_PRICE = 20,
  CONTRACT_TYPE = 21,
  UNDERLYING = 22,
  EXPIRATION_MONTH = 23,
  DELIVERABLES = 24,
  TIME_VALUE = 25,
  EXPIRATION_DAY = 26,
  DAYS_TO_EXPIRATION = 27,
  DELTA = 28,
  GAMMA = 29,
  THETA = 30,
  VEGA = 31,
  RHO = 32,
  SECURITY_STATUS = 33,
  THEORETICAL_OPTION_VALUE = 34,
  UNDERLYING_PRICE = 35,
  UV_EXPIRATION_TYPE = 36,
  MARK_PRICE = 37,
  QUOTE_TIME_IN_LONG = 38,
  TRADE_TIME_IN_LONG = 39,
  EXCHANGE = 40,
  EXCHANGE_NAME = 41,
  LAST_TRADING_DAY = 42,
  SETTLEMENT_TYPE = 43,
  NET_PERCENT_CHANGE = 44,
  MARK_PRICE_NET_CHANGE = 45,
  MARK_PRICE_PERCENT_CHANGE = 46,
  IMPLIED_YIELD = 47,
  IS_PENNY_PILOT = 48,
  OPTION_ROOT = 49,
  HIGH_52_WEEK = 50,
  LOW_52_WEEK = 51,
  INDICATIVE_ASK_PRICE = 52,
  INDICATIVE_BID_PRICE = 53,
  INDICATIVE_QUOTE_TIME = 54,
  EXERCISE_TYPE = 55,
}

/**
 * Field enums for Level One Futures quotes (LEVELONE_FUTURES)
 */
export enum LevelOneFuturesFields {
  SYMBOL = 0,
  BID_PRICE = 1,
  ASK_PRICE = 2,
  LAST_PRICE = 3,
  BID_SIZE = 4,
  ASK_SIZE = 5,
  BID_ID = 6,
  ASK_ID = 7,
  TOTAL_VOLUME = 8,
  LAST_SIZE = 9,
  QUOTE_TIME = 10,
  TRADE_TIME = 11,
  HIGH_PRICE = 12,
  LOW_PRICE = 13,
  CLOSE_PRICE = 14,
  EXCHANGE_ID = 15,
  DESCRIPTION = 16,
  LAST_ID = 17,
  OPEN_PRICE = 18,
  NET_CHANGE = 19,
  FUTURE_PERCENT_CHANGE = 20,
  EXCHANGE_NAME = 21,
  SECURITY_STATUS = 22,
  OPEN_INTEREST = 23,
  MARK = 24,
  TICK = 25,
  TICK_AMOUNT = 26,
  PRODUCT = 27,
  FUTURE_PRICE_FORMAT = 28,
  FUTURE_TRADING_HOURS = 29,
  FUTURE_IS_TRADABLE = 30,
  FUTURE_MULTIPLIER = 31,
  FUTURE_IS_ACTIVE = 32,
  FUTURE_SETTLEMENT_PRICE = 33,
  FUTURE_ACTIVE_SYMBOL = 34,
  FUTURE_EXPIRATION_DATE = 35,
  EXPIRATION_STYLE = 36,
  ASK_TIME = 37,
  BID_TIME = 38,
  QUOTED_IN_SESSION = 39,
  SETTLEMENT_DATE = 40,
}

/**
 * Field enums for Level One Futures Options quotes (LEVELONE_FUTURES_OPTIONS)
 */
export enum LevelOneFuturesOptionsFields {
  SYMBOL = 0,
  BID_PRICE = 1,
  ASK_PRICE = 2,
  LAST_PRICE = 3,
  BID_SIZE = 4,
  ASK_SIZE = 5,
  BID_ID = 6,
  ASK_ID = 7,
  TOTAL_VOLUME = 8,
  LAST_SIZE = 9,
  QUOTE_TIME = 10,
  TRADE_TIME = 11,
  HIGH_PRICE = 12,
  LOW_PRICE = 13,
  CLOSE_PRICE = 14,
  LAST_ID = 15,
  DESCRIPTION = 16,
  OPEN_PRICE = 17,
  OPEN_INTEREST = 18,
  MARK = 19,
  TICK = 20,
  TICK_AMOUNT = 21,
  FUTURE_MULTIPLIER = 22,
  FUTURE_SETTLEMENT_PRICE = 23,
  UNDERLYING_SYMBOL = 24,
  STRIKE_PRICE = 25,
  FUTURE_EXPIRATION_DATE = 26,
  EXPIRATION_STYLE = 27,
  CONTRACT_TYPE = 28,
  SECURITY_STATUS = 29,
  EXCHANGE = 30,
  EXCHANGE_NAME = 31,
}

/**
 * Field enums for Level One Forex quotes (LEVELONE_FOREX)
 */
export enum LevelOneForexFields {
  SYMBOL = 0,
  BID_PRICE = 1,
  ASK_PRICE = 2,
  LAST_PRICE = 3,
  BID_SIZE = 4,
  ASK_SIZE = 5,
  TOTAL_VOLUME = 6,
  LAST_SIZE = 7,
  QUOTE_TIME = 8,
  TRADE_TIME = 9,
  HIGH_PRICE = 10,
  LOW_PRICE = 11,
  CLOSE_PRICE = 12,
  EXCHANGE = 13,
  DESCRIPTION = 14,
  OPEN_PRICE = 15,
  NET_CHANGE = 16,
  PERCENT_CHANGE = 17,
  EXCHANGE_NAME = 18,
  DIGITS = 19,
  SECURITY_STATUS = 20,
  TICK = 21,
  TICK_AMOUNT = 22,
  PRODUCT = 23,
  TRADING_HOURS = 24,
  IS_TRADABLE = 25,
  MARKET_MAKER = 26,
  HIGH_52_WEEK = 27,
  LOW_52_WEEK = 28,
  MARK = 29,
}

/**
 * Field enums for Chart Equity data (CHART_EQUITY)
 */
export enum ChartEquityFields {
  KEY = 0,
  OPEN_PRICE = 1,
  HIGH_PRICE = 2,
  LOW_PRICE = 3,
  CLOSE_PRICE = 4,
  VOLUME = 5,
  SEQUENCE = 6,
  CHART_TIME = 7,
  CHART_DAY = 8,
}

/**
 * Field enums for Chart Futures data (CHART_FUTURES)
 */
export enum ChartFuturesFields {
  KEY = 0,
  CHART_TIME = 1,
  OPEN_PRICE = 2,
  HIGH_PRICE = 3,
  LOW_PRICE = 4,
  CLOSE_PRICE = 5,
  VOLUME = 6,
}

/**
 * Field enums for Screener data (SCREENER_EQUITY, SCREENER_OPTION)
 */
export enum ScreenerFields {
  SYMBOL = 0,
  TIMESTAMP = 1,
  SORT_FIELD = 2,
  FREQUENCY = 3,
  ITEMS = 4,
}

/**
 * Field enums for Account Activity (ACCT_ACTIVITY)
 */
export enum AccountActivityFields {
  SUBSCRIPTION_KEY = 0,
  ACCOUNT = 1,
  MESSAGE_TYPE = 2,
  MESSAGE_DATA = 3,
}

/**
 * Field enums for Book data (NYSE_BOOK, NASDAQ_BOOK, OPTIONS_BOOK)
 */
export enum BookFields {
  SYMBOL = 0,
  MARKET_SNAPSHOT_TIME = 1,
  BID_SIDE_LEVELS = 2,
  ASK_SIDE_LEVELS = 3,
}

// Field label mappings for relabeling numeric keys to human-readable strings
const LEVEL_ONE_EQUITY_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'BID_PRICE',
  2: 'ASK_PRICE',
  3: 'LAST_PRICE',
  4: 'BID_SIZE',
  5: 'ASK_SIZE',
  6: 'ASK_ID',
  7: 'BID_ID',
  8: 'TOTAL_VOLUME',
  9: 'LAST_SIZE',
  10: 'HIGH_PRICE',
  11: 'LOW_PRICE',
  12: 'CLOSE_PRICE',
  13: 'EXCHANGE_ID',
  14: 'MARGINABLE',
  15: 'DESCRIPTION',
  16: 'LAST_ID',
  17: 'OPEN_PRICE',
  18: 'NET_CHANGE',
  19: 'HIGH_52_WEEK',
  20: 'LOW_52_WEEK',
  21: 'PE_RATIO',
  22: 'DIVIDEND_AMOUNT',
  23: 'DIVIDEND_YIELD',
  24: 'NAV',
  25: 'EXCHANGE_NAME',
  26: 'DIVIDEND_DATE',
  27: 'REGULAR_MARKET_QUOTE',
  28: 'REGULAR_MARKET_TRADE',
  29: 'REGULAR_MARKET_LAST_PRICE',
  30: 'REGULAR_MARKET_LAST_SIZE',
  31: 'REGULAR_MARKET_NET_CHANGE',
  32: 'SECURITY_STATUS',
  33: 'MARK_PRICE',
  34: 'QUOTE_TIME_IN_LONG',
  35: 'TRADE_TIME_IN_LONG',
  36: 'REGULAR_MARKET_TRADE_TIME_IN_LONG',
  37: 'BID_TIME',
  38: 'ASK_TIME',
  39: 'ASK_MIC_ID',
  40: 'BID_MIC_ID',
  41: 'LAST_MIC_ID',
  42: 'NET_PERCENT_CHANGE',
  43: 'REGULAR_MARKET_PERCENT_CHANGE',
  44: 'MARK_PRICE_NET_CHANGE',
  45: 'MARK_PRICE_PERCENT_CHANGE',
  46: 'HARD_TO_BORROW_QUANTITY',
  47: 'HARD_TO_BORROW_RATE',
  48: 'HARD_TO_BORROW',
  49: 'SHORTABLE',
  50: 'POST_MARKET_NET_CHANGE',
  51: 'POST_MARKET_PERCENT_CHANGE',
};

const CHART_EQUITY_FIELD_LABELS: Record<number, string> = {
  0: 'KEY',
  1: 'OPEN_PRICE',
  2: 'HIGH_PRICE',
  3: 'LOW_PRICE',
  4: 'CLOSE_PRICE',
  5: 'VOLUME',
  6: 'SEQUENCE',
  7: 'CHART_TIME',
  8: 'CHART_DAY',
};

const CHART_FUTURES_FIELD_LABELS: Record<number, string> = {
  0: 'KEY',
  1: 'CHART_TIME',
  2: 'OPEN_PRICE',
  3: 'HIGH_PRICE',
  4: 'LOW_PRICE',
  5: 'CLOSE_PRICE',
  6: 'VOLUME',
};

const LEVEL_ONE_OPTION_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'DESCRIPTION',
  2: 'BID_PRICE',
  3: 'ASK_PRICE',
  4: 'LAST_PRICE',
  5: 'HIGH_PRICE',
  6: 'LOW_PRICE',
  7: 'CLOSE_PRICE',
  8: 'TOTAL_VOLUME',
  9: 'OPEN_INTEREST',
  10: 'VOLATILITY',
  11: 'MONEY_INTRINSIC_VALUE',
  12: 'EXPIRATION_YEAR',
  13: 'MULTIPLIER',
  14: 'DIGITS',
  15: 'OPEN_PRICE',
  16: 'BID_SIZE',
  17: 'ASK_SIZE',
  18: 'LAST_SIZE',
  19: 'NET_CHANGE',
  20: 'STRIKE_PRICE',
  21: 'CONTRACT_TYPE',
  22: 'UNDERLYING',
  23: 'EXPIRATION_MONTH',
  24: 'DELIVERABLES',
  25: 'TIME_VALUE',
  26: 'EXPIRATION_DAY',
  27: 'DAYS_TO_EXPIRATION',
  28: 'DELTA',
  29: 'GAMMA',
  30: 'THETA',
  31: 'VEGA',
  32: 'RHO',
  33: 'SECURITY_STATUS',
  34: 'THEORETICAL_OPTION_VALUE',
  35: 'UNDERLYING_PRICE',
  36: 'UV_EXPIRATION_TYPE',
  37: 'MARK_PRICE',
  38: 'QUOTE_TIME_IN_LONG',
  39: 'TRADE_TIME_IN_LONG',
  40: 'EXCHANGE',
  41: 'EXCHANGE_NAME',
  42: 'LAST_TRADING_DAY',
  43: 'SETTLEMENT_TYPE',
  44: 'NET_PERCENT_CHANGE',
  45: 'MARK_PRICE_NET_CHANGE',
  46: 'MARK_PRICE_PERCENT_CHANGE',
  47: 'IMPLIED_YIELD',
  48: 'IS_PENNY_PILOT',
  49: 'OPTION_ROOT',
  50: 'HIGH_52_WEEK',
  51: 'LOW_52_WEEK',
  52: 'INDICATIVE_ASK_PRICE',
  53: 'INDICATIVE_BID_PRICE',
  54: 'INDICATIVE_QUOTE_TIME',
  55: 'EXERCISE_TYPE',
};

const LEVEL_ONE_FUTURES_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'BID_PRICE',
  2: 'ASK_PRICE',
  3: 'LAST_PRICE',
  4: 'BID_SIZE',
  5: 'ASK_SIZE',
  6: 'BID_ID',
  7: 'ASK_ID',
  8: 'TOTAL_VOLUME',
  9: 'LAST_SIZE',
  10: 'QUOTE_TIME',
  11: 'TRADE_TIME',
  12: 'HIGH_PRICE',
  13: 'LOW_PRICE',
  14: 'CLOSE_PRICE',
  15: 'EXCHANGE_ID',
  16: 'DESCRIPTION',
  17: 'LAST_ID',
  18: 'OPEN_PRICE',
  19: 'NET_CHANGE',
  20: 'FUTURE_PERCENT_CHANGE',
  21: 'EXCHANGE_NAME',
  22: 'SECURITY_STATUS',
  23: 'OPEN_INTEREST',
  24: 'MARK',
  25: 'TICK',
  26: 'TICK_AMOUNT',
  27: 'PRODUCT',
  28: 'FUTURE_PRICE_FORMAT',
  29: 'FUTURE_TRADING_HOURS',
  30: 'FUTURE_IS_TRADABLE',
  31: 'FUTURE_MULTIPLIER',
  32: 'FUTURE_IS_ACTIVE',
  33: 'FUTURE_SETTLEMENT_PRICE',
  34: 'FUTURE_ACTIVE_SYMBOL',
  35: 'FUTURE_EXPIRATION_DATE',
  36: 'EXPIRATION_STYLE',
  37: 'ASK_TIME',
  38: 'BID_TIME',
  39: 'QUOTED_IN_SESSION',
  40: 'SETTLEMENT_DATE',
};

const LEVEL_ONE_FUTURES_OPTIONS_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'BID_PRICE',
  2: 'ASK_PRICE',
  3: 'LAST_PRICE',
  4: 'BID_SIZE',
  5: 'ASK_SIZE',
  6: 'BID_ID',
  7: 'ASK_ID',
  8: 'TOTAL_VOLUME',
  9: 'LAST_SIZE',
  10: 'QUOTE_TIME',
  11: 'TRADE_TIME',
  12: 'HIGH_PRICE',
  13: 'LOW_PRICE',
  14: 'CLOSE_PRICE',
  15: 'LAST_ID',
  16: 'DESCRIPTION',
  17: 'OPEN_PRICE',
  18: 'OPEN_INTEREST',
  19: 'MARK',
  20: 'TICK',
  21: 'TICK_AMOUNT',
  22: 'FUTURE_MULTIPLIER',
  23: 'FUTURE_SETTLEMENT_PRICE',
  24: 'UNDERLYING_SYMBOL',
  25: 'STRIKE_PRICE',
  26: 'FUTURE_EXPIRATION_DATE',
  27: 'EXPIRATION_STYLE',
  28: 'CONTRACT_TYPE',
  29: 'SECURITY_STATUS',
  30: 'EXCHANGE',
  31: 'EXCHANGE_NAME',
};

const LEVEL_ONE_FOREX_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'BID_PRICE',
  2: 'ASK_PRICE',
  3: 'LAST_PRICE',
  4: 'BID_SIZE',
  5: 'ASK_SIZE',
  6: 'TOTAL_VOLUME',
  7: 'LAST_SIZE',
  8: 'QUOTE_TIME',
  9: 'TRADE_TIME',
  10: 'HIGH_PRICE',
  11: 'LOW_PRICE',
  12: 'CLOSE_PRICE',
  13: 'EXCHANGE',
  14: 'DESCRIPTION',
  15: 'OPEN_PRICE',
  16: 'NET_CHANGE',
  17: 'PERCENT_CHANGE',
  18: 'EXCHANGE_NAME',
  19: 'DIGITS',
  20: 'SECURITY_STATUS',
  21: 'TICK',
  22: 'TICK_AMOUNT',
  23: 'PRODUCT',
  24: 'TRADING_HOURS',
  25: 'IS_TRADABLE',
  26: 'MARKET_MAKER',
  27: 'HIGH_52_WEEK',
  28: 'LOW_52_WEEK',
  29: 'MARK',
};

const SCREENER_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'TIMESTAMP',
  2: 'SORT_FIELD',
  3: 'FREQUENCY',
  4: 'ITEMS',
};

const ACCOUNT_ACTIVITY_FIELD_LABELS: Record<number, string> = {
  0: 'SUBSCRIPTION_KEY',
  1: 'ACCOUNT',
  2: 'MESSAGE_TYPE',
  3: 'MESSAGE_DATA',
};

const BOOK_FIELD_LABELS: Record<number, string> = {
  0: 'SYMBOL',
  1: 'MARKET_SNAPSHOT_TIME',
  2: 'BID_SIDE_LEVELS',
  3: 'ASK_SIDE_LEVELS',
};

export type StreamMessageHandler = (message: StreamMessage) => void;

export interface StreamMessage {
  service: string;
  timestamp: number;
  command: string;
  content: Record<string, unknown>[];
}

export interface StreamRequest {
  service: string;
  command: string;
  requestid: number | string;
  SchwabClientCustomerId: string;
  SchwabClientCorrelId: string;
  parameters?: Record<string, unknown>;
}

export interface StreamRequestWrapper {
  requests: StreamRequest[];
}

export interface StreamerInfo {
  schwabClientCustomerId: string;
  schwabClientCorrelId: string;
  schwabClientChannel: string;
  schwabClientFunctionId: string;
  streamerSocketUrl: string;
}

/**
 * Response codes from the Schwab Streamer API
 */
export enum StreamerResponseCode {
  SUCCESS = 0,
  LOGIN_DENIED = 3,
  UNKNOWN_FAILURE = 9,
  SERVICE_NOT_AVAILABLE = 11,
  CLOSE_CONNECTION = 12,
  REACHED_SYMBOL_LIMIT = 19,
  STREAM_CONN_NOT_FOUND = 20,
  BAD_COMMAND_FORMAT = 21,
  FAILED_COMMAND_SUBS = 22,
  FAILED_COMMAND_UNSUBS = 23,
  FAILED_COMMAND_ADD = 24,
  FAILED_COMMAND_VIEW = 25,
  SUCCEEDED_COMMAND_SUBS = 26,
  SUCCEEDED_COMMAND_UNSUBS = 27,
  SUCCEEDED_COMMAND_ADD = 28,
  SUCCEEDED_COMMAND_VIEW = 29,
  STOP_STREAMING = 30,
}

/**
 * Streaming client for real-time market data from Schwab
 *
 * Based on the official Schwab Streamer API documentation.
 *
 * Provides access to:
 * - Level One quotes (LEVELONE_EQUITIES, LEVELONE_OPTIONS, LEVELONE_FUTURES,
 *   LEVELONE_FUTURES_OPTIONS, LEVELONE_FOREX)
 * - Level Two order book data (NYSE_BOOK, NASDAQ_BOOK, OPTIONS_BOOK)
 * - Chart data (CHART_EQUITY, CHART_FUTURES)
 * - Screener data (SCREENER_EQUITY, SCREENER_OPTION)
 * - Account activity (ACCT_ACTIVITY)
 *
 * @example
 * ```typescript
 * const client = new SchwabClient(config);
 * // ... authenticate ...
 *
 * const streamClient = new StreamClient(client, accountId);
 *
 * // Add handler before subscribing
 * streamClient.addLevelOneEquityHandler((msg) => {
 *   console.log(JSON.stringify(msg, null, 2));
 * });
 *
 * await streamClient.login();
 * await streamClient.levelOneEquitySubs(['AAPL', 'MSFT', 'GOOG']);
 *
 * // Process messages
 * while (true) {
 *   await streamClient.handleMessage();
 * }
 * ```
 */
export class StreamClient {
  private client: SchwabClient;
  private accountId: string;
  private ws: WebSocket | null = null;
  private requestId: number = 0;
  private streamerInfo: StreamerInfo | null = null;
  private isLoggedIn: boolean = false;

  // Message handlers for each service
  private levelOneEquityHandlers: StreamMessageHandler[] = [];
  private levelOneOptionHandlers: StreamMessageHandler[] = [];
  private levelOneFuturesHandlers: StreamMessageHandler[] = [];
  private levelOneFuturesOptionsHandlers: StreamMessageHandler[] = [];
  private levelOneForexHandlers: StreamMessageHandler[] = [];
  private chartEquityHandlers: StreamMessageHandler[] = [];
  private chartFuturesHandlers: StreamMessageHandler[] = [];
  private nyseBookHandlers: StreamMessageHandler[] = [];
  private nasdaqBookHandlers: StreamMessageHandler[] = [];
  private optionsBookHandlers: StreamMessageHandler[] = [];
  private screenerEquityHandlers: StreamMessageHandler[] = [];
  private screenerOptionHandlers: StreamMessageHandler[] = [];
  private accountActivityHandlers: StreamMessageHandler[] = [];

  // Pending responses for request/response matching
  private pendingRequests: Map<
    number | string,
    {
      resolve: (value: unknown) => void;
      reject: (reason: unknown) => void;
    }
  > = new Map();

  // Message queue for async handling
  private messageQueue: StreamMessage[] = [];

  constructor(client: SchwabClient, accountId: string) {
    this.client = client;
    this.accountId = accountId;
  }

  /**
   * Get next request ID
   */
  private getNextRequestId(): string {
    return String(++this.requestId);
  }

  /**
   * Initialize streamer info from user preferences
   */
  private async initStreamerInfo(): Promise<void> {
    const streamerInfoArray = await this.client.getStreamerInfo();
    if (!streamerInfoArray || streamerInfoArray.length === 0) {
      throw new Error('No streamer info available. Ensure you have called getUserPreferences.');
    }

    const info = streamerInfoArray[0] as {
      schwabClientCustomerId?: string;
      schwabClientCorrelId?: string;
      schwabClientChannel?: string;
      schwabClientFunctionId?: string;
    };

    const socketUrl = await this.client.getStreamerSocketUrl();
    if (!socketUrl) {
      throw new Error('No streamer socket URL available');
    }

    this.streamerInfo = {
      schwabClientCustomerId: info.schwabClientCustomerId || '',
      schwabClientCorrelId: info.schwabClientCorrelId || '',
      schwabClientChannel: info.schwabClientChannel || '',
      schwabClientFunctionId: info.schwabClientFunctionId || '',
      streamerSocketUrl: socketUrl,
    };
  }

  /**
   * Connect to the streaming service WebSocket
   */
  private async connect(): Promise<void> {
    if (!this.streamerInfo) {
      await this.initStreamerInfo();
    }

    return new Promise((resolve, reject) => {
      if (!this.streamerInfo) {
        reject(new Error('Streamer info not initialized'));
        return;
      }

      this.ws = new WebSocket(this.streamerInfo.streamerSocketUrl);

      this.ws.on('open', () => {
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.processIncomingMessage(data.toString());
      });

      this.ws.on('error', (error) => {
        reject(error);
      });

      this.ws.on('close', () => {
        this.isLoggedIn = false;
        this.ws = null;
      });
    });
  }

  /**
   * Process incoming WebSocket message
   */
  private processIncomingMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);

      // Handle response messages (responses to our requests)
      if (parsed.response) {
        for (const response of parsed.response) {
          const requestId = response.requestid;
          const pending = this.pendingRequests.get(requestId);
          if (pending) {
            const code = response.content?.code;
            if (
              code === StreamerResponseCode.SUCCESS ||
              code === StreamerResponseCode.SUCCEEDED_COMMAND_SUBS ||
              code === StreamerResponseCode.SUCCEEDED_COMMAND_UNSUBS ||
              code === StreamerResponseCode.SUCCEEDED_COMMAND_ADD ||
              code === StreamerResponseCode.SUCCEEDED_COMMAND_VIEW
            ) {
              pending.resolve(response);
            } else {
              pending.reject(
                new Error(`Streamer error ${code}: ${response.content?.msg || 'Unknown error'}`)
              );
            }
            this.pendingRequests.delete(requestId);
          }
        }
      }

      // Handle data messages (streaming market data)
      if (parsed.data) {
        for (const dataItem of parsed.data) {
          const message = this.relabelMessage(dataItem);
          this.messageQueue.push(message);
          this.dispatchMessage(message);
        }
      }

      // Handle notify messages (heartbeats)
      if (parsed.notify) {
        // Heartbeat messages - can be logged or used for connection health monitoring
        for (const notify of parsed.notify) {
          if (notify.heartbeat) {
            // Heartbeat received - connection is alive
          }
        }
      }
    } catch (error) {
      console.error('Error parsing stream message:', error);
    }
  }

  /**
   * Relabel numeric field keys to human-readable strings
   */
  private relabelMessage(message: {
    service: string;
    timestamp: number;
    command: string;
    content: Record<string, unknown>[];
  }): StreamMessage {
    const service = message.service;
    let fieldLabels: Record<number, string> | null = null;

    switch (service) {
      case 'LEVELONE_EQUITIES':
        fieldLabels = LEVEL_ONE_EQUITY_FIELD_LABELS;
        break;
      case 'LEVELONE_OPTIONS':
        fieldLabels = LEVEL_ONE_OPTION_FIELD_LABELS;
        break;
      case 'LEVELONE_FUTURES':
        fieldLabels = LEVEL_ONE_FUTURES_FIELD_LABELS;
        break;
      case 'LEVELONE_FUTURES_OPTIONS':
        fieldLabels = LEVEL_ONE_FUTURES_OPTIONS_FIELD_LABELS;
        break;
      case 'LEVELONE_FOREX':
        fieldLabels = LEVEL_ONE_FOREX_FIELD_LABELS;
        break;
      case 'CHART_EQUITY':
        fieldLabels = CHART_EQUITY_FIELD_LABELS;
        break;
      case 'CHART_FUTURES':
        fieldLabels = CHART_FUTURES_FIELD_LABELS;
        break;
      case 'SCREENER_EQUITY':
      case 'SCREENER_OPTION':
        fieldLabels = SCREENER_FIELD_LABELS;
        break;
      case 'ACCT_ACTIVITY':
        fieldLabels = ACCOUNT_ACTIVITY_FIELD_LABELS;
        break;
      case 'NYSE_BOOK':
      case 'NASDAQ_BOOK':
      case 'OPTIONS_BOOK':
        fieldLabels = BOOK_FIELD_LABELS;
        break;
    }

    if (fieldLabels && message.content) {
      const relabeledContent = message.content.map((item) => {
        const relabeled: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
          const numKey = parseInt(key, 10);
          if (!isNaN(numKey) && fieldLabels && fieldLabels[numKey]) {
            relabeled[fieldLabels[numKey]] = value;
          } else {
            relabeled[key] = value;
          }
        }
        return relabeled;
      });

      return {
        ...message,
        content: relabeledContent,
      };
    }

    return message as StreamMessage;
  }

  /**
   * Dispatch message to appropriate handlers based on service type
   */
  private dispatchMessage(message: StreamMessage): void {
    switch (message.service) {
      case 'LEVELONE_EQUITIES':
        this.levelOneEquityHandlers.forEach((handler) => handler(message));
        break;
      case 'LEVELONE_OPTIONS':
        this.levelOneOptionHandlers.forEach((handler) => handler(message));
        break;
      case 'LEVELONE_FUTURES':
        this.levelOneFuturesHandlers.forEach((handler) => handler(message));
        break;
      case 'LEVELONE_FUTURES_OPTIONS':
        this.levelOneFuturesOptionsHandlers.forEach((handler) => handler(message));
        break;
      case 'LEVELONE_FOREX':
        this.levelOneForexHandlers.forEach((handler) => handler(message));
        break;
      case 'CHART_EQUITY':
        this.chartEquityHandlers.forEach((handler) => handler(message));
        break;
      case 'CHART_FUTURES':
        this.chartFuturesHandlers.forEach((handler) => handler(message));
        break;
      case 'NYSE_BOOK':
        this.nyseBookHandlers.forEach((handler) => handler(message));
        break;
      case 'NASDAQ_BOOK':
        this.nasdaqBookHandlers.forEach((handler) => handler(message));
        break;
      case 'OPTIONS_BOOK':
        this.optionsBookHandlers.forEach((handler) => handler(message));
        break;
      case 'SCREENER_EQUITY':
        this.screenerEquityHandlers.forEach((handler) => handler(message));
        break;
      case 'SCREENER_OPTION':
        this.screenerOptionHandlers.forEach((handler) => handler(message));
        break;
      case 'ACCT_ACTIVITY':
        this.accountActivityHandlers.forEach((handler) => handler(message));
        break;
    }
  }

  /**
   * Send a request to the streaming service
   */
  private async sendRequest(
    service: string,
    command: string,
    parameters?: Record<string, unknown>
  ): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    if (!this.streamerInfo) {
      throw new Error('Streamer info not initialized');
    }

    const requestId = this.getNextRequestId();
    const request: StreamRequestWrapper = {
      requests: [
        {
          service,
          command,
          requestid: requestId,
          SchwabClientCustomerId: this.streamerInfo.schwabClientCustomerId,
          SchwabClientCorrelId: this.streamerInfo.schwabClientCorrelId,
          parameters,
        },
      ],
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
      this.ws!.send(JSON.stringify(request));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // ==================== Public API ====================

  /**
   * Login to the streaming service
   *
   * This must be called before any other streaming operations.
   * The login uses the access token from the authenticated client.
   */
  async login(): Promise<void> {
    if (this.isLoggedIn) {
      return;
    }

    await this.connect();

    if (!this.streamerInfo) {
      throw new Error('Streamer info not initialized');
    }

    const tokens = this.client.getTokens();
    if (!tokens) {
      throw new Error('No access token available. Please authenticate first.');
    }

    // Login request per Schwab Streamer API documentation
    await this.sendRequest('ADMIN', 'LOGIN', {
      Authorization: tokens.access_token,
      SchwabClientChannel: this.streamerInfo.schwabClientChannel,
      SchwabClientFunctionId: this.streamerInfo.schwabClientFunctionId,
    });

    this.isLoggedIn = true;
  }

  /**
   * Logout from the streaming service
   *
   * Closes the WebSocket connection cleanly.
   */
  async logout(): Promise<void> {
    if (!this.isLoggedIn) {
      return;
    }

    try {
      await this.sendRequest('ADMIN', 'LOGOUT');
    } catch (error) {
      // Ignore errors during logout
    }

    this.isLoggedIn = false;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Handle the next message in the queue
   *
   * Call this in a loop to process streaming messages.
   * Returns the next message or waits for one to arrive.
   */
  async handleMessage(): Promise<StreamMessage | null> {
    return new Promise((resolve) => {
      if (this.messageQueue.length > 0) {
        resolve(this.messageQueue.shift()!);
      } else {
        // Wait for next message
        const checkQueue = () => {
          if (this.messageQueue.length > 0) {
            resolve(this.messageQueue.shift()!);
          } else if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            resolve(null);
          } else {
            setTimeout(checkQueue, 10);
          }
        };
        checkQueue();
      }
    });
  }

  /**
   * Check if connected and logged in
   */
  isConnected(): boolean {
    return this.isLoggedIn && this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ==================== LEVELONE_EQUITIES ====================

  /**
   * Subscribe to Level One equity quotes
   *
   * @param symbols Array of stock symbols (e.g., ['AAPL', 'MSFT', 'GOOG'])
   * @param fields Optional array of fields to subscribe to (defaults to common fields)
   */
  async levelOneEquitySubs(symbols: string[], fields?: LevelOneEquityFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,8,10,11,12,15,17,18,25,29,32,33,42';

    await this.sendRequest('LEVELONE_EQUITIES', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from Level One equity quotes
   */
  async levelOneEquityUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('LEVELONE_EQUITIES', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing Level One equity subscription
   */
  async levelOneEquityAdd(symbols: string[], fields?: LevelOneEquityFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,8,10,11,12,15,17,18,25,29,32,33,42';

    await this.sendRequest('LEVELONE_EQUITIES', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Change fields for Level One equity subscription
   */
  async levelOneEquityView(fields: LevelOneEquityFields[]): Promise<void> {
    await this.sendRequest('LEVELONE_EQUITIES', 'VIEW', {
      fields: fields.join(','),
    });
  }

  /**
   * Add handler for Level One equity messages
   */
  addLevelOneEquityHandler(handler: StreamMessageHandler): void {
    this.levelOneEquityHandlers.push(handler);
  }

  // ==================== LEVELONE_OPTIONS ====================

  /**
   * Subscribe to Level One option quotes
   *
   * @param symbols Array of option symbols in Schwab format (e.g., 'AAPL  251219C00200000')
   * @param fields Optional array of fields to subscribe to
   */
  async levelOneOptionSubs(symbols: string[], fields?: LevelOneOptionFields[]): Promise<void> {
    const fieldStr = fields
      ? fields.join(',')
      : '0,1,2,3,4,5,6,7,8,19,20,21,22,28,29,30,31,32,33,37';

    await this.sendRequest('LEVELONE_OPTIONS', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from Level One option quotes
   */
  async levelOneOptionUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('LEVELONE_OPTIONS', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing Level One option subscription
   */
  async levelOneOptionAdd(symbols: string[], fields?: LevelOneOptionFields[]): Promise<void> {
    const fieldStr = fields
      ? fields.join(',')
      : '0,1,2,3,4,5,6,7,8,19,20,21,22,28,29,30,31,32,33,37';

    await this.sendRequest('LEVELONE_OPTIONS', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for Level One option messages
   */
  addLevelOneOptionHandler(handler: StreamMessageHandler): void {
    this.levelOneOptionHandlers.push(handler);
  }

  // ==================== LEVELONE_FUTURES ====================

  /**
   * Subscribe to Level One futures quotes
   *
   * @param symbols Array of futures symbols (e.g., '/ESZ24', '/NQZ24')
   * @param fields Optional array of fields to subscribe to
   */
  async levelOneFuturesSubs(symbols: string[], fields?: LevelOneFuturesFields[]): Promise<void> {
    const fieldStr = fields
      ? fields.join(',')
      : '0,1,2,3,4,5,8,9,10,11,12,13,14,16,18,19,20,21,22,24';

    await this.sendRequest('LEVELONE_FUTURES', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from Level One futures quotes
   */
  async levelOneFuturesUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('LEVELONE_FUTURES', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing Level One futures subscription
   */
  async levelOneFuturesAdd(symbols: string[], fields?: LevelOneFuturesFields[]): Promise<void> {
    const fieldStr = fields
      ? fields.join(',')
      : '0,1,2,3,4,5,8,9,10,11,12,13,14,16,18,19,20,21,22,24';

    await this.sendRequest('LEVELONE_FUTURES', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for Level One futures messages
   */
  addLevelOneFuturesHandler(handler: StreamMessageHandler): void {
    this.levelOneFuturesHandlers.push(handler);
  }

  // ==================== LEVELONE_FUTURES_OPTIONS ====================

  /**
   * Subscribe to Level One futures options quotes
   *
   * @param symbols Array of futures options symbols (e.g., './OZCZ23C565')
   * @param fields Optional array of fields to subscribe to
   */
  async levelOneFuturesOptionsSubs(
    symbols: string[],
    fields?: LevelOneFuturesOptionsFields[]
  ): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,8,9,10,11,12,13,14,16,17,19,24,25,29';

    await this.sendRequest('LEVELONE_FUTURES_OPTIONS', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from Level One futures options quotes
   */
  async levelOneFuturesOptionsUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('LEVELONE_FUTURES_OPTIONS', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing Level One futures options subscription
   */
  async levelOneFuturesOptionsAdd(
    symbols: string[],
    fields?: LevelOneFuturesOptionsFields[]
  ): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,8,9,10,11,12,13,14,16,17,19,24,25,29';

    await this.sendRequest('LEVELONE_FUTURES_OPTIONS', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for Level One futures options messages
   */
  addLevelOneFuturesOptionsHandler(handler: StreamMessageHandler): void {
    this.levelOneFuturesOptionsHandlers.push(handler);
  }

  // ==================== LEVELONE_FOREX ====================

  /**
   * Subscribe to Level One forex quotes
   *
   * @param symbols Array of forex pairs (e.g., 'EUR/USD', 'USD/JPY')
   * @param fields Optional array of fields to subscribe to
   */
  async levelOneForexSubs(symbols: string[], fields?: LevelOneForexFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,6,7,10,11,12,14,15,16,17,18,20,29';

    await this.sendRequest('LEVELONE_FOREX', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from Level One forex quotes
   */
  async levelOneForexUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('LEVELONE_FOREX', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing Level One forex subscription
   */
  async levelOneForexAdd(symbols: string[], fields?: LevelOneForexFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,6,7,10,11,12,14,15,16,17,18,20,29';

    await this.sendRequest('LEVELONE_FOREX', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for Level One forex messages
   */
  addLevelOneForexHandler(handler: StreamMessageHandler): void {
    this.levelOneForexHandlers.push(handler);
  }

  // ==================== CHART_EQUITY ====================

  /**
   * Subscribe to equity chart data (minute-by-minute OHLCV)
   *
   * @param symbols Array of stock symbols
   * @param fields Optional array of fields to subscribe to
   */
  async chartEquitySubs(symbols: string[], fields?: ChartEquityFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,6,7,8';

    await this.sendRequest('CHART_EQUITY', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from equity chart data
   */
  async chartEquityUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('CHART_EQUITY', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing equity chart subscription
   */
  async chartEquityAdd(symbols: string[], fields?: ChartEquityFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,6,7,8';

    await this.sendRequest('CHART_EQUITY', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for equity chart messages
   */
  addChartEquityHandler(handler: StreamMessageHandler): void {
    this.chartEquityHandlers.push(handler);
  }

  // ==================== CHART_FUTURES ====================

  /**
   * Subscribe to futures chart data (minute-by-minute OHLCV)
   *
   * @param symbols Array of futures symbols (e.g., '/ESZ24')
   * @param fields Optional array of fields to subscribe to
   */
  async chartFuturesSubs(symbols: string[], fields?: ChartFuturesFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,6';

    await this.sendRequest('CHART_FUTURES', 'SUBS', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from futures chart data
   */
  async chartFuturesUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('CHART_FUTURES', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing futures chart subscription
   */
  async chartFuturesAdd(symbols: string[], fields?: ChartFuturesFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4,5,6';

    await this.sendRequest('CHART_FUTURES', 'ADD', {
      keys: symbols.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for futures chart messages
   */
  addChartFuturesHandler(handler: StreamMessageHandler): void {
    this.chartFuturesHandlers.push(handler);
  }

  // ==================== NYSE_BOOK ====================

  /**
   * Subscribe to NYSE order book (Level Two)
   */
  async nyseBookSubs(symbols: string[]): Promise<void> {
    await this.sendRequest('NYSE_BOOK', 'SUBS', {
      keys: symbols.join(','),
      fields: '0,1,2,3',
    });
  }

  /**
   * Unsubscribe from NYSE order book
   */
  async nyseBookUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('NYSE_BOOK', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing NYSE book subscription
   */
  async nyseBookAdd(symbols: string[]): Promise<void> {
    await this.sendRequest('NYSE_BOOK', 'ADD', {
      keys: symbols.join(','),
      fields: '0,1,2,3',
    });
  }

  /**
   * Add handler for NYSE book messages
   */
  addNyseBookHandler(handler: StreamMessageHandler): void {
    this.nyseBookHandlers.push(handler);
  }

  // ==================== NASDAQ_BOOK ====================

  /**
   * Subscribe to NASDAQ order book (Level Two)
   */
  async nasdaqBookSubs(symbols: string[]): Promise<void> {
    await this.sendRequest('NASDAQ_BOOK', 'SUBS', {
      keys: symbols.join(','),
      fields: '0,1,2,3',
    });
  }

  /**
   * Unsubscribe from NASDAQ order book
   */
  async nasdaqBookUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('NASDAQ_BOOK', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing NASDAQ book subscription
   */
  async nasdaqBookAdd(symbols: string[]): Promise<void> {
    await this.sendRequest('NASDAQ_BOOK', 'ADD', {
      keys: symbols.join(','),
      fields: '0,1,2,3',
    });
  }

  /**
   * Add handler for NASDAQ book messages
   */
  addNasdaqBookHandler(handler: StreamMessageHandler): void {
    this.nasdaqBookHandlers.push(handler);
  }

  // ==================== OPTIONS_BOOK ====================

  /**
   * Subscribe to options order book
   */
  async optionsBookSubs(symbols: string[]): Promise<void> {
    await this.sendRequest('OPTIONS_BOOK', 'SUBS', {
      keys: symbols.join(','),
      fields: '0,1,2,3',
    });
  }

  /**
   * Unsubscribe from options order book
   */
  async optionsBookUnsubs(symbols: string[]): Promise<void> {
    await this.sendRequest('OPTIONS_BOOK', 'UNSUBS', {
      keys: symbols.join(','),
    });
  }

  /**
   * Add symbols to existing options book subscription
   */
  async optionsBookAdd(symbols: string[]): Promise<void> {
    await this.sendRequest('OPTIONS_BOOK', 'ADD', {
      keys: symbols.join(','),
      fields: '0,1,2,3',
    });
  }

  /**
   * Add handler for options book messages
   */
  addOptionsBookHandler(handler: StreamMessageHandler): void {
    this.optionsBookHandlers.push(handler);
  }

  // ==================== SCREENER_EQUITY ====================

  /**
   * Subscribe to equity screener
   *
   * @param keys Screener keys in format: (PREFIX)_(SORTFIELD)_(FREQUENCY)
   *   PREFIX: $COMPX, $DJI, $SPX, INDEX_ALL, NYSE, NASDAQ, OTCBB, EQUITY_ALL
   *   SORTFIELD: VOLUME, TRADES, PERCENT_CHANGE_UP, PERCENT_CHANGE_DOWN, AVERAGE_PERCENT_VOLUME
   *   FREQUENCY: 0, 1, 5, 10, 30, 60 (minutes, 0 = all day)
   *
   * @example
   * await streamClient.screenerEquitySubs(['$SPX_PERCENT_CHANGE_UP_60', 'NASDAQ_VOLUME_0']);
   */
  async screenerEquitySubs(keys: string[], fields?: ScreenerFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4';

    await this.sendRequest('SCREENER_EQUITY', 'SUBS', {
      keys: keys.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from equity screener
   */
  async screenerEquityUnsubs(keys: string[]): Promise<void> {
    await this.sendRequest('SCREENER_EQUITY', 'UNSUBS', {
      keys: keys.join(','),
    });
  }

  /**
   * Add keys to existing equity screener subscription
   */
  async screenerEquityAdd(keys: string[], fields?: ScreenerFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4';

    await this.sendRequest('SCREENER_EQUITY', 'ADD', {
      keys: keys.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for equity screener messages
   */
  addScreenerEquityHandler(handler: StreamMessageHandler): void {
    this.screenerEquityHandlers.push(handler);
  }

  // ==================== SCREENER_OPTION ====================

  /**
   * Subscribe to option screener
   *
   * @param keys Screener keys in format: (PREFIX)_(SORTFIELD)_(FREQUENCY)
   *   PREFIX: OPTION_PUT, OPTION_CALL, OPTION_ALL
   *   SORTFIELD: VOLUME, TRADES, PERCENT_CHANGE_UP, PERCENT_CHANGE_DOWN, AVERAGE_PERCENT_VOLUME
   *   FREQUENCY: 0, 1, 5, 10, 30, 60 (minutes, 0 = all day)
   */
  async screenerOptionSubs(keys: string[], fields?: ScreenerFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4';

    await this.sendRequest('SCREENER_OPTION', 'SUBS', {
      keys: keys.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Unsubscribe from option screener
   */
  async screenerOptionUnsubs(keys: string[]): Promise<void> {
    await this.sendRequest('SCREENER_OPTION', 'UNSUBS', {
      keys: keys.join(','),
    });
  }

  /**
   * Add keys to existing option screener subscription
   */
  async screenerOptionAdd(keys: string[], fields?: ScreenerFields[]): Promise<void> {
    const fieldStr = fields ? fields.join(',') : '0,1,2,3,4';

    await this.sendRequest('SCREENER_OPTION', 'ADD', {
      keys: keys.join(','),
      fields: fieldStr,
    });
  }

  /**
   * Add handler for option screener messages
   */
  addScreenerOptionHandler(handler: StreamMessageHandler): void {
    this.screenerOptionHandlers.push(handler);
  }

  // ==================== ACCT_ACTIVITY ====================

  /**
   * Subscribe to account activity stream
   *
   * Receives order fills and other account activity updates.
   *
   * @param subscriptionKey Optional key to identify this subscription (default: 'Account Activity')
   */
  async accountActivitySub(subscriptionKey: string = 'Account Activity'): Promise<void> {
    await this.sendRequest('ACCT_ACTIVITY', 'SUBS', {
      keys: subscriptionKey,
      fields: '0,1,2,3',
    });
  }

  /**
   * Unsubscribe from account activity stream
   */
  async accountActivityUnsubs(subscriptionKey: string = 'Account Activity'): Promise<void> {
    await this.sendRequest('ACCT_ACTIVITY', 'UNSUBS', {
      keys: subscriptionKey,
    });
  }

  /**
   * Add handler for account activity messages
   */
  addAccountActivityHandler(handler: StreamMessageHandler): void {
    this.accountActivityHandlers.push(handler);
  }

  // ==================== Quality of Service ====================

  /**
   * Set quality of service level (data update frequency)
   *
   * @param qosLevel QoS level:
   *   - 0: Express (500ms) - fastest updates
   *   - 1: Real-Time (750ms)
   *   - 2: Fast (1000ms)
   *   - 3: Moderate (1500ms)
   *   - 4: Slow (3000ms)
   *   - 5: Delayed (5000ms) - slowest updates
   */
  async setQualityOfService(qosLevel: 0 | 1 | 2 | 3 | 4 | 5): Promise<void> {
    await this.sendRequest('ADMIN', 'QOS', {
      qoslevel: qosLevel.toString(),
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Remove a handler from Level One equity messages
   */
  removeLevelOneEquityHandler(handler: StreamMessageHandler): void {
    const index = this.levelOneEquityHandlers.indexOf(handler);
    if (index > -1) {
      this.levelOneEquityHandlers.splice(index, 1);
    }
  }

  /**
   * Clear all handlers for a service
   */
  clearHandlers(service: string): void {
    switch (service) {
      case 'LEVELONE_EQUITIES':
        this.levelOneEquityHandlers = [];
        break;
      case 'LEVELONE_OPTIONS':
        this.levelOneOptionHandlers = [];
        break;
      case 'LEVELONE_FUTURES':
        this.levelOneFuturesHandlers = [];
        break;
      case 'LEVELONE_FUTURES_OPTIONS':
        this.levelOneFuturesOptionsHandlers = [];
        break;
      case 'LEVELONE_FOREX':
        this.levelOneForexHandlers = [];
        break;
      case 'CHART_EQUITY':
        this.chartEquityHandlers = [];
        break;
      case 'CHART_FUTURES':
        this.chartFuturesHandlers = [];
        break;
      case 'NYSE_BOOK':
        this.nyseBookHandlers = [];
        break;
      case 'NASDAQ_BOOK':
        this.nasdaqBookHandlers = [];
        break;
      case 'OPTIONS_BOOK':
        this.optionsBookHandlers = [];
        break;
      case 'SCREENER_EQUITY':
        this.screenerEquityHandlers = [];
        break;
      case 'SCREENER_OPTION':
        this.screenerOptionHandlers = [];
        break;
      case 'ACCT_ACTIVITY':
        this.accountActivityHandlers = [];
        break;
    }
  }

  /**
   * Clear all handlers for all services
   */
  clearAllHandlers(): void {
    this.levelOneEquityHandlers = [];
    this.levelOneOptionHandlers = [];
    this.levelOneFuturesHandlers = [];
    this.levelOneFuturesOptionsHandlers = [];
    this.levelOneForexHandlers = [];
    this.chartEquityHandlers = [];
    this.chartFuturesHandlers = [];
    this.nyseBookHandlers = [];
    this.nasdaqBookHandlers = [];
    this.optionsBookHandlers = [];
    this.screenerEquityHandlers = [];
    this.screenerOptionHandlers = [];
    this.accountActivityHandlers = [];
  }
}
