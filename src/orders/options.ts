import { OptionInstruction, OrderType, Duration, Session } from './common';

export class OptionSymbol {
  private underlyingSymbol: string;
  private expirationDate: Date;
  private contractType: string;
  private strikePrice: string;

  constructor(underlyingSymbol: string, expirationDate: Date, contractType: string, strikePriceAsString: string) {
    this.underlyingSymbol = underlyingSymbol;
    if (contractType === 'C' || contractType === 'CALL') {
      this.contractType = 'C';
    } else if (contractType === 'P' || contractType === 'PUT') {
      this.contractType = 'P';
    } else {
      throw new Error('Contract type must be one of \'C\', \'CALL\', \'P\' or \'PUT\'');
    }
    this.expirationDate = expirationDate;
    const strike = parseFloat(strikePriceAsString);
    if (isNaN(strike) || strike <= 0) {
      throw new Error('strike price must be a string representing a positive float');
    }
    // Remove extraneous zeroes at the end
    let strikeCopy = strikePriceAsString;
    while (strikeCopy.endsWith('0')) {
      strikeCopy = strikeCopy.slice(0, -1);
    }
    if (strikeCopy.endsWith('.')) {
      strikePriceAsString = strikeCopy.slice(0, -1);
    }
    this.strikePrice = strikePriceAsString;
  }

  build(): string {
    return `${this.underlyingSymbol.padEnd(6)}${this.expirationDate.toISOString().slice(2, 10).replace(/-/g, '')}${this.contractType}${this.strikePrice}`;
  }
}

export class OptionOrderLeg {
  private _instruction: OptionInstruction;
  private _symbol: OptionSymbol;
  private _quantity: number;

  constructor(instruction: OptionInstruction, symbol: OptionSymbol, quantity: number) {
    this._instruction = instruction;
    this._symbol = symbol;
    this._quantity = quantity;
  }

  get instruction(): OptionInstruction {
    return this._instruction;
  }

  get symbol(): OptionSymbol {
    return this._symbol;
  }

  get quantity(): number {
    return this._quantity;
  }
}

export class OptionOrder {
  private _session: Session;
  private _duration: Duration;
  private _orderType: OrderType;
  private _quantity: number;
  private _leg: OptionOrderLeg;

  constructor(session: Session, duration: Duration, orderType: OrderType, quantity: number, leg: OptionOrderLeg) {
    this._session = session;
    this._duration = duration;
    this._orderType = orderType;
    this._quantity = quantity;
    this._leg = leg;
  }

  get session(): Session {
    return this._session;
  }

  get duration(): Duration {
    return this._duration;
  }

  get orderType(): OrderType {
    return this._orderType;
  }

  get quantity(): number {
    return this._quantity;
  }

  get leg(): OptionOrderLeg {
    return this._leg;
  }
}

export class OptionOrderBuilder {
  private _orderType: OrderType;
  private _duration: Duration;
  private _session: Session;
  private _quantity: number;
  private _leg!: OptionOrderLeg;

  constructor() {
    this._orderType = OrderType.MARKET;
    this._duration = Duration.DAY;
    this._session = Session.NORMAL;
    this._quantity = 1;
  }

  setOrderType(orderType: OrderType): OptionOrderBuilder {
    this._orderType = orderType;
    return this;
  }

  setDuration(duration: Duration): OptionOrderBuilder {
    this._duration = duration;
    return this;
  }

  setSession(session: Session): OptionOrderBuilder {
    this._session = session;
    return this;
  }

  setQuantity(quantity: number): OptionOrderBuilder {
    this._quantity = quantity;
    return this;
  }

  setLeg(leg: OptionOrderLeg): OptionOrderBuilder {
    this._leg = leg;
    return this;
  }

  build(): OptionOrder {
    return new OptionOrder(
      this._session,
      this._duration,
      this._orderType,
      this._quantity,
      this._leg
    );
  }
} 