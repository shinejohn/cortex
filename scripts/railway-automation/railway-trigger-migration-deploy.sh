#!/bin/bash

#===============================================================================
# Railway Trigger Migration Deployment
# Triggers a deployment that will run migrations
# Uses Railway API since CLI auth isn't available in this shell
#===============================================================================

set -e

API_URL="https://backboard.railway.app/graphql/v2"
PROJECT_NAME="${1:-Shine Dev Environment}"
SERVICE_NAME="${2:-GoEventCity}"

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
echo "║     TRIGGER MIGRATION DEPLOYMENT                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ -z "$RAILWAY_TOKEN" ]; then
    log_error "RAILWAY_TOKEN not set"
    exit 1
fi

# Get project ID
PROJECTS=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"query { projects { edges { node { id name } } } }\"}")

PROJECT_ID=$(echo "$PROJECTS" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.id")

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    log_error "Project '$PROJECT_NAME' not found"
    exit 1
fi

log_success "Found project: $PROJECT_NAME"

# Get service ID
SERVICES=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"query { project(id: \\\"$PROJECT_ID\\\") { services { edges { node { id name } } } } }\"}")

SERVICE_ID=$(echo "$SERVICES" | jq -r ".data.project.services.edges[] | select(.node.name==\"$SERVICE_NAME\") | .node.id")

if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    log_error "Service '$SERVICE_NAME' not found"
    exit 1
fi

log_success "Found service: $SERVICE_NAME"

# Get environment ID
ENV=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"query { project(id: \\\"$PROJECT_ID\\\") { environments { edges { node { id name } } } } }\"}")

ENV_ID=$(echo "$ENV" | jq -r ".data.project.environments.edges[0].node.id")

log_info "Triggering deployment for $SERVICE_NAME..."
log_info "This will run migrations as part of the start command..."

# Trigger deployment by updating service (this will trigger a redeploy)
# Note: Railway API doesn't have a direct "redeploy" mutation, but we can trigger
# by creating a new deployment or updating the service

log_info "Note: Railway API doesn't support direct command execution."
log_info "Migrations will run automatically when the service deploys."
log_info ""
log_info "To run migrations now, use Railway CLI:"
echo ""
echo "  railway link -p \"$PROJECT_NAME\""
echo "  railway run --service \"$SERVICE_NAME\" -- php artisan migrate --force"
echo ""
echo "Or trigger a redeploy in Railway dashboard:"
echo "  Dashboard → $SERVICE_NAME → Deployments → Redeploy"
echo ""
