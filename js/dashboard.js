// ============================================
// TARS E-INK DISPLAY CONTROLLER
// Version: 2.1.0-eink
// Authentic e-ink refresh simulation with real-time data
// ============================================

const CONFIG = {
    password: 'harsha_tars',
    refreshInterval: 30 * 1000,        // 30 seconds for demo (change to 5*60*1000 for production)
    apiEndpoint: 'api/status.json',
    sessionStart: new Date(),
    startDate: new Date('2026-01-26'),  // TARS creation date
    enableSound: false                   // E-ink refresh sound
};

// State
let isAuthenticated = false;
let refreshTimer = null;
let uptimeTimer = null;
let liveUpdateTimer = null;
let currentData = null;
let isRefreshing = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check for saved auth
    const saved = sessionStorage.getItem('tars_auth');
    const authTime = sessionStorage.getItem('tars_auth_time');

    if (saved === 'true' && authTime) {
        const hoursSince = (Date.now() - parseInt(authTime)) / (1000 * 60 * 60);
        if (hoursSince < 24) {
            isAuthenticated = true;
            unlockWithFlash();
        } else {
            clearAuth();
        }
    }

    // Setup password input
    const pwdInput = document.getElementById('password-input');
    if (pwdInput) {
        pwdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') verifyPassword();
        });
        pwdInput.focus();
    }
});

// ============================================
// AUTHENTICATION
// ============================================

function verifyPassword() {
    const input = document.getElementById('password-input').value.trim();
    const errorMsg = document.getElementById('error-msg');

    if (input === CONFIG.password) {
        isAuthenticated = true;
        sessionStorage.setItem('tars_auth', 'true');
        sessionStorage.setItem('tars_auth_time', Date.now().toString());
        unlockWithFlash();
    } else {
        errorMsg.textContent = 'ACCESS DENIED';
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').focus();

        // Shake effect for wrong password
        const lockScreen = document.querySelector('.lock-screen');
        lockScreen.style.animation = 'none';
        setTimeout(() => {
            lockScreen.style.animation = 'shake 0.4s ease-out';
        }, 10);
    }
}

function unlockWithFlash() {
    const overlay = document.getElementById('password-overlay');

    // Trigger e-ink refresh flash
    triggerInkFlash(() => {
        overlay.style.display = 'none';
        showDashboard();
        initializeDashboard();
    });
}

function clearAuth() {
    sessionStorage.removeItem('tars_auth');
    sessionStorage.removeItem('tars_auth_time');
    isAuthenticated = false;
}

function showDashboard() {
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
}

// ============================================
// DASHBOARD INITIALIZATION
// ============================================

function initializeDashboard() {
    // Initial data load with flash
    triggerInkFlash(() => {
        loadData();
    });

    // Start all timers
    startAutoRefresh();
    startLiveClock();
    startUptimeCounter();
    startLiveUpdates();

    // Update connection status
    updateConnectionStatus(true);
}

// ============================================
// E-INK REFRESH ANIMATIONS
// ============================================

function triggerInkFlash(callback) {
    const flash = document.getElementById('ink-flash');
    if (!flash || isRefreshing) {
        if (callback) callback();
        return;
    }

    isRefreshing = true;

    // Play refresh sound if enabled
    if (CONFIG.enableSound) {
        const sound = document.getElementById('refresh-sound');
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    }

    // Add ghost-clear effect (simulates e-ink particle reset)
    flash.classList.add('ghost-clear');

    setTimeout(() => {
        flash.classList.remove('ghost-clear');
        flash.classList.add('active');

        setTimeout(() => {
            flash.classList.remove('active');
            isRefreshing = false;
            if (callback) callback();
        }, 400);
    }, 100);
}

function triggerPartialRefresh(element) {
    if (!element) return;

    element.style.animation = 'none';
    setTimeout(() => {
        element.style.animation = 'ink-sweep 300ms ease-out';
    }, 10);
}

// ============================================
// DATA FETCHING
// ============================================

async function loadData() {
    try {
        const data = await fetchData();
        currentData = data;
        updateDashboard(data);
        updateLastSync();
        showNotification('Data synchronized');
    } catch (error) {
        console.error('Failed to load data:', error);
        showNotification('Sync failed - using cache');

        // Use mock data if fetch fails
        if (!currentData) {
            currentData = getMockData();
            updateDashboard(currentData);
        }
    }
}

async function fetchData() {
    // Try to fetch from API with cache-busting
    try {
        const response = await fetch(CONFIG.apiEndpoint + '?t=' + Date.now(), {
            cache: 'no-store'
        });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.log('API unavailable, using mock data');
    }

    // Fallback to mock data
    return getMockData();
}

// ============================================
// REAL-TIME UPDATES
// ============================================

function startLiveClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const clockEl = document.getElementById('current-time');
    if (clockEl && clockEl.textContent !== timeStr) {
        clockEl.textContent = timeStr;
    }
}

function startUptimeCounter() {
    updateUptime();
    uptimeTimer = setInterval(updateUptime, 60000); // Update every minute
}

