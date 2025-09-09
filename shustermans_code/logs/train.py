import json

def count_arrays_in_jsonl(file_path):
    with open(file_path, 'r') as file:
        for line_num, line in enumerate(file, 1):
            try:
                # Parse each JSON object
                json_obj = json.loads(line.strip())

                # Count arrays in this object
                array_count = 0
                for key, value in json_obj.items():
                    if isinstance(value, list):
                        array_count += 1

                print(f"Line {line_num}: {array_count} arrays")

                # Optional: Show structure of first few objects
                if line_num <= 3:
                    print(f"  Keys: {list(json_obj.keys())}")
                    for key, value in json_obj.items():
                        if isinstance(value, list):
                            print(f"    {key}: array with {len(value)} elements")
                    print()

            except json.JSONDecodeError as e:
                print(f"Line {line_num}: Invalid JSON - {e}")

# Usage
count_arrays_in_jsonl('facebook_samples.jsonl')