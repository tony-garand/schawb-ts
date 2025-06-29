import { SchwabClient } from '../src/client';
import { OrderBuilder, OrderTemplates, OrderLegBuilder } from '../src/builders/orderBuilder';
import { OrdersAPI, OrderStatus, OrderQueryParams } from '../src/api/orders';

// Example configuration - replace with your actual credentials
const config = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  environment: 'sandbox' as const, // Use 'production' for live trading
};

async function ordersExample(): Promise<void> {
  const client = new SchwabClient(config);

  // Example account number (you'll need to get this from your account)
  const accountNumber = 'your-account-number';

  try {
    // 1. Get all orders for a specific account
    console.log('Getting orders for account...');
    const orderParams: OrderQueryParams = {
      maxResults: 10,
      fromEnteredTime: '2024-01-01T00:00:00.000Z',
      toEnteredTime: '2024-12-31T23:59:59.000Z',
      status: 'FILLED' as OrderStatus,
    };
    
    const orders = await client.getOrdersForAccount(accountNumber, orderParams);
    console.log(`Found ${orders.length} orders`);

    // 2. Get all orders for all accounts
    console.log('Getting all orders for all accounts...');
    const allOrders = await client.getAllOrders({
      maxResults: 5,
      fromEnteredTime: '2024-01-01T00:00:00.000Z',
      toEnteredTime: '2024-12-31T23:59:59.000Z',
    });
    console.log(`Found ${allOrders.length} total orders`);

    // 3. Create and place a market order
    console.log('Creating and placing a market order...');
    const orderBuilder = new OrderBuilder();
    const marketOrder = orderBuilder
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setOrderLegCollection([
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(100)
          .setInstrument('AAPL', 'EQUITY')
          .build()
      ])
      .build();

    const orderResponse = await client.placeOrder(marketOrder, accountNumber);
    console.log('Order placed:', orderResponse);

    // 4. Get a specific order by ID
    if (orderResponse.orderId) {
      console.log('Getting order details...');
      const orderDetails = await client.getOrder(Number(orderResponse.orderId), accountNumber);
      console.log('Order details:', orderDetails);
    }

    // 5. Create and place a limit order
    console.log('Creating and placing a limit order...');
    const limitOrder = orderBuilder
      .setOrderType('LIMIT')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setPrice(150.00)
      .setOrderLegCollection([
        new OrderLegBuilder()
          .setInstruction('SELL')
          .setQuantity(50)
          .setInstrument('MSFT', 'EQUITY')
          .build()
      ])
      .build();

    const limitOrderResponse = await client.placeOrder(limitOrder, accountNumber);
    console.log('Limit order placed:', limitOrderResponse);

    // 6. Replace an order (modify existing order)
    if (limitOrderResponse.orderId) {
      console.log('Replacing order...');
      const replacementOrder = orderBuilder
        .setOrderType('LIMIT')
        .setSession('NORMAL')
        .setDuration('DAY')
        .setOrderStrategyType('SINGLE')
        .setPrice(155.00) // New price
        .setOrderLegCollection([
          new OrderLegBuilder()
            .setInstruction('SELL')
            .setQuantity(50)
            .setInstrument('MSFT', 'EQUITY')
            .build()
        ])
        .build();

      const replaceResponse = await client.replaceOrder(
        Number(limitOrderResponse.orderId), 
        accountNumber, 
        replacementOrder
      );
      console.log('Order replaced:', replaceResponse);
    }

    // 7. Cancel an order
    if (orderResponse.orderId) {
      console.log('Canceling order...');
      await client.cancelOrder(Number(orderResponse.orderId), accountNumber);
      console.log('Order canceled successfully');
    }

    // 8. Preview an order (Coming Soon feature)
    console.log('Previewing order...');
    const previewOrder = orderBuilder
      .setOrderType('MARKET')
      .setSession('NORMAL')
      .setDuration('DAY')
      .setOrderStrategyType('SINGLE')
      .setOrderLegCollection([
        new OrderLegBuilder()
          .setInstruction('BUY')
          .setQuantity(10)
          .setInstrument('GOOGL', 'EQUITY')
          .build()
      ])
      .build();

    try {
      const previewResponse = await client.previewOrder(accountNumber, previewOrder);
      console.log('Order preview:', previewResponse);
    } catch (error) {
      console.log('Preview order not available yet:', error.message);
    }

    // 9. Using helper methods for date formatting
    console.log('Using helper methods...');
    const dateRange = OrdersAPI.createDateRange(
      new Date('2024-01-01'),
      new Date('2024-01-31')
    );
    console.log('Date range:', dateRange);

    const formattedDate = OrdersAPI.formatDateTime(new Date());
    console.log('Formatted date:', formattedDate);

    // 10. Using order templates
    console.log('Using order templates...');
    const templateOrder = OrderTemplates.buyMarketStock('TSLA', 25, parseInt(accountNumber));
    console.log('Template order:', templateOrder);

    // 11. Create option symbol
    const optionSymbol = client.createOptionSymbol('AAPL', '240315', 'C', 150);
    console.log('Option symbol:', optionSymbol);

  } catch (error) {
    console.error('Error in orders example:', error);
  }
}

// Example of using the orders module directly
async function directOrdersExample(): Promise<void> {
  const client = new SchwabClient(config);
  const ordersAPI = client.orders; // Access the orders module directly

  const accountNumber = 'your-account-number';

  try {
    // Get orders with specific status
    const workingOrders = await ordersAPI.getOrdersForAccount(accountNumber, {
      status: 'WORKING' as OrderStatus,
      maxResults: 5,
    });
    console.log('Working orders:', workingOrders);

    // Get orders from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await ordersAPI.getOrdersForAccount(accountNumber, {
      fromEnteredTime: OrdersAPI.formatDateTime(sevenDaysAgo),
      toEnteredTime: OrdersAPI.formatDateTime(new Date()),
    });
    console.log('Recent orders:', recentOrders);

  } catch (error) {
    console.error('Error in direct orders example:', error);
  }
}

// Run the examples
if (require.main === module) {
  console.log('Running Orders API Examples...\n');
  
  ordersExample()
    .then(() => {
      console.log('\nOrders example completed');
      return directOrdersExample();
    })
    .then(() => {
      console.log('\nDirect orders example completed');
    })
    .catch((error) => {
      console.error('Example failed:', error);
    });
}

export { ordersExample, directOrdersExample }; 