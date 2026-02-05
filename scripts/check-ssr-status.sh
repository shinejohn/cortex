#!/bin/bash
echo "🔍 Checking SSR Configuration"
echo "=============================="
echo ""

SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    VAR_OUTPUT=$(railway variables --service "$SERVICE" --kv 2>&1)
    
    SSR_ENABLED=$(echo "$VAR_OUTPUT" | grep "^INERTIA_SSR_ENABLED=" | cut -d'=' -f2- | xargs || echo "")
    SSR_URL=$(echo "$VAR_OUTPUT" | grep "^INERTIA_SSR_URL=" | cut -d'=' -f2- | xargs || echo "")
    APP_KEY=$(echo "$VAR_OUTPUT" | grep "^APP_KEY=" | cut -d'=' -f2- | head -c 30 || echo "")
    
    echo "  INERTIA_SSR_ENABLED: $SSR_ENABLED"
    echo "  INERTIA_SSR_URL: $SSR_URL"
    echo "  APP_KEY: ${APP_KEY}..."
    echo ""
    
    # Check recent logs for SSR errors
    echo "  Recent logs (SSR/Inertia related):"
    railway logs --service "$SERVICE" 2>&1 | tail -20 | grep -iE "(ssr|inertia|supervisor)" | head -5 || echo "    No SSR-related logs found"
    echo ""
done
