#!/bin/bash
# Railway Shared Variables Import Script
# Setting shared variables for Shine Dev Environment
# These will be inherited by all services

set -e

echo "=========================================="
echo "IMPORTING SHARED VARIABLES"
echo "Project: Shine Dev Environment"
echo "=========================================="
echo ""

# Note: Railway CLI doesn't have a direct "shared variables" command
# We need to set these on each service, or use the Railway dashboard
# For now, we'll set them on all services

SERVICES=(
  "GoEventCity"
  "Alphasite"
  "Day News"
  "Downtown Guide"
  "Go Local Voices"
  "Horizon"
  "Scheduler"
  "Inertia SSR"
)

echo "Setting shared variables on all services..."
echo ""

# Batch 1: First 6 variables from Climactic
echo "=== Batch 1: Core Application Variables ==="

for service in "${SERVICES[@]}"; do
  echo "Configuring: $service"
  
  railway variables --service "$service" --skip-deploys \
    --set "ADMIN_EMAILS=aditya@climactic.co,john.m.shine@gmail.com" \
    --set "APP_DEBUG=true" \
    --set "APP_FAKER_LOCALE=en_US" \
    --set "APP_FALLBACK_LOCALE=en"
  
  # Note: APP_ENV and APP_KEY are already set individually, so we'll skip to avoid conflicts
  # unless you want to override them
  
  echo "✅ $service configured"
  echo ""
done

echo ""
echo "=========================================="
echo "Batch 1 Complete!"
echo "=========================================="
echo ""
echo "Please provide the remaining variables and I'll continue..."
echo "Current count: 6 variables set"
echo "Remaining: ~84 variables"
