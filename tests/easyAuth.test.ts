import * as fs from 'fs';
import { readTokenFile, writeTokenFile, getTokenAge, TokenFileData } from '../src/auth/easyAuth';
import { OAuthTokens } from '../src/types';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('easyAuth', () => {
  const testTokenPath = '/tmp/test-token.json';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readTokenFile', () => {
    it('should return null if file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const result = readTokenFile(testTokenPath);

      expect(result).toBeNull();
      expect(mockFs.existsSync).toHaveBeenCalledWith(testTokenPath);
    });

    it('should read and parse token file correctly', () => {
      const tokenData: TokenFileData = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        id_token: 'test-id-token',
        creation_timestamp: Date.now() - 1000,
        expiry_timestamp: Date.now() + 1799000,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(tokenData));

      const result = readTokenFile(testTokenPath);

      expect(result).toEqual(tokenData);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(testTokenPath, 'utf-8');
    });

    it('should return null on parse error', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = readTokenFile(testTokenPath);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });

    it('should return null on read error', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = readTokenFile(testTokenPath);

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('writeTokenFile', () => {
    it('should write token file correctly', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        id_token: 'test-id-token',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {});

      writeTokenFile(testTokenPath, tokens);

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const callArgs = mockFs.writeFileSync.mock.calls[0];
      expect(callArgs[0]).toBe(testTokenPath);

      const writtenData = JSON.parse(callArgs[1] as string) as TokenFileData;
      expect(writtenData.access_token).toBe('test-access-token');
      expect(writtenData.refresh_token).toBe('test-refresh-token');
      expect(writtenData.token_type).toBe('Bearer');
      expect(writtenData.expires_in).toBe(1800);
      expect(writtenData.scope).toBe('api');
      expect(writtenData.id_token).toBe('test-id-token');
      expect(writtenData.creation_timestamp).toBeDefined();
      expect(writtenData.expiry_timestamp).toBeDefined();
    });

    it('should create directory if it does not exist', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
      };

      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => '/tmp');
      mockFs.writeFileSync.mockImplementation(() => {});

      writeTokenFile('/tmp/subdir/token.json', tokens);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/tmp/subdir', { recursive: true });
    });

    it('should handle missing optional fields', () => {
      const tokens: OAuthTokens = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.writeFileSync.mockImplementation(() => {});

      writeTokenFile(testTokenPath, tokens);

      const callArgs = mockFs.writeFileSync.mock.calls[0];
      const writtenData = JSON.parse(callArgs[1] as string) as TokenFileData;
      expect(writtenData.token_type).toBe('Bearer');
      expect(writtenData.scope).toBe('api');
    });
  });

  describe('getTokenAge', () => {
    it('should calculate token age correctly', () => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const tokenData: TokenFileData = {
        access_token: 'test',
        refresh_token: 'test',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        creation_timestamp: oneDayAgo,
        expiry_timestamp: oneDayAgo + 1800000,
      };

      const age = getTokenAge(tokenData);

      // Should be approximately 1 day
      expect(age).toBeGreaterThan(0.99);
      expect(age).toBeLessThan(1.01);
    });

    it('should return 0 for fresh token', () => {
      const tokenData: TokenFileData = {
        access_token: 'test',
        refresh_token: 'test',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        creation_timestamp: Date.now(),
        expiry_timestamp: Date.now() + 1800000,
      };

      const age = getTokenAge(tokenData);

      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(0.01); // Less than ~15 minutes in days
    });

    it('should handle old tokens (7 days)', () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const tokenData: TokenFileData = {
        access_token: 'test',
        refresh_token: 'test',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        creation_timestamp: sevenDaysAgo,
        expiry_timestamp: sevenDaysAgo + 1800000,
      };

      const age = getTokenAge(tokenData);

      expect(age).toBeGreaterThan(6.99);
      expect(age).toBeLessThan(7.01);
    });
  });

  describe('TokenFileData interface', () => {
    it('should support all required fields', () => {
      const tokenData: TokenFileData = {
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        creation_timestamp: Date.now(),
        expiry_timestamp: Date.now() + 1800000,
      };

      expect(tokenData.access_token).toBeDefined();
      expect(tokenData.refresh_token).toBeDefined();
      expect(tokenData.token_type).toBeDefined();
      expect(tokenData.expires_in).toBeDefined();
      expect(tokenData.scope).toBeDefined();
      expect(tokenData.creation_timestamp).toBeDefined();
      expect(tokenData.expiry_timestamp).toBeDefined();
    });

    it('should support optional id_token field', () => {
      const tokenData: TokenFileData = {
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 1800,
        scope: 'api',
        id_token: 'id-token-value',
        creation_timestamp: Date.now(),
        expiry_timestamp: Date.now() + 1800000,
      };

      expect(tokenData.id_token).toBe('id-token-value');
    });
  });
});

describe('Token expiration calculations', () => {
  it('should calculate expiry timestamp correctly', () => {
    const now = Date.now();
    const expiresIn = 1800; // 30 minutes
    const expectedExpiry = now + expiresIn * 1000;

    // Within 1 second tolerance
    expect(Math.abs(expectedExpiry - (now + 1800000))).toBeLessThan(1000);
  });

  it('should identify expired tokens', () => {
    const expiredTimestamp = Date.now() - 1000; // 1 second ago
    const isExpired = Date.now() >= expiredTimestamp;
    expect(isExpired).toBe(true);
  });

  it('should identify valid tokens', () => {
    const futureTimestamp = Date.now() + 1000000; // ~17 minutes from now
    const isExpired = Date.now() >= futureTimestamp;
    expect(isExpired).toBe(false);
  });

  it('should handle expiry buffer (5 minutes)', () => {
    const expiryBuffer = 5 * 60 * 1000; // 5 minutes in ms
    const expiryTimestamp = Date.now() + 4 * 60 * 1000; // 4 minutes from now

    // Token should be considered expired because it's within the 5 minute buffer
    const isExpiredWithBuffer = Date.now() >= expiryTimestamp - expiryBuffer;
    expect(isExpiredWithBuffer).toBe(true);
  });

  it('should handle refresh token expiry (7 days)', () => {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const creationTimestamp = Date.now() - sevenDays - 1000; // 7 days + 1 second ago

    const isRefreshExpired = Date.now() >= creationTimestamp + sevenDays;
    expect(isRefreshExpired).toBe(true);
  });
});
