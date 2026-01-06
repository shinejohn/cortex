#!/bin/bash
set -e

# Run database migrations on ECS

CLUSTER_NAME="fibonacco-dev"
ENV="dev"
AWS_REGION="us-east-1"

echo "🔄 Running database migrations..."

# Get a running task from any web service
SERVICE_NAME="fibonacco-$ENV-goeventcity"

# Check if service has running tasks
TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --desired-status RUNNING \
    --region $AWS_REGION \
    --query 'taskArns[0]' \
    --output text 2>/dev/null || echo "")

if [ -z "$TASK_ARN" ] || [ "$TASK_ARN" == "None" ]; then
    echo "❌ No running tasks found. Services may not be running yet."
    echo ""
    echo "To run migrations manually:"
    echo "1. Start an ECS task:"
    echo "   aws ecs run-task \\"
    echo "     --cluster $CLUSTER_NAME \\"
    echo "     --task-definition fibonacco-$ENV-goeventcity \\"
    echo "     --launch-type FARGATE \\"
    echo "     --network-configuration \"awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}\" \\"
    echo "     --overrides '{\"containerOverrides\":[{\"name\":\"goeventcity\",\"command\":[\"php\",\"artisan\",\"migrate\",\"--force\"]}]}'"
    echo ""
    echo "2. Or use AWS Systems Manager Session Manager if configured"
    exit 1
fi

echo "Found running task: $TASK_ARN"

# Run migration command
echo "Running migrations..."
aws ecs execute-command \
    --cluster $CLUSTER_NAME \
    --task $TASK_ARN \
    --container goeventcity \
    --command "php artisan migrate --force" \
    --interactive \
    --region $AWS_REGION || {
    echo "❌ Execute command failed. Task may not have execute command enabled."
    echo ""
    echo "Alternative: Create a one-off migration task"
    echo "See: scripts/create-migration-task.sh"
}

echo "✅ Migrations completed"

