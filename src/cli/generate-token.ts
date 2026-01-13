#!/usr/bin/env node

/**
 * CLI tool for generating and managing Schwab API tokens
 *
 * Usage:
 *   npx schwab-generate-token --token_file /path/to/token.json --api_key YOUR_API_KEY --app_secret YOUR_APP_SECRET --callback_url https://127.0.0.1:8182
 */

import { clientFromLoginFlow, clientFromManualFlow } from '../auth/easyAuth';

interface CLIArgs {
  tokenFile: string;
  apiKey: string;
  appSecret: string;
  callbackUrl: string;
  manual?: boolean;
  help?: boolean;
}

function printUsage(): void {
  console.log(`
Schwab Token Generator - Generate OAuth tokens for the Schwab API

Usage:
  npx schwab-generate-token [options]

Required Arguments:
  --token_file <path>     Path to token file. Any existing file will be overwritten.
  --api_key <key>         Your Schwab API key (client ID)
  --app_secret <secret>   Your Schwab app secret (client secret)
  --callback_url <url>    Your OAuth callback URL (must match Schwab app config)

Optional Arguments:
  --manual               Use manual flow (copy-paste URLs) instead of browser
  --help, -h             Show this help message

Examples:
  # Generate token using browser flow
  npx schwab-generate-token \\
    --token_file ./token.json \\
    --api_key "your-api-key" \\
    --app_secret "your-app-secret" \\
    --callback_url "https://127.0.0.1:8182"

  # Generate token using manual flow (for headless environments)
  npx schwab-generate-token \\
    --token_file ./token.json \\
    --api_key "your-api-key" \\
    --app_secret "your-app-secret" \\
    --callback_url "https://127.0.0.1:8182" \\
    --manual

Notes:
  - The callback URL must exactly match what you configured in your Schwab app
  - For localhost callback URLs, you may see a browser warning about invalid
    certificates. This is normal and safe to proceed.
  - Tokens expire after 7 days and must be regenerated
`);
}

function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {
    tokenFile: '',
    apiKey: '',
    appSecret: '',
    callbackUrl: '',
    manual: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--token_file':
        result.tokenFile = nextArg || '';
        i++;
        break;
      case '--api_key':
        result.apiKey = nextArg || '';
        i++;
        break;
      case '--app_secret':
        result.appSecret = nextArg || '';
        i++;
        break;
      case '--callback_url':
        result.callbackUrl = nextArg || '';
        i++;
        break;
      case '--manual':
        result.manual = true;
        break;
      case '--help':
      case '-h':
        result.help = true;
        break;
    }
  }

  return result;
}

function validateArgs(args: CLIArgs): string[] {
  const errors: string[] = [];

  if (!args.tokenFile) {
    errors.push('--token_file is required');
  }
  if (!args.apiKey) {
    errors.push('--api_key is required');
  }
  if (!args.appSecret) {
    errors.push('--app_secret is required');
  }
  if (!args.callbackUrl) {
    errors.push('--callback_url is required');
  }

  return errors;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  const errors = validateArgs(args);
  if (errors.length > 0) {
    console.error('Error: Missing required arguments:');
    errors.forEach((err) => console.error(`  - ${err}`));
    console.error('\nRun with --help for usage information.');
    process.exit(1);
  }

  console.log('\n=== Schwab Token Generator ===\n');
  console.log(`Token file: ${args.tokenFile}`);
  console.log(`Callback URL: ${args.callbackUrl}`);
  console.log(`Mode: ${args.manual ? 'Manual' : 'Browser'}`);
  console.log('');

  try {
    const options = {
      tokenPath: args.tokenFile,
      apiKey: args.apiKey,
      appSecret: args.appSecret,
      callbackUrl: args.callbackUrl,
    };

    if (args.manual) {
      await clientFromManualFlow(options);
    } else {
      await clientFromLoginFlow({
        ...options,
        timeout: 300,
      });
    }

    console.log('\n=== Success! ===');
    console.log(`Token has been saved to: ${args.tokenFile}`);
    console.log('\nYou can now use this token file with your Schwab API client.');
    console.log('Note: Tokens expire after 7 days and will need to be regenerated.');
  } catch (error) {
    console.error('\n=== Error ===');
    console.error('Failed to generate token:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main().catch(console.error);
