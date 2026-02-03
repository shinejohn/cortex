#!/bin/bash

#===============================================================================
# Railway API Configuration Script (Simplified)
# Sets Docker images, volumes, and watch paths via GraphQL API
#
# Usage:
#   export RAILWAY_TOKEN="your-token"
#   ./railway-configure-api.sh
#===============================================================================

set -e

API_URL="https://backboard.railway.app/graphql/v2"
PROJECT_NAME="${1:-Shine Dev Environment}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

#===============================================================================
# Preflight Checks
#===============================================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           RAILWAY API CONFIGURATION                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ -z "$RAILWAY_TOKEN" ]; then
    echo -e "${RED}ERROR: RAILWAY_TOKEN not set${NC}"
    echo ""
    echo "To fix:"
    echo "  1. Go to https://railway.app/account/tokens"
    echo "  2. Create a new token"
    echo "  3. Run: export RAILWAY_TOKEN=\"your-token-here\""
    echo "  4. Re-run this script"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}ERROR: jq not installed${NC}"
    echo "Install: brew install jq (macOS) or apt install jq (Linux)"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

#===============================================================================
# Helper: Make API Call
#===============================================================================

api_call() {
    local query="$1"
    local json_payload=$(echo -n "$query" | jq -R -s '{query: .}')
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$json_payload"
}

api_mutation() {
    local mutation="$1"
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$mutation"
}

#===============================================================================
# Step 1: Get Project Info
#===============================================================================

echo -e "${BLUE}[1/4] Finding project...${NC}"

PROJECTS=$(api_call "query { projects { edges { node { id name environments { edges { node { id name } } } } } } }")

