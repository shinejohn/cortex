# Railway Deployment Setup Guide

## Overview
This document provides instructions for deploying golocalvoices and alphsite.ai services to Railway, similar to the GoEventCity setup.

## Services Created

### GoLocalVoices
- **Service ID**: `7b855d10-a227-49f4-b135-a241dbec4b8e`
- **Domain**: `golocalvoices.com`
- **Route File**: `routes/local-voices.php`

### AlphaSite
- **Service ID**: `cf980b14-f523-4bfd-ac91-c4ff2d6906d7`
- **Domain**: `alphsite.ai`
- **Route File**: `routes/alphasite.php`

## Railway Configuration

### 1. Connect GitHub Repository

For each service (GoLocalVoices and AlphaSite):

1. Go to Railway dashboard: https://railway.com
2. Open project: **supportive-rebirth**
3. Click on the service (GoLocalVoices or AlphaSite)
4. Go to **Settings → Source**
5. Click **Connect GitHub**
6. Select your repository
7. Railway will auto-detect the Dockerfile at `docker/standalone/Dockerfile`

### 2. Environment Variables

Set the following environment variables for each service in Railway:

#### GoLocalVoices Service Variables

```bash
# Domain Configuration
LOCAL_VOICES_DOMAIN=golocalvoices.com
APP_URL=https://golocalvoices.com
APP_NAME="Go Local Voices"

# Copy from GoEventCity service:
APP_KEY=<copy from GoEventCity>
APP_ENV=production
APP_DEBUG=false

# Database (use shared Postgres service)
DATABASE_URL=<internal Railway URL from Postgres service>

# Redis (use shared Valkey service)
REDIS_URL=<internal Railway URL from Valkey service>

# All other variables from GoEventCity:
# - Mail configuration
# - AWS/R2 storage
# - Stripe keys
# - Sentry DSN
# - etc.
```

#### AlphaSite Service Variables

```bash
# Domain Configuration
ALPHASITE_DOMAIN=alphsite.ai
APP_URL=https://alphsite.ai
APP_NAME="AlphaSite"

# Copy from GoEventCity service:
APP_KEY=<copy from GoEventCity>
APP_ENV=production
APP_DEBUG=false

# Database (use shared Postgres service)
DATABASE_URL=<internal Railway URL from Postgres service>

# Redis (use shared Valkey service)
REDIS_URL=<internal Railway URL from Valkey service>

# All other variables from GoEventCity:
# - Mail configuration
# - AWS/R2 storage
# - Stripe keys
# - Sentry DSN
# - etc.
```

### 3. Internal Railway URLs

To get internal Railway URLs for database and Redis:

1. Go to Railway dashboard
2. Click on **Postgres** service
3. Go to **Variables** tab
4. Copy the `DATABASE_URL` value (internal format: `postgresql://postgres:PASSWORD@Postgres.railway.internal:5432/railway`)

For Redis/Valkey:
1. Click on **Valkey** service
2. Go to **Variables** tab
3. Copy the `REDIS_URL` value (internal format: `redis://Valkey.railway.internal:6379`)

### 4. Custom Domains

Configure custom domains in Railway:

#### GoLocalVoices
1. Go to GoLocalVoices service
2. Click **Settings → Networking**
3. Click **Custom Domain**
4. Add: `golocalvoices.com`
5. Follow DNS configuration instructions

#### AlphaSite
1. Go to AlphaSite service
2. Click **Settings → Networking**
3. Click **Custom Domain**
4. Add: `alphsite.ai`
5. Follow DNS configuration instructions

### 5. Build Settings

Railway should auto-detect:
- **Dockerfile Path**: `docker/standalone/Dockerfile`
- **Build Command**: Automatically handled by Dockerfile
- **Start Command**: Automatically handled by Dockerfile (uses s6-overlay)

If needed, manually set in Railway:
- **Root Directory**: Leave empty (root of repo)
- **Dockerfile Path**: `docker/standalone/Dockerfile`

## Code Configuration

### Domain Routing

The application uses domain-based routing configured in:
- `config/domains.php` - Domain configuration
- `bootstrap/app.php` - Route registration

Routes are already configured:
- **GoLocalVoices**: `routes/local-voices.php`
- **AlphaSite**: `routes/alphasite.php`

### Environment Variables Reference

Key environment variables that control domain routing:

```php
// config/domains.php
'local-voices' => env('LOCAL_VOICES_DOMAIN', 'golocalvoices.com'),
'alphasite' => env('ALPHASITE_DOMAIN', 'alphsite.ai'),
```

These are used in `bootstrap/app.php` to register domain-specific routes.

## Deployment Checklist

- [ ] GoLocalVoices service created in Railway
- [ ] AlphaSite service created in Railway
- [ ] GitHub repository connected to both services
- [ ] Environment variables set for GoLocalVoices
- [ ] Environment variables set for AlphaSite
- [ ] DATABASE_URL configured (shared Postgres)
- [ ] REDIS_URL configured (shared Valkey)
- [ ] Custom domain `golocalvoices.com` configured
- [ ] Custom domain `alphsite.ai` configured
- [ ] DNS records updated for custom domains
- [ ] First deployment successful
- [ ] Health checks passing (`/up` endpoint)

## Troubleshooting

### Service Not Deploying
- Check Railway logs for build errors
- Verify Dockerfile path is correct
- Ensure all environment variables are set

### Domain Not Routing Correctly
- Verify `LOCAL_VOICES_DOMAIN` or `ALPHASITE_DOMAIN` is set correctly
- Check DNS records point to Railway
- Verify custom domain is configured in Railway

### Database Connection Issues
- Verify `DATABASE_URL` uses internal Railway format
- Check Postgres service is running
- Ensure database credentials are correct

### Redis Connection Issues
- Verify `REDIS_URL` uses internal Railway format
- Check Valkey service is running
- Ensure Redis credentials are correct

## Related Files

- `docker/standalone/Dockerfile` - Docker build configuration
- `config/domains.php` - Domain configuration
- `bootstrap/app.php` - Route registration
- `routes/local-voices.php` - GoLocalVoices routes
- `routes/alphasite.php` - AlphaSite routes
- `railway.json` - Railway deployment configuration
