#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Cortex V6 Installer
#
# Handles:
#   - Fresh install (no existing Cortex)
#   - Upgrade from V5 (preserves database, removes old files)
#   - Upgrade from V4 (preserves config, removes old structure)
#
# Usage:
#   ./install.sh                    # Interactive
#   ./install.sh /path/to/cortex    # Install/upgrade at path
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-$(pwd)/cortex}"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Cortex V6 Installer          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════╝${NC}"
echo ""

# ---------------------------------------------------------------------------
# Detect existing installation
# ---------------------------------------------------------------------------

INSTALL_TYPE="fresh"
BACKUP_DIR=""

if [ -d "$TARGET_DIR" ]; then
    if [ -d "$TARGET_DIR/agents" ] || [ -d "$TARGET_DIR/orchestrator" ]; then
        INSTALL_TYPE="upgrade_v4"
        warn "Detected Cortex V4 at $TARGET_DIR"
    elif [ -f "$TARGET_DIR/brain.py" ] && [ -f "$TARGET_DIR/discover.py" ]; then
        INSTALL_TYPE="upgrade_v5"
        warn "Detected Cortex V5 at $TARGET_DIR"
    elif [ -f "$TARGET_DIR/main.py" ] && [ -d "$TARGET_DIR/knowledge" ]; then
        INSTALL_TYPE="upgrade_v6"
        warn "Detected Cortex V6 already at $TARGET_DIR"
    else
        warn "Unknown files at $TARGET_DIR"
        INSTALL_TYPE="upgrade_unknown"
    fi
fi

echo ""
info "Install type: $INSTALL_TYPE"
info "Target: $TARGET_DIR"
echo ""

# ---------------------------------------------------------------------------
# Backup existing installation
# ---------------------------------------------------------------------------

if [ "$INSTALL_TYPE" != "fresh" ]; then
    BACKUP_DIR="$TARGET_DIR.backup.$(date +%Y%m%d-%H%M%S)"
    info "Backing up existing installation to $BACKUP_DIR"
    cp -r "$TARGET_DIR" "$BACKUP_DIR"
    log "Backup created at $BACKUP_DIR"
    echo ""
fi

# ---------------------------------------------------------------------------
# Preserve data that should survive upgrade
# ---------------------------------------------------------------------------

PRESERVED_DB=""
PRESERVED_INCIDENTS=""
PRESERVED_PLATFORM=""
PRESERVED_ENV=""
PRESERVED_SERVICES_JSON=""
PRESERVED_AUTONOMY_JSON=""

if [ "$INSTALL_TYPE" = "upgrade_v5" ] || [ "$INSTALL_TYPE" = "upgrade_v6" ]; then
    # Preserve SQLite database
    for db_path in "$TARGET_DIR/cortex.db" "$TARGET_DIR/data/cortex.db" "/data/cortex.db"; do
        if [ -f "$db_path" ]; then
            PRESERVED_DB="$db_path"
            log "Will preserve database: $db_path"
            break
        fi
    done

    # Preserve .env if it exists
    if [ -f "$TARGET_DIR/.env" ]; then
        PRESERVED_ENV="$TARGET_DIR/.env"
        log "Will preserve .env"
    fi
fi

if [ "$INSTALL_TYPE" = "upgrade_v6" ]; then
    # Preserve user-edited knowledge docs
    if [ -f "$TARGET_DIR/knowledge/platform.md" ]; then
        PRESERVED_PLATFORM="$TARGET_DIR/knowledge/platform.md"
        log "Will preserve platform.md (your custom docs)"
    fi
    if [ -f "$TARGET_DIR/knowledge/incidents.md" ]; then
        PRESERVED_INCIDENTS="$TARGET_DIR/knowledge/incidents.md"
        log "Will preserve incidents.md (learned solutions)"
    fi
fi

if [ "$INSTALL_TYPE" = "upgrade_v4" ]; then
    # V4 had config/services.json — preserve it
    if [ -f "$TARGET_DIR/config/services.json" ]; then
        PRESERVED_SERVICES_JSON="$TARGET_DIR/config/services.json"
        log "Will preserve V4 services.json (business context)"
    fi
    if [ -f "$TARGET_DIR/config/autonomy.json" ]; then
        PRESERVED_AUTONOMY_JSON="$TARGET_DIR/config/autonomy.json"
        log "Will preserve V4 autonomy.json"
    fi
fi

echo ""

# ---------------------------------------------------------------------------
# Clean and install
# ---------------------------------------------------------------------------

