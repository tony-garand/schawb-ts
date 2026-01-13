import {
  oneCancelsOther,
  firstTriggersSecond,
  oneTriggerOCO,
  DurationValue,
  SessionValue,
  OrderTypeValue,
} from '../src/orders/common';
import { equityBuyLimit, equitySellLimit, equitySellStop } from '../src/orders/equities';

describe('Common Order Utilities', () => {
  describe('oneCancelsOther', () => {
    it('should create an OCO order', () => {
      const profitOrder = equitySellLimit('AAPL', 100, 180.0);
      const stopOrder = equitySellStop('AAPL', 100, 150.0);

      const ocoOrder = oneCancelsOther(profitOrder, stopOrder).build();

      expect(ocoOrder.orderStrategyType).toBe('OCO');
      expect(ocoOrder.childOrderStrategies).toHaveLength(2);
    });

    it('should contain both child orders', () => {
      const order1 = equitySellLimit('GOOG', 50, 150.0);
      const order2 = equitySellStop('GOOG', 50, 130.0);

      const ocoOrder = oneCancelsOther(order1, order2).build();

      expect(ocoOrder.childOrderStrategies![0].orderType).toBe('LIMIT');
      expect(ocoOrder.childOrderStrategies![1].orderType).toBe('STOP');
    });
  });

  describe('firstTriggersSecond', () => {
    it('should create a TRIGGER order', () => {
      const entryOrder = equityBuyLimit('AAPL', 100, 150.0);
      const exitOrder = equitySellStop('AAPL', 100, 140.0);

      const triggerOrder = firstTriggersSecond(entryOrder, exitOrder).build();

      expect(triggerOrder.orderStrategyType).toBe('TRIGGER');
      expect(triggerOrder.orderType).toBe('LIMIT');
      expect(triggerOrder.price).toBe(150.0);
      expect(triggerOrder.childOrderStrategies).toHaveLength(1);
    });

    it('should have the secondary order as child', () => {
      const buyOrder = equityBuyLimit('TSLA', 50, 200.0);
      const sellOrder = equitySellLimit('TSLA', 50, 250.0);

      const triggerOrder = firstTriggersSecond(buyOrder, sellOrder).build();

      expect(triggerOrder.childOrderStrategies![0].orderType).toBe('LIMIT');
      expect(triggerOrder.childOrderStrategies![0].price).toBe(250.0);
    });
  });

  describe('oneTriggerOCO', () => {
    it('should create a bracket order (OTOCO)', () => {
      const entryOrder = equityBuyLimit('AAPL', 100, 150.0);
      const profitOrder = equitySellLimit('AAPL', 100, 180.0);
      const stopOrder = equitySellStop('AAPL', 100, 140.0);

      const bracketOrder = oneTriggerOCO(entryOrder, profitOrder, stopOrder).build();

      expect(bracketOrder.orderStrategyType).toBe('TRIGGER');
      expect(bracketOrder.orderType).toBe('LIMIT');
      expect(bracketOrder.childOrderStrategies).toHaveLength(1);
      expect(bracketOrder.childOrderStrategies![0].orderStrategyType).toBe('OCO');
    });

    it('should have OCO with two child orders', () => {
      const entryOrder = equityBuyLimit('GOOG', 50, 100.0);
      const profitOrder = equitySellLimit('GOOG', 50, 120.0);
      const stopOrder = equitySellStop('GOOG', 50, 90.0);

      const bracketOrder = oneTriggerOCO(entryOrder, profitOrder, stopOrder).build();
      const ocoChild = bracketOrder.childOrderStrategies![0];

      expect(ocoChild.childOrderStrategies).toHaveLength(2);
    });
  });

  describe('Enum constants', () => {
    it('should have correct DurationValue values', () => {
      expect(DurationValue.DAY).toBe('DAY');
      expect(DurationValue.GOOD_TILL_CANCEL).toBe('GOOD_TILL_CANCEL');
      expect(DurationValue.FILL_OR_KILL).toBe('FILL_OR_KILL');
    });

    it('should have correct SessionValue values', () => {
      expect(SessionValue.NORMAL).toBe('NORMAL');
      expect(SessionValue.AM).toBe('AM');
      expect(SessionValue.PM).toBe('PM');
      expect(SessionValue.SEAMLESS).toBe('SEAMLESS');
    });

    it('should have correct OrderTypeValue values', () => {
      expect(OrderTypeValue.MARKET).toBe('MARKET');
      expect(OrderTypeValue.LIMIT).toBe('LIMIT');
      expect(OrderTypeValue.STOP).toBe('STOP');
      expect(OrderTypeValue.TRAILING_STOP).toBe('TRAILING_STOP');
    });
  });
});
