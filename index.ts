import { Client, Message, GatewayIntentBits } from 'discord.js';
import axios from 'axios';
import { registerCommands } from './utils/registerCommands';

import * as fs from "fs";

require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (typeof clientId === 'undefined' || typeof guildId === 'undefined') {
    throw new Error('GUILD_ID or CLIENT_ID is not defined in your environment.');
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    await registerCommands(clientId, guild.id);
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    const guilds = Array.from(client.guilds.cache.values());
    for (const guild of guilds) {
        console.log(`Updating commands for guild: ${guild.name}`);
        try {
            await registerCommands(clientId, guild.id);
        } catch (error) {
            console.error(`Failed to update commands for guild: ${guild.name}`, error);
        }
    }
});

client.on('guildCreate', async (guild) => {
    console.log(`Joined new guild: ${guild.name}`);
    await registerCommands(clientId, guild.id);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case 'ping': {
            const command = require(`./commands/testCommand.ts`);
            await command.execute(interaction);
            break;
        }
        case 'fetch': {
            const command = require(`./commands/fetchCommand.ts`);
            await command.execute(interaction);
            break;
        }
        case 'create': {
            const command = require(`./commands/createCommand.ts`);
            await command.execute(interaction);
            break;
        }
        case 'delete': {
            const command = require(`./commands/deleteCommand.ts`);
            await command.execute(interaction);
            break;
        }
        case 'prereq': {
            const command = require(`./commands/prereqCommand.ts`);
            await command.execute(interaction);
            break;
        }
        default: {
            interaction.reply('Unknown command');
            break;
        }
    }
});

client.on('messageCreate', async (message: Message) => {
    if (message.content === '!Hello') {
        try {
            // const response = await axios.get('https://example.com');
            // const html = response.data;
            // const $ = cheerio.load(html);
            // const data = $('selector').text();
            const data = message.author.id;
            message.channel.send(data);
        } catch (error) {
            console.error(error);
            message.channel.send('Failed to fetch data.');
        }
    }

    if (message.content === '!fetchdata') {
        const discordId = message.author.id;
        const url = `https://web-calendar.fly.dev/api/userdata/${discordId}`;
        const dev_url = `http://127.0.0.1:8000/api/userdata/${discordId}`;
        axios.get(dev_url, {
            headers: { 'Authorization': `Token ${process.env.API_TOKEN_DEV}` }
        })
            .then(response => {
                console.log(response.data);
                message.reply(`Data: ${JSON.stringify(response.data)}`);
            })
            .catch(error => {
                console.error(error);
                message.reply('Failed to fetch data.');
            });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);