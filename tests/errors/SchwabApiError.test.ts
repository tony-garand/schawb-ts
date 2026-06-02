import { SchwabApiError } from '../../src/errors/SchwabApiError';

describe('SchwabApiError', () => {
  it('is an instanceof Error and SchwabApiError', () => {
    const err = new SchwabApiError(404, 'nope');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SchwabApiError);
    expect(err.name).toBe('SchwabApiError');
  });

  it('defaults the message to "HTTP <status>: <body>"', () => {
    expect(new SchwabApiError(400, 'bad request').message).toBe('HTTP 400: bad request');
  });

  it('uses a custom message when provided but keeps status/body', () => {
    const err = new SchwabApiError(0, 'ECONNRESET', 'Request failed: ECONNRESET');
    expect(err.message).toBe('Request failed: ECONNRESET');
    expect(err.status).toBe(0);
    expect(err.body).toBe('ECONNRESET');
  });

  it.each([
    [0, true],
    [429, true],
    [502, true],
    [503, true],
    [504, true],
    [400, false],
    [401, false],
    [404, false],
    [500, false],
    [501, false],
  ])('marks status %i as isRetryable=%s', (status, retryable) => {
    expect(new SchwabApiError(status, '').isRetryable).toBe(retryable);
  });
});
