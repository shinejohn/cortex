# PHASE 1: CODE INVENTORY & CHECKLIST GENERATION
## Antigravity Instructions — Fibonacco Pre-Production QA

---

**Objective:** Produce a complete, verified manifest of every page, component, route, controller, and model across all 5 Fibonacco applications. This manifest becomes the checklist for Phases 2–4. Nothing gets reviewed that isn't on this list. Nothing on this list gets skipped.

---

## STEP 1.1 — VERIFY INERTIA BOOT FILES FIRST

Before scanning pages, verify the Inertia infrastructure is sound. If these files are broken, nothing works.

### 1.1.1 Verify app.tsx
```bash
cat resources/js/app.tsx
```
Confirm:
- `createInertiaApp()` is called
- `resolvePageComponent()` uses `import.meta.glob('./Pages/**/*.tsx')` (or `.jsx`)
- The glob pattern captures ALL subdirectories (uses `**`)
- Default layout is configured
- Progress bar is configured

### 1.1.2 Verify ssr.tsx
```bash
cat resources/js/ssr.tsx
```
Confirm:
- `createServer()` is called
- `resolvePageComponent()` uses the SAME glob pattern as app.tsx
- Port matches the SSR service configuration (default 13714)

### 1.1.3 Verify vite.config.ts
```bash
cat vite.config.ts
```
Confirm:
- `laravel({ input: 'resources/js/app.tsx', ssr: 'resources/js/ssr.tsx' })`
- `react()` plugin is included
- `resolve.alias` maps `@` to `resources/js/`

### 1.1.4 Verify HandleInertiaRequests Middleware
```bash
cat app/Http/Middleware/HandleInertiaRequests.php
```
Document every key returned by the `share()` method. This becomes the shared props contract.

### 1.1.5 Verify Inertia Error Page Handling
```bash
cat bootstrap/app.php | grep -A 20 "withExceptions"
```
Confirm that 403, 404, 500, 503 errors render Inertia error pages (not JSON or blank).

---

## STEP 1.2 — SCAN ALL INERTIA PAGES

Run the following commands from the monorepo root to discover every page component:

```bash
# List every page file across all app domains
find resources/js/Pages -type f \( -name "*.tsx" -o -name "*.jsx" \) | sort > /tmp/all_pages.txt

# Count total pages
echo "Total pages found: $(wc -l < /tmp/all_pages.txt)"

# Display the list
cat /tmp/all_pages.txt
```

For EACH file found, record:

| Field | How to Extract |
|-------|---------------|
| **File Path** | From find output |
| **Page Name** | Filename without extension |
| **App** | Determine from directory structure or route group (Day.News, GoEventCity, etc.) |
| **Route** | Search routes/web.php, routes/day-news.php for `Inertia::render('PageName')` |
| **Controller** | The controller method that calls `Inertia::render()` |
| **Props Passed** | The array/object passed as second argument to `Inertia::render()` |
| **Auth Required** | Whether the route is inside an `auth` middleware group |
| **Layout Used** | Which Layout component wraps the page |

### How to Map Pages to Routes

```bash
# Search all route files for Inertia::render references
grep -rn "Inertia::render" routes/ app/Http/Controllers/ --include="*.php" | sort
```

Cross-reference every `Inertia::render('SomePage')` with the files in `/tmp/all_pages.txt`. Flag any discrepancies:
- Pages that exist as files but have NO route pointing to them (orphaned pages)
- Routes that reference pages that DON'T exist as files (broken routes)

---

## STEP 1.3 — SCAN ALL UI COMPONENTS

```bash
# List every component file
find resources/js/Components -type f \( -name "*.tsx" -o -name "*.jsx" \) | sort > /tmp/all_components.txt

# Count total components
echo "Total components found: $(wc -l < /tmp/all_components.txt)"

# Display the list
cat /tmp/all_components.txt
```

For EACH component, record:

| Field | How to Extract |
|-------|---------------|
| **File Path** | From find output |
| **Component Name** | Export name |
| **Props Interface** | TypeScript interface/type definition for props |
| **Required Props** | Props without `?` optional marker |
| **Used By** | Which pages import this component (grep for import statements) |
| **Has State** | Whether it uses useState, useReducer, or other state hooks |
| **Makes API Calls** | Whether it calls fetch, axios, or uses Inertia router |
| **Uses shadcn** | Whether it imports from @/components/ui |

### How to Find Component Usage

```bash
# For each component, find where it's imported
# Example: Find all files that import ArticleCard
grep -rn "import.*ArticleCard" resources/js/ --include="*.tsx" --include="*.jsx"
```

