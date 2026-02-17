# PHASE 5: ROUTES, PROPS & MIGRATION VERIFICATION
## Antigravity Instructions — Cross-Cutting System Verification

---

**Objective:** After reviewing individual pages in Phases 2–4, this phase performs system-wide cross-reference verification. We verify that every route resolves, every prop chain is complete from database to UI, and every migration is consistent with the code.

**Prerequisites:** Phases 2, 3, and 4 must be complete.

---

## STEP 5.1 — COMPLETE ROUTE AUDIT

### 5.1.1 Generate Full Route Table
```bash
php artisan route:list --json > route_audit.json
php artisan route:list --columns=method,uri,name,action,middleware > route_audit.txt
```

### 5.1.2 Verify Every Route

For EVERY route in the list:

```
□ HTTP method is correct (GET for pages, POST for forms, PUT/PATCH for updates, DELETE for removals)
□ URI pattern makes semantic sense (no typos, consistent naming)
□ Route name exists and follows convention (app.resource.action)
□ Controller@method exists and is not empty
□ Middleware stack is appropriate:
  - Public pages: no 'auth' middleware
  - Protected pages: 'auth' middleware present
  - API routes: 'api' middleware, proper rate limiting
  - Admin routes: additional role/permission middleware
□ Route parameters are used in the controller (no unused {id} or {slug})
□ Route model binding resolves correctly (no ModelNotFoundException becoming 500 instead of 404)
```

### 5.1.3 Check for Route Conflicts
```bash
# Look for duplicate URIs with same method
php artisan route:list --json | python3 -c "
import json, sys
routes = json.load(sys.stdin)
seen = {}
for r in routes:
    key = f\"{r['method']}|{r['uri']}\"
    if key in seen:
        print(f\"CONFLICT: {key} defined in {seen[key]} AND {r['action']}\")
    seen[key] = r['action']
"
```

### 5.1.4 Check for Missing Named Routes
Search all Blade/React code for route references and verify each exists:

```bash
# Find all route() calls in PHP
grep -rn "route(" resources/views/ app/ --include="*.php" --include="*.blade.php" | \
  grep -oP "route\('([^']+)'" | sort -u > /tmp/used_routes.txt

# Find all route() calls in JS/TS
grep -rn "route(" resources/js/ --include="*.tsx" --include="*.jsx" --include="*.ts" | \
  grep -oP "route\('([^']+)'" | sort -u >> /tmp/used_routes.txt

# Compare with registered route names
php artisan route:list --json | python3 -c "
import json, sys
routes = json.load(sys.stdin)
names = {r['name'] for r in routes if r['name']}
print('\n'.join(sorted(names)))
" > /tmp/registered_routes.txt

# Find routes used in code but not registered
comm -23 <(sort -u /tmp/used_routes.txt) <(sort -u /tmp/registered_routes.txt)
```

---

## STEP 5.2 — COMPLETE PROP CHAIN VERIFICATION

For every page that was reviewed in Phases 2–4, trace the full data flow from database to screen:

### 5.2.1 The Prop Chain

```
DATABASE TABLE → Migration defines columns
      ↓
ELOQUENT MODEL → $fillable, $casts, relationships
      ↓
CONTROLLER METHOD → Query, eager load, transform
      ↓
Inertia::render() → Props array sent to frontend
      ↓
PAGE COMPONENT → Props interface, destructuring
      ↓
CHILD COMPONENTS → Props drilling, data access
      ↓
RENDERED UI → Text, images, links displayed to user
```

### 5.2.2 Verification Script

For each Inertia page, execute:

```bash
# Step A: Find the controller method
grep -rn "Inertia::render('PageName'" app/Http/Controllers/ --include="*.php"

# Step B: Extract the props array from that method
# (manual inspection — read the controller code)

# Step C: Find the TypeScript interface for those props
grep -rn "interface.*Props" resources/js/Pages/PageName.tsx

# Step D: Compare: Does every key in the controller's array match the TS interface?
# Step E: Compare: Does every required field in the TS interface get sent by the controller?
# Step F: Does the controller's Eloquent query actually load the data needed for each prop?
```

### 5.2.3 Common Prop Chain Failures to Check

