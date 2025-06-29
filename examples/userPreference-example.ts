import { SchwabClient } from '../src/client';
import { AccountPreference, StreamerInfo } from '../src/api/userPreference';

// Example configuration - replace with your actual credentials
const config = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  environment: 'sandbox' as const, // Use 'production' for live trading
};

async function userPreferenceExample(): Promise<void> {
  const client = new SchwabClient(config);

  try {
    // 1. Get all user preferences
    console.log('Getting user preferences...');
    const userPreferences = await client.getUserPreferences();
    console.log('User preferences:', userPreferences);

    // 2. Get primary account
    console.log('Getting primary account...');
    const primaryAccount = await client.getPrimaryAccount();
    if (primaryAccount) {
      console.log('Primary account:', primaryAccount);
    } else {
      console.log('No primary account found');
    }

    // 3. Get all account preferences
    console.log('Getting all account preferences...');
    const accountPreferences = await client.getAccountPreferences();
    console.log(`Found ${accountPreferences.length} account preferences`);

    // 4. Get account preference by account number
    if (accountPreferences.length > 0) {
      const firstAccountNumber = (accountPreferences[0] as AccountPreference).accountNumber;
      console.log(`Getting preference for account ${firstAccountNumber}...`);
      const accountPreference = await client.getAccountPreference(firstAccountNumber);
      console.log('Account preference:', accountPreference);
    }

    // 5. Get streamer information
    console.log('Getting streamer information...');
    const streamerInfo = await client.getStreamerInfo();
    console.log('Streamer info:', streamerInfo);

    // 6. Get offers information
    console.log('Getting offers information...');
    const offers = await client.getOffers();
    console.log('Offers:', offers);

    // 7. Check level 2 permissions
    console.log('Checking level 2 permissions...');
    const hasLevel2 = await client.hasLevel2Permissions();
    console.log(`Has level 2 permissions: ${hasLevel2}`);

    // 8. Get market data permissions
    console.log('Getting market data permissions...');
    const marketDataPermissions = await client.getMarketDataPermissions();
    console.log('Market data permissions:', marketDataPermissions);

    // 9. Get account nicknames
    console.log('Getting account nicknames...');
    const accountNicknames = await client.getAccountNicknames();
    console.log('Account nicknames:', accountNicknames);

    // 10. Get account colors
    console.log('Getting account colors...');
    const accountColors = await client.getAccountColors();
    console.log('Account colors:', accountColors);

    // 11. Get accounts by type
    console.log('Getting accounts by type...');
    const individualAccounts = await client.getAccountsByType('INDIVIDUAL');
    console.log(`Found ${individualAccounts.length} individual accounts`);

    // 12. Get accounts with auto position effect
    console.log('Getting accounts with auto position effect...');
    const autoPositionAccounts = await client.getAccountsWithAutoPositionEffect();
    console.log(`Found ${autoPositionAccounts.length} accounts with auto position effect`);

    // 13. Get streamer socket URL
    console.log('Getting streamer socket URL...');
    const streamerSocketUrl = await client.getStreamerSocketUrl();
    console.log('Streamer socket URL:', streamerSocketUrl);

    // 14. Get Schwab client IDs
    console.log('Getting Schwab client information...');
    const customerId = await client.getSchwabClientCustomerId();
    const correlId = await client.getSchwabClientCorrelId();
    const channel = await client.getSchwabClientChannel();
    const functionId = await client.getSchwabClientFunctionId();
    
    console.log('Schwab client customer ID:', customerId);
    console.log('Schwab client correlation ID:', correlId);
    console.log('Schwab client channel:', channel);
    console.log('Schwab client function ID:', functionId);

    // 15. Access user preference module directly
    console.log('Accessing user preference module directly...');
    const userPreferenceAPI = client.userPreference;
    
    // Get all preferences again
    const allPreferences = await userPreferenceAPI.getUserPreferences();
    console.log(`Found ${allPreferences.length} preference groups`);

  } catch (error) {
    console.error('Error in user preference example:', error);
  }
}

// Example of using the user preference module directly
async function directUserPreferenceExample(): Promise<void> {
  const client = new SchwabClient(config);
  const userPreferenceAPI = client.userPreference; // Access the user preference module directly

  try {
    // Get user preferences with specific filters
    const preferences = await userPreferenceAPI.getUserPreferences();
    console.log('All user preferences:', preferences);

    // Get primary account
    const primaryAccount = await userPreferenceAPI.getPrimaryAccount();
    console.log('Primary account:', primaryAccount);

    // Get streamer info
    const streamerInfo = await userPreferenceAPI.getStreamerInfo();
    console.log('Streamer info:', streamerInfo);

    // Get offers
    const offers = await userPreferenceAPI.getOffers();
    console.log('Offers:', offers);

  } catch (error) {
    console.error('Error in direct user preference example:', error);
  }
}

