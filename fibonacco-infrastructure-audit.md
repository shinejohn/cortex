# Fibonacco Infrastructure Audit & Troubleshooting Guide

## Overview

This document maps the complete infrastructure for a Laravel + Inertia + React application running on AWS with ECS, RDS, ElastiCache (Redis), and Application Load Balancers.

---

## PART 1: INFRASTRUCTURE INVENTORY

### 1.1 Collect All Infrastructure Details

Run these commands to gather your complete infrastructure inventory:

```bash
# ============================================
# AWS ACCOUNT & REGION
# ============================================
echo "=== AWS Account Info ==="
aws sts get-caller-identity
export AWS_REGION="us-east-1"
export AWS_ACCOUNT_ID="195430954683"

# ============================================
# ECS CLUSTERS
# ============================================
echo "=== ECS Clusters ==="
aws ecs list-clusters --query 'clusterArns[*]' --output table

echo "=== ECS Cluster Details ==="
aws ecs describe-clusters --clusters fibonacco-dev --query 'clusters[*].{Name:clusterName,Status:status,Tasks:runningTasksCount,Services:activeServicesCount}' --output table

# ============================================
# ECS SERVICES
# ============================================
echo "=== ECS Services ==="
aws ecs list-services --cluster fibonacco-dev --query 'serviceArns[*]' --output table

echo "=== ECS Service Details ==="
for SERVICE in daynews goeventcity downtownguide alphasite golocalvoices; do
  echo "--- fibonacco-dev-$SERVICE ---"
  aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-$SERVICE \
    --query 'services[0].{Name:serviceName,Status:status,Desired:desiredCount,Running:runningCount,TaskDef:taskDefinition}' --output yaml
done

# ============================================
# ECS TASK DEFINITIONS
# ============================================
echo "=== Task Definitions ==="
aws ecs list-task-definitions --family-prefix fibonacco --query 'taskDefinitionArns[-5:]' --output table

# ============================================
# ECR REPOSITORIES
# ============================================
echo "=== ECR Repositories ==="
aws ecr describe-repositories --query 'repositories[?contains(repositoryName, `fibonacco`)].{Name:repositoryName,URI:repositoryUri}' --output table

# ============================================
# LOAD BALANCERS
# ============================================
echo "=== Load Balancers ==="
aws elbv2 describe-load-balancers --query 'LoadBalancers[*].{Name:LoadBalancerName,DNSName:DNSName,State:State.Code,Type:Type}' --output table

echo "=== Target Groups ==="
aws elbv2 describe-target-groups --query 'TargetGroups[?contains(TargetGroupName, `fibonacco`)].{Name:TargetGroupName,Port:Port,Protocol:Protocol,HealthCheck:HealthCheckPath}' --output table

# ============================================
# RDS DATABASES
# ============================================
echo "=== RDS Instances ==="
aws rds describe-db-instances --query 'DBInstances[*].{ID:DBInstanceIdentifier,Endpoint:Endpoint.Address,Port:Endpoint.Port,Status:DBInstanceStatus,Engine:Engine}' --output table

# ============================================
# ELASTICACHE (REDIS)
# ============================================
echo "=== ElastiCache Clusters ==="
aws elasticache describe-cache-clusters --show-cache-node-info --query 'CacheClusters[*].{ID:CacheClusterId,Engine:Engine,Status:CacheClusterStatus,Endpoint:CacheNodes[0].Endpoint.Address,Port:CacheNodes[0].Endpoint.Port}' --output table

# Or for Replication Groups (Redis Cluster Mode)
echo "=== ElastiCache Replication Groups ==="
aws elasticache describe-replication-groups --query 'ReplicationGroups[*].{ID:ReplicationGroupId,Status:Status,PrimaryEndpoint:NodeGroups[0].PrimaryEndpoint.Address,Port:NodeGroups[0].PrimaryEndpoint.Port}' --output yaml

# ============================================
# VPC & NETWORKING
# ============================================
echo "=== VPCs ==="
aws ec2 describe-vpcs --query 'Vpcs[*].{VpcId:VpcId,CIDR:CidrBlock,Name:Tags[?Key==`Name`].Value|[0]}' --output table

echo "=== Subnets ==="
aws ec2 describe-subnets --query 'Subnets[*].{SubnetId:SubnetId,VpcId:VpcId,AZ:AvailabilityZone,CIDR:CidrBlock,Name:Tags[?Key==`Name`].Value|[0]}' --output table

echo "=== Security Groups ==="
aws ec2 describe-security-groups --query 'SecurityGroups[?contains(GroupName, `fibonacco`) || contains(GroupName, `ecs`) || contains(GroupName, `rds`) || contains(GroupName, `redis`)].{GroupId:GroupId,Name:GroupName,VpcId:VpcId}' --output table

# ============================================
# SECRETS & PARAMETERS
# ============================================
echo "=== Secrets Manager ==="
aws secretsmanager list-secrets --query 'SecretList[*].{Name:Name,ARN:ARN}' --output table

echo "=== SSM Parameters ==="
aws ssm describe-parameters --query 'Parameters[?contains(Name, `fibonacco`)].{Name:Name,Type:Type}' --output table

# ============================================
# CODEBUILD & CODEPIPELINE
# ============================================
echo "=== CodeBuild Projects ==="
aws codebuild list-projects --query 'projects[?contains(@, `fibonacco`)]' --output table

echo "=== CodePipelines ==="
aws codepipeline list-pipelines --query 'pipelines[?contains(name, `fibonacco`)].name' --output table

# ============================================
# S3 BUCKETS
# ============================================
echo "=== S3 Buckets ==="
aws s3 ls | grep -i fibonacco

# ============================================
# CLOUDWATCH LOG GROUPS
# ============================================
echo "=== CloudWatch Log Groups ==="
aws logs describe-log-groups --query 'logGroups[?contains(logGroupName, `fibonacco`) || contains(logGroupName, `ecs`)].{Name:logGroupName}' --output table
```

