#!/bin/bash

#===============================================================================
# RAILWAY BUILD DIAGNOSTICS
# Gets build logs for all failed services
#===============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           RAILWAY BUILD DIAGNOSTICS                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Laravel/App services that need GitHub builds
APP_SERVICES=(
    "GoEventCity"
    "Day News"
    "Downtown Guide"
    "Go Local Voices"
    "Alphasite"
    "Scheduler"
    "Horizon"
    "Inertia SSR"
)

OUTPUT_DIR="./railway-build-logs"
mkdir -p "$OUTPUT_DIR"

echo "Collecting build logs for all app services..."
echo "Logs will be saved to: $OUTPUT_DIR"
echo ""

for SERVICE in "${APP_SERVICES[@]}"; do
    echo "----------------------------------------"
    echo "Service: $SERVICE"
    echo "----------------------------------------"
    
    LOG_FILE="$OUTPUT_DIR/${SERVICE// /-}-build.log"
    
    echo "Fetching build logs..."
    railway logs -s "$SERVICE" --build --limit 200 > "$LOG_FILE" 2>&1 || echo "  Could not fetch logs"
    
    # Show last 20 lines (usually contains the error)
    echo ""
    echo "Last 20 lines:"
    tail -20 "$LOG_FILE" 2>/dev/null || echo "  No logs available"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "All build logs saved to: $OUTPUT_DIR"
echo ""
echo "To view a specific log:"
echo "  cat $OUTPUT_DIR/GoEventCity-build.log"
echo ""
echo "Common issues to look for:"
echo "  - 'npm ERR!' - Node.js build failure"
echo "  - 'composer install' errors - PHP dependency issues"
echo "  - 'ENOENT' - Missing file"
echo "  - 'memory' - Out of memory during build"
echo "  - 'connection refused' - Database not ready"
echo ""
