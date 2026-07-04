#!/bin/bash
cd /root/TeleFolders
export TELEFOLDERS_API_ID=611335
export TELEFOLDERS_API_HASH=d524b414d21f4d37f08684c1df41ac9c

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
    .venv/bin/python -m telefolders --lang en &
    EEL_PID=$!
    wait $EEL_PID
    
    echo "[wrapper] Eel exited with code $?. Restarting in 2s..."
    sleep 2
done
