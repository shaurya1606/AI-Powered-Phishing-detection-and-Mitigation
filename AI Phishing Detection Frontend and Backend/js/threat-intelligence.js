document.addEventListener('DOMContentLoaded', function() {
    loadThreatData();
    loadRecentThreats();
    // Initialize threat analysis chart here if needed
});

function loadThreatData() {
    // Simulate loading threat data (replace with actual API call)
    const threatData = [
        { source: 'Source A', threatLevel: 'High', description: 'Phishing attack detected' },
        { source: 'Source B', threatLevel: 'Medium', description: 'Malware distribution' },
    ];

    const threatDataContainer = document.getElementById('threatData');
    threatData.forEach(threat => {
        const div = document.createElement('div');
        div.textContent = `${threat.source}: ${threat.description} (Threat Level: ${threat.threatLevel})`;
        threatDataContainer.appendChild(div);
    });
}

function loadRecentThreats() {
    // Simulate loading recent threats (replace with actual API call)
    const recentThreats = [
        { type: 'Phishing', severity: 'High', date: '2024-04-01' },
        { type: 'Malware', severity: 'Medium', date: '2024-03-30' },
    ];

    const recentThreatsList = document.getElementById('recentThreatsList');
    recentThreats.forEach(threat => {
        const div = document.createElement('div');
        div.textContent = `${threat.type} - Severity: ${threat.severity} (Date: ${threat.date})`;
        recentThreatsList.appendChild(div);
    });
} 