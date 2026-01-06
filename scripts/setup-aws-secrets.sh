#!/bin/bash
set -e

# Setup AWS Secrets Manager for application secrets

AWS_REGION="us-east-1"
ENV="dev"
SECRET_NAME="fibonacco/$ENV/app-secrets"

echo "🔐 Setting up AWS Secrets Manager..."

# Get database endpoint and password
cd INFRASTRUCTURE
DB_ENDPOINT=$(pulumi stack output db_endpoint 2>/dev/null | cut -d: -f1)
DB_PORT=$(pulumi stack output db_endpoint 2>/dev/null | cut -d: -f2)
DB_PASSWORD=$(pulumi config get db_password 2>/dev/null || echo "")

if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  Database password not found. Generating one..."
    DB_PASSWORD=$(openssl rand -base64 32)
    echo "Generated password. Setting in Pulumi config..."
    pulumi config set --secret db_password "$DB_PASSWORD"
fi

cd ..

# Get Redis endpoint
cd INFRASTRUCTURE
REDIS_ENDPOINT=$(pulumi stack output cache_endpoint 2>/dev/null | cut -d: -f1)
REDIS_PORT=$(pulumi stack output cache_endpoint 2>/dev/null | cut -d: -f2 || echo "6379")
cd ..

# Generate APP_KEY
APP_KEY=$(php artisan key:generate --show 2>/dev/null | tail -1 || echo "")

if [ -z "$APP_KEY" ]; then
    echo "Generating APP_KEY..."
    APP_KEY=$(php artisan key:generate --show 2>/dev/null | tail -1)
fi

# Create secret JSON
SECRET_JSON=$(cat <<EOF
{
  "DB_CONNECTION": "pgsql",
  "DB_HOST": "$DB_ENDPOINT",
  "DB_PORT": "$DB_PORT",
  "DB_DATABASE": "fibonacco",
  "DB_USERNAME": "postgres",
  "DB_PASSWORD": "$DB_PASSWORD",
  "REDIS_HOST": "$REDIS_ENDPOINT",
  "REDIS_PORT": "$REDIS_PORT",
  "REDIS_PASSWORD": "",
  "APP_KEY": "$APP_KEY",
  "APP_ENV": "$ENV",
  "CACHE_STORE": "redis",
  "QUEUE_CONNECTION": "redis",
  "SESSION_DRIVER": "redis"
}
EOF
)

# Create or update secret
if aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region $AWS_REGION &>/dev/null; then
    echo "Updating existing secret..."
    aws secretsmanager update-secret \
        --secret-id "$SECRET_NAME" \
        --secret-string "$SECRET_JSON" \
        --region $AWS_REGION
else
    echo "Creating new secret..."
    aws secretsmanager create-secret \
        --name "$SECRET_NAME" \
        --secret-string "$SECRET_JSON" \
        --region $AWS_REGION
fi

echo "✅ Secret created/updated: $SECRET_NAME"
echo ""
echo "Secret ARN:"
aws secretsmanager describe-secret --secret-id "$SECRET_NAME" --region $AWS_REGION --query 'ARN' --output text

