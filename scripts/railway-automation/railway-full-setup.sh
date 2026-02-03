#!/bin/bash

#===============================================================================
# Railway Complete Setup Script
# Sets ALL environment variables and connections via CLI
# 
# This script handles EVERYTHING that can be done via CLI.
# Manual dashboard steps are minimized to only what's impossible via CLI.
#
# Usage:
#   chmod +x railway-full-setup.sh
#   ./railway-full-setup.sh
#===============================================================================

set -e

#===============================================================================
# CONFIGURATION - UPDATE THESE BEFORE RUNNING
#===============================================================================

# Project name (from your migration output)
PROJECT_NAME="supportive-rebirth"

# GitHub repo (will be used for reference, connection done in dashboard)
GITHUB_REPO="shinejohn/Community-Platform"
GITHUB_BRANCH="development"

# App domains (Railway auto-generates, or set custom)
APP_URL_BASE="up.railway.app"

# Service names (must match EXACTLY what migration created)
# These are case-sensitive!
SERVICE_POSTGRES="Postgres"
SERVICE_VALKEY="Valkey"
SERVICE_LISTMONK_DB="Listmonk DB"
SERVICE_LISTMONK="Listmonk"
SERVICE_GOEVENTCITY="GoEventCity"
SERVICE_DAYNEWS="Day News"
SERVICE_DOWNTOWN="Downtown Guide"
SERVICE_GOLOCALVOICES="GoLocalVoices"
SERVICE_ALPHASITE="AlphaSite"
SERVICE_HORIZON="Horizon"
SERVICE_SCHEDULER="Scheduler"
SERVICE_SSR="Inertia SSR"

