#!/bin/bash

# Force ECS Service Updates to Pull Latest Images
# Usage: ./scripts/update-ecs-services.sh [service-name]

set -e

CLUSTER="fibonacco-dev"
ENV="dev"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Services to update
SERVICES=(
    "fibonacco-dev-goeventcity"
    "fibonacco-dev-daynews"
    "fibonacco-dev-downtownguide"
    "fibonacco-dev-alphasite"
    "fibonacco-dev-ssr"
    "fibonacco-dev-horizon"
)

# If service name provided, only update that service
if [ -n "$1" ]; then
    SERVICES=("fibonacco-dev-$1")
fi

# Update each service
for SERVICE in "${SERVICES[@]}"; do
    echo -e "${BLUE}Updating $SERVICE...${NC}"
    
    aws ecs update-service \
        --cluster $CLUSTER \
        --service $SERVICE \
        --force-new-deployment \
        --region us-east-1 > /dev/null
    
    echo -e "${GREEN}✅ $SERVICE update initiated${NC}"
done

echo -e "\n${GREEN}All services updated! Check ECS console for deployment status.${NC}"

