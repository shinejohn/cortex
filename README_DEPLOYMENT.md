# AWS Deployment - Next Steps Summary

## ✅ What's Been Completed

1. **AWS Infrastructure Deployed**
   - VPC, Networking, Security Groups
   - RDS PostgreSQL Database
   - ElastiCache Redis
   - S3 Buckets
   - ECR Repositories (6 repos)
   - ECS Cluster and Services
   - Application Load Balancer
   - CloudWatch Monitoring

2. **Docker Configuration Created**
   - `docker/Dockerfile.base-app` - For Horizon/Scheduler
   - `docker/Dockerfile.inertia-ssr` - For SSR service
   - `docker/Dockerfile.web` - For all web services
   - `docker/nginx/default.conf` - Nginx config
   - `docker/supervisor/supervisord.conf` - Process management

3. **Deployment Scripts Created**
   - `scripts/build-and-push-images.sh` - Build and push to ECR
   - `scripts/update-ecs-services.sh` - Force ECS updates
   - `scripts/setup-env.sh` - Generate environment template

4. **Testing Infrastructure**
   - Playwright E2E test setup
   - Test user seeders
   - Authentication helpers

## 🚀 Next Steps (In Order)

### Step 1: Build and Push Docker Images (2-4 hours)

```bash
# Make scripts executable (if needed)
chmod +x scripts/*.sh

# Build and push all images
./scripts/build-and-push-images.sh

# Or build individual service
./scripts/build-and-push-images.sh goeventcity
```

### Step 2: Set Up Environment Variables (1 hour)

```bash
# Generate environment template
./scripts/setup-env.sh

# Review and update .env.aws.template
# Store secrets in AWS Secrets Manager
```

### Step 3: Configure Database (1-2 hours)

```bash
# Get database endpoint
cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate
pulumi stack output database_endpoint

# Update .env with database credentials
# Run migrations
php artisan migrate --force

# Seed test users
php artisan db:seed --class=PlaywrightTestUsersSeeder
```

### Step 4: Update ECS Services (30 minutes)

```bash
# Force ECS to pull new images
./scripts/update-ecs-services.sh

# Or update individual service
./scripts/update-ecs-services.sh goeventcity
```

### Step 5: Configure DNS (30 minutes)

```bash
# Get ALB DNS name
cd INFRASTRUCTURE
pulumi stack output alb_dns_name

# Configure CNAME records:
# dev.goeventcity.com → ALB_DNS
# dev.day.news → ALB_DNS
# dev.downtownsguide.com → ALB_DNS
# dev.alphasite.com → ALB_DNS
# golocalvoices.com → ALB_DNS
```

### Step 6: SSL Certificates (1-2 hours)

```bash
# Request ACM certificates for each domain
aws acm request-certificate \
  --domain-name dev.goeventcity.com \
  --validation-method DNS \
  --region us-east-1

# Add DNS validation records
# Wait for validation
# Update ALB listeners to use HTTPS
```

## 📚 Documentation

- **Complete Guide:** `INFRASTRUCTURE/NEXT_STEPS.md`
- **Checklist:** `INFRASTRUCTURE/DEPLOYMENT_CHECKLIST.md`
- **Roadmap:** `DEPLOYMENT_ROADMAP.md`
- **Infrastructure Summary:** `INFRASTRUCTURE/DEPLOYMENT_COMPLETE.md`

## 🔧 Quick Commands

### Get Infrastructure Outputs
```bash
cd INFRASTRUCTURE
export PULUMI_CONFIG_PASSPHRASE="fibonacco-infra-2025"
source venv/bin/activate
pulumi stack output
```

### View ECS Services
```bash
aws ecs list-services --cluster fibonacco-dev
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity
```

### View Logs
```bash
aws logs tail /ecs/fibonacco/dev/goeventcity --follow
```

### Update Service
```bash
aws ecs update-service \
  --cluster fibonacco-dev \
  --service fibonacco-dev-goeventcity \
  --force-new-deployment
```

## ⚠️ Important Notes

1. **Environment:** All infrastructure is in `dev` environment
2. **Costs:** Optimized for dev (single AZ, smaller instances)
3. **Production:** Will use `production` stack with Multi-AZ
4. **Secrets:** Store all secrets in AWS Secrets Manager
5. **DNS:** Wait for DNS propagation (5-30 minutes)

## 🆘 Troubleshooting

### Scripts Not Executable
```bash
chmod +x scripts/build-and-push-images.sh
chmod +x scripts/update-ecs-services.sh
chmod +x scripts/setup-env.sh
```

### Docker Build Fails
- Check Dockerfile paths
- Verify all dependencies are in package.json/composer.json
- Check Docker daemon is running

### ECS Service Won't Start
- Check CloudWatch logs
- Verify task definition is correct
- Check security groups allow traffic
- Verify environment variables are set

### Database Connection Fails
- Check security group allows ECS tasks
- Verify database endpoint is correct
- Check credentials in Secrets Manager

---

**Ready to deploy!** Start with Step 1: Build and Push Docker Images 🚀

