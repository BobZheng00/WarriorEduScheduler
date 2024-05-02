import { SlashCommandBuilder } from 'discord.js';
import { parseCourseRequirements } from '../utils/OpenAPIQuerying';

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
        const courseMatch = courseCode.match(/^([A-Za-z]+)(\d{3,4}[A-Za-z]?)$/);
        let subjectCode;
        let courseNumber;
        if (!courseMatch) {
            await interaction.editReply('Invalid course code format. Please provide a valid course code (e.g., MATH 135).');
            return;
        } else {
            subjectCode = courseMatch[1];
            courseNumber = courseMatch[2];
        }
        console.log(subjectCode, courseNumber);

        const courseRequirements = await parseCourseRequirements("1245", subjectCode, courseNumber);

        await interaction.editReply(`Prerequisites found for ${courseCode}: ${courseRequirements.prereq.substring(0, 1980)}`);
    },
};
