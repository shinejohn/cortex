# PHASE 6: PLAYWRIGHT E2E TESTING WITH LARAVEL HERD
## Antigravity Instructions — Automated UI Workflow Testing

---

**Objective:** After completing code review (Phases 2–5), run automated end-to-end tests using Playwright against the local Laravel Herd environment. Every page must load without errors. Every user workflow must complete successfully. Zero 400 or 500 errors.

**Prerequisites:** Phases 2–5 must be complete. All code fixes must be committed. Laravel Herd must be running locally with all apps accessible.

---

## STEP 6.1 — ENVIRONMENT SETUP

### 6.1.1 Laravel Herd Configuration
```bash
# Verify Laravel Herd is running and serving all apps
# Each app should be accessible at its local domain:
# day-news.test           → Day.News
# goeventcity.test        → GoEventCity
# downtownguide.test      → Downtown Guide
# golocalvoices.test      → Go Local Voices
# alphasite.test           → AlphaSite
# commandcenter.test       → SMB Command Center

# Verify database is seeded with test data
php artisan db:seed --class=TestDataSeeder
# If no dedicated test seeder exists, verify there's sufficient data in the local database
```

### 6.1.2 Playwright Setup
```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install chromium firefox webkit

# Create playwright config
```

### 6.1.3 Playwright Configuration File

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Sequential to avoid race conditions
  forbidOnly: true,
  retries: 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'tests/e2e/reports' }],
    ['json', { outputFile: 'tests/e2e/results.json' }],
    ['list']
  ],
  timeout: 30000,
  expect: { timeout: 10000 },

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop Chrome
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],
});
```

---

## STEP 6.2 — TEST STRUCTURE

Create the following test file structure:

```
tests/e2e/
├── helpers/
│   ├── auth.ts          — Login/logout helpers
│   ├── assertions.ts    — Custom assertion helpers
│   └── navigation.ts    — Navigation helpers
├── day-news/
│   ├── home.spec.ts
│   ├── article.spec.ts
│   ├── category.spec.ts
│   ├── poll.spec.ts
│   ├── search.spec.ts
│   └── navigation.spec.ts
├── goeventcity/
│   ├── home.spec.ts
│   ├── event-detail.spec.ts
│   ├── calendar.spec.ts
│   └── search.spec.ts
├── downtown-guide/
│   ├── home.spec.ts
│   ├── business-detail.spec.ts
│   ├── category.spec.ts
│   └── search.spec.ts
├── go-local-voices/
│   ├── home.spec.ts
│   ├── podcast.spec.ts
│   ├── video.spec.ts
│   └── player.spec.ts
├── alphasite/
│   ├── dashboard.spec.ts
│   ├── ai-employee.spec.ts
│   └── task-assignment.spec.ts
├── command-center/
│   ├── crm-dashboard.spec.ts
│   ├── customer-management.spec.ts
│   ├── pipeline.spec.ts
│   └── campaigns.spec.ts
└── shared/
    ├── auth-flow.spec.ts
    ├── responsive.spec.ts
    └── error-handling.spec.ts
```

---

## STEP 6.3 — CORE TEST HELPERS

### 6.3.1 Error Detection Helper

Create `tests/e2e/helpers/assertions.ts`:

```typescript
import { Page, expect } from '@playwright/test';

/**
 * CRITICAL: This function must be called on EVERY page load.
 * It verifies no HTTP errors occurred and no console errors exist.
 */
export async function assertNoErrors(page: Page, url: string) {
  // Check HTTP status
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  expect(response?.status(), `Page ${url} returned HTTP ${response?.status()}`).toBeLessThan(400);

  // Check for console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Wait for any async errors
  await page.waitForTimeout(1000);

  // Assert no console errors (filter out known benign errors if needed)
  const realErrors = consoleErrors.filter(e =>
    !e.includes('favicon.ico') &&
    !e.includes('DevTools') &&
    !e.includes('Third-party cookie')
  );

  expect(realErrors, `Console errors on ${url}: ${realErrors.join(', ')}`).toHaveLength(0);
}

/**
 * Check that no "undefined" or "null" text appears in visible content
 */
export async function assertNoUndefinedText(page: Page) {
  const bodyText = await page.textContent('body');

  // Check for literal "undefined" or "null" displayed to users
  // Exclude script tags and hidden elements
  const visibleText = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const el = node.parentElement;
          if (!el) return NodeFilter.FILTER_REJECT;
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') return NodeFilter.FILTER_REJECT;
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let text = '';
    while (walker.nextNode()) {
      text += ' ' + walker.currentNode.textContent;
    }
    return text;
  });

  expect(visibleText).not.toContain('undefined');
  expect(visibleText).not.toMatch(/\bnull\b(?!ify|able|ed)/); // Allow "nullify" etc.
}

