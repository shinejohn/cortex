# Deployment Status

**Date:** December 22, 2025  
**Status:** Ready to Deploy

## Prerequisites Check

Run the prerequisites check:
```bash
./scripts/check-prerequisites.sh
```

## Deployment Steps

### Option 1: Automated Deployment (Recommended)

Run the complete deployment script:
```bash
./scripts/deploy-all.sh
```

This script will:
1. ✅ Test Docker builds locally
2. ✅ Set up environment template
3. ✅ Check AWS credentials
4. ✅ Login to ECR
5. ✅ Build and push all images
6. ✅ Run database migrations (if .env configured)
7. ✅ Update ECS services
8. ✅ Display deployment information

### Option 2: Manual Step-by-Step

#### Step 1: Test Docker Builds
```bash
./scripts/test-docker-build.sh
```

#### Step 2: Set Up Environment
```bash
./scripts/setup-env.sh
# Review .env.aws.template
# Copy to .env and update with actual values
```

#### Step 3: Create AWS Secrets (Optional but Recommended)
```bash
./scripts/create-secrets.sh
```

#### Step 4: Build and Push Images
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 195430954683.dkr.ecr.us-east-1.amazonaws.com

# Build and push
./scripts/build-and-push-images.sh
```

#### Step 5: Run Database Migrations
```bash
# Ensure .env has database credentials
./scripts/migrate-database.sh
```

#### Step 6: Update ECS Services
```bash
./scripts/update-ecs-services.sh
```

## Infrastructure Information

Get infrastructure outputs:
```bash
cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate
export PATH="$HOME/.pulumi/bin:$PATH"
pulumi stack output
```

Key outputs:
- `alb_dns_name` - ALB DNS for DNS configuration
- `database_endpoint` - RDS endpoint for database connection
- `app_bucket_name` - S3 bucket for app storage
- `archive_bucket_name` - S3 bucket for archives

## DNS Configuration

After deployment, configure DNS CNAME records:

1. Get ALB DNS:
   ```bash
   cd INFRASTRUCTURE && pulumi stack output alb_dns_name
   ```

2. Configure CNAME records:
   - `dev.goeventcity.com` → ALB_DNS
   - `dev.day.news` → ALB_DNS
   - `dev.downtownsguide.com` → ALB_DNS
   - `dev.alphasite.com` → ALB_DNS
   - `golocalvoices.com` → ALB_DNS

## GitHub Secrets (For CI/CD)

Add these secrets to your GitHub repository:

1. Go to: Settings → Secrets and variables → Actions
2. Add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `PULUMI_CONFIG_PASSPHRASE`

## Monitoring

After deployment, monitor:
- ECS Services: AWS Console → ECS → Clusters → fibonacco-dev
- CloudWatch Logs: `/ecs/fibonacco/dev/{service-name}`
- CloudWatch Dashboard: `fibonacco-dev`

## Troubleshooting

### Docker Build Fails
- Check Docker is running: `docker ps`
- Check disk space: `df -h`
- Check Dockerfile syntax

### ECR Push Fails
- Verify AWS credentials: `aws sts get-caller-identity`
- Check ECR repository exists: `aws ecr describe-repositories`

### Database Connection Fails
- Verify .env has correct database credentials
- Check security groups allow ECS → RDS traffic
- Test connection: `php artisan db:show`

### ECS Service Won't Start
- Check CloudWatch logs
- Verify task definition is correct
- Check security groups
- Verify environment variables are set

---

**Ready to deploy!** 🚀

