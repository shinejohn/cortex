#!/bin/bash

#===============================================================================
# Railway Setup Verification Script
# Run this AFTER completing manual setup steps to verify everything works
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_check() {
    echo -e "${GREEN}✓${NC} $1"
}

print_fail() {
    echo -e "${RED}✗${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║         Railway Setup Verification                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check Railway CLI
echo "Checking Railway CLI..."
if railway whoami &> /dev/null; then
    print_check "Railway CLI authenticated"
else
    print_fail "Railway CLI not authenticated. Run: railway login"
    exit 1
fi

# Check project link
echo ""
echo "Checking project link..."
if railway status &> /dev/null; then
    print_check "Project linked"
    railway status
else
    print_fail "No project linked. Run: railway link"
    exit 1
fi

# Check services
echo ""
echo "Checking services..."
echo ""

SERVICES=("Postgres" "Valkey" "GoEventCity" "Day News" "Downtown Guide" "GoLocalVoices" "AlphaSite" "Horizon" "Scheduler" "Inertia SSR")

for SERVICE in "${SERVICES[@]}"; do
    if railway variables --service "$SERVICE" &> /dev/null; then
        print_check "$SERVICE - exists"
    else
        print_warn "$SERVICE - not found or not configured"
    fi
done

# Check database connection
echo ""
echo "Testing database connection..."
if railway run php artisan db:show --service "GoEventCity" 2>/dev/null; then
    print_check "Database connection successful"
else
    print_warn "Could not verify database connection (service may not be deployed yet)"
fi

# Check Redis connection
echo ""
echo "Testing Redis connection..."
if railway run php artisan tinker --execute="Redis::ping()" --service "GoEventCity" 2>/dev/null | grep -q "PONG"; then
    print_check "Redis connection successful"
else
    print_warn "Could not verify Redis connection (service may not be deployed yet)"
fi

# Summary
echo ""
echo "=========================================="
echo "Verification complete!"
echo ""
echo "If services show as 'not found', make sure:"
echo "1. Service names match exactly (case-sensitive)"
echo "2. Services have been deployed at least once"
echo "3. GitHub repo is connected"
echo ""
echo "Next steps:"
echo "1. Complete any remaining manual setup steps"
echo "2. Trigger first deploy for each service"
echo "3. Run: railway logs -f to monitor"
echo "=========================================="
