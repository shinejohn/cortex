# Deployment Action Plan - Get Platform Running

**Date:** December 23, 2025  
**Status:** In Progress

---

## 🎯 Goal: Get All Services Running on AWS

### Current Status
- ✅ Infrastructure deployed (74 resources)
- ✅ ECS services created
- ❌ Docker images missing from ECR
- ❌ ECS tasks not running (missing images + environment variables)
- ❌ Database migrations not run
- ⚠️ DNS/SSL not configured

---

## ✅ What I CAN Do

### 1. **Update Infrastructure Code** ✅ DONE
- ✅ Created `INFRASTRUCTURE/secrets.py` - AWS Secrets Manager integration
- ✅ Updated `INFRASTRUCTURE/compute/services.py` - Added environment variables and secrets to task definitions
- ✅ Added IAM permissions for Secrets Manager access
- ✅ Created deployment scripts

### 2. **Create Deployment Scripts** ✅ DONE
- ✅ `scripts/deploy-to-aws.sh` - Main deployment script
- ✅ `scripts/setup-aws-secrets.sh` - Setup AWS Secrets Manager
- ✅ `scripts/run-migrations.sh` - Run database migrations
- ✅ `scripts/create-migration-task.sh` - Create one-off migration task

### 3. **Deploy Infrastructure Updates**
```bash
cd INFRASTRUCTURE
pulumi up  # This will create Secrets Manager secret and update task definitions
```

### 4. **Setup Secrets**
```bash
./scripts/setup-aws-secrets.sh
```

### 5. **Build and Push Docker Images**
**Option A: Via GitHub Actions (Recommended)**
```bash
git add .
git commit -m "Update infrastructure with secrets and environment variables"
git push origin main
# GitHub Actions will automatically build and push images
```

**Option B: Manual Build (if Docker is available)**
```bash
./scripts/deploy-to-aws.sh
```

### 6. **Run Database Migrations**
```bash
./scripts/create-migration-task.sh
```

### 7. **Verify Services**
```bash
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity --region us-east-1
```

---

## ❌ What I CANNOT Do (Requires Manual Action)

### 1. **Build Docker Images Locally**
- **Reason:** Docker is not installed/available in this environment
- **Solution:** 
  - Push to GitHub main branch (triggers GitHub Actions)
  - OR install Docker locally and run `./scripts/deploy-to-aws.sh`

### 2. **Configure DNS Records**
- **Reason:** Requires domain registrar access
- **What's Needed:**
  - CNAME records pointing to ALB DNS name
  - Example: `dev.goeventcity.com` → `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **How to Do It:**
  1. Get ALB DNS: `cd INFRASTRUCTURE && pulumi stack output load_balancer_dns`
  2. Log into domain registrar (GoDaddy, Namecheap, etc.)
  3. Create CNAME records for each domain:
     - `dev.goeventcity.com` → ALB DNS
     - `dev.day.news` → ALB DNS
     - `dev.downtownsguide.com` → ALB DNS
     - `dev.alphasite.com` → ALB DNS

### 3. **Request SSL Certificates (ACM)**
- **Reason:** Requires DNS validation (CNAME records must exist first)
- **What's Needed:**
  - Request certificates in AWS Certificate Manager
  - Add DNS validation records to domain DNS
  - Wait for validation (5-30 minutes)
  - Update ALB listeners to use HTTPS
- **How to Do It:**
  1. Go to AWS Console → Certificate Manager
  2. Request certificate for each domain
  3. Add DNS validation records (provided by ACM)
  4. Wait for validation
  5. Update ALB listeners (can be automated via Pulumi)

### 4. **Generate Real APP_KEY**
- **Reason:** Requires Laravel artisan command on a system with PHP
- **What's Needed:**
  - Run `php artisan key:generate --show` to get a real key
  - Update secret in AWS Secrets Manager
- **Current:** Using placeholder key (will need to be replaced)

### 5. **Verify Domain Ownership**
- **Reason:** Required for SSL certificate validation
- **What's Needed:** DNS access to add validation records

### 6. **Configure GitHub Secrets** (if not already set)
- **Reason:** Requires GitHub repository admin access
- **What's Needed:**
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `PULUMI_CONFIG_PASSPHRASE` (for infrastructure deployments)
- **How to Set:**
  1. Go to: https://github.com/shinejohn/Community-Platform/settings/secrets/actions
  2. Add each secret

---

## 📋 Step-by-Step Deployment Process

### Step 1: Update Infrastructure (I'll do this)
```bash
cd INFRASTRUCTURE
pulumi up
```
This will:
- Create AWS Secrets Manager secret
- Update ECS task definitions with environment variables and secrets
- Add IAM permissions for Secrets Manager

### Step 2: Setup Secrets (I'll do this)
```bash
./scripts/setup-aws-secrets.sh
```
This will:
- Get database endpoint from Pulumi
- Get Redis endpoint from Pulumi
- Generate/retrieve APP_KEY
- Create/update AWS Secrets Manager secret

### Step 3: Build Docker Images (YOU NEED TO DO THIS)
**Option A: Push to GitHub**
```bash
git add .
git commit -m "Update infrastructure with secrets"
git push origin main
# Wait ~10-15 minutes for GitHub Actions to build and push images
```

**Option B: Build Locally (if Docker installed)**
```bash
./scripts/deploy-to-aws.sh
```

### Step 4: Force ECS Service Update (I'll do this)
```bash
for service in goeventcity daynews downtownguide alphasite ssr horizon; do
    aws ecs update-service \
        --cluster fibonacco-dev \
        --service fibonacco-dev-$service \
        --force-new-deployment \
        --region us-east-1
