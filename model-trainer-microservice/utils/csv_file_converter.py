import csv
from typing import List, Dict

def read_training_csv(file_path: str) -> List[Dict]:
    """Read and parse YOLO training results CSV file.
    
    Args:
        file_path: Path to the results.csv file
        
    Returns:
        List of dictionaries containing parsed training metrics
    """
    results = []
    
    with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            # Convert numeric values
            converted = {}
            for key, value in row.items():
                try:
                    # Handle scientific notation and floats
                    converted[key] = float(value) if 'e' in value.lower() else int(value)
                except ValueError:
                    try:
                        converted[key] = float(value)
                    except:
                        converted[key] = value
            
            results.append(converted)
    
    return results