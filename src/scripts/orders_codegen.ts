import { clientFromTokenFile } from '../auth';
import { constructRepeatOrder, codeForBuilder } from '../contrib/orders';

export async function latestOrderMain(sysArgs: string[]): Promise<number> {
  // Argument parsing
  const args: Record<string, any> = {};
  for (let i = 0; i < sysArgs.length; i++) {
    if (sysArgs[i].startsWith('--')) {
      const key = sysArgs[i].replace(/^--/, '');
      const value = sysArgs[i + 1] && !sysArgs[i + 1].startsWith('--') ? sysArgs[++i] : true;
      args[key] = value;
    }
  }

  if (!args.token_file || !args.api_key || !args.app_secret) {
    console.error('Missing required arguments: --token_file, --api_key, --app_secret');
    return -1;
  }

  const client = await clientFromTokenFile(args.token_file, args.app_secret, args.api_key);

  let account_hash = args.account_hash;
  if (args.account_id) {
    const r = await client.getAccountNumbers();
    if (r.status !== 200) {
      console.error('Failed to fetch account numbers');
      return -1;
    }
    const accounts = await r.json();
    for (const val of accounts) {
      if (val.accountNumber === String(args.account_id)) {
        account_hash = val.hashValue;
        break;
      }
    }
    if (!account_hash) {
      console.error(`Failed to find account hash for account ID ${args.account_id}. Searched the following accounts:\n${JSON.stringify(accounts, null, 4)}`);
      return -1;
    }
  }

  async function getOrders(method: () => Promise<Response>): Promise<any[] | null> {
    const r = await method();
    if (r.status !== 200) {
      console.error(`Returned HTTP status code ${r.status}. This is most often caused by an invalid account ID or hash.`);
      return null;
    }
    return await r.json();
  }

  let orders: any[] | null = null;
  if (account_hash) {
    orders = await getOrders(() => client.getOrdersForAccount(account_hash));
    if (!orders) return -1;
    if ('error' in orders) {
      console.error(`Schwab returned error: "${orders['error']}". This is most often caused by an invalid account ID or hash.`);
      return -1;
    }
  } else {
    orders = await getOrders(() => client.getOrdersForAllLinkedAccounts());
    if (!orders) return -1;
    if ('error' in orders) {
      console.error(`Schwab returned error: "${orders['error']}"`);
      return -1;
    }
  }

  if (orders && orders.length > 0) {
    const order = orders.sort((a, b) => b.orderId - a.orderId)[0];
    let emitDestinationWarningNewline = false;
    if (order.requestedDestination && order.requestedDestination !== 'AUTO') {
      console.warn(`# Warning: This order contains a non-"AUTO" value of "requestedDestination" ("${order.requestedDestination}").`);
      console.warn('#          This parameter appears to be broken in the API, so it is omitted in this generated code.');
      emitDestinationWarningNewline = true;
    }
    if (order.destinationLinkName && order.destinationLinkName !== 'AutoRoute') {
      console.warn(`# Warning: This order contains a non-"AutoRoute" value of "destinationLinkName" ("${order.destinationLinkName}").`);
      console.warn('           This parameter appears to be broken in the API, so it is omitted in this generated code.');
      emitDestinationWarningNewline = true;
    }
    if (emitDestinationWarningNewline) {
      console.warn('');
    }
    console.log('# Order ID', order.orderId);
    console.log(codeForBuilder(constructRepeatOrder(order)));
  } else {
    console.log('No recent orders found');
  }
  return 0;
} 