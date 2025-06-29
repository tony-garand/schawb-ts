import { jest } from '@jest/globals';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as https from 'https';
import * as child_process from 'child_process';
import { Client } from '../src/client';
import { TokenMetadata, clientFromLoginFlow, clientFromTokenFile, clientFromAccessFunctions, clientFromReceivedUrl, clientFromManualFlow, easyClient } from '../src/auth';

// Mock dependencies
jest.mock('open');
jest.mock('../src/client');
jest.mock('crypto');
jest.mock('https');
jest.mock('child_process');

// Constants
const API_KEY = 'APIKEY';
const APP_SECRET = '0x5EC07';
const TOKEN_CREATION_TIMESTAMP = 1613745000;
const MOCK_NOW = 1613745082;

// Mock implementations
const mockToken = { token: 'yes' };
const mockTokenWithMetadata = {
    token: mockToken,
    creation_timestamp: TOKEN_CREATION_TIMESTAMP
};

describe('ClientFromLoginFlowTest', () => {
    let tmpDir: string;
    let tokenPath: string;

    beforeEach(() => {
        tmpDir = '/tmp/test-dir';
        tokenPath = `${tmpDir}/token.json`;
        jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
        jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
        jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockTokenWithMetadata));
        jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);
        (crypto.randomBytes as jest.Mock).mockReturnValue(Buffer.from('test-state'));
        (https.createServer as jest.Mock).mockReturnValue({ listen: jest.fn(), close: jest.fn() });
        (child_process.spawn as jest.Mock).mockReturnValue({ open: jest.fn() });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('create_token_file', async () => {
        await clientFromLoginFlow(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath);
        expect(fs.writeFile).toHaveBeenCalledWith(
            tokenPath,
            JSON.stringify({
                creation_timestamp: MOCK_NOW,
                token: mockToken
            }, null, 2)
        );
    });

    test('specify_web_browser', async () => {
        await clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            tokenPath,
            { requestedBrowser: 'custom-browser' }
        );
        expect(child_process.spawn).toHaveBeenCalledWith('custom-browser', expect.any(Array));
    });

    test('create_token_file_not_interactive', async () => {
        await clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            tokenPath,
            { interactive: false }
        );
        expect(fs.writeFile).toHaveBeenCalledWith(
            tokenPath,
            JSON.stringify({
                creation_timestamp: MOCK_NOW,
                token: mockToken
            }, null, 2)
        );
    });

    test('create_token_file_root_callback_url', async () => {
        await clientFromLoginFlow(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/', tokenPath);
        expect(fs.writeFile).toHaveBeenCalledWith(
            tokenPath,
            JSON.stringify({
                creation_timestamp: MOCK_NOW,
                token: mockToken
            }, null, 2)
        );
    });

    test('disallowed_hostname', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://example.com/callback',
            tokenPath
        )).rejects.toThrow('Callback URL must use 127.0.0.1 as the hostname');
    });

    test('negative_timeout', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            tokenPath,
            { callbackTimeout: -1 }
        )).rejects.toThrow('callbackTimeout must be positive');
    });

    test('disallowed_hostname_with_port', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://example.com:8080/callback',
            tokenPath
        )).rejects.toThrow('Callback URL must use 127.0.0.1 as the hostname');
    });

    test('start_on_port_443', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1/callback',
            tokenPath
        )).rejects.toThrow('callback URL without a port number');
    });

    test('time_out_waiting_for_request', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            tokenPath,
            { callbackTimeout: 0.01 }
        )).rejects.toThrow('Timed out waiting');
    });

    test('wait_forever_callback_timeout_equals_none', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            tokenPath,
            { callbackTimeout: null as any }
        )).rejects.toThrow('endless wait requested');
    });

    test('wait_forever_callback_timeout_equals_zero', async () => {
        await expect(clientFromLoginFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            tokenPath,
            { callbackTimeout: 0 }
        )).rejects.toThrow('endless wait requested');
    });
});

