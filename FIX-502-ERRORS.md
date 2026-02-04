# 502 Error Fix Guide - Railway Shine Dev Environment

## Current Status (Feb 4, 2026 - 12:01 PM)

**Services with 502 Errors:**
- Downtown Guide (DTG)
- GoEventCity (GEC)  
- Day News (DN)
- Alphasite
- Go Local Voices (building)

## Root Cause

The shared variables in Railway were missing the actual database connection values. Services are referencing `${{shared.DB_HOST}}`, `${{shared.DB_USERNAME}}`, and `${{shared.DB_PASSWORD}}` but these shared variables were empty.

## Fix Required

### Step 1: Verify Shared Variables Have Database Credentials

Go to Railway Dashboard → Shine Dev Environment → Settings → Shared Variables

**Check that these variables have VALUES (not empty):**

```
DB_HOST=postgres.railway.internal
DB_USERNAME=postgres
DB_PASSWORD=kXOyoJTnDLmQAyTsTFwemXOabfQxylXn
DB_PORT=5432
DB_DATABASE=railway
DB_CONNECTION=pgsql
REDIS_HOST=Valkey.railway.internal
REDIS_PORT=6379
SESSION_DRIVER=redis
```

**If they are empty, use the file:** `CORRECTED-SHARED-VARIABLES.txt` and paste it into the Raw Editor.

### Step 2: Verify Service Variables Reference Shared Correctly

Each service (GoEventCity, Day News, Downtown Guide, Alphasite, Go Local Voices) should have:

```
DB_HOST=${{shared.DB_HOST}}
DB_USERNAME=${{shared.DB_USERNAME}}
DB_PASSWORD=${{shared.DB_PASSWORD}}
```

**Use these files for each service:**
- `GOEVENTCITY-SHINE-DEV.txt` → GoEventCity
- `DAYNEWS-VARIABLES.txt` → Day News
- `DOWNTOWNGUIDE-VARIABLES.txt` → Downtown Guide
- `ALPHASITE-VARIABLES.txt` → Alphasite
- `GOLOCALVOICES-VARIABLES.txt` → Go Local Voices

### Step 3: Redeploy All Services

After updating variables, redeploy all services:

```bash
railway redeploy --service "GoEventCity" --yes
railway redeploy --service "Day News" --yes
railway redeploy --service "Downtown Guide" --yes
railway redeploy --service "Alphasite" --yes
railway redeploy --service "Go Local Voices" --yes
```

Or use the script: `./redeploy-all-services.sh`

### Step 4: Monitor Deployment

Watch the Railway dashboard for:
- ✅ All services showing "Online" status
- ✅ No crash loops
- ✅ Database connection lines visible in the service graph

### Step 5: Test URLs

Once all services are online, test:
- https://dev.goeventcity.com
- https://dev.day.news
- https://dev.downtownsguide.com
- https://dev.alphasite.ai
- https://dev.golocalvoices.com

## Expected Outcome

All 5 multisite apps should:
1. Build successfully
2. Start without errors
3. Connect to Postgres Publishing database
4. Connect to Valkey (Redis)
5. Respond with 200 OK (not 502)

## Troubleshooting

If services still show 502 after redeployment:

1. Check service logs in Railway dashboard
2. Verify database variables are not empty in shared
3. Verify services are referencing `${{shared.VARIABLE}}` syntax
4. Check that Postgres Publishing and Valkey are online

## Files Created

All configuration files are in: `/Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/`

- `CORRECTED-SHARED-VARIABLES.txt` - Complete shared variables with DB credentials
- `GOEVENTCITY-SHINE-DEV.txt` - GoEventCity service variables
- `DAYNEWS-VARIABLES.txt` - Day News service variables
- `DOWNTOWNGUIDE-VARIABLES.txt` - Downtown Guide service variables
- `ALPHASITE-VARIABLES.txt` - Alphasite service variables
- `GOLOCALVOICES-VARIABLES.txt` - Go Local Voices service variables
