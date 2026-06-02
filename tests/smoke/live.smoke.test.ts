import * as fs from 'fs';
import * as path from 'path';
import { clientFromTokenFile } from '../../src/auth/easyAuth';
import { SchwabClient } from '../../src/client';

/**
 * Live smoke suite — hits PRODUCTION Schwab. Opt-in only:
 *
 *   npm run test:smoke
 *
 * Requires:
 *   - ./schwab-token.json (from the OAuth flow / schwab-generate-token)
 *   - SCHWAB_CLIENT_ID / SCHWAB_CLIENT_SECRET / SCHWAB_REDIRECT_URI in the env
 *     (the test:smoke script loads .env via node --env-file).
 *
 * This is the regression net for the bug class that mocked unit tests cannot
 * catch: wrong base URLs / hosts and bad headers (e.g. Content-Type on GET).
 * If creds/token are absent the suite skips rather than failing.
 */

const tokenPath = path.resolve(process.cwd(), 'schwab-token.json');
const hasCreds =
  fs.existsSync(tokenPath) &&
  !!process.env.SCHWAB_CLIENT_ID &&
  !!process.env.SCHWAB_CLIENT_SECRET &&
  !!process.env.SCHWAB_REDIRECT_URI;

const d = hasCreds ? describe : describe.skip;

d('live Schwab smoke (production)', () => {
  let client: SchwabClient;

  beforeAll(async () => {
    const c = await clientFromTokenFile(
      tokenPath,
      process.env.SCHWAB_CLIENT_ID as string,
      process.env.SCHWAB_CLIENT_SECRET as string,
      process.env.SCHWAB_REDIRECT_URI as string
    );
    if (!c) {
      throw new Error('Could not build client from token file (expired refresh token?)');
    }
    client = c;
  });

  it('getAccountNumberMappings returns at least one account', async () => {
    const mappings = await client.getAccountNumberMappings();
    expect(Array.isArray(mappings)).toBe(true);
    expect(mappings.length).toBeGreaterThan(0);
  });

  it('getAccounts returns at least one account', async () => {
    const accounts = await client.getAccounts();
    expect(accounts.length).toBeGreaterThan(0);
  });

  it('getQuote(AAPL) returns a quote keyed by symbol', async () => {
    const quote = await client.getQuote('AAPL');
    expect(quote).toBeTruthy();
    expect(Object.keys(quote)).toContain('AAPL');
  });

  it('getQuotes([AAPL,MSFT]) returns both symbols', async () => {
    const quotes = await client.getQuotes(['AAPL', 'MSFT']);
    expect(Object.keys(quotes)).toEqual(expect.arrayContaining(['AAPL', 'MSFT']));
  });

  it('getMarketHours(EQUITY) returns the equity market', async () => {
    const hours = await client.getMarketHours(new Date().toISOString().slice(0, 10), 'EQUITY');
    expect(Object.keys(hours)).toContain('equity');
  });

  it('searchInstruments(AAPL) returns instruments', async () => {
    const result = await client.searchInstruments('AAPL');
    expect(result).toHaveProperty('instruments');
  });
});
