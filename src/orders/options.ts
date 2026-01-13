/**
 * Options order utilities and templates
 *
 * This module provides utilities for building options orders including:
 * - OptionSymbol builder for creating OCC-compliant option symbols
 * - Single option order templates (buy/sell to open/close)
 * - Vertical spread templates (bull/bear call/put)
 */

import { OrderBuilder, OrderLegBuilder } from '../builders/orderBuilder';

/**
 * Option symbol builder class
 *
 * Creates OCC-compliant option symbols from components.
 *
 * Option symbol format: UNDERLYING + YYMMDD + C/P + STRIKE
 * Example: AAPL  241220C00150000
 *   - AAPL (padded to 6 chars): "AAPL  "
 *   - Expiration (YYMMDD): "241220"
 *   - Type (C=Call, P=Put): "C"
 *   - Strike (5 integer + 3 decimal, no decimal point): "00150000"
 *
 * @example
 * const symbol = new OptionSymbol('TSLA', new Date(2024, 10, 20), 'P', 360).build();
 * // Returns: "TSLA  241120P00360000"
 */
export class OptionSymbol {
  private underlying: string;
  private expirationDate: Date;
  private contractType: 'C' | 'P';
  private strikePrice: number;

  /**
   * Create an option symbol builder
   *
   * @param underlying The underlying stock symbol (e.g., 'AAPL', 'TSLA')
   * @param expirationDate The option expiration date
   * @param contractType 'C' for Call, 'P' for Put
   * @param strikePrice The strike price (e.g., 150.00)
   */
  constructor(
    underlying: string,
    expirationDate: Date,
    contractType: 'C' | 'P',
    strikePrice: number | string
  ) {
    this.underlying = underlying.toUpperCase();
    this.expirationDate = expirationDate;
    this.contractType = contractType;
    this.strikePrice = typeof strikePrice === 'string' ? parseFloat(strikePrice) : strikePrice;
  }

  /**
   * Build the OCC-compliant option symbol
   *
   * @returns The formatted option symbol string
   */
  build(): string {
    // Pad underlying to 6 characters
    const paddedUnderlying = this.underlying.padEnd(6, ' ');

    // Format expiration as YYMMDD
    const year = this.expirationDate.getFullYear().toString().slice(-2);
    const month = (this.expirationDate.getMonth() + 1).toString().padStart(2, '0');
    const day = this.expirationDate.getDate().toString().padStart(2, '0');
    const expirationStr = `${year}${month}${day}`;

    // Format strike price as 8 digits (5 integer + 3 decimal, no decimal point)
    const strikeInt = Math.round(this.strikePrice * 1000);
    const strikeStr = strikeInt.toString().padStart(8, '0');

    return `${paddedUnderlying}${expirationStr}${this.contractType}${strikeStr}`;
  }

  /**
   * Parse an option symbol into its components
   *
   * @param symbol The OCC option symbol to parse
   * @returns Object with underlying, expiration, type, and strike
   */
  static parse(symbol: string): {
    underlying: string;
    expirationDate: Date;
    contractType: 'C' | 'P';
    strikePrice: number;
  } {
    const underlying = symbol.slice(0, 6).trim();
    const year = parseInt('20' + symbol.slice(6, 8), 10);
    const month = parseInt(symbol.slice(8, 10), 10) - 1;
    const day = parseInt(symbol.slice(10, 12), 10);
    const contractType = symbol.slice(12, 13) as 'C' | 'P';
    const strikePrice = parseInt(symbol.slice(13), 10) / 1000;

    return {
      underlying,
      expirationDate: new Date(year, month, day),
      contractType,
      strikePrice,
    };
  }
}

// ==================== Single Option Templates ====================

/**
 * Buy to open a single option at market price
 */
