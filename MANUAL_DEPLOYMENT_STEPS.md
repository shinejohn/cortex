# Manual Deployment Steps

## ⚠️ Automated Push Failed - Manual Steps Required

The GitHub token lacks 'workflow' scope, so you need to push manually.

## Step 1: Push Code to GitHub

### Option A: Update GitHub Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - ✅ `repo` (full control)
   - ✅ `workflow` (update GitHub Actions workflows)
4. Generate and copy token
5. Update git credentials:
   ```bash
   git remote set-url origin https://<token>@github.com/shinejohn/Community-Platform.git
   git push origin main
   ```

### Option B: Push via GitHub Web UI
1. Go to: https://github.com/shinejohn/Community-Platform
2. Upload changed files:
   - `docker/Dockerfile.web`
   - `config/logging.php`
   - `INFRASTRUCTURE/compute/services.py`
   - `.github/workflows/deploy.yml` (already has golocalvoices)
   - `DNS_SETUP_COMPLETE.md`
   - `DEPLOYMENT_STATUS.md`

### Option C: Push via SSH (if configured)
```bash
git remote set-url origin git@github.com:shinejohn/Community-Platform.git
git push origin main
```

## Step 2: Monitor GitHub Actions

Once pushed, monitor the deployment:
- **URL:** https://github.com/shinejohn/Community-Platform/actions
- **Expected Duration:** 15-20 minutes
- **What it does:**
  1. Builds Docker images for all 5 services
  2. Pushes images to ECR
  3. Deploys to ECS

## Step 3: Configure DNS in GoDaddy

For each domain, add a CNAME record:

| Domain | Type | Host | Points To | TTL |
|--------|------|------|-----------|-----|
| `goeventcity.com` | CNAME | `dev` | `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com` | 300 |
| `day.news` | CNAME | `dev` | `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com` | 300 |
| `downtownsguide.com` | CNAME | `dev` | `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com` | 300 |
| `golocalvoices.com` | CNAME | `dev` | `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com` | 300 |
| `alphasite.com` | CNAME | `dev` | `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com` | 300 |

**DNS Propagation:** 5-30 minutes

## Step 4: Verify Deployment

### Check ECS Services
```bash
for service in goeventcity daynews downtownguide golocalvoices alphasite; do
  echo "=== $service ==="
  aws ecs describe-services \
    --cluster fibonacco-dev \
    --services fibonacco-dev-$service \
    --region us-east-1 \
    --query 'services[0] | "Running: \(.runningCount)/\(.desiredCount), Status: \(.status), TaskDef: \(.taskDefinition | split(\"/\")[1])"'
done
```

### Test Services (via ALB)
```bash
# Test each service
curl -H 'Host: dev.goeventcity.com' http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/
curl -H 'Host: dev.day.news' http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/
curl -H 'Host: dev.downtownsguide.com' http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/
curl -H 'Host: dev.golocalvoices.com' http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/
curl -H 'Host: dev.alphasite.com' http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/
```

**Expected:** HTTP 200 with HTML (not 500 error)

### Test Services (via DNS - after propagation)
```bash
curl http://dev.goeventcity.com/
curl http://dev.day.news/
curl http://dev.downtownsguide.com/
curl http://dev.golocalvoices.com/
curl http://dev.alphasite.com/
```

## Step 5: Check CloudWatch Logs

If services show errors:
```bash
# Check logs for Redis errors
aws logs tail /ecs/fibonacco/dev/goeventcity --follow --region us-east-1 | grep -i redis
```

**Expected:** No "Class Redis not found" errors

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow completed successfully
- [ ] All 5 Docker images built and pushed to ECR
- [ ] All 5 ECS services running with new images
- [ ] DNS CNAME records configured in GoDaddy
- [ ] DNS propagated (check with `dig dev.goeventcity.com`)
- [ ] All services return HTTP 200
- [ ] No Redis errors in CloudWatch logs
- [ ] All domains accessible via DNS

## 🆘 Troubleshooting

### If GitHub Actions Fails
- Check workflow logs: https://github.com/shinejohn/Community-Platform/actions
- Verify AWS credentials in GitHub Secrets
- Check ECR repository permissions

### If Services Show 500 Error
- Check CloudWatch logs for specific error
- Verify Redis connection from ECS
- Check if phpredis extension is installed in container

### If DNS Not Resolving
- Verify CNAME records in GoDaddy
- Check DNS propagation: https://www.whatsmydns.net/
- Wait longer (up to 30 minutes)

## 📞 Quick Commands Reference

```bash
# Check ECS service status
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity --region us-east-1

# Check latest Docker image
aws ecr describe-images --repository-name fibonacco/dev/goeventcity --region us-east-1 --query 'sort_by(imageDetails,&imagePushedAt)[-1]'

# Force new deployment
aws ecs update-service --cluster fibonacco-dev --service fibonacco-dev-goeventcity --force-new-deployment --region us-east-1

# Check CloudWatch logs
aws logs tail /ecs/fibonacco/dev/goeventcity --follow --region us-east-1
```
