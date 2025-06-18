import { OrderType, OrderStrategyType, ComplexOrderStrategyType, OptionInstruction, Duration, Session, OrderLeg, OrderLegCollection, Order, firstTriggersSecond, oneCancelsOther, __BaseInstrument } from '../../src/orders/common';

describe('Order Enums', () => {
  test('OrderType values are correct', () => {
    expect(OrderType.MARKET).toBe('MARKET');
    expect(OrderType.LIMIT).toBe('LIMIT');
    expect(OrderType.STOP).toBe('STOP');
    expect(OrderType.STOP_LIMIT).toBe('STOP_LIMIT');
    expect(OrderType.TRAILING_STOP).toBe('TRAILING_STOP');
    expect(OrderType.CABINET).toBe('CABINET');
    expect(OrderType.NON_MARKETABLE).toBe('NON_MARKETABLE');
    expect(OrderType.MARKET_ON_CLOSE).toBe('MARKET_ON_CLOSE');
    expect(OrderType.EXERCISE).toBe('EXERCISE');
    expect(OrderType.TRAILING_STOP_LIMIT).toBe('TRAILING_STOP_LIMIT');
    expect(OrderType.NET_DEBIT).toBe('NET_DEBIT');
    expect(OrderType.NET_CREDIT).toBe('NET_CREDIT');
    expect(OrderType.NET_ZERO).toBe('NET_ZERO');
  });

  test('OrderStrategyType values are correct', () => {
    expect(OrderStrategyType.SINGLE).toBe('SINGLE');
    expect(OrderStrategyType.OCO).toBe('OCO');
    expect(OrderStrategyType.TRIGGER).toBe('TRIGGER');
  });

  test('ComplexOrderStrategyType values are correct', () => {
    expect(ComplexOrderStrategyType.NONE).toBe('NONE');
    expect(ComplexOrderStrategyType.COVERED).toBe('COVERED');
    expect(ComplexOrderStrategyType.VERTICAL).toBe('VERTICAL');
    expect(ComplexOrderStrategyType.BACK_RATIO).toBe('BACK_RATIO');
    expect(ComplexOrderStrategyType.CALENDAR).toBe('CALENDAR');
    expect(ComplexOrderStrategyType.DIAGONAL).toBe('DIAGONAL');
    expect(ComplexOrderStrategyType.STRADDLE).toBe('STRADDLE');
    expect(ComplexOrderStrategyType.STRANGLE).toBe('STRANGLE');
    expect(ComplexOrderStrategyType.COLLAR_SYNTHETIC).toBe('COLLAR_SYNTHETIC');
    expect(ComplexOrderStrategyType.BUTTERFLY).toBe('BUTTERFLY');
    expect(ComplexOrderStrategyType.CONDOR).toBe('CONDOR');
    expect(ComplexOrderStrategyType.IRON_CONDOR).toBe('IRON_CONDOR');
    expect(ComplexOrderStrategyType.VERTICAL_ROLL).toBe('VERTICAL_ROLL');
    expect(ComplexOrderStrategyType.COLLAR_WITH_STOCK).toBe('COLLAR_WITH_STOCK');
    expect(ComplexOrderStrategyType.DOUBLE_DIAGONAL).toBe('DOUBLE_DIAGONAL');
    expect(ComplexOrderStrategyType.UNBALANCED_BUTTERFLY).toBe('UNBALANCED_BUTTERFLY');
    expect(ComplexOrderStrategyType.UNBALANCED_CONDOR).toBe('UNBALANCED_CONDOR');
    expect(ComplexOrderStrategyType.UNBALANCED_IRON_CONDOR).toBe('UNBALANCED_IRON_CONDOR');
    expect(ComplexOrderStrategyType.UNBALANCED_VERTICAL_ROLL).toBe('UNBALANCED_VERTICAL_ROLL');
    expect(ComplexOrderStrategyType.CUSTOM).toBe('CUSTOM');
  });

  test('OptionInstruction values are correct', () => {
    expect(OptionInstruction.BUY_TO_OPEN).toBe('BUY_TO_OPEN');
    expect(OptionInstruction.SELL_TO_OPEN).toBe('SELL_TO_OPEN');
    expect(OptionInstruction.BUY_TO_CLOSE).toBe('BUY_TO_CLOSE');
    expect(OptionInstruction.SELL_TO_CLOSE).toBe('SELL_TO_CLOSE');
  });

  test('Duration values are correct', () => {
    expect(Duration.DAY).toBe('DAY');
    expect(Duration.GOOD_TILL_CANCEL).toBe('GOOD_TILL_CANCEL');
    expect(Duration.FILL_OR_KILL).toBe('FILL_OR_KILL');
  });

  test('Session values are correct', () => {
    expect(Session.NORMAL).toBe('NORMAL');
    expect(Session.AM).toBe('AM');
    expect(Session.PM).toBe('PM');
    expect(Session.SEAMLESS).toBe('SEAMLESS');
  });
});

