import { OrderBuilder } from '../orders/generic';
import { OrderType, OrderStrategyType, Session, Duration } from '../orders/common';

interface OrderLeg {
    orderLegType: string;
    legId: number;
    instrument: {
        assetType: string;
        cusip?: string;
        symbol: string;
        description?: string;
        underlyingSymbol?: string;
    };
    instruction: string;
    positionEffect: string;
    quantity: number;
}

interface OrderActivity {
    activityType: string;
    executionType: string;
    quantity: number;
    orderRemainingQuantity: number;
    executionLegs: Array<{
        legId: number;
        quantity: number;
        mismarkedQuantity: number;
        price: number;
        time: string;
    }>;
}

interface HistoricalOrder {
    session: string;
    duration: string;
    orderType: string;
    complexOrderStrategyType: string;
    quantity: number;
    filledQuantity: number;
    remainingQuantity: number;
    destinationLinkName?: string;
    price?: number;
    orderLegCollection: OrderLeg[];
    orderStrategyType: string;
    orderId: number;
    cancelable: boolean;
    editable: boolean;
    status: string;
    enteredTime: string;
    closeTime?: string;
    tag?: string;
    accountId: number;
    orderActivityCollection: OrderActivity[];
    childOrderStrategies?: HistoricalOrder[];
}

export function constructRepeatOrder(historicalOrder: HistoricalOrder): OrderBuilder {
    if (!historicalOrder.orderStrategyType) {
        throw new Error('historical order is missing orderStrategyType');
    }

    const builder = new OrderBuilder();
    builder.setOrderType(historicalOrder.orderType as OrderType);
    builder.setSession(historicalOrder.session as Session);
    builder.setDuration(historicalOrder.duration as Duration);
    builder.setOrderStrategyType(historicalOrder.orderStrategyType as OrderStrategyType);
    builder.setQuantity(historicalOrder.quantity);

    if (historicalOrder.price !== undefined) {
        builder.setPrice(historicalOrder.price.toString());
    }

    for (const leg of historicalOrder.orderLegCollection) {
        if (leg.orderLegType === 'EQUITY') {
            builder.addOptionLeg(
                leg.instruction,
                leg.instrument.symbol,
                leg.quantity
            );
        } else if (leg.orderLegType === 'OPTION') {
            builder.addOptionLeg(
                leg.instruction,
                leg.instrument.symbol,
                leg.quantity
            );
        } else {
            throw new Error('unknown orderLegType');
        }
    }

    if (historicalOrder.childOrderStrategies) {
        const childBuilders = historicalOrder.childOrderStrategies.map(childOrder => {
            if (childOrder.orderStrategyType === 'OCO') {
                const ocoBuilder = new OrderBuilder();
                ocoBuilder.setOrderStrategyType(OrderStrategyType.OCO);
                if (childOrder.childOrderStrategies) {
                    // Note: OrderBuilder doesn't support child strategies yet
                    // This is a limitation of the current implementation
                    throw new Error('Child order strategies not supported');
                }
                return ocoBuilder;
            } else {
                return constructRepeatOrder(childOrder);
            }
        });
        // Note: OrderBuilder doesn't support child strategies yet
        // This is a limitation of the current implementation
        if (childBuilders.length > 0) {
            throw new Error('Child order strategies not supported');
        }
    }

    return builder;
}

export function codeForBuilder(builder: OrderBuilder, variableName?: string): string {
    const lines: string[] = [];

    if (variableName) {
        lines.push(`const ${variableName} = new OrderBuilder();`);
    } else {
        lines.push('new OrderBuilder()');
    }

    const prefix = variableName ? `${variableName}.` : '';

    // Add order type
    const order = builder.build();
    lines.push(`${prefix}setOrderType('${order.orderType}');`);

    // Add session
    if (order.session) {
        lines.push(`${prefix}setSession('${order.session}');`);
    }

    // Add duration
    if (order.duration) {
        lines.push(`${prefix}setDuration('${order.duration}');`);
    }

    // Add order strategy type
    if (order.orderStrategyType) {
        lines.push(`${prefix}setOrderStrategyType('${order.orderStrategyType}');`);
    }

    // Add quantity
    if (order.quantity) {
        lines.push(`${prefix}setQuantity(${order.quantity});`);
    }

    // Add price if present
    if (order.price) {
        lines.push(`${prefix}setPrice('${order.price}');`);
    }

    // Add order legs
    for (const leg of order.legs) {
        lines.push(`${prefix}addOptionLeg('${leg.instruction}', '${leg.symbol}', ${leg.quantity});`);
    }

    if (!variableName) {
        lines.push('.build();');
    }

    return lines.join('\n');
} 