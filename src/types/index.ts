// OAuth Configuration
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

// Client Configuration
export interface SchwabClientConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment?: 'sandbox' | 'production';
}

// Account Number Hash
export interface AccountNumberHash {
  accountNumber: string;
  hashValue: string;
}

// Session Enum
export type Session = 'NORMAL' | 'AM' | 'PM' | 'SEAMLESS';

// Duration Enum
export type Duration = 'DAY' | 'GOOD_TILL_CANCEL' | 'FILL_OR_KILL' | 'IMMEDIATE_OR_CANCEL' | 'END_OF_WEEK' | 'END_OF_MONTH' | 'NEXT_END_OF_MONTH' | 'UNKNOWN';

// Order Type Enums
export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'TRAILING_STOP' | 'CABINET' | 'NON_MARKETABLE' | 'MARKET_ON_CLOSE' | 'EXERCISE' | 'TRAILING_STOP_LIMIT' | 'NET_DEBIT' | 'NET_CREDIT' | 'NET_ZERO' | 'LIMIT_ON_CLOSE' | 'UNKNOWN';

export type OrderTypeRequest = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'TRAILING_STOP' | 'CABINET' | 'NON_MARKETABLE' | 'MARKET_ON_CLOSE' | 'EXERCISE' | 'TRAILING_STOP_LIMIT' | 'NET_DEBIT' | 'NET_CREDIT' | 'NET_ZERO' | 'LIMIT_ON_CLOSE';

// Complex Order Strategy Type Enum
export type ComplexOrderStrategyType = 'NONE' | 'COVERED' | 'VERTICAL' | 'BACK_RATIO' | 'CALENDAR' | 'DIAGONAL' | 'STRADDLE' | 'STRANGLE' | 'COLLAR_SYNTHETIC' | 'BUTTERFLY' | 'CONDOR' | 'IRON_CONDOR' | 'VERTICAL_ROLL' | 'COLLAR_WITH_STOCK' | 'DOUBLE_DIAGONAL' | 'UNBALANCED_BUTTERFLY' | 'UNBALANCED_CONDOR' | 'UNBALANCED_IRON_CONDOR' | 'UNBALANCED_VERTICAL_ROLL' | 'MUTUAL_FUND_SWAP' | 'CUSTOM';

// Requested Destination Enum
export type RequestedDestination = 'INET' | 'ECN_ARCA' | 'CBOE' | 'AMEX' | 'PHLX' | 'ISE' | 'BOX' | 'NYSE' | 'NASDAQ' | 'BATS' | 'C2' | 'AUTO';

// Stop Price Link Basis Enum
export type StopPriceLinkBasis = 'MANUAL' | 'BASE' | 'TRIGGER' | 'LAST' | 'BID' | 'ASK' | 'ASK_BID' | 'MARK' | 'AVERAGE';

// Stop Price Link Type Enum
export type StopPriceLinkType = 'VALUE' | 'PERCENT' | 'TICK';

// Stop Type Enum
export type StopType = 'STANDARD' | 'BID' | 'ASK' | 'LAST' | 'MARK';

// Price Link Basis Enum
export type PriceLinkBasis = 'MANUAL' | 'BASE' | 'TRIGGER' | 'LAST' | 'BID' | 'ASK' | 'ASK_BID' | 'MARK' | 'AVERAGE';

// Price Link Type Enum
export type PriceLinkType = 'VALUE' | 'PERCENT' | 'TICK';

// Tax Lot Method Enum
export type TaxLotMethod = 'FIFO' | 'LIFO' | 'HIGH_COST' | 'LOW_COST' | 'AVERAGE_COST' | 'SPECIFIC_LOT' | 'LOSS_HARVESTER';

// Special Instruction Enum
export type SpecialInstruction = 'ALL_OR_NONE' | 'DO_NOT_REDUCE' | 'ALL_OR_NONE_DO_NOT_REDUCE';

