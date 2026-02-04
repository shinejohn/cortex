# Railway Shared Variables Migration Guide
**From:** Climactic (90 shared variables)  
**To:** Shine Dev Environment (2 shared variables)

---

## ⚠️ CRITICAL ISSUE IDENTIFIED

The Shine Dev Environment project is missing 88 shared variables that exist in the Climactic project. This explains why services aren't working properly - they're missing critical configuration.

---

## 🔧 SOLUTION: Copy Shared Variables

### Method 1: Railway Dashboard (Recommended - Fastest)

#### Step 1: Export from Climactic
1. Go to Railway Dashboard: https://railway.app
2. Select **"Climactic"** project
3. Click **Settings** (gear icon)
4. Scroll to **"Shared Variables"** section
5. Click **"Copy All"** or manually select all variables
6. Save to a text file or keep in clipboard

#### Step 2: Import to Shine Dev Environment
1. In Railway Dashboard, switch to **"Shine Dev Environment"** project
2. Click **Settings** (gear icon)
3. Scroll to **"Shared Variables"** section
4. Click **"Add Variable"** or **"Import"**
5. Paste all variables from Climactic
6. Click **"Save"**

#### Step 3: Trigger Redeployments
After adding shared variables, redeploy all services:
```bash
railway redeploy --service "GoEventCity" --yes
railway redeploy --service "Alphasite" --yes
railway redeploy --service "Day News" --yes
railway redeploy --service "Downtown Guide" --yes
railway redeploy --service "Go Local Voices" --yes
railway redeploy --service "Horizon" --yes
railway redeploy --service "Scheduler" --yes
railway redeploy --service "Inertia SSR" --yes
```

---

### Method 2: Railway API (Programmatic)

If you have a Railway API token, you can use the API to copy variables:

#### Step 1: Get Railway API Token
1. Go to Railway Dashboard → Account Settings
2. Generate an API token
3. Save it securely

#### Step 2: Use API to Export/Import
```bash
# Set your API token
export RAILWAY_TOKEN="your-api-token-here"

# Get Climactic project ID
CLIMACTIC_PROJECT_ID="your-climactic-project-id"

# Get Shine Dev project ID  
SHINE_DEV_PROJECT_ID="7e7372dd-373a-4e78-a51e-15eab332b67d"

# Export variables from Climactic (using Railway API)
curl -X POST https://backboard.railway.app/graphql \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { project(id: \"'$CLIMACTIC_PROJECT_ID'\") { sharedVariables } }"
  }' > climactic-shared-vars.json

# Import to Shine Dev (requires parsing and setting each variable)
```

---

### Method 3: Manual CLI (Service by Service)

Since Railway CLI doesn't support shared variables directly, you can set common variables on each service:

```bash
#!/bin/bash
# Set common variables on all services

SERVICES=("GoEventCity" "Alphasite" "Day News" "Downtown Guide" "Go Local Voices" "Horizon" "Scheduler" "Inertia SSR")

# Example: Set a common variable on all services
for service in "${SERVICES[@]}"; do
  railway variables --service "$service" --set "VARIABLE_NAME=value"
done
```

---

## 📋 LIKELY MISSING SHARED VARIABLES

Based on typical Laravel multisite setups, you're probably missing:

### Application Variables
- `APP_DEBUG`
- `APP_FAKER_LOCALE`
- `APP_FALLBACK_LOCALE`
- `APP_LOCALE`
- `APP_TIMEZONE`
- `APP_MAINTENANCE_DRIVER`

### Mail Configuration
- `MAIL_MAILER`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM_ADDRESS`
- `MAIL_FROM_NAME`
- `MAIL_SCHEME`

### External Services
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `MAXMIND_LICENSE_KEY`

### Feature Flags
- `MAGICLINK_ENABLED`
- `INERTIA_SSR_ENABLED`

### Logging
- `LOG_CHANNEL`
- `LOG_LEVEL`
- `LOG_STACK`
- `LOG_DEPRECATIONS_CHANNEL`

### Domain Configuration
- `GOEVENTCITY_DOMAIN`
- `DAYNEWS_DOMAIN`
- `DOWNTOWNGUIDE_DOMAIN`
- And many more...

---

## 🎯 RECOMMENDED ACTION

**Use Method 1 (Railway Dashboard)** - It's the fastest and most reliable:

1. Open two browser tabs:
   - Tab 1: Climactic project → Settings → Shared Variables
   - Tab 2: Shine Dev Environment → Settings → Shared Variables

2. Copy all 90 variables from Climactic

3. Paste into Shine Dev Environment

4. Save and trigger redeployments

**This should take about 5-10 minutes and will fix most of the configuration issues.**

---

## ⚠️ IMPORTANT NOTES

1. **Shared variables are inherited by all services** - Once set at project level, all services will have access to them

2. **Service-specific variables override shared variables** - If you've already set APP_KEY on individual services, those will take precedence

3. **Redeployment required** - After adding shared variables, services need to be redeployed to pick up the new configuration

4. **Check for conflicts** - Make sure shared variables don't conflict with service-specific variables you've already set

---

## 🔍 VERIFICATION

After copying shared variables and redeploying:

```bash
# Check that services can see the shared variables
railway variables --service "GoEventCity" --json | jq 'keys | length'
# Should show ~106+ variables (90 shared + 16 service-specific)

# Test the sites
curl -I https://dev.goeventcity.com
curl -I https://dev.alphasite.ai
curl -I https://dev.day.news
curl -I https://dev.downtownsguide.com
curl -I https://dev.golocalvoices.com
```

---

## 📞 NEXT STEPS

1. **Copy shared variables** from Climactic to Shine Dev (using Railway Dashboard)
2. **Verify** all services can see the variables
3. **Redeploy** all 8 services
4. **Test** all 5 multisite URLs
5. **Report back** if issues persist

---

**This is likely the root cause of why the platform isn't working - the services are missing 88 critical configuration variables!**
