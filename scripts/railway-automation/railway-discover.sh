#!/bin/bash

#===============================================================================
# Railway Discovery Script
# Collects all project and service information needed for automation
#
# Output: railway-discovery.json (used by other automation scripts)
#
# Prerequisites:
#   - Railway CLI installed and logged in
#   - RAILWAY_TOKEN environment variable set (get from Railway Dashboard → Account → Tokens)
#
# Usage:
#   export RAILWAY_TOKEN="your-token-here"
#   chmod +x railway-discover.sh
#   ./railway-discover.sh [project-name]
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
PROJECT_NAME="${1:-supportive-rebirth}"
OUTPUT_FILE="railway-discovery.json"
API_URL="https://backboard.railway.app/graphql/v2"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
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
    
    # Check for jq
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        echo "Install with:"
        echo "  macOS:  brew install jq"
        echo "  Ubuntu: sudo apt-get install jq"
        exit 1
    fi
    log_success "jq installed"
    
    # Check for curl
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    log_success "curl installed"
    
    # Check for RAILWAY_TOKEN
    if [ -z "$RAILWAY_TOKEN" ]; then
        log_error "RAILWAY_TOKEN environment variable not set"
        echo ""
        echo "Get your token from:"
        echo "  Railway Dashboard → Account Settings → Tokens → Create Token"
        echo ""
        echo "Then run:"
        echo "  export RAILWAY_TOKEN=\"your-token-here\""
        echo "  ./railway-discover.sh"
        exit 1
    fi
    log_success "RAILWAY_TOKEN set"
}

#===============================================================================
# GraphQL Helper
#===============================================================================

gql() {
    local query="$1"
    local result
    
    # Use jq to properly format the JSON payload
    local json_payload=$(echo -n "$query" | jq -R -s '{query: .}')
    
    result=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload" 2>/dev/null)
    
    # Check for errors
    if echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        log_error "GraphQL Error:"
        echo "$result" | jq '.errors'
        return 1
    fi
    
    echo "$result"
}

#===============================================================================
# Get All Projects
#===============================================================================

get_projects() {
    log_info "Fetching projects..." >&2
    
    local query="query { projects { edges { node { id name description createdAt } } } }"
    gql "$query"
}

#===============================================================================
# Get Project Details
#===============================================================================

get_project_details() {
    local project_id="$1"
    log_info "Fetching project details for: $project_id" >&2
    
    local query="query { 
        project(id: \\\"$project_id\\\") { 
            id 
            name 
            description
            createdAt
            environments { 
                edges { 
                    node { 
                        id 
                        name 
                    } 
                } 
            }
            services { 
                edges { 
                    node { 
                        id 
                        name 
                        icon
                        createdAt
                    } 
                } 
            }
        } 
    }"
    
    gql "$query"
}

#===============================================================================
# Get Service Details (including current config)
#===============================================================================

get_service_details() {
    local service_id="$1"
    local environment_id="$2"
    
    # Redirect any log output to stderr
    log_info "Getting details for service: $service_id" >&2
    
    local query="query {
        service(id: \\\"$service_id\\\") {
            id
            name
            icon
            serviceInstances {
                edges {
                    node {
                        id
                        environmentId
                        source {
                            image
                            repo
                            branch
                        }
                        startCommand
                        buildCommand
                        watchPatterns
                        domains {
                            edges {
                                node {
                                    id
                                    domain
                                }
                            }
                        }
                    }
                }
            }
        }
    }"
    
    gql "$query" 2>&1 | grep -v "^\["  # Filter out log messages
}

#===============================================================================
# Get Volumes
#===============================================================================

get_volumes() {
    local project_id="$1"
    
    local query="query {
        project(id: \\\"$project_id\\\") {
            volumes {
                edges {
                    node {
                        id
                        name
                        mountPath
                        serviceId
                    }
                }
            }
        }
    }"
    
    gql "$query"
}

#===============================================================================
# Get Variables for a Service
#===============================================================================

get_service_variables() {
    local service_id="$1"
    local environment_id="$2"
    
    local query="query {
        variables(
            serviceId: \\\"$service_id\\\",
            environmentId: \\\"$environment_id\\\"
        )
    }"
    
    gql "$query"
}

#===============================================================================
# Main Discovery Process
#===============================================================================

main() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║           RAILWAY DISCOVERY SCRIPT                                   ║"
    echo "║           Collecting project information for automation              ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo ""
    
    check_prerequisites
    
    log_section "Discovering Projects"
    
    # Get all projects and find the target
    PROJECTS=$(get_projects)
    
    PROJECT_ID=$(echo "$PROJECTS" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.id")
    
    if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" == "null" ]; then
        log_error "Project '$PROJECT_NAME' not found"
        echo ""
        echo "Available projects:"
        echo "$PROJECTS" | jq -r '.data.projects.edges[].node | "  - \(.name) (ID: \(.id))"'
        exit 1
    fi
    
    log_success "Found project: $PROJECT_NAME"
    log_info "Project ID: $PROJECT_ID"
    
    log_section "Fetching Project Details"
    
    PROJECT_DETAILS=$(get_project_details "$PROJECT_ID")
    
    # Get environment ID (usually "production")
    ENVIRONMENT_ID=$(echo "$PROJECT_DETAILS" | jq -r '.data.project.environments.edges[0].node.id')
    ENVIRONMENT_NAME=$(echo "$PROJECT_DETAILS" | jq -r '.data.project.environments.edges[0].node.name')
    
    log_info "Environment: $ENVIRONMENT_NAME (ID: $ENVIRONMENT_ID)"
    
    # Get services
    log_section "Discovering Services"
    
    SERVICES=$(echo "$PROJECT_DETAILS" | jq -r '.data.project.services.edges[].node | "\(.id)|\(.name)"')
    
    # Start building output JSON
    echo "{" > "$OUTPUT_FILE"
    echo "  \"project\": {" >> "$OUTPUT_FILE"
    echo "    \"name\": \"$PROJECT_NAME\"," >> "$OUTPUT_FILE"
    echo "    \"id\": \"$PROJECT_ID\"" >> "$OUTPUT_FILE"
    echo "  }," >> "$OUTPUT_FILE"
    echo "  \"environment\": {" >> "$OUTPUT_FILE"
    echo "    \"name\": \"$ENVIRONMENT_NAME\"," >> "$OUTPUT_FILE"
    echo "    \"id\": \"$ENVIRONMENT_ID\"" >> "$OUTPUT_FILE"
    echo "  }," >> "$OUTPUT_FILE"
    echo "  \"services\": [" >> "$OUTPUT_FILE"
    
    FIRST=true
    while IFS='|' read -r service_id service_name; do
        if [ -n "$service_id" ]; then
            log_info "Discovering service: $service_name" >&2
            
            # Get detailed service info (suppress stderr logs)
            SERVICE_DETAIL=$(get_service_details "$service_id" "$ENVIRONMENT_ID" 2>/dev/null)
            
            # Extract relevant info
            SOURCE_IMAGE=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.source.image // "not-set"')
            SOURCE_REPO=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.source.repo // "not-set"')
            SOURCE_BRANCH=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.source.branch // "not-set"')
            START_CMD=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.startCommand // "not-set"')
            BUILD_CMD=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.buildCommand // "not-set"')
            WATCH_PATTERNS=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.watchPatterns // []')
            INSTANCE_ID=$(echo "$SERVICE_DETAIL" | jq -r '.data.service.serviceInstances.edges[0].node.id // "not-set"')
            
            if [ "$FIRST" = true ]; then
                FIRST=false
            else
                echo "," >> "$OUTPUT_FILE"
            fi
            
            cat >> "$OUTPUT_FILE" << EOF
    {
      "name": "$service_name",
      "id": "$service_id",
      "instanceId": "$INSTANCE_ID",
      "source": {
        "image": "$SOURCE_IMAGE",
        "repo": "$SOURCE_REPO",
        "branch": "$SOURCE_BRANCH"
      },
      "startCommand": "$START_CMD",
      "buildCommand": "$BUILD_CMD",
      "watchPatterns": $WATCH_PATTERNS
    }
EOF
            
            log_success "$service_name discovered"
        fi
    done <<< "$SERVICES"
    
    echo "" >> "$OUTPUT_FILE"
    echo "  ]," >> "$OUTPUT_FILE"
    
    # Get volumes
    log_section "Discovering Volumes"
    VOLUMES=$(get_volumes "$PROJECT_ID")
    VOLUME_DATA=$(echo "$VOLUMES" | jq '.data.project.volumes.edges // []')
    
    echo "  \"volumes\": $VOLUME_DATA," >> "$OUTPUT_FILE"
    
    # Add timestamp
    echo "  \"discoveredAt\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"" >> "$OUTPUT_FILE"
    echo "}" >> "$OUTPUT_FILE"
    
    # Pretty print the JSON
    jq '.' "$OUTPUT_FILE" > "${OUTPUT_FILE}.tmp" && mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
    
    log_section "Discovery Complete"
    
    echo ""
    log_success "Output saved to: $OUTPUT_FILE"
    echo ""
    echo "Summary:"
    echo "  Project: $PROJECT_NAME ($PROJECT_ID)"
    echo "  Environment: $ENVIRONMENT_NAME ($ENVIRONMENT_ID)"
    echo "  Services found: $(echo "$SERVICES" | wc -l | tr -d ' ')"
    echo ""
    
    # Print service summary table
    echo "Services:"
    echo "┌────────────────────────┬──────────────────────────────────────┬─────────────────────┐"
    echo "│ Name                   │ ID                                   │ Source              │"
    echo "├────────────────────────┼──────────────────────────────────────┼─────────────────────┤"
    
    jq -r '.services[] | "│ \(.name | . + " " * (22 - length) | .[0:22]) │ \(.id | .[0:36]) │ \(.source.image | if . == "not-set" then "GitHub" else .[0:19] end | . + " " * (19 - length)) │"' "$OUTPUT_FILE"
    
    echo "└────────────────────────┴──────────────────────────────────────┴─────────────────────┘"
    echo ""
    
    # Check what needs to be configured
    log_section "Configuration Status"
    
    echo "Services needing Docker image:"
    jq -r '.services[] | select(.source.image == "not-set" or .source.image == null) | "  ⚠ \(.name)"' "$OUTPUT_FILE"
    
    echo ""
    echo "Services needing GitHub connection:"
    jq -r '.services[] | select(.source.repo == "not-set" or .source.repo == null) | "  ⚠ \(.name)"' "$OUTPUT_FILE"
    
    echo ""
    echo "Services with Watch Paths configured:"
    jq -r '.services[] | select(.watchPatterns != null and (.watchPatterns | length) > 0) | "  ✓ \(.name)"' "$OUTPUT_FILE"
    
    echo ""
    echo "Services WITHOUT Watch Paths:"
    jq -r '.services[] | select(.watchPatterns == null or (.watchPatterns | length) == 0) | "  ⚠ \(.name)"' "$OUTPUT_FILE"
    
    echo ""
    log_info "Use this data with railway-configure.sh to set up services"
}

main "$@"