done
```

### Step 5: Run Migrations (I'll do this)
```bash
./scripts/create-migration-task.sh
```

### Step 6: Configure DNS (YOU NEED TO DO THIS)
1. Get ALB DNS: `cd INFRASTRUCTURE && pulumi stack output load_balancer_dns`
2. Log into domain registrar
3. Create CNAME records:
   - `dev.goeventcity.com` → `{ALB_DNS}`
   - `dev.day.news` → `{ALB_DNS}`
   - `dev.downtownsguide.com` → `{ALB_DNS}`
   - `dev.alphasite.com` → `{ALB_DNS}`

### Step 7: Request SSL Certificates (YOU NEED TO DO THIS)
1. AWS Console → Certificate Manager
2. Request certificate for each domain
3. Add DNS validation records
4. Wait for validation
5. Update ALB listeners (or I can add this to Pulumi)

---

## 🚀 Quick Start Commands

```bash
# 1. Update infrastructure
cd INFRASTRUCTURE && pulumi up

# 2. Setup secrets
cd .. && ./scripts/setup-aws-secrets.sh

# 3. Push to GitHub to trigger image builds
git add . && git commit -m "Deploy infrastructure updates" && git push origin main

# 4. Wait for GitHub Actions to complete (~10-15 min)

# 5. Force service updates
for service in goeventcity daynews downtownguide alphasite ssr horizon; do
    aws ecs update-service --cluster fibonacco-dev --service fibonacco-dev-$service --force-new-deployment --region us-east-1
done

# 6. Run migrations
./scripts/create-migration-task.sh

# 7. Check service status
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity --region us-east-1 --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}'
```

---

## 📊 Progress Tracking

- [x] Infrastructure code updated with secrets
- [x] Deployment scripts created
- [ ] Infrastructure deployed (`pulumi up`)
- [ ] Secrets created in AWS Secrets Manager
- [ ] Docker images built and pushed to ECR
- [ ] ECS services updated and running
- [ ] Database migrations run
- [ ] DNS configured
- [ ] SSL certificates requested and validated
- [ ] Services accessible via HTTPS

---

## 🔍 Troubleshooting

### Services Not Starting
1. Check CloudWatch logs: `/ecs/fibonacco/dev/{service}`
2. Check ECS service events: `aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity`
3. Verify secrets exist: `aws secretsmanager describe-secret --secret-id fibonacco/dev/app-secrets`
4. Check task definition: `aws ecs describe-task-definition --task-definition fibonacco-dev-goeventcity`

### Images Not Found
- Verify images exist: `aws ecr describe-images --repository-name fibonacco/dev/goeventcity`
- Check GitHub Actions: https://github.com/shinejohn/Community-Platform/actions

### Database Connection Issues
- Verify security groups allow traffic from ECS to RDS
- Check database endpoint is correct in secrets
- Verify database password is correct

---

## 📝 Summary

**What I've Done:**
1. ✅ Updated Pulumi infrastructure code to include secrets and environment variables
2. ✅ Created deployment scripts
3. ✅ Created secrets management system

**What You Need to Do:**
1. ⚠️ **Build Docker Images** - Push to GitHub OR install Docker and run script
2. ⚠️ **Configure DNS** - Add CNAME records pointing to ALB
3. ⚠️ **Request SSL Certificates** - In AWS Certificate Manager
4. ⚠️ **Generate Real APP_KEY** - Run `php artisan key:generate --show` and update secret

**What I'll Do Next:**
1. Deploy infrastructure updates (`pulumi up`)
2. Setup secrets in AWS Secrets Manager
3. Force ECS service updates
4. Run database migrations
5. Verify services are running

---

## 🎯 Expected Outcome

After completing all steps:
- ✅ All 6 ECS services running (goeventcity, daynews, downtownguide, alphasite, ssr, horizon)
- ✅ Services accessible via HTTP (via ALB DNS)
- ✅ Database migrations complete
- ✅ Redis cache connected
- ⚠️ HTTPS access (after DNS and SSL configured)

