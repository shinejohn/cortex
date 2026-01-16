# Exact Fixes Needed in GitHub docker/Dockerfile.web

## ⚠️ GitHub Has Errors - Fix These Lines:

### Line 14 - DELETE THIS LINE:
```dockerfile
COPY -from=public.ecr.aws/docker/lib /usr/bin/compose
```
**This line is completely wrong - DELETE IT**

### Line 17 - FIX THIS:
**Current (WRONG):**
```dockerfile
COPY --from=public.ecr.aws/docker/lib /usr/bin/composer
```

**Should be:**
```dockerfile
COPY --from=public.ecr.aws/docker/library/composer:latest /usr/bin/composer /usr/bin/composer
```

**Changes:**
- `lib` → `library`
- Add `:latest` after `composer`
- Add `/usr/bin/composer` at the end (destination path)

---

### Line 39 - FIX THIS:
**Current (WRONG):**
```dockerfile
FROM FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine
```

**Should be:**
```dockerfile
FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine
```

**Change:** Remove duplicate `FROM`

---

### Line 79 - FIX THIS:
**Current (WRONG):**
```dockerfile
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
```

**Should be:**
```dockerfile
COPY --from=public.ecr.aws/docker/library/composer:latest /usr/bin/composer /usr/bin/composer
```

**Change:** `composer:latest` → `public.ecr.aws/docker/library/composer:latest`

---

## ✅ Summary of All Changes:

1. **Delete line 14** (the broken COPY line)
2. **Fix line 17** - Add `rary`, `:latest`, and destination path
3. **Fix line 39** - Remove duplicate `FROM`
4. **Fix line 79** - Change to ECR Public Gallery

## 🎯 Quick Fix Steps:

1. Go to: https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.web
2. Delete line 14 completely
3. Fix line 17, 39, and 79 as shown above
4. Commit changes

**After fixing, the file should match your local version (which is correct)!**



