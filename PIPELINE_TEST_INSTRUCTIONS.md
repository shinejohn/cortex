# CodePipeline Test Instructions

## ✅ Commit Ready

**Commit:** `f9cac5f`  
**Message:** Configure AWS CodePipeline for CI/CD  
**Status:** Committed locally, ready to push

## 🚀 Push to Trigger Pipeline

```bash
git push origin main
```

## 📊 Monitor Pipeline Execution

**AWS Console:**  
https://console.aws.amazon.com/codesuite/codepipeline/pipelines/fibonacco-dev-pipeline/view

### What to Watch For

1. **Source Stage** (~30 seconds)
   - Should pull code from GitHub `main` branch
   - Green checkmark = success

2. **Build Stage** (~5-10 minutes per service)
   - 7 CodeBuild projects will run in parallel:
     - `fibonacco-dev-goeventcity-build`
     - `fibonacco-dev-daynews-build`
     - `fibonacco-dev-downtownguide-build`
     - `fibonacco-dev-alphasite-build`
     - `fibonacco-dev-golocalvoices-build`
     - `fibonacco-dev-base-app-build`
     - `fibonacco-dev-inertia-ssr-build`
   - Each will:
     - Login to ECR
     - Build Docker image
     - Push to ECR with `latest` and commit SHA tags

3. **Deploy Stage** (~2-3 minutes per service)
   - 5 web services will deploy to ECS:
     - GoEventCity
     - Day.News
     - Downtown Guide
     - AlphaSite
     - GoLocalVoices
   - Each will update the ECS service with the new image

## 🔍 Troubleshooting

### Pipeline Not Triggering

**Option 1: Manual Trigger**
1. Go to AWS CodePipeline console
2. Select `fibonacco-dev-pipeline`
3. Click **"Release change"** button

**Option 2: Check GitHub Webhook**
- CodePipeline should have automatically created a webhook
- Check GitHub: Settings → Webhooks
- Should see a webhook pointing to CodePipeline

**Option 3: Polling**
- CodePipeline polls GitHub every few minutes
- Wait 2-3 minutes after push

### Build Failures

**Check CodeBuild Logs:**
1. Go to CodeBuild console
2. Find the failing project
3. Click on the build execution
4. View CloudWatch Logs for detailed error messages

**Common Issues:**
- ECR login failures → Check IAM permissions
- Docker build failures → Check Dockerfile syntax
- Missing dependencies → Check buildspec commands

### Deployment Failures

**Check ECS Service:**
1. Go to ECS console
2. Cluster: `fibonacco-dev`
3. Service: `fibonacco-dev-{service-name}`
4. Check "Events" tab for deployment errors

**Common Issues:**
- Image not found → Check ECR repository
- Task definition errors → Check container configuration
- Health check failures → Check application health endpoint

## 📈 Expected Results

### Successful Pipeline Run

✅ **Source:** Code pulled from GitHub  
✅ **Build:** All 7 Docker images built and pushed to ECR  
✅ **Deploy:** All 5 web services updated in ECS  

### Verify Deployment

**Check ECS Services:**
```bash
aws ecs list-services --cluster fibonacco-dev
```

**Check Running Tasks:**
```bash
aws ecs list-tasks --cluster fibonacco-dev --service-name fibonacco-dev-goeventcity
```

**Check ECR Images:**
```bash
aws ecr describe-images --repository-name fibonacco/dev/goeventcity
```

## 🎉 Success Indicators

- ✅ Pipeline shows "Succeeded" status
- ✅ All build stages completed
- ✅ All deploy stages completed
- ✅ ECS services show new task definitions
- ✅ Applications accessible via their domains

## 📝 Next Steps After Successful Test

1. **Monitor First Few Deployments**
   - Watch for any issues
   - Verify applications are working correctly

2. **Set Up Notifications** (Optional)
   - Configure SNS topic for pipeline failures
   - Add email/Slack notifications

3. **Optimize Build Times** (Optional)
   - Consider build caching
   - Parallel builds are already enabled

4. **Import ECS SSR Service** (Optional)
   - Import existing SSR service into Pulumi
   - This will resolve the "already exists" error