// Example of user preference analysis and reporting
async function userPreferenceAnalysisExample(): Promise<void> {
  const client = new SchwabClient(config);

  try {
    console.log('Performing user preference analysis...');

    // Get all account preferences
    const accountPreferences = await client.getAccountPreferences();
    
    // Analyze account types
    const accountTypeCounts = (accountPreferences as AccountPreference[]).reduce((acc, account) => {
      acc[account.type] = (acc[account.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Account type breakdown:', accountTypeCounts);

    // Find accounts with nicknames
    const accountsWithNicknames = (accountPreferences as AccountPreference[]).filter(account => account.nickName);
    console.log(`Found ${accountsWithNicknames.length} accounts with nicknames`);

    // Find accounts with colors
    const accountsWithColors = (accountPreferences as AccountPreference[]).filter(account => account.accountColor);
    console.log(`Found ${accountsWithColors.length} accounts with colors`);

    // Find accounts with auto position effect
    const accountsWithAutoPosition = (accountPreferences as AccountPreference[]).filter(account => account.autoPositionEffect);
    console.log(`Found ${accountsWithAutoPosition.length} accounts with auto position effect`);

    // Get primary account details
    const primaryAccount = await client.getPrimaryAccount();
    if (primaryAccount) {
      console.log('Primary account details:', {
        accountNumber: (primaryAccount as AccountPreference).accountNumber,
        type: (primaryAccount as AccountPreference).type,
        nickName: (primaryAccount as AccountPreference).nickName,
        accountColor: (primaryAccount as AccountPreference).accountColor,
        autoPositionEffect: (primaryAccount as AccountPreference).autoPositionEffect,
      });
    }

    // Get streamer information for real-time data
    const streamerInfo = await client.getStreamerInfo();
    if (streamerInfo.length > 0) {
      console.log('Streamer configuration:', {
        socketUrl: (streamerInfo[0] as StreamerInfo).streamerSocketUrl,
        customerId: (streamerInfo[0] as StreamerInfo).schwabClientCustomerId,
        channel: (streamerInfo[0] as StreamerInfo).schwabClientChannel,
        functionId: (streamerInfo[0] as StreamerInfo).schwabClientFunctionId,
      });
    }

    // Check permissions
    const hasLevel2 = await client.hasLevel2Permissions();
    const marketDataPermissions = await client.getMarketDataPermissions();
    
    console.log('Permissions:', {
      hasLevel2Permissions: hasLevel2,
      marketDataPermissions: marketDataPermissions,
    });

    // Generate account summary
    const accountSummary = (accountPreferences as AccountPreference[]).map(account => ({
      accountNumber: account.accountNumber,
      type: account.type,
      nickName: account.nickName || 'No nickname',
      accountColor: account.accountColor || 'No color',
      isPrimary: account.primaryAccount,
      hasAutoPosition: account.autoPositionEffect,
    }));

    console.log('Account summary:', accountSummary);

  } catch (error) {
    console.error('Error in user preference analysis:', error);
  }
}

// Example of using user preferences for account management
async function accountManagementExample(): Promise<void> {
  const client = new SchwabClient(config);

  try {
    console.log('Using user preferences for account management...');

    // Get primary account for default operations
    const primaryAccount = await client.getPrimaryAccount();
    if (primaryAccount) {
      console.log(`Using primary account: ${(primaryAccount as AccountPreference).accountNumber} (${(primaryAccount as AccountPreference).nickName})`);
      
      // Use primary account for trading operations
      // const quote = await client.getQuote('AAPL');
      // const order = client.templates.buyMarketStock('AAPL', 10);
      // const orderResponse = await client.placeOrder(order, primaryAccount.accountNumber);
      // console.log('Order placed on primary account:', orderResponse);
    }

    // Get account nicknames for better UX
    const accountNicknames = await client.getAccountNicknames();
    console.log('Account nicknames for UI:', accountNicknames);

    // Get account colors for UI theming
    const accountColors = await client.getAccountColors();
    console.log('Account colors for UI:', accountColors);

    // Get accounts by type for different operations
    const individualAccounts = await client.getAccountsByType('INDIVIDUAL');
    const retirementAccounts = await client.getAccountsByType('IRA');
    
    console.log(`Found ${individualAccounts.length} individual accounts`);
    console.log(`Found ${retirementAccounts.length} retirement accounts`);

    // Use accounts with auto position effect for specific trading strategies
    const autoPositionAccounts = await client.getAccountsWithAutoPositionEffect();
    console.log(`Found ${autoPositionAccounts.length} accounts with auto position effect`);

    // Get streamer info for real-time data connections
    const streamerSocketUrl = await client.getStreamerSocketUrl();
    if (streamerSocketUrl) {
      console.log('Real-time data available at:', streamerSocketUrl);
      // Use this URL for WebSocket connections to get real-time market data
    }

    // Check permissions before attempting operations
    const hasLevel2 = await client.hasLevel2Permissions();
    if (hasLevel2) {
      console.log('User has level 2 permissions - can access advanced market data');
    } else {
      console.log('User has basic permissions only');
    }

  } catch (error) {
    console.error('Error in account management example:', error);
  }
}

// Run the examples
if (require.main === module) {
  console.log('Running UserPreference API Examples...\n');
  
  userPreferenceExample()
    .then(() => {
      console.log('\nUser preference example completed');
      return directUserPreferenceExample();
    })
    .then(() => {
      console.log('\nDirect user preference example completed');
      return userPreferenceAnalysisExample();
    })
    .then(() => {
      console.log('\nUser preference analysis example completed');
      return accountManagementExample();
    })
    .then(() => {
      console.log('\nAccount management example completed');
    })
    .catch((error) => {
      console.error('Example failed:', error);
    });
}

export { userPreferenceExample, directUserPreferenceExample, userPreferenceAnalysisExample, accountManagementExample };