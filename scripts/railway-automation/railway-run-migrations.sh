#!/bin/bash

#===============================================================================
# Railway Run Migrations Script
# Runs Laravel migrations on Postgres Publishing database
#===============================================================================

set -e

PROJECT_NAME="${1:-Shine Dev Environment}"
SERVICE_NAME="${2:-GoEventCity}"  # Service to run migrations from

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           RAILWAY RUN MIGRATIONS                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    log_error "Railway CLI not found"
    echo "Install with: npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    log_error "Not logged in to Railway"
    echo ""
    echo "Please run: railway login"
    echo "Then re-run this script"
    exit 1
fi

log_success "Railway CLI authenticated"

# Link to project
log_info "Linking to project: $PROJECT_NAME"
if railway link -p "$PROJECT_NAME" 2>/dev/null; then
    log_success "Linked to project"
else
    log_warn "Auto-link failed, please select project manually"
    railway link
fi

# Check service exists
log_info "Checking service: $SERVICE_NAME"
if railway service list 2>/dev/null | grep -q "$SERVICE_NAME"; then
    log_success "Service found: $SERVICE_NAME"
else
    log_error "Service '$SERVICE_NAME' not found"
    echo ""
    echo "Available services:"
    railway service list 2>/dev/null || echo "  (could not list services)"
    exit 1
fi

# Run migrations
echo ""
log_info "Running migrations on Postgres Publishing database..."
echo ""
echo "This will run: php artisan migrate --force"
echo ""

if railway run --service "$SERVICE_NAME" -- php artisan migrate --force; then
    echo ""
    log_success "Migrations completed successfully!"
    echo ""
    log_info "To verify, you can run:"
    echo "  railway run --service \"$SERVICE_NAME\" -- php artisan migrate:status"
else
    echo ""
    log_error "Migrations failed"
    echo ""
    log_info "Troubleshooting:"
    echo "  1. Check that DATABASE_URL is set correctly"
    echo "  2. Verify Postgres Publishing service is online"
    echo "  3. Check service logs: railway logs --service \"$SERVICE_NAME\""
    exit 1
fi

echo ""
log_info "Migration complete!"
echo ""
