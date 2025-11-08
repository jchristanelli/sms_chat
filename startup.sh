#!/bin/bash

# ANSI Color and Format Codes
BOLD='\033[1m'
ITALIC='\033[3m'
RESET='\033[0m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${RED}${BOLD}Shutting down...${RESET}"
    docker compose stop
    exit 0
}

# Function to open URL in browser
open_browser() {
    local url=$1
    if command -v xdg-open > /dev/null; then
        xdg-open "$url" &> /dev/null &
    elif command -v open > /dev/null; then
        open "$url" &> /dev/null &
    elif command -v start > /dev/null; then
        start "$url" &> /dev/null &
    else
        echo "Could not detect browser. Please open: $url"
    fi
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT SIGTERM

# Start docker compose
echo -e "${GREEN}${BOLD}${ITALIC}Starting Docker containers...${RESET}"
docker compose up -d

# Wait for initial startup
echo -e "${GREEN}${BOLD}${ITALIC}Waiting for services to start...${RESET}"
sleep 5

# Check if API is responding
echo -e "${YELLOW}${BOLD}${ITALIC}Checking if API is ready...${RESET}"
RETRY_COUNT=0
MAX_RETRIES=30

until curl -s http://localhost:8080/api/health > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}${BOLD}ERROR: API did not start after 60 seconds${RESET}"
        echo "Check logs with: docker compose logs api"
        cleanup
    fi
    
    echo -e "${YELLOW}${BOLD}${ITALIC}Waiting for API... (attempt $RETRY_COUNT/$MAX_RETRIES)${RESET}"
    sleep 2
done

echo ""
echo -e "${GREEN}${BOLD}✓ API is ready!${RESET}"
echo ""

# Open websites
echo -e "${GREEN}${BOLD}${ITALIC}Opening chat interface...${RESET}"
open_browser "http://localhost:3000"
sleep 1
echo ""
echo -e "${GREEN}${BOLD}${ITALIC}Starting instatunnel...${RESET}"
echo ""

# Run instatunnel in the background
npx instatunnel connect 8080 --subdomain sms-chat &
TUNNEL_PID=$!

# Wait for tunnel to be established (check every 2 seconds)
echo -e "${YELLOW}Waiting for tunnel to connect...${RESET}"
sleep 5  # Give it a few seconds to start

# Check if tunnel is working
TUNNEL_RETRY=0
until curl -s https://sms-chat.instatunnel.my/api/health > /dev/null 2>&1; do
    TUNNEL_RETRY=$((TUNNEL_RETRY + 1))
    
    if [ $TUNNEL_RETRY -ge 15 ]; then
        echo -e "${RED}Tunnel did not connect after 30 seconds${RESET}"
        break
    fi
    
    echo -e "${ITALIC}Waiting for tunnel... (attempt $TUNNEL_RETRY/15)${RESET}"
    sleep 2
done

echo ""
echo -e "${GREEN}${BOLD}✓ Tunnel is connected!${RESET}"
echo ""

# Now open the URL
echo -e "${GREEN}${BOLD}${ITALIC}Opening internal api health page...${RESET}"
open_browser "http://localhost:8080/api/health-ui"
sleep 1
echo -e "${GREEN}${BOLD}${ITALIC}Opening public api health page (demonstrating public exposure for twilio webhook)...${RESET}"
open_browser "https://sms-chat.instatunnel.my/api/health-ui"

echo ""
echo -e "${YELLOW}${BOLD}Press Ctrl+C to stop everything${RESET}"
echo ""

# Wait for Ctrl+C (this will block until user interrupts)
wait $TUNNEL_PID

