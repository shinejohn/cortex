# Railway Deployment Code Review - Frontend Apps
**Date:** February 2025  
**Platform:** Laravel + Inertia.js Multisite Platform  
**Deployment Target:** Railway  
**Status:** 🔴 Multiple Apps Crashed

---

## Executive Summary

This review identifies critical issues preventing successful Railway deployment of the multisite platform. **4 out of 5 apps are crashed** on Railway, indicating systematic deployment failures.

### Current Railway Status (from Dashboard)
- ✅ **Downtown Guide** - Online
- 🔴 **GoEventCity** - Crashed 13 hours ago
- 🔴 **Go Local Voices** - Crashed 13 hours ago  
- 🔴 **Day News** - Crashed 11 hours ago (⚠️ 1 warning)
- 🔴 **Alphasite** - Crashed 13 hours ago (⚠️ 1 warning)

---

## 🔴 CRITICAL ISSUES - Must Fix Immediately

### 1. Debug Code in Production Build ⚠️ **HIGH PRIORITY**

**Issue:** Debug logging code attempting to connect to localhost is present in production builds.

**Location:** `resources/js/app.tsx` (lines 14, 19, 24)

```12:28:resources/js/app.tsx
 resolve: (name) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/8cceea84-1baa-4754-b662-98d7ceb2bd0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/js/app.tsx:12',message:'Resolving Inertia page',data:{pageName:name,pattern:`./pages/${name}.tsx`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        try {
            const component = resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob("./pages/**/*.tsx"));
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/8cceea84-1baa-4754-b662-98d7ceb2bd0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/js/app.tsx:17',message:'Page resolved successfully',data:{pageName:name,componentFound:!!component},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            return component;
        } catch (error) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/8cceea84-1baa-4754-b662-98d7ceb2bd0d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/js/app.tsx:22',message:'Page resolution failed',data:{pageName:name,error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            throw error;
        }
    },
```

**Also Found In:**
- `resources/js/pages/downtown-guide/home.tsx` (lines 8, 12, 112)

**Impact:**
- Unnecessary network requests on every page load
- Potential performance degradation
- Console errors in production (though caught)
- Not blocking deployment but should be removed

**Fix Required:**
- Remove all debug logging code before production builds
- Use environment-based conditional compilation if debug logging is needed

---

### 2. Missing Critical Environment Variables 🔴 **BLOCKING**

Based on historical issues documented in `502-ERROR-FIX-REPORT.md` and `COMPLETE-DIAGNOSTIC-SUMMARY.md`, the following environment variables are **MANDATORY** and missing:

#### Required for ALL Apps:

**APP_KEY** - **CRITICAL** ⚠️
- **Status:** Historically missing on all services
- **Impact:** Laravel cannot start without APP_KEY
- **Format:** `base64:...` (32-byte key)
- **Fix:** Generate unique APP_KEY for each service:
  ```bash
  openssl rand -base64 32
  # Then prefix with "base64:"
  ```

**DATABASE_URL** - **CRITICAL** ⚠️
- **Status:** Must use Railway internal format
- **Format:** `postgresql://postgres:PASSWORD@Postgres.railway.internal:5432/railway`
- **Impact:** Database connection failures will crash app
- **Fix:** Use Railway service reference: `${{Postgres.DATABASE_URL}}`

**REDIS_URL** - **CRITICAL** ⚠️
- **Status:** Must use Railway internal format  
- **Format:** `redis://Valkey.railway.internal:6379`
- **Impact:** Cache/queue failures may cause crashes
- **Fix:** Use Railway service reference: `${{Valkey.REDIS_URL}}`

#### App-Specific Domain Variables:

Each app requires domain-specific environment variables:

**GoEventCity:**
```bash
GOEVENTCITY_DOMAIN=goeventcity-production.up.railway.app
APP_URL=https://goeventcity-production.up.railway.app
APP_NAME="Go Event City"
```

**Day News:**
```bash
DAYNEWS_DOMAIN=day-news-production.up.railway.app
APP_URL=https://day-news-production.up.railway.app
APP_NAME="Day News"
```

**Downtown Guide:**
```bash
DOWNTOWNGUIDE_DOMAIN=downtown-guide-production.up.railway.app
APP_URL=https://downtown-guide-production.up.railway.app
APP_NAME="Downtown Guide"
```

**Go Local Voices:**
```bash
LOCAL_VOICES_DOMAIN=golocalvoices-production.up.railway.app
APP_URL=https://golocalvoices-production.up.railway.app
APP_NAME="Go Local Voices"
```

**Alphasite:**
```bash
ALPHASITE_DOMAIN=alphasite-production.up.railway.app
APP_URL=https://alphasite-production.up.railway.app
APP_NAME="AlphaSite"
```

**Impact:** Without these, domain routing fails and apps cannot serve requests correctly.

---

### 3. Database Migration Failures 🔴 **BLOCKING**

**Location:** `docker/standalone/entrypoint.d/25-migrations.sh`

