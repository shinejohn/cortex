#!/bin/bash
# Import all 86 shared variables from Climactic to Shine Dev Environment
# This script will set these variables on ALL services

set -e

echo "=========================================="
echo "IMPORTING 86 SHARED VARIABLES"
echo "From: Climactic → To: Shine Dev Environment"
echo "=========================================="
echo ""

# Define all services
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

# Source the variables file
ENV_FILE="/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/climactic-shared-variables.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Error: $ENV_FILE not found!"
  exit 1
fi

echo "📄 Loading variables from: $ENV_FILE"
echo ""

# Count variables
VAR_COUNT=$(grep -v '^#' "$ENV_FILE" | grep -v '^$' | grep '=' | wc -l | tr -d ' ')
echo "✅ Found $VAR_COUNT variables to import"
echo ""

# Apply to each service
for service in "${SERVICES[@]}"; do
  echo "=========================================="
  echo "Configuring: $service"
  echo "=========================================="
  
  # Read and set variables one by one
  count=0
  while IFS= read -r line; do
    # Skip comments and empty lines
    if [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]]; then
      continue
    fi
    
    # Skip lines without =
    if [[ ! "$line" =~ = ]]; then
      continue
    fi
    
    count=$((count + 1))
    echo "[$count/$VAR_COUNT] Setting: ${line%%=*}"
    
    # Set the variable (skip deploys to speed up)
    railway variables --service "$service" --skip-deploys --set "$line"
  done < "$ENV_FILE"
  
  echo "✅ $service configured with $count variables"
  echo ""
done

echo ""
echo "=========================================="
echo "✅ ALL SERVICES CONFIGURED!"
echo "=========================================="
echo ""
echo "Total variables set per service: $VAR_COUNT"
echo ""
echo "Next steps:"
echo "1. Redeploy all services to apply the new variables"
echo "2. Run: ./redeploy-all-services.sh"
echo ""
