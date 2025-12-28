// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const requestToken = urlParams.get('request_token');
const status = urlParams.get('status');

const messageEl = document.getElementById('message');
const errorEl = document.getElementById('error');

async function processCallback() {
    // Check if login was cancelled
    if (status === 'error' || !requestToken) {
        showError('Login was cancelled or failed. Please try again.');
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 3000);
        return;
    }

    try {
        messageEl.textContent = 'Exchanging request token for access token...';

        // Call our Cloudflare Pages Function to exchange token
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request_token: requestToken })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Store access token and user info
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_id', data.user_id);

        messageEl.textContent = 'Authentication successful! Redirecting...';
        
        // Redirect to main page
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 1500);

    } catch (error) {
        console.error('Authentication error:', error);
        showError('Authentication failed: ' + error.message);
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 3000);
    }
}

function showError(message) {
    document.querySelector('.spinner').style.display = 'none';
    messageEl.style.display = 'none';
    errorEl.className = 'error';
    errorEl.style.display = 'block';
    errorEl.innerHTML = `
        <p>${message}</p>
        <a href="/index.html" class="btn">Return to Home</a>
    `;
}

// Start processing when page loads
processCallback();