export function optionBuyToOpenMarket(optionSymbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Buy to open a single option at limit price
 */
export function optionBuyToOpenLimit(
  optionSymbol: string,
  quantity: number,
  limitPrice: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Sell to open a single option at market price
 */
export function optionSellToOpenMarket(optionSymbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Sell to open a single option at limit price
 */
export function optionSellToOpenLimit(
  optionSymbol: string,
  quantity: number,
  limitPrice: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Buy to close a single option at market price
 */
export function optionBuyToCloseMarket(optionSymbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Buy to close a single option at limit price
 */
export function optionBuyToCloseLimit(
  optionSymbol: string,
  quantity: number,
  limitPrice: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Sell to close a single option at market price
 */
export function optionSellToCloseMarket(optionSymbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

/**
 * Sell to close a single option at limit price
 */
export function optionSellToCloseLimit(
  optionSymbol: string,
  quantity: number,
  limitPrice: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    );
}

// ==================== Vertical Spread Templates ====================

/**
 * Open a bull call vertical spread
 *
 * A bull call spread involves:
 * - Buy a call at the lower strike (long call)
 * - Sell a call at the higher strike (short call)
 *
 * Net debit strategy - max profit is limited, max loss is limited to premium paid
 *
 * @param longCallSymbol The lower strike call option symbol (buy)
 * @param shortCallSymbol The higher strike call option symbol (sell)
 * @param quantity Number of contracts
 * @param netDebit The net debit (premium) to pay
 */
export function bullCallVerticalOpen(
  longCallSymbol: string,
  shortCallSymbol: string,
  quantity: number,
  netDebit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_DEBIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netDebit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(longCallSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(shortCallSymbol, 'OPTION')
        .build()
    );
}

/**
 * Close a bull call vertical spread
 */
export function bullCallVerticalClose(
  longCallSymbol: string,
  shortCallSymbol: string,
  quantity: number,
  netCredit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_CREDIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netCredit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(longCallSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(shortCallSymbol, 'OPTION')
        .build()
    );
}

/**
 * Open a bear call vertical spread
 *
 * A bear call spread involves:
 * - Sell a call at the lower strike (short call)
 * - Buy a call at the higher strike (long call)
 *
 * Net credit strategy - max profit is limited to premium received
 */
export function bearCallVerticalOpen(
  shortCallSymbol: string,
  longCallSymbol: string,
  quantity: number,
  netCredit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_CREDIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netCredit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(shortCallSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(longCallSymbol, 'OPTION')
        .build()
    );
}

/**
 * Close a bear call vertical spread
 */
export function bearCallVerticalClose(
  shortCallSymbol: string,
  longCallSymbol: string,
  quantity: number,
  netDebit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_DEBIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netDebit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(shortCallSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(longCallSymbol, 'OPTION')
        .build()
    );
}

/**
 * Open a bull put vertical spread
 *
 * A bull put spread involves:
 * - Sell a put at the higher strike (short put)
 * - Buy a put at the lower strike (long put)
 *
 * Net credit strategy - max profit is limited to premium received
 */
export function bullPutVerticalOpen(
  longPutSymbol: string,
  shortPutSymbol: string,
  quantity: number,
  netCredit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_CREDIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netCredit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(longPutSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(shortPutSymbol, 'OPTION')
        .build()
    );
}

/**
 * Close a bull put vertical spread
 */
export function bullPutVerticalClose(
  longPutSymbol: string,
  shortPutSymbol: string,
  quantity: number,
  netDebit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_DEBIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netDebit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(longPutSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(shortPutSymbol, 'OPTION')
        .build()
    );
}

/**
 * Open a bear put vertical spread
 *
 * A bear put spread involves:
 * - Buy a put at the higher strike (long put)
 * - Sell a put at the lower strike (short put)
 *
 * Net debit strategy - max profit is limited
 */
export function bearPutVerticalOpen(
  longPutSymbol: string,
  shortPutSymbol: string,
  quantity: number,
  netDebit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_DEBIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netDebit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(longPutSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(quantity)
        .setInstrument(shortPutSymbol, 'OPTION')
        .build()
    );
}

/**
 * Close a bear put vertical spread
 */
export function bearPutVerticalClose(
  longPutSymbol: string,
  shortPutSymbol: string,
  quantity: number,
  netCredit: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('NET_CREDIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(netCredit)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(longPutSymbol, 'OPTION')
        .build()
    )
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_CLOSE')
        .setQuantity(quantity)
        .setInstrument(shortPutSymbol, 'OPTION')
        .build()
    );
}
