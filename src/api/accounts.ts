import { 
  Account, 
  AccountNumberMapping, 
  SecuritiesAccount, 
  Position 
} from '../types';
import { SchwabOAuth } from '../auth/oauth';
import { HttpClient } from '../http/httpClient';
import { getBaseUrl } from '../config/endpoints';

export class AccountsAPI {
  private http: HttpClient;

  constructor(oauth: SchwabOAuth, environment: 'sandbox' | 'production' = 'production') {
    this.http = new HttpClient(oauth, getBaseUrl('trader', environment));
  }

  /**
   * Get account number mappings (plain/encrypted)
   * GET /accounts/accountNumbers
   */
  public async getAccountNumberMappings(): Promise<AccountNumberMapping[]> {
    const response = await this.http.request(
      `/accounts/accountNumbers`
    );
    return response as AccountNumberMapping[];
  }

  /**
   * Get all accounts (optionally with positions)
   * GET /accounts?fields=positions
   */
  public async getAccounts(fields?: string): Promise<Account[]> {
    const url = fields
      ? `/accounts?fields=${encodeURIComponent(fields)}`
      : `/accounts`;
    const response = await this.http.request(url);
    return response as Account[];
  }

  /**
   * Get a specific account by encrypted account number
   * GET /accounts/{accountNumber}?fields=positions
   */
  public async getAccountByNumber(accountNumber: string, fields?: string): Promise<SecuritiesAccount> {
    const url = fields
      ? `/accounts/${accountNumber}?fields=${encodeURIComponent(fields)}`
      : `/accounts/${accountNumber}`;
    const response = await this.http.request(url);
    return response as SecuritiesAccount;
  }

  /**
   * Get account information (legacy, by accountId)
   */
  public async getAccount(accountId: string): Promise<Account> {
    const response = await this.http.request(
      `/accounts/${accountId}`
    );
    return response as Account;
  }

  /**
   * Get positions for an account
   */
  public async getPositions(accountId: string): Promise<Position[]> {
    const response = await this.http.request(
      `/accounts/${accountId}/positions`
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
    const response = await this.http.request(
      `/accounts/${accountId}/history?${params.toString()}`
    );
    return response;
  }
} 