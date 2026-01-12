# Deployment Trigger Guide

## ✅ AWS Credentials Added!

Now that AWS credentials are configured in GitHub Secrets, you can trigger deployments.

## Automatic Deployment

The deployment workflow (`deploy.yml`) automatically triggers on:
- ✅ Push to `main` branch
- ✅ Changes to: `app/**`, `resources/**`, `routes/**`, `config/**`, `database/**`, `docker/**`

**Your latest commit** (`c66e64a - Fix Dockerfile syntax error`) modified `docker/Dockerfile.web`, so it **should trigger automatically**.

## Manual Deployment (If Needed)

If the workflow didn't trigger automatically, you can trigger it manually:

1. Go to: https://github.com/shinejohn/Community-Platform/actions/workflows/deploy.yml
2. Click "Run workflow"
3. Select branch: `main`
4. Optionally select a specific service (or leave empty for all)
5. Click "Run workflow"

## What Will Happen

1. **Tests Job** (non-blocking)
   - Runs tests
   - Continues even if tests fail

2. **Build and Push Job** (7 services in parallel)
   - base-app
   - inertia-ssr
   - goeventcity
   - daynews
   - downtownguide
   - alphasite
   - golocalvoices ⭐ (this will finally get built!)

3. **Deploy Job** (7 services in parallel)
   - Updates each ECS service
   - Forces new deployment
   - Waits for services to stabilize

## Expected Timeline

- **Build**: ~15-20 minutes (all services in parallel)
- **Deploy**: ~10-15 minutes (services restart)
- **Total**: ~25-35 minutes

## Monitor Progress

1. **GitHub Actions**: https://github.com/shinejohn/Community-Platform/actions
2. **AWS ECS Console**: https://console.aws.amazon.com/ecs/v2/clusters/fibonacco-dev/services
3. **ECR Console**: https://console.aws.amazon.com/ecr/repositories

## Verify Success

After deployment completes, verify:

```bash
# Check all services are running
aws ecs describe-services \
  --cluster fibonacco-dev \
  --services fibonacco-dev-goeventcity fibonacco-dev-daynews fibonacco-dev-downtownguide fibonacco-dev-alphasite fibonacco-dev-golocalvoices \
  --region us-east-1 \
  --query 'services[*].{Service:serviceName,Running:runningCount,Desired:desiredCount,Status:status}' \
  --output table

# Check new images were pushed
for svc in goeventcity daynews downtownguide alphasite golocalvoices; do
  echo "$svc:"
  aws ecr describe-images \
    --repository-name "fibonacco/dev/$svc" \
    --region us-east-1 \
    --query 'sort_by(imageDetails,&imagePushedAt)[-1].imagePushedAt' \
    --output text
done
```

## Success Indicators

✅ All services show `Running: 1, Desired: 1, Status: ACTIVE`
✅ golocalvoices service is running (was 0/1 before)
✅ Image push dates show today's date/time
✅ No "image not found" errors in ECS events

## Troubleshooting

If deployment fails:
1. Check GitHub Actions logs for specific errors
2. Check ECS service events: `aws ecs describe-services --cluster fibonacco-dev --services <service-name> --query 'services[0].events[0:5]'`
3. Check ECR repository exists: `aws ecr describe-repositories --repository-names fibonacco/dev/<service-name>`

