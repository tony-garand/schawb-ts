/**
 * Centralized Schwab API endpoint configuration.
 *
 * Single source of truth for base URLs so they are not duplicated across the
 * individual API modules.
 */

export type SchwabEnvironment = 'sandbox' | 'production';
export type SchwabApi = 'trader' | 'marketData';

/**
 * Base URLs per environment and API surface.
 *
 * Production endpoints are verified live against Schwab (commit 6d809da):
 *   trader     -> https://api.schwabapi.com/trader/v1
 *   marketData -> https://api.schwabapi.com/marketdata/v1
 *
 * NOTE: The sandbox endpoints below are UNVERIFIED. Schwab does not expose a
 * public sandbox we can test against, so these values are best-effort and
 * should not be relied upon. Only production is proven.
 */
export const ENDPOINTS: Record<SchwabEnvironment, Record<SchwabApi, string>> = {
  production: {
    trader: 'https://api.schwabapi.com/trader/v1',
    marketData: 'https://api.schwabapi.com/marketdata/v1',
  },
  sandbox: {
    // UNVERIFIED — placeholder values, not proven against a real sandbox.
    trader: 'https://api.schwabapi.com/v1/sandbox',
    marketData: 'https://api-sandbox.schwab.com/marketdata/v1',
  },
};

/**
 * Resolve the base URL for a given environment and API surface.
 */
export function getBaseUrl(
  api: SchwabApi,
  environment: SchwabEnvironment = 'production'
): string {
  return ENDPOINTS[environment][api];
}
