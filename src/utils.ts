import { Client } from './client';

export function classFullname(o: any): string {
    return `${o.constructor.name}`;
}

export class EnumEnforcer {
    private enforceEnums: boolean;

    constructor(enforceEnums: boolean) {
        this.enforceEnums = enforceEnums;
    }

    private typeError(value: any, requiredEnumType: any): never {
        let possibleMembersMessage = '';

        if (typeof value === 'string') {
            const possibleMembers: string[] = [];
            for (const member in requiredEnumType) {
                const fullname = `${classFullname(requiredEnumType)}.${member}`;
                if (fullname.includes(value)) {
                    possibleMembers.push(fullname);
                }
            }

            if (possibleMembers.length > 0) {
                const lastTwo = possibleMembers.slice(-2);
                const rest = possibleMembers.slice(0, -2);
                possibleMembersMessage = `Did you mean ${rest.join(', ')}${rest.length > 0 ? ' or ' : ''}${lastTwo.join(' or ')}? `;
            }
        }

        throw new Error(
            `expected type "${requiredEnumType.name}", got type "${typeof value}". ${possibleMembersMessage}(initialize with enforceEnums=false to disable this checking)`
        );
    }

    convertEnum(value: any, requiredEnumType: any): any {
        if (value === null || value === undefined) {
            return null;
        }

        if (value instanceof requiredEnumType) {
            return value.value;
        } else if (this.enforceEnums) {
            this.typeError(value, requiredEnumType);
        } else {
            return value;
        }
    }

    convertEnumIterable(iterable: any[], requiredEnumType: any): any[] | null {
        if (iterable === null || iterable === undefined) {
            return null;
        }

        if (iterable instanceof requiredEnumType) {
            return [iterable.value];
        }

        const values: any[] = [];
        for (const value of iterable) {
            if (value instanceof requiredEnumType) {
                values.push(value.value);
            } else if (this.enforceEnums) {
                this.typeError(value, requiredEnumType);
            } else {
                values.push(value);
            }
        }
        return values;
    }

    setEnforceEnums(enforceEnums: boolean): void {
        this.enforceEnums = enforceEnums;
    }
}

export class UnsuccessfulOrderException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UnsuccessfulOrderException';
    }
}

export class AccountHashMismatchException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AccountHashMismatchException';
    }
}

export class LazyLog {
    private func: () => string;

    constructor(func: () => string) {
        this.func = func;
    }

    toString(): string {
        return this.func();
    }
}

export class Utils extends EnumEnforcer {
    private client: Client;
    private accountHash: string;

    constructor(client: Client, accountHash: string) {
        super(true);
        this.client = client;
        this.accountHash = accountHash;
    }

    setAccountHash(accountHash: string): void {
        this.accountHash = accountHash;
    }

    extractOrderId(placeOrderResponse: Response): number | null {
        if (placeOrderResponse.status >= 400) {
            throw new UnsuccessfulOrderException(
                `order not successful: status ${placeOrderResponse.status}`
            );
        }

        const location = placeOrderResponse.headers.get('location');
        if (!location) {
            return null;
        }

        const match = location.match(
            /https:\/\/api\.schwabapi\.com\/trader\/v1\/accounts\/(\w+)\/orders\/(\d+)/
        );

        if (!match) {
            return null;
        }

        const [, accountHash, orderId] = match;

        if (accountHash !== this.accountHash) {
            throw new AccountHashMismatchException(
                'order request account hash != Utils.accountHash'
            );
        }

        return parseInt(orderId, 10);
    }
} 