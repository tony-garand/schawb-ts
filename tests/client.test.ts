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
        client = new Client(API_KEY, mockSession, true);
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
        test('setTimeout', () => {
            const timeout = 'dummy';
            client.setTimeout(timeout);
            expect(mockSession.timeout).toBe(timeout);
        });

        test('tokenAge', () => {
            const tokenMetadata = {
                tokenAge: jest.fn().mockReturnValue(1000)
            };
            const client = new Client(API_KEY, mockSession, true, tokenMetadata);
            expect(client.tokenAge()).toBe(1000);
        });
    });

    describe('getAccount', () => {
        test('basic', () => {
            client.getAccount(ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: {} }
            );
        });

        test('with fields', () => {
            client.getAccount(ACCOUNT_HASH, { fields: ['positions'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields scalar', () => {
            client.getAccount(ACCOUNT_HASH, { fields: 'positions' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields unchecked', () => {
            client.setEnforceEnums(false);
            client.getAccount(ACCOUNT_HASH, { fields: ['positions'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}'),
                { params: { fields: 'positions' } }
            );
        });
    });

    describe('getAccountNumbers', () => {
        test('basic', () => {
            client.getAccountNumbers();
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/accountNumbers'),
                { params: {} }
            );
        });
    });

    describe('getAccounts', () => {
        test('basic', () => {
            client.getAccounts();
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: {} }
            );
        });

        test('with fields', () => {
            client.getAccounts({ fields: ['positions'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields scalar', () => {
            client.getAccounts({ fields: 'positions' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: { fields: 'positions' } }
            );
        });

        test('with fields unchecked', () => {
            client.setEnforceEnums(false);
            client.getAccounts({ fields: ['positions'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts'),
                { params: { fields: 'positions' } }
            );
        });
    });

    describe('getOrder', () => {
        test('basic', () => {
            client.getOrder(ORDER_ID, ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { params: {} }
            );
        });

        test('with string parameters', () => {
            client.getOrder(ORDER_ID.toString(), ACCOUNT_HASH.toString());
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { params: {} }
            );
        });
    });

    describe('cancelOrder', () => {
        test('basic', () => {
            client.cancelOrder(ORDER_ID, ACCOUNT_HASH);
            expect(mockSession.delete).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}')
            );
        });

        test('with string parameters', () => {
            client.cancelOrder(ORDER_ID.toString(), ACCOUNT_HASH.toString());
            expect(mockSession.delete).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}')
            );
        });
    });

    describe('getOrdersForAccount', () => {
        test('vanilla', () => {
            client.getOrdersForAccount(ACCOUNT_HASH);
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
                client.getOrdersForAccount(ACCOUNT_HASH, { fromEnteredTime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for fromEnteredTime, got 'string'");
        });

        test('to_not_datetime', () => {
            expect(() => {
                client.getOrdersForAccount(ACCOUNT_HASH, { toEnteredTime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for toEnteredTime, got 'string'");
        });

        test('from_entered_datetime', () => {
            const fromDate = new Date('2019-12-01T00:00:00Z');
            client.getOrdersForAccount(ACCOUNT_HASH, { fromEnteredTime: fromDate });
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
            client.getOrdersForAccount(ACCOUNT_HASH, { toEnteredTime: toDate });
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
            client.getOrdersForAccount(ACCOUNT_HASH, { maxResults: 100 });
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
            client.getOrdersForAccount(ACCOUNT_HASH, { status: 'FILLED' });
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
            client.getOrdersForAccount(ACCOUNT_HASH, {
                status: ['FILLED', 'REJECTED']
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
            client.setEnforceEnums(false);
            client.getOrdersForAccount(ACCOUNT_HASH, { status: 'FILLED' });
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

    describe('getOrdersForAllLinkedAccounts', () => {
        test('vanilla', () => {
            client.getOrdersForAllLinkedAccounts();
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
                client.getOrdersForAllLinkedAccounts({ fromEnteredTime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for fromEnteredTime, got 'string'");
        });

        test('to_not_datetime', () => {
            expect(() => {
                client.getOrdersForAllLinkedAccounts({ toEnteredTime: '2020-01-02' as any });
            }).toThrow("expected type in (Date) for toEnteredTime, got 'string'");
        });

        test('from_entered_datetime', () => {
            const fromDate = new Date('2019-12-01T00:00:00Z');
            client.getOrdersForAllLinkedAccounts({ fromEnteredTime: fromDate });
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
            client.getOrdersForAllLinkedAccounts({ toEnteredTime: toDate });
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
            client.getOrdersForAllLinkedAccounts({ maxResults: 100 });
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
            client.getOrdersForAllLinkedAccounts({ status: 'FILLED' });
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
            client.getOrdersForAllLinkedAccounts({
                status: ['FILLED', 'REJECTED']
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
            client.setEnforceEnums(false);
            client.getOrdersForAllLinkedAccounts({ status: 'FILLED' });
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

    describe('placeOrder', () => {
        test('basic', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.placeOrder(ACCOUNT_HASH, order);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                { json: order }
            );
        });

        test('with order builder', () => {
            const builder = new OrderBuilder();
            builder.setOrderType(OrderType.MARKET);
            builder.setSession(Session.NORMAL);
            client.placeOrder(ACCOUNT_HASH, builder);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                { json: builder.build() }
            );
        });

        test('with string parameters', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.placeOrder(ACCOUNT_HASH.toString(), order);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                { json: order }
            );
        });
    });

    describe('replaceOrder', () => {
        test('basic', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.replaceOrder(ORDER_ID, ACCOUNT_HASH, order);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { json: order }
            );
        });

        test('with order builder', () => {
            const builder = new OrderBuilder();
            builder.setOrderType(OrderType.MARKET);
            builder.setSession(Session.NORMAL);
            client.replaceOrder(ORDER_ID, ACCOUNT_HASH, builder);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { json: builder.build() }
            );
        });

        test('with string parameters', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.replaceOrder(ORDER_ID.toString(), ACCOUNT_HASH.toString(), order);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                { json: order }
            );
        });
    });

    describe('previewOrder', () => {
        test('basic', () => {
            const order = { orderType: OrderType.MARKET, session: Session.NORMAL };
            client.previewOrder(ACCOUNT_HASH, order);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/previewOrder'),
                { json: order }
            );
        });

        test('with order builder', () => {
            const builder = new OrderBuilder();
            builder.setOrderType(OrderType.MARKET);
            builder.setSession(Session.NORMAL);
            client.previewOrder(ACCOUNT_HASH, builder);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/previewOrder'),
                { json: builder.build() }
            );
        });
    });
}); 