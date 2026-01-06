#!/bin/bash
set -e

# Create a one-off ECS task to run migrations

CLUSTER_NAME="fibonacco-dev"
ENV="dev"
AWS_REGION="us-east-1"
TASK_DEFINITION="fibonacco-$ENV-goeventcity"

echo "🔄 Creating migration task..."

# Get subnet and security group from service
SERVICE_INFO=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services fibonacco-$ENV-goeventcity \
    --region $AWS_REGION \
    --query 'services[0].networkConfiguration.awsvpcConfiguration' \
    --output json)

SUBNETS=$(echo $SERVICE_INFO | jq -r '.subnets[]' | tr '\n' ',' | sed 's/,$//')
SECURITY_GROUPS=$(echo $SERVICE_INFO | jq -r '.securityGroups[]' | tr '\n' ',' | sed 's/,$//')

echo "Subnets: $SUBNETS"
echo "Security Groups: $SECURITY_GROUPS"

# Run migration task
TASK_ARN=$(aws ecs run-task \
    --cluster $CLUSTER_NAME \
    --task-definition $TASK_DEFINITION \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNETS],securityGroups=[$SECURITY_GROUPS],assignPublicIp=DISABLED}" \
    --overrides "{\"containerOverrides\":[{\"name\":\"goeventcity\",\"command\":[\"php\",\"artisan\",\"migrate\",\"--force\"]}]}" \
    --region $AWS_REGION \
    --query 'tasks[0].taskArn' \
    --output text)

echo "✅ Migration task started: $TASK_ARN"
echo ""
echo "Monitor progress:"
echo "aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --region $AWS_REGION"