// Order Strategy Type Enum
export type OrderStrategyType = 'SINGLE' | 'CANCEL' | 'RECALL' | 'PAIR' | 'FLATTEN' | 'TWO_DAY_SWAP' | 'BLAST_ALL' | 'OCO' | 'TRIGGER';

// Status Enum
export type Status = 'AWAITING_PARENT_ORDER' | 'AWAITING_CONDITION' | 'AWAITING_STOP_CONDITION' | 'AWAITING_MANUAL_REVIEW' | 'ACCEPTED' | 'AWAITING_UR_OUT' | 'PENDING_ACTIVATION' | 'QUEUED' | 'WORKING' | 'REJECTED' | 'PENDING_CANCEL' | 'CANCELED' | 'PENDING_REPLACE' | 'REPLACED' | 'FILLED' | 'EXPIRED' | 'NEW' | 'AWAITING_RELEASE_TIME' | 'PENDING_ACKNOWLEDGEMENT' | 'PENDING_RECALL' | 'UNKNOWN';

// Amount Indicator Enum
export type AmountIndicator = 'DOLLARS' | 'SHARES' | 'ALL_SHARES' | 'PERCENTAGE' | 'UNKNOWN';

// Settlement Instruction Enum
export type SettlementInstruction = 'REGULAR' | 'CASH' | 'NEXT_DAY' | 'UNKNOWN';

// Asset Type Enum
export type AssetType = 'EQUITY' | 'MUTUAL_FUND' | 'OPTION' | 'FUTURE' | 'FOREX' | 'INDEX' | 'CASH_EQUIVALENT' | 'FIXED_INCOME' | 'PRODUCT' | 'CURRENCY' | 'COLLECTIVE_INVESTMENT';

// Instruction Enum
export type Instruction = 'BUY' | 'SELL' | 'BUY_TO_COVER' | 'SELL_SHORT' | 'BUY_TO_OPEN' | 'BUY_TO_CLOSE' | 'SELL_TO_OPEN' | 'SELL_TO_CLOSE' | 'EXCHANGE' | 'SELL_SHORT_EXEMPT';

// Advanced Order Type Enum
export type AdvancedOrderType = 'NONE' | 'OTO' | 'OCO' | 'OTOCO' | 'OT2OCO' | 'OT3OCO' | 'BLAST_ALL' | 'OTA' | 'PAIR';

// API Rule Action Enum
export type APIRuleAction = 'ACCEPT' | 'ALERT' | 'REJECT' | 'REVIEW' | 'UNKNOWN';

// Fee Type Enum
export type FeeType = 'COMMISSION' | 'SEC_FEE' | 'STR_FEE' | 'R_FEE' | 'CDSC_FEE' | 'OPT_REG_FEE' | 'ADDITIONAL_FEE' | 'MISCELLANEOUS_FEE' | 'FTT' | 'FUTURES_CLEARING_FEE' | 'FUTURES_DESK_OFFICE_FEE' | 'FUTURES_EXCHANGE_FEE' | 'FUTURES_GLOBEX_FEE' | 'FUTURES_NFA_FEE' | 'FUTURES_PIT_BROKERAGE_FEE' | 'FUTURES_TRANSACTION_FEE' | 'LOW_PROCEEDS_COMMISSION' | 'BASE_CHARGE' | 'GENERAL_CHARGE' | 'GST_FEE' | 'TAF_FEE' | 'INDEX_OPTION_FEE' | 'TEFRA_TAX' | 'STATE_TAX' | 'UNKNOWN';

// Activity Type Enum
export type ActivityType = 'ACTIVITY_CORRECTION' | 'EXECUTION' | 'ORDER_ACTION' | 'TRANSFER' | 'UNKNOWN';

