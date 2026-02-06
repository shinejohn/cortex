# Railway Start Commands - Why Manual Steps?

## The Issue

Railway CLI **does not have a command** to set start commands directly. Railway reads start commands from:

1. **railway.json files** in the repository (committed to git)
2. **Railway Dashboard** settings (UI only)
3. **Railway API** (if you have API access)

## What I've Done

✅ **Set `RAILWAY_START_COMMAND` environment variable** for all backend services
- This may or may not work - Railway might not recognize this variable
- It's set, but Railway may ignore it

✅ **Created railway.json files** in repo root:
- `railway-inertia-ssr.json`
- `railway-horizon.json`
- `railway-scheduler.json`

## Why Manual Steps Were Mentioned

Railway CLI doesn't support:
- `railway service update --start-command "..."` ❌
- `railway deploy --start-command "..."` ❌
- Any command to set start commands ❌

Railway only supports:
- Reading `railway.json` from repo ✅
- Setting via Dashboard UI ✅
- Setting via Railway API (if available) ✅

## Solution Options

### Option 1: Railway Dashboard (Fastest)
Set start commands in Dashboard → Service → Settings → Deploy → Start Command

### Option 2: railway.json Files (Best for version control)
1. Commit the railway.json files I created
2. Railway will read them on next deploy
3. But Railway reads from repo root - may need service-specific setup

### Option 3: Railway API (If available)
Use Railway's GraphQL/REST API to update service deployment settings

## Current Status

✅ `RAILWAY_START_COMMAND` set for all 3 backend services
✅ `railway.json` files created
⏳ Need to verify if Railway recognizes `RAILWAY_START_COMMAND` or if Dashboard/API is required
