import { Commission, ComplexOrderStrategyType, Fees, Order, OrderResponse, OrderValidationDetail } from '../types';
import { SchwabOAuth } from '../auth/oauth';
import { fetchJson } from '../utils/http';

// Order status types based on Schwab API documentation
export type OrderStatus = 
  | 'AWAITING_PARENT_ORDER' 
  | 'AWAITING_CONDITION' 
  | 'AWAITING_STOP_CONDITION' 
  | 'AWAITING_MANUAL_REVIEW' 
  | 'ACCEPTED' 
  | 'AWAITING_UR_OUT' 
  | 'PENDING_ACTIVATION' 
  | 'QUEUED' 
  | 'WORKING' 
  | 'REJECTED' 
  | 'PENDING_CANCEL' 
  | 'CANCELED' 
  | 'PENDING_REPLACE' 
  | 'REPLACED' 
  | 'FILLED' 
  | 'EXPIRED' 
  | 'NEW' 
  | 'AWAITING_RELEASE_TIME' 
  | 'PENDING_ACKNOWLEDGEMENT' 
  | 'PENDING_RECALL' 
  | 'UNKNOWN';

// Order query parameters interface
export interface OrderQueryParams {
  maxResults?: number;
  fromEnteredTime?: string;
  toEnteredTime?: string;
  status?: OrderStatus;
}

// Order activity types
export type OrderActivityType = 'EXECUTION';
export type ExecutionType = 'FILL';

// Order activity execution leg
export interface ExecutionLeg {
  legId: number;
  price: number;
  quantity: number;
  mismarkedQuantity: number;
  instrumentId: number;
  time: string;
}

// Order activity
export interface OrderActivity {
  activityType: OrderActivityType;
  executionType: ExecutionType;
  quantity: number;
  orderRemainingQuantity: number;
  executionLegs: ExecutionLeg[];
}

// Order leg collection with extended properties
export interface OrderLegCollectionExtended {
  orderLegType: 'EQUITY';
  legId: number;
  instrument: {
    cusip: string;
    symbol: string;
    description: string;
    instrumentId: number;
    netChange: number;
    type: string;
  };
  instruction: string;
  positionEffect: string;
  quantity: number;
  quantityType: string;
  divCapGains: string;
  toSymbol?: string;
}

// Extended Order interface matching Schwab API response
export interface OrderExtended {
  session: string;
  duration: string;
  orderType: string;
  cancelTime?: string;
  complexOrderStrategyType: string;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  requestedDestination?: string;
  destinationLinkName?: string;
  releaseTime?: string;
  stopPrice?: number;
  stopPriceLinkBasis?: string;
  stopPriceLinkType?: string;
  stopPriceOffset?: number;
  stopType?: string;
  priceLinkBasis?: string;
  priceLinkType?: string;
  price?: number;
  taxLotMethod?: string;
  orderLegCollection: OrderLegCollectionExtended[];
  activationPrice?: number;
  specialInstruction?: string;
  orderStrategyType: string;
  orderId: number;
  cancelable: boolean;
  editable: boolean;
  status: OrderStatus;
  enteredTime: string;
  closeTime?: string;
  tag?: string;
  accountNumber: number;
  orderActivityCollection?: OrderActivity[];
  replacingOrderCollection?: string[];
  childOrderStrategies?: string[];
  statusDescription?: string;
}

// Preview order response types
export interface OrderPreviewResponse {
  orderId: number;
  orderStrategy: ComplexOrderStrategyType; 
  orderValidationResult: {
    alerts: OrderValidationDetail[];
    accepts: OrderValidationDetail[];
    rejects: OrderValidationDetail[];
    reviews: OrderValidationDetail[];
    warns:  OrderValidationDetail[];
  };
  commissionAndFee: {
    commission: Commission;
    fee: Fees;
    trueCommission: Commission;
  };
}

