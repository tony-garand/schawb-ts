import { SchwabClient } from '../src/client';
import { TransactionsAPI, TransactionType, TransactionQueryParams } from '../src/api/transactions';

// Example configuration - replace with your actual credentials
const config = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  environment: 'sandbox' as const, // Use 'production' for live trading
};

async function transactionsExample(): Promise<void> {
  const client = new SchwabClient(config);

  // Example account number (you'll need to get this from your account)
  const accountNumber = 'your-account-number';

  try {
    // 1. Get all transactions for a specific account with filters
    console.log('Getting transactions for account...');
    const transactionParams: TransactionQueryParams = {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
      symbol: 'AAPL', // Optional: filter by symbol
      types: 'TRADE' as TransactionType, // Optional: filter by transaction type
    };
    
    const transactions = await client.getTransactions(accountNumber, transactionParams);
    console.log(`Found ${transactions.length} transactions`);

    // 2. Get a specific transaction by ID
    if (transactions.length > 0) {
      console.log('Getting specific transaction details...');
      const transactionId = transactions[0].activityId;
      const transactionDetails = await client.getTransaction(accountNumber, transactionId);
      console.log('Transaction details:', transactionDetails);
    }

    // 3. Get recent transactions (last 30 days)
    console.log('Getting recent transactions...');
    const recentTransactions = await client.getRecentTransactions(accountNumber, 30);
    console.log(`Found ${recentTransactions.length} recent transactions`);

    // 4. Get transactions for a specific month
    console.log('Getting transactions for January 2024...');
    const januaryTransactions = await client.getTransactionsForMonth(accountNumber, 2024, 1);
    console.log(`Found ${januaryTransactions.length} transactions in January 2024`);

    // 5. Get only trade transactions
    console.log('Getting trade transactions...');
    const tradeTransactions = await client.getTradeTransactions(
      accountNumber,
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );
    console.log(`Found ${tradeTransactions.length} trade transactions`);

    // 6. Get only dividend transactions
    console.log('Getting dividend transactions...');
    const dividendTransactions = await client.getDividendTransactions(
      accountNumber,
      new Date('2024-01-01'),
      new Date('2024-12-31')
    );
    console.log(`Found ${dividendTransactions.length} dividend transactions`);

    // 7. Get transactions for a specific symbol
    console.log('Getting AAPL transactions...');
    const aaplTransactions = await client.getRecentTransactions(accountNumber, 90, 'AAPL');
    console.log(`Found ${aaplTransactions.length} AAPL transactions in the last 90 days`);

    // 8. Using helper methods for date formatting
    console.log('Using helper methods...');
    const dateRange = TransactionsAPI.createDateRange(
      new Date('2024-01-01'),
      new Date('2024-01-31')
    );
    console.log('Date range:', dateRange);

    const formattedDate = TransactionsAPI.formatDateTime(new Date());
    console.log('Formatted date:', formattedDate);

    // 9. Access transactions module directly
    console.log('Accessing transactions module directly...');
    const transactionsAPI = client.transactions;
    
    // Get transactions with custom filters
    const customTransactions = await transactionsAPI.getTransactions(accountNumber, {
      startDate: '2024-06-01T00:00:00.000Z',
      endDate: '2024-06-30T23:59:59.000Z',
      types: 'DIVIDEND_OR_INTEREST' as TransactionType,
    });
    console.log(`Found ${customTransactions.length} dividend/interest transactions in June 2024`);

    // 10. Analyze transaction types
    console.log('Analyzing transaction types...');
    const allTransactions = await client.getTransactions(accountNumber, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
    });

    const transactionTypeCounts = allTransactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Transaction type breakdown:', transactionTypeCounts);

    // 11. Calculate total net amount
    const totalNetAmount = allTransactions.reduce((sum, transaction) => {
      return sum + (transaction.netAmount || 0);
    }, 0);
    console.log(`Total net amount: $${totalNetAmount.toFixed(2)}`);

    // 12. Find transactions with specific activity types
    const tradeActivityTransactions = allTransactions.filter(
      transaction => transaction.activityType === 'TRADE'
    );
    console.log(`Found ${tradeActivityTransactions.length} transactions with TRADE activity type`);

    // 13. Get transactions by sub-account type
    const cashTransactions = allTransactions.filter(
      transaction => transaction.subAccount === 'CASH'
    );
    console.log(`Found ${cashTransactions.length} CASH sub-account transactions`);

    // 14. Analyze transfer items
    const transactionsWithTransferItems = allTransactions.filter(
      transaction => transaction.transferItems && transaction.transferItems.length > 0
    );
    console.log(`Found ${transactionsWithTransferItems.length} transactions with transfer items`);

    // 15. Get transactions by user type
    const advisorTransactions = allTransactions.filter(
      transaction => transaction.user.type === 'ADVISOR_USER'
    );
    console.log(`Found ${advisorTransactions.length} transactions by advisor users`);

  } catch (error) {
    console.error('Error in transactions example:', error);
  }
}

