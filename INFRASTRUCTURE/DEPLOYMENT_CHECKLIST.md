# Deployment Checklist

Use this checklist to track progress on deploying the applications to AWS.

## Pre-Deployment

- [ ] Review `NEXT_STEPS.md` document
- [ ] Verify AWS credentials are configured
- [ ] Confirm infrastructure is deployed (`pulumi stack output`)
- [ ] Review cost estimates

## Phase 1: Docker Images

- [ ] Create `docker/Dockerfile.base-app`
- [ ] Create `docker/Dockerfile.inertia-ssr`
- [ ] Create `docker/Dockerfile.web`
- [ ] Create `docker/nginx/default.conf`
- [ ] Create `docker/supervisor/supervisord.conf`
- [ ] Test Docker builds locally
- [ ] Login to ECR: `aws ecr get-login-password --region us-east-1 | docker login...`
- [ ] Build and push base-app image
- [ ] Build and push inertia-ssr image
- [ ] Build and push goeventcity image
- [ ] Build and push daynews image
- [ ] Build and push downtownguide image
- [ ] Build and push alphasite image
- [ ] Verify images in ECR console

## Phase 2: Database

- [ ] Get database endpoint: `pulumi stack output database_endpoint`
- [ ] Test database connection locally
- [ ] Update `.env` with database credentials
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed test users: `php artisan db:seed --class=PlaywrightTestUsersSeeder`
- [ ] Verify database is accessible
- [ ] Test database connection from ECS (once services are running)

## Phase 3: Environment Configuration

- [ ] Run `scripts/setup-env.sh` to generate .env template
- [ ] Review `.env.aws.template`
- [ ] Store secrets in AWS Secrets Manager
- [ ] Update ECS task definitions to use secrets
- [ ] Configure environment variables in ECS services
- [ ] Verify environment variables are set correctly

## Phase 4: DNS

- [ ] Get ALB DNS: `pulumi stack output alb_dns_name`
- [ ] Configure CNAME for `dev.goeventcity.com`
- [ ] Configure CNAME for `dev.day.news`
- [ ] Configure CNAME for `dev.downtownsguide.com`
- [ ] Configure CNAME for `dev.alphasite.com`
- [ ] Configure CNAME for `golocalvoices.com`
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Test domain access: `curl -H "Host: dev.goeventcity.com" http://ALB_DNS`
- [ ] Verify domains resolve correctly

## Phase 5: SSL Certificates

- [ ] Request ACM certificate for `dev.goeventcity.com`
- [ ] Request ACM certificate for `dev.day.news`
- [ ] Request ACM certificate for `dev.downtownsguide.com`
- [ ] Request ACM certificate for `dev.alphasite.com`
- [ ] Request ACM certificate for `golocalvoices.com`
- [ ] Add DNS validation records
- [ ] Wait for certificate validation
- [ ] Update ALB listeners to use HTTPS
- [ ] Test HTTPS connections
- [ ] Verify SSL certificates are valid

## Phase 6: Service Discovery

- [ ] Set up AWS Cloud Map namespace (if using)
- [ ] Configure Inertia SSR service discovery
- [ ] Update web services to use SSR endpoint
- [ ] Test SSR communication
- [ ] Verify SSR is working in production

## Phase 7: CI/CD

- [ ] Create `.github/workflows/deploy.yml`
- [ ] Create `.github/workflows/infrastructure.yml`
- [ ] Set up GitHub secrets:
  - [ ] `AWS_ACCESS_KEY_ID`
  - [ ] `AWS_SECRET_ACCESS_KEY`
  - [ ] `PULUMI_ACCESS_TOKEN`
- [ ] Test CI/CD pipeline
- [ ] Configure branch protection rules
- [ ] Document deployment process

## Phase 8: Monitoring

- [ ] Confirm SNS email subscription
- [ ] Review CloudWatch dashboard
- [ ] Set up Slack webhook (optional)
- [ ] Configure additional alarms
- [ ] Test alert notifications
- [ ] Set up log aggregation
- [ ] Configure log retention policies

## Phase 9: Testing

- [ ] Install Playwright: `npm install --save-dev @playwright/test`
- [ ] Install browsers: `npx playwright install`
- [ ] Seed test users: `php artisan db:seed --class=PlaywrightTestUsersSeeder`
- [ ] Run auth setup: `npx playwright test tests/Playwright/auth.setup.ts`
- [ ] Write E2E tests for critical flows
- [ ] Run E2E test suite
- [ ] Set up load testing
- [ ] Test auto-scaling behavior
- [ ] Document test results

## Phase 10: Documentation

- [ ] Complete deployment documentation
- [ ] Create API documentation
- [ ] Write developer onboarding guide
- [ ] Document troubleshooting procedures
- [ ] Create runbooks for common operations
- [ ] Document rollback procedures

## Phase 11: Security

- [ ] Review all security groups
- [ ] Move secrets to AWS Secrets Manager
- [ ] Rotate database passwords
- [ ] Set up secret rotation policies
- [ ] Enable CloudTrail logging
- [ ] Set up VPC Flow Logs
- [ ] Configure WAF (optional)
- [ ] Review IAM roles and policies

## Phase 12: Performance

- [ ] Set up CloudFront CDN
- [ ] Configure response caching
- [ ] Set up Redis caching layers
- [ ] Implement cache warming
- [ ] Review slow query logs
- [ ] Add database indexes
- [ ] Configure connection pooling
- [ ] Tune auto-scaling policies
- [ ] Monitor performance metrics

## Post-Deployment Verification

- [ ] All services are running and healthy
- [ ] All domains are accessible
- [ ] SSL certificates are valid
- [ ] Database is accessible and migrations are run
- [ ] Redis is accessible
- [ ] S3 buckets are accessible
- [ ] Logs are being collected
- [ ] Alarms are configured
- [ ] Monitoring dashboard is working
- [ ] E2E tests are passing
- [ ] Performance is acceptable

## Production Readiness

- [ ] All critical features are tested
- [ ] Documentation is complete
- [ ] Monitoring and alerting are configured
- [ ] Backup and recovery procedures are documented
- [ ] Security review is complete
- [ ] Performance testing is complete
- [ ] Cost optimization review
- [ ] Disaster recovery plan is in place

---

**Last Updated:** December 22, 2025  
**Status:** Infrastructure Deployed ✅  
**Next:** Phase 1 - Docker Images

