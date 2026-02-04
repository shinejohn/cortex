#!/bin/bash

#===============================================================================
# RAILWAY COMPLETE PROJECT DUMP
# Captures all information about a Railway project
#
# Usage: ./railway-dump.sh
# Output: ./railway-dump_TIMESTAMP/
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DUMP_DIR="./railway-dump_${TIMESTAMP}"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              RAILWAY COMPLETE PROJECT DUMP                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

#===============================================================================
# Prerequisites Check
#===============================================================================

echo -e "${BLUE}[1/6] Prerequisites${NC}"

if ! command -v railway &> /dev/null; then
    echo -e "${RED}✗ Railway CLI not installed${NC}"
    echo "  Install: npm install -g @railway/cli"
    exit 1
fi
echo -e "${GREEN}✓${NC} Railway CLI installed"

if ! railway whoami &> /dev/null 2>&1; then
    echo -e "${RED}✗ Not logged in${NC}"
    echo "  Run: railway login"
    exit 1
fi
echo -e "${GREEN}✓${NC} Logged in as: $(railway whoami 2>/dev/null)"

if ! railway status &> /dev/null 2>&1; then
    echo -e "${RED}✗ No project linked${NC}"
    echo "  Run: railway link"
    exit 1
fi
echo -e "${GREEN}✓${NC} Project linked"
echo ""

#===============================================================================
# Setup Dump Directory
#===============================================================================

echo -e "${BLUE}[2/6] Setting up dump directory${NC}"

mkdir -p "$DUMP_DIR"/{services,variables,build-logs,runtime-logs}
echo -e "${GREEN}✓${NC} Created: $DUMP_DIR"
echo ""

#===============================================================================
# Dump Project Info
#===============================================================================

echo -e "${BLUE}[3/6] Dumping project info${NC}"

railway status > "$DUMP_DIR/project-status.txt" 2>&1 || true
echo -e "${GREEN}✓${NC} Project status"
echo ""

#===============================================================================
# Discover Services
#===============================================================================

echo -e "${BLUE}[4/6] Discovering services${NC}"

# All possible service names
ALL_SERVICES=(
    "Postgres Publishing"
    "Postgres"
    "Postgres Discarded"
    "Valkey"
    "Listmonk DB"
    "Listmonk"
    "laravel-storage"
    "Scheduler"
    "Horizon"
    "Inertia SSR"
    "GoEventCity"
    "Day News"
    "Downtown Guide"
    "Go Local Voices"
    "GoLocalVoices"
    "Alphasite"
    "AlphaSite"
    "AlphasiteAI"
)

FOUND_SERVICES=()

for SERVICE in "${ALL_SERVICES[@]}"; do
    if railway logs -s "$SERVICE" --limit 1 &> /dev/null 2>&1; then
        FOUND_SERVICES+=("$SERVICE")
        echo -e "  ${GREEN}✓${NC} $SERVICE"
    fi
done

printf '%s\n' "${FOUND_SERVICES[@]}" > "$DUMP_DIR/service-list.txt"
echo ""
echo -e "${GREEN}✓${NC} Found ${#FOUND_SERVICES[@]} services"
echo ""

#===============================================================================
# Dump Each Service
#===============================================================================

echo -e "${BLUE}[5/6] Dumping service data${NC}"

