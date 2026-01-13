/**
 * Utility class for Schwab API operations
 *
 * Provides helper methods for common tasks like extracting order IDs
 * from responses and working with account hashes.
 */

import { SchwabClient } from '../client';
import { OrderResponse } from '../types';

/**
 * Response object from place_order with Location header
 */
export interface PlaceOrderResponse {
  headers?: {
    location?: string;
    [key: string]: string | undefined;
  };
  status?: number;
  orderId?: number;
}

/**
 * Utils class for helper functions
 *
 * @example
 * const utils = new Utils(client, accountHash);
 * const response = await client.placeOrder(order, accountNumber);
 * const orderId = utils.extractOrderId(response);
 */
export class Utils {
  private client: SchwabClient;
  private accountHash: string;

  /**
   * Create a new Utils instance
   *
   * @param client The SchwabClient instance
   * @param accountHash The account hash for operations
   */
  constructor(client: SchwabClient, accountHash: string) {
    this.client = client;
    this.accountHash = accountHash;
  }

  /**
   * Set the account hash for subsequent operations
   *
   * @param accountHash The new account hash
   */
  setAccountHash(accountHash: string): void {
    this.accountHash = accountHash;
  }

  /**
   * Get the current account hash
   */
  getAccountHash(): string {
    return this.accountHash;
  }

  /**
   * Extract order ID from a place_order response
   *
   * When an order is successfully placed, the API returns the order ID
   * in the Location header. This method extracts that ID.
   *
   * @param response The response from place_order
   * @returns The order ID, or null if not found
   *
   * @example
   * const response = await client.placeOrder(order, accountNumber);
   * const orderId = utils.extractOrderId(response);
   * if (orderId) {
   *   console.log(`Order placed with ID: ${orderId}`);
   * }
   */
  extractOrderId(response: PlaceOrderResponse | OrderResponse): number | null {
    // Check if orderId is directly in response
    if ('orderId' in response && typeof response.orderId === 'number') {
      return response.orderId;
    }

    // Check for orderId in orderStrategy
    if ('orderStrategy' in response && response.orderStrategy) {
      // OrderResponse type - extract from orderStrategy if available
      return null; // The actual order ID would be in the Location header
    }

    // Try to extract from Location header
    if ('headers' in response && response.headers?.location) {
      const location = response.headers.location;
      // Location format: /v1/accounts/{accountHash}/orders/{orderId}
      const match = location.match(/\/orders\/(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  }

  /**
   * Extract order ID from a Location header URL
   *
   * @param locationUrl The Location header URL
   * @returns The order ID, or null if not found
   */
  static extractOrderIdFromUrl(locationUrl: string): number | null {
    const match = locationUrl.match(/\/orders\/(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Get the account hash for a given account number
   *
   * @param accountNumber The plain account number
   * @returns The account hash, or null if not found
   */
  async getAccountHashForNumber(accountNumber: string): Promise<string | null> {
    try {
      const mappings = await this.client.getAccountNumberMappings();
      for (const mapping of mappings) {
        if (Object.keys(mapping).includes(accountNumber)) {
          return mapping[accountNumber];
        }
        // Also check if the mapping has accountNumber and hashValue properties
        const mappingAny = mapping as { accountNumber?: string; hashValue?: string };
        if (mappingAny.accountNumber === accountNumber && mappingAny.hashValue) {
          return mappingAny.hashValue;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting account hash:', error);
      return null;
    }
  }
}

/**
 * Truncate price to appropriate decimal places
 *
 * Schwab expects prices as strings with specific precision:
 * - Prices < 1: truncate to 4 decimal places
 * - Prices >= 1: truncate to 2 decimal places
 *
 * @param price The price to format
 * @returns The formatted price string
 */
export function formatPrice(price: number): string {
  const absPrice = Math.abs(price);
  const sign = price < 0 ? -1 : 1;

  if (absPrice < 1) {
    // Truncate to 4 decimal places
    const truncated = Math.floor(absPrice * 10000) / 10000;
    return (sign * truncated).toFixed(4);
  } else {
    // Truncate to 2 decimal places
    const truncated = Math.floor(absPrice * 100) / 100;
    return (sign * truncated).toFixed(2);
  }
}

/**
 * Parse a date string or Date object to ISO format
 *
 * @param date The date to parse
 * @returns ISO format date string
 */
export function toISODate(date: Date | string): string {
  if (typeof date === 'string') {
    return new Date(date).toISOString();
  }
  return date.toISOString();
}

/**
 * Format date for API requests (YYYY-MM-DD)
 *
 * @param date The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format datetime for API requests
 *
 * @param date The date to format
 * @returns DateTime string in ISO format
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Get the start of the current trading day
 *
 * @returns Date object set to market open (9:30 AM ET)
 */
export function getMarketOpen(): Date {
  const now = new Date();
  const marketOpen = new Date(now);
  marketOpen.setHours(9, 30, 0, 0);
  return marketOpen;
}

/**
 * Get the end of the current trading day
 *
 * @returns Date object set to market close (4:00 PM ET)
 */
export function getMarketClose(): Date {
  const now = new Date();
  const marketClose = new Date(now);
  marketClose.setHours(16, 0, 0, 0);
  return marketClose;
}

/**
 * Check if the current time is during regular market hours
 *
 * Note: This is a simple check and doesn't account for holidays
 *
 * @returns true if during regular trading hours
 */
export function isDuringMarketHours(): boolean {
  const now = new Date();
  const day = now.getDay();

  // Weekend check
  if (day === 0 || day === 6) {
    return false;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Market hours: 9:30 AM - 4:00 PM ET
  const marketOpenMinutes = 9 * 60 + 30; // 9:30 AM
  const marketCloseMinutes = 16 * 60; // 4:00 PM

  return totalMinutes >= marketOpenMinutes && totalMinutes < marketCloseMinutes;
}
