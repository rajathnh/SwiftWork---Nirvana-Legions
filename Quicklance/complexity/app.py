from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

# Load the trained model and vectorizer
model = joblib.load("complexity_model.pkl")  # Ensure the path is correct
vectorizer = joblib.load("vectorizer.pkl")   # Ensure the path is correct

@app.route('/predict', methods=['POST'])
def predict_complexity():
    try:
        # Ensure the request is JSON
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        # Parse the input JSON
        data = request.get_json()

        if 'description' not in data or not isinstance(data['description'], str) or not data['description'].strip():
            return jsonify({"error": "'description' must be a non-empty string"}), 400

        description = data['description']

        # Preprocess the description (vectorize)
        description_vectorized = vectorizer.transform([description])

        # Predict complexity
        predicted_complexity = model.predict(description_vectorized)

        # Return the prediction as JSON
        return jsonify({
            "success": True,
            "message": "Complexity prediction successful",
            "predicted_complexity": float(predicted_complexity[0])
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
