import { Client } from '../src/client/index';
import { OrderBuilder } from '../src/orders/generic';
import { OrderType, Session } from '../src/orders/common';
import { jest } from '@jest/globals';

// Constants
const API_KEY = '1234567890';
const ACCOUNT_ID = 100000;
const ACCOUNT_HASH = '0x0x0x0x10000';
const ORDER_ID = 200000;
const SAVED_ORDER_ID = 300000;
const CUSIP = '000919239';
const MARKET = 'EQUITY';
const INDEX = '$SPX.X';
const SYMBOL = 'AAPL';
const TRANSACTION_ID = 400000;
const WATCHLIST_ID = 5000000;

// Mock Date
const mockDate = new Date('2020-01-02T03:04:05Z');
global.Date = class extends Date {
    constructor() {
        super();
    }

    static now() {
        return mockDate.getTime();
    }

    static utcNow() {
        return mockDate.getTime();
    }
} as any;

describe('Client', () => {
    let mockSession: any;
    let client: Client;

    beforeEach(() => {
        mockSession = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            timeout: undefined
        };
        client = new Client(API_KEY, mockSession);
        client.logger.setLevel('debug');
    });

    const makeUrl = (path: string): string => {
        const formattedPath = path
            .replace('{accountId}', ACCOUNT_ID.toString())
            .replace('{accountHash}', ACCOUNT_HASH)
            .replace('{orderId}', ORDER_ID.toString())
            .replace('{savedOrderId}', SAVED_ORDER_ID.toString())
            .replace('{cusip}', CUSIP)
            .replace('{market}', MARKET)
            .replace('{index}', INDEX)
            .replace('{symbol}', SYMBOL)
            .replace('{transactionId}', TRANSACTION_ID.toString())
            .replace('{watchlistId}', WATCHLIST_ID.toString());
        return 'https://api.schwabapi.com' + formattedPath;
    };

    describe('Generic functionality', () => {
        test('set_timeout', () => {
            const timeout = 'dummy';
            client.set_timeout(timeout);
            expect(mockSession.timeout).toBe(timeout);
        });

        test('token_age', () => {
            const tokenMetadata = {
                token_age: jest.fn().mockReturnValue(1000)
            };
            const client = new Client(API_KEY, mockSession, { token_metadata: tokenMetadata });
            expect(client.token_age()).toBe(1000);
        });
    });

    describe('get_account', () => {
        test('basic', () => {
            client.get_account(ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: {} }
            );
        });

        test('with fields', () => {
            client.get_account(ACCOUNT_HASH, { fields: [Client.Account.Fields.POSITIONS] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields scalar', () => {
            client.get_account(ACCOUNT_HASH, { fields: Client.Account.Fields.POSITIONS });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields unchecked', () => {
            client.set_enforce_enums(false);
            client.get_account(ACCOUNT_HASH, { fields: ['positions'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: { fields: 'positions' } }
            );
        });
    });

    describe('get_account_numbers', () => {
        test('basic', () => {
            client.get_account_numbers();
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/accountNumbers'),
                { params: {} }
            );
        });
    });

    describe('get_accounts', () => {
        test('basic', () => {
            client.get_accounts();
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: {} }
            );
        });

        test('with fields', () => {
            client.get_accounts({ fields: [Client.Account.Fields.POSITIONS] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields scalar', () => {
            client.get_accounts({ fields: Client.Account.Fields.POSITIONS });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields unchecked', () => {
            client.set_enforce_enums(false);
            client.get_accounts({ fields: ['positions'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: { fields: 'positions' } }
            );
        });
    });

    describe('get_order', () => {
        test('basic', () => {
            client.get_order(ORDER_ID, ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { params: {} }
            );
        });

        test('with string parameters', () => {
            client.get_order(ORDER_ID.toString(), ACCOUNT_HASH.toString());
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { params: {} }
            );
        });
    });

    describe('cancel_order', () => {
        test('basic', () => {
            client.cancel_order(ORDER_ID, ACCOUNT_HASH);
            expect(mockSession.delete).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}')
            );
        });

        test('with string parameters', () => {
            client.cancel_order(ORDER_ID.toString(), ACCOUNT_HASH.toString());
            expect(mockSession.delete).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}')
            );
        });
    });

    describe('get_orders_for_account', () => {
        test('vanilla', () => {
            client.get_orders_for_account(ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('from_not_datetime', () => {
            expect(() => {
                client.get_orders_for_account(ACCOUNT_HASH, { from_entered_datetime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for from_entered_datetime, got 'string'");
        });

        test('to_not_datetime', () => {
            expect(() => {
                client.get_orders_for_account(ACCOUNT_HASH, { to_entered_datetime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for to_entered_datetime, got 'string'");
        });

        test('from_entered_datetime', () => {
            const fromDate = new Date('2019-12-01T00:00:00Z');
            client.get_orders_for_account(ACCOUNT_HASH, { from_entered_datetime: fromDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-12-01T00:00:00Z',
                        toEnteredTime: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('to_entered_datetime', () => {
            const toDate = new Date('2019-12-31T23:59:59Z');
            client.get_orders_for_account(ACCOUNT_HASH, { to_entered_datetime: toDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2019-12-31T23:59:59Z'
                    }
                }
            );
        });

        test('max_results', () => {
            client.get_orders_for_account(ACCOUNT_HASH, { max_results: 100 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        maxResults: 100
                    }
                }
            );
        });

        test('status', () => {
            client.get_orders_for_account(ACCOUNT_HASH, { status: Client.Order.Status.FILLED });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED'
                    }
                }
            );
        });

        test('multiple_statuses', () => {
            client.get_orders_for_account(ACCOUNT_HASH, {
                status: [Client.Order.Status.FILLED, Client.Order.Status.REJECTED]
            });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED,REJECTED'
                    }
                }
            );
        });

        test('status_unchecked', () => {
            client.set_enforce_enums(false);
            client.get_orders_for_account(ACCOUNT_HASH, { status: 'FILLED' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED'
                    }
                }
            );
        });
    });

    describe('get_orders_for_all_linked_accounts', () => {
        test('vanilla', () => {
            client.get_orders_for_all_linked_accounts();
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('from_not_datetime', () => {
            expect(() => {
                client.get_orders_for_all_linked_accounts({ from_entered_datetime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for from_entered_datetime, got 'string'");
        });

        test('to_not_datetime', () => {
            expect(() => {
                client.get_orders_for_all_linked_accounts({ to_entered_datetime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for to_entered_datetime, got 'string'");
        });

        test('from_entered_datetime', () => {
            const fromDate = new Date('2019-12-01T00:00:00Z');
            client.get_orders_for_all_linked_accounts({ from_entered_datetime: fromDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-12-01T00:00:00Z',
                        toEnteredTime: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('to_entered_datetime', () => {
            const toDate = new Date('2019-12-31T23:59:59Z');
            client.get_orders_for_all_linked_accounts({ to_entered_datetime: toDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2019-12-31T23:59:59Z'
                    }
                }
            );
        });

        test('max_results', () => {
            client.get_orders_for_all_linked_accounts({ max_results: 100 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        maxResults: 100
                    }
                }
            );
        });

        test('status', () => {
            client.get_orders_for_all_linked_accounts({ status: Client.Order.Status.FILLED });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED'
                    }
                }
            );
        });

        test('multiple_statuses', () => {
            client.get_orders_for_all_linked_accounts({
                status: [Client.Order.Status.FILLED, Client.Order.Status.REJECTED]
            });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED,REJECTED'
                    }
                }
            );
        });

        test('status_unchecked', () => {
            client.set_enforce_enums(false);
            client.get_orders_for_all_linked_accounts({ status: 'FILLED' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED'
                    }
                }
            );
        });
    });

    describe('place_order', () => {
        test('basic', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.place_order(order, ACCOUNT_HASH);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                { json: order }
            );
        });

        test('with order builder', () => {
            const builder = new OrderBuilder();
            builder.setOrderType(OrderType.MARKET);
            builder.setSession(Session.NORMAL);
            client.place_order(builder, ACCOUNT_HASH);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                { json: builder.build() }
            );
        });

        test('with string parameters', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.place_order(order, ACCOUNT_HASH.toString());
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                { json: order }
            );
        });
    });

    describe('replace_order', () => {
        test('basic', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.replace_order(ORDER_ID, order, ACCOUNT_HASH);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { json: order }
            );
        });

        test('with order builder', () => {
            const builder = new OrderBuilder();
            builder.setOrderType(OrderType.MARKET);
            builder.setSession(Session.NORMAL);
            client.replace_order(ORDER_ID, builder, ACCOUNT_HASH);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { json: builder.build() }
            );
        });

        test('with string parameters', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.replace_order(ORDER_ID.toString(), order, ACCOUNT_HASH.toString());
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { json: order }
            );
        });
    });

    describe('preview_order', () => {
        test('basic', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.preview_order(order, ACCOUNT_HASH);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/previewOrder'),
                { json: order }
            );
        });

        test('with order builder', () => {
            const builder = new OrderBuilder();
            builder.setOrderType(OrderType.MARKET);
            builder.setSession(Session.NORMAL);
            client.preview_order(builder, ACCOUNT_HASH);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/previewOrder'),
                { json: builder.build() }
            );
        });
    });
}); 