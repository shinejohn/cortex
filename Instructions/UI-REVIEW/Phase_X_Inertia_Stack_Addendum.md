# INERTIA.JS STACK-SPECIFIC QA ADDENDUM
## Laravel 11 + Inertia.js + React — Architecture Verification Layer
### Applies Across ALL Phases

---

**This document supplements every phase of the QA plan.** The Fibonacco ecosystem is built on a Laravel 11 + Inertia.js + React stack. Inertia introduces specific patterns, conventions, and failure modes that vanilla Laravel or vanilla React apps don't have. Every check in this addendum MUST be executed alongside the checks in Phases 1–8.

---

## 1. INERTIA BOOT FILE VERIFICATION

The entire Inertia frontend starts from a single boot file. If this file is wrong, EVERYTHING breaks.

### 1.1 Verify `resources/js/app.tsx` (or `app.jsx`)

```
□ createInertiaApp() is called with correct configuration
□ resolvePageComponent() correctly maps page names to file paths
□ The glob pattern matches ALL page files:
    - Verify: import.meta.glob('./Pages/**/*.tsx') captures every page
    - Verify: The pattern is NOT too narrow (e.g., only './Pages/*.tsx' misses subdirectories)
    - Verify: The pattern is NOT too broad (doesn't accidentally include non-page files)
□ The default layout is applied correctly (if using persistent layouts)
□ The progress bar is configured (Inertia progress indicator)
□ Title and meta tag defaults are set
□ Error boundary is in place to catch rendering failures
```

**Test this by:**
```bash
# Verify the glob pattern catches all pages
node -e "
const pages = import.meta.glob('./Pages/**/*.tsx');
console.log('Pages found:', Object.keys(pages).length);
Object.keys(pages).forEach(p => console.log(p));
"
```

If ANY page file exists in `resources/js/Pages/` but is NOT matched by the glob pattern, that page will throw a runtime error when navigated to: `"Page not found: PageName"`. This shows as a white screen to the user.

### 1.2 Verify `resources/js/ssr.tsx` (or `ssr.jsx`)

```
□ SSR boot file exists at resources/js/ssr.tsx
□ createServer() is called with correct port (default 13714)
□ resolvePageComponent() uses the SAME glob pattern as app.tsx
□ The SSR entry point matches vite.config.ts ssr input
□ No browser-only APIs are called at the top level (window, document, localStorage)
```

### 1.3 Verify `vite.config.ts`

```
□ laravel() plugin is configured with correct input paths
□ SSR input points to the correct ssr.tsx file
□ react() plugin is included
□ Build output goes to public/build/
□ SSR output goes to bootstrap/ssr/
□ resolve.alias maps '@' to resources/js/ (for @/ import paths)
□ No missing aliases that would break imports
```

**Example expected config:**
```typescript
export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
});
```

---

## 2. HandleInertiaRequests MIDDLEWARE VERIFICATION

This middleware is the **single source of truth** for shared data passed to every page. It runs on every request.

### 2.1 Verify `app/Http/Middleware/HandleInertiaRequests.php`

```
□ File exists at app/Http/Middleware/HandleInertiaRequests.php
□ Middleware is registered in the HTTP kernel or bootstrap/app.php
□ The share() method returns all required shared data
□ Every key returned by share() is used somewhere in the frontend
□ No expensive queries run in share() without caching or lazy loading
```

### 2.2 Verify Shared Data Contract

The HandleInertiaRequests middleware typically shares:

```php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
        ],
        'flash' => [
            'success' => fn () => $request->session()->get('success'),
            'error' => fn () => $request->session()->get('error'),
            'warning' => fn () => $request->session()->get('warning'),
            'info' => fn () => $request->session()->get('info'),
        ],
        'ziggy' => fn () => [
            ...(new \Tighten\Ziggy\Ziggy)->toArray(),
            'location' => $request->url(),
        ],
        // App-specific shared data
        'currentRegion' => fn () => /* region resolution */,
        'appName' => config('app.name'),
        // etc.
    ]);
}
```

**Verification checklist:**
```
□ auth.user is shared (null for guests, user object for authenticated)
□ Flash messages are shared using closures (lazy evaluation)
□ Ziggy route helper data is shared (enables route() in JS)
□ Any app-specific shared data (region, settings, etc.) is shared
□ Closures are used for expensive operations (fn () => ...) to enable lazy loading
□ No sensitive data is accidentally exposed (passwords, tokens, internal IDs that shouldn't be public)
□ The user object doesn't leak sensitive fields — check the User model's $hidden array:
    - password, remember_token should be in $hidden
    - Any other sensitive fields should be hidden or stripped before sharing
```

