#!/bin/bash

# Build and Push Docker Images to ECR
# Usage: ./scripts/build-and-push-images.sh [service-name]

set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="195430954683"
ECR_BASE="195430954683.dkr.ecr.us-east-1.amazonaws.com"
ENV="dev"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Login to ECR
echo -e "${BLUE}Logging in to ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE

# Services to build
SERVICES=(
    "base-app:Dockerfile.base-app"
    "inertia-ssr:Dockerfile.inertia-ssr"
    "goeventcity:Dockerfile.web"
    "daynews:Dockerfile.web"
    "downtownguide:Dockerfile.web"
    "alphasite:Dockerfile.web"
)

# If service name provided, only build that service
if [ -n "$1" ]; then
    SERVICES=("$1:Dockerfile.web")
fi

# Build and push each service
for SERVICE_CONFIG in "${SERVICES[@]}"; do
    SERVICE_NAME="${SERVICE_CONFIG%%:*}"
    DOCKERFILE="${SERVICE_CONFIG##*:}"
    
    echo -e "\n${BLUE}Building $SERVICE_NAME...${NC}"
    
    # Build image
    docker build -t fibonacco/$ENV/$SERVICE_NAME:latest -f docker/$DOCKERFILE .
    
    # Tag for ECR
    docker tag fibonacco/$ENV/$SERVICE_NAME:latest $ECR_BASE/fibonacco/$ENV/$SERVICE_NAME:latest
    
    # Push to ECR
    echo -e "${BLUE}Pushing $SERVICE_NAME to ECR...${NC}"
    docker push $ECR_BASE/fibonacco/$ENV/$SERVICE_NAME:latest
    
    echo -e "${GREEN}✅ $SERVICE_NAME pushed successfully${NC}"
done

echo -e "\n${GREEN}All images built and pushed!${NC}"

