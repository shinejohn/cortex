# AlphaSite White Screen Issue - Diagnosis Guide
**Date:** January 2025  
**Issue:** White screen on dev.alphasite.ai  
**Error:** ERR_CONNECTION_REFUSED

---

## 🔍 Initial Observations

### Browser Test Results:
- **URL:** https://dev.alphasite.ai
- **Error:** `ERR_CONNECTION_REFUSED (-102)`
- **Status:** Connection refused - server not responding
- **Network Requests:** Multiple GET requests attempted, all failed
- **Console:** No console messages (page never loaded)

### Code Analysis:
✅ Routes are properly configured in `routes/alphasite.php`  
✅ Domain detection middleware exists (`DetectAppDomain`)  
✅ Frontend pages exist in `resources/js/pages/alphasite/`  
✅ Bootstrap routing includes AlphaSite domain configuration

---

## 🔬 Scientific Method: Systematic Diagnosis

### Step 1: **OBSERVE** - Document the Problem

**Symptoms:**
- White screen (no content rendered)
- ERR_CONNECTION_REFUSED error
- No HTTP response received
- No console errors (page never loads)

**Hypothesis:** Server is not running or not accessible at dev.alphasite.ai

---

### Step 2: **HYPOTHESIZE** - Possible Root Causes

#### Hypothesis A: Server Not Running
- **Likelihood:** High
- **Evidence:** ERR_CONNECTION_REFUSED typically means no server listening
- **Test:** Check if server process is running

#### Hypothesis B: DNS/Network Issue
- **Likelihood:** Medium
- **Evidence:** Domain may not resolve correctly
- **Test:** Check DNS resolution and network connectivity

#### Hypothesis C: Server Configuration Issue
- **Likelihood:** Medium
- **Evidence:** Server may be running but not configured for this domain
- **Test:** Check server configuration, nginx/apache, SSL certificates

#### Hypothesis D: Application Error (500/503)
- **Likelihood:** Low (would show error page, not connection refused)
- **Evidence:** Connection refused suggests server-level issue
- **Test:** Check application logs if server is accessible

#### Hypothesis E: Port/Firewall Issue
- **Likelihood:** Medium
- **Evidence:** Server may be running but port blocked
- **Test:** Check if port 443/80 is accessible

---

### Step 3: **EXPERIMENT** - Test Each Hypothesis

#### Test 1: Check Server Status
```bash
# SSH into server
ssh user@dev.alphasite.ai

# Check if web server is running
sudo systemctl status nginx
# OR
sudo systemctl status apache2

# Check if PHP-FPM is running
sudo systemctl status php8.3-fpm
# OR
sudo systemctl status php-fpm

# Check if Laravel application is running
ps aux | grep php
ps aux | grep artisan
```

**Expected Results:**
- If services are stopped → **Hypothesis A confirmed**
- If services are running → Continue to Test 2

#### Test 2: Check DNS Resolution
```bash
# From local machine
nslookup dev.alphasite.ai
dig dev.alphasite.ai
ping dev.alphasite.ai

# Check DNS records
host dev.alphasite.ai
```

**Expected Results:**
- If DNS doesn't resolve → **Hypothesis B confirmed**
- If DNS resolves → Continue to Test 3

#### Test 3: Check Network Connectivity
```bash
# Test HTTP connection
curl -I http://dev.alphasite.ai
curl -I https://dev.alphasite.ai

# Test specific port
telnet dev.alphasite.ai 80
telnet dev.alphasite.ai 443

# Check SSL certificate
openssl s_client -connect dev.alphasite.ai:443 -servername dev.alphasite.ai
```

**Expected Results:**
- If connection refused → **Hypothesis E confirmed** (firewall/port)
- If connection timeout → **Hypothesis B confirmed** (network)
- If connection succeeds → Continue to Test 4

#### Test 4: Check Server Configuration
```bash
# On server, check web server config
sudo nginx -t
# OR
sudo apache2ctl configtest

# Check virtual host configuration
cat /etc/nginx/sites-available/alphasite
# OR
cat /etc/apache2/sites-available/alphasite.conf

# Check if domain is properly configured
grep -r "dev.alphasite.ai" /etc/nginx/
grep -r "dev.alphasite.ai" /etc/apache2/
```

**Expected Results:**
- If config missing/incorrect → **Hypothesis C confirmed**
- If config looks correct → Continue to Test 5

#### Test 5: Check Application Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Web server error logs
sudo tail -f /var/log/nginx/error.log
# OR
sudo tail -f /var/log/apache2/error.log

# PHP-FPM logs
sudo tail -f /var/log/php8.3-fpm.log
```

**Expected Results:**
- If errors found → **Hypothesis D confirmed**
- If no errors → Continue to Test 6

#### Test 6: Check Environment Configuration
```bash
# On server
cd /path/to/application

# Check .env file
cat .env | grep ALPHASITE_DOMAIN
cat .env | grep APP_URL
cat .env | grep APP_ENV

# Check domain configuration
php artisan config:show domains.alphasite

# Test route registration
php artisan route:list | grep alphasite
```

**Expected Results:**
- If domain not configured → **Hypothesis C confirmed**
- If routes not registered → Application configuration issue

---

### Step 4: **ANALYZE** - Interpret Results

#### Decision Tree:

```
START
│
├─ Server not running?
│  └─> FIX: Start services
│      sudo systemctl start nginx
│      sudo systemctl start php8.3-fpm
│
├─ DNS not resolving?
│  └─> FIX: Check DNS records
│      - Verify A record points to server IP
│      - Check DNS propagation
│      - Verify subdomain is configured
│
├─ Port blocked?
│  └─> FIX: Check firewall
│      sudo ufw status
│      sudo firewall-cmd --list-all
│      - Open ports 80 and 443
│
├─ Server config wrong?
│  └─> FIX: Update virtual host
│      - Add server_name dev.alphasite.ai
│      - Point to Laravel public directory
│      - Restart web server
│
├─ Application error?
│  └─> FIX: Check Laravel logs
│      - Fix PHP errors
│      - Check database connection
│      - Verify file permissions
│
└─ Environment wrong?
   └─> FIX: Update .env
       ALPHASITE_DOMAIN=dev.alphasite.ai
       APP_URL=https://dev.alphasite.ai
