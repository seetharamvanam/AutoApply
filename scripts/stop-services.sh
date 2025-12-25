#!/bin/bash

# Script to stop all AutoApply services gracefully
# Usage: ./scripts/stop-services.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🛑 Stopping AutoApply Services..."
echo ""

# Function to stop a process gracefully
stop_process() {
    local pid=$1
    if ps -p $pid > /dev/null 2>&1; then
        echo "  Stopping process $pid..."
        # Try graceful shutdown first (SIGTERM)
        kill -TERM $pid 2>/dev/null || true
        sleep 2
        # If still running, force kill
        if ps -p $pid > /dev/null 2>&1; then
            echo "    Force killing process $pid..."
            kill -KILL $pid 2>/dev/null || true
        fi
        return 0
    else
        echo "  Process $pid not found (may have already stopped)"
        return 1
    fi
}

stopped_count=0
failed_count=0

# Stop Java processes (services)
if [ -f .pids ]; then
    echo "Stopping Java processes..."
    while read pid; do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            if stop_process $pid; then
                stopped_count=$((stopped_count + 1))
            else
                failed_count=$((failed_count + 1))
            fi
        fi
    done < .pids
    rm -f .pids
fi

# Stop Gradle processes
if [ -f .gradle_pids ]; then
    echo "Stopping Gradle processes..."
    while read pid; do
        if [ -n "$pid" ] && [ "$pid" != "0" ]; then
            if stop_process $pid; then
                stopped_count=$((stopped_count + 1))
            else
                failed_count=$((failed_count + 1))
            fi
        fi
    done < .gradle_pids
    rm -f .gradle_pids
fi

# Fallback: Try to find and stop processes by port
if [ ! -f .pids ] && [ ! -f .gradle_pids ]; then
    echo "No PID files found. Searching for processes by port..."
    ports=(8080 8081 8082 8083 8084 8085)
    found=false
    
    for port in "${ports[@]}"; do
        if command -v lsof > /dev/null 2>&1; then
            pids=$(lsof -ti :$port 2>/dev/null || true)
        elif command -v netstat > /dev/null 2>&1; then
            pids=$(netstat -tlnp 2>/dev/null | grep ":$port" | awk '{print $7}' | cut -d'/' -f1 | sort -u || true)
        else
            pids=""
        fi
        
        if [ -n "$pids" ]; then
            for pid in $pids; do
                if ps -p $pid > /dev/null 2>&1; then
                    process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "unknown")
                    if [[ "$process_name" == *"java"* ]]; then
                        echo "  Found Java process on port $port (PID: $pid)"
                        if stop_process $pid; then
                            stopped_count=$((stopped_count + 1))
                            found=true
                        fi
                    fi
                fi
            done
        fi
    done
    
    if [ "$found" = false ]; then
        echo "  No running services found on ports 8080-8085"
    fi
fi

echo ""
if [ $stopped_count -gt 0 ]; then
    echo "✅ Stopped $stopped_count process(es)"
fi
if [ $failed_count -gt 0 ]; then
    echo "⚠️  $failed_count process(es) were not running"
fi
if [ $stopped_count -eq 0 ] && [ $failed_count -eq 0 ]; then
    echo "ℹ️  No services were running"
fi
echo ""

