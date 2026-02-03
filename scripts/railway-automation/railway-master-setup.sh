#!/bin/bash

#===============================================================================
# Railway Complete Automation
# Master script that runs all setup steps in order
#
# This script orchestrates:
#   1. Discovery - Collects project/service info
#   2. Configuration - Sets images, volumes, watch paths via API
#   3. Environment Variables - Sets all connections via CLI
#   4. Verification - Tests everything works
#
# Prerequisites:
#   - Railway CLI installed: npm install -g @railway/cli
#   - Railway CLI logged in: railway login
#   - RAILWAY_TOKEN set: export RAILWAY_TOKEN="your-token"
#   - jq installed: brew install jq
#
# Usage:
#   export RAILWAY_TOKEN="your-token-here"
#   chmod +x railway-master-setup.sh
#   ./railway-master-setup.sh [project-name]
#===============================================================================

set -e

# Configuration
PROJECT_NAME="${1:-supportive-rebirth}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

print_banner() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}${BOLD}           RAILWAY COMPLETE AUTOMATION                               ${NC}${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}           Project: $PROJECT_NAME                                    ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_all_prerequisites() {
    echo -e "${BLUE}Checking all prerequisites...${NC}"
    echo ""
    
    local MISSING=0
    
    # Check Railway CLI
    if command -v railway &> /dev/null; then
        echo -e "${GREEN}✓${NC} Railway CLI installed"
    else
        echo -e "${RED}✗${NC} Railway CLI not installed (npm install -g @railway/cli)"
        MISSING=$((MISSING+1))
    fi
    
    # Check Railway login
    if railway whoami &> /dev/null; then
        echo -e "${GREEN}✓${NC} Railway CLI authenticated"
    else
        echo -e "${RED}✗${NC} Railway CLI not logged in (railway login)"
        MISSING=$((MISSING+1))
    fi
    
    # Check jq
    if command -v jq &> /dev/null; then
        echo -e "${GREEN}✓${NC} jq installed"
    else
        echo -e "${RED}✗${NC} jq not installed (brew install jq)"
        MISSING=$((MISSING+1))
    fi
    
    # Check RAILWAY_TOKEN
    if [ -n "$RAILWAY_TOKEN" ]; then
        echo -e "${GREEN}✓${NC} RAILWAY_TOKEN set"
    else
        echo -e "${RED}✗${NC} RAILWAY_TOKEN not set"
        echo "   Get token from: Railway Dashboard → Account → Tokens"
        echo "   Then: export RAILWAY_TOKEN=\"your-token\""
        MISSING=$((MISSING+1))
    fi
    
    # Check scripts exist
    for script in railway-discover.sh railway-configure.sh railway-full-setup.sh railway-test-connections.sh; do
        if [ -f "$SCRIPT_DIR/$script" ]; then
            echo -e "${GREEN}✓${NC} $script found"
        else
            echo -e "${RED}✗${NC} $script not found"
            MISSING=$((MISSING+1))
        fi
    done
    
    echo ""
    
    if [ $MISSING -gt 0 ]; then
        echo -e "${RED}Missing $MISSING prerequisites. Please fix and retry.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}All prerequisites met!${NC}"
    echo ""
}

run_step() {
    local step_num="$1"
    local step_name="$2"
    local script="$3"
    shift 3
    local args="$@"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  STEP $step_num: $step_name${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if [ -f "$SCRIPT_DIR/$script" ]; then
        chmod +x "$SCRIPT_DIR/$script"
        "$SCRIPT_DIR/$script" $args
    else
        echo -e "${RED}Script not found: $script${NC}"
        exit 1
    fi
}

print_final_summary() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}${BOLD}                    SETUP COMPLETE                                    ${NC}${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}What was automated:${NC}"
    echo "  ✓ Project and service discovery"
    echo "  ✓ Docker images for all database services"
    echo "  ✓ Persistent volumes for data storage"
    echo "  ✓ Watch paths for segmented deploys"
    echo "  ✓ Build and start commands"
    echo "  ✓ All environment variables"
    echo "  ✓ Service connections (DB, Redis, SSR)"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  ONE MANUAL STEP REMAINING: Connect GitHub${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "For each app service (GoEventCity, Day News, Downtown Guide,"
    echo "Horizon, Scheduler, Inertia SSR):"
    echo ""
    echo "  1. Dashboard → [Service] → Settings → Source"
    echo "  2. Click 'Connect GitHub'"
    echo "  3. Select: shinejohn/Community-Platform"
    echo "  4. Branch: development"
    echo ""
    echo "This step requires browser OAuth and cannot be automated."
    echo "It takes about 5 minutes total."
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "After connecting GitHub:"
    echo "  • Services will auto-deploy"
    echo "  • Run: ./railway-test-connections.sh to verify"
    echo "  • Logs: railway logs -f"
    echo ""
}

#===============================================================================
# Main
#===============================================================================

main() {
    print_banner
    check_all_prerequisites
    
    # Step 1: Discovery
    run_step "1" "Discover Project & Services" "railway-discover.sh" "$PROJECT_NAME"
    
    # Step 2: API Configuration (images, volumes, watch paths)
    run_step "2" "Configure via API (images, volumes, watch paths)" "railway-configure.sh"
    
    # Step 3: Environment Variables (connections)
    run_step "3" "Set Environment Variables (connections)" "railway-full-setup.sh"
    
    # Final summary
    print_final_summary
}

main "$@"
