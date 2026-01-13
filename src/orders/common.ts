/**
 * Common order utilities and composite order helpers
 *
 * This module provides utilities for creating complex composite orders:
 * - One Cancels Other (OCO)
 * - First Triggers Second (OTO)
 */

import type { Order, Session as SessionType, Duration as DurationType } from '../types';
import { OrderBuilder } from '../builders/orderBuilder';

/**
 * Duration enum values for convenience
 */
export const DurationValue = {
  DAY: 'DAY' as DurationType,
  GOOD_TILL_CANCEL: 'GOOD_TILL_CANCEL' as DurationType,
  FILL_OR_KILL: 'FILL_OR_KILL' as DurationType,
  IMMEDIATE_OR_CANCEL: 'IMMEDIATE_OR_CANCEL' as DurationType,
  END_OF_WEEK: 'END_OF_WEEK' as DurationType,
  END_OF_MONTH: 'END_OF_MONTH' as DurationType,
  NEXT_END_OF_MONTH: 'NEXT_END_OF_MONTH' as DurationType,
} as const;

/**
 * Session enum values for convenience
 */
export const SessionValue = {
  NORMAL: 'NORMAL' as SessionType,
  AM: 'AM' as SessionType,
  PM: 'PM' as SessionType,
  SEAMLESS: 'SEAMLESS' as SessionType,
} as const;

/**
 * Order type enum values for convenience
 */
export const OrderTypeValue = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT',
  STOP: 'STOP',
  STOP_LIMIT: 'STOP_LIMIT',
  TRAILING_STOP: 'TRAILING_STOP',
  TRAILING_STOP_LIMIT: 'TRAILING_STOP_LIMIT',
  NET_DEBIT: 'NET_DEBIT',
  NET_CREDIT: 'NET_CREDIT',
  NET_ZERO: 'NET_ZERO',
} as const;

/**
 * Create a One Cancels Other (OCO) order
 *
 * OCO orders consist of two orders where execution of one immediately
 * cancels the other. This is commonly used for profit-taking and stop-loss
 * orders on the same position.
 *
 * @param order1 First order (typically profit target)
 * @param order2 Second order (typically stop loss)
 * @returns OrderBuilder configured as OCO
 *
 * @example
 * // Create OCO to sell at profit target OR stop loss
 * const profitOrder = equitySellLimit('AAPL', 10, 180);
 * const stopOrder = equitySellStop('AAPL', 10, 150);
 * const ocoOrder = oneCancelsOther(profitOrder, stopOrder).build();
 */
export function oneCancelsOther(order1: OrderBuilder, order2: OrderBuilder): OrderBuilder {
  const order1Built = order1.build();
  const order2Built = order2.build();

  return new OrderBuilder()
    .setOrderStrategyType('OCO')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setChildOrderStrategies([order1Built, order2Built]);
}

/**
 * Create a First Triggers Second (OTO) order
 *
 * OTO orders (also called "trigger" orders) consist of a primary order
 * and a secondary order. The secondary order is only submitted after
 * the primary order fills.
 *
 * @param primaryOrder The order that must fill first
 * @param secondaryOrder The order triggered after primary fills
 * @returns OrderBuilder configured as OTO/TRIGGER
 *
 * @example
 * // Buy stock, then set up stop loss
 * const buyOrder = equityBuyLimit('AAPL', 10, 170);
 * const stopOrder = equitySellStop('AAPL', 10, 160);
 * const otoOrder = firstTriggersSecond(buyOrder, stopOrder).build();
 */
export function firstTriggersSecond(
  primaryOrder: OrderBuilder,
  secondaryOrder: OrderBuilder
): OrderBuilder {
  const primaryBuilt = primaryOrder.build();
  const secondaryBuilt = secondaryOrder.build();

  // The primary order becomes the main order with TRIGGER strategy
  return new OrderBuilder()
    .setOrderType(primaryBuilt.orderType)
    .setSession(primaryBuilt.session)
    .setDuration(primaryBuilt.duration)
    .setOrderStrategyType('TRIGGER')
    .setQuantity(primaryBuilt.quantity)
    .setPrice(primaryBuilt.price)
    .setOrderLegCollection(primaryBuilt.orderLegCollection || [])
    .setChildOrderStrategies([secondaryBuilt]);
}

/**
 * Create a One Triggers OCO (OTOCO) order
 *
 * OTOCO is a combination of OTO and OCO. The primary order triggers
 * an OCO pair of orders. Commonly used for bracket orders:
 * - Primary: Entry order
 * - OCO pair: Take profit and stop loss
 *
 * @param primaryOrder The entry order
 * @param ocoOrder1 First order of the OCO pair (e.g., take profit)
 * @param ocoOrder2 Second order of the OCO pair (e.g., stop loss)
 * @returns OrderBuilder configured as OTOCO
 *
 * @example
 * // Bracket order: buy at limit, set profit target AND stop loss
 * const entryOrder = equityBuyLimit('AAPL', 10, 170);
 * const profitOrder = equitySellLimit('AAPL', 10, 190);
 * const stopOrder = equitySellStop('AAPL', 10, 160);
 * const bracketOrder = oneTriggerOCO(entryOrder, profitOrder, stopOrder).build();
 */
export function oneTriggerOCO(
  primaryOrder: OrderBuilder,
  ocoOrder1: OrderBuilder,
  ocoOrder2: OrderBuilder
): OrderBuilder {
  const primaryBuilt = primaryOrder.build();
  const oco1Built = ocoOrder1.build();
  const oco2Built = ocoOrder2.build();

  // Create the OCO container
  const ocoContainer: Order = {
    orderStrategyType: 'OCO',
    session: 'NORMAL',
    duration: 'DAY',
    orderType: 'MARKET', // Required but not used for OCO container
    quantity: 0,
    status: 'NEW',
    accountNumber: 0,
    childOrderStrategies: [oco1Built, oco2Built],
  };

  return new OrderBuilder()
    .setOrderType(primaryBuilt.orderType)
    .setSession(primaryBuilt.session)
    .setDuration(primaryBuilt.duration)
    .setOrderStrategyType('TRIGGER')
    .setQuantity(primaryBuilt.quantity)
    .setPrice(primaryBuilt.price)
    .setOrderLegCollection(primaryBuilt.orderLegCollection || [])
    .setChildOrderStrategies([ocoContainer]);
}
