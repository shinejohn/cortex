#!/bin/bash

# Railway Variables Fix Script
# This script ensures all services have the correct critical variables set

set -e

echo "🔧 Railway Variables Fix Script"
echo "================================"
echo ""

# Database connection details (from Postgres Publishing service)
DB_HOST="postgres-publishing.railway.internal"
DB_PORT="5432"
DB_DATABASE="railway"
DB_USERNAME="postgres"
DB_PASSWORD="kXOyoJTnDLmQAyTsTFwemX0abfQxylXn"

# Services to fix
SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite")

echo "📋 Fixing database variables for all services..."
echo ""

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Set individual DB variables (matching Downtown Guide)
    # Railway CLI requires --set for each variable separately
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    
    echo "✅ Database variables set for $SERVICE"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All database variables have been set!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next steps:"
echo "1. Services will automatically redeploy"
echo "2. Check Railway dashboard for deployment status"
echo "3. Monitor logs to ensure services stay online"
echo ""
