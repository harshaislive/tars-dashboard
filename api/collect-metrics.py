#!/usr/bin/env python3
"""
TARS Dashboard API - Collects metrics for E-ink dashboard
Run this periodically to generate status.json
"""
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, '/root/clawd')

def get_memory_count():
    """Get total memories from vector DB"""
    try:
        from simple_memory import count_memories
        return count_memories()
    except:
        return 0

def get_active_tasks():
    """Get active tasks from task-tracker"""
    try:
        result = subprocess.run(
            ['python3', '/root/clawd/skills/task-tracker/scripts/tasks.py', 'list'],
            capture_output=True, text=True, timeout=10
        )
        # Count non-done tasks
        lines = result.stdout.strip().split('\n')
        active = [l for l in lines if '[ ]' in l or '[>]' in l]
        return len(active)
    except:
        return 0

def get_email_counts():
    """Get email counts from AgentMail"""
    try:
        # Read from inbox log
        log_file = Path('/root/clawd/memory/agentmail_inbox.log')
        if log_file.exists():
            content = log_file.read_text()
            # Simple parsing - count "received" mentions
            received = content.lower().count('received')
            return {'in': received, 'out': 0}
        return {'in': 0, 'out': 0}
    except:
        return {'in': 0, 'out': 0}

def check_system_status():
    """Check system components"""
    status = {
        'memoryDb': 'online',
        'coolifyApi': 'online',
        'telegramBot': 'online',
        'githubSsh': 'online'
    }
    
    # Check memory DB
    try:
        from simple_memory import count_memories
        count_memories()
    except:
        status['memoryDb'] = 'offline'
    
    # Check Coolify API
    try:
        result = subprocess.run(
            ['curl', '-s', '-H', 'Authorization: Bearer 1|fRgKbVdtdwhHWAdEzypXAH9lPZ4cT50ECEQXODv1b990ac9a',
             'https://admin.devsharsha.live/api/v1/projects'],
            capture_output=True, timeout=10
        )
        if result.returncode != 0:
            status['coolifyApi'] = 'offline'
    except:
        status['coolifyApi'] = 'offline'
    
    return status

def get_recent_activity():
    """Get recent activity from memory logs"""
    try:
        # Read today's memory file
        today = datetime.now().strftime('%Y-%m-%d')
        memory_file = Path(f'/root/clawd/memory/{today}.md')
        
        if memory_file.exists():
            content = memory_file.read_text()
            # Extract recent actions (simple heuristic)
            lines = content.split('\n')
            activities = []
            
            for line in lines:
                if line.startswith('- ') or line.startswith('###'):
                    clean = line.replace('- ', '').replace('### ', '').strip()
                    if len(clean) > 10 and len(activities) < 5:
                        time = datetime.now().strftime('%H:%M')
                        activities.append({'time': time, 'action': clean[:60]})
            
            return activities[:5]
    except:
        pass
    
    # Fallback
    return [
        {'time': datetime.now().strftime('%H:%M'), 'action': 'Dashboard initialized'},
    ]

def generate_status():
    """Generate complete status JSON"""
    data = {
        'timestamp': datetime.now().isoformat(),
        'memories': get_memory_count(),
        'tasks': get_active_tasks(),
        'emailsIn': get_email_counts()['in'],
        'emailsOut': get_email_counts()['out'],
        'systemStatus': check_system_status(),
        'recentActivity': get_recent_activity()
    }
    return data

def save_status(data, output_path):
    """Save status to JSON file"""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✅ Status saved to {output_path}")

if __name__ == '__main__':
    # Default output path
    output = sys.argv[1] if len(sys.argv) > 1 else '/root/clawd/tars-dashboard/api/status.json'
    
    print("🔄 Collecting TARS metrics...")
    data = generate_status()
    save_status(data, output)
    
    # Print summary
    print(f"\n📊 Dashboard Stats:")
    print(f"   Memories: {data['memories']}")
    print(f"   Tasks: {data['tasks']}")
    print(f"   Emails In: {data['emailsIn']}")
    print(f"   System: {sum(1 for s in data['systemStatus'].values() if s == 'online')}/{len(data['systemStatus'])} online")
