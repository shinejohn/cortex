#!/bin/bash

#===============================================================================
# Railway Migrate via Shell
# Uses Railway shell which has full environment with resolved service references
#===============================================================================

SERVICE_NAME="${1:-GoEventCity}"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Running Migrations via Railway Shell                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "This will open a Railway shell with full environment variables."
echo "Then run: php artisan migrate --force"
echo ""
echo "Press Ctrl+D to exit the shell when done."
echo ""

railway shell --service "$SERVICE_NAME"