// Transaction Type Enum
export type TransactionType = 'TRADE' | 'RECEIVE_AND_DELIVER' | 'DIVIDEND_OR_INTEREST' | 'ACH_RECEIPT' | 'ACH_DISBURSEMENT' | 'CASH_RECEIPT' | 'CASH_DISBURSEMENT' | 'ELECTRONIC_FUND' | 'WIRE_OUT' | 'WIRE_IN' | 'JOURNAL' | 'MEMORANDUM' | 'MARGIN_CALL' | 'MONEY_MARKET' | 'SMA_ADJUSTMENT';

// User Type Enum
export type UserType = 'ADVISOR_USER' | 'BROKER_USER' | 'CLIENT_USER' | 'SYSTEM_USER' | 'UNKNOWN';

// Sub Account Enum
export type SubAccount = 'CASH' | 'MARGIN' | 'SHORT' | 'DIV' | 'INCOME' | 'UNKNOWN';

// Position Effect Enum
export type PositionEffect = 'OPENING' | 'CLOSING' | 'AUTOMATIC';

// Quantity Type Enum
export type QuantityType = 'ALL_SHARES' | 'DOLLARS' | 'SHARES';

// Div Cap Gains Enum
export type DivCapGains = 'REINVEST' | 'PAYOUT';

// API Currency Type Enum
export type APICurrencyType = 'USD' | 'CAD' | 'EUR' | 'JPY';

// Put Call Enum
export type PutCall = 'PUT' | 'CALL' | 'UNKNOWN';

// Option Type Enum
export type OptionType = 'VANILLA' | 'BINARY' | 'BARRIER' | 'UNKNOWN';

// Execution Type Enum
export type ExecutionType = 'FILL';

// Order Activity Type Enum
export type OrderActivityType = 'EXECUTION' | 'ORDER_ACTION';

// Account Type Enum
export type AccountType = 'CASH' | 'MARGIN';

// Cash Equivalent Type Enum
export type CashEquivalentType = 'SWEEP_VEHICLE' | 'SAVINGS' | 'MONEY_MARKET_FUND' | 'UNKNOWN';

// Equity Type Enum
export type EquityType = 'COMMON_STOCK' | 'PREFERRED_STOCK' | 'DEPOSITORY_RECEIPT' | 'PREFERRED_DEPOSITORY_RECEIPT' | 'RESTRICTED_STOCK' | 'COMPONENT_UNIT' | 'RIGHT' | 'WARRANT' | 'CONVERTIBLE_PREFERRED_STOCK' | 'CONVERTIBLE_STOCK' | 'LIMITED_PARTNERSHIP' | 'WHEN_ISSUED' | 'UNKNOWN';

// Fixed Income Type Enum
export type FixedIncomeType = 'BOND_UNIT' | 'CERTIFICATE_OF_DEPOSIT' | 'CONVERTIBLE_BOND' | 'COLLATERALIZED_MORTGAGE_OBLIGATION' | 'CORPORATE_BOND' | 'GOVERNMENT_MORTGAGE' | 'GNMA_BONDS' | 'MUNICIPAL_ASSESSMENT_DISTRICT' | 'MUNICIPAL_BOND' | 'OTHER_GOVERNMENT' | 'SHORT_TERM_PAPER' | 'US_TREASURY_BOND' | 'US_TREASURY_BILL' | 'US_TREASURY_NOTE' | 'US_TREASURY_ZERO_COUPON' | 'AGENCY_BOND' | 'WHEN_AS_AND_IF_ISSUED_BOND' | 'ASSET_BACKED_SECURITY' | 'UNKNOWN';

// Mutual Fund Type Enum
export type MutualFundType = 'NOT_APPLICABLE' | 'OPEN_END_NON_TAXABLE' | 'OPEN_END_TAXABLE' | 'NO_LOAD_NON_TAXABLE' | 'NO_LOAD_TAXABLE' | 'UNKNOWN';

// Collective Investment Type Enum
export type CollectiveInvestmentType = 'UNIT_INVESTMENT_TRUST' | 'EXCHANGE_TRADED_FUND' | 'CLOSED_END_FUND' | 'INDEX' | 'UNITS';

