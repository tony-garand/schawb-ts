import { SchwabClient } from '../src';

// Example usage of the Market Data API
async function marketDataExample() {
  // Initialize the client
  const client = new SchwabClient({
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'your-redirect-uri',
    environment: 'sandbox' // or 'production'
  });

  // Set tokens (you would get these from OAuth flow)
  client.setTokens({
    access_token: 'your-access-token',
    refresh_token: 'your-refresh-token',
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'your-scope'
  });

  try {
    // Example 1: Get quotes for multiple symbols
    console.log('Getting quotes for multiple symbols...');
    const quotes = await client.getMarketDataQuotes({
      symbols: 'AAPL,MSFT,GOOGL,TSLA',
      fields: 'quote,reference,fundamental',
      indicative: false
    });
    
    console.log('Quotes response:', JSON.stringify(quotes, null, 2));

    // Example 2: Get quote for a single symbol
    console.log('\nGetting quote for single symbol...');
    const singleQuote = await client.getMarketDataQuoteBySymbol('AAPL', 'quote,reference');
    console.log('Single quote response:', JSON.stringify(singleQuote, null, 2));

    // Example 3: Get quotes using convenience method
    console.log('\nGetting quotes using convenience method...');
    const convenienceQuotes = await client.getMarketDataQuotesForSymbols(
      ['AAPL', 'MSFT', 'GOOGL'],
      {
        fields: 'quote,reference',
        indicative: true
      }
    );
    console.log('Convenience quotes response:', JSON.stringify(convenienceQuotes, null, 2));

    // Example 4: Access market data API directly
    console.log('\nAccessing market data API directly...');
    const directQuotes = await client.marketData.getQuotes({
      symbols: 'SPY,QQQ,IWM',
      fields: 'quote'
    });
    console.log('Direct API quotes response:', JSON.stringify(directQuotes, null, 2));

    // Example 5: Get quotes for different asset types
    console.log('\nGetting quotes for different asset types...');
    const mixedQuotes = await client.getMarketDataQuotes({
      symbols: 'AAPL,SPY,TSLA 240315C00250000,EUR/USD',
      fields: 'quote,reference'
    });
    console.log('Mixed asset types quotes response:', JSON.stringify(mixedQuotes, null, 2));

    // Example 6: Get option chains for a symbol
    console.log('\nGetting option chains for AAPL...');
    const optionChains = await client.getOptionChains({
      symbol: 'AAPL',
      contractType: 'ALL',
      strikeCount: 5,
      includeUnderlyingQuote: true,
      strategy: 'SINGLE',
    });
    console.log('Option Chains response:', JSON.stringify(optionChains, null, 2));

    // Example 7: Get option expiration chain for a symbol
    console.log('\nGetting option expiration chain for AAPL...');
    const expirationChain = await client.getOptionExpirationChain('AAPL');
    console.log('Option Expiration Chain response:', JSON.stringify(expirationChain, null, 2));

    // Example 8: Get price history for a symbol
    console.log('\nGetting price history for AAPL...');
    const priceHistory = await client.getPriceHistory({
      symbol: 'AAPL',
      periodType: 'day',
      period: 5,
      frequencyType: 'minute',
      frequency: 5,
      needExtendedHoursData: false,
      needPreviousClose: true,
    });
    console.log('Price History response:', JSON.stringify(priceHistory, null, 2));

    // Example 9: Get price history using convenience method
    console.log('\nGetting price history using convenience method...');
    const conveniencePriceHistory = await client.getPriceHistoryForSymbol(
      'AAPL',
      'month',
      1,
      {
        frequencyType: 'daily',
        needPreviousClose: true,
      }
    );
    console.log('Convenience Price History response:', JSON.stringify(conveniencePriceHistory, null, 2));

    // Example 10: Get movers for Dow Jones Industrial Average
    console.log('\nGetting movers for Dow Jones...');
    const movers = await client.getMovers({
      symbolId: '$DJI',
      sort: 'VOLUME',
      frequency: 5,
    });
    console.log('Movers response:', JSON.stringify(movers, null, 2));

    // Example 11: Get movers using convenience method
    console.log('\nGetting movers for S&P 500 using convenience method...');
    const spxMovers = await client.getMoversForIndex('$SPX', {
      sort: 'PERCENT_CHANGE_UP',
      frequency: 10,
    });
    console.log('S&P 500 Movers response:', JSON.stringify(spxMovers, null, 2));

    // Market Hours Examples
    console.log('\n=== Market Hours Examples ===');

    // Get market hours for multiple markets
    try {
      const marketHours = await client.getMarketDataHours({
        markets: ['equity', 'option'],
        date: '2024-01-15'
      });
      console.log('Market hours for equity and option markets:', JSON.stringify(marketHours, null, 2));
    } catch (error) {
      console.error('Error getting market hours:', error);
    }

    // Get market hours for a single market
    try {
      const equityMarketHours = await client.getMarketDataHoursForMarket('equity', '2024-01-15');
      console.log('Equity market hours:', JSON.stringify(equityMarketHours, null, 2));
    } catch (error) {
      console.error('Error getting equity market hours:', error);
    }

    // Get market hours with convenience method
    try {
      const allMarketHours = await client.getMarketDataHoursForMarkets(
        ['equity', 'option', 'bond', 'future', 'forex'],
        '2024-01-15'
      );
      console.log('All market hours:', JSON.stringify(allMarketHours, null, 2));
    } catch (error) {
      console.error('Error getting all market hours:', error);
    }

    // Get current day market hours (no date specified)
    try {
      const currentMarketHours = await client.getMarketDataHours({
        markets: ['equity', 'option']
      });
      console.log('Current day market hours:', JSON.stringify(currentMarketHours, null, 2));
    } catch (error) {
      console.error('Error getting current market hours:', error);
    }

    // Instruments Examples
    console.log('\n=== Instruments Examples ===');

    // Get instruments by symbols and projections
    try {
      const instruments = await client.getInstruments({
        symbol: 'AAPL,BAC',
        projection: 'symbol-search'
      });
      console.log('Instruments for AAPL and BAC:', JSON.stringify(instruments, null, 2));
    } catch (error) {
      console.error('Error getting instruments:', error);
    }

    // Get instrument by specific CUSIP
    try {
      const instrument = await client.getInstrumentByCusip('037833100'); // AAPL CUSIP
      console.log('Instrument by CUSIP:', JSON.stringify(instrument, null, 2));
    } catch (error) {
      console.error('Error getting instrument by CUSIP:', error);
    }

    // Search instruments with convenience method
    try {
      const searchResults = await client.searchMarketDataInstruments('AAPL', 'symbol-search');
      console.log('Search results for AAPL:', JSON.stringify(searchResults, null, 2));
    } catch (error) {
      console.error('Error searching instruments:', error);
    }

    // Get fundamental instruments
    try {
      const fundamentalInstruments = await client.getFundamentalInstruments('AAPL');
      console.log('Fundamental instruments for AAPL:', JSON.stringify(fundamentalInstruments, null, 2));
    } catch (error) {
      console.error('Error getting fundamental instruments:', error);
    }

    // Search with different projections
    try {
      const descSearch = await client.getInstruments({
        symbol: 'Apple',
        projection: 'desc-search'
      });
      console.log('Description search for Apple:', JSON.stringify(descSearch, null, 2));
    } catch (error) {
      console.error('Error with description search:', error);
    }

    // Search with regex projection
    try {
      const regexSearch = await client.getInstruments({
        symbol: 'AAPL.*',
        projection: 'symbol-regex'
      });
      console.log('Regex search for AAPL.*:', JSON.stringify(regexSearch, null, 2));
    } catch (error) {
      console.error('Error with regex search:', error);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Example of processing quote data
function processQuoteData(quotes: any) {
  console.log('\nProcessing quote data...');
  
  for (const [symbol, quoteData] of Object.entries(quotes)) {
    const data = quoteData as any;
    console.log(`\nSymbol: ${symbol}`);
    console.log(`Asset Type: ${data.assetMainType}`);
    console.log(`Description: ${data.reference.description}`);
    console.log(`Exchange: ${data.reference.exchangeName}`);
    
    if (data.quote) {
      const quote = data.quote;
      console.log(`Last Price: $${quote.lastPrice || 'N/A'}`);
      console.log(`Bid: $${quote.bidPrice || 'N/A'} (${quote.bidSize || 0})`);
      console.log(`Ask: $${quote.askPrice || 'N/A'} (${quote.askSize || 0})`);
      console.log(`Change: ${quote.netChange || 0} (${quote.netPercentChange || 0}%)`);
      console.log(`Volume: ${quote.totalVolume || 0}`);
    }
    
    if (data.fundamental) {
      const fundamental = data.fundamental;
      console.log(`P/E Ratio: ${fundamental.peRatio || 'N/A'}`);
      console.log(`Dividend Yield: ${fundamental.divYield || 0}%`);
    }
  }
}

// Example of filtering quotes by asset type
function filterQuotesByAssetType(quotes: any, assetType: string) {
  const filtered: any = {};
  
  for (const [symbol, quoteData] of Object.entries(quotes)) {
    const data = quoteData as any;
    if (data.assetMainType === assetType) {
      filtered[symbol] = data;
    }
  }
  
  return filtered;
}

// Run the example
if (require.main === module) {
  marketDataExample().catch(console.error);
}

export { marketDataExample, processQuoteData, filterQuotesByAssetType }; 