#!/bin/bash

#===============================================================================
# RAILWAY HEALTH VERIFICATION
# Checks if all services are healthy and operational
#
# Usage: ./railway-verify.sh
# Exit: 0 if all healthy, 1 if issues remain
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              RAILWAY HEALTH VERIFICATION                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

#===============================================================================
# Prerequisites
#===============================================================================

if ! railway status &> /dev/null 2>&1; then
    echo -e "${RED}Not linked to project. Run: railway link${NC}"
    exit 1
fi

#===============================================================================
# Service Health Checks
#===============================================================================

# All services to check
SERVICES=(
    "Postgres Publishing"
    "Valkey"
    "Listmonk DB"
    "Listmonk"
    "Scheduler"
    "Horizon"
    "Inertia SSR"
    "GoEventCity"
    "Day News"
    "Downtown Guide"
    "Go Local Voices"
    "Alphasite"
)

HEALTHY=0
UNHEALTHY=0
UNKNOWN=0

echo -e "${BLUE}Checking service health...${NC}"
echo ""

for SERVICE in "${SERVICES[@]}"; do
    # Try to get logs
    LOGS=$(railway logs -s "$SERVICE" --limit 100 2>/dev/null || echo "")
    
    if [ -z "$LOGS" ]; then
        continue  # Service doesn't exist
    fi
    
    # Determine health status
    STATUS="UNKNOWN"
    
    # Check for healthy indicators
    if echo "$LOGS" | grep -qi "ready to accept connections"; then
        STATUS="HEALTHY_DB"
    elif echo "$LOGS" | grep -qi "Application ready\|Laravel started\|HTTP server running"; then
        STATUS="HEALTHY_APP"
    elif echo "$LOGS" | grep -qi "Horizon started\|schedule.*started\|listening on"; then
        STATUS="HEALTHY_WORKER"
    elif echo "$LOGS" | grep -qi "Build completed\|Deploy.*successful"; then
        STATUS="DEPLOYED"
    fi
    
    # Check for error indicators (overrides healthy if found)
    if echo "$LOGS" | grep -qi "Build failed\|exit code 1\|error.*build"; then
        STATUS="BUILD_FAILED"
    elif echo "$LOGS" | grep -qi "SQLSTATE\|connection refused"; then
        STATUS="DB_ERROR"
    elif echo "$LOGS" | grep -qi "fatal\|crash\|panic\|OOMKilled"; then
        STATUS="CRASHED"
    fi
    
    # Display and count
    case "$STATUS" in
        HEALTHY_DB|HEALTHY_APP|HEALTHY_WORKER|DEPLOYED)
            echo -e "${GREEN}✓${NC} $SERVICE: $STATUS"
            HEALTHY=$((HEALTHY + 1))
            ;;
        BUILD_FAILED|DB_ERROR|CRASHED)
            echo -e "${RED}✗${NC} $SERVICE: $STATUS"
            UNHEALTHY=$((UNHEALTHY + 1))
            ;;
        *)
            echo -e "${YELLOW}?${NC} $SERVICE: $STATUS"
            UNKNOWN=$((UNKNOWN + 1))
            ;;
    esac
done

#===============================================================================
# Database Connection Test
#===============================================================================

echo ""
echo -e "${BLUE}Testing database connectivity...${NC}"

DB_OK=false
if railway run -s "GoEventCity" -- php artisan db:show &> /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Database connection working"
    DB_OK=true
else
    echo -e "${YELLOW}?${NC} Could not verify database (app may not be deployed)"
fi

#===============================================================================
# Migration Status
#===============================================================================

echo ""
echo -e "${BLUE}Checking migration status...${NC}"

if $DB_OK; then
    MIGRATION_OUTPUT=$(railway run -s "GoEventCity" -- php artisan migrate:status 2>&1 || echo "Could not check")
    if echo "$MIGRATION_OUTPUT" | grep -qi "Ran\|Yes"; then
        PENDING=$(echo "$MIGRATION_OUTPUT" | grep -c "No\|Pending" || echo "0")
        if [ "$PENDING" -gt 0 ]; then
            echo -e "${YELLOW}⚠${NC} $PENDING pending migrations"
        else
            echo -e "${GREEN}✓${NC} All migrations run"
        fi
    else
        echo -e "${YELLOW}?${NC} Could not verify migrations"
    fi
else
    echo -e "${YELLOW}?${NC} Skipped (database not connected)"
fi

#===============================================================================
# Summary
#===============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "HEALTH SUMMARY"
echo ""
echo -e "  ${GREEN}Healthy:${NC}   $HEALTHY"
echo -e "  ${RED}Unhealthy:${NC} $UNHEALTHY"
echo -e "  ${YELLOW}Unknown:${NC}   $UNKNOWN"
echo ""

if [ $UNHEALTHY -eq 0 ] && [ $UNKNOWN -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ALL SERVICES HEALTHY!                                         ${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  SOME SERVICES NEED ATTENTION                                  ${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════════${NC}"
    exit 1
fi