// Forex Type Enum
export type ForexType = 'CURRENCY_PAIR' | 'CURRENCY_OPTION' | 'CURRENCY_FUTURE';

// Future Type Enum
export type FutureType = 'STANDARD' | 'UNKNOWN';

// Index Type Enum
export type IndexType = 'BROAD_BASED' | 'NARROW_BASED' | 'UNKNOWN';

// Product Type Enum
export type ProductType = 'TBD' | 'UNKNOWN';

// Date Parameter
export interface DateParam {
  date: string; // ISO-8601 format: yyyy-MM-dd'T'HH:mm:ss.SSSZ
}

// Base Instrument Interface
export interface BaseInstrument {
  assetType: AssetType;
  cusip?: string;
  symbol: string;
  description: string;
  instrumentId: number;
  netChange: number;
}

// Cash Equivalent Instrument
export interface CashEquivalent extends BaseInstrument {
  assetType: 'CASH_EQUIVALENT';
  type: CashEquivalentType;
}

// Equity Instrument
export interface Equity extends BaseInstrument {
  assetType: 'EQUITY';
  type?: EquityType;
}

// Fixed Income Instrument
export interface FixedIncome extends BaseInstrument {
  assetType: 'FIXED_INCOME';
  type?: FixedIncomeType;
  maturityDate?: string;
  factor?: number;
  multiplier?: number;
  variableRate?: number;
}

// Mutual Fund Instrument
export interface MutualFund extends BaseInstrument {
  assetType: 'MUTUAL_FUND';
  fundFamilyName?: string;
  fundFamilySymbol?: string;
  fundGroup?: string;
  type?: MutualFundType;
  exchangeCutoffTime?: string;
  purchaseCutoffTime?: string;
  redemptionCutoffTime?: string;
}

// Collective Investment Instrument
export interface CollectiveInvestment extends BaseInstrument {
  assetType: 'COLLECTIVE_INVESTMENT';
  type: CollectiveInvestmentType;
}

// Currency Instrument
export interface Currency extends BaseInstrument {
  assetType: 'CURRENCY';
}

// Forex Instrument
export interface Forex extends BaseInstrument {
  assetType: 'FOREX';
  type: ForexType;
  baseCurrency?: Currency;
  counterCurrency?: Currency;
}

// Future Instrument
export interface Future extends BaseInstrument {
  assetType: 'FUTURE';
  activeContract: boolean;
  type: FutureType;
  expirationDate?: string;
  lastTradingDate?: string;
  firstNoticeDate?: string;
  multiplier?: number;
}

// Index Instrument
export interface Index extends BaseInstrument {
  assetType: 'INDEX';
  activeContract: boolean;
  type: IndexType;
}

// Option Instrument
export interface Option extends BaseInstrument {
  assetType: 'OPTION';
  expirationDate?: string;
  optionDeliverables?: OptionDeliverable[];
  optionPremiumMultiplier?: number;
  putCall: PutCall;
  strikePrice?: number;
  type: OptionType;
  underlyingSymbol?: string;
  underlyingCusip?: string;
  deliverable?: AccountAPIOptionDeliverable;
}

// Product Instrument
export interface Product extends BaseInstrument {
  assetType: 'PRODUCT';
  type: ProductType;
}

// Option Deliverable
export interface OptionDeliverable {
  symbol?: string;
  rootSymbol?: string;
  strikePercent?: number;
  deliverableNumber?: number;
  deliverableUnits: number;
  apiCurrencyType?: APICurrencyType;
  assetType: AssetType;
  deliverable?: AccountAPIOptionDeliverable;
}

// Account API Option Deliverable
export interface AccountAPIOptionDeliverable {
  symbol?: string;
  deliverableUnits: number;
  apiCurrencyType?: APICurrencyType;
  assetType: AssetType;
}

