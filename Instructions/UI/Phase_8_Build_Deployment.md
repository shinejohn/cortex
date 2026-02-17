# PHASE 8: FULL BUILD & DEPLOYMENT VERIFICATION
## Antigravity Instructions — Local & Railway Production Verification

---

**Objective:** Perform full application builds both locally and on Railway to verify that all code, data, configurations, and dependencies are correct and complete. Confirm the application starts, connects to all databases, serves all pages, and processes all queues without error.

**Prerequisites:** Phases 1–7 must be complete. The `qa/pre-production-final` branch must be pushed to GitHub.

---

## STEP 8.1 — LOCAL FULL BUILD VERIFICATION

### 8.1.1 Clean Build from Scratch

```bash
# Start from clean state
rm -rf node_modules vendor
rm -f bootstrap/cache/*.php

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies
npm ci

# Build frontend for production
npm run build

# Verify build outputs exist
ls -la public/build/manifest.json
ls -la public/build/assets/
```

**Pass Criteria:**
```
□ composer install completes with zero errors
□ npm ci completes with zero errors
□ npm run build completes with zero errors and zero warnings
□ public/build/manifest.json exists and contains all entry points
□ All JS/CSS assets are compiled and present in public/build/assets/
```

### 8.1.2 Laravel Configuration Verification

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Verify cached config works
php artisan config:show database.connections.pgsql.host
php artisan config:show database.connections.command_center.host
```

**Pass Criteria:**
```
□ config:cache succeeds (no syntax errors in config files)
□ route:cache succeeds (no closure routes that can't be cached)
□ view:cache succeeds (no Blade/template syntax errors)
□ Database connection configs resolve correctly
```

### 8.1.3 Database Connectivity Test

```bash
# Test primary database connection
php artisan tinker --execute="DB::connection()->getPDO(); echo 'Publishing DB: OK';"

# Test Command Center database connection
php artisan tinker --execute="DB::connection('command_center')->getPDO(); echo 'CC DB: OK';"

# Test AI Tools database connection (if applicable locally)
php artisan tinker --execute="DB::connection('ai_tools')->getPDO(); echo 'AI Tools DB: OK';"

# Test Redis/Valkey connection
php artisan tinker --execute="
    \Illuminate\Support\Facades\Redis::ping();
    echo 'Redis: OK';
"

# Verify migration status
php artisan migrate:status | grep -c "Ran"
echo "All migrations applied"
```

**Pass Criteria:**
```
□ Publishing DB connects successfully
□ Command Center DB connects successfully
□ Redis/Valkey connects successfully
□ All migrations have been run
□ No pending migrations
```

### 8.1.4 Laravel Herd Smoke Test

With Laravel Herd running, manually verify each app loads:

```bash
# Test each app's home page
curl -s -o /dev/null -w "%{http_code}" http://day-news.test
curl -s -o /dev/null -w "%{http_code}" http://goeventcity.test
curl -s -o /dev/null -w "%{http_code}" http://downtownguide.test
curl -s -o /dev/null -w "%{http_code}" http://golocalvoices.test
curl -s -o /dev/null -w "%{http_code}" http://alphasite.test
curl -s -o /dev/null -w "%{http_code}" http://commandcenter.test
```

Every response must be `200`. No `500` responses.

### 8.1.5 Inertia SSR Verification

```bash
# Build SSR bundle
npm run build
ls -la bootstrap/ssr/ssr.mjs

# Start SSR server
node bootstrap/ssr/ssr.mjs &
SSR_PID=$!
sleep 3

# Check SSR is responding
curl -s http://localhost:13714/health || echo "SSR health check failed"

# Verify SSR content on each app's home page
for url in \
  "http://day-news.test" \
  "http://goeventcity.test" \
  "http://downtownguide.test" \
  "http://golocalvoices.test"; do
  
  HTML=$(curl -s "$url")
  # Check for real content in the HTML (not empty app div)
  if echo "$HTML" | grep -q '<div id="app"></div>'; then
    echo "SSR FAILURE: $url returned empty app div (no server-rendered content)"
  else
    echo "SSR OK: $url has server-rendered content"
  fi
  
  # Check for meta tags (SEO)
  if echo "$HTML" | grep -q '<meta.*description'; then
    echo "META OK: $url has meta description"
  else
    echo "META MISSING: $url lacks meta description"
  fi
done

# Kill SSR server
kill $SSR_PID
```

**Pass Criteria:**
```
□ SSR bundle builds without errors (bootstrap/ssr/ssr.mjs exists)
□ SSR server starts without errors on port 13714
□ SSR health check responds
□ All public-facing pages contain server-rendered HTML (not empty div)
□ Meta tags (title, description, og:) appear in view-source HTML
□ No hydration mismatch warnings in browser console after page loads
□ If SSR server crashes, pages still render via client-side rendering (graceful fallback)
```

### 8.1.6 Queue Worker Verification

```bash
# Start queue worker and process a few jobs
php artisan queue:work --once --tries=3 2>&1 | head -20

# Check for any failed jobs
php artisan queue:failed | head -10
```

**Pass Criteria:**
```
□ Queue worker starts without connection errors
□ No immediate job failures
□ Failed jobs table is empty (or contains only pre-existing failures)
```

---

## STEP 8.2 — RAILWAY DEPLOYMENT VERIFICATION

### 8.2.1 Pre-Deployment Checklist

Before deploying to Railway:

```
□ .env.example is up to date with all required variables
□ No hardcoded localhost URLs in config or code
□ No development-only dependencies in production build
□ Dockerfile (if used) is correct and builds successfully
□ railway.toml (if used) has correct build and start commands
□ All environment variables in Railway match the required configuration
□ Database environment variables use Railway reference syntax (${{ServiceName.VARIABLE}})
```

### 8.2.2 Railway Deployment

```bash
# Push the qa/pre-production-final branch
# Railway should auto-deploy from the connected branch
git push origin qa/pre-production-final

# Or manually trigger deployment via Railway CLI
# railway up --environment production
```

### 8.2.3 Railway Post-Deployment Verification

After Railway deploys successfully, verify each service:

**Publishing Platform Services (8 services):**
```
□ Day News — responds with 200 at production URL
□ GoEventCity — responds with 200 at production URL
□ Downtown Guide — responds with 200 at production URL
□ Go Local Voices — responds with 200 at production URL
□ AlphaSite — responds with 200 at production URL
□ Scheduler — running, scheduled commands executing
□ Inertia SSR — running on port 13714, serving SSR responses
    - Verify: view-source of Day.News shows rendered HTML (not empty <div id="app">)
    - Verify: SSR service logs show no "Page not found" or rendering errors
    - Verify: SSR service is NOT crashing from browser API usage in components
□ Horizon — running, processing queue jobs
```

**Command Center Services (4 services):**
```
□ CC API — responds with 200 at health endpoint
□ CC-CRM-LC-FOA — running
□ CC-CRM-LC Scheduler — running
□ CRM-CC-LC Queues — processing jobs
```

### 8.2.4 Railway Health Checks

```bash
# Check each production URL
for url in \
  "https://day.news" \
  "https://goeventcity.com" \
  "https://downtownguide.com" \
  "https://golocalvoices.com" \
  "https://alphasite.ai"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  echo "$url → $STATUS"
  if [ "$STATUS" -ge 400 ]; then
    echo "FAILURE: $url returned $STATUS"
  fi
done
```

### 8.2.5 Railway Database Verification

Via Railway shell or logs, verify:

```
□ All services connect to their correct database (no cross-wiring)
□ Publishing services → Postgres Publishing
□ CC services → Postgres CC CRM SMB
□ No "Database not ready" errors in logs
□ No connection timeout errors
□ Redis/Valkey connections are stable
```

### 8.2.6 Railway Log Monitoring

Monitor Railway logs for 15 minutes after deployment:

```
□ No PHP Fatal errors in any service logs
□ No "Class not found" errors
□ No "View not found" errors
□ No "Route not found" errors
□ No "Column not found" SQL errors
□ No memory limit exceeded errors
□ No timeout errors
□ Queue workers are processing jobs
□ Scheduled tasks are firing on time
```

---

## STEP 8.3 — PRODUCTION SMOKE TEST

After Railway deployment is stable, perform a rapid smoke test on production:

```
□ Load Day.News home page — content displays
□ Click an article — article detail page loads with full content
□ Navigate between categories — each category loads articles
□ Load GoEventCity — events display
□ Click an event — event detail loads
□ Load Downtown Guide — businesses display
□ Click a business — business detail loads
□ Load Go Local Voices — media content displays
□ Load AlphaSite — dashboard loads (requires auth)
□ Load Command Center — CRM dashboard loads (requires auth)
□ Test search on Day.News — returns results
□ Test a poll link — poll loads without auth
□ Verify mobile responsiveness on actual mobile device
```

---

## DELIVERABLE: BUILD & DEPLOYMENT REPORT

Create `QA_BUILD_DEPLOYMENT_REPORT.md`:

```markdown
# Build & Deployment Verification Report
Generated: [timestamp]

## Local Build
- Composer install: ✅/❌
- NPM install: ✅/❌
- Frontend build: ✅/❌
- Config cache: ✅/❌
- Route cache: ✅/❌
- View cache: ✅/❌
- DB connectivity (Publishing): ✅/❌
- DB connectivity (CC): ✅/❌
- Redis connectivity: ✅/❌
- Migration status: All applied / [N] pending
- SSR server: ✅/❌
- Queue worker: ✅/❌
- Local smoke test: ✅/❌ (all 6 apps respond 200)

## Railway Deployment
- Deployment triggered: [timestamp]
- Deployment completed: [timestamp]
- Day.News: ✅/❌ (HTTP [status])
- GoEventCity: ✅/❌ (HTTP [status])
- Downtown Guide: ✅/❌ (HTTP [status])
- Go Local Voices: ✅/❌ (HTTP [status])
- AlphaSite: ✅/❌ (HTTP [status])
- Command Center: ✅/❌ (HTTP [status])
- Database connections verified: ✅/❌
- Queue processing verified: ✅/❌
- No errors in logs (15min monitoring): ✅/❌

## Production Smoke Test
- [list each test with result]

## Final Status: READY FOR PRODUCTION / BLOCKED
```

---

## COMPLETION CRITERIA FOR PHASE 8

Phase 8 is COMPLETE when:

1. ✅ Local clean build succeeds with zero errors
2. ✅ All database connections work locally
3. ✅ SSR server starts and serves correctly
4. ✅ All 6 apps respond with 200 locally
5. ✅ Railway deployment succeeds for all services
6. ✅ All production URLs respond with 200
7. ✅ No errors in Railway logs for 15 minutes
8. ✅ Production smoke test passes all checks
9. ✅ Build & deployment report generated and committed
10. ✅ `QA_BUILD_DEPLOYMENT_REPORT.md` committed to `qa/pre-production-final`

---

## FINAL SIGN-OFF

When Phase 8 is complete, the following statement must be true:

**"Every page in the Fibonacco ecosystem loads without error. Every button works. Every link navigates correctly. Every form submits successfully. Every piece of data displays accurately. No user will encounter a 400 or 500 error. The reader experience is flawless."**

Notify Shine that the QA process is complete and ready for final review.
