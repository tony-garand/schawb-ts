import { SchwabClient } from '../src';

// Example configuration
const config = {
  clientId: 'your_client_id_here',
  clientSecret: 'your_client_secret_here',
  redirectUri: 'https://your-app.com/callback',
  environment: 'sandbox' as const, // or 'production'
};

async function basicUsageExample(): Promise<void> {
  // Create client instance
  const client = new SchwabClient(config);

  try {
    // Step 1: Get authorization URL
    const authUrl = client.getAuthorizationUrl('optional_state_parameter');
    console.log('Authorization URL:', authUrl);
    
    // Step 2: User visits the URL and authorizes the app
    // After authorization, user is redirected to your callback URL with a code
    // You would extract this code from the callback URL in your web application
    
    // Step 3: Exchange authorization code for tokens
    const authorizationCode = 'code_from_callback_url';
    const tokens = await client.completeOAuth(authorizationCode);
    console.log('OAuth tokens received:', tokens);

    // Step 4: Now you can make API calls
    const accounts = await client.getAccounts();
    console.log('Accounts:', accounts);

    if (accounts.length > 0) {
      const accountId = accounts[0].securitiesAccount.accountNumber;
      
      // Get account details
      const account = await client.getAccount(accountId);
      console.log('Account details:', account);

      // Get positions
      const positions = await client.getPositions(accountId);
      console.log('Positions:', positions);

      // Get a quote
      const quote = await client.getQuote('AAPL');
      console.log('AAPL Quote:', quote);

      // Place a simple market order (commented out for safety)
      /*
      const order = client.templates.buyMarketStock('AAPL', 10);
      const orderResponse = await client.placeOrder(order, accountId);
      console.log('Order placed:', orderResponse);
      */
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Example of token management
async function tokenManagementExample(): Promise<void> {
  const client = new SchwabClient(config);

  // Check if tokens are valid
  if (client.hasValidTokens()) {
    console.log('Tokens are valid');
    
    // Get current tokens
    const tokens = client.getTokens();
    console.log('Current tokens:', tokens);
  } else {
    console.log('No valid tokens, need to complete OAuth flow');
  }

  // Refresh tokens if needed
  try {
    const newTokens = await client.refreshTokens();
    console.log('Tokens refreshed:', newTokens);
  } catch (error) {
    console.error('Failed to refresh tokens:', error);
  }
}

// Example of using order builders
async function orderBuilderExample(): Promise<void> {
  const client = new SchwabClient(config);

  // Create a custom order using the builder
  const order = client.createOrder()
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setPrice(150.00)
    .setOrderLegCollection([
      client.createOrderLeg()
        .setInstruction('BUY')
        .setQuantity(10)
        .setInstrument('AAPL', 'EQUITY')
        .build()
    ])
    .build();

  console.log('Custom order:', JSON.stringify(order, null, 2));

  // Use pre-built templates
  const marketOrder = client.templates.buyMarketStock('AAPL', 10, 123456789);
  console.log('Market order template:', JSON.stringify(marketOrder, null, 2));

  // Create option symbol
  const optionSymbol = client.createOptionSymbol('AAPL', '240315', 'C', 150.00);
  console.log('Option symbol:', optionSymbol); // AAPL  240315C00150000
}

// Example of complex order types
async function complexOrderExample(): Promise<void> {
  const client = new SchwabClient(config);

  // One Cancels Another (OCO) order
  const ocoOrder = client.templates.oneCancelsAnother('AAPL', 10, 155.00, 145.00, 144.50);
  console.log('OCO Order:', JSON.stringify(ocoOrder, null, 2));

  // Trailing stop order
  const trailingStopOrder = client.templates.sellTrailingStop('AAPL', 10, 5.00);
  console.log('Trailing Stop Order:', JSON.stringify(trailingStopOrder, null, 2));

  // Vertical spread (options)
  const longOption = client.createOptionSymbol('AAPL', '240315', 'C', 150.00);
  const shortOption = client.createOptionSymbol('AAPL', '240315', 'C', 155.00);
  const spreadOrder = client.templates.buyVerticalSpread(longOption, shortOption, 1, 2.50);
  console.log('Vertical Spread Order:', JSON.stringify(spreadOrder, null, 2));
}

// Run examples
if (require.main === module) {
  console.log('=== Basic Usage Example ===');
  basicUsageExample().catch(console.error);

  console.log('\n=== Token Management Example ===');
  tokenManagementExample().catch(console.error);

  console.log('\n=== Order Builder Example ===');
  orderBuilderExample().catch(console.error);

  console.log('\n=== Complex Order Example ===');
  complexOrderExample().catch(console.error);
} 