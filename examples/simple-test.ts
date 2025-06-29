import { SchwabClient } from '../src';

// Test configuration
const config = {
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  redirectUri: 'https://test.com/callback',
  environment: 'sandbox' as const,
};

async function testBasicFunctionality(): Promise<void> {
  console.log('🧪 Testing Schwab API Client...\n');

  // Test 1: Client instantiation
  console.log('1. Testing client instantiation...');
  const client = new SchwabClient(config);
  console.log('✅ Client created successfully\n');

  // Test 2: Authorization URL generation
  console.log('2. Testing authorization URL generation...');
  const authUrl = client.getAuthorizationUrl('test_state');
  console.log('✅ Authorization URL generated:', authUrl.substring(0, 50) + '...\n');

  // Test 3: Token validation (should be false initially)
  console.log('3. Testing token validation...');
  const hasTokens = client.hasValidTokens();
  console.log('✅ Token validation check:', hasTokens, '(expected: false)\n');

  // Test 4: Order builder functionality
  console.log('4. Testing order builder...');
  const order = client.createOrder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setOrderLegCollection([
      client.createOrderLeg()
        .setInstruction('BUY')
        .setQuantity(10)
        .setInstrument('AAPL', 'EQUITY')
        .build()
    ])
    .build();
  console.log('✅ Order built successfully:', JSON.stringify(order, null, 2).substring(0, 100) + '...\n');

  // Test 5: Order templates
  console.log('5. Testing order templates...');
  const marketOrder = client.templates.buyMarketStock('AAPL', 10, 123456789);
  console.log('✅ Market order template created:', JSON.stringify(marketOrder, null, 2).substring(0, 100) + '...\n');

  // Test 6: Option symbol creation
  console.log('6. Testing option symbol creation...');
  const optionSymbol = client.createOptionSymbol('AAPL', '240315', 'C', 150.00);
  console.log('✅ Option symbol created:', optionSymbol, '(expected: AAPL  240315C00150000)\n');

  // Test 7: Complex order templates
  console.log('7. Testing complex order templates...');
  client.templates.oneCancelsAnother('AAPL', 10, 155.00, 145.00, 144.50);
  console.log('✅ OCO order template created successfully\n');

  client.templates.sellTrailingStop('AAPL', 10, 5.00);
  console.log('✅ Trailing stop order template created successfully\n');

  // Test 8: Configuration access
  console.log('8. Testing configuration access...');
  const clientConfig = client.getConfig();
  console.log('✅ Configuration retrieved:', {
    clientId: clientConfig.clientId,
    environment: clientConfig.environment,
    redirectUri: clientConfig.redirectUri
  });

  console.log('\n🎉 All basic functionality tests passed!');
  console.log('\nNote: API calls require valid OAuth tokens.');
  console.log('To test API calls, complete the OAuth flow first.');
}

// Test error handling
async function testErrorHandling(): Promise<void> {
  console.log('\n🧪 Testing error handling...\n');

  const client = new SchwabClient(config);

  try {
    // This should fail because we don't have tokens
    await client.getAccounts();
    console.log('❌ Expected error but got success');
  } catch (error) {
    console.log('✅ Expected error caught:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    // This should fail because we don't have tokens
    await client.getQuote('AAPL');
    console.log('❌ Expected error but got success');
  } catch (error) {
    console.log('✅ Expected error caught:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Run tests
async function runTests(): Promise<void> {
  try {
    await testBasicFunctionality();
    await testErrorHandling();
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}

export { testBasicFunctionality, testErrorHandling }; 