from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
import time
import re


def find_prereq_type(text):
    req_pattern = r'(\ball of\b|\b\d+ of\b)'
    req_type = re.findall(req_pattern, text)
    return req_type[0] if req_type else None


def find_course_codes(text):
    pattern = r'([A-Z]{1,6}\d{3}[A-Z]?)'
    req_pattern = r'(\ball of\b|\b\d+ of\b|\bNot completed nor concurrently enrolled in\b|\bCompleted or concurrently enrolled in\b)'
    minimum_req_pattern = r'(\b\d+%)'

    course_codes = re.findall(pattern, text)
    req_type = re.findall(req_pattern, text)
    minimum_req = re.findall(minimum_req_pattern, text)

    basic_req = text if not course_codes else {"all of": course_codes} if len(course_codes) == 1 and not req_type else {req_type[0]: course_codes}
    return basic_req if not minimum_req else {minimum_req[0]: basic_req}


def print_ruleview(ruleview_element, indent=0):
    return find_course_codes(ruleview_element.text.strip())


def print_li_hierarchy(li_element, indent=0):
    try:
        if li_element.get_attribute('data-test') and li_element.get_attribute('data-test').startswith('ruleView-') and '-result' not in li_element.get_attribute('data-test'):
            return print_ruleview(li_element, indent)
        else:
            prereq_rule = find_prereq_type(li_element.find_element(By.TAG_NAME, "span").text.strip())
            prereq_dict = {prereq_rule: []}

            # Check if there is a nested ul within the current li element
            outermost_uls = li_element.find_elements(By.XPATH, "./ul")
            if len(outermost_uls) != 0:
                for outermost_ul in outermost_uls:
                    nested_lis = outermost_ul.find_elements(By.XPATH, './li | ./div/li')
                    for nested_li in nested_lis:
                        if nested_li.get_attribute('data-test') and nested_li.get_attribute('data-test').startswith('ruleView-') and '-result' not in nested_li.get_attribute('data-test'):
                            prereq_dict[prereq_rule].append(print_ruleview(nested_li, indent + 1))
                        else:
                            prereq_dict[prereq_rule].append(print_li_hierarchy(nested_li, indent + 1))
            return prereq_dict
    except Exception as e:
        print(str(e))


# Set up the Chrome WebDriver
def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--enable-javascript")
    # options.add_argument('--headless')  # Uncomment to run headless if you don't need a GUI
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver


def check_and_print_li_hierarchy(driver, url):
    driver.get(url)

    # Use WebDriverWait to wait for elements to appear
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "noBreak"))
        )
    except TimeoutException:
        print("noBreak elements not found after 10 seconds, reloading...")
        driver.quit()
        return False  # Indicates the need to retry

    # If noBreak elements are found, process them
    divs = driver.find_elements(By.CLASS_NAME, "noBreak")
    all_course_reqs = {"corequisites": [], "prerequisites": [], "antirequisites": []}
    for div in divs:
        ul_elements = div.find_elements(By.XPATH, ".//ul[not(ancestor::ul)]")
        cur_section = div.find_element(By.TAG_NAME, "h3").text.strip().lower()
        for ul in ul_elements:
            li_elements = ul.find_elements(By.XPATH, "./li")
            for li in li_elements:
                all_course_reqs[cur_section].append(print_li_hierarchy(li))

    driver.quit()
    print(all_course_reqs)
    return True  # Indicates successful completion


def main():
    url = "https://uwaterloo.ca/academic-calendar/undergraduate-studies/catalog#/courses/HJW6aOVXY2?bc=true&bcCurrent=CS330%20-%20Management%20Information%20Systems&bcGroup=Computer%20Science%20(CS)&bcItemType=courses"
    max_attempts = 5
    attempts = 0

    while attempts < max_attempts:
        driver = setup_driver()
        success = check_and_print_li_hierarchy(driver, url)
        if success:
            print("Successfully processed the page.")
            break  # Exit loop if processing was successful
        attempts += 1
        if attempts < max_attempts:
            print("Retrying... Attempt", attempts + 1)
        time.sleep(10)  # Wait before retrying if necessary

    if attempts == max_attempts:
        print("Failed to process after maximum attempts.")


if __name__ == '__main__':
    main()