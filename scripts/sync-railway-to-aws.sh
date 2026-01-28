#!/bin/bash
set -e

# Sync Railway Database to AWS RDS
# Usage: ./scripts/sync-railway-to-aws.sh [options]

# Default values
MODE="initial" # initial, update, verify
LOCAL_DUMP_FILE="railway_dump.sql"
USE_DOCKER=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper Functions
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_dependencies() {
    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump is not installed (postgresql-client required)"
        exit 1
    fi
    if ! command -v pg_restore &> /dev/null; then
        print_error "pg_restore is not installed"
        exit 1
    fi
}

load_env() {
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    fi
}

# Parse Arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --mode) MODE="$2"; shift ;;
        --docker) USE_DOCKER=true ;;
        --file) LOCAL_DUMP_FILE="$2"; shift ;;
        --help) 
            echo "Usage: ./scripts/sync-railway-to-aws.sh [options]"
            echo "Options:"
            echo "  --mode <initial|update|verify>  Sync mode (default: initial)"
            echo "                                  initial: Full schema + data (drops existing)"
            echo "                                  update: Data only (truncates existing data)"
            echo "                                  verify: Check connection and stats only"
            echo "  --docker                        Use dockerized pg_dump/pg_restore"
            echo "  --file <path>                   Path to dump file (default: railway_dump.sql)"
            exit 0
            ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
    esac
    shift
done

print_step "Starting Railway -> AWS Sync (Mode: $MODE)"

# Load Configuration
load_env

# Validate Configuration
if [ -z "$RAILWAY_DB_URL" ]; then
    print_warning "RAILWAY_DB_URL not set in .env"
    read -p "Enter Railway Database URL: " RAILWAY_DB_URL
fi

# AWS RDS Configuration
# If AWS_DB_URL is not set, try to construct it from separate vars
if [ -z "$AWS_DB_URL" ]; then
    if [ -n "$DB_HOST" ] && [ -n "$DB_USERNAME" ] && [ -n "$DB_PASSWORD" ]; then
        AWS_DB_URL="postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE"
    else
        print_warning "AWS Database details missing in .env"
        echo "Please provide details or ensure .env has DB_HOST, DB_USERNAME, DB_PASSWORD"
        read -p "Enter Target AWS DB URL or verify .env: " INPUT_AWS_URL
        [ -n "$INPUT_AWS_URL" ] && AWS_DB_URL="$INPUT_AWS_URL"
    fi
fi

if [ -z "$AWS_DB_URL" ]; then
    print_error "Target AWS Database URL is required."
    exit 1
fi

# Tunnel Handling (If needed)
if [ -n "$BASTION_HOST" ]; then
    print_step "Setting up SSH Tunnel through $BASTION_HOST..."
    # Extract host and port from AWS URL for the tunnel
    # This is complex to parse in bash reliably, assuming direct connection or VPN for now
    # Or implement simple background ssh tunnel
    print_warning "Bastion host set, but auto-tunneling not fully implemented in this script version."
    print_warning "Please ensure you have an open tunnel if RDS is private: ssh -L 5432:rds-endpoint:5432 user@bastion"
fi

# Execution Logic
case $MODE in
    "initial")
        print_step "Step 1: Dumping from Railway (Full Schema + Data)..."
        PGPASSWORD=${RAILWAY_DB_URL##*:} pg_dump --ipv4 --format=custom --verbose --file="$LOCAL_DUMP_FILE" "$RAILWAY_DB_URL" || {
             # Fallback if URL parsing fails or PGPASSWORD not accepted directly
             pg_dump --format=custom --verbose --file="$LOCAL_DUMP_FILE" --dbname="$RAILWAY_DB_URL"
        }
        
        print_success "Dump completed: $LOCAL_DUMP_FILE"
        
        print_step "Step 2: Restoring to AWS RDS (Clean & Replace)..."
        # --clean: Drop database objects before creating them
        # --if-exists: Used with --clean to prevent errors if they don't exist
        # --no-owner: AWS RDS often has different user permissions
        # --no-privileges: Skip granting privileges (safer for RDS)
        
        pg_restore --verbose --clean --if-exists --no-owner --no-privileges --dbname="$AWS_DB_URL" "$LOCAL_DUMP_FILE"
        
        print_success "Initial Migration Completed Successfully!"
        ;;
        
    "update")
        print_step "Step 1: Dumping Data Only from Railway..."
        # --data-only: Do not dump schema
        pg_dump --format=custom --data-only --verbose --file="$LOCAL_DUMP_FILE" --dbname="$RAILWAY_DB_URL"
        
        print_success "Data Dump completed: $LOCAL_DUMP_FILE"
        
        print_step "Step 2: Updating AWS RDS Data..."
        # Warning: This can be risky.
        # --disable-triggers: Important for referential integrity during bulk load
        # --data-only: Implicit from the dump file, but good to specify
        
        print_warning "Update mode will allow data overwrite. Ensure schema matches!"
        
        pg_restore --verbose --data-only --disable-triggers --no-owner --no-privileges --dbname="$AWS_DB_URL" "$LOCAL_DUMP_FILE"
        
        print_success "Data Update Completed Successfully!"
        ;;
        
    "verify")
        print_step "Verifying Connections..."
        
        echo "Source (Railway):"
        psql --dbname="$RAILWAY_DB_URL" -c "SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
        
        echo "Target (AWS):"
        psql --dbname="$AWS_DB_URL" -c "SELECT count(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
        
        print_success "Verification Done."
        ;;
esac

# Cleanup
if [ -f "$LOCAL_DUMP_FILE" ]; then
    print_step "Cleaning up dump file..."
    rm "$LOCAL_DUMP_FILE"
fi

echo -e "\n${GREEN}🚀 Mission Accomplished.${NC}"
