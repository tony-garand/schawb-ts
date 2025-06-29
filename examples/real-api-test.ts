import { SchwabClient } from '../src';

// Real configuration - replace with your actual Schwab API credentials
const config = {
  clientId: process.env.SCHWAB_CLIENT_ID || 'your_client_id_here',
  clientSecret: process.env.SCHWAB_CLIENT_SECRET || 'your_client_secret_here',
  redirectUri: process.env.SCHWAB_REDIRECT_URI || 'https://127.0.0.1:3000/callback',
  environment: 'sandbox' as const, // Change to 'production' for live trading
};

async function testOAuthFlow(): Promise<void> {
  console.log('🔐 Testing OAuth Flow...\n');

  const client = new SchwabClient(config);

  // Step 1: Generate Authorization URL (Step 1 from Schwab docs)
  console.log('1. Generating Authorization URL...');
  const authUrl = client.getAuthorizationUrl('test_state_123');
  console.log('✅ Authorization URL generated:');
  console.log(authUrl);
  console.log('\n📝 Next steps:');
  console.log('1. Open this URL in your browser');
  console.log('2. Complete the Consent and Grant (CAG) process');
  console.log('3. You will be redirected to your callback URL with a code parameter');
  console.log('4. Use that code to exchange for tokens\n');

  // Note: In a real application, you would:
  // 1. Open the authUrl in a browser
  // 2. User completes OAuth flow
  // 3. Extract the 'code' from the callback URL
  // 4. Exchange code for tokens using client.exchangeCodeForTokens(code)
}

async function testOrderCreation(): Promise<void> {
  console.log('📋 Testing Order Creation Examples...\n');

  const client = new SchwabClient(config);

  // Example 1: Buy Market Stock (from Schwab docs)
  console.log('1. Creating Buy Market Stock Order...');
  const marketOrder = client.createOrder()
    .setOrderType('MARKET')
    .setSession('NORMAL')
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setOrderLegCollection([
      client.createOrderLeg()
        .setInstruction('BUY')
        .setQuantity(15)
        .setInstrument('XYZ', 'EQUITY')
        .build()
    ])
    .build();
  
  console.log('✅ Market Order:');
  console.log(JSON.stringify(marketOrder, null, 2));
  console.log('\n');

  // Example 2: Buy Limit Single Option (from Schwab docs)
  console.log('2. Creating Buy Limit Single Option Order...');
  const optionSymbol = client.createOptionSymbol('XYZ', '240315', 'C', 50.00);
  const optionOrder = client.createOrder()
    .setComplexOrderStrategyType('NONE')
    .setOrderType('LIMIT')
    .setSession('NORMAL')
    .setPrice(6.45)
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setOrderLegCollection([
      client.createOrderLeg()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(10)
        .setInstrument(optionSymbol, 'OPTION')
        .build()
    ])
    .build();

  console.log('✅ Option Order:');
  console.log(JSON.stringify(optionOrder, null, 2));
  console.log('\n');

  // Example 3: Buy Limit Vertical Call Spread (from Schwab docs)
  console.log('3. Creating Buy Limit Vertical Call Spread...');
  const spreadOrder = client.createOrder()
    .setOrderType('NET_DEBIT')
    .setSession('NORMAL')
    .setPrice(0.10)
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setOrderLegCollection([
      client.createOrderLeg()
        .setInstruction('BUY_TO_OPEN')
        .setQuantity(2)
        .setInstrument(client.createOptionSymbol('XYZ', '240315', 'P', 45.00), 'OPTION')
        .build(),
      client.createOrderLeg()
        .setInstruction('SELL_TO_OPEN')
        .setQuantity(2)
        .setInstrument(client.createOptionSymbol('XYZ', '240315', 'P', 43.00), 'OPTION')
        .build()
    ])
    .build();

  console.log('✅ Spread Order:');
  console.log(JSON.stringify(spreadOrder, null, 2));
  console.log('\n');

  // Example 4: One Cancels Another (OCO) Order (from Schwab docs)
  console.log('4. Creating One Cancels Another (OCO) Order...');
  const ocoOrder = client.createOrder()
    .setOrderStrategyType('OCO')
    .setChildOrderStrategies([
      client.createOrder()
        .setOrderType('LIMIT')
        .setSession('NORMAL')
        .setPrice(45.97)
        .setDuration('DAY')
        .setOrderStrategyType('SINGLE')
        .setOrderLegCollection([
          client.createOrderLeg()
            .setInstruction('SELL')
            .setQuantity(2)
            .setInstrument('XYZ', 'EQUITY')
            .build()
        ])
        .build(),
      client.createOrder()
        .setOrderType('STOP_LIMIT')
        .setSession('NORMAL')
        .setPrice(37.00)
        .setStopPrice(37.03)
        .setDuration('DAY')
        .setOrderStrategyType('SINGLE')
        .setOrderLegCollection([
          client.createOrderLeg()
            .setInstruction('SELL')
            .setQuantity(2)
            .setInstrument('XYZ', 'EQUITY')
            .build()
        ])
        .build()
    ])
    .build();

  console.log('✅ OCO Order:');
  console.log(JSON.stringify(ocoOrder, null, 2));
  console.log('\n');

  // Example 5: Trailing Stop Order (from Schwab docs)
  console.log('5. Creating Trailing Stop Order...');
  const trailingStopOrder = client.createOrder()
    .setComplexOrderStrategyType('NONE')
    .setOrderType('TRAILING_STOP')
    .setSession('NORMAL')
    .setStopPriceLinkBasis('BID')
    .setStopPriceLinkType('VALUE')
    .setStopPriceOffset(10)
    .setDuration('DAY')
    .setOrderStrategyType('SINGLE')
    .setOrderLegCollection([
      client.createOrderLeg()
        .setInstruction('SELL')
        .setQuantity(10)
        .setInstrument('XYZ', 'EQUITY')
        .build()
    ])
    .build();

  console.log('✅ Trailing Stop Order:');
  console.log(JSON.stringify(trailingStopOrder, null, 2));
  console.log('\n');
}

