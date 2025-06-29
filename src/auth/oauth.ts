import { 
  OAuthTokens, 
  OAuthConfig
} from '../types';

export class SchwabOAuth {
  private config: OAuthConfig;
  private tokens: OAuthTokens | null = null;
  private tokenExpiryTime: number = 0;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Make HTTP request using native fetch API
   */
  private async makeRequest(url: string, options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}): Promise<unknown> {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
      body: options.body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  /**
   * Generate the authorization URL for the OAuth flow
   * @param state Optional state parameter for security
   * @returns Authorization URL
   */
  public getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'api',
    });

    if (state) {
      params.append('state', state);
    }

    return `https://api.schwabapi.com/v1/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   * @param code Authorization code from the OAuth callback
   * @returns Promise with OAuth tokens
   */
  public async exchangeCodeForTokens(code: string): Promise<OAuthTokens> {
    try {
      const authHeader = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: decodeURIComponent(code),
        redirect_uri: this.config.redirectUri,
      });

      const response = await this.makeRequest('https://api.schwabapi.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      this.tokens = response as OAuthTokens;
      this.tokenExpiryTime = Date.now() + ((response as OAuthTokens).expires_in * 1000);
      
      return response as OAuthTokens;
    } catch (error) {
      throw new Error(`OAuth token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Optional refresh token (uses stored if not provided)
   * @returns Promise with new OAuth tokens
   */
  public async refreshTokens(refreshToken?: string): Promise<OAuthTokens> {
    try {
      const tokenToUse = refreshToken || this.tokens?.refresh_token;
      
      if (!tokenToUse) {
        throw new Error('No refresh token available');
      }

      const authHeader = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenToUse,
      });

      const response = await this.makeRequest('https://api.schwabapi.com/v1/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      this.tokens = response as OAuthTokens;
      this.tokenExpiryTime = Date.now() + ((response as OAuthTokens).expires_in * 1000);
      
      return response as OAuthTokens;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current access token, refreshing if necessary
   * @returns Promise with valid access token
   */
  public async getAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('No tokens available. Please complete OAuth flow first.');
    }

    // Check if token is expired or will expire in the next 5 minutes
    if (Date.now() >= this.tokenExpiryTime - 300000) {
      await this.refreshTokens();
    }

    return this.tokens.access_token;
  }

  /**
   * Check if tokens are available and valid
   * @returns boolean indicating if tokens are valid
   */
  public hasValidTokens(): boolean {
    return !!(this.tokens && Date.now() < this.tokenExpiryTime);
  }

  /**
   * Get current tokens
   * @returns Current OAuth tokens or null
   */
  public getTokens(): OAuthTokens | null {
    return this.tokens;
  }

  /**
   * Set tokens manually (useful for restoring from storage)
   * @param tokens OAuth tokens
   * @param expiryTime Optional expiry time in milliseconds
   */
  public setTokens(tokens: OAuthTokens, expiryTime?: number): void {
    this.tokens = tokens;
    this.tokenExpiryTime = expiryTime || (Date.now() + (tokens.expires_in * 1000));
  }

  /**
   * Clear stored tokens
   */
  public clearTokens(): void {
    this.tokens = null;
    this.tokenExpiryTime = 0;
  }

  /**
   * Get authorization header for API requests
   * @returns Promise with authorization header
   */
  public async getAuthorizationHeader(): Promise<string> {
    const accessToken = await this.getAccessToken();
    return `Bearer ${accessToken}`;
  }
} 