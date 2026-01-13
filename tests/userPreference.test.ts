import { UserPreferenceAPI, UserPreference, AccountPreference, StreamerInfo, Offer } from '../src/api/userPreference';
import { SchwabOAuth } from '../src/auth/oauth';

jest.mock('../src/auth/oauth');

describe('UserPreferenceAPI', () => {
  let userPreferenceAPI: UserPreferenceAPI;
  let mockOAuth: jest.Mocked<SchwabOAuth>;

  const mockUserPreferences: UserPreference[] = [
    {
      accounts: [
        {
          accountNumber: '123456789',
          primaryAccount: true,
          type: 'CASH',
          nickName: 'Trading Account',
          accountColor: '#FF5733',
          displayAcctId: '***6789',
          autoPositionEffect: true,
        },
        {
          accountNumber: '987654321',
          primaryAccount: false,
          type: 'MARGIN',
          nickName: 'Margin Account',
          accountColor: '#33FF57',
          displayAcctId: '***4321',
          autoPositionEffect: false,
        },
      ],
      streamerInfo: [
        {
          streamerSocketUrl: 'wss://streamer.schwab.com',
          schwabClientCustomerId: 'customer123',
          schwabClientCorrelId: 'correl456',
          schwabClientChannel: 'channel789',
          schwabClientFunctionId: 'function012',
        },
      ],
      offers: [
        {
          level2Permissions: true,
          mktDataPermission: 'REALTIME',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    mockOAuth = {
      getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer mock-token'),
    } as any;

    userPreferenceAPI = new UserPreferenceAPI(mockOAuth, 'sandbox');
  });

  describe('constructor', () => {
    it('should create instance with sandbox URL', () => {
      const api = new UserPreferenceAPI(mockOAuth, 'sandbox');
      expect(api).toBeInstanceOf(UserPreferenceAPI);
    });

    it('should create instance with production URL', () => {
      const api = new UserPreferenceAPI(mockOAuth, 'production');
      expect(api).toBeInstanceOf(UserPreferenceAPI);
    });
  });

  describe('getUserPreferences', () => {
    it('should fetch user preferences', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getUserPreferences();

      expect(result).toEqual(mockUserPreferences);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/userPreference',
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

      await expect(userPreferenceAPI.getUserPreferences())
        .rejects
        .toThrow('HTTP 401: Unauthorized');
    });
  });

  describe('getPrimaryAccount', () => {
    it('should return primary account', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getPrimaryAccount();

      expect(result).toEqual(mockUserPreferences[0].accounts[0]);
      expect(result?.primaryAccount).toBe(true);
      expect(result?.accountNumber).toBe('123456789');
    });

    it('should return null when no primary account exists', async () => {
      const preferencesWithoutPrimary: UserPreference[] = [
        {
          accounts: [
            {
              accountNumber: '123456789',
              primaryAccount: false,
              type: 'CASH',
              nickName: 'Account 1',
              accountColor: '#FF5733',
              displayAcctId: '***6789',
              autoPositionEffect: false,
            },
          ],
          streamerInfo: [],
          offers: [],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithoutPrimary),
      });

      const result = await userPreferenceAPI.getPrimaryAccount();

      expect(result).toBeNull();
    });
  });

  describe('getAccountPreferences', () => {
    it('should return all account preferences', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountPreferences();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockUserPreferences[0].accounts);
    });

    it('should flatten accounts from multiple preferences', async () => {
      const multiplePreferences: UserPreference[] = [
        {
          accounts: [{ accountNumber: '111', primaryAccount: true, type: 'CASH', nickName: 'A1', accountColor: '#FFF', displayAcctId: '***111', autoPositionEffect: false }],
          streamerInfo: [],
          offers: [],
        },
        {
          accounts: [{ accountNumber: '222', primaryAccount: false, type: 'MARGIN', nickName: 'A2', accountColor: '#000', displayAcctId: '***222', autoPositionEffect: false }],
          streamerInfo: [],
          offers: [],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(multiplePreferences),
      });

      const result = await userPreferenceAPI.getAccountPreferences();

      expect(result).toHaveLength(2);
      expect(result[0].accountNumber).toBe('111');
      expect(result[1].accountNumber).toBe('222');
    });
  });

  describe('getAccountPreference', () => {
    it('should return specific account preference by account number', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountPreference('987654321');

      expect(result).toEqual(mockUserPreferences[0].accounts[1]);
      expect(result?.accountNumber).toBe('987654321');
    });

    it('should return null when account not found', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountPreference('999999999');

      expect(result).toBeNull();
    });
  });

  describe('getStreamerInfo', () => {
    it('should return streamer information', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getStreamerInfo();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUserPreferences[0].streamerInfo[0]);
    });

    it('should flatten streamer info from multiple preferences', async () => {
      const multiplePreferences: UserPreference[] = [
        {
          accounts: [],
          streamerInfo: [{ streamerSocketUrl: 'url1', schwabClientCustomerId: 'c1', schwabClientCorrelId: 'r1', schwabClientChannel: 'ch1', schwabClientFunctionId: 'f1' }],
          offers: [],
        },
        {
          accounts: [],
          streamerInfo: [{ streamerSocketUrl: 'url2', schwabClientCustomerId: 'c2', schwabClientCorrelId: 'r2', schwabClientChannel: 'ch2', schwabClientFunctionId: 'f2' }],
          offers: [],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(multiplePreferences),
      });

      const result = await userPreferenceAPI.getStreamerInfo();

      expect(result).toHaveLength(2);
    });
  });

  describe('getOffers', () => {
    it('should return offers information', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getOffers();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockUserPreferences[0].offers[0]);
    });
  });

  describe('hasLevel2Permissions', () => {
    it('should return true when user has level 2 permissions', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.hasLevel2Permissions();

      expect(result).toBe(true);
    });

    it('should return false when user does not have level 2 permissions', async () => {
      const preferencesWithoutLevel2: UserPreference[] = [
        {
          accounts: [],
          streamerInfo: [],
          offers: [{ level2Permissions: false, mktDataPermission: 'DELAYED' }],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithoutLevel2),
      });

      const result = await userPreferenceAPI.hasLevel2Permissions();

      expect(result).toBe(false);
    });
  });

  describe('getMarketDataPermissions', () => {
    it('should return market data permissions', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getMarketDataPermissions();

      expect(result).toEqual(['REALTIME']);
    });

    it('should filter out empty permissions', async () => {
      const preferencesWithEmptyPermissions: UserPreference[] = [
        {
          accounts: [],
          streamerInfo: [],
          offers: [
            { level2Permissions: true, mktDataPermission: 'REALTIME' },
            { level2Permissions: false, mktDataPermission: '' },
          ],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithEmptyPermissions),
      });

      const result = await userPreferenceAPI.getMarketDataPermissions();

      expect(result).toEqual(['REALTIME']);
    });
  });

  describe('getAccountNicknames', () => {
    it('should return account nicknames mapping', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountNicknames();

      expect(result).toEqual({
        '123456789': 'Trading Account',
        '987654321': 'Margin Account',
      });
    });

    it('should exclude accounts without nicknames', async () => {
      const preferencesWithoutNicknames: UserPreference[] = [
        {
          accounts: [
            { accountNumber: '111', primaryAccount: true, type: 'CASH', nickName: 'Named', accountColor: '', displayAcctId: '', autoPositionEffect: false },
            { accountNumber: '222', primaryAccount: false, type: 'MARGIN', nickName: '', accountColor: '', displayAcctId: '', autoPositionEffect: false },
          ],
          streamerInfo: [],
          offers: [],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithoutNicknames),
      });

      const result = await userPreferenceAPI.getAccountNicknames();

      expect(result).toEqual({ '111': 'Named' });
    });
  });

  describe('getAccountColors', () => {
    it('should return account colors mapping', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountColors();

      expect(result).toEqual({
        '123456789': '#FF5733',
        '987654321': '#33FF57',
      });
    });

    it('should exclude accounts without colors', async () => {
      const preferencesWithoutColors: UserPreference[] = [
        {
          accounts: [
            { accountNumber: '111', primaryAccount: true, type: 'CASH', nickName: '', accountColor: '#FFF', displayAcctId: '', autoPositionEffect: false },
            { accountNumber: '222', primaryAccount: false, type: 'MARGIN', nickName: '', accountColor: '', displayAcctId: '', autoPositionEffect: false },
          ],
          streamerInfo: [],
          offers: [],
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithoutColors),
      });

      const result = await userPreferenceAPI.getAccountColors();

      expect(result).toEqual({ '111': '#FFF' });
    });
  });

  describe('getAccountsByType', () => {
    it('should return accounts filtered by type', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountsByType('MARGIN');

      expect(result).toHaveLength(1);
      expect(result[0].accountNumber).toBe('987654321');
      expect(result[0].type).toBe('MARGIN');
    });

    it('should return empty array when no accounts match type', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountsByType('IRA');

      expect(result).toEqual([]);
    });
  });

  describe('getAccountsWithAutoPositionEffect', () => {
    it('should return accounts with auto position effect enabled', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getAccountsWithAutoPositionEffect();

      expect(result).toHaveLength(1);
      expect(result[0].accountNumber).toBe('123456789');
      expect(result[0].autoPositionEffect).toBe(true);
    });
  });

  describe('getStreamerSocketUrl', () => {
    it('should return streamer socket URL', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getStreamerSocketUrl();

      expect(result).toBe('wss://streamer.schwab.com');
    });

    it('should return null when no streamer info exists', async () => {
      const preferencesWithoutStreamer: UserPreference[] = [
        { accounts: [], streamerInfo: [], offers: [] },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithoutStreamer),
      });

      const result = await userPreferenceAPI.getStreamerSocketUrl();

      expect(result).toBeNull();
    });
  });

  describe('getSchwabClientCustomerId', () => {
    it('should return customer ID', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getSchwabClientCustomerId();

      expect(result).toBe('customer123');
    });

    it('should return null when no streamer info exists', async () => {
      const preferencesWithoutStreamer: UserPreference[] = [
        { accounts: [], streamerInfo: [], offers: [] },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(preferencesWithoutStreamer),
      });

      const result = await userPreferenceAPI.getSchwabClientCustomerId();

      expect(result).toBeNull();
    });
  });

  describe('getSchwabClientCorrelId', () => {
    it('should return correlation ID', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getSchwabClientCorrelId();

      expect(result).toBe('correl456');
    });
  });

  describe('getSchwabClientChannel', () => {
    it('should return client channel', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getSchwabClientChannel();

      expect(result).toBe('channel789');
    });
  });

  describe('getSchwabClientFunctionId', () => {
    it('should return function ID', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      const result = await userPreferenceAPI.getSchwabClientFunctionId();

      expect(result).toBe('function012');
    });
  });

  describe('integration with OAuth', () => {
    it('should use OAuth authorization header for all requests', async () => {
      const customToken = 'Bearer custom-test-token';
      mockOAuth.getAuthorizationHeader.mockResolvedValue(customToken);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUserPreferences),
      });

      await userPreferenceAPI.getUserPreferences();

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

      await expect(userPreferenceAPI.getUserPreferences())
        .rejects
        .toThrow('No tokens available');
    });
  });
});
