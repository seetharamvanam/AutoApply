#!/bin/bash

# Script to start the unified AutoApply service
# Usage: ./scripts/start-services.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Starting AutoApply Unified Service..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to check if port is available
check_port() {
    local port=$1
    if command -v lsof > /dev/null 2>&1; then
        lsof -i :$port > /dev/null 2>&1
    elif command -v netstat > /dev/null 2>&1; then
        netstat -an | grep -q ":$port.*LISTEN"
    else
        timeout 1 bash -c "echo > /dev/tcp/localhost/$port" 2>/dev/null
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=60
    local attempt=0
    
    echo -n "  Waiting for $service_name to be ready"
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "http://localhost:$port/actuator/health" > /dev/null 2>&1; then
            echo ""
            echo -e "  ${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -n "."
        fi
        sleep 1
    done
    echo ""
    echo -e "  ${RED}❌ $service_name failed to start within ${max_attempts} seconds${NC}"
    return 1
}

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create it from .env.example${NC}"
    exit 1
fi

# Check for Gradle wrapper
if [ ! -f "backend/gradlew" ]; then
    echo -e "${RED}❌ Gradle wrapper not found. Please run: cd backend && gradle wrapper${NC}"
    exit 1
fi

chmod +x backend/gradlew

# Load environment variables from .env
set -a
source .env
set +a
echo -e "${GREEN}✅ Environment variables loaded from .env${NC}"

# Create logs directory
mkdir -p logs

# Check if port is available
echo -e "${BLUE}Checking port 8080...${NC}"
if check_port 8080; then
    echo -e "  ${RED}❌ Port 8080 is already in use${NC}"
    echo "  Run: ./scripts/stop-services.sh"
    exit 1
fi

echo -e "${GREEN}✅ Port 8080 is available${NC}"
echo ""

# Start unified service
echo -e "${BLUE}Starting Unified Service (port 8080)...${NC}"

cd backend
nohup ./gradlew :unified-service:bootRun > "../logs/unified-service.log" 2>&1 &
GRADLE_PID=$!
cd ..

# Wait a moment for the process to start
sleep 3

# Find the actual Java process PID
JAVA_PID=""
MAX_WAIT=10
WAIT_COUNT=0

while [ -z "$JAVA_PID" ] && [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if command -v lsof > /dev/null 2>&1; then
        JAVA_PID=$(lsof -ti :8080 2>/dev/null | head -1)
    elif command -v netstat > /dev/null 2>&1; then
        JAVA_PID=$(netstat -tlnp 2>/dev/null | grep ":8080" | awk '{print $7}' | cut -d'/' -f1 | head -1)
    fi
    if [ -z "$JAVA_PID" ]; then
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
    fi
done

# Fallback: use gradle PID if we can't find Java PID
if [ -z "$JAVA_PID" ]; then
    JAVA_PID=$GRADLE_PID
fi

echo "  Gradle PID: $GRADLE_PID, Java PID: $JAVA_PID"

# Save PIDs to file
echo "$JAVA_PID" > .pids
echo "$GRADLE_PID" > .gradle_pids

# Wait for service to be ready
if wait_for_service 8080 "Unified Service"; then
    echo ""
    echo -e "${GREEN}✅ Unified Service started successfully!${NC}"
    echo ""
    echo "Service Status:"
    echo "  Unified Service:  http://localhost:8080"
    echo ""
    echo "API Endpoints:"
    echo "  Auth:            http://localhost:8080/api/auth/**"
    echo "  Profile:          http://localhost:8080/api/profile/**"
    echo "  Job Parser:       http://localhost:8080/api/jobs/**"
    echo "  Resume Tailor:   http://localhost:8080/api/resumes/**"
    echo "  App Tracker:      http://localhost:8080/api/applications/**"
    echo ""
    echo "Logs are in the logs/ directory:"
    echo "  - logs/unified-service.log"
    echo ""
    echo "To stop the service, run: ./scripts/stop-services.sh"
    echo "To view logs: tail -f logs/unified-service.log"
else
    echo -e "${RED}❌ Failed to start Unified Service. Check logs/unified-service.log${NC}"
    exit 1
fi
