const axios = require('axios');

async function fetchPriceData(symbol1, symbol2) {
    const currentDate = new Date();
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 1);

    try {
        const response1 = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol1.toUpperCase()}USDT&interval=5m&startTime=${startDate.getTime()}&endTime=${endDate.getTime()}`);
        const response2 = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol2.toUpperCase()}USDT&interval=5m&startTime=${startDate.getTime()}&endTime=${endDate.getTime()}`);
        
        const prices1 = response1.data.map(data => parseFloat(data[4]));
        const prices2 = response2.data.map(data => parseFloat(data[4]));

        const priceChanges1 = calculatePriceChanges(prices1);
        const priceChanges2 = calculatePriceChanges(prices2);

        return { priceChanges1, priceChanges2 };
    } catch (error) {
        throw new Error(`Error fetching price data: ${error.message}`);
    }
}

function calculatePriceChanges(prices) {
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
        priceChanges.push(prices[i] - prices[i - 1]);
    }
    return priceChanges;
}

function calculateCorrelation(priceChanges1, priceChanges2) {
    if (priceChanges1.length !== priceChanges2.length) {
        throw new Error('Arrays must be of equal length');
    }

    const n = priceChanges1.length;
    let sumXY = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXSquare = 0;
    let sumYSquare = 0;

    for (let i = 0; i < n; i++) {
        sumXY += priceChanges1[i] * priceChanges2[i];
        sumX += priceChanges1[i];
        sumY += priceChanges2[i];
        sumXSquare += Math.pow(priceChanges1[i], 2);
        sumYSquare += Math.pow(priceChanges2[i], 2);
    }

    const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXSquare - Math.pow(sumX, 2)) * (n * sumYSquare - Math.pow(sumY, 2)));
    return correlation;
}

async function analyzeCryptocurrencyPair(symbol1, symbol2) {
    try {
        const { priceChanges1, priceChanges2 } = await fetchPriceData(symbol1, symbol2);
        const correlation = calculateCorrelation(priceChanges1, priceChanges2);
        return `${symbol1.toUpperCase()}/${symbol2.toUpperCase()}: ${correlation.toFixed(5)}`;
    } catch (error) {
        console.error(`Error analyzing ${symbol1.toUpperCase()}/${symbol2.toUpperCase()}: ${error.message}`);
        return `${symbol1.toUpperCase()}/${symbol2.toUpperCase()}: Error`;
    }
}

async function analyzeCryptocurrenciesScript(cryptocurrencies) {
    const results = await Promise.all(cryptocurrencies.map(crypto => analyzeCryptocurrencyPair('BTC', crypto)));
    
    
    results.sort((a, b) => {
        const correlationA = parseFloat(a.split(': ')[1]);
        const correlationB = parseFloat(b.split(': ')[1]);
        return correlationB - correlationA;
    });

    return results;
}

module.exports = {
    analyzeCryptocurrenciesScript
};
