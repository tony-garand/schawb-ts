import {
  equityBuyMarket,
  equitySellMarket,
  equityBuyLimit,
  equitySellLimit,
  equitySellShortMarket,
  equitySellShortLimit,
  equityBuyToCoverMarket,
  equityBuyToCoverLimit,
  equityBuyStop,
  equitySellStop,
  equityBuyStopLimit,
  equitySellStopLimit,
  equitySellTrailingStop,
  equitySellTrailingStopPercent,
} from '../src/orders/equities';

describe('Equity Order Templates', () => {
  const symbol = 'AAPL';

  describe('Market Orders', () => {
    it('should create a market buy order', () => {
      const order = equityBuyMarket(symbol, 100).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.session).toBe('NORMAL');
      expect(order.duration).toBe('DAY');
      expect(order.orderStrategyType).toBe('SINGLE');
      expect(order.orderLegCollection).toHaveLength(1);
      expect(order.orderLegCollection![0].instruction).toBe('BUY');
      expect(order.orderLegCollection![0].quantity).toBe(100);
      expect(order.orderLegCollection![0].instrument.symbol).toBe('AAPL');
    });

    it('should create a market sell order', () => {
      const order = equitySellMarket(symbol, 50).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection![0].instruction).toBe('SELL');
      expect(order.orderLegCollection![0].quantity).toBe(50);
    });
  });

  describe('Limit Orders', () => {
    it('should create a limit buy order', () => {
      const order = equityBuyLimit(symbol, 100, 150.0).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(150.0);
      expect(order.orderLegCollection![0].instruction).toBe('BUY');
    });

    it('should create a limit sell order', () => {
      const order = equitySellLimit(symbol, 50, 160.0).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(160.0);
      expect(order.orderLegCollection![0].instruction).toBe('SELL');
    });
  });

  describe('Short Selling Orders', () => {
    it('should create a market sell short order', () => {
      const order = equitySellShortMarket(symbol, 100).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection![0].instruction).toBe('SELL_SHORT');
    });

    it('should create a limit sell short order', () => {
      const order = equitySellShortLimit(symbol, 100, 155.0).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(155.0);
      expect(order.orderLegCollection![0].instruction).toBe('SELL_SHORT');
    });
  });

  describe('Buy to Cover Orders', () => {
    it('should create a market buy to cover order', () => {
      const order = equityBuyToCoverMarket(symbol, 100).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_COVER');
    });

    it('should create a limit buy to cover order', () => {
      const order = equityBuyToCoverLimit(symbol, 100, 145.0).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(145.0);
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_COVER');
    });
  });

  describe('Stop Orders', () => {
    it('should create a buy stop order', () => {
      const order = equityBuyStop(symbol, 100, 155.0).build();
      expect(order.orderType).toBe('STOP');
      expect(order.stopPrice).toBe(155.0);
      expect(order.orderLegCollection![0].instruction).toBe('BUY');
    });

    it('should create a sell stop order', () => {
      const order = equitySellStop(symbol, 100, 145.0).build();
      expect(order.orderType).toBe('STOP');
      expect(order.stopPrice).toBe(145.0);
      expect(order.orderLegCollection![0].instruction).toBe('SELL');
    });
  });

  describe('Stop Limit Orders', () => {
    it('should create a buy stop limit order', () => {
      const order = equityBuyStopLimit(symbol, 100, 155.0, 156.0).build();
      expect(order.orderType).toBe('STOP_LIMIT');
      expect(order.stopPrice).toBe(155.0);
      expect(order.price).toBe(156.0);
      expect(order.orderLegCollection![0].instruction).toBe('BUY');
    });

    it('should create a sell stop limit order', () => {
      const order = equitySellStopLimit(symbol, 100, 145.0, 144.0).build();
      expect(order.orderType).toBe('STOP_LIMIT');
      expect(order.stopPrice).toBe(145.0);
      expect(order.price).toBe(144.0);
      expect(order.orderLegCollection![0].instruction).toBe('SELL');
    });
  });

  describe('Trailing Stop Orders', () => {
    it('should create a trailing stop order with dollar offset', () => {
      const order = equitySellTrailingStop(symbol, 100, 5.0).build();
      expect(order.orderType).toBe('TRAILING_STOP');
      expect(order.stopPriceLinkBasis).toBe('BID');
      expect(order.stopPriceLinkType).toBe('VALUE');
      expect(order.stopPriceOffset).toBe(5.0);
    });

    it('should create a trailing stop order with percent offset', () => {
      const order = equitySellTrailingStopPercent(symbol, 100, 5).build();
      expect(order.orderType).toBe('TRAILING_STOP');
      expect(order.stopPriceLinkBasis).toBe('BID');
      expect(order.stopPriceLinkType).toBe('PERCENT');
      expect(order.stopPriceOffset).toBe(5);
    });
  });

  describe('Order Builder chaining', () => {
    it('should allow modifying order properties after creation', () => {
      const order = equityBuyLimit(symbol, 100, 150.0)
        .setDuration('GOOD_TILL_CANCEL')
        .setSession('SEAMLESS')
        .build();

      expect(order.duration).toBe('GOOD_TILL_CANCEL');
      expect(order.session).toBe('SEAMLESS');
    });
  });
});
