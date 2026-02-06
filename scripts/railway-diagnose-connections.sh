#!/bin/bash

echo "🔍 Railway Connection Diagnostics"
echo "=================================="
echo ""

echo "📋 Checking Postgres Publishing Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables --service "Postgres Publishing" --kv 2>&1 | grep -E "DATABASE_URL|PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|HOST|PORT" | head -10 || echo "⚠️  Could not fetch variables"
echo ""

echo "📋 Checking Valkey Service..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables --service "Valkey" --kv 2>&1 | grep -E "REDIS|HOST|PORT|PASSWORD" | head -10 || echo "⚠️  Could not fetch variables"
echo ""

echo "📋 Checking Frontend App Database Configurations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FRONTEND_APPS=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${FRONTEND_APPS[@]}"; do
    echo ""
    echo "🔍 $SERVICE:"
    echo "  Database Variables:"
    railway variables --service "$SERVICE" --kv 2>&1 | grep -E "DATABASE_URL|DB_HOST|DB_PORT|DB_DATABASE|DB_USERNAME|DB_CONNECTION" | sed 's/^/    /' || echo "    ⚠️  No database variables found"
    echo "  Redis Variables:"
    railway variables --service "$SERVICE" --kv 2>&1 | grep -E "REDIS_HOST|REDIS_PORT|REDIS_CLIENT" | sed 's/^/    /' || echo "    ⚠️  No Redis variables found"
done

echo ""
echo "📋 Checking Backend Service Database Configurations..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKEND_SERVICES=("Inertia SSR" "Horizon" "Scheduler")

for SERVICE in "${BACKEND_SERVICES[@]}"; do
    echo ""
    echo "🔍 $SERVICE:"
    echo "  Database Variables:"
    railway variables --service "$SERVICE" --kv 2>&1 | grep -E "DATABASE_URL|DB_HOST|DB_PORT|DB_DATABASE|DB_USERNAME|DB_CONNECTION" | sed 's/^/    /' || echo "    ⚠️  No database variables found"
    echo "  Redis Variables:"
    railway variables --service "$SERVICE" --kv 2>&1 | grep -E "REDIS_HOST|REDIS_PORT|REDIS_CLIENT" | sed 's/^/    /' || echo "    ⚠️  No Redis variables found"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Diagnostics Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tips:"
echo "  - Check if DB_HOST values match Postgres Publishing internal hostname"
echo "  - Verify DATABASE_URL uses internal Railway hostname (not public URL)"
echo "  - Internal hostnames typically end with .railway.internal"
echo ""
