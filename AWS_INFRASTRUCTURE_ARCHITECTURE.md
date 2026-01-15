# AWS Infrastructure Architecture - Multisite Platform

## Overview

This document describes the AWS infrastructure setup for the Fibonacco multisite platform, which hosts 5 applications (GoEventCity, Day.News, Downtown Guide, Go Local Voices, and AlphaSite) on shared infrastructure.

---

## Network Architecture

### VPC (Virtual Private Cloud)
- **CIDR Block**: `10.0.0.0/16`
- **Region**: `us-east-1`
- **DNS Support**: Enabled
- **DNS Hostnames**: Enabled

### Subnet Structure

#### Public Subnets (Internet-Facing)
- **Purpose**: Host Application Load Balancer (ALB)
- **CIDR Blocks**: 
  - `10.0.1.0/24` (us-east-1a)
  - `10.0.2.0/24` (us-east-1b)
- **Route**: Direct to Internet Gateway
- **Public IP**: Auto-assigned

#### Private Subnets (Application Layer)
- **Purpose**: Host ECS tasks (containers), RDS, ElastiCache
- **CIDR Blocks**:
  - `10.0.10.0/24` (us-east-1a)
  - `10.0.20.0/24` (us-east-1b)
- **Route**: Through NAT Gateway (for outbound internet)
- **Public IP**: Not assigned (private only)

### Internet Gateway
- **Purpose**: Provides internet access for public subnets
- **Attached to**: VPC

### NAT Gateway
- **Purpose**: Allows private subnets to access internet (for pulling Docker images, package updates)
- **Location**: First public subnet (us-east-1a)
- **Elastic IP**: Static public IP assigned
- **Cost**: Single NAT Gateway for dev (cost optimization)

---

## Load Balancing & Routing

