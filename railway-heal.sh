#!/bin/bash

#===============================================================================
# RAILWAY SELF-HEALING LOOP
# Autonomous repair system for Railway deployments
#
# This script:
#   1. Dumps current project state
#   2. Diagnoses issues
#   3. Applies fixes
#   4. Verifies health
#   5. Repeats until healthy or max iterations reached
#
# Usage: 
#   ./railway-heal.sh              # Default 5 iterations
#   ./railway-heal.sh 10           # Custom max iterations
#===============================================================================

set -e

# Configuration
MAX_ITERATIONS=${1:-5}
WAIT_AFTER_FIX=60
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                    RAILWAY SELF-HEALING SYSTEM                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Max iterations: $MAX_ITERATIONS"
echo "Wait after fixes: ${WAIT_AFTER_FIX}s"
echo ""

#===============================================================================
# Prerequisites Check
#===============================================================================

echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI not installed${NC}"
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

if ! railway whoami &> /dev/null 2>&1; then
    echo -e "${YELLOW}Not logged in to Railway${NC}"
    echo "Please run: railway login"
    exit 1
fi

if ! railway status &> /dev/null 2>&1; then
    echo -e "${YELLOW}Not linked to a project${NC}"
    echo "Please run: railway link"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites OK${NC}"
echo ""

#===============================================================================
# Quick Health Check (Before Full Dump)
#===============================================================================

quick_health_check() {
    local UNHEALTHY=0
    
    # Check a few key services quickly
    for SERVICE in "Postgres Publishing" "Valkey" "GoEventCity"; do
        LOGS=$(railway logs -s "$SERVICE" --limit 50 2>/dev/null || echo "")
        if [ -n "$LOGS" ]; then
            if echo "$LOGS" | grep -qi "error\|failed\|crash\|refused"; then
                UNHEALTHY=$((UNHEALTHY + 1))
            fi
        fi
    done
    
    return $UNHEALTHY
}

#===============================================================================
# Apply Priority Fixes (Database First)
#===============================================================================

apply_priority_fixes() {
    echo -e "${BLUE}Applying priority fixes...${NC}"
    echo ""
    
    # Fix 1: PGDATA for Postgres databases
    echo "Checking PostgreSQL PGDATA paths..."
    
    for DB_SERVICE in "Postgres Publishing" "Listmonk DB"; do
        if railway logs -s "$DB_SERVICE" --limit 1 &> /dev/null 2>&1; then
            PGDATA=$(railway variables -s "$DB_SERVICE" 2>/dev/null | grep "^PGDATA=" | cut -d'=' -f2 || echo "")
            
            if [ "$PGDATA" = "/var/lib/postgresql/data" ]; then
                echo "  Fixing PGDATA for $DB_SERVICE..."
                railway variables -s "$DB_SERVICE" --set "PGDATA=/var/lib/postgresql/data/pgdata" 2>/dev/null || true
                railway redeploy -s "$DB_SERVICE" 2>/dev/null || true
                echo "  Waiting 30s for database to initialize..."
                sleep 30
            else
                echo "  $DB_SERVICE PGDATA: OK"
            fi
        fi
    done
    echo ""
    
    # Fix 2: APP_KEY for Laravel apps
    echo "Checking Laravel APP_KEY..."
    
    for APP_SERVICE in "GoEventCity" "Day News" "Downtown Guide" "Scheduler" "Horizon"; do
        if railway logs -s "$APP_SERVICE" --limit 1 &> /dev/null 2>&1; then
            HAS_KEY=$(railway variables -s "$APP_SERVICE" 2>/dev/null | grep "^APP_KEY=" || true)
            
            if [ -z "$HAS_KEY" ]; then
                echo "  Setting APP_KEY for $APP_SERVICE..."
                NEW_KEY="base64:$(openssl rand -base64 32)"
                railway variables -s "$APP_SERVICE" --set "APP_KEY=$NEW_KEY" 2>/dev/null || true
            fi
        fi
    done
    echo ""
    
    # Fix 3: Redeploy apps after database is ready
    echo "Checking if apps need redeploy..."
    
    # Wait for databases to be healthy
    sleep 10
    
    # Check if Postgres is ready
    PG_LOGS=$(railway logs -s "Postgres Publishing" --limit 50 2>/dev/null || echo "")
    if echo "$PG_LOGS" | grep -qi "ready to accept connections"; then
        echo "  PostgreSQL is ready. Redeploying dependent services..."
        
        for APP_SERVICE in "GoEventCity" "Day News" "Downtown Guide" "Scheduler" "Horizon" "Inertia SSR" "Listmonk"; do
            if railway logs -s "$APP_SERVICE" --limit 1 &> /dev/null 2>&1; then
                APP_LOGS=$(railway logs -s "$APP_SERVICE" --limit 20 2>/dev/null || echo "")
                if echo "$APP_LOGS" | grep -qi "connection refused\|SQLSTATE\|failed"; then
                    echo "    Redeploying $APP_SERVICE..."
                    railway redeploy -s "$APP_SERVICE" 2>/dev/null || true
                fi
            fi
        done
    fi
    echo ""
}

