# Items I Cannot Handle - Manual Actions Required

**Date:** December 23, 2025

This document lists all items that require manual action from you (the user) because they require:
- External service access (domain registrars, GitHub admin)
- Physical/system access (Docker installation, PHP runtime)
- Domain ownership verification (DNS, SSL certificates)

---

## 🔴 Critical Items (Required for Platform to Work)

### 1. **Build and Push Docker Images** ⚠️ CRITICAL
**Why I Can't Do It:**
- Docker is not installed/available in this environment
- Building images requires Docker daemon running

**What You Need to Do:**

**Option A: Push to GitHub (Recommended - Automatic)**
```bash
git add .
git commit -m "Update infrastructure with secrets and environment variables"
git push origin main
```
- GitHub Actions will automatically build and push images to ECR
- Takes ~10-15 minutes
- Check progress: https://github.com/shinejohn/Community-Platform/actions

**Option B: Build Locally (If Docker Installed)**
```bash
# Install Docker Desktop if not installed
# Then run:
./scripts/deploy-to-aws.sh
```

**Status:** ❌ **BLOCKING** - Services cannot start without images

---

### 2. **Configure DNS Records** ⚠️ CRITICAL
**Why I Can't Do It:**
- Requires access to domain registrar (GoDaddy, Namecheap, Route53, etc.)
- Requires domain ownership verification

**What You Need to Do:**

1. **Get ALB DNS Name:**
   ```bash
   cd INFRASTRUCTURE
   pulumi stack output load_balancer_dns
   ```
   Example output: `fibonacco-dev-alb-1749938282.us-east-1.elb.amazonaws.com`

2. **Log into Domain Registrar:**
   - GoDaddy: https://www.godaddy.com
   - Namecheap: https://www.namecheap.com
   - Route53: https://console.aws.amazon.com/route53

3. **Create CNAME Records:**
   - `dev.goeventcity.com` → `{ALB_DNS}`
   - `dev.day.news` → `{ALB_DNS}`
   - `dev.downtownsguide.com` → `{ALB_DNS}`
   - `dev.alphasite.com` → `{ALB_DNS}`

4. **Wait for DNS Propagation:**
   - Usually 5-30 minutes
   - Verify: `dig dev.goeventcity.com` or `nslookup dev.goeventcity.com`

**Status:** ❌ **BLOCKING** - Services cannot be accessed without DNS

---

### 3. **Request SSL Certificates** ⚠️ CRITICAL
**Why I Can't Do It:**
- Requires DNS records to exist first (for validation)
- Requires domain ownership verification

**What You Need to Do:**

1. **Go to AWS Certificate Manager:**
   - https://console.aws.amazon.com/acm/home?region=us-east-1

2. **Request Certificate:**
   - Click "Request certificate"
   - Select "Request a public certificate"
   - Add domains:
     - `dev.goeventcity.com`
     - `dev.day.news`
     - `dev.downtownsguide.com`
     - `dev.alphasite.com`
   - Select "DNS validation"

3. **Add DNS Validation Records:**
   - ACM will provide CNAME records for validation
   - Add these records to your domain DNS
   - Example: `_abc123.dev.goeventcity.com` → `_abc123.acm-validations.aws.`

4. **Wait for Validation:**
   - Usually 5-30 minutes
   - Check status in ACM console

5. **Update ALB Listeners:**
   - I can add this to Pulumi code, OR
   - Manually update ALB listeners in AWS Console

**Status:** ⚠️ **REQUIRED** - HTTPS access requires SSL certificates

---

### 4. **Generate Real APP_KEY** ⚠️ IMPORTANT
**Why I Can't Do It:**
- Requires PHP runtime and Laravel artisan command
- Current placeholder key is insecure

**What You Need to Do:**

