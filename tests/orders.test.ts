import { OrderType, Duration, Session, OrderStrategyType } from '../src/orders/common';
import { EquityOrderBuilder } from '../src/orders/equities';

describe('BuilderTemplates', () => {
    test('equity_buy_market', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.MARKET);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('BUY', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.MARKET,
            session: Session.NORMAL,
            duration: Duration.DAY,
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_buy_limit', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.LIMIT);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setPrice('199.99');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('BUY', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.LIMIT,
            session: Session.NORMAL,
            duration: Duration.DAY,
            price: '199.99',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_sell_market', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.MARKET);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('SELL', 'AAPL', 5);

        expect(builder.build()).toEqual({
            orderType: OrderType.MARKET,
            session: Session.NORMAL,
            duration: Duration.DAY,
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'SELL',
                    quantity: 5,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'AAPL',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_sell_limit', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.LIMIT);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setPrice('299.99');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('SELL', 'AAPL', 5);

        expect(builder.build()).toEqual({
            orderType: OrderType.LIMIT,
            session: Session.NORMAL,
            duration: Duration.DAY,
            price: '299.99',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'SELL',
                    quantity: 5,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'AAPL',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_buy_stop', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.STOP);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setStopPrice('199.99');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('BUY', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.STOP,
            session: Session.NORMAL,
            duration: Duration.DAY,
            stopPrice: '199.99',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_sell_stop', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.STOP);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setStopPrice('299.99');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('SELL', 'AAPL', 5);

        expect(builder.build()).toEqual({
            orderType: OrderType.STOP,
            session: Session.NORMAL,
            duration: Duration.DAY,
            stopPrice: '299.99',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'SELL',
                    quantity: 5,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'AAPL',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_buy_stop_limit', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.STOP_LIMIT);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setStopPrice('199.99');
        builder.setPrice('200.00');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('BUY', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.STOP_LIMIT,
            session: Session.NORMAL,
            duration: Duration.DAY,
            stopPrice: '199.99',
            price: '200.00',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_sell_stop_limit', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.STOP_LIMIT);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setStopPrice('299.99');
        builder.setPrice('300.00');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('SELL', 'AAPL', 5);

        expect(builder.build()).toEqual({
            orderType: OrderType.STOP_LIMIT,
            session: Session.NORMAL,
            duration: Duration.DAY,
            stopPrice: '299.99',
            price: '300.00',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'SELL',
                    quantity: 5,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'AAPL',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_sell_short_market', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.MARKET);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('SELL_SHORT', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.MARKET,
            session: Session.NORMAL,
            duration: Duration.DAY,
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'SELL_SHORT',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_sell_short_limit', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.LIMIT);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setPrice('199.99');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('SELL_SHORT', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.LIMIT,
            session: Session.NORMAL,
            duration: Duration.DAY,
            price: '199.99',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'SELL_SHORT',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_buy_to_cover_market', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.MARKET);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('BUY_TO_COVER', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.MARKET,
            session: Session.NORMAL,
            duration: Duration.DAY,
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY_TO_COVER',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('equity_buy_to_cover_limit', () => {
        const builder = new EquityOrderBuilder();
        builder.setOrderType(OrderType.LIMIT);
        builder.setSession(Session.NORMAL);
        builder.setDuration(Duration.DAY);
        builder.setPrice('199.99');
        builder.setOrderStrategyType(OrderStrategyType.SINGLE);
        builder.addEquityLeg('BUY_TO_COVER', 'GOOG', 10);

        expect(builder.build()).toEqual({
            orderType: OrderType.LIMIT,
            session: Session.NORMAL,
            duration: Duration.DAY,
            price: '199.99',
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY_TO_COVER',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('add_equity_leg_success', () => {
        const builder = new EquityOrderBuilder();
        builder.addEquityLeg('BUY', 'GOOG', 10);
        builder.addEquityLeg('SELL_SHORT', 'MSFT', 1);

        expect(builder.build()).toEqual({
            orderType: OrderType.MARKET,
            session: Session.NORMAL,
            duration: Duration.DAY,
            orderStrategyType: OrderStrategyType.SINGLE,
            orderLegCollection: {
                orderLegType: 'EQUITY',
                legs: [{
                    legId: 1,
                    instruction: 'BUY',
                    quantity: 10,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'GOOG',
                        assetType: 'EQUITY',
                    }
                }, {
                    legId: 2,
                    instruction: 'SELL_SHORT',
                    quantity: 1,
                    quantityType: 'SHARES',
                    instrument: {
                        symbol: 'MSFT',
                        assetType: 'EQUITY',
                    }
                }]
            }
        });
    });

    test('add_equity_leg_negative_quantity', () => {
        const builder = new EquityOrderBuilder();
        expect(() => {
            builder.addEquityLeg('BUY', 'GOOG', -1);
        }).toThrow('Quantity must be positive');
    });

    test('add_equity_leg_zero_quantity', () => {
        const builder = new EquityOrderBuilder();
        expect(() => {
            builder.addEquityLeg('BUY', 'GOOG', 0);
        }).toThrow('Quantity must be positive');
    });
}); 