#!/bin/bash

# Check all prerequisites before deployment
# Usage: ./scripts/check-prerequisites.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking deployment prerequisites...${NC}\n"

# Check Docker
echo -n "Checking Docker... "
if docker --version > /dev/null 2>&1 && docker ps > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Docker not running${NC}"
    exit 1
fi

# Check AWS CLI
echo -n "Checking AWS CLI... "
if aws --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ AWS CLI not installed${NC}"
    exit 1
fi

# Check AWS credentials
echo -n "Checking AWS credentials... "
if aws sts get-caller-identity > /dev/null 2>&1; then
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✅ (Account: $AWS_ACCOUNT)${NC}"
else
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    echo -e "${YELLOW}Run: aws configure${NC}"
    exit 1
fi

# Check Pulumi
echo -n "Checking Pulumi... "
if command -v pulumi > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  Pulumi not found (needed for infrastructure info)${NC}"
fi

# Check PHP
echo -n "Checking PHP... "
if php --version > /dev/null 2>&1; then
    PHP_VERSION=$(php --version | head -1)
    echo -e "${GREEN}✅ ($PHP_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠️  PHP not found (needed for migrations)${NC}"
fi

# Check Composer
echo -n "Checking Composer... "
if composer --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${YELLOW}⚠️  Composer not found (needed for migrations)${NC}"
fi

# Check Node.js
echo -n "Checking Node.js... "
if node --version > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ ($NODE_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found (needed for frontend builds)${NC}"
fi

# Check required files
echo -n "Checking Dockerfiles... "
if [ -f "docker/Dockerfile.web" ] && [ -f "docker/Dockerfile.base-app" ] && [ -f "docker/Dockerfile.inertia-ssr" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Dockerfiles missing${NC}"
    exit 1
fi

# Check scripts
echo -n "Checking deployment scripts... "
if [ -f "scripts/build-and-push-images.sh" ] && [ -f "scripts/update-ecs-services.sh" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Deployment scripts missing${NC}"
    exit 1
fi

# Check infrastructure
echo -n "Checking infrastructure... "
if [ -d "INFRASTRUCTURE" ] && [ -f "INFRASTRUCTURE/__main__.py" ]; then
    echo -e "${GREEN}✅${NC}"
else
    echo -e "${RED}❌ Infrastructure directory missing${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All prerequisites met!${NC}"
echo -e "${BLUE}Ready to deploy. Run: ./scripts/deploy-all.sh${NC}"

