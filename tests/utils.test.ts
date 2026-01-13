import {
  Utils,
  formatPrice,
  toISODate,
  formatDate,
  formatDateTime,
  getMarketOpen,
  getMarketClose,
  isDuringMarketHours,
} from '../src/utils/utils';

// Mock SchwabClient for Utils tests
const mockClient = {
  getAccountNumberMappings: jest.fn(),
  getTokens: jest.fn(),
} as any;

describe('Utils', () => {
  describe('Utils class', () => {
    let utils: Utils;

    beforeEach(() => {
      utils = new Utils(mockClient, 'test-account-hash');
    });

    it('should set and get account hash', () => {
      expect(utils.getAccountHash()).toBe('test-account-hash');
      utils.setAccountHash('new-hash');
      expect(utils.getAccountHash()).toBe('new-hash');
    });

    describe('extractOrderId', () => {
      it('should extract order ID from orderId property', () => {
        const response = { orderId: 12345 };
        expect(utils.extractOrderId(response)).toBe(12345);
      });

      it('should extract order ID from Location header', () => {
        const response = {
          headers: {
            location: '/v1/accounts/ABC123/orders/67890',
          },
        };
        expect(utils.extractOrderId(response)).toBe(67890);
      });

      it('should return null if no order ID found', () => {
        const response = { status: 200 };
        expect(utils.extractOrderId(response)).toBeNull();
      });
    });

    describe('extractOrderIdFromUrl static method', () => {
      it('should extract order ID from URL', () => {
        const url = '/v1/accounts/ABC123/orders/99999';
        expect(Utils.extractOrderIdFromUrl(url)).toBe(99999);
      });

      it('should return null for invalid URL', () => {
        const url = '/v1/accounts/ABC123/positions';
        expect(Utils.extractOrderIdFromUrl(url)).toBeNull();
      });
    });
  });

  describe('formatPrice', () => {
    it('should truncate prices >= 1 to 2 decimal places', () => {
      expect(formatPrice(150.999)).toBe('150.99');
      expect(formatPrice(100.005)).toBe('100.00');
      expect(formatPrice(1.999)).toBe('1.99');
    });

    it('should truncate prices < 1 to 4 decimal places', () => {
      expect(formatPrice(0.99999)).toBe('0.9999');
      expect(formatPrice(0.12345)).toBe('0.1234');
      expect(formatPrice(0.001)).toBe('0.0010');
    });

    it('should handle negative prices', () => {
      expect(formatPrice(-0.5678)).toBe('-0.5678');
      expect(formatPrice(-10.999)).toBe('-10.99');
    });
  });

  describe('toISODate', () => {
    it('should convert Date to ISO string', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      expect(toISODate(date)).toBe('2024-06-15T12:00:00.000Z');
    });

    it('should convert string to ISO string', () => {
      const result = toISODate('2024-06-15');
      expect(result).toContain('2024-06-15');
    });
  });

  describe('formatDate', () => {
    it('should format Date to YYYY-MM-DD', () => {
      const date = new Date('2024-06-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-06-15');
    });

    it('should format string date to YYYY-MM-DD', () => {
      expect(formatDate('2024-06-15T12:00:00Z')).toBe('2024-06-15');
    });
  });

  describe('formatDateTime', () => {
    it('should format Date to ISO datetime', () => {
      const date = new Date('2024-06-15T12:30:00Z');
      expect(formatDateTime(date)).toBe('2024-06-15T12:30:00.000Z');
    });
  });

  describe('getMarketOpen', () => {
    it('should return a Date object', () => {
      const marketOpen = getMarketOpen();
      expect(marketOpen).toBeInstanceOf(Date);
    });

    it('should be set to 9:30', () => {
      const marketOpen = getMarketOpen();
      expect(marketOpen.getHours()).toBe(9);
      expect(marketOpen.getMinutes()).toBe(30);
    });
  });

  describe('getMarketClose', () => {
    it('should return a Date object', () => {
      const marketClose = getMarketClose();
      expect(marketClose).toBeInstanceOf(Date);
    });

    it('should be set to 16:00', () => {
      const marketClose = getMarketClose();
      expect(marketClose.getHours()).toBe(16);
      expect(marketClose.getMinutes()).toBe(0);
    });
  });

  describe('isDuringMarketHours', () => {
    it('should return a boolean', () => {
      const result = isDuringMarketHours();
      expect(typeof result).toBe('boolean');
    });
  });
});
