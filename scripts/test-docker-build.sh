#!/bin/bash

# Test Docker builds locally before pushing to ECR
# Usage: ./scripts/test-docker-build.sh [service-name]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Services to test
SERVICES=(
    "base-app:Dockerfile.base-app"
    "inertia-ssr:Dockerfile.inertia-ssr"
    "goeventcity:Dockerfile.web"
    "daynews:Dockerfile.web"
    "downtownguide:Dockerfile.web"
    "alphasite:Dockerfile.web"
)

# If service name provided, only test that service
if [ -n "$1" ]; then
    SERVICES=("$1:Dockerfile.web")
fi

echo -e "${BLUE}Testing Docker builds locally...${NC}\n"

# Test each service
for SERVICE_CONFIG in "${SERVICES[@]}"; do
    SERVICE_NAME="${SERVICE_CONFIG%%:*}"
    DOCKERFILE="${SERVICE_CONFIG##*:}"
    
    echo -e "${BLUE}Building $SERVICE_NAME...${NC}"
    
    # Build image
    if docker build -t fibonacco-test/$SERVICE_NAME:latest -f docker/$DOCKERFILE .; then
        echo -e "${GREEN}✅ $SERVICE_NAME built successfully${NC}"
        
        # Test image size
        IMAGE_SIZE=$(docker images fibonacco-test/$SERVICE_NAME:latest --format "{{.Size}}")
        echo -e "${BLUE}   Image size: $IMAGE_SIZE${NC}"
    else
        echo -e "${RED}❌ $SERVICE_NAME build failed${NC}"
        exit 1
    fi
    
    echo ""
done

echo -e "${GREEN}All Docker builds successful!${NC}"
echo -e "${BLUE}You can now push to ECR using: ./scripts/build-and-push-images.sh${NC}"

