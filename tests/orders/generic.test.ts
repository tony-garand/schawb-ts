import { OrderBuilder } from '../../src/orders/generic';
import { OrderType, OrderStrategyType, Duration, Session } from '../../src/orders/common';

describe('OrderBuilder', () => {
  let builder: OrderBuilder;

  beforeEach(() => {
    builder = new OrderBuilder();
  });

  test('OrderBuilder initializes with default values', () => {
    expect(builder).toBeDefined();
  });

  test('setOrderType sets the order type correctly', () => {
    builder.setOrderType(OrderType.MARKET);
    expect(builder._orderType).toBe(OrderType.MARKET);
  });

  test('setDuration sets the duration correctly', () => {
    builder.setDuration(Duration.DAY);
    expect(builder._duration).toBe(Duration.DAY);
  });

  test('setSession sets the session correctly', () => {
    builder.setSession(Session.NORMAL);
    expect(builder._session).toBe(Session.NORMAL);
  });

  test('setQuantity sets the quantity correctly', () => {
    builder.setQuantity(100);
    expect(builder._quantity).toBe(100);
  });

  test('setPrice sets the price correctly', () => {
    builder.setPrice(150.5);
    expect(builder._price).toBe(150.5);
  });

  test('setOrderStrategyType sets the order strategy type correctly', () => {
    builder.setOrderStrategyType(OrderStrategyType.SINGLE);
    expect(builder._orderStrategyType).toBe(OrderStrategyType.SINGLE);
  });

  test('build returns the correct order object', () => {
    builder.setOrderType(OrderType.MARKET);
    builder.setDuration(Duration.DAY);
    builder.setSession(Session.NORMAL);
    builder.setQuantity(100);
    builder.setPrice(150.5);
    builder.setOrderStrategyType(OrderStrategyType.SINGLE);

    const order = builder.build();
    expect(order).toEqual({
      orderType: OrderType.MARKET,
      duration: Duration.DAY,
      session: Session.NORMAL,
      quantity: 100,
      price: 150.5,
      orderStrategyType: OrderStrategyType.SINGLE,
      orderLegCollection: [],
    });
  });
}); 