import pandas as pd
import random
from datetime import datetime, timedelta

# Define urgency levels based on days until the deadline
def calculate_urgency(days_until_deadline):
    if days_until_deadline <= 0.625:  # 15 hours
        return 15
    elif days_until_deadline <= 1:  # 24 hours
        return 14
    elif days_until_deadline <= 2:  # 48 hours
        return 13
    elif days_until_deadline <= 3:  # 72 hours
        return 12
    elif days_until_deadline <= 5:
        return 11
    elif days_until_deadline <= 7:  # 1 week
        return 10
    elif days_until_deadline <= 10:
        return 9
    elif days_until_deadline <= 14:  # 2 weeks
        return 8
    elif days_until_deadline <= 30:  # 1 month
        return 7
    elif days_until_deadline <= 60:  # 2 months
        return 6
    elif days_until_deadline <= 90:  # 3 months
        return 5
    elif days_until_deadline <= 120:  # 4 months
        return 4
    elif days_until_deadline <= 180:  # 6 months
        return 3
    elif days_until_deadline <= 365:  # 1 year
        return 2
    else:
        return 1

# Generate synthetic data
def generate_synthetic_data(num_samples=1000):
    data = []
    for _ in range(num_samples):
        request_date = datetime.now() - timedelta(days=random.randint(0, 30))  # Random date in the last month
        days_until_deadline = random.randint(1, 730)  # Random deadline up to 2 years
        deadline = request_date + timedelta(days=days_until_deadline)
        
        # Calculate urgency level
        urgency = calculate_urgency(days_until_deadline)

        data.append({
            # "request_date": request_date.strftime('%Y-%m-%d'),
            # "deadline": deadline.strftime('%Y-%m-%d'),
            "days_until_deadline": days_until_deadline,
            "urgency": urgency
        })
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    return df

# Generate dataset and save to CSV
df = generate_synthetic_data(num_samples=5000)
df.to_csv("urgency_dataset2.csv", index=False)

print("Synthetic urgency dataset saved as 'urgency_dataset.csv'.")
