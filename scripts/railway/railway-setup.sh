#!/bin/bash

#===============================================================================
# Railway Project Setup Script
# Publishing Platform Clone
#
# This script automates the configuration of a cloned Railway project.
# Run this AFTER the migration script has created the service shells.
#
# Prerequisites:
#   - Railway CLI installed: npm install -g @railway/cli
#   - Logged in: railway login
#   - Target project exists with services created
#
# Usage:
#   chmod +x railway-setup.sh
#   ./railway-setup.sh
#===============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - UPDATE THESE
TARGET_PROJECT_NAME="supportive-rebirth"  # Your cloned project name
TARGET_PROJECT_ID="0b1f921d-40ba-4608-8d56-19fa3ac1d9b5"  # Project ID
RAILWAY_TOKEN="${RAILWAY_TOKEN:-a8d77a1c-9154-46e8-92d9-fea6ae7e241c}"  # API Token
GITHUB_REPO="shinejohn/Community-Platform"
GITHUB_BRANCH="development"

# Domain configuration - UPDATE THESE
GOEVENTCITY_DOMAIN="goeventcity-dev.up.railway.app"
DAYNEWS_DOMAIN="daynews-dev.up.railway.app"
DOWNTOWNGUIDE_DOMAIN="downtown-dev.up.railway.app"
ALPHASITE_DOMAIN="alphasite-dev.up.railway.app"
GOLOCALVOICES_DOMAIN="voices-dev.up.railway.app"

#===============================================================================
# Helper Functions
#===============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}"
}

print_step() {
    echo -e "${GREEN}→ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_manual() {
    echo -e "${YELLOW}📋 MANUAL STEP: $1${NC}"
}

# Check if Railway CLI is installed and logged in
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check API token authentication
    AUTH_TEST=$(curl -s -X POST https://backboard.railway.app/graphql/v2 \
      -H "Authorization: Bearer $RAILWAY_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"query": "query { projects { edges { node { id name } } } }"}' 2>/dev/null)
    
    if echo "$AUTH_TEST" | jq -e '.data.projects' > /dev/null 2>&1; then
        print_success "Railway API authentication successful"
        USE_API=true
    else
        # Fallback to CLI if API fails
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI not found and API token invalid. Install CLI: npm install -g @railway/cli"
            exit 1
        fi
        print_success "Railway CLI found"
        
        if ! railway whoami &> /dev/null; then
            print_error "Not logged in to Railway. Run: railway login"
            exit 1
        fi
        print_success "Logged in to Railway"
        USE_API=false
    fi
}

# Link to the target project
link_project() {
    print_header "Linking to Target Project"
    print_step "Using project: $TARGET_PROJECT_NAME (ID: $TARGET_PROJECT_ID)"
    
    if [ "$USE_API" = true ]; then
        # Verify project exists via API
        PROJECT_CHECK=$(curl -s -X POST https://backboard.railway.app/graphql/v2 \
          -H "Authorization: Bearer $RAILWAY_TOKEN" \
          -H "Content-Type: application/json" \
          -d "{\"query\": \"query { project(id: \\\"$TARGET_PROJECT_ID\\\") { id name } }\"}")
        
        if echo "$PROJECT_CHECK" | jq -e '.data.project.id' > /dev/null 2>&1; then
            print_success "Project verified via API"
        else
            print_error "Project not found. Check TARGET_PROJECT_ID"
            exit 1
        fi
    else
        # Use CLI
        railway link -p "$TARGET_PROJECT_NAME" 2>/dev/null || {
            print_warning "Could not auto-link. Please select the project manually:"
            railway link
        }
        print_success "Linked to project"
    fi
}

#===============================================================================
# Database Configuration
#===============================================================================

setup_postgres() {
    print_header "Setting Up PostgreSQL"
    
    print_manual "In Railway Dashboard → Postgres service → Settings → Source:"
    echo "  1. Set Image to: postgres:16-alpine"
    echo "  2. Or for PostGIS: postgis/postgis:16-3.4"
    echo ""
    print_manual "Then add Volume:"
    echo "  1. Go to Settings → Volumes"
    echo "  2. Mount Path: /var/lib/postgresql/data"
    echo "  3. Size: Start with 1GB, can expand later"
    echo ""
    
    # Set Postgres environment variables
    print_step "Setting Postgres environment variables..."
    railway variables set \
        POSTGRES_USER=postgres \
        POSTGRES_DB=railway \
        PGDATA=/var/lib/postgresql/data \
        --service Postgres 2>/dev/null || print_warning "Could not set Postgres vars (service name might differ)"
    
    print_success "Postgres configuration prepared"
}

