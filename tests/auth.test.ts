import { jest } from '@jest/globals';
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as https from 'https';
import * as child_process from 'child_process';
import { Client } from '../src/client';
import { TokenMetadata, clientFromLoginFlow, clientFromTokenFile, clientFromAccessFunctions } from '../src/auth';

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
    });

    test('success_with_write_func_metadata_aware_token', async () => {
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
    });
});

describe('TokenMetadataTest', () => {
    test('from_loaded_token', async () => {
        const tokenWriteFunc = (jest.fn() as any).mockResolvedValue(undefined);
        const metadata = await TokenMetadata.fromLoadedToken(mockTokenWithMetadata, tokenWriteFunc);
        expect(metadata).toBeInstanceOf(TokenMetadata);
    });

    test('wrapped_token_write_func_updates_stored_token', async () => {
        const tokenWriteFunc = (jest.fn() as any).mockResolvedValue(undefined);
        const metadata = new TokenMetadata(mockToken, TOKEN_CREATION_TIMESTAMP, tokenWriteFunc);
        const wrappedFunc = metadata.wrappedTokenWriteFunc();
        await wrappedFunc({ new: 'token' });
        expect(tokenWriteFunc).toHaveBeenCalledWith({
            creation_timestamp: TOKEN_CREATION_TIMESTAMP,
            token: { new: 'token' }
        });
    });

    test('reject_tokens_without_creation_timestamp', async () => {
        const tokenWriteFunc = (jest.fn() as any).mockResolvedValue(undefined);
        await expect(TokenMetadata.fromLoadedToken({ token: 'yes' }, tokenWriteFunc))
            .rejects.toThrow('WARNING: The token format has changed');
    });

    test('token_age', () => {
        const tokenWriteFunc = (jest.fn() as any).mockResolvedValue(undefined);
        const metadata = new TokenMetadata(mockToken, TOKEN_CREATION_TIMESTAMP, tokenWriteFunc);
        expect(metadata.tokenAge()).toBe(MOCK_NOW - TOKEN_CREATION_TIMESTAMP);
    });
}); 