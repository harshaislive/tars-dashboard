#!/usr/bin/env python3
"""
TARS Dashboard Chat API
Receives messages from dashboard and forwards to Telegram
"""
import json
import sys
from datetime import datetime
from pathlib import Path

# Add project path
sys.path.insert(0, '/root/clawd')

def forward_to_telegram(message_data):
    """Forward message to Telegram bot"""
    try:
        # Use the message tool to send to Telegram
        import os
        os.environ['TELEGRAM_BOT_TOKEN'] = '7892222891:AAHj8k2qA8z60NoHF_vfd1gM5n8x3zXJ1Xw'
        
        message_text = f"""📩 **Message from Dashboard**

👤 User: Harsha
💬 Message: {message_data['message']}
🕐 Time: {message_data['timestamp']}
📱 Source: {message_data.get('source', 'dashboard')}"""
        
        # Log to file for now (will be picked up by message system)
        log_file = Path('/root/clawd/dashboard_chat.log')
        with open(log_file, 'a') as f:
            f.write(f"[{datetime.now().isoformat()}] {json.dumps(message_data)}\n")
        
        return True
    except Exception as e:
        print(f"Error forwarding message: {e}", file=sys.stderr)
        return False

def handle_request():
    """Handle HTTP request"""
    import os
    
    # Get request method
    method = os.environ.get('REQUEST_METHOD', 'GET')
    
    if method == 'POST':
        # Read POST body
        content_length = int(os.environ.get('CONTENT_LENGTH', 0))
        if content_length > 0:
            post_data = sys.stdin.read(content_length)
            try:
                data = json.loads(post_data)
                
                # Validate
                if 'message' not in data or not data['message'].strip():
                    return {'status': 'error', 'message': 'No message provided'}
                
                # Forward to Telegram
                success = forward_to_telegram(data)
                
                if success:
                    return {'status': 'success', 'message': 'Message forwarded'}
                else:
                    return {'status': 'error', 'message': 'Failed to forward'}
                    
            except json.JSONDecodeError:
                return {'status': 'error', 'message': 'Invalid JSON'}
    
    elif method == 'GET':
        # Return recent messages
        log_file = Path('/root/clawd/dashboard_chat.log')
        messages = []
        if log_file.exists():
            lines = log_file.read_text().strip().split('\n')[-20:]  # Last 20
            for line in lines:
                try:
                    # Parse log line format: [timestamp] {json}
                    if ']' in line:
                        json_part = line.split(']', 1)[1].strip()
                        data = json.loads(json_part)
                        messages.append(data)
                except:
                    pass
        return {'status': 'success', 'messages': messages}
    
    return {'status': 'error', 'message': 'Method not allowed'}

if __name__ == '__main__':
    # CGI/HTTP response
    result = handle_request()
    
    # Output JSON response
    print("Content-Type: application/json")
    print()
    print(json.dumps(result))