### 2.3 Verify Frontend Consumption of Shared Data

Every shared key must be properly consumed in the frontend:

```
□ usePage() hook is used to access shared props (NOT direct prop drilling)
□ TypeScript interface for shared props exists and matches the PHP share() output
□ auth.user is checked before accessing user properties (guard for null/guest)
□ Flash messages are displayed using a toast/notification component
□ Flash messages are consumed and cleared (don't persist across navigations)
□ Ziggy route() function works correctly for generating URLs
```

**Create or verify `resources/js/types/global.d.ts` or similar:**
```typescript
// This interface MUST match HandleInertiaRequests::share()
export interface SharedProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
        warning: string | null;
        info: string | null;
    };
    ziggy: {
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
        location: string;
    };
    currentRegion?: Region | null;
    appName: string;
    // ... all other shared keys
}
```

```
□ SharedProps interface exists
□ Every key in the PHP share() array has a corresponding TypeScript field
□ Types are accurate (not all 'any')
□ usePage<SharedProps>() is typed correctly throughout the app
```

---

## 3. INERTIA PAGE COMPONENT VERIFICATION

### 3.1 Page Registration & Resolution

For EVERY page in `resources/js/Pages/`:

```
□ The page file path matches what the controller passes to Inertia::render()
    CRITICAL: Inertia::render('Articles/Show') resolves to resources/js/Pages/Articles/Show.tsx
    - Path is case-sensitive on Linux (production) even if it works on Mac (development)
    - Verify exact casing: 'articles/show' ≠ 'Articles/Show'
□ The page has a default export (not named export)
□ The component accepts props matching the controller's array
□ The component renders without crashing when ALL props are present
□ The component renders without crashing when OPTIONAL props are null/undefined
```

### 3.2 Persistent Layouts

