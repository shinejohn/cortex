# 🔗 DIRECT LINKS TO FIX DOCKERFILES

## ⚠️ CRITICAL: GitHub Still Has Old Code

The build error shows GitHub line 5 has:
```
FROM node:20-alpine AS frontend-builder
```

It should be:
```
FROM public.ecr.aws/docker/library/node:20-alpine AS frontend-builder
```

## 🎯 Click These Links & Fix Now:

### 1. docker/Dockerfile.web
**🔗 EDIT:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.web

**Find & Replace (use browser Find/Ctrl+F):**
- Find: `FROM node:20-alpine`
- Replace: `FROM public.ecr.aws/docker/library/node:20-alpine`

- Find: `FROM php:8.4-fpm-alpine`
- Replace: `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`

- Find: `COPY --from=composer:latest`
- Replace: `COPY --from=public.ecr.aws/docker/library/composer:latest`

**Then:** Scroll down → "Commit changes" → "Commit directly to main branch"

---

### 2. docker/Dockerfile.base-app
**🔗 EDIT:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.base-app

**Find & Replace:**
- Find: `FROM php:8.4-fpm-alpine`
- Replace: `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`

- Find: `COPY --from=composer:latest`
- Replace: `COPY --from=public.ecr.aws/docker/library/composer:latest`

**Then:** Scroll down → "Commit changes" → "Commit directly to main branch"

---

### 3. docker/Dockerfile.inertia-ssr
**🔗 EDIT:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.inertia-ssr

**Find & Replace:**
- Find: `FROM php:8.4-cli-alpine`
- Replace: `FROM public.ecr.aws/docker/library/php:8.4-cli-alpine`

- Find: `FROM node:20-alpine`
- Replace: `FROM public.ecr.aws/docker/library/node:20-alpine`

**Then:** Scroll down → "Commit changes" → "Commit directly to main branch"

---

## ✅ After All 3 Files Are Committed:

1. Wait 1-2 minutes
2. CodePipeline auto-detects changes
3. Pipeline triggers automatically
4. Builds succeed! 🎉

**This is blocking EVERYTHING. Please fix now!**
