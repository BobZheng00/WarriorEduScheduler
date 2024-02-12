import { SlashCommandBuilder } from 'discord.js';
import axios from 'axios';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create new events in your calendar.')
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
            option.setName('start_date')
                .setDescription('The start date (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('end_date')
                .setDescription('The end date (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('repeat_pattern')
                .setDescription('Repeat once, daily, weekly, or monthly')
                .setRequired(true)
                .addChoices(
                    { name: 'once', value: 'once' },
                    { name: 'daily', value: 'daily' },
                    { name: 'weekly', value: 'weekly' },
                    { name: 'monthly', value: 'monthly' },
                ))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Your event description')
                .setRequired(false)
                .setMaxLength(2000)
        )
        .addBooleanOption(option =>
            option.setName('is_pinned')
                .setDescription('Whether or not the event will be pinned')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('is_private')
                .setDescription('Whether or not the event will be private')
                .setRequired(false)
        ),

    async execute(interaction: any) {
        const eventName = interaction.options.getString('event_name');
        const beginHr = interaction.options.getString('begin_hr');
        const beginMin = interaction.options.getString('begin_min');
        const endHr = interaction.options.getString('end_hr');
        const endMin = interaction.options.getString('end_min');
        const startDate = interaction.options.getString('start_date');
        const endDate = interaction.options.getString('end_date');
        const description = interaction.options.getString('description') ?? '';
        const isPinned = interaction.options.getBoolean('is_pinned') ?? false;
        const isPrivate = interaction.options.getBoolean('is_private') ?? false;
        const repeatPattern = interaction.options.getString('repeat_pattern');

        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

        const url = `https://web-calendar.fly.dev/api/userdata/${interaction.user.id}`;
        const dev_url = `http://127.0.0.1:8000/api/userdata/${interaction.user.id}`;

        if (!dateFormat.test(startDate) || !dateFormat.test(endDate)) {
            await interaction.reply({ content: 'Please provide dates in YYYY-MM-DD format.', ephemeral: true });
            return;
        }

        try {
            const response = await axios.get(dev_url, {
                headers: { 'Authorization': `Token ${process.env.API_TOKEN_DEV}` },
                params: {
                    create: true,
                    event_name: eventName,
                    begin_hr: beginHr,
                    begin_min: beginMin,
                    end_hr: endHr,
                    end_min: endMin,
                    start_date: startDate,
                    end_date: endDate,
                    description: description,
                    is_pinned: isPinned,
                    is_private: isPrivate,
                    repeat_pattern: repeatPattern
                }
            });
            if (response.data.status === "success") {
                await interaction.reply("Successfully created events.");
            } else if (response.data.status === "error") {
                await interaction.reply({ content: response.data.message, ephemeral: true });
            }
        } catch (error: any) {
            console.error('Error when creating custom event', error.response.data.message);
            await interaction.reply(error.response.data.message);
        }
    },
};