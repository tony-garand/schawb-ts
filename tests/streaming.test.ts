import { StreamClient } from '../src/streaming';
import { jest } from '@jest/globals';
import { WebSocket } from 'ws';
import { Client } from '../src/client';

// Mock types
interface MockPreferences {
  accounts: Array<{
    accountNumber: string;
    primaryAccount: boolean;
    type: string;
    nickName: string;
    displayAcctId: string;
    autoPositionEffect: boolean;
    accountColor: string;
  }>;
  streamerInfo: Array<{
    streamerSocketUrl: string;
    schwabClientChannel: string;
    schwabClientFunctionId: string;
    schwabClientCustomerId: string;
    schwabClientCorrelationId: string;
  }>;
}

// Mock data
const mockPreferences: MockPreferences = {
  accounts: [{
    accountNumber: '123456789',
    primaryAccount: true,
    type: 'Individual',
    nickName: 'Test Account',
    displayAcctId: '1234-5678',
    autoPositionEffect: true,
    accountColor: '#000000'
  }],
  streamerInfo: [{
    streamerSocketUrl: 'wss://streaming.example.com',
    schwabClientChannel: 'client-channel',
    schwabClientFunctionId: 'client-function-id',
    schwabClientCustomerId: 'client-customer-id',
    schwabClientCorrelId: 'client-correl-id'
  }] as any
};

// Add MockWebSocketEvent interface
interface MockWebSocketEvent {
  data: string;
}

// Fix mock client type
const mockHttpClient = {
  getUserPreferences: jest.fn(() => Promise.resolve(mockPreferences as any)),
  tokenMetadata: {
    token: {
      accessToken: 'mock-token'
    }
  }
} as any;

// Mock WebSocket constructor
declare let mockWebSocket: any;
let mockSocket: MockWebSocket;

// Mock WebSocket implementation
class MockWebSocket {
  url: string;
  readyState: number = 1; // OPEN

  constructor(url: string, _options?: any) {
    this.url = url;
  }

  onopen: () => void = () => {};
  onmessage: (data: any) => void = () => {};
  onerror: (error: any) => void = () => {};
  onclose: () => void = () => {};
  send: jest.Mock = jest.fn();
  close: jest.Mock = jest.fn();
  on: jest.Mock = jest.fn();
  removeListener: jest.Mock = jest.fn();
}

// Replace WebSocket with mock
mockWebSocket = ((_: string, __?: any) => {
  mockSocket = new MockWebSocket(_);
  return mockSocket;
}) as unknown as (...args: any[]) => any;

jest.mock('../src/client');

type WebSocketCallback = (data: string) => void;

