#!/bin/bash

#===============================================================================
# Railway Diagnose and Fix Script
# Checks current status and fixes common issues
#===============================================================================

set -e

API_URL="https://backboard.railway.app/graphql/v2"
PROJECT_NAME="${1:-Shine Dev Environment}"

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

#===============================================================================
# API Helper
#===============================================================================

gql() {
    local query="$1"
    local json_payload=$(echo -n "$query" | jq -R -s '{query: .}')
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload"
}

#===============================================================================
# Get Project Info
#===============================================================================

get_project_info() {
    log_info "Getting project information..."
    
    PROJECTS=$(gql "query { projects { edges { node { id name environments { edges { node { id name } } } } } } }")
    
    PROJECT_ID=$(echo "$PROJECTS" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.id")
    ENV_ID=$(echo "$PROJECTS" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.environments.edges[0].node.id")
    
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
        log_error "Project '$PROJECT_NAME' not found"
        exit 1
    fi
    
    log_success "Found project: $PROJECT_NAME"
    echo "  Project ID: ${PROJECT_ID:0:8}..."
    echo "  Environment ID: ${ENV_ID:0:8}..."
}

#===============================================================================
# Get Service Status
#===============================================================================

get_service_status() {
    local service_name="$1"
    local service_id="$2"
    
    # Get service details including deployments
    local result=$(gql "query { service(id: \"$service_id\") { id name deployments(first: 1) { edges { node { id status createdAt } } } } }")
    
    local status=$(echo "$result" | jq -r '.data.service.deployments.edges[0].node.status // "unknown"')
    local created=$(echo "$result" | jq -r '.data.service.deployments.edges[0].node.createdAt // "never"')
    
    echo "$status|$created"
}

#===============================================================================
# Check Service Configuration
#===============================================================================

check_service_config() {
    local service_name="$1"
    local service_id="$2"
    
    log_info "Checking configuration for: $service_name"
    
    # Get service instance details
    local result=$(gql "query { service(id: \"$service_id\") { id name serviceInstances(first: 1) { edges { node { id buildCommand startCommand watchPatterns source { image } } } } } }")
    
    local has_image=$(echo "$result" | jq -r '.data.service.serviceInstances.edges[0].node.source.image // "none"')
    local build_cmd=$(echo "$result" | jq -r '.data.service.serviceInstances.edges[0].node.buildCommand // "none"')
    local start_cmd=$(echo "$result" | jq -r '.data.service.serviceInstances.edges[0].node.startCommand // "none"')
    local watch_paths=$(echo "$result" | jq -r '.data.service.serviceInstances.edges[0].node.watchPatterns // [] | length')
    
    echo "  Image: $has_image"
    echo "  Build Command: ${build_cmd:0:60}..."
    echo "  Start Command: ${start_cmd:0:60}..."
    echo "  Watch Paths: $watch_paths"
    
    local issues=0
    
    if [ "$has_image" = "none" ] || [ "$has_image" = "null" ]; then
        log_warn "  ⚠ No Docker image configured"
        issues=$((issues + 1))
    fi
    
    if [ "$build_cmd" = "none" ] || [ "$build_cmd" = "null" ]; then
        log_warn "  ⚠ No build command configured"
        issues=$((issues + 1))
    fi
    
    if [ "$start_cmd" = "none" ] || [ "$start_cmd" = "null" ]; then
        log_warn "  ⚠ No start command configured"
        issues=$((issues + 1))
    fi
    
    return $issues
}

#===============================================================================
# Main
#===============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║           RAILWAY DIAGNOSE AND FIX                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    
    if [ -z "$RAILWAY_TOKEN" ]; then
        log_error "RAILWAY_TOKEN not set"
        exit 1
    fi
    
    get_project_info
    
    echo ""
    log_info "Getting all services..."
    
    SERVICES=$(gql "query { project(id: \"$PROJECT_ID\") { services { edges { node { id name } } } } }")
    
    echo "$SERVICES" | jq -r '.data.project.services.edges[].node | "\(.name)|\(.id)"' | while IFS='|' read -r name id; do
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "Service: $name"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        status_info=$(get_service_status "$name" "$id")
        status=$(echo "$status_info" | cut -d'|' -f1)
        created=$(echo "$status_info" | cut -d'|' -f2)
        
        echo "Status: $status"
        echo "Last Deployment: $created"
        
        check_service_config "$name" "$id"
        config_issues=$?
        
        if [ $config_issues -gt 0 ]; then
            log_warn "  → $config_issues configuration issue(s) found"
        else
            log_success "  → Configuration looks good"
        fi
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    log_info "Summary:"
    echo ""
    echo "To fix build failures:"
    echo "  1. Run: ./railway-configure-api.sh (sets images, commands, watch paths)"
    echo "  2. Connect GitHub repos in Railway dashboard"
    echo "  3. Set environment variables (via dashboard or railway-full-setup-api.sh)"
    echo ""
    echo "The fixes we just made (debug.log paths, PHP deprecation) should resolve"
    echo "the build errors. Redeploy services after connecting GitHub."
    echo ""
}

main "$@"
