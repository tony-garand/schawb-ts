import { OrderType, Session, Duration, OrderStrategyType } from '../../src/orders/common';
import { EquityOrderBuilder } from '../../src/orders/equities';

describe('BuilderTemplates', () => {
  test('equity_buy_market', () => {
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.MARKET)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('BUY', 'GOOG', 10);

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
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.LIMIT)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setPrice('199.99')
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('BUY', 'GOOG', 10);

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
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.MARKET)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('SELL', 'GOOG', 10);

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

  test('equity_sell_limit', () => {
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.LIMIT)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setPrice('199.99')
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('SELL', 'GOOG', 10);

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
          instruction: 'SELL',
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

  test('equity_sell_short_market', () => {
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.MARKET)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('SELL_SHORT', 'GOOG', 10);

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
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.LIMIT)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setPrice('199.99')
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('SELL_SHORT', 'GOOG', 10);

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
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.MARKET)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('BUY_TO_COVER', 'GOOG', 10);

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
    const builder = new EquityOrderBuilder()
      .setOrderType(OrderType.LIMIT)
      .setSession(Session.NORMAL)
      .setDuration(Duration.DAY)
      .setPrice('199.99')
      .setOrderStrategyType(OrderStrategyType.SINGLE)
      .addEquityLeg('BUY_TO_COVER', 'GOOG', 10);

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
}); 