if [ "$INSTALL_TYPE" != "fresh" ]; then
    info "Removing old files..."

    if [ "$INSTALL_TYPE" = "upgrade_v4" ]; then
        # Remove V4 directory structure
        rm -rf "$TARGET_DIR/agents"
        rm -rf "$TARGET_DIR/api"
        rm -rf "$TARGET_DIR/discovery"
        rm -rf "$TARGET_DIR/knowledge"  # V4 knowledge was JSON store, not docs
        rm -rf "$TARGET_DIR/mesh"
        rm -rf "$TARGET_DIR/notifications"
        rm -rf "$TARGET_DIR/orchestrator"
        rm -rf "$TARGET_DIR/scheduler"
        rm -rf "$TARGET_DIR/utils"
        rm -f "$TARGET_DIR"/*.py
        log "Removed V4 directory structure"
    elif [ "$INSTALL_TYPE" = "upgrade_v5" ]; then
        # Remove V5 flat files (we're replacing them)
        rm -f "$TARGET_DIR/brain.py"
        rm -f "$TARGET_DIR/discover.py"
        rm -f "$TARGET_DIR/github.py"
        rm -f "$TARGET_DIR/knowledge.py"
        rm -f "$TARGET_DIR/main.py"
        rm -f "$TARGET_DIR/notify.py"
        rm -f "$TARGET_DIR/railway.py"
        log "Removed V5 Python files"
    elif [ "$INSTALL_TYPE" = "upgrade_v6" ]; then
        # Remove V6 Python files only (preserve knowledge/ and config/)
        rm -f "$TARGET_DIR"/*.py
        log "Removed V6 Python files for replacement"
    fi
fi

# Create target directory
mkdir -p "$TARGET_DIR"
mkdir -p "$TARGET_DIR/knowledge"
mkdir -p "$TARGET_DIR/config"

# ---------------------------------------------------------------------------
# Copy V6 files
# ---------------------------------------------------------------------------

info "Installing Cortex V6..."

# Python files
for f in "$SCRIPT_DIR"/*.py; do
    if [ -f "$f" ]; then
        cp "$f" "$TARGET_DIR/"
    fi
done
log "Installed Python files"

# Knowledge docs (don't overwrite user-edited ones)
for f in "$SCRIPT_DIR/knowledge/"*.md; do
    if [ -f "$f" ]; then
        filename=$(basename "$f")
        if [ "$filename" = "platform.md" ] && [ -n "$PRESERVED_PLATFORM" ]; then
            info "Keeping your existing platform.md"
        elif [ "$filename" = "incidents.md" ] && [ -n "$PRESERVED_INCIDENTS" ]; then
            info "Keeping your existing incidents.md"
        else
            cp "$f" "$TARGET_DIR/knowledge/"
        fi
    fi
done
log "Installed knowledge docs"

# Config files (don't overwrite user-edited ones)
for f in "$SCRIPT_DIR/config/"*.json; do
    if [ -f "$f" ]; then
        filename=$(basename "$f")
        if [ "$filename" = "services.json" ] && [ -n "$PRESERVED_SERVICES_JSON" ]; then
            cp "$PRESERVED_SERVICES_JSON" "$TARGET_DIR/config/services.json"
            info "Preserved your existing services.json"
        elif [ "$filename" = "autonomy.json" ] && [ -n "$PRESERVED_AUTONOMY_JSON" ]; then
            cp "$PRESERVED_AUTONOMY_JSON" "$TARGET_DIR/config/autonomy.json"
            info "Preserved your existing autonomy.json"
        else
            cp "$f" "$TARGET_DIR/config/"
        fi
    fi
done
log "Installed config files"

# Deployment files
cp "$SCRIPT_DIR/Dockerfile" "$TARGET_DIR/"
cp "$SCRIPT_DIR/railway.toml" "$TARGET_DIR/"
cp "$SCRIPT_DIR/requirements.txt" "$TARGET_DIR/"
if [ ! -f "$TARGET_DIR/.env" ]; then
    cp "$SCRIPT_DIR/.env.example" "$TARGET_DIR/.env.example"
fi
log "Installed deployment files"

# ---------------------------------------------------------------------------
# Restore preserved data
# ---------------------------------------------------------------------------

if [ -n "$PRESERVED_DB" ] && [ -f "$PRESERVED_DB" ]; then
    # Keep DB in its original location if it was outside target
    if [[ "$PRESERVED_DB" != "$TARGET_DIR"* ]]; then
        info "Database preserved at $PRESERVED_DB"
    else
        log "Database in place"
    fi
fi

if [ -n "$PRESERVED_ENV" ] && [ -f "$PRESERVED_ENV" ]; then
    if [ "$(realpath "$PRESERVED_ENV")" != "$(realpath "$TARGET_DIR/.env")" ]; then
        cp "$PRESERVED_ENV" "$TARGET_DIR/.env"
    fi
    log "Restored .env"
fi

if [ -n "$PRESERVED_PLATFORM" ] && [ -f "$PRESERVED_PLATFORM" ]; then
    cp "$PRESERVED_PLATFORM" "$TARGET_DIR/knowledge/platform.md"
    log "Restored platform.md"
fi

if [ -n "$PRESERVED_INCIDENTS" ] && [ -f "$PRESERVED_INCIDENTS" ]; then
    cp "$PRESERVED_INCIDENTS" "$TARGET_DIR/knowledge/incidents.md"
    log "Restored incidents.md"
fi

# ---------------------------------------------------------------------------
# Verify installation
# ---------------------------------------------------------------------------

echo ""
info "Verifying installation..."

EXPECTED_FILES=(
    "main.py" "railway.py" "github.py" "knowledge.py"
    "discover.py" "brain.py" "notify.py" "docs.py" "config.py"
    "Dockerfile" "railway.toml" "requirements.txt"
    "knowledge/railway.md" "knowledge/laravel.md" "knowledge/postgres.md"
    "knowledge/redis.md" "knowledge/platform.md" "knowledge/incidents.md"
    "config/services.json" "config/autonomy.json"
)

MISSING=0
for f in "${EXPECTED_FILES[@]}"; do
    if [ ! -f "$TARGET_DIR/$f" ]; then
        err "Missing: $f"
        MISSING=$((MISSING + 1))
    fi
done

if [ "$MISSING" -eq 0 ]; then
    log "All files verified"
else
    err "$MISSING files missing!"
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Cortex V6 Installed ✓          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# Count files
PY_COUNT=$(find "$TARGET_DIR" -maxdepth 1 -name "*.py" | wc -l)
DOC_COUNT=$(find "$TARGET_DIR/knowledge" -name "*.md" | wc -l)
CONF_COUNT=$(find "$TARGET_DIR/config" -name "*.json" | wc -l)
TOTAL_LINES=$(cat "$TARGET_DIR"/*.py 2>/dev/null | wc -l)

echo "  Python files:    $PY_COUNT ($TOTAL_LINES lines)"
echo "  Knowledge docs:  $DOC_COUNT"
echo "  Config files:    $CONF_COUNT"
echo ""

if [ -n "$BACKUP_DIR" ]; then
    echo "  Backup at: $BACKUP_DIR"
    echo ""
fi

echo "  Structure:"
echo "  ├── *.py              (9 modules)"
echo "  ├── knowledge/"
echo "  │   ├── railway.md    (Railway deployment patterns)"
echo "  │   ├── laravel.md    (Laravel debugging)"
echo "  │   ├── postgres.md   (Database troubleshooting)"
echo "  │   ├── redis.md      (Cache/queue issues)"
echo "  │   ├── vue-vite-tailwind.md"
echo "  │   ├── node.md"
echo "  │   ├── python.md"
echo "  │   ├── platform.md   ← EDIT THIS (your architecture)"
echo "  │   └── incidents.md  ← Auto-populated"
echo "  ├── config/"
echo "  │   ├── services.json ← EDIT THIS (business context)"
echo "  │   └── autonomy.json ← EDIT THIS (permissions)"
echo "  ├── Dockerfile"
echo "  ├── railway.toml"
echo "  └── requirements.txt"
echo ""

if [ ! -f "$TARGET_DIR/.env" ]; then
    warn "Next step: Copy .env.example to .env and fill in your tokens:"
    echo "    cp $TARGET_DIR/.env.example $TARGET_DIR/.env"
    echo ""
fi

echo "  To deploy on Railway:"
echo "    1. Push to GitHub"
echo "    2. Connect repo to Railway service"
echo "    3. Set environment variables"
echo "    4. Add a volume mounted at /data (for SQLite persistence)"
echo ""
echo "  To run locally:"
echo "    cd $TARGET_DIR"
echo "    pip install -r requirements.txt"
echo "    uvicorn main:app --reload --port 8000"
echo ""
