#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 [Startup] Running database migrations..."
php artisan migrate --force

# Optional: Run seeders if enabled
if [ "$SEED_ON_DEPLOY" = "true" ]; then
    echo "🌱 [Startup] Seeding database..."
    php artisan db:seed --force
fi
