#!/bin/bash
# Setup script for local Playwright testing

set -e

echo "🚀 Setting up local environment for Playwright testing..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file"
    else
        echo "❌ .env.example not found. Please create .env manually."
        exit 1
    fi
fi

# Set APP_URL for local testing
if ! grep -q "APP_URL=" .env; then
    echo "APP_URL=http://localhost:8000" >> .env
    echo "✅ Added APP_URL to .env"
fi

# Install Playwright browsers if not already installed
echo "📦 Installing Playwright browsers..."
npx playwright install --with-deps chromium

# Build frontend assets
echo "🔨 Building frontend assets..."
npm run build

# Clear Laravel caches
echo "🧹 Clearing Laravel caches..."
php artisan route:clear || true
php artisan config:clear || true
php artisan cache:clear || true
php artisan view:clear || true

# Run database migrations (if needed)
echo "🗄️  Checking database..."
php artisan migrate:status || echo "⚠️  Database migrations check failed (this is OK if DB is not accessible)"

# Create auth state directory
echo "📁 Creating auth state directory..."
mkdir -p playwright/.auth

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Start Laravel server: php artisan serve"
echo "  2. In another terminal, run: npm run test:e2e"
echo ""
echo "Or run with UI:"
echo "  npm run test:e2e:ui"
echo ""

