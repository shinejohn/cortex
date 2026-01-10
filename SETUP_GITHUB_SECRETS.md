# Quick Setup: Add AWS Secrets to GitHub

## Option 1: Using GitHub Web Interface (Fastest - 2 minutes)

1. **Go to GitHub Secrets Page:**
   https://github.com/shinejohn/Community-Platform/settings/secrets/actions

2. **Click "New repository secret"**

3. **Add Secret 1:**
   - **Name:** `AWS_ACCESS_KEY_ID`
   - **Value:** `AKIAS3AEXW25YDDEMQEJ`
   - Click **"Add secret"**

4. **Click "New repository secret" again**

5. **Add Secret 2:**
   - **Name:** `AWS_SECRET_ACCESS_KEY`
   - **Value:** `H/GyTRsPfmIRYuxciZpNA8rlV5Oj+GsRSjh0Vvw8`
   - Click **"Add secret"**

6. **Verify:** You should see both secrets listed (as `••••••••`)

## Option 2: Using GitHub CLI (If installed)

```bash
# Login to GitHub CLI
gh auth login

# Set secrets
echo "AKIAS3AEXW25YDDEMQEJ" | gh secret set AWS_ACCESS_KEY_ID --repo shinejohn/Community-Platform
echo "H/GyTRsPfmIRYuxciZpNA8rlV5Oj+GsRSjh0Vvw8" | gh secret set AWS_SECRET_ACCESS_KEY --repo shinejohn/Community-Platform

# Verify
gh secret list --repo shinejohn/Community-Platform
```

## After Setup

Once secrets are added, trigger a deployment:

1. Go to: https://github.com/shinejohn/Community-Platform/actions
2. Select **"Deploy to AWS ECS"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

The workflow will now:
- ✅ Build all 5 Docker images with phpredis
- ✅ Push to ECR
- ✅ Deploy to ECS
- ✅ All domains should work!

## Current Status

- ✅ Build workflow fixed (composer install before npm build)
- ✅ Linting errors fixed
- ✅ biome.json fixed
- ⏳ **Waiting for AWS secrets to be added**

Once secrets are added, everything should work!