describe('OrderLeg', () => {
  test('OrderLeg properties are correctly set', () => {
    const instrument = new __BaseInstrument('EQUITY', 'AAPL');
    const leg = new OrderLeg('EQUITY', 1, instrument, 'BUY', 100, 'SHARES');
    expect(leg.assetType).toBe('EQUITY');
    expect(leg.legId).toBe(1);
    expect(leg.instrument.symbol).toBe('AAPL');
    expect(leg.instruction).toBe('BUY');
    expect(leg.quantity).toBe(100);
    expect(leg.quantityType).toBe('SHARES');
  });
});

describe('OrderLegCollection', () => {
  test('OrderLegCollection adds and retrieves legs correctly', () => {
    const collection = new OrderLegCollection();
    const instrument = new __BaseInstrument('EQUITY', 'AAPL');
    const leg = new OrderLeg('EQUITY', 1, instrument, 'BUY', 100, 'SHARES');
    collection.addLeg(leg);
    expect(collection.legs).toHaveLength(1);
    expect(collection.legs[0]).toBe(leg);
  });
});

describe('Order', () => {
  test('Order properties are correctly set', () => {
    const order = new Order(
      Session.NORMAL,
      Duration.DAY,
      OrderType.MARKET,
      100,
      0,
      100,
      'AUTO',
      'AutoRoute',
      0,
      OrderStrategyType.SINGLE,
      1,
      true,
      true,
      'SUBMITTED',
      new Date(),
      'tag',
      123,
      new OrderLegCollection()
    );
    expect(order.session).toBe(Session.NORMAL);
    expect(order.duration).toBe(Duration.DAY);
    expect(order.orderType).toBe(OrderType.MARKET);
    expect(order.quantity).toBe(100);
    expect(order.orderStrategyType).toBe(OrderStrategyType.SINGLE);
    expect(order.orderId).toBe(1);
    expect(order.cancelable).toBe(true);
    expect(order.editable).toBe(true);
    expect(order.status).toBe('SUBMITTED');
    expect(order.tag).toBe('tag');
    expect(order.accountId).toBe(123);
  });
});

describe('Order Combinators', () => {
  test('firstTriggersSecond combines orders correctly', () => {
    const first = { orderStrategyType: OrderStrategyType.SINGLE };
    const second = { orderStrategyType: OrderStrategyType.SINGLE };
    const result = firstTriggersSecond(first, second);
    expect(result.orderStrategyType).toBe(OrderStrategyType.TRIGGER);
    expect(result.childOrderStrategies).toEqual([first, second]);
  });

  test('oneCancelsOther combines orders correctly', () => {
    const one = { orderStrategyType: OrderStrategyType.SINGLE };
    const other = { orderStrategyType: OrderStrategyType.SINGLE };
    const result = oneCancelsOther(one, other);
    expect(result.orderStrategyType).toBe(OrderStrategyType.OCO);
    expect(result.childOrderStrategies).toEqual([one, other]);
  });
}); 