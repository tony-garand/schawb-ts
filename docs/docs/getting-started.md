---
sidebar_position: 2
---

# Getting Started

Welcome to **schwab-ts**! This guide will help you set up your environment and make your first API call to the Schwab trading platform.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18.0 or higher installed
- A **Schwab Developer Account** (see setup below)
- Basic knowledge of **TypeScript** or **JavaScript**

## Setting Up Your Schwab Developer Account

### Step 1: Create a Developer Account

1. Visit the [Schwab Developer Portal](https://beta-developer.schwab.com/)
2. Sign in with your Schwab account or create a new one
3. Complete the developer registration process

### Step 2: Create an Application

1. Navigate to the **Applications** section
2. Click **Create Application**
3. Fill in the application details:
   - **Name**: Your app name (e.g., "My Trading Bot")
   - **Description**: Brief description of your application
   - **Callback URL**: `https://127.0.0.1:8182` (for local development)

![API Product Selection](/img/setting-up-api-product.png)

### Step 3: Configure API Access

1. Select the **Trader API** product
2. Set appropriate order limits for your use case
3. Submit for approval

**Note**: Application approval can take several days. You'll receive an email when your app is ready.

### Step 4: Get Your Credentials

Once approved, you'll receive:
- **API Key**: Your application identifier
- **App Secret**: Your application secret (keep this secure!)

## Installation

Install **schwab-ts** using npm:

```bash
npm install schwab-ts
```

## Quick Start Example

Here's a simple example to get you started:

```typescript
import { easyClient } from 'schwab-ts';

async function main() {
  try {
    // Create a client with automatic authentication
    const client = await easyClient({
      apiKey: 'YOUR_API_KEY',
      appSecret: 'YOUR_APP_SECRET',
      callbackUrl: 'https://127.0.0.1:8182',
      tokenPath: './token.json'
    });

    // Get account information
    const accounts = await client.get_accounts();
    console.log('Accounts:', accounts);

    // Get account details
    if (accounts.length > 0) {
      const account = await client.get_account(accounts[0].hashValue);
      console.log('Account details:', account);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Authentication Flow

**schwab-ts** uses OAuth 2.0 for authentication. The `easyClient` function handles the entire flow:

1. **Token Check**: Looks for an existing token file
2. **Token Validation**: Checks if the token is still valid
3. **OAuth Flow**: If needed, opens a browser for authentication
4. **Token Storage**: Saves the token for future use

### Token Management

- Tokens expire after **7 days**
- The library automatically handles token refresh
- Tokens are stored securely in the specified file
- You can delete the token file to force re-authentication

## Environment Setup

### TypeScript Configuration

If you're using TypeScript, make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Development Environment

For the best development experience:

1. **VS Code** with TypeScript extensions
2. **ESLint** and **Prettier** for code formatting
3. **Jest** for testing (included in the package)

## Next Steps

Now that you have the basics set up, explore:

- **[Authentication](./auth.md)** - Detailed OAuth flow information
- **[Client Usage](./client.md)** - API methods and examples
- **[Streaming Data](./streaming.md)** - Real-time market data
- **[Order Templates](./order-templates.md)** - Pre-built order templates
- **[Order Builder](./order-builder.md)** - Custom order creation

## Troubleshooting

### Common Issues

**"Invalid client" error**
- Check your API key and app secret
- Ensure your app is approved and active

**"Token expired" error**
- Delete the token file and re-authenticate
- Tokens expire after 7 days

**"Callback URL mismatch" error**
- Use exactly `https://127.0.0.1:8182` (no trailing slash)
- Make sure this matches your app configuration

### Getting Help

- **[Help Guide](./help.md)** - Troubleshooting and common issues
- **[Discord Community](https://discord.gg/M3vjtHj)** - Real-time support
- **[GitHub Issues](https://github.com/tony-garand/schwab-ts/issues)** - Bug reports

## Security Best Practices

- **Never commit credentials** to version control
- **Use environment variables** for production deployments
- **Rotate tokens regularly** for security
- **Monitor API usage** to stay within limits
- **Keep dependencies updated** for security patches

---

<div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', backgroundColor: '#f0f8ff', borderRadius: '8px' }}>
  <p><strong>Ready to start trading?</strong></p>
  <p>Check out the <a href="./client">Client Usage guide</a> to learn about available API methods!</p>
</div> 