```

---

### Step 5: **VERIFY** - Confirm Fix

After applying fixes, verify:

```bash
# 1. Test HTTP response
curl -I https://dev.alphasite.ai

# Expected: HTTP/2 200 OK

# 2. Test in browser
# Navigate to https://dev.alphasite.ai
# Should see AlphaSite homepage

# 3. Check application logs
tail -f storage/logs/laravel.log
# Should see successful requests

# 4. Test domain detection
# Check that DetectAppDomain middleware sets app_domain correctly
```

---

## 🛠️ Quick Fix Checklist

### Immediate Actions:

1. **Check Server Status**
   ```bash
   ssh user@server
   sudo systemctl status nginx
   sudo systemctl status php8.3-fpm
   ```

2. **Verify DNS**
   ```bash
   nslookup dev.alphasite.ai
   # Should return server IP address
   ```

3. **Check Web Server Config**
   ```bash
   # Ensure virtual host exists for dev.alphasite.ai
   sudo cat /etc/nginx/sites-available/alphasite
   ```

4. **Verify Environment**
   ```bash
   # On server
   cat .env | grep ALPHASITE_DOMAIN
   # Should show: ALPHASITE_DOMAIN=dev.alphasite.ai
   ```

5. **Test Route Registration**
   ```bash
   php artisan route:list | grep alphasite
   # Should show AlphaSite routes
   ```

---

## 📋 Code-Specific Checks

### 1. Domain Configuration
**File:** `config/domains.php`
```php
'alphasite' => env('ALPHASITE_DOMAIN', parse_url(env('APP_URL', 'http://alphasite.com'), PHP_URL_HOST)),
```

**Check:**
- `.env` file has `ALPHASITE_DOMAIN=dev.alphasite.ai`
- Domain is correctly parsed

### 2. Route Registration
**File:** `bootstrap/app.php` (Line 81-86)
```php
Route::domain(config('domains.alphasite'))
    ->middleware('web')
    ->group(function () {
        require base_path('routes/email-tracking.php');
        require base_path('routes/alphasite.php');
    });
```

**Check:**
- Domain config resolves correctly
- Routes file exists and is readable
- No syntax errors in routes file

### 3. Middleware Detection
**File:** `app/Http/Middleware/DetectAppDomain.php` (Line 53-54)
```php
$alphaSiteDomain && $host === $alphaSiteDomain => 'alphasite',
str_contains($host, 'alphasite') => 'alphasite',
```

**Check:**
- Middleware is registered in bootstrap/app.php
- Host detection logic works correctly

### 4. Frontend Pages
**Directory:** `resources/js/pages/alphasite/`

**Check:**
- Pages exist and compile correctly
- No TypeScript/React errors
- Assets are built: `npm run build`

**⚠️ POTENTIAL ISSUE FOUND:**
- Controller renders: `'alphasite/home'` (line 36)
- But file exists as: `alphasite/directory/home.tsx`
- **Mismatch:** Controller expects `alphasite/home.tsx` but file is in `alphasite/directory/home.tsx`
- **Fix:** Either:
  1. Move file: `mv resources/js/pages/alphasite/directory/home.tsx resources/js/pages/alphasite/home.tsx`
  2. OR update controller: `Inertia::render('alphasite/directory/home', ...)`

---

## 🚨 Most Likely Issues (Based on ERR_CONNECTION_REFUSED)

### Issue #1: Server Not Running (90% likelihood)
**Symptom:** ERR_CONNECTION_REFUSED  
**Fix:**
```bash
sudo systemctl start nginx
sudo systemctl start php8.3-fpm
sudo systemctl enable nginx
sudo systemctl enable php8.3-fpm
```

### Issue #2: DNS Not Configured (5% likelihood)
**Symptom:** Domain doesn't resolve  
**Fix:** Add DNS A record pointing dev.alphasite.ai to server IP

### Issue #3: Firewall Blocking (3% likelihood)
**Symptom:** Ports not accessible  
**Fix:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Issue #4: Web Server Not Configured (2% likelihood)
**Symptom:** Server running but no virtual host  
**Fix:** Create nginx/apache virtual host for dev.alphasite.ai

---

## 📝 Next Steps

1. **SSH into server** and run Test 1 (check server status)
2. **If server is down**, start services
3. **If server is up**, run Test 2 (DNS check)
4. **Continue through tests** until root cause identified
5. **Apply fix** based on decision tree
6. **Verify** fix works

---

## 🔍 Debugging Commands Reference

```bash
# Server status
sudo systemctl status nginx
sudo systemctl status php8.3-fpm

# Start services
sudo systemctl start nginx
sudo systemctl start php8.3-fpm

# Check logs
sudo tail -f /var/log/nginx/error.log
tail -f storage/logs/laravel.log

# Test configuration
sudo nginx -t
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Check routes
php artisan route:list | grep alphasite

# Test domain config
php artisan tinker
>>> config('domains.alphasite')

# Build assets
npm run build
npm run build:ssr
```

---

**Diagnosis Status:** Initial observation complete  
**Next Action:** SSH into server and run Test 1  
**Priority:** HIGH - Site is completely inaccessible
