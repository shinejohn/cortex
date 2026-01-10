# DNS Setup Guide - All 5 Multisite Applications

## ALB DNS Name
```
fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com
```

## CNAME Records to Configure in GoDaddy

### 1. GoEventCity
- **Type:** CNAME
- **Host:** `dev`
- **Points To:** `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **Domain:** `goeventcity.com`
- **Full URL:** `dev.goeventcity.com`

### 2. Day.News
- **Type:** CNAME
- **Host:** `dev`
- **Points To:** `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **Domain:** `day.news`
- **Full URL:** `dev.day.news`

### 3. Downtown Guide
- **Type:** CNAME
- **Host:** `dev`
- **Points To:** `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **Domain:** `downtownsguide.com`
- **Full URL:** `dev.downtownsguide.com`

### 4. Go Local Voices
- **Type:** CNAME
- **Host:** `dev`
- **Points To:** `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **Domain:** `golocalvoices.com`
- **Full URL:** `dev.golocalvoices.com`


### 5. AlphaSite
- **Type:** CNAME
- **Host:** `dev`
- **Points To:** `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`
- **Domain:** `alphasite.com`
- **Full URL:** `dev.alphasite.com`

## AWS Infrastructure Status

### ✅ ALB Listener Rules Configured
All 5 domains are configured in the ALB HTTP listener:
- Priority 100: `dev.goeventcity.com` → goeventcity target group
- Priority 101: `dev.day.news` → daynews target group
- Priority 102: `dev.downtownsguide.com` → downtownguide target group
- Priority 103: `dev.alphasite.com` → alphasite target group
- Priority 105: `dev.golocalvoices.com` → golocalvoices target group

### ✅ ECS Services
All 5 services are deployed:
- `fibonacco-dev-goeventcity`
- `fibonacco-dev-daynews`
- `fibonacco-dev-downtownguide`
- `fibonacco-dev-golocalvoices`
- `fibonacco-dev-alphasite`

### ✅ Docker Image Fix
All services use `docker/Dockerfile.web` which has been updated to include:
- PHP Redis extension (phpredis)
- Laravel logging to stderr for CloudWatch
- APP_DEBUG=true for dev environment

## Testing After DNS Configuration

Once DNS records are configured, test each domain:

```bash
# Test GoEventCity
curl -H "Host: dev.goeventcity.com" http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/

# Test Day.News
curl -H "Host: dev.day.news" http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/

# Test Downtown Guide
curl -H "Host: dev.downtownsguide.com" http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/

# Test Go Local Voices
curl -H "Host: dev.golocalvoices.com" http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/

# Test AlphaSite
curl -H "Host: dev.alphasite.com" http://fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com/
```

## Next Steps

1. ✅ Configure DNS CNAME records in GoDaddy (see above)
2. ✅ Wait for DNS propagation (5-30 minutes)
3. ✅ Test each domain
4. ✅ Monitor ECS service health
5. ✅ Check CloudWatch logs for any errors

## Notes

- **TTL:** Set DNS record TTL to 300 seconds (5 minutes) for faster updates
- **Root Domain:** Root domains (e.g., `goeventcity.com`) cannot use CNAME records. Use A records with ALB IPs or Route 53 alias records
- **SSL:** HTTPS certificates will need to be configured in ACM and ALB listener for production
- **Health Checks:** All services use `/healthcheck` endpoint for health checks

