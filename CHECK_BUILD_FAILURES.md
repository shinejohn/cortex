# How to Check What's Actually Failing

## 1. Check CodeBuild Logs

Go to AWS Console → CodeBuild → Projects → Select a failing project → Build history → Click latest build → View logs

OR use AWS CLI:
```bash
aws codebuild list-builds-for-project --project-name fibonacco-dev-goeventcity-build --region us-east-1
aws codebuild batch-get-builds --ids <build-id> --region us-east-1
```

## 2. Check CloudWatch Logs

Go to CloudWatch → Log groups → `/aws/codebuild/fibonacco-dev-{service}-build` → Latest log stream

## 3. Common Failure Points

### ECR Login Issues
- Error: "Unable to locate credentials"
- Fix: Check CodeBuild IAM role has ECR permissions

### Docker Build Failures
- Error: "Dockerfile not found"
- Fix: Check `DOCKERFILE` env var matches actual path

### Missing Dependencies
- Error: "npm ci failed" or "composer install failed"
- Fix: Check package.json/composer.json are in repo

### Build Context Issues
- Error: "COPY failed: file not found"
- Fix: Check build context includes all needed files

## 4. Quick Fixes

If builds are failing, check:
1. Are ECR repositories created?
2. Does CodeBuild role have ECR push permissions?
3. Is Dockerfile path correct?
4. Are source files in the repo?

