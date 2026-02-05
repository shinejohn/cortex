#!/bin/bash

# Fix Database Password Script
# Uses Downtown Guide's working configuration

set -e

echo "🔧 Fixing Database Passwords"
echo "============================"
echo ""

# Get Downtown Guide's working configuration
echo "📋 Getting Downtown Guide's working configuration..."
DTG_VARS=$(railway variables --service "Downtown Guide" --kv 2>&1)

# Extract the correct password and host
DB_PASSWORD=$(echo "$DTG_VARS" | grep "^DB_PASSWORD=" | cut -d'=' -f2-)
DB_HOST=$(echo "$DTG_VARS" | grep "^DB_HOST=" | cut -d'=' -f2-)
DATABASE_URL=$(echo "$DTG_VARS" | grep "^DATABASE_URL=" | cut -d'=' -f2-)

echo "Downtown Guide Configuration:"
echo "  DB_HOST: $DB_HOST"
echo "  DB_PASSWORD: ${DB_PASSWORD:0:20}..."
echo "  DATABASE_URL: ${DATABASE_URL:0:50}..."
echo ""

# Services to fix
SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite")

echo "📋 Updating all services to match Downtown Guide..."
echo ""

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Update database variables to match Downtown Guide exactly
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DATABASE_URL=$DATABASE_URL" 2>&1 | grep -v "Warning" || true
    
    echo "✅ Updated $SERVICE"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All services updated to match Downtown Guide!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
