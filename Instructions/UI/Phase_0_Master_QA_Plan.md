# FIBONACCO PRE-PRODUCTION QA MASTER PLAN
## Complete UI Code Review, Testing & Deployment Verification
### Instructions for Antigravity (Cursor AI)

---

**Document Version:** 1.0  
**Date:** February 15, 2026  
**Author:** Claude (Architecture & Strategy AI)  
**Executor:** Antigravity (Cursor Implementation AI)  
**Reviewer:** Claude via GitHub audit log verification  
**Approver:** Shine (Founder/Technical Lead)

---

## OBJECTIVE

Execute a **zero-defect, page-by-page, component-by-component** code review and UI verification across the entire Fibonacco publishing ecosystem. The goal is production-ready software with no 400 or 500 errors, no broken links, no missing props, no database inconsistencies, and a flawless user experience for every reader and business user.

**This is not a spot check. This is a complete, exhaustive audit of every rendered page, every interactive element, every route, every prop, and every database dependency.**

---

## TECHNOLOGY STACK — CRITICAL CONTEXT

The entire Fibonacco ecosystem is a **Laravel 11 + Inertia.js + React** monorepo. This is NOT a traditional Laravel Blade app and NOT a separate Laravel API + React SPA. Inertia.js is the bridge layer that creates a monolithic single-page-app experience without a separate API. This means:

- **Pages** are React components in `resources/js/Pages/` rendered via `Inertia::render()` from controllers
- **Props** flow from PHP controllers directly into React component props (no REST API for pages)
- **Navigation** uses Inertia's `<Link>` component and `router` object (NOT `<a>` tags or `window.location`)
- **Forms** use Inertia's `useForm()` hook (NOT raw `fetch()` or `axios.post()` for form submissions)
- **Shared data** (auth, flash messages, region) flows through `HandleInertiaRequests` middleware to every page
- **SSR** runs via a separate Node.js service (`Inertia SSR`) for SEO — browser APIs CANNOT be used at render time
- **Routing** uses Ziggy's `route()` helper in JavaScript to mirror Laravel named routes
- **Validation errors** auto-populate `form.errors` via Inertia's 422 handling — no custom error parsing needed

**The `Phase_X_Inertia_Stack_Addendum.md` document contains Inertia-specific verification checks that MUST be applied alongside every phase. Antigravity must read and apply that addendum throughout the entire QA process.**

---

## SCOPE: ALL PLATFORMS

The Fibonacco ecosystem consists of these applications, all sharing the **Postgres Publishing** database and deployed via the same Laravel 11 monorepo with Inertia.js/React frontend:

| # | Application | Domain | Primary Function |
|---|------------|--------|-----------------|
| 1 | **Day.News** | day.news | AI-generated hyperlocal news |
| 2 | **GoEventCity** | goeventcity.com | Events & calendar |
| 3 | **Downtown Guide** | downtownguide.com | Business directory |
| 4 | **Go Local Voices** | golocalvoices.com | Podcasts/video content |
| 5 | **AlphaSite** | alphasite.ai | AI employee management for SMBs |

Additionally, the **SMB Command Center** (separate database: Postgres CC CRM SMB) must be verified for its CRM, pipeline, and campaign management interfaces.

---

## EXECUTION PHASES

| Phase | Name | Scope | Deliverable |
|-------|------|-------|-------------|
| **1** | Code Inventory & Checklist | All 5 apps | Complete page/component manifest |
| **2** | Day.News UI Code Review | Day.News only | Issue log per page/component |
| **3** | GoEventCity + Downtown Guide + Go Local Voices | 3 apps | Issue log per page/component |
| **4** | AlphaSite + SMB Command Center | 2 apps | Issue log per page/component |
| **5** | Routes, Props & Migration Verification | All apps | Cross-reference audit report |
| **6** | Playwright E2E Testing (Laravel Herd) | All apps | Test suite + pass/fail report |
| **7** | Audit Log Generation | All apps | Structured JSON/MD audit log |
| **8** | Full Build & Deployment Verification | Railway + Local | Build success report |

---

## QUALITY STANDARDS — NON-NEGOTIABLE

Every page and component must pass ALL of the following criteria:

### A. Zero HTTP Errors
- No 400 Bad Request responses
- No 404 Not Found on any internal link or route
- No 405 Method Not Allowed
- No 422 Validation errors on page load
- No 500 Internal Server Error under any circumstance
- No console errors in the browser

### B. Complete UI Rendering
- Every page renders completely with no blank sections
- No "undefined" or "null" text displayed to users
- No missing images (broken image placeholders)
- No layout shifts or overflow issues
- Responsive design works at mobile (375px), tablet (768px), and desktop (1280px+)

