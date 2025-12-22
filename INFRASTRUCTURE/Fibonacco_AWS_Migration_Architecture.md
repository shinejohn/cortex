# Fibonacco AWS Migration Architecture

## Overview

This document describes the AWS environment equivalent to the current Railway deployment for GoEventCity, Day.News, and Downtown Guide.

---

## Current Railway Services → AWS Equivalents

| Railway Service | AWS Equivalent | Notes |
|----------------|----------------|-------|
| Postgres | Amazon RDS for PostgreSQL | Managed database |
| Valkey | Amazon ElastiCache (Redis OSS) | Valkey-compatible |
| laravel-storage (Bucket) | Amazon S3 | Object storage |
| Scheduler | ECS Task (Scheduled) | CloudWatch Events trigger |
| Horizon | ECS Service (Always-on) | Queue worker |
| Inertia SSR | ECS Service (Node.js) | Server-side rendering |
| GoEventCity | ECS Service + ALB | Web application |
| Day News | ECS Service + ALB | Web application |
| Downtown Guide | ECS Service + ALB | Web application |

---

## Detailed AWS Architecture

### 1. Networking Layer (VPC)

```
┌─────────────────────────────────────────────────────────────────┐
│                         VPC (10.0.0.0/16)                       │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │  Public Subnet A    │    │  Public Subnet B    │            │
│  │  10.0.1.0/24        │    │  10.0.2.0/24        │            │
│  │  (ALB, NAT Gateway) │    │  (ALB)              │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │  Private Subnet A   │    │  Private Subnet B   │            │
│  │  10.0.10.0/24       │    │  10.0.20.0/24       │            │
│  │  (ECS, RDS, Redis)  │    │  (ECS, RDS, Redis)  │            │
│  └─────────────────────┘    └─────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- **VPC**: Isolated network for all Fibonacco services
- **Public Subnets (2 AZs)**: Application Load Balancer, NAT Gateway
- **Private Subnets (2 AZs)**: ECS tasks, RDS, ElastiCache
- **NAT Gateway**: Outbound internet for private subnets
- **Internet Gateway**: Inbound traffic to ALB

---

### 2. Database Layer

#### Amazon RDS for PostgreSQL

| Setting | Value |
|---------|-------|
| Engine | PostgreSQL 15.x |
| Instance Class | db.t3.medium (start), scale to db.r6g.large |
| Storage | 100GB gp3, auto-scaling to 500GB |
| Multi-AZ | Yes (production) |
| Backup Retention | 7 days |
| Encryption | Yes (AWS KMS) |

**Migration Path:**
```bash
# Export from Railway
pg_dump -h <railway-host> -U postgres -d railway -F c -f fibonacco_backup.dump

# Import to RDS
pg_restore -h <rds-endpoint> -U postgres -d fibonacco -F c fibonacco_backup.dump
```

#### Amazon ElastiCache (Redis OSS / Valkey-compatible)

| Setting | Value |
|---------|-------|
| Engine | Redis OSS 7.x |
| Node Type | cache.t3.medium |
| Cluster Mode | Disabled (single node to start) |
| Multi-AZ | Yes with automatic failover |
| Encryption | In-transit and at-rest |

**Purpose:** Laravel queues, session storage, cache (same as Valkey)

---

### 3. Object Storage

#### Amazon S3

| Bucket | Purpose |
|--------|---------|
| `fibonacco-laravel-storage` | User uploads, generated files |
| `fibonacco-assets` | Static assets (optional CDN origin) |

**Configuration:**
- Versioning: Enabled
- Encryption: SSE-S3
- Lifecycle: Move to Glacier after 90 days (optional)
- CloudFront distribution for public assets

---

### 4. Compute Layer (ECS Fargate)

#### ECS Cluster: `fibonacco-cluster`

All services run on **Fargate** (serverless containers) - no EC2 management needed.

---

#### Service: GoEventCity (Web)

```yaml
Service Name: goeventcity-web
Task Definition:
  Container: goeventcity
  Image: <ECR>/goeventcity:latest
  CPU: 512
  Memory: 1024
  Port: 8000
  
  Environment Variables:
    APP_ENV: production
    APP_URL: https://goeventcity.com
    DB_CONNECTION: pgsql
    DB_HOST: <rds-endpoint>
    REDIS_HOST: <elasticache-endpoint>
    AWS_BUCKET: fibonacco-laravel-storage
    
Desired Count: 2
Auto Scaling: 2-10 tasks based on CPU/memory
Health Check: /health
```

---

#### Service: Day.News (Web)

```yaml
Service Name: daynews-web
Task Definition:
  Container: daynews
  Image: <ECR>/daynews:latest
  CPU: 512
  Memory: 1024
  Port: 8000
  
Desired Count: 2  # Matches Railway's 2/2 instances
Auto Scaling: 2-10 tasks
Health Check: /health
```

---

#### Service: Downtown Guide (Web)

```yaml
Service Name: downtownguide-web
Task Definition:
  Container: downtownguide
  Image: <ECR>/downtownguide:latest
  CPU: 512
  Memory: 1024
  Port: 8000
  
Desired Count: 2
Auto Scaling: 2-10 tasks
Health Check: /health
```

---

#### Service: Inertia SSR (Critical for Laravel/Vue)

This is the **server-side rendering service** for Inertia.js/Vue.

```yaml
Service Name: inertia-ssr
Task Definition:
  Container: inertia-ssr
  Image: <ECR>/inertia-ssr:latest
  CPU: 256
  Memory: 512
  Port: 13714  # Default Inertia SSR port
  
  Command: ["node", "bootstrap/ssr/ssr.js"]
  
  Environment Variables:
    NODE_ENV: production
    
Desired Count: 2  # Matches Railway's 2/2 instances
Auto Scaling: 2-6 tasks based on request latency
```

**How Inertia SSR Works:**
1. Laravel apps send render requests to the SSR service
2. SSR service runs Vue components server-side
3. Returns pre-rendered HTML for SEO and initial load speed

**Laravel Configuration:**
```php
// config/inertia.php
'ssr' => [
    'enabled' => true,
    'url' => 'http://inertia-ssr.fibonacco.local:13714/render',
    // In AWS, use service discovery or internal ALB
]
```

---

#### Service: Horizon (Queue Worker)

```yaml
Service Name: horizon
Task Definition:
  Container: horizon
  Image: <ECR>/fibonacco-app:latest
  CPU: 512
  Memory: 1024
  
  Command: ["php", "artisan", "horizon"]
  
  Environment Variables:
    # Same as web apps
    QUEUE_CONNECTION: redis
    
