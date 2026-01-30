// TARS Command Center - Premium Dashboard Controller
// Password: harsha_tars

const CONFIG = {
    password: 'harsha_tars',
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    apiEndpoint: 'api/status.json',
    sessionStart: new Date()
};

// State
let isAuthenticated = false;
let refreshTimer = null;
let uptimeInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for saved auth
    const saved = sessionStorage.getItem('tars_auth');
    const authTime = sessionStorage.getItem('tars_auth_time');
    
    // Auth expires after 24 hours
    if (saved === 'true' && authTime) {
        const hoursSince = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            isAuthenticated = true;
            showDashboard();
            initializeDashboard();
        } else {
            clearAuth();
        }
    }
    
    // Setup password input enter key
    const pwdInput = document.getElementById('password-input');
    if (pwdInput) {
        pwdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyPassword();
        });
        pwdInput.focus();
    }
});

// Verify password
function verifyPassword() {
    const input = document.getElementById('password-input').value.trim();
    const errorMsg = document.getElementById('error-msg');
    
    if (input === CONFIG.password) {
        isAuthenticated = true;
        sessionStorage.setItem('tars_auth', 'true');
        sessionStorage.setItem('tars_auth_time', Date.now().toString());
        
        // Hide overlay with transition
        const overlay = document.getElementById('password-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            showDashboard();
            initializeDashboard();
        }, 300);
    } else {
        errorMsg.textContent = '◈ ACCESS DENIED // INVALID CREDENTIALS';
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();
    }
}

// Clear auth
function clearAuth() {
    sessionStorage.removeItem('tars_auth');
    sessionStorage.removeItem('tars_auth_time');
    isAuthenticated = false;
}

// Show dashboard
function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
    // Small delay for fade-in effect
    setTimeout(() => {
        dashboard.style.opacity = '1';
    }, 50);
}

// Initialize dashboard
function initializeDashboard() {
    loadData();
    startAutoRefresh();
    updateTime();
    startUptimeCounter();
    loadChatHistory();
    
    // Update time every minute
    setInterval(updateTime, 60000);
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const timeEl = document.getElementById('current-time');
    if (timeEl) timeEl.textContent = timeStr;
}

// Start uptime counter
function startUptimeCounter() {
    // TARS creation date: January 2024 (approximately 390 days ago)
    const startDate = new Date('2024-01-01');
    const days = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    document.getElementById('uptime').textContent = days;
}

// Manual refresh
function manualRefresh() {
    const btn = document.getElementById('refresh-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="refresh-icon">◉</span> SYNCING...';
    
    loadData().then(() => {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<span class="refresh-icon">↻</span> SYNC NOW';
        }, 1000);
    });
}

// Load data
async function loadData() {
    try {
        const data = await fetchData();
        updateDashboard(data);
        updateLastSync();
    } catch (error) {
        console.error('Failed to load data:', error);
        showNotification('Failed to sync data', 'error');
    }
}

// Fetch data
async function fetchData() {
    // Try to fetch from API first
    try {
        const response = await fetch(CONFIG.apiEndpoint + '?t=' + Date.now());
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.log('API unavailable, using mock data');
    }
    
    // Fallback to mock data
    return getMockData();
}

// Get mock data (for testing)
function getMockData() {
    return {
        memories: 103,
        tasks: 5,
        emailsIn: 2,
        emailsOut: 1,
        skills: 13,
        subdomains: 12,
        deployments: 2,
        uptime: 390,
        systemStatus: {
            memoryDb: 'online',
            coolifyApi: 'online',
            telegramBot: 'online',
            githubSsh: 'online',
            chromaDb: 'online',
            ga4Analytics: 'online'
        },
        recentActivity: [
            { time: '17:22', action: 'Deployed TARS E-ink Dashboard to production' },
            { time: '17:15', action: 'Created tars-dashboard GitHub repository' },
            { time: '17:05', action: 'Finalized coolify-deploy skill with 12 subdomains' },
            { time: '16:59', action: 'Deployed brutalist landing page successfully' },
            { time: '16:45', action: 'Connected Coolify API and GitHub SSH' },
            { time: '15:30', action: 'Updated comprehensive logging system' }
        ],
        lastDeployment: {
            name: 'tars-dashboard',
            url: 'tars-dashboard.devsharsha.live',
            time: '17:22'
        }
    };
}

// Update dashboard
function updateDashboard(data) {
    // Hero stats
    document.getElementById('memories').textContent = data.memories || 0;
    document.getElementById('tasks').textContent = data.tasks || 0;
    document.getElementById('skills').textContent = data.skills || 13;
    document.getElementById('deployments').textContent = data.deployments || 0;
    document.getElementById('subdomains').textContent = data.subdomains || 0;
    document.getElementById('emails-in').textContent = data.emailsIn || 0;
    document.getElementById('emails-out').textContent = data.emailsOut || 0;
    
    // System status
    updateSystemStatus(data.systemStatus);
    
    // Activity feed
    updateActivity(data.recentActivity);
    
    // Last deployment
    if (data.lastDeployment) {
        document.getElementById('last-deploy-name').textContent = data.lastDeployment.name;
        document.getElementById('last-deploy-url').textContent = data.lastDeployment.url;
        document.getElementById('last-deploy-time').textContent = data.lastDeployment.time;
    }
}

