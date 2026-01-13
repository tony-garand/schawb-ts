import { OrderBuilder, OrderLegBuilder, OrderTemplates } from '../src/builders/orderBuilder';
import { Order, OrderLegCollection } from '../src/types';

describe('OrderBuilder', () => {
  let builder: OrderBuilder;

  beforeEach(() => {
    builder = new OrderBuilder();
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const order = builder
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.orderType).toBe('MARKET');
      expect(order.session).toBe('NORMAL');
      expect(order.duration).toBe('DAY');
      expect(order.orderStrategyType).toBe('SINGLE');
      expect(order.quantity).toBe(0);
      expect(order.status).toBe('NEW');
    });
  });

  describe('fluent API', () => {
    it('should allow method chaining', () => {
      const result = builder
        .setOrderType('LIMIT')
        .setSession('NORMAL')
        .setDuration('DAY')
        .setPrice(100.50)
        .setQuantity(10);

      expect(result).toBe(builder);
    });
  });

  describe('setOrderType', () => {
    it('should set order type', () => {
      const order = builder
        .setOrderType('LIMIT')
        .setPrice(100)
        .addOrderLeg(new OrderLegBuilder().setInstrument('AAPL', 'EQUITY').setQuantity(10).build())
        .build();

      expect(order.orderType).toBe('LIMIT');
    });

    it('should support different order types', () => {
      const types: Array<'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'TRAILING_STOP'> = [
        'MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP'
      ];

      types.forEach(type => {
        const order = builder
          .reset()
          .setOrderType(type)
          .setPrice(100)
          .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
          .build();

        expect(order.orderType).toBe(type);
      });
    });
  });

  describe('setSession', () => {
    it('should set session', () => {
      const order = builder
        .setSession('SEAMLESS')
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.session).toBe('SEAMLESS');
    });
  });

  describe('setDuration', () => {
    it('should set duration', () => {
      const order = builder
        .setDuration('GOOD_TILL_CANCEL')
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.duration).toBe('GOOD_TILL_CANCEL');
    });
  });

  describe('setPrice', () => {
    it('should set price', () => {
      const order = builder
        .setOrderType('LIMIT')
        .setPrice(125.75)
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.price).toBe(125.75);
    });
  });

  describe('setStopPrice', () => {
    it('should set stop price', () => {
      const order = builder
        .setOrderType('STOP')
        .setStopPrice(95.50)
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.stopPrice).toBe(95.50);
    });
  });

  describe('setOrderLegCollection', () => {
    it('should set order legs', () => {
      const legs: OrderLegCollection[] = [
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(10)
          .setInstrument('AAPL', 'EQUITY')
          .build()
      ];

      const order = builder
        .setOrderLegCollection(legs)
        .build();

      expect(order.orderLegCollection).toEqual(legs);
    });
  });

  describe('addOrderLeg', () => {
    it('should add single leg to collection', () => {
      const leg = new OrderLegBuilder()
        .setInstruction('BUY')
        .setQuantity(10)
        .setInstrument('AAPL', 'EQUITY')
        .build();

      const order = builder
        .addOrderLeg(leg)
        .build();

      expect(order.orderLegCollection).toHaveLength(1);
      expect(order.orderLegCollection[0]).toEqual(leg);
    });

    it('should add multiple legs to collection', () => {
      const leg1 = new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(5)
        .setInstrument('AAPL  240315C00150000', 'OPTION')
        .build();

      const leg2 = new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(5)
        .setInstrument('AAPL  240315C00155000', 'OPTION')
        .build();

      const order = builder
        .addOrderLeg(leg1)
        .addOrderLeg(leg2)
        .build();

      expect(order.orderLegCollection).toHaveLength(2);
      expect(order.orderLegCollection[0]).toEqual(leg1);
      expect(order.orderLegCollection[1]).toEqual(leg2);
    });
  });

  describe('setQuantity', () => {
    it('should set quantity', () => {
      const order = builder
        .setQuantity(25)
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(25).build())
        .build();

      expect(order.quantity).toBe(25);
    });
  });

  describe('setAccountNumber', () => {
    it('should set account number', () => {
      const order = builder
        .setAccountNumber(123456789)
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.accountNumber).toBe(123456789);
    });
  });

  describe('setComplexOrderStrategyType', () => {
    it('should set complex order strategy type', () => {
      const order = builder
        .setComplexOrderStrategyType('VERTICAL')
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'OPTION').setQuantity(1).build())
        .build();

      expect(order.complexOrderStrategyType).toBe('VERTICAL');
    });
  });

  describe('setChildOrderStrategies', () => {
    it('should set child order strategies', () => {
      const childOrder = new OrderBuilder()
        .setOrderType('LIMIT')
        .setPrice(150)
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(10).build())
        .build();

      const order = builder
        .setOrderStrategyType('TRIGGER')
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(10).build())
        .setChildOrderStrategies([childOrder])
        .build();

      expect(order.childOrderStrategies).toHaveLength(1);
      expect(order.childOrderStrategies![0]).toEqual(childOrder);
    });
  });

  describe('build', () => {
    it('should build valid order with required fields', () => {
      const order = builder
        .setOrderType('MARKET')
        .setSession('NORMAL')
        .setDuration('DAY')
        .addOrderLeg(new OrderLegBuilder().setInstrument('AAPL', 'EQUITY').setQuantity(10).build())
        .build();

      expect(order).toBeDefined();
      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection).toHaveLength(1);
    });

    it('should throw error when missing required fields', () => {
      const invalidBuilder = new OrderBuilder();
      // Set orderType to null to trigger validation error
      (invalidBuilder as any).order.orderType = null;

      expect(() => invalidBuilder.build()).toThrow('Missing required order properties');
    });

    it('should return a copy of the order', () => {
      const order1 = builder
        .setQuantity(10)
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(10).build())
        .build();

      const order2 = builder.build();

      expect(order1).not.toBe(order2);
      expect(order1).toEqual(order2);
    });
  });

  describe('reset', () => {
    it('should reset to default values', () => {
      builder
        .setOrderType('LIMIT')
        .setPrice(100)
        .setQuantity(50)
        .addOrderLeg(new OrderLegBuilder().setInstrument('AAPL', 'EQUITY').setQuantity(50).build());

      builder.reset();

      const order = builder
        .addOrderLeg(new OrderLegBuilder().setInstrument('TEST', 'EQUITY').setQuantity(1).build())
        .build();

      expect(order.orderType).toBe('MARKET');
      expect(order.quantity).toBe(0);
      expect(order.price).toBeUndefined();
    });
  });
});

