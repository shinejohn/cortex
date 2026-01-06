#!/bin/bash
# Comprehensive Page Testing Script
# This script runs all page tests and generates a report

set -e

echo "🧪 Comprehensive Page Testing Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "🔍 Checking if Laravel server is running..."
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Laravel server not running. Starting server...${NC}"
    echo "   Run this in another terminal: php artisan serve"
    echo "   Or press Ctrl+C and start the server first"
    read -p "Press Enter when server is running..."
fi

# Build assets
echo ""
echo "🔨 Building frontend assets..."
npm run build

# Clear caches
echo ""
echo "🧹 Clearing Laravel caches..."
php artisan route:clear 2>/dev/null || true
php artisan config:clear 2>/dev/null || true
php artisan cache:clear 2>/dev/null || true

# Run comprehensive page tests
echo ""
echo "🚀 Running comprehensive page tests..."
echo ""

# Run tests with detailed output
npx playwright test tests/Playwright/comprehensive-pages.spec.ts \
    --reporter=list,html,json \
    --output-dir=test-results/pages \
    || true

# Check if report was generated
if [ -f "playwright-report/page-test-report.json" ]; then
    echo ""
    echo -e "${GREEN}✅ Test report generated!${NC}"
    echo ""
    echo "📊 View results:"
    echo "   HTML Report: npx playwright show-report"
    echo "   JSON Report: playwright-report/page-test-report.json"
else
    echo ""
    echo -e "${YELLOW}⚠️  Running tests to generate report...${NC}"
    npx playwright test tests/Playwright/comprehensive-pages.spec.ts --reporter=json
fi

echo ""
echo "✅ Testing complete!"
echo ""
echo "📝 Next steps:"
echo "   1. View HTML report: npx playwright show-report"
echo "   2. Check test results: test-results/pages/"
echo "   3. Review JSON report: playwright-report/page-test-report.json"
echo ""

