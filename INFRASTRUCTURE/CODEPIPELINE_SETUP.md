# AWS CodePipeline/CodeBuild Setup Guide

This guide explains how to set up and deploy the AWS CodePipeline/CodeBuild CI/CD infrastructure.

## What This Replaces

- **GitHub Actions** → **AWS CodePipeline/CodeBuild**
- Eliminates GitHub Actions billing issues
- Uses native AWS IAM (no GitHub Secrets needed)
- Direct integration with ECR and ECS

## Prerequisites

1. **Pulumi configured** (already done)
2. **GitHub Personal Access Token** (for CodePipeline to access GitHub)

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: `CodePipeline-Access`
4. Scopes: Select `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### 2. Configure Pulumi

```bash
cd INFRASTRUCTURE

# Set AWS account ID
pulumi config set aws_account_id 195430954683

# Set GitHub token (secret)
pulumi config set --secret github_token <your-github-token-here>
```

### 3. Deploy Infrastructure

```bash
cd INFRASTRUCTURE

# Preview changes
pulumi preview

# Deploy
pulumi up
```

This will create:
- **7 CodeBuild projects** (one for each service)
- **1 CodePipeline** (orchestrates all builds)
- **IAM roles** (with proper permissions)
- **S3 bucket** (for pipeline artifacts)

## How It Works

1. **Push to GitHub** → CodePipeline detects change
2. **Source Stage** → Downloads code from GitHub
3. **Build Stage** → CodeBuild builds Docker images in parallel:
   - `goeventcity`
   - `daynews`
   - `downtownguide`
   - `alphasite`
   - `golocalvoices`
   - `base-app`
   - `inertia-ssr`
4. **Push to ECR** → Images pushed with `latest` and commit SHA tags
5. **Deploy** → (Optional) Can add ECS deployment stage later

## CodeBuild Projects

Each service has its own CodeBuild project:
- **Name**: `fibonacco-dev-{service}-build`
- **Dockerfile**: Configured per service
- **ECR Repository**: Automatically linked
- **Build Logs**: CloudWatch Logs (`/aws/codebuild/fibonacco-dev-{service}`)

## CodePipeline

- **Name**: `fibonacco-dev-pipeline`
- **Source**: GitHub (`shinejohn/Community-Platform`, branch `main`)
- **Builds**: All 7 services in parallel
- **Artifacts**: Stored in S3 (`fibonacco-dev-pipeline-artifacts`)

## Monitoring

- **CodePipeline**: View in AWS Console → CodePipeline
- **CodeBuild**: View in AWS Console → CodeBuild
- **Build Logs**: CloudWatch Logs → `/aws/codebuild/fibonacco-dev-*`

## Next Steps (Optional)

After basic setup works, you can add:
1. **Deploy Stage** → Automatically deploy to ECS after build
2. **Test Stage** → Run tests before building
3. **Approval Stage** → Manual approval for production

## Troubleshooting

### Pipeline not triggering
- Check GitHub webhook is configured (CodePipeline creates it automatically)
- Verify GitHub token has `repo` scope

### Builds failing
- Check CloudWatch Logs for specific errors
- Verify ECR repositories exist
- Check IAM permissions

### Permission errors
- Verify CodeBuild role has ECR permissions
- Check CodePipeline role has CodeBuild permissions

## Cost

- **CodeBuild**: ~$0.005 per build minute (BUILD_GENERAL1_MEDIUM)
- **CodePipeline**: First pipeline is free, then $1/month per pipeline
- **S3**: Minimal cost for artifacts storage
- **Much cheaper than GitHub Actions** for frequent builds!

