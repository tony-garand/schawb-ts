import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { Client } from './client';
import { LazyLog } from './utils';

export interface StreamJsonDecoder {
    decodeJsonString(raw: string): unknown;
}

export class NaiveJsonStreamDecoder implements StreamJsonDecoder {
    decodeJsonString(raw: string): unknown {
        return JSON.parse(raw);
    }
}

export class UnexpectedResponse extends Error {
    constructor(public response: Response, message?: string) {
        super(message);
        this.name = 'UnexpectedResponse';
    }
}

export class UnexpectedResponseCode extends Error {
    constructor(public response: Response, message?: string) {
        super(message);
        this.name = 'UnexpectedResponseCode';
    }
}

export class UnparsableMessage extends Error {
    constructor(public rawMsg: string, public jsonParseException: Error, message?: string) {
        super(message);
        this.name = 'UnparsableMessage';
    }
}

export abstract class BaseFieldEnum {
    static allFields(): unknown[] {
        return Object.values(this);
    }

    static keyMapping(): Record<string, string> {
        const mapping: Record<string, string> = {};
        for (const [name, value] of Object.entries(this)) {
            if (typeof value === 'number') {
                mapping[value.toString()] = name;
            }
        }
        return mapping;
    }

    static relabelMessage(oldMsg: Record<string, unknown>, newMsg: Record<string, unknown>): void {
        const mapping = this.keyMapping();
        for (const [oldKey, value] of Object.entries(oldMsg)) {
            if (oldKey in mapping) {
                const newKey = mapping[oldKey];
                newMsg[newKey] = value;
                delete newMsg[oldKey];
            }
        }
    }
}

type Handler = (data: any) => void;

export class StreamClient extends EventEmitter {
    private sslContext: unknown;
    private client: Client;
    private account: unknown;
    private streamCorrelId: string | null = null;
    private streamCustomerId: string | null = null;
    private streamChannel: string | null = null;
    private streamFunctionId: string | null = null;
    private socket: WebSocket | null = null;
    private requestId: number = 0;
    private handlers: Map<string, Handler> = new Map();
    private overflowItems: unknown[] = [];
    private logger: Console = console;
    private requestNumber: number = 0;
    private jsonDecoder: StreamJsonDecoder = new NaiveJsonStreamDecoder();
    private lock: Promise<void> = Promise.resolve();
    private next_request_id: number = 0;
    private httpClient: Client;

    constructor(httpClient: Client, options: { accountId?: string; enforceEnums?: boolean; sslContext?: unknown } = {}) {
        super();
        this.sslContext = options.sslContext;
        this.httpClient = httpClient;
    }

    setJsonDecoder(jsonDecoder: StreamJsonDecoder): void {
        if (!(jsonDecoder instanceof NaiveJsonStreamDecoder)) {
            throw new Error('Custom JSON parser must implement StreamJsonDecoder interface');
        }
        this.jsonDecoder = jsonDecoder;
    }

    private reqNum(): number {
        this.requestNumber += 1;
        return this.requestNumber;
    }

    private async send(obj: Record<string, unknown>): Promise<void> {
        if (!this.socket) {
            throw new Error('Socket not open. Did you forget to call login()?');
        }

        this.logger.debug('Send %s: Sending %s',
            this.reqNum(),
            new LazyLog(() => JSON.stringify(obj, null, 4))
        );

        this.socket.send(JSON.stringify(obj));
    }

    private async receive(): Promise<unknown> {
        if (!this.socket) {
            throw new Error('Socket not open. Did you forget to call login()?');
        }

        if (this.overflowItems.length > 0) {
            const ret = this.overflowItems.pop();
            this.logger.debug(
                'Receive %s: Returning message from overflow: %s',
                this.reqNum(),
                new LazyLog(() => JSON.stringify(ret, null, 4))
            );
            return ret;
        }

        return new Promise((resolve, reject) => {
            this.socket!.once('message', (raw: string) => {
                try {
                    const ret = this.jsonDecoder.decodeJsonString(raw);
                    this.logger.debug(
                        'Receive %s: Returning message from stream: %s',
                        this.reqNum(),
                        new LazyLog(() => JSON.stringify(ret, null, 4))
                    );
                    resolve(ret);
                } catch (e) {
                    const msg = 'Failed to parse message. This often happens with unknown symbols or other error conditions. Full message text: ' + raw;
                    reject(new UnparsableMessage(raw, e as Error, msg));
                }
            });
        });
    }

