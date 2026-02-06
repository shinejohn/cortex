#!/bin/bash
set -e

echo "🔧 Railway Database Connection Fix (Fallback Method)"
echo "===================================================="
echo ""
echo "This script uses actual values fetched from Railway services."
echo "Use this if service reference variables don't work."
echo ""

# Get actual values from Railway services
echo "📋 Fetching Database Connection Info from Railway..."
echo ""

# Get Postgres Publishing connection info
echo "Fetching Postgres Publishing connection info..."
echo ""
echo "⚠️  Note: Railway CLI may not expose all variables. If values are missing,"
echo "   get them manually from Railway Dashboard:"
echo "   Postgres Publishing → Connect tab → Internal Database URL"
echo ""

POSTGRES_VARS=$(railway variables --service "Postgres Publishing" --kv 2>&1 || echo "")

# Extract values (Railway outputs in format: VARIABLE=value)
# Try multiple possible variable names Railway might use
DB_HOST=$(echo "$POSTGRES_VARS" | grep -E "PGHOST|HOST|RAILWAY_PRIVATE_DOMAIN" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")
DB_PORT=$(echo "$POSTGRES_VARS" | grep -E "PGPORT|PORT" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "5432")
DB_DATABASE=$(echo "$POSTGRES_VARS" | grep -E "PGDATABASE|DATABASE" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")
DB_USERNAME=$(echo "$POSTGRES_VARS" | grep -E "PGUSER|USER" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")
DB_PASSWORD=$(echo "$POSTGRES_VARS" | grep -E "PGPASSWORD|PASSWORD" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")

# Try to get DATABASE_URL directly (Railway often provides this)
DATABASE_URL=$(echo "$POSTGRES_VARS" | grep -i "DATABASE_URL" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")

# If DATABASE_URL contains the full connection string, parse it
if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" == postgresql://* ]]; then
    # Extract components from DATABASE_URL if individual vars are missing
    if [ -z "$DB_USERNAME" ]; then
        DB_USERNAME=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
    fi
    if [ -z "$DB_PASSWORD" ]; then
        DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
    fi
    if [ -z "$DB_HOST" ]; then
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@\([^:]*\):.*|\1|p')
    fi
    if [ -z "$DB_PORT" ]; then
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
        [ -z "$DB_PORT" ] && DB_PORT="5432"
    fi
    if [ -z "$DB_DATABASE" ]; then
        DB_DATABASE=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^/]*/\(.*\)|\1|p' | cut -d'?' -f1)
    fi
fi

# If DATABASE_URL is not set, construct it
if [ -z "$DATABASE_URL" ] && [ -n "$DB_HOST" ] && [ -n "$DB_USERNAME" ] && [ -n "$DB_PASSWORD" ] && [ -n "$DB_DATABASE" ]; then
    DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"
fi

echo "Postgres Configuration:"
echo "  DB_HOST: ${DB_HOST:-⚠️  Not found}"
echo "  DB_PORT: ${DB_PORT:-⚠️  Not found}"
echo "  DB_DATABASE: ${DB_DATABASE:-⚠️  Not found}"
echo "  DB_USERNAME: ${DB_USERNAME:-⚠️  Not found}"
echo "  DB_PASSWORD: ${DB_PASSWORD:+✅ Set (hidden)}"
echo ""

# Get Valkey connection info
echo "Fetching Valkey connection info..."
VALKEY_VARS=$(railway variables --service "Valkey" --kv 2>&1 || echo "")

REDIS_HOST=$(echo "$VALKEY_VARS" | grep -i "REDIS_HOST\|HOST" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")
REDIS_PORT=$(echo "$VALKEY_VARS" | grep -i "REDIS_PORT\|PORT" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "6379")
REDIS_PASSWORD=$(echo "$VALKEY_VARS" | grep -i "REDIS_PASSWORD\|PASSWORD" | head -1 | cut -d'=' -f2- | tr -d ' ' || echo "")

echo "Valkey Configuration:"
echo "  REDIS_HOST: ${REDIS_HOST:-⚠️  Not found}"
echo "  REDIS_PORT: ${REDIS_PORT:-⚠️  Not found}"
echo "  REDIS_PASSWORD: ${REDIS_PASSWORD:+✅ Set (hidden)}"
echo ""

# Validate we have required values
if [ -z "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
    echo ""
    echo "❌ ERROR: Could not automatically fetch database connection info."
    echo ""
    echo "📋 Manual Steps Required:"
    echo ""
    echo "1. Go to Railway Dashboard"
    echo "2. Click on 'Postgres Publishing' service"
    echo "3. Click 'Connect' tab"
    echo "4. Copy the 'Internal Database URL' (format: postgresql://user:pass@host:port/db)"
    echo ""
    echo "5. Run this script with the URL as an argument:"
    echo "   ./railway-fix-database-fallback.sh 'postgresql://user:pass@host:port/db'"
    echo ""
    echo "   OR manually set DATABASE_URL on each service via Railway Dashboard"
    echo ""
    exit 1
fi

# Allow manual override via command line argument
if [ -n "$1" ] && [[ "$1" == postgresql://* ]]; then
    echo "Using provided DATABASE_URL from command line..."
    DATABASE_URL="$1"
    # Parse the provided URL
    DB_USERNAME=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
    DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@\([^:]*\):.*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@[^:]*:\([^/]*\)/.*|\1|p')
    [ -z "$DB_PORT" ] && DB_PORT="5432"
    DB_DATABASE=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^/]*/\(.*\)|\1|p' | cut -d'?' -f1)
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Fixing Frontend Apps..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTEND_APPS=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${FRONTEND_APPS[@]}"; do
    echo "  🔧 $SERVICE"
    
    if [ -n "$DATABASE_URL" ]; then
        railway variables --service "$SERVICE" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    fi
    
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    
    if [ -n "$DB_HOST" ]; then
        railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_PORT" ]; then
        railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_DATABASE" ]; then
        railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_USERNAME" ]; then
        railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_PASSWORD" ]; then
        railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    fi
    
    # Redis/Valkey
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
    if [ -n "$REDIS_HOST" ]; then
        railway variables --service "$SERVICE" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$REDIS_PORT" ]; then
        railway variables --service "$SERVICE" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$REDIS_PASSWORD" ]; then
        railway variables --service "$SERVICE" --set "REDIS_PASSWORD=$REDIS_PASSWORD" 2>&1 | grep -v "Warning" || true
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Fixing Backend Services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BACKEND_SERVICES=("Inertia SSR" "Horizon" "Scheduler")

for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo "  🔧 $SERVICE"
    
    if [ -n "$DATABASE_URL" ]; then
        railway variables --service "$SERVICE" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    fi
    
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    
    if [ -n "$DB_HOST" ]; then
        railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_PORT" ]; then
        railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_DATABASE" ]; then
        railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_USERNAME" ]; then
        railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$DB_PASSWORD" ]; then
        railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    fi
    
    # Redis/Valkey
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=phpredis" 2>&1 | grep -v "Warning" || true
    if [ -n "$REDIS_HOST" ]; then
        railway variables --service "$SERVICE" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$REDIS_PORT" ]; then
        railway variables --service "$SERVICE" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    fi
    if [ -n "$REDIS_PASSWORD" ]; then
        railway variables --service "$SERVICE" --set "REDIS_PASSWORD=$REDIS_PASSWORD" 2>&1 | grep -v "Warning" || true
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All database connection variables updated!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Next Steps:"
echo "1. Redeploy services from Railway Dashboard or run:"
echo "   railway up --service 'Day News'"
echo "2. Monitor logs to verify database connectivity"
echo ""
