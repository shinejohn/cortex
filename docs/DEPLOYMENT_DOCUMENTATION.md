# Deployment Documentation
## GoEventCity Production Deployment Guide

**Date:** 2025-12-20  
**Framework:** Laravel 12.43.1 + Inertia.js v2 + React 19.2.3

---

## Prerequisites

### Server Requirements
- PHP 8.2 or higher
- Composer 2.x
- Node.js 18.x or higher
- NPM or Bun package manager
- PostgreSQL 13+ or MySQL 8+ (SQLite for development)
- Redis (for caching and queues)
- Supervisor (for queue workers)

### Required PHP Extensions
- BCMath
- Ctype
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- Tokenizer
- XML
- GD or Imagick (for image processing)
- Redis extension (for caching)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd Multisite
```

### 2. Install Dependencies

**Backend:**
```bash
composer install --optimize-autoloader --no-dev
```

**Frontend:**
```bash
npm install
# or
bun install
```

### 3. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

**Required Environment Variables:**
```env
APP_NAME="GoEventCity"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=goeventcity
DB_USERNAME=your_user
DB_PASSWORD=your_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"

STRIPE_KEY=sk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

OPENWEATHERMAP_API_KEY=your_api_key

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
AWS_USE_PATH_STYLE_ENDPOINT=false

SENTRY_LARAVEL_DSN=your_sentry_dsn
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Run Migrations
```bash
php artisan migrate --force
```

### 6. Seed Database (Optional)
```bash
php artisan db:seed --class=GoEventCitySeeder
```

### 7. Build Frontend Assets
```bash
npm run build
# or
bun run build
```

### 8. Optimize Application
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## Queue Workers Setup

### Using Supervisor

Create `/etc/supervisor/conf.d/goeventcity-worker.conf`:

```ini
[program:goeventcity-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start goeventcity-worker:*
```

### Using Horizon (Recommended)

Horizon is already configured. Start it:
```bash
php artisan horizon
```

For production, use supervisor to manage Horizon:
```ini
[program:goeventcity-horizon]
process_name=%(program_name)s
command=php /path/to/artisan horizon
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/path/to/storage/logs/horizon.log
```

---

## Web Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com;

    root /path/to/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/public

    <Directory /path/to/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

---

## Caching Strategy

### Application Cache
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Redis Cache
Ensure Redis is running and configured in `.env`:
```env
CACHE_DRIVER=redis
```

### Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

---

## File Storage

### Local Storage (Development)
```env
FILESYSTEM_DISK=local
```

### S3 Storage (Production)
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=your-bucket
```

### Storage Link
```bash
php artisan storage:link
```

---

## Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use strong `APP_KEY`
- [ ] Configure HTTPS/SSL certificates
- [ ] Set secure session configuration
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Set up backup strategy
- [ ] Configure log rotation
- [ ] Set up monitoring (Sentry)

---

## Monitoring

### Laravel Horizon
Access Horizon dashboard at `/horizon` (configured in `config/horizon.php`)

### Logs
Application logs: `storage/logs/laravel.log`
Queue logs: `storage/logs/worker.log`
Horizon logs: `storage/logs/horizon.log`

### Health Checks
Create health check endpoint:
```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});
```

---

## Backup Strategy

### Database Backups
```bash
# PostgreSQL
pg_dump -U username -d database_name > backup.sql

# MySQL
mysqldump -u username -p database_name > backup.sql
```

### Automated Backups
Use Laravel scheduler or cron:
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

---

## Performance Optimization

### Opcache
Enable PHP Opcache in `php.ini`:
```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
```

### CDN Configuration
Configure CDN for static assets:
- Update `APP_URL` to CDN URL
- Configure asset URLs in `config/filesystems.php`

### Database Optimization
- Add indexes for frequently queried columns
- Use database query caching
- Optimize slow queries

---

## Troubleshooting

### Common Issues

**500 Error:**
- Check `storage/logs/laravel.log`
- Verify file permissions (`storage/` and `bootstrap/cache/` should be writable)
- Check `.env` configuration

**Queue Not Processing:**
- Verify queue worker is running
- Check Redis connection
- Review queue logs

**Assets Not Loading:**
- Run `npm run build`
- Check `public/build/` directory exists
- Verify asset URLs in `vite.config.ts`

**Database Connection Issues:**
- Verify database credentials in `.env`
- Check database server is running
- Verify network connectivity

---

## Post-Deployment Checklist

- [ ] Run migrations
- [ ] Clear and cache config
- [ ] Build frontend assets
- [ ] Set up queue workers
- [ ] Configure cron jobs
- [ ] Set up SSL certificates
- [ ] Configure email service
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test all critical features
- [ ] Verify payment processing
- [ ] Test email notifications

---

## Cron Jobs

Add to crontab (`crontab -e`):
```bash
* * * * * cd /path/to && php artisan schedule:run >> /dev/null 2>&1
```

Laravel scheduler handles:
- Queue processing
- Cache clearing
- Scheduled tasks

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Configure shared session storage (Redis)
- Use shared file storage (S3)
- Configure database replication

### Vertical Scaling
- Increase PHP memory limit
- Optimize database queries
- Use Redis for caching
- Enable Opcache

---

**Last Updated:** 2025-12-20

