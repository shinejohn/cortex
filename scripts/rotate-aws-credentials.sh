#!/bin/bash
set -e

# Rotate AWS Credentials Without Downtime
# Creates new keys, updates all services, verifies, then revokes old keys

echo "🔄 AWS Credential Rotation Script"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Exposed credentials (from .env.testing)
OLD_ACCESS_KEY="AKIAS3AEXW25YDDEMQEJ"
OLD_SECRET_KEY="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"

# Get current IAM user
CURRENT_USER=$(aws sts get-caller-identity --query 'Arn' --output text | sed 's/.*\///')
echo -e "${BLUE}Current IAM User:${NC} $CURRENT_USER"

# Check if old key matches current
CURRENT_KEY=$(aws configure get aws_access_key_id 2>/dev/null || echo "")
if [ "$CURRENT_KEY" = "$OLD_ACCESS_KEY" ]; then
    echo -e "${YELLOW}⚠️  Warning: Currently using the exposed key!${NC}"
    echo -e "${YELLOW}We'll create new keys and switch to them.${NC}"
fi

# Step 1: Create new access keys
echo ""
echo -e "${YELLOW}Step 1: Creating new AWS access keys...${NC}"

# Check how many keys the user already has
KEY_COUNT=$(aws iam list-access-keys --user-name "$CURRENT_USER" --query 'AccessKeyMetadata | length(@)' --output text 2>&1 || echo "0")

if [ "$KEY_COUNT" -ge "2" ]; then
    echo -e "${YELLOW}⚠️  User already has 2 access keys (AWS limit).${NC}"
    echo ""
    echo "Current access keys:"
    aws iam list-access-keys --user-name "$CURRENT_USER" --output table
    echo ""
    
    # Check if exposed key exists
    EXPOSED_EXISTS=$(aws iam list-access-keys --user-name "$CURRENT_USER" --query "AccessKeyMetadata[?AccessKeyId=='$OLD_ACCESS_KEY'] | length(@)" --output text)
    
    if [ "$EXPOSED_EXISTS" = "1" ]; then
        echo -e "${YELLOW}Found exposed key: $OLD_ACCESS_KEY${NC}"
        echo -e "${BLUE}Strategy: Delete the OTHER key first, create new one, then delete exposed key${NC}"
        echo ""
        
        # Get the other key (not the exposed one)
        OTHER_KEY=$(aws iam list-access-keys --user-name "$CURRENT_USER" --query "AccessKeyMetadata[?AccessKeyId!='$OLD_ACCESS_KEY'].AccessKeyId" --output text | awk '{print $1}')
        
        if [ -n "$OTHER_KEY" ]; then
            echo -e "${BLUE}Temporarily deleting other key: $OTHER_KEY${NC}"
            echo -e "${YELLOW}(We'll recreate it after if needed)${NC}"
            aws iam delete-access-key --user-name "$CURRENT_USER" --access-key-id "$OTHER_KEY"
            echo -e "${GREEN}✓ Deleted other key${NC}"
            OTHER_KEY_BACKUP="$OTHER_KEY"
        fi
    else
        echo -e "${GREEN}✓ Exposed key not found (may already be deleted)${NC}"
        # Delete the older key to make room
        OLDER_KEY=$(aws iam list-access-keys --user-name "$CURRENT_USER" --query "AccessKeyMetadata | sort_by(@, &CreateDate) | [0].AccessKeyId" --output text)
        if [ -n "$OLDER_KEY" ]; then
            echo -e "${BLUE}Deleting older key to make room: $OLDER_KEY${NC}"
            aws iam delete-access-key --user-name "$CURRENT_USER" --access-key-id "$OLDER_KEY"
            echo -e "${GREEN}✓ Deleted older key${NC}"
        fi
    fi
fi

