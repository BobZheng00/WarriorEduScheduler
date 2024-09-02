import requests
from bs4 import BeautifulSoup
import re
from upload_and_finetune import generate_response_with_dict


def parse_course_info(course_name, prereq_text):
    # Regex to handle any subject, course codes, types, and credit
    match = re.match(r'^([A-Z]{2,4})\s(\d+[A-Z]*)\s([A-Z,]+)\s(\d+\.\d+)', course_name)

    if match:
        subject = match.group(1)
        course_code = match.group(2)
        course_type = match.group(3)
        course_credit = match.group(4)

        # Parsing prerequisites
        prereq_match = re.search(r'Prereq: (.+)', prereq_text)
        if prereq_match:
            prerequisites = prereq_match.group(1)
        else:
            prerequisites = ""

        course_dict = {
            "subject": subject,
            "course_code": course_code,
            "course_type": course_type,
            "course_credit": course_credit,
            "prerequisites": prerequisites
        }
        return course_dict
    else:
        return None


url = "https://ucalendar.uwaterloo.ca/2324/COURSE/course-CS.html"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find all center elements (each contains course information)
courses = soup.find_all('center')

# List to store course info
course_info_list = []

# Loop through each course element
for course in courses:
    # Get the course name (inside strong tag within divTableCell)
    course_name = course.find('strong').get_text(strip=True)

    # Initialize prerequisites as None
    prereq_text = ""

    # Iterate over each 'divTableCell colspan-2' to find the prerequisite text
    for div in course.find_all('div', class_='divTableCell colspan-2'):
        em = div.find('em')
        if em and em.get_text(strip=True).startswith("Prereq:"):
            prereq_text = em.get_text(strip=True)
            break

    # Store the course name and prerequisite in the list
    course_info_list.append({
        "course_name": course_name,
        "prerequisites": prereq_text
    })

# Output the extracted course information
for course in course_info_list:
    if parse_course_info(course['course_name'], course['prerequisites'])['course_code'][0] == '3':
        print(f"Course: {course['course_name']}")
        print(f"Prerequisites: {course['prerequisites']}")
        print(parse_course_info(course['course_name'], course['prerequisites']))
        generate_response_with_dict(parse_course_info(course['course_name'], course['prerequisites']))
        print("-" * 40)
