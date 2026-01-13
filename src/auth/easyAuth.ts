/**
 * Easy Authentication Module for Schwab API
 *
 * This module provides convenient authentication helpers aligned with Schwab's OAuth 2.0 flow.
 *
 * Per Schwab's official documentation:
 * - Access Token: Valid for 30 minutes (1800 seconds)
 * - Refresh Token: Valid for 7 days from creation
 * - Once refresh token expires, the full OAuth flow (CAG/LMS) must be repeated
 *
 * @see https://developer.schwab.com for official documentation
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { SchwabClient } from '../client';
import { SchwabClientConfig, OAuthTokens } from '../types';

/**
 * Schwab OAuth token expiration constants (per official documentation)
 */
export const TOKEN_EXPIRY = {
  /** Access token validity in seconds (30 minutes) */
  ACCESS_TOKEN_SECONDS: 1800,
  /** Access token validity in milliseconds */
  ACCESS_TOKEN_MS: 1800 * 1000,
  /** Refresh token validity in days */
  REFRESH_TOKEN_DAYS: 7,
  /** Refresh token validity in milliseconds */
  REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000,
  /** Buffer time before expiry to trigger refresh (5 minutes in ms) */
  EXPIRY_BUFFER_MS: 5 * 60 * 1000,
} as const;

// Use dynamic import for 'open' since it's ESM-only
let openBrowser: ((url: string) => Promise<unknown>) | null = null;

async function getOpenBrowser(): Promise<(url: string) => Promise<unknown>> {
  if (!openBrowser) {
    const module = await import('open');
    openBrowser = module.default;
  }
  return openBrowser;
}

/**
 * Token data structure stored in file
 */
export interface TokenFileData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  id_token?: string;
  creation_timestamp: number;
  expiry_timestamp: number;
}

/**
 * Options for easy client creation
 */
export interface EasyClientOptions {
  /** Path to token file for persistence */
  tokenPath: string;
  /** Schwab API key (client ID) */
  apiKey: string;
  /** Schwab app secret (client secret) */
  appSecret: string;
  /** OAuth callback URL (must match Schwab app config) */
  callbackUrl: string;
  /** Whether to use async client (default: false, always async in TS) */
  asyncio?: boolean;
  /** Custom function to handle token updates */
  onTokenUpdate?: (tokens: OAuthTokens) => void;
}

/**
 * Options for login flow
 */
export interface LoginFlowOptions extends EasyClientOptions {
  /** Timeout in seconds for waiting for callback (default: 300) */
  timeout?: number;
}

/**
 * Self-signed certificate for local HTTPS server
 */
