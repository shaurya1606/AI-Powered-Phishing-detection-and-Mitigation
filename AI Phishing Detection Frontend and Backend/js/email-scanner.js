document.getElementById('emailScanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const emailContent = document.getElementById('emailContent').value;

    // Show loading state
    document.querySelector('button[type="submit"]').disabled = true;
    document.querySelector('button[type="submit"]').textContent = 'Scanning...';

    // Make API call to Flask backend
    fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailContent })
    })
    .then(response => response.json())
    .then(data => {
        displayResults(data);
        loadRecentScans(); // Load recent scans after processing
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error scanning email: ' + error.message);
    })
    .finally(() => {
        document.querySelector('button[type="submit"]').disabled = false;
        document.querySelector('button[type="submit"]').textContent = 'Scan Email';
    });
});

function displayResults(data) {
    const resultsContainer = document.getElementById('scanResults');
    resultsContainer.style.display = 'block';

    // Update sender score based on prediction
    const senderScore = document.getElementById('senderScore');
    senderScore.textContent = data.prediction === 'spam' ? 'Spam' : 'Not Spam';
    senderScore.className = 'score ' + (data.prediction === 'spam' ? 'danger' : 'safe');

    // For demonstration, we can set content score and links analysis
    const contentScore = document.getElementById('contentScore');
    contentScore.textContent = data.prediction === 'spam' ? 'High Risk' : 'Low Risk';
    contentScore.className = 'score ' + (data.prediction === 'spam' ? 'danger' : 'safe');

    const linksAnalysis = document.getElementById('linksAnalysis');
    linksAnalysis.innerHTML = 'No links analysis available for this demo.';

    storeScanHistory(data);
}

function storeScanHistory(scan) {
    const recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
    recentScans.unshift(scan);
    if (recentScans.length > 10) recentScans.pop();
    localStorage.setItem('recentScans', JSON.stringify(recentScans));

    // Update stats
    const totalEmailScans = parseInt(localStorage.getItem('totalEmailScans') || 0) + 1;
    localStorage.setItem('totalEmailScans', totalEmailScans);

    if (scan.status === 'Suspicious') {
        const threats = parseInt(localStorage.getItem('threatsDetected') || 0) + 1;
        localStorage.setItem('threatsDetected', threats);
    } else {
        const safe = parseInt(localStorage.getItem('safeItems') || 0) + 1;
        localStorage.setItem('safeItems', safe);
    }
}

function loadRecentScans() {
    fetch('http://localhost:5000/recent-scans')
        .then(response => response.json())
        .then(scans => {
            const recentScansContainer = document.getElementById('recentScansList');
            recentScansContainer.innerHTML = ''; // Clear previous scans
            scans.forEach(scan => {
                const div = document.createElement('div');
                div.textContent = `${scan.type} - Result: ${scan.result} (Date: ${scan.date})`;
                recentScansContainer.appendChild(div);
            });
        });
} 