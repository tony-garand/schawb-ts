import { MarketDataAPI, QuoteRequestParams } from '../src/api/marketData';
import { SchwabOAuth } from '../src/auth/oauth';
import { SchwabClient } from '../src';

// Mock the OAuth class
jest.mock('../src/auth/oauth');

describe('MarketDataAPI', () => {
  let marketDataAPI: MarketDataAPI;
  let mockOAuth: jest.Mocked<SchwabOAuth>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock OAuth instance
    mockOAuth = {
      getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer mock-token'),
      getTokens: jest.fn().mockReturnValue({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer'
      }),
    } as any;

    // Create MarketDataAPI instance
    marketDataAPI = new MarketDataAPI(mockOAuth, 'sandbox');
  });

  describe('constructor', () => {
    it('should create instance with correct base URL for sandbox', () => {
      const api = new MarketDataAPI(mockOAuth, 'sandbox');
      expect(api).toBeInstanceOf(MarketDataAPI);
    });

    it('should create instance with correct base URL for production', () => {
      const api = new MarketDataAPI(mockOAuth, 'production');
      expect(api).toBeInstanceOf(MarketDataAPI);
    });
  });

  describe('getQuotes', () => {
    it('should make request with correct parameters', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const params: QuoteRequestParams = {
        symbols: 'AAPL,MSFT',
        fields: 'quote,reference',
        indicative: false,
      };

      await marketDataAPI.getQuotes(params);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-sandbox.schwab.com/marketdata/v1/quotes?symbols=AAPL%2CMSFT&fields=quote%2Creference&indicative=false',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getQuoteBySymbol', () => {
    it('should make request with correct URL', async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await marketDataAPI.getQuoteBySymbol('AAPL', 'quote,reference');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-sandbox.schwab.com/marketdata/v1/AAPL/quotes?fields=quote%2Creference',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getQuotesForSymbols', () => {
    it('should call getQuotes with joined symbols', async () => {
      const spy = jest.spyOn(marketDataAPI, 'getQuotes').mockResolvedValue({});

      const symbols = ['AAPL', 'MSFT', 'GOOGL'];
      const options = {
        fields: 'quote,reference',
        indicative: true,
      };

      await marketDataAPI.getQuotesForSymbols(symbols, options);

      expect(spy).toHaveBeenCalledWith({
        symbols: 'AAPL,MSFT,GOOGL',
        fields: 'quote,reference',
        indicative: true,
      });

      spy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should throw error for non-ok response', async () => {
      // Mock fetch to return error
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Bad Request'),
      });

      await expect(marketDataAPI.getQuotes({ symbols: 'INVALID' }))
        .rejects
        .toThrow('HTTP 400: Bad Request');
    });
  });

  describe('getOptionChains', () => {
    it('should make request with correct parameters', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      const params = {
        symbol: 'AAPL',
        contractType: 'ALL' as const,
        strikeCount: 5,
        includeUnderlyingQuote: true,
        strategy: 'SINGLE' as const,
      };
      await marketDataAPI.getOptionChains(params);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chains?'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getOptionExpirationChain', () => {
    it('should make request with correct URL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      await marketDataAPI.getOptionExpirationChain('AAPL');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/expirationchain?symbol=AAPL'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getPriceHistory', () => {
    it('should make request with correct parameters', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      const params = {
        symbol: 'AAPL',
        periodType: 'day' as const,
        period: 5,
        frequencyType: 'minute' as const,
        frequency: 5,
        needExtendedHoursData: false,
        needPreviousClose: true,
      };
      await marketDataAPI.getPriceHistory(params);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/pricehistory?'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getPriceHistoryForSymbol', () => {
    it('should call getPriceHistory with correct parameters', async () => {
      const spy = jest.spyOn(marketDataAPI, 'getPriceHistory').mockResolvedValue({} as any);
      await marketDataAPI.getPriceHistoryForSymbol('AAPL', 'day', 10, {
        frequencyType: 'minute',
        frequency: 5,
      });
      expect(spy).toHaveBeenCalledWith({
        symbol: 'AAPL',
        periodType: 'day',
        period: 10,
        frequencyType: 'minute',
        frequency: 5,
      });
      spy.mockRestore();
    });
  });

  describe('getMovers', () => {
    it('should make request with correct parameters', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });
      const params = {
        symbolId: '$DJI' as const,
        sort: 'VOLUME' as const,
        frequency: 5 as const,
      };
      await marketDataAPI.getMovers(params);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/movers/%24DJI?'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('getMoversForIndex', () => {
    it('should call getMovers with correct parameters', async () => {
      const spy = jest.spyOn(marketDataAPI, 'getMovers').mockResolvedValue({} as any);
      await marketDataAPI.getMoversForIndex('$SPX', {
        sort: 'PERCENT_CHANGE_UP',
        frequency: 10,
      });
      expect(spy).toHaveBeenCalledWith({
        symbolId: '$SPX',
        sort: 'PERCENT_CHANGE_UP',
        frequency: 10,
      });
      spy.mockRestore();
    });
  });

  describe('Market Hours', () => {
    it('should get market hours for multiple markets', async () => {
      const mockResponse = {
        equity: {
          EQ: {
            date: '2024-01-15',
            marketType: 'EQUITY',
            product: 'EQ',
            productName: 'equity',
            isOpen: true,
            sessionHours: {
              preMarket: [
                {
                  start: '2024-01-15T07:00:00-05:00',
                  end: '2024-01-15T09:30:00-05:00'
                }
              ],
              regularMarket: [
                {
                  start: '2024-01-15T09:30:00-05:00',
                  end: '2024-01-15T16:00:00-05:00'
                }
              ],
              postMarket: [
                {
                  start: '2024-01-15T16:00:00-05:00',
                  end: '2024-01-15T20:00:00-05:00'
                }
              ]
            }
          }
        },
        option: {
          EQO: {
            date: '2024-01-15',
            marketType: 'OPTION',
            product: 'EQO',
            productName: 'equity option',
            isOpen: true,
            sessionHours: {
              regularMarket: [
                {
                  start: '2024-01-15T09:30:00-05:00',
                  end: '2024-01-15T16:00:00-05:00'
                }
              ]
            }
          }
        }
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getMarketHours({
        markets: ['equity', 'option'],
        date: '2024-01-15'
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/markets?markets=equity%2Coption&date=2024-01-15'),
        expect.any(Object)
      );
    });

    it('should get market hours for a single market', async () => {
      const mockResponse = {
        equity: {
          EQ: {
            date: '2024-01-15',
            marketType: 'EQUITY',
            exchange: 'NULL',
            category: 'NULL',
            product: 'EQ',
            productName: 'equity',
            isOpen: true,
            sessionHours: {
              preMarket: [
                {
                  start: '2024-01-15T07:00:00-05:00',
                  end: '2024-01-15T09:30:00-05:00'
                }
              ],
              regularMarket: [
                {
                  start: '2024-01-15T09:30:00-05:00',
                  end: '2024-01-15T16:00:00-05:00'
                }
              ],
              postMarket: [
                {
                  start: '2024-01-15T16:00:00-05:00',
                  end: '2024-01-15T20:00:00-05:00'
                }
              ]
            }
          }
        }
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getMarketHoursForMarket('equity', '2024-01-15');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/markets/equity?date=2024-01-15'),
        expect.any(Object)
      );
    });

    it('should get market hours for markets with convenience method', async () => {
      const mockResponse = {
        equity: {
          EQ: {
            date: '2024-01-15',
            marketType: 'EQUITY',
            product: 'EQ',
            productName: 'equity',
            isOpen: true,
            sessionHours: {
              regularMarket: [
                {
                  start: '2024-01-15T09:30:00-05:00',
                  end: '2024-01-15T16:00:00-05:00'
                }
              ]
            }
          }
        }
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getMarketHoursForMarkets(['equity'], '2024-01-15');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/markets?markets=equity&date=2024-01-15'),
        expect.any(Object)
      );
    });

    it('should get current day market hours when no date is specified', async () => {
      const mockResponse = {
        equity: {
          EQ: {
            date: '2024-01-15',
            marketType: 'EQUITY',
            product: 'EQ',
            productName: 'equity',
            isOpen: true,
            sessionHours: {
              regularMarket: [
                {
                  start: '2024-01-15T09:30:00-05:00',
                  end: '2024-01-15T16:00:00-05:00'
                }
              ]
            }
          }
        }
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getMarketHours({
        markets: ['equity']
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/markets?markets=equity'),
        expect.any(Object)
      );
    });

    it('should handle market hours API errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request - Invalid market type',
        json: async () => ({
          errors: [
            {
              id: 'test-error-id',
              status: '400',
              title: 'Bad Request',
              detail: 'Invalid market type'
            }
          ]
        })
      });

      await expect(
        marketDataAPI.getMarketHours({
          markets: ['invalid-market' as any]
        })
      ).rejects.toThrow('HTTP 400: Bad Request - Invalid market type');
    });
  });

  describe('Instruments', () => {
    it('should get instruments by symbols and projections', async () => {
      const mockResponse = {
        instruments: [
          {
            cusip: '037833100',
            symbol: 'AAPL',
            description: 'Apple Inc',
            exchange: 'NASDAQ',
            assetType: 'EQUITY'
          },
          {
            cusip: '060505104',
            symbol: 'BAC',
            description: 'Bank Of America Corp',
            exchange: 'NYSE',
            assetType: 'EQUITY'
          }
        ]
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getInstruments({
        symbol: 'AAPL,BAC',
        projection: 'symbol-search'
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/instruments?symbol=AAPL%2CBAC&projection=symbol-search'),
        expect.any(Object)
      );
    });

    it('should get instrument by specific CUSIP', async () => {
      const mockResponse = {
        cusip: '037833100',
        symbol: 'AAPL',
        description: 'Apple Inc',
        exchange: 'NASDAQ',
        assetType: 'EQUITY'
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getInstrumentByCusip('037833100');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/instruments/037833100'),
        expect.any(Object)
      );
    });

    it('should search instruments with convenience method', async () => {
      const mockResponse = {
        instruments: [
          {
            cusip: '037833100',
            symbol: 'AAPL',
            description: 'Apple Inc',
            exchange: 'NASDAQ',
            assetType: 'EQUITY'
          }
        ]
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.searchInstruments('AAPL', 'symbol-search');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/instruments?symbol=AAPL&projection=symbol-search'),
        expect.any(Object)
      );
    });

    it('should get fundamental instruments', async () => {
      const mockResponse = {
        instruments: [
          {
            cusip: '037833100',
            symbol: 'AAPL',
            description: 'Apple Inc',
            exchange: 'NASDAQ',
            assetType: 'EQUITY'
          }
        ]
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.getFundamentalInstruments('AAPL');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/instruments?symbol=AAPL&projection=fundamental'),
        expect.any(Object)
      );
    });

    it('should use default projection when not specified', async () => {
      const mockResponse = {
        instruments: [
          {
            cusip: '037833100',
            symbol: 'AAPL',
            description: 'Apple Inc',
            exchange: 'NASDAQ',
            assetType: 'EQUITY'
          }
        ]
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await marketDataAPI.searchInstruments('AAPL');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/instruments?symbol=AAPL&projection=symbol-search'),
        expect.any(Object)
      );
    });

    it('should handle instruments API errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request - Invalid symbol',
        json: async () => ({
          errors: [
            {
              id: 'test-error-id',
              status: '400',
              title: 'Bad Request',
              detail: 'Invalid symbol'
            }
          ]
        })
      });

      await expect(
        marketDataAPI.getInstruments({
          symbol: 'INVALID',
          projection: 'symbol-search'
        })
      ).rejects.toThrow('HTTP 400: Bad Request - Invalid symbol');
    });

    it('should handle CUSIP not found errors', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found - CUSIP not found',
        json: async () => ({
          errors: [
            {
              id: 'test-error-id',
              status: '404',
              title: 'Not Found',
              detail: 'CUSIP not found'
            }
          ]
        })
      });

      await expect(
        marketDataAPI.getInstrumentByCusip('INVALID_CUSIP')
      ).rejects.toThrow('HTTP 404: Not Found - CUSIP not found');
    });
  });
});

// SchwabClient integration test for getOptionChains
describe('SchwabClient', () => {
  it('should call marketData.getOptionChains', async () => {
    const client = new SchwabClient({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'uri',
      environment: 'sandbox',
    });
    // Mock the underlying method
    client.marketData.getOptionChains = jest.fn().mockResolvedValue({});
    const params = { symbol: 'AAPL' };
    await client.getOptionChains(params);
    expect(client.marketData.getOptionChains).toHaveBeenCalledWith(params);
  });

  it('should call marketData.getOptionExpirationChain', async () => {
    const client = new SchwabClient({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'uri',
      environment: 'sandbox',
    });
    client.marketData.getOptionExpirationChain = jest.fn().mockResolvedValue({});
    await client.getOptionExpirationChain('AAPL');
    expect(client.marketData.getOptionExpirationChain).toHaveBeenCalledWith('AAPL');
  });

  it('should call marketData.getPriceHistory', async () => {
    const client = new SchwabClient({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'uri',
      environment: 'sandbox',
    });
    client.marketData.getPriceHistory = jest.fn().mockResolvedValue({});
    const params = { symbol: 'AAPL', periodType: 'day' as const };
    await client.getPriceHistory(params);
    expect(client.marketData.getPriceHistory).toHaveBeenCalledWith(params);
  });

  it('should call marketData.getPriceHistoryForSymbol', async () => {
    const client = new SchwabClient({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'uri',
      environment: 'sandbox',
    });
    client.marketData.getPriceHistoryForSymbol = jest.fn().mockResolvedValue({});
    await client.getPriceHistoryForSymbol('AAPL', 'day', 10);
    expect(client.marketData.getPriceHistoryForSymbol).toHaveBeenCalledWith('AAPL', 'day', 10, undefined);
  });

  it('should call marketData.getMovers', async () => {
    const client = new SchwabClient({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'uri',
      environment: 'sandbox',
    });
    client.marketData.getMovers = jest.fn().mockResolvedValue({});
    const params = { symbolId: '$DJI' as const };
    await client.getMovers(params);
    expect(client.marketData.getMovers).toHaveBeenCalledWith(params);
  });

  it('should call marketData.getMoversForIndex', async () => {
    const client = new SchwabClient({
      clientId: 'id',
      clientSecret: 'secret',
      redirectUri: 'uri',
      environment: 'sandbox',
    });
    client.marketData.getMoversForIndex = jest.fn().mockResolvedValue({});
    await client.getMoversForIndex('$SPX');
    expect(client.marketData.getMoversForIndex).toHaveBeenCalledWith('$SPX', undefined);
  });
}); 