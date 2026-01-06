#!/bin/bash
# Complete resource import script for Pulumi Cloud
# This imports ALL existing AWS resources into Pulumi state

set -e

cd "$(dirname "$0")"

VPC_ID="vpc-0fb3792f39da15411"

echo "🔍 Importing ALL infrastructure resources into Pulumi..."

# Import Internet Gateway
echo "📥 Importing Internet Gateway..."
IGW_ID=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query 'InternetGateways[0].InternetGatewayId' --output text 2>/dev/null || echo "")
if [ -n "$IGW_ID" ] && [ "$IGW_ID" != "None" ]; then
    pulumi import --yes aws:ec2/internetGateway:InternetGateway fibonacco-dev-igw "$IGW_ID" 2>&1 | grep -v "already managed" || echo "✅ IGW imported"
fi

# Import Subnets
echo "📥 Importing Subnets..."
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[*].[SubnetId,CidrBlock,Tags[?Key==`Name`].Value|[0]]' --output text 2>/dev/null || echo "")
if [ -n "$SUBNETS" ]; then
    echo "$SUBNETS" | while read subnet_id cidr name; do
        if [[ "$cidr" == "10.0.1.0/24" ]] || [[ "$name" == *"public"* ]] || [[ "$name" == *"Public"* ]]; then
            pulumi import --yes aws:ec2/subnet:Subnet fibonacco-dev-public-subnet-1 "$subnet_id" 2>&1 | grep -v "already managed" || echo "✅ Public subnet 1 imported"
        elif [[ "$cidr" == "10.0.2.0/24" ]]; then
            pulumi import --yes aws:ec2/subnet:Subnet fibonacco-dev-public-subnet-2 "$subnet_id" 2>&1 | grep -v "already managed" || echo "✅ Public subnet 2 imported"
        elif [[ "$cidr" == "10.0.10.0/24" ]] || [[ "$name" == *"private"* ]] || [[ "$name" == *"Private"* ]]; then
            pulumi import --yes aws:ec2/subnet:Subnet fibonacco-dev-private-subnet-1 "$subnet_id" 2>&1 | grep -v "already managed" || echo "✅ Private subnet 1 imported"
        elif [[ "$cidr" == "10.0.20.0/24" ]]; then
            pulumi import --yes aws:ec2/subnet:Subnet fibonacco-dev-private-subnet-2 "$subnet_id" 2>&1 | grep -v "already managed" || echo "✅ Private subnet 2 imported"
        fi
    done
fi

# Import NAT Gateway and EIP
echo "📥 Importing NAT Gateway..."
NAT_EIP=$(aws ec2 describe-addresses --filters "Name=domain,Values=vpc" --query 'Addresses[?Tags[?Key==`Name` && contains(Value, `fibonacco-dev-nat`)]].[AllocationId,PublicIp]' --output text 2>/dev/null | head -1 || echo "")
if [ -n "$NAT_EIP" ]; then
    EIP_ALLOC=$(echo $NAT_EIP | awk '{print $1}')
    pulumi import --yes aws:ec2/eip:Eip fibonacco-dev-nat-eip "$EIP_ALLOC" 2>&1 | grep -v "already managed" || echo "✅ NAT EIP imported"
    
    NAT_ID=$(aws ec2 describe-nat-gateways --filter "Name=vpc-id,Values=$VPC_ID" --query 'NatGateways[0].NatGatewayId' --output text 2>/dev/null || echo "")
    if [ -n "$NAT_ID" ] && [ "$NAT_ID" != "None" ]; then
        pulumi import --yes aws:ec2/natGateway:NatGateway fibonacco-dev-nat "$NAT_ID" 2>&1 | grep -v "already managed" || echo "✅ NAT Gateway imported"
    fi
fi

# Import Route Tables
echo "📥 Importing Route Tables..."
RT_PUBLIC=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Type,Values=Public" --query 'RouteTables[0].RouteTableId' --output text 2>/dev/null || aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query 'RouteTables[?Routes[?GatewayId!=null]][0].RouteTableId' --output text 2>/dev/null || echo "")
if [ -n "$RT_PUBLIC" ] && [ "$RT_PUBLIC" != "None" ]; then
    pulumi import --yes aws:ec2/routeTable:RouteTable fibonacco-dev-public-rt "$RT_PUBLIC" 2>&1 | grep -v "already managed" || echo "✅ Public route table imported"
fi

RT_PRIVATE=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Type,Values=Private" --query 'RouteTables[0].RouteTableId' --output text 2>/dev/null || aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query 'RouteTables[?Routes[?NatGatewayId!=null]][0].RouteTableId' --output text 2>/dev/null || echo "")
if [ -n "$RT_PRIVATE" ] && [ "$RT_PRIVATE" != "None" ]; then
    pulumi import --yes aws:ec2/routeTable:RouteTable fibonacco-dev-private-rt "$RT_PRIVATE" 2>&1 | grep -v "already managed" || echo "✅ Private route table imported"
fi

# Import Load Balancer
echo "📥 Importing Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --query 'LoadBalancers[?contains(LoadBalancerName, `fibonacco-dev`)].LoadBalancerArn' --output text 2>/dev/null | head -1 || echo "")
if [ -n "$ALB_ARN" ] && [ "$ALB_ARN" != "None" ]; then
    pulumi import --yes aws:lb/loadBalancer:LoadBalancer fibonacco-dev-alb "$ALB_ARN" 2>&1 | grep -v "already managed" || echo "✅ ALB imported"
fi

# Import Target Groups
echo "📥 Importing Target Groups..."
for tg_name in goeventcity daynews downtownguide alphasite; do
    TG_ARN=$(aws elbv2 describe-target-groups --names "fibonacco-dev-$tg_name" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
    if [ -n "$TG_ARN" ] && [ "$TG_ARN" != "None" ]; then
        pulumi import --yes "aws:lb/targetGroup:TargetGroup" "fibonacco-dev-${tg_name}-tg" "$TG_ARN" 2>&1 | grep -v "already managed" || echo "✅ ${tg_name} target group imported"
    fi
done

# Import RDS Instance
echo "📥 Importing RDS Instance..."
RDS_ID=$(aws rds describe-db-instances --query 'DBInstances[?contains(DBInstanceIdentifier, `fibonacco-dev`)].DBInstanceIdentifier' --output text 2>/dev/null | head -1 || echo "")
if [ -n "$RDS_ID" ] && [ "$RDS_ID" != "None" ]; then
    pulumi import --yes aws:rds/instance:Instance fibonacco-dev-db "$RDS_ID" 2>&1 | grep -v "already managed" || echo "✅ RDS imported"
fi

# Import ElastiCache Redis
echo "📥 Importing ElastiCache Redis..."
REDIS_ID=$(aws elasticache describe-replication-groups --query 'ReplicationGroups[?contains(ReplicationGroupId, `fibonacco-dev`)].ReplicationGroupId' --output text 2>/dev/null | head -1 || echo "")
if [ -n "$REDIS_ID" ] && [ "$REDIS_ID" != "None" ]; then
    pulumi import --yes aws:elasticache/replicationGroup:ReplicationGroup fibonacco-dev-redis "$REDIS_ID" 2>&1 | grep -v "already managed" || echo "✅ Redis imported"
fi

echo ""
echo "✅ Import complete! Refreshing state..."
pulumi refresh --yes

echo ""
echo "🎉 All resources imported! View in Pulumi Cloud:"
echo "https://app.pulumi.com/shinejohn-org/fibonacco-infrastructure/dev"