PROJECT_ID=$(echo "$PROJECTS" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.id")
ENV_ID=$(echo "$PROJECTS" | jq -r ".data.projects.edges[] | select(.node.name==\"$PROJECT_NAME\") | .node.environments.edges[0].node.id")

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo -e "${RED}Project '$PROJECT_NAME' not found${NC}"
    echo "Available projects:"
    echo "$PROJECTS" | jq -r '.data.projects.edges[].node.name'
    exit 1
fi

echo -e "${GREEN}✓ Found: $PROJECT_NAME${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Environment ID: $ENV_ID"
echo ""

#===============================================================================
# Step 2: Get Services
#===============================================================================

echo -e "${BLUE}[2/4] Getting services...${NC}"

SERVICES=$(api_call "query { project(id: \"$PROJECT_ID\") { services { edges { node { id name } } } } }")

echo "$SERVICES" | jq -r '.data.project.services.edges[].node | "  - \(.name) (\(.id[0:8])...)"'
echo ""

# Extract service IDs into variables
get_service_id() {
    local name="$1"
    echo "$SERVICES" | jq -r ".data.project.services.edges[] | select(.node.name==\"$name\") | .node.id"
}

POSTGRES_ID=$(get_service_id "Postgres")
VALKEY_ID=$(get_service_id "Valkey")
LISTMONK_DB_ID=$(get_service_id "Listmonk DB")
LISTMONK_ID=$(get_service_id "Listmonk")
GOEVENTCITY_ID=$(get_service_id "GoEventCity")
DAYNEWS_ID=$(get_service_id "Day News")
DOWNTOWN_ID=$(get_service_id "Downtown Guide")
HORIZON_ID=$(get_service_id "Horizon")
SCHEDULER_ID=$(get_service_id "Scheduler")
SSR_ID=$(get_service_id "Inertia SSR")
GOLOCALVOICES_ID=$(get_service_id "Go Local Voices")
ALPHASITE_ID=$(get_service_id "Alphasite")

#===============================================================================
# Step 3: Configure Databases (Images)
#===============================================================================

echo -e "${BLUE}[3/4] Configuring database services...${NC}"
echo ""

configure_image() {
    local service_id="$1"
    local service_name="$2"
    local image="$3"
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        echo -e "${YELLOW}⚠ $service_name: Service not found, skipping${NC}"
        return
    fi
    
    echo -n "  $service_name → $image ... "
    
    local mutation=$(cat <<EOF
{"query": "mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$ENV_ID\", input: { source: { image: \"$image\" } }) }"}
EOF
)
    
    local result=$(api_mutation "$mutation")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    elif echo "$result" | jq -e '.errors' > /dev/null 2>&1; then
        echo -e "${RED}FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message' | head -1 | sed 's/^/    /'
    else
        echo -e "${YELLOW}UNKNOWN${NC}"
    fi
}

configure_volume() {
    local service_id="$1"
    local service_name="$2"
    local mount_path="$3"
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        echo -e "${YELLOW}⚠ $service_name: Service not found, skipping${NC}"
        return
    fi
    
    echo -n "  $service_name → volume at $mount_path ... "
    
    local mutation=$(cat <<EOF
{"query": "mutation { volumeCreate(input: { projectId: \"$PROJECT_ID\", environmentId: \"$ENV_ID\", serviceId: \"$service_id\", mountPath: \"$mount_path\" }) { id } }"}
EOF
)
    
    local result=$(api_mutation "$mutation")
    
    if echo "$result" | jq -e '.data.volumeCreate.id' > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    elif echo "$result" | grep -qi "already exists\|duplicate\|unique"; then
        echo -e "${GREEN}ALREADY EXISTS${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null | head -1 | sed 's/^/    /'
    fi
}

echo "Setting Docker images..."
configure_image "$POSTGRES_ID" "Postgres" "postgres:16-alpine"
configure_image "$VALKEY_ID" "Valkey" "valkey/valkey:7-alpine"
configure_image "$LISTMONK_DB_ID" "Listmonk DB" "postgres:16-alpine"
configure_image "$LISTMONK_ID" "Listmonk" "listmonk/listmonk:latest"

echo ""
echo "Creating volumes..."
configure_volume "$POSTGRES_ID" "Postgres" "/var/lib/postgresql/data"
configure_volume "$VALKEY_ID" "Valkey" "/data"
configure_volume "$LISTMONK_DB_ID" "Listmonk DB" "/var/lib/postgresql/data"

echo ""

#===============================================================================
# Step 4: Configure App Services (Watch Paths, Commands)
#===============================================================================

echo -e "${BLUE}[4/4] Configuring app services...${NC}"
echo ""

configure_app() {
    local service_id="$1"
    local service_name="$2"
    local build_cmd="$3"
    local start_cmd="$4"
    shift 4
    local watch_paths=("$@")
    
    if [ -z "$service_id" ] || [ "$service_id" = "null" ]; then
        echo -e "${YELLOW}⚠ $service_name: Service not found, skipping${NC}"
        return
    fi
    
    echo "  $service_name:"
    
    # Build watch paths JSON array
    local paths_json="["
    local first=true
    for path in "${watch_paths[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            paths_json="$paths_json,"
        fi
        paths_json="$paths_json\"$path\""
    done
    paths_json="$paths_json]"
    
    # Escape commands for JSON
    build_cmd=$(echo "$build_cmd" | sed 's/"/\\"/g')
    start_cmd=$(echo "$start_cmd" | sed 's/"/\\"/g')
    
    echo -n "    Watch paths (${#watch_paths[@]}) ... "
    
    local mutation=$(cat <<EOF
{"query": "mutation { serviceInstanceUpdate(serviceId: \"$service_id\", environmentId: \"$ENV_ID\", input: { watchPatterns: $paths_json, buildCommand: \"$build_cmd\", startCommand: \"$start_cmd\" }) }"}
EOF
)
    
    local result=$(api_mutation "$mutation")
    
    if echo "$result" | jq -e '.data.serviceInstanceUpdate == true' > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "$result" | jq -r '.errors[0].message // "Unknown error"' 2>/dev/null | head -1 | sed 's/^/      /'
    fi
}

# GoEventCity
configure_app "$GOEVENTCITY_ID" "GoEventCity" \
    "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
    "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT" \
    "app/Http/Controllers/GoEventCity/**" \
    "app/Services/GoEventCity/**" \
    "resources/js/Pages/GoEventCity/**" \
    "routes/goeventcity.php"

# Day News
configure_app "$DAYNEWS_ID" "Day News" \
    "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
    "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT" \
    "app/Http/Controllers/DayNews/**" \
    "app/Services/DayNews/**" \
    "resources/js/Pages/DayNews/**" \
    "routes/daynews.php" \
    "day-news-app/**"

# Downtown Guide
configure_app "$DOWNTOWN_ID" "Downtown Guide" \
    "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
    "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT" \
    "app/Http/Controllers/DowntownGuide/**" \
    "app/Services/DowntownGuide/**" \
    "resources/js/Pages/DowntownGuide/**" \
    "routes/downtownguide.php"

# Horizon
configure_app "$HORIZON_ID" "Horizon" \
    "composer install --no-dev --optimize-autoloader" \
    "php artisan horizon" \
    "config/horizon.php" \
    "app/Jobs/**" \
    "app/Listeners/**"

# Scheduler
configure_app "$SCHEDULER_ID" "Scheduler" \
    "composer install --no-dev --optimize-autoloader" \
    "php artisan schedule:work" \
    "app/Console/Kernel.php" \
    "app/Console/Commands/**" \
    "routes/console.php"

# Inertia SSR
configure_app "$SSR_ID" "Inertia SSR" \
    "npm ci && npm run build" \
    "node bootstrap/ssr/ssr.mjs" \
    "resources/js/**" \
    "resources/css/**" \
    "package.json" \
    "vite.config.js"

# Go Local Voices
configure_app "$GOLOCALVOICES_ID" "Go Local Voices" \
    "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
    "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT" \
    "app/Http/Controllers/DayNews/CreatorController.php" \
    "app/Http/Controllers/DayNews/PodcastController.php" \
    "resources/js/Pages/LocalVoices/**" \
    "routes/local-voices.php"

# Alphasite
configure_app "$ALPHASITE_ID" "Alphasite" \
    "composer install --no-dev --optimize-autoloader && npm ci && npm run build" \
    "php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=\$PORT" \
    "app/Http/Controllers/AlphaSite/**" \
    "app/Services/AlphaSite/**" \
    "resources/js/Pages/AlphaSite/**" \
    "routes/alphasite.php"

echo ""

#===============================================================================
# Summary
#===============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}API Configuration Complete!${NC}"
echo ""
echo "What was configured:"
echo "  ✓ Docker images for database services"
echo "  ✓ Persistent volumes for data storage"
echo "  ✓ Watch paths for segmented deploys"
echo "  ✓ Build and start commands"
echo ""
echo -e "${YELLOW}REMAINING MANUAL STEP:${NC}"
echo ""
echo "Connect GitHub to these services (requires browser OAuth):"
echo "  □ GoEventCity"
echo "  □ Day News"
echo "  □ Downtown Guide"
echo "  □ Go Local Voices"
echo "  □ Alphasite"
echo "  □ Horizon"
echo "  □ Scheduler"
echo "  □ Inertia SSR"
echo ""
echo "For each service:"
echo "  1. Dashboard → Click service"
echo "  2. Settings → Source → Connect GitHub"
echo "  3. Select: shinejohn/Community-Platform"
echo "  4. Branch: development"
echo ""
echo "After connecting GitHub:"
echo "  • Run: ./railway-full-setup.sh (set env vars)"
echo "  • Run: ./railway-test-connections.sh (verify)"
echo ""
