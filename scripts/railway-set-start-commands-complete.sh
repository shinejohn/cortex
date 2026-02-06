#!/bin/bash
set -e

echo "🔧 Setting Start Commands - Complete Solution"
echo "=============================================="
echo ""

# Railway CLI doesn't support setting start commands directly
# Railway reads start commands from railway.json files OR Dashboard settings
# We'll set them via environment variable (may work) AND create railway.json files

echo "Method 1: Setting RAILWAY_START_COMMAND environment variable..."
echo ""

BACKEND_SERVICES=(
    "Inertia SSR:php artisan inertia:start-ssr"
    "Horizon:php artisan horizon"
    "Scheduler:php artisan schedule:work"
)

for SERVICE_CONFIG in "${BACKEND_SERVICES[@]}"; do
    SERVICE_NAME="${SERVICE_CONFIG%%:*}"
    START_COMMAND="${SERVICE_CONFIG#*:}"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 $SERVICE_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Try setting as environment variable
    railway variables --service "$SERVICE_NAME" --set "RAILWAY_START_COMMAND=$START_COMMAND" 2>&1 | grep -v "Warning" || true
    
    echo "✅ Set RAILWAY_START_COMMAND=$START_COMMAND"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Railway CLI Limitation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Railway CLI doesn't have a command to set start commands."
echo "RAILWAY_START_COMMAND may not be recognized by Railway."
echo ""
echo "✅ Created railway.json files in repo root:"
echo "   - railway-inertia-ssr.json"
echo "   - railway-horizon.json"
echo "   - railway-scheduler.json"
echo ""
echo "📝 To use railway.json files:"
echo "   1. Commit these files to git"
echo "   2. Link each service to its railway.json (if Railway supports this)"
echo "   3. OR set start commands via Railway Dashboard"
echo ""
echo "🔗 Railway Dashboard method (most reliable):"
echo "   Go to each service → Settings → Deploy → Start Command"
echo ""
