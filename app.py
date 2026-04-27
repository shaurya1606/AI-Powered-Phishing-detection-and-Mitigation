from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

model = joblib.load('logistic_regression_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

# Global metrics tracking
metrics = {
    'total_email_scans': 0,
    'spam_emails': 0,
    'safe_emails': 0,
    'total_url_scans': 0,
    'spam_urls': 0,
    'safe_urls': 0
}

recent_scans = []

def add_scan(scan_type, status):
    global recent_scans
    scan = {
        'type': scan_type,
        'status': status,
        'date': datetime.now().strftime("%I:%M %p")
    }
    recent_scans.insert(0, scan)
    if len(recent_scans) > 10:
        recent_scans.pop()

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    email_text = data.get('email', '')
    if not email_text:
        return jsonify({'error': 'No email provided'}), 400
    
    email_vectorized = vectorizer.transform([email_text]).toarray()
    prediction = model.predict(email_vectorized)
    
    # Model predicts 0 for Spam, 1 for Ham
    result_str = 'spam' if prediction[0] == 0 else 'not spam'
    
    # Update metrics
    metrics['total_email_scans'] += 1
    if result_str == 'spam':
        metrics['spam_emails'] += 1
        status = 'Phishing Detected'
    else:
        metrics['safe_emails'] += 1
        status = 'Safe'
        
    add_scan('Email', status)
    return jsonify({'prediction': result_str})

@app.route('/url-scan', methods=['POST'])
def url_scan():
    data = request.get_json()
    url = data.get('url', '')
    if not url:
        return jsonify({'error': 'No URL provided'}), 400
    
    # Simple placeholder logic: safe unless it has sketchy keywords
    sketchy = ['free', 'login', 'secure', 'update', 'verify', 'account', 'bank']
    score = random.randint(70, 95)
    result_str = 'not spam'
    
    for word in sketchy:
        if word in url.lower():
            score = random.randint(10, 40)
            result_str = 'spam'
            break
            
    # Update metrics
    metrics['total_url_scans'] += 1
    if result_str == 'spam':
        metrics['spam_urls'] += 1
        status = 'Phishing Detected'
    else:
        metrics['safe_urls'] += 1
        status = 'Safe'
        
    add_scan('URL', status)
    return jsonify({'prediction': result_str, 'safetyScore': score})

@app.route('/recent-scans', methods=['GET'])
def get_recent_scans():
    return jsonify(recent_scans)

@app.route('/insights', methods=['GET'])
def get_insights():
    return jsonify(metrics)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    msg = data.get('message', '').lower()
    
    reply = "I'm not sure how to answer that. Try asking about 'phishing', 'passwords', or 'suspicious links'."
    
    if 'phishing' in msg:
        reply = "Phishing is a cyber attack where attackers disguise themselves as a trusted entity to trick you into clicking malicious links or revealing sensitive information."
    elif 'password' in msg:
        reply = "Always use strong, unique passwords for every account. Consider using a password manager and enable Two-Factor Authentication (2FA) wherever possible."
    elif 'link' in msg or 'url' in msg:
        reply = "Never click on unexpected links! Always hover over a link to see the actual URL. If in doubt, use our URL Scanner tool on the dashboard."
    elif 'hello' in msg or 'hi' in msg:
        reply = "Hello! I am PhishBot. How can I help you stay secure today?"
    elif 'safe' in msg or 'secure' in msg:
        reply = "To stay secure: 1) Verify senders, 2) Don't click strange links, 3) Use 2FA, 4) Keep your software updated."
        
    return jsonify({'reply': reply})

if __name__ == '__main__':
    app.run(debug=True)