// Transaction API Option Deliverable
export interface TransactionAPIOptionDeliverable {
  rootSymbol?: string;
  strikePercent?: number;
  deliverableNumber?: number;
  deliverableUnits: number;
  deliverable?: TransactionInstrument;
  assetType: AssetType;
}

// Commission Value
export interface CommissionValue {
  value: number;
  type: FeeType;
}

// Commission Leg
export interface CommissionLeg {
  commissionValues: CommissionValue[];
}

// Commission
export interface Commission {
  commissionLegs: CommissionLeg[];
}

// Fee Value
export interface FeeValue {
  value: number;
  type: FeeType;
}

// Fee Leg
export interface FeeLeg {
  feeValues: FeeValue[];
}

// Fees
export interface Fees {
  feeLegs: FeeLeg[];
}

// Commission and Fee
export interface CommissionAndFee {
  commission: Commission;
  fee: Fees;
  trueCommission: Commission;
}

// Order Balance
export interface OrderBalance {
  orderValue: number;
  projectedAvailableFund: number;
  projectedBuyingPower: number;
  projectedCommission: number;
}

// Order Validation Detail
export interface OrderValidationDetail {
  validationRuleName: string;
  message: string;
  activityMessage: string;
  originalSeverity: APIRuleAction;
  overrideName?: string;
  overrideSeverity?: APIRuleAction;
}

// Order Validation Result
export interface OrderValidationResult {
  alerts: OrderValidationDetail[];
  accepts: OrderValidationDetail[];
  rejects: OrderValidationDetail[];
  reviews: OrderValidationDetail[];
  warns: OrderValidationDetail[];
}

// Order Leg
export interface OrderLeg {
  askPrice?: number;
  bidPrice?: number;
  lastPrice?: number;
  markPrice?: number;
  projectedCommission?: number;
  quantity: number;
  finalSymbol?: string;
  legId: number;
  assetType: AssetType;
  instruction: Instruction;
}

// Account Instrument Union Type (for account operations)
export type AccountInstrument = AccountCashEquivalent | AccountEquity | AccountFixedIncome | AccountMutualFund | AccountOption;

// Order Leg Collection
export interface OrderLegCollection {
  orderLegType: AssetType;
  legId: number;
  instrument: AccountInstrument;
  instruction: Instruction;
  positionEffect?: PositionEffect;
  quantity: number;
  quantityType?: QuantityType;
  divCapGains?: DivCapGains;
  toSymbol?: string;
}

// Execution Leg
export interface ExecutionLeg {
  legId: number;
  price: number;
  quantity: number;
  mismarkedQuantity?: number;
  instrumentId: number;
  time: string;
}

// Order Activity
export interface OrderActivity {
  activityType: OrderActivityType;
  executionType?: ExecutionType;
  quantity: number;
  orderRemainingQuantity: number;
  executionLegs?: ExecutionLeg[];
}

// Order Strategy
export interface OrderStrategy {
  accountNumber: string;
  advancedOrderType?: AdvancedOrderType;
  closeTime?: string;
  enteredTime?: string;
  orderBalance?: OrderBalance;
  orderStrategyType: OrderStrategyType;
  orderVersion?: number;
  session: Session;
  status: Status;
  allOrNone?: boolean;
  discretionary?: boolean;
  duration: Duration;
  filledQuantity?: number;
  orderType: OrderType;
  orderValue?: number;
  price?: number;
  quantity: number;
  remainingQuantity?: number;
  sellNonMarginableFirst?: boolean;
  settlementInstruction?: SettlementInstruction;
  strategy?: ComplexOrderStrategyType;
  amountIndicator?: AmountIndicator;
  orderLegs?: OrderLeg[];
}

