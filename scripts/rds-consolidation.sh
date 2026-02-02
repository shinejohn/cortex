#!/bin/bash
set -e

# RDS Database Consolidation Script
# Consolidates all databases into one Aurora Serverless v2 cluster
# Preserves all credentials and connection strings

echo "🚀 RDS Database Consolidation Script"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TARGET_CLUSTER="taskjugglerstack-auroracluster23d869c0-olydhprenkvz"
TARGET_ENDPOINT="taskjugglerstack-auroracluster23d869c0-olydhprenkvz.cluster-csr8wa00wss4.us-east-1.rds.amazonaws.com"
TARGET_PORT="5432"
BACKUP_DIR="./db-backups"
mkdir -p "$BACKUP_DIR"

# Source databases
# Note: PhotoGuard cluster may have been deleted already
declare -A SOURCES=(
    ["fibonacco"]="fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com|fibonacco/dev/app-secrets|fibonacco"
    ["taskjuggler-prod"]="taskjuggler-production-db.csr8wa00wss4.us-east-1.rds.amazonaws.com|taskjuggler/production/database|taskjuggler"
    ["learning-center"]="learning-center-db-instance-1.csr8wa00wss4.us-east-1.rds.amazonaws.com|learning-center/database/credentials|learning_center"
)

# Function to get secret value from AWS Secrets Manager
get_secret_value() {
    local secret_name=$1
    local key=$2
    aws secretsmanager get-secret-value --secret-id "$secret_name" --query SecretString --output text 2>/dev/null | jq -r ".$key" 2>/dev/null || echo ""
}

