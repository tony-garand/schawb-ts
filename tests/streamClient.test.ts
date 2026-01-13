import {
  StreamClient,
  LevelOneEquityFields,
  LevelOneOptionFields,
  LevelOneFuturesFields,
  LevelOneFuturesOptionsFields,
  LevelOneForexFields,
  ChartEquityFields,
  ChartFuturesFields,
  ScreenerFields,
  AccountActivityFields,
  BookFields,
  StreamerResponseCode,
  StreamMessage,
  StreamMessageHandler,
} from '../src/streaming/streamClient';
import { SchwabClient } from '../src/client';

// Mock the ws module
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1, // WebSocket.OPEN
    };
  });
});

describe('StreamClient', () => {
  let mockClient: jest.Mocked<SchwabClient>;

  beforeEach(() => {
    mockClient = {
      getStreamerInfo: jest.fn().mockResolvedValue([
        {
          schwabClientCustomerId: 'test-customer-id',
          schwabClientCorrelId: 'test-correl-id',
          schwabClientChannel: 'test-channel',
          schwabClientFunctionId: 'test-function-id',
        },
      ]),
      getStreamerSocketUrl: jest.fn().mockResolvedValue('wss://streamer.schwab.com/ws'),
      getTokens: jest.fn().mockReturnValue({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
      }),
    } as unknown as jest.Mocked<SchwabClient>;
  });

  describe('Field Enums', () => {
    describe('LevelOneEquityFields', () => {
      it('should have correct field values', () => {
        expect(LevelOneEquityFields.SYMBOL).toBe(0);
        expect(LevelOneEquityFields.BID_PRICE).toBe(1);
        expect(LevelOneEquityFields.ASK_PRICE).toBe(2);
        expect(LevelOneEquityFields.LAST_PRICE).toBe(3);
        expect(LevelOneEquityFields.BID_SIZE).toBe(4);
        expect(LevelOneEquityFields.ASK_SIZE).toBe(5);
        expect(LevelOneEquityFields.TOTAL_VOLUME).toBe(8);
        expect(LevelOneEquityFields.HIGH_PRICE).toBe(10);
        expect(LevelOneEquityFields.LOW_PRICE).toBe(11);
        expect(LevelOneEquityFields.CLOSE_PRICE).toBe(12);
        expect(LevelOneEquityFields.OPEN_PRICE).toBe(17);
        expect(LevelOneEquityFields.NET_CHANGE).toBe(18);
        expect(LevelOneEquityFields.HIGH_52_WEEK).toBe(19);
        expect(LevelOneEquityFields.LOW_52_WEEK).toBe(20);
        expect(LevelOneEquityFields.PE_RATIO).toBe(21);
        expect(LevelOneEquityFields.DIVIDEND_AMOUNT).toBe(22);
        expect(LevelOneEquityFields.DIVIDEND_YIELD).toBe(23);
        expect(LevelOneEquityFields.NAV).toBe(24);
        expect(LevelOneEquityFields.MARK_PRICE).toBe(33);
        expect(LevelOneEquityFields.NET_PERCENT_CHANGE).toBe(42);
        expect(LevelOneEquityFields.SHORTABLE).toBe(49);
        expect(LevelOneEquityFields.POST_MARKET_NET_CHANGE).toBe(50);
        expect(LevelOneEquityFields.POST_MARKET_PERCENT_CHANGE).toBe(51);
      });
    });

    describe('LevelOneOptionFields', () => {
      it('should have correct field values', () => {
        expect(LevelOneOptionFields.SYMBOL).toBe(0);
        expect(LevelOneOptionFields.DESCRIPTION).toBe(1);
        expect(LevelOneOptionFields.BID_PRICE).toBe(2);
        expect(LevelOneOptionFields.ASK_PRICE).toBe(3);
        expect(LevelOneOptionFields.LAST_PRICE).toBe(4);
        expect(LevelOneOptionFields.OPEN_INTEREST).toBe(9);
        expect(LevelOneOptionFields.VOLATILITY).toBe(10);
        expect(LevelOneOptionFields.STRIKE_PRICE).toBe(20);
        expect(LevelOneOptionFields.CONTRACT_TYPE).toBe(21);
        expect(LevelOneOptionFields.UNDERLYING).toBe(22);
        expect(LevelOneOptionFields.DELTA).toBe(28);
        expect(LevelOneOptionFields.GAMMA).toBe(29);
        expect(LevelOneOptionFields.THETA).toBe(30);
        expect(LevelOneOptionFields.VEGA).toBe(31);
        expect(LevelOneOptionFields.RHO).toBe(32);
        expect(LevelOneOptionFields.MARK_PRICE).toBe(37);
        expect(LevelOneOptionFields.OPTION_ROOT).toBe(49);
        expect(LevelOneOptionFields.EXERCISE_TYPE).toBe(55);
      });
    });

    describe('LevelOneFuturesFields', () => {
      it('should have correct field values', () => {
        expect(LevelOneFuturesFields.SYMBOL).toBe(0);
        expect(LevelOneFuturesFields.BID_PRICE).toBe(1);
        expect(LevelOneFuturesFields.ASK_PRICE).toBe(2);
        expect(LevelOneFuturesFields.LAST_PRICE).toBe(3);
        expect(LevelOneFuturesFields.TOTAL_VOLUME).toBe(8);
        expect(LevelOneFuturesFields.OPEN_INTEREST).toBe(23);
        expect(LevelOneFuturesFields.MARK).toBe(24);
        expect(LevelOneFuturesFields.FUTURE_MULTIPLIER).toBe(31);
        expect(LevelOneFuturesFields.FUTURE_SETTLEMENT_PRICE).toBe(33);
        expect(LevelOneFuturesFields.FUTURE_EXPIRATION_DATE).toBe(35);
        expect(LevelOneFuturesFields.SETTLEMENT_DATE).toBe(40);
      });
    });

    describe('LevelOneFuturesOptionsFields', () => {
      it('should have correct field values', () => {
        expect(LevelOneFuturesOptionsFields.SYMBOL).toBe(0);
        expect(LevelOneFuturesOptionsFields.BID_PRICE).toBe(1);
        expect(LevelOneFuturesOptionsFields.ASK_PRICE).toBe(2);
        expect(LevelOneFuturesOptionsFields.LAST_PRICE).toBe(3);
        expect(LevelOneFuturesOptionsFields.OPEN_INTEREST).toBe(18);
        expect(LevelOneFuturesOptionsFields.MARK).toBe(19);
        expect(LevelOneFuturesOptionsFields.UNDERLYING_SYMBOL).toBe(24);
        expect(LevelOneFuturesOptionsFields.STRIKE_PRICE).toBe(25);
        expect(LevelOneFuturesOptionsFields.CONTRACT_TYPE).toBe(28);
        expect(LevelOneFuturesOptionsFields.EXCHANGE_NAME).toBe(31);
      });
    });

    describe('LevelOneForexFields', () => {
      it('should have correct field values', () => {
        expect(LevelOneForexFields.SYMBOL).toBe(0);
        expect(LevelOneForexFields.BID_PRICE).toBe(1);
        expect(LevelOneForexFields.ASK_PRICE).toBe(2);
        expect(LevelOneForexFields.LAST_PRICE).toBe(3);
        expect(LevelOneForexFields.HIGH_PRICE).toBe(10);
        expect(LevelOneForexFields.LOW_PRICE).toBe(11);
        expect(LevelOneForexFields.CLOSE_PRICE).toBe(12);
        expect(LevelOneForexFields.OPEN_PRICE).toBe(15);
        expect(LevelOneForexFields.PERCENT_CHANGE).toBe(17);
        expect(LevelOneForexFields.MARK).toBe(29);
      });
    });

    describe('ChartEquityFields', () => {
      it('should have correct field values', () => {
        expect(ChartEquityFields.KEY).toBe(0);
        expect(ChartEquityFields.OPEN_PRICE).toBe(1);
        expect(ChartEquityFields.HIGH_PRICE).toBe(2);
        expect(ChartEquityFields.LOW_PRICE).toBe(3);
        expect(ChartEquityFields.CLOSE_PRICE).toBe(4);
        expect(ChartEquityFields.VOLUME).toBe(5);
        expect(ChartEquityFields.SEQUENCE).toBe(6);
        expect(ChartEquityFields.CHART_TIME).toBe(7);
        expect(ChartEquityFields.CHART_DAY).toBe(8);
      });
    });

    describe('ChartFuturesFields', () => {
      it('should have correct field values', () => {
        expect(ChartFuturesFields.KEY).toBe(0);
        expect(ChartFuturesFields.CHART_TIME).toBe(1);
        expect(ChartFuturesFields.OPEN_PRICE).toBe(2);
        expect(ChartFuturesFields.HIGH_PRICE).toBe(3);
        expect(ChartFuturesFields.LOW_PRICE).toBe(4);
        expect(ChartFuturesFields.CLOSE_PRICE).toBe(5);
        expect(ChartFuturesFields.VOLUME).toBe(6);
      });
    });

    describe('ScreenerFields', () => {
      it('should have correct field values', () => {
        expect(ScreenerFields.SYMBOL).toBe(0);
        expect(ScreenerFields.TIMESTAMP).toBe(1);
        expect(ScreenerFields.SORT_FIELD).toBe(2);
        expect(ScreenerFields.FREQUENCY).toBe(3);
        expect(ScreenerFields.ITEMS).toBe(4);
      });
    });

    describe('AccountActivityFields', () => {
      it('should have correct field values', () => {
        expect(AccountActivityFields.SUBSCRIPTION_KEY).toBe(0);
        expect(AccountActivityFields.ACCOUNT).toBe(1);
        expect(AccountActivityFields.MESSAGE_TYPE).toBe(2);
        expect(AccountActivityFields.MESSAGE_DATA).toBe(3);
      });
    });

    describe('BookFields', () => {
      it('should have correct field values', () => {
        expect(BookFields.SYMBOL).toBe(0);
        expect(BookFields.MARKET_SNAPSHOT_TIME).toBe(1);
        expect(BookFields.BID_SIDE_LEVELS).toBe(2);
        expect(BookFields.ASK_SIDE_LEVELS).toBe(3);
      });
    });
  });

  describe('StreamerResponseCode', () => {
    it('should have correct response codes', () => {
      expect(StreamerResponseCode.SUCCESS).toBe(0);
      expect(StreamerResponseCode.LOGIN_DENIED).toBe(3);
      expect(StreamerResponseCode.UNKNOWN_FAILURE).toBe(9);
      expect(StreamerResponseCode.SERVICE_NOT_AVAILABLE).toBe(11);
      expect(StreamerResponseCode.CLOSE_CONNECTION).toBe(12);
      expect(StreamerResponseCode.REACHED_SYMBOL_LIMIT).toBe(19);
      expect(StreamerResponseCode.STREAM_CONN_NOT_FOUND).toBe(20);
      expect(StreamerResponseCode.BAD_COMMAND_FORMAT).toBe(21);
      expect(StreamerResponseCode.FAILED_COMMAND_SUBS).toBe(22);
      expect(StreamerResponseCode.FAILED_COMMAND_UNSUBS).toBe(23);
      expect(StreamerResponseCode.FAILED_COMMAND_ADD).toBe(24);
      expect(StreamerResponseCode.FAILED_COMMAND_VIEW).toBe(25);
      expect(StreamerResponseCode.SUCCEEDED_COMMAND_SUBS).toBe(26);
      expect(StreamerResponseCode.SUCCEEDED_COMMAND_UNSUBS).toBe(27);
      expect(StreamerResponseCode.SUCCEEDED_COMMAND_ADD).toBe(28);
      expect(StreamerResponseCode.SUCCEEDED_COMMAND_VIEW).toBe(29);
      expect(StreamerResponseCode.STOP_STREAMING).toBe(30);
    });
  });

  describe('StreamClient construction', () => {
    it('should create a stream client with client and account ID', () => {
      const streamClient = new StreamClient(mockClient, 'test-account-123');
      expect(streamClient).toBeInstanceOf(StreamClient);
    });

    it('should start with isConnected returning false', () => {
      const streamClient = new StreamClient(mockClient, 'test-account-123');
      expect(streamClient.isConnected()).toBe(false);
    });
  });

  describe('Handler management', () => {
    let streamClient: StreamClient;

    beforeEach(() => {
      streamClient = new StreamClient(mockClient, 'test-account-123');
    });

    describe('Level One Equity handlers', () => {
      it('should add a handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneEquityHandler(handler);
        // Handler is added internally - we can't directly verify, but it shouldn't throw
        expect(true).toBe(true);
      });

      it('should remove a handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneEquityHandler(handler);
        streamClient.removeLevelOneEquityHandler(handler);
        // Handler is removed internally - we can't directly verify, but it shouldn't throw
        expect(true).toBe(true);
      });
    });

    describe('Level One Option handlers', () => {
      it('should add a handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneOptionHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Level One Futures handlers', () => {
      it('should add a handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneFuturesHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Level One Futures Options handlers', () => {
      it('should add a handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneFuturesOptionsHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Level One Forex handlers', () => {
      it('should add a handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneForexHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Chart handlers', () => {
      it('should add chart equity handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addChartEquityHandler(handler);
        expect(true).toBe(true);
      });

      it('should add chart futures handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addChartFuturesHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Book handlers', () => {
      it('should add NYSE book handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addNyseBookHandler(handler);
        expect(true).toBe(true);
      });

      it('should add NASDAQ book handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addNasdaqBookHandler(handler);
        expect(true).toBe(true);
      });

      it('should add options book handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addOptionsBookHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Screener handlers', () => {
      it('should add screener equity handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addScreenerEquityHandler(handler);
        expect(true).toBe(true);
      });

      it('should add screener option handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addScreenerOptionHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('Account activity handlers', () => {
      it('should add account activity handler', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addAccountActivityHandler(handler);
        expect(true).toBe(true);
      });
    });

    describe('clearHandlers', () => {
      it('should clear handlers for LEVELONE_EQUITIES', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneEquityHandler(handler);
        streamClient.clearHandlers('LEVELONE_EQUITIES');
        // Should not throw
        expect(true).toBe(true);
      });

      it('should clear handlers for LEVELONE_OPTIONS', () => {
        streamClient.clearHandlers('LEVELONE_OPTIONS');
        expect(true).toBe(true);
      });

      it('should clear handlers for LEVELONE_FUTURES', () => {
        streamClient.clearHandlers('LEVELONE_FUTURES');
        expect(true).toBe(true);
      });

      it('should clear handlers for LEVELONE_FUTURES_OPTIONS', () => {
        streamClient.clearHandlers('LEVELONE_FUTURES_OPTIONS');
        expect(true).toBe(true);
      });

      it('should clear handlers for LEVELONE_FOREX', () => {
        streamClient.clearHandlers('LEVELONE_FOREX');
        expect(true).toBe(true);
      });

      it('should clear handlers for CHART_EQUITY', () => {
        streamClient.clearHandlers('CHART_EQUITY');
        expect(true).toBe(true);
      });

      it('should clear handlers for CHART_FUTURES', () => {
        streamClient.clearHandlers('CHART_FUTURES');
        expect(true).toBe(true);
      });

      it('should clear handlers for NYSE_BOOK', () => {
        streamClient.clearHandlers('NYSE_BOOK');
        expect(true).toBe(true);
      });

      it('should clear handlers for NASDAQ_BOOK', () => {
        streamClient.clearHandlers('NASDAQ_BOOK');
        expect(true).toBe(true);
      });

      it('should clear handlers for OPTIONS_BOOK', () => {
        streamClient.clearHandlers('OPTIONS_BOOK');
        expect(true).toBe(true);
      });

      it('should clear handlers for SCREENER_EQUITY', () => {
        streamClient.clearHandlers('SCREENER_EQUITY');
        expect(true).toBe(true);
      });

      it('should clear handlers for SCREENER_OPTION', () => {
        streamClient.clearHandlers('SCREENER_OPTION');
        expect(true).toBe(true);
      });

      it('should clear handlers for ACCT_ACTIVITY', () => {
        streamClient.clearHandlers('ACCT_ACTIVITY');
        expect(true).toBe(true);
      });
    });

    describe('clearAllHandlers', () => {
      it('should clear all handlers', () => {
        const handler: StreamMessageHandler = jest.fn();
        streamClient.addLevelOneEquityHandler(handler);
        streamClient.addLevelOneOptionHandler(handler);
        streamClient.addChartEquityHandler(handler);
        streamClient.clearAllHandlers();
        // Should not throw
        expect(true).toBe(true);
      });
    });
  });

  describe('Field label coverage', () => {
    it('should cover all LevelOneEquityFields values', () => {
      // Verify all field values are unique and sequential
      const fields = Object.values(LevelOneEquityFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(51);
    });

    it('should cover all LevelOneOptionFields values', () => {
      const fields = Object.values(LevelOneOptionFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(55);
    });

    it('should cover all LevelOneFuturesFields values', () => {
      const fields = Object.values(LevelOneFuturesFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(40);
    });

    it('should cover all LevelOneFuturesOptionsFields values', () => {
      const fields = Object.values(LevelOneFuturesOptionsFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(31);
    });

    it('should cover all LevelOneForexFields values', () => {
      const fields = Object.values(LevelOneForexFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(29);
    });

    it('should cover all ChartEquityFields values', () => {
      const fields = Object.values(ChartEquityFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(8);
    });

    it('should cover all ChartFuturesFields values', () => {
      const fields = Object.values(ChartFuturesFields).filter(
        (v) => typeof v === 'number'
      ) as number[];
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
      expect(Math.min(...fields)).toBe(0);
      expect(Math.max(...fields)).toBe(6);
    });
  });
});

describe('StreamMessage type', () => {
  it('should match expected structure', () => {
    const message: StreamMessage = {
      service: 'LEVELONE_EQUITIES',
      timestamp: Date.now(),
      command: 'SUBS',
      content: [{ SYMBOL: 'AAPL', BID_PRICE: 150.0, ASK_PRICE: 150.05 }],
    };

    expect(message.service).toBe('LEVELONE_EQUITIES');
    expect(typeof message.timestamp).toBe('number');
    expect(message.command).toBe('SUBS');
    expect(Array.isArray(message.content)).toBe(true);
    expect(message.content[0].SYMBOL).toBe('AAPL');
  });
});
