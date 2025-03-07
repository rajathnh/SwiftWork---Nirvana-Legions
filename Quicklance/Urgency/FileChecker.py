with open('urgency_dataset.csv', 'r') as file:
    for i, line in enumerate(file):
        print(f"Line {i + 1}: {line.strip()}")
