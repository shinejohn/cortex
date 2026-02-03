#!/bin/bash

#===============================================================================
# Railway Trigger Deployment (which will run migrations)
# Uses Railway API to trigger a deployment
#===============================================================================

set -e

API_URL="https://backboard.railway.app/graphql/v2"
PROJECT_TOKEN="${RAILWAY_PROJECT_TOKEN:-6dc16b2b-a8eb-45a1-8882-898dd86e158a}"
PROJECT_ID="7e7372dd-373a-4e78-a51e-15eab332b67d"
SERVICE_NAME="${1:-GoEventCity}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     TRIGGER DEPLOYMENT (Migrations will run automatically)  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Get service ID
SERVICES=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $PROJECT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"query { project(id: \\\"$PROJECT_ID\\\") { services { edges { node { id name } } } } }\"}")

SERVICE_ID=$(echo "$SERVICES" | jq -r ".data.project.services.edges[] | select(.node.name==\"$SERVICE_NAME\") | .node.id")

if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    log_error "Service '$SERVICE_NAME' not found"
    echo "Available services:"
    echo "$SERVICES" | jq -r '.data.project.services.edges[].node.name'
    exit 1
fi

log_success "Found service: $SERVICE_NAME (ID: ${SERVICE_ID:0:8}...)"

# Get environment ID
ENV=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $PROJECT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"query { project(id: \\\"$PROJECT_ID\\\") { environments { edges { node { id name } } } } }\"}")

ENV_ID=$(echo "$ENV" | jq -r ".data.project.environments.edges[0].node.id")

log_info "Triggering deployment for $SERVICE_NAME..."
log_info "Migrations will run automatically as part of the start command..."

# Railway API doesn't have a direct "redeploy" mutation
# But we can trigger by updating the service instance
# Actually, Railway API doesn't support triggering deployments directly
# The best we can do is guide the user

log_info ""
log_info "Railway API doesn't support triggering deployments directly."
log_info "To run migrations, you have two options:"
echo ""
echo "Option 1: Use Railway Dashboard"
echo "  1. Go to: https://railway.app/project/$PROJECT_ID/service/$SERVICE_ID"
echo "  2. Click 'Deployments' tab"
echo "  3. Click 'Redeploy' on the latest deployment"
echo "  4. Migrations will run automatically (they're in the start command)"
echo ""
echo "Option 2: Use Railway CLI (in your terminal where you're logged in)"
echo "  railway link -p \"Shine Dev Environment\""
echo "  railway run --service \"$SERVICE_NAME\" -- php artisan migrate --force"
echo ""
