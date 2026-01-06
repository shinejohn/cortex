#!/bin/bash
# Script to import existing AWS resources into Pulumi

set -e

cd "$(dirname "$0")"

echo "🔍 Finding existing AWS resources..."

# Get VPC ID (use first VPC if fibonacco-dev-vpc not found)
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=fibonacco-dev-vpc" --query 'Vpcs[0].VpcId' --output text 2>/dev/null || aws ec2 describe-vpcs --query 'Vpcs[0].VpcId' --output text 2>/dev/null)

if [ -z "$VPC_ID" ] || [ "$VPC_ID" == "None" ]; then
    echo "❌ No VPC found. Please create resources first or check AWS credentials."
    exit 1
fi

echo "✅ Found VPC: $VPC_ID"

# Import VPC
echo "📥 Importing VPC..."
pulumi import --yes aws:ec2/vpc:Vpc fibonacco-dev-vpc "$VPC_ID" 2>&1 | grep -v "already managed" || echo "✅ VPC imported or already managed"

# Import S3 buckets
echo "📥 Importing S3 buckets..."
pulumi import --yes aws:s3/bucketV2:BucketV2 fibonacco-dev-app-storage fibonacco-dev-app-storage 2>&1 | grep -v "already managed" || echo "✅ App storage bucket imported"
pulumi import --yes aws:s3/bucketV2:BucketV2 fibonacco-dev-archive fibonacco-dev-archive 2>&1 | grep -v "already managed" || echo "✅ Archive bucket imported"

# Import ECR repositories
echo "📥 Importing ECR repositories..."
for repo in base-app daynews goeventcity downtownguide alphasite inertia-ssr; do
    pulumi import --yes "aws:ecr/repository:Repository" "fibonacco-dev-${repo}" "fibonacco/dev/${repo}" 2>&1 | grep -v "already managed" || echo "✅ ${repo} repository imported"
done

# Import Secrets Manager
echo "📥 Importing Secrets Manager secret..."
SECRET_ARN=$(aws secretsmanager describe-secret --secret-id "fibonacco/dev/app-secrets" --query 'ARN' --output text 2>/dev/null || echo "")
if [ -n "$SECRET_ARN" ] && [ "$SECRET_ARN" != "None" ]; then
    pulumi import --yes aws:secretsmanager/secret:Secret fibonacco-dev-app-secrets "$SECRET_ARN" 2>&1 | grep -v "already managed" || echo "✅ Secret imported"
fi

# Import CloudWatch Log Groups
echo "📥 Importing CloudWatch Log Groups..."
for service in horizon daynews goeventcity downtownguide alphasite ssr; do
    pulumi import --yes "aws:cloudwatch/logGroup:LogGroup" "fibonacco-dev-${service}-logs" "/ecs/fibonacco/dev/${service}" 2>&1 | grep -v "already managed" || echo "✅ ${service} log group imported"
done

# Import SNS Topic
echo "📥 Importing SNS Topic..."
SNS_ARN=$(aws sns list-topics --query 'Topics[?contains(TopicArn, `fibonacco-dev-alerts`)].TopicArn' --output text 2>/dev/null || echo "")
if [ -n "$SNS_ARN" ] && [ "$SNS_ARN" != "None" ]; then
    pulumi import --yes aws:sns/topic:Topic fibonacco-dev-alerts "$SNS_ARN" 2>&1 | grep -v "already managed" || echo "✅ SNS topic imported"
fi

echo ""
echo "✅ Import complete! Running pulumi refresh to sync state..."
pulumi refresh --yes

echo ""
echo "🎉 Resources imported! View in Pulumi Console:"
echo "https://app.pulumi.com/shinejohn-org/fibonacco-infrastructure/dev"

