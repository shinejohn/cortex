# AWS Infrastructure - Next Steps

**Status:** ✅ Infrastructure deployed  
**Environment:** dev  
**Date:** December 22, 2025

## Overview

The AWS infrastructure is now deployed with:
- ✅ VPC, Networking, Security Groups
- ✅ RDS PostgreSQL Database
- ✅ ElastiCache Redis
- ✅ S3 Buckets (app storage + archive)
- ✅ ECR Repositories (6 repositories)
- ✅ ECS Cluster and Services (5 web services + SSR + Horizon)
- ✅ Application Load Balancer
- ✅ CloudWatch Monitoring

## Phase 1: Docker Images & Container Registry

### 1.1 Build Docker Images

Create Dockerfiles for each service:

**Priority Order:**
1. Base app (for Horizon + Scheduler)
2. Inertia SSR service
3. GoEventCity
4. Day.News
5. Downtown Guide
6. AlphaSite

### 1.2 Push to ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 195430954683.dkr.ecr.us-east-1.amazonaws.com

# Build and push each service
# Example for goeventcity:
docker build -t fibonacco/dev/goeventcity:latest -f docker/Dockerfile.goeventcity .
docker tag fibonacco/dev/goeventcity:latest 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/goeventcity:latest
docker push 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/goeventcity:latest
```

### 1.3 Update ECS Services

Once images are pushed, ECS will automatically deploy them (if service is configured correctly).

**Action Items:**
- [ ] Create Dockerfile for base-app
- [ ] Create Dockerfile for inertia-ssr
- [ ] Create Dockerfile for goeventcity
- [ ] Create Dockerfile for daynews
- [ ] Create Dockerfile for downtownguide
- [ ] Create Dockerfile for alphasite
- [ ] Build and push all images to ECR
- [ ] Verify ECS services are running

---

## Phase 2: Database Setup

### 2.1 Connect to Database

```bash
# Get database endpoint
pulumi stack output database_endpoint

# Connect via psql
psql -h fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com -U postgres -d fibonacco
```

### 2.2 Run Migrations

```bash
# Set database connection in .env
DB_CONNECTION=pgsql
DB_HOST=fibonacco-dev-dba453d6f.csr8wa00wss4.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_DATABASE=fibonacco
DB_USERNAME=postgres
DB_PASSWORD=<from-pulumi-config>

# Run migrations
php artisan migrate --force
```

### 2.3 Seed Initial Data

```bash
# Seed test users
php artisan db:seed --class=PlaywrightTestUsersSeeder

# Seed other data (optional)
php artisan db:seed
```

**Action Items:**
- [ ] Update .env with RDS connection details
- [ ] Test database connection
- [ ] Run all migrations
- [ ] Seed test users
- [ ] Verify database is accessible from ECS tasks

---

## Phase 3: Environment Configuration

### 3.1 Create Environment Files

Create environment-specific `.env` files for each service:

**Required Environment Variables:**
```env
APP_ENV=production
APP_URL=https://dev.goeventcity.com
APP_DEBUG=false

# Database
DB_CONNECTION=pgsql
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_DATABASE=fibonacco
DB_USERNAME=postgres
DB_PASSWORD=<secret>

# Redis/ElastiCache
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=null

# AWS S3
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=fibonacco-dev-app-storage
AWS_ARCHIVE_BUCKET=fibonacco-dev-archive

# Inertia SSR
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://inertia-ssr:13714

# Queue
QUEUE_CONNECTION=redis

# Session
SESSION_DRIVER=redis
CACHE_DRIVER=redis
```

### 3.2 Store Secrets in AWS Secrets Manager

```bash
# Store database password
aws secretsmanager create-secret \
  --name fibonacco/dev/database \
  --secret-string '{"password":"your-password"}'

# Store app key
aws secretsmanager create-secret \
  --name fibonacco/dev/app-key \
  --secret-string '{"key":"your-app-key"}'
```

**Action Items:**
- [ ] Create .env templates for each service
- [ ] Store secrets in AWS Secrets Manager
- [ ] Update ECS task definitions to use secrets
- [ ] Configure environment variables in ECS

---

## Phase 4: DNS Configuration

### 4.1 Get ALB DNS Name

```bash
pulumi stack output alb_dns_name
# Output: fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com
```

### 4.2 Configure DNS Records

For each domain, create CNAME records pointing to ALB:

**Domains to configure:**
- `dev.goeventcity.com` → ALB DNS
- `dev.day.news` → ALB DNS
- `dev.downtownsguide.com` → ALB DNS
- `dev.alphasite.com` → ALB DNS
- `golocalvoices.com` → ALB DNS (or Day.News service)

**DNS Provider Setup:**
```bash
# Example for Route53 (if using AWS Route53)
aws route53 change-resource-record-sets \
  --hosted-zone-id <zone-id> \
  --change-batch file://dns-changes.json
