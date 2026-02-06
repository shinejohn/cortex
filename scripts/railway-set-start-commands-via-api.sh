#!/bin/bash
set -e

echo "🔧 Setting Start Commands via Railway API"
echo "=========================================="
echo ""

# Get Railway token from CLI config
RAILWAY_TOKEN=$(cat ~/.railway/config.json 2>/dev/null | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "⚠️  Cannot find Railway token. Trying alternative method..."
    # Try getting from Railway CLI
    RAILWAY_TOKEN=$(railway whoami 2>&1 | grep -o "token.*" || echo "")
fi

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Cannot get Railway token automatically."
    echo "   Please set RAILWAY_TOKEN environment variable or use Railway Dashboard"
    echo ""
    echo "   Alternative: Set start commands in Railway Dashboard:"
    echo "   - Inertia SSR: php artisan inertia:start-ssr"
    echo "   - Horizon: php artisan horizon"
    echo "   - Scheduler: php artisan schedule:work"
    exit 1
fi

# Get project ID
PROJECT_ID=$(railway status 2>&1 | grep -i "project" | head -1 || echo "")

echo "Using Railway API to set start commands..."
echo ""

# Function to update service via API
update_service_start_command() {
    local SERVICE_NAME=$1
    local START_COMMAND=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 $SERVICE_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Note: Railway API endpoint structure may vary
    # This is a best-effort attempt
    echo "Attempting to set start command via API..."
    echo "Start Command: $START_COMMAND"
    echo ""
    echo "⚠️  Railway CLI doesn't support setting start commands directly."
    echo "   Start commands must be set via:"
    echo "   1. Railway Dashboard → Service → Settings → Deploy → Start Command"
    echo "   2. railway.json file in repository (committed to git)"
    echo ""
}

# Try API approach (may not work, but worth trying)
update_service_start_command "Inertia SSR" "php artisan inertia:start-ssr"
update_service_start_command "Horizon" "php artisan horizon"
update_service_start_command "Scheduler" "php artisan schedule:work"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Railway CLI Limitation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Railway CLI doesn't have a command to set start commands."
echo "You have two options:"
echo ""
echo "Option 1: Railway Dashboard (Fastest)"
echo "  Go to each service → Settings → Deploy → Start Command"
echo ""
echo "Option 2: railway.json files (Best for version control)"
echo "  Create railway.json files for each service with startCommand"
echo "  Commit to git, Railway will read them on next deploy"
echo ""