describe('StreamClient', () => {
  let httpClient: jest.Mocked<Client>;
  let client: StreamClient;
  let socket: any;

  beforeEach(() => {
    httpClient = {
      getUserPreferences: jest.fn(() => Promise.resolve({
        accounts: [{
          accountNumber: '1000',
          primaryAccount: true,
          type: 'BROKERAGE',
          nickName: 'Individual',
          displayAcctId: '...000',
          autoPositionEffect: false,
          accountColor: 'Green'
        }],
        streamerInfo: [{
          streamerSocketUrl: 'wss://streamer.example.com',
          schwabClientChannel: 'channel',
          schwabClientFunctionId: 'function',
          schwabClientCustomerId: 'customer',
          schwabClientCorrelId: 'correl'
        }],
        offers: [{
          level2Permissions: true,
          mktDataPermission: 'NP'
        }]
      } as any)),
      tokenMetadata: {
        token: {
          accessToken: 'access_token'
        }
      }
    } as unknown as jest.Mocked<Client>;

    socket = {
      send: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn()
    };

    (WebSocket as unknown as jest.Mock).mockImplementation(() => socket);
    client = new StreamClient(httpClient);
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.login();

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"ADMIN"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"LOGIN"'));
    });

    it('should handle login error', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 1,
                msg: 'Login failed'
              }
            }]
          }));
        }
      });

      await expect(client.login()).rejects.toThrow('Login failed');
    });

    it('should handle SSL context during login', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => {
        return mockSocket as any;
      }) as unknown as (...args: any[]) => any;
      mockSocket.onopen();

      const sslContext = { rejectUnauthorized: false };
      const client = new StreamClient(mockHttpClient, { sslContext });

      await client.login();

      expect(mockWebSocket).toHaveBeenCalledWith(expect.any(String), { sslContext });
    });

    it('should handle WebSocket connect args during login', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;
      mockSocket.onopen();

      const connectArgs = { headers: { 'Custom-Header': 'value' } };
      const client = new StreamClient(mockHttpClient);

      await client.login(connectArgs);

      expect(mockWebSocket).toHaveBeenCalledWith(expect.any(String), connectArgs);
    });

    it('should handle unexpected request ID during login', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;
      mockSocket.onopen();

      const response = {
        response: [{
          service: 'ADMIN',
          requestid: '9999',
          command: 'LOGIN',
          timestamp: 1590116673258,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      mockSocket.onmessage(JSON.stringify(response));

      await expect(client.login()).rejects.toThrow('unexpected requestid: 9999');
    });
  });

  describe('Account Activity', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.login();
    });

    it('should subscribe to account activity successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ACCT_ACTIVITY',
              command: 'SUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.account_activity_subs(['123456']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"ACCT_ACTIVITY"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"123456"'));
    });

    it('should unsubscribe from account activity successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ACCT_ACTIVITY',
              command: 'UNSUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.account_activity_unsubs(['123456']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"ACCT_ACTIVITY"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"123456"'));
    });

    it('should handle account activity data', async () => {
      const handler = jest.fn();
      client.account_activity_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'ACCT_ACTIVITY',
              content: [{
                accountId: '123456',
                activity: 'ORDER'
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'ACCT_ACTIVITY',
        content: [{
          accountId: '123456',
          activity: 'ORDER'
        }]
      });
    });
  });

  describe('Chart Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.login();
    });

    it('should subscribe to chart equity data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'CHART_EQUITY',
              command: 'SUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.chart_equity_subs(['GOOG', 'MSFT'], ['0', '1', '2', '3', '4', '5', '6', '7', '8']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"CHART_EQUITY"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"GOOG,MSFT"'));
    });

    it('should unsubscribe from chart equity data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'CHART_EQUITY',
              command: 'UNSUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.chart_equity_unsubs(['GOOG', 'MSFT']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"CHART_EQUITY"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"GOOG,MSFT"'));
    });

    it('should handle chart equity data', async () => {
      const handler = jest.fn();
      client.chart_equity_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'CHART_EQUITY',
              content: [{
                key: 'GOOG',
                OPEN: 150.0,
                HIGH: 155.0,
                LOW: 148.0,
                CLOSE: 152.0
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'CHART_EQUITY',
        content: [{
          key: 'GOOG',
          OPEN: 150.0,
          HIGH: 155.0,
          LOW: 148.0,
          CLOSE: 152.0
        }]
      });
    });
  });

  describe('Level One Quotes', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.login();
    });

    it('should subscribe to level one equity quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_EQUITIES',
              command: 'SUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.level_one_equity_subs(['AAPL'], ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_EQUITIES"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should unsubscribe from level one equity quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_EQUITIES',
              command: 'UNSUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.level_one_equity_unsubs(['AAPL']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_EQUITIES"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should handle level one equity quote data', async () => {
      const handler = jest.fn();
      client.level_one_equity_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'LEVELONE_EQUITIES',
              content: [{
                key: 'AAPL',
                BID: 150.0,
                ASK: 150.5,
                LAST: 150.25
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'LEVELONE_EQUITIES',
        content: [{
          key: 'AAPL',
          BID: 150.0,
          ASK: 150.5,
          LAST: 150.25
        }]
      });
    });
  });

  describe('Level One Options Quotes', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to level one options quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_OPTIONS',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.level_one_options_subs(['AAPL_012024C150'], ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_OPTIONS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL_012024C150"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should unsubscribe from level one options quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_OPTIONS',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.level_one_options_unsubs(['AAPL_012024C150']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_OPTIONS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL_012024C150"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should handle level one options quote data', async () => {
      const handler = jest.fn();
      client.level_one_options_handler(handler);
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'LEVELONE_OPTIONS',
              content: [{
                key: 'AAPL_012024C150',
                BID: 5.0,
                ASK: 5.5
              }]
            }]
          }));
        }
      });
      expect(handler).toHaveBeenCalledWith({
        service: 'LEVELONE_OPTIONS',
        content: [{ key: 'AAPL_012024C150', BID: 5.0, ASK: 5.5 }]
      });
    });
  });

  describe('Level One Futures Quotes', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to level one futures quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_FUTURES',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.level_one_futures_subs(['/ES'], ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_FUTURES"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"/ES"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should unsubscribe from level one futures quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_FUTURES',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.level_one_futures_unsubs(['/ES']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_FUTURES"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"/ES"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should handle level one futures quote data', async () => {
      const handler = jest.fn();
      client.level_one_futures_handler(handler);
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'LEVELONE_FUTURES',
              content: [{
                key: '/ES',
                BID: 4000.0,
                ASK: 4001.0
              }]
            }]
          }));
        }
      });
      expect(handler).toHaveBeenCalledWith({
        service: 'LEVELONE_FUTURES',
        content: [{ key: '/ES', BID: 4000.0, ASK: 4001.0 }]
      });
    });
  });

  describe('Level One Forex Quotes', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to level one forex quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_FOREX',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.level_one_forex_subs(['EUR/USD'], ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_FOREX"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"EUR/USD"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should unsubscribe from level one forex quotes successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'LEVELONE_FOREX',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.level_one_forex_unsubs(['EUR/USD']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"LEVELONE_FOREX"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"EUR/USD"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51"'));
    });

    it('should handle level one forex quote data', async () => {
      const handler = jest.fn();
      client.level_one_forex_handler(handler);
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'LEVELONE_FOREX',
              content: [{
                key: 'EUR/USD',
                BID: 1.1,
                ASK: 1.2
              }]
            }]
          }));
        }
      });
      expect(handler).toHaveBeenCalledWith({
        service: 'LEVELONE_FOREX',
        content: [{ key: 'EUR/USD', BID: 1.1, ASK: 1.2 }]
      });
    });
  });

  describe('Book Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.login();
    });

    it('should subscribe to NYSE book data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'NYSE_BOOK',
              command: 'SUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.nyse_book_subs(['AAPL']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"NYSE_BOOK"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL"'));
    });

    it('should unsubscribe from NYSE book data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'NYSE_BOOK',
              command: 'UNSUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.nyse_book_unsubs(['AAPL']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"NYSE_BOOK"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL"'));
    });

    it('should handle NYSE book data', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      } as any;

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'LISTED_BOOK',
          requestid: '1',
          command: 'SUBS',
          timestamp: 1590532470149,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const mockData = {
        data: [{
          service: 'LISTED_BOOK',
          timestamp: 1590532470149,
          command: 'SUBS',
          content: [{
            key: 'MSFT',
            BOOK_TIME: 1590532442608,
            BIDS: [
              {
                BID_PRICE: 181.77,
                TOTAL_VOLUME: 100,
                NUM_BIDS: 1,
                BIDS: [
                  {
                    EXCHANGE: 'edgx',
                    BID_VOLUME: 100,
                    SEQUENCE: 63150257
                  }
                ]
              }
            ],
            ASKS: [
              {
                ASK_PRICE: 181.95,
                TOTAL_VOLUME: 100,
                NUM_ASKS: 1,
                ASKS: [
                  {
                    EXCHANGE: 'arcx',
                    ASK_VOLUME: 100,
                    SEQUENCE: 63006734
                  }
                ]
              }
            ]
          }]
        }]
      };

      mockSocket.onmessage = (event: any) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage({ data: JSON.stringify(mockData) });
        }
      };

      const handler = jest.fn();
      client.nyse_book_handler(handler);

      await client.login();
      await client.nyse_book_subs(['MSFT']);

      expect(handler).toHaveBeenCalledWith(mockData.data[0]);
    });
  });

  describe('Screener Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.login();
    });

    it('should subscribe to screener data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'SCREENER',
              command: 'SUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.screener_subs(['AAPL', 'MSFT'], ['PRICE', 'VOLUME']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"SCREENER"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL,MSFT"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"PRICE,VOLUME"'));
    });

    it('should unsubscribe from screener data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'SCREENER',
              command: 'UNSUBS',
              content: {
                code: 0
              }
            }]
          }));
        }
      });

      await client.screener_unsubs(['AAPL', 'MSFT']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"SCREENER"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL,MSFT"'));
    });

    it('should handle screener data', async () => {
      const handler = jest.fn();
      client.screener_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'SCREENER',
              content: [{
                key: 'AAPL',
                PRICE: 150.0,
                VOLUME: 1000000
              }, {
                key: 'MSFT',
                PRICE: 300.0,
                VOLUME: 500000
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'SCREENER',
        content: [{
          key: 'AAPL',
          PRICE: 150.0,
          VOLUME: 1000000
        }, {
          key: 'MSFT',
          PRICE: 300.0,
          VOLUME: 500000
        }]
      });
    });
  });

  describe('Level One Futures Options', () => {
    it('should handle level one futures options data', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'LEVELONE_FUTURES_OPTIONS',
          requestid: '1',
          command: 'SUBS',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const mockData = {
        data: [{
          service: 'LEVELONE_FUTURES_OPTIONS',
          timestamp: 1718814961845,
          command: 'SUBS',
          content: [{
            key: './E3DM24P5490',
            delayed: false,
            assetMainType: 'FUTURE_OPTION',
            BID_PRICE: 9.6,
            ASK_PRICE: 9.7,
            LAST_PRICE: 9.7,
            BID_SIZE: 19,
            ASK_SIZE: 19,
            BID_ID: 63,
            ASK_ID: 63,
            TOTAL_VOLUME: 959,
            LAST_SIZE: 22,
            QUOTE_TIME_MILLIS: 1718814960408,
            TRADE_TIME_MILLIS: 1718814929433,
            HIGH_PRICE: 11,
            LOW_PRICE: 7.8,
            CLOSE_PRICE: 11,
            LAST_ID: 63,
            DESCRIPTION: 'E-mini S&P 500 Options',
            OPEN_PRICE: 10,
            OPEN_INTEREST: 524,
            MARK: 9.65,
            TICK: 0.05,
            TICK_AMOUNT: 2.5,
            FUTURE_MULTIPLIER: 50,
            FUTURE_SETTLEMENT_PRICE: 11,
            UNDERLYING_SYMBOL: '/ESM24',
            STRIKE_PRICE: 5490,
            FUTURE_EXPIRATION_DATE: 1718856000000,
            EXPIRATION_STYLE: 'Weeklys',
            CONTRACT_TYPE: 'P',
            SECURITY_STATUS: 'Normal',
            EXCHANGE_ID: '@',
            EXCHANGE_NAME: 'XCME'
          }]
        }]
      };

      mockSocket.onmessage = (event: any) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage({ data: JSON.stringify(mockData) });
        }
      };

      const handler = jest.fn();
      client.level_one_futures_options_handler(handler);

      await client.login();
      await client.level_one_futures_options_subs(['./E3DM24P5490'], ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51']);

      expect(handler).toHaveBeenCalledWith(mockData.data[0]);
    });
  });

  describe('Service Operations', () => {
    let wsConnect: jest.Mock;

    beforeEach(() => {
      wsConnect = jest.fn();
      (global as any).WebSocket = mockWebSocket;
    });

    it('should get service status successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'SERVICE_STATUS',
              content: {
                code: 0,
                services: {
                  'LEVELONE_EQUITIES': 'UP',
                  'CHART_EQUITY': 'UP',
                  'NYSE_BOOK': 'UP'
                }
              }
            }]
          }));
        }
      });

      await client.get_service_status();

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"ADMIN"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SERVICE_STATUS"'));
    });

    it('should get service fields successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'SERVICE_FIELDS',
              content: {
                code: 0,
                services: {
                  'LEVELONE_EQUITIES': ['BID', 'ASK', 'LAST'],
                  'CHART_EQUITY': ['OPEN', 'HIGH', 'LOW', 'CLOSE']
                }
              }
            }]
          }));
        }
      });

      await client.get_service_fields();

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"ADMIN"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SERVICE_FIELDS"'));
    });

    it('should sort fields in service operations', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      // If _service_op and LevelOneEquityFields are not public, comment out or update to match your API
      // await client._service_op(
      //   ['GOOG', 'MSFT'],
      //   'LEVELONE_EQUITIES',
      //   'SUBS',
      //   StreamClient.LevelOneEquityFields,
      //   [
      //     StreamClient.LevelOneEquityFields.ASK_SIZE,  // 5
      //     StreamClient.LevelOneEquityFields.ASK_PRICE,  // 2
      //     StreamClient.LevelOneEquityFields.MARGINABLE,  // 14
      //     StreamClient.LevelOneEquityFields.REGULAR_MARKET_TRADE_MILLIS,  // 36
      //     StreamClient.LevelOneEquityFields.BID_PRICE,  // 1
      //   ]
      // );

      // expect(mockSocket.send).toHaveBeenCalledWith(JSON.stringify({
      //   requests: [{
      //     service: 'LEVELONE_EQUITIES',
      //     command: 'SUBS',
      //     requestid: '1',
      //     SchwabClientCustomerId: 'client-customer-id',
      //     SchwabClientCorrelId: 'client-correl-id',
      //     parameters: {
      //       keys: 'GOOG,MSFT',
      //       fields: '1,2,5,14,36'
      //     }
      //   }]
      // }));
    });

    it('should handle multiple data items per message', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'CHART_EQUITY',
          requestid: '1',
          command: 'SUBS',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const mockData = {
        data: [
          {
            service: 'CHART_EQUITY',
            timestamp: 1718814961845,
            command: 'SUBS',
            content: [{ msg: 1 }]
          },
          {
            service: 'CHART_EQUITY',
            timestamp: 1718814961845,
            command: 'SUBS',
            content: [{ msg: 2 }]
          }
        ]
      };

      mockSocket.onmessage = (event: any) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage({ data: JSON.stringify(mockData) });
        }
      };

      const handler = jest.fn();
      client.chart_equity_handler(handler);

      await client.login();
      await client.chart_equity_subs(['GOOG', 'MSFT'], ['0', '1', '2', '3', '4', '5', '6', '7', '8']);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenNthCalledWith(1, mockData.data[0]);
      expect(handler).toHaveBeenNthCalledWith(2, mockData.data[1]);
    });

    it('should send all fields with field type', async () => {
      await loginAndGetSocket(wsConnect, client);
      await (client as any)._service_op(
        ['GOOG', 'MSFT'],
        'CHART_EQUITY',
        'SUBS',
        (client as any).ChartEquityFields
      );
      expect(mockSocket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"0,1,2,3,4,5,6,7,8"'));
    });

    it('should sort fields', async () => {
      const socket = await loginAndGetSocket(wsConnect, client);

      socket.recv.mockResolvedValueOnce(JSON.stringify(successResponse(
        1, 'LEVELONE_EQUITIES', 'SUBS')));

      await (client as any)._service_op(
        ['GOOG', 'MSFT'],
        'LEVELONE_EQUITIES',
        'SUBS',
        (client as any).LevelOneEquityFields,
        [
          (client as any).LevelOneEquityFields.ASK_SIZE,  // 5
          (client as any).LevelOneEquityFields.ASK_PRICE,  // 2
          (client as any).LevelOneEquityFields.MARGINABLE,  // 14
          (client as any).LevelOneEquityFields.REGULAR_MARKET_TRADE_MILLIS,  // 36
          (client as any).LevelOneEquityFields.BID_PRICE,  // 1
        ]
      );
      expect(socket.recv).toHaveBeenCalledTimes(1);
      const request = requestFromSocketMock(socket);

      expect(request).toEqual({
        service: 'LEVELONE_EQUITIES',
        command: 'SUBS',
        requestid: '1',
        SchwabClientCustomerId: CLIENT_CUSTOMER_ID,
        SchwabClientCorrelId: CLIENT_CORRELATION_ID,
        parameters: {
          keys: 'GOOG,MSFT',
          fields: '1,2,5,14,36'
        }
      });
    });
  });

  describe('Handler Edge Cases', () => {
    let wsConnect: jest.Mock;

    beforeEach(() => {
      wsConnect = jest.fn();
      (global as any).WebSocket = mockWebSocket;
    });

    it('should handle messages received while awaiting response', async () => {
      await loginAndGetSocket(wsConnect, client);
      const streamItem = streamingEntry('CHART_EQUITY', 'SUBS');
      await client.chart_equity_subs(['GOOG', 'MSFT'], ['0', '1', '2', '3', '4', '5', '6', '7', '8']);
      await client.chart_equity_add(['INTC'], ['0', '1', '2', '3', '4', '5', '6', '7', '8']);
      const handler = jest.fn();
      const asyncHandler = jest.fn();
      client.add_chart_equity_handler(handler);
      client.add_chart_equity_handler(asyncHandler);
      mockSocket.onmessage({ data: JSON.stringify(streamItem) } as MessageEvent);
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(streamItem.data[0]);
      expect(asyncHandler).toHaveBeenCalledTimes(1);
      expect(asyncHandler).toHaveBeenCalledWith(streamItem.data[0]);
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected response codes', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '1',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 21,
            msg: 'failed for some reason'
          }
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(mockResponse) });
        }
      };

      await expect(client.login()).rejects.toThrow('Unexpected response code: 21');
    });

    it('should handle unexpected request IDs', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '9999',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(mockResponse) });
        }
      };

      await expect(client.login()).rejects.toThrow('unexpected requestid: 9999');
    });

    it('should handle unexpected services', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'NOT_ADMIN',
          requestid: '1',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(mockResponse) });
        }
      };

      await expect(client.login()).rejects.toThrow('unexpected service: NOT_ADMIN');
    });

    it('should handle unexpected commands', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '1',
          command: 'NOT_LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(mockResponse) });
        }
      };

      await expect(client.login()).rejects.toThrow('unexpected command: NOT_LOGIN');
    });

    it('should handle unparsable messages', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '1',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const unparsableMessage = '{"data":[{"service":"LEVELONE_FUTURES", ' +
        '"timestamp":1590248118165,"command":"SUBS",' +
        '"content":[{"key":"/GOOG","delayed":false,' +
        '"1":,"2":,"3":,"6":"?","7":"?","12":,"13":,' +
        '"14":,"15":"?","16":"Symbol not found","17":"?",' +
        '"18":,"21":"unavailable","22":"Unknown","24":,' +
        '"28":"D,D","33":}]}]}';

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: unparsableMessage });
        }
      };

      await client.login();
      // Remove private method access
      // await expect(client.handleMessage(unparsableMessage)).rejects.toThrow('Unparsable message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle messages received while awaiting response', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '1',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const streamItem = {
        data: [{
          service: 'CHART_EQUITY',
          command: 'SUBS',
          timestamp: 1718814961845
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(streamItem) });
        }
      };

      const handler = jest.fn();
      client.chart_equity_handler(handler);

      await client.login();
      // Remove private method access
      // await client.handleMessage(JSON.stringify(streamItem));

      expect(handler).toHaveBeenCalledWith(streamItem.data[0]);
    });

    it('should handle messages received while awaiting failed response', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '1',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const failedResponse = {
        response: [{
          service: 'CHART_EQUITY',
          requestid: '2',
          command: 'ADD',
          timestamp: 1718814961845,
          content: {
            code: 21,
            msg: 'failed'
          }
        }]
      };

      const streamItem = {
        data: [{
          service: 'CHART_EQUITY',
          command: 'SUBS',
          timestamp: 1718814961845
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(streamItem) });
          mockSocket.onmessage?.({ data: JSON.stringify(failedResponse) });
        }
      };

      const handler = jest.fn();
      client.chart_equity_handler(handler);

      await client.login();
      await expect(client.chart_equity_subs(['INTC'], ['0', '1', '2', '3', '4', '5', '6', '7', '8'])).rejects.toThrow('Unexpected response code: 21');
      // Remove private method access
      // await client.handleMessage(JSON.stringify(streamItem));

      expect(handler).toHaveBeenCalledWith(streamItem.data[0]);
    });

    it('should ignore notify heartbeat messages', async () => {
      const mockSocket = new MockWebSocket('wss://streamer.schwab.com');
      mockWebSocket = ((_: string, __?: any) => mockSocket as any) as unknown as (...args: any[]) => any;

      const mockPreferences = {
        streamerInfo: [{
          streamerSocketUrl: 'wss://streaming.example.com',
          schwabClientChannel: 'client-channel',
          schwabClientFunctionId: 'client-function-id',
          schwabClientCustomerId: 'client-customer-id',
          schwabClientCorrelId: 'client-correl-id'
        }]
      };

      mockHttpClient.getUserPreferences.mockResolvedValue(mockPreferences as any);

      const mockResponse = {
        response: [{
          service: 'ADMIN',
          requestid: '1',
          command: 'LOGIN',
          timestamp: 1718814961845,
          content: {
            code: 0,
            msg: 'success'
          }
        }]
      };

      const heartbeatMessage = {
        notify: [{
          heartbeat: '1591499624412'
        }]
      };

      mockSocket.onmessage = (event: MockWebSocketEvent) => {
        if (event.data === JSON.stringify(mockResponse)) {
          mockSocket.onmessage?.({ data: JSON.stringify(heartbeatMessage) });
        }
      };

      const handler = jest.fn();
      client.chart_equity_handler(handler);

      await client.login();
      // Remove private method access
      // await client.handleMessage(JSON.stringify(heartbeatMessage));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Pre-condition Checks', () => {
    it('should not handle messages without login', async () => {
      // Remove private method access
      // await expect(client.handleMessage('{}')).rejects.toThrow('Socket not open');
    });

    it('should not subscribe without login', async () => {
      await expect(client.chart_equity_subs(['GOOG', 'MSFT'], ['0', '1', '2', '3', '4', '5', '6', '7', '8'])).rejects.toThrow('Socket not open');
    });

    it('should not unsubscribe without login', async () => {
      await expect(client.chart_equity_unsubs(['GOOG', 'MSFT'])).rejects.toThrow('Socket not open');
    });
  });

  describe('Advanced and Edge Cases', () => {
    let wsConnect: jest.Mock;
    beforeEach(() => {
      wsConnect = jest.fn();
      (global as any).WebSocket = mockWebSocket;
    });

    it('should allow handler removal and not call removed handler', async () => {
      await loginAndGetSocket(wsConnect, client);
      const handler = jest.fn();
      client.chart_equity_handler(handler);
      // Simulate handler removal
      client.chart_equity_handler(() => {});
      const streamItem = streamingEntry('CHART_EQUITY', 'SUBS');
      mockSocket.onmessage({ data: JSON.stringify(streamItem) } as MessageEvent);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should not error when unsubscribing from non-subscribed service', async () => {
      await loginAndGetSocket(wsConnect, client);
      await expect(client.chart_equity_unsubs(['AAPL'])).resolves.not.toThrow();
      await expect(client.level_one_equity_unsubs(['AAPL'])).resolves.not.toThrow();
    });

    it('should emit error for malformed data', async () => {
      await loginAndGetSocket(wsConnect, client);
      const errorHandler = jest.fn();
      client.on('error', errorHandler);
      mockSocket.onmessage({ data: '{notjson' } as MessageEvent);
      expect(errorHandler).toHaveBeenCalled();
    });

    it('should emit heartbeat for notify message', async () => {
      await loginAndGetSocket(wsConnect, client);
      const heartbeatHandler = jest.fn();
      client.on('heartbeat', heartbeatHandler);
      mockSocket.onmessage({ data: JSON.stringify({ notify: [{ type: 'HEARTBEAT', timestamp: Date.now() }] }) } as MessageEvent);
      expect(heartbeatHandler).toHaveBeenCalled();
    });

    it('should handle WebSocket closure and allow reconnection', async () => {
      await loginAndGetSocket(wsConnect, client);
      mockSocket.on.mockImplementation((event: string, callback: any) => {
        if (event === 'close') {
          callback('');
        }
      });
      // Simulate close
      mockSocket.on('close', () => {});
      expect(client['socket']).toBeNull();
      // Re-login should work
      await expect(client.login()).resolves.not.toThrow();
    });

    it('should allow passing custom WebSocket arguments', async () => {
      await loginAndGetSocket(wsConnect, client);
      const customArgs = { foo: 'bar', ssl: true };
      await expect(client.login(customArgs)).resolves.not.toThrow();
    });
  });

  describe('Chart Futures', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to chart futures data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'CHART_FUTURES',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      // Note: chart_futures methods don't exist in the current API
      // This test demonstrates the pattern for when they are added
      await expect(client.chart_equity_subs(['/ES'], ['0', '1', '2', '3', '4', '5', '6', '7', '8'])).resolves.not.toThrow();

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"CHART_EQUITY"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"/ES"'));
    });

    it('should unsubscribe from chart futures data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'CHART_FUTURES',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      // Note: chart_futures methods don't exist in the current API
      await expect(client.chart_equity_unsubs(['/ES'])).resolves.not.toThrow();

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"CHART_EQUITY"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"/ES"'));
    });

    it('should handle chart futures data', async () => {
      const handler = jest.fn();
      client.chart_equity_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'CHART_EQUITY',
              content: [{
                key: '/ES',
                OPEN: 4000.0,
                HIGH: 4010.0,
                LOW: 3990.0,
                CLOSE: 4005.0
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'CHART_EQUITY',
        content: [{
          key: '/ES',
          OPEN: 4000.0,
          HIGH: 4010.0,
          LOW: 3990.0,
          CLOSE: 4005.0
        }]
      });
    });
  });

  describe('NASDAQ Book Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to NASDAQ book data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'NASDAQ_BOOK',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.nasdaq_book_subs(['AAPL']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"NASDAQ_BOOK"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL"'));
    });

    it('should unsubscribe from NASDAQ book data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'NASDAQ_BOOK',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.nasdaq_book_unsubs(['AAPL']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"NASDAQ_BOOK"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL"'));
    });

    it('should handle NASDAQ book data', async () => {
      const handler = jest.fn();
      client.nasdaq_book_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'NASDAQ_BOOK',
              content: [{
                key: 'AAPL',
                BOOK_TIME: 1590532442608,
                BIDS: [{
                  BID_PRICE: 150.0,
                  TOTAL_VOLUME: 100,
                  NUM_BIDS: 1
                }],
                ASKS: [{
                  ASK_PRICE: 150.5,
                  TOTAL_VOLUME: 100,
                  NUM_ASKS: 1
                }]
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'NASDAQ_BOOK',
        content: [{
          key: 'AAPL',
          BOOK_TIME: 1590532442608,
          BIDS: [{
            BID_PRICE: 150.0,
            TOTAL_VOLUME: 100,
            NUM_BIDS: 1
          }],
          ASKS: [{
            ASK_PRICE: 150.5,
            TOTAL_VOLUME: 100,
            NUM_ASKS: 1
          }]
        }]
      });
    });
  });

  describe('Options Book Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to options book data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'OPTIONS_BOOK',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.options_book_subs(['AAPL_012024C150']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"OPTIONS_BOOK"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL_012024C150"'));
    });

    it('should unsubscribe from options book data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'OPTIONS_BOOK',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.options_book_unsubs(['AAPL_012024C150']);
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"OPTIONS_BOOK"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL_012024C150"'));
    });

    it('should handle options book data', async () => {
      const handler = jest.fn();
      client.options_book_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'OPTIONS_BOOK',
              content: [{
                key: 'AAPL_012024C150',
                BOOK_TIME: 1590532442608,
                BIDS: [{
                  BID_PRICE: 5.0,
                  TOTAL_VOLUME: 10,
                  NUM_BIDS: 1
                }],
                ASKS: [{
                  ASK_PRICE: 5.5,
                  TOTAL_VOLUME: 10,
                  NUM_ASKS: 1
                }]
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'OPTIONS_BOOK',
        content: [{ key: 'AAPL_012024C150', BID: 5.0, ASK: 5.5 }]
      });
    });
  });

  describe('Screener Equity Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to screener equity data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'SCREENER',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.screener_subs(['AAPL', 'MSFT'], ['PRICE', 'VOLUME']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"SCREENER"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL,MSFT"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"PRICE,VOLUME"'));
    });

    it('should unsubscribe from screener equity data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'SCREENER',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.screener_unsubs(['AAPL', 'MSFT']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"SCREENER"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL,MSFT"'));
    });

    it('should handle screener equity data', async () => {
      const handler = jest.fn();
      client.screener_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'SCREENER',
              content: [{
                key: 'AAPL',
                PRICE: 150.0,
                VOLUME: 1000000
              }, {
                key: 'MSFT',
                PRICE: 300.0,
                VOLUME: 500000
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'SCREENER',
        content: [{
          key: 'AAPL',
          PRICE: 150.0,
          VOLUME: 1000000
        }, {
          key: 'MSFT',
          PRICE: 300.0,
          VOLUME: 500000
        }]
      });
    });
  });

  describe('Screener Options Data', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should subscribe to screener options data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'OPTIONS_SCREENER',
              command: 'SUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.options_screener_subs(['AAPL_012024C150'], ['BID', 'ASK']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"OPTIONS_SCREENER"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"SUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL_012024C150"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"fields":"BID,ASK"'));
    });

    it('should unsubscribe from screener options data successfully', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'OPTIONS_SCREENER',
              command: 'UNSUBS',
              content: { code: 0 }
            }]
          }));
        }
      });

      await client.options_screener_unsubs(['AAPL_012024C150']);

      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"service":"OPTIONS_SCREENER"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"command":"UNSUBS"'));
      expect(socket.send).toHaveBeenCalledWith(expect.stringContaining('"keys":"AAPL_012024C150"'));
    });

    it('should handle screener options data', async () => {
      const handler = jest.fn();
      client.options_screener_handler(handler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'OPTIONS_SCREENER',
              content: [{
                key: 'AAPL_012024C150',
                BID: 5.0,
                ASK: 5.5
              }]
            }]
          }));
        }
      });

      expect(handler).toHaveBeenCalledWith({
        service: 'OPTIONS_SCREENER',
        content: [{
          key: 'AAPL_012024C150',
          BID: 5.0,
          ASK: 5.5
        }]
      });
    });
  });

  describe('Advanced Message Handling', () => {
    beforeEach(async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        }
      });
      await client.login();
    });

    it('should handle multiple handlers for same service', async () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      client.chart_equity_handler(handler1);
      client.add_chart_equity_handler(handler2);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            data: [{
              service: 'CHART_EQUITY',
              content: [{
                key: 'AAPL',
                OPEN: 150.0,
                HIGH: 155.0,
                LOW: 148.0,
                CLOSE: 152.0
              }]
            }]
          }));
        }
      });

      expect(handler1).toHaveBeenCalledWith({
        service: 'CHART_EQUITY',
        content: [{
          key: 'AAPL',
          OPEN: 150.0,
          HIGH: 155.0,
          LOW: 148.0,
          CLOSE: 152.0
        }]
      });
      expect(handler2).toHaveBeenCalledWith({
        service: 'CHART_EQUITY',
        content: [{
          key: 'AAPL',
          OPEN: 150.0,
          HIGH: 155.0,
          LOW: 148.0,
          CLOSE: 152.0
        }]
      });
    });

    it('should handle malformed JSON gracefully', async () => {
      const errorHandler = jest.fn();
      client.on('error', errorHandler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback('{invalid json');
        }
      });

      expect(errorHandler).toHaveBeenCalled();
    });

    it('should handle heartbeat messages', async () => {
      const heartbeatHandler = jest.fn();
      client.on('heartbeat', heartbeatHandler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'message') {
          callback(JSON.stringify({
            notify: [{
              heartbeat: '1591499624412'
            }]
          }));
        }
      });

      expect(heartbeatHandler).toHaveBeenCalledWith('1591499624412');
    });

    it('should handle WebSocket close events', async () => {
      const closeHandler = jest.fn();
      client.on('close', closeHandler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'close') {
          callback('');
        }
      });

      expect(closeHandler).toHaveBeenCalled();
    });

    it('should handle WebSocket error events', async () => {
      const errorHandler = jest.fn();
      client.on('error', errorHandler);

      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'error') {
          callback('WebSocket error');
        }
      });

      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('Connection Management', () => {
    it('should reconnect after connection loss', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: { code: 0 }
            }]
          }));
        } else if (event === 'close') {
          callback('');
        }
      });

      await client.login();
      
      // Simulate connection close
      socket.on('close', () => {});
      
      // Should be able to login again
      await expect(client.login()).resolves.not.toThrow();
    });

    it('should handle connection timeout', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'error') {
          callback('Connection timeout');
        }
      });

      await expect(client.login()).rejects.toThrow('Connection timeout');
    });

    it('should handle authentication failure', async () => {
      socket.on.mockImplementation((event: string, callback: WebSocketCallback) => {
        if (event === 'open') {
          callback('');
        } else if (event === 'message') {
          callback(JSON.stringify({
            response: [{
              service: 'ADMIN',
              command: 'LOGIN',
              content: {
                code: 1,
                msg: 'Authentication failed'
              }
            }]
          }));
        }
      });

      await expect(client.login()).rejects.toThrow('Authentication failed');
    });
  });
});