describe('OrderLegBuilder', () => {
  let legBuilder: OrderLegBuilder;

  beforeEach(() => {
    legBuilder = new OrderLegBuilder();
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const leg = legBuilder.setInstrument('TEST', 'EQUITY').build();

      expect(leg.orderLegType).toBe('EQUITY');
      expect(leg.instruction).toBe('BUY');
      expect(leg.quantity).toBe(0);
      expect(leg.legId).toBe(0);
    });
  });

  describe('setInstruction', () => {
    it('should set instruction', () => {
      const leg = legBuilder
        .setInstruction('SELL')
        .setInstrument('AAPL', 'EQUITY')
        .build();

      expect(leg.instruction).toBe('SELL');
    });

    it('should support option instructions', () => {
      const instructions: Array<'BUY_TO_OPEN' | 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_TO_CLOSE'> = [
        'BUY_TO_OPEN',
        'BUY_TO_CLOSE',
        'SELL_TO_OPEN',
        'SELL_TO_CLOSE'
      ];

      instructions.forEach(instruction => {
        const leg = legBuilder
          .reset()
          .setInstruction(instruction)
          .setInstrument('TEST', 'OPTION')
          .build();

        expect(leg.instruction).toBe(instruction);
      });
    });
  });

  describe('setQuantity', () => {
    it('should set quantity', () => {
      const leg = legBuilder
        .setQuantity(100)
        .setInstrument('AAPL', 'EQUITY')
        .build();

      expect(leg.quantity).toBe(100);
    });
  });

  describe('setInstrument', () => {
    it('should set equity instrument', () => {
      const leg = legBuilder
        .setInstrument('AAPL', 'EQUITY')
        .build();

      expect(leg.instrument.symbol).toBe('AAPL');
      expect(leg.instrument.assetType).toBe('EQUITY');
      expect(leg.orderLegType).toBe('EQUITY');
    });

    it('should set option instrument', () => {
      const optionSymbol = 'AAPL  240315C00150000';
      const leg = legBuilder
        .setInstrument(optionSymbol, 'OPTION')
        .build();

      expect(leg.instrument.symbol).toBe(optionSymbol);
      expect(leg.instrument.assetType).toBe('OPTION');
      expect(leg.orderLegType).toBe('OPTION');
    });

    it('should default to EQUITY asset type', () => {
      const leg = legBuilder
        .setInstrument('MSFT')
        .build();

      expect(leg.instrument.assetType).toBe('EQUITY');
    });
  });

  describe('setLegId', () => {
    it('should set leg ID', () => {
      const leg = legBuilder
        .setLegId(1)
        .setInstrument('TEST', 'EQUITY')
        .build();

      expect(leg.legId).toBe(1);
    });
  });

  describe('build', () => {
    it('should build valid order leg', () => {
      const leg = legBuilder
        .setInstruction('BUY')
        .setQuantity(50)
        .setInstrument('GOOGL', 'EQUITY')
        .setLegId(1)
        .build();

      expect(leg).toBeDefined();
      expect(leg.instruction).toBe('BUY');
      expect(leg.quantity).toBe(50);
      expect(leg.instrument.symbol).toBe('GOOGL');
    });

    it('should return a copy of the leg', () => {
      legBuilder.setInstrument('TEST', 'EQUITY').setQuantity(10);

      const leg1 = legBuilder.build();
      const leg2 = legBuilder.build();

      expect(leg1).not.toBe(leg2);
      expect(leg1).toEqual(leg2);
    });
  });

  describe('reset', () => {
    it('should reset to default values', () => {
      legBuilder
        .setInstruction('SELL')
        .setQuantity(100)
        .setInstrument('AAPL', 'EQUITY')
        .setLegId(5);

      legBuilder.reset();

      const leg = legBuilder.setInstrument('TEST', 'EQUITY').build();

      expect(leg.instruction).toBe('BUY');
      expect(leg.quantity).toBe(0);
      expect(leg.legId).toBe(0);
    });
  });
});

