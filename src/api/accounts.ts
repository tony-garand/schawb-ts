import { 
  Account, 
  AccountNumberMapping, 
  SecuritiesAccount, 
  Position 
} from '../types';
import { SchwabOAuth } from '../auth/oauth';

export class AccountsAPI {
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
   * Get account number mappings (plain/encrypted)
   * GET /accounts/accountNumbers
   */
  public async getAccountNumberMappings(): Promise<AccountNumberMapping[]> {
    const response = await this.makeRequest(
      `${this.baseUrl}/accounts/accountNumbers`
    );
    return response as AccountNumberMapping[];
  }

  /**
   * Get all accounts (optionally with positions)
   * GET /accounts?fields=positions
   */
  public async getAccounts(fields?: string): Promise<Account[]> {
    const url = fields
      ? `${this.baseUrl}/accounts?fields=${encodeURIComponent(fields)}`
      : `${this.baseUrl}/accounts`;
    const response = await this.makeRequest(url);
    return response as Account[];
  }

  /**
   * Get a specific account by encrypted account number
   * GET /accounts/{accountNumber}?fields=positions
   */
  public async getAccountByNumber(accountNumber: string, fields?: string): Promise<SecuritiesAccount> {
    const url = fields
      ? `${this.baseUrl}/accounts/${accountNumber}?fields=${encodeURIComponent(fields)}`
      : `${this.baseUrl}/accounts/${accountNumber}`;
    const response = await this.makeRequest(url);
    return response as SecuritiesAccount;
  }

  /**
   * Get account information (legacy, by accountId)
   */
  public async getAccount(accountId: string): Promise<Account> {
    const response = await this.makeRequest(
      `${this.baseUrl}/accounts/${accountId}`
    );
    return response as Account;
  }

  /**
   * Get positions for an account
   */
  public async getPositions(accountId: string): Promise<Position[]> {
    const response = await this.makeRequest(
      `${this.baseUrl}/accounts/${accountId}/positions`
    );
    return response as Position[];
  }

  /**
   * Get account history
   */
  public async getAccountHistory(accountId: string, options?: {
    startDate?: string;
    endDate?: string;
    frequencyType?: string;
    frequency?: number;
    needExtendedHoursData?: boolean;
  }): Promise<unknown> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.frequencyType) params.append('frequencyType', options.frequencyType);
    if (options?.frequency) params.append('frequency', options.frequency.toString());
    if (options?.needExtendedHoursData) params.append('needExtendedHoursData', options.needExtendedHoursData.toString());
    const response = await this.makeRequest(
      `${this.baseUrl}/accounts/${accountId}/history?${params.toString()}`
    );
    return response;
  }
} 