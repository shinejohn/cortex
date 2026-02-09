# Railway Multi-Domain Setup Guide

## Overview
This guide configures Railway to serve your Laravel multi-app on multiple dev subdomains with proper SSL certificates.

## Required Custom Domains in Railway

You need to add **5 custom domains** to your Railway service:

1. `dev.day.news`
2. `dev.golocalvoices.com`
3. `dev.downtownsguide.com` 
4. `dev.goeventcity.com`
5. `dev.alphasite.ai`

## Step-by-Step Railway Configuration

### 1. Access Railway Project
1. Go to https://railway.app
2. Navigate to your project
3. Click on your Laravel service

### 2. Add Custom Domains
For **each** of the 5 domains above:

1. Click **Settings** tab
2. Scroll to **Domains** section
3. Click **+ Custom Domain**
4. Enter the domain (e.g., `dev.day.news`)
5. Click **Add Domain**
6. Railway will provide DNS records

### 3. Configure DNS Records

For **each domain**, you need to add DNS records at your domain registrar:

#### For `dev.day.news`:
- **Type**: CNAME
- **Name**: `dev`
- **Value**: `<your-railway-app>.up.railway.app` (Railway will show this)

#### For `dev.golocalvoices.com`:
- **Type**: CNAME
- **Name**: `dev`
- **Value**: `<your-railway-app>.up.railway.app`

#### For `dev.downtownsguide.com`:
- **Type**: CNAME  
- **Name**: `dev`
- **Value**: `<your-railway-app>.up.railway.app`

#### For `dev.goeventcity.com`:
- **Type**: CNAME
- **Name**: `dev`
- **Value**: `<your-railway-app>.up.railway.app`

#### For `dev.alphasite.ai`:
- **Type**: CNAME
- **Name**: `dev`
- **Value**: `<your-railway-app>.up.railway.app`

### 4. Set Environment Variables in Railway

In your Railway service settings, add/update these environment variables:

```bash
# Required - Domain Configuration
GOEVENTCITY_DOMAIN=dev.goeventcity.com
DAYNEWS_DOMAIN=dev.day.news
DOWNTOWNGUIDE_DOMAIN=dev.downtownsguide.com
LOCAL_VOICES_DOMAIN=dev.golocalvoices.com
ALPHASITE_DOMAIN=dev.alphasite.ai

# Application Settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://dev.day.news

# Session & Security
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=dev.day.news,dev.golocalvoices.com,dev.downtownsguide.com,dev.goeventcity.com,dev.alphasite.ai
```

### 5. SSL Certificate Provisioning

**Railway automatically provisions SSL certificates** for custom domains using Let's Encrypt.

**Timeline:**
- DNS propagation: 5-60 minutes
- SSL certificate issuance: 1-15 minutes after DNS propagates
- Total wait time: Typically 10-75 minutes

**To check SSL status:**
1. In Railway service → Settings → Domains
2. Each domain will show a status indicator
3. Wait for ✅ "Active" status with SSL icon

## Troubleshooting

### 404 Errors
**Cause**: App is not routing the domain correctly

**Fix**: 
1. Check Railway logs: `railway logs`
2. Verify environment variables are set correctly
3. The middleware should now detect all dev subdomains

### 502 Bad Gateway
**Cause**: Application not responding or crashed

**Fix**:
1. Check Railway deployment logs
2. Verify Docker container is running
3. Check database connection
4. Look for PHP errors in logs

### SSL Certificate Issues
**Symptom**: "Your connection is not private" or SSL errors

**Causes & Fixes**:
- **DNS not propagated**: Wait 30-60 minutes, check DNS with `dig dev.day.news`
- **Certificate pending**: Railway is still provisioning, wait 5-15 minutes
- **CNAME incorrect**: Verify CNAME points to Railway domain exactly as shown
- **Cached DNS**: Clear browser cache or try incognito mode

**Check DNS propagation**:
```bash
dig dev.day.news
dig dev.golocalvoices.com
dig dev.downtownsguide.com  
dig dev.goeventcity.com
dig dev.alphasite.ai
```

Each should return a CNAME pointing to your Railway app.

### Mixed Environment
If some domains work but others don't:
1. Check each domain's DNS individually
2. Verify all 5 domains are added in Railway
3. Ensure no typos in domain names
4. Check Railway logs for specific domain errors

## Testing After Setup

Once SSL certificates are active, test each domain:

```bash
curl -I https://dev.day.news
curl -I https://dev.golocalvoices.com
curl -I https://dev.downtownsguide.com
curl -I https://dev.goeventcity.com
curl -I https://dev.alphasite.ai
```

Each should return `HTTP/2 200` or redirect properly.

## Local Development

Your `.env` now includes commented lines for local development:

```bash
# For local development, uncomment these:
# GOEVENTCITY_DOMAIN=goeventcity.test
# DAYNEWS_DOMAIN=daynews.test
# etc.
```

To switch back to local development:
1. Comment out the production domains
2. Uncomment the `.test` domains
3. Run `php artisan config:clear`

## Laravel Configuration Changes Made

### 1. Environment Variables (.env)
✅ Added all 5 dev domain configurations
✅ Provided local development override comments

### 2. Domain Detection Middleware
✅ Enhanced to detect subdomains (e.g., `dev.day.news`)
✅ Added `str_ends_with()` checks for proper subdomain matching
✅ Maintains backward compatibility with existing patterns

### 3. Route Configuration
✅ Already configured in `bootstrap/app.php`
✅ Supports multiple domains with proper name prefixing

## Next Steps

1. **Add all 5 custom domains in Railway** (5-10 minutes)
2. **Configure DNS at domain registrars** (5-10 minutes)
3. **Wait for DNS propagation** (typically 10-60 minutes)
4. **Wait for SSL certificates** (5-15 minutes after DNS)
5. **Test all domains** with curl or browser

**Total estimated time: 30-90 minutes**

## Support

If issues persist after 90 minutes:
1. Check Railway service logs
2. Verify DNS with `dig` command
3. Check SSL certificate status in Railway dashboard
4. Review Laravel logs for application errors
