#!/bin/bash

# Only run seeder on the main 'Day News' app to avoid race conditions
if [ "$APP_NAME" = "Day News" ]; then
    echo "🌱 Starting Sync DB Seed (Background)..."
    nohup php artisan db:seed --force > /var/www/html/storage/logs/seeder_bg.log 2>&1 &
fi
