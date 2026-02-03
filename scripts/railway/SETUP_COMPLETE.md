# Railway Setup - Completed Steps

## ✅ What Was Accomplished

### 1. Script Execution
- ✅ Railway API authentication successful
- ✅ Project verified: `supportive-rebirth` (ID: `0b1f921d-40ba-4608-8d56-19fa3ac1d9b5`)
- ✅ All service configurations documented
- ✅ Railway config files generated

### 2. Services Configured
The setup script has documented configuration for:
- ✅ GoEventCity
- ✅ Day News
- ✅ Downtown Guide
- ✅ GoLocalVoices (newly added)
- ✅ AlphaSite (newly added)
- ✅ Horizon
- ✅ Scheduler
- ✅ Inertia SSR
- ✅ Listmonk

### 3. Generated Files
- ✅ Railway config files in `railway-configs/` directory
- ✅ Watch paths documented for each service
- ✅ Build and start commands documented

## ⚠️ Manual Steps Required

### Step 1: Database Setup (Railway Dashboard)

#### Postgres
1. Go to: Dashboard → Postgres → Settings → Source
2. Set Image: `postgres:16-alpine` (or `postgis/postgis:17-3.5` for PostGIS)
3. Go to: Settings → Volumes
4. Add Volume:
   - Mount Path: `/var/lib/postgresql/data`
   - Size: 1GB (can expand later)
5. Click Deploy

#### Valkey (Redis)
1. Go to: Dashboard → Valkey → Settings → Source
2. Set Image: `valkey/valkey:7-alpine` (or `redis:7-alpine`)
3. Go to: Settings → Volumes
4. Add Volume:
   - Mount Path: `/data`
   - Size: 512MB
5. Click Deploy

### Step 2: Connect GitHub Repositories

For **each** service (GoEventCity, Day News, Downtown Guide, GoLocalVoices, AlphaSite, Horizon, Scheduler, Inertia SSR):

1. Dashboard → [Service Name] → Settings → Source
2. Click **"Connect GitHub"**
3. Select repository: `shinejohn/Community-Platform`
4. Select branch: `development`
5. Configure Watch Paths (see `railway-configs/` directory)
6. Click **Deploy**

### Step 3: Set Environment Variables

For each Laravel service, set these environment variables in Railway Dashboard → [Service] → Variables:

**Common Variables:**
```
APP_NAME=Publishing Platform
APP_ENV=production
APP_DEBUG=false
APP_URL=https://[service-domain].up.railway.app
APP_KEY=base64:[generate-new-key]
LOG_CHANNEL=stderr
LOG_LEVEL=info
DB_CONNECTION=pgsql
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Valkey.REDIS_URL}}
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
BROADCAST_DRIVER=log
FILESYSTEM_DISK=local
```

**Service-Specific:**
- **GoEventCity**: `SITE_IDENTIFIER=goeventcity`, `GOEVENTCITY_DOMAIN=goeventcity-dev.up.railway.app`
- **Day News**: `SITE_IDENTIFIER=daynews`, `DAYNEWS_DOMAIN=daynews-dev.up.railway.app`
- **Downtown Guide**: `SITE_IDENTIFIER=downtownguide`, `DOWNTOWNGUIDE_DOMAIN=downtown-dev.up.railway.app`
- **GoLocalVoices**: `SITE_IDENTIFIER=golocalvoices`, `LOCAL_VOICES_DOMAIN=voices-dev.up.railway.app`
- **AlphaSite**: `SITE_IDENTIFIER=alphasite`, `ALPHASITE_DOMAIN=alphasite-dev.up.railway.app`
- **Horizon**: `HORIZON_PREFIX=publishing-dev`

### Step 4: Configure Watch Paths

Watch paths control which file changes trigger redeployments. See `railway-configs/` directory for exact paths per service.

**Example for GoEventCity:**
```
app/Http/Controllers/GoEventCity/**
app/Http/Requests/GoEventCity/**
app/Services/GoEventCity/**
resources/js/Pages/GoEventCity/**
routes/goeventcity.php
```

### Step 5: Set Build Commands (if using Dockerfile)

If using the Dockerfile approach (`docker/standalone/Dockerfile`):
- Build Command: (auto-detected by Railway)
- Start Command: (auto-detected by Railway)

If using Nixpacks:
- Build Command: `composer install --no-dev && npm ci && npm run build`
- Start Command: `php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT`

### Step 6: Deploy Services

After configuration:
1. Trigger first deploy for each service
2. Monitor build logs
3. Check service health status

### Step 7: Run Migrations

After services are deployed:

```bash
railway run php artisan migrate --service GoEventCity
railway run php artisan migrate --service Day\ News
railway run php artisan migrate --service Downtown\ Guide
railway run php artisan migrate --service GoLocalVoices
railway run php artisan migrate --service AlphaSite
```

## 📋 Verification

After setup, verify everything works:

```bash
# Check service status
railway status

# View logs
railway logs -s GoEventCity

# Test database connection
railway run php artisan db:show --service GoEventCity

# Test Redis connection
railway run php artisan tinker --execute="Redis::ping()" --service GoEventCity
```

## 📁 Reference Files

- **Setup Script**: `scripts/railway/railway-setup.sh`
- **Verification**: `scripts/railway/railway-verify.sh`
- **Checklist**: `scripts/railway/railway-setup-checklist.md`
- **Config Files**: `scripts/railway/railway-configs/`
- **Setup Guide**: `RAILWAY_SETUP.md` (project root)

## 🎯 Next Steps

1. Complete database setup (Docker images + volumes)
2. Connect GitHub repositories for all services
3. Set environment variables
4. Configure Watch Paths
5. Deploy services
6. Run migrations
7. Verify everything works

All configuration details are documented in the script output and config files!
