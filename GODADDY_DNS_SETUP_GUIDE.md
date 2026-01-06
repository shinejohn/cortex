# GoDaddy DNS Setup Guide - Step by Step

**Generated:** December 29, 2025  
**Platform:** Fibonacco Multi-Site Platform  
**DNS Provider:** GoDaddy  
**Infrastructure:** AWS (ALB + ECS)

---

## Overview

This guide provides step-by-step instructions for configuring DNS records in GoDaddy to point your frontend services to AWS infrastructure.

### Frontend Services

1. **GoEventCity** - `goeventcity.com`
2. **Day.News** - `day.news`
3. **Downtown Guide** - `downtownsguide.com`
4. **AlphaSite** - `alphasite.com`

### Infrastructure Details

- **Load Balancer:** AWS Application Load Balancer (ALB)
- **SSL Certificates:** AWS Certificate Manager (ACM)
- **DNS Type:** CNAME records pointing to ALB DNS name

---

## Prerequisites

Before starting, ensure you have:

- ✅ GoDaddy account access
- ✅ Domain access/ownership for all 4 domains
- ✅ AWS ALB DNS name (from Pulumi output: `pulumi stack output load_balancer_dns`)
- ✅ AWS ACM certificates requested and validated (for production domains)

---

## Step 1: Get AWS ALB DNS Name

### 1.1 Get the Load Balancer DNS Name

Run this command in your terminal (from the `INFRASTRUCTURE` directory):

```bash
cd INFRASTRUCTURE
pulumi stack output load_balancer_dns
```

**Expected Output:**
```
fibonacco-dev-alb-1234567890.us-east-1.elb.amazonaws.com
```

**Save this DNS name** - you'll need it for all CNAME records.

### 1.2 Verify ALB is Running

```bash
# Check ALB health
aws elbv2 describe-load-balancers --query 'LoadBalancers[?LoadBalancerName==`fibonacco-dev-alb`].[DNSName,State.Code]' --output table
```

---

## Step 2: Log into GoDaddy

### 2.1 Access GoDaddy DNS Management

