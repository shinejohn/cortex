#!/bin/bash
set -e

echo "🔧 Linking railway.json Files to Services"
echo "=========================================="
echo ""

echo "⚠️  Railway reads railway.json from the repository root."
echo "   For service-specific configs, you need to:"
echo ""
echo "   1. Create service-specific directories, OR"
echo "   2. Set start commands via Railway Dashboard"
echo ""
echo "Since Railway uses a single repo for all services,"
echo "start commands are typically set via Dashboard."
echo ""
echo "However, we can try linking each service to check:"
echo ""

# Try linking services (this may not work for setting start commands)
for service in "Inertia SSR" "Horizon" "Scheduler"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 $service"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    railway service "$service" 2>&1 | head -3 || echo "Service linked"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Service linking complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Note: Start commands still need to be set via Railway Dashboard"
echo "   Railway CLI doesn't support setting startCommand directly"
echo ""
