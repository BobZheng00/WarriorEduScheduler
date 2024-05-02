require('dotenv').config();

async function fetchCourseData(termCode: string, subjectCode: string, courseCode: string) {
    const url = `https://openapi.data.uwaterloo.ca/v3/Courses/${termCode}/${subjectCode}/${courseCode}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'x-api-key': (!process.env.OPEN_API_KEY)? '': process.env.OPEN_API_KEY,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        console.error('Failed to fetch course data');
        return {};
    }

    const data = await response.json();
    return data[0];
}

export async function parseCourseRequirements(termCode: string, subjectCode: string, courseCode: string) {
    let prereq = "Invalid course", coreq = "Invalid course", antireq = "Invalid course";
    const courseData = await fetchCourseData(termCode, subjectCode, courseCode);
    if (!courseData) {
        return { prereq, coreq, antireq };
    }

    const requirements = courseData["requirementsDescription"];

    function boldCourseCodes(text: string) {
        const regex = /\b([A-Z]{2,5}\s*\d{3,4}[A-Z]?|\b\d{3,4}[A-Z]?\b)/g;

        return text.replace(regex, '**$&**');
    }

    if (requirements) {
        const prereqMatch = requirements.match(/Prereq: (.*?)(?=(\.|Coreq|Antireq|$))/i);
        if (prereqMatch) {
            prereq = prereqMatch[1].trim();
            prereq = boldCourseCodes(prereq);
        } else {
            prereq = "None";
        }

        const coreqMatch = requirements.match(/Coreq: (.*?)(?=(\.|Prereq|Antireq|$))/i);
        if (coreqMatch) {
            coreq = coreqMatch[1].trim();
            coreq = boldCourseCodes(coreq);
        } else {
            coreq = "None";
        }

        const antireqMatch = requirements.match(/Antireq: (.*?)(?=(\.|Prereq|Coreq|$))/i);
        if (antireqMatch) {
            antireq = antireqMatch[1].trim();
            antireq = boldCourseCodes(antireq);
        } else {
            antireq = "None";
        }
    }

    return { prereq, coreq, antireq };
}