1. Go to [https://www.godaddy.com](https://www.godaddy.com)
2. Click **"Sign In"** (top right)
3. Enter your credentials
4. Click **"My Products"** or **"Domain Manager"**

### 2.2 Navigate to DNS Settings

1. Find your domain in the list
2. Click on the domain name
3. Click **"DNS"** tab (or **"Manage DNS"**)
4. You should see the DNS records page

---

## Step 3: Configure Production Domains

### 3.1 GoEventCity (`goeventcity.com`)

#### Step 3.1.1: Remove Existing A Records (if any)

1. Find any **A records** pointing to IP addresses
2. Click the **"⋮"** (three dots) next to each A record
3. Click **"Delete"**
4. Confirm deletion

#### Step 3.1.2: Add CNAME Record for Root Domain

**Note:** GoDaddy doesn't support CNAME on root domain (`@`). Use one of these options:

**Option A: Use ALIAS/ANAME Record (Recommended if available)**

1. Click **"Add"** button
2. Select record type: **"ALIAS"** or **"ANAME"** (if available)
3. Enter:
   - **Name:** `@` (or leave blank for root domain)
   - **Value:** `{ALB_DNS_NAME}` (e.g., `fibonacco-dev-alb-1234567890.us-east-1.elb.amazonaws.com`)
   - **TTL:** `600` (10 minutes) or `3600` (1 hour)
4. Click **"Save"**

**Option B: Use A Record with ALB IPs (If ALIAS not available)**

If GoDaddy doesn't support ALIAS, you'll need to:

1. Get ALB IP addresses:
   ```bash
   aws elbv2 describe-load-balancers --load-balancer-arns $(aws elbv2 describe-load-balancers --query 'LoadBalancers[?LoadBalancerName==`fibonacco-dev-alb`].LoadBalancerArn' --output text) --query 'LoadBalancers[0].AvailabilityZones[*].LoadBalancerAddresses[*].IpAddress' --output text
   ```

2. Create **A records** for each IP:
   - **Name:** `@`
   - **Value:** `{IP_ADDRESS_1}`
   - **TTL:** `600`
   - Repeat for each IP address

**Option C: Use www Subdomain (Temporary Workaround)**

1. Create CNAME for `www`:
   - **Name:** `www`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
2. Set up redirect from root to `www` in your application

#### Step 3.1.3: Add CNAME for www Subdomain

1. Click **"Add"** button
2. Select record type: **"CNAME"**
3. Enter:
   - **Name:** `www`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

#### Step 3.1.4: Verify Records

After adding records, verify they appear correctly:

- ✅ `@` → ALIAS/ANAME pointing to ALB DNS (or A records)
- ✅ `www` → CNAME pointing to ALB DNS

---

### 3.2 Day.News (`day.news`)

**Note:** `.news` is a new gTLD. Ensure GoDaddy supports it.

#### Step 3.2.1: Remove Existing Records

1. Delete any existing A records for root domain

#### Step 3.2.2: Add Root Domain Record

**Option A: ALIAS/ANAME (Recommended)**

1. Click **"Add"**
2. Record type: **"ALIAS"** or **"ANAME"**
3. Enter:
   - **Name:** `@`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

**Option B: A Records (If ALIAS not available)**

1. Get ALB IP addresses (see Step 3.1.2)
2. Create A records for each IP

#### Step 3.2.3: Add www Subdomain

1. Click **"Add"**
2. Record type: **"CNAME"**
3. Enter:
   - **Name:** `www`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

---

### 3.3 Downtown Guide (`downtownsguide.com`)

Follow the same steps as GoEventCity (Section 3.1):

1. Remove existing A records
2. Add ALIAS/ANAME for root domain (`@`)
3. Add CNAME for `www` subdomain
4. Verify records

---

### 3.4 AlphaSite (`alphasite.com`)

Follow the same steps as GoEventCity (Section 3.1):

1. Remove existing A records
2. Add ALIAS/ANAME for root domain (`@`)
3. Add CNAME for `www` subdomain
4. Verify records

---

## Step 4: Configure Staging/Dev Subdomains (Optional)

If you're setting up staging or development environments:

### 4.1 Staging Environment

For each domain, add CNAME records for staging subdomains:

#### GoEventCity Staging

1. Click **"Add"**
2. Record type: **"CNAME"**
3. Enter:
   - **Name:** `staging` (or `dev`)
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

**Result:** `staging.goeventcity.com` → ALB

#### Day.News Staging

1. Click **"Add"**
2. Record type: **"CNAME"**
3. Enter:
   - **Name:** `staging`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

**Result:** `staging.day.news` → ALB

#### Downtown Guide Staging

1. Click **"Add"**
2. Record type: **"CNAME"**
3. Enter:
   - **Name:** `staging`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

**Result:** `staging.downtownsguide.com` → ALB

#### AlphaSite Staging

1. Click **"Add"**
2. Record type: **"CNAME"**
3. Enter:
   - **Name:** `staging`
   - **Value:** `{ALB_DNS_NAME}`
   - **TTL:** `600`
4. Click **"Save"**

**Result:** `staging.alphasite.com` → ALB

---

## Step 5: DNS Propagation & Verification

### 5.1 Wait for DNS Propagation

DNS changes can take **15 minutes to 48 hours** to propagate globally. Typically:
- **GoDaddy:** 5-15 minutes
- **Global:** 1-24 hours

### 5.2 Verify DNS Records

#### Using Command Line (dig/nslookup)

```bash
# Check root domain
dig goeventcity.com
dig day.news
dig downtownsguide.com
dig alphasite.com

# Check www subdomain
dig www.goeventcity.com
dig www.day.news
dig www.downtownsguide.com
dig www.alphasite.com

# Check staging (if configured)
dig staging.goeventcity.com
dig staging.day.news
```

#### Using Online Tools

1. **DNS Checker:** [https://dnschecker.org](https://dnschecker.org)
2. **MXToolbox:** [https://mxtoolbox.com/DNSLookup.aspx](https://mxtoolbox.com/DNSLookup.aspx)
3. **What's My DNS:** [https://www.whatsmydns.net](https://www.whatsmydns.net)

**Expected Results:**
- Root domains should resolve to ALB DNS name (or ALB IPs)
- www subdomains should resolve to ALB DNS name
- Staging subdomains should resolve to ALB DNS name

### 5.3 Test Domain Access

Once DNS propagates, test each domain:

```bash
# Test root domains
curl -I https://goeventcity.com
curl -I https://day.news
curl -I https://downtownsguide.com
curl -I https://alphasite.com

# Test www subdomains
curl -I https://www.goeventcity.com
curl -I https://www.day.news
curl -I https://www.downtownsguide.com
curl -I https://www.alphasite.com
```

**Expected:** HTTP 200 or 301/302 redirects (not DNS errors)

---

## Step 6: SSL Certificate Configuration (AWS Side)

### 6.1 Request ACM Certificates

**Note:** This is done in AWS, not GoDaddy. But DNS validation requires GoDaddy records.

#### Request Certificate for Each Domain

```bash
# GoEventCity
aws acm request-certificate \
  --domain-name goeventcity.com \
  --subject-alternative-names www.goeventcity.com \
  --validation-method DNS \
  --region us-east-1

# Day.News
aws acm request-certificate \
  --domain-name day.news \
  --subject-alternative-names www.day.news \
  --validation-method DNS \
  --region us-east-1

# Downtown Guide
aws acm request-certificate \
  --domain-name downtownsguide.com \
  --subject-alternative-names www.downtownsguide.com \
  --validation-method DNS \
  --region us-east-1

# AlphaSite
aws acm request-certificate \
  --domain-name alphasite.com \
  --subject-alternative-names www.alphasite.com \
  --validation-method DNS \
  --region us-east-1
```

### 6.2 Get DNS Validation Records

After requesting certificates, AWS will provide DNS validation records:

```bash
# Get validation records for each certificate
aws acm describe-certificate \
  --certificate-arn {CERTIFICATE_ARN} \
  --query 'Certificate.DomainValidationOptions[*].[DomainName,ResourceRecord.Name,ResourceRecord.Value]' \
  --output table
```

### 6.3 Add DNS Validation Records in GoDaddy

For each certificate, add CNAME records in GoDaddy:

1. Go to DNS management for the domain
2. Click **"Add"**
3. Record type: **"CNAME"**
4. Enter:
   - **Name:** `{VALIDATION_NAME}` (from AWS, e.g., `_abc123def456.goeventcity.com`)
   - **Value:** `{VALIDATION_VALUE}` (from AWS)
   - **TTL:** `600`
5. Click **"Save"**

**Example:**
- **Name:** `_abc123def456`
- **Value:** `_xyz789.abcdef.acm-validations.aws.`
- **TTL:** `600`

### 6.4 Wait for Certificate Validation

AWS will automatically validate certificates once DNS records propagate (usually 5-30 minutes).

Check validation status:

```bash
aws acm describe-certificate \
  --certificate-arn {CERTIFICATE_ARN} \
  --query 'Certificate.Status' \
  --output text
```

**Expected:** `ISSUED` (not `PENDING_VALIDATION`)

---

## Step 7: Final Verification Checklist

### 7.1 DNS Records Checklist

For each domain, verify:

- [ ] Root domain (`@`) points to ALB (ALIAS/ANAME or A records)
- [ ] `www` subdomain points to ALB (CNAME)
- [ ] Staging subdomain points to ALB (CNAME, if configured)
- [ ] DNS validation records added (for SSL certificates)
- [ ] All records have appropriate TTL (600-3600 seconds)

### 7.2 Domain Access Checklist

Test each domain:

- [ ] `https://goeventcity.com` loads correctly
- [ ] `https://www.goeventcity.com` loads correctly
- [ ] `https://day.news` loads correctly
- [ ] `https://www.day.news` loads correctly
- [ ] `https://downtownsguide.com` loads correctly
- [ ] `https://www.downtownsguide.com` loads correctly
- [ ] `https://alphasite.com` loads correctly
- [ ] `https://www.alphasite.com` loads correctly
- [ ] SSL certificates are valid (green padlock in browser)
- [ ] No mixed content warnings
- [ ] Redirects work correctly (www ↔ root)

### 7.3 SSL Certificate Checklist

Verify SSL certificates:

- [ ] All certificates are `ISSUED` in AWS ACM
- [ ] Certificates are attached to ALB listeners
- [ ] HTTPS (443) port is configured on ALB
- [ ] HTTP (80) redirects to HTTPS
- [ ] Browser shows valid SSL certificate

---

## Step 8: Troubleshooting

### 8.1 DNS Not Resolving

**Symptoms:**
- Domain shows "DNS_PROBE_FINISHED_NXDOMAIN"
- Domain times out
- Wrong IP address returned

**Solutions:**

1. **Check DNS propagation:**
   ```bash
   dig @8.8.8.8 goeventcity.com
   dig @1.1.1.1 goeventcity.com
   ```

2. **Clear DNS cache:**
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   
   # Windows
   ipconfig /flushdns
   ```

3. **Verify records in GoDaddy:**
   - Double-check record values
   - Ensure no typos in ALB DNS name
   - Check TTL values

4. **Wait longer:**
   - DNS can take up to 48 hours globally
   - Check propagation status: [https://dnschecker.org](https://dnschecker.org)

### 8.2 SSL Certificate Not Validating

**Symptoms:**
- Certificate stuck in `PENDING_VALIDATION`
- Validation fails

**Solutions:**

1. **Verify DNS validation records:**
   ```bash
   dig _abc123def456.goeventcity.com CNAME
   ```
   Should return the validation value from AWS

2. **Check record format:**
   - Name should NOT include the domain (e.g., `_abc123def456`, not `_abc123def456.goeventcity.com`)
   - Value should be exactly as AWS provides

3. **Wait for propagation:**
   - DNS validation records need to propagate (5-30 minutes)

4. **Re-request certificate:**
   - If validation fails, delete and re-request certificate

### 8.3 ALB Not Responding

**Symptoms:**
- DNS resolves correctly
- Connection times out
- 502 Bad Gateway

**Solutions:**

1. **Check ALB health:**
   ```bash
   aws elbv2 describe-load-balancers --query 'LoadBalancers[?LoadBalancerName==`fibonacco-dev-alb`].[State.Code,DNSName]' --output table
   ```

2. **Check target group health:**
   ```bash
   aws elbv2 describe-target-health --target-group-arn {TARGET_GROUP_ARN}
   ```

3. **Check security groups:**
   - Ensure ALB security group allows inbound traffic on ports 80 and 443
   - Ensure ECS security group allows traffic from ALB security group

4. **Check ECS services:**
   ```bash
   aws ecs describe-services --cluster {CLUSTER_NAME} --services {SERVICE_NAME}
   ```

### 8.4 Wrong Domain Showing

**Symptoms:**
- Domain loads but shows wrong content
- Domain shows default nginx/apache page

**Solutions:**

1. **Check ALB listener rules:**
   - Ensure host-based routing is configured correctly
   - Verify each domain has its own listener rule

2. **Check application configuration:**
   - Verify `APP_URL` environment variable matches domain
   - Check Laravel `APP_URL` in `.env`

3. **Check middleware:**
   - Verify `DetectAppDomain` middleware is working
   - Check domain detection logic

---

## Step 9: Maintenance & Updates

### 9.1 Updating ALB DNS Name

If ALB DNS name changes (e.g., after recreation):

1. Get new ALB DNS name:
   ```bash
   pulumi stack output load_balancer_dns
   ```

2. Update all CNAME/ALIAS records in GoDaddy with new DNS name

3. Wait for DNS propagation (15 minutes - 24 hours)

### 9.2 Adding New Domains

To add a new domain:

1. Request ACM certificate for new domain
2. Add DNS validation records in GoDaddy
3. Add CNAME/ALIAS records pointing to ALB
4. Configure ALB listener rule for new domain
5. Update application configuration

### 9.3 Monitoring DNS Health

Set up monitoring:

1. **Uptime monitoring:**
   - Use AWS CloudWatch Synthetics
   - Use third-party services (Pingdom, UptimeRobot)

2. **DNS monitoring:**
   - Monitor DNS resolution times
   - Alert on DNS failures

3. **SSL certificate monitoring:**
   - Monitor certificate expiration dates
   - Set up alerts for certificates expiring soon

---

## Quick Reference: DNS Records Summary

### Production Domains

| Domain | Record Type | Name | Value | TTL |
|--------|-------------|------|-------|-----|
| goeventcity.com | ALIAS/ANAME | `@` | `{ALB_DNS_NAME}` | 600 |
| goeventcity.com | CNAME | `www` | `{ALB_DNS_NAME}` | 600 |
| day.news | ALIAS/ANAME | `@` | `{ALB_DNS_NAME}` | 600 |
| day.news | CNAME | `www` | `{ALB_DNS_NAME}` | 600 |
| downtownsguide.com | ALIAS/ANAME | `@` | `{ALB_DNS_NAME}` | 600 |
| downtownsguide.com | CNAME | `www` | `{ALB_DNS_NAME}` | 600 |
| alphasite.com | ALIAS/ANAME | `@` | `{ALB_DNS_NAME}` | 600 |
| alphasite.com | CNAME | `www` | `{ALB_DNS_NAME}` | 600 |

### Staging Domains (Optional)

| Domain | Record Type | Name | Value | TTL |
|--------|-------------|------|-------|-----|
| goeventcity.com | CNAME | `staging` | `{ALB_DNS_NAME}` | 600 |
| day.news | CNAME | `staging` | `{ALB_DNS_NAME}` | 600 |
| downtownsguide.com | CNAME | `staging` | `{ALB_DNS_NAME}` | 600 |
| alphasite.com | CNAME | `staging` | `{ALB_DNS_NAME}` | 600 |

### SSL Validation Records

| Domain | Record Type | Name | Value | TTL |
|--------|-------------|------|-------|-----|
| goeventcity.com | CNAME | `_{VALIDATION_ID}` | `_{VALIDATION_VALUE}` | 600 |
| day.news | CNAME | `_{VALIDATION_ID}` | `_{VALIDATION_VALUE}` | 600 |
| downtownsguide.com | CNAME | `_{VALIDATION_ID}` | `_{VALIDATION_VALUE}` | 600 |
| alphasite.com | CNAME | `_{VALIDATION_ID}` | `_{VALIDATION_VALUE}` | 600 |

---

## Additional Resources

- **GoDaddy DNS Help:** [https://www.godaddy.com/help/manage-dns-records-680](https://www.godaddy.com/help/manage-dns-records-680)
- **AWS ALB Documentation:** [https://docs.aws.amazon.com/elasticloadbalancing/latest/application/](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- **AWS ACM Documentation:** [https://docs.aws.amazon.com/acm/](https://docs.aws.amazon.com/acm/)
- **DNS Propagation Checker:** [https://dnschecker.org](https://dnschecker.org)

---

## Support

If you encounter issues:

1. Check the troubleshooting section (Step 8)
2. Verify AWS infrastructure is running correctly
3. Check DNS propagation status
4. Review AWS CloudWatch logs
5. Contact AWS support if infrastructure issues persist

---

**Document Version:** 1.0  
**Last Updated:** December 29, 2025  
**Status:** Ready for Implementation


