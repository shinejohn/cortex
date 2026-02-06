#!/bin/bash
set -e

echo "🔧 Complete Railway Platform Fix - All Services"
echo "================================================"
echo ""

# Database configuration
CORRECT_PASSWORD="kXOyoJTnDLmQAyTsTFwemXOabfQxylXn"
DB_HOST="postgres.railway.internal"
DB_PORT="5432"
DB_DATABASE="railway"
DB_USERNAME="postgres"
DB_CONNECTION="pgsql"
DATABASE_URL="postgresql://${DB_USERNAME}:${CORRECT_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

# Redis configuration
REDIS_CLIENT="phpredis"
REDIS_HOST="Valkey.railway.internal"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# SSR configuration
SSR_URL="http://inertia-ssr.railway.internal:13714"

echo "📋 Step 1: Fixing All Frontend Apps..."
echo ""

FRONTEND_APPS=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${FRONTEND_APPS[@]}"; do
    echo "  🔧 $SERVICE"
    railway variables --service "$SERVICE" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_CONNECTION=$DB_CONNECTION" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$CORRECT_PASSWORD" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=$REDIS_CLIENT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "INERTIA_SSR_URL=$SSR_URL" 2>&1 | grep -v "Warning" || true
done

echo ""
echo "📋 Step 2: Fixing All Backend Services..."
echo ""

BACKEND_SERVICES=(
    "Inertia SSR:php artisan inertia:start-ssr"
    "Horizon:php artisan horizon"
    "Scheduler:php artisan schedule:work"
)

for SERVICE_CONFIG in "${BACKEND_SERVICES[@]}"; do
    SERVICE_NAME="${SERVICE_CONFIG%%:*}"
    START_COMMAND="${SERVICE_CONFIG#*:}"
    
    echo "  🔧 $SERVICE_NAME"
    
    # Database
    railway variables --service "$SERVICE_NAME" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE_NAME" --set "DB_CONNECTION=$DB_CONNECTION" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE_NAME" --set "DB_PASSWORD=$CORRECT_PASSWORD" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE_NAME" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    
    # Redis
    railway variables --service "$SERVICE_NAME" --set "REDIS_CLIENT=$REDIS_CLIENT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE_NAME" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE_NAME" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    
    # Start command (may not work, but worth trying)
    railway variables --service "$SERVICE_NAME" --set "RAILWAY_START_COMMAND=$START_COMMAND" 2>&1 | grep -v "Warning" || true
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All configuration fixes applied!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Start Commands:"
echo "   RAILWAY_START_COMMAND set, but Railway may not recognize it."
echo "   Start commands should be set via Railway Dashboard:"
echo "   - Inertia SSR: php artisan inertia:start-ssr"
echo "   - Horizon: php artisan horizon"
echo "   - Scheduler: php artisan schedule:work"
echo ""
echo "   OR commit railway.json files to git (Railway reads them on deploy)"
echo ""
