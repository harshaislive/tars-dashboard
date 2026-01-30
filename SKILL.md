---
name: tars-dashboard
description: E-ink optimized dashboard for monitoring TARS status, memories, tasks, and system health. Password protected with real-time metrics.
version: 1.0.0
metadata:
  clawdbot:
    emoji: 📊
    requires:
      env:
        - DASHBOARD_PASSWORD
      commands:
        - python3
        - cron (for auto-updates)
---

# TARS E-Ink Dashboard

A minimalist, high-contrast dashboard designed for e-ink displays. Shows TARS status, memory count, tasks, emails, and recent activity.

## Features

- 🎨 **E-ink optimized** - Grayscale, high contrast, no animations
- 🔒 **Password protected** - Secure access
- 📊 **Real-time metrics** - Memories, tasks, email counts
- 🔴 **System status** - Online/offline indicators
- 📝 **Activity log** - Recent actions
- 🔄 **Auto-refresh** - Every 5 minutes + manual button
- 👤 **Premium TARS avatar** - Detailed bot character design
- 💬 **Chat bar** - Message TARS directly from dashboard

## Access

**URL:** https://tars-dashboard.devsharsha.live

**Password:** `harsha_tars`

## Metrics Displayed

| Metric | Source |
|--------|--------|
| **Memories** | ChromaDB vector store count |
| **Tasks** | Active tasks from task-tracker |
| **Emails In** | AgentMail inbox count |
| **Emails Out** | AgentMail sent count |
| **System Status** | Memory DB, Coolify, Telegram, GitHub |
| **Activity** | Recent actions from memory logs |

## Auto-Update

Metrics update every 5 minutes automatically. Run the collector script:

```bash
# Manual update
python3 /root/clawd/tars-dashboard/api/collect-metrics.py

# Setup cron for auto-updates
echo "*/5 * * * * /usr/bin/python3 /root/clawd/tars-dashboard/api/collect-metrics.py" | crontab -
```

## Files

```
tars-dashboard/
├── index.html          # Main dashboard
├── css/
│   └── eink.css       # E-ink optimized styles
├── js/
│   └── dashboard.js   # Frontend logic
├── api/
│   └── collect-metrics.py  # Backend data collector
└── SKILL.md           # This file
```

## E-Ink Display Tips

1. **Use high contrast mode** - Black on white
2. **Refresh every 5 minutes** - Balances updates with battery
3. **Manual refresh available** - For instant updates
4. **No animations** - E-ink friendly
5. **Large fonts** - Easily readable

## Password

Default password is set via JavaScript constant. To change:

```javascript
// js/dashboard.js
const CONFIG = {
    password: 'your_new_password',
    // ...
};
```

Then redeploy.

## Updates

To update the dashboard:
1. Edit files locally
2. Push to GitHub
3. Coolify auto-deploys
4. Refresh dashboard

## Troubleshooting

**Metrics not updating:**
- Check `api/status.json` exists
- Run `collect-metrics.py` manually
- Check cron job is active

**Password not working:**
- Clear browser cache
- Check `CONFIG.password` in JS
- Try incognito mode

**Display issues on e-ink:**
- Enable high contrast mode
- Increase font size in CSS
- Disable browser zoom
