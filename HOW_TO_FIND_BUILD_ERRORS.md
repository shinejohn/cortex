# How to Find Build Errors

## Where to Look

### Step 1: Go to GitHub Actions
**URL**: https://github.com/shinejohn/Community-Platform/actions

### Step 2: Find the Right Workflow
Look for workflow named: **"Deploy to AWS ECS"**

**NOT**:
- ❌ "Workflow Status" (that's just monitoring)
- ❌ "tests" (that's just tests)
- ❌ "linter" (that's just linting)

**YES**:
- ✅ **"Deploy to AWS ECS"** ← This one!

### Step 3: Open Latest Run
Click on the most recent run of "Deploy to AWS ECS"

### Step 4: Find Build Job
Look for job: **"Build and Push Docker Images"**

This job runs multiple services in parallel (matrix strategy).

### Step 5: Find golocalvoices
In the "Build and Push Docker Images" job, you'll see multiple builds:
- base-app
- inertia-ssr
- goeventcity
- daynews
- downtownguide
- alphasite
- **golocalvoices** ← This one!

Click on **golocalvoices** to expand it.

### Step 6: Check Build Step
Look for step: **"Build and push Docker image"**

This is where the Docker build happens.

### Step 7: Find the Error
Scroll down in that step's output and look for:
- ❌ Red X or error indicators
- Lines starting with `ERROR:`
- Lines containing `failed`
- Lines containing `not found`
- Lines containing `Cannot`

## What the Error Might Look Like

Common errors:

```
ERROR: failed to solve: process "/bin/sh -c npm run build" did not complete successfully
```

```
ERROR: failed to solve: COPY failed: file not found
```

```
ERROR: failed to solve: process "/bin/sh -c composer install" did not complete successfully
```

## If You Can't Find the Workflow

The workflow might not have run if:
1. It was triggered but is still running (check for yellow/yellow circle)
2. It failed to trigger (check workflow triggers)
3. It was cancelled

**To manually trigger**:
1. Go to: https://github.com/shinejohn/Community-Platform/actions/workflows/deploy.yml
2. Click "Run workflow" (top right)
3. Select branch: `main`
4. Click "Run workflow"

## Quick Check

**Just tell me**:
1. Do you see a workflow run called "Deploy to AWS ECS"?
2. If yes, what's its status? (✅ green, ❌ red, 🟡 yellow)
3. If it ran, did golocalvoices build succeed or fail?

That's all I need to know!

