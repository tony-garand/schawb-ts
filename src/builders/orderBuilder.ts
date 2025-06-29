import { 
  Order, 
  OrderLegCollection, 
  AssetType, 
  OrderType, 
  Session, 
  Duration, 
  OrderStrategyType, 
  Instruction,
  StopPriceLinkBasis,
  StopPriceLinkType,
  ComplexOrderStrategyType,
  AccountInstrument
} from '../types';

export class OrderBuilder {
  private order: Order;

  constructor() {
    this.order = {
      orderType: 'MARKET',
      session: 'NORMAL',
      duration: 'DAY',
      orderStrategyType: 'SINGLE',
      orderLegCollection: [],
      quantity: 0,
      status: 'NEW',
      accountNumber: 0,
    };
  }

  /**
   * Set basic order properties
   */
  public setOrderType(orderType: OrderType): OrderBuilder {
    this.order.orderType = orderType;
    return this;
  }

  public setSession(session: Session): OrderBuilder {
    this.order.session = session;
    return this;
  }

  public setDuration(duration: Duration): OrderBuilder {
    this.order.duration = duration;
    return this;
  }

  public setOrderStrategyType(strategyType: OrderStrategyType): OrderBuilder {
    this.order.orderStrategyType = strategyType;
    return this;
  }

  public setComplexOrderStrategyType(complexType: ComplexOrderStrategyType): OrderBuilder {
    this.order.complexOrderStrategyType = complexType;
    return this;
  }

  public setPrice(price: number): OrderBuilder {
    this.order.price = price;
    return this;
  }

  public setStopPrice(stopPrice: number): OrderBuilder {
    this.order.stopPrice = stopPrice;
    return this;
  }

  public setStopPriceLinkBasis(basis: StopPriceLinkBasis): OrderBuilder {
    this.order.stopPriceLinkBasis = basis;
    return this;
  }

  public setStopPriceLinkType(linkType: StopPriceLinkType): OrderBuilder {
    this.order.stopPriceLinkType = linkType;
    return this;
  }

  public setStopPriceOffset(offset: number): OrderBuilder {
    this.order.stopPriceOffset = offset;
    return this;
  }

  public setOrderLegCollection(legs: OrderLegCollection[]): OrderBuilder {
    this.order.orderLegCollection = legs;
    return this;
  }

  public setChildOrderStrategies(children: Order[]): OrderBuilder {
    this.order.childOrderStrategies = children;
    return this;
  }

  public setQuantity(quantity: number): OrderBuilder {
    this.order.quantity = quantity;
    return this;
  }

  public setAccountNumber(accountNumber: number): OrderBuilder {
    this.order.accountNumber = accountNumber;
    return this;
  }

  /**
   * Build the final order
   */
  public build(): Order {
    if (!this.order.orderType || !this.order.session || !this.order.duration || 
        !this.order.orderStrategyType || !this.order.orderLegCollection) {
      throw new Error('Missing required order properties');
    }
    return { ...this.order };
  }

  /**
   * Reset the builder
   */
  public reset(): OrderBuilder {
    this.order = {
      orderType: 'MARKET',
      session: 'NORMAL',
      duration: 'DAY',
      orderStrategyType: 'SINGLE',
      orderLegCollection: [],
      quantity: 0,
      status: 'NEW',
      accountNumber: 0,
    };
    return this;
  }

  public addOrderLeg(leg: OrderLegCollection): OrderBuilder {
    this.order.orderLegCollection = this.order.orderLegCollection || [];
    this.order.orderLegCollection.push(leg);
    return this;
  }
}

export class OrderLegBuilder {
  private leg: OrderLegCollection;

  constructor() {
    this.leg = {
      orderLegType: 'EQUITY' as AssetType,
      legId: 0,
      instrument: {} as AccountInstrument,
      instruction: 'BUY' as Instruction,
      quantity: 0,
    };
  }

  public setInstruction(instruction: Instruction): OrderLegBuilder {
    this.leg.instruction = instruction;
    return this;
  }

  public setQuantity(quantity: number): OrderLegBuilder {
    this.leg.quantity = quantity;
    return this;
  }

  public setInstrument(symbol: string, assetType: AssetType = 'EQUITY'): OrderLegBuilder {
    // Create a basic instrument object that matches AccountInstrument structure
    this.leg.instrument = { 
      symbol, 
      assetType: assetType as AssetType,
      description: symbol,
      instrumentId: 0,
      netChange: 0
    } as AccountInstrument;
    this.leg.orderLegType = assetType;
    return this;
  }

  public setLegId(legId: number): OrderLegBuilder {
    this.leg.legId = legId;
    return this;
  }

