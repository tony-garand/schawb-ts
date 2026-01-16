import { SchwabOAuth } from './auth/oauth';
import { SchwabTradingAPI } from './api/trading';
import { AccountsAPI } from './api/accounts';
import { OrdersAPI, OrderExtended, OrderPreviewResponse, OrderQueryParams } from './api/orders';
import { TransactionsAPI, TransactionQueryParams, Transaction, TransactionType } from './api/transactions';
import { UserPreferenceAPI } from './api/userPreference';
import { MarketDataAPI, QuoteRequestParams, QuoteResponse, MarketDataQuote, OptionChainRequestParams, OptionChainResponse, OptionExpirationChainResponse, PriceHistoryRequestParams, PriceHistoryResponse, PeriodType, FrequencyType, MoversResponse, MarketHoursRequestParams, MarketHoursResponse, MarketType, MoversRequestParams, MoversSymbolId, MoversSort, MoversFrequency, InstrumentsRequestParams, InstrumentsResponse, Instrument, InstrumentProjection } from './api/marketData';
import { 
  SchwabClientConfig, 
  OAuthConfig, 
  OAuthTokens,
  Order,
  OrderResponse,
  Account,
  Position,
  Quote,
  MarketHours,
  AccountNumberMapping,
  SecuritiesAccount
} from './types';
import { OrderBuilder, OrderLegBuilder, OrderTemplates } from './builders/orderBuilder';

export class SchwabClient {
  private oauth: SchwabOAuth;
  public orders: OrdersAPI;
  public accounts: AccountsAPI;
  public transactions: TransactionsAPI;
  public userPreference: UserPreferenceAPI;
  public marketData: MarketDataAPI;
  private tradingAPI: SchwabTradingAPI;
  private config: SchwabClientConfig;

  constructor(config: SchwabClientConfig) {
    this.config = config;
    
    const oauthConfig: OAuthConfig = {
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    };

    this.oauth = new SchwabOAuth(oauthConfig);
    this.tradingAPI = new SchwabTradingAPI(this.oauth, config.environment);
    this.accounts = new AccountsAPI(this.oauth, config.environment);
    this.orders = new OrdersAPI(this.oauth, config.environment);
    this.transactions = new TransactionsAPI(this.oauth, config.environment);
    this.userPreference = new UserPreferenceAPI(this.oauth, config.environment);
    this.marketData = new MarketDataAPI(this.oauth, config.environment);
  }

  // OAuth Methods
  /**
   * Get the authorization URL for OAuth flow
   * @param state Optional state parameter for security
   * @returns Authorization URL
   */
  public getAuthorizationUrl(state?: string): string {
    return this.oauth.getAuthorizationUrl(state);
  }

  /**
   * Complete OAuth flow by exchanging authorization code for tokens
   * @param code Authorization code from OAuth callback
   * @returns Promise with OAuth tokens
   */
  public async completeOAuth(code: string): Promise<OAuthTokens> {
    return this.oauth.exchangeCodeForTokens(code);
  }

  /**
   * Refresh access tokens
   * @param refreshToken Optional refresh token
   * @returns Promise with new OAuth tokens
   */
  public async refreshTokens(refreshToken?: string): Promise<OAuthTokens> {
    return this.oauth.refreshTokens(refreshToken);
  }

  /**
   * Check if tokens are valid
   * @returns boolean indicating if tokens are valid
   */
  public hasValidTokens(): boolean {
    return this.oauth.hasValidTokens();
  }

  /**
   * Get current tokens
   * @returns Current OAuth tokens or null
   */
  public getTokens(): OAuthTokens | null {
    return this.oauth.getTokens();
  }

  /**
   * Set tokens manually (useful for restoring from storage)
   * @param tokens OAuth tokens
   * @param expiryTime Optional expiry time in milliseconds
   */
  public setTokens(tokens: OAuthTokens, expiryTime?: number): void {
    this.oauth.setTokens(tokens, expiryTime);
  }

  /**
   * Clear stored tokens
   */
  public clearTokens(): void {
    this.oauth.clearTokens();
  }

  // Trading API Methods
  /**
   * Place a new order
   * @param order Order object
   * @param accountNumber Account number to place order for
   * @returns Promise with order response
   */
  public async placeOrder(order: Order, accountNumber: string): Promise<OrderResponse> {
    return this.orders.placeOrder(accountNumber, order);
  }

