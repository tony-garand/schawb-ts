import { BaseClient } from './base';
import { registerRedactionsFromResponse } from '../debug';

export class Client extends BaseClient {
  async _getRequest(path: string, params: Record<string, any>): Promise<Response> {
    const dest = `https://api.schwabapi.com${path}`;
    const reqNum = this._reqNum();
    this.logger.debug('Req %s: GET to %s, params=%s', reqNum, dest, JSON.stringify(params, null, 2));
    const url = new URL(dest);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    const resp = await fetch(url.toString(), { method: 'GET', headers: this._getHeaders() });
    this._logResponse(resp, reqNum);
    registerRedactionsFromResponse(resp);
    return resp;
  }

  async _postRequest(path: string, data: any): Promise<Response> {
    const dest = `https://api.schwabapi.com${path}`;
    const reqNum = this._reqNum();
    this.logger.debug('Req %s: POST to %s, json=%s', reqNum, dest, JSON.stringify(data, null, 2));
    const resp = await fetch(dest, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(data),
    });
    this._logResponse(resp, reqNum);
    registerRedactionsFromResponse(resp);
    return resp;
  }

  async _putRequest(path: string, data: any): Promise<Response> {
    const dest = `https://api.schwabapi.com${path}`;
    const reqNum = this._reqNum();
    this.logger.debug('Req %s: PUT to %s, json=%s', reqNum, dest, JSON.stringify(data, null, 2));
    const resp = await fetch(dest, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(data),
    });
    this._logResponse(resp, reqNum);
    registerRedactionsFromResponse(resp);
    return resp;
  }

  async _deleteRequest(path: string): Promise<Response> {
    const dest = `https://api.schwabapi.com${path}`;
    const reqNum = this._reqNum();
    this.logger.debug('Req %s: DELETE to %s', reqNum, dest);
    const resp = await fetch(dest, { method: 'DELETE', headers: this._getHeaders() });
    this._logResponse(resp, reqNum);
    registerRedactionsFromResponse(resp);
    return resp;
  }

  // Helper to get headers, e.g., for auth
  private _getHeaders(): Record<string, string> {
    // TODO: Add auth headers as needed
    return {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${this.token}`
    };
  }

  // Account methods
  async getAccountNumbers(): Promise<Response> {
    return this._getRequest('/trader/v1/accounts/accountNumbers', {});
  }

  async getAccounts(params: Record<string, any> = {}): Promise<Response> {
    return this._getRequest('/trader/v1/accounts', params);
  }

  async getAccount(accountHash: string, params: Record<string, any> = {}): Promise<Response> {
    return this._getRequest(`/trader/v1/accounts/${accountHash}`, params);
  }

  // Order methods
  async getOrdersForAccount(accountHash: string, params: Record<string, any> = {}): Promise<Response> {
    return this._getRequest(`/trader/v1/accounts/${accountHash}/orders`, params);
  }

  async getOrdersForAllLinkedAccounts(params: Record<string, any> = {}): Promise<Response> {
    return this._getRequest('/trader/v1/orders', params);
  }

  async getOrder(orderId: string | number, accountHash: string): Promise<Response> {
    return this._getRequest(`/trader/v1/accounts/${accountHash}/orders/${orderId}`, {});
  }

  async cancelOrder(orderId: string | number, accountHash: string): Promise<Response> {
    return this._deleteRequest(`/trader/v1/accounts/${accountHash}/orders/${orderId}`);
  }

  async placeOrder(accountHash: string, orderSpec: any): Promise<Response> {
    return this._postRequest(`/trader/v1/accounts/${accountHash}/orders`, orderSpec);
  }
} 