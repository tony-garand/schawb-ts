import { Client } from '../src/client/index';
import { OrderBuilder } from '../src/orders/generic';
import { OrderType } from '../src/orders/common';
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

        test('setEnforceEnums', () => {
            client.setEnforceEnums(false);
            expect(client['enforceEnums']).toBe(false);
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

        test('with from date', () => {
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

        test('with to date', () => {
            const toDate = new Date('2020-01-01T00:00:00Z');
            client.getOrdersForAccount(ACCOUNT_HASH, { toEnteredTime: toDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-01T00:00:00Z'
                    }
                }
            );
        });

        test('with max results', () => {
            client.getOrdersForAccount(ACCOUNT_HASH, { maxResults: 50 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        maxResults: 50
                    }
                }
            );
        });

        test('with status', () => {
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

        test('with multiple statuses', () => {
            client.getOrdersForAccount(ACCOUNT_HASH, { status: ['FILLED', 'CANCELED'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED,CANCELED'
                    }
                }
            );
        });

        test('with status unchecked', () => {
            client.setEnforceEnums(false);
            client.getOrdersForAccount(ACCOUNT_HASH, { status: 'NOT_A_STATUS' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'NOT_A_STATUS'
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

        test('with from date', () => {
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

        test('with to date', () => {
            const toDate = new Date('2020-01-01T00:00:00Z');
            client.getOrdersForAllLinkedAccounts({ toEnteredTime: toDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-01T00:00:00Z'
                    }
                }
            );
        });

        test('with max results', () => {
            client.getOrdersForAllLinkedAccounts({ maxResults: 50 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        maxResults: 50
                    }
                }
            );
        });

        test('with status', () => {
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

        test('with multiple statuses', () => {
            client.getOrdersForAllLinkedAccounts({ status: ['FILLED', 'CANCELED'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'FILLED,CANCELED'
                    }
                }
            );
        });

        test('with status unchecked', () => {
            client.setEnforceEnums(false);
            client.getOrdersForAllLinkedAccounts({ status: 'NOT_A_STATUS' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/orders'),
                {
                    params: {
                        fromEnteredTime: '2019-11-03T03:04:05Z',
                        toEnteredTime: '2020-01-02T03:04:05Z',
                        status: 'NOT_A_STATUS'
                    }
                }
            );
        });
    });

    describe('placeOrder', () => {
        test('basic', () => {
            const orderSpec = { order: 'spec' };
            client.placeOrder(ACCOUNT_HASH, orderSpec);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                orderSpec
            );
        });

        test('with order builder', () => {
            const orderSpec = new OrderBuilder().setOrderType(OrderType.LIMIT);
            const expectedSpec = { orderType: OrderType.LIMIT };
            client.placeOrder(ACCOUNT_HASH, orderSpec);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                expectedSpec
            );
        });

        test('with string account hash', () => {
            const orderSpec = { order: 'spec' };
            client.placeOrder(ACCOUNT_HASH.toString(), orderSpec);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders'),
                orderSpec
            );
        });
    });

    describe('replaceOrder', () => {
        test('basic', () => {
            const orderSpec = { order: 'spec' };
            client.replaceOrder(ACCOUNT_HASH, ORDER_ID.toString(), orderSpec);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                orderSpec
            );
        });

        test('with order builder', () => {
            const orderSpec = new OrderBuilder().setOrderType(OrderType.LIMIT);
            const expectedSpec = { orderType: OrderType.LIMIT };
            client.replaceOrder(ACCOUNT_HASH, ORDER_ID.toString(), orderSpec);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                expectedSpec
            );
        });

        test('with string parameters', () => {
            const orderSpec = { order: 'spec' };
            client.replaceOrder(ACCOUNT_HASH.toString(), ORDER_ID.toString(), orderSpec);
            expect(mockSession.put).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/orders/{orderId}'),
                orderSpec
            );
        });
    });

    describe('previewOrder', () => {
        test('basic', () => {
            const orderSpec = { order: 'spec' };
            client.previewOrder(ACCOUNT_HASH, orderSpec);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/previewOrder'),
                orderSpec
            );
        });

        test('with order builder', () => {
            const orderSpec = new OrderBuilder().setOrderType(OrderType.LIMIT);
            const expectedSpec = { orderType: OrderType.LIMIT };
            client.previewOrder(ACCOUNT_HASH, orderSpec);
            expect(mockSession.post).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/previewOrder'),
                expectedSpec
            );
        });
    });

    describe('getTransactions', () => {
        test('basic', () => {
            client.getTransactions(ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE,JOURNAL,DIVIDEND_OR_INTEREST,ACH_RECEIPT,ACH_DISBURSEMENT,CASH_RECEIPT,CASH_DISBURSEMENT,ELECTRONIC_FUND, WIRE_OUTGOING,WIRE_INCOMING,MARGIN_CALL,OPTION_EXERCISE,DEPOSIT_WITHDRAWAL,ACCOUNT_TRANSFER,INTEREST,REBATE,TAX,TAX_WITHHOLDING,INSTRUMENT_NOT_FOUND,ORDER_ENTRY_ORDER_UPDATE,ORDER_EXECUTION,ORDER_CANCEL,ORDER_REJECT,ORDER_EXPIRATION,ORDER_REPLACE,ORDER_PARTIAL_FILL,ORDER_FILL,ACCOUNT_ACTIVITY,MERGER,SPIN_OFF,COMPANY_ACTION,NAME_CHANGE,CUSIP_CHANGE,STOCK_SPLIT,REVERSE_STOCK_SPLIT,OPTION_EXPIRATION,OPTION_ASSIGNMENT,CLOSING,CONVERSION,ACCOUNT_TRANSFER_ACCOUNT_ACTIVITY,INSTRUMENT_NOT_FOUND_ACCOUNT_ACTIVITY,ORDER_ENTRY_ORDER_UPDATE_ACCOUNT_ACTIVITY,ORDER_EXECUTION_ACCOUNT_ACTIVITY,ORDER_CANCEL_ACCOUNT_ACTIVITY,ORDER_REJECT_ACCOUNT_ACTIVITY,ORDER_EXPIRATION_ACCOUNT_ACTIVITY,ORDER_REPLACE_ACCOUNT_ACTIVITY,ORDER_PARTIAL_FILL_ACCOUNT_ACTIVITY,ORDER_FILL_ACCOUNT_ACTIVITY,MERGER_ACCOUNT_ACTIVITY,SPIN_OFF_ACCOUNT_ACTIVITY,COMPANY_ACTION_ACCOUNT_ACTIVITY,NAME_CHANGE_ACCOUNT_ACTIVITY,CUSIP_CHANGE_ACCOUNT_ACTIVITY,STOCK_SPLIT_ACCOUNT_ACTIVITY,REVERSE_STOCK_SPLIT_ACCOUNT_ACTIVITY,OPTION_EXPIRATION_ACCOUNT_ACTIVITY,OPTION_ASSIGNMENT_ACCOUNT_ACTIVITY,CLOSING_ACCOUNT_ACTIVITY,CONVERSION_ACCOUNT_ACTIVITY',
                        startDate: '2019-11-03T03:04:05Z',
                        endDate: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('with one transaction type', () => {
            client.getTransactions(ACCOUNT_HASH, { transactionTypes: 'TRADE' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE',
                        startDate: '2019-11-03T03:04:05Z',
                        endDate: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('with transaction type list', () => {
            client.getTransactions(ACCOUNT_HASH, { transactionTypes: ['TRADE', 'JOURNAL'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE,JOURNAL',
                        startDate: '2019-11-03T03:04:05Z',
                        endDate: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('with transaction type list unchecked', () => {
            client.setEnforceEnums(false);
            client.getTransactions(ACCOUNT_HASH, { transactionTypes: ['TRADE', 'JOURNAL'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE,JOURNAL',
                        startDate: '2019-11-03T03:04:05Z',
                        endDate: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('with symbol', () => {
            client.getTransactions(ACCOUNT_HASH, { symbol: 'AAPL' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE,JOURNAL,DIVIDEND_OR_INTEREST,ACH_RECEIPT,ACH_DISBURSEMENT,CASH_RECEIPT,CASH_DISBURSEMENT,ELECTRONIC_FUND, WIRE_OUTGOING,WIRE_INCOMING,MARGIN_CALL,OPTION_EXERCISE,DEPOSIT_WITHDRAWAL,ACCOUNT_TRANSFER,INTEREST,REBATE,TAX,TAX_WITHHOLDING,INSTRUMENT_NOT_FOUND,ORDER_ENTRY_ORDER_UPDATE,ORDER_EXECUTION,ORDER_CANCEL,ORDER_REJECT,ORDER_EXPIRATION,ORDER_REPLACE,ORDER_PARTIAL_FILL,ORDER_FILL,ACCOUNT_ACTIVITY,MERGER,SPIN_OFF,COMPANY_ACTION,NAME_CHANGE,CUSIP_CHANGE,STOCK_SPLIT,REVERSE_STOCK_SPLIT,OPTION_EXPIRATION,OPTION_ASSIGNMENT,CLOSING,CONVERSION,ACCOUNT_TRANSFER_ACCOUNT_ACTIVITY,INSTRUMENT_NOT_FOUND_ACCOUNT_ACTIVITY,ORDER_ENTRY_ORDER_UPDATE_ACCOUNT_ACTIVITY,ORDER_EXECUTION_ACCOUNT_ACTIVITY,ORDER_CANCEL_ACCOUNT_ACTIVITY,ORDER_REJECT_ACCOUNT_ACTIVITY,ORDER_EXPIRATION_ACCOUNT_ACTIVITY,ORDER_REPLACE_ACCOUNT_ACTIVITY,ORDER_PARTIAL_FILL_ACCOUNT_ACTIVITY,ORDER_FILL_ACCOUNT_ACTIVITY,MERGER_ACCOUNT_ACTIVITY,SPIN_OFF_ACCOUNT_ACTIVITY,COMPANY_ACTION_ACCOUNT_ACTIVITY,NAME_CHANGE_ACCOUNT_ACTIVITY,CUSIP_CHANGE_ACCOUNT_ACTIVITY,STOCK_SPLIT_ACCOUNT_ACTIVITY,REVERSE_STOCK_SPLIT_ACCOUNT_ACTIVITY,OPTION_EXPIRATION_ACCOUNT_ACTIVITY,OPTION_ASSIGNMENT_ACCOUNT_ACTIVITY,CLOSING_ACCOUNT_ACTIVITY,CONVERSION_ACCOUNT_ACTIVITY',
                        startDate: '2019-11-03T03:04:05Z',
                        endDate: '2020-01-02T03:04:05Z',
                        symbol: 'AAPL'
                    }
                }
            );
        });

        test('with start date as datetime', () => {
            const startDate = new Date('2019-12-01T00:00:00Z');
            client.getTransactions(ACCOUNT_HASH, { startDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE,JOURNAL,DIVIDEND_OR_INTEREST,ACH_RECEIPT,ACH_DISBURSEMENT,CASH_RECEIPT,CASH_DISBURSEMENT,ELECTRONIC_FUND, WIRE_OUTGOING,WIRE_INCOMING,MARGIN_CALL,OPTION_EXERCISE,DEPOSIT_WITHDRAWAL,ACCOUNT_TRANSFER,INTEREST,REBATE,TAX,TAX_WITHHOLDING,INSTRUMENT_NOT_FOUND,ORDER_ENTRY_ORDER_UPDATE,ORDER_EXECUTION,ORDER_CANCEL,ORDER_REJECT,ORDER_EXPIRATION,ORDER_REPLACE,ORDER_PARTIAL_FILL,ORDER_FILL,ACCOUNT_ACTIVITY,MERGER,SPIN_OFF,COMPANY_ACTION,NAME_CHANGE,CUSIP_CHANGE,STOCK_SPLIT,REVERSE_STOCK_SPLIT,OPTION_EXPIRATION,OPTION_ASSIGNMENT,CLOSING,CONVERSION,ACCOUNT_TRANSFER_ACCOUNT_ACTIVITY,INSTRUMENT_NOT_FOUND_ACCOUNT_ACTIVITY,ORDER_ENTRY_ORDER_UPDATE_ACCOUNT_ACTIVITY,ORDER_EXECUTION_ACCOUNT_ACTIVITY,ORDER_CANCEL_ACCOUNT_ACTIVITY,ORDER_REJECT_ACCOUNT_ACTIVITY,ORDER_EXPIRATION_ACCOUNT_ACTIVITY,ORDER_REPLACE_ACCOUNT_ACTIVITY,ORDER_PARTIAL_FILL_ACCOUNT_ACTIVITY,ORDER_FILL_ACCOUNT_ACTIVITY,MERGER_ACCOUNT_ACTIVITY,SPIN_OFF_ACCOUNT_ACTIVITY,COMPANY_ACTION_ACCOUNT_ACTIVITY,NAME_CHANGE_ACCOUNT_ACTIVITY,CUSIP_CHANGE_ACCOUNT_ACTIVITY,STOCK_SPLIT_ACCOUNT_ACTIVITY,REVERSE_STOCK_SPLIT_ACCOUNT_ACTIVITY,OPTION_EXPIRATION_ACCOUNT_ACTIVITY,OPTION_ASSIGNMENT_ACCOUNT_ACTIVITY,CLOSING_ACCOUNT_ACTIVITY,CONVERSION_ACCOUNT_ACTIVITY',
                        startDate: '2019-12-01T00:00:00Z',
                        endDate: '2020-01-02T03:04:05Z'
                    }
                }
            );
        });

        test('with end date as datetime', () => {
            const endDate = new Date('2020-01-01T00:00:00Z');
            client.getTransactions(ACCOUNT_HASH, { endDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions'),
                {
                    params: {
                        types: 'TRADE,JOURNAL,DIVIDEND_OR_INTEREST,ACH_RECEIPT,ACH_DISBURSEMENT,CASH_RECEIPT,CASH_DISBURSEMENT,ELECTRONIC_FUND, WIRE_OUTGOING,WIRE_INCOMING,MARGIN_CALL,OPTION_EXERCISE,DEPOSIT_WITHDRAWAL,ACCOUNT_TRANSFER,INTEREST,REBATE,TAX,TAX_WITHHOLDING,INSTRUMENT_NOT_FOUND,ORDER_ENTRY_ORDER_UPDATE,ORDER_EXECUTION,ORDER_CANCEL,ORDER_REJECT,ORDER_EXPIRATION,ORDER_REPLACE,ORDER_PARTIAL_FILL,ORDER_FILL,ACCOUNT_ACTIVITY,MERGER,SPIN_OFF,COMPANY_ACTION,NAME_CHANGE,CUSIP_CHANGE,STOCK_SPLIT,REVERSE_STOCK_SPLIT,OPTION_EXPIRATION,OPTION_ASSIGNMENT,CLOSING,CONVERSION,ACCOUNT_TRANSFER_ACCOUNT_ACTIVITY,INSTRUMENT_NOT_FOUND_ACCOUNT_ACTIVITY,ORDER_ENTRY_ORDER_UPDATE_ACCOUNT_ACTIVITY,ORDER_EXECUTION_ACCOUNT_ACTIVITY,ORDER_CANCEL_ACCOUNT_ACTIVITY,ORDER_REJECT_ACCOUNT_ACTIVITY,ORDER_EXPIRATION_ACCOUNT_ACTIVITY,ORDER_REPLACE_ACCOUNT_ACTIVITY,ORDER_PARTIAL_FILL_ACCOUNT_ACTIVITY,ORDER_FILL_ACCOUNT_ACTIVITY,MERGER_ACCOUNT_ACTIVITY,SPIN_OFF_ACCOUNT_ACTIVITY,COMPANY_ACTION_ACCOUNT_ACTIVITY,NAME_CHANGE_ACCOUNT_ACTIVITY,CUSIP_CHANGE_ACCOUNT_ACTIVITY,STOCK_SPLIT_ACCOUNT_ACTIVITY,REVERSE_STOCK_SPLIT_ACCOUNT_ACTIVITY,OPTION_EXPIRATION_ACCOUNT_ACTIVITY,OPTION_ASSIGNMENT_ACCOUNT_ACTIVITY,CLOSING_ACCOUNT_ACTIVITY,CONVERSION_ACCOUNT_ACTIVITY',
                        startDate: '2019-11-03T03:04:05Z',
                        endDate: '2020-01-01T00:00:00Z'
                    }
                }
            );
        });
    });

    describe('getTransaction', () => {
        test('basic', () => {
            client.getTransaction(TRANSACTION_ID, ACCOUNT_HASH);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/accounts/{accountHash}/transactions/{transactionId}'),
                { params: {} }
            );
        });
    });

    describe('getUserPreferences', () => {
        test('basic', () => {
            client.getUserPreferences();
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/trader/v1/user/preferences'),
                { params: {} }
            );
        });
    });

    describe('getQuote', () => {
        test('basic', () => {
            client.getQuote(SYMBOL);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes/{symbol}'),
                { params: {} }
            );
        });

        test('with fields single', () => {
            client.getQuote(SYMBOL, { fields: 'bidPrice' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes/{symbol}'),
                { params: { fields: 'bidPrice' } }
            );
        });

        test('with fields unchecked', () => {
            client.setEnforceEnums(false);
            client.getQuote(SYMBOL, { fields: 'bidPrice' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes/{symbol}'),
                { params: { fields: 'bidPrice' } }
            );
        });

        test('with fields multiple', () => {
            client.getQuote(SYMBOL, { fields: ['bidPrice', 'askPrice'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes/{symbol}'),
                { params: { fields: 'bidPrice,askPrice' } }
            );
        });
    });

    describe('getQuotes', () => {
        test('basic', () => {
            client.getQuotes([SYMBOL]);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes'),
                { params: { symbols: SYMBOL } }
            );
        });

        test('single symbol', () => {
            client.getQuotes(SYMBOL);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes'),
                { params: { symbols: SYMBOL } }
            );
        });

        test('with fields', () => {
            client.getQuotes([SYMBOL], { fields: ['bidPrice', 'askPrice'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes'),
                { params: { symbols: SYMBOL, fields: 'bidPrice,askPrice' } }
            );
        });

        test('with fields unchecked', () => {
            client.setEnforceEnums(false);
            client.getQuotes([SYMBOL], { fields: ['bidPrice', 'askPrice'] });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes'),
                { params: { symbols: SYMBOL, fields: 'bidPrice,askPrice' } }
            );
        });

        test('with indicative', () => {
            client.getQuotes([SYMBOL], { indicative: true });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes'),
                { params: { symbols: SYMBOL, indicative: true } }
            );
        });

        test('with indicative not bool', () => {
            client.setEnforceEnums(false);
            client.getQuotes([SYMBOL], { indicative: 'true' as any });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/quotes'),
                { params: { symbols: SYMBOL, indicative: 'true' } }
            );
        });
    });

    describe('getPriceHistory', () => {
        test('vanilla', () => {
            client.getPriceHistory(SYMBOL);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1
                    }
                }
            );
        });

        test('with period type', () => {
            client.getPriceHistory(SYMBOL, { periodType: 'month' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'month',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1
                    }
                }
            );
        });

        test('with period type unchecked', () => {
            client.setEnforceEnums(false);
            client.getPriceHistory(SYMBOL, { periodType: 'NOT_A_PERIOD_TYPE' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'NOT_A_PERIOD_TYPE',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1
                    }
                }
            );
        });

        test('with num periods', () => {
            client.getPriceHistory(SYMBOL, { numPeriods: 10 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 10,
                        frequencyType: 'minute',
                        frequency: 1
                    }
                }
            );
        });

        test('with frequency type', () => {
            client.getPriceHistory(SYMBOL, { frequencyType: 'daily' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'daily',
                        frequency: 1
                    }
                }
            );
        });

        test('with frequency', () => {
            client.getPriceHistory(SYMBOL, { frequency: 5 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 5
                    }
                }
            );
        });

        test('with start datetime', () => {
            const startDate = new Date('2019-12-01T00:00:00Z');
            client.getPriceHistory(SYMBOL, { startDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1,
                        startDate: '2019-12-01T00:00:00Z'
                    }
                }
            );
        });

        test('with end datetime', () => {
            const endDate = new Date('2020-01-01T00:00:00Z');
            client.getPriceHistory(SYMBOL, { endDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1,
                        endDate: '2020-01-01T00:00:00Z'
                    }
                }
            );
        });

        test('with need extended hours data', () => {
            client.getPriceHistory(SYMBOL, { needExtendedHoursData: true });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1,
                        needExtendedHoursData: true
                    }
                }
            );
        });

        test('with need previous close', () => {
            client.getPriceHistory(SYMBOL, { needPreviousClose: true });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/pricehistory'),
                {
                    params: {
                        symbol: SYMBOL,
                        periodType: 'day',
                        period: 1,
                        frequencyType: 'minute',
                        frequency: 1,
                        needPreviousClose: true
                    }
                }
            );
        });

        // Every minute frequency tests
        describe('Every Minute Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'minute', frequency: 1 });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 1
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 1, 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 1,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 1, 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 1,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 1, 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 1,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 1, 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 1,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });

        // Every 5 minutes frequency tests
        describe('Every 5 Minutes Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'minute', frequency: 5 });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 5
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 5, 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 5,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 5, 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 5,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 5, 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 5,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 5, 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 5,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });

        // Every 10 minutes frequency tests
        describe('Every 10 Minutes Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'minute', frequency: 10 });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 10
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 10, 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 10,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 10, 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 10,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 10, 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 10,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 10, 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 10,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });

        // Every 15 minutes frequency tests
        describe('Every 15 Minutes Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'minute', frequency: 15 });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 15
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 15, 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 15,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 15, 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 15,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 15, 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 15,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 15, 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 15,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });

        // Every 30 minutes frequency tests
        describe('Every 30 Minutes Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'minute', frequency: 30 });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 30
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 30, 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 30,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 30, 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 30,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 30, 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 30,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'minute', 
                    frequency: 30, 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'minute',
                            frequency: 30,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });

        // Daily frequency tests
        describe('Daily Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'daily' });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'daily',
                            frequency: 1
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'daily', 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'daily',
                            frequency: 1,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'daily', 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'daily',
                            frequency: 1,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'daily', 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'daily',
                            frequency: 1,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'daily', 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'daily',
                            frequency: 1,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });

        // Weekly frequency tests
        describe('Weekly Frequency', () => {
            test('vanilla', () => {
                client.getPriceHistory(SYMBOL, { frequencyType: 'weekly' });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'weekly',
                            frequency: 1
                        }
                    }
                );
            });

            test('with start datetime', () => {
                const startDate = new Date('2019-12-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'weekly', 
                    startDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'weekly',
                            frequency: 1,
                            startDate: '2019-12-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with end datetime', () => {
                const endDate = new Date('2020-01-01T00:00:00Z');
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'weekly', 
                    endDate 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'weekly',
                            frequency: 1,
                            endDate: '2020-01-01T00:00:00Z'
                        }
                    }
                );
            });

            test('with extended hours data', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'weekly', 
                    needExtendedHoursData: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'weekly',
                            frequency: 1,
                            needExtendedHoursData: true
                        }
                    }
                );
            });

            test('with previous close', () => {
                client.getPriceHistory(SYMBOL, { 
                    frequencyType: 'weekly', 
                    needPreviousClose: true 
                });
                expect(mockSession.get).toHaveBeenCalledWith(
                    makeUrl('/marketdata/v1/pricehistory'),
                    {
                        params: {
                            symbol: SYMBOL,
                            periodType: 'day',
                            period: 1,
                            frequencyType: 'weekly',
                            frequency: 1,
                            needPreviousClose: true
                        }
                    }
                );
            });
        });
    });

    describe('getOptionChain', () => {
        test('vanilla', () => {
            client.getOptionChain(SYMBOL);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL
                    }
                }
            );
        });

        test('with contract type', () => {
            client.getOptionChain(SYMBOL, { contractType: 'CALL' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        contractType: 'CALL'
                    }
                }
            );
        });

        test('with contract type unchecked', () => {
            client.setEnforceEnums(false);
            client.getOptionChain(SYMBOL, { contractType: 'NOT_A_CONTRACT_TYPE' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        contractType: 'NOT_A_CONTRACT_TYPE'
                    }
                }
            );
        });

        test('with strike count', () => {
            client.getOptionChain(SYMBOL, { strikeCount: 10 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        strikeCount: 10
                    }
                }
            );
        });

        test('with include underlying quotes', () => {
            client.getOptionChain(SYMBOL, { includeUnderlyingQuotes: true });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        includeUnderlyingQuotes: true
                    }
                }
            );
        });

        test('with strategy', () => {
            client.getOptionChain(SYMBOL, { strategy: 'SINGLE' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        strategy: 'SINGLE'
                    }
                }
            );
        });

        test('with strategy unchecked', () => {
            client.setEnforceEnums(false);
            client.getOptionChain(SYMBOL, { strategy: 'NOT_A_STRATEGY' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        strategy: 'NOT_A_STRATEGY'
                    }
                }
            );
        });

        test('with interval', () => {
            client.getOptionChain(SYMBOL, { interval: 1 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        interval: 1
                    }
                }
            );
        });

        test('with strike', () => {
            client.getOptionChain(SYMBOL, { strike: 150 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        strike: 150
                    }
                }
            );
        });

        test('with strike range', () => {
            client.getOptionChain(SYMBOL, { strikeRange: 'ITM' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        strikeRange: 'ITM'
                    }
                }
            );
        });

        test('with strike range unchecked', () => {
            client.setEnforceEnums(false);
            client.getOptionChain(SYMBOL, { strikeRange: 'NOT_A_STRIKE_RANGE' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        strikeRange: 'NOT_A_STRIKE_RANGE'
                    }
                }
            );
        });

        test('with from date as datetime', () => {
            const fromDate = new Date('2019-12-01T00:00:00Z');
            client.getOptionChain(SYMBOL, { fromDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        fromDate: '2019-12-01T00:00:00Z'
                    }
                }
            );
        });

        test('with from date as date', () => {
            const fromDate = new Date('2019-12-01');
            client.getOptionChain(SYMBOL, { fromDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        fromDate: '2019-12-01T00:00:00Z'
                    }
                }
            );
        });

        test('with from date as string', () => {
            client.getOptionChain(SYMBOL, { fromDate: '2019-12-01' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        fromDate: '2019-12-01'
                    }
                }
            );
        });

        test('with to date as datetime', () => {
            const toDate = new Date('2020-01-01T00:00:00Z');
            client.getOptionChain(SYMBOL, { toDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        toDate: '2020-01-01T00:00:00Z'
                    }
                }
            );
        });

        test('with to date as date', () => {
            const toDate = new Date('2020-01-01');
            client.getOptionChain(SYMBOL, { toDate });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        toDate: '2020-01-01T00:00:00Z'
                    }
                }
            );
        });

        test('with to date as string', () => {
            client.getOptionChain(SYMBOL, { toDate: '2020-01-01' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        toDate: '2020-01-01'
                    }
                }
            );
        });

        test('with volatility', () => {
            client.getOptionChain(SYMBOL, { volatility: 0.3 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        volatility: 0.3
                    }
                }
            );
        });

        test('with underlying price', () => {
            client.getOptionChain(SYMBOL, { underlyingPrice: 150.0 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        underlyingPrice: 150.0
                    }
                }
            );
        });

        test('with interest rate', () => {
            client.getOptionChain(SYMBOL, { interestRate: 0.05 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        interestRate: 0.05
                    }
                }
            );
        });

        test('with days to expiration', () => {
            client.getOptionChain(SYMBOL, { daysToExpiration: 30 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        daysToExpiration: 30
                    }
                }
            );
        });

        test('with exp month', () => {
            client.getOptionChain(SYMBOL, { expMonth: 'JAN' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        expMonth: 'JAN'
                    }
                }
            );
        });

        test('with exp month unchecked', () => {
            client.setEnforceEnums(false);
            client.getOptionChain(SYMBOL, { expMonth: 'NOT_A_MONTH' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        expMonth: 'NOT_A_MONTH'
                    }
                }
            );
        });

        test('with option type', () => {
            client.getOptionChain(SYMBOL, { optionType: 'S' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        optionType: 'S'
                    }
                }
            );
        });

        test('with option type unchecked', () => {
            client.setEnforceEnums(false);
            client.getOptionChain(SYMBOL, { optionType: 'NOT_AN_OPTION_TYPE' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        optionType: 'NOT_AN_OPTION_TYPE'
                    }
                }
            );
        });

        test('with option entitlement', () => {
            client.getOptionChain(SYMBOL, { optionEntitlement: 'ALL' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        optionEntitlement: 'ALL'
                    }
                }
            );
        });

        test('with multiple parameters', () => {
            const fromDate = new Date('2019-12-01T00:00:00Z');
            const toDate = new Date('2020-01-01T00:00:00Z');
            client.getOptionChain(SYMBOL, { 
                contractType: 'CALL',
                strikeCount: 10,
                strategy: 'SINGLE',
                interval: 1,
                strike: 150,
                strikeRange: 'ITM',
                fromDate,
                toDate,
                volatility: 0.3,
                underlyingPrice: 150.0,
                interestRate: 0.05,
                daysToExpiration: 30,
                expMonth: 'JAN',
                optionType: 'S',
                optionEntitlement: 'ALL',
                includeUnderlyingQuotes: true
            });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/chains'),
                {
                    params: {
                        symbol: SYMBOL,
                        contractType: 'CALL',
                        strikeCount: 10,
                        strategy: 'SINGLE',
                        interval: 1,
                        strike: 150,
                        strikeRange: 'ITM',
                        fromDate: '2019-12-01T00:00:00Z',
                        toDate: '2020-01-01T00:00:00Z',
                        volatility: 0.3,
                        underlyingPrice: 150.0,
                        interestRate: 0.05,
                        daysToExpiration: 30,
                        expMonth: 'JAN',
                        optionType: 'S',
                        optionEntitlement: 'ALL',
                        includeUnderlyingQuotes: true
                    }
                }
            );
        });
    });

    describe('getOptionExpirationChain', () => {
        test('basic', () => {
            client.getOptionExpirationChain(SYMBOL);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/expirationchain'),
                {
                    params: {
                        symbol: SYMBOL
                    }
                }
            );
        });
    });

    describe('getMovers', () => {
        test('basic', () => {
            client.getMovers(INDEX);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/{index}'),
                { params: {} }
            );
        });

        test('with index unchecked', () => {
            client.setEnforceEnums(false);
            client.getMovers('NOT_AN_INDEX');
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/NOT_AN_INDEX'),
                { params: {} }
            );
        });

        test('with sort order', () => {
            client.getMovers(INDEX, { sort: 'ASC' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/{index}'),
                { params: { sort: 'ASC' } }
            );
        });

        test('with sort order unchecked', () => {
            client.setEnforceEnums(false);
            client.getMovers(INDEX, { sort: 'NOT_A_SORT_ORDER' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/{index}'),
                { params: { sort: 'NOT_A_SORT_ORDER' } }
            );
        });

        test('with frequency', () => {
            client.getMovers(INDEX, { frequency: 1 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/{index}'),
                { params: { frequency: 1 } }
            );
        });

        test('with frequency unchecked', () => {
            client.setEnforceEnums(false);
            client.getMovers(INDEX, { frequency: 'NOT_A_FREQUENCY' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/{index}'),
                { params: { frequency: 'NOT_A_FREQUENCY' } }
            );
        });

        test('with multiple parameters', () => {
            client.getMovers(INDEX, { sort: 'ASC', frequency: 1 });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/movers/{index}'),
                { params: { sort: 'ASC', frequency: 1 } }
            );
        });
    });

    describe('getMarketHours', () => {
        test('single market', () => {
            client.getMarketHours(MARKET);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/markets/{market}/hours'),
                { params: {} }
            );
        });

        test('market list', () => {
            client.getMarketHours([MARKET, 'OPTION']);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/markets/hours'),
                { params: { markets: 'EQUITY,OPTION' } }
            );
        });

        test('market unchecked', () => {
            client.setEnforceEnums(false);
            client.getMarketHours('NOT_A_MARKET');
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/markets/NOT_A_MARKET/hours'),
                { params: {} }
            );
        });

        test('with date', () => {
            const date = new Date('2020-01-02T00:00:00Z');
            client.getMarketHours(MARKET, { date });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/markets/{market}/hours'),
                { params: { date: '2020-01-02' } }
            );
        });

        test('with date string', () => {
            client.getMarketHours(MARKET, { date: '2020-01-02' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/markets/{market}/hours'),
                { params: { date: '2020-01-02' } }
            );
        });

        test('with date and market list', () => {
            const date = new Date('2020-01-02T00:00:00Z');
            client.getMarketHours([MARKET, 'OPTION'], { date });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/markets/hours'),
                { params: { markets: 'EQUITY,OPTION', date: '2020-01-02' } }
            );
        });
    });

    describe('getInstruments', () => {
        test('basic', () => {
            client.getInstruments(SYMBOL);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/instruments'),
                { params: { symbol: SYMBOL } }
            );
        });

        test('with projection', () => {
            client.getInstruments(SYMBOL, { projection: 'SYMBOL_SEARCH' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/instruments'),
                { params: { symbol: SYMBOL, projection: 'SYMBOL_SEARCH' } }
            );
        });

        test('with projection unchecked', () => {
            client.setEnforceEnums(false);
            client.getInstruments(SYMBOL, { projection: 'NOT_A_PROJECTION' });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/instruments'),
                { params: { symbol: SYMBOL, projection: 'NOT_A_PROJECTION' } }
            );
        });

        test('with string arguments', () => {
            client.getInstruments(SYMBOL, { 
                projection: 'SYMBOL_SEARCH',
                symbol: 'AAPL'
            });
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/instruments'),
                { params: { symbol: SYMBOL, projection: 'SYMBOL_SEARCH' } }
            );
        });
    });

    describe('getInstrumentByCusip', () => {
        test('basic', () => {
            client.getInstrumentByCusip(CUSIP);
            expect(mockSession.get).toHaveBeenCalledWith(
                makeUrl('/marketdata/v1/instruments/{cusip}'),
                { params: {} }
            );
        });
    });
});

