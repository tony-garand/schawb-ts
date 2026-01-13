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

    describe('getPrimaryAccount', () => {
      it('should get primary account', async () => {
        const mockAccount = { accountNumber: '123', primaryAccount: true };
        client.userPreference.getPrimaryAccount = jest.fn().mockResolvedValue(mockAccount);

        const result = await client.getPrimaryAccount();

        expect(client.userPreference.getPrimaryAccount).toHaveBeenCalled();
        expect(result).toEqual(mockAccount);
      });
    });

    describe('getAccountPreferences', () => {
      it('should get all account preferences', async () => {
        const mockPreferences = [{ accountNumber: '123' }];
        client.userPreference.getAccountPreferences = jest.fn().mockResolvedValue(mockPreferences);

        const result = await client.getAccountPreferences();

        expect(client.userPreference.getAccountPreferences).toHaveBeenCalled();
        expect(result).toEqual(mockPreferences);
      });
    });

    describe('getAccountPreference', () => {
      it('should get account preference by account number', async () => {
        const mockPreference = { accountNumber: '123' };
        client.userPreference.getAccountPreference = jest.fn().mockResolvedValue(mockPreference);

        const result = await client.getAccountPreference('123');

        expect(client.userPreference.getAccountPreference).toHaveBeenCalledWith('123');
        expect(result).toEqual(mockPreference);
      });
    });

    describe('getStreamerInfo', () => {
      it('should get streamer info', async () => {
        const mockInfo = [{ streamerSocketUrl: 'wss://test.com' }];
        client.userPreference.getStreamerInfo = jest.fn().mockResolvedValue(mockInfo);

        const result = await client.getStreamerInfo();

        expect(client.userPreference.getStreamerInfo).toHaveBeenCalled();
        expect(result).toEqual(mockInfo);
      });
    });

    describe('getOffers', () => {
      it('should get offers', async () => {
        const mockOffers = [{ level2Permissions: true }];
        client.userPreference.getOffers = jest.fn().mockResolvedValue(mockOffers);

        const result = await client.getOffers();

        expect(client.userPreference.getOffers).toHaveBeenCalled();
        expect(result).toEqual(mockOffers);
      });
    });

    describe('hasLevel2Permissions', () => {
      it('should check level 2 permissions', async () => {
        client.userPreference.hasLevel2Permissions = jest.fn().mockResolvedValue(true);

        const result = await client.hasLevel2Permissions();

        expect(client.userPreference.hasLevel2Permissions).toHaveBeenCalled();
        expect(result).toBe(true);
      });
    });

    describe('getMarketDataPermissions', () => {
      it('should get market data permissions', async () => {
        const mockPermissions = ['Level1', 'Level2'];
        client.userPreference.getMarketDataPermissions = jest.fn().mockResolvedValue(mockPermissions);

        const result = await client.getMarketDataPermissions();

        expect(client.userPreference.getMarketDataPermissions).toHaveBeenCalled();
        expect(result).toEqual(mockPermissions);
      });
    });

    describe('getAccountNicknames', () => {
      it('should get account nicknames', async () => {
        const mockNicknames = { '123': 'My Account' };
        client.userPreference.getAccountNicknames = jest.fn().mockResolvedValue(mockNicknames);

        const result = await client.getAccountNicknames();

        expect(client.userPreference.getAccountNicknames).toHaveBeenCalled();
        expect(result).toEqual(mockNicknames);
      });
    });

    describe('getAccountColors', () => {
      it('should get account colors', async () => {
        const mockColors = { '123': '#FF0000' };
        client.userPreference.getAccountColors = jest.fn().mockResolvedValue(mockColors);

        const result = await client.getAccountColors();

        expect(client.userPreference.getAccountColors).toHaveBeenCalled();
        expect(result).toEqual(mockColors);
      });
    });

    describe('getAccountsByType', () => {
      it('should get accounts by type', async () => {
        const mockAccounts = [{ accountNumber: '123', type: 'MARGIN' }];
        client.userPreference.getAccountsByType = jest.fn().mockResolvedValue(mockAccounts);

        const result = await client.getAccountsByType('MARGIN');

        expect(client.userPreference.getAccountsByType).toHaveBeenCalledWith('MARGIN');
        expect(result).toEqual(mockAccounts);
      });
    });

    describe('getAccountsWithAutoPositionEffect', () => {
      it('should get accounts with auto position effect', async () => {
        const mockAccounts = [{ accountNumber: '123', autoPositionEffect: true }];
        client.userPreference.getAccountsWithAutoPositionEffect = jest.fn().mockResolvedValue(mockAccounts);

        const result = await client.getAccountsWithAutoPositionEffect();

        expect(client.userPreference.getAccountsWithAutoPositionEffect).toHaveBeenCalled();
        expect(result).toEqual(mockAccounts);
      });
    });

    describe('getStreamerSocketUrl', () => {
      it('should get streamer socket URL', async () => {
        client.userPreference.getStreamerSocketUrl = jest.fn().mockResolvedValue('wss://test.com');

        const result = await client.getStreamerSocketUrl();

        expect(client.userPreference.getStreamerSocketUrl).toHaveBeenCalled();
        expect(result).toBe('wss://test.com');
      });
    });

    describe('getSchwabClientCustomerId', () => {
      it('should get Schwab client customer ID', async () => {
        client.userPreference.getSchwabClientCustomerId = jest.fn().mockResolvedValue('customer123');

        const result = await client.getSchwabClientCustomerId();

        expect(client.userPreference.getSchwabClientCustomerId).toHaveBeenCalled();
        expect(result).toBe('customer123');
      });
    });

    describe('getSchwabClientCorrelId', () => {
      it('should get Schwab client correlation ID', async () => {
        client.userPreference.getSchwabClientCorrelId = jest.fn().mockResolvedValue('correl123');

        const result = await client.getSchwabClientCorrelId();

        expect(client.userPreference.getSchwabClientCorrelId).toHaveBeenCalled();
        expect(result).toBe('correl123');
      });
    });

    describe('getSchwabClientChannel', () => {
      it('should get Schwab client channel', async () => {
        client.userPreference.getSchwabClientChannel = jest.fn().mockResolvedValue('channel123');

        const result = await client.getSchwabClientChannel();

        expect(client.userPreference.getSchwabClientChannel).toHaveBeenCalled();
        expect(result).toBe('channel123');
      });
    });

    describe('getSchwabClientFunctionId', () => {
      it('should get Schwab client function ID', async () => {
        client.userPreference.getSchwabClientFunctionId = jest.fn().mockResolvedValue('function123');

        const result = await client.getSchwabClientFunctionId();

        expect(client.userPreference.getSchwabClientFunctionId).toHaveBeenCalled();
        expect(result).toBe('function123');
      });
    });
  });

  describe('Additional Transaction Methods', () => {
    describe('getRecentTransactions', () => {
      it('should get recent transactions', async () => {
        const mockTransactions = [{ activityId: 1 }];
        client.transactions.getRecentTransactions = jest.fn().mockResolvedValue(mockTransactions);

        const result = await client.getRecentTransactions('account123', 7);

        expect(client.transactions.getRecentTransactions).toHaveBeenCalledWith('account123', 7, undefined, undefined);
        expect(result).toEqual(mockTransactions);
      });

      it('should get recent transactions with filters', async () => {
        const mockTransactions = [{ activityId: 1 }];
        client.transactions.getRecentTransactions = jest.fn().mockResolvedValue(mockTransactions);

        const result = await client.getRecentTransactions('account123', 30, 'AAPL', 'TRADE');

        expect(client.transactions.getRecentTransactions).toHaveBeenCalledWith('account123', 30, 'AAPL', 'TRADE');
        expect(result).toEqual(mockTransactions);
      });
    });

    describe('getTransactionsForMonth', () => {
      it('should get transactions for month', async () => {
        const mockTransactions = [{ activityId: 1 }];
        client.transactions.getTransactionsForMonth = jest.fn().mockResolvedValue(mockTransactions);

        const result = await client.getTransactionsForMonth('account123', 2024, 1);

        expect(client.transactions.getTransactionsForMonth).toHaveBeenCalledWith('account123', 2024, 1, undefined, undefined);
        expect(result).toEqual(mockTransactions);
      });
    });

    describe('getTradeTransactions', () => {
      it('should get trade transactions', async () => {
        const mockTransactions = [{ activityId: 1 }];
        client.transactions.getTradeTransactions = jest.fn().mockResolvedValue(mockTransactions);

        const result = await client.getTradeTransactions('account123', '2024-01-01', '2024-01-31');

        expect(client.transactions.getTradeTransactions).toHaveBeenCalledWith('account123', '2024-01-01', '2024-01-31', undefined);
        expect(result).toEqual(mockTransactions);
      });
    });

    describe('getDividendTransactions', () => {
      it('should get dividend transactions', async () => {
        const mockTransactions = [{ activityId: 1 }];
        client.transactions.getDividendTransactions = jest.fn().mockResolvedValue(mockTransactions);

        const result = await client.getDividendTransactions('account123', '2024-01-01', '2024-01-31');

        expect(client.transactions.getDividendTransactions).toHaveBeenCalledWith('account123', '2024-01-01', '2024-01-31', undefined);
        expect(result).toEqual(mockTransactions);
      });
    });
  });

  describe('Additional Market Data Methods', () => {
    describe('getMarketDataQuotesForSymbols', () => {
      it('should get market data quotes for symbols', async () => {
        const mockQuotes = { AAPL: { symbol: 'AAPL' } };
        client.marketData.getQuotesForSymbols = jest.fn().mockResolvedValue(mockQuotes);

        const result = await client.getMarketDataQuotesForSymbols(['AAPL', 'MSFT']);

        expect(client.marketData.getQuotesForSymbols).toHaveBeenCalledWith(['AAPL', 'MSFT'], undefined);
        expect(result).toEqual(mockQuotes);
      });

      it('should get market data quotes with options', async () => {
        const mockQuotes = { AAPL: { symbol: 'AAPL' } };
        client.marketData.getQuotesForSymbols = jest.fn().mockResolvedValue(mockQuotes);

        const result = await client.getMarketDataQuotesForSymbols(['AAPL'], { fields: 'quote', indicative: true });

        expect(client.marketData.getQuotesForSymbols).toHaveBeenCalledWith(['AAPL'], { fields: 'quote', indicative: true });
        expect(result).toEqual(mockQuotes);
      });
    });

    describe('getOptionExpirationChain', () => {
      it('should get option expiration chain', async () => {
        const mockChain = { symbol: 'AAPL', expirations: [] };
        client.marketData.getOptionExpirationChain = jest.fn().mockResolvedValue(mockChain);

        const result = await client.getOptionExpirationChain('AAPL');

        expect(client.marketData.getOptionExpirationChain).toHaveBeenCalledWith('AAPL');
        expect(result).toEqual(mockChain);
      });
    });

    describe('getPriceHistoryForSymbol', () => {
      it('should get price history for symbol', async () => {
        const mockHistory = { symbol: 'AAPL', candles: [] };
        client.marketData.getPriceHistoryForSymbol = jest.fn().mockResolvedValue(mockHistory);

        const result = await client.getPriceHistoryForSymbol('AAPL', 'day', 10);

        expect(client.marketData.getPriceHistoryForSymbol).toHaveBeenCalledWith('AAPL', 'day', 10, undefined);
        expect(result).toEqual(mockHistory);
      });
    });

    describe('getMovers', () => {
      it('should get movers', async () => {
        const mockMovers = { screeners: [] };
        client.marketData.getMovers = jest.fn().mockResolvedValue(mockMovers);

        const params = { symbolId: '$DJI' as const, sort: 'PERCENT_CHANGE_UP' as const };
        const result = await client.getMovers(params);

        expect(client.marketData.getMovers).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockMovers);
      });
    });

    describe('getMoversForIndex', () => {
      it('should get movers for index', async () => {
        const mockMovers = { screeners: [] };
        client.marketData.getMoversForIndex = jest.fn().mockResolvedValue(mockMovers);

        const result = await client.getMoversForIndex('$DJI');

        expect(client.marketData.getMoversForIndex).toHaveBeenCalledWith('$DJI', undefined);
        expect(result).toEqual(mockMovers);
      });
    });

    describe('getMarketDataHours', () => {
      it('should get market data hours', async () => {
        const mockHours = { equity: {} };
        client.marketData.getMarketHours = jest.fn().mockResolvedValue(mockHours);

        const params = { markets: ['equity' as const] };
        const result = await client.getMarketDataHours(params);

        expect(client.marketData.getMarketHours).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockHours);
      });
    });

    describe('getMarketDataHoursForMarket', () => {
      it('should get market hours for market', async () => {
        const mockHours = { equity: {} };
        client.marketData.getMarketHoursForMarket = jest.fn().mockResolvedValue(mockHours);

        const result = await client.getMarketDataHoursForMarket('equity');

        expect(client.marketData.getMarketHoursForMarket).toHaveBeenCalledWith('equity', undefined);
        expect(result).toEqual(mockHours);
      });
    });

    describe('getMarketDataHoursForMarkets', () => {
      it('should get market hours for multiple markets', async () => {
        const mockHours = { equity: {}, option: {} };
        client.marketData.getMarketHoursForMarkets = jest.fn().mockResolvedValue(mockHours);

        const result = await client.getMarketDataHoursForMarkets(['equity', 'option']);

        expect(client.marketData.getMarketHoursForMarkets).toHaveBeenCalledWith(['equity', 'option'], undefined);
        expect(result).toEqual(mockHours);
      });
    });

    describe('getInstruments', () => {
      it('should get instruments', async () => {
        const mockInstruments = { instruments: [] };
        client.marketData.getInstruments = jest.fn().mockResolvedValue(mockInstruments);

        const params = { symbol: 'AAPL', projection: 'symbol-search' as const };
        const result = await client.getInstruments(params);

        expect(client.marketData.getInstruments).toHaveBeenCalledWith(params);
        expect(result).toEqual(mockInstruments);
      });
    });

    describe('getInstrumentByCusip', () => {
      it('should get instrument by CUSIP', async () => {
        const mockInstrument = { cusip: '037833100', symbol: 'AAPL' };
        client.marketData.getInstrumentByCusip = jest.fn().mockResolvedValue(mockInstrument);

        const result = await client.getInstrumentByCusip('037833100');

        expect(client.marketData.getInstrumentByCusip).toHaveBeenCalledWith('037833100');
        expect(result).toEqual(mockInstrument);
      });
    });

    describe('searchMarketDataInstruments', () => {
      it('should search market data instruments', async () => {
        const mockResults = { instruments: [] };
        client.marketData.searchInstruments = jest.fn().mockResolvedValue(mockResults);

        const result = await client.searchMarketDataInstruments('AAPL');

        expect(client.marketData.searchInstruments).toHaveBeenCalledWith('AAPL', 'symbol-search');
        expect(result).toEqual(mockResults);
      });

      it('should search with custom projection', async () => {
        const mockResults = { instruments: [] };
        client.marketData.searchInstruments = jest.fn().mockResolvedValue(mockResults);

        const result = await client.searchMarketDataInstruments('AAPL', 'fundamental');

        expect(client.marketData.searchInstruments).toHaveBeenCalledWith('AAPL', 'fundamental');
        expect(result).toEqual(mockResults);
      });
    });

    describe('getFundamentalInstruments', () => {
      it('should get fundamental instruments', async () => {
        const mockResults = { instruments: [] };
        client.marketData.getFundamentalInstruments = jest.fn().mockResolvedValue(mockResults);

        const result = await client.getFundamentalInstruments('AAPL');

        expect(client.marketData.getFundamentalInstruments).toHaveBeenCalledWith('AAPL');
        expect(result).toEqual(mockResults);
      });
    });
  });

  describe('Trading API Methods', () => {
    describe('getQuote', () => {
      it('should get quote from trading API', async () => {
        const mockQuote = { symbol: 'AAPL', lastPrice: 150.00 };
        (client as any).tradingAPI.getQuote = jest.fn().mockResolvedValue(mockQuote);

        const result = await client.getQuote('AAPL');

        expect((client as any).tradingAPI.getQuote).toHaveBeenCalledWith('AAPL');
        expect(result).toEqual(mockQuote);
      });
    });

    describe('getQuotes', () => {
      it('should get quotes from trading API', async () => {
        const mockQuotes = [{ symbol: 'AAPL' }, { symbol: 'MSFT' }];
        (client as any).tradingAPI.getQuotes = jest.fn().mockResolvedValue(mockQuotes);

        const result = await client.getQuotes(['AAPL', 'MSFT']);

        expect((client as any).tradingAPI.getQuotes).toHaveBeenCalledWith(['AAPL', 'MSFT']);
        expect(result).toEqual(mockQuotes);
      });
    });

    describe('getMarketHours', () => {
      it('should get market hours from trading API', async () => {
        const mockHours = { isOpen: true };
        (client as any).tradingAPI.getMarketHours = jest.fn().mockResolvedValue(mockHours);

        const result = await client.getMarketHours('2024-01-15', 'EQUITY');

        expect((client as any).tradingAPI.getMarketHours).toHaveBeenCalledWith('2024-01-15', 'EQUITY');
        expect(result).toEqual(mockHours);
      });

      it('should use default EQUITY market', async () => {
        const mockHours = { isOpen: true };
        (client as any).tradingAPI.getMarketHours = jest.fn().mockResolvedValue(mockHours);

        const result = await client.getMarketHours('2024-01-15');

        expect((client as any).tradingAPI.getMarketHours).toHaveBeenCalledWith('2024-01-15', 'EQUITY');
        expect(result).toEqual(mockHours);
      });
    });

    describe('searchInstruments', () => {
      it('should search instruments from trading API', async () => {
        const mockResults = [{ symbol: 'AAPL' }];
        (client as any).tradingAPI.searchInstruments = jest.fn().mockResolvedValue(mockResults);

        const result = await client.searchInstruments('AAPL', 'symbol-search');

        expect((client as any).tradingAPI.searchInstruments).toHaveBeenCalledWith('AAPL', 'symbol-search');
        expect(result).toEqual(mockResults);
      });

      it('should use default projection', async () => {
        const mockResults = [{ symbol: 'AAPL' }];
        (client as any).tradingAPI.searchInstruments = jest.fn().mockResolvedValue(mockResults);

        const result = await client.searchInstruments('AAPL');

        expect((client as any).tradingAPI.searchInstruments).toHaveBeenCalledWith('AAPL', 'symbol-search');
        expect(result).toEqual(mockResults);
      });
    });

    describe('getInstrument', () => {
      it('should get instrument from trading API', async () => {
        const mockInstrument = { symbol: 'AAPL', cusip: '037833100' };
        (client as any).tradingAPI.getInstrument = jest.fn().mockResolvedValue(mockInstrument);

        const result = await client.getInstrument('AAPL');

        expect((client as any).tradingAPI.getInstrument).toHaveBeenCalledWith('AAPL');
        expect(result).toEqual(mockInstrument);
      });
    });
  });

  describe('Account Methods', () => {
    describe('getAccountHistory', () => {
      it('should get account history', async () => {
        const mockHistory = { transactions: [] };
        client.accounts.getAccountHistory = jest.fn().mockResolvedValue(mockHistory);

        const result = await client.getAccountHistory('account123');

        expect(client.accounts.getAccountHistory).toHaveBeenCalledWith('account123', undefined);
        expect(result).toEqual(mockHistory);
      });

      it('should get account history with options', async () => {
        const mockHistory = { transactions: [] };
        const options = { startDate: '2024-01-01', endDate: '2024-01-31' };
        client.accounts.getAccountHistory = jest.fn().mockResolvedValue(mockHistory);

        const result = await client.getAccountHistory('account123', options);

        expect(client.accounts.getAccountHistory).toHaveBeenCalledWith('account123', options);
        expect(result).toEqual(mockHistory);
      });
    });

    describe('getAccountByNumber', () => {
      it('should get account by number', async () => {
        const mockAccount = { accountNumber: '123', type: 'CASH' };
        client.accounts.getAccountByNumber = jest.fn().mockResolvedValue(mockAccount);

        const result = await client.getAccountByNumber('account123');

        expect(client.accounts.getAccountByNumber).toHaveBeenCalledWith('account123', undefined);
        expect(result).toEqual(mockAccount);
      });
    });
  });

  describe('Order Builder Methods', () => {
    describe('createOrder', () => {
      it('should create order builder', () => {
        const builder = client.createOrder();

        expect(builder).toBeDefined();
        expect(builder.constructor.name).toBe('OrderBuilder');
      });
    });

    describe('createOrderLeg', () => {
      it('should create order leg builder', () => {
        const builder = client.createOrderLeg();

        expect(builder).toBeDefined();
        expect(builder.constructor.name).toBe('OrderLegBuilder');
      });
    });

    describe('templates', () => {
      it('should provide access to order templates', () => {
        const templates = client.templates;

        expect(templates).toBeDefined();
        expect(typeof templates.buyMarketStock).toBe('function');
      });
    });

    describe('createOptionSymbol', () => {
      it('should create option symbol', () => {
        const result = client.createOptionSymbol('AAPL', '240119', 'C', 150);

        expect(result).toBe('AAPL  240119C00150000');
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getConfig', () => {
      it('should return client configuration', () => {
        const config = client.getConfig();

        expect(config).toEqual({
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          redirectUri: 'https://test-app.com/callback',
          environment: 'sandbox',
        });
      });

      it('should return a copy of the configuration', () => {
        const config1 = client.getConfig();
        const config2 = client.getConfig();

        expect(config1).not.toBe(config2);
        expect(config1).toEqual(config2);
      });
    });
  });
});
