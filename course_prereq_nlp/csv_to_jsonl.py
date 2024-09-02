import csv
import json

input_csv = 'dataset/course_prereq.csv'  # Update the path to your actual file location
output_jsonl = 'dataset/data.jsonl'

# Open the CSV file and the output JSONL file
with open(input_csv, mode='r', encoding='utf-8') as csvfile, open(output_jsonl, mode='w', encoding='utf-8') as jsonlfile:
    csvreader = csv.DictReader(csvfile)
    for row in csvreader:
        conversation = {
            "messages": [
                {"role": "system",
                 "content": "You are a virtual assistant. Help the user convert course prerequisites into JSON format."},
                {"role": "user", "content": f"What's the JSON format for {row['input']}?"},
                {"role": "assistant", "content": row['output']}
            ]
        }
        jsonlfile.write(json.dumps(conversation) + '\n')