for SERVICE in "${FOUND_SERVICES[@]}"; do
    SAFE_NAME=$(echo "$SERVICE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    echo "  Processing: $SERVICE"
    
    # Variables
    railway variables -s "$SERVICE" > "$DUMP_DIR/variables/${SAFE_NAME}.txt" 2>&1 || true
    
    # Build logs
    railway logs -s "$SERVICE" --build --limit 500 > "$DUMP_DIR/build-logs/${SAFE_NAME}.log" 2>&1 || true
    
    # Runtime logs  
    railway logs -s "$SERVICE" --limit 500 > "$DUMP_DIR/runtime-logs/${SAFE_NAME}.log" 2>&1 || true
    
    # Create service summary
    cat > "$DUMP_DIR/services/${SAFE_NAME}.txt" << EOF
SERVICE: $SERVICE
DUMP TIME: $(date)

=== VARIABLES ===
$(cat "$DUMP_DIR/variables/${SAFE_NAME}.txt" 2>/dev/null || echo "No variables")

=== LAST 50 BUILD LOG LINES ===
$(tail -50 "$DUMP_DIR/build-logs/${SAFE_NAME}.log" 2>/dev/null || echo "No build logs")

=== LAST 50 RUNTIME LOG LINES ===
$(tail -50 "$DUMP_DIR/runtime-logs/${SAFE_NAME}.log" 2>/dev/null || echo "No runtime logs")
EOF

done
echo ""

#===============================================================================
# Generate Analysis Report
#===============================================================================

echo -e "${BLUE}[6/6] Generating analysis report${NC}"

REPORT="$DUMP_DIR/ANALYSIS-REPORT.md"

cat > "$REPORT" << EOF
# Railway Project Analysis Report

**Generated:** $(date)
**Dump Directory:** $DUMP_DIR

## Services Found: ${#FOUND_SERVICES[@]}

EOF

for SERVICE in "${FOUND_SERVICES[@]}"; do
    echo "- $SERVICE" >> "$REPORT"
done

echo "" >> "$REPORT"
echo "## Issue Detection" >> "$REPORT"
echo "" >> "$REPORT"

for SERVICE in "${FOUND_SERVICES[@]}"; do
    SAFE_NAME=$(echo "$SERVICE" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    BUILD_LOG="$DUMP_DIR/build-logs/${SAFE_NAME}.log"
    RUNTIME_LOG="$DUMP_DIR/runtime-logs/${SAFE_NAME}.log"
    
    ISSUES=""
    
    # Check for various error patterns
    if grep -qi "lost+found\|directory.*not empty" "$RUNTIME_LOG" 2>/dev/null; then
        ISSUES="$ISSUES PGDATA_CONFLICT"
    fi
    
    if grep -qi "npm ERR" "$BUILD_LOG" 2>/dev/null; then
        ISSUES="$ISSUES NPM_ERROR"
    fi
    
    if grep -qi "build failed" "$BUILD_LOG" 2>/dev/null; then
        ISSUES="$ISSUES BUILD_FAILED"
    fi
    
    if grep -qi "SQLSTATE\|connection refused.*5432\|could not connect.*database" "$RUNTIME_LOG" 2>/dev/null; then
        ISSUES="$ISSUES DB_CONNECTION_ERROR"
    fi
    
    if grep -qi "redis.*refused\|redis.*error\|NOAUTH" "$RUNTIME_LOG" 2>/dev/null; then
        ISSUES="$ISSUES REDIS_ERROR"
    fi
    
    if grep -qi "No application encryption key" "$RUNTIME_LOG" 2>/dev/null; then
        ISSUES="$ISSUES MISSING_APP_KEY"
    fi
    
    if grep -qi "500 Internal Server Error\|exception\|fatal error" "$RUNTIME_LOG" 2>/dev/null; then
        ISSUES="$ISSUES RUNTIME_ERROR"
    fi
    
    if grep -qi "out of memory\|memory exhausted" "$BUILD_LOG" "$RUNTIME_LOG" 2>/dev/null; then
        ISSUES="$ISSUES MEMORY_ERROR"
    fi
    
    if grep -qi "vite.*error\|rollup.*error" "$BUILD_LOG" 2>/dev/null; then
        ISSUES="$ISSUES VITE_ERROR"
    fi
    
    if grep -qi "ready to accept\|listening\|started\|running" "$RUNTIME_LOG" 2>/dev/null; then
        if [ -z "$ISSUES" ]; then
            STATUS="✅ HEALTHY"
        else
            STATUS="⚠️ ISSUES:$ISSUES"
        fi
    else
        if [ -z "$ISSUES" ]; then
            STATUS="❓ UNKNOWN"
        else
            STATUS="❌ ISSUES:$ISSUES"
        fi
    fi
    
    echo "### $SERVICE" >> "$REPORT"
    echo "**Status:** $STATUS" >> "$REPORT"
    echo "" >> "$REPORT"
done

echo "## Files Generated" >> "$REPORT"
echo "" >> "$REPORT"
echo '```' >> "$REPORT"
find "$DUMP_DIR" -type f -name "*.txt" -o -name "*.log" -o -name "*.md" | sort >> "$REPORT"
echo '```' >> "$REPORT"

echo -e "${GREEN}✓${NC} Analysis report generated"
echo ""

#===============================================================================
# Complete
#===============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}DUMP COMPLETE${NC}"
echo ""
echo "Output: $DUMP_DIR"
echo ""
echo "Key files:"
echo "  $DUMP_DIR/ANALYSIS-REPORT.md  (Start here)"
echo "  $DUMP_DIR/service-list.txt"
echo "  $DUMP_DIR/services/           (Per-service summaries)"
echo "  $DUMP_DIR/build-logs/         (Build logs)"
echo "  $DUMP_DIR/runtime-logs/       (Runtime logs)"
echo ""
echo "Next: Run ./railway-diagnose.sh $DUMP_DIR"
echo ""

# Output the dump directory path for other scripts
echo "$DUMP_DIR" > ./.latest-dump-dir
