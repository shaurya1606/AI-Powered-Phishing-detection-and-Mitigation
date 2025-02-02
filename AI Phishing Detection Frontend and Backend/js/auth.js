// Hardcoded credentials (for demonstration only)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin'
};

// Check if user is already logged in
function checkLoginState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();

    if (isLoggedIn === 'true') {
        // If on login page but already logged in, redirect to dashboard
        if (currentPage === 'login.html') {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If not logged in and trying to access protected pages, redirect to login
        const protectedPages = ['dashboard.html', 'email-scanner.html', 'url-scanner.html'];
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

// Run check when page loads
document.addEventListener('DOMContentLoaded', checkLoginState);

// Handle login form if it exists on the page
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_CREDENTIALS.username && 
            password === ADMIN_CREDENTIALS.password) {
            // Store login state and user info
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('username', username);
            localStorage.setItem('lastLogin', new Date().toISOString());
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });
}

// Handle logout if logout button exists
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear all auth-related data from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('lastLogin');
        
        // Redirect to home page
        window.location.href = 'index.html';
    });
}

// Function to get user info (can be used in other scripts)
function getUserInfo() {
    return {
        username: localStorage.getItem('username'),
        role: localStorage.getItem('userRole'),
        lastLogin: localStorage.getItem('lastLogin')
    };
} 