  /**
   * Get order by ID
   * @param orderId Order ID
   * @param accountNumber Account number
   * @returns Promise with order details
   */
  public async getOrder(orderId: number, accountNumber: string): Promise<OrderExtended> {
    return this.orders.getOrder(accountNumber, orderId);
  }

  /**
   * Cancel an order
   * @param orderId Order ID to cancel
   * @param accountNumber Account number
   * @returns Promise with cancellation response
   */
  public async cancelOrder(orderId: number, accountNumber: string): Promise<void> {
    return this.orders.cancelOrder(accountNumber, orderId);
  }

  /**
   * Replace an order
   * @param orderId Order ID to replace
   * @param accountNumber Account number
   * @param newOrder New order object
   * @returns Promise with replacement response
   */
  public async replaceOrder(orderId: number, accountNumber: string, newOrder: Order): Promise<OrderResponse> {
    return this.orders.replaceOrder(accountNumber, orderId, newOrder);
  }

  /**
   * Get all orders for an account
   * @param accountNumber Account number
   * @param params Query parameters for filtering orders
   * @returns Promise with orders list
   */
  public async getOrdersForAccount(accountNumber: string, params?: OrderQueryParams): Promise<OrderExtended[]> {
    return this.orders.getOrdersForAccount(accountNumber, params || {});
  }

  /**
   * Get all orders for all accounts
   * @param params Query parameters for filtering orders
   * @returns Promise with orders list
   */
  public async getAllOrders(params?: OrderQueryParams): Promise<OrderExtended[]> {
    return this.orders.getAllOrders(params || {});
  }

  /**
   * Preview order for a specific account (Coming Soon)
   * @param accountNumber Account number
   * @param order Order object to preview
   * @returns Promise with order preview response
   */
  public async previewOrder(accountNumber: string, order: Order): Promise<OrderPreviewResponse> {
    return this.orders.previewOrder(accountNumber, order);
  }

  /**
   * Get account information
   * @param accountId Account ID
   * @returns Promise with account details
   */
  public async getAccount(accountId: string): Promise<Account> {
    return this.accounts.getAccount(accountId);
  }

  /**
   * Get positions for an account
   * @param accountId Account ID
   * @returns Promise with positions list
   */
  public async getPositions(accountId: string): Promise<Position[]> {
    return this.accounts.getPositions(accountId);
  }

  /**
   * Get quote for a symbol
   * @param symbol Stock or option symbol
   * @returns Promise with quote data
   */
  public async getQuote(symbol: string): Promise<Quote> {
    return this.tradingAPI.getQuote(symbol);
  }

  /**
   * Get quotes for multiple symbols
   * @param symbols Array of symbols
   * @returns Promise with quotes data
   */
  public async getQuotes(symbols: string[]): Promise<Quote[]> {
    return this.tradingAPI.getQuotes(symbols);
  }

  // Market Data API Methods
  /**
   * Get market data quotes by list of symbols
   * @param params Query parameters for the quote request
   * @returns Promise with quote response object
   */
  public async getMarketDataQuotes(params: QuoteRequestParams): Promise<QuoteResponse> {
    return this.marketData.getQuotes(params);
  }

  /**
   * Get market data quote by single symbol
   * @param symbolId The symbol to get quote for
   * @param fields Optional comma-separated list of fields to include
   * @returns Promise with quote data for the symbol
   */
  public async getMarketDataQuoteBySymbol(symbolId: string, fields?: string): Promise<MarketDataQuote> {
    return this.marketData.getQuoteBySymbol(symbolId, fields);
  }

  /**
   * Get market data quotes for multiple symbols with convenience method
   * @param symbols Array of symbols to get quotes for
   * @param options Optional parameters for the request
   * @returns Promise with quote response object
   */
  public async getMarketDataQuotesForSymbols(
    symbols: string[], 
    options?: {
      fields?: string;
      indicative?: boolean;
    }
  ): Promise<QuoteResponse> {
    return this.marketData.getQuotesForSymbols(symbols, options);
  }

  /**
   * Get market hours for a specific date
   * @param date Date in YYYY-MM-DD format
   * @param market Market type (e.g., 'EQUITY', 'OPTION')
   * @returns Promise with market hours
   */
  public async getMarketHours(date: string, market: string = 'EQUITY'): Promise<MarketHours> {
    return this.tradingAPI.getMarketHours(date, market);
  }