describe('OrderTemplates', () => {
  const accountNumber = 123456789;

  describe('buyMarketStock', () => {
    it('should create market buy order for stock', () => {
      const order = OrderTemplates.buyMarketStock('AAPL', 15, accountNumber);

      expect(order.orderType).toBe('MARKET');
      expect(order.session).toBe('NORMAL');
      expect(order.duration).toBe('DAY');
      expect(order.quantity).toBe(15);
      expect(order.accountNumber).toBe(accountNumber);
      expect(order.orderLegCollection).toHaveLength(1);
      expect(order.orderLegCollection[0].instruction).toBe('BUY');
      expect(order.orderLegCollection[0].quantity).toBe(15);
      expect(order.orderLegCollection[0].instrument.symbol).toBe('AAPL');
    });
  });

  describe('sellMarketStock', () => {
    it('should create market sell order for stock', () => {
      const order = OrderTemplates.sellMarketStock('TSLA', 10, accountNumber);

      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection[0].instruction).toBe('SELL');
      expect(order.orderLegCollection[0].quantity).toBe(10);
      expect(order.orderLegCollection[0].instrument.symbol).toBe('TSLA');
    });
  });

  describe('buyLimitStock', () => {
    it('should create limit buy order for stock', () => {
      const order = OrderTemplates.buyLimitStock('MSFT', 20, 250.50, accountNumber);

      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(250.50);
      expect(order.session).toBe('NORMAL');
      expect(order.duration).toBe('DAY');
      expect(order.orderLegCollection[0].instruction).toBe('BUY');
      expect(order.orderLegCollection[0].quantity).toBe(20);
    });
  });

  describe('sellLimitStock', () => {
    it('should create limit sell order for stock', () => {
      const order = OrderTemplates.sellLimitStock('GOOGL', 5, 2800.00, accountNumber);

      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(2800.00);
      expect(order.orderLegCollection[0].instruction).toBe('SELL');
    });
  });

  describe('buyStopStock', () => {
    it('should create stop buy order for stock', () => {
      const order = OrderTemplates.buyStopStock('NVDA', 10, 500.00, accountNumber);

      expect(order.orderType).toBe('STOP');
      expect(order.stopPrice).toBe(500.00);
      expect(order.orderLegCollection[0].instruction).toBe('BUY');
    });
  });

  describe('sellStopStock', () => {
    it('should create stop sell order for stock', () => {
      const order = OrderTemplates.sellStopStock('AMD', 25, 95.00, accountNumber);

      expect(order.orderType).toBe('STOP');
      expect(order.stopPrice).toBe(95.00);
      expect(order.orderLegCollection[0].instruction).toBe('SELL');
    });
  });

  describe('buyStopLimitStock', () => {
    it('should create stop-limit buy order for stock', () => {
      const order = OrderTemplates.buyStopLimitStock('META', 15, 350.00, 348.00, accountNumber);

      expect(order.orderType).toBe('STOP_LIMIT');
      expect(order.stopPrice).toBe(350.00);
      expect(order.price).toBe(348.00);
      expect(order.orderLegCollection[0].instruction).toBe('BUY');
    });
  });

  describe('sellStopLimitStock', () => {
    it('should create stop-limit sell order for stock', () => {
      const order = OrderTemplates.sellStopLimitStock('NFLX', 10, 400.00, 398.00, accountNumber);

      expect(order.orderType).toBe('STOP_LIMIT');
      expect(order.stopPrice).toBe(400.00);
      expect(order.price).toBe(398.00);
      expect(order.orderLegCollection[0].instruction).toBe('SELL');
    });
  });

  describe('buyLimitOption', () => {
    it('should create limit buy to open order for option', () => {
      const optionSymbol = 'XYZ   240315C00050000';
      const order = OrderTemplates.buyLimitOption(optionSymbol, 10, 6.45);

      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(6.45);
      expect(order.complexOrderStrategyType).toBe('NONE');
      expect(order.orderStrategyType).toBe('SINGLE');
      expect(order.quantity).toBe(10);
      expect(order.orderLegCollection).toHaveLength(1);
      expect(order.orderLegCollection[0].instruction).toBe('BUY_TO_OPEN');
      expect(order.orderLegCollection[0].instrument.assetType).toBe('OPTION');
    });
  });

  describe('buyOption', () => {
    it('should create market buy to open order for option', () => {
      const order = OrderTemplates.buyOption('AAPL  240315C00150000', 5, accountNumber);

      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection[0].instruction).toBe('BUY_TO_OPEN');
      expect(order.orderLegCollection[0].instrument.assetType).toBe('OPTION');
    });

    it('should support custom instruction', () => {
      const order = OrderTemplates.buyOption('AAPL  240315C00150000', 5, accountNumber, 'BUY_TO_CLOSE');

      expect(order.orderLegCollection[0].instruction).toBe('BUY_TO_CLOSE');
    });
  });

  describe('sellOption', () => {
    it('should create market sell to open order for option', () => {
      const order = OrderTemplates.sellOption('TSLA  240315P00200000', 3, accountNumber);

      expect(order.orderType).toBe('MARKET');
      expect(order.orderLegCollection[0].instruction).toBe('SELL_TO_OPEN');
      expect(order.orderLegCollection[0].instrument.assetType).toBe('OPTION');
    });

    it('should support custom instruction', () => {
      const order = OrderTemplates.sellOption('TSLA  240315P00200000', 3, accountNumber, 'SELL_TO_CLOSE');

      expect(order.orderLegCollection[0].instruction).toBe('SELL_TO_CLOSE');
    });
  });

  describe('buyVerticalSpread', () => {
    it('should create vertical spread order', () => {
      const longOption = 'XYZ   240315P00045000';
      const shortOption = 'XYZ   240315P00043000';
      const order = OrderTemplates.buyVerticalSpread(longOption, shortOption, 2, 0.10);

      expect(order.orderType).toBe('NET_DEBIT');
      expect(order.price).toBe(0.10);
      expect(order.quantity).toBe(2);
      expect(order.orderLegCollection).toHaveLength(2);

      expect(order.orderLegCollection[0].instruction).toBe('BUY_TO_OPEN');
      expect(order.orderLegCollection[0].instrument.symbol).toBe(longOption);

      expect(order.orderLegCollection[1].instruction).toBe('SELL_TO_OPEN');
      expect(order.orderLegCollection[1].instrument.symbol).toBe(shortOption);
    });
  });

  describe('conditionalOneTriggersAnother', () => {
    it('should create one-triggers-another order', () => {
      const order = OrderTemplates.conditionalOneTriggersAnother('XYZ', 10, 34.97, 42.03);

      expect(order.orderStrategyType).toBe('TRIGGER');
      expect(order.orderType).toBe('LIMIT');
      expect(order.price).toBe(34.97);
      expect(order.quantity).toBe(10);
      expect(order.orderLegCollection[0].instruction).toBe('BUY');

      expect(order.childOrderStrategies).toHaveLength(1);
      const childOrder = order.childOrderStrategies![0];
      expect(childOrder.orderType).toBe('LIMIT');
      expect(childOrder.price).toBe(42.03);
      expect(childOrder.orderLegCollection[0].instruction).toBe('SELL');
    });
  });

  describe('oneCancelsAnother', () => {
    it('should create OCO order with limit and stop-limit legs', () => {
      const order = OrderTemplates.oneCancelsAnother('XYZ', 2, 45.97, 37.03, 37.00);

      expect(order.orderStrategyType).toBe('OCO');
      expect(order.duration).toBe('DAY');
      expect(order.quantity).toBe(2);

      expect(order.childOrderStrategies).toHaveLength(2);

      const limitOrder = order.childOrderStrategies![0];
      expect(limitOrder.orderType).toBe('LIMIT');
      expect(limitOrder.price).toBe(45.97);
      expect(limitOrder.orderLegCollection[0].instruction).toBe('SELL');

      const stopLimitOrder = order.childOrderStrategies![1];
      expect(stopLimitOrder.orderType).toBe('STOP_LIMIT');
      expect(stopLimitOrder.stopPrice).toBe(37.03);
      expect(stopLimitOrder.price).toBe(37.00);
      expect(stopLimitOrder.orderLegCollection[0].instruction).toBe('SELL');
    });
  });

  describe('sellTrailingStop', () => {
    it('should create trailing stop order', () => {
      const order = OrderTemplates.sellTrailingStop('XYZ', 10, -10);

      expect(order.orderType).toBe('TRAILING_STOP');
      expect(order.complexOrderStrategyType).toBe('NONE');
      expect(order.stopPriceLinkBasis).toBe('BID');
      expect(order.stopPriceLinkType).toBe('VALUE');
      expect(order.stopPriceOffset).toBe(-10);
      expect(order.quantity).toBe(10);
      expect(order.orderLegCollection[0].instruction).toBe('SELL');
    });
  });

  describe('createOptionSymbol', () => {
    it('should format option symbol correctly', () => {
      const symbol = OrderTemplates.createOptionSymbol('XYZ', '210115', 'C', 50);

      expect(symbol).toBe('XYZ   210115C00050000');
    });

    it('should pad underlying symbol to 6 characters', () => {
      const symbol = OrderTemplates.createOptionSymbol('A', '210115', 'P', 25);

      expect(symbol).toBe('A     210115P00025000');
      expect(symbol.length).toBe(21);
    });

    it('should format strike price with decimals', () => {
      const symbol = OrderTemplates.createOptionSymbol('AAPL', '240315', 'C', 150.50);

      expect(symbol).toBe('AAPL  240315C00150500');
    });

    it('should handle put options', () => {
      const symbol = OrderTemplates.createOptionSymbol('TSLA', '240420', 'P', 200);

      expect(symbol).toBe('TSLA  240420P00200000');
    });

    it('should handle high strike prices', () => {
      const symbol = OrderTemplates.createOptionSymbol('GOOGL', '241220', 'C', 2500);

      expect(symbol).toBe('GOOGL 241220C02500000');
    });

    it('should handle fractional strike prices', () => {
      const symbol = OrderTemplates.createOptionSymbol('SPY', '240315', 'P', 425.75);

      expect(symbol).toBe('SPY   240315P00425750');
    });
  });
});