// Order
export interface Order {
  session: Session;
  duration: Duration;
  orderType: OrderType;
  cancelTime?: string;
  complexOrderStrategyType?: ComplexOrderStrategyType;
  quantity: number;
  filledQuantity?: number;
  remainingQuantity?: number;
  requestedDestination?: RequestedDestination;
  destinationLinkName?: string;
  releaseTime?: string;
  stopPrice?: number;
  stopPriceLinkBasis?: StopPriceLinkBasis;
  stopPriceLinkType?: StopPriceLinkType;
  stopPriceOffset?: number;
  stopType?: StopType;
  priceLinkBasis?: PriceLinkBasis;
  priceLinkType?: PriceLinkType;
  price?: number;
  taxLotMethod?: TaxLotMethod;
  orderLegCollection?: OrderLegCollection[];
  activationPrice?: number;
  specialInstruction?: SpecialInstruction;
  orderStrategyType: OrderStrategyType;
  orderId?: number;
  cancelable?: boolean;
  editable?: boolean;
  status: Status;
  enteredTime?: string;
  closeTime?: string;
  tag?: string;
  accountNumber: number;
  orderActivityCollection?: OrderActivity[];
  replacingOrderCollection?: Order[];
  childOrderStrategies?: Order[];
  statusDescription?: string;
}

// Order Request
export interface OrderRequest {
  session: Session;
  duration: Duration;
  orderType: OrderTypeRequest;
  cancelTime?: string;
  complexOrderStrategyType?: ComplexOrderStrategyType;
  quantity: number;
  filledQuantity?: number;
  remainingQuantity?: number;
  destinationLinkName?: string;
  releaseTime?: string;
  stopPrice?: number;
  stopPriceLinkBasis?: StopPriceLinkBasis;
  stopPriceLinkType?: StopPriceLinkType;
  stopPriceOffset?: number;
  stopType?: StopType;
  priceLinkBasis?: PriceLinkBasis;
  priceLinkType?: PriceLinkType;
  price?: number;
  taxLotMethod?: TaxLotMethod;
  orderLegCollection?: OrderLegCollection[];
  activationPrice?: number;
  specialInstruction?: SpecialInstruction;
  orderStrategyType: OrderStrategyType;
  orderId?: number;
  cancelable?: boolean;
  editable?: boolean;
  status: Status;
  enteredTime?: string;
  closeTime?: string;
  accountNumber: number;
  orderActivityCollection?: OrderActivity[];
  replacingOrderCollection?: Order[];
  childOrderStrategies?: Order[];
  statusDescription?: string;
}

// Preview Order
export interface PreviewOrder {
  orderId: number;
  orderStrategy: OrderStrategy;
  orderValidationResult: OrderValidationResult;
  commissionAndFee: CommissionAndFee;
}

// Order Response
export interface OrderResponse {
  orderId: number;
  orderStrategy: OrderStrategy;
  orderValidationResult: OrderValidationResult;
  commissionAndFee: CommissionAndFee;
}

// Position
export interface Position {
  shortQuantity: number;
  averagePrice: number;
  currentDayProfitLoss: number;
  currentDayProfitLossPercentage: number;
  longQuantity: number;
  settledLongQuantity: number;
  settledShortQuantity: number;
  agedQuantity: number;
  instrument: AccountInstrument;
  marketValue: number;
  maintenanceRequirement: number;
  averageLongPrice: number;
  averageShortPrice: number;
  taxLotAverageLongPrice: number;
  taxLotAverageShortPrice: number;
  longOpenProfitLoss: number;
  shortOpenProfitLoss: number;
  previousSessionLongQuantity: number;
  previousSessionShortQuantity: number;
  currentDayCost: number;
}

// User Details
export interface UserDetails {
  cdDomainId: string;
  login: string;
  type: UserType;
  userId: number;
  systemUserName: string;
  firstName: string;
  lastName: string;
  brokerRepCode: string;
}

// Transfer Item
export interface TransferItem {
  instrument: AccountInstrument;
  amount: number;
  cost: number;
  price: number;
  feeType: string;
  positionEffect: string;
}

