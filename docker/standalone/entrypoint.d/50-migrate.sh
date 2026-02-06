#!/bin/bash

# Only run migrations if RUN_MIGRATIONS=true (set on one service only)
# This prevents race conditions when multiple Railway services start simultaneously
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force --no-interaction 2>&1
    echo "Migrations completed."
else
    echo "Skipping migrations (RUN_MIGRATIONS not set to true)"
fi
