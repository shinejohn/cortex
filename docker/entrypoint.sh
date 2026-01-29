#!/bin/sh
set -e

# Run database migrations (soft-fail to prevent crash loop)
echo "Running database migrations..."
php artisan migrate --force || echo "⚠️ Migrations completed with warnings - container will start anyway"

# Start the main process (supervisord)
exec "$@"
