#!/bin/bash

#===============================================================================
# RAILWAY AGENT SETUP & RUN
# One command to rule them all
#
# Usage: ./railway-agent.sh
#
# This script:
#   1. Installs Railway CLI if needed
#   2. Prompts for login if needed
#   3. Links to project if needed
#   4. Runs the self-healing loop
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                      RAILWAY AGENT SETUP                                 ║"
echo "║                                                                          ║"
echo "║   Autonomous diagnostic and repair system for Railway deployments       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

#===============================================================================
# Step 1: Install Railway CLI
#===============================================================================

echo -e "${BLUE}[1/4] Checking Railway CLI...${NC}"

if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Installing..."
    
    if command -v npm &> /dev/null; then
        npm install -g @railway/cli
    else
        echo -e "${RED}npm not found. Please install Node.js first.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Railway CLI: $(railway --version 2>/dev/null || echo "installed")"
echo ""

#===============================================================================
# Step 2: Login
#===============================================================================

echo -e "${BLUE}[2/4] Checking Railway login...${NC}"

if ! railway whoami &> /dev/null 2>&1; then
    echo "Not logged in. Opening browser for authentication..."
    railway login
fi

echo -e "${GREEN}✓${NC} Logged in as: $(railway whoami 2>/dev/null)"
echo ""

#===============================================================================
# Step 3: Link Project
#===============================================================================

echo -e "${BLUE}[3/4] Checking project link...${NC}"

if ! railway status &> /dev/null 2>&1; then
    echo "No project linked."
    echo ""
    echo "Available projects:"
    railway list 2>/dev/null || echo "  (none found)"
    echo ""
    echo "Please run: railway link"
    echo "Then select your project and re-run this script."
    exit 1
fi

echo -e "${GREEN}✓${NC} Project linked"
railway status 2>/dev/null | head -5
echo ""

#===============================================================================
# Step 4: Make Scripts Executable
#===============================================================================

echo -e "${BLUE}[4/4] Preparing scripts...${NC}"

chmod +x "$SCRIPT_DIR/railway-dump.sh" 2>/dev/null || true
chmod +x "$SCRIPT_DIR/railway-diagnose.sh" 2>/dev/null || true
chmod +x "$SCRIPT_DIR/railway-verify.sh" 2>/dev/null || true
chmod +x "$SCRIPT_DIR/railway-heal.sh" 2>/dev/null || true

echo -e "${GREEN}✓${NC} Scripts ready"
echo ""

#===============================================================================
# Menu
#===============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "What would you like to do?"
echo ""
echo "  1) Run self-healing loop (recommended)"
echo "  2) Dump project state only"
echo "  3) Diagnose only (requires dump)"
echo "  4) Verify health only"
echo "  5) Exit"
echo ""
read -p "Enter choice [1-5]: " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "Starting self-healing loop..."
        exec "$SCRIPT_DIR/railway-heal.sh"
        ;;
    2)
        echo ""
        exec "$SCRIPT_DIR/railway-dump.sh"
        ;;
    3)
        echo ""
        exec "$SCRIPT_DIR/railway-diagnose.sh"
        ;;
    4)
        echo ""
        exec "$SCRIPT_DIR/railway-verify.sh"
        ;;
    5)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo "Invalid choice. Running self-healing loop by default..."
        exec "$SCRIPT_DIR/railway-heal.sh"
        ;;
esac
