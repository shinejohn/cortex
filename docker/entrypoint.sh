#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force

# Start the main process (supervisord)
exec "$@"
