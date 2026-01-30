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
        memories: 107,
        tasks: 0,
        emailsIn: 2,
        emailsOut: 1,
        skills: 16,
        subdomains: 12,
        deployments: 12,
        uptime: 760,
        systemStatus: {
            memoryDb: 'online',
            coolifyApi: 'online',
            telegramBot: 'online',
            githubSsh: 'online',
            chromaDb: 'online',
            ga4Analytics: 'online'
        },
        recentActivity: [
            { time: '17:46', action: 'Removed chat feature from dashboard' },
            { time: '17:45', action: 'Deployed updated dashboard to production' },
            { time: '17:35', action: 'Added chat bar to dashboard' },
            { time: '17:22', action: 'Deployed TARS E-ink Dashboard v1.0' },
            { time: '17:15', action: 'Created tars-dashboard GitHub repository' },
            { time: '17:05', action: 'Finalized coolify-deploy skill with 12 subdomains' }
        ],
        // Live Operations Data
        activeJobs: [
            { name: 'Memory Sync', status: 'RUNNING' },
            { name: 'Daily Traffic Report', status: 'SCHEDULED' },
            { name: 'Pulse Check', status: 'SCHEDULED' },
            { name: 'Hourly Touch-Base', status: 'SCHEDULED' }
        ],
        recentLogs: [
            { time: '17:46', type: 'success', message: 'Dashboard deployed successfully' },
            { time: '17:45', type: 'info', message: 'Git push: 6 files changed, 8 insertions(+)' },
            { time: '17:44', type: 'info', message: 'Build started: tars-dashboard' },
            { time: '17:40', type: 'success', message: 'Coolify deployment triggered' },
            { time: '17:35', type: 'success', message: 'Chat feature added' },
            { time: '17:30', type: 'info', message: 'Metrics collected: 107 memories' }
        ],
        recentMemories: [
            { time: '17:46', text: 'Removed chat feature from dashboard' },
            { time: '17:35', text: 'Chat bar added to dashboard' },
            { time: '17:22', text: 'Deployed TARS E-ink Dashboard' },
            { time: '17:15', text: 'Created dashboard repository' },
            { time: '17:05', text: 'Updated subdomain registry' }
        ],
        resources: [
            { name: 'Memory DB', percentage: 45 },
            { name: 'Disk Usage', percentage: 62 },
            { name: 'CPU Load', percentage: 23 }
        ],
        integrations: [
            { type: 'telegram', name: 'Telegram Bot', status: 'online', statusText: 'ACTIVE', lastActivity: '2s ago' },
            { type: 'gmail', name: 'Gmail API', status: 'online', statusText: 'ACTIVE', lastActivity: '1m ago' },
            { type: 'coolify', name: 'Coolify API', status: 'online', statusText: 'CONNECTED', lastActivity: 'Live' },
            { type: 'twitter', name: 'Twitter/X API', status: 'warning', statusText: 'LIMITED', lastActivity: 'Rate limit' }
        ],
        recentCommands: [
            { time: '17:46:12', command: 'git push origin main', status: 'success' },
            { time: '17:45:45', command: 'rm api/chat.py', status: 'success' },
            { time: '17:44:30', command: 'coolify-deploy deploy tars-dashboard', status: 'success' },
            { time: '17:35:18', command: 'python3 collect-metrics.py', status: 'success' },
            { time: '17:30:05', command: 'git commit -m "Add chat bar"', status: 'success' }
        ],
        lastDeployment: {
            name: 'tars-dashboard',
            url: 'tars-dashboard.devsharsha.live',
            time: '17:46'
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
    
    // Operations
    updateOperations(data);
    
    // Integrations
    updateIntegrations(data.integrations);
    
    // Commands
    updateCommands(data.recentCommands);
    
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

// Update operations section
function updateOperations(data) {
    // Active Jobs
    const jobsContainer = document.getElementById('active-jobs');
    if (jobsContainer && data.activeJobs) {
        jobsContainer.innerHTML = data.activeJobs.map(job => `
            <div class="ops-item">
                <span class="ops-name">${job.name}</span>
                <span class="ops-status ${job.status.toLowerCase()}">${job.status}</span>
            </div>
        `).join('');
    }
    
    // Recent Logs
    const logsContainer = document.getElementById('recent-logs');
    if (logsContainer && data.recentLogs) {
        logsContainer.innerHTML = data.recentLogs.map(log => `
            <div class="log-entry ${log.type}">
                <span class="log-time">${log.time}</span>
                <span class="log-msg">${log.message}</span>
            </div>
        `).join('');
    }
    
    // Recent Memories
    const memContainer = document.getElementById('recent-memories');
    if (memContainer && data.recentMemories) {
        memContainer.innerHTML = data.recentMemories.map(mem => `
            <div class="memory-item">
                <span class="mem-time">${mem.time}</span>
                <span class="mem-text" title="${mem.text}">${mem.text}</span>
            </div>
        `).join('');
    }
    
    // System Resources
    const resContainer = document.getElementById('system-resources');
    if (resContainer && data.resources) {
        resContainer.innerHTML = data.resources.map(res => `
            <div class="resource-item">
                <span class="res-label">${res.name}</span>
                <div class="res-bar"><div class="res-fill" style="width: ${res.percentage}%"></div></div>
                <span class="res-value">${res.percentage}%</span>
            </div>
        `).join('');
    }
}

// Update integrations/webhooks
function updateIntegrations(integrations) {
    const container = document.getElementById('integration-status');
    if (!container || !integrations) return;
    
    const icons = {
        telegram: '📱',
        gmail: '📧',
        coolify: '📊',
        twitter: '🐦',
        github: '⚡',
        pipedrive: '💼'
    };
    
    container.innerHTML = integrations.map(int => `
        <div class="webhook-item ${int.status}">
            <span class="wh-icon">${icons[int.type] || '◈'}</span>
            <span class="wh-name">${int.name}</span>
            <span class="wh-status">${int.statusText}</span>
            <span class="wh-last">${int.lastActivity}</span>
        </div>
    `).join('');
}

// Update recent commands
function updateCommands(commands) {
    const container = document.getElementById('recent-commands');
    if (!container || !commands) return;
    
    container.innerHTML = commands.map(cmd => `
        <div class="command-item">
            <span class="cmd-time">${cmd.time}</span>
            <code class="cmd-code">${cmd.command}</code>
            <span class="cmd-status ${cmd.status}">${cmd.status === 'success' ? '✓' : '✗'}</span>
        </div>
    `).join('');
}

// Handle beforeunload
document.addEventListener('beforeunload', () => {
    stopAutoRefresh();
});
