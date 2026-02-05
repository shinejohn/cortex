# Database Connection Fix - Password Authentication Failed

## 🔴 Problem

All services are crashing with:
```
SQLSTATE[08006] [7] connection to server at "postgres.railway.internal" (10.246.201.32), port 5432 failed: 
FATAL: password authentication failed for user "postgres"
```

## Root Cause

The `DATABASE_URL` environment variable is incomplete - it's showing as just `postgresql://` without the password, host, database name, etc.

## Solution

You need to set the complete `DATABASE_URL` for each service. The format should be:

```
postgresql://postgres:PASSWORD@postgres-publishing.railway.internal:5432/railway
```

## Steps to Fix

### Option 1: Use Railway Service Reference (Recommended)

If Railway supports service references, use:
```
DATABASE_URL=${{Postgres Publishing.DATABASE_URL}}
```

### Option 2: Set Individual Database Variables

Instead of DATABASE_URL, set these individual variables:

```bash
DB_CONNECTION=pgsql
DB_HOST=postgres-publishing.railway.internal
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=<password-from-postgres-service>
```

### Option 3: Get Full DATABASE_URL from Postgres Publishing

1. Go to Railway Dashboard
2. Click on "Postgres Publishing" service
3. Go to Variables tab
4. Find `DATABASE_URL` - it should show the full connection string
5. Copy that exact value
6. Set it for each app service:
   - Day News
   - GoEventCity
   - Downtown Guide
   - Go Local Voices
   - Alphasite

## Quick Fix Commands

Once you have the correct DATABASE_URL from Postgres Publishing:

```bash
# Set for each service
railway variables --service "Day News" --set "DATABASE_URL=<full-connection-string>"
railway variables --service "GoEventCity" --set "DATABASE_URL=<full-connection-string>"
railway variables --service "Downtown Guide" --set "DATABASE_URL=<full-connection-string>"
railway variables --service "Go Local Voices" --set "DATABASE_URL=<full-connection-string>"
railway variables --service "Alphasite" --set "DATABASE_URL=<full-connection-string>"
```

## Important Notes

- The DATABASE_URL must include the password
- Use the internal Railway hostname: `postgres-publishing.railway.internal`
- All services should use the same Postgres Publishing database
- After setting DATABASE_URL, services will automatically redeploy

## Verification

After setting DATABASE_URL, check logs to ensure:
- ✅ Database connection successful
- ✅ Migrations run successfully
- ✅ No password authentication errors
