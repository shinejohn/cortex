# How to Get Build Error Messages

## Quick Method (AWS Console)

1. Go to: https://console.aws.amazon.com/codesuite/codebuild/projects
2. Click on any failed project (e.g., `fibonacco-dev-goeventcity-build`)
3. Click "Build history" tab
4. Click on the latest failed build
5. Click "View logs" or scroll down to see error messages
6. **Copy the error message** and share it

## Common Errors to Look For

### 1. Dockerfile Not Found
```
Error: failed to solve: failed to read dockerfile: open docker/Dockerfile.web: no such file or directory
```
**Fix:** Check Dockerfile path in buildspec

### 2. ECR Login Failed
```
Error: Cannot perform an interactive login from a non TTY device
```
**Fix:** Check ECR permissions

### 3. Build Timeout
```
Error: context deadline exceeded
```
**Fix:** Increase build timeout

### 4. Missing Dependencies
```
Error: npm ci failed
Error: composer install failed
```
**Fix:** Check package.json/composer.json

### 5. Permission Denied
```
Error: denied: User arn:aws:sts::... is not authorized to perform: ecr:PutImage
```
**Fix:** Check CodeBuild IAM role permissions

## What to Share

Copy the **last 20-30 lines** of the build log that show the actual error.
