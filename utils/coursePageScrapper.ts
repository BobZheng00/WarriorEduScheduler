import puppeteer from "puppeteer";
import cheerio from "cheerio";

export async function scrapeCourse(courseCode: String) : Promise<String> {
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

export function extractTextFromHTML(html: string) {
    const $ = cheerio.load(html);

    $('a').each((index, element) => {
        const anchorText = $(element).text();
        $(element).replaceWith(`**${anchorText}**`);
    });

    const textContent = $('body').text();
    return textContent.replace(/\s+/g, ' ').trim();
}

export function scrapeCourseCode(courseCode: string) {
    const courseMatch = courseCode.match(/^([A-Za-z]+)(\d{3,4}[A-Za-z]?)$/);
    if (!courseMatch) {
        return {subjectCode: null, courseNumber: null};
    } else {
        return {subjectCode: courseMatch[1], courseNumber: courseMatch[2]};
    }
}