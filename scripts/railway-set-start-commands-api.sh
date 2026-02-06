#!/bin/bash
set -e

echo "🔧 Setting Start Commands via Railway API"
echo "=========================================="
echo ""

# Check if Railway API token is available
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "⚠️  RAILWAY_TOKEN not set. Getting from Railway CLI..."
    RAILWAY_TOKEN=$(railway whoami --json 2>/dev/null | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
fi

if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Cannot get Railway token. Please set RAILWAY_TOKEN or run 'railway login'"
    exit 1
fi

# Get project ID
PROJECT_ID=$(railway status --json 2>/dev/null | grep -o '"projectId":"[^"]*' | cut -d'"' -f4 || echo "")

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Cannot get project ID. Make sure you're linked to a Railway project"
    exit 1
fi

echo "Project ID: $PROJECT_ID"
echo ""

# Function to set start command for a service
set_start_command() {
    local SERVICE_NAME=$1
    local START_COMMAND=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Setting start command for: $SERVICE_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Get service ID
    SERVICE_ID=$(railway service "$SERVICE_NAME" --json 2>/dev/null | grep -o '"id":"[^"]*' | cut -d'"' -f4 || echo "")
    
    if [ -z "$SERVICE_ID" ]; then
        echo "❌ Could not find service: $SERVICE_NAME"
        return 1
    fi
    
    echo "Service ID: $SERVICE_ID"
    echo "Start Command: $START_COMMAND"
    
    # Use Railway API to update service
    # Note: This requires Railway API access
    RESPONSE=$(curl -s -X PATCH \
        "https://api.railway.app/v1/services/$SERVICE_ID" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"deploy\":{\"startCommand\":\"$START_COMMAND\"}}" 2>&1)
    
    if echo "$RESPONSE" | grep -q "error\|Error\|unauthorized"; then
        echo "⚠️  API call failed. Railway CLI may not support this operation."
        echo "   Response: $RESPONSE"
        echo ""
        echo "   Alternative: Set start commands via Railway Dashboard:"
        echo "   - Go to service: $SERVICE_NAME"
        echo "   - Settings → Deploy → Start Command: $START_COMMAND"
        return 1
    else
        echo "✅ Start command set successfully"
        return 0
    fi
}

# Set start commands for backend services
set_start_command "Inertia SSR" "php artisan inertia:start-ssr"
set_start_command "Horizon" "php artisan horizon"
set_start_command "Scheduler" "php artisan schedule:work"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Start commands configuration complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