// Transaction
export interface Transaction {
  activityId: number;
  time: string;
  user: UserDetails;
  description: string;
  accountNumber: string;
  type: TransactionType;
  status: string;
  subAccount: SubAccount;
  tradeDate: string;
  settlementDate: string;
  positionId?: number;
  orderId?: number;
  netAmount: number;
  activityType: ActivityType;
  transferItems?: TransferItem[];
}

// Account Base
export interface AccountBase {
  type: AccountType;
  accountNumber: string;
  roundTrips: number;
  isDayTrader: boolean;
  isClosingOnlyRestricted: boolean;
  pfcbFlag: boolean;
  positions: Position[];
}

// Cash Initial Balance
export interface CashInitialBalance {
  accruedInterest: number;
  cashAvailableForTrading: number;
  cashAvailableForWithdrawal: number;
  cashBalance: number;
  bondValue: number;
  cashReceipts: number;
  liquidationValue: number;
  longOptionMarketValue: number;
  longStockValue: number;
  moneyMarketFund: number;
  mutualFundValue: number;
  shortOptionMarketValue: number;
  shortStockValue: number;
  isInCall: number;
  unsettledCash: number;
  cashDebitCallValue: number;
  pendingDeposits: number;
  accountValue: number;
}

// Cash Balance
export interface CashBalance {
  cashAvailableForTrading: number;
  cashAvailableForWithdrawal: number;
  cashCall: number;
  longNonMarginableMarketValue: number;
  totalCash: number;
  cashDebitCallValue: number;
  unsettledCash: number;
}

// Cash Account
export interface CashAccount extends AccountBase {
  type: 'CASH';
  initialBalances: CashInitialBalance;
  currentBalances: CashBalance;
  projectedBalances: CashBalance;
}

// Margin Initial Balance
export interface MarginInitialBalance {
  accruedInterest: number;
  availableFundsNonMarginableTrade: number;
  bondValue: number;
  buyingPower: number;
  cashBalance: number;
  cashAvailableForTrading: number;
  cashReceipts: number;
  dayTradingBuyingPower: number;
  dayTradingBuyingPowerCall: number;
  dayTradingEquityCall: number;
  equity: number;
  equityPercentage: number;
  liquidationValue: number;
  longMarginValue: number;
  longOptionMarketValue: number;
  longStockValue: number;
  maintenanceCall: number;
  maintenanceRequirement: number;
  margin: number;
  marginEquity: number;
  moneyMarketFund: number;
  mutualFundValue: number;
  regTCall: number;
  shortMarginValue: number;
  shortOptionMarketValue: number;
  shortStockValue: number;
  totalCash: number;
  isInCall: number;
  unsettledCash: number;
  pendingDeposits: number;
  marginBalance: number;
  shortBalance: number;
  accountValue: number;
}

// Margin Balance
export interface MarginBalance {
  availableFunds: number;
  availableFundsNonMarginableTrade: number;
  buyingPower: number;
  buyingPowerNonMarginableTrade: number;
  dayTradingBuyingPower: number;
  dayTradingBuyingPowerCall: number;
  equity: number;
  equityPercentage: number;
  longMarginValue: number;
  maintenanceCall: number;
  maintenanceRequirement: number;
  marginBalance: number;
  regTCall: number;
  shortBalance: number;
  shortMarginValue: number;
  sma: number;
  isInCall: number;
  stockBuyingPower: number;
  optionBuyingPower: number;
}

// Margin Account
export interface MarginAccount extends AccountBase {
  type: 'MARGIN';
  initialBalances: MarginInitialBalance;
  currentBalances: MarginBalance;
  projectedBalances: MarginBalance;
}

// Securities Account
export type SecuritiesAccount = CashAccount | MarginAccount;

// Account
export interface Account {
  securitiesAccount: SecuritiesAccount;
}

