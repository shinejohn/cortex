# Railway Setup Status

## ✅ Completed Automatically

1. **Scripts Created and Made Executable**
   - ✅ `railway-setup.sh` - Main setup script (executable)
   - ✅ `railway-verify.sh` - Verification script (executable)
   - ✅ `railway-setup-checklist.md` - Checklist updated

2. **Scripts Updated**
   - ✅ Added GoLocalVoices service configuration
   - ✅ Added AlphaSite service configuration
   - ✅ Updated verification script to include new services

3. **Railway Services Created**
   - ✅ GoLocalVoices service created (ID: `7b855d10-a227-49f4-b135-a241dbec4b8e`)
   - ✅ AlphaSite service created (ID: `cf980b14-f523-4bfd-ac91-c4ff2d6906d7`)

4. **Configuration Files Created**
   - ✅ `railway.json` - Railway deployment configuration
   - ✅ `RAILWAY_SETUP.md` - Comprehensive setup guide

## ⚠️ Manual Steps Required

### 1. Railway CLI Authentication
```bash
railway login
```
**Status**: Not authenticated - needs manual login

### 2. Run Setup Script
After authentication, run:
```bash
cd scripts/railway
./railway-setup.sh
```

This will:
- Link to the `supportive-rebirth` project
- Set environment variables for all services
- Generate Railway config files
- Provide manual setup instructions

### 3. Database Setup (Railway Dashboard)

#### Postgres
- [ ] Go to: Dashboard → Postgres → Settings → Source
- [ ] Set Image: `postgres:16-alpine` (or `postgis/postgis:17-3.5` for PostGIS)
- [ ] Go to: Settings → Volumes
- [ ] Add Volume: Mount Path `/var/lib/postgresql/data`, Size: 1GB
- [ ] Deploy service

#### Valkey (Redis)
- [ ] Go to: Dashboard → Valkey → Settings → Source
- [ ] Set Image: `valkey/valkey:7-alpine` (or `redis:7-alpine`)
- [ ] Go to: Settings → Volumes
- [ ] Add Volume: Mount Path `/data`, Size: 512MB
- [ ] Deploy service

### 4. Connect GitHub Repositories

For each service (GoEventCity, Day News, Downtown Guide, GoLocalVoices, AlphaSite, Horizon, Scheduler, Inertia SSR):

- [ ] Dashboard → [Service] → Settings → Source
- [ ] Click "Connect GitHub"
- [ ] Select repo: `shinejohn/Community-Platform`
- [ ] Select branch: `development`
- [ ] Configure Watch Paths (see checklist)
- [ ] Deploy service

### 5. Environment Variables

The setup script will set most variables automatically. Verify these are set:

**For GoLocalVoices:**
- `LOCAL_VOICES_DOMAIN=golocalvoices.com`
- `APP_URL=https://golocalvoices.com`
- `DATABASE_URL` (from Postgres service)
- `REDIS_URL` (from Valkey service)

**For AlphaSite:**
- `ALPHASITE_DOMAIN=alphsite.ai`
- `APP_URL=https://alphsite.ai`
- `DATABASE_URL` (from Postgres service)
- `REDIS_URL` (from Valkey service)

### 6. Custom Domains

- [ ] Configure `golocalvoices.com` for GoLocalVoices service
- [ ] Configure `alphsite.ai` for AlphaSite service
- [ ] Update DNS records as instructed by Railway

## 📋 Next Steps

1. **Authenticate Railway CLI:**
   ```bash
   railway login
   ```

2. **Run Setup Script:**
   ```bash
   cd scripts/railway
   ./railway-setup.sh
   ```

3. **Follow Manual Steps:**
   - Complete database setup in Railway dashboard
   - Connect GitHub repositories
   - Configure custom domains

4. **Verify Setup:**
   ```bash
   cd scripts/railway
   ./railway-verify.sh
   ```

5. **Run Migrations:**
   ```bash
   railway run php artisan migrate --service GoEventCity
   railway run php artisan migrate --service Day\ News
   railway run php artisan migrate --service Downtown\ Guide
   railway run php artisan migrate --service GoLocalVoices
   railway run php artisan migrate --service AlphaSite
   ```

## 📁 File Locations

- Setup Script: `scripts/railway/railway-setup.sh`
- Verification Script: `scripts/railway/railway-verify.sh`
- Checklist: `scripts/railway/railway-setup-checklist.md`
- Setup Guide: `RAILWAY_SETUP.md` (project root)
- Railway Config: `railway.json` (project root)

## 🔍 Troubleshooting

### Railway CLI Not Authenticated
```bash
railway login
# Follow browser authentication flow
```

### Service Not Found
- Verify service names match exactly (case-sensitive)
- Check that services were created in Railway dashboard

### Environment Variables Not Set
- Run the setup script after authentication
- Or set manually in Railway dashboard → Service → Variables

### Build Failures
- Check that GitHub repo is connected
- Verify branch exists (`development`)
- Check build logs in Railway dashboard
