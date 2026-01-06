# Playwright E2E Testing Setup

## Setup Instructions

### 1. Install Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Seed Test Users

```bash
php artisan db:seed --class=PlaywrightTestUsersSeeder
```

This creates the following test users:
- `admin@test.com` / `password` (owner role)
- `user@test.com` / `password` (member role)
- `editor@test.com` / `password` (member role)
- `viewer@test.com` / `password` (member role)

### 3. Run Authentication Setup

```bash
npx playwright test tests/Playwright/auth.setup.ts
```

This will:
- Log in as admin
- Save authentication state to `tests/.auth/auth.json`

### 4. Run Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/Playwright/example.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific browser
npx playwright test --project=chromium
```

## Using Authentication State

In your tests, use the saved authentication state:

```typescript
import { test, expect } from '@playwright/test';
import * as path from 'path';

const authFile = path.join(__dirname, '../.auth/auth.json');

test('my test', async ({ page }) => {
    // Use saved auth state
    test.use({ storageState: authFile });
    
    await page.goto('/dashboard');
    // Test authenticated routes...
});
```

## Multiple User Authentication

To authenticate as different users, create separate setup files:

```typescript
// tests/Playwright/auth-user.setup.ts
setup('authenticate as regular user', async ({ page, context }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@test.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|home)/);
    await context.storageState({ path: 'tests/.auth/user-auth.json' });
});
```

Then use in tests:

```typescript
test.use({ storageState: 'tests/.auth/user-auth.json' });
```

