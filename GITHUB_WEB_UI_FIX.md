# Fix Dockerfiles in GitHub Web UI (FASTEST METHOD)

## The Problem
CodePipeline pulls from GitHub, which still has OLD Dockerfiles using Docker Hub.
Your local changes aren't pushed yet.

## Quick Fix (5 minutes)

### 1. docker/Dockerfile.web
**URL:** https://github.com/shinejohn/Community-Platform/blob/main/docker/Dockerfile.web

**Changes:**
- **Line 5:** Change `FROM node:20-alpine` to `FROM public.ecr.aws/docker/library/node:20-alpine`
- **Line 37:** Change `FROM php:8.4-fpm-alpine` to `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`
- **Line 17:** Change `COPY --from=composer:latest` to `COPY --from=public.ecr.aws/docker/library/composer:latest`
- **Line 79:** Change `COPY --from=composer:latest` to `COPY --from=public.ecr.aws/docker/library/composer:latest`

### 2. docker/Dockerfile.inertia-ssr
**URL:** https://github.com/shinejohn/Community-Platform/blob/main/docker/Dockerfile.inertia-ssr

**Changes:**
- **Line 4:** Change `FROM php:8.4-cli-alpine` to `FROM public.ecr.aws/docker/library/php:8.4-cli-alpine`
- **Line 52:** Change `FROM node:20-alpine` to `FROM public.ecr.aws/docker/library/node:20-alpine`

### 3. docker/Dockerfile.base-app
**URL:** https://github.com/shinejohn/Community-Platform/blob/main/docker/Dockerfile.base-app

**Changes:**
- **Line 4:** Change `FROM php:8.4-fpm-alpine` to `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`
- **Line 34:** Change `COPY --from=composer:latest` to `COPY --from=public.ecr.aws/docker/library/composer:latest`

## Steps for Each File:
1. Click "Edit" (pencil icon)
2. Make the changes above
3. Scroll down → Commit changes → "Commit directly to main branch"
4. Repeat for next file

## After All Changes:
- CodePipeline will auto-detect the push
- Pipeline will trigger automatically
- Builds will use ECR Public Gallery (no rate limits)
- Builds should succeed!

**Total time: ~5 minutes**
