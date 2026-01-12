# ⚠️ FINAL FIX INSTRUCTIONS - DO THIS NOW

## The Problem
GitHub has OLD Dockerfiles. CodePipeline pulls from GitHub → Uses old code → Docker Hub rate limits → ALL builds fail.

**Error shows:** Line 16 has `COPY --from=composer:latest` (should be ECR Public Gallery)

## ✅ THE ONLY SOLUTION: Update GitHub Web UI

### Step 1: Fix docker/Dockerfile.web

1. **Open this link:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.web

2. **Press Ctrl+F (or Cmd+F on Mac) and find each of these:**

   **Change 1:** Find `FROM node:20-alpine`
   - Replace with: `FROM public.ecr.aws/docker/library/node:20-alpine`
   
   **Change 2:** Find `COPY --from=composer:latest`
   - Replace with: `COPY --from=public.ecr.aws/docker/library/composer:latest`
   - (There are 2 instances - change BOTH)
   
   **Change 3:** Find `FROM php:8.4-fpm-alpine`
   - Replace with: `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`

3. **Scroll to bottom → Click "Commit changes" → "Commit directly to main branch"**

---

### Step 2: Fix docker/Dockerfile.base-app

1. **Open:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.base-app

2. **Find & Replace:**
   - Find: `FROM php:8.4-fpm-alpine` → Replace: `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`
   - Find: `COPY --from=composer:latest` → Replace: `COPY --from=public.ecr.aws/docker/library/composer:latest`

3. **Commit changes**

---

### Step 3: Fix docker/Dockerfile.inertia-ssr

1. **Open:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.inertia-ssr

2. **Find & Replace:**
   - Find: `FROM php:8.4-cli-alpine` → Replace: `FROM public.ecr.aws/docker/library/php:8.4-cli-alpine`
   - Find: `FROM node:20-alpine` → Replace: `FROM public.ecr.aws/docker/library/node:20-alpine`

3. **Commit changes**

---

## ✅ After All 3 Files Are Updated:

1. **Wait 1-2 minutes** (CodePipeline polls GitHub)
2. **CodePipeline auto-detects changes**
3. **Pipeline triggers automatically**
4. **Builds succeed!** 🎉

---

## 🚨 IMPORTANT NOTES:

- **I cannot update GitHub for you** - You must do this manually
- **Git push isn't working** - Use GitHub Web UI instead
- **This is blocking EVERYTHING** - No builds can succeed until GitHub is updated
- **Takes 5 minutes** - But fixes ALL builds immediately

**Please do this now - it's the only blocker!**

