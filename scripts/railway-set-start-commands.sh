#!/bin/bash
set -e

echo "🔧 Setting Start Commands for Railway Services"
echo "=============================================="
echo ""

# Railway CLI doesn't have a direct command to set start commands
# But we can use railway.json files or Railway API
# For now, we'll create railway.json files for each service

echo "📋 Creating railway.json files for backend services..."
echo ""

# Create railway.json for Inertia SSR
cat > railway-inertia-ssr.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/standalone/Dockerfile"
  },
  "deploy": {
    "startCommand": "php artisan inertia:start-ssr",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create railway.json for Horizon
cat > railway-horizon.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/standalone/Dockerfile"
  },
  "deploy": {
    "startCommand": "php artisan horizon",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Create railway.json for Scheduler
cat > railway-scheduler.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "docker/standalone/Dockerfile"
  },
  "deploy": {
    "startCommand": "php artisan schedule:work",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

echo "✅ Created railway.json files"
echo ""
echo "⚠️  Note: Railway CLI doesn't support setting start commands directly"
echo "   You need to:"
echo "   1. Link each service to its railway.json file, OR"
echo "   2. Use Railway Dashboard to set start commands"
echo ""
echo "   To link services:"
echo "   cd to service directory and run: railway link --service 'Service Name'"
echo ""
