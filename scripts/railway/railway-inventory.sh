#!/bin/bash

#===============================================================================
# RAILWAY INVENTORY & STATUS AUDIT
# Run this first to see what's working and what's not
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
echo "║           RAILWAY INVENTORY AUDIT                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

#===============================================================================
# Check Prerequisites
#===============================================================================

echo -e "${BLUE}[1/5] Checking Prerequisites${NC}"
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI not installed${NC}"
    echo "  Install: npm install -g @railway/cli"
    exit 1
else
    echo -e "${GREEN}✓ Railway CLI installed${NC}"
fi

# Check if logged in
if ! railway whoami &> /dev/null 2>&1; then
    echo -e "${RED}✗ Not logged in to Railway${NC}"
    echo "  Run: railway login"
    exit 1
else
    RAILWAY_USER=$(railway whoami 2>/dev/null)
    echo -e "${GREEN}✓ Logged in as: $RAILWAY_USER${NC}"
fi

# Check if linked to project
if ! railway status &> /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Not linked to a project${NC}"
    echo "  Run: railway link"
    echo "  Then select: Dev Publishing Platform"
    exit 1
else
    echo -e "${GREEN}✓ Linked to project${NC}"
fi

echo ""

#===============================================================================
# Get Project Status
#===============================================================================

echo -e "${BLUE}[2/5] Project Status${NC}"
echo ""

railway status

echo ""

#===============================================================================
# List All Services
#===============================================================================

echo -e "${BLUE}[3/5] Service Inventory${NC}"
echo ""

# Define expected services
SERVICES=(
    "Postgres Publishing"
    "Valkey"
    "Listmonk DB"
    "Listmonk"
    "laravel-storage"
    "Scheduler"
    "Horizon"
    "Inertia SSR"
    "GoEventCity"
    "Day News"
    "Downtown Guide"
    "Go Local Voices"
    "Alphasite"
)

echo "Checking each service..."
echo ""

for SERVICE in "${SERVICES[@]}"; do
    echo -n "  $SERVICE: "
    if railway logs -s "$SERVICE" --limit 1 &> /dev/null 2>&1; then
        echo -e "${GREEN}Found${NC}"
    else
        echo -e "${YELLOW}Not found or not accessible${NC}"
    fi
done

echo ""

#===============================================================================
# Check Database Connections
#===============================================================================

echo -e "${BLUE}[4/5] Database Connection Check${NC}"
echo ""

echo "Testing Postgres connection via GoEventCity..."
if railway run -s "GoEventCity" -- php artisan db:show &> /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection working${NC}"
else
    echo -e "${RED}✗ Database connection failed (app may not be deployed yet)${NC}"
fi

echo ""

#===============================================================================
# Check Environment Variables
#===============================================================================

echo -e "${BLUE}[5/5] Key Environment Variables${NC}"
echo ""

echo "GoEventCity variables:"
railway variables -s "GoEventCity" 2>/dev/null | grep -E "^(APP_|DB_|REDIS_|DATABASE_)" | head -10 || echo "  Could not fetch variables"

echo ""

#===============================================================================
# Summary & Next Steps
#===============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}NEXT STEPS:${NC}"
echo ""
echo "1. Check build logs for failed services:"
echo "   railway logs -s \"GoEventCity\" --build"
echo ""
echo "2. Redeploy a service:"
echo "   railway redeploy -s \"GoEventCity\""
echo ""
echo "3. Run migrations (after deploy):"
echo "   railway run -s \"GoEventCity\" -- php artisan migrate --force"
echo ""
echo "4. View runtime logs:"
echo "   railway logs -s \"GoEventCity\" -f"
echo ""