/**
 * Check for broken images
 */
export async function assertNoBrokenImages(page: Page) {
  const brokenImages = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src);
  });

  expect(brokenImages, `Broken images: ${brokenImages.join(', ')}`).toHaveLength(0);
}

/**
 * Check all internal links resolve (no 404s)
 */
export async function assertNoDeadLinks(page: Page, baseUrl: string) {
  const links = await page.evaluate((base) => {
    return Array.from(document.querySelectorAll('a[href]'))
      .map(a => a.getAttribute('href'))
      .filter(href => href && href.startsWith('/') && !href.startsWith('//'))
      .filter((v, i, a) => a.indexOf(v) === i); // unique
  }, baseUrl);

  for (const link of links.slice(0, 20)) { // Test up to 20 links per page
    const response = await page.request.get(`${baseUrl}${link}`);
    expect(response.status(), `Dead link: ${link} returned ${response.status()}`).toBeLessThan(400);
  }
}
```

---

## STEP 6.4 — TEST SPECIFICATIONS PER APP

### Day.News Test Requirements

Every test MUST call `assertNoErrors()`, `assertNoUndefinedText()`, and `assertNoBrokenImages()`.

```typescript
// tests/e2e/day-news/home.spec.ts
test.describe('Day.News Home Page', () => {
  test('loads without errors', async ({ page }) => { /* assertNoErrors */ });
  test('displays hero/featured article', async ({ page }) => { /* verify hero section exists and has content */ });
  test('displays latest news feed', async ({ page }) => { /* verify article list renders */ });
  test('category navigation works', async ({ page }) => { /* click each category, verify page loads */ });
  test('pagination works', async ({ page }) => { /* click next, verify new content loads */ });
  test('region selector works', async ({ page }) => { /* change region, verify content updates */ });
  test('no undefined text displayed', async ({ page }) => { /* assertNoUndefinedText */ });
  test('no broken images', async ({ page }) => { /* assertNoBrokenImages */ });
  test('all navigation links work', async ({ page }) => { /* assertNoDeadLinks */ });
});

// tests/e2e/day-news/article.spec.ts
test.describe('Day.News Article Detail', () => {
  test('article page loads from slug', async ({ page }) => { /* navigate to a known article slug */ });
  test('article title and body display', async ({ page }) => { /* verify content renders */ });
  test('author byline displays', async ({ page }) => { /* verify author name, not undefined */ });
  test('category badge displays', async ({ page }) => { /* verify badge exists */ });
  test('share buttons are present and clickable', async ({ page }) => { /* click each share button */ });
  test('related articles section displays', async ({ page }) => { /* verify related articles load */ });
  test('comment section loads', async ({ page }) => { /* verify comments area renders */ });
  test('404 for non-existent article', async ({ page }) => { /* verify proper 404, not 500 */ });
  test('no undefined text displayed', async ({ page }) => { /* assertNoUndefinedText */ });
});

