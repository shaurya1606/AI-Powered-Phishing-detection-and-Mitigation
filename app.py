# app.py (Flask API)
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the pre-trained Logistic Regression model
model = joblib.load('logistic_regression_model.pkl')

# Load the fitted TF-IDF vectorizer
vectorizer = joblib.load('tfidf_vectorizer.pkl')  # Load the fitted vectorizer

# Define the API endpoint to predict if email is spam or not
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()  # Get JSON data from the request
    email_text = data['email']  # Extract email text from the request
    
    # Transform the email text into the same feature format used in training
    email_vectorized = vectorizer.transform([email_text]).toarray()
    
    # Get prediction
    prediction = model.predict(email_vectorized)
    
    # Return the prediction as JSON response
    result = {'prediction': 'spam' if prediction[0] == 1 else 'not spam'}
    return jsonify(result)

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