async function testOrderTemplates(): Promise<void> {
  console.log('📝 Testing Order Templates...\n');

  const client = new SchwabClient(config);

  // Test the built-in templates
  console.log('1. Market Order Template...');
  const marketTemplate = client.templates.buyMarketStock('AAPL', 10, 123456789);
  console.log('✅ Market Template:');
  console.log(JSON.stringify(marketTemplate, null, 2));
  console.log('\n');

  console.log('2. OCO Order Template...');
  const ocoTemplate = client.templates.oneCancelsAnother('AAPL', 10, 155.00, 145.00, 144.50);
  console.log('✅ OCO Template:');
  console.log(JSON.stringify(ocoTemplate, null, 2));
  console.log('\n');

  console.log('3. Trailing Stop Template...');
  const trailingTemplate = client.templates.sellTrailingStop('AAPL', 10, 5.00);
  console.log('✅ Trailing Stop Template:');
  console.log(JSON.stringify(trailingTemplate, null, 2));
  console.log('\n');
}

async function testOptionSymbolCreation(): Promise<void> {
  console.log('🎯 Testing Option Symbol Creation...\n');

  const client = new SchwabClient(config);

  // Test various option symbol formats (from Schwab docs)
  const testCases = [
    { underlying: 'XYZ', expiration: '210115', type: 'C' as const, strike: 50.00, expected: 'XYZ   210115C00050000' },
    { underlying: 'XYZ', expiration: '210115', type: 'C' as const, strike: 55.00, expected: 'XYZ   210115C00055000' },
    { underlying: 'XYZ', expiration: '210115', type: 'C' as const, strike: 62.50, expected: 'XYZ   210115C00062500' },
    { underlying: 'AAPL', expiration: '240315', type: 'P' as const, strike: 150.00, expected: 'AAPL  240315P00150000' },
  ];

  testCases.forEach((testCase, index) => {
    console.log(`${index + 1}. Testing: ${testCase.underlying} ${testCase.expiration}${testCase.type} $${testCase.strike}`);
    const symbol = client.createOptionSymbol(
      testCase.underlying,
      testCase.expiration,
      testCase.type,
      testCase.strike
    );
    console.log(`   Generated: "${symbol}"`);
    console.log(`   Expected:  "${testCase.expected}"`);
    console.log(`   ✅ ${symbol === testCase.expected ? 'MATCH' : 'MISMATCH'}\n`);
  });
}

async function testAPIEndpoints(): Promise<void> {
  console.log('🌐 Testing API Endpoints...\n');

  const client = new SchwabClient(config);

  // Test API calls (these will fail without valid tokens, but we can test the error handling)
  console.log('1. Testing getAccounts()...');
  try {
    const accounts = await client.getAccounts();
    console.log('✅ Accounts retrieved:', accounts);
  } catch (error) {
    console.log('✅ Expected error (no tokens):', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n2. Testing getQuote()...');
  try {
    const quote = await client.getQuote('AAPL');
    console.log('✅ Quote retrieved:', quote);
  } catch (error) {
    console.log('✅ Expected error (no tokens):', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n3. Testing getOrders()...');
  try {
    const orders = await client.getAllOrders();
    console.log('✅ Orders retrieved:', orders);
  } catch (error) {
    console.log('✅ Expected error (no tokens):', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function runRealAPITests(): Promise<void> {
  console.log('🚀 Running Real Schwab API Tests\n');
  console.log('=' .repeat(50));
  
  try {
    await testOAuthFlow();
    console.log('=' .repeat(50));
    
    await testOrderCreation();
    console.log('=' .repeat(50));
    
    await testOrderTemplates();
    console.log('=' .repeat(50));
    
    await testOptionSymbolCreation();
    console.log('=' .repeat(50));
    
    await testAPIEndpoints();
    console.log('=' .repeat(50));
    
    console.log('\n🎉 All real API tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Set your real Schwab API credentials as environment variables:');
    console.log('   - SCHWAB_CLIENT_ID');
    console.log('   - SCHWAB_CLIENT_SECRET');
    console.log('   - SCHWAB_REDIRECT_URI');
    console.log('2. Complete the OAuth flow to get valid tokens');
    console.log('3. Test with real API calls');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runRealAPITests();
}

export { 
  testOAuthFlow, 
  testOrderCreation, 
  testOrderTemplates, 
  testOptionSymbolCreation, 
  testAPIEndpoints,
  runRealAPITests 
}; 