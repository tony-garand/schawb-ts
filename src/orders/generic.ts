import { OrderType, Duration, Session, OrderStrategyType } from './common';

export class OrderBuilder {
  private _orderType: OrderType;
  private _price: string | null = null;
  private _quantity: number | null = null;
  private _legs: any[] = [];
  private _duration: Duration | null = null;
  private _session: Session | null = null;
  private _orderStrategyType: OrderStrategyType | null = null;

  constructor() {
    this._orderType = OrderType.MARKET; // Default to MARKET
  }

  setOrderType(orderType: OrderType): OrderBuilder {
    this._orderType = orderType;
    return this;
  }

  setPrice(price: string): OrderBuilder {
    this._price = price;
    return this;
  }

  setQuantity(quantity: number): OrderBuilder {
    this._quantity = quantity;
    return this;
  }

  setDuration(duration: Duration): OrderBuilder {
    this._duration = duration;
    return this;
  }

  setSession(session: Session): OrderBuilder {
    this._session = session;
    return this;
  }

  setOrderStrategyType(orderStrategyType: OrderStrategyType): OrderBuilder {
    this._orderStrategyType = orderStrategyType;
    return this;
  }

  addOptionLeg(instruction: string, symbol: string, quantity: number): OrderBuilder {
    this._legs.push({ instruction, symbol, quantity });
    return this;
  }

  build(): any {
    return {
      orderType: this._orderType,
      price: this._price,
      quantity: this._quantity,
      duration: this._duration,
      session: this._session,
      orderStrategyType: this._orderStrategyType,
      legs: this._legs
    };
  }
} 