from flask import Flask, request, jsonify
import pickle

app = Flask(__name__)

# Load the trained model
with open('urgency_model.pkl', 'rb') as model_file:
    urgency_model = pickle.load(model_file)

# Define the /predict-urgency endpoint
@app.route('/predict-urgency', methods=['POST'])
def predict_urgency():
    try:
        # Get input data from the request
        data = request.get_json()
        
        # Check if the required field is provided
        if 'days_until_deadline' not in data:
            return jsonify({'error': 'Missing days_until_deadline field in the request'}), 400
        
        # Extract the input value
        days_until_deadline = data['days_until_deadline']
        
        # Ensure the input is in the correct format
        if not isinstance(days_until_deadline, (int, float)):
            return jsonify({'error': 'days_until_deadline must be a number'}), 400
        
        # Make the prediction
        predicted_urgency = urgency_model.predict([[days_until_deadline]])
        
        # Return the prediction
        return jsonify({'predicted_urgency': float(predicted_urgency[0])})

    except Exception as e:
        # Return an error response if something goes wrong
        return jsonify({'error': str(e)}), 500

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
