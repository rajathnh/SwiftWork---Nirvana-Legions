from flask import Flask, request, jsonify
import pickle
import numpy as np
from datetime import datetime

app = Flask(__name__)

with open('complexity/complexity_model.pkl', 'rb') as cm_file:
    complexity_model = pickle.load(cm_file)

with open('complexity/vectorizer.pkl', 'rb') as vec_file:
    vectorizer = pickle.load(vec_file)

with open('Urgency/urgency_model.pkl', 'rb') as um_file:
    urgency_model = pickle.load(um_file)

# Endpoint to predict both complexity and urgency
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if 'deadline' not in data or 'description' not in data:
            return jsonify({'error': 'Both "deadline" and "description" fields are required'}), 400

        # Extract deadline and description
        description = data['description']
        deadline = datetime.strptime(data['deadline'], "%Y-%m-%d")
        days_remaining = (deadline - datetime.now()).days

        if days_remaining < 0:
            return jsonify({'error': 'The deadline must be a future date'}), 400

        description_vectorized = vectorizer.transform([description])
        complexity = complexity_model.predict(description_vectorized)[0]

        urgency = urgency_model.predict([[days_remaining]])[0]

        BASE_PRICE = 1000 # Minimum price in INR
        COMPLEXITY_MULTIPLIER = 150  # Price increase per complexity level
        URGENCY_MULTIPLIER = 100  # Additional price per urgency level

        total_price = BASE_PRICE + (complexity * COMPLEXITY_MULTIPLIER) + (urgency * URGENCY_MULTIPLIER)

        return jsonify({
            'totalPrice': int(total_price)  # Ensure integer value for clean JSON output
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