setup_valkey() {
    print_header "Setting Up Valkey (Redis)"
    
    print_manual "In Railway Dashboard → Valkey service → Settings → Source:"
    echo "  1. Set Image to: valkey/valkey:7-alpine"
    echo "  2. Or for Redis: redis:7-alpine"
    echo ""
    print_manual "Then add Volume:"
    echo "  1. Go to Settings → Volumes"
    echo "  2. Mount Path: /data"
    echo "  3. Size: 512MB should be sufficient"
    echo ""
    
    # Set Valkey environment variables
    print_step "Setting Valkey environment variables..."
    railway variables set \
        --service Valkey 2>/dev/null || print_warning "Could not set Valkey vars (service name might differ)"
    
    print_success "Valkey configuration prepared"
}

#===============================================================================
# Application Services Configuration
#===============================================================================

# Generate a Laravel APP_KEY
generate_app_key() {
    # Generate a random 32-character base64 key
    openssl rand -base64 32 | tr -d '\n'
}

# Common Laravel environment variables
set_laravel_common_vars() {
    local SERVICE_NAME=$1
    local APP_URL=$2
    
    print_step "Setting environment variables for $SERVICE_NAME..."
    
    APP_KEY="base64:$(generate_app_key)"
    
    railway variables set \
        APP_NAME="Publishing Platform" \
        APP_ENV=production \
        APP_DEBUG=false \
        APP_URL="https://$APP_URL" \
        APP_KEY="$APP_KEY" \
        \
        LOG_CHANNEL=stderr \
        LOG_LEVEL=info \
        \
        DB_CONNECTION=pgsql \
        DATABASE_URL='${{Postgres.DATABASE_URL}}' \
        \
        REDIS_URL='${{Valkey.REDIS_URL}}' \
        CACHE_DRIVER=redis \
        SESSION_DRIVER=redis \
        QUEUE_CONNECTION=redis \
        \
        BROADCAST_DRIVER=log \
        FILESYSTEM_DISK=local \
        \
        GOEVENTCITY_DOMAIN="$GOEVENTCITY_DOMAIN" \
        DAYNEWS_DOMAIN="$DAYNEWS_DOMAIN" \
        DOWNTOWNGUIDE_DOMAIN="$DOWNTOWNGUIDE_DOMAIN" \
        ALPHASITE_DOMAIN="$ALPHASITE_DOMAIN" \
        GOLOCALVOICES_DOMAIN="$GOLOCALVOICES_DOMAIN" \
        \
        --service "$SERVICE_NAME" 2>/dev/null || print_warning "Could not set vars for $SERVICE_NAME"
}

