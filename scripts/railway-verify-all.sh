#!/bin/bash

# Railway Configuration Verification Script
# Verifies all critical variables are set correctly

set -e

echo "🔍 Railway Configuration Verification"
echo "====================================="
echo ""

SERVICES=("Day News" "GoEventCity" "Downtown Guide" "Go Local Voices" "Alphasite")

ALL_GOOD=true

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    VAR_OUTPUT=$(railway variables --service "$SERVICE" 2>&1 || true)
    
    # Check database
    DB_HOST=$(echo "$VAR_OUTPUT" | grep "^DB_HOST=" | cut -d'=' -f2- | xargs || echo "")
    if [ "$DB_HOST" != "postgres.railway.internal" ] && [ "$DB_HOST" != "postgres-publishing.railway.internal" ]; then
        echo "❌ DB_HOST: $DB_HOST (should be postgres.railway.internal)"
        ALL_GOOD=false
    else
        echo "✅ DB_HOST: $DB_HOST"
    fi
    
    # Check SSR
    SSR_ENABLED=$(echo "$VAR_OUTPUT" | grep "^INERTIA_SSR_ENABLED=" | cut -d'=' -f2- | xargs || echo "")
    SSR_URL=$(echo "$VAR_OUTPUT" | grep "^INERTIA_SSR_URL=" | cut -d'=' -f2- | xargs || echo "")
    
    if [ "$SSR_ENABLED" != "true" ]; then
        echo "❌ INERTIA_SSR_ENABLED: $SSR_ENABLED (should be true)"
        ALL_GOOD=false
    else
        echo "✅ INERTIA_SSR_ENABLED: $SSR_ENABLED"
    fi
    
    if [ "$SSR_URL" != "http://127.0.0.1:13714" ]; then
        echo "⚠️  INERTIA_SSR_URL: $SSR_URL (should be http://127.0.0.1:13714)"
        if [[ ! "$SSR_URL" =~ ^http://127.0.0.1:13714 ]]; then
            ALL_GOOD=false
        fi
    else
        echo "✅ INERTIA_SSR_URL: $SSR_URL"
    fi
    
    # Check Redis
    REDIS_CLIENT=$(echo "$VAR_OUTPUT" | grep "^REDIS_CLIENT=" | cut -d'=' -f2- | xargs || echo "")
    REDIS_PORT=$(echo "$VAR_OUTPUT" | grep "^REDIS_PORT=" | cut -d'=' -f2- | xargs || echo "")
    
    if [ -z "$REDIS_CLIENT" ]; then
        echo "❌ REDIS_CLIENT: Not set"
        ALL_GOOD=false
    else
        echo "✅ REDIS_CLIENT: $REDIS_CLIENT"
    fi
    
    if [ -z "$REDIS_PORT" ] || [ "$REDIS_PORT" != "6379" ]; then
        echo "❌ REDIS_PORT: $REDIS_PORT (should be 6379)"
        ALL_GOOD=false
    else
        echo "✅ REDIS_PORT: $REDIS_PORT"
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_GOOD" = true ]; then
    echo "✅ All services configured correctly!"
    exit 0
else
    echo "❌ Some services have configuration issues"
    exit 1
fi