    private async initFromPreferences(prefs: Record<string, unknown>, websocketConnectArgs: Record<string, unknown>): Promise<void> {
        const streamInfo = (prefs.streamerInfo as unknown[])[0] as Record<string, unknown>;

        this.streamCorrelId = streamInfo.schwabClientCorrelId as string;
        this.streamCustomerId = streamInfo.schwabClientCustomerId as string;
        this.streamChannel = streamInfo.schwabClientChannel as string;
        this.streamFunctionId = streamInfo.schwabClientFunctionId as string;

        const wssUrl = streamInfo.streamerSocketUrl as string;

        if (this.sslContext) {
            websocketConnectArgs.ssl = this.sslContext;
        }

        this.socket = new WebSocket(wssUrl, websocketConnectArgs);
    }

    private makeRequest(service: string, command: string, parameters: Record<string, unknown>): [Record<string, unknown>, number] {
        const requestId = this.requestId;
        this.requestId += 1;

        const request = {
            service,
            requestid: requestId.toString(),
            command,
            SchwabClientCustomerId: this.streamCustomerId,
            SchwabClientCorrelId: this.streamCorrelId,
            parameters,
        };

        return [request, requestId];
    }

    async login(websocketConnectArgs?: any): Promise<void> {
        const preferences = await this.httpClient.get_user_preferences();
        const streamerInfo = preferences.streamerInfo?.[0];

        if (!streamerInfo?.streamerSocketUrl) {
            throw new Error('Streamer socket URL not found in preferences');
        }

        const wsOptions: any = {};
        if (this.sslContext) {
            wsOptions.ssl = this.sslContext;
        }
        if (websocketConnectArgs) {
            Object.assign(wsOptions, websocketConnectArgs);
        }

        this.socket = new WebSocket(streamerInfo.streamerSocketUrl, wsOptions);

        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('WebSocket not initialized'));
                return;
            }

            this.socket.on('open', async () => {
                try {
                    await this.send_request('ADMIN', 'LOGIN', {
                        Authorization: this.httpClient.token_metadata.token.access_token,
                        SchwabClientChannel: streamerInfo.schwabClientChannel,
                        SchwabClientFunctionId: streamerInfo.schwabClientFunctionId
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });

            this.socket.on('error', (error) => {
                reject(error);
            });

            this.socket.on('close', () => {
                this.socket = null;
            });

            this.socket.on('message', (data: string) => {
                this.handleMessage(data);
            });
        });
    }

    private handleMessage(data: string): void {
        try {
            const message = JSON.parse(data);

            if (message.response) {
                const response = message.response[0];
                if (response.content.code !== 0) {
                    this.emit('error', new Error(`Unexpected response code: ${response.content.code}`));
                    return;
                }
                if (response.requestid !== this.requestId - 1) {
                    this.emit('error', new Error(`Unexpected request ID: ${response.requestid}`));
                    return;
                }
                this.emit('response', response);
                return;
            }

            if (message.data) {
                const data = message.data[0];
                const handler = this.handlers.get(data.service);
                if (handler) {
                    handler(data);
                } else {
                    this.emit('unhandled_message', data);
                }
                return;
            }

            if (message.notify) {
                this.emit('heartbeat', message.notify[0]);
                return;
            }

            this.emit('unhandled_message', message);
        } catch (error) {
            this.emit('error', new Error('Invalid JSON message'));
        }
    }

    private async send_request(service: string, command: string, parameters: any): Promise<void> {
        if (!this.socket) {
            throw new Error('WebSocket not connected');
        }

        const request = {
            service,
            command,
            requestid: this.requestId++,
            parameters
        };

        this.socket.send(JSON.stringify(request));
    }

    // Account Activity Methods
    async account_activity_subs(accountIds: string[]): Promise<void> {
        await this.send_request('ACCT_ACTIVITY', 'SUBS', {
            keys: accountIds.join(',')
        });
    }

    async account_activity_unsubs(accountIds: string[]): Promise<void> {
        await this.send_request('ACCT_ACTIVITY', 'UNSUBS', {
            keys: accountIds.join(',')
        });
    }

    account_activity_handler(handler: Handler): void {
        this.handlers.set('ACCT_ACTIVITY', handler);
    }

    // Chart Data Methods
    async chart_equity_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('CHART_EQUITY', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async chart_equity_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('CHART_EQUITY', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    async chart_equity_add(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('CHART_EQUITY', 'ADD', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    chart_equity_handler(handler: Handler): void {
        this.handlers.set('CHART_EQUITY', handler);
    }

    add_chart_equity_handler(handler: Handler): void {
        this.handlers.set('CHART_EQUITY', handler);
    }

    // Level One Equity Methods
    async level_one_equity_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('LEVELONE_EQUITY', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async level_one_equity_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('LEVELONE_EQUITY', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    level_one_equity_handler(handler: Handler): void {
        this.handlers.set('LEVELONE_EQUITY', handler);
    }

    // Level One Options Methods
    async level_one_options_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('LEVELONE_OPTIONS', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async level_one_options_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('LEVELONE_OPTIONS', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    level_one_options_handler(handler: Handler): void {
        this.handlers.set('LEVELONE_OPTIONS', handler);
    }

    // Level One Futures Methods
    async level_one_futures_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('LEVELONE_FUTURES', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async level_one_futures_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('LEVELONE_FUTURES', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    level_one_futures_handler(handler: Handler): void {
        this.handlers.set('LEVELONE_FUTURES', handler);
    }

    // Level One Futures Options Methods
    async level_one_futures_options_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('LEVELONE_FUTURES_OPTIONS', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async level_one_futures_options_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('LEVELONE_FUTURES_OPTIONS', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    level_one_futures_options_handler(handler: Handler): void {
        this.handlers.set('LEVELONE_FUTURES_OPTIONS', handler);
    }

    // Level One Forex Methods
    async level_one_forex_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('LEVELONE_FOREX', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async level_one_forex_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('LEVELONE_FOREX', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    level_one_forex_handler(handler: Handler): void {
        this.handlers.set('LEVELONE_FOREX', handler);
    }

    // NYSE Book Methods
    async nyse_book_subs(symbols: string[]): Promise<void> {
        await this.send_request('NYSE_BOOK', 'SUBS', {
            keys: symbols.join(',')
        });
    }

    async nyse_book_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('NYSE_BOOK', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    nyse_book_handler(handler: Handler): void {
        this.handlers.set('NYSE_BOOK', handler);
    }

    // NASDAQ Book Methods
    async nasdaq_book_subs(symbols: string[]): Promise<void> {
        await this.send_request('NASDAQ_BOOK', 'SUBS', {
            keys: symbols.join(',')
        });
    }

    async nasdaq_book_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('NASDAQ_BOOK', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    nasdaq_book_handler(handler: Handler): void {
        this.handlers.set('NASDAQ_BOOK', handler);
    }

    // Options Book Methods
    async options_book_subs(symbols: string[]): Promise<void> {
        await this.send_request('OPTIONS_BOOK', 'SUBS', {
            keys: symbols.join(',')
        });
    }

    async options_book_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('OPTIONS_BOOK', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    options_book_handler(handler: Handler): void {
        this.handlers.set('OPTIONS_BOOK', handler);
    }

    // Screener Methods
    async screener_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('SCREENER', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async screener_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('SCREENER', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    screener_handler(handler: Handler): void {
        this.handlers.set('SCREENER', handler);
    }

    // Options Screener Methods
    async options_screener_subs(symbols: string[], fields: string[]): Promise<void> {
        await this.send_request('OPTIONS_SCREENER', 'SUBS', {
            keys: symbols.join(','),
            fields: fields.join(',')
        });
    }

    async options_screener_unsubs(symbols: string[]): Promise<void> {
        await this.send_request('OPTIONS_SCREENER', 'UNSUBS', {
            keys: symbols.join(',')
        });
    }

    options_screener_handler(handler: Handler): void {
        this.handlers.set('OPTIONS_SCREENER', handler);
    }

    // Service Operations Methods
    async get_service_status(): Promise<void> {
        await this.send_request('ADMIN', 'SERVICE_STATUS', {});
    }

    async get_service_fields(): Promise<void> {
        await this.send_request('ADMIN', 'SERVICE_FIELDS', {});
    }

    // Heartbeat Methods
    async heartbeat(): Promise<void> {
        await this.send_request('ADMIN', 'HEARTBEAT', {});
    }
} 