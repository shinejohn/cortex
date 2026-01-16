# Copy-Paste Fix for GitHub Web UI

## The Problem
GitHub has OLD Dockerfiles → CodePipeline uses them → Docker Hub rate limits → Builds fail

## Solution: Copy-Paste These Fixed Files

### File 1: docker/Dockerfile.base-app
**URL:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.base-app

**Replace entire file with:**

```dockerfile
# Base Laravel Application Dockerfile
# Used for Horizon (queue worker) and Scheduler

FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    icu-dev \
    supervisor \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    opcache \
    intl

# Configure PHP
RUN echo "memory_limit=512M" > /usr/local/etc/php/conf.d/memory.ini

# Install Composer
COPY --from=public.ecr.aws/docker/library/composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy application files
COPY . .

# Run composer scripts
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html/storage && \
    chmod -R 755 /var/www/html/bootstrap/cache

# Health check for Horizon
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD php artisan horizon:status || exit 1

# Default command (override in ECS task definition)
# For Horizon: CMD ["php", "artisan", "horizon"]
# For Scheduler: CMD ["php", "artisan", "schedule:work"]
CMD ["php", "artisan", "horizon"]
```

---

### File 2: docker/Dockerfile.inertia-ssr
**URL:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.inertia-ssr

**Replace entire file with:**

```dockerfile
# Inertia SSR Service Dockerfile
# Node.js service for server-side rendering

FROM public.ecr.aws/docker/library/php:8.4-cli-alpine AS base

# Install system dependencies, PHP extensions, and Node.js
RUN apk add --no-cache \
    git \
    curl \
    nodejs \
    npm \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    icu-dev \
    && docker-php-ext-install \
    zip \
    mbstring \
    intl \
    && curl -fsSL https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

# Set working directory
WORKDIR /app

# Copy composer files and install PHP dependencies (needed for ziggy-js alias in vite.config.ts)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts && \
    echo "Verifying vendor/tightenco/ziggy exists..." && \
    ls -la vendor/tightenco/ziggy && \
    echo "✓ vendor/tightenco/ziggy found"

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for SSR)
RUN npm ci

# Copy application source (vendor directory already exists from composer install above)
# Note: vendor is not in .dockerignore, so it will be preserved from composer install
COPY . .

# Verify vendor directory still exists before build
RUN echo "Verifying vendor/tightenco/ziggy exists before build..." && \
    ls -la vendor/tightenco/ziggy && \
    echo "✓ vendor/tightenco/ziggy confirmed before build"

# Build SSR bundle
RUN npm run build:ssr

# Production stage
FROM public.ecr.aws/docker/library/node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production && npm cache clean --force

# Copy SSR build files from build stage
COPY --from=base /app/bootstrap/ssr ./bootstrap/ssr

# Create non-root user
RUN addgroup -g 1000 node && \
    adduser -u 1000 -G node -s /bin/sh -D node && \
    chown -R node:node /app

USER node

# Expose SSR port
EXPOSE 13714

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:13714/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start SSR server
CMD ["node", "bootstrap/ssr/ssr.js"]
```

---

### File 3: docker/Dockerfile.web
**URL:** https://github.com/shinejohn/Community-Platform/edit/main/docker/Dockerfile.web

**This file is longer - see GITHUB_WEB_UI_FIX.md for line-by-line changes, OR:**

**Key changes:**
- Line 5: `FROM public.ecr.aws/docker/library/node:20-alpine AS frontend-builder`
- Line 17: `COPY --from=public.ecr.aws/docker/library/composer:latest`
- Line 37: `FROM public.ecr.aws/docker/library/php:8.4-fpm-alpine`
- Line 79: `COPY --from=public.ecr.aws/docker/library/composer:latest`

## After Updating All 3 Files:
1. CodePipeline will auto-detect changes
2. Pipeline triggers automatically
3. Builds use ECR Public Gallery (no rate limits)
4. ✅ Builds succeed!



