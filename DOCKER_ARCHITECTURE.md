# Docker Container Architecture

## Overview

Yes, we **DO** have separate Docker containers/services for each frontend! Here's how it works:

## Container Architecture

### Separate ECS Services (✅ Confirmed)
Each frontend runs as a **separate ECS service** with its own:
- ECR repository
- ECS task definition
- ECS service
- Target group
- CloudWatch logs
- Auto-scaling configuration

**Services:**
1. `fibonacco-dev-goeventcity` - GoEventCity frontend
2. `fibonacco-dev-daynews` - Day.News frontend
3. `fibonacco-dev-downtownguide` - Downtown Guide frontend
4. `fibonacco-dev-alphasite` - AlphaSite frontend
5. `fibonacco-dev-ssr` - Inertia SSR service (shared)
6. `fibonacco-dev-horizon` - Queue worker (shared)

### Shared Dockerfile (✅ Correct)

All web frontends use **the same `Dockerfile.web`** because:
- They share the same Laravel backend codebase
- They share the same React frontend codebase
- They're differentiated by **domain** and **environment variables**, not by code

### How Frontends Are Differentiated

1. **Domain-Based Routing** (`DetectAppDomain` middleware)
   - Each service receives requests for its specific domain
   - The middleware detects the domain and sets `app.current_domain`
   - Routes are loaded based on domain configuration

2. **Environment Variables**
   - Each ECS service has its own `APP_URL` environment variable
   - Example: `APP_URL=https://dev.goeventcity.com` for GoEventCity service

3. **Route Groups** (`bootstrap/app.php`)
   - Day.News: `routes/day-news.php`
   - Downtown Guide: `routes/downtown-guide.php`
   - GoEventCity: `routes/web.php` (fallback)
   - AlphaSite: `routes/alphasite.php`

## Why This Architecture?

### ✅ Benefits of Separate Containers/Services

1. **Independent Scaling**
   - Scale Day.News separately from GoEventCity
   - Each service can have different CPU/memory allocation

2. **Independent Deployments**
   - Deploy Day.News without affecting GoEventCity
   - Rollback one service without affecting others

3. **Independent Monitoring**
   - Separate CloudWatch logs per service
   - Service-specific metrics and alarms

4. **Resource Isolation**
   - Each service has its own ECS task
   - Better resource management and isolation

5. **Cost Optimization**
   - Scale down unused services
   - Right-size each service independently

### ✅ Benefits of Shared Dockerfile

1. **Code Reusability**
   - Single codebase to maintain
   - Shared components and utilities

2. **Consistent Builds**
   - Same build process for all services
   - Easier to maintain and update

3. **Faster Builds**
   - Build once, tag multiple times
   - Docker layer caching benefits all services

## Current Build Process

```bash
# Build script builds the same Dockerfile.web for each service
# but tags and pushes to different ECR repositories

docker build -f docker/Dockerfile.web -t fibonacco/dev/goeventcity:latest .
docker push 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/goeventcity:latest

docker build -f docker/Dockerfile.web -t fibonacco/dev/daynews:latest .
docker push 195430954683.dkr.ecr.us-east-1.amazonaws.com/fibonacco/dev/daynews:latest

# ... and so on
```

## ECR Repositories

Each frontend has its own ECR repository:
- `fibonacco/dev/goeventcity`
- `fibonacco/dev/daynews`
- `fibonacco/dev/downtownguide`
- `fibonacco/dev/alphasite`
- `fibonacco/dev/inertia-ssr`
- `fibonacco/dev/base-app`

## ECS Services Configuration

Each service is configured with:
- **Same image build** (Dockerfile.web)
- **Different APP_URL** environment variable
- **Different target group** (for ALB routing)
- **Same codebase** (domain-based routing handles differences)

## When Would You Need Separate Dockerfiles?

You would only need separate Dockerfiles if:
- Different frontends require different build dependencies
- Different frontends have different build processes
- Different frontends need different base images
- Different frontends have significantly different codebases

**In our case:** All frontends share the same Laravel + React codebase, so one Dockerfile is correct!

## Summary

✅ **Separate Containers:** Yes, each frontend runs in its own ECS service  
✅ **Separate ECR Repos:** Yes, each frontend has its own ECR repository  
✅ **Shared Dockerfile:** Yes, all web frontends use `Dockerfile.web`  
✅ **Shared Codebase:** Yes, domain-based routing differentiates frontends  

This is the **correct architecture** for a multi-domain, multi-tenant application! 🎯

