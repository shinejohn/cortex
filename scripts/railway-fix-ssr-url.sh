#!/bin/bash
set -e

echo "🔧 Fixing SSR URL to use Railway internal domain"
echo "=================================================="
echo ""

# Correct SSR URL using Railway internal domain
CORRECT_SSR_URL="http://inertia-ssr.railway.internal:13714"

echo "Updating INERTIA_SSR_URL to: $CORRECT_SSR_URL"
echo ""

SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    railway variables --service "$SERVICE" --set "INERTIA_SSR_URL=$CORRECT_SSR_URL" 2>&1 | grep -v "Warning" || true
    echo "✅ Updated $SERVICE"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All SSR URLs updated!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verifying..."
for SERVICE in "${SERVICES[@]}"; do
    echo "  $SERVICE:"
    railway variables --service "$SERVICE" --kv 2>&1 | grep "INERTIA_SSR_URL" | sed 's/^/    /'
done
