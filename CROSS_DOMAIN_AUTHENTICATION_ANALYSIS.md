# Cross-Domain Authentication Analysis

## Current State

### ✅ Yes, We're Using Cookies
- **Session Driver**: Database (`SESSION_DRIVER=database`)
- **Cookie Name**: `{app_name}_session` (e.g., `multisite_session`)
- **Cookie Domain**: Currently **NOT SET** (domain-specific by default)
- **Same-Site**: `lax` (allows some cross-site requests)

### ❌ No Cross-Domain Authentication
**Current Behavior**: Each domain has its own separate session cookie:
- `day.news` → Separate cookie
- `goeventcity.test` → Separate cookie  
- `golocalvoices.com` → Separate cookie

**Result**: If you log into Day.News, you are **NOT** automatically logged into GoEventCity or Go Local Voices.

---

## Why This Happens

### Browser Cookie Security
Browsers enforce **same-origin policy** for cookies:
- Cookies set by `day.news` can only be read by `day.news`
- Cookies set by `goeventcity.test` can only be read by `goeventcity.test`
- This is a security feature to prevent cross-site attacks

### Current Configuration
```php
// config/session.php
'domain' => env('SESSION_DOMAIN'),  // Currently NULL/not set
```

When `SESSION_DOMAIN` is not set:
- Cookie domain = current domain only
- No cross-domain sharing possible

---

## Solutions for Cross-Domain Authentication

### Option 1: Shared Parent Domain Cookie (Recommended for Subdomains)

**Best For**: `day.news`, `goeventcity.day.news`, `voices.day.news` (subdomains)

**How It Works**:
- Set cookie domain to `.day.news` (note the leading dot)
- Cookie is accessible to all subdomains

**Configuration**:
```env
SESSION_DOMAIN=.day.news
```

**Pros**:
- ✅ Simple to implement
- ✅ Works automatically across subdomains
- ✅ Secure (same parent domain)

**Cons**:
- ❌ Only works for subdomains, not completely different domains
- ❌ Won't work for `goeventcity.com` + `day.news` (different TLDs)

---

### Option 2: Central Authentication Domain (SSO)

**Best For**: Multiple different domains (`day.news`, `goeventcity.com`, `golocalvoices.com`)

**How It Works**:
- Create a central auth domain (e.g., `auth.fibonacco.com`)
- All domains redirect to central domain for login
- After login, redirect back with a token
- Each domain validates token and creates local session

**Implementation**:
1. Create `auth.fibonacco.com` domain
2. Handle all logins there
3. After successful login:
   - Generate signed token
   - Redirect to target domain with token
   - Target domain validates token and creates session

**Pros**:
- ✅ Works across any domains
- ✅ Single login point
- ✅ Centralized user management

**Cons**:
- ❌ More complex to implement
- ❌ Requires additional domain
- ❌ More redirects (slight UX impact)

---

### Option 3: Token-Based API Authentication

**Best For**: API-first approach

**How It Works**:
- Use JWT or API tokens instead of cookies
- Store token in localStorage
- Send token with each request
- All domains use same API backend

**Pros**:
- ✅ Works across any domains
- ✅ No cookie domain restrictions
- ✅ Good for mobile apps

**Cons**:
- ❌ Requires frontend changes
- ❌ Token management complexity
- ❌ Less secure (XSS vulnerabilities)

---

### Option 4: Shared Database Sessions (Current Setup + Cookie Sync)

**Best For**: Same backend, different domains

**How It Works**:
- Sessions already stored in database (✅ already done)
- After login on one domain:
  - Generate cross-domain token
  - Redirect to other domains with token
  - Other domains validate token and create session

**Implementation**:
1. After login, generate signed token
2. Store token in database with expiration
3. Redirect to other domains with `?auth_token=xxx`
4. Other domains check token and create session

**Pros**:
- ✅ Works with current setup
- ✅ No cookie domain restrictions
- ✅ Uses existing session infrastructure

**Cons**:
- ❌ Requires redirect flow
- ❌ Token management needed

---

## Recommended Solution

### For Your Current Setup

**If using subdomains** (e.g., `day.news`, `events.day.news`):
```env
SESSION_DOMAIN=.day.news
```

**If using different domains** (`day.news`, `goeventcity.com`):
- **Option 2 (Central Auth)** or **Option 4 (Token Sync)** recommended

---

## Implementation Plan

### Quick Fix: Shared Cookie Domain (Subdomains Only)

1. Update `.env`:
```env
SESSION_DOMAIN=.yourdomain.com
```

2. Clear config cache:
```bash
php artisan config:clear
```

3. Test: Login on one subdomain, check if logged in on others

### Full Solution: Cross-Domain Token Sync

1. Create `CrossDomainAuthService`
2. After login, generate token
3. Redirect to other domains with token
4. Validate token and create session on each domain

---

## Current Recommendation

**For immediate needs**: If all domains share a parent domain, use **Option 1** (shared cookie domain).

**For long-term**: Implement **Option 4** (Token Sync) for maximum flexibility.

---

## Testing

After implementing, test:
1. Login on `day.news`
2. Visit `goeventcity.test` → Should be logged in
3. Visit `golocalvoices.com` → Should be logged in
4. Logout on one → Should logout on all (if implemented)

---

## Security Considerations

- ✅ Use HTTPS for all domains (required for secure cookies)
- ✅ Set `SESSION_SECURE_COOKIE=true` in production
- ✅ Use signed tokens for cross-domain auth
- ✅ Set short token expiration times
- ✅ Validate tokens server-side