// Quote
export interface Quote {
  symbol: string;
  description: string;
  exchangeName: string;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  lastPrice: number;
  lastSize: number;
  lastTime: string;
  volume: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  netChange: number;
  netChangePercent: number;
  mark: number;
  markChange: number;
  markChangePercent: number;
  exchangeDelay: number;
  realTimeEntitled: boolean;
  regularMarketLastPrice: number;
  regularMarketLastSize: number;
  regularMarketNetChange: number;
  regularMarketTradeTimeInLong: number;
  delayed: boolean;
}

// Market Hours
export interface MarketHours {
  category: string;
  date: string;
  exchange: string;
  isOpen: boolean;
  marketType: string;
  product: string;
  productName: string;
  sessionHours: {
    preMarket: Array<{ start: string; end: string }>;
    regularMarket: Array<{ start: string; end: string }>;
    postMarket: Array<{ start: string; end: string }>;
  };
}

// Account Number Mapping
export interface AccountNumberMapping {
  [key: string]: string;
}

// Service Error
export interface ServiceError {
  message: string;
  errors: string[];
}

// Order Query Parameters
export interface OrderQueryParams {
  accountNumber?: string;
  maxResults?: number;
  fromEnteredTime?: string;
  toEnteredTime?: string;
  status?: Status;
}

// Transaction Query Parameters
export interface TransactionQueryParams {
  accountNumber?: string;
  type?: TransactionType;
  symbol?: string;
  startDate?: string;
  endDate?: string;
  maxResults?: number;
}

// Transaction Base Instrument Interface
export interface TransactionBaseInstrument {
  assetType: AssetType;
  cusip?: string;
  symbol: string;
  description: string;
  instrumentId: number;
  netChange: number;
}

// Accounts Base Instrument Interface
export interface AccountsBaseInstrument {
  assetType: AssetType;
  cusip?: string;
  symbol: string;
  description: string;
  instrumentId: number;
  netChange: number;
}

// Transaction-specific instrument types
export interface TransactionCashEquivalent extends TransactionBaseInstrument {
  assetType: 'CASH_EQUIVALENT';
  type: CashEquivalentType;
}

export interface TransactionEquity extends TransactionBaseInstrument {
  assetType: 'EQUITY';
  type?: EquityType;
}

export interface TransactionFixedIncome extends TransactionBaseInstrument {
  assetType: 'FIXED_INCOME';
  type?: FixedIncomeType;
  maturityDate?: string;
  factor?: number;
  multiplier?: number;
  variableRate?: number;
}

export interface TransactionMutualFund extends TransactionBaseInstrument {
  assetType: 'MUTUAL_FUND';
  fundFamilyName?: string;
  fundFamilySymbol?: string;
  fundGroup?: string;
  type?: MutualFundType;
  exchangeCutoffTime?: string;
  purchaseCutoffTime?: string;
  redemptionCutoffTime?: string;
}

export interface TransactionOption extends TransactionBaseInstrument {
  assetType: 'OPTION';
  expirationDate?: string;
  optionDeliverables?: OptionDeliverable[];
  optionPremiumMultiplier?: number;
  putCall: PutCall;
  strikePrice?: number;
  type: OptionType;
  underlyingSymbol?: string;
  underlyingCusip?: string;
  deliverable?: unknown;
}

// Account-specific instrument types (aliases for existing types)
export interface AccountCashEquivalent extends CashEquivalent {}
export interface AccountEquity extends Equity {}
export interface AccountFixedIncome extends FixedIncome {}
export interface AccountMutualFund extends MutualFund {}
export interface AccountOption extends Option {}

// Transaction Instrument Union Type (for transaction operations)
export type TransactionInstrument = 
  | TransactionCashEquivalent
  | CollectiveInvestment
  | Currency
  | TransactionEquity
  | TransactionFixedIncome
  | Forex
  | Future
  | Index
  | TransactionMutualFund
  | TransactionOption
  | Product; 