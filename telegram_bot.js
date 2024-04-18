const { analyzeCryptocurrenciesScript } = require('./analysis_script');

const TelegramBot = require('node-telegram-bot-api');
const botToken = 'your bot token';
const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Cryptocurrency Correlation Analyzer Bot! Send me a list of cryptocurrencies separated by commas to analyze.');
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const message = msg.text;
    const cryptocurrencies = message.split(',').map(crypto => crypto.trim());

    bot.sendMessage(chatId, 'Analyzing...');

    try {
        const results = await analyzeCryptocurrenciesScript(cryptocurrencies);
        sendResults(chatId, results);
        bot.sendMessage(chatId, 'Done.');
    } catch (error) {
        console.error('Error analyzing cryptocurrencies:', error);
        bot.sendMessage(chatId, 'An error occurred during analysis.');
    }
});

function sendResults(chatId, results) {
    const message = results.join('\n');
    bot.sendMessage(chatId, message);
}
