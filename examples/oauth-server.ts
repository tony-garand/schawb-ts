import http from 'http';
import url from 'url';
import { SchwabClient } from '../src';
import { OAuthTokens } from '../src/types';

const PORT = process.env.PORT || 3000;

// Configuration - replace with your actual values
const config = {
  clientId: process.env.SCHWAB_CLIENT_ID || 'your_client_id_here',
  clientSecret: process.env.SCHWAB_CLIENT_SECRET || 'your_client_secret_here',
  redirectUri: `http://localhost:${PORT}/callback`,
  environment: 'sandbox' as const,
};

// Create Schwab client
const client = new SchwabClient(config);

// Store tokens in memory (use a proper database in production)
let storedTokens: OAuthTokens | null = null;

// HTML templates
const htmlTemplates = {
  home: `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Schwab API OAuth Example</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 5px;
        }
        .button:hover { background-color: #0056b3; }
        .success { background-color: #28a745; }
        .success:hover { background-color: #1e7e34; }
      </style>
    </head>
    <body>
      <h1>Schwab API OAuth Example</h1>
      <p>This example demonstrates the OAuth flow for the Schwab Trading API.</p>
      
      <h2>Step 1: Start OAuth Flow</h2>
      <a href="/auth" class="button">Authorize with Schwab</a>
      
      <h2>Step 2: Check Status</h2>
      <a href="/status" class="button">Check OAuth Status</a>
      
      <h2>Step 3: Test API Calls</h2>
      <a href="/accounts" class="button">Get Accounts</a>
      <a href="/quote/AAPL" class="button">Get AAPL Quote</a>
    </body>
    </html>
  `,
  
  success: (tokens: OAuthTokens): string => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Successful</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        a {
          display: inline-block;
          padding: 10px 20px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 5px;
        }
      </style>
    </head>
    <body>
      <h1>OAuth Successful!</h1>
      <p>Authorization completed successfully.</p>
      <p>Access Token: ${tokens.access_token.substring(0, 20)}...</p>
      <p>Refresh Token: ${tokens.refresh_token.substring(0, 20)}...</p>
      <p>Expires in: ${tokens.expires_in} seconds</p>
      
      <h2>Next Steps:</h2>
      <a href="/status">Check Status</a>
      <a href="/accounts">Get Accounts</a>
      <a href="/quote/AAPL">Get AAPL Quote</a>
    </body>
    </html>
  `
};

// Helper function to send JSON response
function sendJsonResponse(res: http.ServerResponse, data: unknown, statusCode: number = 200): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

// Helper function to send HTML response
function sendHtmlResponse(res: http.ServerResponse, html: string, statusCode: number = 200): void {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
}

// Helper function to send error response
function sendErrorResponse(res: http.ServerResponse, message: string, statusCode: number = 500): void {
  sendJsonResponse(res, { error: message }, statusCode);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (pathname) {
      case '/':
        sendHtmlResponse(res, htmlTemplates.home);
        break;

      case '/auth':
        try {
          const authUrl = client.getAuthorizationUrl('example_state');
          console.log('Redirecting to:', authUrl);
          res.writeHead(302, { Location: authUrl });
          res.end();
        } catch (error) {
          console.error('Error generating auth URL:', error);
          sendErrorResponse(res, 'Error generating authorization URL');
        }
        break;

      case '/callback':
        try {
          const { code, error } = parsedUrl.query;

          if (error) {
            console.error('OAuth error:', error);
            return sendErrorResponse(res, `OAuth Error: ${error}`, 400);
          }

          if (!code || typeof code !== 'string') {
            return sendErrorResponse(res, 'No authorization code received', 400);
          }

          console.log('Received authorization code:', code);
          
          // Exchange code for tokens
          const tokens = await client.completeOAuth(code);
          storedTokens = tokens;
          
          console.log('OAuth completed successfully');
          sendHtmlResponse(res, htmlTemplates.success(tokens));
        } catch (error) {
          console.error('Error completing OAuth:', error);
          sendErrorResponse(res, `Error completing OAuth: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;

      case '/status': {
        const hasTokens = client.hasValidTokens();
        const tokens = client.getTokens();
        
        sendJsonResponse(res, {
          hasValidTokens: hasTokens,
          tokens: tokens ? {
            access_token: tokens.access_token.substring(0, 20) + '...',
            refresh_token: tokens.refresh_token.substring(0, 20) + '...',
            expires_in: tokens.expires_in,
            token_type: tokens.token_type,
          } : null,
          storedTokens: storedTokens ? {
            access_token: storedTokens.access_token.substring(0, 20) + '...',
            refresh_token: storedTokens.refresh_token.substring(0, 20) + '...',
            expires_in: storedTokens.expires_in,
            token_type: storedTokens.token_type,
          } : null,
        });
        break;
      }

      case '/refresh':
        try {
          const newTokens = await client.refreshTokens();
          storedTokens = newTokens;
          sendJsonResponse(res, {
            success: true,
            message: 'Tokens refreshed successfully',
            tokens: {
              access_token: newTokens.access_token.substring(0, 20) + '...',
              refresh_token: newTokens.refresh_token.substring(0, 20) + '...',
              expires_in: newTokens.expires_in,
            },
          });
        } catch (error) {
          console.error('Error refreshing tokens:', error);
          sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error');
        }
        break;

      case '/accounts':
        try {
          if (!client.hasValidTokens()) {
            return sendErrorResponse(res, 'No valid tokens. Please complete OAuth flow first.', 401);
          }

          const accounts = await client.getAccounts();
          sendJsonResponse(res, {
            success: true,
            accounts: accounts,
          });
        } catch (error) {
          console.error('Error getting accounts:', error);
          sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error');
        }
        break;

      case '/quote/AAPL':
        try {
          if (!client.hasValidTokens()) {
            return sendErrorResponse(res, 'No valid tokens. Please complete OAuth flow first.', 401);
          }

          const quote = await client.getQuote('AAPL');
          sendJsonResponse(res, {
            success: true,
            symbol: 'AAPL',
            quote: quote,
          });
        } catch (error) {
          console.error('Error getting quote:', error);
          sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error');
        }
        break;

      case '/logout':
        client.clearTokens();
        storedTokens = null;
        sendJsonResponse(res, {
          success: true,
          message: 'Tokens cleared successfully',
        });
        break;

      default:
        // Handle dynamic routes like /quote/:symbol
        if (pathname?.startsWith('/quote/')) {
          try {
            const symbol = pathname.split('/')[2];
            
            if (!client.hasValidTokens()) {
              return sendErrorResponse(res, 'No valid tokens. Please complete OAuth flow first.', 401);
            }

            const quote = await client.getQuote(symbol);
            sendJsonResponse(res, {
              success: true,
              symbol: symbol,
              quote: quote,
            });
          } catch (error) {
            console.error('Error getting quote:', error);
            sendErrorResponse(res, error instanceof Error ? error.message : 'Unknown error');
          }
          return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        break;
    }
  } catch (error) {
    console.error('Server error:', error);
    sendErrorResponse(res, 'Internal server error');
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Schwab OAuth Example Server running on http://localhost:${PORT}`);
  console.log(`📋 Configuration:`);
  console.log(`   - Client ID: ${config.clientId}`);
  console.log(`   - Redirect URI: ${config.redirectUri}`);
  console.log(`   - Environment: ${config.environment}`);
  console.log(`\n🔗 Visit http://localhost:${PORT} to start the OAuth flow`);
});

export default server; 