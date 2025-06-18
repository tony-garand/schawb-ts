import { OptionSymbol, OptionOrderLeg, OptionOrder, OptionOrderBuilder } from '../../src/orders/options';
import { OptionInstruction, OrderType, Duration, Session } from '../../src/orders/common';

describe('OptionSymbol', () => {
  test('OptionSymbol builds correctly', () => {
    const symbol = new OptionSymbol('AAPL', new Date('2023-12-15'), 'CALL', '150');
    expect(symbol.build()).toBe('AAPL_121523C150');
  });

  test('OptionSymbol throws error for invalid contract type', () => {
    expect(() => new OptionSymbol('AAPL', new Date('2023-12-15'), 'INVALID', '150')).toThrow('Invalid contract type');
  });

  test('OptionSymbol throws error for invalid strike price', () => {
    expect(() => new OptionSymbol('AAPL', new Date('2023-12-15'), 'CALL', '-150')).toThrow('Strike price must be a string representing a positive float');
  });
});

describe('OptionOrderLeg', () => {
  test('OptionOrderLeg properties are correctly set', () => {
    const symbol = new OptionSymbol('AAPL', new Date('2023-12-15'), 'CALL', '150');
    const leg = new OptionOrderLeg(OptionInstruction.BUY_TO_OPEN, symbol, 1);
    expect(leg.instruction).toBe(OptionInstruction.BUY_TO_OPEN);
    expect(leg.symbol).toBe(symbol);
    expect(leg.quantity).toBe(1);
  });
});

describe('OptionOrder', () => {
  test('OptionOrder properties are correctly set', () => {
    const symbol = new OptionSymbol('AAPL', new Date('2023-12-15'), 'CALL', '150');
    const leg = new OptionOrderLeg(OptionInstruction.BUY_TO_OPEN, symbol, 1);
    const order = new OptionOrder(
      Session.NORMAL,
      Duration.DAY,
      OrderType.MARKET,
      1,
      leg
    );
    expect(order.session).toBe(Session.NORMAL);
    expect(order.duration).toBe(Duration.DAY);
    expect(order.orderType).toBe(OrderType.MARKET);
    expect(order.quantity).toBe(1);
    expect(order.leg).toBe(leg);
  });
});

describe('OptionOrderBuilder', () => {
  let builder: OptionOrderBuilder;

  beforeEach(() => {
    builder = new OptionOrderBuilder();
  });

  test('OptionOrderBuilder initializes with default values', () => {
    expect(builder).toBeDefined();
  });

  test('setOrderType sets the order type correctly', () => {
    builder.setOrderType(OrderType.MARKET);
    const order = builder.build();
    expect(order.orderType).toBe(OrderType.MARKET);
  });

  test('setDuration sets the duration correctly', () => {
    builder.setDuration(Duration.DAY);
    const order = builder.build();
    expect(order.duration).toBe(Duration.DAY);
  });

  test('setSession sets the session correctly', () => {
    builder.setSession(Session.NORMAL);
    const order = builder.build();
    expect(order.session).toBe(Session.NORMAL);
  });

  test('setQuantity sets the quantity correctly', () => {
    builder.setQuantity(1);
    const order = builder.build();
    expect(order.quantity).toBe(1);
  });

  test('setLeg sets the leg correctly', () => {
    const symbol = new OptionSymbol('AAPL', new Date('2023-12-15'), 'CALL', '150');
    const leg = new OptionOrderLeg(OptionInstruction.BUY_TO_OPEN, symbol, 1);
    builder.setLeg(leg);
    const order = builder.build();
    expect(order.leg).toBe(leg);
  });

  test('build returns the correct order object', () => {
    const symbol = new OptionSymbol('AAPL', new Date('2023-12-15'), 'CALL', '150');
    const leg = new OptionOrderLeg(OptionInstruction.BUY_TO_OPEN, symbol, 1);
    builder.setOrderType(OrderType.MARKET);
    builder.setDuration(Duration.DAY);
    builder.setSession(Session.NORMAL);
    builder.setQuantity(1);
    builder.setLeg(leg);

    const order = builder.build();
    expect(order).toEqual({
      orderType: OrderType.MARKET,
      duration: Duration.DAY,
      session: Session.NORMAL,
      quantity: 1,
      leg: leg,
    });
  });
}); 