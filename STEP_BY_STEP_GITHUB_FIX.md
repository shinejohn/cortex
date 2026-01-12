# Step-by-Step: Fix GitHub Dockerfiles (5 Minutes)

## ⚠️ CRITICAL: This is blocking ALL builds

The build error shows GitHub has OLD Dockerfiles. CodePipeline pulls from GitHub, so it uses old code → Docker Hub rate limits → All builds fail.

## ✅ Solution: Update 3 Files in GitHub Web UI

### File 1: docker/Dockerfile.web

1. **Open:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.web

2. **Make these 4 changes:**

   **Change 1 (Line ~5):**
   ```
   FROM node:20-alpine AS frontend-builder
   ```
   **To:**
   ```
   FROM public.ecr.aws/docker/library/node:20-alpine AS frontend-builder
   ```

   **Change 2 (Line ~17):**
   ```
   COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
   ```
   **To:**
   ```
   COPY --from=public.ecr.aws/docker/library/composer:latest /usr/bin/composer /usr/bin/composer
   ```

   **Change 3 (Line ~37):**
   ```
   FROM php:8.4-fpm-alpine
   ```
   **To:**
   ```
   FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine
   ```

   **Change 4 (Line ~79):**
   ```
   COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
   ```
   **To:**
   ```
   COPY --from=public.ecr.aws/docker/library/composer:latest /usr/bin/composer /usr/bin/composer
   ```

3. **Scroll down → Click "Commit changes" → "Commit directly to main branch"**

---

### File 2: docker/Dockerfile.base-app

1. **Open:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.base-app

2. **Make these 2 changes:**

   **Change 1 (Line ~4):**
   ```
   FROM php:8.4-fpm-alpine
   ```
   **To:**
   ```
   FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine
   ```

   **Change 2 (Line ~34):**
   ```
   COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
   ```
   **To:**
   ```
   COPY --from=public.ecr.aws/docker/library/composer:latest /usr/bin/composer /usr/bin/composer
   ```

3. **Scroll down → Click "Commit changes" → "Commit directly to main branch"**

---

### File 3: docker/Dockerfile.inertia-ssr

1. **Open:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.inertia-ssr

2. **Make these 2 changes:**

   **Change 1 (Line ~4):**
   ```
   FROM php:8.4-cli-alpine AS base
   ```
   **To:**
   ```
   FROM public.ecr.aws/docker/library/php:8.4-cli-alpine AS base
   ```

   **Change 2 (Line ~52):**
   ```
   FROM node:20-alpine
   ```
   **To:**
   ```
   FROM public.ecr.aws/docker/library/node:20-alpine
   ```

3. **Scroll down → Click "Commit changes" → "Commit directly to main branch"**

---

## ✅ After All 3 Files Are Updated

1. **CodePipeline auto-detects the changes** (within 1-2 minutes)
2. **Pipeline triggers automatically**
3. **Builds use ECR Public Gallery** (no rate limits)
4. **✅ All builds succeed!**

## 🎯 Total Time: ~5 minutes

**This is the ONLY thing blocking deployments right now.**

