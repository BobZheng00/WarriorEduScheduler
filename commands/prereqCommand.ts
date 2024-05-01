import {SlashCommandBuilder} from 'discord.js';
import { scrapeCourse } from '../utils/coursePageScrapper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prereq')
        .setDescription('View prerequisites of a course available on UWFlow')
        .addStringOption(option =>
            option.setName('course_code')
                .setDescription('The course code (e.g., MATH 135) of the course to look up')
                .setRequired(true)),
    async execute(interaction: any) {
        await interaction.deferReply();

        const courseCode = interaction.options.getString('course_code').toLowerCase().replace(/\s+/g, '');
        const prereq = await scrapeCourse(courseCode);

        await interaction.editReply(`Prerequisites found for ${courseCode}: ${prereq.substring(0, 1980)}`);
    },
};
