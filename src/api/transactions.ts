import { SchwabOAuth } from '../auth/oauth';

// Transaction types based on Schwab API documentation
export type TransactionType = 
  | 'TRADE' 
  | 'RECEIVE_AND_DELIVER' 
  | 'DIVIDEND_OR_INTEREST' 
  | 'ACH_RECEIPT' 
  | 'ACH_DISBURSEMENT' 
  | 'CASH_RECEIPT' 
  | 'CASH_DISBURSEMENT' 
  | 'ELECTRONIC_FUND' 
  | 'WIRE_OUT' 
  | 'WIRE_IN' 
  | 'JOURNAL' 
  | 'MEMORANDUM' 
  | 'MARGIN_CALL' 
  | 'MONEY_MARKET' 
  | 'SMA_ADJUSTMENT';

// Transaction status types
export type TransactionStatus = 'VALID' | 'INVALID' | 'PENDING' | 'CANCELLED';

// Activity types
export type ActivityType = 'ACTIVITY_CORRECTION' | 'TRADE' | 'DIVIDEND' | 'INTEREST' | 'DEPOSIT' | 'WITHDRAWAL';

// User types
export type UserType = 'ADVISOR_USER' | 'INDIVIDUAL_USER' | 'SYSTEM_USER';

// Sub account types
export type SubAccountType = 'CASH' | 'MARGIN' | 'SHORT';

// Fee types
export type FeeType = 'COMMISSION' | 'REG_FEE' | 'SEC_FEE' | 'OTHER';

// Position effect types
export type PositionEffect = 'OPENING' | 'CLOSING' | 'INCREASE' | 'DECREASE';

// Transaction query parameters interface
export interface TransactionQueryParams {
  startDate: string;  // Required: ISO-8601 format
  endDate: string;    // Required: ISO-8601 format
  symbol?: string;    // Optional: Filter by symbol
  types?: TransactionType; // Optional: Filter by transaction type
}

// User information in transaction
export interface TransactionUser {
  cdDomainId: string;
  login: string;
  type: UserType;
  userId: number;
  systemUserName: string;
  firstName: string;
  lastName: string;
  brokerRepCode: string;
}

// Instrument information in transfer items
export interface TransactionInstrument {
  cusip: string;
  symbol: string;
  description: string;
  instrumentId: number;
  netChange: number;
  type: string;
}

// Transfer item in transaction
export interface TransferItem {
  instrument: TransactionInstrument;
  amount: number;
  cost: number;
  price: number;
  feeType: FeeType;
  positionEffect: PositionEffect;
}

// Main transaction interface
export interface Transaction {
  activityId: number;
  time: string;
  user: TransactionUser;
  description: string;
  accountNumber: string;
  type: TransactionType;
  status: TransactionStatus;
  subAccount: SubAccountType;
  tradeDate: string;
  settlementDate: string;
  positionId: number;
  orderId: number;
  netAmount: number;
  activityType: ActivityType;
  transferItems: TransferItem[];
}

export class TransactionsAPI {
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
   * Get all transactions for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param params Query parameters for filtering transactions
   * @returns Promise with array of transactions
   */
  public async getTransactions(
    accountNumber: string, 
    params: TransactionQueryParams
  ): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    
    // Required parameters
    queryParams.append('startDate', params.startDate);
    queryParams.append('endDate', params.endDate);
    
    // Optional parameters
    if (params.symbol) {
      queryParams.append('symbol', params.symbol);
    }
    if (params.types) {
      queryParams.append('types', params.types);
    }

    const url = `${this.baseUrl}/accounts/${accountNumber}/transactions`;
    const fullUrl = `${url}?${queryParams.toString()}`;
    
    return this.makeRequest(fullUrl) as Promise<Transaction[]>;
  }

  /**
   * Get a specific transaction by ID for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param transactionId The ID of the transaction being retrieved
   * @returns Promise with transaction details
   */
  public async getTransaction(
    accountNumber: string, 
    transactionId: number
  ): Promise<Transaction> {
    return this.makeRequest(
      `${this.baseUrl}/accounts/${accountNumber}/transactions/${transactionId}`
    ) as Promise<Transaction>;
  }

  /**
   * Helper method to create ISO-8601 formatted date strings
   * @param date Date object or string
   * @returns ISO-8601 formatted string
   */
  public static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  }

  /**
   * Helper method to create date range for transaction queries
   * @param startDate Start date
   * @param endDate End date
   * @returns Object with formatted date strings
   */
  public static createDateRange(startDate: Date | string, endDate: Date | string): { startDate: string; endDate: string } {
    return {
      startDate: this.formatDateTime(startDate),
      endDate: this.formatDateTime(endDate),
    };
  }

  /**
   * Helper method to get transactions for the last N days
   * @param accountNumber Account number
   * @param days Number of days to look back
   * @param symbol Optional symbol filter
   * @param types Optional transaction type filter
   * @returns Promise with transactions
   */
  public async getRecentTransactions(
    accountNumber: string,
    days: number,
    symbol?: string,
    types?: TransactionType
  ): Promise<Transaction[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const params: TransactionQueryParams = {
      ...TransactionsAPI.createDateRange(startDate, endDate),
      ...(symbol && { symbol }),
      ...(types && { types }),
    };

    return this.getTransactions(accountNumber, params);
  }

  /**
   * Helper method to get transactions for a specific month
   * @param accountNumber Account number
   * @param year Year (e.g., 2024)
   * @param month Month (1-12)
   * @param symbol Optional symbol filter
   * @param types Optional transaction type filter
   * @returns Promise with transactions
   */
  public async getTransactionsForMonth(
    accountNumber: string,
    year: number,
    month: number,
    symbol?: string,
    types?: TransactionType
  ): Promise<Transaction[]> {
    const startDate = new Date(year, month - 1, 1); // Month is 0-indexed
    const endDate = new Date(year, month, 0); // Last day of the month

    const params: TransactionQueryParams = {
      ...TransactionsAPI.createDateRange(startDate, endDate),
      ...(symbol && { symbol }),
      ...(types && { types }),
    };

    return this.getTransactions(accountNumber, params);
  }

  /**
   * Helper method to get trade transactions only
   * @param accountNumber Account number
   * @param startDate Start date
   * @param endDate End date
   * @param symbol Optional symbol filter
   * @returns Promise with trade transactions
   */
  public async getTradeTransactions(
    accountNumber: string,
    startDate: Date | string,
    endDate: Date | string,
    symbol?: string
  ): Promise<Transaction[]> {
    const params: TransactionQueryParams = {
      ...TransactionsAPI.createDateRange(startDate, endDate),
      types: 'TRADE',
      ...(symbol && { symbol }),
    };

    return this.getTransactions(accountNumber, params);
  }

  /**
   * Helper method to get dividend transactions only
   * @param accountNumber Account number
   * @param startDate Start date
   * @param endDate End date
   * @param symbol Optional symbol filter
   * @returns Promise with dividend transactions
   */
  public async getDividendTransactions(
    accountNumber: string,
    startDate: Date | string,
    endDate: Date | string,
    symbol?: string
  ): Promise<Transaction[]> {
    const params: TransactionQueryParams = {
      ...TransactionsAPI.createDateRange(startDate, endDate),
      types: 'DIVIDEND_OR_INTEREST',
      ...(symbol && { symbol }),
    };

    return this.getTransactions(accountNumber, params);
  }
} 