If the app uses persistent layouts (layouts that don't re-mount between page visits):

```
□ Layout is assigned via page.layout property, NOT wrapping in JSX:

    // ✅ CORRECT — Persistent layout (doesn't re-mount)
    Show.layout = (page) => <AppLayout>{page}</AppLayout>;

    // ❌ WRONG — Non-persistent (re-mounts on every navigation)
    export default function Show() {
        return <AppLayout><div>...</div></AppLayout>;
    }

□ Verify which pattern is used and whether it's intentional
□ If persistent layouts are used, verify they handle prop updates correctly
□ Layout components receive children prop correctly
```

### 3.3 Inertia Head Component (SEO)

For EVERY public-facing page:

```
□ <Head> component from @inertiajs/react is imported and used
□ <Head title="Page Title" /> sets the browser tab title
□ Meta description is set for SEO
□ Open Graph tags are set (og:title, og:description, og:image, og:url)
□ Twitter card tags are set
□ Canonical URL is set
□ Title includes the app/region name (e.g., "Article Title | Day.News Tampa")
□ Dynamic content (article title, event name) is properly interpolated into meta tags
□ Special characters in titles are properly escaped
□ 404/error pages have appropriate (non-misleading) meta tags
```

**Example verification:**
```tsx
// ✅ CORRECT
<Head>
    <title>{article.title} | Day.News {region.name}</title>
    <meta name="description" content={article.excerpt} />
    <meta property="og:title" content={article.title} />
    <meta property="og:image" content={article.image_url} />
</Head>

// ❌ WRONG — missing or hardcoded
<Head title="Day.News" />  // Generic, no article-specific title
```

---

## 4. INERTIA NAVIGATION VERIFICATION

Inertia navigation is fundamentally different from traditional page loads. Verify these patterns:

### 4.1 Link Component Usage

```
□ ALL internal navigation uses <Link> from @inertiajs/react, NOT <a> tags
    Exception: External links (to other domains) correctly use <a target="_blank">
□ Link href values use the route() helper (Ziggy) or explicit paths
□ Link method prop is set correctly:
    <Link href={route('article.show', slug)} />              // GET (default)
    <Link href={route('logout')} method="post" as="button" /> // POST
□ Links that should preserve scroll position use preserveScroll prop
□ Links that should preserve component state use preserveState prop
□ Links that trigger destructive actions (delete) use method="delete"
□ No <Link> components point to external URLs (this would break)
```

### 4.2 Programmatic Navigation (router)

Search for all uses of Inertia's router:

```bash
grep -rn "router\.\(visit\|get\|post\|put\|patch\|delete\|reload\)" resources/js/ --include="*.tsx" --include="*.jsx"
```

For EACH programmatic navigation:

```
□ router.visit() uses the correct URL
□ router.post() / router.put() includes the correct data payload
□ Error callbacks are handled: onError, onFinish
□ Success callbacks are handled where appropriate: onSuccess
□ preserveScroll is set where user should stay at current scroll position
□ preserveState is set where component state should not reset
□ replace: true is used where the navigation should NOT create a browser history entry
    (e.g., filter changes, tab switches)
□ router.reload() is used for refreshing current page data (not full page reload)
□ router.reload({ only: ['prop1', 'prop2'] }) is used for partial reloads where possible
```

### 4.3 Partial Reloads

Inertia supports partial reloads to avoid re-fetching all props. Verify:

```
□ Controllers use Inertia::lazy() for expensive props that aren't needed on initial load
□ Frontend uses router.reload({ only: [...] }) to fetch only specific props
□ Partial reload props are properly handled (may be undefined on initial load)
□ Loading states account for partial reloads (don't show full-page loader)
```

---

## 5. INERTIA FORM HANDLING VERIFICATION

Inertia's `useForm()` hook is the primary way forms should work. This is a critical verification area.

### 5.1 Find All Forms

```bash
# Find all useForm usage
grep -rn "useForm" resources/js/ --include="*.tsx" --include="*.jsx"

# Find any raw fetch/axios calls that should use useForm instead
grep -rn "fetch\|axios\.post\|axios\.put\|axios\.patch\|axios\.delete" resources/js/ --include="*.tsx" --include="*.jsx"
```

### 5.2 Verify useForm Pattern

For EVERY form in the application:

```
□ Form uses Inertia's useForm() hook (not raw fetch/axios for form submissions)
    Exception: API-only calls that don't navigate (e.g., liking an article, voting on a poll)
    may use fetch/axios, but MUST handle CSRF and errors properly
□ useForm() is initialized with correct default values matching the form fields
□ form.data is bound to input values (controlled inputs)
□ form.setData() is called in onChange handlers
□ form.post() / form.put() / form.patch() is called on submit
□ form.processing is used to disable the submit button during submission
□ form.errors is used to display validation errors inline
□ form.reset() is called after successful submission where appropriate
□ form.clearErrors() is called when user modifies a field with an error
□ The submit function calls e.preventDefault() or uses onSubmit correctly
```

**Example of correct useForm pattern:**
```tsx
const form = useForm({
    title: '',
    body: '',
    category_id: '',
});

function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    form.post(route('articles.store'), {
        preserveScroll: true,
        onSuccess: () => {
            form.reset();
            // Show success feedback
        },
        onError: () => {
            // Errors auto-populate form.errors
        },
    });
}

// In JSX:
<form onSubmit={handleSubmit}>
    <input
        value={form.data.title}
        onChange={e => form.setData('title', e.target.value)}
    />
    {form.errors.title && <span className="text-red-500">{form.errors.title}</span>}

    <button type="submit" disabled={form.processing}>
        {form.processing ? 'Saving...' : 'Save'}
    </button>
</form>
```

### 5.3 Verify Validation Error Display

```
□ Laravel validation errors (422 response) auto-populate form.errors
□ Every form field that has validation rules in the controller has an error display element
□ Error messages display in red/danger color near the field
□ Error messages are human-readable (not raw validation rule names)
□ Errors clear when the user modifies the errored field
□ Form does NOT reset all fields on validation error (preserveState behavior)
□ Server-side validation rules in the controller match the field names used in useForm()
```

### 5.4 File Uploads via Inertia

```bash
# Find file upload forms
grep -rn "type.*file\|form\.post.*forceFormData\|useForm.*File" resources/js/ --include="*.tsx" --include="*.jsx"
```

For any file upload forms:

```
□ form.post() is used with forceFormData: true for file uploads
□ Files are set using form.setData('file', e.target.files[0])
□ Progress indicator shows upload progress (form.progress)
□ File size validation exists both client-side and server-side
□ Accepted file types are restricted in the input element
□ The controller uses $request->file() and validates with 'file' rules
```

---

## 6. INERTIA ERROR PAGE VERIFICATION

Inertia handles HTTP errors differently than traditional Laravel. Verify the error page setup:

### 6.1 Error Page Resolution

```
□ Custom error pages exist at resources/js/Pages/Error.tsx (or per-status pages)
□ The HandleInertiaRequests middleware (or a custom exception handler) renders Inertia error pages
□ Verify the exception handler in bootstrap/app.php or app/Exceptions/Handler.php:
```

**Expected pattern in Laravel 11:**
```php
// bootstrap/app.php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
        // Inertia error handling
        if (in_array($response->getStatusCode(), [403, 404, 500, 503])) {
            return Inertia::render('Error', [
                'status' => $response->getStatusCode(),
                'message' => $exception->getMessage(),
            ])
            ->toResponse($request)
            ->setStatusCode($response->getStatusCode());
        }
        return $response;
    });
})
```

### 6.2 Error Page Rendering

```
□ 403 Forbidden — Renders a styled "Access Denied" page (not white screen or JSON)
□ 404 Not Found — Renders a styled "Page Not Found" page with navigation back to home
□ 419 Page Expired — Renders a "Session Expired" page with refresh/login prompt
□ 422 Validation Error — Does NOT render an error page (stays on form with errors)
□ 429 Too Many Requests — Renders a "Rate Limited" page
□ 500 Internal Server Error — Renders a styled error page (NEVER shows stack trace in production)
□ 503 Service Unavailable — Renders a maintenance mode page
□ Error pages include navigation to go back or return to home
□ Error pages are styled consistently with the rest of the app
□ Error pages work with SSR (don't crash the SSR server)
```

---

## 7. INERTIA SSR VERIFICATION

The Fibonacco ecosystem runs a separate Inertia SSR service on Railway. This must be verified carefully.

### 7.1 SSR Build Verification

```bash
# Build SSR bundle
npm run build

# Verify SSR output exists
ls -la bootstrap/ssr/ssr.mjs

# Test SSR server starts
node bootstrap/ssr/ssr.mjs &
sleep 3
curl http://localhost:13714/health
kill %1
```

### 7.2 SSR-Safe Code Verification

SSR runs in Node.js (no browser APIs). Scan for browser-only code:

```bash
# Find dangerous browser API usage at module level (outside useEffect)
grep -rn "window\.\|document\.\|localStorage\|sessionStorage\|navigator\.\|alert(" \
  resources/js/ --include="*.tsx" --include="*.jsx" | \
  grep -v "typeof window" | \
  grep -v "useEffect" | \
  grep -v "// " | \
  grep -v "node_modules"
```

For EACH hit:

```
□ Browser API access is wrapped in useEffect() (client-side only)
□ OR browser API access is guarded with typeof window !== 'undefined'
□ OR the code only runs in event handlers (onClick, onChange) which are client-only
□ No browser APIs are called during component render (will crash SSR)
□ No browser APIs are used in module-level code (import side effects)
```

### 7.3 SSR Content Verification

```
□ View page source on production URLs shows real HTML content (not empty <div id="app">)
□ Article text appears in the HTML source (for SEO crawlers)
□ Meta tags appear in the HTML source
□ Structured data (JSON-LD) appears in the HTML source
□ SSR renders the same content as client-side hydration (no mismatch warnings)
□ If SSR fails, the app degrades gracefully to client-side rendering (CSR fallback)
```

---

## 8. ZIGGY ROUTE HELPER VERIFICATION

Ziggy provides the `route()` function in JavaScript that mirrors Laravel's route helper.

### 8.1 Verify Ziggy Configuration

```
□ Ziggy package is installed: composer show tightenco/ziggy
□ @routes Blade directive is in the main layout (or Ziggy data is shared via HandleInertiaRequests)
□ Ziggy TypeScript declarations exist (for type safety)
□ route() function is available in all page components
```

### 8.2 Verify Route Usage

```bash
# Find all route() calls in JS/TS
grep -rn "route(" resources/js/ --include="*.tsx" --include="*.jsx" --include="*.ts" | \
  grep -oP "route\('([^']+)'" | sort -u
```

For EVERY route() call:

```
□ The route name exists in routes/web.php (check with php artisan route:list)
□ Required route parameters are passed: route('article.show', { slug: article.slug })
□ Parameter names match the route definition (not positional, but named)
□ route() is not called with undefined parameters (causes malformed URLs)
□ The generated URL is correct (log route() output and verify)
```

### 8.3 Ziggy Route Filtering

If Ziggy is configured to only expose certain routes (for security):

```
□ Check config/ziggy.php for 'only' or 'except' filters
□ Verify that all routes used by route() in the frontend are included
□ Verify that sensitive/admin routes are NOT exposed to the frontend if they shouldn't be
```

---

## 9. INERTIA CSRF & SESSION VERIFICATION

Inertia handles CSRF automatically through its axios configuration, but verify:

```
□ The CSRF meta tag is present in the main Blade layout:
    <meta name="csrf-token" content="{{ csrf_token() }}">
□ Inertia/axios is configured to read the CSRF token from the meta tag or cookie
□ Session configuration in config/session.php is correct:
    - same_site: 'lax' (or 'none' if cross-origin needed)
    - secure: true in production
    - domain: matches the app domain (or null for auto)
□ Session driver works (file, database, redis — matching the environment)
□ CSRF token mismatches (419 errors) are handled gracefully
□ After a 419, the page refreshes to get a new token (not stuck in error loop)
```

---

## 10. INERTIA PROGRESS INDICATOR VERIFICATION

```
□ NProgress (or custom progress indicator) is configured in app.tsx
□ Progress bar appears during page navigation (visible feedback to user)
□ Progress bar color matches the app's design system
□ Progress bar does not appear for instant navigations (preserveState reloads)
□ If a custom loading indicator is used, verify it shows and hides correctly
```

---

## 11. INERTIA-SPECIFIC PLAYWRIGHT TESTS

Add these Inertia-specific tests to the Phase 6 Playwright suite:

### 11.1 Navigation Tests
```typescript
test('Inertia navigation does not cause full page reload', async ({ page }) => {
    await page.goto('/');
    const initialDocumentId = await page.evaluate(() => document.documentElement.dataset.inertiaVisit || 'none');

    // Click an internal link
    await page.click('a[href="/articles"]');
    await page.waitForURL('**/articles');

    // Verify it was an Inertia visit (not full reload)
    // The page should not have a new document — check that app state persists
    const bodyExists = await page.locator('#app').count();
    expect(bodyExists).toBe(1);
});
```

### 11.2 Form Submission Tests
```typescript
test('Form validation errors display inline without page reload', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Validation errors should appear WITHOUT a full page navigation
    await expect(page.locator('.text-red-500')).toBeVisible();

    // URL should NOT have changed
    expect(page.url()).toContain('/login');
});
```

### 11.3 SSR Verification Test
```typescript
test('Pages are server-side rendered with content', async ({ page }) => {
    // Disable JavaScript to verify SSR content
    await page.context().route('**/*', route => route.continue());

    const response = await page.goto('/');
    const html = await response?.text();

    // The HTML should contain actual content, not just an empty app div
    expect(html).toContain('<article'); // or whatever content element exists
    expect(html).not.toMatch(/<div id="app">\s*<\/div>/); // Empty app div = no SSR
});
```

### 11.4 Flash Message Tests
```typescript
test('Flash messages display after form submission', async ({ page }) => {
    // Login and perform an action that triggers a flash message
    // Verify the toast/notification appears
    // Verify it auto-dismisses or can be dismissed
});
```

### 11.5 Back Button Test
```typescript
test('Browser back button works correctly with Inertia', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="/articles"]');
    await page.waitForURL('**/articles');

    // Click into an article
    await page.click('article a');
    await page.waitForURL('**/articles/**');

    // Go back
    await page.goBack();
    await page.waitForURL('**/articles');

    // Verify the page renders correctly (not broken/blank)
    await expect(page.locator('body')).not.toHaveText('');
});
```

---

## 12. COMMON INERTIA FAILURE MODES — MUST CHECK

These are the most common bugs in Inertia applications. Every single one must be checked:

| # | Failure Mode | How to Detect | Impact |
|---|-------------|---------------|--------|
| 1 | **Page component not found** | Inertia::render('Wrong/Path') vs actual file location | White screen, console error |
| 2 | **Case sensitivity** | Works on Mac (case-insensitive FS), breaks on Linux (Railway) | 404 or white screen in production only |
| 3 | **Missing shared props** | usePage().props.auth undefined because middleware not registered | Crash on any page accessing auth |
| 4 | **SSR crash from browser API** | window.innerWidth used at render time | SSR server dies, no server-rendered HTML |
| 5 | **422 not handled** | form.errors not displayed, user sees no feedback | Silent form failure |
| 6 | **Stale CSRF (419)** | Long-idle sessions, user submits form | Confusing "page expired" with no recovery |
| 7 | **Missing route() name** | route('nonexistent.route') in JS | Runtime error, button/link does nothing |
| 8 | **Props type mismatch** | Controller sends array, TS expects object | Crash or wrong rendering |
| 9 | **N+1 in shared data** | Heavy query in HandleInertiaRequests::share() without caching | Every page load is slow |
| 10 | **Hydration mismatch** | SSR renders different HTML than client hydration | Console warnings, flickering UI |
| 11 | **Non-persistent layout re-mount** | Using JSX wrapper instead of page.layout | Audio players restart, state resets on navigation |
| 12 | **Back button breaks scroll** | Missing preserveScroll on list → detail → back navigation | User loses scroll position |
| 13 | **Double form submission** | Missing form.processing disabled check on submit button | Duplicate records created |
| 14 | **Redirect after POST not using Inertia** | Controller returns redirect() instead of Inertia::location() for external URLs | Inertia tries to handle as page visit, fails |

---

## 13. INERTIA-SPECIFIC FILE SCAN COMMANDS

Add these to Phase 1's inventory process:

```bash
# 1. Find all Inertia::render calls with page names and props
grep -rn "Inertia::render" app/Http/Controllers/ --include="*.php" | \
  sed 's/.*Inertia::render(\(.*\)/\1/' > /tmp/inertia_renders.txt

# 2. Find all useForm instances and their routes
grep -rn "useForm\|form\.post\|form\.put\|form\.patch\|form\.delete" \
  resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_forms.txt

# 3. Find all router.visit/get/post calls
grep -rn "router\.\(visit\|get\|post\|put\|patch\|delete\|reload\)" \
  resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_router.txt

# 4. Find all <Link> and <a> tag usage
grep -rn "<Link\|<a " resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_links.txt

# 5. Find all usePage() usage
grep -rn "usePage" resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_usepage.txt

# 6. Find all route() Ziggy calls
grep -rn "route(" resources/js/ --include="*.tsx" --include="*.jsx" --include="*.ts" > /tmp/ziggy_routes.txt

# 7. Find browser API usage that could break SSR
grep -rn "window\.\|document\.\|localStorage\|sessionStorage" \
  resources/js/ --include="*.tsx" --include="*.jsx" | \
  grep -v "typeof window" | grep -v "useEffect" > /tmp/ssr_risks.txt

# 8. Find all Head component usage
grep -rn "<Head" resources/js/Pages/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_head.txt

# 9. Pages WITHOUT Head component (SEO gap)
for f in $(find resources/js/Pages -name "*.tsx" -o -name "*.jsx"); do
  if ! grep -q "<Head" "$f"; then
    echo "MISSING HEAD: $f"
  fi
done
```

---

## 14. INTEGRATION INTO EACH PHASE

### Phase 1 Addition:
- Run ALL scan commands from Section 13 above
- Add results to the master checklist
- Flag pages missing <Head> components
- Flag SSR-unsafe browser API usage
- Map every Inertia::render() to its page file

### Phase 2–4 Addition:
- For every page reviewed, run the Section 3 (Page Component) checks
- For every form found, run the Section 5 (Form Handling) checks
- For every navigation element, run the Section 4 (Navigation) checks
- Verify SSR safety per Section 7.2

### Phase 5 Addition:
- Run the complete Ziggy route verification (Section 8)
- Verify HandleInertiaRequests shared data (Section 2)
- Verify error page rendering (Section 6)
- Verify CSRF/session configuration (Section 9)
- Check all 14 common failure modes from Section 12

### Phase 6 Addition:
- Add all Inertia-specific Playwright tests from Section 11
- Include SSR content verification test
- Include back button / navigation history test
- Include form validation error display test

### Phase 8 Addition:
- Verify SSR build and server startup
- Verify SSR content appears in view-source
- Verify SSR service is running and connected on Railway
- Test that SSR failure degrades gracefully to CSR
