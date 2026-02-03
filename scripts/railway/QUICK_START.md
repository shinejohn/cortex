# Railway Setup - Quick Start Guide

## ✅ What's Been Done

1. **Scripts Created and Configured**
   - ✅ `railway-setup.sh` - Made executable, updated with GoLocalVoices & AlphaSite
   - ✅ `railway-verify.sh` - Made executable, updated with new services
   - ✅ `railway-setup-checklist.md` - Updated with new services

2. **Railway Services Created**
   - ✅ GoLocalVoices (ID: `7b855d10-a227-49f4-b135-a241dbec4b8e`)
   - ✅ AlphaSite (ID: `cf980b14-f523-4bfd-ac91-c4ff2d6906d7`)

3. **Documentation Created**
   - ✅ `SETUP_STATUS.md` - Current status and next steps
   - ✅ `README.md` - Scripts documentation
   - ✅ `RAILWAY_SETUP.md` (project root) - Comprehensive guide

## 🚀 Next Steps

### Step 1: Authenticate Railway CLI
```bash
railway login
```
This will open a browser for authentication.

### Step 2: Run Setup Script
```bash
cd scripts/railway
./railway-setup.sh
```

The script will:
- Link to the `supportive-rebirth` project
- Set environment variables for all services
- Generate Railway configuration files
- Provide instructions for manual steps

### Step 3: Complete Manual Configuration

#### Database Setup (Railway Dashboard)
1. **Postgres**
   - Settings → Source → Set Image: `postgres:16-alpine`
   - Settings → Volumes → Add volume at `/var/lib/postgresql/data`

2. **Valkey (Redis)**
   - Settings → Source → Set Image: `valkey/valkey:7-alpine`
   - Settings → Volumes → Add volume at `/data`

#### Connect GitHub Repositories
For each service (GoEventCity, Day News, Downtown Guide, GoLocalVoices, AlphaSite, Horizon, Scheduler, Inertia SSR):

1. Dashboard → [Service] → Settings → Source
2. Click "Connect GitHub"
3. Select: `shinejohn/Community-Platform`
4. Branch: `development`
5. Configure Watch Paths (see checklist)
6. Deploy

### Step 4: Verify Setup
```bash
cd scripts/railway
./railway-verify.sh
```

### Step 5: Run Migrations
```bash
railway run php artisan migrate --service GoEventCity
railway run php artisan migrate --service Day\ News
railway run php artisan migrate --service Downtown\ Guide
railway run php artisan migrate --service GoLocalVoices
railway run php artisan migrate --service AlphaSite
```

## 📋 Checklist Reference

See `railway-setup-checklist.md` for the complete checklist with all steps.

## 📁 File Locations

- **Setup Script**: `scripts/railway/railway-setup.sh`
- **Verification**: `scripts/railway/railway-verify.sh`
- **Checklist**: `scripts/railway/railway-setup-checklist.md`
- **Status**: `scripts/railway/SETUP_STATUS.md`
- **Guide**: `RAILWAY_SETUP.md` (project root)

## ⚠️ Important Notes

1. **Railway CLI Authentication Required**
   - Must run `railway login` before setup script
   - Opens browser for OAuth authentication

2. **Manual Steps Required**
   - Database Docker images and volumes (Railway dashboard)
   - GitHub repository connections (Railway dashboard)
   - Custom domain configuration (Railway dashboard)

3. **Watch Paths**
   - Configured in Railway dashboard for each service
   - Controls which file changes trigger redeployments
   - See checklist for exact paths per service

4. **Environment Variables**
   - Most are set automatically by the setup script
   - Verify `DATABASE_URL` and `REDIS_URL` use internal Railway format
   - Domain variables are set per service

## 🆘 Troubleshooting

### "Not logged in to Railway"
```bash
railway login
```

### "Service not found"
- Check service names match exactly (case-sensitive)
- Verify services exist in Railway dashboard

### "Build failed"
- Check GitHub repo is connected
- Verify `development` branch exists
- Review build logs in Railway dashboard

### "Database connection failed"
- Verify `DATABASE_URL` uses format: `postgresql://postgres:PASSWORD@Postgres.railway.internal:5432/railway`
- Check Postgres service is running

### "Redis connection failed"
- Verify `REDIS_URL` uses format: `redis://Valkey.railway.internal:6379`
- Check Valkey service is running
