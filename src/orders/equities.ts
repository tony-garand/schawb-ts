/**
 * Equity order templates
 *
 * This module provides pre-built order templates for common equity trades.
 * All templates return OrderBuilder objects for easy customization.
 */

import { OrderBuilder, OrderLegBuilder } from '../builders/orderBuilder';

// ==================== Market Orders ====================

/**
 * Buy stock at market price
 */
export function equityBuyMarket(symbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Sell stock at market price
 */
export function equitySellMarket(symbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

// ==================== Limit Orders ====================

/**
 * Buy stock at limit price
 */
export function equityBuyLimit(symbol: string, quantity: number, limitPrice: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Sell stock at limit price
 */
export function equitySellLimit(
  symbol: string,
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
        .setInstruction('SELL')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

// ==================== Short Selling ====================

/**
 * Sell stock short at market price
 *
 * Short selling is selling borrowed shares with the intent to buy them back later
 * at a lower price. Requires a margin account and shares available to borrow.
 */
export function equitySellShortMarket(symbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL_SHORT')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Sell stock short at limit price
 */
export function equitySellShortLimit(
  symbol: string,
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
        .setInstruction('SELL_SHORT')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

// ==================== Buy to Cover ====================

/**
 * Buy to cover short position at market price
 *
 * Closes a short position by buying back the borrowed shares.
 */
export function equityBuyToCoverMarket(symbol: string, quantity: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY_TO_COVER')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Buy to cover short position at limit price
 */
export function equityBuyToCoverLimit(
  symbol: string,
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
        .setInstruction('BUY_TO_COVER')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

// ==================== Stop Orders ====================

/**
 * Buy stock with stop order
 */
export function equityBuyStop(symbol: string, quantity: number, stopPrice: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('STOP')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setStopPrice(stopPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Sell stock with stop order (stop loss)
 */
export function equitySellStop(symbol: string, quantity: number, stopPrice: number): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('STOP')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setStopPrice(stopPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

// ==================== Stop Limit Orders ====================

/**
 * Buy stock with stop limit order
 */
export function equityBuyStopLimit(
  symbol: string,
  quantity: number,
  stopPrice: number,
  limitPrice: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('STOP_LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setStopPrice(stopPrice)
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('BUY')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Sell stock with stop limit order
 */
export function equitySellStopLimit(
  symbol: string,
  quantity: number,
  stopPrice: number,
  limitPrice: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('STOP_LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setStopPrice(stopPrice)
    .setPrice(limitPrice)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

// ==================== Trailing Stop Orders ====================

/**
 * Sell stock with trailing stop order
 *
 * @param symbol Stock symbol
 * @param quantity Number of shares
 * @param trailOffset The trailing amount in dollars
 */
export function equitySellTrailingStop(
  symbol: string,
  quantity: number,
  trailOffset: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('TRAILING_STOP')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setStopPriceLinkBasis('BID')
    .setStopPriceLinkType('VALUE')
    .setStopPriceOffset(trailOffset)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}

/**
 * Sell stock with trailing stop order using percentage
 *
 * @param symbol Stock symbol
 * @param quantity Number of shares
 * @param trailPercent The trailing percentage (e.g., 5 for 5%)
 */
export function equitySellTrailingStopPercent(
  symbol: string,
  quantity: number,
  trailPercent: number
): OrderBuilder {
  return new OrderBuilder()
    .setOrderType('TRAILING_STOP')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setStopPriceLinkBasis('BID')
    .setStopPriceLinkType('PERCENT')
    .setStopPriceOffset(trailPercent)
    .setQuantity(quantity)
    .addOrderLeg(
      new OrderLegBuilder()
        .setInstruction('SELL')
        .setQuantity(quantity)
        .setInstrument(symbol, 'EQUITY')
        .build()
    );
}
