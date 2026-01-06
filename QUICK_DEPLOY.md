# Quick Deployment Guide

## Prerequisites Check

First, check if all prerequisites are met:
```bash
./scripts/check-prerequisites.sh
```

## Automated Deployment

Run the complete deployment script:
```bash
./scripts/deploy-all.sh
```

This will:
1. ✅ Test Docker builds locally
2. ✅ Set up environment template
3. ✅ Check AWS credentials
4. ✅ Login to ECR
5. ✅ Build and push all images
6. ✅ Run database migrations (if configured)
7. ✅ Update ECS services
8. ✅ Display deployment information

## Manual Steps (If Needed)

### 1. Test Docker Builds
```bash
./scripts/test-docker-build.sh
```

### 2. Set Up Environment
```bash
./scripts/setup-env.sh
# Review .env.aws.template
# Copy to .env and update with actual values
```

### 3. Create AWS Secrets
```bash
./scripts/create-secrets.sh
```

### 4. Build and Push Images
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 195430954683.dkr.ecr.us-east-1.amazonaws.com

# Build and push
./scripts/build-and-push-images.sh
```

### 5. Run Database Migrations
```bash
# Ensure .env has database credentials
./scripts/migrate-database.sh
```

### 6. Update ECS Services
```bash
./scripts/update-ecs-services.sh
```

## Get Infrastructure Info

```bash
cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate
export PATH="$HOME/.pulumi/bin:$PATH"
pulumi stack output
```

Key outputs:
- `alb_dns_name` - For DNS configuration
- `database_endpoint` - For database connection
- `app_bucket_name` - S3 bucket name
- `archive_bucket_name` - Archive bucket name

## DNS Configuration

After deployment, configure DNS CNAME records pointing to the ALB DNS.

## GitHub Secrets

Add to GitHub repository secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `PULUMI_CONFIG_PASSPHRASE`

---

**Ready to deploy!** Run `./scripts/deploy-all.sh` to get started. 🚀

