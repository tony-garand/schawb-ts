import { SchwabOAuth } from '../src/auth/oauth';
import { OAuthTokens, OAuthConfig } from '../src/types';

describe('SchwabOAuth', () => {
  let oauth: SchwabOAuth;
  let config: OAuthConfig;

  beforeEach(() => {
    config = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://test-app.com/callback',
    };
    oauth = new SchwabOAuth(config);
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with provided config', () => {
      expect(oauth).toBeInstanceOf(SchwabOAuth);
    });
  });

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL without state', () => {
      const url = oauth.getAuthorizationUrl();

      expect(url).toContain('https://api.schwabapi.com/v1/oauth/authorize');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=https%3A%2F%2Ftest-app.com%2Fcallback');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=api');
      expect(url).not.toContain('state=');
    });

    it('should generate correct authorization URL with state', () => {
      const state = 'random-state-string';
      const url = oauth.getAuthorizationUrl(state);

      expect(url).toContain('https://api.schwabapi.com/v1/oauth/authorize');
      expect(url).toContain(`state=${state}`);
    });

    it('should properly encode redirect URI with special characters', () => {
      const customConfig = {
        ...config,
        redirectUri: 'https://test-app.com/callback?param=value&other=test',
      };
      const customOAuth = new SchwabOAuth(customConfig);
      const url = customOAuth.getAuthorizationUrl();

      expect(url).toContain('redirect_uri=https%3A%2F%2Ftest-app.com%2Fcallback%3Fparam%3Dvalue%26other%3Dtest');
    });
  });

  describe('exchangeCodeForTokens', () => {
    const mockTokenResponse: OAuthTokens = {
      access_token: 'test-access-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'api',
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should exchange authorization code for tokens', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      const result = await oauth.exchangeCodeForTokens('test-auth-code');

      expect(result).toEqual(mockTokenResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic '),
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: expect.stringContaining('grant_type=authorization_code'),
        })
      );
    });

    it('should decode URL-encoded authorization code', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      const encodedCode = 'test%2Bcode%3Dwith%26special%2Fchars';
      await oauth.exchangeCodeForTokens(encodedCode);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].body).toContain('code=test%2Bcode%3Dwith%26special%2Fchars');
    });

    it('should store tokens after successful exchange', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      await oauth.exchangeCodeForTokens('test-auth-code');

      const tokens = oauth.getTokens();
      expect(tokens).toEqual(mockTokenResponse);
      expect(oauth.hasValidTokens()).toBe(true);
    });

    it('should set token expiry time correctly', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      await oauth.exchangeCodeForTokens('test-auth-code');

      // Token should be valid now
      expect(oauth.hasValidTokens()).toBe(true);

      // Advance time to just before expiry (3599 seconds)
      jest.advanceTimersByTime(3599 * 1000);
      expect(oauth.hasValidTokens()).toBe(true);

      // Advance time past expiry
      jest.advanceTimersByTime(2 * 1000);
      expect(oauth.hasValidTokens()).toBe(false);
    });

    it('should throw error on failed token exchange', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid authorization code'),
      });

      await expect(oauth.exchangeCodeForTokens('invalid-code'))
        .rejects
        .toThrow('OAuth token exchange failed');
    });

    it('should include correct basic auth header', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      await oauth.exchangeCodeForTokens('test-auth-code');

      const expectedAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Basic ${expectedAuth}`,
          }),
        })
      );
    });
  });

  describe('refreshTokens', () => {
    const mockTokenResponse: OAuthTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'api',
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should refresh tokens using stored refresh token', async () => {
      // Set initial tokens
      const initialTokens: OAuthTokens = {
        access_token: 'old-access-token',
        refresh_token: 'old-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(initialTokens);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      const result = await oauth.refreshTokens();

      expect(result).toEqual(mockTokenResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/oauth/token',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('grant_type=refresh_token'),
        })
      );
    });

    it('should refresh tokens using provided refresh token', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      const customRefreshToken = 'custom-refresh-token';
      await oauth.refreshTokens(customRefreshToken);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[1].body).toContain(`refresh_token=${customRefreshToken}`);
    });

    it('should update stored tokens after refresh', async () => {
      const initialTokens: OAuthTokens = {
        access_token: 'old-access-token',
        refresh_token: 'old-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(initialTokens);

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTokenResponse),
      });

      await oauth.refreshTokens();

      const tokens = oauth.getTokens();
      expect(tokens).toEqual(mockTokenResponse);
    });

    it('should throw error when no refresh token available', async () => {
      await expect(oauth.refreshTokens())
        .rejects
        .toThrow('No refresh token available');
    });

    it('should throw error on failed token refresh', async () => {
      oauth.setTokens({
        access_token: 'old-token',
        refresh_token: 'old-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Invalid refresh token'),
      });

      await expect(oauth.refreshTokens())
        .rejects
        .toThrow('Token refresh failed');
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return access token when valid', async () => {
      const tokens: OAuthTokens = {
        access_token: 'valid-access-token',
        refresh_token: 'valid-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(tokens);

      const accessToken = await oauth.getAccessToken();

      expect(accessToken).toBe('valid-access-token');
    });

    it('should throw error when no tokens available', async () => {
      await expect(oauth.getAccessToken())
        .rejects
        .toThrow('No tokens available. Please complete OAuth flow first.');
    });

    it('should automatically refresh token when expired', async () => {
      const initialTokens: OAuthTokens = {
        access_token: 'old-access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      // Set tokens that will expire soon
      const expiryTime = Date.now() + 60000; // Expires in 1 minute
      oauth.setTokens(initialTokens, expiryTime);

      const newTokens: OAuthTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(newTokens),
      });

      const accessToken = await oauth.getAccessToken();

      expect(accessToken).toBe('new-access-token');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should refresh token 5 minutes before expiry', async () => {
      const initialTokens: OAuthTokens = {
        access_token: 'old-access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      // Set tokens that expire in 4 minutes (less than 5 minute threshold)
      const expiryTime = Date.now() + (4 * 60 * 1000);
      oauth.setTokens(initialTokens, expiryTime);

      const newTokens: OAuthTokens = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(newTokens),
      });

      await oauth.getAccessToken();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should not refresh token when more than 5 minutes until expiry', async () => {
      const tokens: OAuthTokens = {
        access_token: 'valid-access-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      // Set tokens that expire in 10 minutes
      const expiryTime = Date.now() + (10 * 60 * 1000);
      oauth.setTokens(tokens, expiryTime);

      global.fetch = jest.fn();

      const accessToken = await oauth.getAccessToken();

      expect(accessToken).toBe('valid-access-token');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('hasValidTokens', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return false when no tokens set', () => {
      expect(oauth.hasValidTokens()).toBe(false);
    });

    it('should return true when tokens are valid', () => {
      const tokens: OAuthTokens = {
        access_token: 'valid-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(tokens);

      expect(oauth.hasValidTokens()).toBe(true);
    });

    it('should return false when tokens are expired', () => {
      const tokens: OAuthTokens = {
        access_token: 'expired-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      const pastExpiryTime = Date.now() - 1000; // Expired 1 second ago
      oauth.setTokens(tokens, pastExpiryTime);

      expect(oauth.hasValidTokens()).toBe(false);
    });
  });

  describe('getTokens', () => {
    it('should return null when no tokens set', () => {
      expect(oauth.getTokens()).toBeNull();
    });

    it('should return stored tokens', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(tokens);

      expect(oauth.getTokens()).toEqual(tokens);
    });
  });

  describe('setTokens', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should set tokens with calculated expiry time', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      oauth.setTokens(tokens);

      expect(oauth.getTokens()).toEqual(tokens);
      expect(oauth.hasValidTokens()).toBe(true);
    });

    it('should set tokens with provided expiry time', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      const customExpiryTime = Date.now() + 7200000; // 2 hours
      oauth.setTokens(tokens, customExpiryTime);

      expect(oauth.hasValidTokens()).toBe(true);

      // Advance time by 1 hour - should still be valid
      jest.advanceTimersByTime(3600000);
      expect(oauth.hasValidTokens()).toBe(true);
    });
  });

  describe('clearTokens', () => {
    it('should clear stored tokens', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(tokens);

      expect(oauth.getTokens()).not.toBeNull();

      oauth.clearTokens();

      expect(oauth.getTokens()).toBeNull();
      expect(oauth.hasValidTokens()).toBe(false);
    });
  });

  describe('getAuthorizationHeader', () => {
    it('should return Bearer token header', async () => {
      const tokens: OAuthTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };
      oauth.setTokens(tokens);

      const header = await oauth.getAuthorizationHeader();

      expect(header).toBe('Bearer test-access-token');
    });

    it('should throw error when no tokens available', async () => {
      await expect(oauth.getAuthorizationHeader())
        .rejects
        .toThrow('No tokens available');
    });

    it('should refresh token if needed before returning header', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));

      const initialTokens: OAuthTokens = {
        access_token: 'old-token',
        refresh_token: 'refresh-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      // Token expires in 2 minutes (less than 5 minute threshold)
      const expiryTime = Date.now() + 120000;
      oauth.setTokens(initialTokens, expiryTime);

      const newTokens: OAuthTokens = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'api',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(newTokens),
      });

      const header = await oauth.getAuthorizationHeader();

      expect(header).toBe('Bearer new-token');
      expect(global.fetch).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
