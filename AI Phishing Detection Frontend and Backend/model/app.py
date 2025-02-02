from flask import Flask, request, jsonify
import openai  # Make sure to install the OpenAI library

app = Flask(__name__)

# Set your OpenAI API key
openai.api_key = 'YOUR_OPENAI_API_KEY'

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data['message']

    # Call the OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": user_message}]
    )

    bot_reply = response['choices'][0]['message']['content']
    return jsonify({'reply': bot_reply})

@app.route('/url-scan', methods=['POST'])
def url_scan():
    data = request.get_json()
    url = data['url']

    # Here you would implement your URL scanning logic
    # For demonstration, let's mock the response
    if "spam" in url:
        return jsonify({"prediction": "spam"})
    else:
        return jsonify({"prediction": "safe"})

@app.route('/insights', methods=['GET'])
def insights():
    # Mock data for insights
    insights_data = {
        "keywords": ["spam", "offer", "free", "limited time"],
        "engagement_metrics": {
            "likes": 150,
            "shares": 30,
            "comments": 10
        },
        "posting_frequency": {
            "average_posts_per_day": 5,
            "inconsistent_behavior": True
        },
        "email_insights": {
            "total_email_scans": 100,
            "spam_emails": 20,
            "safe_emails": 80
        },
        "url_insights": {
            "total_url_scans": 50,
            "malicious_urls": 10,
            "safe_urls": 40
        }
    }
    return jsonify(insights_data)

if __name__ == '__main__':
    app.run(debug=True)