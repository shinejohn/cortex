# Getting Everything Running on Railway

## Architecture Overview

**Single Codebase, Multiple Services:**
- All Laravel app services (GoEventCity, Day News, Downtown Guide, GoLocalVoices, AlphaSite) use the **same Dockerfile** (`docker/standalone/Dockerfile`)
- Each service builds from the **same GitHub repo** but with different:
  - **Start commands** (what runs when the container starts)
  - **Watch paths** (which file changes trigger redeployments)
  - **Environment variables** (service-specific config)

## Current Status

Based on the dashboard:
- ✅ **Postgres Publishing**: Online
- ✅ **Valkey**: Online  
- ❌ **All Laravel services**: Build failed (fixed with debug.log and PHP deprecation fixes)
- ❌ **Listmonk services**: Crashed

## How Railway Builds Work

1. **Railway builds each service separately** from the same GitHub repo
2. **Each service uses the same Dockerfile** but different start commands
3. **Watch paths** ensure only affected services redeploy when code changes
4. **Docker images** are built automatically from your GitHub repo (no manual image needed for Laravel services)

## Fix Steps

### Step 1: Code Fixes (✅ DONE)
- Fixed hardcoded debug.log paths
- Fixed PHP deprecation warning
- These fixes are in the codebase and will apply to all services

### Step 2: Configure Railway Services

Run this script to set up all services:

```bash
export RAILWAY_TOKEN="your-token"
cd scripts/railway-automation
./railway-configure-api.sh "Shine Dev Environment"
```

This sets:
- ✅ Docker images (for database services)
- ✅ Volumes (for persistent data)
- ✅ Build commands (what runs during build)
- ✅ Start commands (what runs when container starts)
- ✅ Watch paths (which files trigger redeploys)

### Step 3: Connect GitHub Repos

**For each Laravel service** (GoEventCity, Day News, Downtown Guide, GoLocalVoices, AlphaSite, Horizon, Scheduler, Inertia SSR):

1. Go to Railway Dashboard → Click the service
2. Settings → Source → Connect GitHub
3. Select: `shinejohn/Community-Platform`
4. Branch: `development`
5. Root Directory: `/` (default)

**For database services** (Postgres, Valkey, Listmonk DB):
- These use Docker images, not GitHub repos
- Already configured via `railway-configure-api.sh`

### Step 4: Set Environment Variables

After GitHub is connected, set environment variables:

```bash
./railway-full-setup-api.sh "Shine Dev Environment"
```

Or set manually in Railway dashboard for each service.

### Step 5: Redeploy Services

After connecting GitHub and setting variables:

1. Railway will automatically trigger a new build
2. Or manually trigger: Dashboard → Service → Deployments → Redeploy

## Service-Specific Configurations

### Laravel App Services (All use same Dockerfile)

**Build Command:**
```bash
composer install --no-dev --optimize-autoloader && npm ci && npm run build
```

**Start Commands:**
- **GoEventCity/Day News/Downtown Guide/GoLocalVoices/AlphaSite:**
  ```bash
  php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan serve --host=0.0.0.0 --port=$PORT
  ```

- **Horizon:**
  ```bash
  php artisan horizon
  ```

- **Scheduler:**
  ```bash
  php artisan schedule:work
  ```

- **Inertia SSR:**
  ```bash
  node bootstrap/ssr/ssr.mjs
  ```

**Watch Paths** (prevents unnecessary redeploys):
- Each service only redeploys when its specific files change
- See `railway-configure-api.sh` for exact paths per service

### Database Services

**Postgres:**
- Image: `postgres:16-alpine`
- Volume: `/var/lib/postgresql/data`

**Valkey (Redis):**
- Image: `valkey/valkey:7-alpine`
- Volume: `/data`

**Listmonk DB:**
- Image: `postgres:16-alpine`
- Volume: `/var/lib/postgresql/data`

**Listmonk:**
- Image: `listmonk/listmonk:latest`
- Needs Listmonk DB connection

## Troubleshooting

### Build Failures

1. **Check build logs** in Railway dashboard
2. **Verify GitHub connection** is active
3. **Check build commands** are set correctly
4. **Verify Dockerfile path** is `docker/standalone/Dockerfile`

### Service Crashes

1. **Check logs** in Railway dashboard
2. **Verify environment variables** are set
3. **Check database connections** (DATABASE_URL, REDIS_URL)
4. **Verify start commands** are correct

### Watch Paths Not Working

1. **Verify watch paths** are set in service settings
2. **Check file changes** match watch path patterns
3. **Verify GitHub webhook** is connected

## Summary

**Yes, Railway builds everything from one script/repo:**
- ✅ All services build from the same GitHub repo
- ✅ All Laravel services use the same Dockerfile
- ✅ Each service has different start commands and watch paths
- ✅ Database services use pre-built Docker images

**The fixes we made:**
- ✅ Fixed build errors (debug.log paths, PHP deprecation)
- ✅ Configured Docker images, volumes, commands, watch paths
- ⏳ Remaining: Connect GitHub repos and set environment variables

After completing steps 3-5, all services should build and deploy successfully!
