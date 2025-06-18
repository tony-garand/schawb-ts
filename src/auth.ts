import { Client } from './client';
import { registerRedactions } from './debug';
import { OAuth2Client } from 'oauth2-client';
import { promises as fs } from 'fs';
import { URL } from 'url';
import open from 'open';
import { createServer } from 'https';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';

const TOKEN_ENDPOINT = 'https://api.schwabapi.com/v1/oauth/token';

export class TokenMetadata {
    private creationTimestamp: number;
    private unwrappedTokenWriteFunc: (token: any) => Promise<void>;
    private token: any;

    constructor(
        token: any,
        creationTimestamp: number,
        unwrappedTokenWriteFunc: (token: any) => Promise<void>
    ) {
        this.creationTimestamp = creationTimestamp;
        this.unwrappedTokenWriteFunc = unwrappedTokenWriteFunc;
        this.token = token;
    }

    static async fromLoadedToken(
        token: any,
        unwrappedTokenWriteFunc: (token: any) => Promise<void>
    ): Promise<TokenMetadata> {
        if (!('creation_timestamp' in token)) {
            throw new Error(
                'WARNING: The token format has changed since this token ' +
                'was created. Please delete it and create a new one.'
            );
        }

        return new TokenMetadata(
            token.token,
            token.creation_timestamp,
            unwrappedTokenWriteFunc
        );
    }

    tokenAge(): number {
        return Math.floor(Date.now() / 1000) - this.creationTimestamp;
    }

    wrappedTokenWriteFunc(): (token: any) => Promise<void> {
        return async (token: any) => {
            await this.unwrappedTokenWriteFunc(this.wrapTokenInMetadata(token));
            this.token = token;
        };
    }

    private wrapTokenInMetadata(token: any): any {
        return {
            creation_timestamp: this.creationTimestamp,
            token: token,
        };
    }
}

export class RedirectTimeoutError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'RedirectTimeoutError';
    }
}

export class RedirectServerExitedError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'RedirectServerExitedError';
    }
}

async function makeUpdateTokenFunc(tokenPath: string): Promise<(token: any) => Promise<void>> {
    return async (token: any) => {
        console.info('Updating token to file %s', tokenPath);
        await fs.writeFile(tokenPath, JSON.stringify(token, null, 2));
    };
}

async function tokenLoader(tokenPath: string): Promise<() => Promise<any>> {
    return async () => {
        console.info('Loading token from file %s', tokenPath);
        const data = await fs.readFile(tokenPath, 'utf8');
        return JSON.parse(data);
    };
}

export async function clientFromLoginFlow(
    apiKey: string,
    appSecret: string,
    callbackUrl: string,
    tokenPath: string,
    options: {
        asyncio?: boolean;
        enforceEnums?: boolean;
        tokenWriteFunc?: (token: any) => Promise<void>;
        callbackTimeout?: number;
        interactive?: boolean;
        requestedBrowser?: string;
    } = {}
): Promise<Client> {
    const {
        asyncio = false,
        enforceEnums = false,
        tokenWriteFunc,
        callbackTimeout = 300.0,
        interactive = true,
        requestedBrowser
    } = options;

    if (callbackTimeout < 0) {
        throw new Error('callbackTimeout must be positive');
    }

    const parsed = new URL(callbackUrl);
    if (parsed.hostname !== '127.0.0.1') {
        throw new Error('Callback URL must use 127.0.0.1 as the hostname');
    }

    // ... More implementation to be added ...
}

export async function clientFromTokenFile(
    tokenPath: string,
    apiKey: string,
    appSecret: string,
    options: {
        asyncio?: boolean;
        enforceEnums?: boolean;
    } = {}
): Promise<Client> {
    const { asyncio = false, enforceEnums = true } = options;

    // ... Implementation to be added ...
}

export async function clientFromManualFlow(
    apiKey: string,
    appSecret: string,
    callbackUrl: string,
    tokenPath: string,
    options: {
        asyncio?: boolean;
        tokenWriteFunc?: (token: any) => Promise<void>;
        enforceEnums?: boolean;
    } = {}
): Promise<Client> {
    const {
        asyncio = false,
        tokenWriteFunc,
        enforceEnums = true
    } = options;

    // ... Implementation to be added ...
}

export async function clientFromAccessFunctions(
    apiKey: string,
    appSecret: string,
    tokenReadFunc: () => Promise<any>,
    tokenWriteFunc: (token: any) => Promise<void>,
    options: {
        asyncio?: boolean;
        enforceEnums?: boolean;
    } = {}
): Promise<Client> {
    const { asyncio = false, enforceEnums = true } = options;

    // ... Implementation to be added ...
}

export function getAuthContext(
    apiKey: string,
    callbackUrl: string,
    state?: string
): any {
    // ... Implementation to be added ...
}

export async function clientFromReceivedUrl(
    apiKey: string,
    appSecret: string,
    authContext: any,
    receivedUrl: string,
    tokenWriteFunc: (token: any) => Promise<void>,
    options: {
        asyncio?: boolean;
        enforceEnums?: boolean;
    } = {}
): Promise<Client> {
    const { asyncio = false, enforceEnums = true } = options;

    // ... Implementation to be added ...
}

export async function easyClient(
    apiKey: string,
    appSecret: string,
    callbackUrl: string,
    tokenPath: string,
    options: {
        asyncio?: boolean;
        enforceEnums?: boolean;
        maxTokenAge?: number;
        callbackTimeout?: number;
        interactive?: boolean;
        requestedBrowser?: string;
    } = {}
): Promise<Client> {
    const {
        asyncio = false,
        enforceEnums = true,
        maxTokenAge = 60 * 60 * 24 * 6.5,
        callbackTimeout = 300.0,
        interactive = true,
        requestedBrowser
    } = options;

    // ... Implementation to be added ...
} 