```
□ Controller sends 'user' but TS interface expects 'author'
□ Controller sends nested object (user.profile.avatar) but TS interface is flat
□ Controller sends pagination (items, meta, links) but page only destructures items
□ Controller uses ->get() but page expects single object (->first() needed)
□ Controller eager-loads 'comments' but page accesses 'article.comments' differently
□ Controller sends null for optional relationship but page doesn't guard for null
□ Controller transforms data (->map()) but TS interface matches raw model shape
□ Controller sends dates as strings but page tries to call .toLocaleDateString() on them
□ Controller sends IDs as integers but page uses them in string comparisons
□ Controller sends snake_case keys but page expects camelCase
```

---

## STEP 5.3 — MIGRATION & SCHEMA VERIFICATION

### 5.3.1 Verify Migration Status
```bash
# Check for pending migrations
php artisan migrate:status

# Verify no "Pending" migrations exist
php artisan migrate:status | grep -i "pending"
```

If any migrations are pending, they must be run or their necessity must be evaluated.

### 5.3.2 Verify Table Existence
```bash
# List all tables in the database
php artisan tinker --execute="
    \$tables = \DB::select('SELECT tablename FROM pg_tables WHERE schemaname = \'public\' ORDER BY tablename');
    foreach(\$tables as \$t) echo \$t->tablename . PHP_EOL;
"
```

Cross-reference with all migrations — every `Schema::create('table_name')` must have a corresponding table in the database.

### 5.3.3 Verify Foreign Keys
For every model relationship, verify the foreign key column exists:

```bash
# Example: If NewsArticle belongsTo Region
# Verify 'region_id' column exists on news_articles table
php artisan tinker --execute="
    \$columns = \Schema::getColumnListing('news_articles');
    echo in_array('region_id', \$columns) ? 'OK' : 'MISSING: region_id';
"
```

Do this for EVERY relationship defined on EVERY model used in UI controllers.

### 5.3.4 Verify Enum Consistency
Find all enum columns and verify code uses matching values:

```bash
# Find all enum definitions in migrations
grep -rn "->enum(" database/migrations/ --include="*.php"

# Find all enum references in models
grep -rn "'status'" app/Models/ --include="*.php" | head -20
```

Verify that any hardcoded status values in the UI ('published', 'draft', 'pending_review', etc.) match the database enum definitions.

### 5.3.5 Verify Index Coverage
For columns frequently queried (slug, status, region_id, category, created_at):

```bash
# Check indexes exist
php artisan tinker --execute="
    \$indexes = \DB::select(\"SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'news_articles'\");
    foreach(\$indexes as \$i) echo \$i->indexname . ' on ' . \$i->tablename . PHP_EOL;
"
```

---

## STEP 5.4 — INERTIA MIDDLEWARE & SHARED DATA VERIFICATION

### 5.4.1 Verify HandleInertiaRequests Middleware

```bash
# Verify middleware is registered
grep -rn "HandleInertiaRequests" bootstrap/app.php app/Http/Kernel.php
```

```
□ HandleInertiaRequests is registered in the web middleware group
□ The share() method returns all keys used by usePage() in the frontend
□ auth.user is shared with appropriate $hidden fields on the User model
□ Flash messages (success, error, warning, info) are shared via closures
□ Ziggy route data is shared (enables route() in JavaScript)
□ App-specific shared data (currentRegion, appName, etc.) is present
□ Expensive shared data uses closures (fn () => ...) for lazy evaluation
□ No sensitive data leaks through shared props (API keys, tokens, internal configs)
```

### 5.4.2 Verify Ziggy Route Helper

```bash
# List all Ziggy route() calls in frontend
grep -rn "route(" resources/js/ --include="*.tsx" --include="*.jsx" --include="*.ts" | \
  grep -oP "route\('([^']+)'" | sort -u > /tmp/frontend_route_names.txt

# List all registered route names
php artisan route:list --columns=name | grep -v "^\+" | grep -v "Name" | \
  awk '{print $1}' | sort -u > /tmp/backend_route_names.txt

# Find route() calls that reference NON-EXISTENT routes
comm -23 /tmp/frontend_route_names.txt /tmp/backend_route_names.txt
```

Every route name used by `route()` in JavaScript MUST exist in `php artisan route:list`. Any mismatch is a **CRITICAL** issue — it will throw a runtime error when the user clicks that link.

### 5.4.3 Verify Inertia Error Page Handling

```bash
cat bootstrap/app.php
```

```
□ Custom error handling for Inertia is configured in withExceptions()
□ HTTP 403 renders an Inertia error page (not JSON or blank)
□ HTTP 404 renders an Inertia error page with "back to home" navigation
□ HTTP 419 (CSRF expired) renders a page with "refresh" prompt
□ HTTP 500 renders a styled error page (NEVER shows stack trace in production)
□ HTTP 503 renders a maintenance page
□ Error page component exists: resources/js/Pages/Error.tsx (or equivalent)
□ Error page renders correctly with SSR (doesn't crash SSR server)
```