```

**Action Items:**
- [ ] Get ALB DNS name
- [ ] Configure DNS CNAME records for all domains
- [ ] Verify DNS propagation
- [ ] Test domain access

---

## Phase 5: SSL/TLS Certificates

### 5.1 Request ACM Certificates

```bash
# Request certificate for each domain
aws acm request-certificate \
  --domain-name dev.goeventcity.com \
  --validation-method DNS \
  --region us-east-1

# Repeat for each domain:
# - dev.day.news
# - dev.downtownsguide.com
# - dev.alphasite.com
# - golocalvoices.com
```

### 5.2 Validate Certificates

- Add DNS validation records to your DNS provider
- Wait for certificate validation (can take 30+ minutes)

### 5.3 Update ALB Listeners

Once certificates are validated, update Pulumi to add HTTPS listeners:

```python
# In INFRASTRUCTURE/loadbalancing/alb.py
# Add HTTPS listener with ACM certificate ARN
```

**Action Items:**
- [ ] Request ACM certificates for all domains
- [ ] Add DNS validation records
- [ ] Wait for certificate validation
- [ ] Update ALB listeners to use HTTPS
- [ ] Test SSL connections

---

## Phase 6: Service Discovery & Internal Communication

### 6.1 Configure Inertia SSR Service Discovery

ECS services need to communicate with Inertia SSR service internally.

**Options:**
1. **AWS Cloud Map** (recommended)
2. **Internal ALB** for SSR service
3. **ECS Service Discovery** (automatic DNS)

**Action Items:**
- [ ] Set up service discovery for Inertia SSR
- [ ] Update web services to use SSR endpoint
- [ ] Test SSR communication
- [ ] Verify SSR is working

---

## Phase 7: CI/CD Pipeline

### 7.1 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push Docker images
        run: |
          # Build and push each service
          docker build -t $ECR_REGISTRY/fibonacco/dev/goeventcity:$GITHUB_SHA .
          docker push $ECR_REGISTRY/fibonacco/dev/goeventcity:$GITHUB_SHA
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster fibonacco-dev \
            --service fibonacco-dev-goeventcity \
            --force-new-deployment
```

### 7.2 Pulumi CI/CD

```yaml
# .github/workflows/infrastructure.yml
name: Infrastructure

on:
  push:
    paths:
      - 'INFRASTRUCTURE/**'
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pulumi/actions@v5
        with:
          command: up
          stack-name: dev
          work-dir: INFRASTRUCTURE
```

**Action Items:**
- [ ] Create GitHub Actions workflow for Docker builds
- [ ] Create GitHub Actions workflow for Pulumi
- [ ] Set up GitHub secrets (AWS credentials, Pulumi token)
- [ ] Test CI/CD pipeline
- [ ] Configure branch protection

---

## Phase 8: Monitoring & Alerting

### 8.1 Configure SNS Email Alerts

```bash
# Confirm email subscription
# Check email for SNS subscription confirmation
aws sns list-subscriptions-by-topic \
  --topic-arn arn:aws:sns:us-east-1:195430954683:fibonacco-dev-alerts
```

### 8.2 Set Up CloudWatch Dashboards

- Dashboard is already created: `fibonacco-dev`
- View at: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=fibonacco-dev

### 8.3 Add Custom Metrics

Consider adding:
- Application-specific metrics (request counts, error rates)
- Business metrics (user signups, orders, etc.)
- Performance metrics (response times, cache hit rates)

**Action Items:**
- [ ] Confirm SNS email subscriptions
- [ ] Review CloudWatch dashboard
- [ ] Add custom application metrics
- [ ] Set up additional alarms as needed
- [ ] Configure Slack webhook (optional)

---

## Phase 9: Testing

### 9.1 End-to-End Testing

```bash
# Install Playwright
npm install --save-dev @playwright/test
npx playwright install

# Seed test users
php artisan db:seed --class=PlaywrightTestUsersSeeder

# Run authentication setup
npx playwright test tests/Playwright/auth.setup.ts

# Run tests
npx playwright test
```

### 9.2 Load Testing

```bash
# Use tools like:
# - Apache Bench (ab)
# - k6
# - Artillery
# - Locust

# Example:
ab -n 1000 -c 10 https://dev.goeventcity.com/
```

**Action Items:**
- [ ] Set up Playwright E2E tests
- [ ] Create test users
- [ ] Run authentication setup
- [ ] Write E2E tests for critical flows
- [ ] Set up load testing
- [ ] Test auto-scaling

---

## Phase 10: Documentation

### 10.1 Deployment Documentation

- [ ] Document deployment process
- [ ] Create runbooks for common operations
- [ ] Document rollback procedures
- [ ] Create troubleshooting guide