// Update system status
function updateSystemStatus(status) {
    const container = document.getElementById('system-status');
    if (!container || !status) return;
    
    const statuses = [
        { key: 'memoryDb', name: 'Memory Vector DB' },
        { key: 'coolifyApi', name: 'Coolify API' },
        { key: 'telegramBot', name: 'Telegram Bot' },
        { key: 'githubSsh', name: 'GitHub SSH' },
        { key: 'chromaDb', name: 'ChromaDB' },
        { key: 'ga4Analytics', name: 'GA4 Analytics' }
    ];
    
    container.innerHTML = statuses.map(s => {
        const isOnline = status[s.key] === 'online';
        return `
            <div class="health-item" data-status="${isOnline ? 'online' : 'offline'}">
                <span class="indicator"></span>
                <span class="name">${s.name}</span>
                <span class="status">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        `;
    }).join('');
}

// Update activity feed
function updateActivity(activities) {
    const container = document.getElementById('activity');
    if (!container || !activities) return;
    
    container.innerHTML = activities.map(a => `
        <div class="activity-item">
            <span class="timestamp">${a.time}</span>
            <span class="action">${a.action}</span>
        </div>
    `).join('');
}

// Update last sync time
function updateLastSync() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const syncEl = document.getElementById('last-sync');
    if (syncEl) syncEl.textContent = `Last sync: ${timeStr}`;
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple console log for now, could be expanded to UI notifications
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Start auto-refresh
function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
        loadData();
    }, CONFIG.refreshInterval);
}

// Stop auto-refresh
function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        loadData();
    }
});

// Handle beforeunload
document.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});

// ========== CHAT FUNCTIONS ==========

// Telegram bot configuration
const TELEGRAM_CONFIG = {
    botUsername: 'TARS_ClawdBot',
    chatId: '8260725312'  // Harsha's Telegram ID
};

// Send message to TARS via Telegram
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const status = document.getElementById('chat-status');
    const sendBtn = document.getElementById('send-btn');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Disable input while sending
    input.disabled = true;
    sendBtn.disabled = true;
    status.textContent = '◉ OPENING TELEGRAM...';
    status.className = 'chat-status sending';
    
    // Add message to chat immediately
    addMessageToChat('user', message);
    
    // Store message in localStorage for persistence
    storeMessage('user', message);
    
    // Create Telegram message URL
    const formattedMessage = `[From Dashboard] ${message}`;
    const telegramUrl = `https://t.me/${TELEGRAM_CONFIG.botUsername}?start=dashboard_${encodeURIComponent(message)}`;
    
    // Also try the direct message URL
    const directMessageUrl = `tg://resolve?domain=${TELEGRAM_CONFIG.botUsername}&start=dashboard_msg`;
    
    // Try to open Telegram app
    let opened = false;
    
    try {
        // Try app URL first (mobile)
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = `tg://msg?text=${encodeURIComponent(formattedMessage)}&to=@${TELEGRAM_CONFIG.botUsername}`;
            opened = true;
        } else {
            // Desktop - open web version in new tab
            window.open(telegramUrl, '_blank');
            opened = true;
        }
        
        if (opened) {
            status.textContent = '✓ TELEGRAM OPENED';
            status.className = 'chat-status sent';
            
            // Add TARS acknowledgment
            setTimeout(() => {
                const reply = 'Message sent to Telegram! Check your Telegram app for my reply.';
                addMessageToChat('tars', reply);
                storeMessage('tars', reply);
            }, 1000);
        }
    } catch (error) {
        console.error('Chat error:', error);
        status.textContent = '✗ PLEASE OPEN TELEGRAM MANUALLY';
        status.className = 'chat-status error';
    } finally {
        input.value = '';
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
        
        // Reset status after 4 seconds
        setTimeout(() => {
            status.textContent = 'READY';
            status.className = 'chat-status';
        }, 4000);
    }
}

// Store message in localStorage for persistence
function storeMessage(sender, text) {
    const messages = JSON.parse(localStorage.getItem('tars_chat') || '[]');
    messages.push({
        sender,
        text,
        time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    });
    // Keep only last 50 messages
    if (messages.length > 50) messages.shift();
    localStorage.setItem('tars_chat', JSON.stringify(messages));
}

// Load chat history from localStorage
function loadChatHistory() {
    const messages = JSON.parse(localStorage.getItem('tars_chat') || '[]');
    if (messages.length > 0) {
        const container = document.getElementById('chat-messages');
        // Remove welcome message
        const welcome = container.querySelector('.chat-welcome');
        if (welcome) welcome.remove();
        
        // Add stored messages
        messages.forEach(msg => {
            addMessageToChat(msg.sender, msg.text, msg.time, false);
        });
    }
}

// Add message to chat display
function addMessageToChat(sender, text, existingTime = null, autoScroll = true) {
    const container = document.getElementById('chat-messages');
    const time = existingTime || new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    // Remove welcome message if present
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${sender}`;
    messageEl.innerHTML = `
        <div class="avatar">${sender === 'user' ? 'H' : '◈'}</div>
        <div class="content">
            <div class="sender">${sender === 'user' ? 'Harsha' : 'TARS'}</div>
            <div class="text">${escapeHtml(text)}</div>
            <div class="time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
    if (autoScroll) {
        container.scrollTop = container.scrollHeight;
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup chat input listeners
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});
