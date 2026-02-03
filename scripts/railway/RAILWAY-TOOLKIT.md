# Railway Deployment Toolkit
## For Cursor to Run

This toolkit will:
1. Audit current Railway state
2. Fix configurations
3. Trigger builds and deployments
4. Run migrations

---

## Prerequisites

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link
# Select: Dev Publishing Platform
```

---

## Step 1: Run Inventory Audit

Create this file and run it:

```bash
# railway-audit.sh
#!/bin/bash

echo "=== RAILWAY PROJECT AUDIT ==="
echo ""

# Check if linked
echo "Checking Railway link..."
railway status || echo "Not linked - run: railway link"

echo ""
echo "=== SERVICES STATUS ==="
railway status

echo ""
echo "=== ENVIRONMENT VARIABLES CHECK ==="

# List all services
echo "Fetching service list..."
railway service list 2>/dev/null || echo "Run 'railway link' first"
```

---

## Step 2: Fix Remaining Database Issues

### Listmonk DB - Fix PGDATA (Manual in Dashboard)
1. Go to Listmonk DB → Variables
2. Change: `PGDATA=/var/lib/postgresql/data`
3. To: `PGDATA=/var/lib/postgresql/data/pgdata`
4. Redeploy

---

## Step 3: Check Laravel App Build Failures

The Laravel apps are failing to build. Common causes:

### Check Build Logs
```bash
# In Railway Dashboard:
# Click GoEventCity → Deployments → Failed deployment → View Logs
```

### Likely Issues:
1. **Missing Dockerfile or Nixpacks config**
2. **PHP version mismatch**
3. **Missing composer dependencies**
4. **Node/npm build failures**

---

## Step 4: Railway CLI Commands for Cursor

```bash
# Link to project (do this first)
railway link

# Check all services
railway status

# View logs for a specific service
railway logs -s "Postgres Publishing"
railway logs -s "GoEventCity"
railway logs -s "Scheduler"

# Set environment variables
railway variables -s "GoEventCity" --set "APP_ENV=production"

# Trigger redeploy for a service
railway redeploy -s "GoEventCity"
railway redeploy -s "Day News"
railway redeploy -s "Downtown Guide"

# Run migrations (after apps are deployed)
railway run -s "GoEventCity" -- php artisan migrate --force

# Run any command in a service context
railway run -s "GoEventCity" -- php artisan config:cache
railway run -s "GoEventCity" -- php artisan route:cache
```

---

## Step 5: Complete Configuration Script

```bash
#!/bin/bash
# railway-configure.sh

set -e

echo "=== RAILWAY CONFIGURATION SCRIPT ==="

# Ensure we're linked
railway link

echo ""
echo "=== Step 1: Redeploy Databases ==="

echo "Redeploying Listmonk DB..."
railway redeploy -s "Listmonk DB" || echo "Listmonk DB redeploy failed"

echo "Waiting 30 seconds for databases..."
sleep 30

echo ""
echo "=== Step 2: Redeploy Listmonk ==="
railway redeploy -s "Listmonk" || echo "Listmonk redeploy failed"

echo ""
echo "=== Step 3: Redeploy Laravel Backend Services ==="

railway redeploy -s "Scheduler" || echo "Scheduler redeploy failed"
railway redeploy -s "Horizon" || echo "Horizon redeploy failed"  
railway redeploy -s "Inertia SSR" || echo "Inertia SSR redeploy failed"

echo ""
echo "=== Step 4: Redeploy Platform Apps ==="

railway redeploy -s "GoEventCity" || echo "GoEventCity redeploy failed"
railway redeploy -s "Day News" || echo "Day News redeploy failed"
railway redeploy -s "Downtown Guide" || echo "Downtown Guide redeploy failed"
railway redeploy -s "Go Local Voices" || echo "Go Local Voices redeploy failed"
railway redeploy -s "Alphasite" || echo "Alphasite redeploy failed"

echo ""
echo "=== Step 5: Wait for builds ==="
echo "Waiting 2 minutes for builds to complete..."
sleep 120

echo ""
echo "=== Step 6: Run Migrations ==="
railway run -s "GoEventCity" -- php artisan migrate --force || echo "Migration failed"

echo ""
echo "=== Step 7: Cache Configuration ==="
railway run -s "GoEventCity" -- php artisan config:cache || echo "Config cache failed"
railway run -s "GoEventCity" -- php artisan route:cache || echo "Route cache failed"

echo ""
echo "=== COMPLETE ==="
railway status
```

---

## Step 6: Check Build Logs for Failures

If builds fail, get the error:

```bash
# View build logs
railway logs -s "GoEventCity" --build

# View runtime logs  
railway logs -s "GoEventCity"
```

Common Laravel build issues:
- Missing `composer.json`
- Missing `package.json`
- PHP version incompatibility
- Memory limits

---

## Step 7: Database Connection Test

```bash
# Test database connection from GoEventCity
railway run -s "GoEventCity" -- php artisan db:show

# Test Redis connection
railway run -s "GoEventCity" -- php artisan tinker --execute="dump(Redis::ping());"

# List tables
railway run -s "GoEventCity" -- php artisan db:table
```

---

## Step 8: Manual Migration via psql

If you need direct database access:

```bash
# Get connection details from Railway Variables:
# RAILWAY_TCP_PROXY_DOMAIN and RAILWAY_TCP_PROXY_PORT

# Connect via psql
psql "postgresql://postgres:kXOyoJTnDLmQAyTsTFwemXOabfQxylXn@[TCP_HOST]:[TCP_PORT]/railway"

# Or use DATABASE_PUBLIC_URL from variables
```

---

## Quick Reference: Service Names

Use these exact names with `railway -s`:

| Service | Name for CLI |
|---------|--------------|
| Main Postgres | `Postgres Publishing` |
| Valkey | `Valkey` |
| Listmonk DB | `Listmonk DB` |
| Listmonk | `Listmonk` |
| Storage | `laravel-storage` |
| Scheduler | `Scheduler` |
| Horizon | `Horizon` |
| Inertia SSR | `Inertia SSR` |
| GoEventCity | `GoEventCity` |
| Day News | `Day News` |
| Downtown Guide | `Downtown Guide` |
| Go Local Voices | `Go Local Voices` |
| Alphasite | `Alphasite` |

---

## Immediate Next Steps for Cursor

1. **Run in terminal:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   # Select: Dev Publishing Platform
   ```

2. **Check what's failing:**
   ```bash
   railway logs -s "GoEventCity" --build
   ```

3. **Share the build error** - that will tell us exactly what's wrong with the Laravel builds

4. **After builds work, run migrations:**
   ```bash
   railway run -s "GoEventCity" -- php artisan migrate --force
   ```
