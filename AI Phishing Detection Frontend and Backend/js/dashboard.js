// Initialize dashboard data
document.addEventListener('DOMContentLoaded', function() {
    // Update user info in dashboard
    const userInfo = getUserInfo();
    if (userInfo.username) {
        document.getElementById('userGreeting').textContent = userInfo.username;
    }
    if (userInfo.lastLogin) {
        document.getElementById('lastLoginTime').textContent = 
            new Date(userInfo.lastLogin).toLocaleString();
    }

    updateStats();
    loadRecentScans();
    plotCharts();
    loadInsights();
});

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
});

function updateStats() {
    // Fetch stats from localStorage or API
    const stats = {
        totalEmailScans: parseInt(localStorage.getItem('totalEmailScans')) || 0,
        threatsInEmails: parseInt(localStorage.getItem('threatsInEmails')) || 0,
        totalUrlScans: parseInt(localStorage.getItem('totalUrlScans')) || 0,
        threatsInUrls: parseInt(localStorage.getItem('threatsInUrls')) || 0,
        safeEmails: parseInt(localStorage.getItem('safeEmails')) || 0,
        safeUrls: parseInt(localStorage.getItem('safeUrls')) || 0,
    };

    // Update the stats display
    document.getElementById('totalEmailScans').textContent = stats.totalEmailScans;
    document.getElementById('threatsInEmails').textContent = stats.threatsInEmails;
    document.getElementById('totalUrlScans').textContent = stats.totalUrlScans;
    document.getElementById('threatsInUrls').textContent = stats.threatsInUrls;
    document.getElementById('safeEmails').textContent = stats.safeEmails;
    document.getElementById('safeUrls').textContent = stats.safeUrls;
}

function loadRecentScans() {
    const recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
    
    const scanList = document.getElementById('scanList');
    scanList.innerHTML = ''; // Clear previous scans

    if (recentScans.length === 0) {
        scanList.innerHTML = '<p class="no-scans">No recent scans</p>';
        return;
    }

    recentScans.forEach(scan => {
        const scanItem = document.createElement('div');
        scanItem.className = 'scan-item';
        scanItem.innerHTML = `
            <div class="scan-info">
                <strong>${scan.type}</strong> - ${scan.date}
            </div>
            <div class="scan-status ${scan.status.toLowerCase()}">
                ${scan.status}
            </div>
        `;
        scanList.appendChild(scanItem);
    });
}

function plotCharts() {
    const emailCtx = document.getElementById('emailChart').getContext('2d');
    const urlCtx = document.getElementById('urlChart').getContext('2d');

    const emailData = {
        labels: ['Safe Emails', 'Threats in Emails'],
        datasets: [{
            data: [
                parseInt(localStorage.getItem('safeEmails')) || 0,
                parseInt(localStorage.getItem('threatsInEmails')) || 0
            ],
            backgroundColor: ['#27ae60', '#e74c3c'],
            hoverBackgroundColor: ['#2ecc71', '#c0392b']
        }]
    };

    const urlData = {
        labels: ['Safe URLs', 'Threats in URLs'],
        datasets: [{
            data: [
                parseInt(localStorage.getItem('safeUrls')) || 0,
                parseInt(localStorage.getItem('threatsInUrls')) || 0
            ],
            backgroundColor: ['#3498db', '#e74c3c'],
            hoverBackgroundColor: ['#2980b9', '#c0392b']
        }]
    };

    new Chart(emailCtx, {
        type: 'doughnut',
        data: emailData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Email Scan Results'
                }
            }
        }
    });

    new Chart(urlCtx, {
        type: 'doughnut',
        data: urlData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'URL Scan Results'
                }
            }
        }
    });
}

