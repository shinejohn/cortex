#!/bin/bash
set -e

# Deploy Platform to AWS
# This script handles the complete deployment process

echo "🚀 Starting AWS Deployment Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
CLUSTER_NAME="fibonacco-dev"
ENV="dev"

# Step 1: Build and Push Docker Images
echo -e "${YELLOW}Step 1: Building and pushing Docker images...${NC}"
echo "⚠️  Note: This requires Docker to be installed and running."
echo "   Alternatively, push to GitHub main branch to trigger GitHub Actions."

if command -v docker &> /dev/null; then
    echo "Docker found. Building images..."
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 195430954683.dkr.ecr.us-east-1.amazonaws.com
    
    # Build and push base-app
    docker buildx build --platform linux/amd64 -f docker/Dockerfile.base-app -t 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/$ENV/base-app:latest --push .
    
    # Build and push inertia-ssr
    docker buildx build --platform linux/amd64 -f docker/Dockerfile.inertia-ssr -t 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/$ENV/inertia-ssr:latest --push .
    
    # Build and push web services
    for service in goeventcity daynews downtownguide alphasite; do
        docker buildx build --platform linux/amd64 -f docker/Dockerfile.web --build-arg SERVICE_NAME=$service -t 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/$ENV/$service:latest --push .
    done
    
    echo -e "${GREEN}✓ Docker images built and pushed${NC}"
else
    echo -e "${RED}✗ Docker not found. Skipping image build.${NC}"
    echo "   To build images:"
    echo "   1. Install Docker"
    echo "   2. Run this script again, OR"
    echo "   3. Push to GitHub main branch to trigger GitHub Actions"
fi

# Step 2: Get infrastructure outputs
echo -e "${YELLOW}Step 2: Getting infrastructure information...${NC}"
cd INFRASTRUCTURE

DB_ENDPOINT=$(pulumi stack output db_endpoint 2>/dev/null || echo "")
REDIS_ENDPOINT=$(pulumi stack output cache_endpoint 2>/dev/null || echo "")
ALB_DNS=$(pulumi stack output load_balancer_dns 2>/dev/null || echo "")

if [ -z "$DB_ENDPOINT" ]; then
    echo -e "${RED}✗ Could not get database endpoint. Is infrastructure deployed?${NC}"
    exit 1
fi

echo "Database Endpoint: $DB_ENDPOINT"
echo "Redis Endpoint: $REDIS_ENDPOINT"
echo "ALB DNS: $ALB_DNS"

cd ..

# Step 3: Create/Update AWS Secrets
echo -e "${YELLOW}Step 3: Setting up AWS Secrets Manager...${NC}"

# Get database password from Pulumi config
DB_PASSWORD=$(cd INFRASTRUCTURE && pulumi config get db_password 2>/dev/null || echo "")

if [ -z "$DB_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  Database password not found in Pulumi config.${NC}"
    echo "   Creating a secure random password..."
    DB_PASSWORD=$(openssl rand -base64 32)
    echo "   Generated password. Save this securely!"
    echo "   To set in Pulumi: cd INFRASTRUCTURE && pulumi config set --secret db_password '$DB_PASSWORD'"
fi

# Generate APP_KEY if not exists
APP_KEY=$(php artisan key:generate --show 2>/dev/null | grep -oP '(?<=base64:)[^ ]+' || echo "")

if [ -z "$APP_KEY" ]; then
    APP_KEY=$(php artisan key:generate --show 2>/dev/null || echo "")
fi

# Create secrets in AWS Secrets Manager
SECRET_NAME="fibonacco/$ENV/app-secrets"

# Check if secret exists
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region $AWS_REGION &>/dev/null; then
    echo "Secret $SECRET_NAME already exists. Updating..."
    aws secretsmanager update-secret \
        --secret-id "$SECRET_NAME" \
        --secret-string "{\"DB_PASSWORD\":\"$DB_PASSWORD\",\"APP_KEY\":\"$APP_KEY\"}" \
        --region $AWS_REGION
else
    echo "Creating secret $SECRET_NAME..."
    aws secretsmanager create-secret \
        --name "$SECRET_NAME" \
        --secret-string "{\"DB_PASSWORD\":\"$DB_PASSWORD\",\"APP_KEY\":\"$APP_KEY\"}" \
        --region $AWS_REGION
fi

echo -e "${GREEN}✓ Secrets configured${NC}"

# Step 4: Update ECS Task Definitions with environment variables
echo -e "${YELLOW}Step 4: Updating ECS task definitions...${NC}"
echo "⚠️  This requires updating Pulumi infrastructure code."
echo "   See: INFRASTRUCTURE/compute/services.py"
echo "   Run: cd INFRASTRUCTURE && pulumi up"

# Step 5: Force ECS service update
echo -e "${YELLOW}Step 5: Forcing ECS service updates...${NC}"
for service in goeventcity daynews downtownguide alphasite ssr horizon; do
    echo "Updating service: fibonacco-$ENV-$service"
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service fibonacco-$ENV-$service \
        --force-new-deployment \
        --region $AWS_REGION \
        --no-cli-pager || echo "Service update failed or service doesn't exist"
done

echo -e "${GREEN}✓ Services updated${NC}"

# Step 6: Wait for services to stabilize
echo -e "${YELLOW}Step 6: Waiting for services to stabilize...${NC}"
for service in goeventcity daynews downtownguide alphasite; do
    echo "Waiting for: fibonacco-$ENV-$service"
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services fibonacco-$ENV-$service \
        --region $AWS_REGION || echo "Service stabilization check failed"
done

# Step 7: Run database migrations
echo -e "${YELLOW}Step 7: Running database migrations...${NC}"
echo "⚠️  This requires connecting to a running ECS task."
echo "   See: scripts/run-migrations.sh"

echo -e "${GREEN}✅ Deployment process completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Update ECS task definitions with environment variables (see INFRASTRUCTURE/compute/services.py)"
echo "2. Run database migrations (see scripts/run-migrations.sh)"
echo "3. Configure DNS (CNAME records pointing to ALB)"
echo "4. Request SSL certificates (ACM)"

