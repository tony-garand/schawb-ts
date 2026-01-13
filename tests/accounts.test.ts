import { AccountsAPI } from '../src/api/accounts';
import { SchwabOAuth } from '../src/auth/oauth';
import { Account, AccountNumberMapping, SecuritiesAccount, Position } from '../src/types';

jest.mock('../src/auth/oauth');

describe('AccountsAPI', () => {
  let accountsAPI: AccountsAPI;
  let mockOAuth: jest.Mocked<SchwabOAuth>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOAuth = {
      getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer mock-token'),
    } as any;

    accountsAPI = new AccountsAPI(mockOAuth, 'sandbox');
  });

  describe('constructor', () => {
    it('should create instance with sandbox URL', () => {
      const api = new AccountsAPI(mockOAuth, 'sandbox');
      expect(api).toBeInstanceOf(AccountsAPI);
    });

    it('should create instance with production URL', () => {
      const api = new AccountsAPI(mockOAuth, 'production');
      expect(api).toBeInstanceOf(AccountsAPI);
    });
  });

  describe('getAccountNumberMappings', () => {
    it('should fetch account number mappings', async () => {
      const mockMappings: AccountNumberMapping[] = [
        {
          accountNumber: '123456789',
          hashValue: 'encrypted-hash-123',
        },
        {
          accountNumber: '987654321',
          hashValue: 'encrypted-hash-456',
        }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockMappings),
      });

      const result = await accountsAPI.getAccountNumberMappings();

      expect(result).toEqual(mockMappings);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/accounts/accountNumbers',
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
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(accountsAPI.getAccountNumberMappings())
        .rejects
        .toThrow('HTTP 401: Unauthorized');
    });
  });

  describe('getAccounts', () => {
    it('should fetch all accounts without positions', async () => {
      const mockAccounts: Account[] = [
        {
          securitiesAccount: {
            accountNumber: '123456789',
            type: 'CASH',
            roundTrips: 0,
            isDayTrader: false,
            isClosingOnlyRestricted: false,
            pfcbFlag: false,
            positions: [],
            currentBalances: {
              cashBalance: 10000,
              availableFunds: 10000,
            },
            initialBalances: {
              cashBalance: 10000,
              availableFunds: 10000,
            },
            projectedBalances: {
              cashBalance: 10000,
              availableFunds: 10000,
            },
          } as unknown as SecuritiesAccount
        }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAccounts),
      });

      const result = await accountsAPI.getAccounts();

      expect(result).toEqual(mockAccounts);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/accounts',
        expect.any(Object)
      );
    });

    it('should fetch all accounts with positions', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      await accountsAPI.getAccounts('positions');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/accounts?fields=positions',
        expect.any(Object)
      );
    });

    it('should handle errors when fetching accounts', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('Forbidden'),
      });

      await expect(accountsAPI.getAccounts())
        .rejects
        .toThrow('HTTP 403: Forbidden');
    });
  });

  describe('getAccountByNumber', () => {
    it('should fetch specific account by encrypted number', async () => {
      const accountNumber = 'encrypted-account-123';
      const mockAccount: SecuritiesAccount = {
        accountNumber: '123456789',
        type: 'MARGIN',
        roundTrips: 2,
        isDayTrader: false,
        isClosingOnlyRestricted: false,
        pfcbFlag: false,
        positions: [],
        currentBalances: {
          cashBalance: 50000,
          availableFunds: 48000,
          buyingPower: 96000,
        },
        initialBalances: {
          cashBalance: 50000,
          availableFunds: 48000,
        },
        projectedBalances: {
          cashBalance: 50000,
          availableFunds: 48000,
        },
      } as unknown as SecuritiesAccount;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await accountsAPI.getAccountByNumber(accountNumber);

      expect(result).toEqual(mockAccount);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}`,
        expect.any(Object)
      );
    });

    it('should fetch account with positions', async () => {
      const accountNumber = 'encrypted-account-123';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          accountNumber: '123456789',
          type: 'CASH',
          positions: []
        }),
      });

      await accountsAPI.getAccountByNumber(accountNumber, 'positions');

      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}?fields=positions`,
        expect.any(Object)
      );
    });

    it('should handle account not found error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Account not found'),
      });

      await expect(accountsAPI.getAccountByNumber('invalid-account'))
        .rejects
        .toThrow('HTTP 404: Account not found');
    });
  });

  describe('getAccount', () => {
    it('should fetch account by legacy account ID', async () => {
      const accountId = '123456789';
      const mockAccount: Account = {
        securitiesAccount: {
          accountNumber: accountId,
          type: 'CASH',
          roundTrips: 0,
          isDayTrader: false,
          isClosingOnlyRestricted: false,
          pfcbFlag: false,
          positions: [],
          currentBalances: {
            cashBalance: 25000,
            availableFunds: 25000,
          },
          initialBalances: {
            cashBalance: 25000,
            availableFunds: 25000,
          },
          projectedBalances: {
            cashBalance: 25000,
            availableFunds: 25000,
          },
        } as unknown as SecuritiesAccount
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await accountsAPI.getAccount(accountId);

      expect(result).toEqual(mockAccount);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountId}`,
        expect.any(Object)
      );
    });
  });

  describe('getPositions', () => {
    it('should fetch positions for an account', async () => {
      const accountId = '123456789';
      const mockPositions: Position[] = [
        {
          shortQuantity: 0,
          averagePrice: 150.25,
          currentDayProfitLoss: 125.50,
          currentDayProfitLossPercentage: 1.25,
          longQuantity: 100,
          settledLongQuantity: 100,
          settledShortQuantity: 0,
          agedQuantity: 100,
          instrument: {
            assetType: 'EQUITY',
            cusip: '037833100',
            symbol: 'AAPL',
            description: 'Apple Inc',
            instrumentId: 123,
            netChange: 1.25,
          },
          marketValue: 15150.00,
          maintenanceRequirement: 7575.00,
          averageLongPrice: 150.25,
          averageShortPrice: 0,
          taxLotAverageLongPrice: 150.25,
          taxLotAverageShortPrice: 0,
          longOpenProfitLoss: 125.50,
          shortOpenProfitLoss: 0,
          previousSessionLongQuantity: 100,
          previousSessionShortQuantity: 0,
          currentDayCost: 15024.50,
        }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPositions),
      });

      const result = await accountsAPI.getPositions(accountId);

      expect(result).toEqual(mockPositions);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountId}/positions`,
        expect.any(Object)
      );
    });

    it('should handle empty positions', async () => {
      const accountId = '987654321';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const result = await accountsAPI.getPositions(accountId);

      expect(result).toEqual([]);
    });

    it('should handle errors when fetching positions', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Account not found'),
      });

      await expect(accountsAPI.getPositions('invalid-account'))
        .rejects
        .toThrow('HTTP 404: Account not found');
    });
  });

  describe('getAccountHistory', () => {
    it('should fetch account history without options', async () => {
      const accountId = '123456789';
      const mockHistory = {
        candles: [],
        symbol: accountId,
        empty: true,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHistory),
      });

      const result = await accountsAPI.getAccountHistory(accountId);

      expect(result).toEqual(mockHistory);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountId}/history?`,
        expect.any(Object)
      );
    });

    it('should fetch account history with date range', async () => {
      const accountId = '123456789';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const options = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };

      await accountsAPI.getAccountHistory(accountId, options);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('startDate=2024-01-01');
      expect(url).toContain('endDate=2024-01-31');
    });

    it('should fetch account history with frequency options', async () => {
      const accountId = '123456789';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const options = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        frequencyType: 'daily',
        frequency: 1,
        needExtendedHoursData: true,
      };

      await accountsAPI.getAccountHistory(accountId, options);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('frequencyType=daily');
      expect(url).toContain('frequency=1');
      expect(url).toContain('needExtendedHoursData=true');
    });

    it('should handle account history errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid date range'),
      });

      await expect(accountsAPI.getAccountHistory('123456789', {
        startDate: 'invalid',
        endDate: 'invalid',
      }))
        .rejects
        .toThrow('HTTP 400: Invalid date range');
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

      await accountsAPI.getAccounts();

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

      await expect(accountsAPI.getAccounts())
        .rejects
        .toThrow('No tokens available');
    });
  });
});
