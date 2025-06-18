import { __BaseInstrument, OrderLeg, OrderType, Duration, Session, OrderStrategyType } from './common';

export class EquitySymbol extends __BaseInstrument {
  constructor(symbol: string) {
    super('EQUITY', symbol);
  }

  build(): string {
    return this.symbol;
  }
}

export class EquityOrderLeg extends OrderLeg {
  constructor(
    legId: number,
    instrument: __BaseInstrument,
    instruction: string,
    quantity: number,
    quantityType: string
  ) {
    super('EQUITY', legId, instrument, instruction, quantity, quantityType);
  }
}

export class EquityOrder {
  private _session: Session;
  private _duration: Duration;
  private _orderType: OrderType;
  private _cancelTime: Date | null = null;
  private _quantity: number;
  private _filledQuantity: number;
  private _remainingQuantity: number;
  private _requestedDestination: string;
  private _destinationLinkName: string;
  private _price: number;
  private _orderStrategyType: OrderStrategyType;
  private _orderId: number;
  private _cancelable: boolean;
  private _editable: boolean;
  private _status: string;
  private _enteredTime: Date;
  private _closeTime: Date | null = null;
  private _tag: string;
  private _accountId: number;
  private _orderLegCollection: EquityOrderLeg[];

  constructor(
    session: Session,
    duration: Duration,
    orderType: OrderType,
    quantity: number,
    filledQuantity: number,
    remainingQuantity: number,
    requestedDestination: string,
    destinationLinkName: string,
    price: number,
    orderStrategyType: OrderStrategyType,
    orderId: number,
    cancelable: boolean,
    editable: boolean,
    status: string,
    enteredTime: Date,
    tag: string,
    accountId: number,
    orderLegCollection: EquityOrderLeg[]
  ) {
    this._session = session;
    this._duration = duration;
    this._orderType = orderType;
    this._quantity = quantity;
    this._filledQuantity = filledQuantity;
    this._remainingQuantity = remainingQuantity;
    this._requestedDestination = requestedDestination;
    this._destinationLinkName = destinationLinkName;
    this._price = price;
    this._orderStrategyType = orderStrategyType;
    this._orderId = orderId;
    this._cancelable = cancelable;
    this._editable = editable;
    this._status = status;
    this._enteredTime = enteredTime;
    this._tag = tag;
    this._accountId = accountId;
    this._orderLegCollection = orderLegCollection;
  }

  // Getters
  get session(): Session {
    return this._session;
  }

  get duration(): Duration {
    return this._duration;
  }

  get orderType(): OrderType {
    return this._orderType;
  }

  get cancelTime(): Date | null {
    return this._cancelTime;
  }

  get quantity(): number {
    return this._quantity;
  }

  get filledQuantity(): number {
    return this._filledQuantity;
  }

  get remainingQuantity(): number {
    return this._remainingQuantity;
  }

  get requestedDestination(): string {
    return this._requestedDestination;
  }

  get destinationLinkName(): string {
    return this._destinationLinkName;
  }

  get price(): number {
    return this._price;
  }

  get orderStrategyType(): OrderStrategyType {
    return this._orderStrategyType;
  }

  get orderId(): number {
    return this._orderId;
  }

  get cancelable(): boolean {
    return this._cancelable;
  }

  get editable(): boolean {
    return this._editable;
  }

  get status(): string {
    return this._status;
  }

  get enteredTime(): Date {
    return this._enteredTime;
  }

  get closeTime(): Date | null {
    return this._closeTime;
  }

  get tag(): string {
    return this._tag;
  }

  get accountId(): number {
    return this._accountId;
  }

  get orderLegCollection(): EquityOrderLeg[] {
    return this._orderLegCollection;
  }

  // Setters
  setCancelTime(cancelTime: Date): void {
    this._cancelTime = cancelTime;
  }

  setCloseTime(closeTime: Date): void {
    this._closeTime = closeTime;
  }
}

export class EquityOrderBuilder {
  private _orderType!: OrderType;
  private _price: string | null = null;
  private _stopPrice: string | null = null;
  private _quantity: number | null = null;
  private _legs: EquityOrderLeg[] = [];
  private _session: Session = Session.NORMAL;
  private _duration: Duration = Duration.DAY;
  private _orderStrategyType: OrderStrategyType = OrderStrategyType.SINGLE;

  setOrderType(orderType: OrderType): EquityOrderBuilder {
    this._orderType = orderType;
    return this;
  }

  setPrice(price: string): EquityOrderBuilder {
    this._price = price;
    return this;
  }

  setStopPrice(stopPrice: string): EquityOrderBuilder {
    this._stopPrice = stopPrice;
    return this;
  }

  setQuantity(quantity: number): EquityOrderBuilder {
    this._quantity = quantity;
    return this;
  }

  setSession(session: Session): EquityOrderBuilder {
    this._session = session;
    return this;
  }

  setDuration(duration: Duration): EquityOrderBuilder {
    this._duration = duration;
    return this;
  }

  setOrderStrategyType(orderStrategyType: OrderStrategyType): EquityOrderBuilder {
    this._orderStrategyType = orderStrategyType;
    return this;
  }

  addEquityLeg(instruction: string, symbol: string, quantity: number): EquityOrderBuilder {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    const instrument = new EquitySymbol(symbol);
    const leg = new EquityOrderLeg(
      this._legs.length + 1,
      instrument,
      instruction,
      quantity,
      'SHARES'
    );
    this._legs.push(leg);
    return this;
  }

  build(): any {
    return {
      orderType: this._orderType,
      price: this._price,
      stopPrice: this._stopPrice,
      quantity: this._quantity,
      session: this._session,
      duration: this._duration,
      orderStrategyType: this._orderStrategyType,
      orderLegCollection: {
        orderLegType: 'EQUITY',
        legs: this._legs
      }
    };
  }
} 