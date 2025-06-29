import { SchwabOAuth } from '../auth/oauth';

// Account preference types
export interface AccountPreference {
  accountNumber: string;
  primaryAccount: boolean;
  type: string;
  nickName: string;
  accountColor: string;
  displayAcctId: string;
  autoPositionEffect: boolean;
}

// Streamer information types
export interface StreamerInfo {
  streamerSocketUrl: string;
  schwabClientCustomerId: string;
  schwabClientCorrelId: string;
  schwabClientChannel: string;
  schwabClientFunctionId: string;
}

// Offer types
export interface Offer {
  level2Permissions: boolean;
  mktDataPermission: string;
}

// Main user preference interface
export interface UserPreference {
  accounts: AccountPreference[];
  streamerInfo: StreamerInfo[];
  offers: Offer[];
}

export class UserPreferenceAPI {
  private oauth: SchwabOAuth;
  private baseUrl: string;

  constructor(oauth: SchwabOAuth, environment: 'sandbox' | 'production' = 'production') {
    this.oauth = oauth;
    this.baseUrl = environment === 'sandbox' 
      ? 'https://api.schwabapi.com/v1/sandbox' 
      : 'https://api.schwabapi.com/v1';
  }

  private async makeRequest(url: string, options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}): Promise<unknown> {
    const authHeader = await this.oauth.getAuthorizationHeader();
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
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
   * Get user preference information for the logged in user
   * @returns Promise with user preference data
   */
  public async getUserPreferences(): Promise<UserPreference[]> {
    return this.makeRequest(`${this.baseUrl}/userPreference`) as Promise<UserPreference[]>;
  }

  /**
   * Get primary account from user preferences
   * @returns Promise with primary account preference or null
   */
  public async getPrimaryAccount(): Promise<AccountPreference | null> {
    const preferences = await this.getUserPreferences();
    
    for (const preference of preferences) {
      const primaryAccount = preference.accounts.find(account => account.primaryAccount);
      if (primaryAccount) {
        return primaryAccount;
      }
    }
    
    return null;
  }

  /**
   * Get all account preferences
   * @returns Promise with array of account preferences
   */
  public async getAccountPreferences(): Promise<AccountPreference[]> {
    const preferences = await this.getUserPreferences();
    return preferences.flatMap(preference => preference.accounts);
  }

  /**
   * Get account preference by account number
   * @param accountNumber Account number to find
   * @returns Promise with account preference or null
   */
  public async getAccountPreference(accountNumber: string): Promise<AccountPreference | null> {
    const accountPreferences = await this.getAccountPreferences();
    return accountPreferences.find(account => account.accountNumber === accountNumber) || null;
  }

  /**
   * Get streamer information
   * @returns Promise with streamer info array
   */
  public async getStreamerInfo(): Promise<StreamerInfo[]> {
    const preferences = await this.getUserPreferences();
    return preferences.flatMap(preference => preference.streamerInfo);
  }

  /**
   * Get offers information
   * @returns Promise with offers array
   */
  public async getOffers(): Promise<Offer[]> {
    const preferences = await this.getUserPreferences();
    return preferences.flatMap(preference => preference.offers);
  }

  /**
   * Check if user has level 2 permissions
   * @returns Promise with boolean indicating level 2 permissions
   */
  public async hasLevel2Permissions(): Promise<boolean> {
    const offers = await this.getOffers();
    return offers.some(offer => offer.level2Permissions);
  }

  /**
   * Get market data permissions
   * @returns Promise with market data permission string
   */
  public async getMarketDataPermissions(): Promise<string[]> {
    const offers = await this.getOffers();
    return offers.map(offer => offer.mktDataPermission).filter(Boolean);
  }

  /**
   * Get account nicknames
   * @returns Promise with account number to nickname mapping
   */
  public async getAccountNicknames(): Promise<Record<string, string>> {
    const accountPreferences = await this.getAccountPreferences();
    const nicknames: Record<string, string> = {};
    
    accountPreferences.forEach(account => {
      if (account.nickName) {
        nicknames[account.accountNumber] = account.nickName;
      }
    });
    
    return nicknames;
  }

  /**
   * Get account colors
   * @returns Promise with account number to color mapping
   */
  public async getAccountColors(): Promise<Record<string, string>> {
    const accountPreferences = await this.getAccountPreferences();
    const colors: Record<string, string> = {};
    
    accountPreferences.forEach(account => {
      if (account.accountColor) {
        colors[account.accountNumber] = account.accountColor;
      }
    });
    
    return colors;
  }

  /**
   * Get accounts by type
   * @param type Account type to filter by
   * @returns Promise with filtered account preferences
   */
  public async getAccountsByType(type: string): Promise<AccountPreference[]> {
    const accountPreferences = await this.getAccountPreferences();
    return accountPreferences.filter(account => account.type === type);
  }

  /**
   * Get accounts with auto position effect enabled
   * @returns Promise with accounts that have auto position effect enabled
   */
  public async getAccountsWithAutoPositionEffect(): Promise<AccountPreference[]> {
    const accountPreferences = await this.getAccountPreferences();
    return accountPreferences.filter(account => account.autoPositionEffect);
  }

  /**
   * Get streamer socket URL
   * @returns Promise with streamer socket URL or null
   */
  public async getStreamerSocketUrl(): Promise<string | null> {
    const streamerInfo = await this.getStreamerInfo();
    return streamerInfo.length > 0 ? streamerInfo[0].streamerSocketUrl : null;
  }

  /**
   * Get Schwab client customer ID
   * @returns Promise with customer ID or null
   */
  public async getSchwabClientCustomerId(): Promise<string | null> {
    const streamerInfo = await this.getStreamerInfo();
    return streamerInfo.length > 0 ? streamerInfo[0].schwabClientCustomerId : null;
  }

  /**
   * Get Schwab client correlation ID
   * @returns Promise with correlation ID or null
   */
  public async getSchwabClientCorrelId(): Promise<string | null> {
    const streamerInfo = await this.getStreamerInfo();
    return streamerInfo.length > 0 ? streamerInfo[0].schwabClientCorrelId : null;
  }

  /**
   * Get Schwab client channel
   * @returns Promise with client channel or null
   */
  public async getSchwabClientChannel(): Promise<string | null> {
    const streamerInfo = await this.getStreamerInfo();
    return streamerInfo.length > 0 ? streamerInfo[0].schwabClientChannel : null;
  }

  /**
   * Get Schwab client function ID
   * @returns Promise with function ID or null
   */
  public async getSchwabClientFunctionId(): Promise<string | null> {
    const streamerInfo = await this.getStreamerInfo();
    return streamerInfo.length > 0 ? streamerInfo[0].schwabClientFunctionId : null;
  }
} 