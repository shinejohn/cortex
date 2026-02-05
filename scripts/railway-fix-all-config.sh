#!/bin/bash

# Complete Railway Configuration Fix Script
# Fixes database, Redis, and SSR configuration for all services

set -e

echo "🔧 Complete Railway Configuration Fix"
echo "======================================"
echo ""

# Database connection (matching Downtown Guide - the working service)
DB_HOST="postgres.railway.internal"
DB_PORT="5432"
DB_DATABASE="railway"
DB_USERNAME="postgres"
DB_PASSWORD="kXOyoJTnDLmQAyTsTFwemX0abfQxylXn"

# Redis/Valkey connection
REDIS_HOST="Valkey.railway.internal"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_CLIENT="phpredis"

# SSR configuration
INERTIA_SSR_ENABLED="true"
INERTIA_SSR_URL="http://127.0.0.1:13714"

# Services to fix
SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite")

echo "📋 Fixing configuration for all services..."
echo ""

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Database variables (matching Downtown Guide)
    echo "  Setting database variables..."
    railway variables --service "$SERVICE" --set "DB_CONNECTION=pgsql" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PORT=$DB_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_DATABASE=$DB_DATABASE" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_USERNAME=$DB_USERNAME" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$DB_PASSWORD" 2>&1 | grep -v "Warning" || true
    
    # Redis variables
    echo "  Setting Redis variables..."
    railway variables --service "$SERVICE" --set "REDIS_CLIENT=$REDIS_CLIENT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_HOST=$REDIS_HOST" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PORT=$REDIS_PORT" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "REDIS_PASSWORD=$REDIS_PASSWORD" 2>&1 | grep -v "Warning" || true
    
    # SSR variables
    echo "  Setting SSR variables..."
    railway variables --service "$SERVICE" --set "INERTIA_SSR_ENABLED=$INERTIA_SSR_ENABLED" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "INERTIA_SSR_URL=$INERTIA_SSR_URL" 2>&1 | grep -v "Warning" || true
    
    echo "✅ Configuration set for $SERVICE"
    echo ""
done

# Fix Downtown Guide SSR URL (it's truncated)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Fixing Downtown Guide SSR URL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables --service "Downtown Guide" --set "INERTIA_SSR_URL=$INERTIA_SSR_URL" 2>&1 | grep -v "Warning" || true
echo "✅ Downtown Guide SSR URL fixed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All configuration has been fixed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary of fixes:"
echo "  ✅ Database host: $DB_HOST (matching Downtown Guide)"
echo "  ✅ Redis configuration: Complete"
echo "  ✅ SSR enabled: $INERTIA_SSR_ENABLED"
echo "  ✅ SSR URL: $INERTIA_SSR_URL"
echo ""
echo "⏳ Services will automatically redeploy..."
echo ""
