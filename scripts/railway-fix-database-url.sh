#!/bin/bash
set -e

echo "🔧 Fixing DATABASE_URL with correct password"
echo "=========================================="
echo ""

# Correct password from Postgres Publishing service (capital O, not zero)
CORRECT_PASSWORD="kXOyoJTnDLmQAyTsTFwemXOabfQxylXn"
DB_HOST="postgres.railway.internal"
DB_PORT="5432"
DB_DATABASE="railway"
DB_USERNAME="postgres"

# Build correct DATABASE_URL
CORRECT_DATABASE_URL="postgresql://${DB_USERNAME}:${CORRECT_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}"

echo "Correct DATABASE_URL: ${CORRECT_DATABASE_URL:0:60}..."
echo ""

SERVICES=("Day News" "GoEventCity" "Go Local Voices" "Alphasite" "Downtown Guide")

for SERVICE in "${SERVICES[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Service: $SERVICE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    railway variables --service "$SERVICE" --set "DATABASE_URL=$CORRECT_DATABASE_URL" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_PASSWORD=$CORRECT_PASSWORD" 2>&1 | grep -v "Warning" || true
    railway variables --service "$SERVICE" --set "DB_HOST=$DB_HOST" 2>&1 | grep -v "Warning" || true
    echo "✅ Updated $SERVICE"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All DATABASE_URL passwords fixed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