// tests/e2e/day-news/poll.spec.ts
test.describe('Day.News Polls', () => {
  test('poll page loads without auth', async ({ page }) => { /* verify public access works */ });
  test('poll options display correctly', async ({ page }) => { /* verify all options render */ });
  test('vote submission works', async ({ page }) => { /* select option, submit, verify confirmation */ });
  test('results display after voting', async ({ page }) => { /* verify percentages and counts */ });
  test('share URL copies correctly', async ({ page }) => { /* test copy link functionality */ });
  test('countdown timer displays', async ({ page }) => { /* verify timer is present and counting */ });
  test('embed page renders in minimal layout', async ({ page }) => { /* load /poll/{slug}/embed */ });
});
```

### Apply Similar Test Patterns For:
- GoEventCity: Event listing, event detail, calendar view, search, venue pages
- Downtown Guide: Business listing, business detail, category filter, search, reviews
- Go Local Voices: Content listing, podcast player, video player, episode detail
- AlphaSite: Dashboard, AI employee cards, task assignment, performance reports
- Command Center: CRM dashboard, customer search, pipeline board, campaign list

---

## STEP 6.5 — INERTIA-SPECIFIC E2E TESTS

These tests verify Inertia's core behaviors work correctly. Add to the `tests/e2e/shared/` directory.

### 6.5.1 Inertia Navigation (No Full Page Reload)
```typescript
test('internal navigation uses Inertia (no full reload)', async ({ page }) => {
    await page.goto('/');
    // Listen for full page load events (should NOT fire on Inertia nav)
    let fullReloadOccurred = false;
    page.on('load', () => { fullReloadOccurred = true; });

    // Click internal link
    await page.click('a[href*="/articles"], a[href*="/events"]');
    await page.waitForTimeout(2000);

    // After initial load, subsequent navigations should be Inertia (XHR, not full load)
    // Note: first goto triggers 'load', but subsequent Link clicks should not
    expect(fullReloadOccurred).toBe(false);
});
```

### 6.5.2 Form Validation Errors Display Inline
```typescript
test('useForm validation errors appear without page navigation', async ({ page }) => {
    // Navigate to a page with a form (e.g., login, contact, comment)
    await page.goto('/login');
    const currentUrl = page.url();

    // Submit empty form to trigger 422 validation
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // URL should NOT change (Inertia stays on same page for 422)
    expect(page.url()).toBe(currentUrl);

    // Validation error text should be visible
    const errorVisible = await page.locator('.text-red-500, .text-destructive, [class*="error"]').count();
    expect(errorVisible).toBeGreaterThan(0);
});
```

### 6.5.3 Flash Messages After Action
```typescript
test('flash messages appear after form submission', async ({ page }) => {
    // Login first, then perform an action that triggers flash
    // (adapt to whatever authenticated action is available)
    // After submission, look for toast/notification component
    // Verify it contains success/error text
});
```

### 6.5.4 Browser Back Button Works
```typescript
test('browser back button renders previous page correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="/articles"]');
    await page.waitForURL('**/articles**');

    // Click into a detail page
    const firstLink = page.locator('article a, .article-card a').first();
    if (await firstLink.count() > 0) {
        await firstLink.click();
        await page.waitForTimeout(1000);

        // Go back
        await page.goBack();
        await page.waitForTimeout(1000);

        // Page should render correctly (not blank)
        const bodyText = await page.textContent('body');
        expect(bodyText?.length).toBeGreaterThan(100);
    }
});
```

### 6.5.5 SSR Content Verification
```typescript
test('pages are server-side rendered with real content', async ({ page }) => {
    // Fetch raw HTML without executing JS
    const response = await page.request.get('/');
    const html = await response.text();

    // HTML should contain actual content tags (not just empty #app div)
    expect(html).toMatch(/<(article|section|main|h1|h2)/);
    // Should NOT be just: <div id="app"></div>
    expect(html).not.toMatch(/<div id="app">\s*<\/div>/);
});
```

### 6.5.6 CSRF Token Expiry Handling
```typescript
test('expired CSRF token (419) shows recovery page, not crash', async ({ page }) => {
    // This tests that if a user's session expires, they see a friendly error
    // Simulate by making a POST to a CSRF-protected route with invalid token
    const response = await page.request.post('/logout', {
        headers: { 'X-CSRF-TOKEN': 'invalid-token-12345' }
    });
    // Should get 419, not 500
    expect(response.status()).toBe(419);
});
```

---

## STEP 6.7 — NETWORK ERROR MONITORING

Add a global test fixture that monitors ALL network requests during every test:

```typescript
// tests/e2e/helpers/network-monitor.ts
import { Page } from '@playwright/test';

export function monitorNetwork(page: Page): { errors: string[] } {
  const state = { errors: [] as string[] };

  page.on('response', response => {
    if (response.status() >= 400) {
      state.errors.push(`${response.status()} ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    state.errors.push(`FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  return state;
}
```

Use this in EVERY test to catch any background API calls that fail (XHR/fetch requests to API endpoints).

---

## STEP 6.8 — RUN TESTS & GENERATE REPORT

```bash
# Run all tests
npx playwright test

# Run with specific app
npx playwright test tests/e2e/day-news/

# Run with UI mode for debugging
npx playwright test --ui

# Generate HTML report
npx playwright show-report tests/e2e/reports
```

### Required Pass Rate: 100%

Every single test must pass. Any failure is a bug that must be fixed before proceeding. After fixing, re-run the full suite to confirm no regressions.

---

## DELIVERABLE: TEST RESULTS

1. `tests/e2e/results.json` — Machine-readable test results
2. `tests/e2e/reports/` — HTML report with screenshots of failures
3. Update `QA_MASTER_CHECKLIST.md` with test pass/fail status per page

---

## COMPLETION CRITERIA FOR PHASE 6

Phase 6 is COMPLETE when:

1. ✅ Playwright test suite exists with tests for every app
2. ✅ Every page has at minimum: load test, no-errors test, no-undefined test
3. ✅ Critical user workflows are tested (vote on poll, browse articles, search, navigate)
4. ✅ All tests pass at 100% on desktop Chrome
5. ✅ All tests pass at 100% on mobile Safari viewport
6. ✅ Zero network requests return 400+ status codes during any test
7. ✅ Test results committed to `qa/pre-production-phase-6` branch
8. ✅ `QA_AUDIT_LOG_PHASE_6.json` generated and committed

**Do not proceed to Phase 7 until Phase 6 is fully complete.**
