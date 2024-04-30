import {SlashCommandBuilder} from 'discord.js';
import cheerio from 'cheerio';

import puppeteer from 'puppeteer';

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

async function scrapeCourse(courseCode: String) : Promise<String> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const formattedCourseCode = courseCode.toLowerCase().replace(/\s+/g, '');
    const url = `https://uwflow.com/course/${formattedCourseCode}`;

    await page.goto(url, {
        waitUntil: 'networkidle0',
    });

    const content = await page.evaluate(() => {
        const element = document.querySelector('.sc-ptdsS.hxDuVK');
        return element ? element.innerHTML : 'Content not found';
    });

    await browser.close();

    return extractTextFromHTML(content);
}

function extractTextFromHTML(html: string) {
    const $ = cheerio.load(html);

    let text = '';
    $('a').each((index, element) => {
        const anchorText = $(element).text();
        $(element).replaceWith(`**${anchorText}**`);
    });

    const textContent = $('body').text();
    return textContent.replace(/\s+/g, ' ').trim();
}