setup_goeventcity() {
    print_header "Setting Up GoEventCity Service"
    
    set_laravel_common_vars "GoEventCity" "$GOEVENTCITY_DOMAIN"
    
    # Service-specific settings
    railway variables set \
        SITE_IDENTIFIER=goeventcity \
        --service "GoEventCity" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → GoEventCity → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Build settings:"
    echo "  1. Build Command: composer install --no-dev && npm ci && npm run build"
    echo "  2. Start Command: php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=\$PORT"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  app/Http/Controllers/GoEventCity/**"
    echo "  app/Http/Requests/GoEventCity/**"
    echo "  app/Services/GoEventCity/**"
    echo "  resources/js/Pages/GoEventCity/**"
    echo "  routes/goeventcity.php"
    echo ""
    
    print_success "GoEventCity configured"
}

setup_daynews() {
    print_header "Setting Up Day News Service"
    
    set_laravel_common_vars "Day News" "$DAYNEWS_DOMAIN"
    
    railway variables set \
        SITE_IDENTIFIER=daynews \
        --service "Day News" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → Day News → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  app/Http/Controllers/DayNews/**"
    echo "  app/Services/DayNews/**"
    echo "  resources/js/Pages/DayNews/**"
    echo "  routes/daynews.php"
    echo "  day-news-app/**"
    echo ""
    
    print_success "Day News configured"
}

setup_downtownguide() {
    print_header "Setting Up Downtown Guide Service"
    
    set_laravel_common_vars "Downtown Guide" "$DOWNTOWNGUIDE_DOMAIN"
    
    railway variables set \
        SITE_IDENTIFIER=downtownguide \
        --service "Downtown Guide" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → Downtown Guide → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  app/Http/Controllers/DowntownGuide/**"
    echo "  app/Services/DowntownGuide/**"
    echo "  resources/js/Pages/DowntownGuide/**"
    echo "  routes/downtownguide.php"
    echo ""
    
    print_success "Downtown Guide configured"
}

setup_horizon() {
    print_header "Setting Up Horizon (Queue Worker)"
    
    set_laravel_common_vars "Horizon" "$GOEVENTCITY_DOMAIN"
    
    railway variables set \
        HORIZON_PREFIX=publishing-dev \
        --service "Horizon" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → Horizon → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Build & Start:"
    echo "  Build Command: composer install --no-dev"
    echo "  Start Command: php artisan horizon"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  config/horizon.php"
    echo "  app/Jobs/**"
    echo "  app/Listeners/**"
    echo ""
    
    print_success "Horizon configured"
}

setup_scheduler() {
    print_header "Setting Up Scheduler (Cron)"
    
    set_laravel_common_vars "Scheduler" "$GOEVENTCITY_DOMAIN"
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → Scheduler → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Build & Start:"
    echo "  Build Command: composer install --no-dev"
    echo "  Start Command: php artisan schedule:work"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  app/Console/Kernel.php"
    echo "  app/Console/Commands/**"
    echo "  routes/console.php"
    echo ""
    
    print_success "Scheduler configured"
}

setup_inertia_ssr() {
    print_header "Setting Up Inertia SSR"
    
    # SSR needs minimal Laravel vars plus Node-specific settings
    railway variables set \
        NODE_ENV=production \
        --service "Inertia SSR" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → Inertia SSR → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Build & Start:"
    echo "  Build Command: npm ci && npm run build"
    echo "  Start Command: node bootstrap/ssr/ssr.mjs"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  resources/js/**"
    echo "  resources/css/**"
    echo "  package.json"
    echo "  vite.config.js"
    echo "  tsconfig.json"
    echo ""
    print_manual "Enable scaling (optional):"
    echo "  Settings → Scaling → Set to 2 instances"
    echo ""
    
    print_success "Inertia SSR configured"
}

setup_golocalvoices() {
    print_header "Setting Up GoLocalVoices Service"
    
    set_laravel_common_vars "GoLocalVoices" "$GOLOCALVOICES_DOMAIN"
    
    railway variables set \
        SITE_IDENTIFIER=golocalvoices \
        LOCAL_VOICES_DOMAIN="$GOLOCALVOICES_DOMAIN" \
        --service "GoLocalVoices" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → GoLocalVoices → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  app/Http/Controllers/DayNews/CreatorController.php"
    echo "  app/Http/Controllers/DayNews/PodcastController.php"
    echo "  resources/js/Pages/LocalVoices/**"
    echo "  routes/local-voices.php"
    echo ""
    
    print_success "GoLocalVoices configured"
}

setup_alphasite() {
    print_header "Setting Up AlphaSite Service"
    
    set_laravel_common_vars "AlphaSite" "$ALPHASITE_DOMAIN"
    
    railway variables set \
        SITE_IDENTIFIER=alphasite \
        ALPHASITE_DOMAIN="$ALPHASITE_DOMAIN" \
        --service "AlphaSite" 2>/dev/null || true
    
    print_manual "Connect GitHub repo:"
    echo "  1. Dashboard → AlphaSite → Settings → Source"
    echo "  2. Connect GitHub → Select: $GITHUB_REPO"
    echo "  3. Branch: $GITHUB_BRANCH"
    echo ""
    print_manual "Set Watch Paths:"
    echo "  app/Http/Controllers/AlphaSite/**"
    echo "  app/Services/AlphaSite/**"
    echo "  resources/js/Pages/AlphaSite/**"
    echo "  routes/alphasite.php"
    echo ""
    
    print_success "AlphaSite configured"
}

setup_listmonk() {
    print_header "Setting Up Listmonk (Email)"
    
    print_manual "Listmonk requires its own Postgres database (Listmonk DB)"
    echo ""
    print_manual "Set Listmonk environment variables in Dashboard:"
    echo "  LISTMONK_app__address=0.0.0.0:9000"
    echo "  LISTMONK_db__host=\${{Listmonk DB.PGHOST}}"
    echo "  LISTMONK_db__port=5432"
    echo "  LISTMONK_db__user=\${{Listmonk DB.PGUSER}}"
    echo "  LISTMONK_db__password=\${{Listmonk DB.PGPASSWORD}}"
    echo "  LISTMONK_db__database=\${{Listmonk DB.PGDATABASE}}"
    echo ""
    print_manual "Set Docker image:"
    echo "  Image: listmonk/listmonk:latest"
    echo ""
    
    print_success "Listmonk configuration documented"
}

#===============================================================================
# Generate railway.json files for the repo
#===============================================================================

generate_railway_configs() {
    print_header "Generating railway.json Configurations"
    
    local OUTPUT_DIR="./railway-configs"
    mkdir -p "$OUTPUT_DIR"
    
    # GoEventCity
    cat > "$OUTPUT_DIR/railway-goeventcity.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": [
      "app/Http/Controllers/GoEventCity/**",
      "app/Http/Requests/GoEventCity/**", 
      "app/Services/GoEventCity/**",
      "resources/js/Pages/GoEventCity/**",
      "routes/goeventcity.php"
    ]
  },
  "deploy": {
    "startCommand": "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
EOF

    # Day News
    cat > "$OUTPUT_DIR/railway-daynews.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": [
      "app/Http/Controllers/DayNews/**",
      "app/Http/Requests/DayNews/**",
      "app/Services/DayNews/**",
      "resources/js/Pages/DayNews/**",
      "routes/daynews.php",
      "day-news-app/**"
    ]
  },
  "deploy": {
    "startCommand": "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
EOF

    # Downtown Guide
    cat > "$OUTPUT_DIR/railway-downtownguide.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": [
      "app/Http/Controllers/DowntownGuide/**",
      "app/Http/Requests/DowntownGuide/**",
      "app/Services/DowntownGuide/**",
      "resources/js/Pages/DowntownGuide/**",
      "routes/downtownguide.php"
    ]
  },
  "deploy": {
    "startCommand": "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  }
}
EOF

    # Horizon
    cat > "$OUTPUT_DIR/railway-horizon.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": [
      "config/horizon.php",
      "app/Jobs/**",
      "app/Listeners/**"
    ]
  },
  "deploy": {
    "startCommand": "php artisan horizon",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
EOF

    # Scheduler
    cat > "$OUTPUT_DIR/railway-scheduler.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": [
      "app/Console/Kernel.php",
      "app/Console/Commands/**",
      "routes/console.php"
    ]
  },
  "deploy": {
    "startCommand": "php artisan schedule:work",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
EOF

    # Inertia SSR
    cat > "$OUTPUT_DIR/railway-ssr.json" << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "nixpacks",
    "watchPatterns": [
      "resources/js/**",
      "resources/css/**",
      "package.json",
      "vite.config.js",
      "tsconfig.json"
    ]
  },
  "deploy": {
    "startCommand": "node bootstrap/ssr/ssr.mjs",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "numReplicas": 2
  }
}
EOF

    print_success "Railway config files generated in $OUTPUT_DIR/"
    echo ""
    echo "These files document the Watch Paths for each service."
    echo "You can reference them when configuring Watch Paths in the dashboard,"
    echo "or add them to your repo to use Railway's config file feature."
}

#===============================================================================
# Summary
#===============================================================================

print_summary() {
    print_header "Setup Complete - Summary"
    
    echo ""
    echo "Environment variables have been set for all Laravel services."
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW}MANUAL STEPS REMAINING:${NC}"
    echo -e "${YELLOW}========================================${NC}"
    echo ""
    echo "1. DATABASES - Set Docker images and volumes:"
    echo "   □ Postgres: postgres:16-alpine, volume at /var/lib/postgresql/data"
    echo "   □ Valkey: valkey/valkey:7-alpine, volume at /data"
    echo "   □ Listmonk DB: postgres:16-alpine, volume at /var/lib/postgresql/data"
    echo ""
    echo "2. APP SERVICES - Connect GitHub repo for each:"
    echo "   □ GoEventCity → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ Day News → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ Downtown Guide → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ GoLocalVoices → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ AlphaSite → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ Horizon → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ Scheduler → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo "   □ Inertia SSR → $GITHUB_REPO (branch: $GITHUB_BRANCH)"
    echo ""
    echo "3. WATCH PATHS - Configure in each service's Build settings"
    echo "   (See railway-configs/ directory for exact paths)"
    echo ""
    echo "4. LISTMONK - Configure separately with its own DB connection"
    echo ""
    echo "5. DOMAINS - Set custom domains in service settings (optional)"
    echo ""
    echo "6. DEPLOY - Once configured, trigger first deploy for each service"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}VERIFICATION COMMANDS:${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "# Check service status"
    echo "railway status"
    echo ""
    echo "# View logs"
    echo "railway logs -s GoEventCity"
    echo ""
    echo "# Run migrations (after first deploy)"
    echo "railway run php artisan migrate --service GoEventCity"
    echo ""
    echo "# Test database connection"
    echo "railway run php artisan db:show --service GoEventCity"
    echo ""
}

#===============================================================================
# Main Execution
#===============================================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║         Railway Project Setup Script                          ║"
    echo "║         Publishing Platform Clone                             ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    link_project
    
    # Database setup
    setup_postgres
    setup_valkey
    
    # Application services
    setup_goeventcity
    setup_daynews
    setup_downtownguide
    setup_golocalvoices
    setup_alphasite
    setup_horizon
    setup_scheduler
    setup_inertia_ssr
    setup_listmonk
    
    # Generate config files
    generate_railway_configs
    
    # Print summary
    print_summary
}

# Run main function
main "$@"
