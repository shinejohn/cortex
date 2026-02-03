#!/bin/bash

#===============================================================================
# Railway Connection Verification Script
# Tests that all services are properly connected
# Run AFTER services are deployed
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Service name (the main app service to test from)
TEST_SERVICE="${1:-GoEventCity}"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║           RAILWAY CONNECTION VERIFICATION                            ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Testing connections from service: $TEST_SERVICE"
echo ""

#===============================================================================
# Check Prerequisites
#===============================================================================

echo -e "${BLUE}[1/7] Checking Railway CLI...${NC}"
if ! railway whoami &> /dev/null; then
    echo -e "${RED}✗ Not logged in. Run: railway login${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Railway CLI authenticated${NC}"
echo ""

#===============================================================================
# Check Project Link
#===============================================================================

echo -e "${BLUE}[2/7] Checking project link...${NC}"
if ! railway status &> /dev/null; then
    echo -e "${RED}✗ No project linked. Run: railway link${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Project linked${NC}"
railway status 2>/dev/null | head -5
echo ""

#===============================================================================
# Check Service Exists
#===============================================================================

echo -e "${BLUE}[3/7] Checking service exists...${NC}"
if railway variables --service "$TEST_SERVICE" &> /dev/null; then
    echo -e "${GREEN}✓ Service '$TEST_SERVICE' found${NC}"
else
    echo -e "${RED}✗ Service '$TEST_SERVICE' not found${NC}"
    echo "Available services:"
    railway service list 2>/dev/null || echo "  (could not list services)"
    exit 1
fi
echo ""

#===============================================================================
# Check Environment Variables
#===============================================================================

echo -e "${BLUE}[4/7] Checking environment variables...${NC}"

# Get variables
VARS=$(railway variables --service "$TEST_SERVICE" 2>/dev/null || echo "")

check_var() {
    local var_name=$1
    if echo "$VARS" | grep -q "^$var_name="; then
        echo -e "${GREEN}  ✓ $var_name${NC}"
        return 0
    else
        echo -e "${RED}  ✗ $var_name (not set)${NC}"
        return 1
    fi
}

MISSING=0

echo "Checking database connection variables:"
check_var "DATABASE_URL" || MISSING=$((MISSING+1))
check_var "DB_HOST" || MISSING=$((MISSING+1))
check_var "DB_DATABASE" || MISSING=$((MISSING+1))

echo ""
echo "Checking Redis connection variables:"
check_var "REDIS_URL" || MISSING=$((MISSING+1))
check_var "REDIS_HOST" || MISSING=$((MISSING+1))

echo ""
echo "Checking Laravel core variables:"
check_var "APP_KEY" || MISSING=$((MISSING+1))
check_var "APP_ENV" || MISSING=$((MISSING+1))

if [ $MISSING -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠ $MISSING variables missing or not set${NC}"
else
    echo ""
    echo -e "${GREEN}✓ All critical variables present${NC}"
fi
echo ""

#===============================================================================
# Test Database Connection
#===============================================================================

echo -e "${BLUE}[5/7] Testing database connection...${NC}"
echo "Running: php artisan db:show"
echo ""

if railway run --service "$TEST_SERVICE" -- php artisan db:show 2>/dev/null; then
    echo ""
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo ""
    echo -e "${RED}✗ Database connection failed${NC}"
    echo ""
    echo "Possible causes:"
    echo "  • Postgres service not deployed yet"
    echo "  • Postgres has no volume (data not persisted)"
    echo "  • DATABASE_URL not set correctly"
    echo ""
    echo "Check Postgres logs:"
    echo "  railway logs --service Postgres"
fi
echo ""

#===============================================================================
# Test Redis Connection
#===============================================================================

echo -e "${BLUE}[6/7] Testing Redis connection...${NC}"
echo "Running: Redis::ping()"
echo ""

REDIS_RESULT=$(railway run --service "$TEST_SERVICE" -- php artisan tinker --execute="echo Redis::ping();" 2>/dev/null || echo "FAILED")

if echo "$REDIS_RESULT" | grep -q "PONG\|1\|true"; then
    echo -e "${GREEN}✓ Redis connection successful (PONG)${NC}"
else
    echo -e "${RED}✗ Redis connection failed${NC}"
    echo "Result: $REDIS_RESULT"
    echo ""
    echo "Possible causes:"
    echo "  • Valkey/Redis service not deployed yet"
    echo "  • REDIS_URL not set correctly"
    echo ""
    echo "Check Valkey logs:"
    echo "  railway logs --service Valkey"
fi
echo ""

#===============================================================================
# Test Queue Connection
#===============================================================================

echo -e "${BLUE}[7/7] Testing queue connection...${NC}"
echo "Running: php artisan queue:monitor"
echo ""

if railway run --service "$TEST_SERVICE" -- php artisan queue:monitor default --max=0 2>/dev/null; then
    echo -e "${GREEN}✓ Queue connection successful${NC}"
else
    echo -e "${YELLOW}⚠ Could not verify queue (might still be working)${NC}"
fi
echo ""

#===============================================================================
# Summary
#===============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}CONNECTION SUMMARY${NC}"
echo ""
echo "Run these commands to debug issues:"
echo ""
echo "  # View all logs"
echo "  railway logs -f"
echo ""
echo "  # View specific service logs"
echo "  railway logs --service Postgres"
echo "  railway logs --service Valkey"
echo "  railway logs --service \"$TEST_SERVICE\""
echo ""
echo "  # Check all variables for a service"
echo "  railway variables --service \"$TEST_SERVICE\""
echo ""
echo "  # Run migrations"
echo "  railway run --service \"$TEST_SERVICE\" -- php artisan migrate"
echo ""
echo "  # Interactive shell"
echo "  railway run --service \"$TEST_SERVICE\" -- php artisan tinker"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
