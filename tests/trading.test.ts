import { SchwabTradingAPI } from '../src/api/trading';
import { SchwabOAuth } from '../src/auth/oauth';

// Mock the OAuth module
jest.mock('../src/auth/oauth');

describe('SchwabTradingAPI', () => {
  let tradingAPI: SchwabTradingAPI;
  let mockOAuth: jest.Mocked<SchwabOAuth>;

  beforeEach(() => {
    // Create mock OAuth instance
    mockOAuth = {
      getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer mock-token'),
    } as any;

    // Create trading API instance with sandbox environment
    tradingAPI = new SchwabTradingAPI(mockOAuth, 'sandbox');

    // Reset fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with sandbox environment', () => {
      const sandboxAPI = new SchwabTradingAPI(mockOAuth, 'sandbox');
      expect(sandboxAPI).toBeInstanceOf(SchwabTradingAPI);
    });

    it('should create instance with production environment', () => {
      const prodAPI = new SchwabTradingAPI(mockOAuth, 'production');
      expect(prodAPI).toBeInstanceOf(SchwabTradingAPI);
    });

    it('should default to production environment', () => {
      const defaultAPI = new SchwabTradingAPI(mockOAuth);
      expect(defaultAPI).toBeInstanceOf(SchwabTradingAPI);
    });
  });

  describe('getQuote', () => {
    it('should fetch quote for a symbol', async () => {
      const mockQuote = {
        symbol: 'AAPL',
        description: 'Apple Inc',
        lastPrice: 150.25,
        bidPrice: 150.20,
        askPrice: 150.30,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockQuote),
      });

      const result = await tradingAPI.getQuote('AAPL');

      expect(result).toEqual(mockQuote);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/marketdata/quotes/AAPL',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Symbol not found'),
      });

      await expect(tradingAPI.getQuote('INVALID'))
        .rejects
        .toThrow('Failed to get quote: HTTP 404: Symbol not found');
    });
  });

  describe('getQuotes', () => {
    it('should fetch quotes for multiple symbols', async () => {
      const mockQuotes = [
        { symbol: 'AAPL', lastPrice: 150.25 },
        { symbol: 'MSFT', lastPrice: 380.50 },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockQuotes),
      });

      const result = await tradingAPI.getQuotes(['AAPL', 'MSFT']);

      expect(result).toEqual(mockQuotes);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/marketdata/quotes?symbols=AAPL,MSFT',
        expect.any(Object)
      );
    });

    it('should handle API errors for quotes', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid symbols'),
      });

      await expect(tradingAPI.getQuotes(['INVALID']))
        .rejects
        .toThrow('Failed to get quotes: HTTP 400: Invalid symbols');
    });
  });

  describe('getMarketHours', () => {
    it('should fetch market hours for a date', async () => {
      const mockHours = {
        category: 'equity',
        date: '2024-01-15',
        isOpen: true,
        sessionHours: {
          preMarket: [{ start: '04:00', end: '09:30' }],
          regularMarket: [{ start: '09:30', end: '16:00' }],
          postMarket: [{ start: '16:00', end: '20:00' }],
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHours),
      });

      const result = await tradingAPI.getMarketHours('2024-01-15', 'EQUITY');

      expect(result).toEqual(mockHours);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/marketdata/hours?date=2024-01-15&market=EQUITY',
        expect.any(Object)
      );
    });

    it('should use default EQUITY market', async () => {
      const mockHours = { isOpen: true };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHours),
      });

      await tradingAPI.getMarketHours('2024-01-15');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/marketdata/hours?date=2024-01-15&market=EQUITY',
        expect.any(Object)
      );
    });

    it('should handle API errors for market hours', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid date format'),
      });

      await expect(tradingAPI.getMarketHours('invalid-date'))
        .rejects
        .toThrow('Failed to get market hours: HTTP 400: Invalid date format');
    });
  });

  describe('searchInstruments', () => {
    it('should search for instruments', async () => {
      const mockResults = [
        { symbol: 'AAPL', description: 'Apple Inc' },
        { symbol: 'AAPLW', description: 'Apple Inc Warrant' },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResults),
      });

      const result = await tradingAPI.searchInstruments('AAPL', 'symbol-search');

      expect(result).toEqual(mockResults);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/instruments?symbol=AAPL&projection=symbol-search',
        expect.any(Object)
      );
    });

    it('should use default symbol-search projection', async () => {
      const mockResults = [];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResults),
      });

      await tradingAPI.searchInstruments('AAPL');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/instruments?symbol=AAPL&projection=symbol-search',
        expect.any(Object)
      );
    });

    it('should handle API errors for search', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal server error'),
      });

      await expect(tradingAPI.searchInstruments('AAPL'))
        .rejects
        .toThrow('Failed to search instruments: HTTP 500: Internal server error');
    });
  });

  describe('getInstrument', () => {
    it('should fetch instrument details', async () => {
      const mockInstrument = {
        symbol: 'AAPL',
        cusip: '037833100',
        description: 'Apple Inc',
        exchange: 'NASDAQ',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockInstrument),
      });

      const result = await tradingAPI.getInstrument('AAPL');

      expect(result).toEqual(mockInstrument);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/instruments/AAPL',
        expect.any(Object)
      );
    });

    it('should handle API errors for instrument', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Instrument not found'),
      });

      await expect(tradingAPI.getInstrument('INVALID'))
        .rejects
        .toThrow('Failed to get instrument: HTTP 404: Instrument not found');
    });
  });

  describe('error handling', () => {
    it('should handle non-Error objects in error handling', async () => {
      global.fetch = jest.fn().mockRejectedValue('String error');

      await expect(tradingAPI.getQuote('AAPL'))
        .rejects
        .toThrow('Failed to get quote: String error');
    });

    it('should handle Error objects in error handling', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(tradingAPI.getQuote('AAPL'))
        .rejects
        .toThrow('Failed to get quote: Network error');
    });
  });

  describe('makeRequest with production environment', () => {
    it('should use production URL', async () => {
      const prodAPI = new SchwabTradingAPI(mockOAuth, 'production');

      const mockQuote = { symbol: 'AAPL', lastPrice: 150.25 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockQuote),
      });

      await prodAPI.getQuote('AAPL');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/marketdata/quotes/AAPL',
        expect.any(Object)
      );
    });
  });

  describe('OAuth integration', () => {
    it('should call getAuthorizationHeader for authentication', async () => {
      const mockQuote = { symbol: 'AAPL', lastPrice: 150.25 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockQuote),
      });

      await tradingAPI.getQuote('AAPL');

      expect(mockOAuth.getAuthorizationHeader).toHaveBeenCalled();
    });

    it('should include authorization header in requests', async () => {
      const mockQuote = { symbol: 'AAPL', lastPrice: 150.25 };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockQuote),
      });

      await tradingAPI.getQuote('AAPL');

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const headers = fetchCall[1].headers;

      expect(headers['Authorization']).toBe('Bearer mock-token');
      expect(headers['Content-Type']).toBe('application/json');
    });
  });
});
