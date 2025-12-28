// Configuration - These will be set during deployment
const CONFIG = {
    API_KEY: 'acxv8sstcuacegh2',
    REDIRECT_URL: window.location.origin + '/callback.html'
};

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const statusMessage = document.getElementById('statusMessage');
const loginSection = document.getElementById('loginSection');
const holdingsSection = document.getElementById('holdingsSection');
const loading = document.getElementById('loading');
const holdingsBody = document.getElementById('holdingsBody');
const summaryDiv = document.getElementById('summary');

// Event listeners
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
        showStatus('You are already logged in. Click below to view holdings.', 'success');
        loginBtn.textContent = 'Display Holdings';
        loginBtn.removeEventListener('click', handleLogin);
        loginBtn.addEventListener('click', fetchHoldings);
    }
});

function handleLogin() {
    // Redirect to Zerodha login
    const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${CONFIG.API_KEY}`;
    window.location.href = loginUrl;
}

function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    holdingsSection.classList.remove('visible');
    loginSection.style.display = 'block';
    loginBtn.textContent = 'Click Me';
    loginBtn.removeEventListener('click', fetchHoldings);
    loginBtn.addEventListener('click', handleLogin);
    showStatus('Logged out successfully', 'info');
}

async function fetchHoldings() {
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
        showStatus('Please login first', 'error');
        return;
    }

    // Hide login section and show loading
    loginSection.style.display = 'none';
    loading.style.display = 'block';
    holdingsSection.classList.remove('visible');

    try {
        // Call our Cloudflare Pages Function to fetch holdings
        const response = await fetch('/api/holdings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: accessToken })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch holdings');
        }

        displayHoldings(data.data);
        loading.style.display = 'none';
        holdingsSection.classList.add('visible');

    } catch (error) {
        console.error('Error fetching holdings:', error);
        loading.style.display = 'none';
        loginSection.style.display = 'block';
        showStatus('Error: ' + error.message, 'error');
    }
}

function displayHoldings(holdings) {
    // Clear existing data
    holdingsBody.innerHTML = '';
    summaryDiv.innerHTML = '';

    if (!holdings || holdings.length === 0) {
        holdingsBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No holdings found</td></tr>';
        return;
    }

    // Calculate summary
    let totalValue = 0;
    let totalPnL = 0;

    holdings.forEach(holding => {
        const row = document.createElement('tr');
        
        const quantity = holding.quantity || 0;
        const avgPrice = holding.average_price || 0;
        const ltp = holding.last_price || 0;
        const value = quantity * ltp;
        const pnl = (ltp - avgPrice) * quantity;

        totalValue += value;
        totalPnL += pnl;

        const pnlColor = pnl >= 0 ? '#388e3c' : '#d32f2f';

        row.innerHTML = `
            <td><strong>${holding.tradingsymbol || 'N/A'}</strong></td>
            <td>${quantity}</td>
            <td>₹${avgPrice.toFixed(2)}</td>
            <td>₹${ltp.toFixed(2)}</td>
            <td style="color: ${pnlColor}; font-weight: 600;">₹${pnl.toFixed(2)}</td>
            <td>₹${value.toFixed(2)}</td>
        `;
        
        holdingsBody.appendChild(row);
    });

    // Display summary
    const pnlColor = totalPnL >= 0 ? '#388e3c' : '#d32f2f';
    summaryDiv.innerHTML = `
        <div class="summary-card">
            <h3>Total Holdings</h3>
            <p>${holdings.length}</p>
        </div>
        <div class="summary-card">
            <h3>Total Value</h3>
            <p>₹${totalValue.toFixed(2)}</p>
        </div>
        <div class="summary-card">
            <h3>Total P&L</h3>
            <p style="color: ${pnlColor};">₹${totalPnL.toFixed(2)}</p>
        </div>
    `;
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status ' + type;
    statusMessage.style.display = 'block';
}
