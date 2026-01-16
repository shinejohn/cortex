# How to See Actual Build Errors in CodePipeline

## The Problem
CodePipeline shows generic error: "Build terminated with state: FAILED"

We need to see the **actual error** from the build logs.

## Steps to See Real Errors

### Option 1: CodePipeline Console
1. Go to: https://console.aws.amazon.com/codesuite/codepipeline/pipelines/fibonacco-dev-pipeline/view
2. Click on any **failed build** (red X icon) in the Build stage
3. Click **"View in CodeBuild"** or **"Details"**
4. Scroll down to see the **build logs**
5. Look for error messages (usually in red or with "ERROR:" prefix)

### Option 2: CodeBuild Console Directly
1. Go to: https://console.aws.amazon.com/codesuite/codebuild/projects
2. Find the project (e.g., `fibonacco-dev-goeventcity-build`)
3. Click on the **latest build**
4. Click **"Build logs"** tab
5. Search for "ERROR" or scroll to the failure point

## What to Look For

### Common Error Patterns:

1. **Composer errors:**
   ```
   ERROR: failed to solve: composer:latest
   ```
   → Need to install composer via curl (already fixed)

2. **npm build errors:**
   ```
   ERROR: npm run build failed
   ```
   → Will show actual frontend error

3. **Missing files:**
   ```
   ENOENT: no such file or directory
   ```
   → Missing dependency or file

4. **Ziggy errors:**
   ```
   Cannot find module 'ziggy-js'
   ```
   → Composer install failed

## After Seeing the Error

Share the **exact error message** and I can help fix it!

The improved Dockerfile should now show errors more clearly.



