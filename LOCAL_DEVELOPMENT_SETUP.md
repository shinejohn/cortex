# Local Development Setup for Multisite Platform

## The Problem

This is a **multi-domain application** where different domains serve different apps:
- `goeventcity.test` → Go Event City (default/fallback)
- `daynews.test` → Day News
- `downtownguide.test` → Downtown Guide
- `golocalvoices.test` → Go Local Voices
- `alphasite.test` → Alpha Site

**`php artisan serve` only serves ONE domain**, so you can't access all sites with the default setup.

---

## Solution Options

### Option 1: Laravel Herd (Recommended - Easiest) ✅

**Laravel Herd** automatically handles multiple `.test` domains.

#### Setup:

1. **Install Laravel Herd:**
   ```bash
   # macOS
   brew install herd-php/herd/herd
   
   # Or download from: https://herd.laravel.com
   ```

2. **Link your project:**
   ```bash
   cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite
   herd link multisite
   ```

3. **Configure domains in `.env`:**
   ```env
   GOEVENTCITY_DOMAIN=goeventcity.test
   DAYNEWS_DOMAIN=daynews.test
   DOWNTOWNGUIDE_DOMAIN=downtownguide.test
   LOCAL_VOICES_DOMAIN=golocalvoices.test
   ALPHASITE_DOMAIN=alphasite.test
   ```

4. **Access all sites:**
   - http://goeventcity.test
   - http://daynews.test
   - http://downtownguide.test
   - http://golocalvoices.test
   - http://alphasite.test

**Herd automatically:**
- ✅ Sets up DNS for `.test` domains
- ✅ Routes all domains to your Laravel app
- ✅ Handles SSL certificates
- ✅ Works with Vite HMR

---

### Option 2: Laravel Valet (Alternative)

**Laravel Valet** also handles multiple domains automatically.

#### Setup:

1. **Install Valet:**
   ```bash
   composer global require laravel/valet
   valet install
   ```

2. **Link your project:**
   ```bash
   cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite
   valet link multisite
   ```

3. **Access sites:**
   - http://multisite.test (default)
   - http://daynews.multisite.test
   - http://downtownguide.multisite.test
   - etc.

**Note:** Valet uses subdomains by default, so you'd need to configure routes differently or use Valet's park feature.

---

### Option 3: Manual /etc/hosts Setup (More Work)

If you can't use Herd/Valet, you can manually configure domains:

#### Step 1: Edit `/etc/hosts` file

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 goeventcity.test
127.0.0.1 daynews.test
127.0.0.1 downtownguide.test
127.0.0.1 golocalvoices.test
127.0.0.1 alphasite.test
```

#### Step 2: Use a reverse proxy (like nginx or Caddy)

**Option A: Simple nginx config**

Create `/usr/local/etc/nginx/servers/multisite.conf`:

```nginx
server {
    listen 80;
    server_name goeventcity.test daynews.test downtownguide.test golocalvoices.test alphasite.test;
    
    root /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

Then run:
```bash
# Start PHP-FPM
php-fpm

# Start Laravel (for API routes, but nginx handles web routes)
php artisan serve --port=8000 &

# Access via: http://goeventcity.test
```

**Option B: Use Caddy (simpler)**

Install Caddy, create `Caddyfile`:
```
goeventcity.test, daynews.test, downtownguide.test, golocalvoices.test, alphasite.test {
    root * public
    php_fastcgi 127.0.0.1:9000
    file_server
}
```

Run: `caddy run`

---

### Option 4: Docker Compose (Most Complete)

Use the existing `docker-compose.standalone.yml`:

```bash
# Copy environment file
cp .env.example .env

# Update .env with local domains
GOEVENTCITY_DOMAIN=goeventcity.test
DAYNEWS_DOMAIN=daynews.test
# ... etc

# Start services
docker-compose -f docker-compose.standalone.yml up -d

# Access via: http://goeventcity.test:50901
```

**Note:** You'd still need `/etc/hosts` entries or a reverse proxy for domain routing.

---

## Recommended Setup: Laravel Herd

**Why Herd?**
- ✅ Zero configuration
- ✅ Automatic `.test` domain handling
- ✅ SSL certificates out of the box
- ✅ Works seamlessly with Vite HMR
- ✅ Built specifically for Laravel

**Quick Start:**

```bash
# 1. Install Herd
brew install herd-php/herd/herd

# 2. Link project
cd /Users/johnshine/Dropbox/Fibonacco/Day-News/Multisite
herd link multisite

# 3. Configure .env domains
echo "GOEVENTCITY_DOMAIN=goeventcity.test" >> .env
echo "DAYNEWS_DOMAIN=daynews.test" >> .env
echo "DOWNTOWNGUIDE_DOMAIN=downtownguide.test" >> .env
echo "LOCAL_VOICES_DOMAIN=golocalvoices.test" >> .env
echo "ALPHASITE_DOMAIN=alphasite.test" >> .env

# 4. Start dev server (Vite + Laravel)
composer dev

# 5. Access sites
# http://goeventcity.test
# http://daynews.test
# http://downtownguide.test
# http://golocalvoices.test
# http://alphasite.test
```

---

## Current Issue with `composer dev`

The current `composer dev` script runs:
```bash
php artisan serve --host=127.0.0.1
```

This **only serves one domain** (`127.0.0.1` or `localhost`), so:
- ❌ Domain-based routing doesn't work
- ❌ Can't access different apps
- ❌ All requests go to default (event-city)

**Solution:** Use Herd/Valet instead of `php artisan serve`, or update the dev script.

---

## Updated Dev Script (Alternative)

If you want to keep using `php artisan serve`, you could update `composer.json`:

```json
"dev": [
    "Composer\\Config::disableProcessTimeout",
    "npx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=0.0.0.0 --port=8000\" \"php artisan horizon\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,horizon,logs,vite"
]
```

But you'd still need `/etc/hosts` entries and domain configuration.

---

## Testing Domain Detection

Once set up, test that domains are detected correctly:

```bash
# Test from command line
curl -H "Host: daynews.test" http://127.0.0.1:8000

# Or visit in browser:
# http://daynews.test (if using Herd/Valet)
# http://daynews.test:8000 (if using php artisan serve with /etc/hosts)
```

Check logs to see which domain was detected:
```bash
php artisan tinker
>>> config('app.current_domain')
```

---

## Summary

**To run all sites locally, you need:**

1. ✅ **Domain routing** (Herd/Valet OR /etc/hosts + reverse proxy)
2. ✅ **Laravel app** running (via Herd/Valet OR `php artisan serve`)
3. ✅ **Vite dev server** running (`bun run dev`)
4. ✅ **Environment variables** configured (domains in `.env`)

**Recommended:** Use **Laravel Herd** - it handles everything automatically.

---

## Next Steps

1. Install Laravel Herd: `brew install herd-php/herd/herd`
2. Link project: `herd link multisite`
3. Update `.env` with domain names
4. Run `composer dev`
5. Access all sites via their `.test` domains

**That's it!** Herd handles the rest. 🚀

