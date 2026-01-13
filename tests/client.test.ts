import { SchwabClient } from '../src/client';
import { SchwabClientConfig, OAuthTokens, Order } from '../src/types';
import { OrderBuilder, OrderLegBuilder } from '../src/builders/orderBuilder';

// Mock all API modules
jest.mock('../src/auth/oauth');
jest.mock('../src/api/trading');
jest.mock('../src/api/accounts');
jest.mock('../src/api/orders');
jest.mock('../src/api/transactions');
jest.mock('../src/api/userPreference');
jest.mock('../src/api/marketData');

describe('SchwabClient', () => {
  let client: SchwabClient;
  let config: SchwabClientConfig;

  beforeEach(() => {
    config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://test-app.com/callback',
      environment: 'sandbox',
    };

    client = new SchwabClient(config);
  });

  describe('constructor', () => {
    it('should create client with sandbox environment', () => {
      const sandboxClient = new SchwabClient({
        ...config,
        environment: 'sandbox',
      });

      expect(sandboxClient).toBeInstanceOf(SchwabClient);
    });

    it('should create client with production environment', () => {
      const prodClient = new SchwabClient({
        ...config,
        environment: 'production',
      });

      expect(prodClient).toBeInstanceOf(SchwabClient);
    });

    it('should initialize all API modules', () => {
      expect(client.orders).toBeDefined();
      expect(client.accounts).toBeDefined();
      expect(client.transactions).toBeDefined();
      expect(client.userPreference).toBeDefined();
      expect(client.marketData).toBeDefined();
    });
  });

  describe('OAuth Methods', () => {
    describe('getAuthorizationUrl', () => {
      it('should return authorization URL without state', () => {
        (client as any).oauth.getAuthorizationUrl = jest.fn().mockReturnValue('https://auth.url');
        const url = client.getAuthorizationUrl();
        expect(typeof url).toBe('string');
      });

      it('should return authorization URL with state', () => {
        (client as any).oauth.getAuthorizationUrl = jest.fn().mockReturnValue('https://auth.url?state=test');
        const url = client.getAuthorizationUrl('test-state');
        expect(typeof url).toBe('string');
      });
    });

    describe('completeOAuth', () => {
      it('should complete OAuth flow', async () => {
        const mockTokens: OAuthTokens = {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'api',
        };

        // Mock the oauth module
        (client as any).oauth.exchangeCodeForTokens = jest.fn().mockResolvedValue(mockTokens);

        const result = await client.completeOAuth('auth-code');

        expect((client as any).oauth.exchangeCodeForTokens).toHaveBeenCalledWith('auth-code');
        expect(result).toEqual(mockTokens);
      });
    });

    describe('refreshTokens', () => {
      it('should refresh tokens', async () => {
        const mockTokens: OAuthTokens = {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'api',
        };

        (client as any).oauth.refreshTokens = jest.fn().mockResolvedValue(mockTokens);

        const result = await client.refreshTokens();

        expect((client as any).oauth.refreshTokens).toHaveBeenCalled();
        expect(result).toEqual(mockTokens);
      });

      it('should refresh tokens with custom refresh token', async () => {
        const mockTokens: OAuthTokens = {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'api',
        };

        (client as any).oauth.refreshTokens = jest.fn().mockResolvedValue(mockTokens);

        await client.refreshTokens('custom-refresh-token');

        expect((client as any).oauth.refreshTokens).toHaveBeenCalledWith('custom-refresh-token');
      });
    });

    describe('hasValidTokens', () => {
      it('should check if tokens are valid', () => {
        (client as any).oauth.hasValidTokens = jest.fn().mockReturnValue(true);

        const result = client.hasValidTokens();

        expect(result).toBe(true);
      });
    });

    describe('getTokens', () => {
      it('should return current tokens', () => {
        const mockTokens: OAuthTokens = {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'api',
        };

        (client as any).oauth.getTokens = jest.fn().mockReturnValue(mockTokens);

        const result = client.getTokens();

        expect(result).toEqual(mockTokens);
      });
    });

    describe('setTokens', () => {
      it('should set tokens', () => {
        const mockTokens: OAuthTokens = {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'api',
        };

        (client as any).oauth.setTokens = jest.fn();

        client.setTokens(mockTokens);

        expect((client as any).oauth.setTokens).toHaveBeenCalledWith(mockTokens, undefined);
      });

      it('should set tokens with expiry time', () => {
        const mockTokens: OAuthTokens = {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'api',
        };

        (client as any).oauth.setTokens = jest.fn();

        const expiryTime = Date.now() + 3600000;
        client.setTokens(mockTokens, expiryTime);

        expect((client as any).oauth.setTokens).toHaveBeenCalledWith(mockTokens, expiryTime);
      });
    });

    describe('clearTokens', () => {
      it('should clear tokens', () => {
        (client as any).oauth.clearTokens = jest.fn();

        client.clearTokens();

        expect((client as any).oauth.clearTokens).toHaveBeenCalled();
      });
    });
  });

  describe('Order Methods', () => {
    const accountNumber = 'test-account-123';
    const orderId = 12345;

    describe('placeOrder', () => {
      it('should place an order', async () => {
        const order: Order = new OrderBuilder()
          .setOrderType('MARKET')
          .addOrderLeg(
            new OrderLegBuilder()
              .setInstruction('BUY')
              .setQuantity(10)
              .setInstrument('AAPL', 'EQUITY')
              .build()
          )
          .build();

        const mockResponse = { orderId: 54321 };
        client.orders.placeOrder = jest.fn().mockResolvedValue(mockResponse);

        const result = await client.placeOrder(order, accountNumber);

        expect(client.orders.placeOrder).toHaveBeenCalledWith(accountNumber, order);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getOrder', () => {
      it('should get an order by ID', async () => {
        const mockOrder = { orderId, status: 'FILLED' };
        client.orders.getOrder = jest.fn().mockResolvedValue(mockOrder);

        const result = await client.getOrder(orderId, accountNumber);

        expect(client.orders.getOrder).toHaveBeenCalledWith(accountNumber, orderId);
        expect(result).toEqual(mockOrder);
      });
    });

    describe('cancelOrder', () => {
      it('should cancel an order', async () => {
        client.orders.cancelOrder = jest.fn().mockResolvedValue(undefined);

        await client.cancelOrder(orderId, accountNumber);

        expect(client.orders.cancelOrder).toHaveBeenCalledWith(accountNumber, orderId);
      });
    });

    describe('replaceOrder', () => {
      it('should replace an order', async () => {
        const newOrder: Order = new OrderBuilder()
          .setOrderType('LIMIT')
          .setPrice(150)
          .addOrderLeg(
            new OrderLegBuilder()
              .setInstruction('BUY')
              .setQuantity(20)
              .setInstrument('AAPL', 'EQUITY')
              .build()
          )
          .build();

        const mockResponse = { orderId: 54322 };
        client.orders.replaceOrder = jest.fn().mockResolvedValue(mockResponse);

        const result = await client.replaceOrder(orderId, accountNumber, newOrder);

        expect(client.orders.replaceOrder).toHaveBeenCalledWith(accountNumber, orderId, newOrder);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getOrdersForAccount', () => {
      it('should get orders for an account without params', async () => {
        const mockOrders = [{ orderId: 1 }, { orderId: 2 }];
        client.orders.getOrdersForAccount = jest.fn().mockResolvedValue(mockOrders);

        const result = await client.getOrdersForAccount(accountNumber);

        expect(client.orders.getOrdersForAccount).toHaveBeenCalledWith(accountNumber, {});
        expect(result).toEqual(mockOrders);
      });

      it('should get orders for an account with params', async () => {
        const mockOrders = [{ orderId: 1 }];
        const params = { maxResults: 10, status: 'FILLED' as const };
        client.orders.getOrdersForAccount = jest.fn().mockResolvedValue(mockOrders);

        const result = await client.getOrdersForAccount(accountNumber, params);

        expect(client.orders.getOrdersForAccount).toHaveBeenCalledWith(accountNumber, params);
        expect(result).toEqual(mockOrders);
      });
    });

    describe('getAllOrders', () => {
      it('should get all orders without params', async () => {
        const mockOrders = [{ orderId: 1 }, { orderId: 2 }];
        client.orders.getAllOrders = jest.fn().mockResolvedValue(mockOrders);

        const result = await client.getAllOrders();

        expect(client.orders.getAllOrders).toHaveBeenCalledWith({});
        expect(result).toEqual(mockOrders);
      });

      it('should get all orders with params', async () => {
        const mockOrders = [{ orderId: 1 }];
        const params = { maxResults: 5 };
        client.orders.getAllOrders = jest.fn().mockResolvedValue(mockOrders);

        const result = await client.getAllOrders(params);

        expect(client.orders.getAllOrders).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockOrders);
      });
    });

    describe('previewOrder', () => {
      it('should preview an order', async () => {
        const order: Order = new OrderBuilder()
          .setOrderType('LIMIT')
          .setPrice(100)
          .addOrderLeg(
            new OrderLegBuilder()
              .setInstruction('BUY')
              .setQuantity(10)
              .setInstrument('MSFT', 'EQUITY')
              .build()
          )
          .build();

        const mockPreview = { orderId: 0, commissionAndFee: {} };
        client.orders.previewOrder = jest.fn().mockResolvedValue(mockPreview);

        const result = await client.previewOrder(accountNumber, order);

        expect(client.orders.previewOrder).toHaveBeenCalledWith(accountNumber, order);
        expect(result).toEqual(mockPreview);
      });
    });
  });

  describe('Account Methods', () => {
    const accountId = '123456789';

    describe('getAccount', () => {
      it('should get account information', async () => {
        const mockAccount = {
          securitiesAccount: {
            accountNumber: accountId,
            type: 'CASH',
          },
        };
        client.accounts.getAccount = jest.fn().mockResolvedValue(mockAccount);

        const result = await client.getAccount(accountId);

        expect(client.accounts.getAccount).toHaveBeenCalledWith(accountId);
        expect(result).toEqual(mockAccount);
      });
    });

    describe('getPositions', () => {
      it('should get positions for an account', async () => {
        const mockPositions = [
          {
            instrument: { symbol: 'AAPL', assetType: 'EQUITY' },
            longQuantity: 100,
          },
        ];
        client.accounts.getPositions = jest.fn().mockResolvedValue(mockPositions);

        const result = await client.getPositions(accountId);

        expect(client.accounts.getPositions).toHaveBeenCalledWith(accountId);
        expect(result).toEqual(mockPositions);
      });
    });

    describe('getAccounts', () => {
      it('should get all accounts', async () => {
        const mockAccounts = [
          { securitiesAccount: { accountNumber: '111', type: 'CASH' } },
          { securitiesAccount: { accountNumber: '222', type: 'MARGIN' } },
        ];
        client.accounts.getAccounts = jest.fn().mockResolvedValue(mockAccounts);

        const result = await client.getAccounts();

        expect(client.accounts.getAccounts).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(mockAccounts);
      });

      it('should get accounts with fields parameter', async () => {
        const mockAccounts = [
          { securitiesAccount: { accountNumber: '111' }, positions: [] },
        ];
        client.accounts.getAccounts = jest.fn().mockResolvedValue(mockAccounts);

        const result = await client.getAccounts('positions');

        expect(client.accounts.getAccounts).toHaveBeenCalledWith('positions');
        expect(result).toEqual(mockAccounts);
      });
    });

    describe('getAccountNumberMappings', () => {
      it('should get account number mappings', async () => {
        const mockMappings = [
          { accountNumber: '123', hashValue: 'hash123' },
          { accountNumber: '456', hashValue: 'hash456' },
        ];
        client.accounts.getAccountNumberMappings = jest.fn().mockResolvedValue(mockMappings);

        const result = await client.accounts.getAccountNumberMappings();

        expect(client.accounts.getAccountNumberMappings).toHaveBeenCalled();
        expect(result).toEqual(mockMappings);
      });
    });
  });

  describe('Transaction Methods', () => {
    const accountNumber = 'test-account-123';

    describe('getTransactions', () => {
      it('should get transactions for an account', async () => {
        const params = {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-31T23:59:59.999Z',
        };
        const mockTransactions = [
          { activityId: 1, type: 'TRADE' },
          { activityId: 2, type: 'DIVIDEND_OR_INTEREST' },
        ];
        client.transactions.getTransactions = jest.fn().mockResolvedValue(mockTransactions);

        const result = await client.getTransactions(accountNumber, params);

        expect(client.transactions.getTransactions).toHaveBeenCalledWith(accountNumber, params);
        expect(result).toEqual(mockTransactions);
      });
    });

    describe('getTransaction', () => {
      it('should get a specific transaction', async () => {
        const transactionId = 123456;
        const mockTransaction = { activityId: transactionId, type: 'TRADE' };
        client.transactions.getTransaction = jest.fn().mockResolvedValue(mockTransaction);

        const result = await client.getTransaction(accountNumber, transactionId);

        expect(client.transactions.getTransaction).toHaveBeenCalledWith(accountNumber, transactionId);
        expect(result).toEqual(mockTransaction);
      });
    });
  });

  describe('Market Data Methods', () => {
    describe('getMarketDataQuotes', () => {
      it('should get market data quotes', async () => {
        const params = { symbols: 'AAPL,MSFT' };
        const mockQuotes = { AAPL: { symbol: 'AAPL' }, MSFT: { symbol: 'MSFT' } };
        client.marketData.getQuotes = jest.fn().mockResolvedValue(mockQuotes);

        const result = await client.getMarketDataQuotes(params);

        expect(client.marketData.getQuotes).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockQuotes);
      });
    });

    describe('getMarketDataQuoteBySymbol', () => {
      it('should get quote for a symbol', async () => {
        const mockQuote = { symbol: 'AAPL', lastPrice: 150.00 };
        client.marketData.getQuoteBySymbol = jest.fn().mockResolvedValue(mockQuote);

        const result = await client.getMarketDataQuoteBySymbol('AAPL');

        expect(client.marketData.getQuoteBySymbol).toHaveBeenCalledWith('AAPL', undefined);
        expect(result).toEqual(mockQuote);
      });
    });

    describe('getOptionChains', () => {
      it('should get option chains', async () => {
        const params = { symbol: 'AAPL' };
        const mockChains = { symbol: 'AAPL', status: 'SUCCESS' };
        client.marketData.getOptionChains = jest.fn().mockResolvedValue(mockChains);

        const result = await client.getOptionChains(params);

        expect(client.marketData.getOptionChains).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockChains);
      });
    });

    describe('getPriceHistory', () => {
      it('should get price history', async () => {
        const params = { symbol: 'AAPL', periodType: 'day' as const };
        const mockHistory = { symbol: 'AAPL', candles: [] };
        client.marketData.getPriceHistory = jest.fn().mockResolvedValue(mockHistory);

        const result = await client.getPriceHistory(params);

        expect(client.marketData.getPriceHistory).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockHistory);
      });
    });
  });

  describe('User Preference Methods', () => {
    describe('getUserPreferences', () => {
      it('should get user preferences', async () => {
        const mockPreferences = [
          {
            accounts: [],
            streamerInfo: [],
            offers: [],
          },
        ];
        client.userPreference.getUserPreferences = jest.fn().mockResolvedValue(mockPreferences);

        const result = await client.getUserPreferences();

        expect(client.userPreference.getUserPreferences).toHaveBeenCalled();
        expect(result).toEqual(mockPreferences);
      });
    });
  });
});
