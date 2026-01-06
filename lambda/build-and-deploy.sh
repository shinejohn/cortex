#!/bin/bash

# Build and deploy Lambda test runner

set -e

ENV=${1:-dev}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="fibonacco-${ENV}-test-runner"

echo "Building Lambda container image..."
echo "Environment: $ENV"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "ECR Repository: $ECR_REPO"

# Create ECR repository if it doesn't exist
aws ecr describe-repositories --repository-names $ECR_REPO --region $AWS_REGION 2>/dev/null || \
  aws ecr create-repository --repository-name $ECR_REPO --region $AWS_REGION

# Get ECR login token
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build Docker image
docker build -t $ECR_REPO:latest -f lambda/Dockerfile .

# Tag for ECR
docker tag $ECR_REPO:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

# Push to ECR
echo "Pushing to ECR..."
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

echo "✅ Image pushed to ECR"
echo "Image URI: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest"

# Update Lambda function (if exists)
LAMBDA_NAME="fibonacco-${ENV}-test-runner"
if aws lambda get-function --function-name $LAMBDA_NAME --region $AWS_REGION &>/dev/null; then
    echo "Updating Lambda function..."
    aws lambda update-function-code \
        --function-name $LAMBDA_NAME \
        --image-uri ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest \
        --region $AWS_REGION
    echo "✅ Lambda function updated"
else
    echo "⚠️  Lambda function not found. Deploy infrastructure first with: pulumi up"
fi


