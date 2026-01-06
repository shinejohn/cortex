# AWS Multisite Domain Setup Guide

## Overview

This guide explains how to configure AWS infrastructure to host all 5 multisite applications and map domains to the correct apps/frontends.

## Architecture

All 5 applications share the **same ECS infrastructure** but use **different domains**. Laravel's `DetectAppDomain` middleware routes requests to the correct app based on the Host header.

### Applications

1. **Event City** → `goeventcity.com` / `{env}.goeventcity.com`
2. **Day News** → `day.news` / `{env}.day.news`
3. **Downtown Guide** → `downtownsguide.com` / `{env}.downtownsguide.com`
4. **Go Local Voices** → `golocalvoices.com` / `{env}.golocalvoices.com`
5. **Alphasite** → `alphasite.com` / `{env}.alphasite.com`

## Infrastructure Components

### 1. Application Load Balancer (ALB)

The ALB receives all traffic and routes to the appropriate target group based on Host header:

- **HTTP Listener (Port 80)**: Redirects to HTTPS
- **HTTPS Listener (Port 443)**: Routes based on Host header to target groups
- **Target Groups**: One per domain (all point to same ECS service)

### 2. ECS Services

All domains share the **same ECS task definition** but have separate services for:
- Health checks per domain
- Service discovery
- Scaling per domain (if needed)

### 3. Route 53 DNS

Each domain needs DNS records pointing to the ALB.

## Step-by-Step Setup

### Step 1: Deploy Infrastructure

```bash
cd INFRASTRUCTURE

# Initialize Pulumi stack (if not already done)
pulumi stack init dev
pulumi stack init staging
pulumi stack init production

# Deploy infrastructure
pulumi up
```

This creates:
- VPC with public/private subnets
- RDS PostgreSQL database
- ElastiCache Redis
- Application Load Balancer
- ECS Cluster with services
- S3 buckets
- CloudWatch monitoring

### Step 2: Configure DNS Records

After deployment, get the ALB DNS name:

```bash
pulumi stack output load_balancer_dns
```

For each domain, create **CNAME records** in Route 53 (or your DNS provider):

#### Production Domains

```
goeventcity.com          → CNAME → {ALB_DNS_NAME}
day.news                 → CNAME → {ALB_DNS_NAME}
downtownsguide.com       → CNAME → {ALB_DNS_NAME}
golocalvoices.com        → CNAME → {ALB_DNS_NAME}
alphasite.com            → CNAME → {ALB_DNS_NAME}
```

#### Staging/Dev Domains

```
dev.goeventcity.com      → CNAME → {ALB_DNS_NAME}
dev.day.news             → CNAME → {ALB_DNS_NAME}
dev.downtownsguide.com   → CNAME → {ALB_DNS_NAME}
dev.golocalvoices.com    → CNAME → {ALB_DNS_NAME}
dev.alphasite.com        → CNAME → {ALB_DNS_NAME}
```

**Note:** For `day.news`, you may need to use an A record with ALIAS instead of CNAME if your DNS provider doesn't support CNAME at the root.

### Step 3: Request SSL Certificates (Production)

For production, request ACM certificates for each domain:

```bash
# Request certificate for goeventcity.com
aws acm request-certificate \
  --domain-name goeventcity.com \
  --domain-name "*.goeventcity.com" \
  --validation-method DNS \
  --region us-east-1

# Repeat for each domain:
# - day.news
# - downtownsguide.com
# - golocalvoices.com
# - alphasite.com
```

After validation, update `INFRASTRUCTURE/loadbalancing/alb.py` to use HTTPS listeners with certificates.

### Step 4: Update Environment Variables

Ensure your ECS task definition includes domain configuration:

```env
# In AWS Secrets Manager or ECS task environment variables
GOEVENTCITY_DOMAIN=goeventcity.com
DAYNEWS_DOMAIN=day.news
DOWNTOWNGUIDE_DOMAIN=downtownsguide.com
LOCAL_VOICES_DOMAIN=golocalvoices.com
ALPHASITE_DOMAIN=alphasite.com
```

### Step 5: Verify Domain Routing

Test each domain:

```bash
# Test Event City
curl -H "Host: goeventcity.com" https://{ALB_DNS_NAME}/

# Test Day News
curl -H "Host: day.news" https://{ALB_DNS_NAME}/

# Test Downtown Guide
curl -H "Host: downtownsguide.com" https://{ALB_DNS_NAME}/

# Test Go Local Voices
curl -H "Host: golocalvoices.com" https://{ALB_DNS_NAME}/

# Test Alphasite
curl -H "Host: alphasite.com" https://{ALB_DNS_NAME}/
```

Each should return 200 with the correct app content.

## How Domain-to-App Mapping Works

### Backend (Laravel)