  /**
   * Search for instruments
   * @param symbol Symbol to search for
   * @param projection Search projection type
   * @returns Promise with search results
   */
  public async searchInstruments(symbol: string, projection: string = 'symbol-search'): Promise<unknown[]> {
    return this.tradingAPI.searchInstruments(symbol, projection);
  }

  /**
   * Get instrument details
   * @param symbol Symbol to get details for
   * @returns Promise with instrument details
   */
  public async getInstrument(symbol: string): Promise<unknown> {
    return this.tradingAPI.getInstrument(symbol);
  }

  /**
   * Get account history
   * @param accountId Account ID
   * @param options History options
   * @returns Promise with account history
   */
  public async getAccountHistory(accountId: string, options?: {
    startDate?: string;
    endDate?: string;
    frequencyType?: string;
    frequency?: number;
    needExtendedHoursData?: boolean;
  }): Promise<unknown> {
    return this.accounts.getAccountHistory(accountId, options);
  }

  // Order Builder Access
  /**
   * Get order builder for creating custom orders
   * @returns OrderBuilder instance
   */
  public createOrder(): OrderBuilder {
    return new OrderBuilder();
  }

  /**
   * Get order leg builder for creating order legs
   * @returns OrderLegBuilder instance
   */
  public createOrderLeg(): OrderLegBuilder {
    return new OrderLegBuilder();
  }

  // Order Templates
  /**
   * Get access to pre-built order templates
   * @returns OrderTemplates class
   */
  public get templates(): typeof OrderTemplates {
    return OrderTemplates;
  }

  // Utility Methods
  /**
   * Create option symbol from components
   * @param underlying Underlying stock symbol
   * @param expiration Expiration date in YYMMDD format
   * @param optionType Call ('C') or Put ('P')
   * @param strikePrice Strike price
   * @returns Formatted option symbol
   */
  public createOptionSymbol(
    underlying: string,
    expiration: string,
    optionType: 'C' | 'P',
    strikePrice: number
  ): string {
    return OrderTemplates.createOptionSymbol(underlying, expiration, optionType, strikePrice);
  }

  /**
   * Get client configuration
   * @returns Client configuration
   */
  public getConfig(): SchwabClientConfig {
    return { ...this.config };
  }

  /**
   * Get account number mappings (plain/encrypted)
   */
  public async getAccountNumberMappings(): Promise<AccountNumberMapping[]> {
    return this.accounts.getAccountNumberMappings();
  }

  /**
   * Get all accounts (optionally with positions)
   */
  public async getAccounts(fields?: string): Promise<Account[]> {
    return this.accounts.getAccounts(fields);
  }

  /**
   * Get a specific account by encrypted account number
   */
  public async getAccountByNumber(accountNumber: string, fields?: string): Promise<SecuritiesAccount> {
    return this.accounts.getAccountByNumber(accountNumber, fields);
  }

  /**
   * Get all transactions for a specific account
   * @param accountNumber Account number
   * @param params Query parameters for filtering transactions
   * @returns Promise with array of transactions
   */
  public async getTransactions(accountNumber: string, params: TransactionQueryParams): Promise<Transaction[]> {
    return this.transactions.getTransactions(accountNumber, params);
  }

  /**
   * Get a specific transaction by ID
   * @param accountNumber Account number
   * @param transactionId Transaction ID
   * @returns Promise with transaction details
   */
  public async getTransaction(accountNumber: string, transactionId: number): Promise<unknown> {
    return this.transactions.getTransaction(accountNumber, transactionId);
  }

  /**
   * Get recent transactions for the last N days
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
  ): Promise<unknown[]> {
    return this.transactions.getRecentTransactions(accountNumber, days, symbol, types);
  }

  /**
   * Get transactions for a specific month
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
  ): Promise<unknown[]> {
    return this.transactions.getTransactionsForMonth(accountNumber, year, month, symbol, types);
  }

  /**
   * Get trade transactions only
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
  ): Promise<unknown[]> {
    return this.transactions.getTradeTransactions(accountNumber, startDate, endDate, symbol);
  }

  /**
   * Get dividend transactions only
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
  ): Promise<unknown[]> {
    return this.transactions.getDividendTransactions(accountNumber, startDate, endDate, symbol);
  }

  /**
   * Get user preference information for the logged in user
   * @returns Promise with user preference data
   */
  public async getUserPreferences(): Promise<unknown[]> {
    return this.userPreference.getUserPreferences();
  }

