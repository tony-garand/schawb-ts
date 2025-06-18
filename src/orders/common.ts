export class __BaseInstrument {
  protected _assetType: string;
  protected _symbol: string;

  constructor(assetType: string, symbol: string) {
    this._assetType = assetType;
    this._symbol = symbol;
  }

  get assetType(): string {
    return this._assetType;
  }

  get symbol(): string {
    return this._symbol;
  }
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  STOP_LIMIT = 'STOP_LIMIT',
  TRAILING_STOP = 'TRAILING_STOP',
  CABINET = 'CABINET',
  NON_MARKETABLE = 'NON_MARKETABLE',
  MARKET_ON_CLOSE = 'MARKET_ON_CLOSE',
  EXERCISE = 'EXERCISE',
  TRAILING_STOP_LIMIT = 'TRAILING_STOP_LIMIT',
  NET_DEBIT = 'NET_DEBIT',
  NET_CREDIT = 'NET_CREDIT',
  NET_ZERO = 'NET_ZERO'
}

export enum OrderStrategyType {
  SINGLE = 'SINGLE',
  OCO = 'OCO',
  TRIGGER = 'TRIGGER'
}

export enum ComplexOrderStrategyType {
  NONE = 'NONE',
  COVERED = 'COVERED',
  VERTICAL = 'VERTICAL',
  BACK_RATIO = 'BACK_RATIO',
  CALENDAR = 'CALENDAR',
  DIAGONAL = 'DIAGONAL',
  STRADDLE = 'STRADDLE',
  STRANGLE = 'STRANGLE',
  COLLAR_SYNTHETIC = 'COLLAR_SYNTHETIC',
  BUTTERFLY = 'BUTTERFLY',
  CONDOR = 'CONDOR',
  IRON_CONDOR = 'IRON_CONDOR',
  VERTICAL_ROLL = 'VERTICAL_ROLL',
  COLLAR_WITH_STOCK = 'COLLAR_WITH_STOCK',
  DOUBLE_DIAGONAL = 'DOUBLE_DIAGONAL',
  UNBALANCED_BUTTERFLY = 'UNBALANCED_BUTTERFLY',
  UNBALANCED_CONDOR = 'UNBALANCED_CONDOR',
  UNBALANCED_IRON_CONDOR = 'UNBALANCED_IRON_CONDOR',
  UNBALANCED_VERTICAL_ROLL = 'UNBALANCED_VERTICAL_ROLL',
  CUSTOM = 'CUSTOM'
}

export enum OptionInstruction {
  BUY_TO_OPEN = 'BUY_TO_OPEN',
  SELL_TO_OPEN = 'SELL_TO_OPEN',
  BUY_TO_CLOSE = 'BUY_TO_CLOSE',
  SELL_TO_CLOSE = 'SELL_TO_CLOSE'
}

export enum Duration {
  DAY = 'DAY',
  GOOD_TILL_CANCEL = 'GOOD_TILL_CANCEL',
  FILL_OR_KILL = 'FILL_OR_KILL'
}

export enum Session {
  NORMAL = 'NORMAL',
  AM = 'AM',
  PM = 'PM',
  SEAMLESS = 'SEAMLESS'
}

export class OrderLeg {
  private _assetType: string;
  private _legId: number;
  private _instrument: __BaseInstrument;
  private _instruction: string;
  private _quantity: number;
  private _quantityType: string;

  constructor(
    assetType: string,
    legId: number,
    instrument: __BaseInstrument,
    instruction: string,
    quantity: number,
    quantityType: string
  ) {
    this._assetType = assetType;
    this._legId = legId;
    this._instrument = instrument;
    this._instruction = instruction;
    this._quantity = quantity;
    this._quantityType = quantityType;
  }

  get assetType(): string {
    return this._assetType;
  }

  get legId(): number {
    return this._legId;
  }

  get instrument(): __BaseInstrument {
    return this._instrument;
  }

  get instruction(): string {
    return this._instruction;
  }

  get quantity(): number {
    return this._quantity;
  }

  get quantityType(): string {
    return this._quantityType;
  }
}

export class OrderLegCollection {
  private _legs: OrderLeg[] = [];

  addLeg(leg: OrderLeg): void {
    this._legs.push(leg);
  }

  get legs(): OrderLeg[] {
    return this._legs;
  }
}

export class Order {
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
  private _orderLegCollection: OrderLegCollection;

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
    orderLegCollection: OrderLegCollection
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

  get orderLegCollection(): OrderLegCollection {
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

/**
 * Combines two order builders in a first-triggers-second (TRIGGER) strategy.
 * Returns an object representing the composite order.
 */
export function firstTriggersSecond(first: any, second: any): any {
  return {
    orderStrategyType: OrderStrategyType.TRIGGER,
    childOrderStrategies: [first, second],
  };
}

/**
 * Combines two order builders in a one-cancels-other (OCO) strategy.
 * Returns an object representing the composite order.
 */
export function oneCancelsOther(one: any, other: any): any {
  return {
    orderStrategyType: OrderStrategyType.OCO,
    childOrderStrategies: [one, other],
  };
} 