// Function to update the dashboard with new data
function updateDashboard() {
    fetch('/api/dashboard-data') // Adjust the endpoint as necessary
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
            loadRecentScans(); // Load recent scans after processing
            updateDashboardCounts(); // Update dashboard counts
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

// Function to handle email scanning results
function handleEmailScanResults(isSpam) {
    // Increment total email scans
    let totalEmailScans = parseInt(localStorage.getItem('totalEmailScans')) || 0;
    totalEmailScans++;
    localStorage.setItem('totalEmailScans', totalEmailScans);
    
    let threatsInEmails = parseInt(localStorage.getItem('threatsInEmails')) || 0;
    let safeEmails = parseInt(localStorage.getItem('safeEmails')) || 0;

    // Increment threats or safe emails based on the result
    if (isSpam) {
        threatsInEmails++;
        localStorage.setItem('threatsInEmails', threatsInEmails);
    } else {
        safeEmails++;
        localStorage.setItem('safeEmails', safeEmails);
    }

    // Add to recent scans
    addRecentScan('Email Scan', isSpam ? 'Spam Detected' : 'Safe', new Date().toLocaleString());
    
    // Update the stats display
    updateStats();
}

// Function to handle URL scanning results
function handleUrlScanResults(isSpam) {
    // Increment total URL scans
    let totalUrlScans = parseInt(localStorage.getItem('totalUrlScans')) || 0;
    totalUrlScans++;
    localStorage.setItem('totalUrlScans', totalUrlScans);

    // Increment threats or safe URLs based on the result
    if (isSpam) {
        let threatsInUrls = parseInt(localStorage.getItem('threatsInUrls')) || 0;
        threatsInUrls++;
        localStorage.setItem('threatsInUrls', threatsInUrls);
    } else {
        let safeUrls = parseInt(localStorage.getItem('safeUrls')) || 0;
        safeUrls++;
        localStorage.setItem('safeUrls', safeUrls);
    }

    // Update the stats display
    updateStats();

    // Add to recent scans
    addRecentScan('URL Scan', isSpam ? 'Spam Detected' : 'Safe', new Date().toLocaleString());
}

// Function to add a recent scan to localStorage and update the UI
function addRecentScan(scanType, status, date) {
    const recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
    recentScans.push({ type: scanType, status: status, date: date });
    localStorage.setItem('recentScans', JSON.stringify(recentScans));
    loadRecentScans(); // Refresh the recent scans display
}

// Call updateDashboard on page load or at appropriate intervals
document.addEventListener('DOMContentLoaded', updateDashboard);

function updateDashboardCounts() {
    document.getElementById('totalEmailScans').textContent = total_email_scans;
    document.getElementById('threatsInEmails').textContent = threats_in_emails;
    document.getElementById('totalUrlScans').textContent = total_url_scans;
    document.getElementById('threatsInUrls').textContent = threats_in_urls;
}

function loadInsights() {
    fetch('http://localhost:5000/insights')
        .then(response => response.json())
        .then(data => {
            displayInsights(data);
        })
        .catch(error => {
            console.error('Error fetching insights:', error);
        });
}

function displayInsights(data) {
    const keywordInsights = document.getElementById('keywordInsights');
    const engagementMetrics = document.getElementById('engagementMetrics');
    const postingFrequency = document.getElementById('postingFrequency');
    const emailInsights = document.getElementById('emailInsights');
    const urlInsights = document.getElementById('urlInsights');

    // Display keywords
    keywordInsights.innerHTML = `<strong>Most Common Keywords:</strong> ${data.keywords.join(', ')}`;

    // Display engagement metrics
    engagementMetrics.innerHTML = `
        <strong>Engagement Metrics:</strong>
        Likes: ${data.engagement_metrics.likes}, 
        Shares: ${data.engagement_metrics.shares}, 
        Comments: ${data.engagement_metrics.comments}
    `;

    // Display posting frequency
    postingFrequency.innerHTML = `
        <strong>Posting Frequency:</strong>
        Average Posts per Day: ${data.posting_frequency.average_posts_per_day}, 
        Inconsistent Behavior: ${data.posting_frequency.inconsistent_behavior ? 'Yes' : 'No'}
    `;

    // Display email insights
    emailInsights.innerHTML = `
        <strong>Email Insights:</strong>
        Total Email Scans: ${data.email_insights.total_email_scans}, 
        Spam Emails: ${data.email_insights.spam_emails}, 
        Safe Emails: ${data.email_insights.safe_emails}
    `;

    // Display URL insights
    urlInsights.innerHTML = `
        <strong>URL Insights:</strong>
        Total URL Scans: ${data.url_insights.total_url_scans}, 
        Malicious URLs: ${data.url_insights.malicious_urls}, 
        Safe URLs: ${data.url_insights.safe_urls}
    `;
}