### Application Load Balancer (ALB)
- **Name**: `fibonacco-dev-alb`
- **Type**: Application Load Balancer (Layer 7)
- **Scheme**: Internet-facing
- **DNS**: `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **Subnets**: Public subnets (multi-AZ for high availability)
- **Security Group**: 
  - Ingress: Port 80 (HTTP), Port 443 (HTTPS) from `0.0.0.0/0`
  - Egress: All traffic

### Routing Strategy: Domain-Based Host Header Routing

The ALB uses **Host Header** routing to direct traffic to the correct service based on the domain name:

```
Internet Request → ALB → Host Header Check → Target Group → ECS Service
```

#### Listener Rules (HTTP - Port 80)

For **dev/staging** environments:
1. **Default Action**: Returns 404 "No matching domain"
2. **Rule 1** (Priority 100): `goeventcity.com` → `fibonacco-dev-goeventcity` target group
3. **Rule 2** (Priority 101): `day.news` → `fibonacco-dev-daynews` target group
4. **Rule 3** (Priority 102): `downtownsguide.com` → `fibonacco-dev-downtownguide` target group
5. **Rule 4** (Priority 103): `golocalvoices.com` → `fibonacco-dev-golocalvoices` target group
6. **Rule 5** (Priority 104): `alphasite.com` → `fibonacco-dev-alphasite` target group

For **production**:
- HTTP (Port 80) redirects to HTTPS (Port 443)
- HTTPS listener with ACM certificates (to be configured)

### Target Groups

Each service has its own target group:

| Service | Target Group Name | Port | Protocol | Health Check |
|---------|------------------|------|----------|--------------|
| GoEventCity | `fibonacco-dev-goeventcity` | 8000 | HTTP | `/healthcheck` |
| Day.News | `fibonacco-dev-daynews` | 8000 | HTTP | `/healthcheck` |
| Downtown Guide | `fibonacco-dev-downtownguide` | 8000 | HTTP | `/healthcheck` |
| Go Local Voices | `fibonacco-dev-golocalvoices` | 8000 | HTTP | `/healthcheck` |
| AlphaSite | `fibonacco-dev-alphasite` | 8000 | HTTP | `/healthcheck` |

**Health Check Configuration**:
- Path: `/healthcheck`
- Protocol: HTTP
- Healthy Threshold: 2 consecutive successes
- Unhealthy Threshold: 3 consecutive failures
- Timeout: 5 seconds
- Interval: 30 seconds
- Success Code: 200

---

## Compute Layer (ECS Fargate)

### ECS Cluster
- **Name**: `fibonacco-dev`
- **Type**: Fargate (serverless containers)
- **Container Insights**: Enabled (CloudWatch monitoring)

### Security Groups

#### ECS Tasks Security Group
- **Name**: `fibonacco-dev-ecs-sg`
- **Ingress**:
  - Port 8000 from ALB security group (HTTP traffic)
  - Port 13714 from VPC CIDR (Inertia SSR internal communication)
- **Egress**: All traffic (0.0.0.0/0)

### Services Deployed

#### 1. Web Services (5 applications)
All web services share the same architecture but use different Docker images:

| Service | Task Definition | Desired Count | CPU | Memory | Container Port |
|---------|----------------|---------------|-----|--------|----------------|
| GoEventCity | `fibonacco-dev-goeventcity` | 1 (dev) / 2 (prod) | 256 (dev) / 512 (prod) | 512MB (dev) / 1024MB (prod) | 8000 |
| Day.News | `fibonacco-dev-daynews` | 1 (dev) / 2 (prod) | 256 (dev) / 512 (prod) | 512MB (dev) / 1024MB (prod) | 8000 |
| Downtown Guide | `fibonacco-dev-downtownguide` | 1 (dev) / 2 (prod) | 256 (dev) / 512 (prod) | 512MB (dev) / 1024MB (prod) | 8000 |
| Go Local Voices | `fibonacco-dev-golocalvoices` | 1 (dev) / 2 (prod) | 256 (dev) / 512 (prod) | 512MB (dev) / 1024MB (prod) | 8000 |
| AlphaSite | `fibonacco-dev-alphasite` | 1 (dev) / 2 (prod) | 256 (dev) / 512 (prod) | 512MB (dev) / 1024MB (prod) | 8000 |

**Network Configuration**:
- **Subnets**: Private subnets (multi-AZ)
- **Public IP**: Disabled (private only)
- **Security Groups**: ECS security group
- **Load Balancer**: Attached to respective target group

**Environment Variables**:
- `APP_ENV`: Environment (dev/staging/production)
- `APP_DEBUG`: false (production) / true (dev)
- `APP_URL`: Domain-specific URL
- `CACHE_STORE`: redis
- `QUEUE_CONNECTION`: redis
- `SESSION_DRIVER`: redis

**Secrets** (from AWS Secrets Manager):
- Database credentials (DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
- Redis credentials (REDIS_HOST, REDIS_PORT)
- Application key (APP_KEY)

#### 2. Inertia SSR Service
- **Purpose**: Server-Side Rendering for Inertia.js
- **Task Definition**: `fibonacco-dev-ssr`
- **Desired Count**: 1 (dev) / 2 (prod)
- **CPU**: 256
- **Memory**: 512MB
- **Port**: 13714
- **Network**: Private subnets
- **Access**: Internal only (from web services within VPC)

#### 3. Horizon Service (Queue Worker)
- **Purpose**: Laravel Horizon for processing background jobs
- **Task Definition**: `fibonacco-dev-horizon`
- **Desired Count**: 1
- **CPU**: 256 (dev) / 512 (prod)
- **Memory**: 512MB (dev) / 1024MB (prod)
- **Command**: `php artisan horizon`
- **Network**: Private subnets
- **Access**: Internal only

---

## Data Layer

### RDS PostgreSQL Database
- **Engine**: PostgreSQL 15
- **Instance Class**: 
  - Dev: `db.t3.micro`
  - Staging: `db.t3.small`
  - Production: `db.r6g.large`
- **Storage**: 
  - Dev: 20GB (auto-scales to 100GB)
  - Production: 100GB (auto-scales to 500GB)
- **Storage Type**: `gp3` (SSD)
- **Multi-AZ**: Enabled (production only)
- **Backup Retention**: 7 days (production) / 1 day (dev)
- **Encryption**: At-rest encryption enabled
- **Network**: Private subnets only
- **Security Group**: 
  - Ingress: Port 5432 from VPC CIDR only
  - No public access

### ElastiCache Redis
- **Engine**: Redis 7.0
- **Node Type**:
  - Dev: `cache.t3.micro`
  - Staging: `cache.t3.small`
  - Production: `cache.r6g.large`
- **Nodes**: 1 (dev) / 2 (production)
- **Automatic Failover**: Enabled (production only)
- **Encryption**: 
  - At-rest: Enabled
  - In-transit: Enabled
- **Network**: Private subnets only
- **Security Group**:
  - Ingress: Port 6379 from VPC CIDR only
  - No public access

**Usage**:
- **Cache**: Application caching
- **Sessions**: Session storage
- **Queues**: Laravel queue backend
- **Site Isolation**: Each site uses site-specific Redis prefixes (configured in Laravel middleware)

---

## Storage Layer

### ECR (Elastic Container Registry)
- **Purpose**: Stores Docker images for all services
- **Repositories**:
  - `fibonacco/dev/goeventcity`
  - `fibonacco/dev/daynews`
  - `fibonacco/dev/downtownguide`
  - `fibonacco/dev/golocalvoices`
  - `fibonacco/dev/alphasite`
  - `fibonacco/dev/base-app`
  - `fibonacco/dev/inertia-ssr`

**Image Tags**:
- `latest`: Latest build
- Commit SHA: Specific version (e.g., `ae232e0f1dbe2acf4828387d257554308ec10dd8`)

### S3 Buckets
- **Artifacts Bucket**: `fibonacco-dev-pipeline-artifacts` (CodePipeline artifacts)
- **Application Bucket**: For file storage (if configured)
- **Archive Bucket**: For long-term storage (if configured)

---

## CI/CD Pipeline

### CodePipeline
- **Name**: `fibonacco-dev-pipeline`
- **Source**: GitHub (`shinejohn/Community-Platform`, branch `main`)
- **Stages**:
  1. **Source**: Pulls code from GitHub
  2. **Build**: Builds Docker images (parallel builds for all services)
  3. **Deploy**: Deploys to ECS using `imagedefinitions.json`

### CodeBuild Projects
Each service has its own CodeBuild project:
- `fibonacco-dev-goeventcity-build`
- `fibonacco-dev-daynews-build`
- `fibonacco-dev-downtownguide-build`
- `fibonacco-dev-golocalvoices-build`
- `fibonacco-dev-alphasite-build`
- `fibonacco-dev-base-app-build`
- `fibonacco-dev-inertia-ssr-build`

**Build Process**:
1. Pull source code
2. Build Docker image
3. Push to ECR with `latest` and commit SHA tags
4. Create `imagedefinitions.json` artifact
5. Deploy stage uses artifact to update ECS services

---

## Application-Level Routing

### Laravel Domain Detection

The application uses middleware (`DetectAppDomain`) to detect which site is being accessed:

```php
// Based on Host header:
- goeventcity.com → 'event-city'
- day.news → 'day-news'
- downtownsguide.com → 'downtown-guide'
- golocalvoices.com → 'local-voices'
- alphasite.com → 'alphasite'
```

### Route Registration

Routes are registered per domain in `bootstrap/app.php`:
- **API Routes**: `/api/*` (no domain restriction)
- **Day.News Routes**: Registered for `day.news` domain
- **Downtown Guide Routes**: Registered for `downtownsguide.com` domain
- **GoEventCity Routes**: Default routes (fallback for unmatched domains)

### Site Isolation

Each site has isolated:
- **Redis Prefixes**: `{site-name}_database_` and `{site-name}_cache_`
- **Session Cookies**: `{site-name}_session`
- **Cache Keys**: Site-specific prefixes prevent collisions

---

## Security Architecture

### Security Groups Summary

| Component | Security Group | Ingress | Egress |
|-----------|---------------|---------|--------|
| ALB | `fibonacco-dev-alb-sg` | 80, 443 from 0.0.0.0/0 | All |
| ECS Tasks | `fibonacco-dev-ecs-sg` | 8000 from ALB, 13714 from VPC | All |
| RDS | `fibonacco-dev-db-sg` | 5432 from VPC CIDR | All |
| Redis | `fibonacco-dev-cache-sg` | 6379 from VPC CIDR | All |

### Secrets Management
- **AWS Secrets Manager**: Stores sensitive configuration
- **Secret Name**: `fibonacco/{env}/app-secrets`
- **Contents**: Database credentials, Redis credentials, APP_KEY
- **Access**: ECS tasks via IAM role with Secrets Manager permissions

### IAM Roles

#### Task Execution Role
- **Purpose**: Allows ECS to pull images, write logs, access secrets
- **Policies**:
  - `AmazonECSTaskExecutionRolePolicy` (AWS managed)
  - Custom policy for Secrets Manager access

#### Task Role
- **Purpose**: Application-level permissions (for AWS SDK calls)
- **Policies**: Custom policies as needed

---

## Traffic Flow

### Request Flow (Example: GoEventCity)

```
1. User → DNS (goeventcity.com) → ALB DNS
   ↓
2. ALB receives request with Host: goeventcity.com
   ↓
3. ALB checks listener rules → Matches Rule 1 (Priority 100)
   ↓
4. ALB forwards to Target Group: fibonacco-dev-goeventcity
   ↓
5. Target Group selects healthy ECS task (port 8000)
   ↓
6. Request reaches Laravel application
   ↓
7. DetectAppDomain middleware detects 'event-city'
   ↓
8. Sets site-specific Redis/cache prefixes
   ↓
9. Routes to appropriate controller
   ↓
10. Response sent back through ALB to user
```

### Internal Communication

```
Web Service → Inertia SSR (port 13714)
   ↓
   Uses VPC internal DNS/private IPs
   ↓
   No internet routing required
```

---

## High Availability & Scaling

### Multi-AZ Deployment
- **ALB**: Deployed across multiple availability zones
- **ECS Tasks**: Can run in any private subnet (multi-AZ)
- **RDS**: Multi-AZ enabled in production
- **Redis**: Multi-node with automatic failover (production)

### Auto-Scaling (Production)
- **ECS Services**: 
  - Min: 2 tasks
  - Max: 20 tasks
  - Scaling based on CPU/Memory metrics
- **RDS**: Auto-scaling storage (up to max allocated storage)

### Health Checks
- **ALB**: Health checks target groups every 30 seconds
- **ECS**: Container health checks via ALB health checks
- **Unhealthy Tasks**: Automatically replaced

---

## Monitoring & Logging

### CloudWatch Logs
- **Log Groups**: `/ecs/fibonacco/{env}/{service-name}`
- **Retention**: 7 days
- **Streams**: Per container instance

### CloudWatch Metrics
- **ECS**: Container Insights enabled
- **ALB**: Request count, response times, error rates
- **RDS**: CPU, memory, connections, storage
- **Redis**: CPU, memory, evictions

### Alarms (Production)
- CPU utilization > 80%
- Memory utilization > 80%
- Database connections > threshold
- Cache evictions > threshold

---

## Cost Optimization (Dev Environment)

1. **Single NAT Gateway**: One NAT Gateway instead of per-AZ
2. **Smaller Instance Sizes**: t3.micro for RDS, cache
3. **Single Task**: 1 task per service (vs 2+ in production)
4. **No Multi-AZ**: Single-AZ deployment for dev
5. **Shorter Backup Retention**: 1 day vs 7 days

---

## DNS Configuration

### Required DNS Records

Point your domains to the ALB:

```
Type: CNAME
Name: @ (or www)
Value: fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com
TTL: 300
```

**Domains**:
- `goeventcity.com` → ALB DNS
- `day.news` → ALB DNS
- `downtownsguide.com` → ALB DNS
- `golocalvoices.com` → ALB DNS
- `alphasite.com` → ALB DNS

### SSL/TLS (Production)

For production, you need to:
1. Request ACM certificates for each domain
2. Update ALB HTTPS listener with certificate ARNs
3. Configure HTTP → HTTPS redirect

---

## Summary

This is a **multisite, shared infrastructure** architecture where:
- **5 applications** share the same ECS cluster, database, and cache
- **Domain-based routing** at both ALB (host header) and Laravel (middleware) levels
- **Site isolation** via Redis prefixes, session cookies, and cache keys
- **Serverless containers** (Fargate) for easy scaling
- **Private networking** for security (only ALB is public-facing)
- **Automated CI/CD** via CodePipeline/CodeBuild
- **High availability** via multi-AZ deployment (production)

The architecture is designed to be cost-effective for dev/staging while scaling to production requirements.

