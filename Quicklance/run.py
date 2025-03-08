from flask import Flask, Response, request, jsonify
from flask_cors import CORS  
import pickle
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "*"}})

@app.after_request
def add_csp(response):
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; connect-src 'self' https://quicklance.onrender.com;"
    )
    return response

# Load models
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

        description = data['description']
        deadline = datetime.strptime(data['deadline'], "%Y-%m-%d")
        days_remaining = (deadline - datetime.now()).days

        if days_remaining < 0:
            return jsonify({'error': 'The deadline must be a future date'}), 400

        description_vectorized = vectorizer.transform([description])
        complexity = complexity_model.predict(description_vectorized)[0]
        urgency = urgency_model.predict([[days_remaining]])[0]

        BASE_PRICE = 1000
        COMPLEXITY_MULTIPLIER = 150
        URGENCY_MULTIPLIER = 100

        total_price = BASE_PRICE + (complexity * COMPLEXITY_MULTIPLIER) + (urgency * URGENCY_MULTIPLIER)

        return jsonify({'totalPrice': int(total_price)})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Get port from Render, default to 5000
    app.run(host="0.0.0.0", port=port)
