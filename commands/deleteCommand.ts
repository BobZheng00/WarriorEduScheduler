import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a specified events in your calendar.')
        .addStringOption(option =>
            option.setName('event_name')
                .setDescription('Your event name')
                .setRequired(true))
        .addStringOption(option => {
            option.setName('begin_hr')
                .setDescription('Your event start hr')
                .setRequired(true)

            for (let i = 0; i < 24; i++) {
                const hour = i.toString();
                option.addChoices({ name: hour, value: hour });
            }
            return option;
        })
        .addStringOption(option =>
            option.setName('begin_min')
                .setDescription('Your event start minute')
                .setRequired(true)
                .addChoices(
                    { name: '00', value: '00' },
                    { name: '30', value: '30' },))
        .addStringOption(option => {
            option.setName('end_hr')
                .setDescription('Your event end hr')
                .setRequired(true)

            for (let i = 0; i < 24; i++) {
                const hour = i.toString();
                option.addChoices({ name: hour, value: hour });
            }

            return option;
        })
        .addStringOption(option =>
            option.setName('end_min')
                .setDescription('Your event end minute')
                .setRequired(true)
                .addChoices(
                    { name: '00', value: '00' },
                    { name: '30', value: '30' },))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The date (YYYY-MM-DD) of the event')
                .setRequired(true)),

    async execute(interaction: any) {
        const eventName = interaction.options.getString('event_name');
        const beginHr = interaction.options.getString('begin_hr');
        const beginMin = interaction.options.getString('begin_min');
        const endHr = interaction.options.getString('end_hr');
        const endMin = interaction.options.getString('end_min');
        const date = interaction.options.getString('date');

        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        const url = `https://web-calendar.fly.dev/api/userdata/${interaction.user.id}`;
        const dev_url = `http://127.0.0.1:8000/api/userdata/${interaction.user.id}`;

        if (!dateFormat.test(date)) {
            await interaction.reply({ content: 'Please provide dates in YYYY-MM-DD format.', ephemeral: true });
            return;
        }

        try {
            const response = await axios.get(dev_url, {
                headers: { 'Authorization': `Token ${process.env.API_TOKEN_DEV}` },
                params: {
                    delete: true,
                    event_name: eventName,
                    begin_hr: beginHr,
                    begin_min: beginMin,
                    end_hr: endHr,
                    end_min: endMin,
                    date: date,
                }
            });
            if (response.data.status === "success") {
                await interaction.reply("Successfully deleted the event.");
            } else if (response.data.status === "error") {
                await interaction.reply({ content: response.data.message, ephemeral: true });
            }
        } catch (error: any) {
            console.error('Error when deleting custom event', error.response.data.message);
            await interaction.reply(error.response.data.message);
        }
    },
};