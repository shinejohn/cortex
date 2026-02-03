#!/bin/bash

#===============================================================================
# Railway API Configuration Script
# Configures services via GraphQL API (does what CLI cannot)
#
# This script:
#   ✓ Sets Docker images for database services
#   ✓ Adds persistent volumes
#   ✓ Configures Watch Paths
#   ✓ Sets build/start commands
#
# Prerequisites:
#   - Run railway-discover.sh first (creates railway-discovery.json)
#   - RAILWAY_TOKEN environment variable set
#
# Usage:
#   export RAILWAY_TOKEN="your-token-here"
#   chmod +x railway-configure.sh
#   ./railway-configure.sh
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
DISCOVERY_FILE="railway-discovery.json"
API_URL="https://backboard.railway.app/graphql/v2"
GITHUB_REPO="shinejohn/Community-Platform"
GITHUB_BRANCH="development"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_section() { 
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

#===============================================================================
# Check Prerequisites
#===============================================================================

check_prerequisites() {
    log_section "Checking Prerequisites"
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required. Install with: brew install jq"
        exit 1
    fi
    log_success "jq installed"
    
    if [ -z "$RAILWAY_TOKEN" ]; then
        log_error "RAILWAY_TOKEN not set"
        echo "export RAILWAY_TOKEN=\"your-token-here\""
        exit 1
    fi
    log_success "RAILWAY_TOKEN set"
    
    if [ ! -f "$DISCOVERY_FILE" ]; then
        log_error "Discovery file not found: $DISCOVERY_FILE"
        echo "Run ./railway-discover.sh first"
        exit 1
    fi
    log_success "Discovery file found"
}

#===============================================================================
# GraphQL Helper
#===============================================================================

gql() {
    local query="$1"
    local result
    
    # Always format as JSON - treat input as GraphQL query string
    local json_payload=$(echo -n "$query" | jq -R -s '{query: .}')
    
    result=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload" 2>/dev/null)
    
    if echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        log_error "GraphQL Error:"
        echo "$result" | jq '.errors'
        return 1
    fi
    
    echo "$result"
}

#===============================================================================
# Get Service ID by Name
#===============================================================================

get_service_id() {
    local name="$1"
    jq -r ".services[] | select(.name==\"$name\") | .id" "$DISCOVERY_FILE"
}

get_service_instance_id() {
    local name="$1"
    jq -r ".services[] | select(.name==\"$name\") | .instanceId" "$DISCOVERY_FILE"
}

get_environment_id() {
    jq -r '.environment.id' "$DISCOVERY_FILE"
}

get_project_id() {
    jq -r '.project.id' "$DISCOVERY_FILE"
}

#===============================================================================
# Set Docker Image for a Service
#===============================================================================

set_docker_image() {
    local service_name="$1"
    local image="$2"
    
    local service_id=$(get_service_id "$service_name")
    local env_id=$(get_environment_id)
    
    if [ -z "$service_id" ] || [ "$service_id" == "null" ]; then
        log_warn "Service not found: $service_name"
        return 1
    fi
    
    log_info "Setting image for $service_name: $image"
    
    # Build query with proper escaping
    local query="mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$env_id\", input: { source: { image: \"$image\" } }) }"
    
    local result=$(gql "$query")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        log_success "$service_name → $image"
        return 0
    else
        log_error "Failed to set image for $service_name"
        echo "$result" | jq '.'
        return 1
    fi
}

#===============================================================================
# Create Volume for a Service
#===============================================================================

create_volume() {
    local service_name="$1"
    local mount_path="$2"
    local size_gb="${3:-1}"
    
    local service_id=$(get_service_id "$service_name")
    local project_id=$(get_project_id)
    local env_id=$(get_environment_id)
    
    if [ -z "$service_id" ] || [ "$service_id" == "null" ]; then
        log_warn "Service not found: $service_name"
        return 1
    fi
    
    log_info "Creating volume for $service_name at $mount_path"
    
    local query="mutation { volumeCreate(input: { projectId: \"$project_id\", environmentId: \"$env_id\", serviceId: \"$service_id\", mountPath: \"$mount_path\" }) { id name } }"
    
    local result=$(gql "$query")
    
    if echo "$result" | jq -e '.data.volumeCreate.id' > /dev/null 2>&1; then
        log_success "$service_name → volume at $mount_path"
        return 0
    else
        # Check if volume already exists
        if echo "$result" | grep -q "already exists\|duplicate"; then
            log_warn "$service_name → volume already exists"
            return 0
        fi
        log_error "Failed to create volume for $service_name"
        echo "$result" | jq '.'
        return 1
    fi
}

#===============================================================================
# Set Watch Paths for a Service
#===============================================================================

set_watch_paths() {
    local service_name="$1"
    shift
    local watch_paths=("$@")
    
    local service_id=$(get_service_id "$service_name")
    local env_id=$(get_environment_id)
    
    if [ -z "$service_id" ] || [ "$service_id" == "null" ]; then
        log_warn "Service not found: $service_name"
        return 1
    fi
    
    # Build JSON array of watch paths
    local paths_json=$(printf '%s\n' "${watch_paths[@]}" | jq -R . | jq -s .)
    
    log_info "Setting watch paths for $service_name"
    
    # Build query - watchPatterns needs to be embedded in the query string
    local query="mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$env_id\", input: { watchPatterns: $paths_json }) }"
    
    local result=$(gql "$query")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        log_success "$service_name → ${#watch_paths[@]} watch paths"
        return 0
    else
        log_error "Failed to set watch paths for $service_name"
        echo "$result" | jq '.'
        return 1
    fi
}

#===============================================================================
# Set Build and Start Commands
#===============================================================================

set_commands() {
    local service_name="$1"
    local build_cmd="$2"
    local start_cmd="$3"
    
    local service_id=$(get_service_id "$service_name")
    local env_id=$(get_environment_id)
    
    if [ -z "$service_id" ] || [ "$service_id" == "null" ]; then
        log_warn "Service not found: $service_name"
        return 1
    fi
    
    log_info "Setting commands for $service_name"
    
    # Escape quotes and newlines in commands for GraphQL
    build_cmd=$(echo "$build_cmd" | sed 's/"/\\"/g' | tr '\n' ' ')
    start_cmd=$(echo "$start_cmd" | sed 's/"/\\"/g' | tr '\n' ' ')
    
    local query="mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$env_id\", input: { buildCommand: \"$build_cmd\", startCommand: \"$start_cmd\" }) }"
    
    local result=$(gql "$query")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        log_success "$service_name → commands set"
        return 0
    else
        log_error "Failed to set commands for $service_name"
        echo "$result" | jq '.'
        return 1
    fi
}

#===============================================================================
# Configure All Services
#===============================================================================

configure_databases() {
    log_section "Configuring Database Services"
    
    # Postgres - Main Database
    set_docker_image "Postgres" "postgres:16-alpine"
    create_volume "Postgres" "/var/lib/postgresql/data"
    
    # Valkey (Redis)
    set_docker_image "Valkey" "valkey/valkey:7-alpine"
    create_volume "Valkey" "/data"
    
    # Listmonk DB
    set_docker_image "Listmonk DB" "postgres:16-alpine"
    create_volume "Listmonk DB" "/var/lib/postgresql/data"
    
    # Listmonk
    set_docker_image "Listmonk" "listmonk/listmonk:latest"
}

configure_app_services() {
    log_section "Configuring Application Services"
    
    # GoEventCity
    set_watch_paths "GoEventCity" \
        "app/Http/Controllers/GoEventCity/**" \
        "app/Http/Requests/GoEventCity/**" \
        "app/Services/GoEventCity/**" \
        "resources/js/Pages/GoEventCity/**" \
        "routes/goeventcity.php"
    
    set_commands "GoEventCity" \
        "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
        "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT"
    
    # Day News
    set_watch_paths "Day News" \
        "app/Http/Controllers/DayNews/**" \
        "app/Http/Requests/DayNews/**" \
        "app/Services/DayNews/**" \
        "resources/js/Pages/DayNews/**" \
        "routes/daynews.php" \
        "day-news-app/**"
    
    set_commands "Day News" \
        "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
        "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT"
    
    # Downtown Guide
    set_watch_paths "Downtown Guide" \
        "app/Http/Controllers/DowntownGuide/**" \
        "app/Http/Requests/DowntownGuide/**" \
        "app/Services/DowntownGuide/**" \
        "resources/js/Pages/DowntownGuide/**" \
        "routes/downtownguide.php"
    
    set_commands "Downtown Guide" \
        "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
        "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT"
    
    # GoLocalVoices
    set_watch_paths "GoLocalVoices" \
        "app/Http/Controllers/DayNews/CreatorController.php" \
        "app/Http/Controllers/DayNews/PodcastController.php" \
        "resources/js/Pages/LocalVoices/**" \
        "routes/local-voices.php"
    
    set_commands "GoLocalVoices" \
        "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
        "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT"
    
    # AlphaSite
    set_watch_paths "AlphaSite" \
        "app/Http/Controllers/AlphaSite/**" \
        "app/Services/AlphaSite/**" \
        "resources/js/Pages/AlphaSite/**" \
        "routes/alphasite.php"
    
    set_commands "AlphaSite" \
        "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
        "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT"
    
    # Horizon
    set_watch_paths "Horizon" \
        "config/horizon.php" \
        "app/Jobs/**" \
        "app/Listeners/**"
    
    set_commands "Horizon" \
        "composer install --no-dev --optimize-autoloader" \
        "php artisan horizon"
    
    # Scheduler
    set_watch_paths "Scheduler" \
        "app/Console/Kernel.php" \
        "app/Console/Commands/**" \
        "routes/console.php"
    
    set_commands "Scheduler" \
        "composer install --no-dev --optimize-autoloader" \
        "php artisan schedule:work"
    
    # Inertia SSR
    set_watch_paths "Inertia SSR" \
        "resources/js/**" \
        "resources/css/**" \
        "package.json" \
        "vite.config.js" \
        "tsconfig.json"
    
    set_commands "Inertia SSR" \
        "npm ci && npm run build" \
        "node bootstrap/ssr/ssr.mjs"
}

#===============================================================================
# Print Remaining Manual Steps
#===============================================================================

print_remaining_steps() {
    log_section "REMAINING MANUAL STEP"
    
    echo ""
    echo -e "${YELLOW}Only ONE thing requires manual action:${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${CYAN}CONNECT GITHUB REPO${NC} (requires OAuth browser flow)"
    echo ""
    echo "For each of these services, do ONE TIME:"
    echo ""
    echo "  1. Go to Railway Dashboard"
    echo "  2. Click the service"
    echo "  3. Settings → Source → Connect GitHub"
    echo "  4. Select repo: $GITHUB_REPO"
    echo "  5. Select branch: $GITHUB_BRANCH"
    echo ""
    echo "Services to connect:"
    echo "  □ GoEventCity"
    echo "  □ Day News"
    echo "  □ Downtown Guide"
    echo "  □ GoLocalVoices"
    echo "  □ AlphaSite"
    echo "  □ Horizon"
    echo "  □ Scheduler"
    echo "  □ Inertia SSR"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "This is the ONLY manual step. Everything else has been configured."
    echo ""
}

#===============================================================================
# Main
#===============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║           RAILWAY API CONFIGURATION SCRIPT                           ║"
    echo "║           Setting Docker images, volumes, watch paths                ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    
    # Read project info
    PROJECT_NAME=$(jq -r '.project.name' "$DISCOVERY_FILE")
    log_info "Configuring project: $PROJECT_NAME"
    
    # Configure everything
    configure_databases
    configure_app_services
    
    # Show what's left
    print_remaining_steps
    
    log_section "CONFIGURATION COMPLETE"
    
    echo ""
    echo -e "${GREEN}All automated configuration complete!${NC}"
    echo ""
    echo "What was configured:"
    echo "  ✓ Docker images for Postgres, Valkey, Listmonk"
    echo "  ✓ Persistent volumes for all databases"
    echo "  ✓ Watch paths for segmented deploys"
    echo "  ✓ Build and start commands"
    echo ""
    echo "Next steps:"
    echo "  1. Connect GitHub repo to each app service (manual, ~5 min)"
    echo "  2. Services will auto-deploy once GitHub is connected"
    echo "  3. Run: ./railway-full-setup.sh to set environment variables"
    echo "  4. Run: ./railway-test-connections.sh to verify"
    echo ""
}

main "$@"