---

## PART 2: ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROUTE 53 (DNS)                                       │
│  day.news → ALB DNS                                                          │
│  goeventcity.com → ALB DNS                                                   │
│  downtownguide.com → ALB DNS                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION LOAD BALANCER (ALB)                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Listener :443   │  │ Listener :80    │  │ SSL Certificate │              │
│  │ (HTTPS)         │  │ (redirect 443)  │  │ (ACM)           │              │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘              │
│           │                                                                  │
│  ┌────────▼────────────────────────────────────────────────────┐            │
│  │                    HOST-BASED ROUTING RULES                  │            │
│  │  day.news/* → Target Group: fibonacco-dev-daynews            │            │
│  │  goeventcity.com/* → Target Group: fibonacco-dev-goeventcity │            │
│  │  downtownguide.com/* → Target Group: fibonacco-dev-downtown  │            │
│  └──────────────────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         TARGET GROUPS (per app)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐               │
│  │ daynews:80      │  │ goeventcity:80  │  │ downtownguide:80│               │
│  │ Health: /health │  │ Health: /health │  │ Health: /health │               │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘               │
└───────────┼────────────────────┼────────────────────┼────────────────────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              ECS CLUSTER                                      │
│                         (fibonacco-dev)                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                         ECS SERVICES                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │  │ daynews     │  │ goeventcity │  │ downtown    │  │ alphasite   │   │   │
│  │  │ Desired: 1  │  │ Desired: 1  │  │ Desired: 1  │  │ Desired: 1  │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │   │
│  │         │                │                │                │          │   │
│  │         ▼                ▼                ▼                ▼          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │   │
│  │  │                        ECS TASKS (Fargate)                       │  │   │
│  │  │  ┌─────────────────────────────────────────────────────────┐    │  │   │
│  │  │  │                    DOCKER CONTAINER                      │    │  │   │
│  │  │  │  ┌─────────────────────────────────────────────────┐    │    │  │   │
│  │  │  │  │              NGINX (Port 80)                     │    │    │  │   │
│  │  │  │  │  - Serves static assets (/build/*)               │    │    │  │   │
│  │  │  │  │  - Proxies PHP requests to PHP-FPM               │    │    │  │   │
│  │  │  │  └─────────────────────┬───────────────────────────┘    │    │  │   │
│  │  │  │                        │                                 │    │  │   │
│  │  │  │  ┌─────────────────────▼───────────────────────────┐    │    │  │   │
│  │  │  │  │              PHP-FPM (Port 9000)                 │    │    │  │   │
│  │  │  │  │  - Laravel Application                           │    │    │  │   │
│  │  │  │  │  - Inertia.js Server-Side Rendering              │    │    │  │   │
│  │  │  │  │  - Connects to RDS (PostgreSQL)                  │    │    │  │   │
│  │  │  │  │  - Connects to ElastiCache (Redis)               │    │    │  │   │
│  │  │  │  └─────────────────────────────────────────────────┘    │    │  │   │
│  │  │  │                                                          │    │  │   │
│  │  │  │  ┌─────────────────────────────────────────────────┐    │    │  │   │
│  │  │  │  │         INERTIA SSR (Node.js - Port 13714)       │    │    │  │   │
│  │  │  │  │  - Server-side renders React components          │    │    │  │   │
│  │  │  │  │  - Called by PHP via HTTP                        │    │    │  │   │
│  │  │  │  └─────────────────────────────────────────────────┘    │    │  │   │
│  │  │  └──────────────────────────────────────────────────────────┘    │  │   │
│  │  └──────────────────────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
            │                                            │
            │                                            │
            ▼                                            ▼
┌─────────────────────────────┐          ┌─────────────────────────────┐
│         RDS (PostgreSQL)     │          │    ElastiCache (Redis)       │
│  ┌─────────────────────────┐ │          │  ┌─────────────────────────┐ │
│  │ Endpoint: *.rds.amazon  │ │          │  │ Endpoint: *.cache.amazon│ │
│  │ Port: 5432              │ │          │  │ Port: 6379              │ │
│  │ Database: fibonacco     │ │          │  │ - Session storage       │ │
│  │ - Users, posts, etc.    │ │          │  │ - Cache                 │ │
│  └─────────────────────────┘ │          │  │ - Queue                 │ │
└─────────────────────────────┘          │  └─────────────────────────┘ │
                                          └─────────────────────────────┘
```

---

## PART 3: REQUEST FLOW (How a Page Load Works)

### 3.1 Complete Request Flow

```
1. USER BROWSER
   │
   │ Request: https://day.news/some-page
   │
   ▼
2. DNS RESOLUTION (Route 53)
   │
   │ day.news → d-xxxxx.cloudfront.net OR ALB DNS
   │
   ▼
3. APPLICATION LOAD BALANCER
   │
   │ - Terminates SSL (HTTPS → HTTP internally)
   │ - Routes based on Host header (day.news)
   │ - Forwards to Target Group: fibonacco-dev-daynews
   │
   ▼
4. TARGET GROUP HEALTH CHECK
   │
   │ - Checks /health endpoint on container
   │ - Only routes to healthy targets
   │
   ▼
5. ECS TASK (Docker Container)
   │
   │ Request hits NGINX on port 80
   │
   ▼
6. NGINX
   │
   │ - Static files (/build/*) → Serve directly
   │ - PHP files (*.php) → Forward to PHP-FPM (port 9000)
   │ - All other routes → Forward to Laravel (index.php)
   │
   ▼
7. PHP-FPM / LARAVEL
   │
   │ a. Route matched in routes/web.php
   │ b. Controller invoked
   │ c. Inertia::render('PageComponent', $props)
   │
   ▼
8. INERTIA SSR (if enabled)
   │
   │ - Laravel sends HTTP request to Node.js SSR server
   │ - SSR server: http://127.0.0.1:13714/render
   │ - Node.js renders React component to HTML string
   │ - Returns HTML to Laravel
   │
   ▼
9. LARAVEL RESPONSE
   │
   │ - Combines SSR HTML with page shell
   │ - Includes serialized props as JSON
   │ - Sets Inertia headers
   │
   ▼
10. BACK TO BROWSER
    │
    │ - Browser receives HTML (SSR rendered)
    │ - JavaScript hydrates the React app
    │ - Subsequent navigation uses XHR (no full page reload)
```

### 3.2 Inertia SSR Flow Detail

```
INITIAL PAGE LOAD (SSR):
========================
Browser → ALB → NGINX → PHP-FPM → Laravel
                                    │
                                    │ Inertia::render('Dashboard', ['user' => $user])
                                    │
                                    ▼
                              ┌─────────────────────┐
                              │ SSR Server (Node.js) │
                              │ Port: 13714          │
                              │                      │
                              │ POST /render         │
                              │ Body: {              │
                              │   component: 'Dashboard',
                              │   props: {user: {...}},
                              │   url: '/dashboard'  │
                              │ }                    │
                              │                      │
                              │ Returns: {           │
                              │   head: [...],       │
                              │   body: '<div>...</div>'
                              │ }                    │
                              └─────────────────────┘
                                    │
                                    ▼
                              Laravel embeds in response:
                              <div id="app" data-page="{...}">
                                <!-- SSR HTML here -->
                              </div>
                                    │
                                    ▼
                              Browser receives full HTML
                              React hydrates (attaches event listeners)


SUBSEQUENT NAVIGATION (XHR):
============================
Browser JavaScript (Inertia router):
  │
  │ inertia.visit('/other-page')
  │
  ▼
XHR Request with header: X-Inertia: true
  │
  ▼
Laravel detects Inertia request → returns JSON only:
{
  "component": "OtherPage",
  "props": {...},
  "url": "/other-page",
  "version": "abc123"
}
  │
  ▼
Browser React renders new component (no SSR needed)
```

---

## PART 4: COMMON ISSUES & TROUBLESHOOTING

### 4.1 BLANK PAGE Issues

```bash
# ============================================
# SYMPTOM: White/blank page, no content
# ============================================

# CHECK 1: Is JavaScript loading?
# Open browser DevTools → Network tab → filter by JS
# Look for app-*.js files - are they 200 OK?

# CHECK 2: Console errors?
# Open browser DevTools → Console tab
# Look for: "usePage must be used within Inertia component"
# This means: A component using usePage() is outside Inertia context

# CHECK 3: Is SSR working?
# View page source (Ctrl+U) - do you see actual content or just empty div?
# Empty: <div id="app" data-page="..."></div>  ← SSR NOT working
# Full:  <div id="app" data-page="..."><div class="...">Content</div></div> ← SSR working

# CHECK 4: SSR server running?
# SSH into container or check logs:
aws logs tail /ecs/fibonacco-dev-daynews --since 10m | grep -i "ssr\|13714\|node"

# CHECK 5: Check container health
aws ecs describe-tasks --cluster fibonacco-dev \
  --tasks $(aws ecs list-tasks --cluster fibonacco-dev --service-name fibonacco-dev-daynews --query 'taskArns[0]' --output text) \
  --query 'tasks[0].containers[*].{Name:name,Status:lastStatus,Health:healthStatus}' --output table
```

### 4.2 502 Bad Gateway Issues

```bash
# ============================================
# SYMPTOM: 502 Bad Gateway
# ============================================

# CAUSE 1: Target group has no healthy targets
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups --names fibonacco-dev-daynews --query 'TargetGroups[0].TargetGroupArn' --output text) \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State,Reason:TargetHealth.Reason}' --output table

# CAUSE 2: Container crashed / not running
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews \
  --query 'services[0].{Running:runningCount,Desired:desiredCount,Pending:pendingCount}' --output yaml

# CAUSE 3: Health check failing
# Get health check config:
aws elbv2 describe-target-groups --names fibonacco-dev-daynews \
  --query 'TargetGroups[0].{Path:HealthCheckPath,Interval:HealthCheckIntervalSeconds,Timeout:HealthCheckTimeoutSeconds,Healthy:HealthyThresholdCount,Unhealthy:UnhealthyThresholdCount}' --output yaml

# Test health endpoint manually (if you can exec into container):
curl -v http://localhost/health

# CAUSE 4: Security group blocking traffic
# ALB security group must allow inbound 443/80 from internet
# ECS security group must allow inbound from ALB security group
aws ec2 describe-security-groups --group-ids sg-XXXXX --query 'SecurityGroups[0].IpPermissions'
```

### 4.3 503 Service Unavailable Issues

```bash
# ============================================
# SYMPTOM: 503 Service Unavailable
# ============================================

# CAUSE 1: Service is deploying / scaling
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews \
  --query 'services[0].deployments[*].{Status:rolloutState,Running:runningCount,Desired:desiredCount,Pending:pendingCount}' --output table

# CAUSE 2: All tasks failing to start
# Check recent events:
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews \
  --query 'services[0].events[0:10].message' --output yaml

# CAUSE 3: Task definition issue
# Get latest task definition and check for errors:
TASK_DEF=$(aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews --query 'services[0].taskDefinition' --output text)
aws ecs describe-task-definition --task-definition $TASK_DEF --query 'taskDefinition.containerDefinitions[*].{Name:name,Image:image,Memory:memory,CPU:cpu}' --output table
```

### 4.4 Inertia SSR Specific Issues

```bash
# ============================================
# SYMPTOM: SSR not working / hydration mismatch
# ============================================

# CHECK 1: Is SSR server process running?
# In your Dockerfile, SSR should start with something like:
# node bootstrap/ssr/ssr.mjs

# CHECK 2: Check Laravel SSR config
# config/inertia.php should have:
# 'ssr' => [
#     'enabled' => true,
#     'url' => 'http://127.0.0.1:13714/render',
# ]

# CHECK 3: Is the SSR bundle built?
# Should exist: bootstrap/ssr/ssr.mjs
ls -la bootstrap/ssr/

# CHECK 4: Check for SSR build errors in Vite
npm run build  # Should output both client and SSR bundles

# CHECK 5: Memory issues with Node.js SSR
# If SSR server crashes, check memory limits in task definition
# Node.js SSR typically needs 512MB+ for larger apps
```

### 4.5 Database Connection Issues

```bash
# ============================================
# SYMPTOM: Database connection errors
# ============================================

# CHECK 1: RDS instance status
aws rds describe-db-instances --query 'DBInstances[*].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Endpoint:Endpoint.Address}' --output table

# CHECK 2: Security group allows ECS → RDS
# RDS security group must allow inbound 5432 from ECS security group

# CHECK 3: Environment variables set correctly
# Check task definition for DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD

# CHECK 4: Test connection from container
# If you can exec into the container:
php artisan db:show
php artisan migrate:status
```

### 4.6 Redis Connection Issues

```bash
# ============================================
# SYMPTOM: Redis/cache/session errors
# ============================================

# CHECK 1: ElastiCache cluster status
aws elasticache describe-cache-clusters --show-cache-node-info \
  --query 'CacheClusters[*].{ID:CacheClusterId,Status:CacheClusterStatus,Endpoint:CacheNodes[0].Endpoint}' --output yaml

# CHECK 2: Security group allows ECS → Redis
# ElastiCache security group must allow inbound 6379 from ECS security group

# CHECK 3: Environment variables
# REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (if auth enabled)

# CHECK 4: Test connection from container
php artisan tinker
>>> Redis::ping()
# Should return "PONG"
```

---

## PART 5: DEPLOYMENT VERIFICATION CHECKLIST

### 5.1 Pre-Deployment Checklist

```bash
# ============================================
# BEFORE DEPLOYING
# ============================================

# 1. Verify source code is up to date
git status
git log --oneline -3

# 2. Verify S3 source is updated (for fibonacco-multisite-build)
git archive --format=zip HEAD -o /tmp/source.zip
aws s3 cp /tmp/source.zip s3://fibonacco-codebuild-source/source.zip

# 3. Verify build succeeds locally
npm run build
php artisan config:cache
php artisan route:cache

# 4. Check for TypeScript/lint errors
npm run lint
npm run type-check
```

### 5.2 During Deployment Checklist

```bash
# ============================================
# MONITORING DEPLOYMENT
# ============================================

# 1. Watch CodeBuild
BUILD_ID="fibonacco-multisite-build:XXXXX"
watch -n 10 "aws codebuild batch-get-builds --ids '$BUILD_ID' --query 'builds[0].{Status:buildStatus,Phase:currentPhase}' --output table"

# 2. Watch ECS deployment
watch -n 10 "aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews --query 'services[0].deployments[*].{Created:createdAt,Status:rolloutState,Running:runningCount}' --output table"

# 3. Watch target group health
TG_ARN=$(aws elbv2 describe-target-groups --names fibonacco-dev-daynews --query 'TargetGroups[0].TargetGroupArn' --output text)
watch -n 10 "aws elbv2 describe-target-health --target-group-arn '$TG_ARN' --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State}' --output table"
```

### 5.3 Post-Deployment Verification

```bash
# ============================================
# AFTER DEPLOYMENT
# ============================================

# 1. Verify new image is running
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews \
  --query 'services[0].taskDefinition' --output text

# 2. Check deployment timestamp
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews \
  --query 'services[0].deployments[0].createdAt' --output text

# 3. Test health endpoint
curl -I https://day.news/health

# 4. Test actual page load
curl -s https://day.news | head -100

# 5. Check for JavaScript errors in browser
# Open DevTools → Console → Look for red errors

# 6. Verify SSR is working
# View source → Look for rendered content inside #app div
```

---

## PART 6: ENVIRONMENT VARIABLES REFERENCE

### 6.1 Required Laravel Environment Variables

```bash
# ============================================
# APP
# ============================================
APP_NAME=DayNews
APP_ENV=production
APP_KEY=base64:xxxxx
APP_DEBUG=false
APP_URL=https://day.news

# ============================================
# DATABASE (RDS PostgreSQL)
# ============================================
DB_CONNECTION=pgsql
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=fibonacco
DB_USERNAME=fibonacco
DB_PASSWORD=xxxxx

# ============================================
# REDIS (ElastiCache)
# ============================================
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PASSWORD=null
REDIS_PORT=6379

# ============================================
# CACHE & SESSION & QUEUE
# ============================================
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# ============================================
# INERTIA SSR
# ============================================
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://127.0.0.1:13714/render

# ============================================
# VITE
# ============================================
VITE_APP_NAME="${APP_NAME}"
```

### 6.2 Where Environment Variables Are Set

```
1. ECS Task Definition
   └── containerDefinitions[].environment[]
   └── containerDefinitions[].secrets[] (from Secrets Manager or SSM)

2. Secrets Manager
   └── fibonacco/dev/env (JSON with all env vars)

3. SSM Parameter Store
   └── /fibonacco/dev/DB_PASSWORD
   └── /fibonacco/dev/APP_KEY

4. .env file (baked into Docker image - NOT RECOMMENDED for secrets)
```

---

## PART 7: DOCKER CONTAINER STRUCTURE

### 7.1 Expected Container Structure

```
/var/www/html/                    # Laravel root
├── app/
├── bootstrap/
│   └── ssr/
│       └── ssr.mjs               # SSR entry point (built by Vite)
├── config/
├── public/
│   ├── index.php                 # Laravel entry point
│   ├── build/                    # Vite-built assets
│   │   ├── manifest.json
│   │   └── assets/
│   │       ├── app-XXXXX.js      # Main React bundle
│   │       └── app-XXXXX.css     # Styles
│   └── health                    # Health check file (optional)
├── resources/
│   └── js/
│       ├── app.tsx               # Client entry point
│       ├── ssr.tsx               # SSR entry point
│       └── pages/                # Inertia pages
├── routes/
│   └── web.php                   # Laravel routes
├── storage/
├── vendor/
├── node_modules/
├── artisan
└── .env
```

### 7.2 Nginx Configuration Check

```nginx
# Expected nginx config (/etc/nginx/sites-available/default or similar)

server {
    listen 80;
    server_name _;
    root /var/www/html/public;
    index index.php;

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    # Static assets - serve directly
    location /build/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # All other requests → Laravel
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

---

## PART 8: QUICK REFERENCE COMMANDS

### 8.1 Deployment Commands

```bash
# Update source and build one app
git archive --format=zip HEAD -o /tmp/source.zip
aws s3 cp /tmp/source.zip s3://fibonacco-codebuild-source/source.zip
aws codebuild start-build --project-name "fibonacco-multisite-build" --environment-variables-override name=APP_NAME,value=daynews

# Build all apps
for APP in daynews goeventcity downtownguide alphasite golocalvoices; do
  aws codebuild start-build --project-name "fibonacco-multisite-build" --environment-variables-override name=APP_NAME,value=$APP
  sleep 5
done

# Force ECS redeployment (without new image)
aws ecs update-service --cluster fibonacco-dev --service fibonacco-dev-daynews --force-new-deployment
```

### 8.2 Debugging Commands

```bash
# Get running task logs
aws logs tail /ecs/fibonacco-dev-daynews --since 5m --follow

# Get specific container logs
aws logs get-log-events --log-group-name /ecs/fibonacco-dev-daynews --log-stream-name "ecs/app/TASK_ID" --limit 100

# Check ECS service events
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-daynews --query 'services[0].events[0:5].message' --output yaml

# Check target health
aws elbv2 describe-target-health --target-group-arn "arn:aws:elasticloadbalancing:..." --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State,Reason:TargetHealth.Reason}' --output table
```

### 8.3 Status Check Commands

```bash
# Full cluster status
aws ecs describe-services --cluster fibonacco-dev \
  --services fibonacco-dev-daynews fibonacco-dev-goeventcity fibonacco-dev-downtownguide fibonacco-dev-alphasite fibonacco-dev-golocalvoices \
  --query 'services[*].{Service:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' --output table

# All target groups health
for TG in daynews goeventcity downtownguide alphasite golocalvoices; do
  echo "=== $TG ==="
  TG_ARN=$(aws elbv2 describe-target-groups --names "fibonacco-dev-$TG" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null)
  if [ "$TG_ARN" != "None" ] && [ -n "$TG_ARN" ]; then
    aws elbv2 describe-target-health --target-group-arn "$TG_ARN" --query 'TargetHealthDescriptions[*].TargetHealth.State' --output text
  fi
done
```

---

## PART 9: INFRASTRUCTURE INVENTORY TEMPLATE

Fill this out after running the commands in Part 1:

```yaml
# ============================================
# FIBONACCO INFRASTRUCTURE INVENTORY
# Last collected: 2026-01-31 15:48 EST
# ============================================

aws_account_id: "195430954683"
aws_region: "us-east-1"

# ECS
ecs_cluster: "fibonacco-dev"
ecs_services:
  - name: "fibonacco-dev-daynews"
    task_definition: "fibonacco-dev-daynews:9"
    desired_count: 1
    running_count: 1  # ✅ HEALTHY
  - name: "fibonacco-dev-goeventcity"
    task_definition: "fibonacco-dev-goeventcity:9"
    desired_count: 1
    running_count: 0  # ❌ UNHEALTHY
  - name: "fibonacco-dev-downtownguide"
    task_definition: "fibonacco-dev-downtownguide:9"
    desired_count: 1
    running_count: 0  # ❌ UNHEALTHY
  - name: "fibonacco-dev-alphasite"
    task_definition: "fibonacco-dev-alphasite:10"
    desired_count: 1
    running_count: 0  # ❌ UNHEALTHY
  - name: "fibonacco-dev-golocalvoices"
    task_definition: "fibonacco-dev-golocalvoices:7"
    desired_count: 1
    running_count: 0  # ❌ UNHEALTHY
  - name: "fibonacco-dev-ssr"
    task_definition: "fibonacco-dev-ssr:4"
    desired_count: 1
    running_count: 1  # ✅ HEALTHY
  - name: "fibonacco-dev-horizon"
    task_definition: "fibonacco-dev-horizon:2"
    desired_count: 1
    running_count: 1  # ✅ HEALTHY

# Load Balancer
alb:
  name: "fibonacco-dev-alb"
  dns_name: "fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com"
  state: "active"
  
target_groups:
  - name: "fibonacco-dev-daynews"
    port: 8000
    health_check_path: "/healthcheck"
  - name: "fibonacco-dev-goeventcity"
    port: 8000
    health_check_path: "/healthcheck"
  - name: "fibonacco-dev-downtownguide"
    port: 8000
    health_check_path: "/healthcheck"
  - name: "fibonacco-dev-alphasite"
    port: 8000
    health_check_path: "/healthcheck"
  - name: "fibonacco-dev-golocalvoices"
    port: 8000
    health_check_path: "/healthcheck"

# RDS
rds:
  identifier: "fibonacco-dev-dba453d6f"
  endpoint: "fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com"
  engine: "postgres"
  port: 5432
  status: "available"

# ElastiCache
redis:
  cluster_id: "fibonacco-dev-redis"
  endpoint: "master.fibonacco-dev-redis.yhbxhb.use1.cache.amazonaws.com"
  port: 6379
  status: "available"

# ECR Repositories
ecr_repositories:
  - name: "fibonacco/dev/daynews"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/daynews"
  - name: "fibonacco/dev/goeventcity"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/goeventcity"
  - name: "fibonacco/dev/downtownguide"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/downtownguide"
  - name: "fibonacco/dev/alphasite"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/alphasite"
  - name: "fibonacco/dev/golocalvoices"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/golocalvoices"
  - name: "fibonacco/dev/ssr"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/ssr"
  - name: "fibonacco/dev/base-app"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/base-app"
  - name: "fibonacco/dev/inertia-ssr"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/inertia-ssr"
  - name: "fibonacco/bun"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/bun"
  - name: "fibonacco-dev-test-runner"
    uri: "195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco-dev-test-runner"

# CodeBuild
codebuild_projects:
  - "fibonacco-multisite-build"           # Main unified build
  - "fibonacco-dev-daynews-build"         # Legacy per-app build
  - "fibonacco-dev-goeventcity-build"
  - "fibonacco-dev-downtownguide-build"
  - "fibonacco-dev-alphasite-build"
  - "fibonacco-dev-golocalvoices-build"
  - "fibonacco-dev-inertia-ssr-build"
  - "fibonacco-dev-base-app-build"
source_bucket: "fibonacco-codebuild-source"
source_key: "source.zip"

# Other ALBs in Account
other_load_balancers:
  - name: "taskjuggler-production-alb"
    dns_name: "taskjuggler-production-alb-230168975.us-east-1.elb.amazonaws.com"
  - name: "learning-center-alb"
    dns_name: "learning-center-alb-1406182433.us-east-1.elb.amazonaws.com"

# Other RDS in Account
other_rds:
  - identifier: "taskjuggler-production-db"
    endpoint: "taskjuggler-production-db.csr8wa00wss4.us-east-1.rds.amazonaws.com"
  - identifier: "learning-center-db-instance-1"
    endpoint: "learning-center-db-instance-1.csr8wa00wss4.us-east-1.rds.amazonaws.com"

# Other Redis in Account
other_redis:
  - cluster_id: "taskjuggler-production-redis"
    endpoint: "master.taskjuggler-production-redis.yhbxhb.use1.cache.amazonaws.com"
  - cluster_id: "learning-center-production-redis"
    endpoint: "learning-center-production-redis.yhbxhb.ng.0001.use1.cache.amazonaws.com"
```

---

## PART 10: CURRENT STATUS SUMMARY

### Services Health (as of 2026-01-31 15:48 EST)

| Service | Running | Status |
|---------|---------|--------|
| daynews | 1 | ✅ Healthy |
| goeventcity | 0 | ❌ Tasks failing |
| downtownguide | 0 | ❌ Tasks failing |
| alphasite | 0 | ❌ Tasks failing |
| golocalvoices | 0 | ❌ Tasks failing |
| ssr | 1 | ✅ Healthy |
| horizon | 1 | ✅ Healthy |

### Known Issues
1. **Port mismatch fixed**: `http.conf` was listening on 8080, ALB expects 8000 (fixed 2026-01-30)
2. **Healthcheck fixed**: Changed from PHP-based to nginx direct 200 response (fixed 2026-01-30)
3. **Pending rebuild**: 4 apps need rebuild with new nginx config

### Next Steps
1. Rebuild all failing apps with corrected nginx config
2. Monitor deployment rollout
3. Verify target health in ALB

---

*Document created: January 30, 2026*
*Last updated: January 31, 2026*

