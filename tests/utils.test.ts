import { AccountHashMismatchException, Utils, UnsuccessfulOrderException, EnumEnforcer } from '../src/utils';

enum TestEnum {
  VALUE_1 = 1,
  VALUE_2 = 2
}

class TestClass extends EnumEnforcer {
  testEnforcement(value: TestEnum | string | number): void {
    this.convertEnum(value, TestEnum);
  }
}

describe('EnumEnforcer', () => {
  test('valid enum', () => {
    const t = new TestClass(true);
    t.testEnforcement(TestEnum.VALUE_1);
  });

  test('invalid enum passed as string', () => {
    const t = new TestClass(true);
    expect(() => t.testEnforcement('VALUE_1')).toThrow('TestEnum.VALUE_1');
  });

  test('invalid enum passed as not string', () => {
    const t = new TestClass(true);
    expect(() => t.testEnforcement(123)).toThrow();
  });
});

describe('Utils', () => {
  let mockClient: any;
  let accountHash: string;
  let utils: Utils;

  beforeEach(() => {
    mockClient = {
      // Add mock methods as needed
    };
    accountHash = '0xacc0unth45h';
    utils = new Utils(mockClient, accountHash);
  });

  describe('extract_order_id', () => {
    test('order not ok', () => {
      const response = new Response(null, {
        status: 403,
        headers: new Headers()
      });
      expect(() => utils.extractOrderId(response)).toThrow(UnsuccessfulOrderException);
    });

    test('no location', () => {
      const response = new Response(null, {
        status: 200,
        headers: new Headers()
      });
      expect(utils.extractOrderId(response)).toBeNull();
    });

    test('no pattern match', () => {
      const response = new Response(null, {
        status: 200,
        headers: new Headers({
          Location: 'not-a-match'
        })
      });
      expect(utils.extractOrderId(response)).toBeNull();
    });

    test('nonmatching account hash', () => {
      const response = new Response(null, {
        status: 200,
        headers: new Headers({
          Location: 'https://api.schwabapi.com/trader/v1/accounts/badhash/orders/123'
        })
      });
      expect(() => utils.extractOrderId(response)).toThrow(AccountHashMismatchException);
    });

    test('success 200', () => {
      const orderId = 123456;
      const response = new Response(null, {
        status: 200,
        headers: new Headers({
          Location: `https://api.schwabapi.com/trader/v1/accounts/${accountHash}/orders/${orderId}`
        })
      });
      expect(utils.extractOrderId(response)).toBe(orderId);
    });

    test('success 201', () => {
      const orderId = 123456;
      const response = new Response(null, {
        status: 201,
        headers: new Headers({
          Location: `https://api.schwabapi.com/trader/v1/accounts/${accountHash}/orders/${orderId}`
        })
      });
      expect(utils.extractOrderId(response)).toBe(orderId);
    });
  });
}); 