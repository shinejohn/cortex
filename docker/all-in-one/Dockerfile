# Versions
# https://hub.docker.com/r/serversideup/php/tags?name=8.4-fpm-nginx-alpine
ARG SERVERSIDEUP_PHP_VERSION=8.4-fpm-nginx-alpine

# https://www.postgresql.org/support/versioning/
ARG POSTGRES_VERSION=17

# Add user/group
ARG USER_ID=9999
ARG GROUP_ID=9999

# =================================================================
# Stage 1: Composer dependencies
# =================================================================
FROM serversideup/php:${SERVERSIDEUP_PHP_VERSION} AS base

USER root

ARG USER_ID
ARG GROUP_ID

RUN docker-php-serversideup-set-id www-data $USER_ID:$GROUP_ID && \
    docker-php-serversideup-set-file-permissions --owner $USER_ID:$GROUP_ID --service nginx

# Install the intl extension with root permissions
RUN install-php-extensions intl

WORKDIR /var/www/html
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-plugins --no-scripts --prefer-dist

USER www-data

# =================================================================
# Stage 2: Frontend assets compilation
# =================================================================
FROM oven/bun:alpine AS static-assets

RUN apk add --no-cache python3 py3-pip g++ make
ENV PYTHON /usr/bin/python3

WORKDIR /app
COPY package*.json bun.lock vite.config.ts ./
RUN bun i

COPY . .
COPY --from=base /var/www/html/vendor/ ./vendor/

RUN bun --bun run build:ssr

# =================================================================
# Final Stage: Production image
# =================================================================
FROM serversideup/php:${SERVERSIDEUP_PHP_VERSION}

ARG USER_ID
ARG GROUP_ID
ARG TARGETPLATFORM
ARG POSTGRES_VERSION
ARG CI=true

WORKDIR /var/www/html

USER root

RUN docker-php-serversideup-set-id www-data $USER_ID:$GROUP_ID && \
    docker-php-serversideup-set-file-permissions --owner $USER_ID:$GROUP_ID --service nginx

# Install the intl extension with root permissions
RUN install-php-extensions intl

# Install PostgreSQL repository and keys
RUN apk add --no-cache gnupg && \
    mkdir -p /usr/share/keyrings && \
    curl -fSsL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor > /usr/share/keyrings/postgresql.gpg

# Install system dependencies
RUN apk add --no-cache \
    postgresql${POSTGRES_VERSION}-client \
    openssh-client \
    git \
    git-lfs \
    jq \
    lsof \
    vim \
    curl \
    nodejs \
    npm

ENV PYTHON /usr/bin/python3

# Configure shell aliases
RUN echo "alias ll='ls -al'" >> /etc/profile && \
    echo "alias a='php artisan'" >> /etc/profile && \
    echo "alias logs='tail -f storage/logs/laravel.log'" >> /etc/profile

ARG AUTORUN_ENABLED
ARG AUTORUN_LARAVEL_CONFIG_CACHE
ARG AUTORUN_LARAVEL_EVENT_CACHE
ARG AUTORUN_LARAVEL_ROUTE_CACHE
ARG AUTORUN_LARAVEL_VIEW_CACHE
ARG AUTORUN_LARAVEL_STORAGE_LINK

# Configure environment variables
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=128 \
    PHP_OPCACHE_INTERNED_STRINGS_BUFFER=8 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=10000 \
    PHP_OPCACHE_REVALIDATE_FREQ=2 \
    PHP_MEMORY_LIMIT=256M \
    PHP_MAX_EXECUTION_TIME=60 \
    PHP_POST_MAX_SIZE=100M \
    PHP_UPLOAD_MAX_FILE_SIZE=100M \
    NGINX_MAX_BODY_SIZE=100M \
    AUTORUN_ENABLED=${AUTORUN_ENABLED:-true} \
    AUTORUN_LARAVEL_CONFIG_CACHE=${AUTORUN_LARAVEL_CONFIG_CACHE:-true} \
    AUTORUN_LARAVEL_EVENT_CACHE=${AUTORUN_LARAVEL_EVENT_CACHE:-true} \
    AUTORUN_LARAVEL_ROUTE_CACHE=${AUTORUN_LARAVEL_ROUTE_CACHE:-true} \
    AUTORUN_LARAVEL_VIEW_CACHE=${AUTORUN_LARAVEL_VIEW_CACHE:-true} \
    AUTORUN_LARAVEL_STORAGE_LINK=${AUTORUN_LARAVEL_STORAGE_LINK:-true} \
    APP_BASE_DIR=/var/www/html \
    NGINX_WEBROOT=/var/www/html/public \
    SSL_MODE=off

# Configure entrypoint
COPY --chmod=755 docker/all-in-one/entrypoint.d/ /etc/entrypoint.d

# Copy application files from previous stages
COPY --from=base --chown=www-data:www-data /var/www/html/vendor ./vendor
COPY --from=static-assets --chown=www-data:www-data /app/node_modules ./node_modules
COPY --from=static-assets --chown=www-data:www-data /app/public/build ./public/build
COPY --from=static-assets --chown=www-data:www-data /app/bootstrap/ssr ./bootstrap/ssr

# Copy application source code
COPY --chown=www-data:www-data composer.json composer.lock ./
COPY --chown=www-data:www-data app ./app
COPY --chown=www-data:www-data bootstrap ./bootstrap
COPY --chown=www-data:www-data config ./config
COPY --chown=www-data:www-data database ./database
COPY --chown=www-data:www-data public ./public
COPY --chown=www-data:www-data routes ./routes
COPY --chown=www-data:www-data storage ./storage
COPY --chown=www-data:www-data resources ./resources
COPY --chown=www-data:www-data artisan artisan

RUN composer dump-autoload

# Configure Nginx
COPY docker/all-in-one/etc/nginx/conf.d/custom.conf /etc/nginx/conf.d/custom.conf
COPY docker/all-in-one/etc/nginx/site-opts.d/http.conf /etc/nginx/site-opts.d/http.conf
COPY --chmod=755 docker/all-in-one/etc/s6-overlay/ /etc/s6-overlay/

# Create nginx directories and set permissions
RUN mkdir -p /etc/nginx/conf.d /etc/nginx/site-opts.d && \
    chown -R www-data:www-data /etc/nginx && \
    chmod -R 755 /etc/nginx

# Switch to non-root user
USER www-data
