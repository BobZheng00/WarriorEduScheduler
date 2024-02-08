import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import path from 'path';

require('dotenv').config();

const commands: any[] = [];
const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

if (typeof process.env.DISCORD_BOT_TOKEN === 'undefined') {
    throw new Error('DISCORD_BOT_TOKEN is not defined in your environment.');
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_BOT_TOKEN);

export async function registerCommands(clientId: string, guildId: string) {
    for (const file of commandFiles) {
        const command = await import(`../commands/${file}`);
        commands.push(command.data.toJSON());
    }

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}