Flag any components that are NEVER imported anywhere (dead code).

---

## STEP 1.4 — SCAN ALL LAYOUTS

```bash
# List layout files
find resources/js/Layouts -type f \( -name "*.tsx" -o -name "*.jsx" \) | sort
```

For each layout, record which pages use it and verify every navigation link in the layout resolves to a valid route.

---

## STEP 1.5 — SCAN ALL ROUTES

```bash
# Extract all registered routes with their methods, URIs, and controller actions
php artisan route:list --json > /tmp/all_routes.json

# Also get a readable version
php artisan route:list --columns=method,uri,name,action,middleware > /tmp/all_routes.txt
```

For EACH route, verify:
- The controller class exists
- The controller method exists
- If it's an Inertia route, the page component exists
- The middleware is appropriate (auth pages are protected, public pages are not)
- The route name follows naming conventions

Flag:
- Routes with missing controllers
- Routes with missing controller methods
- Duplicate route URIs
- Routes without names

---

## STEP 1.6 — SCAN ALL CONTROLLERS

```bash
# List all controllers
find app/Http/Controllers -type f -name "*.php" | sort > /tmp/all_controllers.txt

echo "Total controllers found: $(wc -l < /tmp/all_controllers.txt)"
```

For each controller that renders Inertia pages, extract:
- Every `Inertia::render()` call
- The props array passed to each render
- The Eloquent queries used to build props
- Any validation rules applied
- Any authorization checks

---

## STEP 1.7 — SCAN ALL MODELS & RELATIONSHIPS

```bash
# List all Eloquent models
find app/Models -type f -name "*.php" | sort > /tmp/all_models.txt

echo "Total models found: $(wc -l < /tmp/all_models.txt)"
```

For each model that is used in UI-facing controllers, verify:
- The table exists in the database
- All `$fillable` or `$guarded` properties are correct
- All relationship methods (belongsTo, hasMany, belongsToMany, etc.) reference valid models and foreign keys
- All `$casts` are appropriate for the column types

---

## STEP 1.8 — SCAN ALL MIGRATIONS

```bash
# List all migrations
ls -la database/migrations/ | grep ".php" | wc -l
echo "Total migrations: $(ls database/migrations/*.php | wc -l)"

# Check migration status
php artisan migrate:status
```

Verify:
- No migrations are pending (all have run)
- No migrations reference tables that don't exist in the schema
- Foreign key constraints reference valid tables and columns

---

## STEP 1.9 — SCAN ALL TypeScript TYPES

```bash
# List all type definition files
find resources/js/types -type f \( -name "*.ts" -o -name "*.tsx" \) | sort
```

For each type file, verify:
- Interfaces match the actual props being passed from controllers
- No `any` types that should be specific
- Optional fields (`?`) match what the controller actually sends

---

## STEP 1.10 — MAP APP-TO-PAGE ASSIGNMENT

Create a definitive mapping of which pages belong to which app. This is critical because the monorepo serves multiple domains:

```
DAY.NEWS PAGES:
  - resources/js/Pages/Articles/...
  - resources/js/Pages/Home/...
  - resources/js/Pages/Polls/...
  - resources/js/Pages/BestOf/...
  - resources/js/Pages/Newsletter/...
  [list every page]

GOEVENTCITY PAGES:
  - resources/js/Pages/Events/...
  - resources/js/Pages/Calendar/...
  [list every page]

DOWNTOWN GUIDE PAGES:
  - resources/js/Pages/Business/...
  - resources/js/Pages/Directory/...
  [list every page]

GO LOCAL VOICES PAGES:
  - resources/js/Pages/Podcasts/...
  - resources/js/Pages/Videos/...
  - resources/js/Pages/Multimedia/...
  [list every page]

ALPHASITE PAGES:
  - resources/js/Pages/AlphaSite/...
  - resources/js/Pages/AIEmployees/...
  [list every page]

SMB COMMAND CENTER PAGES:
  - resources/js/Pages/CRM/...
  - resources/js/Pages/Pipeline/...
  - resources/js/Pages/Campaigns/...
  [list every page]
```

If the directory structure does not make the app assignment obvious, check the route files and middleware groups to determine which domain each page serves.

---

## STEP 1.11 — INERTIA-SPECIFIC INVENTORY SCANS

Run ALL of the following scans from the `Phase_X_Inertia_Stack_Addendum.md` Section 13:

