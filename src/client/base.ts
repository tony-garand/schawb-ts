// Skeleton for BaseClient, converted from Python base.py

export class BaseClient {
  // Placeholder properties
  protected apiKey: string;
  protected session: any;
  protected logger: Console = console;
  protected requestNumber: number = 0;
  protected tokenMetadata: any;

  constructor(apiKey: string, session: any, enforceEnums: boolean = true, tokenMetadata?: any) {
    this.apiKey = apiKey;
    this.session = session;
    this.tokenMetadata = tokenMetadata;
    // TODO: Add more initialization as needed
  }

  protected _reqNum(): number {
    this.requestNumber += 1;
    return this.requestNumber;
  }

  protected _logResponse(resp: Response, reqNum: number): void {
    this.logger.debug('Req %s: response: %o', reqNum, resp);
  }

  // Placeholder for HTTP methods to be implemented in subclasses
  async _getRequest(path: string, params: Record<string, any>): Promise<Response> {
    throw new Error('Not implemented');
  }
  async _postRequest(path: string, data: any): Promise<Response> {
    throw new Error('Not implemented');
  }
  async _putRequest(path: string, data: any): Promise<Response> {
    throw new Error('Not implemented');
  }
  async _deleteRequest(path: string): Promise<Response> {
    throw new Error('Not implemented');
  }
} 