import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import pickle
import numpy as np

# Load dataset
dataset = pd.read_csv("dataset.csv")

# Feature extraction
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(dataset["Description"])
y = dataset["Complexity"]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model on test data
y_pred = model.predict(X_test)

# Calculate evaluation metrics
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# Display metrics in a formatted table
print("Model Evaluation Metrics:")
print(f"{'Metric':<20}{'Value':<20}")
print(f"{'-'*40}")
print(f"{'Mean Squared Error':<20}{mse:<20.4f}")
print(f"{'Mean Absolute Error':<20}{mae:<20.4f}")
print(f"{'R-Squared':<20}{r2:<20.4f}")

# Perform cross-validation to show loss across folds
cv_scores = cross_val_score(model, X, y, cv=5, scoring='neg_mean_squared_error')
cv_mse_scores = -cv_scores  # Negate because scoring is negative MSE

print("\nCross-Validation (Loss per Fold):")
print(f"{'Fold':<10}{'Loss (MSE)':<20}")
for i, score in enumerate(cv_mse_scores, 1):
    print(f"{i:<10}{score:<20.4f}")

# Save the trained model and vectorizer
with open("complexity_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

with open("vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("\nModel and vectorizer saved.")
