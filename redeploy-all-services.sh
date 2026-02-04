#!/bin/bash
# Redeploy all services after importing shared variables

set -e

echo "=========================================="
echo "REDEPLOYING ALL SERVICES"
echo "=========================================="
echo ""

SERVICES=(
  "GoEventCity"
  "Alphasite"
  "Day News"
  "Downtown Guide"
  "Go Local Voices"
  "Horizon"
  "Scheduler"
  "Inertia SSR"
)

for service in "${SERVICES[@]}"; do
  echo "Redeploying: $service"
  railway redeploy --service "$service" --yes
  echo "✅ $service redeploy triggered"
  echo ""
done

echo ""
echo "=========================================="
echo "✅ ALL SERVICES REDEPLOYING!"
echo "=========================================="
echo ""
echo "Deployments will take 10-15 minutes to complete."
echo "Monitor progress in the Railway dashboard."