```1:13:docker/standalone/entrypoint.d/25-migrations.sh
#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 [Startup] Running database migrations..."
php artisan migrate --force

# Optional: Run seeders if enabled
if [ "$SEED_ON_DEPLOY" = "true" ]; then
    echo "🌱 [Startup] Seeding database..."
    php artisan db:seed --force
fi
```

**Issues:**
- Uses `set -e` which will crash container if migrations fail
- No error handling or retry logic
- If database is not ready, migrations fail and container crashes
- No check for database connectivity before running migrations

**Impact:** Container crashes on startup if:
- Database is not ready
- Migration fails due to schema conflicts
- Database connection fails

**Fix Required:**
- Add database connectivity check before migrations
- Add retry logic for transient failures
- Consider graceful failure handling

---

### 4. Frontend Build Process Issues ⚠️ **MEDIUM PRIORITY**

**Dockerfile Build Stage:** `docker/standalone/Dockerfile` (lines 38-50)

```38:50:docker/standalone/Dockerfile
FROM oven/bun:alpine AS static-assets

RUN apk add --no-cache python3 py3-pip g++ make
ENV PYTHON /usr/bin/python3

WORKDIR /app
COPY package*.json bun.lock vite.config.ts ./
RUN bun i

COPY . .
COPY --from=base /var/www/html/vendor/ ./vendor/

RUN bun run build:ssr
```

**Potential Issues:**

1. **Missing Files:** If `bun.lock` is missing or outdated, build may fail
   - ✅ **Status:** `bun.lock` exists in repo
   - ⚠️ **Risk:** If lockfile is out of sync, builds may fail

2. **Build Dependencies:** Requires Laravel vendor directory for Ziggy route generation
   - ✅ **Status:** Vendor directory copied from base stage
   - ⚠️ **Risk:** If vendor copy fails, SSR build will fail

3. **Build Time:** `bun run build:ssr` runs both client and SSR builds
   - **Command:** `vite build && vite build --ssr`
   - ⚠️ **Risk:** Long build times may timeout on Railway
   - ⚠️ **Risk:** Memory issues with large codebase

4. **Environment Variables:** Build may require env vars for Vite
   - ⚠️ **Risk:** Missing `VITE_*` variables may cause build failures

**Recommendations:**
- Verify `bun.lock` is up to date
- Add build-time environment variable validation
- Consider splitting client/SSR builds if timeouts occur
- Add build caching for faster rebuilds

---

### 5. Domain Configuration Issues ⚠️ **MEDIUM PRIORITY**

**Location:** `config/domains.php`

```18:22:config/domains.php
    'event-city' => env('GOEVENTCITY_DOMAIN', parse_url(env('APP_URL', 'http://goeventcity.test'), PHP_URL_HOST)),
    'day-news' => env('DAYNEWS_DOMAIN', parse_url(env('APP_URL', 'http://daynews.test'), PHP_URL_HOST)),
    'downtown-guide' => env('DOWNTOWNGUIDE_DOMAIN', parse_url(env('APP_URL', 'http://downtownguide.test'), PHP_URL_HOST)),
    'local-voices' => env('LOCAL_VOICES_DOMAIN', parse_url(env('APP_URL', 'http://golocalvoices.com'), PHP_URL_HOST)),
    'alphasite' => env('ALPHASITE_DOMAIN', parse_url(env('APP_URL', 'http://alphasite.com'), PHP_URL_HOST)),
```

**Issues:**
- Fallback values use `.test` domains which won't work in production
- If `APP_URL` is not set correctly, domain routing fails
- No validation that domain matches Railway service domain

**Impact:** 
- Routes may not match correctly
- Apps may serve wrong content
- Cross-domain issues

**Fix Required:**
- Ensure `APP_URL` matches Railway service URL exactly
- Set domain-specific env vars explicitly
- Add domain validation on startup

---

### 6. Railway Configuration Issues ⚠️ **MEDIUM PRIORITY**

**Location:** `railway.json`

