#!/bin/bash

#===============================================================================
# Set Minimal Environment Variables for GoEventCity
# Sets the minimum required vars to run migrations
#===============================================================================

SERVICE_NAME="${1:-GoEventCity}"

echo ""
echo "Setting minimal environment variables for $SERVICE_NAME..."
echo ""

# Set basic required variables
railway variables set \
  CACHE_STORE=database \
  CACHE_DRIVER=database \
  SESSION_DRIVER=database \
  QUEUE_CONNECTION=database \
  APP_ENV=production \
  APP_DEBUG=false \
  --service "$SERVICE_NAME"

echo ""
echo "✓ Minimal variables set"
echo ""
echo "Now you can run migrations:"
echo "  railway run --service \"$SERVICE_NAME\" -- php artisan migrate --force"
echo ""
