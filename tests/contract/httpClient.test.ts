import { HttpClient } from '../../src/http/httpClient';
import { SchwabApiError } from '../../src/errors/SchwabApiError';
import { SchwabOAuth } from '../../src/auth/oauth';

/**
 * Contract tests for the shared HttpClient.
 *
 * These verify the request-construction and error-handling rules that the
 * per-module tests used to (incompletely) assert — including the rule that hid
 * a real production bug: no Content-Type header on bodyless requests.
 */

const BASE = 'https://api.example.com/v1';

function makeOAuth(): SchwabOAuth {
  return {
    getAuthorizationHeader: jest.fn().mockResolvedValue('Bearer test-token'),
  } as unknown as SchwabOAuth;
}

interface FakeResponseInit {
  ok?: boolean;
  status?: number;
  body?: string;
  retryAfter?: string;
}

function fakeResponse(init: FakeResponseInit): Response {
  const status = init.status ?? 200;
  return {
    ok: init.ok ?? (status >= 200 && status < 300),
    status,
    headers: { get: (name: string) => (name.toLowerCase() === 'retry-after' ? init.retryAfter ?? null : null) },
    text: jest.fn().mockResolvedValue(init.body ?? ''),
  } as unknown as Response;
}

describe('HttpClient', () => {
  let oauth: SchwabOAuth;
  let client: HttpClient;

  beforeEach(() => {
    oauth = makeOAuth();
    client = new HttpClient(oauth, BASE, { maxRetries: 2 });
  });

  afterEach(() => jest.restoreAllMocks());

  describe('request construction', () => {
    it('prefixes the base URL and sends Accept + Authorization on a GET', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ body: '{"ok":true}' }));

      const result = await client.request('/accounts');

      expect(result).toEqual({ ok: true });
      const [url, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe(`${BASE}/accounts`);
      expect(opts.method).toBe('GET');
      expect(opts.headers.Accept).toBe('application/json');
      expect(opts.headers.Authorization).toBe('Bearer test-token');
    });

    it('does NOT send Content-Type on a bodyless request', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ body: '{}' }));

      await client.request('/accounts');

      const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(opts.headers['Content-Type']).toBeUndefined();
    });

    it('DOES send Content-Type when a body is present', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ status: 201, body: '{}' }));

      await client.request('/orders', { method: 'POST', body: JSON.stringify({ a: 1 }) });

      const [, opts] = (global.fetch as jest.Mock).mock.calls[0];
      expect(opts.method).toBe('POST');
      expect(opts.headers['Content-Type']).toBe('application/json');
      expect(opts.body).toBe('{"a":1}');
    });

    it('appends query params, skipping undefined values', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ body: '{}' }));

      await client.request('/quotes', { query: { symbols: 'AAPL,MSFT', fields: undefined, indicative: false } });

      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe(`${BASE}/quotes?symbols=AAPL%2CMSFT&indicative=false`);
    });

    it('passes an absolute URL through unchanged', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ body: '{}' }));

      await client.request('https://other.example.com/x');

      const [url] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('https://other.example.com/x');
    });
  });

  describe('response parsing', () => {
    it('returns null for an empty body', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ body: '' }));
      expect(await client.request('/x')).toBeNull();
    });

    it('returns null for 204 No Content', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ status: 204, body: '' }));
      expect(await client.request('/x', { method: 'DELETE' })).toBeNull();
    });
  });

  describe('error handling', () => {
    it('throws SchwabApiError with status and body on non-2xx', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ ok: false, status: 404, body: 'not found' }));

      await expect(client.request('/x')).rejects.toMatchObject({
        name: 'SchwabApiError',
        status: 404,
        body: 'not found',
        isRetryable: false,
      });
    });

    it('does not retry a non-retryable 400 (single fetch call)', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ ok: false, status: 400, body: 'bad' }));

      await expect(client.request('/x')).rejects.toBeInstanceOf(SchwabApiError);
      expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry/backoff', () => {
    it('retries a 503 then succeeds', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(fakeResponse({ ok: false, status: 503, body: 'unavailable', retryAfter: '0' }))
        .mockResolvedValueOnce(fakeResponse({ body: '{"ok":true}' }));

      const result = await client.request('/x');

      expect(result).toEqual({ ok: true });
      expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(2);
    });

    it('retries a network error then surfaces SchwabApiError(status 0) after exhausting', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNRESET'));

      const client0 = new HttpClient(oauth, BASE, { maxRetries: 1 });
      await expect(client0.request('/x')).rejects.toMatchObject({ name: 'SchwabApiError', status: 0, isRetryable: true });
      expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(2); // initial + 1 retry
    });

    it('gives up after maxRetries on persistent 503', async () => {
      global.fetch = jest.fn().mockResolvedValue(fakeResponse({ ok: false, status: 503, body: 'down', retryAfter: '0' }));

      await expect(client.request('/x')).rejects.toMatchObject({ status: 503 });
      expect((global.fetch as jest.Mock)).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });
});