  public build(): OrderLegCollection {
    return { ...this.leg };
  }

  public reset(): OrderLegBuilder {
    this.leg = {
      orderLegType: 'EQUITY' as AssetType,
      legId: 0,
      instrument: {} as AccountInstrument,
      instruction: 'BUY' as Instruction,
      quantity: 0,
    };
    return this;
  }
}

/**
 * Pre-built order templates based on Schwab documentation examples
 */
export class OrderTemplates {
  /**
   * Buy Market Order - Stock
   * Example: Buy 15 shares of XYZ at the Market good for the Day
   */
  public static buyMarketStock(symbol: string, quantity: number, accountNumber: number): Order {
    return new OrderBuilder()
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  /**
   * Buy Limit Order - Single Option
   * Example: Buy to open 10 contracts of the XYZ March 15, 2024 $50 CALL at a Limit of $6.45 good for the Day
   */
  public static buyLimitOption(
    optionSymbol: string, 
    quantity: number, 
    limitPrice: number
  ): Order {
    return new OrderBuilder()
      .setComplexOrderStrategyType('NONE')
      .setOrderType('LIMIT')
      .setSession('NORMAL')
      .setPrice(limitPrice)
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setQuantity(quantity)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY_TO_OPEN')
          .setQuantity(quantity)
          .setInstrument(optionSymbol, 'OPTION')
          .build()
      )
      .build();
  }

