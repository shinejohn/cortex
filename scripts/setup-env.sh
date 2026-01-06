#!/bin/bash

# Setup Environment Variables for AWS Deployment
# This script generates .env files for each service

set -e

cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate
export PATH="$HOME/.pulumi/bin:$PATH"

# Get infrastructure outputs
DB_ENDPOINT=$(pulumi stack output database_endpoint | tr -d '"')
REDIS_ENDPOINT=$(pulumi stack output redis_endpoint | tr -d '"' || echo "TBD")
ALB_DNS=$(pulumi stack output alb_dns_name | tr -d '"')
APP_BUCKET=$(pulumi stack output app_bucket_name | tr -d '"')
ARCHIVE_BUCKET=$(pulumi stack output archive_bucket_name | tr -d '"')

echo "Database Endpoint: $DB_ENDPOINT"
echo "Redis Endpoint: $REDIS_ENDPOINT"
echo "ALB DNS: $ALB_DNS"
echo "App Bucket: $APP_BUCKET"
echo "Archive Bucket: $ARCHIVE_BUCKET"

# Create .env template
cat > ../.env.aws.template <<EOF
# AWS Environment Configuration
# Generated: $(date)

APP_ENV=production
APP_DEBUG=false
APP_URL=https://dev.goeventcity.com

# Database
DB_CONNECTION=pgsql
DB_HOST=${DB_ENDPOINT%%:*}
DB_PORT=${DB_ENDPOINT##*:}
DB_DATABASE=fibonacco
DB_USERNAME=postgres
DB_PASSWORD=<SET_VIA_SECRETS_MANAGER>

# Redis/ElastiCache
REDIS_HOST=${REDIS_ENDPOINT}
REDIS_PORT=6379
REDIS_PASSWORD=null

# AWS S3
AWS_ACCESS_KEY_ID=<SET_VIA_SECRETS_MANAGER>
AWS_SECRET_ACCESS_KEY=<SET_VIA_SECRETS_MANAGER>
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=${APP_BUCKET}
AWS_ARCHIVE_BUCKET=${ARCHIVE_BUCKET}

# Inertia SSR
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://inertia-ssr:13714

# Queue
QUEUE_CONNECTION=redis

# Session
SESSION_DRIVER=redis
CACHE_DRIVER=redis

# Mail (configure as needed)
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@fibonacco.com"
MAIL_FROM_NAME="${APP_NAME}"
EOF

echo ""
echo "✅ Environment template created: .env.aws.template"
echo "📝 Review and update with actual values before deploying"

