#!/bin/bash
set -e

echo "🔧 Setting Start Commands for All Backend Services"
echo "=================================================="
echo ""

echo "Setting start commands via RAILWAY_START_COMMAND environment variable..."
echo ""

# Set start commands for backend services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Inertia SSR"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables --service "Inertia SSR" --set "RAILWAY_START_COMMAND=php artisan inertia:start-ssr" 2>&1 | grep -v "Warning" || true
echo "✅ Set start command for Inertia SSR"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Horizon"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables --service "Horizon" --set "RAILWAY_START_COMMAND=php artisan horizon" 2>&1 | grep -v "Warning" || true
echo "✅ Set start command for Horizon"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Scheduler"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway variables --service "Scheduler" --set "RAILWAY_START_COMMAND=php artisan schedule:work" 2>&1 | grep -v "Warning" || true
echo "✅ Set start command for Scheduler"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All start commands set!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verifying..."
for service in "Inertia SSR" "Horizon" "Scheduler"; do
    echo "  $service:"
    railway variables --service "$service" --kv 2>&1 | grep "RAILWAY_START_COMMAND" | sed 's/^/    /' || echo "    ⚠️  Not found (may need to use Settings → Deploy → Start Command)"
done
