#!/bin/bash

# Run database migrations on AWS RDS
# Usage: ./scripts/migrate-database.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running database migrations...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file with database credentials${NC}"
    exit 1
fi

# Check database connection
echo -e "${BLUE}Testing database connection...${NC}"
if php artisan db:show > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}Please check your database credentials in .env${NC}"
    exit 1
fi

# Run migrations
echo -e "${BLUE}Running migrations...${NC}"
if php artisan migrate --force; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
    echo -e "${RED}❌ Migrations failed${NC}"
    exit 1
fi

# Seed test users (optional)
echo -e "${BLUE}Would you like to seed test users? (y/n)${NC}"
read -r SEED_USERS
if [ "$SEED_USERS" = "y" ] || [ "$SEED_USERS" = "Y" ]; then
    echo -e "${BLUE}Seeding test users...${NC}"
    php artisan db:seed --class=PlaywrightTestUsersSeeder
    echo -e "${GREEN}✅ Test users seeded${NC}"
fi

echo -e "\n${GREEN}✅ Database setup complete!${NC}"