  /**
   * Get primary account from user preferences
   * @returns Promise with primary account preference or null
   */
  public async getPrimaryAccount(): Promise<unknown> {
    return this.userPreference.getPrimaryAccount();
  }

  /**
   * Get all account preferences
   * @returns Promise with array of account preferences
   */
  public async getAccountPreferences(): Promise<unknown[]> {
    return this.userPreference.getAccountPreferences();
  }

  /**
   * Get account preference by account number
   * @param accountNumber Account number to find
   * @returns Promise with account preference or null
   */
  public async getAccountPreference(accountNumber: string): Promise<unknown> {
    return this.userPreference.getAccountPreference(accountNumber);
  }

  /**
   * Get streamer information
   * @returns Promise with streamer info array
   */
  public async getStreamerInfo(): Promise<unknown[]> {
    return this.userPreference.getStreamerInfo();
  }

  /**
   * Get offers information
   * @returns Promise with offers array
   */
  public async getOffers(): Promise<unknown[]> {
    return this.userPreference.getOffers();
  }

  /**
   * Check if user has level 2 permissions
   * @returns Promise with boolean indicating level 2 permissions
   */
  public async hasLevel2Permissions(): Promise<boolean> {
    return this.userPreference.hasLevel2Permissions();
  }

  /**
   * Get market data permissions
   * @returns Promise with market data permission strings
   */
  public async getMarketDataPermissions(): Promise<string[]> {
    return this.userPreference.getMarketDataPermissions();
  }

  /**
   * Get account nicknames
   * @returns Promise with account number to nickname mapping
   */
  public async getAccountNicknames(): Promise<Record<string, string>> {
    return this.userPreference.getAccountNicknames();
  }

  /**
   * Get account colors
   * @returns Promise with account number to color mapping
   */
  public async getAccountColors(): Promise<Record<string, string>> {
    return this.userPreference.getAccountColors();
  }

  /**
   * Get accounts by type
   * @param type Account type to filter by
   * @returns Promise with filtered account preferences
   */
  public async getAccountsByType(type: string): Promise<unknown[]> {
    return this.userPreference.getAccountsByType(type);
  }

  /**
   * Get accounts with auto position effect enabled
   * @returns Promise with accounts that have auto position effect enabled
   */
  public async getAccountsWithAutoPositionEffect(): Promise<unknown[]> {
    return this.userPreference.getAccountsWithAutoPositionEffect();
  }

  /**
   * Get streamer socket URL
   * @returns Promise with streamer socket URL or null
   */
  public async getStreamerSocketUrl(): Promise<string | null> {
    return this.userPreference.getStreamerSocketUrl();
  }

  /**
   * Get Schwab client customer ID
   * @returns Promise with customer ID or null
   */
  public async getSchwabClientCustomerId(): Promise<string | null> {
    return this.userPreference.getSchwabClientCustomerId();
  }

  /**
   * Get Schwab client correlation ID
   * @returns Promise with correlation ID or null
   */
  public async getSchwabClientCorrelId(): Promise<string | null> {
    return this.userPreference.getSchwabClientCorrelId();
  }

  /**
   * Get Schwab client channel
   * @returns Promise with client channel or null
   */
  public async getSchwabClientChannel(): Promise<string | null> {
    return this.userPreference.getSchwabClientChannel();
  }

  /**
   * Get Schwab client function ID
   * @returns Promise with function ID or null
   */
  public async getSchwabClientFunctionId(): Promise<string | null> {
    return this.userPreference.getSchwabClientFunctionId();
  }

  /**
   * Get option chains for a symbol
   * @param params Query parameters for the option chain request
   * @returns Promise<OptionChainResponse>
   */
  public async getOptionChains(params: OptionChainRequestParams): Promise<OptionChainResponse> {
    return this.marketData.getOptionChains(params);
  }

  /**
   * Get option expiration chain for a symbol
   * @param symbol The symbol to get expiration chain for
   * @returns Promise<OptionExpirationChainResponse>
   */
  public async getOptionExpirationChain(symbol: string): Promise<OptionExpirationChainResponse> {
    return this.marketData.getOptionExpirationChain(symbol);
  }

