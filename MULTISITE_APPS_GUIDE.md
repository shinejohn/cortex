# Multisite Applications Guide

## Overview
This is a **multisite Laravel application** that serves **5 different applications** from a single codebase using domain-based routing.

## Available Applications

### 1. **Event City** (GoEventCity)
- **Domain:** `goeventcity.test` (local) / `goeventcity.com` (production)
- **Default/Fallback:** When accessing `localhost:8000` without a Host header, this is the default app
- **Routes:** `routes/web.php`
- **Frontend Pages:** `resources/js/pages/event-city/`
- **Features:** Events, venues, performers, calendars, ticketing, social features, e-commerce

### 2. **Day News**
- **Domain:** `daynews.test` (local) / `daynews.com` (production)
- **Routes:** `routes/day-news.php`
- **Frontend Pages:** `resources/js/pages/day-news/`
- **Features:** Local news articles, business directory, events, tags, regions

### 3. **Downtown Guide**
- **Domain:** `downtownguide.test` (local) / `downtownguide.com` (production)
- **Routes:** `routes/downtown-guide.php`
- **Frontend Pages:** `resources/js/pages/downtown-guide/`
- **Features:** Business directory, reviews, coupons, deals, achievements

### 4. **Go Local Voices**
- **Domain:** `golocalvoices.com`
- **Routes:** `routes/local-voices.php`
- **Frontend Pages:** `resources/js/pages/go-local-voices/`
- **Features:** Podcast platform, creator dashboard, episodes

### 5. **Alphasite**
- **Domain:** `alphasite.com` (main) + `{business}.alphasite.com` (subdomains)
- **Routes:** `routes/alphasite.php`
- **Frontend Pages:** `resources/js/pages/alphasite/`
- **Features:** Business page generation, directory, industry pages, AI chat

## How Domain Detection Works

The `DetectAppDomain` middleware (`app/Http/Middleware/DetectAppDomain.php`) detects the domain from the request and sets `app.current_domain`:

```php
$appType = match ($host) {
    config('domains.day-news') => 'day-news',
    config('domains.downtown-guide') => 'downtown-guide',
    config('domains.event-city') => 'event-city',
    default => 'event-city', // Default fallback
};
```

## Local Development Access

### Option 1: Using Host Headers (Recommended for Testing)
```bash
# Test Day News
curl -H "Host: daynews.test" http://127.0.0.1:8000/

# Test Downtown Guide
curl -H "Host: downtownguide.test" http://127.0.0.1:8000/

# Test Go Local Voices
curl -H "Host: golocalvoices.com" http://127.0.0.1:8000/

# Test Alphasite
curl -H "Host: alphasite.com" http://127.0.0.1:8000/
```

### Option 2: Configure /etc/hosts (For Browser Access)
Add to `/etc/hosts`:
```
127.0.0.1 goeventcity.test
127.0.0.1 daynews.test
127.0.0.1 downtownguide.test
127.0.0.1 golocalvoices.com
127.0.0.1 alphasite.com
```

Then access in browser:
- http://goeventcity.test:8000
- http://daynews.test:8000
- http://downtownguide.test:8000
- http://golocalvoices.com:8000
- http://alphasite.com:8000

## Configuration

Domain configuration is in `config/domains.php` and can be overridden via `.env`:

```env
GOEVENTCITY_DOMAIN=goeventcity.test
DAYNEWS_DOMAIN=daynews.test
DOWNTOWNGUIDE_DOMAIN=downtownguide.test
LOCAL_VOICES_DOMAIN=golocalvoices.com
ALPHASITE_DOMAIN=alphasite.com
```

## Testing All Apps

To test all apps with Playwright, you need to:
1. Use different base URLs for each app
2. Or use Host headers in your test configuration
3. Or configure Playwright to use different domains

## Route Organization

- **Shared Routes:** `routes/auth.php`, `routes/settings.php`, `routes/workspace.php`, `routes/admin.php`
- **App-Specific Routes:** Each app has its own route file (`routes/{app-name}.php`)
- **API Routes:** `routes/api.php` (no domain restriction)

## Frontend Organization

Each app has its own page directory:
- `resources/js/pages/event-city/`
- `resources/js/pages/day-news/`
- `resources/js/pages/downtown-guide/`
- `resources/js/pages/go-local-voices/`
- `resources/js/pages/alphasite/`

The `appDomain` prop is passed to all Inertia pages and can be used to conditionally render content based on the current app.