describe('ClientFromTokenFileTest', () => {
    let tmpDir: string;
    let tokenPath: string;

    beforeEach(() => {
        tmpDir = '/tmp/test-dir';
        tokenPath = `${tmpDir}/token.json`;
        jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
        jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
        jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockTokenWithMetadata));
        jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('no_such_file', async () => {
        (fs.readFile as any).mockRejectedValue(new Error('ENOENT'));
        await expect(clientFromTokenFile(tokenPath, API_KEY, APP_SECRET))
            .rejects.toThrow('ENOENT');
    });

    test('json_loads', async () => {
        (fs.readFile as any).mockResolvedValue('invalid json');
        await expect(clientFromTokenFile(tokenPath, API_KEY, APP_SECRET))
            .rejects.toThrow('Unexpected token');
    });

    test('update_token_updates_token', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);
        const client = await clientFromTokenFile(tokenPath, API_KEY, APP_SECRET);
        expect(client).toBe(mockClient);
        
        // Test token update functionality
        const updatedToken = { updated: 'token' };
        const mockCalls = (Client as jest.Mock).mock.calls[0];
        const updateTokenFunc = (mockCalls[1] as { updateToken: (token: any) => Promise<void> }).updateToken;
        await updateTokenFunc(updatedToken);
        
        expect(fs.writeFile).toHaveBeenCalledWith(
            tokenPath,
            JSON.stringify({
                token: updatedToken,
                creation_timestamp: MOCK_NOW
            }, null, 2)
        );
    });

    test('enforce_enums_being_disabled', async () => {
        const mockClient = new Client(API_KEY, {}, false);
        (Client as jest.Mock).mockReturnValue(mockClient);
        const client = await clientFromTokenFile(tokenPath, API_KEY, APP_SECRET, { enforceEnums: false });
        expect(client).toBe(mockClient);
        expect(Client).toHaveBeenCalledWith(API_KEY, expect.any(Object), expect.any(Object), { enforceEnums: false });
    });

    test('enforce_enums_being_enabled', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);
        const client = await clientFromTokenFile(tokenPath, API_KEY, APP_SECRET, { enforceEnums: true });
        expect(client).toBe(mockClient);
        expect(Client).toHaveBeenCalledWith(API_KEY, expect.any(Object), expect.any(Object), { enforceEnums: true });
    });
});

describe('ClientFromAccessFunctionsTest', () => {
    let tokenReadFunc: any;
    let tokenWriteFunc: any;

    beforeEach(() => {
        tokenReadFunc = (jest.fn() as any).mockResolvedValue(mockTokenWithMetadata);
        tokenWriteFunc = (jest.fn() as any).mockResolvedValue(undefined);
        jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('success_with_write_func', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await clientFromAccessFunctions(
            API_KEY,
            APP_SECRET,
            tokenReadFunc,
            tokenWriteFunc
        );

        expect(client).toBe(mockClient);
        expect(tokenReadFunc).toHaveBeenCalled();
        expect(tokenWriteFunc).toHaveBeenCalledWith(mockTokenWithMetadata);
    });

    test('success_with_write_func_metadata_aware_token', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const metadataAwareToken = {
            token: mockToken,
            creation_timestamp: TOKEN_CREATION_TIMESTAMP
        };
        tokenReadFunc.mockResolvedValue(metadataAwareToken);

        const client = await clientFromAccessFunctions(
            API_KEY,
            APP_SECRET,
            tokenReadFunc,
            tokenWriteFunc
        );

        expect(client).toBe(mockClient);
        expect(tokenWriteFunc).toHaveBeenCalledWith(metadataAwareToken);
    });

    test('success_with_enforce_enums_disabled', async () => {
        const mockClient = new Client(API_KEY, {}, false);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await clientFromAccessFunctions(
            API_KEY,
            APP_SECRET,
            tokenReadFunc,
            tokenWriteFunc,
            { enforceEnums: false }
        );

        expect(client).toBe(mockClient);
        expect(Client).toHaveBeenCalledWith(API_KEY, expect.any(Object), expect.any(Object), { enforceEnums: false });
    });

    test('success_with_enforce_enums_enabled', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await clientFromAccessFunctions(
            API_KEY,
            APP_SECRET,
            tokenReadFunc,
            tokenWriteFunc,
            { enforceEnums: true }
        );

        expect(client).toBe(mockClient);
        expect(Client).toHaveBeenCalledWith(API_KEY, expect.any(Object), expect.any(Object), { enforceEnums: true });
    });
});

