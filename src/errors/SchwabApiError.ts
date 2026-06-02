/**
 * Error thrown for non-2xx responses from the Schwab API (and network failures).
 *
 * Extends the built-in Error so existing `try/catch` blocks keep working, while
 * exposing structured fields callers can branch on.
 */
export class SchwabApiError extends Error {
  /** HTTP status code. `0` indicates a network/timeout failure (no response). */
  readonly status: number;
  /** Raw response body text (empty string when unavailable). */
  readonly body: string;
  /** Whether the failure is transient and worth retrying. */
  readonly isRetryable: boolean;

  constructor(status: number, body: string, message?: string) {
    super(message ?? `HTTP ${status}: ${body}`);
    this.name = 'SchwabApiError';
    this.status = status;
    this.body = body;
    this.isRetryable =
      status === 0 ||
      status === 429 ||
      status === 502 ||
      status === 503 ||
      status === 504;
    // Restore prototype chain for `instanceof` after transpilation to ES5/ES2015 targets.
    Object.setPrototypeOf(this, SchwabApiError.prototype);
  }
}
