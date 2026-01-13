import {
  OptionSymbol,
  optionBuyToOpenMarket,
  optionBuyToOpenLimit,
  optionSellToOpenMarket,
  optionSellToOpenLimit,
  optionBuyToCloseMarket,
  optionBuyToCloseLimit,
  optionSellToCloseMarket,
  optionSellToCloseLimit,
  bullCallVerticalOpen,
  bullCallVerticalClose,
  bearCallVerticalOpen,
  bearCallVerticalClose,
  bullPutVerticalOpen,
  bullPutVerticalClose,
  bearPutVerticalOpen,
  bearPutVerticalClose,
} from '../src/orders/options';

describe('OptionSymbol', () => {
  describe('build', () => {
    it('should build a call option symbol correctly', () => {
      const symbol = new OptionSymbol('AAPL', new Date(2024, 11, 20), 'C', 150);
      expect(symbol.build()).toBe('AAPL  241220C00150000');
    });

    it('should build a put option symbol correctly', () => {
      const symbol = new OptionSymbol('TSLA', new Date(2024, 10, 15), 'P', 360);
      expect(symbol.build()).toBe('TSLA  241115P00360000');
    });

    it('should handle fractional strike prices', () => {
      const symbol = new OptionSymbol('SPY', new Date(2024, 5, 21), 'C', 450.5);
      expect(symbol.build()).toBe('SPY   240621C00450500');
    });

    it('should handle short underlying symbols', () => {
      const symbol = new OptionSymbol('FB', new Date(2024, 2, 15), 'P', 300);
      expect(symbol.build()).toBe('FB    240315P00300000');
    });

    it('should accept strike price as string', () => {
      const symbol = new OptionSymbol('GOOG', new Date(2024, 6, 19), 'C', '140.00');
      expect(symbol.build()).toBe('GOOG  240719C00140000');
    });
  });

  describe('parse', () => {
    it('should parse a call option symbol correctly', () => {
      const result = OptionSymbol.parse('AAPL  241220C00150000');
      expect(result.underlying).toBe('AAPL');
      expect(result.expirationDate.getFullYear()).toBe(2024);
      expect(result.expirationDate.getMonth()).toBe(11); // December (0-indexed)
      expect(result.expirationDate.getDate()).toBe(20);
      expect(result.contractType).toBe('C');
      expect(result.strikePrice).toBe(150);
    });

    it('should parse a put option symbol correctly', () => {
      const result = OptionSymbol.parse('TSLA  241115P00360000');
      expect(result.underlying).toBe('TSLA');
      expect(result.contractType).toBe('P');
      expect(result.strikePrice).toBe(360);
    });

    it('should parse fractional strike prices', () => {
      const result = OptionSymbol.parse('SPY   240621C00450500');
      expect(result.strikePrice).toBe(450.5);
    });
  });
});

describe('Single Option Templates', () => {
  const optionSymbol = 'AAPL  241220C00150000';

  describe('optionBuyToOpenMarket', () => {
    it('should create a market buy to open order', () => {
      const order = optionBuyToOpenMarket(optionSymbol, 10).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.session).toBe('NORMAL');
      expect(order.duration).toBe('DAY');
      expect(order.orderLegCollection).toHaveLength(1);
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_OPEN');
      expect(order.orderLegCollection![0].quantity).toBe(10);
    });
  });

  describe('optionBuyToOpenLimit', () => {
    it('should create a limit buy to open order', () => {
      const order = optionBuyToOpenLimit(optionSymbol, 5, 2.5).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(2.5);
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_OPEN');
    });
  });

  describe('optionSellToOpenMarket', () => {
    it('should create a market sell to open order', () => {
      const order = optionSellToOpenMarket(optionSymbol, 3).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection![0].instruction).toBe('SELL_TO_OPEN');
    });
  });

  describe('optionSellToOpenLimit', () => {
    it('should create a limit sell to open order', () => {
      const order = optionSellToOpenLimit(optionSymbol, 5, 3.0).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(3.0);
      expect(order.orderLegCollection![0].instruction).toBe('SELL_TO_OPEN');
    });
  });

  describe('optionBuyToCloseMarket', () => {
    it('should create a market buy to close order', () => {
      const order = optionBuyToCloseMarket(optionSymbol, 2).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_CLOSE');
    });
  });

  describe('optionBuyToCloseLimit', () => {
    it('should create a limit buy to close order', () => {
      const order = optionBuyToCloseLimit(optionSymbol, 5, 1.5).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_CLOSE');
    });
  });

  describe('optionSellToCloseMarket', () => {
    it('should create a market sell to close order', () => {
      const order = optionSellToCloseMarket(optionSymbol, 4).build();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection![0].instruction).toBe('SELL_TO_CLOSE');
    });
  });

  describe('optionSellToCloseLimit', () => {
    it('should create a limit sell to close order', () => {
      const order = optionSellToCloseLimit(optionSymbol, 3, 4.0).build();
      expect(order.orderType).toBe('LIMIT');
      expect(order.orderLegCollection![0].instruction).toBe('SELL_TO_CLOSE');
    });
  });
});