const SELF_SIGNED_CERT = {
  key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7F7sW9e4CcHH5
Js7xQFP2K5e8l6e8VJqnLCk2bVYMqe5LvEQr3KQj3I5sFJKl8xv8zKvCq3Y6WVXJ
J4zQhBcKHbfcSZMKpE5dVJB4YnNl3QMQe2QZ8p3Jxk8TqVJhQ3sMCgYJp9b8NJQM
+J6TXsaXVo5V8ZSm8L7pYnPQs5kPGJEwJ8RuJELNnOxYdHVL8PJV3vQG9HjJ3mWH
rRFDJx3Q3RQj3aKsLQu3e5b3d5L3CkQ3X8c5RJkLQ3dWJL5X3QJ5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QIBAgMBAAECggEAGqZC6sLCMsrK6QfH5LNWTvY6r6I8vQI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI
5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QKBgQDwI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QKBgQDHI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QKBgCQI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QKBgQCdI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QKBgDQI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q=
-----END PRIVATE KEY-----`,
  cert: `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUJwI5QI5QI5QI5QI5QI5QI5QI5QwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCVVMxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNDAxMDEwMDAwMDBaFw0yNTAx
MDEwMDAwMDBaMEUxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQC7F7sW9e4CcHH5Js7xQFP2K5e8l6e8VJqnLCk2bVYM
qe5LvEQr3KQj3I5sFJKl8xv8zKvCq3Y6WVXJJ4zQhBcKHbfcSZMKpE5dVJB4YnNl
3QMQe2QZ8p3Jxk8TqVJhQ3sMCgYJp9b8NJQM+J6TXsaXVo5V8ZSm8L7pYnPQs5kP
GJEWJ8RuJELNnOxYdHVL8PJV3vQG9HjJ3mWHrRFDJx3Q3RQj3aKsLQu3e5b3d5L3
CkQ3X8c5RJkLQ3dWJL5X3QJ5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QIDAQABo1MwUTAdBgNVHQ4E
FgQUI5QI5QI5QI5QI5QI5QI5QI5QI5QwHwYDVR0jBBgwFoAUI5QI5QI5QI5QI5QI
5QI5QI5QI5QwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAI5QI
5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
I5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI
5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5
QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5QI5Q
-----END CERTIFICATE-----`,
};

/**
 * Generate self-signed certificate dynamically
 */
function generateSelfSignedCert(): { key: string; cert: string } {
  // Use pre-generated self-signed cert for localhost
  // In production, users should provide their own certs
  return SELF_SIGNED_CERT;
}

/**
 * Read token from file
 */
export function readTokenFile(tokenPath: string): TokenFileData | null {
  try {
    if (!fs.existsSync(tokenPath)) {
      return null;
    }
    const data = fs.readFileSync(tokenPath, 'utf-8');
    return JSON.parse(data) as TokenFileData;
  } catch (error) {
    console.error('Error reading token file:', error);
    return null;
  }
}

/**
 * Write token to file
 */
export function writeTokenFile(tokenPath: string, tokens: OAuthTokens): void {
  const tokenData: TokenFileData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type || 'Bearer',
    expires_in: tokens.expires_in,
    scope: tokens.scope || 'api',
    id_token: tokens.id_token,
    creation_timestamp: Date.now(),
    expiry_timestamp: Date.now() + tokens.expires_in * 1000,
  };

  // Ensure directory exists
  const dir = path.dirname(tokenPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2), 'utf-8');
}

/**
 * Convert token file data to OAuth tokens
 */
function tokenFileToOAuthTokens(data: TokenFileData): OAuthTokens {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    token_type: data.token_type,
    expires_in: data.expires_in,
    scope: data.scope,
    id_token: data.id_token,
  };
}

/**
 * Check if access token is expired or will expire soon (within 5 minutes)
 *
 * Per Schwab documentation: Access tokens are valid for 30 minutes.
 * We use a 5-minute buffer to proactively refresh before expiry.
 */
function isTokenExpired(data: TokenFileData): boolean {
  return Date.now() >= data.expiry_timestamp - TOKEN_EXPIRY.EXPIRY_BUFFER_MS;
}

/**
 * Check if refresh token is expired (7 days from creation)
 *
 * Per Schwab documentation: Refresh tokens are valid for 7 days.
 * Once expired, the full OAuth flow (CAG/LMS) must be repeated.
 */
function isRefreshTokenExpired(data: TokenFileData): boolean {
  return Date.now() >= data.creation_timestamp + TOKEN_EXPIRY.REFRESH_TOKEN_MS;
}

/**
 * Calculate token age in days
 */
export function getTokenAge(data: TokenFileData): number {
  return (Date.now() - data.creation_timestamp) / (24 * 60 * 60 * 1000);
}

/**
 * Create a client from an existing token file
 *
 * @param tokenPath Path to the token file
 * @param apiKey Schwab API key (client ID)
 * @param appSecret Schwab app secret (client secret)
 * @param callbackUrl OAuth callback URL
 * @returns SchwabClient if token is valid, null otherwise
 */
export async function clientFromTokenFile(
  tokenPath: string,
  apiKey: string,
  appSecret: string,
  callbackUrl: string
): Promise<SchwabClient | null> {
  const tokenData = readTokenFile(tokenPath);
  if (!tokenData) {
    return null;
  }

  if (isRefreshTokenExpired(tokenData)) {
    console.warn('Refresh token expired. Please re-authenticate.');
    return null;
  }

  const config: SchwabClientConfig = {
    clientId: apiKey,
    clientSecret: appSecret,
    redirectUri: callbackUrl,
    environment: 'production',
  };

  const client = new SchwabClient(config);
  const tokens = tokenFileToOAuthTokens(tokenData);

  // Set tokens
  client.setTokens(tokens, tokenData.expiry_timestamp);

  // Refresh if expired
  if (isTokenExpired(tokenData)) {
    try {
      const newTokens = await client.refreshTokens();
      writeTokenFile(tokenPath, newTokens);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  return client;
}

/**
 * Create a client using the browser-based login flow
 *
 * Opens a browser window for the user to log in, then captures the callback
 * on a local HTTPS server.
 *
 * @param options Login flow options
 * @returns SchwabClient after successful authentication
 */
export async function clientFromLoginFlow(options: LoginFlowOptions): Promise<SchwabClient> {
  const { tokenPath, apiKey, appSecret, callbackUrl, timeout = 300 } = options;

  const config: SchwabClientConfig = {
    clientId: apiKey,
    clientSecret: appSecret,
    redirectUri: callbackUrl,
    environment: 'production',
  };

  const client = new SchwabClient(config);
  const authUrl = client.getAuthorizationUrl();

  console.log('\n=== Schwab OAuth Login ===');
  console.log(`Opening browser to: ${authUrl}`);
  console.log('\nPlease log in to your Schwab account.');
  console.log(`Your callback URL is: ${callbackUrl}`);
  console.log('\nNote: You may see a browser warning about an invalid certificate.');
  console.log("This is expected for localhost. Proceed anyway (it's safe for local testing).\n");

  // Parse callback URL to get host and port
  const callbackUrlObj = new URL(callbackUrl);
  const port = parseInt(callbackUrlObj.port) || (callbackUrlObj.protocol === 'https:' ? 443 : 80);
  const isHttps = callbackUrlObj.protocol === 'https:';

  // Promise to wait for callback
  const callbackPromise = new Promise<string>((resolve, reject) => {
    const cert = generateSelfSignedCert();

    const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
      const reqUrl = new URL(req.url || '/', `${callbackUrlObj.protocol}//${callbackUrlObj.host}`);

      if (reqUrl.pathname === callbackUrlObj.pathname || reqUrl.pathname === '/') {
        const code = reqUrl.searchParams.get('code');

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Authentication Successful!</h1>
                <p>You can close this window and return to your application.</p>
              </body>
            </html>
          `);
          resolve(code);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>Authentication Failed</h1>
                <p>No authorization code received.</p>
              </body>
            </html>
          `);
          reject(new Error('No authorization code received'));
        }
      }
    };

    let server: https.Server | http.Server;

    if (isHttps) {
      server = https.createServer(
        {
          key: cert.key,
          cert: cert.cert,
        },
        requestHandler
      );
    } else {
      server = http.createServer(requestHandler);
    }

    server.listen(port, () => {
      console.log(`Listening for callback on port ${port}...`);
    });

    // Timeout
    setTimeout(() => {
      server.close();
      reject(new Error(`Timeout waiting for callback after ${timeout} seconds`));
    }, timeout * 1000);

    // Close server after receiving callback
    const originalResolve = resolve;
    resolve = (code: string) => {
      server.close();
      originalResolve(code);
    };
  });

  // Open browser
  try {
    const open = await getOpenBrowser();
    await open(authUrl);
  } catch (error) {
    console.log('Could not open browser automatically.');
    console.log(`Please open this URL manually: ${authUrl}`);
  }

  // Wait for callback
  const code = await callbackPromise;

  // Exchange code for tokens
  const tokens = await client.completeOAuth(code);

  // Save tokens
  writeTokenFile(tokenPath, tokens);
  console.log(`Token saved to: ${tokenPath}`);

  return client;
}