export class OrdersAPI {
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
    return fetchJson(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
      body: options.body,
    });
  }

  /**
   * Get all orders for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param params Query parameters for filtering orders
   * @returns Promise with array of orders
   */
  public async getOrdersForAccount(
    accountNumber: string, 
    params: OrderQueryParams
  ): Promise<OrderExtended[]> {
    const queryParams = new URLSearchParams();
    
    if (params.maxResults) {
      queryParams.append('maxResults', params.maxResults.toString());
    }
    if (params.fromEnteredTime) {
      queryParams.append('fromEnteredTime', params.fromEnteredTime);
    }
    if (params.toEnteredTime) {
      queryParams.append('toEnteredTime', params.toEnteredTime);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }

    const url = `${this.baseUrl}/accounts/${accountNumber}/orders`;
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    
    return this.makeRequest(fullUrl) as Promise<OrderExtended[]>;
  }

  /**
   * Place order for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param order The order object to place
   * @returns Promise with order response
   */
  public async placeOrder(
    accountNumber: string, 
    order: Order
  ): Promise<OrderResponse> {
    const response = await this.makeRequest(
      `${this.baseUrl}/accounts/${accountNumber}/orders`,
      {
        method: 'POST',
        body: JSON.stringify(order),
      }
    ) as OrderResponse;
    return response;
  }

  /**
   * Get a specific order by its ID for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param orderId The ID of the order being retrieved
   * @returns Promise with order details
   */
  public async getOrder(
    accountNumber: string, 
    orderId: number
  ): Promise<OrderExtended> {
    return this.makeRequest(
      `${this.baseUrl}/accounts/${accountNumber}/orders/${orderId}`
    ) as Promise<OrderExtended>;
  }

  /**
   * Cancel an order for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param orderId The ID of the order being cancelled
   * @returns Promise with cancellation result
   */
  public async cancelOrder(
    accountNumber: string, 
    orderId: number
  ): Promise<void> {
    await this.makeRequest(
      `${this.baseUrl}/accounts/${accountNumber}/orders/${orderId}`,
      { method: 'DELETE' }
    );
  }

  /**
   * Replace order for a specific account
   * @param accountNumber The encrypted ID of the account
   * @param orderId The ID of the order being replaced
   * @param newOrder The new order object
   * @returns Promise with replacement result
   */
  public async replaceOrder(
    accountNumber: string, 
    orderId: number, 
    newOrder: Order
  ): Promise<OrderResponse> {
    const response = await this.makeRequest(
      `${this.baseUrl}/accounts/${accountNumber}/orders/${orderId}`,
      {
        method: 'PUT',
        body: JSON.stringify(newOrder),
      }
    ) as OrderResponse;
    return response;
  }

  /**
   * Get all orders for all accounts
   * @param params Query parameters for filtering orders
   * @returns Promise with array of orders
   */
  public async getAllOrders(params: OrderQueryParams): Promise<OrderExtended[]> {
    const queryParams = new URLSearchParams();
    
    if (params.maxResults) {
      queryParams.append('maxResults', params.maxResults.toString());
    }
    if (params.fromEnteredTime) {
      queryParams.append('fromEnteredTime', params.fromEnteredTime);
    }
    if (params.toEnteredTime) {
      queryParams.append('toEnteredTime', params.toEnteredTime);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }

    const url = `${this.baseUrl}/orders`;
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    
    return this.makeRequest(fullUrl) as Promise<OrderExtended[]>;
  }

  /**
   * Preview order for a specific account (Coming Soon)
   * @param accountNumber The encrypted ID of the account
   * @param order The order object to preview
   * @returns Promise with order preview response
   */
  public async previewOrder(
    accountNumber: string, 
    order: Order
  ): Promise<OrderPreviewResponse> {
    return this.makeRequest(
      `${this.baseUrl}/accounts/${accountNumber}/previewOrder`,
      {
        method: 'POST',
        body: JSON.stringify(order),
      }
    ) as Promise<OrderPreviewResponse>;
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
   * Helper method to create date range for order queries
   * @param fromDate Start date
   * @param toDate End date
   * @returns Object with formatted date strings
   */
  public static createDateRange(fromDate: Date | string, toDate: Date | string): { fromEnteredTime: string; toEnteredTime: string } {
    return {
      fromEnteredTime: this.formatDateTime(fromDate),
      toEnteredTime: this.formatDateTime(toDate),
    };
  }
} 