Desired Count: 1
Auto Scaling: 1-4 based on queue depth (custom metric)
```

**Monitoring:**
- CloudWatch alarm on Redis queue length
- Scale Horizon tasks when queues back up

---

#### Scheduled Task: Laravel Scheduler

```yaml
Task Definition: scheduler
  Container: scheduler
  Image: <ECR>/fibonacco-app:latest
  CPU: 256
  Memory: 512
  
  Command: ["php", "artisan", "schedule:run"]

Schedule Rule (EventBridge):
  Rate: rate(1 minute)
  Target: ECS RunTask
```

**Alternative:** Run scheduler as a persistent service with `schedule:work`

---

### 5. Load Balancing & Routing

#### Application Load Balancer (ALB)

```
Internet
    │
    ▼
┌─────────────────────────────────────────┐
│         Application Load Balancer       │
│                                         │
│  Listeners:                             │
│  - 443 (HTTPS) → Target Groups          │
│  - 80 (HTTP) → Redirect to 443          │
└─────────────────────────────────────────┘
    │
    ├── Host: goeventcity.com    → TG: goeventcity-tg
    ├── Host: day.news           → TG: daynews-tg
    └── Host: downtownsguide.com → TG: downtownguide-tg
```

**SSL/TLS:**
- AWS Certificate Manager (ACM) for free SSL certs
- Certificates for all three domains

---

### 6. Service Discovery (for Inertia SSR)

Since web apps need to communicate with the Inertia SSR service internally:

**Option A: AWS Cloud Map (Recommended)**
```
Namespace: fibonacco.local
Service: inertia-ssr.fibonacco.local:13714
```

**Option B: Internal ALB**
- Private ALB routing to Inertia SSR tasks
- Web apps hit `http://internal-alb/ssr`

---

### 7. Container Registry

#### Amazon ECR

| Repository | Purpose |
|------------|---------|
| `fibonacco/goeventcity` | GoEventCity app |
| `fibonacco/daynews` | Day.News app |
| `fibonacco/downtownguide` | Downtown Guide app |
| `fibonacco/inertia-ssr` | SSR service |
| `fibonacco/base-app` | Shared Laravel base (Horizon, Scheduler) |

---

### 8. CI/CD Pipeline

#### AWS CodePipeline + CodeBuild

```
GitHub Push
    │
    ▼
CodePipeline
    │
    ├── Source: GitHub (branch: main)
    │
    ├── Build: CodeBuild
    │   ├── Run tests
    │   ├── Build Docker image
    │   ├── Push to ECR
    │   └── Run migrations (optional)
    │
    └── Deploy: ECS Rolling Update
        └── Update service with new task definition
```

---

## Architecture Diagram

```
                                    ┌─────────────────┐
                                    │   Route 53      │
                                    │   DNS           │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   CloudFront    │
                                    │   (optional)    │
                                    └────────┬────────┘
                                             │
┌────────────────────────────────────────────▼─────────────────────────────────────────┐
│                                         VPC                                          │
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                        Application Load Balancer                            │   │
│   │     goeventcity.com │ day.news │ downtownsguide.com                        │   │
│   └───────────┬─────────────────┬─────────────────┬─────────────────────────────┘   │
│               │                 │                 │                                  │
│   ┌───────────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐                         │
│   │   ECS Service     │ │  ECS Service  │ │  ECS Service  │                         │
│   │   GoEventCity     │ │   Day.News    │ │ Downtown Guide│                         │
│   │   (2 tasks)       │ │   (2 tasks)   │ │   (2 tasks)   │                         │
│   └───────────┬───────┘ └───────┬───────┘ └───────┬───────┘                         │
│               │                 │                 │                                  │
│               └─────────────────┼─────────────────┘                                  │
│                                 │                                                    │
│               ┌─────────────────▼─────────────────┐                                  │
│               │        Inertia SSR Service        │                                  │
│               │           (2 tasks)               │                                  │
│               └─────────────────┬─────────────────┘                                  │
│                                 │                                                    │
│   ┌─────────────────────────────┼─────────────────────────────────┐                  │
│   │                             │                                 │                  │
│   │  ┌──────────────┐  ┌────────▼────────┐  ┌──────────────────┐ │                  │
│   │  │   Horizon    │  │   ElastiCache   │  │    Scheduler     │ │                  │
│   │  │   (queues)   │  │   (Redis/Valkey)│  │   (cron tasks)   │ │                  │
│   │  └──────────────┘  └─────────────────┘  └──────────────────┘ │                  │
│   │                                                               │                  │
│   │  ┌─────────────────────────────────────────────────────────┐ │                  │
│   │  │                Amazon RDS (PostgreSQL)                  │ │                  │
│   │  │                    Multi-AZ                             │ │                  │
│   │  └─────────────────────────────────────────────────────────┘ │                  │
│   └─────────────────────────────────────────────────────────────┘                    │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │    Amazon S3    │
                                    │  (file storage) │
                                    └─────────────────┘
```

---

## Inertia/Laravel Specific Considerations

### 1. SSR Service Communication

The Laravel apps need to reach the Inertia SSR service. Configure in `.env`:

```env
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://inertia-ssr.fibonacco.local:13714
```

### 2. Dockerfile for SSR Service

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy built SSR bundle
COPY bootstrap/ssr /app/ssr

# Install dependencies if needed
RUN npm ci --production

EXPOSE 13714

CMD ["node", "ssr/ssr.js"]
```

### 3. Dockerfile for Laravel Apps

```dockerfile
FROM php:8.3-fpm-alpine

# Install extensions
RUN apk add --no-cache \
    postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader

# Build frontend assets
RUN npm ci && npm run build

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
```

### 4. Session & Cache Configuration

```env
SESSION_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=fibonacco-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=null  # Use if auth enabled
```

---

## Caching Architecture (Complete Layer)

Your Railway Valkey service handles multiple caching responsibilities. Here's how each maps to AWS:

### Caching Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CACHING LAYERS                                     │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: Edge Cache (CloudFront)                                       │   │
│  │  - Full HTML pages for anonymous users                                  │   │
│  │  - Static assets (CSS, JS, images)                                      │   │
│  │  - TTL: 5-60 minutes depending on content type                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓ (cache miss)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: Response Cache (ElastiCache/Redis)                            │   │
│  │  - Full HTTP responses stored by URL + user state                       │   │
│  │  - Spatie Response Cache or custom middleware                           │   │
│  │  - TTL: 1-60 minutes                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓ (cache miss)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: SSR Cache (ElastiCache/Redis)                                 │   │
│  │  - Rendered Inertia/Vue HTML fragments                                  │   │
│  │  - Keyed by route + props hash                                          │   │
│  │  - TTL: 5-30 minutes                                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓ (cache miss)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: Database Query Cache (ElastiCache/Redis)                      │   │
│  │  - Eloquent model results                                               │   │
│  │  - Complex query results                                                │   │
│  │  - Aggregations and computed values                                     │   │
│  │  - TTL: varies by data volatility                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                      ↓ (cache miss)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: PostgreSQL Internal Cache                                     │   │
│  │  - shared_buffers (RDS managed)                                         │   │
│  │  - Query plan cache                                                     │   │
│  │  - Connection pooling (RDS Proxy)                                       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Layer 1: CloudFront Edge Cache

**Configuration:**

```yaml
CloudFront Distribution:
  Origins:
    - ALB (dynamic content)
    - S3 (static assets)
  
  Cache Behaviors:
    # Static assets - long cache
    - PathPattern: /build/*
      TTL: 31536000  # 1 year (versioned assets)
      CachePolicy: CachingOptimized
    
    # Public news articles
    - PathPattern: /news/*
      TTL: 300  # 5 minutes
      CachePolicy: CachingOptimizedForUncompressedObjects
      OriginRequestPolicy: AllViewer (pass cookies for auth check)
    
    # Event pages
    - PathPattern: /events/*
      TTL: 180  # 3 minutes
    
    # Business listings
    - PathPattern: /business/*
      TTL: 600  # 10 minutes
    
    # Default (authenticated/dynamic)
    - PathPattern: *
      TTL: 0
      CachePolicy: CachingDisabled
      OriginRequestPolicy: AllViewer
```

**Cache Invalidation:**
```bash
# Invalidate after content update
aws cloudfront create-invalidation \
  --distribution-id EXXXXX \
  --paths "/news/article-slug" "/events/*"
```

---

### Layer 2: Response Cache (Laravel)

**Package:** `spatie/laravel-responsecache`

```bash
composer require spatie/laravel-responsecache
```

**Configuration:**
```php
// config/responsecache.php
return [
    'enabled' => env('RESPONSE_CACHE_ENABLED', true),
    
    'cache_store' => 'redis',  // Uses ElastiCache
    
    'cache_lifetime_in_seconds' => 60 * 15,  // 15 minutes
    
    // Don't cache authenticated users by default
    'cache_profile' => Spatie\ResponseCache\CacheProfiles\CacheAllSuccessfulGetRequests::class,
    
    'hasher' => Spatie\ResponseCache\Hasher\DefaultHasher::class,
];
```

**Usage in Routes:**
```php
// Cache specific routes
Route::get('/news/{article}', [ArticleController::class, 'show'])
    ->middleware('cacheResponse:600');  // 10 minutes

// Skip cache for authenticated areas
Route::middleware(['auth', 'doNotCacheResponse'])->group(function () {
    Route::get('/dashboard', DashboardController::class);
});
```

---

### Layer 3: SSR Cache

**Custom SSR Cache Middleware:**

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Redis;
use Inertia\Inertia;

class CacheSSRResponse
{
    public function handle($request, Closure $next, $ttl = 300)
    {
        // Skip for authenticated users or non-GET requests
        if ($request->user() || !$request->isMethod('GET')) {
            return $next($request);
        }

        // Generate cache key based on URL and relevant props
        $cacheKey = $this->generateCacheKey($request);

        // Check cache
        if ($cached = Redis::get($cacheKey)) {
            return response($cached)
                ->header('X-SSR-Cache', 'HIT');
        }

        // Process request
        $response = $next($request);

        // Cache successful HTML responses
        if ($response->getStatusCode() === 200 && 
            str_contains($response->headers->get('Content-Type'), 'text/html')) {
            Redis::setex($cacheKey, $ttl, $response->getContent());
        }

        return $response->header('X-SSR-Cache', 'MISS');
    }

    protected function generateCacheKey($request): string
    {
        return 'ssr:' . md5(
            $request->fullUrl() . 
            $request->header('Accept-Language', 'en')
        );
    }
}
```

**Register in Kernel:**
```php
protected $routeMiddleware = [
    'ssr.cache' => \App\Http\Middleware\CacheSSRResponse::class,
];
```

**Apply to routes:**
```php
Route::get('/events/{event}', [EventController::class, 'show'])
    ->middleware('ssr.cache:600');  // 10 min TTL
```

---

### Layer 4: Database Query Cache

**Laravel Cache Configuration:**

```php
// config/cache.php
'default' => env('CACHE_DRIVER', 'redis'),

'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
    
    // Dedicated store for database queries
    'database_cache' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'prefix' => 'db_cache',
    ],
],
```

**Redis Connection (ElastiCache):**
```php
// config/database.php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    
    'default' => [
        'host' => env('REDIS_HOST', 'fibonacco-redis.xxxxx.cache.amazonaws.com'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],
    
    'cache' => [
        'host' => env('REDIS_HOST'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_CACHE_DB', 1),  // Separate DB for cache
    ],
],
```

**Model-Level Caching (Recommended Package):**

```bash
composer require genealabs/laravel-model-caching
```

```php
// app/Models/Event.php
use GeneaLabs\LaravelModelCaching\Traits\Cachable;

class Event extends Model
{
    use Cachable;
    
    // All queries automatically cached
    // Cache invalidated on model changes
}
```

**Manual Query Caching:**

```php
// Cache expensive queries
$popularEvents = Cache::store('database_cache')
    ->remember('popular_events:' . $cityId, 3600, function () use ($cityId) {
        return Event::where('city_id', $cityId)
            ->withCount('attendees')
            ->orderByDesc('attendees_count')
            ->limit(10)
            ->get();
    });

// Cache with tags for easy invalidation
$articles = Cache::tags(['articles', "city:{$cityId}"])
    ->remember("articles:latest:{$cityId}", 900, function () use ($cityId) {
        return Article::where('city_id', $cityId)
            ->latest()
            ->limit(20)
            ->get();
    });

// Invalidate all articles for a city
Cache::tags(["city:{$cityId}"])->flush();
```

**Cache Patterns by Data Type:**

| Data Type | TTL | Invalidation Strategy |
|-----------|-----|----------------------|
| Business listings | 1 hour | On edit, tag-based flush |
| Event details | 15 minutes | On edit, individual key |
| News articles | 30 minutes | On publish/edit |
| User sessions | 2 hours | On logout/activity |
| Aggregations (counts, stats) | 5 minutes | Time-based only |
| Search results | 10 minutes | Tag-based by query params |

---

### Layer 5: PostgreSQL Performance (RDS)

**RDS Proxy (Connection Pooling):**

Prevents connection exhaustion from Fargate tasks scaling up/down.

```yaml
RDS Proxy:
  Name: fibonacco-proxy
  Engine: PostgreSQL
  Target: fibonacco-db (RDS instance)
  
  Connection Pool:
    MaxConnectionsPercent: 50
    MaxIdleConnectionsPercent: 10
    ConnectionBorrowTimeout: 120
```

**Laravel Configuration:**
```env
# Connect via RDS Proxy instead of direct RDS
DB_HOST=fibonacco-proxy.proxy-xxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
```

**Read Replica (Optional - for heavy read loads):**

```yaml
RDS Read Replica:
  Source: fibonacco-db
  Instance Class: db.t3.medium
  Multi-AZ: No (cost savings)
```

```php
// config/database.php
'pgsql' => [
    'read' => [
        'host' => [env('DB_READ_HOST')],  // Read replica
    ],
    'write' => [
        'host' => [env('DB_HOST')],  // Primary
    ],
    'driver' => 'pgsql',
    // ... rest of config
],
```

Laravel automatically routes SELECT queries to read replica.

---

### Cache Warming Strategy

**Scheduled Cache Warming (run via Scheduler):**

```php
// app/Console/Commands/WarmCache.php
class WarmCache extends Command
{
    protected $signature = 'cache:warm';

    public function handle()
    {
        // Warm popular pages
        $cities = City::where('active', true)->get();
        
        foreach ($cities as $city) {
            // Pre-cache homepage data
            Cache::tags(['homepage', "city:{$city->id}"])
                ->remember("homepage:{$city->id}", 3600, function () use ($city) {
                    return [
                        'featured_events' => Event::featured($city->id)->get(),
                        'latest_news' => Article::latest($city->id)->limit(5)->get(),
                        'popular_businesses' => Business::popular($city->id)->get(),
                    ];
                });
        }
        
        $this->info('Cache warmed for ' . $cities->count() . ' cities');
    }
}
```

**Schedule:**
```php
// app/Console/Kernel.php
$schedule->command('cache:warm')->hourly();
```

---

### Cache Monitoring (CloudWatch)

**ElastiCache Metrics to Monitor:**

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| CPUUtilization | > 70% | Scale up node |
| CacheHits / (CacheHits + CacheMisses) | < 80% | Review TTLs, warming |
| Evictions | > 1000/min | Increase memory |
| CurrConnections | > 80% of max | Check connection leaks |
| ReplicationLag | > 1 second | Check replica health |

**CloudWatch Dashboard:**
```yaml
Widgets:
  - Cache Hit Ratio (target: >85%)
  - Response Time by Layer
  - Database Query Time (p99)
  - SSR Render Time
  - Evictions Over Time
```

---

### Environment Variables Summary

```env
# Cache Configuration
CACHE_DRIVER=redis
CACHE_PREFIX=fibonacco

# Redis / ElastiCache
REDIS_HOST=fibonacco-redis.xxxxx.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=null
REDIS_DB=0
REDIS_CACHE_DB=1

# Response Cache
RESPONSE_CACHE_ENABLED=true
RESPONSE_CACHE_LIFETIME=900

# SSR Cache
SSR_CACHE_ENABLED=true
SSR_CACHE_TTL=300

# Database Cache
MODEL_CACHE_ENABLED=true
QUERY_CACHE_TTL=3600

# Session (also in Redis)
SESSION_DRIVER=redis
SESSION_LIFETIME=120
```

---

## Cost Estimate (Monthly)

| Service | Configuration | Est. Cost |
|---------|--------------|-----------|
| RDS PostgreSQL | db.t3.medium, Multi-AZ | ~$70 |
| RDS Proxy | Connection pooling | ~$20 |
| ElastiCache Redis | cache.t3.medium | ~$50 |
| ECS Fargate | ~10 tasks average | ~$150 |
| ALB | 1 ALB, 3 target groups | ~$25 |
| CloudFront | 1TB transfer, 10M requests | ~$100 |
| S3 | 100GB storage | ~$5 |
| Data Transfer | ~500GB/month | ~$45 |
| NAT Gateway | 1 NAT | ~$35 |
| CloudWatch | Enhanced monitoring | ~$15 |
| **Total** | | **~$515/month** |

*With caching properly configured, you'll likely see LOWER costs over time due to reduced compute load and database queries.*

**Archive & AI Crawler Infrastructure (Additional):**

| Service | Configuration | Est. Cost |
|---------|--------------|-----------|
| S3 Archive Storage | Multi-tier lifecycle | ~$25 |
| CloudFront | Crawler traffic | ~$50 |
| DynamoDB/Archive Index | On-demand | ~$25 |
| **Archive Subtotal** | | **~$100/month** |

**Combined Total: ~$615/month** (grows slowly with archive size)

*Costs scale with traffic. This assumes moderate usage similar to Railway Pro tier.*

---

## Migration Checklist

- [ ] Create VPC with subnets
- [ ] Set up RDS PostgreSQL
- [ ] Set up ElastiCache Redis
- [ ] Create S3 bucket (application storage)
- [ ] Create S3 bucket (archive storage with lifecycle policies)
- [ ] Create ECR repositories
- [ ] Build and push Docker images
- [ ] Create ECS cluster and task definitions
- [ ] Configure ALB with SSL certificates
- [ ] Set up service discovery for SSR
- [ ] Migrate database (pg_dump/pg_restore)
- [ ] Update DNS records
- [ ] Test all three sites
- [ ] Set up CloudWatch monitoring
- [ ] Configure auto-scaling policies
- [ ] Deploy robots.txt and llms.txt
- [ ] Generate initial sitemaps
- [ ] Set up sitemap generation schedule
- [ ] Implement Schema.org structured data
- [ ] Configure archive service and scheduling
- [ ] Set up crawler activity monitoring
- [ ] Configure CloudFront for archive access
- [ ] Test AI crawler access (GPTBot, etc.)

---

## AI Crawler Accessibility & Historical Archive

### Strategic Value

With 8,000 communities publishing daily, you're building one of the largest local content repositories in the US. This has tremendous value for:

- **AI Training Data**: LLMs need quality local content (currently underrepresented)
- **Search/Discovery**: AI-powered search (Perplexity, Google AI, ChatGPT) surfaces content
- **Historical Record**: Years of community news becomes invaluable reference
- **Data Licensing**: Future revenue stream (licensing to AI companies)

---

### AI Crawler Configuration

#### 1. robots.txt (AI-Friendly)

```txt
# robots.txt - Fibonacco AI-Friendly Configuration

User-agent: *
Allow: /

# Explicitly welcome AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Sitemaps
Sitemap: https://day.news/sitemap_index.xml
Sitemap: https://goeventcity.com/sitemap_index.xml
Sitemap: https://downtownsguide.com/sitemap_index.xml

# Rate limiting hint
Crawl-delay: 1
```

#### 2. llms.txt (New Standard for AI)

Create `/llms.txt` for each domain - a new standard specifically for LLM crawlers:

```txt
# llms.txt - Day.News

> Day.News is a local news platform covering 8,000+ American communities.
> We publish daily local news, events, and business information.
> Our content is freely available for AI training and retrieval.

# Content Structure
- /news/{community}/{article-slug} - News articles
- /communities/{state}/{city} - Community landing pages
- /archive/{year}/{month} - Historical archive
- /api/v1/articles - JSON API (rate limited)

# Schema
Articles use Schema.org NewsArticle markup.
All content includes structured JSON-LD.

# Licensing
Content may be used for AI training with attribution.
Commercial licensing available: ai-licensing@fibonacco.com

# API Access
For bulk access, contact: api@fibonacco.com
Rate limit: 100 requests/minute for crawlers

# Updates
New content published: Daily, 6:00 AM local time per community
Archive depth: Full history since launch
```

#### 3. Sitemap Strategy (Scale for 8,000 Communities)

**Sitemap Index Structure:**

```xml
<!-- sitemap_index.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- State-level sitemaps -->
  <sitemap>
    <loc>https://day.news/sitemaps/states/alabama.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://day.news/sitemaps/states/alaska.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <!-- ... 50 states ... -->
  
  <!-- Archive sitemaps by year/month -->
  <sitemap>
    <loc>https://day.news/sitemaps/archive/2025-01.xml</loc>
    <lastmod>2025-02-01</lastmod>
  </sitemap>
  
  <!-- Google News sitemap (last 48 hours) -->
  <sitemap>
    <loc>https://day.news/sitemaps/news.xml</loc>
    <lastmod>2025-01-15T12:00:00Z</lastmod>
  </sitemap>
</sitemapindex>
```

**Per-State Sitemap Example:**

```xml
<!-- sitemaps/states/florida.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <url>
    <loc>https://day.news/florida/spring-hill/local-business-expansion-2025</loc>
    <lastmod>2025-01-15T08:00:00Z</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>Day.News - Spring Hill</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>2025-01-15</news:publication_date>
      <news:title>Local Business Expansion Brings 50 Jobs to Spring Hill</news:title>
    </news:news>
  </url>
  
  <!-- Thousands more URLs per state -->
</urlset>
```

**Sitemap Generation (Laravel Command):**

```php
<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Models\Community;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateSitemaps extends Command
{
    protected $signature = 'sitemaps:generate';
    
    public function handle()
    {
        $states = Community::distinct('state')->pluck('state');
        $sitemapIndex = [];
        
        foreach ($states as $state) {
            $urls = $this->generateStateSitemap($state);
            $filename = "sitemaps/states/{$state}.xml";
            Storage::disk('s3')->put($filename, $urls);
            
            $sitemapIndex[] = [
                'loc' => config('app.url') . '/' . $filename,
                'lastmod' => now()->toIso8601String(),
            ];
        }
        
        // Generate archive sitemaps
        $this->generateArchiveSitemaps($sitemapIndex);
        
        // Generate news sitemap (last 48 hours)
        $this->generateNewsSitemap($sitemapIndex);
        
        // Write sitemap index
        $this->writeSitemapIndex($sitemapIndex);
        
        $this->info('Sitemaps generated successfully');
    }
    
    protected function generateStateSitemap(string $state): string
    {
        $articles = Article::whereHas('community', fn($q) => $q->where('state', $state))
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->limit(50000)  // Sitemap limit
            ->get();
            
        return view('sitemaps.state', compact('articles'))->render();
    }
}
```

**Schedule:**
```php
$schedule->command('sitemaps:generate')->dailyAt('05:00');
```

---

### Structured Data (Schema.org)

#### News Article Schema

```php
// app/View/Components/ArticleSchema.php
class ArticleSchema extends Component
{
    public function render()
    {
        return view('components.article-schema');
    }
}
```

```blade
<!-- resources/views/components/article-schema.blade.php -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "{{ $article->title }}",
  "description": "{{ $article->excerpt }}",
  "image": [
    "{{ $article->featured_image_url }}"
  ],
  "datePublished": "{{ $article->published_at->toIso8601String() }}",
  "dateModified": "{{ $article->updated_at->toIso8601String() }}",
  "author": {
    "@type": "Organization",
    "name": "Day.News - {{ $article->community->name }}",
    "url": "{{ route('community.show', $article->community) }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Day.News",
    "logo": {
      "@type": "ImageObject",
      "url": "https://day.news/images/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{ $article->url }}"
  },
  "about": {
    "@type": "Place",
    "name": "{{ $article->community->name }}, {{ $article->community->state }}",
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "{{ $article->community->latitude }}",
      "longitude": "{{ $article->community->longitude }}"
    }
  },
  "keywords": "{{ implode(', ', $article->tags->pluck('name')->toArray()) }}",
  "articleSection": "{{ $article->category->name }}",
  "wordCount": {{ str_word_count($article->content) }},
  "inLanguage": "en-US"
}
</script>
```

#### Event Schema (GoEventCity)

```blade
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "{{ $event->title }}",
  "description": "{{ $event->description }}",
  "startDate": "{{ $event->start_date->toIso8601String() }}",
  "endDate": "{{ $event->end_date->toIso8601String() }}",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/{{ $event->is_virtual ? 'OnlineEventAttendanceMode' : 'OfflineEventAttendanceMode' }}",
  "location": {
    "@type": "Place",
    "name": "{{ $event->venue_name }}",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "{{ $event->address }}",
      "addressLocality": "{{ $event->community->name }}",
      "addressRegion": "{{ $event->community->state }}",
      "postalCode": "{{ $event->zip }}",
      "addressCountry": "US"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "{{ $event->organizer_name }}",
    "url": "{{ $event->organizer_url }}"
  },
  "image": "{{ $event->image_url }}"
}
</script>
```

#### Local Business Schema (Downtown Guide)

```blade
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{{ $business->name }}",
  "description": "{{ $business->description }}",
  "image": "{{ $business->logo_url }}",
  "telephone": "{{ $business->phone }}",
  "email": "{{ $business->email }}",
  "url": "{{ $business->website }}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{ $business->address }}",
    "addressLocality": "{{ $business->community->name }}",
    "addressRegion": "{{ $business->community->state }}",
    "postalCode": "{{ $business->zip }}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{ $business->latitude }}",
    "longitude": "{{ $business->longitude }}"
  },
  "openingHoursSpecification": {!! json_encode($business->hours_schema) !!},
  "priceRange": "{{ $business->price_range }}",
  "servesCuisine": "{{ $business->cuisine_type }}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{ $business->average_rating }}",
    "reviewCount": "{{ $business->review_count }}"
  }
}
</script>
```

---

### Historical Archive Architecture

#### Storage Tiers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CONTENT LIFECYCLE                                   │
│                                                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐    │
│   │   HOT       │    │   WARM      │    │       COLD              │    │
│   │  (0-90 days)│───▶│ (90d-1 year)│───▶│    (1+ years)           │    │
│   └─────────────┘    └─────────────┘    └─────────────────────────┘    │
│                                                                         │
│   PostgreSQL RDS     S3 Standard-IA     S3 Glacier Instant Retrieval   │
│   + ElastiCache      + CloudFront       + Archive Database             │
│                                                                         │
│   Full functionality  Read-only views   Searchable, slower retrieval   │
│   Real-time updates   Cached heavily    Preserved forever              │
└─────────────────────────────────────────────────────────────────────────┘
```

#### S3 Bucket Structure for Archive

```
fibonacco-archive/
├── articles/
│   ├── 2025/
│   │   ├── 01/
│   │   │   ├── day-news/
│   │   │   │   ├── florida/
│   │   │   │   │   ├── spring-hill/
│   │   │   │   │   │   ├── article-123.json
│   │   │   │   │   │   ├── article-123.html  (rendered snapshot)
│   │   │   │   │   │   └── article-123-media/
│   │   │   │   │   │       ├── image-1.jpg
│   │   │   │   │   │       └── image-2.jpg
│   │   │   │   │   └── ...
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── ...
│   └── ...
├── events/
│   └── ... (similar structure)
├── businesses/
│   └── ... (versioned snapshots)
└── metadata/
    ├── communities.json
    ├── categories.json
    └── schema-versions.json
```

#### Archive JSON Format

```json
{
  "schema_version": "1.0",
  "archived_at": "2025-01-15T00:00:00Z",
  "source": "day.news",
  "content_type": "article",
  "id": "article-123",
  "canonical_url": "https://day.news/florida/spring-hill/local-news-story",
  "community": {
    "id": "spring-hill-fl",
    "name": "Spring Hill",
    "state": "Florida",
    "county": "Hernando",
    "coordinates": {
      "lat": 28.4786,
      "lng": -82.5276
    }
  },
  "content": {
    "title": "Local Business Expansion Announcement",
    "excerpt": "...",
    "body_html": "...",
    "body_text": "...",
    "word_count": 450,
    "reading_time_minutes": 2
  },
  "metadata": {
    "author": "Day.News Editorial",
    "published_at": "2025-01-14T08:00:00Z",
    "updated_at": "2025-01-14T10:30:00Z",
    "category": "Business",
    "tags": ["local-business", "jobs", "economic-development"],
    "featured_image": "https://cdn.day.news/images/article-123-hero.jpg"
  },
  "engagement": {
    "views": 1523,
    "shares": 45,
    "comments": 12
  },
  "related_entities": {
    "businesses_mentioned": ["business-456"],
    "events_mentioned": [],
    "people_mentioned": ["John Smith"]
  },
  "checksums": {
    "content_md5": "abc123...",
    "full_record_sha256": "def456..."
  }
}
```

#### S3 Lifecycle Policy

```json
{
  "Rules": [
    {
      "ID": "ArchiveToGlacier",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "articles/"
      },
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 365,
          "StorageClass": "GLACIER_IR"
        },
        {
          "Days": 1825,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "NoncurrentVersionTransitions": [
        {
          "NoncurrentDays": 30,
          "StorageClass": "GLACIER_IR"
        }
      ]
    }
  ]
}
```

#### Archive Database (DynamoDB or PostgreSQL Archive)

For fast historical search without hitting S3:

```sql
-- Archive index table (stays in PostgreSQL or DynamoDB)
CREATE TABLE article_archive_index (
    id UUID PRIMARY KEY,
    original_id BIGINT,
    community_id INT,
    title TEXT,
    excerpt TEXT,
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ,
    s3_path TEXT,
    content_hash VARCHAR(64),
    word_count INT,
    category VARCHAR(100),
    tags TEXT[],
    
    -- Full-text search
    search_vector TSVECTOR,
    
    -- Indexing
    CONSTRAINT idx_archive_community_date 
        INDEX (community_id, published_at DESC),
    CONSTRAINT idx_archive_search 
        INDEX USING GIN (search_vector)
);

-- Partition by year for performance
CREATE TABLE article_archive_2025 PARTITION OF article_archive_index
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE article_archive_2026 PARTITION OF article_archive_index
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

#### Archive Service (Laravel)

```php
<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Facades\Storage;

class ArchiveService
{
    public function archiveArticle(Article $article): void
    {
        $archiveData = $this->buildArchiveRecord($article);
        
        // Store JSON to S3
        $path = $this->getArchivePath($article);
        Storage::disk('s3-archive')->put(
            $path . '.json',
            json_encode($archiveData, JSON_PRETTY_PRINT)
        );
        
        // Store rendered HTML snapshot
        $html = view('articles.archive-snapshot', compact('article'))->render();
        Storage::disk('s3-archive')->put($path . '.html', $html);
        
        // Copy media files
        $this->archiveMedia($article, $path);
        
        // Update archive index
        ArchiveIndex::updateOrCreate(
            ['original_id' => $article->id],
            [
                'community_id' => $article->community_id,
                'title' => $article->title,
                's3_path' => $path,
                'published_at' => $article->published_at,
                'archived_at' => now(),
            ]
        );
    }
    
    protected function getArchivePath(Article $article): string
    {
        return sprintf(
            'articles/%s/%s/day-news/%s/%s/%s',
            $article->published_at->format('Y'),
            $article->published_at->format('m'),
            strtolower($article->community->state),
            Str::slug($article->community->name),
            $article->slug
        );
    }
    
    public function retrieveFromArchive(string $path): array
    {
        $json = Storage::disk('s3-archive')->get($path . '.json');
        return json_decode($json, true);
    }
}
```

**Schedule archiving:**
```php
// Archive articles older than 90 days nightly
$schedule->command('archive:articles --days=90')->dailyAt('02:00');
```

---

### Public API for AI Access

#### Rate-Limited JSON API

```php
// routes/api.php
Route::prefix('v1')->middleware(['throttle:ai-crawlers'])->group(function () {
    Route::get('/articles', [ArticleApiController::class, 'index']);
    Route::get('/articles/{id}', [ArticleApiController::class, 'show']);
    Route::get('/communities', [CommunityApiController::class, 'index']);
    Route::get('/communities/{id}/articles', [CommunityApiController::class, 'articles']);
    Route::get('/archive/{year}/{month}', [ArchiveApiController::class, 'index']);
});
```

**Rate Limiting:**
```php
// app/Providers/RouteServiceProvider.php
RateLimiter::for('ai-crawlers', function (Request $request) {
    // Identify AI crawlers by User-Agent
    $isAiCrawler = Str::contains($request->userAgent(), [
        'GPTBot', 'ChatGPT', 'Claude', 'Perplexity', 'Anthropic'
    ]);
    
    return $isAiCrawler
        ? Limit::perMinute(100)->by($request->ip())
        : Limit::perMinute(30)->by($request->ip());
});
```

**API Response Format:**
```json
{
  "data": [
    {
      "id": "article-123",
      "type": "article",
      "attributes": {
        "title": "...",
        "content": "...",
        "published_at": "2025-01-15T08:00:00Z",
        "community": "Spring Hill, FL",
        "category": "Business",
        "tags": ["local-business", "jobs"]
      },
      "links": {
        "self": "https://day.news/api/v1/articles/123",
        "canonical": "https://day.news/florida/spring-hill/article-slug"
      }
    }
  ],
  "meta": {
    "total": 15234,
    "per_page": 100,
    "current_page": 1
  },
  "links": {
    "next": "https://day.news/api/v1/articles?page=2"
  }
}
```

---

### Content Delivery for Crawlers

#### Dedicated Crawler Infrastructure

```
                         ┌─────────────────────┐
                         │   Route 53 DNS      │
                         │                     │
                         │  day.news           │
                         │  api.day.news       │
                         │  archive.day.news   │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │   CloudFront    │   │   CloudFront    │   │   CloudFront    │
    │   (Main Site)   │   │   (API)         │   │   (Archive)     │
    │                 │   │                 │   │                 │
    │   Cache: Short  │   │   Cache: None   │   │   Cache: Long   │
    │   (5-15 min)    │   │   (real-time)   │   │   (24 hours)    │
    └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
             │                     │                     │
             ▼                     ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │   ALB           │   │   API Gateway   │   │   S3 Origin     │
    │   (ECS Apps)    │   │   + Lambda      │   │   (Archive)     │
    └─────────────────┘   └─────────────────┘   └─────────────────┘
```

#### CloudFront Behavior for AI Crawlers

```yaml
# Separate cache behavior for known AI bots
CacheBehaviors:
  - PathPattern: "*"
    CachePolicyId: CrawlerOptimized
    OriginRequestPolicyId: AllViewerAndCloudFrontHeaders
    
    # Custom Lambda@Edge to detect AI crawlers
    LambdaFunctionAssociations:
      - EventType: viewer-request
        LambdaFunctionARN: arn:aws:lambda:...:detect-ai-crawler

CachePolicies:
  CrawlerOptimized:
    MinTTL: 300       # 5 minutes minimum
    MaxTTL: 3600      # 1 hour maximum  
    DefaultTTL: 900   # 15 minutes default
    # AI crawlers get cached content - reduces origin load
```

---

### Monitoring AI Crawler Activity

#### CloudWatch Metrics

```yaml
Metrics:
  - AICrawlerRequests:
      Namespace: Fibonacco/Crawlers
      Dimensions: [BotName, Domain, ContentType]
      
  - CrawlCoverage:
      Namespace: Fibonacco/Crawlers
      # Percentage of content crawled in last 30 days
      
  - ArchiveRetrievals:
      Namespace: Fibonacco/Archive
      Dimensions: [Year, Community, Source]
```

#### Crawler Activity Dashboard

```sql
-- Track what AI systems are crawling
CREATE TABLE crawler_activity_log (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    bot_name VARCHAR(50),
    user_agent TEXT,
    ip_address INET,
    path TEXT,
    community_id INT,
    content_type VARCHAR(50),
    response_code INT,
    response_time_ms INT
);

-- Daily summary view
CREATE MATERIALIZED VIEW crawler_daily_summary AS
SELECT 
    date_trunc('day', timestamp) as date,
    bot_name,
    COUNT(*) as requests,
    COUNT(DISTINCT community_id) as communities_crawled,
    COUNT(DISTINCT path) as unique_pages,
    AVG(response_time_ms) as avg_response_time
FROM crawler_activity_log
GROUP BY 1, 2;
```

---

### Cost Estimate for Archive

| Service | Configuration | Est. Monthly Cost |
|---------|--------------|-------------------|
| S3 Standard | 100GB (current content) | ~$2.30 |
| S3 Standard-IA | 500GB (3-12 months) | ~$6.25 |
| S3 Glacier IR | 2TB (1-5 years) | ~$8.00 |
| S3 Deep Archive | 10TB (5+ years) | ~$10.00 |
| CloudFront | Additional crawler traffic | ~$50 |
| DynamoDB | Archive index (on-demand) | ~$25 |
| **Total Archive** | | **~$100/month** |

*Grows slowly - S3 Glacier is $0.004/GB/month*

---

### Future Revenue: AI Data Licensing

Structure for future monetization:

```
Free Tier (robots.txt + llms.txt):
- Standard web crawling
- Public API (100 req/min)
- Attribution required

Licensed Tier ($X/month):
- Bulk data exports
- Real-time firehose
- No rate limits
- Historical archive access
- Commercial use rights

Enterprise Tier (Custom):
- Dedicated API endpoints
- Custom data formats
- SLA guarantees
- Exclusivity options
```

---

## Questions to Resolve

1. **Single database or separate?** Currently appears shared - recommend keeping shared
2. **Shared codebase or monorepo?** Affects ECR and deployment strategy
3. **Blue/green deployments?** ECS supports this natively
4. **Logging preference?** CloudWatch Logs or ship to external (DataDog, etc.)
5. **Archive retention policy?** How long to keep in each storage tier?
6. **AI licensing strategy?** Free crawling vs. paid bulk access timeline?
7. **Archive search requirements?** Full-text search across years of content?
8. **Media archival?** Store all images/video or just metadata + thumbnails?
9. **Legal/compliance requirements?** Any content that must be retained or deleted?

---

## Infrastructure Management Platform

### Why Use a Third-Party Tool?

Managing AWS infrastructure manually via the console is:
- Error-prone and non-repeatable
- Impossible to version control
- Difficult to replicate for dev environments
- A nightmare for onboarding new developers

Infrastructure as Code (IaC) solves this by defining your entire AWS setup in code files that can be versioned, reviewed, and deployed automatically.

---

### Platform Comparison

| Platform | Language | Learning Curve | Best For | Pricing |
|----------|----------|----------------|----------|---------|
| **Pulumi** | TypeScript, Python, Go | Medium | Dev teams who prefer real code | Free tier + $1.10/resource/month |
| **Terraform** | HCL (custom DSL) | Medium | Industry standard, most docs | Free (open core) |
| **Terraform Cloud** | HCL | Medium | Teams wanting managed Terraform | $0.00014/RUM/hour (~$500+/mo) |
| **OpenTofu** | HCL | Medium | Terraform without license concerns | Free (open source) |
| **Spacelift** | TF/Pulumi/etc | Low-Medium | Enterprise governance | $399/month (10 users) |
| **env0** | TF/Pulumi/etc | Low-Medium | Cost controls + governance | Custom pricing |
| **AWS CDK** | TypeScript, Python | Medium | AWS-only shops | Free |

---

### Recommendation: Pulumi

**Why Pulumi is the best fit for Fibonacco:**

1. **Familiar Language**: Write infrastructure in TypeScript - same as your Vue.js frontend. No learning a new DSL.

2. **Full IDE Support**: Autocomplete, type checking, error detection in VS Code/Cursor.

3. **Testing**: Unit test your infrastructure like application code.

4. **AI-Friendly**: LLMs understand TypeScript better than HCL, making AI-assisted infrastructure development smoother.

5. **State Management**: Pulumi Cloud handles state (like Terraform Cloud) with a generous free tier.

6. **Same-Day AWS Support**: Native AWS provider gets new services immediately.

7. **Cost**: Free tier covers ~200 resources. Beyond that, ~$1.10/resource/month.

**Example - Why TypeScript beats HCL:**

```hcl
# Terraform HCL - Custom syntax to learn
resource "aws_ecs_service" "goeventcity" {
  name            = "goeventcity"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.goeventcity.arn
  desired_count   = 2
  
  load_balancer {
    target_group_arn = aws_lb_target_group.goeventcity.arn
    container_name   = "goeventcity"
    container_port   = 8000
  }
}
```

```typescript
// Pulumi TypeScript - Familiar syntax
const goeventcityService = new aws.ecs.Service("goeventcity", {
    name: "goeventcity",
    cluster: cluster.id,
    taskDefinition: goeventcityTask.arn,
    desiredCount: 2,
    loadBalancers: [{
        targetGroupArn: goeventcityTargetGroup.arn,
        containerName: "goeventcity",
        containerPort: 8000,
    }],
});
```

---

### Alternative: Terraform + Spacelift

If you prefer the industry standard with a management layer:

- **Terraform/OpenTofu** for the IaC definitions
- **Spacelift** for CI/CD, drift detection, policy enforcement
- **$399/month** for predictable pricing (vs Terraform Cloud's RUM model)

This is more mature but requires learning HCL.

---

### Infrastructure Code Structure

We'll organize the Pulumi project alongside your application code:

```
fibonacco/
├── apps/
│   ├── goeventcity/
│   ├── daynews/
│   └── downtownguide/
├── infrastructure/                 # Pulumi project
│   ├── index.ts                   # Main entry point
│   ├── package.json
│   ├── Pulumi.yaml                # Project config
│   ├── Pulumi.dev.yaml            # Dev environment config
│   ├── Pulumi.staging.yaml        # Staging config
│   ├── Pulumi.production.yaml     # Production config
│   └── src/
│       ├── networking/
│       │   └── vpc.ts             # VPC, subnets, NAT
│       ├── database/
│       │   ├── rds.ts             # PostgreSQL
│       │   └── elasticache.ts     # Redis/Valkey
│       ├── storage/
│       │   ├── s3.ts              # Application + archive buckets
│       │   └── ecr.ts             # Container registry
│       ├── compute/
│       │   ├── cluster.ts         # ECS cluster
│       │   ├── services.ts        # Web apps, Horizon, SSR
│       │   └── tasks.ts           # Scheduled tasks
│       ├── loadbalancing/
│       │   └── alb.ts             # ALB + target groups
│       ├── cdn/
│       │   └── cloudfront.ts      # CloudFront distributions
│       ├── dns/
│       │   └── route53.ts         # DNS records
│       └── monitoring/
│           └── cloudwatch.ts      # Alarms + dashboards
└── docker/
    ├── Dockerfile.web
    ├── Dockerfile.horizon
    └── Dockerfile.ssr
```

---

### Developer Environments with Pulumi

Remember your original question about developer isolation? Pulumi handles this elegantly:

```bash
# Create environments (called "stacks" in Pulumi)
pulumi stack init dev-shine      # Your environment
pulumi stack init dev-other      # Other developer
pulumi stack init staging
pulumi stack init production

# Deploy your isolated environment
pulumi stack select dev-shine
pulumi up

# Each stack gets its own:
# - VPC
# - RDS instance
# - ElastiCache
# - ECS services
# - Everything isolated
```

**Cost control for dev environments:**
```typescript
// src/config.ts
const env = pulumi.getStack();

export const config = {
    database: {
        instanceClass: env === "production" 
            ? "db.r6g.large" 
            : "db.t3.micro",  // Tiny for dev
        multiAz: env === "production",
    },
    ecs: {
        desiredCount: env === "production" ? 2 : 1,
        cpu: env === "production" ? 512 : 256,
    },
};
```

---

### CI/CD Pipeline

Pulumi integrates with GitHub Actions for automatic deployments:

```yaml
# .github/workflows/infrastructure.yml
name: Infrastructure

on:
  push:
    branches: [main]
    paths: ['infrastructure/**']
  pull_request:
    paths: ['infrastructure/**']

jobs:
  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pulumi/actions@v5
        with:
          command: preview
          stack-name: staging
          work-dir: infrastructure
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pulumi/actions@v5
        with:
          command: up
          stack-name: production
          work-dir: infrastructure
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

### Getting Started

```bash
# Install Pulumi CLI
curl -fsSL https://get.pulumi.com | sh

# Create account at pulumi.com (free tier)

# Initialize project
cd fibonacco
mkdir infrastructure && cd infrastructure
pulumi new aws-typescript

# Install AWS provider
npm install @pulumi/aws @pulumi/awsx

# Configure AWS credentials
aws configure
# Or set environment variables

# Deploy!
pulumi up
```

---

### Build Infrastructure Alongside Platform

**Yes, we can absolutely build the Pulumi code while defining the architecture.**

Recommended approach:

1. **Phase 1 (Now)**: Create the base Pulumi project with VPC, database, cache
2. **Phase 2**: Add ECS cluster and container definitions
3. **Phase 3**: Configure ALB, CloudFront, DNS
4. **Phase 4**: Add monitoring, alarms, archive infrastructure
5. **Phase 5**: Set up CI/CD pipeline

Each phase deploys incrementally - you can test as you go rather than doing a big-bang migration.

**Want me to generate the Pulumi TypeScript code for Phase 1 (networking + database)?**