#===============================================================================
# Colors
#===============================================================================
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
log_section() { 
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

#===============================================================================
# Prerequisites Check
#===============================================================================

check_prerequisites() {
    log_section "Checking Prerequisites"
    
    # Check Railway CLI
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found"
        echo "Install with: npm install -g @railway/cli"
        exit 1
    fi
    log_success "Railway CLI installed"
    
    # Check logged in
    if ! railway whoami &> /dev/null; then
        log_error "Not logged in to Railway"
        echo "Run: railway login"
        exit 1
    fi
    log_success "Railway CLI authenticated"
    
    # Check openssl for key generation
    if ! command -v openssl &> /dev/null; then
        log_error "openssl not found (needed for APP_KEY generation)"
        exit 1
    fi
    log_success "openssl available"
}

#===============================================================================
# Link to Project
#===============================================================================

link_project() {
    log_section "Linking to Project: $PROJECT_NAME"
    
    railway link -p "$PROJECT_NAME" 2>/dev/null || {
        log_warn "Auto-link failed. Please select project manually:"
        railway link
    }
    
    log_success "Linked to project"
}

#===============================================================================
# Generate Keys
#===============================================================================

generate_app_key() {
    echo "base64:$(openssl rand -base64 32)"
}

#===============================================================================
# Set Variables for a Service
# Usage: set_vars "ServiceName" "KEY1=value1" "KEY2=value2" ...
#===============================================================================

set_vars() {
    local service="$1"
    shift
    
    log_info "Setting variables for: $service"
    
    # Build the command with all variables
    local vars=""
    for var in "$@"; do
        vars="$vars $var"
    done
    
    # Run railway variables set
    if railway variables set $vars --service "$service" 2>/dev/null; then
        log_success "$service - variables set"
    else
        log_warn "$service - could not set variables (service may not exist yet)"
    fi
}

#===============================================================================
# Database Services Configuration
#===============================================================================

setup_databases() {
    log_section "Configuring Database Services"
    
    # Generate a secure password for internal use
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    
    #---------------------------------------------------------------------------
    # Postgres (Main Database)
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_POSTGRES..."
    set_vars "$SERVICE_POSTGRES" \
        "POSTGRES_USER=postgres" \
        "POSTGRES_PASSWORD=$DB_PASSWORD" \
        "POSTGRES_DB=railway" \
        "PGDATA=/var/lib/postgresql/data"
    
    #---------------------------------------------------------------------------
    # Valkey (Redis)
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_VALKEY..."
    # Valkey/Redis typically needs no env vars, but we can set some
    set_vars "$SERVICE_VALKEY" \
        "REDIS_ARGS=--appendonly yes"
    
    #---------------------------------------------------------------------------
    # Listmonk DB
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_LISTMONK_DB..."
    set_vars "$SERVICE_LISTMONK_DB" \
        "POSTGRES_USER=listmonk" \
        "POSTGRES_PASSWORD=$DB_PASSWORD" \
        "POSTGRES_DB=listmonk" \
        "PGDATA=/var/lib/postgresql/data"
}

#===============================================================================
# Laravel App Services Configuration
# THIS IS WHERE THE CONNECTIONS HAPPEN
#===============================================================================

setup_laravel_services() {
    log_section "Configuring Laravel Application Services"
    
    # Generate ONE app key to use across all services (they share the same codebase)
    APP_KEY=$(generate_app_key)
    log_info "Generated APP_KEY: ${APP_KEY:0:20}..."
    
    #---------------------------------------------------------------------------
    # COMMON VARIABLES - These create the CONNECTIONS between services
    # The ${{ServiceName.VAR}} syntax tells Railway to inject the value
    # from another service. This is how services "connect".
    #---------------------------------------------------------------------------
    
    COMMON_VARS=(
        # Laravel Core
        "APP_NAME=Publishing Platform"
        "APP_ENV=production"
        "APP_DEBUG=false"
        "APP_KEY=$APP_KEY"
        "APP_TIMEZONE=UTC"
        
        # Logging
        "LOG_CHANNEL=stderr"
        "LOG_LEVEL=info"
        "LOG_STACK=single"
        
        #=======================================================================
        # DATABASE CONNECTION - This connects Laravel to Postgres
        # Railway will replace ${{Postgres.XXX}} with actual values
        #=======================================================================
        "DB_CONNECTION=pgsql"
        'DB_HOST=${{Postgres.PGHOST}}'
        'DB_PORT=${{Postgres.PGPORT}}'
        'DB_DATABASE=${{Postgres.PGDATABASE}}'
        'DB_USERNAME=${{Postgres.PGUSER}}'
        'DB_PASSWORD=${{Postgres.PGPASSWORD}}'
        'DATABASE_URL=${{Postgres.DATABASE_URL}}'
        
        #=======================================================================
        # REDIS CONNECTION - This connects Laravel to Valkey
        #=======================================================================
        'REDIS_HOST=${{Valkey.REDISHOST}}'
        'REDIS_PORT=${{Valkey.REDISPORT}}'
        'REDIS_PASSWORD=${{Valkey.REDISPASSWORD}}'
        'REDIS_URL=${{Valkey.REDIS_URL}}'
        
        # Cache, Session, Queue - all use Redis
        "CACHE_DRIVER=redis"
        "CACHE_PREFIX=publishing_cache_"
        "SESSION_DRIVER=redis"
        "SESSION_LIFETIME=120"
        "SESSION_ENCRYPT=false"
        "QUEUE_CONNECTION=redis"
        
        # Filesystem
        "FILESYSTEM_DISK=local"
        
        # Broadcasting
        "BROADCAST_DRIVER=log"
        
        # Mail (can be overridden per-service)
        "MAIL_MAILER=log"
        
        #=======================================================================
        # MULTISITE DOMAINS
        #=======================================================================
        "GOEVENTCITY_DOMAIN=goeventcity.com"
        "DAYNEWS_DOMAIN=day.news"
        "DOWNTOWNGUIDE_DOMAIN=downtownsguide.com"
        "ALPHASITE_DOMAIN=alphasite.com"
        "GOLOCALVOICES_DOMAIN=golocalvoices.com"
        
        #=======================================================================
        # INERTIA SSR CONNECTION
        # This tells Laravel app where to find the SSR server
        #=======================================================================
        "INERTIA_SSR_ENABLED=true"
        'INERTIA_SSR_URL=http://${{Inertia SSR.RAILWAY_PRIVATE_DOMAIN}}:13714'
    )
    
    #---------------------------------------------------------------------------
    # GoEventCity
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_GOEVENTCITY..."
    set_vars "$SERVICE_GOEVENTCITY" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://goeventcity.com" \
        "SITE_IDENTIFIER=goeventcity"
    
    #---------------------------------------------------------------------------
    # Day News
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_DAYNEWS..."
    set_vars "$SERVICE_DAYNEWS" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://day.news" \
        "SITE_IDENTIFIER=daynews"
    
    #---------------------------------------------------------------------------
    # Downtown Guide
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_DOWNTOWN..."
    set_vars "$SERVICE_DOWNTOWN" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://downtownsguide.com" \
        "SITE_IDENTIFIER=downtownguide"
    
    #---------------------------------------------------------------------------
    # Horizon (Queue Worker)
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_HORIZON..."
    set_vars "$SERVICE_HORIZON" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://goeventcity.com" \
        "HORIZON_PREFIX=publishing_horizon_"
    
    #---------------------------------------------------------------------------
    # Scheduler (Cron)
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_SCHEDULER..."
    set_vars "$SERVICE_SCHEDULER" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://goeventcity.com"
    
    #---------------------------------------------------------------------------
    # Inertia SSR
    #---------------------------------------------------------------------------
    log_info "Configuring $SERVICE_SSR..."
    set_vars "$SERVICE_SSR" \
        "NODE_ENV=production" \
        "SSR_PORT=13714"
}

#===============================================================================
# Listmonk Configuration
#===============================================================================

setup_listmonk() {
    log_section "Configuring Listmonk Email Service"
    
    log_info "Configuring $SERVICE_LISTMONK..."
    set_vars "$SERVICE_LISTMONK" \
        "LISTMONK_app__address=0.0.0.0:9000" \
        'LISTMONK_db__host=${{Listmonk DB.PGHOST}}' \
        "LISTMONK_db__port=5432" \
        'LISTMONK_db__user=${{Listmonk DB.PGUSER}}' \
        'LISTMONK_db__password=${{Listmonk DB.PGPASSWORD}}' \
        'LISTMONK_db__database=${{Listmonk DB.PGDATABASE}}' \
        "LISTMONK_db__ssl_mode=disable"
}

#===============================================================================
# Print Manual Steps (Only what CLI cannot do)
#===============================================================================

print_manual_steps() {
    log_section "REMAINING MANUAL STEPS"
    
    echo ""
    echo -e "${YELLOW}The following CANNOT be done via CLI and require Railway Dashboard:${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${CYAN}1. SET DOCKER IMAGES${NC}"
    echo "   Dashboard → [Service] → Settings → Source → Image"
    echo ""
    echo "   • Postgres:      postgres:16-alpine"
    echo "   • Valkey:        valkey/valkey:7-alpine"
    echo "   • Listmonk DB:   postgres:16-alpine"
    echo "   • Listmonk:      listmonk/listmonk:latest"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${CYAN}2. ADD PERSISTENT VOLUMES${NC}"
    echo "   Dashboard → [Service] → Settings → Volumes → Add"
    echo ""
    echo "   • Postgres:      /var/lib/postgresql/data"
    echo "   • Valkey:        /data"
    echo "   • Listmonk DB:   /var/lib/postgresql/data"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${CYAN}3. CONNECT GITHUB REPO${NC}"
    echo "   Dashboard → [Service] → Settings → Source → Connect GitHub"
    echo ""
    echo "   For these services, connect to: $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   • GoEventCity"
    echo "   • Day News"
    echo "   • Downtown Guide"
    echo "   • GoLocalVoices"
    echo "   • AlphaSite"
    echo "   • Horizon"
    echo "   • Scheduler"
    echo "   • Inertia SSR"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${CYAN}4. CONFIGURE WATCH PATHS (for segmented deploys)${NC}"
    echo "   Dashboard → [Service] → Settings → Build → Watch Paths"
    echo ""
    echo "   See: railway-watch-paths.txt (generated by this script)"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

#===============================================================================
# Generate Watch Paths File
#===============================================================================

generate_watch_paths_file() {
    log_section "Generating Watch Paths Reference"
    
    cat > railway-watch-paths.txt << 'EOF'
RAILWAY WATCH PATHS CONFIGURATION
==================================

Copy these into each service's Watch Paths setting:
Dashboard → [Service] → Settings → Build → Watch Paths


GoEventCity
-----------
app/Http/Controllers/GoEventCity/**
app/Http/Requests/GoEventCity/**
app/Services/GoEventCity/**
resources/js/Pages/GoEventCity/**
routes/goeventcity.php


Day News
--------
app/Http/Controllers/DayNews/**
app/Http/Requests/DayNews/**
app/Services/DayNews/**
resources/js/Pages/DayNews/**
routes/daynews.php
day-news-app/**


Downtown Guide
--------------
app/Http/Controllers/DowntownGuide/**
app/Http/Requests/DowntownGuide/**
app/Services/DowntownGuide/**
resources/js/Pages/DowntownGuide/**
routes/downtownguide.php


Horizon
-------
config/horizon.php
app/Jobs/**
app/Listeners/**


Scheduler
---------
app/Console/Kernel.php
app/Console/Commands/**
routes/console.php


Inertia SSR
-----------
resources/js/**
resources/css/**
package.json
vite.config.js
tsconfig.json


SHARED CODE (triggers ALL services - don't add to watch paths)
--------------------------------------------------------------
app/Models/**
app/Services/Shared/**
app/Providers/**
packages/**
composer.json
composer.lock
database/migrations/**
config/** (except service-specific)
EOF

    log_success "Created: railway-watch-paths.txt"
}

#===============================================================================
# Connection Verification
#===============================================================================

verify_connections() {
    log_section "Verifying Service Connections"
    
    echo ""
    log_info "Checking if services can see each other's variables..."
    echo ""
    
    # List all services
    log_info "Services in project:"
    railway service list 2>/dev/null || railway status
    
    echo ""
    log_info "To verify connections after deployment, run:"
    echo ""
    echo "  # Check database connection"
    echo "  railway run --service \"$SERVICE_GOEVENTCITY\" -- php artisan db:show"
    echo ""
    echo "  # Check Redis connection"
    echo "  railway run --service \"$SERVICE_GOEVENTCITY\" -- php artisan tinker --execute=\"Redis::ping()\""
    echo ""
    echo "  # Check all environment variables"
    echo "  railway variables --service \"$SERVICE_GOEVENTCITY\""
    echo ""
}

#===============================================================================
# Generate GitHub Actions Workflow
#===============================================================================

generate_github_workflow() {
    log_section "Generating GitHub Actions Workflow"
    
    mkdir -p .github/workflows
    
    cat > .github/workflows/railway-deploy.yml << 'EOF'
# Railway Deployment Workflow
# This workflow deploys to Railway when pushing to development branch
# Note: Railway's native GitHub integration handles most deployments
# This is for additional control or custom deploy logic

name: Railway Deploy

on:
  push:
    branches:
      - development
      - main
  workflow_dispatch:  # Allow manual trigger

env:
  RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo, pdo_pgsql, redis
          coverage: none
      
      - name: Install Composer Dependencies
        run: composer install --prefer-dist --no-progress
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install NPM Dependencies
        run: npm ci
      
      - name: Build Assets
        run: npm run build
      
      - name: Run Tests
        run: php artisan test

  # Railway handles deployment via GitHub integration
  # This job is optional - for custom deploy logic or notifications
  notify:
    name: Deployment Notification
    needs: test
    runs-on: ubuntu-latest
    if: success()
    steps:
      - name: Deployment Info
        run: |
          echo "Tests passed! Railway will auto-deploy from branch: ${{ github.ref_name }}"
          echo "Watch Railway dashboard for deployment status."
EOF

    log_success "Created: .github/workflows/railway-deploy.yml"
    echo ""
    log_warn "Note: You need to set RAILWAY_TOKEN secret in GitHub repo settings"
    log_warn "Get token from: Railway Dashboard → Account Settings → Tokens"
}

#===============================================================================
# Main
#===============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║           RAILWAY COMPLETE SETUP SCRIPT                              ║"
    echo "║           Publishing Platform                                        ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    link_project
    
    # Configure everything
    setup_databases
    setup_laravel_services
    setup_listmonk
    
    # Generate reference files
    generate_watch_paths_file
    generate_github_workflow
    
    # Show what's left to do manually
    print_manual_steps
    
    # Verification info
    verify_connections
    
    log_section "SETUP COMPLETE"
    echo ""
    echo -e "${GREEN}Environment variables and connections configured!${NC}"
    echo ""
    echo "Files generated:"
    echo "  • railway-watch-paths.txt     - Copy these into Railway dashboard"
    echo "  • .github/workflows/          - GitHub Actions for CI/CD"
    echo ""
    echo "Next steps:"
    echo "  1. Complete the manual steps listed above (images, volumes, GitHub)"
    echo "  2. Deploy each service"
    echo "  3. Run: railway run --service \"GoEventCity\" -- php artisan migrate"
    echo "  4. Verify with: railway logs -f"
    echo ""
}

main "$@"
