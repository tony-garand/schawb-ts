import { StreamClient, clientFromTokenFile } from 'schwab-ts';

const API_KEY = "XXXXXX";
const CLIENT_SECRET = "XXXXXX";
const CALLBACK_URL = "https://xxxxxx";

interface AccountInfo {
    accountNumber: string;
    hashValue: string;
}

class MyStreamConsumer {
    private apiKey: string;
    private clientSecret: string;
    private accountId: string | null = null;
    private accountHash: string | null = null;
    private callbackUrl: string;
    private tokenPath: string;

    private schwabClient: any = null;
    private streamClient: StreamClient | null = null;

    private symbols: string[] = [
        'GOOG', 'GOOGL', 'BP', 'CVS', 'ADBE', 'CRM', 'SNAP', 'AMZN',
        'BABA', 'DIS', 'TWTR', 'M', 'USO', 'AAPL', 'NFLX', 'GE', 'TSLA',
        'F', 'SPY', 'FDX', 'UBER', 'ROKU', 'X', 'FB', 'BIDU', 'FIT'
    ];

    // Default fields for level one equity data
    private fields: string[] = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'
    ];

    constructor(
        apiKey: string, 
        clientSecret: string, 
        callbackUrl: string, 
        tokenPath: string = './token.json'
    ) {
        this.apiKey = apiKey;
        this.clientSecret = clientSecret;
        this.callbackUrl = callbackUrl;
        this.tokenPath = tokenPath;
    }

    async initialize(): Promise<void> {
        /**
         * Create the clients and log in. Token should be previously generated using clientFromManualFlow()
         * 
         * TODO: update to easyClient() when clientFromLoginFlow() works, 
         * or when easyClient() can redirect to clientFromManualFlow()
         */
        this.schwabClient = await clientFromTokenFile(
            this.tokenPath, 
            this.apiKey,
            this.clientSecret
        );

        const accountInfo = await this.schwabClient.get_account_numbers();
        const accountData: AccountInfo[] = await accountInfo.json();

        this.accountId = accountData[0].accountNumber;
        this.accountHash = accountData[0].hashValue;

        this.streamClient = new StreamClient(this.schwabClient, { 
            accountId: this.accountId 
        });

        // The streaming client wants you to add a handler for every service type
        this.streamClient.level_one_equity_handler(this.handleLevelOneEquity.bind(this));

        // Set up event listeners for the stream client
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        if (!this.streamClient) return;

        // Handle errors
        this.streamClient.on('error', (error: Error) => {
            console.error('Stream error:', error);
        });

        // Handle unhandled messages
        this.streamClient.on('unhandled_message', (message: any) => {
            console.log('Unhandled message:', message);
        });

        // Handle heartbeat messages
        this.streamClient.on('heartbeat', (heartbeat: any) => {
            console.log('Heartbeat received:', heartbeat);
        });
    }

    async stream(): Promise<void> {
        if (!this.streamClient) {
            throw new Error('Stream client not initialized. Call initialize() first.');
        }

        await this.streamClient.login(); // Log into the streaming service

        // TODO: QOS is currently not working as the command formatting has changed. Update & re-enable after docs are released
        // await this.streamClient.quality_of_service(StreamClient.QOSLevel.EXPRESS);

        await this.streamClient.level_one_equity_subs(this.symbols, this.fields);

        // Keep the process alive - the streaming happens via WebSocket events
        console.log('Streaming started. Press Ctrl+C to stop.');
        
        // Keep the process running
        process.on('SIGINT', () => {
            console.log('Shutting down...');
            process.exit(0);
        });
    }

    private handleLevelOneEquity(msg: any): void {
        /**
         * This is where we process messages from the streaming client.
         * In the TypeScript version, we process messages directly as they arrive
         * rather than queuing them, which is more efficient for Node.js.
         */
        console.log(JSON.stringify(msg, null, 2));
    }
}

async function main(): Promise<void> {
    /**
     * Create and instantiate the consumer, and start the stream
     */
    const consumer = new MyStreamConsumer(
        API_KEY, 
        CLIENT_SECRET, 
        CALLBACK_URL
    );

    await consumer.initialize();
    await consumer.stream();
}

if (require.main === module) {
    main().catch(console.error);
} 