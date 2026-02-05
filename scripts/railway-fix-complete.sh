#!/bin/bash

# Complete Railway Variables Fix Script
# Fixes all critical variables for all services

set -e

echo "🔧 Complete Railway Variables Fix"
echo "=================================="
echo ""

# Database connection details
DB_HOST="postgres-publishing.railway.internal"
DB_PORT="5432"
DB_DATABASE="railway"
DB_USERNAME="postgres"
DB_PASSWORD="kXOyoJTnDLmQAyTsTFwemX0abfQxylXn"

# Services to fix (excluding Downtown Guide which is working)
SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite")

echo "📋 Fixing all variables for services..."
echo ""

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Database variables
    echo "  Setting database variables..."
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    
    # Redis variables
    echo "  Setting Redis variables..."
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PORT=6379" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PASSWORD=" 2>&1 | grep -v "Warning" || true
    
    # Inertia SSR variables
    echo "  Setting Inertia SSR variables..."
    railway variables --service "$SERVICE" --set "INERTIA_SSR_ENABLED=true" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "INERTIA_SSR_URL=http://inertia:13714" 2>&1 | grep -v "Warning" || true
    
    echo "✅ Variables set for $SERVICE"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All variables have been set!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏳ Waiting 10 seconds for Railway to process..."
sleep 10
echo ""
echo "📊 Checking variable status..."
./scripts/railway-check-variables.sh
echo ""
echo "✅ Fix complete! Services should redeploy automatically."
echo ""