describe('Vertical Spread Templates', () => {
  const longCall = 'AAPL  241220C00150000';
  const shortCall = 'AAPL  241220C00160000';
  const longPut = 'AAPL  241220P00140000';
  const shortPut = 'AAPL  241220P00150000';

  describe('bullCallVerticalOpen', () => {
    it('should create a bull call spread order', () => {
      const order = bullCallVerticalOpen(longCall, shortCall, 5, 3.0).build();
      expect(order.orderType).toBe('NET_DEBIT');
      expect(order.price).toBe(3.0);
      expect(order.orderLegCollection).toHaveLength(2);
      expect(order.orderLegCollection![0].instruction).toBe('BUY_TO_OPEN');
      expect(order.orderLegCollection![1].instruction).toBe('SELL_TO_OPEN');
    });
  });

  describe('bullCallVerticalClose', () => {
    it('should create a bull call spread close order', () => {
      const order = bullCallVerticalClose(longCall, shortCall, 5, 5.0).build();
      expect(order.orderType).toBe('NET_CREDIT');
      expect(order.orderLegCollection![0].instruction).toBe('SELL_TO_CLOSE');
      expect(order.orderLegCollection![1].instruction).toBe('BUY_TO_CLOSE');
    });
  });

  describe('bearCallVerticalOpen', () => {
    it('should create a bear call spread order', () => {
      const order = bearCallVerticalOpen(shortCall, longCall, 3, 2.0).build();
      expect(order.orderType).toBe('NET_CREDIT');
      expect(order.orderLegCollection![0].instruction).toBe('SELL_TO_OPEN');
      expect(order.orderLegCollection![1].instruction).toBe('BUY_TO_OPEN');
    });
  });

  describe('bearCallVerticalClose', () => {
    it('should create a bear call spread close order', () => {
      const order = bearCallVerticalClose(shortCall, longCall, 3, 1.0).build();
      expect(order.orderType).toBe('NET_DEBIT');
    });
  });

  describe('bullPutVerticalOpen', () => {
    it('should create a bull put spread order', () => {
      const order = bullPutVerticalOpen(longPut, shortPut, 4, 1.5).build();
      expect(order.orderType).toBe('NET_CREDIT');
      expect(order.orderLegCollection).toHaveLength(2);
    });
  });

  describe('bullPutVerticalClose', () => {
    it('should create a bull put spread close order', () => {
      const order = bullPutVerticalClose(longPut, shortPut, 4, 0.5).build();
      expect(order.orderType).toBe('NET_DEBIT');
    });
  });

  describe('bearPutVerticalOpen', () => {
    it('should create a bear put spread order', () => {
      const order = bearPutVerticalOpen(shortPut, longPut, 2, 2.5).build();
      expect(order.orderType).toBe('NET_DEBIT');
    });
  });

  describe('bearPutVerticalClose', () => {
    it('should create a bear put spread close order', () => {
      const order = bearPutVerticalClose(shortPut, longPut, 2, 4.0).build();
      expect(order.orderType).toBe('NET_CREDIT');
    });
  });
});
