import { 
  Quote, 
  MarketHours
} from '../types';
import { SchwabOAuth } from '../auth/oauth';
import { HttpClient } from '../http/httpClient';

export class SchwabTradingAPI {
  private http: HttpClient;

  constructor(oauth: SchwabOAuth, environment: 'sandbox' | 'production' = 'production') {
    this.http = new HttpClient(
      oauth,
      environment === 'sandbox'
        ? 'https://api.schwabapi.com/v1/sandbox'
        : 'https://api.schwabapi.com/marketdata/v1'
    );
  }

  /**
   * Get quote for a symbol
   * @param symbol Stock or option symbol
   * @returns Promise with quote data
   */
  public async getQuote(symbol: string): Promise<Quote> {
    try {
      const response = await this.http.request(
        `/${encodeURIComponent(symbol)}/quotes`
      );
      return response as Quote;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to get quote');
    }
  }

  /**
   * Get quotes for multiple symbols
   * @param symbols Array of symbols
   * @returns Promise with quotes data
   */
  public async getQuotes(symbols: string[]): Promise<Quote[]> {
    try {
      const response = await this.http.request(
        `/quotes?symbols=${symbols.join(',')}`
      );
      return response as Quote[];
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to get quotes');
    }
  }

  /**
   * Get market hours for a specific date
   * @param date Date in YYYY-MM-DD format
   * @param market Market type (e.g., 'EQUITY', 'OPTION')
   * @returns Promise with market hours
   */
  public async getMarketHours(date: string, market: string = 'EQUITY'): Promise<MarketHours> {
    try {
      const response = await this.http.request(
        `/markets?markets=${market.toLowerCase()}&date=${date}`
      );
      return response as MarketHours;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to get market hours');
    }
  }

  /**
   * Search for instruments
   * @param symbol Symbol to search for
   * @param projection Search projection type
   * @returns Promise with search results
   */
  public async searchInstruments(symbol: string, projection: string = 'symbol-search'): Promise<unknown[]> {
    try {
      const response = await this.http.request(
        `/instruments?symbol=${symbol}&projection=${projection}`
      );
      return response as unknown[];
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to search instruments');
    }
  }

  /**
   * Get instrument details
   * @param symbol Symbol to get details for
   * @returns Promise with instrument details
   */
  public async getInstrument(symbol: string): Promise<unknown> {
    try {
      const response = await this.http.request(
        `/instruments/${symbol}`
      );
      return response;
    } catch (error) {
      throw this.handleAPIError(error, 'Failed to get instrument');
    }
  }

  /**
   * Handle API errors consistently
   * @param error Error object
   * @param defaultMessage Default error message
   * @returns Formatted error
   */
  private handleAPIError(error: unknown, defaultMessage: string): Error {
    if (error instanceof Error) {
      return new Error(`${defaultMessage}: ${error.message}`);
    }
    
    return new Error(`${defaultMessage}: ${String(error)}`);
  }
} 