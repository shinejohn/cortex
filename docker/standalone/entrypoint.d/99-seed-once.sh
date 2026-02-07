#!/bin/bash
echo "🔧 Fixing Storage Permissions..."
chown -R www-data:www-data /var/www/html/storage
chmod -R 775 /var/www/html/storage

echo "🔍 Debugging Environment..."
echo "CACHE_STORE is: '$CACHE_STORE'"
echo "SESSION_DRIVER is: '$SESSION_DRIVER'"
echo "LOG_CHANNEL is: '$LOG_CHANNEL'"
echo "DB_HOST is: '$DB_HOST'"

echo "🌱 Running Database Seeder (One-Time Setup)..."
php artisan db:seed --force
echo "✅ Database Seeding Complete."
