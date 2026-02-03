#!/bin/bash

#===============================================================================
# Railway Complete Setup Script (API Version)
# Sets ALL environment variables via GraphQL API
# 
# Usage:
#   export RAILWAY_TOKEN="your-token"
#   ./railway-full-setup-api.sh
#===============================================================================

set -e

API_URL="https://backboard.railway.app/graphql/v2"
PROJECT_NAME="${1:-Shine Dev Environment}"

# Service names (must match EXACTLY what migration created)
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
log_section() { 
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

#===============================================================================
# API Helper Functions
#===============================================================================

gql() {
    local query="$1"
    local json_payload=$(echo -n "$query" | jq -R -s '{query: .}')
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload"
}

get_project_id() {
    local result=$(gql "query { projects { edges { node { id name } } } }")
    echo "$result" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.id"
}

get_environment_id() {
    local project_id="$1"
    local result=$(gql "query { project(id: \"$project_id\") { environments { edges { node { id name } } } } }")
    echo "$result" | jq -r ".data.project.environments.edges[0].node.id"
}

get_service_id() {
    local service_name="$1"
    local project_id="$2"
    local result=$(gql "query { project(id: \"$project_id\") { services { edges { node { id name } } } } }")
    echo "$result" | jq -r ".data.project.services.edges[] | select(.node.name==\"$service_name\") | .node.id"
}

#===============================================================================
# Prerequisites Check
#===============================================================================

check_prerequisites() {
    log_section "Checking Prerequisites"
    
    if [ -z "$RAILWAY_TOKEN" ]; then
        log_error "RAILWAY_TOKEN not set"
        echo "To fix:"
        echo "  1. Go to https://railway.app/account/tokens"
        echo "  2. Create a new token"
        echo "  3. Run: export RAILWAY_TOKEN=\"your-token-here\""
        echo "  4. Re-run this script"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq not installed"
        echo "Install: brew install jq (macOS) or apt install jq (Linux)"
        exit 1
    fi
    
    if ! command -v openssl &> /dev/null; then
        log_error "openssl not found (needed for APP_KEY generation)"
        exit 1
    fi
    
    # Verify authentication by querying projects
    if gql "query { projects { edges { node { id name } } } }" | jq -e '.data.projects.edges' > /dev/null 2>&1; then
        log_success "Railway API authentication successful"
    else
        log_error "Railway API authentication failed. Please check your token."
        exit 1
    fi
    
    log_success "All prerequisites OK"
}

#===============================================================================
# Initialize Project and Service IDs
#===============================================================================

initialize_ids() {
    log_section "Initializing Project and Service IDs"
    
    PROJECT_ID=$(get_project_id)
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
        log_error "Project '$PROJECT_NAME' not found"
        exit 1
    fi
    log_success "Found project: $PROJECT_NAME (ID: ${PROJECT_ID:0:8}...)"
    
    ENV_ID=$(get_environment_id "$PROJECT_ID")
    if [ -z "$ENV_ID" ] || [ "$ENV_ID" = "null" ]; then
        log_error "Could not find environment ID"
        exit 1
    fi
    log_success "Found environment ID: ${ENV_ID:0:8}..."
    
    # Cache service IDs
    log_info "Loading service IDs..."
    POSTGRES_ID=$(get_service_id "$SERVICE_POSTGRES" "$PROJECT_ID")
    VALKEY_ID=$(get_service_id "$SERVICE_VALKEY" "$PROJECT_ID")
    LISTMONK_DB_ID=$(get_service_id "$SERVICE_LISTMONK_DB" "$PROJECT_ID")
    LISTMONK_ID=$(get_service_id "$SERVICE_LISTMONK" "$PROJECT_ID")
    GOEVENTCITY_ID=$(get_service_id "$SERVICE_GOEVENTCITY" "$PROJECT_ID")
    DAYNEWS_ID=$(get_service_id "$SERVICE_DAYNEWS" "$PROJECT_ID")
    DOWNTOWN_ID=$(get_service_id "$SERVICE_DOWNTOWN" "$PROJECT_ID")
    GOLOCALVOICES_ID=$(get_service_id "$SERVICE_GOLOCALVOICES" "$PROJECT_ID")
    ALPHASITE_ID=$(get_service_id "$SERVICE_ALPHASITE" "$PROJECT_ID")
    HORIZON_ID=$(get_service_id "$SERVICE_HORIZON" "$PROJECT_ID")
    SCHEDULER_ID=$(get_service_id "$SERVICE_SCHEDULER" "$PROJECT_ID")
    SSR_ID=$(get_service_id "$SERVICE_SSR" "$PROJECT_ID")
    
    log_success "Service IDs loaded"
}

#===============================================================================
# Generate Keys
#===============================================================================

generate_app_key() {
    echo "base64:$(openssl rand -base64 32)"
}

#===============================================================================
# Set Variables for a Service via API
# Usage: set_vars "ServiceName" "ServiceID" "KEY1=value1" "KEY2=value2" ...
#===============================================================================

set_vars() {
    local service_name="$1"
    local service_id="$2"
    shift 2
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        log_warn "$service_name - Service not found, skipping"
        return 1
    fi
    
    log_info "Setting variables for: $service_name"
    
    local success_count=0
    local total_count=$#
    
    # Set each variable individually
    for var in "$@"; do
        local key="${var%%=*}"
        local value="${var#*=}"
        
        # Create mutation for single variable
        local mutation_query="mutation(\$input: VariableUpsertInput!) { variableUpsert(input: \$input) { id name value } }"
        local mutation_vars=$(jq -n \
            --arg project_id "$PROJECT_ID" \
            --arg env_id "$ENV_ID" \
            --arg service_id "$service_id" \
            --arg name "$key" \
            --arg value "$value" \
            '{input: {projectId: $project_id, environmentId: $env_id, serviceId: $service_id, name: $name, value: $value}}')
        
        local payload=$(jq -n \
            --arg query "$mutation_query" \
            --argjson variables "$mutation_vars" \
            '{query: $query, variables: $variables}')
        
        local result=$(curl -s -X POST "$API_URL" \
            -H "Authorization: Bearer $RAILWAY_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$payload")
        
        if echo "$result" | jq -e '.data.variableUpsert.id' > /dev/null 2>&1; then
            success_count=$((success_count + 1))
        fi
    done
    
    if [ $success_count -eq $total_count ]; then
        log_success "$service_name - all $total_count variables set"
        return 0
    elif [ $success_count -gt 0 ]; then
        log_warn "$service_name - $success_count/$total_count variables set"
        return 1
    else
        log_warn "$service_name - could not set variables"
        return 1
    fi
}

#===============================================================================
# Database Services Configuration
#===============================================================================

setup_databases() {
    log_section "Configuring Database Services"
    
    # Generate a secure password for internal use
    DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    
    # Postgres
    set_vars "$SERVICE_POSTGRES" "$POSTGRES_ID" \
        "POSTGRES_USER=postgres" \
        "POSTGRES_PASSWORD=$DB_PASSWORD" \
        "POSTGRES_DB=railway" \
        "PGDATA=/var/lib/postgresql/data"
    
    # Valkey
    set_vars "$SERVICE_VALKEY" "$VALKEY_ID" \
        "REDIS_ARGS=--appendonly yes"
    
    # Listmonk DB
    set_vars "$SERVICE_LISTMONK_DB" "$LISTMONK_DB_ID" \
        "POSTGRES_USER=listmonk" \
        "POSTGRES_PASSWORD=$DB_PASSWORD" \
        "POSTGRES_DB=listmonk" \
        "PGDATA=/var/lib/postgresql/data"
}

#===============================================================================
# Laravel App Services Configuration
#===============================================================================

setup_laravel_services() {
    log_section "Configuring Laravel Application Services"
    
    # Generate ONE app key to use across all services
    APP_KEY=$(generate_app_key)
    log_info "Generated APP_KEY: ${APP_KEY:0:20}..."
    
    # Common variables array (as key=value strings)
    COMMON_VARS=(
        "APP_NAME=Publishing Platform"
        "APP_ENV=production"
        "APP_DEBUG=false"
        "APP_KEY=$APP_KEY"
        "APP_TIMEZONE=UTC"
        "LOG_CHANNEL=stderr"
        "LOG_LEVEL=info"
        "LOG_STACK=single"
        "DB_CONNECTION=pgsql"
        "DB_HOST=\${{Postgres.PGHOST}}"
        "DB_PORT=\${{Postgres.PGPORT}}"
        "DB_DATABASE=\${{Postgres.PGDATABASE}}"
        "DB_USERNAME=\${{Postgres.PGUSER}}"
        "DB_PASSWORD=\${{Postgres.PGPASSWORD}}"
        "DATABASE_URL=\${{Postgres.DATABASE_URL}}"
        "REDIS_HOST=\${{Valkey.REDISHOST}}"
        "REDIS_PORT=\${{Valkey.REDISPORT}}"
        "REDIS_PASSWORD=\${{Valkey.REDISPASSWORD}}"
        "REDIS_URL=\${{Valkey.REDIS_URL}}"
        "CACHE_DRIVER=redis"
        "CACHE_PREFIX=publishing_cache_"
        "SESSION_DRIVER=redis"
        "SESSION_LIFETIME=120"
        "SESSION_ENCRYPT=false"
        "QUEUE_CONNECTION=redis"
        "FILESYSTEM_DISK=local"
        "BROADCAST_DRIVER=log"
        "MAIL_MAILER=log"
        "GOEVENTCITY_DOMAIN=goeventcity.com"
        "DAYNEWS_DOMAIN=day.news"
        "DOWNTOWNGUIDE_DOMAIN=downtownsguide.com"
        "ALPHASITE_DOMAIN=alphasite.com"
        "GOLOCALVOICES_DOMAIN=golocalvoices.com"
        "INERTIA_SSR_ENABLED=true"
        "INERTIA_SSR_URL=http://\${{Inertia SSR.RAILWAY_PRIVATE_DOMAIN}}:13714"
    )
    
    # GoEventCity
    set_vars "$SERVICE_GOEVENTCITY" "$GOEVENTCITY_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://goeventcity.com" \
        "SITE_IDENTIFIER=goeventcity"
    
    # Day News
    set_vars "$SERVICE_DAYNEWS" "$DAYNEWS_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://day.news" \
        "SITE_IDENTIFIER=daynews"
    
    # Downtown Guide
    set_vars "$SERVICE_DOWNTOWN" "$DOWNTOWN_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://downtownsguide.com" \
        "SITE_IDENTIFIER=downtownguide"
    
    # GoLocalVoices
    set_vars "$SERVICE_GOLOCALVOICES" "$GOLOCALVOICES_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://golocalvoices.com" \
        "SITE_IDENTIFIER=golocalvoices"
    
    # AlphaSite
    set_vars "$SERVICE_ALPHASITE" "$ALPHASITE_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://alphasite.com" \
        "SITE_IDENTIFIER=alphasite"
    
    # Horizon
    set_vars "$SERVICE_HORIZON" "$HORIZON_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://goeventcity.com" \
        "HORIZON_PREFIX=publishing_horizon_"
    
    # Scheduler
    set_vars "$SERVICE_SCHEDULER" "$SCHEDULER_ID" \
        "${COMMON_VARS[@]}" \
        "APP_URL=https://goeventcity.com"
    
    # Inertia SSR
    set_vars "$SERVICE_SSR" "$SSR_ID" \
        "NODE_ENV=production" \
        "SSR_PORT=13714"
}

#===============================================================================
# Listmonk Configuration
#===============================================================================

setup_listmonk() {
    log_section "Configuring Listmonk Email Service"
    
    set_vars "$SERVICE_LISTMONK" "$LISTMONK_ID" \
        "LISTMONK_app__address=0.0.0.0:9000" \
        "LISTMONK_db__host=\${{Listmonk DB.PGHOST}}" \
        "LISTMONK_db__port=5432" \
        "LISTMONK_db__user=\${{Listmonk DB.PGUSER}}" \
        "LISTMONK_db__password=\${{Listmonk DB.PGPASSWORD}}" \
        "LISTMONK_db__database=\${{Listmonk DB.PGDATABASE}}" \
        "LISTMONK_db__ssl_mode=disable"
}

#===============================================================================
# Main
#===============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║           RAILWAY COMPLETE SETUP SCRIPT (API)                        ║"
    echo "║           Publishing Platform                                        ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    initialize_ids
    
    # Configure everything
    setup_databases
    setup_laravel_services
    setup_listmonk
    
    log_section "SETUP COMPLETE"
    echo ""
    echo -e "${GREEN}Environment variables configured via API!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Connect GitHub repos in Railway dashboard"
    echo "  2. Deploy each service"
    echo "  3. Run migrations after deployment"
    echo "  4. Verify with: ./railway-test-connections.sh"
    echo ""
}

main "$@"