1. **Request arrives** at ALB with Host header (e.g., `day.news`)
2. **ALB routes** to ECS service based on Host header
3. **Laravel receives** request with Host header
4. **DetectAppDomain middleware** (`app/Http/Middleware/DetectAppDomain.php`) reads Host header
5. **Middleware matches** Host to domain config (`config/domains.php`)
6. **Sets** `app.current_domain` to `'day-news'`
7. **Routes** to `routes/day-news.php` based on domain constraint in `bootstrap/app.php`
8. **Inertia renders** `resources/js/pages/day-news/index.tsx`

### Frontend (React)

1. **Inertia passes** `appDomain` prop to all pages
2. **Pages conditionally render** based on `appDomain`:
   - `appDomain === 'day-news'` → Day News components
   - `appDomain === 'event-city'` → Event City components
   - etc.

### Configuration Files

#### `config/domains.php`
```php
'event-city' => env('GOEVENTCITY_DOMAIN', 'goeventcity.test'),
'day-news' => env('DAYNEWS_DOMAIN', 'daynews.test'),
'downtown-guide' => env('DOWNTOWNGUIDE_DOMAIN', 'downtownguide.test'),
'local-voices' => env('LOCAL_VOICES_DOMAIN', 'golocalvoices.com'),
'alphasite' => env('ALPHASITE_DOMAIN', 'alphasite.com'),
```

#### `bootstrap/app.php`
```php
// DayNews domain routes
Route::domain(config('domains.day-news'))
    ->middleware('web')
    ->name('daynews.')
    ->group(function () {
        require base_path('routes/day-news.php');
    });

// Similar for other domains...
```

#### `app/Http/Middleware/DetectAppDomain.php`
```php
$appType = match ($host) {
    config('domains.day-news') => 'day-news',
    config('domains.downtown-guide') => 'downtown-guide',
    config('domains.event-city') => 'event-city',
    default => 'event-city',
};
config(['app.current_domain' => $appType]);
```

## Troubleshooting

### Domain Not Routing Correctly

1. **Check DNS**: Verify CNAME records point to ALB
   ```bash
   dig goeventcity.com CNAME
   ```

2. **Check ALB Listener Rules**: Verify Host header rules exist
   ```bash
   aws elbv2 describe-rules --listener-arn {LISTENER_ARN}
   ```

3. **Check Laravel Logs**: Verify `app.current_domain` is set correctly
   ```bash
   # In ECS task logs
   tail -f /var/log/laravel.log | grep "current_domain"
   ```

4. **Test with curl**: Use Host header to test routing
   ```bash
   curl -v -H "Host: day.news" https://{ALB_DNS_NAME}/
   ```

### Wrong App Rendering

1. **Check `.env`**: Verify domain variables match actual domains
2. **Check `config/domains.php`**: Ensure domains match DNS
3. **Clear config cache**: `php artisan config:clear`
4. **Check middleware order**: `DetectAppDomain` must run before routing

### SSL Certificate Issues

1. **Verify certificate status**: `aws acm describe-certificate --certificate-arn {ARN}`
2. **Check DNS validation**: Ensure validation records exist in Route 53
3. **Verify certificate region**: Must be in `us-east-1` for ALB

## Production Checklist

- [ ] All 5 domains have DNS CNAME records pointing to ALB
- [ ] SSL certificates requested and validated for all domains
- [ ] HTTPS listeners configured on ALB with certificates
- [ ] Environment variables set correctly in ECS tasks
- [ ] Health checks passing for all target groups
- [ ] CloudWatch alarms configured
- [ ] Auto-scaling configured appropriately
- [ ] Backup strategy in place for RDS
- [ ] CDN configured (CloudFront) if needed
- [ ] WAF rules configured for security

## Environment-Specific Configuration

### Development (`dev` stack)
- Domains: `dev.goeventcity.com`, `dev.day.news`, etc.
- Single AZ, smaller instances
- HTTP only (no SSL required)

### Staging (`staging` stack)
- Domains: `staging.goeventcity.com`, `staging.day.news`, etc.
- Multi-AZ, medium instances
- SSL certificates required

### Production (`production` stack)
- Domains: `goeventcity.com`, `day.news`, etc.
- Multi-AZ, large instances
- SSL certificates required
- Deletion protection enabled
- Enhanced monitoring

## Updating Domains

To change a domain:

1. **Update `INFRASTRUCTURE/config.py`**:
   ```python
   domains = {
       "daynews": {
           "domain": "newdomain.com",  # Change here
           ...
       }
   }
   ```

2. **Update `.env`**:
   ```env
   DAYNEWS_DOMAIN=newdomain.com
   ```

3. **Update DNS**: Create CNAME record for new domain

4. **Redeploy**: `pulumi up`

5. **Update Route 53**: Point new domain to ALB

## Additional Resources

- [Pulumi AWS Documentation](https://www.pulumi.com/docs/clouds/aws/)
- [AWS ALB Documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [Route 53 DNS Documentation](https://docs.aws.amazon.com/route53/)
- [Laravel Domain Routing](https://laravel.com/docs/routing#route-model-binding)