```bash
# Map every Inertia::render() to its target page file
grep -rn "Inertia::render" app/Http/Controllers/ --include="*.php" > /tmp/inertia_renders.txt

# Find all useForm instances (forms that need validation error verification)
grep -rn "useForm" resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_forms.txt

# Find all programmatic navigation (router.visit, router.post, etc.)
grep -rn "router\.\(visit\|get\|post\|put\|patch\|delete\|reload\)" \
  resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_router.txt

# Find all <Link> vs <a> tag usage
grep -rn "<Link\|<a " resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_links.txt

# Find all usePage() usage (shared prop consumption)
grep -rn "usePage" resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/inertia_usepage.txt

# Find all Ziggy route() calls (must match registered route names)
grep -rn "route(" resources/js/ --include="*.tsx" --include="*.jsx" --include="*.ts" > /tmp/ziggy_routes.txt

# Find SSR-unsafe browser API usage (will crash SSR server in production)
grep -rn "window\.\|document\.\|localStorage\|sessionStorage" \
  resources/js/ --include="*.tsx" --include="*.jsx" | \
  grep -v "typeof window" | grep -v "useEffect" > /tmp/ssr_risks.txt

# Find pages WITHOUT <Head> component (SEO gaps)
for f in $(find resources/js/Pages -name "*.tsx" -o -name "*.jsx"); do
  if ! grep -q "<Head" "$f"; then echo "MISSING HEAD: $f"; fi
done > /tmp/missing_head.txt

# Find raw fetch/axios calls that might need Inertia useForm instead
grep -rn "fetch(\|axios\.post\|axios\.put\|axios\.patch\|axios\.delete" \
  resources/js/ --include="*.tsx" --include="*.jsx" > /tmp/raw_http_calls.txt
```

Add ALL scan results to the master checklist.

---

## DELIVERABLE: MASTER CHECKLIST FILE

Create a file called `QA_MASTER_CHECKLIST.md` in the repo root with this structure:

```markdown
# Fibonacco QA Master Checklist
Generated: [timestamp]

## Summary
- Total Pages: [N]
- Total Components: [N]
- Total Routes: [N]
- Total Controllers: [N]
- Total Models: [N]
- Total Migrations: [N]
- Orphaned Pages (no route): [N]
- Broken Routes (no page file): [N]
- Dead Components (never imported): [N]

## Day.News Pages
| # | Page File | Route | Controller | Auth | Status |
|---|-----------|-------|------------|------|--------|
| 1 | Pages/Articles/Index.tsx | /articles | ArticleController@index | No | ⬜ Not Reviewed |
| 2 | Pages/Articles/Show.tsx | /articles/{slug} | ArticleController@show | No | ⬜ Not Reviewed |
[continue for every page]

## GoEventCity Pages
[same table format]

## Downtown Guide Pages
[same table format]

## Go Local Voices Pages
[same table format]

## AlphaSite Pages
[same table format]

## SMB Command Center Pages
[same table format]

## Shared Components
| # | Component File | Used By (Pages) | Props | Status |
|---|---------------|-----------------|-------|--------|
[list every component]

## Orphaned Pages (Files with No Route)
[list any]

## Broken Routes (Routes with No Page File)
[list any]

## Dead Components (Never Imported)
[list any]
```

---

## COMPLETION CRITERIA FOR PHASE 1

Phase 1 is COMPLETE when:

1. ✅ Inertia boot files verified (app.tsx, ssr.tsx, vite.config.ts, HandleInertiaRequests)
2. ✅ Every `.tsx`/`.jsx` file in `Pages/` has been cataloged
3. ✅ Every `.tsx`/`.jsx` file in `Components/` has been cataloged
4. ✅ Every Inertia::render() call mapped to its target page file (no mismatches)
5. ✅ Every route has been listed and mapped to its controller and page
6. ✅ Every controller's `Inertia::render()` calls have been documented with props
7. ✅ Every model used in UI controllers has been verified
8. ✅ Migration status is clean (none pending)
9. ✅ Every useForm instance cataloged for form verification in Phases 2–4
10. ✅ Every SSR-unsafe browser API usage flagged
11. ✅ Every page missing `<Head>` component flagged
12. ✅ All Ziggy route() calls mapped to registered route names
13. ✅ The `QA_MASTER_CHECKLIST.md` file exists and is complete
14. ✅ All orphaned pages, broken routes, and dead components have been flagged
15. ✅ Each page has been assigned to its correct app (Day.News, GoEventCity, etc.)

**Commit this checklist to branch `qa/pre-production-phase-1` and push to GitHub before proceeding to Phase 2.**