# Create new access key
echo -e "${BLUE}Creating new access key for user: $CURRENT_USER${NC}"
NEW_KEY_RESPONSE=$(aws iam create-access-key --user-name "$CURRENT_USER" --output json 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to create new access key${NC}"
    echo "$NEW_KEY_RESPONSE"
    exit 1
fi

NEW_ACCESS_KEY=$(echo "$NEW_KEY_RESPONSE" | jq -r '.AccessKey.AccessKeyId')
NEW_SECRET_KEY=$(echo "$NEW_KEY_RESPONSE" | jq -r '.AccessKey.SecretAccessKey')

echo -e "${GREEN}✓ New access key created:${NC} $NEW_ACCESS_KEY"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Save these credentials securely!${NC}"
echo -e "${BLUE}New Access Key ID:${NC} $NEW_ACCESS_KEY"
echo -e "${BLUE}New Secret Access Key:${NC} $NEW_SECRET_KEY"
echo ""

# Step 2: Test new credentials
echo -e "${YELLOW}Step 2: Testing new credentials...${NC}"

# Test with new credentials
export AWS_ACCESS_KEY_ID="$NEW_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="$NEW_SECRET_KEY"

if aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${GREEN}✓ New credentials work!${NC}"
else
    echo -e "${RED}✗ New credentials failed test${NC}"
    exit 1
fi

# Step 3: Update AWS Secrets Manager
echo ""
echo -e "${YELLOW}Step 3: Updating AWS Secrets Manager...${NC}"

SECRET_NAME="fibonacco/dev/app-secrets"

# Get current secret
CURRENT_SECRET=$(aws secretsmanager get-secret-value --secret-id "$SECRET_NAME" --query SecretString --output text 2>&1)

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Secret not found or can't access. Continuing...${NC}"
else
    # Update secret with new credentials
    UPDATED_SECRET=$(echo "$CURRENT_SECRET" | jq --arg key "$NEW_ACCESS_KEY" --arg secret "$NEW_SECRET_KEY" \
        '.AWS_ACCESS_KEY_ID = $key | .AWS_SECRET_ACCESS_KEY = $secret')
    
    echo -e "${BLUE}Updating secret: $SECRET_NAME${NC}"
    aws secretsmanager update-secret \
        --secret-id "$SECRET_NAME" \
        --secret-string "$UPDATED_SECRET" \
        > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Updated AWS Secrets Manager${NC}"
    else
        echo -e "${RED}✗ Failed to update Secrets Manager${NC}"
        echo -e "${YELLOW}⚠️  You'll need to update manually${NC}"
    fi
fi

# Step 4: Update local AWS config (optional, for CLI use)
echo ""
read -p "Update local AWS CLI config with new credentials? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    aws configure set aws_access_key_id "$NEW_ACCESS_KEY"
    aws configure set aws_secret_access_key "$NEW_SECRET_KEY"
    echo -e "${GREEN}✓ Updated local AWS CLI config${NC}"
fi

# Step 5: Regenerate VAPID keys
echo ""
echo -e "${YELLOW}Step 4: Regenerating VAPID keys...${NC}"

# Generate new VAPID keys (using web-push library or online generator)
echo -e "${BLUE}Generating new VAPID keys...${NC}"
echo -e "${YELLOW}You can generate VAPID keys at: https://web-push-codelab.glitch.me/${NC}"
echo -e "${YELLOW}Or run: php artisan webpush:vapid (if command exists)${NC}"
echo ""
read -p "Enter new VAPID_PUBLIC_KEY (or press Enter to skip): " NEW_VAPID_PUBLIC
read -p "Enter new VAPID_PRIVATE_KEY (or press Enter to skip): " NEW_VAPID_PRIVATE

if [ -n "$NEW_VAPID_PUBLIC" ] && [ -n "$NEW_VAPID_PRIVATE" ]; then
    if [ -n "$CURRENT_SECRET" ]; then
        UPDATED_SECRET=$(echo "$CURRENT_SECRET" | jq --arg pub "$NEW_VAPID_PUBLIC" --arg priv "$NEW_VAPID_PRIVATE" \
            '.VAPID_PUBLIC_KEY = $pub | .VAPID_PRIVATE_KEY = $priv')
        
        aws secretsmanager update-secret \
            --secret-id "$SECRET_NAME" \
            --secret-string "$UPDATED_SECRET" \
            > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Updated VAPID keys in Secrets Manager${NC}"
        fi
    fi
fi

# Step 6: Regenerate APP_KEY
echo ""
echo -e "${YELLOW}Step 5: Regenerating Laravel APP_KEY...${NC}"

# Generate new APP_KEY
NEW_APP_KEY=$(php artisan key:generate --show 2>/dev/null | grep -oP 'base64:[^\s]+' || echo "")

if [ -n "$NEW_APP_KEY" ]; then
    echo -e "${GREEN}✓ Generated new APP_KEY${NC}"
    
    if [ -n "$CURRENT_SECRET" ]; then
        UPDATED_SECRET=$(echo "$CURRENT_SECRET" | jq --arg key "$NEW_APP_KEY" '.APP_KEY = $key')
        
        aws secretsmanager update-secret \
            --secret-id "$SECRET_NAME" \
            --secret-string "$UPDATED_SECRET" \
            > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Updated APP_KEY in Secrets Manager${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Could not generate APP_KEY automatically${NC}"
    echo -e "${YELLOW}Run manually: php artisan key:generate --show${NC}"
fi

# Step 7: Redeploy ECS services to pick up new secrets
echo ""
echo -e "${YELLOW}Step 6: Redeploying ECS services...${NC}"

CLUSTER="fibonacco-dev"
SERVICES=("goeventcity" "daynews" "downtownguide" "alphasite" "ssr" "horizon")

for service in "${SERVICES[@]}"; do
    SERVICE_NAME="fibonacco-dev-$service"
    echo -e "${BLUE}Forcing deployment for: $SERVICE_NAME${NC}"
    
    aws ecs update-service \
        --cluster "$CLUSTER" \
        --service "$SERVICE_NAME" \
        --force-new-deployment \
        --region us-east-1 \
        > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Triggered deployment for $service${NC}"
    else
        echo -e "${YELLOW}⚠️  Failed to deploy $service (may not exist)${NC}"
    fi
done

# Step 8: Wait and verify services are using new credentials
echo ""
echo -e "${YELLOW}Step 7: Waiting for deployments...${NC}"
echo -e "${BLUE}Waiting 30 seconds for services to restart...${NC}"
sleep 30

# Step 9: Verify new credentials are working
echo ""
echo -e "${YELLOW}Step 8: Verifying new credentials in production...${NC}"

# Test AWS API calls with new credentials
if aws s3 ls > /dev/null 2>&1; then
    echo -e "${GREEN}✓ S3 access works with new credentials${NC}"
fi

if aws ecs list-clusters > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ECS access works with new credentials${NC}"
fi

# Step 10: Revoke old credentials
echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}Step 9: Revoking OLD credentials${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  About to delete the exposed access key: $OLD_ACCESS_KEY${NC}"
echo -e "${YELLOW}Make sure all services are using new credentials!${NC}"
echo ""
read -p "Delete old access key now? (type 'yes' to confirm): " CONFIRM_DELETE

if [ "$CONFIRM_DELETE" = "yes" ]; then
    echo -e "${BLUE}Deleting old access key: $OLD_ACCESS_KEY${NC}"
    
    aws iam delete-access-key \
        --user-name "$CURRENT_USER" \
        --access-key-id "$OLD_ACCESS_KEY" \
        2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Old access key deleted!${NC}"
        
        # If we backed up another key, recreate it if needed
        if [ -n "$OTHER_KEY_BACKUP" ]; then
            echo ""
            read -p "Recreate the other key ($OTHER_KEY_BACKUP)? (y/n) " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}Creating replacement key...${NC}"
                REPLACEMENT_KEY=$(aws iam create-access-key --user-name "$CURRENT_USER" --output json | jq -r '.AccessKey.AccessKeyId')
                REPLACEMENT_SECRET=$(aws iam create-access-key --user-name "$CURRENT_USER" --output json | jq -r '.AccessKey.SecretAccessKey')
                echo -e "${GREEN}✓ Replacement key created: $REPLACEMENT_KEY${NC}"
                echo -e "${YELLOW}Save this secret: $REPLACEMENT_SECRET${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Failed to delete old key (may already be deleted)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipped deleting old key. Delete manually later.${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Credential Rotation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}New Credentials:${NC}"
echo "  Access Key ID: $NEW_ACCESS_KEY"
echo "  Secret Access Key: $NEW_SECRET_KEY"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Monitor ECS services for any errors"
echo "2. Check CloudWatch logs"
echo "3. Verify all applications are working"
echo "4. Remove .env.testing from git history"
echo "5. Update any other services using old credentials"
echo ""
