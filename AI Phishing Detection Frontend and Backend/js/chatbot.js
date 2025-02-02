document.getElementById('sendButton').addEventListener('click', function() {
    const userInput = document.getElementById('userInput').value;
    if (userInput.trim() === '') return;

    // Display user message
    displayMessage(userInput, 'user-message');
    document.getElementById('userInput').value = '';

    // Send message to the backend
    fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        displayMessage(data.reply, 'bot-message');
    })
    .catch(error => {
        console.error('Error:', error);
        displayMessage('Sorry, something went wrong.', 'bot-message');
    });
});

function displayMessage(message, className) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${className}`;
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight; // Scroll to bottom
}

document.getElementById('chatLogo').addEventListener('click', function() {
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
}); 