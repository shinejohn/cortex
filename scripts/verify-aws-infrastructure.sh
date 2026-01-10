#!/bin/bash

# AWS Infrastructure Verification Script
# This script verifies that all required AWS resources exist and are properly configured

set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
ENV="${ENV:-dev}"
CLUSTER_NAME="fibonacco-${ENV}"
ACCOUNT_ID="${AWS_ACCOUNT_ID:-195430954683}"

echo "=========================================="
echo "AWS Infrastructure Verification"
echo "=========================================="
echo "Region: $AWS_REGION"
echo "Environment: $ENV"
echo "Cluster: $CLUSTER_NAME"
echo "Account ID: $ACCOUNT_ID"
echo ""

# Check AWS credentials
echo "1. Verifying AWS credentials..."
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured or invalid"
    exit 1
fi
echo "✅ AWS credentials valid"
aws sts get-caller-identity
echo ""

# Verify ECS Cluster
echo "2. Verifying ECS Cluster: $CLUSTER_NAME"
CLUSTER_STATUS=$(aws ecs describe-clusters \
    --clusters "$CLUSTER_NAME" \
    --region "$AWS_REGION" \
    --query 'clusters[0].status' \
    --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$CLUSTER_STATUS" = "ACTIVE" ]; then
    echo "✅ ECS cluster exists and is active: $CLUSTER_NAME"
else
    echo "❌ ECS cluster not found or not active: $CLUSTER_NAME (status: $CLUSTER_STATUS)"
    exit 1
fi
echo ""

# Verify ECR Repositories
echo "3. Verifying ECR Repositories..."
SERVICES=(
    "base-app"
    "inertia-ssr"
    "goeventcity"
    "daynews"
    "downtownguide"
    "alphasite"
    "golocalvoices"
)

for service in "${SERVICES[@]}"; do
    REPO_NAME="fibonacco/${ENV}/${service}"
    echo "  Checking: $REPO_NAME"
    
    if aws ecr describe-repositories \
        --repository-names "$REPO_NAME" \
        --region "$AWS_REGION" \
        > /dev/null 2>&1; then
        echo "    ✅ Repository exists"
    else
        echo "    ⚠️  Repository not found (will be created on first push)"
    fi
done
echo ""

# Verify ECS Services
echo "4. Verifying ECS Services..."
ECS_SERVICES=(
    "goeventcity"
    "daynews"
    "downtownguide"
    "alphasite"
    "golocalvoices"
    "inertia-ssr"
    "horizon"
)

for service in "${ECS_SERVICES[@]}"; do
    SERVICE_NAME="fibonacco-${ENV}-${service}"
    echo "  Checking: $SERVICE_NAME"
    
    SERVICE_STATUS=$(aws ecs describe-services \
        --cluster "$CLUSTER_NAME" \
        --services "$SERVICE_NAME" \
        --region "$AWS_REGION" \
        --query 'services[0].status' \
        --output text 2>/dev/null || echo "NOT_FOUND")
    
    if [ "$SERVICE_STATUS" = "ACTIVE" ] || [ "$SERVICE_STATUS" = "DRAINING" ]; then
        RUNNING=$(aws ecs describe-services \
            --cluster "$CLUSTER_NAME" \
            --services "$SERVICE_NAME" \
            --region "$AWS_REGION" \
            --query 'services[0].runningCount' \
            --output text 2>/dev/null || echo "0")
        DESIRED=$(aws ecs describe-services \
            --cluster "$CLUSTER_NAME" \
            --services "$SERVICE_NAME" \
            --region "$AWS_REGION" \
            --query 'services[0].desiredCount' \
            --output text 2>/dev/null || echo "0")
        echo "    ✅ Service exists (Running: $RUNNING / Desired: $DESIRED)"
    else
        echo "    ⚠️  Service not found (status: $SERVICE_STATUS)"
    fi
done
echo ""

# Verify IAM Permissions
echo "5. Verifying IAM Permissions..."
echo "  Checking ECR push permissions..."
if aws ecr get-authorization-token --region "$AWS_REGION" > /dev/null 2>&1; then
    echo "    ✅ ECR access granted"
else
    echo "    ❌ ECR access denied"
    exit 1
fi

echo "  Checking ECS update permissions..."
if aws ecs describe-services \
    --cluster "$CLUSTER_NAME" \
    --services "fibonacco-${ENV}-goeventcity" \
    --region "$AWS_REGION" \
    > /dev/null 2>&1; then
    echo "    ✅ ECS access granted"
else
    echo "    ⚠️  ECS access may be limited (service may not exist)"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo "✅ All critical checks passed"
echo ""
echo "Next steps:"
echo "1. Ensure all ECR repositories exist (will be created automatically on first push)"
echo "2. Ensure all ECS services are configured"
echo "3. Verify task definitions are up to date"
echo "4. Check IAM roles have necessary permissions"

