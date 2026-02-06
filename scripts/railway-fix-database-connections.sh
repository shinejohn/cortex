#!/bin/bash
set -e

echo "🔧 Railway Database Connection Fix"
echo "==================================="
echo ""
echo "This script fixes database connectivity by using Railway service references"
echo "instead of hardcoded hostnames that can change after redeployments."
echo ""

# Railway service reference variables (best practice - Railway resolves these automatically)
# Format: ${{ServiceName.VARIABLE_NAME}}
# These reference the actual Railway services and Railway will resolve them to correct values

POSTGRES_SERVICE="Postgres Publishing"
VALKEY_SERVICE="Valkey"
SSR_SERVICE="Inertia SSR"

echo "📋 Step 1: Setting Database Variables Using Railway Service References"
echo ""

# Frontend Apps
FRONTEND_APPS=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${FRONTEND_APPS[@]}"; do
    echo "  🔧 Configuring $SERVICE..."
    
    # Use Railway service reference variables - Railway will resolve these automatically
    railway variables --service "$SERVICE" --set "DATABASE_URL=\${{${POSTGRES_SERVICE}.DATABASE_URL}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    
    # Set individual DB variables using service references
    railway variables --service "$SERVICE" --set "DB_HOST=\${{${POSTGRES_SERVICE}.PGHOST}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=\${{${POSTGRES_SERVICE}.PGPORT}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=\${{${POSTGRES_SERVICE}.PGDATABASE}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=\${{${POSTGRES_SERVICE}.PGUSER}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=\${{${POSTGRES_SERVICE}.PGPASSWORD}}" 2>&1 | grep -v "Warning" || true
    
    # Redis/Valkey configuration
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_HOST=\${{${VALKEY_SERVICE}.REDIS_HOST}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PORT=\${{${VALKEY_SERVICE}.REDIS_PORT}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PASSWORD=\${{${VALKEY_SERVICE}.REDIS_PASSWORD}}" 2>&1 | grep -v "Warning" || true
    
    # SSR URL
    railway variables --service "$SERVICE" --set "INERTIA_SSR_URL=\${{${SSR_SERVICE}.RAILWAY_PUBLIC_DOMAIN}}" 2>&1 | grep -v "Warning" || true
    
    echo "    ✅ $SERVICE configured"
done

echo ""
echo "📋 Step 2: Setting Backend Service Variables"
echo ""

BACKEND_SERVICES=("Inertia SSR" "Horizon" "Scheduler")

for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo "  🔧 Configuring $SERVICE..."
    
    # Database configuration using service references
    railway variables --service "$SERVICE" --set "DATABASE_URL=\${{${POSTGRES_SERVICE}.DATABASE_URL}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=\${{${POSTGRES_SERVICE}.PGHOST}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=\${{${POSTGRES_SERVICE}.PGPORT}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=\${{${POSTGRES_SERVICE}.PGDATABASE}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=\${{${POSTGRES_SERVICE}.PGUSER}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=\${{${POSTGRES_SERVICE}.PGPASSWORD}}" 2>&1 | grep -v "Warning" || true
    
    # Redis/Valkey configuration
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_HOST=\${{${VALKEY_SERVICE}.REDIS_HOST}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PORT=\${{${VALKEY_SERVICE}.REDIS_PORT}}" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PASSWORD=\${{${VALKEY_SERVICE}.REDIS_PASSWORD}}" 2>&1 | grep -v "Warning" || true
    
    echo "    ✅ $SERVICE configured"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Database connection variables updated!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Important Notes:"
echo ""
echo "1. Railway Service References:"
echo "   This script uses Railway service reference variables like:"
echo "   \${{Postgres Publishing.DATABASE_URL}}"
echo "   Railway will automatically resolve these to the correct values."
echo ""
echo "2. If service references don't work, you may need to:"
echo "   a) Get the actual values from Railway Dashboard:"
echo "      - Go to 'Postgres Publishing' → Connect tab"
echo "      - Copy the 'Internal Database URL'"
echo "   b) Run the fallback script: railway-fix-database-fallback.sh"
echo ""
echo "3. After fixing variables, redeploy services:"
echo "   railway up --service 'Day News'"
echo "   (or trigger redeploy from Railway Dashboard)"
echo ""
