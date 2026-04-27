document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('userGreeting').textContent = username;

    // Initialize Chart.js instances
    initCharts();

    // Fetch live data immediately, then every 2 seconds for a snappy feel
    fetchDashboardData();
    setInterval(fetchDashboardData, 2000);
});

let emailChartInstance = null;
let urlChartInstance = null;

function initCharts() {
    const emailCtx = document.getElementById('emailChart').getContext('2d');
    const urlCtx = document.getElementById('urlChart').getContext('2d');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    emailChartInstance = new Chart(emailCtx, {
        type: 'doughnut',
        data: {
            labels: ['Safe Emails', 'Threats Detected'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Email Scan Distribution', color: '#f8fafc' }
            }
        }
    });

    urlChartInstance = new Chart(urlCtx, {
        type: 'doughnut',
        data: {
            labels: ['Safe URLs', 'Threats Detected'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#3b82f6', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'URL Scan Distribution', color: '#f8fafc' }
            }
        }
    });
}

async function fetchDashboardData() {
    try {
        // Fetch global metrics
        const insightsRes = await fetch(`${CONFIG.API_BASE_URL}/insights`);
        const metrics = await insightsRes.json();
        
        // Update DOM stats
        document.getElementById('totalEmailScans').textContent = metrics.total_email_scans;
        document.getElementById('threatsInEmails').textContent = metrics.spam_emails;
        document.getElementById('totalUrlScans').textContent = metrics.total_url_scans;
        
        // Safely calculate total safe items
        const safeItems = metrics.safe_emails + metrics.safe_urls;
        document.getElementById('safeItems').textContent = safeItems;

        // Update Charts dynamically
        emailChartInstance.data.datasets[0].data = [metrics.safe_emails, metrics.spam_emails];
        emailChartInstance.update();

        urlChartInstance.data.datasets[0].data = [metrics.safe_urls, metrics.spam_urls];
        urlChartInstance.update();

        // Fetch recent scans
        const scansRes = await fetch(`${CONFIG.API_BASE_URL}/recent-scans`);
        const scans = await scansRes.json();
        
        updateRecentScans(scans);

    } catch(err) {
        console.error("Failed to fetch dashboard data. Backend might be down:", err);
    }
}

function updateRecentScans(scans) {
    const list = document.getElementById('scanList');
    list.innerHTML = '';

    if (scans.length === 0) {
        list.innerHTML = '<p class="no-scans" style="color: var(--text-muted)">No recent scans yet.</p>';
        return;
    }

    scans.forEach(scan => {
        const isSpam = scan.status.includes('Phishing');
        const statusClass = isSpam ? 'danger' : 'safe';
        
        list.innerHTML += `
            <div class="scan-item">
                <div style="color: var(--text-main)">
                    <i class="fas ${scan.type === 'Email' ? 'fa-envelope' : 'fa-link'}" style="margin-right: 8px; color: var(--accent-cyan)"></i>
                    <strong>${scan.type} Scan</strong>
                    <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 10px;">${scan.date}</span>
                </div>
                <div>
                    <span class="score ${statusClass}">${scan.status}</span>
                </div>
            </div>
        `;
    });
}