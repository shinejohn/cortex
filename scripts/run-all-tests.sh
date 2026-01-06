#!/bin/bash

# Run All Tests and Generate Reports
# This script runs all tests and generates comprehensive reports

set -e

echo "🧪 Running Complete Test Suite"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create results directory
mkdir -p test-results

# Run backend tests
echo "📝 Running Backend Tests (Pest PHP)..."
echo "--------------------------------------"
php artisan test --coverage --min=80 > test-results/backend-tests.txt 2>&1
BACKEND_EXIT=$?

if [ $BACKEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests passed${NC}"
else
    echo -e "${RED}❌ Backend tests failed${NC}"
fi

# Run Playwright tests
echo ""
echo "🎭 Running Frontend Tests (Playwright)..."
echo "----------------------------------------"
npm run test:e2e > test-results/frontend-tests.txt 2>&1
FRONTEND_EXIT=$?

if [ $FRONTEND_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests passed${NC}"
else
    echo -e "${RED}❌ Frontend tests failed${NC}"
fi

# Generate summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo "Backend Tests: $([ $BACKEND_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo "Frontend Tests: $([ $FRONTEND_EXIT -eq 0 ] && echo 'PASS' || echo 'FAIL')"
echo ""
echo "Reports saved to test-results/"

# Exit with error if any tests failed
if [ $BACKEND_EXIT -ne 0 ] || [ $FRONTEND_EXIT -ne 0 ]; then
    exit 1
fi

exit 0

