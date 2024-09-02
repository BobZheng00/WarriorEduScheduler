from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import csv

load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")  # Set your OpenAI API key
client = OpenAI(api_key=api_key)


def upload_dataset():
    # Upload file for fine-tuning
    response = client.files.create(
        file=open("./dataset/data.jsonl", "rb"),
        purpose="fine-tune"
    )

    print(f"File uploaded successfully with ID: {response}")


def fine_tune_model():
    # Fine-tune the model
    response = client.fine_tuning.jobs.create(
        training_file=os.environ.get("FILE_ID"),
        model="gpt-4o-mini-2024-07-18"
    )

    print(f"Fine-tuning job created successfully with ID: {response}")


def check_fine_tuning_status():
    # Check the status of the fine-tuning job
    response = client.fine_tuning.jobs.retrieve(
        os.environ.get("FINETUNE_ID")
    )

    print(f"Fine-tuning job status: {response}")


def generate_response():
    prereq_text = '''CS 245E prerequisites:
        A grade of 85% or higher in one of CS 136 or 146; Honours Mathematics students only.'''

    system_message = {"role": "system",
                      "content": "You are a virtual assistant. Help the user convert course prerequisites into JSON format."}

    user_message = {"role": "user", "content": '''
        Input: Natural language description of a university course's prerequisites.

        Example Input: "ACTSC 445 prerequisites: (AFM 275/AFM 372/ACTSC 391 or (ACTSC 231, ACTSC 371) or ACTSC 372 or BUS 393W),((STAT 330,STAT 333) or STAT 334); ACTSC, Math/FARM, Math Fin students only."

        Objective: Convert the provided course prerequisite information into a structured JSON-like format. The JSON structure should include:

        course_id: the course identifier.
        prerequisites: an array detailing course prerequisites, encapsulating choices and specific requirements.
        restrictions: any additional requirements that do not specify a particular course but may affect eligibility (e.g., departmental requirements, grade thresholds).
        Instructions for the Model:

        Extract the Course ID: Identify and extract the course number from the input description.

        Parse Prerequisites: Analyze the text to determine the structure of the prerequisites, identifying:

        One-of choices: Where multiple course options are available, these should be grouped under a "one_of" key.
        All-of requirements: If multiple courses must all be completed to satisfy a prerequisite, these should be grouped under an "all_of" key.
        Course names: Individual course requirements can be included directly as strings.
        Course names with grade requirements: If a course requires a minimum grade, this should be noted within the course-specific object.
        Allowed Objects in prerequisites: The only objects that can appear in the "prerequisites" array are:

        "one_of" (for a choice between multiple courses)
        "all_of" (for a requirement of multiple courses)
        Course names (e.g., "MATH 237")
        Course names with grade requirements (e.g., {{"course": "STAT 230", "grade": "at least 60%"}}).
        Format in JSON:

        Use the key "course_id" for the course number.
        Use the key "prerequisites" for an array of course prerequisites. Within this array:
        Use "one_of" for elements where multiple course options provide the prerequisite fulfillment.
        Use "all_of" for elements where all specified courses need to be completed to fulfill the prerequisites.
        Include individual course names directly.
        Include course names with grade requirements as objects.
        Use the key "restrictions" for additional non-course-specific requirements, such as department-specific eligibility or minimum grade thresholds.
        Generate JSON Output: Convert the parsed information into a JSON object as per the specifications given.

        Expected Output Format:

        {{
          "course_id": "ACTSC 445",
          "prerequisites": [
            {{
              "one_of": [
                {{"one_of": [
                  "AFM 275",
                  "AFM 372",
                  "ACTSC 391"
                  ]
                }},
                {{
                  "all_of": ["ACTSC 231", "ACTSC 371"]
                }},
                "ACTSC 372",
                "BUS 393W"
              ]
            }},
            {{
              "one_of": [
                {{"all_of": ["STAT 330", "STAT 333"]}},
                "STAT 334"
              ]
            }}
          ],
          "restrictions": [
            {{
              "restricted_to": [
                "ACTSC students",
                "Math/FARM students",
                "Math Fin students"
              ]
            }}
          ]
        }}

        Here is the prerequisite description you need to work with: 
        {prereq_text}

        You only need to output the JSON object
        '''.format(prereq_text=prereq_text)
    }

    completion = client.chat.completions.create(
        model=os.environ.get("FINETUNE_MODEL_ID"),
        messages=[system_message, user_message],
        temperature=0.50
    )

    json_output = completion.choices[0].message.content
    print(json_output)
    print("///////////////////////////////////////")
    print(completion)

    try:
        json_object = json.loads(json_output)
        print(json_object)

        # Prompt user for input
        save_response = input("Do you want to save this pair to the CSV file? (yes/no): ").strip().lower()

        if save_response == 'yes':
            # Append to CSV file
            csv_file_path = 'dataset/course_prereq.csv'
            with open(csv_file_path, 'a', newline='') as csv_file:
                csv_writer = csv.writer(csv_file)
                csv_writer.writerow([prereq_text, json.dumps(json_object)])
            print(f"Data successfully appended to {csv_file_path}.")
        else:
            print("Data was not saved.")

    except Exception as e:
        print(f"Error: {str(e)}")


