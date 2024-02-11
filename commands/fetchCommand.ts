import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

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
            // Assuming the API returns JSON data you want to relay back to the user
            await interaction.reply(`Schedule information: ${JSON.stringify(response.data)}`);
        } catch (error) {
            console.error('Error fetching schedule information:', error);
            await interaction.reply('Failed to fetch schedule information.');
        }
    },
};