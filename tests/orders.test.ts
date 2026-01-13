import { OrdersAPI, OrderQueryParams } from '../src/api/orders';
import { SchwabOAuth } from '../src/auth/oauth';
import { Order } from '../src/types';
import { OrderBuilder, OrderLegBuilder } from '../src/builders/orderBuilder';

jest.mock('../src/auth/oauth');

describe('OrdersAPI', () => {
  let ordersAPI: OrdersAPI;
  let mockOAuth: jest.Mocked<SchwabOAuth>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOAuth = {
      getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer mock-token'),
    } as any;

    ordersAPI = new OrdersAPI(mockOAuth, 'sandbox');
  });

  describe('constructor', () => {
    it('should create instance with sandbox URL', () => {
      const api = new OrdersAPI(mockOAuth, 'sandbox');
      expect(api).toBeInstanceOf(OrdersAPI);
    });

    it('should create instance with production URL', () => {
      const api = new OrdersAPI(mockOAuth, 'production');
      expect(api).toBeInstanceOf(OrdersAPI);
    });
  });

  describe('getAllOrders', () => {
    it('should fetch all orders across all accounts', async () => {
      const mockOrders = [
        {
          orderId: 1,
          status: 'FILLED',
          accountNumber: 123456789,
        },
        {
          orderId: 2,
          status: 'WORKING',
          accountNumber: 987654321,
        }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOrders),
      });

      const result = await ordersAPI.getAllOrders({});

      expect(result).toEqual(mockOrders);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.schwabapi.com/v1/sandbox/orders',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should fetch orders with query parameters', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const params: OrderQueryParams = {
        maxResults: 50,
        fromEnteredTime: '2024-01-01T00:00:00Z',
        toEnteredTime: '2024-01-31T23:59:59Z',
        status: 'FILLED',
      };

      await ordersAPI.getAllOrders(params);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain('maxResults=50');
      expect(url).toContain('fromEnteredTime=2024-01-01T00%3A00%3A00Z');
      expect(url).toContain('toEnteredTime=2024-01-31T23%3A59%3A59Z');
      expect(url).toContain('status=FILLED');
    });

    it('should handle API errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      await expect(ordersAPI.getAllOrders({}))
        .rejects
        .toThrow('HTTP 401: Unauthorized');
    });
  });

  describe('getOrdersForAccount', () => {
    it('should fetch orders for specific account', async () => {
      const accountNumber = 'encrypted-account-123';
      const mockOrders = [
        {
          orderId: 1,
          status: 'WORKING',
          accountNumber: 123456789,
        }
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOrders),
      });

      const result = await ordersAPI.getOrdersForAccount(accountNumber, {});

      expect(result).toEqual(mockOrders);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/orders`,
        expect.any(Object)
      );
    });

    it('should fetch orders with query parameters for specific account', async () => {
      const accountNumber = 'encrypted-account-123';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      const params: OrderQueryParams = {
        maxResults: 25,
        status: 'CANCELED',
      };

      await ordersAPI.getOrdersForAccount(accountNumber, params);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const url = fetchCall[0];

      expect(url).toContain(`/accounts/${accountNumber}/orders`);
      expect(url).toContain('maxResults=25');
      expect(url).toContain('status=CANCELED');
    });
  });

  describe('getOrder', () => {
    it('should fetch specific order by ID', async () => {
      const accountNumber = 'encrypted-account-123';
      const orderId = 12345;
      const mockOrder = {
        orderId: 12345,
        status: 'FILLED',
        accountNumber: 123456789,
        orderType: 'MARKET',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await ordersAPI.getOrder(accountNumber, orderId);

      expect(result).toEqual(mockOrder);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/orders/${orderId}`,
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle order not found error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Order not found'),
      });

      await expect(ordersAPI.getOrder('account-123', 99999))
        .rejects
        .toThrow('HTTP 404: Order not found');
    });
  });

  describe('placeOrder', () => {
    it('should place a new order', async () => {
      const accountNumber = 'encrypted-account-123';
      const order: Order = new OrderBuilder()
        .setOrderType('MARKET')
        .setSession('NORMAL')
        .setDuration('DAY')
        .setQuantity(10)
        .addOrderLeg(
          new OrderLegBuilder()
            .setInstruction('BUY')
            .setQuantity(10)
            .setInstrument('AAPL', 'EQUITY')
            .build()
        )
        .build();

      const mockResponse = {
        orderId: 54321,
        status: 'ACCEPTED',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await ordersAPI.placeOrder(accountNumber, order);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/orders`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(order),
        })
      );
    });

    it('should handle order placement rejection', async () => {
      const order: Order = new OrderBuilder()
        .setOrderType('LIMIT')
        .setPrice(100)
        .addOrderLeg(
          new OrderLegBuilder()
            .setInstruction('BUY')
            .setQuantity(10)
            .setInstrument('AAPL', 'EQUITY')
            .build()
        )
        .build();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid order parameters'),
      });

      await expect(ordersAPI.placeOrder('account-123', order))
        .rejects
        .toThrow('HTTP 400: Invalid order parameters');
    });
  });

  describe('replaceOrder', () => {
    it('should replace an existing order', async () => {
      const accountNumber = 'encrypted-account-123';
      const orderId = 12345;
      const newOrder: Order = new OrderBuilder()
        .setOrderType('LIMIT')
        .setPrice(150)
        .addOrderLeg(
          new OrderLegBuilder()
            .setInstruction('BUY')
            .setQuantity(20)
            .setInstrument('AAPL', 'EQUITY')
            .build()
        )
        .build();

      const mockResponse = {
        orderId: 12346,
        status: 'ACCEPTED',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await ordersAPI.replaceOrder(accountNumber, orderId, newOrder);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/orders/${orderId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(newOrder),
        })
      );
    });

    it('should handle replace order errors', async () => {
      const order: Order = new OrderBuilder()
        .setOrderType('MARKET')
        .addOrderLeg(
          new OrderLegBuilder()
            .setInstruction('SELL')
            .setQuantity(5)
            .setInstrument('TSLA', 'EQUITY')
            .build()
        )
        .build();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Order cannot be replaced'),
      });

      await expect(ordersAPI.replaceOrder('account-123', 999, order))
        .rejects
        .toThrow('HTTP 400: Order cannot be replaced');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      const accountNumber = 'encrypted-account-123';
      const orderId = 12345;

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      await ordersAPI.cancelOrder(accountNumber, orderId);

      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/orders/${orderId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle cancel order errors', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Order cannot be cancelled'),
      });

      await expect(ordersAPI.cancelOrder('account-123', 999))
        .rejects
        .toThrow('HTTP 400: Order cannot be cancelled');
    });

    it('should handle order already filled', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Order already filled'),
      });

      await expect(ordersAPI.cancelOrder('account-123', 12345))
        .rejects
        .toThrow('HTTP 400: Order already filled');
    });
  });

  describe('previewOrder', () => {
    it('should preview an order', async () => {
      const accountNumber = 'encrypted-account-123';
      const order: Order = new OrderBuilder()
        .setOrderType('LIMIT')
        .setPrice(200)
        .addOrderLeg(
          new OrderLegBuilder()
            .setInstruction('BUY')
            .setQuantity(50)
            .setInstrument('MSFT', 'EQUITY')
            .build()
        )
        .build();

      const mockPreview = {
        orderId: 0,
        orderStrategy: 'SINGLE',
        orderValidationResult: {
          alerts: [],
          accepts: [],
          rejects: [],
          reviews: [],
          warns: [],
        },
        commissionAndFee: {
          commission: { amount: 0 },
          fee: { amount: 0 },
          trueCommission: { amount: 0 },
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPreview),
      });

      const result = await ordersAPI.previewOrder(accountNumber, order);

      expect(result).toEqual(mockPreview);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.schwabapi.com/v1/sandbox/accounts/${accountNumber}/previewOrder`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(order),
        })
      );
    });

    it('should handle preview order validation errors', async () => {
      const order: Order = new OrderBuilder()
        .setOrderType('MARKET')
        .addOrderLeg(
          new OrderLegBuilder()
            .setInstruction('BUY')
            .setQuantity(0)
            .setInstrument('INVALID', 'EQUITY')
            .build()
        )
        .build();

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue('Invalid quantity'),
      });

      await expect(ordersAPI.previewOrder('account-123', order))
        .rejects
        .toThrow('HTTP 400: Invalid quantity');
    });
  });
});
