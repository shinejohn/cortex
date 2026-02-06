# Railway Database Connection Fix Guide

## Problem

All services are crashing with database connectivity errors:
```
⚠️  [Startup] Database not ready (attempt 1/10), retrying in 5s...
❌ [Startup] Failed to connect to database after 10 attempts
```

**Root Cause**: Railway's internal hostnames can change after redeployments. Hardcoded values like `postgres.railway.internal` become stale.

## Solution Options

### Option 1: Use Railway Service Reference Variables (Recommended)

Railway supports service reference variables that automatically resolve to correct values:
- Format: `${{ServiceName.VARIABLE_NAME}}`
- Example: `${{Postgres Publishing.DATABASE_URL}}`

**Run the fix script:**
```bash
./scripts/railway-fix-database-connections.sh
```

This script sets variables using Railway service references, so Railway automatically resolves them to the correct values even after redeployments.

### Option 2: Fetch and Set Actual Values (Fallback)

If service references don't work, fetch actual values from Railway and set them:

**Run the fallback script:**
```bash
./scripts/railway-fix-database-fallback.sh
```

This script:
1. Fetches current connection info from Railway services
2. Sets those values on all dependent services

### Option 3: Manual Fix via Railway Dashboard

1. **Get Database Connection Info:**
   - Go to Railway Dashboard
   - Click on "Postgres Publishing" service
   - Click "Connect" tab
   - Copy the **Internal Database URL** (not the public one)
   - Format: `postgresql://user:password@hostname:5432/database`

2. **Update Each Service:**
   - Go to each service (Day News, GoEventCity, etc.)
   - Go to Variables tab
   - Set `DATABASE_URL` to the Internal Database URL from step 1
   - Set `DB_HOST` to the hostname from the URL (e.g., `postgres-publishing.railway.internal`)
   - Set `DB_PORT` to `5432`
   - Set `DB_DATABASE` to the database name
   - Set `DB_USERNAME` to the username
   - Set `DB_PASSWORD` to the password

3. **Repeat for Valkey (Redis):**
   - Go to "Valkey" service
   - Get the internal hostname
   - Set `REDIS_HOST` on all services

## Diagnostic Tools

### Check Current Configuration

Run the diagnostic script to see current variable values:
```bash
./scripts/railway-diagnose-connections.sh
```

This shows:
- Postgres Publishing connection variables
- Valkey connection variables
- All frontend app database configurations
- All backend service database configurations

## After Fixing Variables

### Redeploy Services

After updating environment variables, you need to redeploy services:

**Option A: Via Railway Dashboard**
1. Go to each service
2. Click "Deploy" → "Redeploy"

**Option B: Via Railway CLI**
```bash
railway up --service "Day News"
railway up --service "GoEventCity"
# ... repeat for all services
```

**Option C: Full Monorepo Redeploy**
```bash
railway up
```

**Note**: A full monorepo build/deploy will redeploy all services, but it won't fix the problem if environment variables are wrong - they'll just crash again with the same error. **Fix the env vars first, then redeploy.**

## Why This Happens

Railway's internal networking uses dynamic hostnames. When you:
- Redeploy a database service
- Restructure your Railway project
- Move services between projects

The internal hostnames can change. Hardcoded values break, but Railway service references (`${{ServiceName.VAR}}`) automatically resolve to the correct values.

## Best Practices

1. **Use Railway Service References** instead of hardcoded hostnames
2. **Never hardcode passwords** - use Railway's variable system
3. **Use Internal URLs** for service-to-service communication (not public URLs)
4. **Test connectivity** after redeployments

## Troubleshooting

### Services Still Can't Connect After Fix

1. **Verify Database is Online:**
   - Check Railway Dashboard - Postgres Publishing should show "Online"

2. **Check Variable Values:**
   ```bash
   railway variables --service "Day News" --kv | grep DATABASE_URL
   ```

3. **Verify Internal Hostname:**
   - The hostname should end with `.railway.internal`
   - Public URLs won't work for service-to-service communication

4. **Check Service Dependencies:**
   - In Railway Dashboard, verify services are linked to Postgres Publishing
   - Services need to be in the same Railway project to use internal networking

5. **Review Startup Logs:**
   - Check logs for the exact error message
   - Verify the hostname being used matches Railway's internal hostname

## Related Scripts

- `railway-fix-database-connections.sh` - Uses Railway service references (best)
- `railway-fix-database-fallback.sh` - Fetches and sets actual values
- `railway-diagnose-connections.sh` - Shows current configuration
- `railway-complete-fix-all.sh` - Old script with hardcoded values (deprecated)
