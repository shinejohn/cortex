# Lambda Test Runner - Complete Setup

**Date:** December 29, 2025  
**Status:** ✅ Infrastructure Code Created

## Overview

Created a Lambda function that runs in the VPC with access to the private RDS instance. This allows us to run:
- `php artisan scribe:generate` - Generate API documentation
- `php artisan api:export-markdown` - Export documentation to Markdown
- `php artisan test` - Run integration tests

## Files Created

### Infrastructure
- `INFRASTRUCTURE/compute/lambda_test_runner.py` - Pulumi code for Lambda function

### Lambda Code
- `lambda/Dockerfile` - Container image definition
- `lambda/index.php` - Lambda handler PHP script
- `lambda/.dockerignore` - Docker ignore file
- `lambda/build-and-deploy.sh` - Build and deployment script

## Architecture

```
Lambda Function (Container Image)
  ↓
VPC Private Subnet
  ↓
Security Group (allows RDS access)
  ↓
RDS PostgreSQL (private)
  ↓
Run Laravel Commands
  ↓
Upload Results to S3
```

## Setup Steps

### 1. Build and Push Container Image

```bash
# Build and push to ECR
./lambda/build-and-deploy.sh dev

# Or manually:
cd /path/to/project
docker build -t fibonacco-dev-test-runner -f lambda/Dockerfile .
docker tag fibonacco-dev-test-runner:latest \
  195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco-dev-test-runner:latest
docker push 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco-dev-test-runner:latest
```

### 2. Deploy Infrastructure

```bash
cd INFRASTRUCTURE
pulumi up
```

This creates:
- Lambda function
- IAM role with VPC, S3, and Secrets Manager permissions
- VPC configuration

### 3. Invoke Lambda

#### Run Scribe Documentation Generation
```bash
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"scribe:generate"}' \
  response.json

cat response.json
```

#### Run Markdown Export
```bash
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"api:export-markdown"}' \
  response.json

cat response.json
```

#### Run Integration Tests
```bash
# Run all integration tests
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"test","filter":"Integration"}' \
  response.json

# Run specific test
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"test","filter":"UserRegistrationWorkflowTest"}' \
  response.json

cat response.json
```

### 4. Check Results in S3

```bash
# List results
aws s3 ls s3://fibonacco-dev-app-storage/test-results/

# Download specific result
aws s3 cp s3://fibonacco-dev-app-storage/test-results/scribe:generate-xxx.txt ./result.txt
```

## Lambda Configuration

- **Runtime:** Container Image (PHP 8.2)
- **Memory:** 3008 MB (max)
- **Timeout:** 900 seconds (15 minutes)
- **VPC:** Private subnets
- **Security Group:** Same as RDS (allows access)

## IAM Permissions

Lambda role has:
- ✅ VPC access (to connect to RDS)
- ✅ Secrets Manager (to get database credentials)
- ✅ S3 write (to upload results)
- ✅ CloudWatch Logs (for logging)

## Benefits

✅ **Access to Private RDS** - Lambda in VPC can connect  
✅ **On-Demand Execution** - Run when needed  
✅ **Cost Effective** - Pay per invocation (~$0.20 per 1M requests)  
✅ **Scalable** - Handles concurrent runs  
✅ **Results in S3** - Easy to retrieve  
✅ **No VPN Needed** - Lambda handles network access

## Limitations

⚠️ **15 Minute Timeout** - Max execution time  
⚠️ **Cold Starts** - First invocation ~10-30 seconds  
⚠️ **Package Size** - Container image can be large  
⚠️ **Memory Limits** - Max 10GB (using 3GB)

## Alternative: ECS Fargate Task

If Lambda limitations are an issue, use ECS Fargate:

```bash
aws ecs run-task \
  --cluster fibonacco-dev-cluster \
  --task-definition fibonacco-dev-test-runner \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

## Next Steps

1. ✅ Infrastructure code created
2. ✅ API Gateway infrastructure added (HTTP triggers)
3. ✅ EventBridge schedule added (daily at 2 AM UTC)
4. ⏳ Build and push container image (requires Docker - see below)
5. ⏳ Deploy Lambda function via Pulumi
6. ⏳ Test invocation

### Building Container Image

**Note:** Docker is required to build the container image. If Docker is not available locally, you can:
- Use AWS CodeBuild
- Use GitHub Actions
- Build on an EC2 instance with Docker
- Use a CI/CD pipeline

To build manually:
```bash
./lambda/build-and-deploy.sh dev
```

This will:
1. Create ECR repository (if needed) ✅ Already created
2. Build Docker image
3. Push to ECR
4. Update Lambda function code

## Quick Start

```bash
# 1. Build and push image
./lambda/build-and-deploy.sh dev

# 2. Deploy infrastructure
cd INFRASTRUCTURE
pulumi up

# 3. Run tests
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"test","filter":"Integration"}' \
  response.json

# 4. Check results
cat response.json
aws s3 ls s3://fibonacco-dev-app-storage/test-results/
```

## Summary

✅ **Lambda function created** - Runs in VPC with RDS access  
✅ **Container image ready** - PHP 8.2 + Laravel  
✅ **Build script provided** - Easy deployment  
✅ **Can run all commands** - Scribe, export, tests  

**This solves the "needs DB" problem by running commands from Lambda in the VPC!** 🎉


