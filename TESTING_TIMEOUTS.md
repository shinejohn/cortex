# Extended Testing Timeouts Configuration

## Overview

All timeouts have been extended to allow for comprehensive testing without interruption.

## Changes Made

### 1. Cross-Domain Authentication Tokens

**File:** `app/Services/CrossDomainAuthService.php`

- **Previous:** 5 minutes expiration
- **New:** 24 hours (1440 minutes) - configurable via `CROSS_DOMAIN_TOKEN_EXPIRATION`
- **Config:** `config/auth.php` → `cross_domain_token_expiration`

**Usage:**
```bash
# Set in .env
CROSS_DOMAIN_TOKEN_EXPIRATION=1440  # 24 hours
```

### 2. Session Lifetime

**File:** `config/session.php`

- **Previous:** 120 minutes (2 hours)
- **New:** 1440 minutes (24 hours) - configurable via `SESSION_LIFETIME`

**Usage:**
```bash
# Set in .env
SESSION_LIFETIME=1440  # 24 hours
```

### 3. Playwright Test Timeouts

**File:** `playwright.config.ts`

- **Global Test Timeout:** 5 minutes (300000ms)
- **Action Timeout:** 30 seconds (30000ms)
- **Navigation Timeout:** 60 seconds (60000ms)
- **Web Server Startup:** 5 minutes (300000ms)

**Individual Test Setup:**
- **File:** `tests/Playwright/auth.setup.ts`
- Each authentication setup test has 2-minute timeout

**Authentication Helper:**
- **File:** `tests/Playwright/auth-helper.ts`
- Login navigation: 60 seconds
- Form interactions: 30 seconds
- URL wait: 60 seconds

## Configuration

### Environment Variables

Create a `.env.testing` file or add to your `.env`:

```env
# Session Lifetime (in minutes)
SESSION_LIFETIME=1440

# Cross-Domain Token Expiration (in minutes)
CROSS_DOMAIN_TOKEN_EXPIRATION=1440

# Password Confirmation Timeout (in seconds)
AUTH_PASSWORD_TIMEOUT=28800
```

### Testing Configuration

See `.env.testing.example` for a complete testing environment configuration.

## Benefits

1. **Extended Testing Sessions:** Tests can run for extended periods without authentication expiring
2. **Cross-Domain Testing:** Cross-domain auth tokens remain valid for full testing sessions
3. **Comprehensive Test Coverage:** More time to test complex workflows
4. **Reduced Interruptions:** No need to re-authenticate during long test runs

## Production Considerations

⚠️ **Important:** These extended timeouts are for **testing only**. For production:

1. **Cross-Domain Tokens:** Reduce to 5-15 minutes for security
2. **Session Lifetime:** Use standard 120 minutes (2 hours)
3. **Test Timeouts:** Keep extended for CI/CD, but monitor for performance

## Reverting to Production Settings

To revert to production settings:

```env
SESSION_LIFETIME=120
CROSS_DOMAIN_TOKEN_EXPIRATION=5
AUTH_PASSWORD_TIMEOUT=10800
```

Or remove these from `.env` to use defaults.

## Testing

Verify the extended timeouts:

```bash
# Run Playwright tests
npx playwright test

# Check session lifetime
php artisan tinker
>>> config('session.lifetime')  // Should return 1440

# Check cross-domain token expiration
>>> config('auth.cross_domain_token_expiration')  // Should return 1440
```

---

**Last Updated:** December 22, 2025  
**Status:** ✅ Extended timeouts configured for testing

