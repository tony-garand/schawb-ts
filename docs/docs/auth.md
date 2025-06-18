---
sidebar_position: 3
---

# Authentication

By now, you should have followed the instructions in [Getting Started](./getting-started.md) and are ready to start making API calls. This page will teach you how to handle OAuth authentication with the Schwab API.

> **Note**: This guide is meant for users who want to run applications on their own machines. If you plan on distributing your app or running it on a server for other users, these login flows are not suitable.

## The Quick and Easy Route

If you just want to create a client quickly, use `easyClient()`. This method will attempt to create a client in the most appropriate way for your context:

- If you already have a token at `tokenPath`, it will load it and continue
- In desktop environments, it will start a web browser for you to sign in
- In notebook environments, it will run the manual flow

```typescript
import { easyClient } from 'schwab-ts';

// Follow the instructions on screen to authenticate
const client = await easyClient({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182',
  tokenPath: './token.json'
});

// Test the connection
const accounts = await client.get_accounts();
console.log('Authentication successful!');
```

## Manual Authentication Flows

### Browser-Based Login Flow

For desktop applications where you can open a web browser:

```typescript
import { clientFromLoginFlow } from 'schwab-ts';

const client = await clientFromLoginFlow({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182',
  tokenPath: './token.json'
});
```

### Manual Flow (No Browser)

For environments where you can't open a browser (cloud environments, notebooks):

```typescript
import { clientFromManualFlow } from 'schwab-ts';

const client = await clientFromManualFlow({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  callbackUrl: 'https://127.0.0.1:8182',
  tokenPath: './token.json'
});
```

### Loading from Existing Token

If you already have a token file:

```typescript
import { clientFromTokenFile } from 'schwab-ts';

const client = await clientFromTokenFile(
  './token.json',
  'YOUR_API_KEY',
  'YOUR_APP_SECRET'
);
```

## Token Management

### Token Expiration

Tokens are only valid for **seven days**. After seven days, you'll need to delete your old token file and create a new one.

**Best Practices:**
- Delete and recreate your token weekly (e.g., Sunday before markets open)
- Monitor token age using `client.tokenAge()`
- Implement proactive token refreshing for production applications

### Token File Structure

The token file contains both an access token and a refresh token:

```json
{
  "creation_timestamp": 1640995200,
  "token": {
    "access_token": "your_access_token_here",
    "refresh_token": "your_refresh_token_here",
    "token_type": "Bearer",
    "expires_in": 1800
  }
}
```

## Advanced Authentication

### Custom Token Functions

For advanced users who need custom token handling (e.g., serverless environments):

```typescript
import { clientFromAccessFunctions } from 'schwab-ts';

const client = await clientFromAccessFunctions({
  apiKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_APP_SECRET',
  tokenReadFunc: async () => {
    // Custom token reading logic
    return await readTokenFromDatabase();
  },
  tokenWriteFunc: async (token) => {
    // Custom token writing logic
    await saveTokenToDatabase(token);
  }
});
```

### OAuth Context Creation

For custom OAuth flows:

```typescript
import { getAuthContext } from 'schwab-ts';

const authContext = getAuthContext({
  apiKey: 'YOUR_API_KEY',
  callbackUrl: 'https://127.0.0.1:8182'
});
```

## Error Handling

### Common Authentication Errors

1. **Invalid Client Error**: Token has expired (older than 7 days)
2. **Invalid Grant**: Refresh token is invalid or expired
3. **Network Errors**: Check your internet connection and API endpoints

### Handling Token Expiration

```typescript
try {
  const client = await clientFromTokenFile('./token.json', apiKey, appSecret);
  const accounts = await client.get_accounts();
} catch (error) {
  if (error.message.includes('invalid_client')) {
    console.log('Token expired. Please create a new one.');
    // Delete token file and recreate
    await fs.unlink('./token.json');
    const newClient = await easyClient({ apiKey, appSecret, callbackUrl, tokenPath: './token.json' });
  }
}
```

## Security Best Practices

1. **Never commit tokens to version control**
2. **Use environment variables for sensitive data**
3. **Store tokens securely on your local machine**
4. **Rotate tokens regularly**
5. **Monitor for suspicious activity**

### Environment Variables

```typescript
import { clientFromTokenFile } from 'schwab-ts';

const client = await clientFromTokenFile(
  process.env.TOKEN_PATH || './token.json',
  process.env.SCHWAB_API_KEY!,
  process.env.SCHWAB_APP_SECRET!
);
```

## Technical Details

### OAuth Flow Overview

1. **Authorization Request**: Redirect user to Schwab's authorization URL
2. **User Consent**: User logs in and authorizes your application
3. **Authorization Code**: Schwab redirects back with an authorization code
4. **Token Exchange**: Exchange authorization code for access and refresh tokens
5. **API Access**: Use access token for API requests
6. **Token Refresh**: Use refresh token to get new access tokens

### Token Types

- **Access Token**: Valid for 30 minutes, used for API requests
- **Refresh Token**: Valid for 7 days, used to get new access tokens

The library automatically handles token refresh when needed, so you don't need to manage this manually.

## Next Steps

- **[Client Usage](./client.md)** - Learn how to use the authenticated client
- **[Streaming Data](./streaming.md)** - Set up real-time market data
- **[Order Management](./order-builder.md)** - Place and manage trades 