import { SchwabOAuth } from '../auth/oauth';
import { SchwabApiError } from '../errors/SchwabApiError';

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  /** Optional query parameters appended to the URL (undefined values skipped). */
  query?: Record<string, string | number | boolean | undefined>;
}

export interface HttpClientOptions {
  /** Per-request timeout in milliseconds (default 30s). */
  timeoutMs?: number;
  /** Max retry attempts for transient failures (default 3). */
  maxRetries?: number;
}

/** Transient HTTP statuses worth retrying. 500/501 are excluded (usually not transient). */
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

/**
 * Shared HTTP client for all Schwab API modules.
 *
 * Centralizes authentication, headers, error mapping, timeouts, and retry/backoff
 * so the individual API modules only describe endpoint paths. Connection reuse
 * (keep-alive) is provided by Node's default global fetch dispatcher.
 */
export class HttpClient {
  private readonly oauth: SchwabOAuth;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(oauth: SchwabOAuth, baseUrl: string, options: HttpClientOptions = {}) {
    this.oauth = oauth;
    this.baseUrl = baseUrl;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;
  }

  /**
   * Perform an authenticated request. `path` is relative to the configured base
   * URL (or an absolute URL). Resolves to the parsed JSON body (or null for
   * empty responses). Throws {@link SchwabApiError} on failure.
   */
  async request(path: string, options: RequestOptions = {}): Promise<unknown> {
    const url = this.buildUrl(path, options.query);
    let attempt = 0;

    for (;;) {
      const authHeader = await this.oauth.getAuthorizationHeader();
      const headers: Record<string, string> = {
        Accept: 'application/json',
        Authorization: authHeader,
        // Schwab returns HTTP 400 when Content-Type is sent on a bodyless request,
        // so only include it when there is a request body.
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      };

      let response: Response;
      try {
        response = await fetch(url, {
          method: options.method || 'GET',
          headers,
          body: options.body,
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      } catch (err) {
        // Network error or timeout (no HTTP response).
        if (attempt < this.maxRetries) {
          await this.sleep(this.backoff(attempt));
          attempt++;
          continue;
        }
        const reason = err instanceof Error ? err.message : String(err);
        throw new SchwabApiError(0, reason, `Request to ${url} failed: ${reason}`);
      }

      if (response.ok) {
        return this.parseBody(response);
      }

      const body = await this.safeText(response);
      if (RETRYABLE_STATUS.has(response.status) && attempt < this.maxRetries) {
        const retryAfter = this.parseRetryAfter(response.headers?.get?.('retry-after'));
        await this.sleep(retryAfter ?? this.backoff(attempt));
        attempt++;
        continue;
      }

      throw new SchwabApiError(response.status, body);
    }
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    let url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    if (query) {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          qs.append(key, String(value));
        }
      }
      const encoded = qs.toString();
      if (encoded) {
        url += (url.includes('?') ? '&' : '?') + encoded;
      }
    }
    return url;
  }

  private async parseBody(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return null;
    }
    // Prefer text() so empty bodies (e.g. DELETE) parse to null. Fall back to
    // json() for environments/mocks that only implement json().
    if (typeof response.text === 'function') {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    if (typeof response.json === 'function') {
      return response.json();
    }
    return null;
  }

  private async safeText(response: Response): Promise<string> {
    try {
      return typeof response.text === 'function' ? await response.text() : '';
    } catch {
      return '';
    }
  }

  private parseRetryAfter(value: string | null | undefined): number | null {
    if (!value) {
      return null;
    }
    const seconds = Number(value);
    if (!Number.isNaN(seconds)) {
      return seconds * 1000;
    }
    const date = Date.parse(value);
    return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
  }

  private backoff(attempt: number): number {
    return 250 * Math.pow(2, attempt) + Math.floor(Math.random() * 100);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
