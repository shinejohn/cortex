# Day.News Platform - AWS Native Scaling Strategy

## Scale Requirements

- **8,000 communities**
- **8,000 publications daily**
- **10-20 articles per publication = 80,000-160,000 articles/day**
- **Announcements, classifieds, coupons, etc.**
- **Potential: Millions of mobile app users**

## AWS Architecture Overview

```
Mobile App
    ↓
CloudFront (CDN) - Edge caching worldwide
    ↓
Application Load Balancer (ALB)
    ↓
ECS/EKS or EC2 Auto Scaling Group
    ↓
ElastiCache (Redis) - Application caching
    ↓
RDS Proxy - Connection pooling
    ↓
RDS PostgreSQL (Primary + Read Replicas)
```

## AWS Services Stack

### 1. CloudFront (CDN) - Edge Caching
**Purpose**: Cache API responses at edge locations worldwide

**Configuration:**
```json
{
  "DistributionConfig": {
    "Origins": [
      {
        "DomainName": "api.daynews.com",
        "Id": "api-origin"
      }
    ],
    "DefaultCacheBehavior": {
      "TargetOriginId": "api-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // Managed-CachingOptimized
      "TTL": 300, // 5 minutes
      "MinTTL": 60,
      "MaxTTL": 900
    },
    "CacheBehaviors": [
      {
        "PathPattern": "/api/day-news/posts/*",
        "TargetOriginId": "api-origin",
        "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad",
        "TTL": 900 // 15 minutes for individual posts
      }
    ],
    "PriceClass": "PriceClass_All", // Or PriceClass_100/200 for cost savings
    "Enabled": true
  }
}
```

**Cache Invalidation:**
```php
use Aws\CloudFront\CloudFrontClient;

$cloudfront = new CloudFrontClient([
    'version' => 'latest',
    'region' => 'us-east-1',
]);

$cloudfront->createInvalidation([
    'DistributionId' => env('CLOUDFRONT_DISTRIBUTION_ID'),
    'InvalidationBatch' => [
        'Paths' => [
            'Quantity' => 2,
            'Items' => [
                '/api/day-news/posts/*',
                '/api/day-news/posts/slug/*',
            ],
        ],
        'CallerReference' => 'post-update-' . time(),
    ],
]);
```

**Benefits:**
- 95%+ of requests served from edge (no server hit)
- Global distribution (low latency worldwide)
- DDoS protection included
- Cost: ~$0.085/GB data transfer

### 2. ElastiCache for Redis - Application Caching
**Purpose**: Cache API responses and database queries

**Setup:**
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id daynews-redis \
  --cache-node-type cache.r6g.xlarge \
  --engine redis \
  --num-cache-nodes 3 \
  --cache-parameter-group-name default.redis7 \
  --security-group-ids sg-xxxxx \
  --subnet-group-name daynews-subnet-group
```

**Laravel Configuration:**
```php
// config/database.php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'default' => [
        'host' => env('REDIS_HOST', 'daynews-redis.xxxxx.cache.amazonaws.com'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],
],

// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),
```

**Cache Implementation:**
```php
// Cache with tags for easy invalidation
Cache::tags(['posts', "posts:{$category}"])->remember($key, 300, function() {
    return DayNewsPost::published()->get();
});

// Invalidate on update
Cache::tags(['posts'])->flush();
```

**Benefits:**
- Sub-millisecond latency
- High availability (Multi-AZ)
- Auto-failover
- Cost: ~$0.125/hour for r6g.xlarge

### 3. RDS PostgreSQL - Database with Read Replicas
**Purpose**: Primary database with read scaling

**Setup:**
```bash
# Create primary database
aws rds create-db-instance \
  --db-instance-identifier daynews-primary \
  --db-instance-class db.r6g.2xlarge \
  --engine postgres \
  --master-username admin \
  --master-user-password [password] \
  --allocated-storage 500 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 7

# Create read replicas
aws rds create-db-instance-read-replica \
  --db-instance-identifier daynews-replica-1 \
  --source-db-instance-identifier daynews-primary \
  --db-instance-class db.r6g.xlarge
