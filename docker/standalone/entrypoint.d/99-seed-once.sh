#!/bin/bash

echo "🌱 Running Database Seeder (One-Time Setup)..."
php artisan db:seed --force
echo "✅ Database Seeding Complete."