#===============================================================================
# Main Healing Loop
#===============================================================================

ITERATION=1

while [ $ITERATION -le $MAX_ITERATIONS ]; do
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BOLD}ITERATION $ITERATION of $MAX_ITERATIONS${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    #---------------------------------------------------------------------------
    # Step 1: Quick Health Check
    #---------------------------------------------------------------------------
    
    echo -e "${BLUE}[Step 1/5] Quick health check...${NC}"
    
    if "$SCRIPT_DIR/railway-verify.sh" 2>/dev/null; then
        echo ""
        echo -e "${GREEN}════════════════════════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}  SUCCESS! All services are healthy.                                     ${NC}"
        echo -e "${GREEN}════════════════════════════════════════════════════════════════════════${NC}"
        echo ""
        echo "Run migrations if needed:"
        echo "  railway run -s \"GoEventCity\" -- php artisan migrate --force"
        echo ""
        exit 0
    fi
    
    echo ""
    
    #---------------------------------------------------------------------------
    # Step 2: Full Dump
    #---------------------------------------------------------------------------
    
    echo -e "${BLUE}[Step 2/5] Dumping project state...${NC}"
    "$SCRIPT_DIR/railway-dump.sh" > /dev/null 2>&1 || true
    DUMP_DIR=$(cat ./.latest-dump-dir 2>/dev/null || ls -td ./railway-dump_* 2>/dev/null | head -1)
    echo "  Dump: $DUMP_DIR"
    echo ""
    
    #---------------------------------------------------------------------------
    # Step 3: Diagnose
    #---------------------------------------------------------------------------
    
    echo -e "${BLUE}[Step 3/5] Diagnosing issues...${NC}"
    "$SCRIPT_DIR/railway-diagnose.sh" "$DUMP_DIR" 2>/dev/null || true
    
    ISSUES=$(cat "$DUMP_DIR/.issue-count" 2>/dev/null || echo "0")
    echo "  Issues found: $ISSUES"
    echo ""
    
    #---------------------------------------------------------------------------
    # Step 4: Apply Fixes
    #---------------------------------------------------------------------------
    
    echo -e "${BLUE}[Step 4/5] Applying fixes...${NC}"
    
    if [ -f "$DUMP_DIR/recommended-fixes.sh" ] && [ "$ISSUES" -gt 0 ]; then
        # Run the generated fix script
        bash "$DUMP_DIR/recommended-fixes.sh" 2>/dev/null || true
    else
        # Apply priority fixes directly
        apply_priority_fixes
    fi
    
    echo ""
    
    #---------------------------------------------------------------------------
    # Step 5: Wait and Verify
    #---------------------------------------------------------------------------
    
    echo -e "${BLUE}[Step 5/5] Waiting for services to stabilize...${NC}"
    echo "  Waiting ${WAIT_AFTER_FIX}s..."
    sleep $WAIT_AFTER_FIX
    
    ITERATION=$((ITERATION + 1))
done

#===============================================================================
# Max Iterations Reached
#===============================================================================

echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  MAX ITERATIONS REACHED                                                ${NC}"
echo -e "${YELLOW}  Some issues may require manual intervention.                          ${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Review the latest dump:"
echo "  $DUMP_DIR/ANALYSIS-REPORT.md"
echo "  $DUMP_DIR/diagnosis.txt"
echo ""
echo "Check build logs for failed services:"
echo "  railway logs -s \"GoEventCity\" --build"
echo ""
echo "Manual fixes may be needed in Railway Dashboard."
echo ""

exit 1
