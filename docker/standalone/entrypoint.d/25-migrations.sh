#!/bin/bash

# Configuration
MAX_RETRIES=${DB_CONNECTION_RETRIES:-10}
RETRY_DELAY=${DB_CONNECTION_RETRY_DELAY:-5}
MIGRATION_MAX_RETRIES=${MIGRATION_MAX_RETRIES:-3}
MIGRATION_RETRY_DELAY=${MIGRATION_RETRY_DELAY:-10}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check database connectivity
check_database_connection() {
    local retry_count=0
    echo -e "${YELLOW}🔍 [Startup] Checking database connectivity...${NC}"
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if php artisan db:show --database=default > /dev/null 2>&1; then
            echo -e "${GREEN}✅ [Startup] Database connection successful${NC}"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠️  [Startup] Database not ready (attempt $retry_count/$MAX_RETRIES), retrying in ${RETRY_DELAY}s...${NC}"
            sleep $RETRY_DELAY
        fi
    done
    
    echo -e "${RED}❌ [Startup] Failed to connect to database after $MAX_RETRIES attempts${NC}"
    echo -e "${YELLOW}⚠️  [Startup] Continuing anyway - migrations may fail if database is not available${NC}"
    return 1
}

# Function to run migrations with retry logic
run_migrations() {
    local retry_count=0
    
    echo -e "${YELLOW}🚀 [Startup] Running database migrations...${NC}"
    
    while [ $retry_count -lt $MIGRATION_MAX_RETRIES ]; do
        if php artisan migrate --force; then
            echo -e "${GREEN}✅ [Startup] Migrations completed successfully${NC}"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $MIGRATION_MAX_RETRIES ]; then
            echo -e "${YELLOW}⚠️  [Startup] Migration failed (attempt $retry_count/$MIGRATION_MAX_RETRIES), retrying in ${MIGRATION_RETRY_DELAY}s...${NC}"
            sleep $MIGRATION_RETRY_DELAY
        fi
    done
    
    echo -e "${RED}❌ [Startup] Migrations failed after $MIGRATION_MAX_RETRIES attempts${NC}"
    echo -e "${YELLOW}⚠️  [Startup] This may be due to:${NC}"
    echo -e "${YELLOW}   - Database not ready${NC}"
    echo -e "${YELLOW}   - Migration conflicts${NC}"
    echo -e "${YELLOW}   - Schema issues${NC}"
    echo -e "${YELLOW}⚠️  [Startup] Check logs for details: storage/logs/laravel.log${NC}"
    
    # Don't exit with error - allow container to start even if migrations fail
    # This prevents cascading failures in multi-service deployments
    return 1
}

# Function to run seeders
run_seeders() {
    if [ "$SEED_ON_DEPLOY" = "true" ]; then
        echo -e "${YELLOW}🌱 [Startup] Seeding database...${NC}"
        if php artisan db:seed --force; then
            echo -e "${GREEN}✅ [Startup] Database seeding completed successfully${NC}"
        else
            echo -e "${RED}❌ [Startup] Database seeding failed${NC}"
            echo -e "${YELLOW}⚠️  [Startup] Continuing anyway...${NC}"
        fi
    fi
}

# Main execution
main() {
    # Check database connectivity first
    check_database_connection
    
    # Run migrations with retry logic
    run_migrations
    
    # Run seeders if enabled
    run_seeders
    
    echo -e "${GREEN}✅ [Startup] Migration script completed${NC}"
}

# Run main function
main
