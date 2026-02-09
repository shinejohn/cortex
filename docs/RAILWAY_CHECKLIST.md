# Railway Multi-Domain Configuration Checklist

## ✅ Completed (Automatic)
- [x] Updated `.env` with dev domain configurations
- [x] Enhanced domain detection middleware for subdomains
- [x] Cleared Laravel cache
- [x] Configured route handling for multiple domains

## 🔧 Required Manual Steps in Railway

### Step 1: Add Custom Domains (10 min)
Visit Railway Dashboard → Your Service → Settings → Domains

- [ ] Add domain: `dev.day.news`
- [ ] Add domain: `dev.golocalvoices.com`
- [ ] Add domain: `dev.downtownsguide.com`
- [ ] Add domain: `dev.goeventcity.com`
- [ ] Add domain: `dev.alphasite.ai`

For each domain, Railway will show you a CNAME target like:
`your-app-name.up.railway.app`

### Step 2: Configure DNS Records (10 min)
At your domain registrar (Namecheap, Cloudflare, etc.):

**For day.news:**
- [ ] Add CNAME: `dev` → `your-app-name.up.railway.app`

**For golocalvoices.com:**
- [ ] Add CNAME: `dev` → `your-app-name.up.railway.app`

**For downtownsguide.com:**
- [ ] Add CNAME: `dev` → `your-app-name.up.railway.app`

**For goeventcity.com:**
- [ ] Add CNAME: `dev` → `your-app-name.up.railway.app`

**For alphasite.ai:**
- [ ] Add CNAME: `dev` → `your-app-name.up.railway.app`

### Step 3: Configure Railway Environment Variables (5 min)
Railway Dashboard → Your Service → Variables

Add/Update these variables:
```
GOEVENTCITY_DOMAIN=dev.goeventcity.com
DAYNEWS_DOMAIN=dev.day.news
DOWNTOWNGUIDE_DOMAIN=dev.downtownsguide.com
LOCAL_VOICES_DOMAIN=dev.golocalvoices.com
ALPHASITE_DOMAIN=dev.alphasite.ai
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
```

- [ ] Environment variables updated in Railway

### Step 4: Wait for Propagation (30-60 min)
- [ ] DNS records propagated (check with `dig` command)
- [ ] SSL certificates issued by Railway (check dashboard)

### Step 5: Verify Each Domain (5 min)
Test each domain in browser or with curl:

- [ ] https://dev.day.news → responds correctly
- [ ] https://dev.golocalvoices.com → responds correctly
- [ ] https://dev.downtownsguide.com → responds correctly
- [ ] https://dev.goeventcity.com → responds correctly
- [ ] https://dev.alphasite.ai → responds correctly

## Quick Test Commands

Check DNS propagation:
```bash
dig dev.day.news
dig dev.golocalvoices.com
dig dev.downtownsguide.com
dig dev.goeventcity.com
dig dev.alphasite.ai
```

Test HTTPS:
```bash
curl -I https://dev.day.news
curl -I https://dev.golocalvoices.com
curl -I https://dev.downtownsguide.com
curl -I https://dev.goeventcity.com
curl -I https://dev.alphasite.ai
```

## Common Issues

**404 Errors:**
- Check Railway logs: domain detection may be failing
- Verify environment variables match domain names exactly

**502 Bad Gateway:**
- Application crashed or not running
- Check Railway deployment logs
- Verify database connection

**SSL Certificate Errors:**
- Wait 5-15 minutes after DNS propagates
- Verify CNAME records are correct
- Check Railway domain status shows "Active" with SSL

**Mixed Success (some domains work, others don't):**
- Check individual DNS for each domain
- Verify all 5 domains added in Railway
- Check for typos in domain names

## Timeline Estimate

| Task | Time |
|------|------|
| Add domains in Railway | 5-10 min |
| Configure DNS at registrars | 5-10 min |
| DNS propagation | 10-60 min |
| SSL certificate issuance | 5-15 min |
| Testing | 5 min |
| **Total** | **30-90 min** |

## Support

If stuck after 90 minutes:
1. Check Railway service logs for errors
2. Run `dig` commands to verify DNS
3. Check SSL status in Railway dashboard
4. Review detailed guide: `docs/RAILWAY_MULTI_DOMAIN_SETUP.md`
