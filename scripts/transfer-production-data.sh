#!/bin/bash
set -e

# Usage: ./scripts/transfer-production-data.sh "SOURCE_DB_URL" "TARGET_DB_URL"
# Example: ./scripts/transfer-production-data.sh "postgresql://postgres:pass@roundhouse.proxy.railway.app:1234/railway" "postgresql://..."

SOURCE_URL="$1"
TARGET_URL="$2"

if [ -z "$SOURCE_URL" ] || [ -z "$TARGET_URL" ]; then
    echo "❌ Usage: $0 <SOURCE_DB_URL> <TARGET_DB_URL>"
    echo "   You must provide the connection strings for both databases."
    exit 1
fi

echo "🔍 Verifying connectivity to Source..."
psql "$SOURCE_URL" -c "SELECT count(*) FROM regions;" || { echo "❌ Could not connect to Source DB"; exit 1; }

echo "🚀 Starting Data Transfer..."

# 1. Export Regions (The Pinellas/Florida Data)
echo "📦 Exporting Regions..."
pg_dump "$SOURCE_URL" \
    --data-only \
    --table=regions \
    --table=region_zipcodes \
    --column-inserts \
    --on-conflict-do-nothing \
    > regions_dump.sql

# 2. Export Fetch Configurations (The Logic/Scheduler)
echo "📦 Exporting Fetch Frequencies..."
pg_dump "$SOURCE_URL" \
    --data-only \
    --table=news_fetch_frequencies \
    --table=news_workflow_settings \
    --column-inserts \
    --on-conflict-do-nothing \
    > settings_dump.sql

# 3. Export Discovered Businesses (The Context)
echo "📦 Exporting Businesses..."
pg_dump "$SOURCE_URL" \
    --data-only \
    --table=businesses \
    --table=business_region \
    --column-inserts \
    --on-conflict-do-nothing \
    > business_dump.sql

# 4. Import to Target
echo "📥 Importing to Target Database..."

echo "   - Importing Regions..."
psql "$TARGET_URL" -f regions_dump.sql

echo "   - Importing Settings..."
psql "$TARGET_URL" -f settings_dump.sql

echo "   - Importing Businesses..."
psql "$TARGET_URL" -f business_dump.sql

# Cleanup
rm regions_dump.sql settings_dump.sql business_dump.sql

echo "✅ Transfer Complete! 'All of Florida' should now be in your database."