1. **Generate Key:**
   ```bash
   php artisan key:generate --show
   ```
   Output: `base64:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Update Secret in AWS Secrets Manager:**
   ```bash
   aws secretsmanager update-secret \
     --secret-id fibonacco/dev/app-secrets \
     --secret-string '{"APP_KEY":"base64:YOUR_KEY_HERE",...}' \
     --region us-east-1
   ```
   
   OR use the script:
   ```bash
   # Edit scripts/setup-aws-secrets.sh to include your key
   ./scripts/setup-aws-secrets.sh
   ```

**Status:** ⚠️ **SECURITY** - Should be done before production

---

## 🟡 Important Items (Not Blocking, But Recommended)

### 5. **Configure GitHub Secrets** (If Not Already Set)
**Why I Can't Do It:**
- Requires GitHub repository admin access

**What You Need to Do:**

1. **Go to GitHub Secrets:**
   - https://github.com/shinejohn/Community-Platform/settings/secrets/actions

2. **Add Required Secrets:**
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
   - `PULUMI_CONFIG_PASSPHRASE` - Pulumi encryption passphrase (if using encrypted state)

**Status:** ✅ Likely already configured (deployments are working)

---

### 6. **Set Database Password in Pulumi Config**
**Why I Can't Do It:**
- Requires you to choose a secure password
- Should be kept secret

**What You Need to Do:**

```bash
cd INFRASTRUCTURE
pulumi config set --secret db_password "YourSecurePassword123!"
```

**Status:** ⚠️ **SECURITY** - Should use a strong password

---

### 7. **Set APP_KEY in Pulumi Config** (Alternative to #4)
**Why I Can't Do It:**
- Requires you to generate the key

**What You Need to Do:**

```bash
cd INFRASTRUCTURE
php artisan key:generate --show  # Get the key
pulumi config set --secret app_key "base64:YOUR_KEY_HERE"
```

**Status:** ⚠️ **SECURITY** - Should be done before production

---

## 🟢 Optional Items (Nice to Have)

### 8. **Configure Custom Domain Names** (Production)
- Point production domains to ALB
- Request production SSL certificates
- Update DNS records

### 9. **Set Up Monitoring/Alerting**
- Configure SNS email subscriptions
- Set up Slack webhooks (optional)
- Configure additional CloudWatch alarms

### 10. **Configure CDN (CloudFront)**
- Set up CloudFront distributions
- Configure caching rules
- Update DNS to point to CloudFront

---

## 📋 Summary Checklist

**Critical (Must Do):**
- [ ] Build Docker images (push to GitHub OR install Docker)
- [ ] Configure DNS records (CNAME to ALB)
- [ ] Request SSL certificates (ACM)
- [ ] Add DNS validation records

**Important (Should Do):**
- [ ] Generate real APP_KEY
- [ ] Set database password in Pulumi config
- [ ] Verify GitHub secrets are configured

**Optional (Nice to Have):**
- [ ] Configure production domains
- [ ] Set up monitoring/alerting
- [ ] Configure CDN

---

## 🚀 Quick Start Commands

After I complete the infrastructure updates, run these:

```bash
# 1. Build images (choose one):
# Option A: Push to GitHub
git add . && git commit -m "Deploy infrastructure" && git push origin main

# Option B: Build locally (if Docker installed)
./scripts/deploy-to-aws.sh

# 2. Get ALB DNS
cd INFRASTRUCTURE && pulumi stack output load_balancer_dns

# 3. Configure DNS (in your domain registrar)
# Add CNAME records pointing to ALB DNS

# 4. Request SSL certificates (in AWS Console)
# Go to Certificate Manager → Request certificate

# 5. Generate APP_KEY
php artisan key:generate --show
# Update secret in AWS Secrets Manager
```

---

## 📞 Need Help?

If you get stuck on any of these items:
1. Check `DEPLOYMENT_ACTION_PLAN.md` for detailed steps
2. Check AWS Console for error messages
3. Check CloudWatch logs: `/ecs/fibonacco/dev/{service}`
4. Check GitHub Actions: https://github.com/shinejohn/Community-Platform/actions

