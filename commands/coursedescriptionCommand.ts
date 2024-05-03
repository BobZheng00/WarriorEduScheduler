import { SlashCommandBuilder } from 'discord.js';
import { parseCourseDescription } from '../utils/OpenAPIQuerying';
import { scrapeCourseCode } from "../utils/coursePageScrapper";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coursedescription')
        .setDescription('View course description of a course available this term')
        .addStringOption(option =>
            option.setName('course_code')
                .setDescription('The course code (e.g., MATH 135) of the course to look up')
                .setRequired(true)),
    async execute(interaction: any) {
        await interaction.deferReply();

        const courseCode = interaction.options.getString('course_code').toLowerCase().replace(/\s+/g, '');
        const { subjectCode, courseNumber} = scrapeCourseCode(courseCode);

        if (!subjectCode || !courseNumber) {
            await interaction.editReply('Invalid course code format. Please provide a valid course code (e.g., MATH 135).');
            return;
        }

        const courseDescription = await parseCourseDescription("1245", subjectCode, courseNumber);

        await interaction.editReply(`Description found for ${courseCode.toUpperCase()}: ${courseDescription.description.substring(0, 1980)}`);
    },
};