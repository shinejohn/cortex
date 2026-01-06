#!/bin/bash

# Complete Deployment Script
# This script automates the deployment process step by step

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Fibonacco Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Test Docker Builds
echo -e "${BLUE}Step 1: Testing Docker builds locally...${NC}"
if ./scripts/test-docker-build.sh; then
    echo -e "${GREEN}✅ Docker builds successful${NC}\n"
else
    echo -e "${RED}❌ Docker builds failed${NC}"
    exit 1
fi

# Step 2: Set Up Environment
echo -e "${BLUE}Step 2: Setting up environment...${NC}"
if ./scripts/setup-env.sh; then
    echo -e "${GREEN}✅ Environment template created${NC}\n"
    echo -e "${YELLOW}⚠️  Please review .env.aws.template and update with actual values${NC}\n"
else
    echo -e "${RED}❌ Environment setup failed${NC}"
    exit 1
fi

# Step 3: Check AWS credentials
echo -e "${BLUE}Step 3: Checking AWS credentials...${NC}"
if aws sts get-caller-identity > /dev/null 2>&1; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✅ AWS credentials configured (Account: $AWS_ACCOUNT)${NC}\n"
else
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo -e "${YELLOW}Please configure AWS credentials:${NC}"
    echo -e "  aws configure"
    echo -e "  or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
    exit 1
fi

# Step 4: Login to ECR
echo -e "${BLUE}Step 4: Logging in to ECR...${NC}"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="195430954683"
ECR_BASE="195430954683.dkr.ecr.us-east-1.amazonaws.com"

if aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE; then
    echo -e "${GREEN}✅ ECR login successful${NC}\n"
else
    echo -e "${RED}❌ ECR login failed${NC}"
    exit 1
fi

# Step 5: Build and Push Images
echo -e "${BLUE}Step 5: Building and pushing Docker images...${NC}"
echo -e "${YELLOW}This may take 10-20 minutes...${NC}\n"
if ./scripts/build-and-push-images.sh; then
    echo -e "${GREEN}✅ Images built and pushed successfully${NC}\n"
else
    echo -e "${RED}❌ Image build/push failed${NC}"
    exit 1
fi

# Step 6: Check database connection
echo -e "${BLUE}Step 6: Checking database configuration...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    if grep -q "DB_HOST" .env && grep -q "DB_PASSWORD" .env; then
        echo -e "${GREEN}✅ Database credentials found in .env${NC}\n"
        echo -e "${YELLOW}Would you like to run database migrations now? (y/n)${NC}"
        read -r RUN_MIGRATIONS
        if [ "$RUN_MIGRATIONS" = "y" ] || [ "$RUN_MIGRATIONS" = "Y" ]; then
            if ./scripts/migrate-database.sh; then
                echo -e "${GREEN}✅ Migrations completed${NC}\n"
            else
                echo -e "${RED}❌ Migrations failed${NC}\n"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  Database credentials not found in .env${NC}"
        echo -e "${YELLOW}Please update .env with database credentials from .env.aws.template${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file with database credentials${NC}\n"
fi

# Step 7: Update ECS Services
echo -e "${BLUE}Step 7: Updating ECS services...${NC}"
if ./scripts/update-ecs-services.sh; then
    echo -e "${GREEN}✅ ECS services updated${NC}\n"
else
    echo -e "${RED}❌ ECS service update failed${NC}\n"
fi

# Step 8: Get deployment information
echo -e "${BLUE}Step 8: Deployment Information${NC}"
echo -e "${BLUE}========================================${NC}"
cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate 2>/dev/null || true
export PATH="$HOME/.pulumi/bin:$PATH"

ALB_DNS=$(pulumi stack output alb_dns_name 2>/dev/null | tr -d '"' || echo "N/A")
DB_ENDPOINT=$(pulumi stack output database_endpoint 2>/dev/null | tr -d '"' || echo "N/A")

echo -e "${GREEN}ALB DNS:${NC} $ALB_DNS"
echo -e "${GREEN}Database Endpoint:${NC} $DB_ENDPOINT"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Configure DNS CNAME records pointing to: $ALB_DNS"
echo -e "2. Set up GitHub secrets for CI/CD"
echo -e "3. Request SSL certificates via ACM"
echo -e "4. Monitor ECS services in AWS Console"
echo ""

echo -e "${GREEN}✅ Deployment script completed!${NC}"
cd ..

