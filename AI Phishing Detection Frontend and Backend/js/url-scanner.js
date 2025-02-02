document.getElementById('urlScanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const url = document.getElementById('urlInput').value;
    scanUrl(url);
});

async function scanUrl(url) {
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Scanning...';

    try {
        const response = await fetch('http://localhost:5000/url-scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const results = await response.json();
        displayResults(results);
        loadRecentScans(); // Load recent scans after processing
    } catch (error) {
        alert('Error scanning URL: ' + error.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Scan URL';
    }
}

function displayResults(data) {
    const resultsContainer = document.getElementById('scanResults');
    resultsContainer.style.display = 'block';

    // Update safety score based on prediction
    const safetyScore = document.getElementById('safetyScore');
    safetyScore.textContent = data.prediction === 'spam' ? 'Spam' : 'Not Spam';
    safetyScore.className = 'score ' + (data.prediction === 'spam' ? 'danger' : 'safe');
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

function mockUrlScan(url) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const score = Math.random() * 100;
            resolve({
                safetyScore: score,
                threats: generateThreats(score),
                recommendations: generateRecommendations(score)
            });
        }, 1500);
    });
}

function generateThreats(score) {
    const threats = [];
    if (score < 70) {
        threats.push('Suspicious domain pattern detected');
    }
    if (score < 50) {
        threats.push('Known phishing patterns found');
    }
    if (score < 30) {
        threats.push('Malicious content detected');
    }
    return threats;
}

function generateRecommendations(score) {
    if (score >= 70) {
        return ['URL appears safe, but always exercise caution'];
    }
    return [
        'Do not enter sensitive information on this site',
        'Verify the URL carefully',
        'Report this URL if you suspect it\'s malicious'
    ];
}

function scanBulkUrls() {
    const urlList = document.getElementById('urlList').value;
    const urls = urlList.split('\n').filter(url => url.trim());

    if (urls.length === 0) {
        alert('Please enter at least one URL');
        return;
    }

    // Create bulk results container if it doesn't exist
    let bulkResults = document.querySelector('.bulk-results');
    if (!bulkResults) {
        bulkResults = document.createElement('div');
        bulkResults.className = 'bulk-results';
        document.querySelector('.scanner-content').appendChild(bulkResults);
    }

    bulkResults.innerHTML = '<h2>Bulk Scan Results</h2>';
    
    urls.forEach((url, index) => {
        setTimeout(() => {
            mockUrlScan(url).then(results => {
                const resultElement = document.createElement('div');
                resultElement.className = 'bulk-result-item';
                resultElement.innerHTML = `
                    <div class="url">${url}</div>
                    <div class="score ${getScoreClass(results.safetyScore)}">
                        Score: ${Math.round(results.safetyScore)}/100
                    </div>
                `;
                bulkResults.appendChild(resultElement);
            });
        }, index * 1000);
    });
}

function storeScanHistory(scan) {
    const recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
    recentScans.unshift(scan);
    if (recentScans.length > 10) recentScans.pop();
    localStorage.setItem('recentScans', JSON.stringify(recentScans));

    // Update stats
    const totalUrlScans = parseInt(localStorage.getItem('totalUrlScans') || 0) + 1;
    localStorage.setItem('totalUrlScans', totalUrlScans);

    if (scan.status === 'Suspicious') {
        const threats = parseInt(localStorage.getItem('threatsDetected') || 0) + 1;
        localStorage.setItem('threatsDetected', threats);
    } else {
        const safe = parseInt(localStorage.getItem('safeItems') || 0) + 1;
        localStorage.setItem('safeItems', safe);
    }
}

function getScoreClass(score) {
    if (score >= 70) return 'safe';
    if (score >= 40) return 'warning';
    return 'danger';
} 