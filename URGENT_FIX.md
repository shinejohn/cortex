# ⚠️ URGENT: GitHub Still Has Old Dockerfiles

## The Problem
CodePipeline is pulling from GitHub, which STILL has old Dockerfiles.
Error shows: `FROM php:8.4-fpm-alpine` (should be `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`)

## IMMEDIATE ACTION REQUIRED

### Option 1: GitHub Web UI (5 minutes - RECOMMENDED)

1. **docker/Dockerfile.web**
   - Go to: https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.web
   - Find line 5: Change `FROM node:20-alpine` → `FROM public.ecr.aws/docker/library/node:20-alpine`
   - Find line 37: Change `FROM php:8.4-fpm-alpine` → `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`
   - Find line 17: Change `COPY --from=composer:latest` → `COPY --from=public.ecr.aws/docker/library/composer:latest`
   - Find line 79: Change `COPY --from=composer:latest` → `COPY --from=public.ecr.aws/docker/library/composer:latest`
   - Click "Commit changes"

2. **docker/Dockerfile.base-app**
   - Go to: https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.base-app
   - Find line 4: Change `FROM php:8.4-fpm-alpine` → `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`
   - Find line 34: Change `COPY --from=composer:latest` → `COPY --from=public.ecr.aws/docker/library/composer:latest`
   - Click "Commit changes"

3. **docker/Dockerfile.inertia-ssr**
   - Go to: https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.inertia-ssr
   - Find line 4: Change `FROM php:8.4-cli-alpine` → `FROM public.ecr.aws/docker/library/php:8.4-cli-alpine`
   - Find line 52: Change `FROM node:20-alpine` → `FROM public.ecr.aws/docker/library/node:20-alpine`
   - Click "Commit changes"

### Option 2: Use GitHub CLI (if installed)
```bash
gh auth login
git push origin main
```

### Option 3: Manual Git Push (if credentials work)
```bash
git remote set-url origin git@github.com:shinejohn/Community-Platform.git
git push origin main
```

## After Updating
- CodePipeline will auto-detect changes
- Pipeline triggers automatically  
- Builds will succeed (no more Docker Hub rate limits)

**This is blocking ALL builds. Please update GitHub ASAP!**
