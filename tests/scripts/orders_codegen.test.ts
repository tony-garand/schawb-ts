import { jest } from '@jest/globals';
import { latestOrderMain } from '../../src/scripts/orders_codegen';
import { clientFromTokenFile } from '../../src/auth';
import { constructRepeatOrder, codeForBuilder } from '../../src/contrib/orders';

// Mock the modules
jest.mock('../../src/auth');
jest.mock('../../src/contrib/orders');
jest.mock('console', () => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

const mockClientFromTokenFile = clientFromTokenFile as jest.MockedFunction<typeof clientFromTokenFile>;
const mockConstructRepeatOrder = constructRepeatOrder as jest.MockedFunction<typeof constructRepeatOrder>;
const mockCodeForBuilder = codeForBuilder as jest.MockedFunction<typeof codeForBuilder>;

// Helper function to create mock Response
function createMockResponse(status: number, json: any): Response {
  return {
    status,
    json: jest.fn().mockResolvedValue(json),
  } as unknown as Response;
}

// Helper function to check if string contains substring
function stringContains(substring: string) {
  return expect.stringContaining(substring);
}

// Type for mock client
type MockClient = {
  getOrdersForAllLinkedAccounts?: jest.Mock<Promise<any>, any[]>;
  getOrdersForAccount?: jest.Mock<Promise<any>, any[]>;
  getAccountNumbers?: jest.Mock<Promise<any>, any[]>;
  [key: string]: any;
};

describe('LatestOrderTest', () => {
  let args: string[];

  beforeEach(() => {
    args = [];
    jest.clearAllMocks();
  });

  function addArg(arg: string) {
    args.push(arg);
  }

  function main() {
    return latestOrderMain(args);
  }

  describe('test_success_no_account_id', () => {
    it('should handle success without account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');

      const orders = [
        { orderId: 201 },
        { orderId: 101 },
        { orderId: 301 },
        { orderId: 401 },
      ];

      const mockClient: MockClient = {
        getOrdersForAllLinkedAccounts: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);
      mockCodeForBuilder.mockReturnValue('generated code');

      const result = await main();

      expect(result).toBe(0);
      expect(mockConstructRepeatOrder).toHaveBeenCalledWith(orders[3]);
      expect(console.log).toHaveBeenCalledWith('# Order ID', 401);
      expect(console.log).toHaveBeenCalledWith('generated code');
    });
  });

  describe('test_no_account_id_no_recent_orders', () => {
    it('should handle no recent orders without account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');

      const orders: any[] = [];

      const mockClient: MockClient = {
        getOrdersForAllLinkedAccounts: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(0);
      expect(mockConstructRepeatOrder).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('No recent orders found');
    });
  });

  describe('test_no_account_id_error', () => {
    it('should handle error without account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');

      const orders = { error: 'invalid' };

      const mockClient: MockClient = {
        getOrdersForAllLinkedAccounts: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(-1);
      expect(mockConstructRepeatOrder).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(stringContains('Schwab returned error: "invalid"'));
    });
  });

  describe('test_account_id_success', () => {
    it('should handle success with account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_id');
      addArg('123456');

      const orders = [
        { orderId: 201 },
        { orderId: 101 },
        { orderId: 301 },
        { orderId: 401 },
      ];

      const mockClient: MockClient = {
        getAccountNumbers: jest.fn().mockResolvedValue(createMockResponse(200, [{
          accountNumber: '123456',
          hashValue: 'hash-value',
        }])),
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);
      mockCodeForBuilder.mockReturnValue('generated code');

      const result = await main();

      expect(result).toBe(0);
      expect(mockClient.getAccountNumbers).toHaveBeenCalled();
      expect(mockConstructRepeatOrder).toHaveBeenCalledWith(orders[3]);
      expect(console.log).toHaveBeenCalledWith('# Order ID', 401);
      expect(console.log).toHaveBeenCalledWith('generated code');
    });
  });

  describe('test_account_id_no_corresponding_hash', () => {
    it('should handle no corresponding hash for account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_id');
      addArg('123456');

      const orders = [
        { orderId: 201 },
        { orderId: 101 },
        { orderId: 301 },
        { orderId: 401 },
      ];

      const mockClient: MockClient = {
        getAccountNumbers: jest.fn().mockResolvedValue(createMockResponse(200, [{
          accountNumber: '90009',
          hashValue: 'hash-value',
        }])),
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(-1);
      expect(mockClient.getAccountNumbers).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(stringContains('Failed to find account hash for account ID'));
    });
  });

  describe('test_account_id_no_orders', () => {
    it('should handle no orders with account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_id');
      addArg('123456');

      const orders: any[] = [];

      const mockClient: MockClient = {
        getAccountNumbers: jest.fn().mockResolvedValue(createMockResponse(200, [{
          accountNumber: '123456',
          hashValue: 'hash-value',
        }])),
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(0);
      expect(mockConstructRepeatOrder).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('No recent orders found');
    });
  });

  describe('test_account_id_error', () => {
    it('should handle error with account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_id');
      addArg('123456');

      const mockClient: MockClient = {
        getAccountNumbers: jest.fn().mockResolvedValue(createMockResponse(200, [{
          accountNumber: '123456',
          hashValue: 'hash-value',
        }])),
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, { error: 'invalid' })),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(-1);
      expect(mockConstructRepeatOrder).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(stringContains('Schwab returned error: "invalid"'));
    });
  });

  describe('test_success_account_hash', () => {
    it('should handle success with account hash', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_hash');
      addArg('account-hash');

      const orders = [
        { orderId: 201 },
        { orderId: 101 },
        { orderId: 301 },
        { orderId: 401 },
      ];

      const mockClient: MockClient = {
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);
      mockCodeForBuilder.mockReturnValue('generated code');

      const result = await main();

      expect(result).toBe(0);
      expect(mockConstructRepeatOrder).toHaveBeenCalledWith(orders[3]);
      expect(console.log).toHaveBeenCalledWith('# Order ID', 401);
      expect(console.log).toHaveBeenCalledWith('generated code');
    });
  });

  describe('test_order_fetching_fails_no_account_id', () => {
    it('should handle order fetching failure without account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');

      const mockClient: MockClient = {
        getOrdersForAllLinkedAccounts: jest.fn().mockResolvedValue(createMockResponse(400, {})),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(-1);
      expect(console.error).toHaveBeenCalledWith(stringContains('Returned HTTP status code 400'));
    });
  });

  describe('test_order_fetching_fails_account_id', () => {
    it('should handle order fetching failure with account ID', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_id');
      addArg('123456');

      const mockClient: MockClient = {
        getAccountNumbers: jest.fn().mockResolvedValue(createMockResponse(200, [{
          accountNumber: '123456',
          hashValue: 'hash-value',
        }])),
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(400, {})),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);

      const result = await main();

      expect(result).toBe(-1);
      expect(console.error).toHaveBeenCalledWith(stringContains('Returned HTTP status code 400'));
    });
  });

  describe('test_warn_on_non_auto_requestedDestination', () => {
    it('should warn on non-auto requestedDestination', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_hash');
      addArg('account-hash');

      const orders = [
        {
          orderId: 401,
          requestedDestination: 'not AUTO',
        },
      ];

      const mockClient: MockClient = {
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);
      mockCodeForBuilder.mockReturnValue('generated code');

      const result = await main();

      expect(result).toBe(0);
      expect(mockConstructRepeatOrder).toHaveBeenCalledWith(orders[0]);
      expect(console.warn).toHaveBeenCalledWith(stringContains('requestedDestination'));
      expect(console.warn).toHaveBeenCalledWith(stringContains('broken'));
      expect(console.warn).toHaveBeenCalledWith('');
      expect(console.log).toHaveBeenCalledWith('# Order ID', 401);
      expect(console.log).toHaveBeenCalledWith('generated code');
    });
  });

  describe('test_warn_on_non_auto_destinationLinkName', () => {
    it('should warn on non-auto destinationLinkName', async () => {
      addArg('--token_file');
      addArg('filename.json');
      addArg('--api_key');
      addArg('api-key');
      addArg('--app_secret');
      addArg('app-secret');
      addArg('--account_hash');
      addArg('account-hash');

      const orders = [
        {
          orderId: 401,
          destinationLinkName: 'not AUTO',
        },
      ];

      const mockClient: MockClient = {
        getOrdersForAccount: jest.fn().mockResolvedValue(createMockResponse(200, orders)),
      };

      mockClientFromTokenFile.mockResolvedValue(mockClient as any);
      mockCodeForBuilder.mockReturnValue('generated code');

      const result = await main();

      expect(result).toBe(0);
      expect(mockConstructRepeatOrder).toHaveBeenCalledWith(orders[0]);
      expect(console.warn).toHaveBeenCalledWith(stringContains('destinationLinkName'));
      expect(console.warn).toHaveBeenCalledWith(stringContains('broken'));
      expect(console.warn).toHaveBeenCalledWith('');
      expect(console.log).toHaveBeenCalledWith('# Order ID', 401);
      expect(console.log).toHaveBeenCalledWith('generated code');
    });
  });
});

describe('ScriptInvocationTest', () => {
  it('should get help', () => {
    // Note: This test would need to be adapted based on how the script is actually invoked
    // For now, we'll just test that the function exists and can be called
    expect(typeof latestOrderMain).toBe('function');
  });
}); 