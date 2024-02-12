import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';


function formatTime(start: number, end: number): string {
    return `${~~(start / 100)}:${('0' + start % 100).slice(-2)} - ${~~(end / 100)}:${('0' + end % 100).slice(-2)}`
}
function formatEventData(events: any): string {
    let message = 'Event Information:\n';
    for (const event of events) {
        const trimmedDescription = event.description.length > 200
            ? event.description.substring(0, 200) + '...'
            : event.description;

        const eventString = `Event: ${event.event}\nDate: ${event.date}\nTime: ${formatTime(event.beginning, event.end)}\nDescription: ${trimmedDescription}\n\n`;
        if (message.length + eventString.length > 2000) {
            break;
        }
        message += eventString;
    }
    return message;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetch')
        .setDescription('Fetch schedule information in a given time period.')
        .addStringOption(option =>
            option.setName('start_date')
                .setDescription('The start date (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('end_date')
                .setDescription('The end date (YYYY-MM-DD)')
                .setRequired(true)),
    async execute(interaction: any) {
        const startDate = interaction.options.getString('start_date');
        const endDate = interaction.options.getString('end_date');
        const url = `https://web-calendar.fly.dev/api/userdata/${interaction.user.id}`;
        const dev_url = `http://127.0.0.1:8000/api/userdata/${interaction.user.id}`;

        try {
            const response = await axios.get(dev_url, {
                headers: { 'Authorization': `Token ${process.env.API_TOKEN_DEV}` },
                params: {
                    fetch: true,
                    start_date: startDate,
                    end_date: endDate
                }
            });
            const events = response.data
            await interaction.reply(formatEventData(events));
        } catch (error) {
            console.error('Error fetching schedule information:', error);
            await interaction.reply('Failed to fetch schedule information.');
        }
    },
};