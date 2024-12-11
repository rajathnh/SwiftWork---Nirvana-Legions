import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import pickle

# Step 1: Load the dataset
df = pd.read_csv('urgency_dataset.csv', on_bad_lines='skip')  # Skips problematic lines


# Step 2: Data Cleaning
# Ensure that the 'urgency' column is numeric and handle any invalid rows
df['urgency'] = pd.to_numeric(df['urgency'], errors='coerce')  # Convert non-numeric to NaN
df.dropna(subset=['urgency'], inplace=True)  # Drop rows where urgency is NaN

# Step 3: Feature Engineering - Prepare features (X) and target (y)
X = df[['days_until_deadline']]  # Feature: Days until the deadline
y = df['urgency']  # Target: Urgency level (numeric)

# Step 4: Split the data into training and testing sets (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Step 5: Initialize and train the Random Forest Regressor model
model = RandomForestRegressor(n_estimators=20, random_state=42)  # Using 20 trees
model.fit(X_train, y_train)

# Step 6: Evaluate the model (Calculate MAE)
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error (MAE): {mae}")

# Step 7: Save the trained model for future use
with open('urgency_model.pkl', 'wb') as model_file:
    pickle.dump(model, model_file)

print("Urgency prediction model has been saved successfully!")
