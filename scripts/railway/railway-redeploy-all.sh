#!/bin/bash

#===============================================================================
# RAILWAY REDEPLOY & MIGRATE
# Redeploys all services in correct order and runs migrations
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
echo "║           RAILWAY REDEPLOY & MIGRATE                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

#===============================================================================
# Phase 1: Databases
#===============================================================================

echo -e "${BLUE}[Phase 1/4] Redeploying Databases${NC}"
echo ""

echo "Redeploying Postgres Publishing..."
railway redeploy -s "Postgres Publishing" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo "Redeploying Valkey..."
railway redeploy -s "Valkey" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo "Redeploying Listmonk DB..."
railway redeploy -s "Listmonk DB" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo ""
echo "Waiting 45 seconds for databases to initialize..."
sleep 45

#===============================================================================
# Phase 2: Support Services
#===============================================================================

echo ""
echo -e "${BLUE}[Phase 2/4] Redeploying Support Services${NC}"
echo ""

echo "Redeploying Listmonk..."
railway redeploy -s "Listmonk" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo "Redeploying Inertia SSR..."
railway redeploy -s "Inertia SSR" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo ""
echo "Waiting 60 seconds for support services..."
sleep 60

#===============================================================================
# Phase 3: Laravel Apps
#===============================================================================

echo ""
echo -e "${BLUE}[Phase 3/4] Redeploying Laravel Apps${NC}"
echo ""

APPS=("GoEventCity" "Day News" "Downtown Guide" "Go Local Voices" "Alphasite")

for APP in "${APPS[@]}"; do
    echo "Redeploying $APP..."
    railway redeploy -s "$APP" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"
done

#===============================================================================
# Phase 4: Background Workers
#===============================================================================

echo ""
echo -e "${BLUE}[Phase 4/4] Redeploying Background Workers${NC}"
echo ""

echo "Redeploying Scheduler..."
railway redeploy -s "Scheduler" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo "Redeploying Horizon..."
railway redeploy -s "Horizon" 2>/dev/null && echo -e "${GREEN}✓ Triggered${NC}" || echo -e "${YELLOW}⚠ Skipped${NC}"

echo ""
echo "Waiting 120 seconds for builds to complete..."
sleep 120

#===============================================================================
# Run Migrations
#===============================================================================

echo ""
echo -e "${BLUE}Running Migrations${NC}"
echo ""

echo "Running php artisan migrate --force..."
railway run -s "GoEventCity" -- php artisan migrate --force 2>&1 || echo -e "${YELLOW}⚠ Migration may have failed - check manually${NC}"

echo ""
echo "Caching configuration..."
railway run -s "GoEventCity" -- php artisan config:cache 2>&1 || echo -e "${YELLOW}⚠ Config cache failed${NC}"
railway run -s "GoEventCity" -- php artisan route:cache 2>&1 || echo -e "${YELLOW}⚠ Route cache failed${NC}"

#===============================================================================
# Final Status
#===============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Redeploy complete!${NC}"
echo ""
echo "Check status:"
echo "  railway status"
echo ""
echo "View logs:"
echo "  railway logs -s \"GoEventCity\" -f"
echo ""
echo "If builds failed, check build logs:"
echo "  railway logs -s \"GoEventCity\" --build"
echo ""