```

**Laravel Configuration:**
```php
// config/database.php
'connections' => [
    'pgsql' => [
        'read' => [
            'host' => [
                env('DB_READ_HOST_1', 'daynews-replica-1.xxxxx.rds.amazonaws.com'),
                env('DB_READ_HOST_2', 'daynews-replica-2.xxxxx.rds.amazonaws.com'),
            ],
        ],
        'write' => [
            'host' => env('DB_WRITE_HOST', 'daynews-primary.xxxxx.rds.amazonaws.com'),
        ],
        'driver' => 'pgsql',
        'database' => env('DB_DATABASE'),
        'username' => env('DB_USERNAME'),
        'password' => env('DB_PASSWORD'),
    ],
],
```

**Benefits:**
- Read scaling (distribute reads across replicas)
- High availability (Multi-AZ)
- Automated backups
- Point-in-time recovery

### 4. RDS Proxy - Connection Pooling
**Purpose**: Manage database connections efficiently

**Setup:**
```bash
aws rds create-db-proxy \
  --db-proxy-name daynews-proxy \
  --engine-family POSTGRESQL \
  --auth UsernamePassword \
  --role-arn arn:aws:iam::xxxxx:role/rds-proxy-role \
  --vpc-subnet-ids subnet-xxxxx subnet-yyyyy \
  --targets TargetGroupName=default,DBInstanceIdentifiers=daynews-primary
```

**Laravel Configuration:**
```php
// Use RDS Proxy endpoint instead of direct RDS
'host' => env('DB_PROXY_ENDPOINT', 'daynews-proxy.proxy-xxxxx.us-east-1.rds.amazonaws.com'),
```

**Benefits:**
- Connection pooling (reduces connection overhead)
- Failover handling
- Query logging
- Cost: ~$0.015/hour per vCPU

### 5. Application Load Balancer (ALB)
**Purpose**: Distribute traffic across multiple app instances

**Setup:**
```bash
aws elbv2 create-load-balancer \
  --name daynews-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name daynews-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-xxxxx \
  --health-check-path /health
```

**Benefits:**
- Automatic scaling
- Health checks
- SSL termination
- Cost: ~$0.0225/hour + $0.008/GB

### 6. ECS/EKS or EC2 Auto Scaling
**Purpose**: Auto-scale application instances

**ECS Setup:**
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name daynews-cluster

# Create service with auto-scaling
aws ecs create-service \
  --cluster daynews-cluster \
  --service-name daynews-api \
  --task-definition daynews-api:1 \
  --desired-count 2 \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=api,containerPort=80
```

**Auto Scaling Configuration:**
```json
{
  "TargetTrackingScalingPolicies": [
    {
      "TargetValue": 70.0,
      "PredefinedMetricSpecification": {
        "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
      },
      "ScaleInCooldown": 300,
      "ScaleOutCooldown": 60
    }
  ]
}
```

**Benefits:**
- Auto-scales based on demand
- Cost optimization (scale down when not needed)
- High availability

### 7. CloudWatch - Monitoring
**Purpose**: Monitor performance and set up alerts

**Key Metrics:**
- Cache hit rate (ElastiCache)
- Database connections (RDS Proxy)
- API response time (ALB)
- Request count (CloudFront)
- Error rate (ALB)

**CloudWatch Alarms:**
```bash
# Cache hit rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name cache-hit-rate-low \
  --alarm-description "Alert when cache hit rate drops below 90%" \
  --metric-name CacheHitRate \
  --namespace AWS/ElastiCache \
  --statistic Average \
  --period 300 \
  --threshold 90 \
  --comparison-operator LessThanThreshold

# Database CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name db-cpu-high \
  --alarm-description "Alert when database CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 8. S3 - Static Assets & Backups
**Purpose**: Store images, backups, logs

**Setup:**
```bash
# Create S3 bucket for images
aws s3 mb s3://daynews-images --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket daynews-images \
  --versioning-configuration Status=Enabled

# Set up lifecycle policies
aws s3api put-bucket-lifecycle-configuration \
  --bucket daynews-images \
  --lifecycle-configuration file://lifecycle.json
