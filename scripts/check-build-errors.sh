#!/bin/bash

# Check Build Errors Script
# Gets the latest build errors from Railway

echo "🔍 Checking Build Errors..."
echo ""

SERVICES=("Day News" "GoEventCity" "Downtown Guide" "Go Local Voices" "Alphasite")

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Get latest deployment
    DEPLOYMENT=$(railway status --service "$SERVICE" --json 2>&1 | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    
    if [ -n "$DEPLOYMENT" ]; then
        echo "Latest Deployment: $DEPLOYMENT"
        railway logs --deployment "$DEPLOYMENT" 2>&1 | grep -i "error\|fail\|fatal" | tail -10 || echo "No errors found in logs"
    else
        echo "No deployment found"
    fi
    
    echo ""
done
