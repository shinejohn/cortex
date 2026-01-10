# AWS Infrastructure Verification Guide

This document outlines the AWS infrastructure requirements for the deployment pipeline.

## Required AWS Resources

### ECS Cluster
- **Name**: `fibonacco-dev`
- **Region**: `us-east-1`
- **Status**: Must be ACTIVE

### ECR Repositories
All repositories follow the pattern: `fibonacco/dev/{service-name}`

Required repositories:
- `fibonacco/dev/base-app`
- `fibonacco/dev/inertia-ssr`
- `fibonacco/dev/goeventcity`
- `fibonacco/dev/daynews`
- `fibonacco/dev/downtownguide`
- `fibonacco/dev/alphasite`
- `fibonacco/dev/golocalvoices`

**Note**: Repositories will be created automatically on first push if IAM permissions allow.

### ECS Services
All services follow the pattern: `fibonacco-dev-{service-name}`

Required services:
- `fibonacco-dev-goeventcity`
- `fibonacco-dev-daynews`
- `fibonacco-dev-downtownguide`
- `fibonacco-dev-alphasite`
- `fibonacco-dev-golocalvoices`
- `fibonacco-dev-inertia-ssr`
- `fibonacco-dev-horizon`

### IAM Permissions Required

The GitHub Actions workflow requires the following AWS permissions:

#### ECR Permissions
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`
- `ecr:DescribeRepositories`
- `ecr:CreateRepository` (optional, for auto-creation)

#### ECS Permissions
- `ecs:DescribeClusters`
- `ecs:DescribeServices`
- `ecs:UpdateService`
- `ecs:DescribeTasks`
- `ecs:ListTasks`

## Verification

### Manual Verification

Run the verification script:
```bash
export AWS_REGION=us-east-1
export ENV=dev
export AWS_ACCOUNT_ID=195430954683
./scripts/verify-aws-infrastructure.sh
```

### Automated Verification

The GitHub Actions deploy workflow includes automatic verification steps that check:
1. AWS credentials validity
2. ECS cluster existence
3. ECR repository existence (creates if missing)
4. ECS service existence
5. Deployment health

## Troubleshooting

### ECR Repository Not Found
- **Solution**: Repository will be created automatically on first push
- **Manual**: Create via AWS Console or CLI:
  ```bash
  aws ecr create-repository \
    --repository-name fibonacco/dev/{service-name} \
    --region us-east-1 \
    --image-scanning-configuration scanOnPush=true
  ```

### ECS Service Not Found
- **Solution**: Service must be created manually via AWS Console or Terraform/CloudFormation
- **Check**: Verify service name matches pattern `fibonacco-dev-{service-name}`

### IAM Permissions Denied
- **Solution**: Update IAM user/role permissions to include required ECR and ECS permissions
- **Check**: Verify AWS credentials in GitHub Secrets are correct

### Deployment Fails
- **Check**: ECS service task definition references correct ECR image
- **Check**: ECS service has sufficient resources (CPU, memory)
- **Check**: Security groups allow necessary traffic
- **Check**: Load balancer (if used) is properly configured

## Monitoring

After deployment, verify:
1. ECS service shows desired number of running tasks
2. Tasks are healthy (check health checks)
3. Application is accessible via configured endpoints
4. Logs show no critical errors

