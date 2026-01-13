import { TransactionsAPI, TransactionQueryParams, Transaction } from '../src/api/transactions';
import { SchwabOAuth } from '../src/auth/oauth';

jest.mock('../src/auth/oauth');

describe('TransactionsAPI', () => {
  let transactionsAPI: TransactionsAPI;
  let mockOAuth: jest.Mocked<SchwabOAuth>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOAuth = {
      getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer mock-token'),
    } as any;

    transactionsAPI = new TransactionsAPI(mockOAuth, 'sandbox');
  });

  describe('constructor', () => {
    it('should create instance with sandbox URL', () => {
      const api = new TransactionsAPI(mockOAuth, 'sandbox');
      expect(api).toBeInstanceOf(TransactionsAPI);
    });

    it('should create instance with production URL', () => {
      const api = new TransactionsAPI(mockOAuth, 'production');
      expect(api).toBeInstanceOf(TransactionsAPI);
    });
  });

  describe('getTransactions', () => {
    const accountNumber = 'encrypted-account-123';

    it('should fetch transactions with required parameters', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      const mockTransactions: Transaction[] = [
        {
          activityId: 123456,
          time: '2024-01-15T10:30:00.000Z',
          user: {
            cdDomainId: 'domain123',
            login: 'user@example.com',
            type: 'INDIVIDUAL_USER',
            userId: 789,
            systemUserName: 'user123',
            firstName: 'John',
            lastName: 'Doe',
            brokerRepCode: 'BR001',
          },
          description: 'BUY AAPL',
          accountNumber: '123456789',
          type: 'TRADE',
          status: 'VALID',
          subAccount: 'CASH',
          tradeDate: '2024-01-15',
          settlementDate: '2024-01-17',
          positionId: 111,
          orderId: 222,
          netAmount: -1500.00,
          activityType: 'TRADE',
          transferItems: [
            {
              instrument: {
                cusip: '037833100',
                symbol: 'AAPL',
                description: 'Apple Inc',
                instrumentId: 333,
                netChange: 1.25,
                type: 'EQUITY',
              },
              amount: 10,
              cost: 1500.00,
              price: 150.00,
              feeType: 'COMMISSION',
              positionEffect: 'OPENING',
            }
          ],
        }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTransactions),
      });

      const result = await transactionsAPI.getTransactions(accountNumber, params);

      expect(result).toEqual(mockTransactions);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/accounts/${accountNumber}/transactions`),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include required date parameters in URL', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('startDate=2024-01-01T00%3A00%3A00.000Z');
      expect(url).toContain('endDate=2024-01-31T23%3A59%3A59.999Z');
    });

    it('should filter by symbol when provided', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        symbol: 'AAPL',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('symbol=AAPL');
    });

    it('should filter by transaction type when provided', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        types: 'TRADE',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('types=TRADE');
    });

    it('should include all optional parameters when provided', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        symbol: 'TSLA',
        types: 'DIVIDEND_OR_INTEREST',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('symbol=TSLA');
      expect(url).toContain('types=DIVIDEND_OR_INTEREST');
    });

    it('should handle empty transaction list', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-02T00:00:00.000Z',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await transactionsAPI.getTransactions(accountNumber, params);

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid date range'),
      });

      await expect(transactionsAPI.getTransactions(accountNumber, params))
        .rejects
        .toThrow('HTTP 400: Invalid date range');
    });

    it('should handle unauthorized errors', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(transactionsAPI.getTransactions(accountNumber, params))
        .rejects
        .toThrow('HTTP 401: Unauthorized');
    });

    it('should handle account not found errors', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Account not found'),
      });

      await expect(transactionsAPI.getTransactions('invalid-account', params))
        .rejects
        .toThrow('HTTP 404: Account not found');
    });
  });

  describe('getTransaction', () => {
    it('should fetch a specific transaction by ID', async () => {
      const accountNumber = 'encrypted-account-123';
      const transactionId = 123456;

      const mockTransaction: Transaction = {
        activityId: transactionId,
        time: '2024-01-15T10:30:00.000Z',
        user: {
          cdDomainId: 'domain123',
          login: 'user@example.com',
          type: 'INDIVIDUAL_USER',
          userId: 789,
          systemUserName: 'user123',
          firstName: 'Jane',
          lastName: 'Smith',
          brokerRepCode: 'BR002',
        },
        description: 'SELL MSFT',
        accountNumber: '987654321',
        type: 'TRADE',
        status: 'VALID',
        subAccount: 'MARGIN',
        tradeDate: '2024-01-15',
        settlementDate: '2024-01-17',
        positionId: 444,
        orderId: 555,
        netAmount: 5000.00,
        activityType: 'TRADE',
        transferItems: [
          {
            instrument: {
              cusip: '594918104',
              symbol: 'MSFT',
              description: 'Microsoft Corp',
              instrumentId: 666,
              netChange: -2.50,
              type: 'EQUITY',
            },
            amount: 20,
            cost: 5000.00,
            price: 250.00,
            feeType: 'COMMISSION',
            positionEffect: 'CLOSING',
          }
        ],
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTransaction),
      });

      const result = await transactionsAPI.getTransaction(accountNumber, transactionId);

      expect(result).toEqual(mockTransaction);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/transactions/${transactionId}`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle transaction not found error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Transaction not found'),
      });

      await expect(transactionsAPI.getTransaction('account-123', 99999))
        .rejects
        .toThrow('HTTP 404: Transaction not found');
    });
  });

  describe('different transaction types', () => {
    const accountNumber = 'encrypted-account-123';

    it('should handle TRADE transactions', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        types: 'TRADE',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('types=TRADE');
    });

    it('should handle DIVIDEND_OR_INTEREST transactions', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        types: 'DIVIDEND_OR_INTEREST',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('types=DIVIDEND_OR_INTEREST');
    });

    it('should handle ACH transactions', async () => {
      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        types: 'ACH_RECEIPT',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await transactionsAPI.getTransactions(accountNumber, params);

      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('types=ACH_RECEIPT');
    });
  });

  describe('integration with OAuth', () => {
    it('should use OAuth authorization header for all requests', async () => {
      const customToken = 'Bearer custom-test-token';
      mockOAuth.getAuthorizationHeader.mockResolvedValue(customToken);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      await transactionsAPI.getTransactions('account-123', params);

      expect(mockOAuth.getAuthorizationHeader).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': customToken,
          }),
        })
      );
    });

    it('should handle OAuth token errors', async () => {
      mockOAuth.getAuthorizationHeader.mockRejectedValue(
        new Error('No tokens available')
      );

      const params: TransactionQueryParams = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };

      await expect(transactionsAPI.getTransactions('account-123', params))
        .rejects
        .toThrow('No tokens available');
    });
  });
});
