# GoLocalVoices Service Fix

## Current Status

- **Service**: fibonacco-dev-golocalvoices
- **Desired Tasks**: 1
- **Running Tasks**: 0 ❌
- **Failed Tasks**: 167
- **Deployment Status**: Stopped
- **Issue**: No Docker image exists in ECR

## Root Cause

The service is trying to pull:
```
195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/golocalvoices:latest
```

But this image doesn't exist in ECR. The GitHub Actions workflow needs to build and push it.

## Solution

### Option 1: Wait for GitHub Actions (Recommended)

The deployment workflow should automatically build golocalvoices. Check:

**GitHub Actions**: https://github.com/shinejohn/Community-Platform/actions

Look for the "Deploy to AWS ECS" workflow run. It should include:
- Build job for `golocalvoices` service
- Push to ECR: `fibonacco/dev/golocalvoices`
- Deploy to ECS

### Option 2: Manual Build and Push (If GitHub Actions Fails)

If the workflow fails, you can manually build and push:

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 195430954683.dkr.ecr.us-east-1.amazonaws.com

# 2. Build image
docker build -f docker/Dockerfile.web -t fibonacco/dev/golocalvoices:latest .

# 3. Tag for ECR
docker tag fibonacco/dev/golocalvoices:latest 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/golocalvoices:latest

# 4. Push to ECR
docker push 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/golocalvoices:latest

# 5. Force ECS service update
aws ecs update-service \
  --cluster fibonacco-dev \
  --service fibonacco-dev-golocalvoices \
  --force-new-deployment \
  --region us-east-1
```

### Option 3: Check GitHub Actions Logs

If the workflow ran but failed:

1. Go to: https://github.com/shinejohn/Community-Platform/actions
2. Find the latest "Deploy to AWS ECS" workflow
3. Check the "Build and Push Docker Images" job
4. Look for `golocalvoices` build logs
5. Fix any errors found

## Verify Fix

After image is pushed:

```bash
# Check image exists
aws ecr describe-images \
  --repository-name "fibonacco/dev/golocalvoices" \
  --region us-east-1 \
  --query 'imageDetails[0].{Tags:imageTags,Pushed:imagePushedAt}'

# Check service starts
aws ecs describe-services \
  --cluster fibonacco-dev \
  --services fibonacco-dev-golocalvoices \
  --region us-east-1 \
  --query 'services[0].{Running:runningCount,Desired:desiredCount,Events:events[0:3]}'
```

## Expected Outcome

✅ Image exists in ECR: `fibonacco/dev/golocalvoices:latest`
✅ Service starts: `Running: 1, Desired: 1`
✅ No more "image not found" errors
✅ Service reaches "steady state"

## Monitoring

**ECS Console**: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services/fibonacco-dev-golocalvoices/details?region=us-east-1

Watch the "Events" tab for:
- Task started messages
- "Reached steady state" message
- Any new errors

