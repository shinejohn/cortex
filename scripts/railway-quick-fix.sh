#!/bin/bash
set -e

echo "🚀 Railway Database Connection Quick Fix"
echo "========================================"
echo ""
echo "This script will help you fix database connectivity issues."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm i -g @railway/cli"
    echo ""
    exit 1
fi

echo "📋 Step 1: Diagnose Current Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Postgres Publishing
echo "Checking Postgres Publishing service..."
POSTGRES_VARS=$(railway variables --service "Postgres Publishing" --kv 2>&1 || echo "")
DATABASE_URL=$(echo "$POSTGRES_VARS" | grep -i "DATABASE_URL" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")

if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "⚠️  Could not fetch DATABASE_URL from Railway CLI."
    echo ""
    echo "📋 Manual Steps Required:"
    echo ""
    echo "1. Open Railway Dashboard: https://railway.app"
    echo "2. Go to 'Postgres Publishing' service"
    echo "3. Click 'Connect' tab"
    echo "4. Copy the 'Internal Database URL'"
    echo ""
    echo "5. Run this script with the URL:"
    echo "   ./railway-quick-fix.sh 'postgresql://user:pass@host:port/db'"
    echo ""
    exit 1
fi

echo "✅ Found DATABASE_URL from Postgres Publishing"
echo ""

# Check Valkey
echo "Checking Valkey service..."
VALKEY_VARS=$(railway variables --service "Valkey" --kv 2>&1 || echo "")
REDIS_HOST=$(echo "$VALKEY_VARS" | grep -E "REDIS_HOST|HOST|RAILWAY_PRIVATE_DOMAIN" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")
REDIS_PORT=$(echo "$VALKEY_VARS" | grep -E "REDIS_PORT|PORT" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "6379")

if [ -z "$REDIS_HOST" ]; then
    echo "⚠️  Could not fetch REDIS_HOST. Will skip Redis configuration."
    REDIS_HOST=""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Updating All Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Parse DATABASE_URL to get individual components
DB_USERNAME=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
[ -z "$DB_PORT" ] && DB_PORT="5432"
DB_DATABASE=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^/]*/\(.*\)|\1|p' | cut -d'?' -f1)

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_DATABASE"
echo "  Username: $DB_USERNAME"
echo ""

# Allow manual override
if [ -n "$1" ] && [[ "$1" == postgresql://* ]]; then
    echo "Using provided DATABASE_URL..."
    DATABASE_URL="$1"
    DB_USERNAME=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
    [ -z "$DB_PORT" ] && DB_PORT="5432"
    DB_DATABASE=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^/]*/\(.*\)|\1|p' | cut -d'?' -f1)
fi

# Frontend Apps
FRONTEND_APPS=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

echo "Updating Frontend Apps..."
for SERVICE in "${FRONTEND_APPS[@]}"; do
    echo "  🔧 $SERVICE"
    railway variables --service "$SERVICE" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    
    if [ -n "$REDIS_HOST" ]; then
        railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
        railway variables --service "$SERVICE" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
        railway variables --service "$SERVICE" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    fi
done

echo ""
echo "Updating Backend Services..."
BACKEND_SERVICES=("Inertia SSR" "Horizon" "Scheduler")

for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo "  🔧 $SERVICE"
    railway variables --service "$SERVICE" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    
    if [ -n "$REDIS_HOST" ]; then
        railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
        railway variables --service "$SERVICE" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
        railway variables --service "$SERVICE" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All services updated!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Redeploy services now!"
echo ""
echo "Option 1: Via Railway Dashboard"
echo "  1. Go to Railway Dashboard"
echo "  2. For each service, click 'Deploy' → 'Redeploy'"
echo ""
echo "Option 2: Via Railway CLI (one service at a time)"
echo "  railway up --service 'Day News'"
echo "  railway up --service 'GoEventCity'"
echo "  # ... repeat for all services"
echo ""
echo "Option 3: Full monorepo redeploy"
echo "  railway up"
echo ""
echo "💡 Tip: Test one service first (e.g., Day News) before redeploying all."
echo ""