def generate_response_with_dict(course_dict):
    subject = course_dict["subject"]
    course_code = course_dict["course_code"]
    course_type = course_dict["course_type"]
    course_credit = course_dict["course_credit"]
    prereq_text = course_dict["prerequisites"]

    system_message = {
        "role": "system",
        "content": "You are a virtual assistant. Help the user convert course prerequisites into JSON format."
    }

    user_message = {
        "role": "user",
        "content": f'''
        Input: Natural language description of a university course's prerequisites.

        Example Input: "ACTSC 445 prerequisites: (AFM 275/AFM 372/ACTSC 391 or (ACTSC 231, ACTSC 371) or ACTSC 372 or BUS 393W),((STAT 330,STAT 333) or STAT 334); ACTSC, Math/FARM, Math Fin students only."

        Objective: Convert the provided course prerequisite information into a structured JSON-like format. The JSON structure should include:

        course_id: the course identifier.
        prerequisites: an array detailing course prerequisites, encapsulating choices and specific requirements.
        restrictions: any additional requirements that do not specify a particular course but may affect eligibility (e.g., departmental requirements, grade thresholds).
        Instructions for the Model:

        Extract the Course ID: Identify and extract the course number from the input description.

        Parse Prerequisites: Analyze the text to determine the structure of the prerequisites, identifying:

        One-of choices: Where multiple course options are available, these should be grouped under a "one_of" key.
        All-of requirements: If multiple courses must all be completed to satisfy a prerequisite, these should be grouped under an "all_of" key.
        Course names: Individual course requirements can be included directly as strings.
        Course names with grade requirements: If a course requires a minimum grade, this should be noted within the course-specific object.
        Allowed Objects in prerequisites: The only objects that can appear in the "prerequisites" array are:

        {{"one_of": [...]}} (for a choice between multiple courses)
        {{"all_of": [...]}} (for a requirement of multiple courses)
        Course names (e.g., "MATH 237")
        Course names with grade requirements (e.g., {{"course": "STAT 230", "grade": "at least 60%"}}).
        Format in JSON:

        Use the key "course_id" for the course number.
        Use the key "prerequisites" for an array of course prerequisites. Within this array:
        Use "one_of" for elements where multiple course options provide the prerequisite fulfillment (when you see "or" or "one of" or "/").
        Use "all_of" for elements where all specified courses need to be completed to fulfill the prerequisites (when you see "and" or "all of" or ";" or ",").
        "one_of" can contain nested "one_of" or "all_of" elements.
        "all_of" can contain nested "one_of" or "all_of" elements.
        Use brackets in the prerequisites to group elements together in "one_of" or "all_of".
        Include individual course names directly.
        Include course names with grade requirements as objects.
        Use the key "restrictions" for additional non-course-specific requirements, such as department-specific eligibility or minimum grade thresholds.
        Generate JSON Output: Convert the parsed information into a JSON object as per the specifications given.
        
        Expected Output Format:

        {{
          "course_id": "{subject} {course_code}",
          "prerequisites": [],
          "restrictions": []
        }}

        Here is the prerequisite description you need to work with: 
        {prereq_text}

        You only need to output the JSON object.
    '''
    }

    completion = client.chat.completions.create(
        model=os.environ.get("FINETUNE_MODEL_ID"),
        messages=[system_message, user_message],
        temperature=0.50
    )

    json_output = completion.choices[0].message.content
    print(json_output)

    try:
        json_object = json.loads(json_output)
        print(json_object)

        # Prompt user for input
        save_response = input("Do you want to save this pair to the CSV file? (yes/no): ").strip().lower()

        if save_response == 'yes':
            # Append to CSV file
            csv_file_path = 'dataset/course_prereq.csv'
            with open(csv_file_path, 'a', newline='') as csv_file:
                csv_writer = csv.writer(csv_file)
                csv_writer.writerow([f"{subject} {course_code}: {prereq_text}", json.dumps(json_object)])
            print(f"Data successfully appended to {csv_file_path}.")
        else:
            print("Data was not saved.")

    except Exception as e:
        print(f"Error: {str(e)}")

# Example usage:
# course_dict = {
#     "subject": "CS",
#     "course_code": "330",
#     "course_type": "LEC,TST",
#     "course_credit": "0.50",
#     "prerequisites": "One of CS 106, 116, 136, 138, 146, or (CS 114 with at least 60%; CS 115 or CS 135); Level at least 2B; Not open to Computer Science students."
# }
#
# generate_response_with_dict(course_dict)
