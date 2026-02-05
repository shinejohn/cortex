# SSR Fixes Applied - Railway Configuration

**Date:** February 2025  
**Status:** SSR Enabled and Configured

---

## ✅ Changes Made

### 1. Re-enabled SSR Build ✅

**Dockerfile (line 50-51):**
- Changed back to: `RUN bun run build:ssr`
- SSR build is now required (build will fail if SSR build fails)
- This ensures SSR bundle is always built

### 2. Created SSR Supervisor Config ✅

**File:** `docker/standalone/etc/supervisor/conf.d/inertia-ssr.conf`
- Runs `php artisan inertia:start-ssr`
- Auto-starts and auto-restarts
- Logs to `storage/logs/inertia-ssr.log`
- Runs as `www-data` user

### 3. Added SSR Config to Dockerfile ✅

**Dockerfile (line 174):**
- Added: `COPY docker/standalone/etc/supervisor/conf.d/inertia-ssr.conf /etc/supervisor/conf.d/inertia-ssr.conf`
- SSR supervisor config is now included in the image

### 4. Enabled SSR in Railway ✅

**Environment Variables Set:**
- `INERTIA_SSR_ENABLED=true` for all services
- `INERTIA_SSR_URL=http://127.0.0.1:13714` for all services

**Services Updated:**
- ✅ Day News
- ✅ GoEventCity
- ✅ Go Local Voices
- ✅ Alphasite

---

## 🏗️ Architecture

### Railway (Single Container)
```
┌─────────────────────────────────────┐
│  Railway Container                  │
│  ┌───────────────────────────────┐  │
│  │  PHP-FPM + Nginx              │  │
│  │  (Laravel Application)        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Supervisor                   │  │
│  │  ├─ Horizon (Queue Worker)    │  │
│  │  └─ Inertia SSR Server        │  │
│  │     (http://127.0.0.1:13714)  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### How SSR Works

1. **Build Time:**
   - `bun run build:ssr` creates SSR bundle in `bootstrap/ssr/`
   - Bundle includes all React components for server-side rendering

2. **Runtime:**
   - Supervisor starts SSR server: `php artisan inertia:start-ssr`
   - SSR server listens on `http://127.0.0.1:13714`
   - Laravel connects to SSR server for initial page renders
   - Subsequent navigation uses client-side rendering

3. **Request Flow:**
   ```
   User Request → Nginx → PHP-FPM → Laravel
                                      ↓
                              Check if SSR enabled
                                      ↓
                              Connect to SSR Server (127.0.0.1:13714)
                                      ↓
                              SSR Server renders React component
                                      ↓
                              Return HTML to Laravel
                                      ↓
                              Return HTML to User
   ```

---

## 📋 Configuration Summary

### Environment Variables

**All Services:**
```bash
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://127.0.0.1:13714
```

### Supervisor Processes

**Running in Container:**
1. **Horizon** - Queue worker (`php artisan horizon`)
2. **Inertia SSR** - SSR server (`php artisan inertia:start-ssr`)

Both managed by Supervisor, auto-restart on failure.

---

## 🔍 Verification

### Check SSR Status

```bash
# In Railway container
supervisorctl status

# Should show:
# horizon                          RUNNING   pid 123, uptime 0:05:23
# inertia-ssr                      RUNNING   pid 124, uptime 0:05:23
```

### Check SSR Logs

```bash
tail -f storage/logs/inertia-ssr.log
```

### Test SSR

1. Visit any page
2. View page source
3. Should see server-rendered HTML (not just `<div id="app"></div>`)
4. Check Network tab - initial request should return full HTML

---

## 🐛 Troubleshooting

### SSR Server Not Starting

1. **Check Supervisor:**
   ```bash
   supervisorctl status inertia-ssr
   ```

2. **Check Logs:**
   ```bash
   tail -f storage/logs/inertia-ssr.log
   ```

3. **Verify SSR Bundle:**
   ```bash
   ls -la bootstrap/ssr/
   ```

4. **Restart SSR:**
   ```bash
   supervisorctl restart inertia-ssr
   ```

### SSR Build Failing

1. **Check Build Logs:**
   - Look for TypeScript errors
   - Check for missing dependencies
   - Verify `resources/js/ssr.tsx` exists

2. **Test Build Locally:**
   ```bash
   bun run build:ssr
   ```

### SSR Not Working

1. **Verify Environment Variables:**
   ```bash
   echo $INERTIA_SSR_ENABLED
   echo $INERTIA_SSR_URL
   ```

2. **Check Config:**
   ```bash
   php artisan tinker
   >>> config('inertia.ssr.enabled')
   >>> config('inertia.ssr.url')
   ```

3. **Test SSR Connection:**
   ```bash
   curl http://127.0.0.1:13714
   ```

---

## ✅ Expected Results

After deployment:

- ✅ SSR bundle is built during Docker build
- ✅ SSR server starts automatically via Supervisor
- ✅ SSR server restarts if it crashes
- ✅ Laravel can connect to SSR server
- ✅ Pages are server-side rendered
- ✅ SEO benefits from SSR
- ✅ Initial page load shows server-rendered HTML

---

## 📝 Next Steps

1. **Commit Changes:**
   ```bash
   git add docker/standalone/Dockerfile
   git add docker/standalone/etc/supervisor/conf.d/inertia-ssr.conf
   git commit -m "feat: enable SSR with supervisor for Railway deployment"
   git push
   ```

2. **Monitor Railway:**
   - Watch build logs for SSR build success
   - Check deployment logs for SSR server startup
   - Verify services stay online

3. **Test SSR:**
   - Visit each service
   - Check page source for server-rendered HTML
   - Verify SSR is working correctly

---

**SSR is now fully configured and enabled for Railway deployment!**
