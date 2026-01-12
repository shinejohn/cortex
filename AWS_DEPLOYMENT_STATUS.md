# AWS Deployment Status

**Last Updated**: $(date)

## Quick Links

### 🎯 Main Dashboards
- **ECS Services**: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services?region=us-east-1
- **ECR Repositories**: https://console.aws.amazon.com/ecr/repositories?region=us-east-1
- **GitHub Actions**: https://github.com/shinejohn/Community-Platform/actions
- **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups

### 📊 Service-Specific URLs

**GoEventCity:**
- ECS Service: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services/fibonacco-dev-goeventcity/details?region=us-east-1
- ECR Repo: https://console.aws.amazon.com/ecr/repositories/private/195430954683/fibonacco/dev/goeventcity?region=us-east-1

**Day.News:**
- ECS Service: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services/fibonacco-dev-daynews/details?region=us-east-1
- ECR Repo: https://console.aws.amazon.com/ecr/repositories/private/195430954683/fibonacco/dev/daynews?region=us-east-1

**Downtown Guide:**
- ECS Service: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services/fibonacco-dev-downtownguide/details?region=us-east-1
- ECR Repo: https://console.aws.amazon.com/ecr/repositories/private/195430954683/fibonacco/dev/downtownguide?region=us-east-1

**AlphaSite:**
- ECS Service: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services/fibonacco-dev-alphasite/details?region=us-east-1
- ECR Repo: https://console.aws.amazon.com/ecr/repositories/private/195430954683/fibonacco/dev/alphasite?region=us-east-1

**GoLocalVoices:**
- ECS Service: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services/fibonacco-dev-golocalvoices/details?region=us-east-1
- ECR Repo: https://console.aws.amazon.com/ecr/repositories/private/195430954683/fibonacco/dev/golocalvoices?region=us-east-1

## Current Status

Run this command to get live status:

```bash
aws ecs describe-services \
  --cluster fibonacco-dev \
  --services fibonacco-dev-goeventcity fibonacco-dev-daynews fibonacco-dev-downtownguide fibonacco-dev-alphasite fibonacco-dev-golocalvoices \
  --region us-east-1 \
  --query 'services[*].{Service:serviceName,Status:status,Running:runningCount,Desired:desiredCount}' \
  --output table
```

## Check Deployment Progress

### Via AWS CLI:
```bash
# Check all services
for svc in goeventcity daynews downtownguide alphasite golocalvoices; do
  echo "=== $svc ==="
  aws ecs describe-services \
    --cluster fibonacco-dev \
    --services "fibonacco-dev-$svc" \
    --region us-east-1 \
    --query 'services[0].{Running:runningCount,Desired:desiredCount,Events:events[0:2]}' \
    --output json | python3 -m json.tool
done
```

### Via AWS Console:
1. Go to ECS Services URL above
2. Click on each service to see:
   - Running tasks
   - Recent events
   - Deployment status
   - Task definitions

## Monitor GitHub Actions Deployment

**URL**: https://github.com/shinejohn/Community-Platform/actions

Look for the latest "Deploy to AWS ECS" workflow run to see:
- Build progress for each service
- Push to ECR status
- Deployment to ECS status

## Check Image Build Status

**ECR Console**: https://console.aws.amazon.com/ecr/repositories?region=us-east-1

Look for repositories:
- `fibonacco/dev/goeventcity`
- `fibonacco/dev/daynews`
- `fibonacco/dev/downtownguide`
- `fibonacco/dev/alphasite`
- `fibonacco/dev/golocalvoices` ⭐ (this one was missing!)

Check the "Last pushed" timestamp - should show today's date/time if deployment is working.

## Troubleshooting

If a service is not running:

1. **Check ECS Service Events** (in AWS Console)
   - Look for error messages
   - Check task definition
   - Verify image exists in ECR

2. **Check CloudWatch Logs**
   - Go to CloudWatch Logs
   - Find log group: `/ecs/fibonacco-dev-<service-name>`
   - Check for application errors

3. **Check GitHub Actions Logs**
   - Go to failed workflow run
   - Check build logs for errors
   - Verify AWS credentials are working

## Success Indicators

✅ All services show `Running: 1, Desired: 1, Status: ACTIVE`
✅ golocalvoices service is running (was 0/1 before)
✅ Image push dates show today's date/time
✅ No "image not found" errors in ECS events
✅ GitHub Actions workflow completes successfully