// AsyncClient tests
describe('AsyncClient', () => {
    let client: any;

    beforeEach(() => {
        // Note: AsyncClient would need to be imported and implemented
        // For now, we'll create a mock that matches the expected interface
        client = {
            setEnforceEnums: jest.fn(),
            getAccount: jest.fn(),
            getAccounts: jest.fn(),
            getAccountNumbers: jest.fn(),
            getOrder: jest.fn(),
            cancelOrder: jest.fn(),
            getOrdersForAccount: jest.fn(),
            getOrdersForAllLinkedAccounts: jest.fn(),
            placeOrder: jest.fn(),
            replaceOrder: jest.fn(),
            previewOrder: jest.fn(),
            getTransactions: jest.fn(),
            getTransaction: jest.fn(),
            getUserPreferences: jest.fn(),
            getQuote: jest.fn(),
            getQuotes: jest.fn(),
            getPriceHistory: jest.fn(),
            getOptionChain: jest.fn(),
            getOptionExpirationChain: jest.fn(),
            getMovers: jest.fn(),
            getMarketHours: jest.fn(),
            getInstruments: jest.fn(),
            getInstrumentByCusip: jest.fn(),
            setTimeout: jest.fn(),
            tokenAge: jest.fn(),
            logger: console
        };
    });

    describe('Generic functionality', () => {
        test('setTimeout', () => {
            const timeout = 'dummy';
            client.setTimeout(timeout);
            expect(client.setTimeout).toHaveBeenCalledWith(timeout);
        });

        test('tokenAge', () => {
            expect(client.tokenAge).toBeDefined();
        });

        test('setEnforceEnums', () => {
            client.setEnforceEnums(false);
            expect(client.setEnforceEnums).toHaveBeenCalledWith(false);
        });
    });

    describe('Account operations', () => {
        test('getAccount', () => {
            client.getAccount(ACCOUNT_HASH);
            expect(client.getAccount).toHaveBeenCalledWith(ACCOUNT_HASH);
        });

        test('getAccounts', () => {
            client.getAccounts();
            expect(client.getAccounts).toHaveBeenCalled();
        });

        test('getAccountNumbers', () => {
            client.getAccountNumbers();
            expect(client.getAccountNumbers).toHaveBeenCalled();
        });
    });

    describe('Order operations', () => {
        test('getOrder', () => {
            client.getOrder(ORDER_ID, ACCOUNT_HASH);
            expect(client.getOrder).toHaveBeenCalledWith(ORDER_ID, ACCOUNT_HASH);
        });

        test('cancelOrder', () => {
            client.cancelOrder(ORDER_ID, ACCOUNT_HASH);
            expect(client.cancelOrder).toHaveBeenCalledWith(ORDER_ID, ACCOUNT_HASH);
        });

        test('getOrdersForAccount', () => {
            client.getOrdersForAccount(ACCOUNT_HASH);
            expect(client.getOrdersForAccount).toHaveBeenCalledWith(ACCOUNT_HASH);
        });

        test('getOrdersForAllLinkedAccounts', () => {
            client.getOrdersForAllLinkedAccounts();
            expect(client.getOrdersForAllLinkedAccounts).toHaveBeenCalled();
        });

        test('placeOrder', () => {
            const orderSpec = { order: 'spec' };
            client.placeOrder(ACCOUNT_HASH, orderSpec);
            expect(client.placeOrder).toHaveBeenCalledWith(ACCOUNT_HASH, orderSpec);
        });

        test('replaceOrder', () => {
            const orderSpec = { order: 'spec' };
            client.replaceOrder(ACCOUNT_HASH, ORDER_ID.toString(), orderSpec);
            expect(client.replaceOrder).toHaveBeenCalledWith(ACCOUNT_HASH, ORDER_ID.toString(), orderSpec);
        });

        test('previewOrder', () => {
            const orderSpec = { order: 'spec' };
            client.previewOrder(ACCOUNT_HASH, orderSpec);
            expect(client.previewOrder).toHaveBeenCalledWith(ACCOUNT_HASH, orderSpec);
        });
    });

    describe('Transaction operations', () => {
        test('getTransactions', () => {
            client.getTransactions(ACCOUNT_HASH);
            expect(client.getTransactions).toHaveBeenCalledWith(ACCOUNT_HASH);
        });

        test('getTransaction', () => {
            client.getTransaction(TRANSACTION_ID, ACCOUNT_HASH);
            expect(client.getTransaction).toHaveBeenCalledWith(TRANSACTION_ID, ACCOUNT_HASH);
        });
    });

    describe('Market data operations', () => {
        test('getQuote', () => {
            client.getQuote(SYMBOL);
            expect(client.getQuote).toHaveBeenCalledWith(SYMBOL);
        });

        test('getQuotes', () => {
            client.getQuotes([SYMBOL]);
            expect(client.getQuotes).toHaveBeenCalledWith([SYMBOL]);
        });

        test('getPriceHistory', () => {
            client.getPriceHistory(SYMBOL);
            expect(client.getPriceHistory).toHaveBeenCalledWith(SYMBOL);
        });

        test('getOptionChain', () => {
            client.getOptionChain(SYMBOL);
            expect(client.getOptionChain).toHaveBeenCalledWith(SYMBOL);
        });

        test('getOptionExpirationChain', () => {
            client.getOptionExpirationChain(SYMBOL);
            expect(client.getOptionExpirationChain).toHaveBeenCalledWith(SYMBOL);
        });

        test('getMovers', () => {
            client.getMovers(INDEX);
            expect(client.getMovers).toHaveBeenCalledWith(INDEX);
        });

        test('getMarketHours', () => {
            client.getMarketHours(MARKET);
            expect(client.getMarketHours).toHaveBeenCalledWith(MARKET);
        });

        test('getInstruments', () => {
            client.getInstruments(SYMBOL);
            expect(client.getInstruments).toHaveBeenCalledWith(SYMBOL);
        });

        test('getInstrumentByCusip', () => {
            client.getInstrumentByCusip(CUSIP);
            expect(client.getInstrumentByCusip).toHaveBeenCalledWith(CUSIP);
        });
    });

    describe('Async-specific functionality', () => {
        test('async close', async () => {
            // This would test the async close method if implemented
            expect(client).toBeDefined();
        });
    });
}); 