---

## STEP 5.6 — MIDDLEWARE & AUTH VERIFICATION

### 5.4.1 Verify Protected Routes
```
□ All admin/dashboard routes require 'auth' middleware
□ All user profile/settings routes require 'auth' middleware
□ All data modification routes (POST, PUT, DELETE) require 'auth' or 'api' middleware
□ Public read routes (articles, events, businesses, polls) do NOT require auth
□ API routes have appropriate rate limiting middleware
□ CSRF protection is active on all web form submissions
```

### 5.4.2 Verify Role-Based Access
```
□ Admin-only pages check for admin role/permission
□ Editor pages check for editor permissions
□ Business owner pages check for business ownership
□ Regular users cannot access admin/editor routes
□ Unauthenticated users get redirected to login (not 500 error)
□ Unauthorized users get 403 Forbidden (not 500 error)
```

---

## STEP 5.7 — LINT & TYPE CHECKING

### 5.5.1 Run TypeScript Compiler
```bash
npx tsc --noEmit 2>&1 | tee /tmp/ts_errors.txt
echo "TypeScript errors: $(grep -c 'error TS' /tmp/ts_errors.txt)"
```

Every TypeScript error must be fixed. No `// @ts-ignore` comments unless absolutely necessary with a documented reason.

### 5.5.2 Run ESLint
```bash
npx eslint resources/js/ --ext .tsx,.jsx,.ts,.js 2>&1 | tee /tmp/eslint_errors.txt
echo "ESLint errors: $(grep -c 'error' /tmp/eslint_errors.txt)"
```

Every ESLint error must be fixed. Warnings should be reviewed and fixed where practical.

### 5.5.3 Run PHP Static Analysis
```bash
# If PHPStan is configured
./vendor/bin/phpstan analyse app/ --level=5 2>&1 | tee /tmp/phpstan_errors.txt

# If Laravel Pint is configured
./vendor/bin/pint --test 2>&1 | tee /tmp/pint_errors.txt
```

### 5.5.4 Check for Console Errors
```bash
# Build the frontend and check for build warnings
npm run build 2>&1 | tee /tmp/build_output.txt
grep -i "warning\|error" /tmp/build_output.txt
```

---

## DELIVERABLE: CROSS-REFERENCE REPORT

Create `QA_CROSS_REFERENCE_REPORT.md`:

```markdown
# Cross-Reference Verification Report
Generated: [timestamp]

## Route Audit
- Total routes registered: [N]
- Routes with missing controllers: [N] [list]
- Routes with missing page files: [N] [list]
- Duplicate route URIs: [N] [list]
- Routes used in code but not registered: [N] [list]

## Prop Chain Verification
- Total Inertia pages verified: [N]
- Pages with prop mismatches: [N] [list with details]
- Pages with missing null guards: [N] [list]

## Migration Status
- Total migrations: [N]
- Pending migrations: [N]
- Tables missing from database: [N] [list]
- Foreign keys missing: [N] [list]

## Lint Results
- TypeScript errors: [N]
- ESLint errors: [N]
- PHPStan errors: [N]
- Build warnings: [N]

## Auth Verification
- Unprotected routes that should be protected: [N] [list]
- Overprotected routes that should be public: [N] [list]
```

---

## COMPLETION CRITERIA FOR PHASE 5

Phase 5 is COMPLETE when:

1. ✅ Every route has been verified (controller exists, page exists, middleware correct)
2. ✅ Every prop chain has been traced from database to UI
3. ✅ All migrations are applied, no tables missing, all foreign keys valid
4. ✅ HandleInertiaRequests shared data verified (auth, flash, ziggy, app-specific)
5. ✅ Every Ziggy route() call in JavaScript maps to a registered route name
6. ✅ Inertia error pages render correctly for 403, 404, 419, 500, 503
7. ✅ TypeScript compiles with zero errors
8. ✅ ESLint passes with zero errors
9. ✅ Frontend builds successfully with no errors
10. ✅ Cross-reference report is generated and committed
8. ✅ All changes committed to `qa/pre-production-phase-5` branch
9. ✅ `QA_AUDIT_LOG_PHASE_5.json` generated and committed

**Do not proceed to Phase 6 until Phase 5 is fully complete.**
