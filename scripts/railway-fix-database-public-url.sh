#!/bin/bash
set -e

echo "🔧 Fixing DATABASE_PUBLIC_URL for All Services"
echo "==============================================="
echo ""

CORRECT_PASSWORD="kXOyoJTnDLmQAyTsTFwemXOabfQxylXn"
CORRECT_HOST="postgres.railway.internal"
CORRECT_PORT="5432"
CORRECT_DATABASE="railway"
CORRECT_USERNAME="postgres"
CORRECT_DATABASE_PUBLIC_URL="postgresql://${CORRECT_USERNAME}:${CORRECT_PASSWORD}@${CORRECT_HOST}:${CORRECT_PORT}/${CORRECT_DATABASE}"

ALL_SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide" "Inertia SSR" "Horizon" "Scheduler")

for SERVICE in "${ALL_SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    railway variables --service "$SERVICE" --set "DATABASE_PUBLIC_URL=$CORRECT_DATABASE_PUBLIC_URL" 2>&1 | grep -v "Warning" || true
    
    echo "✅ Fixed DATABASE_PUBLIC_URL"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All DATABASE_PUBLIC_URL variables fixed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verifying..."
for SERVICE in "${ALL_SERVICES[@]}"; do
    echo "  $SERVICE:"
    railway variables --service "$SERVICE" --kv 2>&1 | grep "DATABASE_PUBLIC_URL" | sed 's/^/    /' || echo "    ⚠️  Not found"
done