# Function to check if database has data
check_database_has_data() {
    local host=$1
    local user=$2
    local pass=$3
    local db_name=$4
    
    echo -e "${BLUE}Checking $db_name...${NC}"
    
    # Check if database exists and has tables
    local table_count=$(PGPASSWORD="$pass" psql -h "$host" -U "$user" -d "$db_name" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
    
    if [ "$table_count" -gt "0" ]; then
        local db_size=$(PGPASSWORD="$pass" psql -h "$host" -U "$user" -d "$db_name" -t -c "SELECT pg_size_pretty(pg_database_size('$db_name'));" 2>/dev/null | tr -d ' ' || echo "0 bytes")
        echo -e "${GREEN}✓ $db_name has $table_count tables ($db_size)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ $db_name appears empty (no tables)${NC}"
        return 1
    fi
}

# Function to export database
export_database() {
    local name=$1
    local host=$2
    local user=$3
    local pass=$4
    local db_name=$5
    
    echo -e "${BLUE}Exporting $name...${NC}"
    
    PGPASSWORD="$pass" pg_dump \
        -h "$host" \
        -U "$user" \
        -d "$db_name" \
        --no-owner \
        --no-acl \
        --format=custom \
        -f "$BACKUP_DIR/${name}.dump" 2>&1
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$BACKUP_DIR/${name}.dump" | cut -f1)
        echo -e "${GREEN}✓ Exported $name ($size)${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to export $name${NC}"
        return 1
    fi
}

# Function to create database in target cluster
create_database_in_target() {
    local db_name=$1
    local target_user=$2
    local target_pass=$3
    
    echo -e "${BLUE}Creating database '$db_name' in target cluster...${NC}"
    
    PGPASSWORD="$target_pass" psql -h "$TARGET_ENDPOINT" -U "$target_user" -d postgres <<EOF 2>&1
CREATE DATABASE $db_name;
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Created database '$db_name'${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Database '$db_name' might already exist (continuing...)${NC}"
        return 0
    fi
}

# Function to restore database
restore_database() {
    local name=$1
    local db_name=$2
    local target_user=$3
    local target_pass=$4
    
    echo -e "${BLUE}Restoring $name to '$db_name'...${NC}"
    
    PGPASSWORD="$target_pass" pg_restore \
        -h "$TARGET_ENDPOINT" \
        -U "$target_user" \
        -d "$db_name" \
        --no-owner \
        --no-acl \
        --verbose \
        "$BACKUP_DIR/${name}.dump" 2>&1 | tail -5
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Restored $name${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to restore $name${NC}"
        return 1
    fi
}

# Function to create user with same credentials
create_user_in_target() {
    local username=$1
    local password=$2
    local target_user=$3
    local target_pass=$4
    
    echo -e "${BLUE}Creating user '$username' in target cluster...${NC}"
    
    PGPASSWORD="$target_pass" psql -h "$TARGET_ENDPOINT" -U "$target_user" -d postgres <<EOF 2>&1
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$username') THEN
        CREATE USER $username WITH PASSWORD '$password';
    END IF;
END
\$\$;
EOF
    
    echo -e "${GREEN}✓ User '$username' ready${NC}"
}

# Function to grant permissions
grant_permissions() {
    local username=$1
    local db_name=$2
    local target_user=$3
    local target_pass=$4
    
    echo -e "${BLUE}Granting permissions to '$username' on '$db_name'...${NC}"
    
    PGPASSWORD="$target_pass" psql -h "$TARGET_ENDPOINT" -U "$target_user" -d postgres <<EOF 2>&1
GRANT ALL PRIVILEGES ON DATABASE $db_name TO $username;
\c $db_name
GRANT ALL ON SCHEMA public TO $username;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $username;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $username;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $username;
EOF
    
    echo -e "${GREEN}✓ Permissions granted${NC}"
}

# Step 1: Get target cluster credentials
echo -e "${YELLOW}Step 1: Getting target cluster credentials...${NC}"
TARGET_USER="postgres"
# Try to get from Pulumi config or use default
TARGET_PASS=$(cd INFRASTRUCTURE && pulumi config get --secret db_password 2>/dev/null || echo "")

if [ -z "$TARGET_PASS" ]; then
    echo -e "${YELLOW}⚠ Target password not found in Pulumi config${NC}"
    echo -e "${YELLOW}Please enter the password for the target Aurora cluster:${NC}"
    read -s TARGET_PASS
    echo ""
fi

# Test target connection
echo -e "${BLUE}Testing target cluster connection...${NC}"
if PGPASSWORD="$TARGET_PASS" psql -h "$TARGET_ENDPOINT" -U "$TARGET_USER" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Target cluster connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to target cluster. Check credentials.${NC}"
    exit 1
fi

# Step 2: Check each source database
echo ""
echo -e "${YELLOW}Step 2: Checking source databases for data...${NC}"
declare -A DATABASES_TO_MIGRATE

for name in "${!SOURCES[@]}"; do
    IFS='|' read -r host secret_name db_name <<< "${SOURCES[$name]}"
    
    # Get credentials from Secrets Manager
    DB_USER=$(get_secret_value "$secret_name" "DB_USERNAME" || get_secret_value "$secret_name" "username" || echo "postgres")
    DB_PASS=$(get_secret_value "$secret_name" "DB_PASSWORD" || get_secret_value "$secret_name" "password" || echo "")
    
    if [ -z "$DB_PASS" ]; then
        echo -e "${YELLOW}⚠ Could not get password for $name from Secrets Manager${NC}"
        echo -e "${YELLOW}Enter password for $name (or press Enter to skip):${NC}"
        read -s DB_PASS
        echo ""
    fi
    
    if [ -n "$DB_PASS" ]; then
        if check_database_has_data "$host" "$DB_USER" "$DB_PASS" "$db_name"; then
            DATABASES_TO_MIGRATE["$name"]="${host}|${DB_USER}|${DB_PASS}|${db_name}|${secret_name}"
        fi
    fi
done

if [ ${#DATABASES_TO_MIGRATE[@]} -eq 0 ]; then
    echo -e "${YELLOW}⚠ No databases with data found to migrate${NC}"
    echo -e "${YELLOW}You can proceed to delete empty databases manually${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Found ${#DATABASES_TO_MIGRATE[@]} database(s) to migrate${NC}"

# Step 3: Export databases
echo ""
echo -e "${YELLOW}Step 3: Exporting databases...${NC}"
for name in "${!DATABASES_TO_MIGRATE[@]}"; do
    IFS='|' read -r host user pass db_name secret_name <<< "${DATABASES_TO_MIGRATE[$name]}"
    export_database "$name" "$host" "$user" "$pass" "$db_name"
done

# Step 4: Create databases and users in target
echo ""
echo -e "${YELLOW}Step 4: Creating databases and users in target cluster...${NC}"
for name in "${!DATABASES_TO_MIGRATE[@]}"; do
    IFS='|' read -r host user pass db_name secret_name <<< "${DATABASES_TO_MIGRATE[$name]}"
    
    create_database_in_target "$db_name" "$TARGET_USER" "$TARGET_PASS"
    create_user_in_target "$user" "$pass" "$TARGET_USER" "$TARGET_PASS"
    grant_permissions "$user" "$db_name" "$TARGET_USER" "$TARGET_PASS"
done

# Step 5: Restore databases
echo ""
echo -e "${YELLOW}Step 5: Restoring databases to target cluster...${NC}"
for name in "${!DATABASES_TO_MIGRATE[@]}"; do
    IFS='|' read -r host user pass db_name secret_name <<< "${DATABASES_TO_MIGRATE[$name]}"
    restore_database "$name" "$db_name" "$TARGET_USER" "$TARGET_PASS"
done

# Step 6: Update AWS Secrets Manager
echo ""
echo -e "${YELLOW}Step 6: Updating AWS Secrets Manager...${NC}"
for name in "${!DATABASES_TO_MIGRATE[@]}"; do
    IFS='|' read -r host user pass db_name secret_name <<< "${DATABASES_TO_MIGRATE[$name]}"
    
    echo -e "${BLUE}Updating $secret_name...${NC}"
    
    # Get current secret
    CURRENT_SECRET=$(aws secretsmanager get-secret-value --secret-id "$secret_name" --query SecretString --output text 2>/dev/null)
    
    if [ -n "$CURRENT_SECRET" ]; then
        # Update DB_HOST in secret
        UPDATED_SECRET=$(echo "$CURRENT_SECRET" | jq --arg host "$TARGET_ENDPOINT" --arg port "$TARGET_PORT" '.DB_HOST = $host | .DB_PORT = $port' 2>/dev/null)
        
        if [ -n "$UPDATED_SECRET" ]; then
            aws secretsmanager update-secret \
                --secret-id "$secret_name" \
                --secret-string "$UPDATED_SECRET" \
                > /dev/null 2>&1
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Updated $secret_name${NC}"
            else
                echo -e "${RED}✗ Failed to update $secret_name${NC}"
            fi
        fi
    fi
done

# Step 7: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Migration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update Pulumi code to reference the shared Aurora cluster"
echo "2. Redeploy ECS services to pick up new connection strings"
echo "3. Test all applications"
echo "4. After 24-48 hours of verification, delete old RDS instances"
echo ""
echo -e "${BLUE}Target Cluster:${NC} $TARGET_ENDPOINT"
echo -e "${BLUE}Migrated Databases:${NC}"
for name in "${!DATABASES_TO_MIGRATE[@]}"; do
    IFS='|' read -r host user pass db_name secret_name <<< "${DATABASES_TO_MIGRATE[$name]}"
    echo "  - $db_name (from $name)"
done
echo ""
echo -e "${YELLOW}Backups saved to:${NC} $BACKUP_DIR"
echo ""
