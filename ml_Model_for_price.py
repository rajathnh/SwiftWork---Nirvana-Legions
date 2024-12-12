from flask import Flask, request, jsonify
from google.cloud import generative_language
from google.oauth2 import service_account

# Set up Flask app
app = Flask(__name__)

# Authenticate with Gemini API
credentials = service_account.Credentials.from_service_account_file(
    'path_to_your_service_account_key.json'
)
client = generative_language.GenerativeLanguageClient(credentials=credentials)

# Route for price prediction using Gemini for complexity, urgency, and price
@app.route('/predict_price', methods=['POST'])
def predict_price():
    data = request.json
    description = data['description']
    days_remaining = data['days_remaining']
    
    # Construct the prompt for Gemini to analyze the description, urgency, and compute price
    prompt = f"""
    Analyze the following project description: "{description}"
    1. Rate the complexity of this project on a scale of 1 to 10.
    2. Based on the number of days remaining ({days_remaining}), determine the urgency on a scale of 1 to 15.
    3. Calculate the total price for this project, considering:
       - Base price: $100
       - Complexity (scale 1-10): Complexity * 50
       - Urgency (scale 1-15): Urgency * 20
       Return the total price.
    """
    
    # Send the prompt to Gemini and get the response
    response = client.generate(prompt=prompt)
    result = response.result.strip()
    
    return jsonify({'total_price': result})

if __name__ == '__main__':
    app.run(debug=True)
