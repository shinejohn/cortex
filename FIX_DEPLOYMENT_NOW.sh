#!/bin/bash
# FIX DEPLOYMENT NOW - This will actually fix golocalvoices

set -e

echo "=== FIXING GOLOCALVOICES DEPLOYMENT ==="
echo ""

# 1. Verify ECR repository exists
echo "1. Checking ECR repository..."
REPO_NAME="fibonacco/dev/golocalvoices"
REGION="us-east-1"

if aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" &>/dev/null; then
    echo "✅ ECR repository exists"
else
    echo "⚠️  Creating ECR repository..."
    aws ecr create-repository \
        --repository-name "$REPO_NAME" \
        --region "$REGION" \
        --image-scanning-configuration scanOnPush=true \
        --image-tag-mutability MUTABLE
    echo "✅ Repository created"
fi

# 2. Check if image exists
echo ""
echo "2. Checking for existing images..."
IMAGE_COUNT=$(aws ecr describe-images --repository-name "$REPO_NAME" --region "$REGION" --query 'length(imageDetails)' --output text 2>/dev/null || echo "0")

if [ "$IMAGE_COUNT" -gt "0" ]; then
    echo "✅ Images exist in repository"
    aws ecr describe-images --repository-name "$REPO_NAME" --region "$REGION" --query 'sort_by(imageDetails,&imagePushedAt)[-1].{Tag:imageTags[0],Pushed:imagePushedAt}' --output table
else
    echo "❌ No images found - GitHub Actions needs to build it"
fi

# 3. Force ECS service update (will retry pulling image)
echo ""
echo "3. Forcing ECS service update..."
aws ecs update-service \
    --cluster fibonacco-dev \
    --service fibonacco-dev-golocalvoices \
    --force-new-deployment \
    --region "$REGION" \
    --query 'service.{ServiceName:serviceName,Status:status,DesiredCount:desiredCount}' \
    --output table

echo ""
echo "=== NEXT STEPS ==="
echo ""
echo "If no images exist, you MUST trigger GitHub Actions:"
echo "1. Go to: https://github.com/shinejohn/Community-Platform/actions/workflows/deploy.yml"
echo "2. Click 'Run workflow'"
echo "3. Select branch: main"
echo "4. Click 'Run workflow'"
echo ""
echo "The workflow will build golocalvoices image and push it to ECR."
echo "Then ECS will automatically pull it and start the service."