  /**
   * Get price history for a symbol
   * @param params Query parameters for the price history request
   * @returns Promise<PriceHistoryResponse>
   */
  public async getPriceHistory(params: PriceHistoryRequestParams): Promise<PriceHistoryResponse> {
    return this.marketData.getPriceHistory(params);
  }

  /**
   * Get price history with convenience method for common use cases
   * @param symbol The symbol to get price history for
   * @param periodType The chart period type
   * @param period The number of periods
   * @param options Additional options
   * @returns Promise<PriceHistoryResponse>
   */
  public async getPriceHistoryForSymbol(
    symbol: string,
    periodType: PeriodType = 'day',
    period: number = 10,
    options?: {
      frequencyType?: FrequencyType;
      frequency?: number;
      startDate?: number;
      endDate?: number;
      needExtendedHoursData?: boolean;
      needPreviousClose?: boolean;
    }
  ): Promise<PriceHistoryResponse> {
    return this.marketData.getPriceHistoryForSymbol(symbol, periodType, period, options);
  }

  /**
   * Get movers for a specific index
   * @param params Query parameters for the movers request
   * @returns Promise<MoversResponse>
   */
  public async getMovers(params: MoversRequestParams): Promise<MoversResponse> {
    return this.marketData.getMovers(params);
  }

  /**
   * Get movers with convenience method
   * @param symbolId The index symbol to get movers for
   * @param options Optional parameters for sorting and frequency
   * @returns Promise<MoversResponse>
   */
  public async getMoversForIndex(
    symbolId: MoversSymbolId,
    options?: {
      sort?: MoversSort;
      frequency?: MoversFrequency;
    }
  ): Promise<MoversResponse> {
    return this.marketData.getMoversForIndex(symbolId, options);
  }

  /**
   * Get market hours for multiple markets
   * @param params - Query parameters for the market hours request
   * @returns Promise<MarketHoursResponse>
   */
  public async getMarketDataHours(params: MarketHoursRequestParams): Promise<MarketHoursResponse> {
    return this.marketData.getMarketHours(params);
  }

  /**
   * Get market hours for a single market
   * @param marketId - The market ID to get hours for
   * @param date - Optional date in YYYY-MM-DD format
   * @returns Promise<MarketHoursResponse>
   */
  public async getMarketDataHoursForMarket(marketId: MarketType, date?: string): Promise<MarketHoursResponse> {
    return this.marketData.getMarketHoursForMarket(marketId, date);
  }

  /**
   * Get market hours with convenience method for common markets
   * @param markets - Array of markets to get hours for
   * @param date - Optional date in YYYY-MM-DD format
   * @returns Promise<MarketHoursResponse>
   */
  public async getMarketDataHoursForMarkets(
    markets: MarketType[],
    date?: string
  ): Promise<MarketHoursResponse> {
    return this.marketData.getMarketHoursForMarkets(markets, date);
  }

  /**
   * Get instruments by symbols and projections
   * @param params - Query parameters for the instruments request
   * @returns Promise<InstrumentsResponse>
   */
  public async getInstruments(params: InstrumentsRequestParams): Promise<InstrumentsResponse> {
    return this.marketData.getInstruments(params);
  }

  /**
   * Get instrument by specific CUSIP
   * @param cusipId - The CUSIP of the security
   * @returns Promise<Instrument>
   */
  public async getInstrumentByCusip(cusipId: string): Promise<Instrument> {
    return this.marketData.getInstrumentByCusip(cusipId);
  }

  /**
   * Get instruments with convenience method for symbol search
   * @param symbol - The symbol to search for
   * @param projection - The projection type (defaults to 'symbol-search')
   * @returns Promise<InstrumentsResponse>
   */
  public async searchMarketDataInstruments(
    symbol: string,
    projection: InstrumentProjection = 'symbol-search'
  ): Promise<InstrumentsResponse> {
    return this.marketData.searchInstruments(symbol, projection);
  }

  /**
   * Get instruments with fundamental projection
   * @param symbol - The symbol to get fundamental data for
   * @returns Promise<InstrumentsResponse>
   */
  public async getFundamentalInstruments(symbol: string): Promise<InstrumentsResponse> {
    return this.marketData.getFundamentalInstruments(symbol);
  }
} 