### 10.2 API Documentation

- [ ] Document all API endpoints
- [ ] Create Postman collection
- [ ] Document authentication flows

### 10.3 Developer Onboarding

- [ ] Create developer setup guide
- [ ] Document local development environment
- [ ] Create contribution guidelines

**Action Items:**
- [ ] Complete deployment docs
- [ ] Create API documentation
- [ ] Write developer onboarding guide
- [ ] Document common issues and solutions

---

## Phase 11: Security Hardening

### 11.1 Security Groups Review

- [ ] Review all security group rules
- [ ] Ensure least-privilege access
- [ ] Close unnecessary ports

### 11.2 Secrets Management

- [ ] Move all secrets to AWS Secrets Manager
- [ ] Rotate database passwords
- [ ] Set up secret rotation policies

### 11.3 WAF (Web Application Firewall)

Consider adding AWS WAF to ALB:
- [ ] Set up WAF rules
- [ ] Configure rate limiting
- [ ] Set up IP whitelisting/blacklisting

**Action Items:**
- [ ] Review security groups
- [ ] Move secrets to Secrets Manager
- [ ] Set up WAF (optional)
- [ ] Enable CloudTrail logging
- [ ] Set up VPC Flow Logs

---

## Phase 12: Performance Optimization

### 12.1 Caching Strategy

- [ ] Configure CloudFront CDN
- [ ] Set up response caching
- [ ] Configure Redis caching layers
- [ ] Implement cache warming

### 12.2 Database Optimization

- [ ] Review slow query logs
- [ ] Add database indexes
- [ ] Set up read replicas (if needed)
- [ ] Configure connection pooling

### 12.3 Auto-Scaling Tuning

- [ ] Review auto-scaling policies
- [ ] Adjust scaling thresholds
- [ ] Test scaling behavior
- [ ] Optimize task sizes

**Action Items:**
- [ ] Set up CloudFront
- [ ] Configure caching layers
- [ ] Optimize database queries
- [ ] Tune auto-scaling
- [ ] Monitor performance metrics

---

## Quick Start Checklist

**Immediate Next Steps (Do First):**

1. ✅ **Create Dockerfiles** - Build container images
2. ✅ **Push to ECR** - Get images into registry
3. ✅ **Update .env** - Configure environment variables
4. ✅ **Run Migrations** - Set up database schema
5. ✅ **Configure DNS** - Point domains to ALB
6. ✅ **Test Services** - Verify everything works

**Then:**
7. ✅ **SSL Certificates** - Enable HTTPS
8. ✅ **CI/CD Pipeline** - Automate deployments
9. ✅ **Monitoring** - Set up alerts
10. ✅ **Testing** - E2E and load tests

---

## Commands Reference

### Get Infrastructure Outputs
```bash
cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate
export PATH="$HOME/.pulumi/bin:$PATH"
pulumi stack output
```

### View ECS Services
```bash
aws ecs list-services --cluster fibonacco-dev
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity
```

### View Logs
```bash
aws logs tail /ecs/fibonacco/dev/goeventcity --follow
```

### Update ECS Service
```bash
aws ecs update-service \
  --cluster fibonacco-dev \
  --service fibonacco-dev-goeventcity \
  --force-new-deployment
```

---

## Support & Resources

- **Pulumi State:** Local file storage (`~/.pulumi/stacks/`)
- **AWS Console:** https://console.aws.amazon.com/
- **CloudWatch Dashboard:** `fibonacco-dev`
- **Documentation:** See `INFRASTRUCTURE/README.md`

---

## Estimated Timeline

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Docker Images | 2-4 hours | 🔴 Critical |
| Phase 2: Database Setup | 1-2 hours | 🔴 Critical |
| Phase 3: Environment Config | 1-2 hours | 🔴 Critical |
| Phase 4: DNS Configuration | 30 min | 🔴 Critical |
| Phase 5: SSL Certificates | 1-2 hours | 🟡 High |
| Phase 6: Service Discovery | 1 hour | 🟡 High |
| Phase 7: CI/CD Pipeline | 4-6 hours | 🟡 High |
| Phase 8: Monitoring | 2-3 hours | 🟢 Medium |
| Phase 9: Testing | 4-8 hours | 🟢 Medium |
| Phase 10: Documentation | 4-6 hours | 🟢 Medium |
| Phase 11: Security | 2-4 hours | 🟢 Medium |
| Phase 12: Performance | 4-8 hours | 🟢 Medium |

**Total Estimated Time:** 26-48 hours

---

## Notes

- All infrastructure is in `dev` environment
- Production deployment will use `production` stack with Multi-AZ
- Costs are optimized for dev (single AZ, smaller instances)
- Monitor costs in AWS Cost Explorer

