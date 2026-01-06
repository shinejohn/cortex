# Quick Deployment Checklist

**Print this and check off items as you complete them.**

## ✅ Prerequisites

- [ ] Docker Desktop running (`docker ps` works)
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] PHP installed (`php --version`)
- [ ] Composer installed (`composer --version`)
- [ ] Node.js installed (`node --version`)

## ✅ AWS Setup

- [ ] ECR access verified (`aws ecr describe-repositories`)
- [ ] ECS access verified (`aws ecs list-clusters`)
- [ ] ALB DNS retrieved: `_____________________________`

## ✅ DNS Configuration

- [ ] CNAME created for `dev.goeventcity.com`
- [ ] CNAME created for `dev.day.news`
- [ ] CNAME created for `dev.downtownsguide.com`
- [ ] CNAME created for `dev.alphasite.com`
- [ ] CNAME created for `golocalvoices.com`
- [ ] DNS propagation verified (`dig` or `nslookup`)

## ✅ Secrets & Configuration

- [ ] Database password generated/stored
- [ ] APP_KEY generated (`php artisan key:generate --show`)
- [ ] AWS S3 credentials configured
- [ ] Mail provider chosen and configured
- [ ] `.env` file created from template
- [ ] `.env` file updated with all values
- [ ] AWS Secrets Manager secrets created (`./scripts/create-secrets.sh`)

## ✅ Deployment

- [ ] Prerequisites checked (`./scripts/check-prerequisites.sh`)
- [ ] Docker builds tested (`./scripts/test-docker-build.sh`)
- [ ] Environment template generated (`./scripts/setup-env.sh`)
- [ ] ECR login successful
- [ ] Images built and pushed (`./scripts/build-and-push-images.sh`)
- [ ] Database migrations run (`./scripts/migrate-database.sh`)
- [ ] ECS services updated (`./scripts/update-ecs-services.sh`)

## ✅ Testing

- [ ] ECS services running (check AWS Console)
- [ ] Health check endpoint working (`/healthcheck`)
- [ ] GoEventCity accessible (`https://dev.goeventcity.com`)
- [ ] Day.News accessible (`https://dev.day.news`)
- [ ] Downtown Guide accessible (`https://dev.downtownsguide.com`)
- [ ] AlphaSite accessible (`https://dev.alphasite.com`)
- [ ] Go Local Voices accessible (`https://golocalvoices.com`)
- [ ] Cross-domain authentication tested
- [ ] CloudWatch logs reviewed (no errors)

## ✅ CI/CD Setup

- [ ] GitHub repository: `https://github.com/shinejohn/Community-Platform`
- [ ] GitHub secret `AWS_ACCESS_KEY_ID` added
- [ ] GitHub secret `AWS_SECRET_ACCESS_KEY` added
- [ ] GitHub secret `PULUMI_CONFIG_PASSPHRASE` added
- [ ] CI/CD pipeline tested (push to trigger workflow)

## ✅ SSL Certificates (Optional)

- [ ] ACM certificate requested for `dev.goeventcity.com`
- [ ] ACM certificate requested for `dev.day.news`
- [ ] ACM certificate requested for `dev.downtownsguide.com`
- [ ] ACM certificate requested for `dev.alphasite.com`
- [ ] ACM certificate requested for `golocalvoices.com`
- [ ] DNS validation records added
- [ ] Certificates validated
- [ ] ALB HTTPS listeners configured

---

## Quick Commands Reference

```bash
# Check prerequisites
./scripts/check-prerequisites.sh

# Run complete deployment
./scripts/deploy-all.sh

# Get infrastructure info
cd INFRASTRUCTURE && pulumi stack output

# Check ECS services
aws ecs describe-services --cluster fibonacco-dev --services fibonacco-dev-goeventcity --region us-east-1

# View logs
aws logs tail /ecs/fibonacco/dev/goeventcity --follow --region us-east-1

# Test DNS
dig dev.goeventcity.com +short
```

---

**Date Started:** _______________  
**Date Completed:** _______________

