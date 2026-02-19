# Laravel Troubleshooting Reference

## Environment & Config

### APP_KEY
- Must be set. Without it: "No application encryption key has been specified."
- Generate: `php artisan key:generate --show`
- Format: `base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Set as environment variable, never commit to git

### APP_ENV
- `production` for live, `local` for dev
- Affects error display, caching behavior, debug mode
- APP_DEBUG should be `false` in production

### Config Caching
- Laravel caches config in production: `php artisan config:cache`
- If env vars change but config is cached, app uses stale values
- Fix: `php artisan config:clear` then `php artisan config:cache`
- On Railway: add `php artisan config:cache` to build command

## Database Issues

### "Connection refused" / "could not find driver"
1. Check DATABASE_URL or individual DB_* variables
2. Ensure Postgres driver is installed: `ext-pdo_pgsql` in composer.json
3. For Railway Postgres: use `${{Postgres.DATABASE_URL}}`
4. config/database.php must parse DATABASE_URL if that's how it's provided

### "Access denied for user"
1. Check DB_USERNAME, DB_PASSWORD match what Postgres has
2. Railway Postgres: use the reference variables, don't hardcode
3. Check if database actually exists (PGDATABASE)

### Migration Issues
- Run migrations: `php artisan migrate --force`
- Check migration status: `php artisan migrate:status`
- NEVER run `migrate:fresh` or `migrate:rollback` in production
- On Railway: add `php artisan migrate --force` to deploy command or build

## Queue & Horizon

### Horizon Not Processing Jobs
1. Check QUEUE_CONNECTION is set to `redis`
2. Check Redis is reachable (REDIS_HOST, REDIS_PORT)
3. Horizon needs its own service/process — it's a long-running worker
4. On Railway: Horizon runs as a separate service with `php artisan horizon` as start command
5. Check `config/horizon.php` for queue names and worker counts

### Failed Jobs
- Check failed_jobs table: `php artisan queue:failed`
- Retry all: `php artisan queue:retry all`
- Common causes: timeout, memory limit, missing dependencies
- Increase timeout in horizon.php or queue config

## Caching

### Cache Issues
- Clear all caches: `php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear`
- If using Redis for cache: check CACHE_DRIVER=redis and Redis connectivity
- File cache won't work on Railway without a volume

## Common Deploy Commands (Railway build/start)
```
# Typical build command:
composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan migrate --force

# Typical start command:
php artisan serve --host=0.0.0.0 --port=$PORT

# For Horizon worker:
php artisan horizon
```

## Storage & Files
- `storage/` needs to be writable
- On Railway without a volume: storage is ephemeral (resets on deploy)
- For persistent uploads: use S3/R2 or a Railway volume mounted to storage/app
- `php artisan storage:link` creates the public/storage symlink

## Useful Artisan Commands
- `php artisan tinker` — REPL for debugging
- `php artisan route:list` — show all routes
- `php artisan queue:work` — process one job (for debugging)
- `php artisan schedule:run` — run scheduled tasks
- `php artisan optimize` — cache config + routes + views
- `php artisan down` / `php artisan up` — maintenance mode

## Laravel 11 Specifics
- Streamlined directory structure (no Http/Kernel.php)
- Config files are optional — defaults are in the framework
- Middleware defined in bootstrap/app.php
- Routing simplified: routes/web.php and routes/api.php (api may need to be opted in)
- Health check endpoint: built-in at /up
