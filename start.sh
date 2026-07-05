#!/bin/bash
cd /root/TeleFolders
export TELEFOLDERS_API_ID="${TELEFOLDERS_API_ID:-your_api_id_here}"
export TELEFOLDERS_API_HASH="${TELEFOLDERS_API_HASH:-your_api_hash_here}"
export TELEFOLDERS_PROXY="${TELEFOLDERS_PROXY:-socks5://127.0.0.1:1080}"

# Single instance
LOCK="/tmp/telefolders.lock"
exec 200>"$LOCK"
flock -n 200 || { echo "[wrapper] another start.sh running, exiting"; exit 1; }

while true; do
    # Kill any existing telefolders on port 8000
    if PIDS=$(lsof -t -i:8000 2>/dev/null); then
        kill -9 $PIDS 2>/dev/null
        sleep 1
    fi
    
    # Start Eel in background, wait for it to exit
    .venv/bin/python -m telefolders --lang en --proxy "$TELEFOLDERS_PROXY" &
    EEL_PID=$!
    wait $EEL_PID
    
    echo "[wrapper] Eel exited with code $?. Restarting in 2s..."
    sleep 2
done
