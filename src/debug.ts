import { version } from './version';
import { LOG_REDACTOR } from './index';

export function getLogger(): any {
    return console;
}

export class LogRedactor {
    private redactedStrings: Map<string, [string, number]>;
    private labelCounts: Map<string, number>;

    constructor() {
        this.redactedStrings = new Map();
        this.labelCounts = new Map();
    }

    register(string: string | number, label: string): void {
        const str = String(string);
        if (!this.redactedStrings.has(str)) {
            const count = (this.labelCounts.get(label) || 0) + 1;
            this.labelCounts.set(label, count);
            this.redactedStrings.set(str, [label, count]);
        }
    }

    redact(msg: string): string {
        let result = msg;
        for (const [string, [label, count]] of this.redactedStrings.entries()) {
            const labelCount = this.labelCounts.get(label) || 0;
            const suffix = labelCount > 1 ? `-${count}` : '';
            result = result.replace(string, `<REDACTED ${label}${suffix}>`);
        }
        return result;
    }
}

export function registerRedactionsFromResponse(resp: Response): void {
    if (resp.status === 200) {
        resp.json().then(data => {
            try {
                registerRedactions(data);
            } catch (e) {
                // Ignore JSON parse errors
            }
        }).catch(() => {
            // Ignore JSON parse errors
        });
    }
}

export function registerRedactions(
    obj: any,
    keyPath: string[] = [],
    badPatterns: string[] = ['auth', 'acl', 'displayname', 'id', 'key', 'token'],
    whitelisted: Set<string> = new Set([
        'requestid',
        'token_type',
        'legid',
        'bidid',
        'askid',
        'lastid',
        'bidsizeinlong',
        'bidsizeindouble',
        'bidpriceindouble'
    ])
): void {
    if (Array.isArray(obj)) {
        for (let idx = 0; idx < obj.length; idx++) {
            keyPath.push(String(idx));
            registerRedactions(obj[idx], keyPath, badPatterns, whitelisted);
            keyPath.pop();
        }
    } else if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
            keyPath.push(key);
            registerRedactions(value, keyPath, badPatterns, whitelisted);
            keyPath.pop();
        }
    } else {
        if (keyPath.length > 0) {
            const lastKey = keyPath[keyPath.length - 1].toLowerCase();
            if (!whitelisted.has(lastKey) && badPatterns.some(bad => lastKey.includes(bad))) {
                LOG_REDACTOR.register(obj, keyPath.join('-'));
            }
        }
    }
}

export function enableBugReportLogging(): () => void {
    return _enableBugReportLogging();
}

function _enableBugReportLogging(output: NodeJS.WritableStream = process.stderr): () => void {
    const messages: string[] = [];

    const originalConsoleLog = console.log;
    const originalConsoleDebug = console.debug;
    const originalConsoleInfo = console.info;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    function recordMessage(level: string, ...args: any[]) {
        const msg = `[${level}] ${args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ')}`;
        messages.push(msg);
    }

    console.log = (...args: any[]) => {
        recordMessage('LOG', ...args);
        originalConsoleLog.apply(console, args);
    };

    console.debug = (...args: any[]) => {
        recordMessage('DEBUG', ...args);
        originalConsoleDebug.apply(console, args);
    };

    console.info = (...args: any[]) => {
        recordMessage('INFO', ...args);
        originalConsoleInfo.apply(console, args);
    };

    console.warn = (...args: any[]) => {
        recordMessage('WARN', ...args);
        originalConsoleWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
        recordMessage('ERROR', ...args);
        originalConsoleError.apply(console, args);
    };

    const writeLogs = () => {
        output.write('\n');
        output.write(' ### BEGIN REDACTED LOGS ###\n');
        output.write('\n');

        for (const msg of messages) {
            const redactedMsg = LOG_REDACTOR.redact(msg);
            output.write(redactedMsg + '\n');
        }

        // Restore original console methods
        console.log = originalConsoleLog;
        console.debug = originalConsoleDebug;
        console.info = originalConsoleInfo;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
    };

    process.on('exit', writeLogs);
    getLogger().debug(`schwab-api version ${version}`);

    return writeLogs;
} 