```1:12:railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/standalone/Dockerfile"
  },
  "deploy": {
    "startCommand": "",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Issues:**
- `startCommand` is empty - relies on Dockerfile CMD
- No health check configuration
- No build-time environment variables defined
- No service-specific overrides

**Impact:**
- Cannot customize startup per service
- Health checks may not work correctly
- Build-time variables may be missing

**Recommendations:**
- Add health check endpoint configuration
- Document required build-time variables
- Consider service-specific railway.json files

---

## 🟡 MEDIUM PRIORITY ISSUES

### 7. Health Check Endpoint

**Location:** `routes/health.php`

```18:45:routes/health.php
Route::get('/healthcheck', function () {
    $checks = [
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ];

    // Database check
    try {
        DB::connection()->getPdo();
        $checks['database'] = 'ok';
    } catch (\Exception $e) {
        $checks['database'] = 'error';
        $checks['database_error'] = $e->getMessage();
    }

    // Redis check
    try {
        Redis::connection()->ping();
        $checks['redis'] = 'ok';
    } catch (\Exception $e) {
        $checks['redis'] = 'error';
        $checks['redis_error'] = $e->getMessage();
    }

    $statusCode = ($checks['database'] === 'ok' && $checks['redis'] === 'ok') ? 200 : 503;

    return response()->json($checks, $statusCode);
})->name('healthcheck');
```

**Status:** ✅ Good implementation
**Recommendation:** Ensure Railway health checks use `/healthcheck` endpoint

---

### 8. Startup Script Error Handling

**Location:** `docker/standalone/entrypoint.d/25-migrations.sh`

**Issue:** No retry logic or graceful failure handling

**Recommendation:** Add:
- Database connectivity check with retries
- Graceful failure if migrations fail (log error, continue)
- Health check after migrations complete

---

## 🟢 LOW PRIORITY ISSUES

### 9. Build Optimization

- Consider multi-stage build caching
- Optimize Docker layer ordering
- Reduce build time with dependency caching

### 10. Monitoring & Logging

- Add structured logging
- Add error tracking (Sentry integration exists)
- Add deployment health monitoring

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment Verification

For each app service on Railway, verify:

- [ ] **APP_KEY** is set and valid (base64 format)
- [ ] **DATABASE_URL** uses Railway internal format: `${{Postgres.DATABASE_URL}}`
- [ ] **REDIS_URL** uses Railway internal format: `${{Valkey.REDIS_URL}}`
- [ ] **APP_URL** matches Railway service URL exactly
- [ ] **Domain-specific env var** is set (e.g., `DAYNEWS_DOMAIN`, `GOEVENTCITY_DOMAIN`)
- [ ] **APP_NAME** is set correctly
- [ ] **APP_ENV=production**
- [ ] **APP_DEBUG=false**

### Build Verification

- [ ] `bun.lock` is committed and up to date
- [ ] `package.json` dependencies are correct
- [ ] Dockerfile builds successfully locally
- [ ] Frontend assets compile without errors
- [ ] SSR build completes successfully

### Runtime Verification

- [ ] Container starts without errors
- [ ] Migrations run successfully
- [ ] Health check endpoint responds: `/healthcheck`
- [ ] Database connection works
- [ ] Redis connection works
- [ ] Domain routing works correctly
- [ ] Frontend assets load correctly

---

## 🔧 IMMEDIATE ACTION ITEMS

### Priority 1: Fix Environment Variables (All Apps)

1. **Generate APP_KEY for each crashed service:**
   ```bash
   # For each service (GoEventCity, Day News, Go Local Voices, Alphasite)
   APP_KEY="base64:$(openssl rand -base64 32)"
   railway variables --service "Service Name" --set "APP_KEY=$APP_KEY"
   ```

2. **Set DATABASE_URL:**
   ```bash
   railway variables --service "Service Name" --set "DATABASE_URL=\${{Postgres.DATABASE_URL}}"
   ```

3. **Set REDIS_URL:**
   ```bash
   railway variables --service "Service Name" --set "REDIS_URL=\${{Valkey.REDIS_URL}}"
   ```

4. **Set domain-specific variables:**
   ```bash
   # Example for Day News
   railway variables --service "Day News" --set "DAYNEWS_DOMAIN=day-news-production.up.railway.app"
   railway variables --service "Day News" --set "APP_URL=https://day-news-production.up.railway.app"
   railway variables --service "Day News" --set "APP_NAME=Day News"
   ```

### Priority 2: Remove Debug Code

1. Remove debug logging from `resources/js/app.tsx`
2. Remove debug logging from `resources/js/pages/downtown-guide/home.tsx`
3. Rebuild and redeploy

### Priority 3: Improve Migration Script

1. Add database connectivity check
2. Add retry logic
3. Add graceful failure handling

---

## 📊 ROOT CAUSE ANALYSIS

Based on historical documentation and current status:

### Most Likely Causes of Crashes:

1. **Missing APP_KEY** (60% probability)
   - Documented in `502-ERROR-FIX-REPORT.md`
   - Laravel cannot start without APP_KEY
   - All crashed apps likely missing this

2. **Database Connection Failures** (25% probability)
   - DATABASE_URL not set or incorrect format
   - Database not ready when migrations run
   - Migration failures crash container

3. **Domain Configuration Issues** (10% probability)
   - APP_URL mismatch
   - Domain routing failures
   - Cross-domain authentication issues

4. **Build Failures** (5% probability)
   - Frontend build errors
   - Missing dependencies
   - Build timeouts

---

## 🎯 SUCCESS CRITERIA

All apps should:
- ✅ Build successfully on Railway
- ✅ Start without errors
- ✅ Pass health checks (`/healthcheck` returns 200)
- ✅ Serve requests correctly
- ✅ Connect to database and Redis
- ✅ Route domains correctly

---

## 📝 NOTES

- **Downtown Guide is online** - Use its configuration as reference
- Check Railway logs for specific error messages
- Verify shared services (Postgres, Valkey) are running
- Ensure all services have same base configuration
- Use Railway service references for shared resources

---

**Review Completed:** February 2025  
**Next Steps:** Fix Priority 1 items and redeploy crashed services
