#!/bin/bash
# Configure all crashed Railway services
# Run this script to fix Horizon, Scheduler, and Inertia SSR

set -e

echo "=== Configuring Horizon ==="
APP_KEY_HORIZON="base64:$(openssl rand -base64 32)"
railway variables --service "Horizon" --set "APP_KEY=$APP_KEY_HORIZON"
railway variables --service "Horizon" --set "APP_ENV=production"
railway variables --service "Horizon" --set "DB_CONNECTION=pgsql"
railway variables --service "Horizon" --set "DB_HOST=postgres.railway.internal"
railway variables --service "Horizon" --set "DB_PORT=5432"
railway variables --service "Horizon" --set "DB_DATABASE=railway"
railway variables --service "Horizon" --set "DB_USERNAME=postgres"
railway variables --service "Horizon" --set "DB_PASSWORD=kXOyoJTnDLmQAyTsTFwemXOabfQxylXn"
railway variables --service "Horizon" --set "REDIS_HOST=Valkey.railway.internal"
railway variables --service "Horizon" --set "REDIS_PORT=6379"
railway variables --service "Horizon" --set "QUEUE_CONNECTION=redis"
railway variables --service "Horizon" --set "CACHE_STORE=redis"
echo "✅ Horizon configured"

echo ""
echo "=== Configuring Scheduler ==="
APP_KEY_SCHEDULER="base64:$(openssl rand -base64 32)"
railway variables --service "Scheduler" --set "APP_KEY=$APP_KEY_SCHEDULER"
railway variables --service "Scheduler" --set "APP_ENV=production"
railway variables --service "Scheduler" --set "DB_CONNECTION=pgsql"
railway variables --service "Scheduler" --set "DB_HOST=postgres.railway.internal"
railway variables --service "Scheduler" --set "DB_PORT=5432"
railway variables --service "Scheduler" --set "DB_DATABASE=railway"
railway variables --service "Scheduler" --set "DB_USERNAME=postgres"
railway variables --service "Scheduler" --set "DB_PASSWORD=kXOyoJTnDLmQAyTsTFwemXOabfQxylXn"
railway variables --service "Scheduler" --set "REDIS_HOST=Valkey.railway.internal"
railway variables --service "Scheduler" --set "REDIS_PORT=6379"
railway variables --service "Scheduler" --set "QUEUE_CONNECTION=redis"
railway variables --service "Scheduler" --set "CACHE_STORE=redis"
echo "✅ Scheduler configured"

echo ""
echo "=== Configuring Inertia SSR ==="
APP_KEY_SSR="base64:$(openssl rand -base64 32)"
railway variables --service "Inertia SSR" --set "APP_KEY=$APP_KEY_SSR"
railway variables --service "Inertia SSR" --set "APP_ENV=production"
railway variables --service "Inertia SSR" --set "DB_CONNECTION=pgsql"
railway variables --service "Inertia SSR" --set "DB_HOST=postgres.railway.internal"
railway variables --service "Inertia SSR" --set "DB_PORT=5432"
railway variables --service "Inertia SSR" --set "DB_DATABASE=railway"
railway variables --service "Inertia SSR" --set "DB_USERNAME=postgres"
railway variables --service "Inertia SSR" --set "DB_PASSWORD=kXOyoJTnDLmQAyTsTFwemXOabfQxylXn"
railway variables --service "Inertia SSR" --set "REDIS_HOST=Valkey.railway.internal"
railway variables --service "Inertia SSR" --set "REDIS_PORT=6379"
echo "✅ Inertia SSR configured"

echo ""
echo "=== Redeploying all services ==="
railway redeploy --service "Horizon" --yes
railway redeploy --service "Scheduler" --yes
railway redeploy --service "Inertia SSR" --yes
railway redeploy --service "Day News" --yes
railway redeploy --service "Downtown Guide" --yes
railway redeploy --service "Go Local Voices" --yes

echo ""
echo "✅ All services configured and redeploying!"
echo "Wait 10-15 minutes for deployments to complete"
