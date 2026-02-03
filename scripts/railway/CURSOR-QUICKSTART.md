# CURSOR QUICK START - Railway Deployment

## Step 1: Install & Login (Run in Terminal)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login (opens browser)
railway login

# Link to project
railway link
# Select: Dev Publishing Platform
```

---

## Step 2: Check Current Status

```bash
railway status
```

---

## Step 3: Get Build Logs for Failed Apps

The Laravel apps show "Build failed". Get the error:

```bash
# Check GoEventCity build error
railway logs -s "GoEventCity" --build

# Check other apps
railway logs -s "Day News" --build
railway logs -s "Scheduler" --build
```

**Share the build error output** - that tells us exactly what's wrong.

---

## Step 4: Fix Listmonk DB (Manual)

In Railway Dashboard:
1. Go to **Listmonk DB** → **Variables**
2. Change `PGDATA` from `/var/lib/postgresql/data` to `/var/lib/postgresql/data/pgdata`
3. Click **Redeploy**

---

## Step 5: After Builds Work - Run Migrations

```bash
# Run database migrations
railway run -s "GoEventCity" -- php artisan migrate --force

# Cache config
railway run -s "GoEventCity" -- php artisan config:cache
railway run -s "GoEventCity" -- php artisan route:cache
```

---

## Step 6: Verify Everything

```bash
# Check database connection
railway run -s "GoEventCity" -- php artisan db:show

# Check Redis
railway run -s "GoEventCity" -- php artisan tinker --execute="echo Redis::ping();"

# View live logs
railway logs -s "GoEventCity" -f
```

---

## Common Build Errors & Fixes

| Error | Fix |
|-------|-----|
| `npm ERR! ENOENT` | Missing package.json or node_modules |
| `composer install failed` | Check PHP version, missing extensions |
| `memory exhausted` | Increase build memory in Railway settings |
| `connection refused` | Database not ready, redeploy after DB is online |

---

## Useful Commands

```bash
# Redeploy a service
railway redeploy -s "GoEventCity"

# Set a variable
railway variables -s "GoEventCity" --set "APP_DEBUG=true"

# Run any artisan command
railway run -s "GoEventCity" -- php artisan [command]

# Tail logs live
railway logs -s "GoEventCity" -f
```