### C. Navigation Integrity
- Every menu item links to a valid, rendering page
- Every breadcrumb link works
- Back navigation works correctly
- No infinite redirect loops
- All pagination controls function

### D. Interactive Elements
- Every button triggers its intended action
- Every form submits correctly
- Every modal/popup opens and closes properly
- Every dropdown populates with data
- Every search field returns results or shows "no results" gracefully

### E. Data Integrity
- Every page that displays database data shows real, valid data
- No N+1 query issues visible as slow loads
- Relationships (belongsTo, hasMany) resolve correctly
- No orphaned foreign key references

### F. Code Quality
- No TypeScript/ESLint errors
- No unused imports
- No missing required props
- Tailwind classes are valid (no custom classes without @apply definitions)
- shadcn/ui components are properly imported and configured

---

## METHODOLOGY

For each phase, Antigravity will follow this exact sequence:

```
1. DISCOVER   → Scan filesystem for all Pages/ and Components/ files
2. CATALOG    → Create a checklist manifest (file path, page name, route, props)
3. INSPECT    → Open each file, review code line-by-line
4. VERIFY     → Cross-reference routes (web.php, api.php), controllers, and models
5. TEST       → Run the page locally with Laravel Herd
6. DOCUMENT   → Log every issue found with severity, file, line number
7. FIX        → Resolve EVERY issue — all severities, no exceptions
8. RE-TEST    → Confirm the fix works and didn't break anything else
9. LOG        → Record fix in audit log with before/after
```

**ZERO OPEN ISSUES POLICY:** Every phase ends with zero unresolved issues across all severity levels. There is no backlog. There is no "nice to have" list. A hundred unused imports, fifty missing loading states, and thirty inconsistent Tailwind classes will cause build failures, ESLint errors, and deployment headaches that eat days. Fix everything as it's found.

---

## FILE LOCATIONS TO SCAN

```
# === INERTIA FRONTEND ===
resources/js/app.tsx             → Inertia boot file (createInertiaApp, resolvePageComponent)
resources/js/ssr.tsx             → SSR boot file (createServer, must match app.tsx glob)
resources/js/Pages/              → All Inertia page components (*.tsx, *.jsx)
resources/js/Components/         → All shared UI components
resources/js/Layouts/            → Layout wrapper components (persistent vs non-persistent)
resources/js/types/              → TypeScript interfaces and types (incl. shared props)

# === INERTIA MIDDLEWARE & CONFIG ===
app/Http/Middleware/HandleInertiaRequests.php → Shared data middleware (auth, flash, ziggy)
vite.config.ts                   → Vite build config (Inertia input, SSR input, aliases)
bootstrap/ssr/ssr.mjs            → Compiled SSR bundle (build output)
config/ziggy.php                 → Ziggy route filtering (if exists)

# === LARAVEL BACKEND ===
routes/web.php                   → Web routes (Inertia pages)
routes/api.php                   → API routes (non-Inertia endpoints)
routes/day-news.php              → Day.News specific routes
routes/console.php               → Scheduled commands
app/Http/Controllers/            → All controllers (verify Inertia::render props)
app/Models/                      → All Eloquent models (verify relationships)
database/migrations/             → All migrations (verify tables exist)
config/database.php              → Database connections
bootstrap/app.php                → Exception handler (Inertia error page rendering)
```

---

## AUDIT LOG FORMAT

Every finding must be logged in this exact format:

```json
{
  "id": "DN-001",
  "phase": 2,
  "app": "Day.News",
  "severity": "critical|high|medium|low",
  "category": "route|prop|component|database|lint|tailwind|shadcn|navigation|rendering",
  "file": "resources/js/Pages/Articles/Show.tsx",
  "line": 47,
  "description": "Missing 'author' prop causes undefined render in byline",
  "expected": "Author name displayed in article byline",
  "actual": "'undefined' text shown to user",
  "fix_applied": "Added null check with fallback to 'Staff Reporter'",
  "fix_file": "resources/js/Pages/Articles/Show.tsx",
  "fix_line": 47,
  "verified": true,
  "verified_method": "local_herd|playwright|manual",
  "timestamp": "2026-02-15T10:30:00Z"
}
```

---

## HANDOFF TO CLAUDE FOR VERIFICATION

After each phase is complete, Antigravity will:

1. Commit all changes to a dedicated branch: `qa/pre-production-phase-{N}`
2. Push to GitHub
3. Generate the audit log as `QA_AUDIT_LOG_PHASE_{N}.json` in the repo root
4. Shine will provide the audit log to Claude for independent verification
5. Claude will cross-reference the audit log against the GitHub diff to confirm every issue was found and fixed

---

## NEXT STEPS

Proceed to Phase 1 instructions immediately. Do not skip any phase. Do not mark any phase complete until every item on the checklist has been verified.
