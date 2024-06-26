import { SlashCommandBuilder } from 'discord.js';
import { parseCourseRequirements } from '../utils/OpenAPIQuerying';
import { scrapeCourseCode } from '../utils/coursePageScrapper';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('courserequirements')
        .setDescription('View requirements of a course available this term')
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

        const courseRequirements = await parseCourseRequirements("1245", subjectCode, courseNumber);

        if (!courseRequirements.prereq) {
            await interaction.editReply('No corresponding information found. Please provide a valid course code.');
            return;
        }

        await interaction.editReply(`Course requirements found for ${courseCode.toUpperCase()}: ${courseRequirements.prereq.substring(0, 1980)}`);
    },
};