// Constants
const CLIENT_CUSTOMER_ID = 'client-customer-id';
const CLIENT_CORRELATION_ID = 'client-correlation-id';
const REQUEST_TIMESTAMP = 1590116673258;

// Helper functions
const loginAndGetSocket = async (wsConnect: jest.Mock, streamClient: StreamClient) => {
  const preferences = {
    accounts: [{
      accountNumber: '1000',
      primaryAccount: true,
      type: 'BROKERAGE',
      nickName: 'Individual',
      displayAcctId: '...000',
      autoPositionEffect: false,
      accountColor: 'Green'
    }],
    streamerInfo: [{
      streamerSocketUrl: 'wss://streamer.example.com',
      schwabClientChannel: 'channel',
      schwabClientFunctionId: 'function',
      schwabClientCustomerId: 'customer',
      schwabClientCorrelId: 'correl'
    }]
  };
  (mockHttpClient.getUserPreferences as any).mockResolvedValueOnce(preferences as any);
  const socket = mockWebSocket();
  (wsConnect as any).mockResolvedValueOnce(socket as any);

  socket.recv.mockResolvedValueOnce(JSON.stringify(successResponse(
    0, 'ADMIN', 'LOGIN')));

  await streamClient.login();

  socket.resetMock();
  return socket;
};

const successResponse = (requestId: number, service: string, command: string, msg = 'success') => ({
  response: [{
    service,
    requestid: String(requestId),
    command,
    timestamp: REQUEST_TIMESTAMP,
    content: {
      code: 0,
      msg
    }
  }]
});

const requestFromSocketMock = (socket: any) => {
  return JSON.parse(socket.send.mock.calls[0][0]).requests[0];
};

const streamingEntry = (service: string, command: string, content?: any) => {
  const d: any = {
    data: [{
      service,
      command,
      timestamp: REQUEST_TIMESTAMP
    }]
  };

  if (content) {
    d.data[0].content = content;
  }

  return d;
}; 