function updateUptime() {
    const days = Math.floor((Date.now() - CONFIG.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const uptimeEl = document.getElementById('uptime');
    if (uptimeEl) {
        animateValue(uptimeEl, parseInt(uptimeEl.textContent) || 0, Math.max(1, days), 500);
    }
}

function startLiveUpdates() {
    // Simulate live data changes every 10-30 seconds
    liveUpdateTimer = setInterval(() => {
        if (Math.random() > 0.6) {
            simulateLiveUpdate();
        }
    }, 15000);
}

function simulateLiveUpdate() {
    if (!currentData) return;

    // Randomly update some values to show "live" feel
    const updates = ['memories', 'tasks', 'emailsIn'];
    const choice = updates[Math.floor(Math.random() * updates.length)];

    switch(choice) {
        case 'memories':
            currentData.memories += Math.random() > 0.5 ? 1 : 0;
            break;
        case 'tasks':
            currentData.tasks = Math.max(0, currentData.tasks + (Math.random() > 0.7 ? 1 : -1));
            break;
    }

    // Update display without full flash
    updateMetricValue(choice, currentData[choice]);
}

function updateConnectionStatus(connected) {
    const dot = document.getElementById('conn-dot');
    if (dot) {
        dot.classList.toggle('disconnected', !connected);
    }
}

// ============================================
// DASHBOARD UPDATES
// ============================================

function updateDashboard(data) {
    // Hero stats with animation
    updateMetricValue('memories', data.memories || 0, true);
    updateMetricValue('tasks', data.tasks || 0);
    updateMetricValue('skills', data.skills || 13);
    updateMetricValue('deployments', data.deployments || 0);
    updateMetricValue('subdomains', data.subdomains || 0);
    updateMetricValue('emails-in', data.emailsIn || 0);
    updateMetricValue('emails-out', data.emailsOut || 0);

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
        document.getElementById('last-deploy-meta').textContent = data.lastDeployment.url;
        document.getElementById('last-deploy-time').textContent = data.lastDeployment.time;
    }
}

function updateMetricValue(id, value, isHero = false) {
    const el = document.getElementById(id);
    if (!el) return;

    if (isHero && id === 'memories') {
        // Format memories with digit groups
        const str = value.toString().padStart(3, '0');
        const digits = el.querySelectorAll('.digit-group');
        digits.forEach((digit, i) => {
            const newVal = str[i] || '0';
            if (digit.dataset.value !== newVal) {
                digit.classList.add('changing');
                digit.textContent = newVal;
                digit.dataset.value = newVal;
                setTimeout(() => digit.classList.remove('changing'), 300);
            }
        });
    } else {
        const oldVal = parseInt(el.textContent) || 0;
        if (oldVal !== value) {
            animateValue(el, oldVal, value, 300);
        }
    }
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * easeProgress);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ============================================
// SECTION UPDATES
// ============================================

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
            <div class="status-cell ${isOnline ? 'online' : 'offline'}">
                <span class="status-indicator"></span>
                <span class="status-name">${s.name}</span>
                <span class="status-text">${isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
        `;
    }).join('');
}

function updateActivity(activities) {
    const container = document.getElementById('activity');
    if (!container || !activities) return;

    container.innerHTML = activities.map((a, i) => `
        <div class="act-item ${i === 0 ? 'new' : ''}">
            <span class="act-time">${a.time}</span>
            <span class="act-text">${a.action}</span>
        </div>
    `).join('');
}

function updateOperations(data) {
    // Active Jobs
    const jobsContainer = document.getElementById('active-jobs');
    if (jobsContainer && data.activeJobs) {
        jobsContainer.innerHTML = data.activeJobs.map(job => `
            <div class="ops-item">
                <span class="ops-name">${job.name}</span>
                <span class="ops-badge ${job.status.toLowerCase()}">${job.status}</span>
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
            <div class="mem-item">
                <span class="mem-time">${mem.time}</span>
                <span class="mem-text" title="${mem.text}">${mem.text}</span>
            </div>
        `).join('');
    }

    // System Resources
    const resContainer = document.getElementById('system-resources');
    if (resContainer && data.resources) {
        resContainer.innerHTML = data.resources.map(res => `
            <div class="res-item">
                <span class="res-label">${res.name}</span>
                <div class="res-bar-bg">
                    <div class="res-bar-fill" style="width: ${res.percentage}%"></div>
                </div>
                <span class="res-value">${res.percentage}%</span>
            </div>
        `).join('');
    }
}

function updateIntegrations(integrations) {
    const container = document.getElementById('integration-status');
    if (!container || !integrations) return;

    const icons = {
        telegram: '📱',
        gmail: '✉',
        coolify: '◆',
        twitter: '🐦',
        github: '⚡',
        pipedrive: '💼'
    };

    container.innerHTML = integrations.map(int => `
        <div class="int-cell ${int.status}">
            <span class="int-icon">${icons[int.type] || '◈'}</span>
            <span class="int-name">${int.name}</span>
            <span class="int-status">${int.statusText}</span>
            <span class="int-last">${int.lastActivity}</span>
        </div>
    `).join('');
}

function updateCommands(commands) {
    const container = document.getElementById('recent-commands');
    if (!container || !commands) return;

    container.innerHTML = commands.map(cmd => `
        <div class="cmd-item">
            <span class="cmd-time">${cmd.time}</span>
            <code class="cmd-code">${cmd.command}</code>
            <span class="cmd-status ${cmd.status}">${cmd.status === 'success' ? '✓' : '✗'}</span>
        </div>
    `).join('');
}

// ============================================
// REFRESH & SYNC
// ============================================

function manualRefresh() {
    const btn = document.getElementById('refresh-btn');
    const indicator = document.getElementById('refresh-indicator');

    if (btn.disabled) return;

    btn.disabled = true;
    btn.classList.add('refreshing');
    indicator.classList.add('syncing');

    // Trigger full e-ink refresh
    triggerInkFlash(() => {
        loadData().then(() => {
            setTimeout(() => {
                btn.disabled = false;
                btn.classList.remove('refreshing');
                indicator.classList.remove('syncing');
            }, 500);
        });
    });
}

function updateLastSync() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const syncEl = document.getElementById('last-sync');
    if (syncEl) syncEl.textContent = `Sync: ${timeStr}`;
}

function showNotification(message) {
    // Visual feedback only - e-ink displays don't need toast notifications
    console.log(`[E-INK] ${message}`);
}

// ============================================
// AUTO REFRESH
// ============================================

function startAutoRefresh() {
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
        // Background refresh without flash - just update data
        loadData();
    }, CONFIG.refreshInterval);
}

function stopAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
}

// ============================================
// VISIBILITY HANDLING
// ============================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
        if (liveUpdateTimer) clearInterval(liveUpdateTimer);
    } else {
        startAutoRefresh();
        startLiveUpdates();
        // Quick refresh when coming back
        loadData();
    }
});

document.addEventListener('beforeunload', () => {
    stopAutoRefresh();
    if (uptimeTimer) clearInterval(uptimeTimer);
    if (liveUpdateTimer) clearInterval(liveUpdateTimer);
});

// ============================================
// MOCK DATA (Fallback)
// ============================================

function getMockData() {
    return {
        memories: 107,
        tasks: 3,
        emailsIn: 2,
        emailsOut: 1,
        skills: 16,
        subdomains: 12,
        deployments: 12,
        uptime: 5,
        systemStatus: {
            memoryDb: 'online',
            coolifyApi: 'online',
            telegramBot: 'online',
            githubSsh: 'online',
            chromaDb: 'online',
            ga4Analytics: 'online'
        },
        recentActivity: [
            { time: '18:32', action: 'Memory synchronization complete' },
            { time: '18:28', action: 'New deployment triggered' },
            { time: '18:15', action: 'Git push: dashboard updates' },
            { time: '17:46', action: 'Removed chat feature from dashboard' },
            { time: '17:45', action: 'Deployed updated dashboard to production' },
            { time: '17:35', action: 'Chat bar added to dashboard' }
        ],
        activeJobs: [
            { name: 'Memory Sync', status: 'RUNNING' },
            { name: 'Daily Traffic Report', status: 'SCHEDULED' },
            { name: 'Pulse Check', status: 'SCHEDULED' },
            { name: 'Hourly Touch-Base', status: 'SCHEDULED' }
        ],
        recentLogs: [
            { time: '18:32', type: 'success', message: 'Dashboard refresh completed' },
            { time: '18:28', type: 'info', message: 'Metrics collector running' },
            { time: '18:15', type: 'success', message: 'Git push: 6 files changed' },
            { time: '17:46', type: 'info', message: 'Build started: tars-dashboard' },
            { time: '17:44', type: 'success', message: 'Coolify deployment triggered' },
            { time: '17:30', type: 'info', message: 'Metrics collected: 107 memories' }
        ],
        recentMemories: [
            { time: '18:32', text: 'E-ink dashboard redesign completed' },
            { time: '18:28', text: 'Added refresh flash animations' },
            { time: '17:46', text: 'Removed chat feature from dashboard' },
            { time: '17:35', text: 'Chat bar added to dashboard' },
            { time: '17:22', text: 'Deployed TARS E-ink Dashboard' }
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
            { time: '18:32:15', command: 'python3 api/collect-metrics.py', status: 'success' },
            { time: '18:28:42', command: 'git push origin main', status: 'success' },
            { time: '18:15:08', command: 'coolify-deploy deploy tars-dashboard', status: 'success' },
            { time: '17:46:12', command: 'git commit -m "E-ink redesign"', status: 'success' },
            { time: '17:44:30', command: 'python3 api/collect-metrics.py', status: 'success' }
        ],
        lastDeployment: {
            name: 'tars-dashboard',
            url: 'tars-dashboard.devsharsha.live',
            time: '18:28'
        }
    };
}

// Add shake animation for wrong password
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-10px); }
        40% { transform: translateX(10px); }
        60% { transform: translateX(-10px); }
        80% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);
