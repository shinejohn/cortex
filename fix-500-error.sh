#!/bin/bash

# Script to fix 500 errors and security issues in production
# Run this on your production server

echo "=== Fixing 500 Error and Security Issues ==="
echo ""

# 1. Clear all Laravel caches (CRITICAL - fixes config cache issues)
echo "1. Clearing Laravel caches..."
php artisan config:clear || echo "WARNING: config:clear failed"
php artisan cache:clear || echo "WARNING: cache:clear failed"
php artisan route:clear || echo "WARNING: route:clear failed"
php artisan view:clear || echo "WARNING: view:clear failed"
php artisan event:clear || echo "WARNING: event:clear failed"

# 2. Verify config files are readable
echo ""
echo "2. Verifying config files..."
if [ ! -f "config/scribe.php" ]; then
    echo "ERROR: config/scribe.php not found!"
    exit 1
fi

# 3. Test config loading
echo ""
echo "3. Testing config loading..."
php artisan tinker --execute="try { config('scribe.title'); echo 'Config loaded successfully'; } catch (Exception \$e) { echo 'Config error: ' . \$e->getMessage(); }" || echo "WARNING: Config test failed"

# 4. Check environment variables
echo ""
echo "4. Checking critical environment variables..."
if [ -z "$DAYNEWS_DOMAIN" ]; then
    echo "WARNING: DAYNEWS_DOMAIN not set in .env"
fi

# Check security settings
if [ "$APP_ENV" != "production" ]; then
    echo "WARNING: APP_ENV is not set to 'production'"
fi

if [ "$APP_DEBUG" != "false" ]; then
    echo "WARNING: APP_DEBUG should be 'false' in production"
fi

if [ -z "$SESSION_SECURE_COOKIE" ] || [ "$SESSION_SECURE_COOKIE" != "true" ]; then
    echo "WARNING: SESSION_SECURE_COOKIE should be 'true' in production"
fi

# 5. Check database connection
echo ""
echo "5. Testing database connection..."
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'Database connected successfully'; } catch (Exception \$e) { echo 'Database error: ' . \$e->getMessage(); }" || echo "WARNING: Database test failed"

# 6. Check storage permissions
echo ""
echo "6. Checking storage permissions..."
if [ ! -w "storage/logs" ]; then
    echo "WARNING: storage/logs is not writable"
    chmod -R 775 storage || echo "Failed to set storage permissions"
    chown -R www-data:www-data storage 2>/dev/null || echo "Failed to set storage ownership (may need sudo)"
fi

# 7. Verify HTTPS is working
echo ""
echo "7. Checking HTTPS configuration..."
php artisan tinker --execute="echo 'APP_URL: ' . config('app.url') . PHP_EOL; echo 'Session secure: ' . (config('session.secure') ? 'true' : 'false') . PHP_EOL;" || echo "WARNING: HTTPS check failed"

# 8. Optimize for production (after fixes)
echo ""
echo "8. Optimizing for production..."
php artisan config:cache || echo "WARNING: config:cache failed (this is OK if config has errors)"
php artisan route:cache || echo "WARNING: route:cache failed"
php artisan view:cache || echo "WARNING: view:cache failed"

echo ""
echo "=== Done ==="
echo ""
echo "IMPORTANT: If you see warnings above, fix them before caching config."
echo "If errors persist, check storage/logs/laravel.log for details"
echo ""
echo "Security Checklist:"
echo "  [ ] APP_ENV=production"
echo "  [ ] APP_DEBUG=false"
echo "  [ ] SESSION_SECURE_COOKIE=true"
echo "  [ ] HTTPS is working (check browser for padlock icon)"

