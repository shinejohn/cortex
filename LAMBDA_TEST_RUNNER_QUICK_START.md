# Lambda Test Runner - Quick Start Guide

**Date:** December 29, 2025  
**Status:** ✅ Ready to Deploy

## Overview

Lambda function that runs in VPC with access to private RDS. Can execute:
- `php artisan scribe:generate`
- `php artisan api:export-markdown`
- `php artisan test` (integration tests)

## Quick Start

### 1. Build and Push Container Image

```bash
# Make script executable
chmod +x lambda/build-and-deploy.sh

# Build and push (creates ECR repo if needed)
./lambda/build-and-deploy.sh dev
```

### 2. Deploy Lambda Infrastructure

```bash
cd INFRASTRUCTURE
pulumi up
```

This creates:
- Lambda function
- IAM role (VPC, S3, Secrets Manager access)
- VPC configuration

### 3. Invoke Lambda

#### Generate Scribe Documentation
```bash
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"scribe:generate"}' \
  response.json && cat response.json
```

#### Export Markdown
```bash
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"api:export-markdown"}' \
  response.json && cat response.json
```

#### Run Integration Tests
```bash
aws lambda invoke \
  --function-name fibonacco-dev-test-runner \
  --payload '{"command":"test","filter":"Integration"}' \
  response.json && cat response.json
```

### 4. Check Results in S3

```bash
# List results
aws s3 ls s3://fibonacco-dev-app-storage/test-results/

# Download result
aws s3 cp s3://fibonacco-dev-app-storage/test-results/test-xxx.txt ./result.txt
cat result.txt
```

## What Gets Created

### Infrastructure (Pulumi)
- ✅ Lambda function (`fibonacco-dev-test-runner`)
- ✅ IAM role with VPC access
- ✅ Security group (same as RDS)
- ✅ S3 upload permissions
- ✅ Secrets Manager read permissions

### Container Image
- ✅ PHP 8.2 runtime
- ✅ Laravel application
- ✅ All dependencies
- ✅ Lambda handler

## Benefits

✅ **No VPN Needed** - Lambda handles network access  
✅ **On-Demand** - Run when needed  
✅ **Cost Effective** - Pay per invocation  
✅ **Results in S3** - Easy to retrieve  
✅ **Scalable** - Handles concurrent runs

## Limitations

⚠️ **15 Minute Timeout** - Max execution time  
⚠️ **Cold Starts** - First invocation ~10-30 seconds  
⚠️ **Memory** - 3GB allocated (max 10GB)

## Troubleshooting

### Lambda Times Out
- Increase timeout in `lambda_test_runner.py` (max 900 seconds)
- Check CloudWatch logs for errors

### Can't Connect to RDS
- Verify Lambda is in VPC (check function configuration)
- Verify security group allows Lambda → RDS
- Check RDS endpoint in Secrets Manager

### Container Image Too Large
- Optimize Dockerfile (multi-stage build)
- Use `.dockerignore` to exclude unnecessary files
- Consider ECS Fargate instead

## Next Steps

1. ✅ Infrastructure code created
2. ⏳ Build and push container image
3. ⏳ Deploy Lambda function
4. ⏳ Test invocation
5. ⏳ Set up API Gateway (optional) for HTTP triggers

## Summary

**This solves the "needs DB" problem!** Lambda runs in VPC with RDS access, so you can run tests and generate docs without VPN/bastion. 🎉


