# Fix Server Configuration for Testing

## Issue
The server is returning 500 errors and timing out due to configuration issues.

## Steps Taken

1. ✅ **APP_KEY Generated**: `php artisan key:generate --force`
   - APP_KEY is now set: `base64:uRg9xdAJEkc4U8DCbb9q1chC/7bKN1lAhRl4bISDMY8=`

2. ⚠️ **Server Timeout Issue**: Pages are timing out after 30 seconds
   - Error: "Maximum execution time of 30 seconds exceeded"
   - Likely cause: Database connection issues or missing migrations

## Next Steps to Fix

### Option 1: Check Database Connection
```bash
php artisan migrate:status
php artisan db:show
```

### Option 2: Increase PHP Execution Time
Add to `.env`:
```
PHP_MAX_EXECUTION_TIME=300
```

Or create `php.ini` override:
```ini
max_execution_time = 300
```

### Option 3: Run Migrations
If database is not set up:
```bash
php artisan migrate --force
```

### Option 4: Use SQLite for Testing
For faster testing, use SQLite:
```bash
# In .env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Create database file
touch database/database.sqlite
php artisan migrate --force
```

### Option 5: Skip Database-Dependent Routes
Some routes may require database access. You can:
1. Mock database responses in tests
2. Use a test database
3. Skip routes that require database until DB is configured

## Current Status

- ✅ APP_KEY: Fixed
- ✅ Server: Running on port 8000
- ⚠️ Timeout: Pages timing out (likely DB issue)
- ✅ Tests: Discovering all 163 pages correctly

## Quick Fix Command

```bash
# Stop current server
pkill -f "php artisan serve"

# Clear caches
php artisan config:clear
php artisan cache:clear

# Restart server with increased timeout
php -d max_execution_time=300 artisan serve --host=127.0.0.1 --port=8000
```

## Test Command

```bash
APP_URL=http://127.0.0.1:8000 npx playwright test tests/Playwright/all-pages-comprehensive.spec.ts --config=playwright.test.config.ts --reporter=list --workers=1 --timeout=120000
```

