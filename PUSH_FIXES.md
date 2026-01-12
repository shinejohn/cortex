# How to Push Fixes to GitHub

## The Problem
All fixes are committed locally but NOT pushed to GitHub.
CodePipeline pulls from GitHub, so it's using OLD code with Docker Hub images.

## Quick Fix Options

### Option 1: GitHub Web UI (Easiest)
1. Go to: https://github.com/shinejohn/Community-Platform
2. Navigate to `docker/Dockerfile.web`
3. Click "Edit" (pencil icon)
4. Change line 5 from:
   ```
   FROM node:20-alpine AS frontend-builder
   ```
   to:
   ```
   FROM public.ecr.aws/docker/library/node:20-alpine AS frontend-builder
   ```
5. Change line 37 from:
   ```
   FROM php:8.4-fpm-alpine
   ```
   to:
   ```
   FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine
   ```
6. Change line 17 and 79 from:
   ```
   COPY --from=composer:latest
   ```
   to:
   ```
   COPY --from=public.ecr.aws/docker/library/composer:latest
   ```
7. Repeat for `docker/Dockerfile.inertia-ssr` and `docker/Dockerfile.base-app`
8. Commit changes
9. Pipeline will auto-trigger

### Option 2: Fix Git and Push
```bash
# Set up SSH or HTTPS with token
git remote set-url origin git@github.com:shinejohn/Community-Platform.git
git push origin main
```

### Option 3: Use GitHub CLI
```bash
gh auth login
git push origin main
```

## Files That Need Updating
- docker/Dockerfile.web (3 changes)
- docker/Dockerfile.inertia-ssr (2 changes)  
- docker/Dockerfile.base-app (2 changes)

Once pushed, CodePipeline will automatically rebuild with the fixes!
