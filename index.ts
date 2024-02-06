import { Client, Message, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', async (message: Message) => {
    if (message.content === '!Hello') {
        try {
            // const response = await axios.get('https://example.com');
            // const html = response.data;
            // const $ = cheerio.load(html);
            // const data = $('selector').text();

            message.channel.send("Hello!");
        } catch (error) {
            console.error(error);
            message.channel.send('Failed to fetch data.');
        }
    }
});

client.login('MTIwNDIxMzUwNTAxMjgwMTY0Ng.G6oLNQ.Pv7HWgfF2CNeM5xbw2k3jTISHOPKIZST-q-J7k');