// Example of using the transactions module directly
async function directTransactionsExample(): Promise<void> {
  const client = new SchwabClient(config);
  const transactionsAPI = client.transactions; // Access the transactions module directly

  const accountNumber = 'your-account-number';

  try {
    // Get transactions with specific filters
    const tradeTransactions = await transactionsAPI.getTransactions(accountNumber, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
      types: 'TRADE' as TransactionType,
    });
    console.log('Trade transactions:', tradeTransactions);

    // Get transactions from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTransactions = await transactionsAPI.getTransactions(accountNumber, {
      startDate: TransactionsAPI.formatDateTime(sevenDaysAgo),
      endDate: TransactionsAPI.formatDateTime(new Date()),
    });
    console.log('Recent transactions:', recentTransactions);

    // Get transactions for specific symbols
    const symbolTransactions = await transactionsAPI.getTransactions(accountNumber, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
      symbol: 'MSFT',
    });
    console.log('MSFT transactions:', symbolTransactions);

  } catch (error) {
    console.error('Error in direct transactions example:', error);
  }
}

// Example of transaction analysis and reporting
async function transactionAnalysisExample(): Promise<void> {
  const client = new SchwabClient(config);
  const accountNumber = 'your-account-number';

  try {
    console.log('Performing transaction analysis...');

    // Get all transactions for the year
    const yearlyTransactions = await client.getTransactions(accountNumber, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.000Z',
    });

    // Generate monthly breakdown
    const monthlyBreakdown = yearlyTransactions.reduce((acc, transaction) => {
      const month = new Date(transaction.time).getMonth();
      const monthName = new Date(2024, month).toLocaleString('default', { month: 'long' });
      
      if (!acc[monthName]) {
        acc[monthName] = {
          count: 0,
          totalAmount: 0,
          types: {} as Record<string, number>,
        };
      }
      
      acc[monthName].count++;
      acc[monthName].totalAmount += transaction.netAmount || 0;
      acc[monthName].types[transaction.type] = (acc[monthName].types[transaction.type] || 0) + 1;
      
      return acc;
    }, {} as Record<string, { count: number; totalAmount: number; types: Record<string, number> }>);

    console.log('Monthly transaction breakdown:', monthlyBreakdown);

    // Calculate summary statistics
    const totalTransactions = yearlyTransactions.length;
    const totalAmount = yearlyTransactions.reduce((sum, t) => sum + (t.netAmount || 0), 0);
    const averageAmount = totalAmount / totalTransactions;
    
    console.log(`Total transactions: ${totalTransactions}`);
    console.log(`Total amount: $${totalAmount.toFixed(2)}`);
    console.log(`Average transaction amount: $${averageAmount.toFixed(2)}`);

    // Find largest transactions
    const largestTransactions = yearlyTransactions
      .sort((a, b) => (b.netAmount || 0) - (a.netAmount || 0))
      .slice(0, 5);
    
    console.log('Top 5 largest transactions:', largestTransactions.map(t => ({
      activityId: t.activityId,
      description: t.description,
      amount: t.netAmount,
      date: t.time,
    })));

  } catch (error) {
    console.error('Error in transaction analysis:', error);
  }
}

// Run the examples
if (require.main === module) {
  console.log('Running Transactions API Examples...\n');
  
  transactionsExample()
    .then(() => {
      console.log('\nTransactions example completed');
      return directTransactionsExample();
    })
    .then(() => {
      console.log('\nDirect transactions example completed');
      return transactionAnalysisExample();
    })
    .then(() => {
      console.log('\nTransaction analysis example completed');
    })
    .catch((error) => {
      console.error('Example failed:', error);
    });
}

export { transactionsExample, directTransactionsExample, transactionAnalysisExample }; 