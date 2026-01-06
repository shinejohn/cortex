# Lambda Container Image for Laravel Test Runner
FROM public.ecr.aws/lambda/provided:al2

# Install PHP 8.2 and extensions
RUN yum install -y \
    php82 \
    php82-cli \
    php82-pdo \
    php82-pgsql \
    php82-xml \
    php82-mbstring \
    php82-json \
    php82-opcache \
    php82-zip \
    php82-curl \
    php82-gd \
    php82-intl \
    php82-bcmath \
    git \
    unzip

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR /var/task

# Copy Laravel application
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy Lambda handler
COPY lambda/index.php ${LAMBDA_TASK_ROOT}/

# Set handler
CMD ["index.handler"]