  /**
   * Buy Limit Order - Vertical Call Spread
   * Example: Buy to open 2 contracts of the XYZ March 15, 2024 $45 Put and Sell to open 2 contract of the XYZ March 15, 2024 $43 Put at a LIMIT price of $0.10 good for the Day
   */
  public static buyVerticalSpread(
    longOptionSymbol: string,
    shortOptionSymbol: string,
    quantity: number,
    limitPrice: number
  ): Order {
    return new OrderBuilder()
      .setOrderType('NET_DEBIT')
      .setSession('NORMAL')
      .setPrice(limitPrice)
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setQuantity(quantity)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY_TO_OPEN')
          .setQuantity(quantity)
          .setInstrument(longOptionSymbol, 'OPTION')
          .build()
      )
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL_TO_OPEN')
          .setQuantity(quantity)
          .setInstrument(shortOptionSymbol, 'OPTION')
          .build()
      )
      .build();
  }

  /**
   * Conditional Order - One Triggers Another (1st Trigger Sequence)
   * Example: Buy 10 shares of XYZ at a Limit price of $34.97 good for the Day. If filled, immediately submit an order to Sell 10 shares of XYZ with a Limit price of $42.03 good for the Day.
   */
  public static conditionalOneTriggersAnother(
    symbol: string,
    quantity: number,
    buyPrice: number,
    sellPrice: number
  ): Order {
    return new OrderBuilder()
      .setOrderType('LIMIT')
      .setSession('NORMAL')
      .setPrice(buyPrice)
      .setDuration('DAY')
      .setOrderStrategyType('TRIGGER')
      .setQuantity(quantity)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .setChildOrderStrategies([
        new OrderBuilder()
          .setOrderType('LIMIT')
          .setSession('NORMAL')
          .setPrice(sellPrice)
          .setDuration('DAY')
          .setOrderStrategyType('SINGLE')
          .setQuantity(quantity)
          .addOrderLeg(
            new OrderLegBuilder()
              .setInstruction('SELL')
              .setQuantity(quantity)
              .setInstrument(symbol, 'EQUITY')
              .build()
          )
          .build()
      ])
      .build();
  }

  /**
   * Conditional Order - One Cancels Another (OCO)
   * Example: Sell 2 shares of XYZ at a Limit price of $45.97 and Sell 2 shares of XYZ with a Stop Limit order where the stop price is $37.03 and limit is $37.00. Both orders are sent at the same time. If one order fills, the other order is immediately cancelled.
   */
  public static oneCancelsAnother(
    symbol: string,
    quantity: number,
    limitPrice: number,
    stopPrice: number,
    stopLimitPrice: number
  ): Order {
    return new OrderBuilder()
      .setOrderType('LIMIT')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setOrderStrategyType('OCO')
      .setQuantity(quantity)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .setChildOrderStrategies([
        new OrderBuilder()
          .setOrderType('LIMIT')
          .setSession('NORMAL')
          .setPrice(limitPrice)
          .setDuration('DAY')
          .setOrderStrategyType('SINGLE')
          .setQuantity(quantity)
          .addOrderLeg(
            new OrderLegBuilder()
              .setInstruction('SELL')
              .setQuantity(quantity)
              .setInstrument(symbol, 'EQUITY')
              .build()
          )
          .build(),
        new OrderBuilder()
          .setOrderType('STOP_LIMIT')
          .setSession('NORMAL')
          .setPrice(stopLimitPrice)
          .setStopPrice(stopPrice)
          .setDuration('DAY')
          .setOrderStrategyType('SINGLE')
          .setQuantity(quantity)
          .addOrderLeg(
            new OrderLegBuilder()
              .setInstruction('SELL')
              .setQuantity(quantity)
              .setInstrument(symbol, 'EQUITY')
              .build()
          )
          .build()
      ])
      .build();
  }

  /**
   * Sell Trailing Stop - Stock
   * Example: Sell 10 shares of XYZ with a Trailing Stop where the trail is a -$10 offset from the time the order is submitted.
   */
  public static sellTrailingStop(
    symbol: string,
    quantity: number,
    stopPriceOffset: number
  ): Order {
    return new OrderBuilder()
      .setComplexOrderStrategyType('NONE')
      .setOrderType('TRAILING_STOP')
      .setSession('NORMAL')
      .setStopPriceLinkBasis('BID')
      .setStopPriceLinkType('VALUE')
      .setStopPriceOffset(stopPriceOffset)
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setQuantity(quantity)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  /**
   * Create option symbol from components
   * Format: Underlying Symbol (6 characters including spaces) | Expiration (6 characters) | Call/Put (1 character) | Strike Price (5+3=8 characters)
   * Example: XYZ 210115C00050000
   */
  public static createOptionSymbol(
    underlying: string,
    expiration: string, // YYMMDD format
    optionType: 'C' | 'P',
    strikePrice: number
  ): string {
    // Pad underlying to 6 characters
    const paddedUnderlying = underlying.padEnd(6, ' ');
    
    // Format strike price as 8 characters (5 digits + 3 decimal places)
    const strikeFormatted = Math.round(strikePrice * 1000).toString().padStart(8, '0');
    
    return `${paddedUnderlying}${expiration}${optionType}${strikeFormatted}`;
  }

  public static sellMarketStock(symbol: string, quantity: number, accountNumber: number): Order {
    return new OrderBuilder()
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static buyLimitStock(symbol: string, quantity: number, price: number, accountNumber: number): Order {
    return new OrderBuilder()
      .setOrderType('LIMIT')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setPrice(price)
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static sellLimitStock(symbol: string, quantity: number, price: number, accountNumber: number): Order {
    return new OrderBuilder()
      .setOrderType('LIMIT')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setPrice(price)
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static buyStopStock(symbol: string, quantity: number, stopPrice: number, accountNumber: number): Order {
    return new OrderBuilder()
      .setOrderType('STOP')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setStopPrice(stopPrice)
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static sellStopStock(symbol: string, quantity: number, stopPrice: number, accountNumber: number): Order {
    return new OrderBuilder()
      .setOrderType('STOP')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setStopPrice(stopPrice)
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static buyStopLimitStock(
    symbol: string,
    quantity: number,
    stopPrice: number,
    limitPrice: number,
    accountNumber: number
  ): Order {
    return new OrderBuilder()
      .setOrderType('STOP_LIMIT')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setStopPrice(stopPrice)
      .setPrice(limitPrice)
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static sellStopLimitStock(
    symbol: string,
    quantity: number,
    stopPrice: number,
    limitPrice: number,
    accountNumber: number
  ): Order {
    return new OrderBuilder()
      .setOrderType('STOP_LIMIT')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setStopPrice(stopPrice)
      .setPrice(limitPrice)
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(quantity)
          .setInstrument(symbol, 'EQUITY')
          .build()
      )
      .build();
  }

  public static buyOption(
    symbol: string,
    quantity: number,
    accountNumber: number,
    instruction: 'BUY_TO_OPEN' | 'BUY_TO_CLOSE' = 'BUY_TO_OPEN'
  ): Order {
    return new OrderBuilder()
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction(instruction)
          .setQuantity(quantity)
          .setInstrument(symbol, 'OPTION')
          .build()
      )
      .build();
  }

  public static sellOption(
    symbol: string,
    quantity: number,
    accountNumber: number,
    instruction: 'SELL_TO_OPEN' | 'SELL_TO_CLOSE' = 'SELL_TO_OPEN'
  ): Order {
    return new OrderBuilder()
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setQuantity(quantity)
      .setAccountNumber(accountNumber)
      .addOrderLeg(
        new OrderLegBuilder()
          .setInstruction(instruction)
          .setQuantity(quantity)
          .setInstrument(symbol, 'OPTION')
          .build()
      )
      .build();
  }
} 