describe('ClientFromReceivedUrl', () => {
    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('success_sync', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const receivedUrl = 'https://127.0.0.1:6969/callback?code=test_code&state=test_state';
        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        const authContext = { /* mock auth context */ };
        
        const client = await clientFromReceivedUrl(
            API_KEY,
            APP_SECRET,
            authContext,
            receivedUrl,
            tokenWriteFunc
        );

        expect(client).toBe(mockClient);
    });

    test('success_async', async () => {
        const mockAsyncClient = { /* mock async client */ };
        (Client as jest.Mock).mockReturnValue(mockAsyncClient);

        const receivedUrl = 'https://127.0.0.1:6969/callback?code=test_code&state=test_state';
        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        const authContext = { /* mock auth context */ };
        
        const client = await clientFromReceivedUrl(
            API_KEY,
            APP_SECRET,
            authContext,
            receivedUrl,
            tokenWriteFunc,
            { async: true } as any
        );

        expect(client).toBe(mockAsyncClient);
    });
});

describe('ClientFromManualFlow', () => {
    beforeEach(() => {
        jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('no_token_file', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        // Mock console input
        const mockInput = jest.fn().mockReturnValue('test_code');
        (global as any).prompt = mockInput;

        const client = await clientFromManualFlow(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', '/tmp/token.json');

        expect(client).toBe(mockClient);
        expect(mockInput).toHaveBeenCalled();
    });

    test('custom_token_write_func', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        const mockInput = jest.fn().mockReturnValue('test_code');
        (global as any).prompt = mockInput;

        const client = await clientFromManualFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            '/tmp/token.json',
            { tokenWriteFunc } as any
        );

        expect(client).toBe(mockClient);
        expect(tokenWriteFunc).toHaveBeenCalled();
    });

    test('print_warning_on_http_redirect_uri', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const mockInput = jest.fn().mockReturnValue('test_code');
        (global as any).prompt = mockInput;
        const mockPrint = jest.fn();
        (global as any).console = { log: mockPrint };

        await clientFromManualFlow(API_KEY, APP_SECRET, 'http://127.0.0.1:6969/callback', '/tmp/token.json');

        expect(mockPrint).toHaveBeenCalledWith(expect.stringContaining('WARNING'));
    });

    test('enforce_enums_disabled', async () => {
        const mockClient = new Client(API_KEY, {}, false);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const mockInput = jest.fn().mockReturnValue('test_code');
        (global as any).prompt = mockInput;

        const client = await clientFromManualFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            '/tmp/token.json',
            { enforceEnums: false } as any
        );

        expect(client).toBe(mockClient);
        expect(Client).toHaveBeenCalledWith(API_KEY, expect.any(Object), expect.any(Object), { enforceEnums: false });
    });

    test('enforce_enums_enabled', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const mockInput = jest.fn().mockReturnValue('test_code');
        (global as any).prompt = mockInput;

        const client = await clientFromManualFlow(
            API_KEY,
            APP_SECRET,
            'https://127.0.0.1:6969/callback',
            '/tmp/token.json',
            { enforceEnums: true } as any
        );

        expect(client).toBe(mockClient);
        expect(Client).toHaveBeenCalledWith(API_KEY, expect.any(Object), expect.any(Object), { enforceEnums: true });
    });
});