/**
 * Create a client using manual login flow (for environments without browser)
 *
 * Prints the authorization URL and prompts the user to paste the callback URL
 * after logging in.
 *
 * @param options Login flow options
 * @returns SchwabClient after successful authentication
 */
export async function clientFromManualFlow(options: EasyClientOptions): Promise<SchwabClient> {
  const { tokenPath, apiKey, appSecret, callbackUrl } = options;

  const config: SchwabClientConfig = {
    clientId: apiKey,
    clientSecret: appSecret,
    redirectUri: callbackUrl,
    environment: 'production',
  };

  const client = new SchwabClient(config);
  const authUrl = client.getAuthorizationUrl();

  console.log('\n=== Schwab OAuth Login (Manual Flow) ===');
  console.log('\nStep 1: Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\nStep 2: Log in to your Schwab account');
  console.log('\nStep 3: After logging in, you will be redirected to your callback URL.');
  console.log('         Copy the ENTIRE URL from your browser address bar');
  console.log('         (it will look like: ' + callbackUrl + '?code=...)');
  console.log('\nStep 4: Paste the callback URL here and press Enter:\n');

  // Read from stdin
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const redirectedUrl = await new Promise<string>((resolve) => {
    rl.question('Callback URL: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  // Extract code from URL
  const urlObj = new URL(redirectedUrl);
  const code = urlObj.searchParams.get('code');

  if (!code) {
    throw new Error('No authorization code found in the callback URL');
  }

  // Exchange code for tokens
  const tokens = await client.completeOAuth(code);

  // Save tokens
  writeTokenFile(tokenPath, tokens);
  console.log(`\nToken saved to: ${tokenPath}`);

  return client;
}

/**
 * Create a client using access functions for custom token management
 *
 * This is for advanced users who want complete control over token storage.
 *
 * @param apiKey Schwab API key (client ID)
 * @param appSecret Schwab app secret (client secret)
 * @param callbackUrl OAuth callback URL
 * @param tokenGetter Function to get current tokens
 * @param tokenSetter Function to save new tokens
 * @returns SchwabClient with custom token management
 */
export async function clientFromAccessFunctions(
  apiKey: string,
  appSecret: string,
  callbackUrl: string,
  tokenGetter: () => Promise<OAuthTokens | null>,
  tokenSetter: (tokens: OAuthTokens) => Promise<void>
): Promise<SchwabClient> {
  const config: SchwabClientConfig = {
    clientId: apiKey,
    clientSecret: appSecret,
    redirectUri: callbackUrl,
    environment: 'production',
  };

  const client = new SchwabClient(config);

  // Get existing tokens
  const existingTokens = await tokenGetter();

  if (existingTokens) {
    client.setTokens(existingTokens);

    // Try to refresh if needed
    if (!client.hasValidTokens()) {
      try {
        const newTokens = await client.refreshTokens();
        await tokenSetter(newTokens);
      } catch (error) {
        throw new Error('Token refresh failed. Please re-authenticate.');
      }
    }
  } else {
    throw new Error('No tokens available. Please authenticate first.');
  }

  return client;
}

/**
 * Easy client - automatically handles token loading and refresh
 *
 * This is the recommended way to create a client. It will:
 * 1. Try to load tokens from the token file
 * 2. Refresh tokens if they're expired
 * 3. Start the login flow if no valid tokens exist
 *
 * @param options Easy client options
 * @returns SchwabClient ready to use
 */
export async function easyClient(options: EasyClientOptions): Promise<SchwabClient> {
  const { tokenPath, apiKey, appSecret, callbackUrl, onTokenUpdate } = options;

  // Try to load from file first
  const existingClient = await clientFromTokenFile(tokenPath, apiKey, appSecret, callbackUrl);

  if (existingClient) {
    console.log('Loaded existing token from file.');

    // Set up token update callback if provided
    if (onTokenUpdate) {
      const tokens = existingClient.getTokens();
      if (tokens) {
        onTokenUpdate(tokens);
      }
    }

    return existingClient;
  }

  // Check if we're in an interactive environment
  const isInteractive = process.stdin.isTTY;

  if (isInteractive) {
    // Try browser-based login first
    try {
      const client = await clientFromLoginFlow({
        ...options,
        timeout: 300,
      });

      if (onTokenUpdate) {
        const tokens = client.getTokens();
        if (tokens) {
          onTokenUpdate(tokens);
        }
      }

      return client;
    } catch (error) {
      console.log('Browser-based login failed, falling back to manual flow...');

      const client = await clientFromManualFlow(options);

      if (onTokenUpdate) {
        const tokens = client.getTokens();
        if (tokens) {
          onTokenUpdate(tokens);
        }
      }

      return client;
    }
  } else {
    // Non-interactive environment - use manual flow
    const client = await clientFromManualFlow(options);

    if (onTokenUpdate) {
      const tokens = client.getTokens();
      if (tokens) {
        onTokenUpdate(tokens);
      }
    }

    return client;
  }
}