```

**Lifecycle Policy:**
```json
{
  "Rules": [
    {
      "Id": "Move to Glacier",
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

### 9. Route 53 - DNS
**Purpose**: Route traffic to CloudFront

**Setup:**
```bash
# Create hosted zone
aws route53 create-hosted-zone --name daynews.com --caller-reference $(date +%s)

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch file://cloudfront-alias.json
```

## Complete AWS Architecture

```
┌─────────────────┐
│   Mobile App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CloudFront CDN │ ← 95% of requests served here
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Route 53 DNS  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ALB (HTTPS)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ECS Auto Scale │ ← Auto-scales 2-20 instances
│  (Laravel App)  │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ElastiCache│ │  RDS Proxy   │
│  (Redis) │ │ (Connection  │
│          │ │   Pooling)   │
└──────────┘ └──────┬───────┘
                    │
            ┌───────┴────────┐
            ▼                ▼
    ┌──────────────┐  ┌──────────────┐
    │ RDS Primary  │  │ RDS Replicas │
    │  (Writes)    │  │   (Reads)    │
    └──────────────┘  └──────────────┘
```

## Cost Optimization

### Estimated Monthly Costs

**Small Scale (Startup):**
- CloudFront: $50-100
- ElastiCache (1 node): $150
- RDS (db.t3.medium): $100
- RDS Proxy: $30
- ALB: $20
- ECS (2 tasks): $100
- **Total: ~$450-500/month**

**Medium Scale (Growth):**
- CloudFront: $200-500
- ElastiCache (3 nodes): $450
- RDS (db.r6g.2xlarge + 2 replicas): $1,200
- RDS Proxy: $60
- ALB: $50
- ECS (5-10 tasks): $300-500
- **Total: ~$2,200-2,700/month**

**Large Scale (8K communities):**
- CloudFront: $500-1,000
- ElastiCache (5 nodes): $750
- RDS (db.r6g.4xlarge + 5 replicas): $3,000
- RDS Proxy: $120
- ALB: $100
- ECS (10-20 tasks): $600-1,200
- **Total: ~$5,000-6,000/month**

### Cost Savings Strategies

1. **Reserved Instances**: 30-40% savings on RDS/EC2
2. **Spot Instances**: 70-90% savings for non-critical workloads
3. **S3 Intelligent Tiering**: Automatic cost optimization
4. **CloudFront Price Classes**: Use PriceClass_100/200 for cost savings
5. **Auto Scaling**: Scale down during off-peak hours

## Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Set up VPC with public/private subnets
- [ ] Create RDS PostgreSQL (primary)
- [ ] Set up ElastiCache Redis cluster
- [ ] Configure RDS Proxy
- [ ] Deploy Laravel app to ECS/EC2

### Phase 2: Caching (Week 2)
- [ ] Implement Redis caching in Laravel
- [ ] Set up CloudFront distribution
- [ ] Configure cache invalidation
- [ ] Add database indexes

### Phase 3: Scaling (Week 3)
- [ ] Create RDS read replicas
- [ ] Set up Application Load Balancer
- [ ] Configure auto-scaling
- [ ] Set up CloudWatch monitoring

### Phase 4: Optimization (Week 4+)
- [ ] Optimize database queries
- [ ] Fine-tune cache TTLs
- [ ] Set up cost alerts
- [ ] Load testing and tuning

## Monitoring Dashboard

**Key Metrics to Track:**
1. **CloudFront**: Requests, cache hit rate, data transfer
2. **ElastiCache**: Cache hits, misses, evictions, CPU
3. **RDS**: CPU, connections, read/write latency, replication lag
4. **RDS Proxy**: Connections, query duration
5. **ALB**: Request count, response time, error rate
6. **ECS**: CPU/Memory utilization, task count

**CloudWatch Dashboard:**
```bash
aws cloudwatch put-dashboard \
  --dashboard-name DayNewsPlatform \
  --dashboard-body file://dashboard.json
```

## Security Best Practices

1. **VPC**: Isolate resources in private subnets
2. **Security Groups**: Restrict access to necessary ports only
3. **IAM Roles**: Use roles instead of access keys
4. **Secrets Manager**: Store database passwords, API keys
5. **WAF**: Protect against DDoS and attacks
6. **SSL/TLS**: Use ACM certificates for HTTPS

## Disaster Recovery

1. **RDS Automated Backups**: 7-day retention
2. **Cross-Region Replication**: For critical data
3. **S3 Versioning**: For backups
4. **CloudFormation**: Infrastructure as code
5. **Route 53 Health Checks**: Automatic failover

## Conclusion

This AWS-native architecture provides:
- ✅ **98-99% reduction in database queries** (via caching)
- ✅ **5-20ms response times** (from CloudFront/Redis)
- ✅ **Auto-scaling** (handles traffic spikes)
- ✅ **High availability** (Multi-AZ, auto-failover)
- ✅ **Cost optimization** (pay for what you use)
- ✅ **Global distribution** (low latency worldwide)

**Ready to scale to millions of users!** 🚀

