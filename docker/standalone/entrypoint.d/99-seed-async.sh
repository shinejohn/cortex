#!/bin/bash

echo "🔍 Entrypoint: Checking if we should seed..."
echo "ℹ️ APP_NAME='$APP_NAME'"
echo "ℹ️ RAILWAY_SERVICE_NAME='$RAILWAY_SERVICE_NAME'"
echo "🔍 Debug Env:"
echo "   CACHE_STORE='$CACHE_STORE'"
echo "   SESSION_DRIVER='$SESSION_DRIVER'"
echo "   LOG_CHANNEL='$LOG_CHANNEL'"
echo "   DB_HOST='$DB_HOST'"

# Check against likely names for the Day News service
if [ "$APP_NAME" = "Day News" ] || [ "$RAILWAY_SERVICE_NAME" = "Day News" ]; then
    echo "🌱 Starting Sync DB Seed (Background as www-data)..."
    # Run as www-data to prevent log permission issues (root owning laravel.log)
    nohup su -s /bin/sh www-data -c "php artisan db:seed --force" > /var/www/html/storage/logs/seeder_bg.log 2>&1 &
else
    echo "ℹ️ Skipping seeder (This is not Day News)."
fi
