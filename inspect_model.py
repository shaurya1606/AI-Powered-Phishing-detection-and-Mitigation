import joblib

model = joblib.load('logistic_regression_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')

texts = [
    "Hi mom, how are you? Let's get lunch today.",
    "CONGRATULATIONS! You have won a $1000 Walmart gift card! Click here to claim your prize now!",
    "Meeting agenda for tomorrow is attached.",
    "URGENT: Your account has been suspended. Please login to verify your identity.",
    "Hello, I am a normal person writing a normal email.",
    "Click this link to get free money now!!! http://spam.com",
    "spam spam spam viagra money free",
    "ham ham ham ham ham",
    "Dear customer, your bank account requires immediate verification to prevent closure."
]

X = vectorizer.transform(texts).toarray()
preds = model.predict(X)
probs = model.predict_proba(X)

for text, p, prob in zip(texts, preds, probs):
    print(f"Pred: {p}, Prob: {prob}, Text: {text}")