describe('TokenMetadataTest', () => {
    test('from_loaded_token', async () => {
        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        const metadata = await TokenMetadata.fromLoadedToken(mockTokenWithMetadata, tokenWriteFunc);
        expect(metadata).toBeInstanceOf(TokenMetadata);
    });

    test('wrapped_token_write_func_updates_stored_token', async () => {
        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        const metadata = await TokenMetadata.fromLoadedToken(mockTokenWithMetadata, tokenWriteFunc);
        const wrappedFunc = metadata.wrappedTokenWriteFunc();

        const newToken = { new: 'token' };
        await wrappedFunc(newToken);

        expect(tokenWriteFunc).toHaveBeenCalledWith({
            token: newToken,
            creation_timestamp: TOKEN_CREATION_TIMESTAMP
        });
    });

    test('reject_tokens_without_creation_timestamp', async () => {
        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        await expect(TokenMetadata.fromLoadedToken({ token: mockToken }, tokenWriteFunc))
            .rejects.toThrow('WARNING: The token format has changed');
    });

    test('token_age', () => {
        const tokenWriteFunc = jest.fn().mockResolvedValue(undefined);
        const metadata = new TokenMetadata(mockToken, TOKEN_CREATION_TIMESTAMP, tokenWriteFunc);
        expect(metadata.tokenAge()).toBe(MOCK_NOW - TOKEN_CREATION_TIMESTAMP);
    });
});

describe('EasyClientTest', () => {
    let tmpDir: string;
    let tokenPath: string;

    beforeEach(() => {
        tmpDir = '/tmp/test-dir';
        tokenPath = `${tmpDir}/token.json`;
        jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined as any);
        jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined as any);
        jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(mockTokenWithMetadata));
        jest.spyOn(Date, 'now').mockReturnValue(MOCK_NOW * 1000);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('no_token', async () => {
        (fs.readFile as any).mockRejectedValue(new Error('ENOENT'));
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath);
        expect(client).toBe(mockClient);
    });

    test('running_on_collab_environment', async () => {
        (process.env as any).COLAB_GPU = '1';

        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath);
        expect(client).toBe(mockClient);
    });

    test('running_on_ipython_in_notebook_mode', async () => {
        // Mock IPython environment
        (global as any).window = { location: { protocol: 'https:' } };
        (global as any).document = { querySelector: jest.fn().mockReturnValue({}) };

        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath);
        expect(client).toBe(mockClient);
    });

    test('existing_token', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath);
        expect(client).toBe(mockClient);
    });

    test('existing_token_passing_parameters', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath, {
            enforceEnums: false,
            maxTokenAge: 3600
        });
        expect(client).toBe(mockClient);
    });

    test('token_too_old', async () => {
        const oldToken = {
            token: mockToken,
            creation_timestamp: MOCK_NOW - 7200 // 2 hours old
        };
        (fs.readFile as any).mockResolvedValue(JSON.stringify(oldToken));

        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath, {
            maxTokenAge: 3600 // 1 hour max
        });
        expect(client).toBe(mockClient);
    });

    test('negative_max_token_age', async () => {
        await expect(easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath, {
            maxTokenAge: -1
        })).rejects.toThrow('maxTokenAge must be positive');
    });

    test('none_max_token_age', async () => {
        const mockClient = new Client(API_KEY, {}, true);
        (Client as jest.Mock).mockReturnValue(mockClient);

        const client = await easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath, {
            maxTokenAge: null as any
        });
        expect(client).toBe(mockClient);
    });

    test('zero_max_token_age', async () => {
        await expect(easyClient(API_KEY, APP_SECRET, 'https://127.0.0.1:6969/callback', tokenPath, {
            maxTokenAge: 0
        })).rejects.toThrow('maxTokenAge must be positive');
    });
}); 