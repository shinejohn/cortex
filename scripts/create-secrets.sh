#!/bin/bash

# Create AWS Secrets Manager secrets for deployment
# Usage: ./scripts/create-secrets.sh

set -e

AWS_REGION="us-east-1"
ENV="dev"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Creating AWS Secrets Manager secrets...${NC}"

# Database password secret
echo -e "${YELLOW}Enter database password (or press Enter to skip):${NC}"
read -s DB_PASSWORD
if [ -n "$DB_PASSWORD" ]; then
    aws secretsmanager create-secret \
        --name "fibonacco/$ENV/database" \
        --description "Database password for $ENV environment" \
        --secret-string "{\"password\":\"$DB_PASSWORD\"}" \
        --region $AWS_REGION 2>/dev/null || \
    aws secretsmanager update-secret \
        --secret-id "fibonacco/$ENV/database" \
        --secret-string "{\"password\":\"$DB_PASSWORD\"}" \
        --region $AWS_REGION
    echo -e "${GREEN}✅ Database secret created/updated${NC}"
fi

# App key secret
echo -e "${YELLOW}Enter APP_KEY (or press Enter to skip):${NC}"
read -s APP_KEY
if [ -n "$APP_KEY" ]; then
    aws secretsmanager create-secret \
        --name "fibonacco/$ENV/app-key" \
        --description "Application key for $ENV environment" \
        --secret-string "{\"key\":\"$APP_KEY\"}" \
        --region $AWS_REGION 2>/dev/null || \
    aws secretsmanager update-secret \
        --secret-id "fibonacco/$ENV/app-key" \
        --secret-string "{\"key\":\"$APP_KEY\"}" \
        --region $AWS_REGION
    echo -e "${GREEN}✅ App key secret created/updated${NC}"
fi

# AWS credentials secret
echo -e "${YELLOW}Enter AWS Access Key ID (or press Enter to skip):${NC}"
read AWS_ACCESS_KEY_ID
if [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo -e "${YELLOW}Enter AWS Secret Access Key:${NC}"
    read -s AWS_SECRET_ACCESS_KEY
    aws secretsmanager create-secret \
        --name "fibonacco/$ENV/aws-credentials" \
        --description "AWS credentials for $ENV environment" \
        --secret-string "{\"access_key_id\":\"$AWS_ACCESS_KEY_ID\",\"secret_access_key\":\"$AWS_SECRET_ACCESS_KEY\"}" \
        --region $AWS_REGION 2>/dev/null || \
    aws secretsmanager update-secret \
        --secret-id "fibonacco/$ENV/aws-credentials" \
        --secret-string "{\"access_key_id\":\"$AWS_ACCESS_KEY_ID\",\"secret_access_key\":\"$AWS_SECRET_ACCESS_KEY\"}" \
        --region $AWS_REGION
    echo -e "${GREEN}✅ AWS credentials secret created/updated${NC}"
fi

# Mail credentials secret
echo -e "${YELLOW}Enter Mail Username (or press Enter to skip):${NC}"
read MAIL_USERNAME
if [ -n "$MAIL_USERNAME" ]; then
    echo -e "${YELLOW}Enter Mail Password:${NC}"
    read -s MAIL_PASSWORD
    aws secretsmanager create-secret \
        --name "fibonacco/$ENV/mail" \
        --description "Mail credentials for $ENV environment" \
        --secret-string "{\"username\":\"$MAIL_USERNAME\",\"password\":\"$MAIL_PASSWORD\"}" \
        --region $AWS_REGION 2>/dev/null || \
    aws secretsmanager update-secret \
        --secret-id "fibonacco/$ENV/mail" \
        --secret-string "{\"username\":\"$MAIL_USERNAME\",\"password\":\"$MAIL_PASSWORD\"}" \
        --region $AWS_REGION
    echo -e "${GREEN}✅ Mail credentials secret created/updated${NC}"
fi

echo -e "\n${GREEN}✅ Secrets creation complete!${NC}"
echo -e "${BLUE}Note: Update ECS task definitions to reference these secrets${NC}"

