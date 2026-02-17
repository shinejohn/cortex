# PHASE 2: DAY.NEWS UI CODE REVIEW
## Antigravity Instructions — Page-by-Page Inspection

---

**Objective:** Review every page and component belonging to Day.News. Inspect every line of UI code, every prop, every route, every button, every link, every popup, and every database query that feeds the UI.

**Prerequisites:** Phase 1 `QA_MASTER_CHECKLIST.md` must be complete. Use it as the page list.

---

## KNOWN DAY.NEWS PAGE AREAS

Based on project documentation, Day.News should have pages covering these areas. If any are missing from the Phase 1 checklist, that itself is a finding:

### Public-Facing Pages (No Auth Required)
- **Home/Landing** — Hero story, latest news feed, event sidebar, category navigation
- **Article Detail** — Full article view with byline, images, reactions, comments, related stories, share buttons
- **Article Category Listing** — Filtered view by category (Government, Business, Sports, etc.)
- **Poll Show** — `/poll/{slug}` — Voting interface, option cards, results display, share buttons
- **Poll Results** — `/poll/{slug}/results` — Final results after voting closes
- **Poll Embed** — `/poll/{slug}/embed` — Iframe-friendly minimal poll widget
- **Best Of Landing** — `/{region}/best-of` — Annual "Best Of" competition landing
- **Best Of Category** — `/{region}/best-of/{category}` — Category-specific rankings
- **Search** — Article search with filters
- **Newsletter Signup/Preferences**
- **About/Contact Pages**

### Authenticated Pages
- **User Dashboard** — Saved articles, reading history, preferences
- **User Profile** — Profile editing, notification preferences
- **Comment Management** — User's own comments

### Admin/Editorial Pages
- **News Workflow Dashboard** — Workflow status, phase monitoring
- **Article Draft Management** — Draft list, editing, approval workflow
- **Post Management** — Published article CRUD
- **Newsletter Management** — Newsletter creation and sending
- **Region/City Management** — Geographic configuration

---

## INSPECTION CHECKLIST PER PAGE

For EVERY Day.News page, execute ALL of the following checks. Do not skip any check.

### CHECK 1: File Structure & Imports
```
□ File exports a valid React component (default export)
□ All imports resolve to existing files (no broken import paths)
□ No unused imports
□ TypeScript types are properly imported and applied
□ Layout component is correctly specified
□ Head/meta tags are set for SEO (title, description, Open Graph)
```

### CHECK 2: Props & Data Flow (INERTIA-SPECIFIC)
```
□ Props interface matches what the controller's Inertia::render() actually sends
□ Every required prop is always provided by the controller
□ Every optional prop has a null/undefined guard in the template
□ No prop is accessed without checking if it exists first
□ Props are properly typed (no 'any' types for data that has a known shape)
□ Destructured props match the interface
□ Default values are set for optional props where appropriate
□ usePage<SharedProps>() is typed correctly if shared data is accessed
□ Shared props (auth.user, flash, currentRegion) are accessed via usePage(), not passed as page props
□ Eloquent model $hidden and $appends are correct (no leaked sensitive data in props)
□ Eloquent relationships are eager-loaded in controller (->with()) not lazy-loaded via props
□ Date fields are strings in props (Inertia serializes Carbon to ISO strings)
□ Pagination data structure matches Inertia's expected format (data, meta, links)
```

### CHECK 3: Controller Cross-Reference (INERTIA-SPECIFIC)
```
□ Open the controller method that renders this page
□ Verify Inertia::render('Path/PageName') matches the EXACT file path (case-sensitive!)
    WARNING: 'articles/show' works on Mac but FAILS on Linux (Railway production)
    The path MUST match: 'Articles/Show' → resources/js/Pages/Articles/Show.tsx
□ Verify every prop key in the Inertia::render() array has a matching use in the page
□ Verify every Eloquent query works (no missing relationships)
□ Verify eager loading is used (->with()) to prevent N+1 queries
□ Verify Inertia::lazy() is used for expensive props not needed on initial load
□ Verify any pagination is handled correctly (meta, links)
□ Verify authorization checks are in place (policies, gates, middleware)
□ Verify the controller returns Inertia::render() (not view() or response()->json())
□ For POST/PUT/DELETE controllers: verify they return redirect()->back() or redirect()->route()
    with flash messages (NOT Inertia::render — that's for GET only)
□ Verify redirect responses include appropriate flash data:
    ->with('success', 'Item created successfully')
```

### CHECK 4: UI Rendering
```
□ No hardcoded test data or placeholder text ("Lorem ipsum", "TODO", etc.)
□ No "undefined" or "null" displayed in any text element
□ All images have alt text
□ All images have fallback/placeholder for when src is null
□ All dates are formatted properly (not raw ISO strings)
□ All numbers are formatted (currency with $, counts with commas)
□ Empty states are handled gracefully ("No articles found" vs blank page)
□ Loading states exist where data is fetched
□ Error states are handled (try/catch on API calls)
```

### CHECK 5: Navigation & Links (INERTIA-SPECIFIC)
```
□ ALL internal navigation uses <Link> from @inertiajs/react (NOT <a> tags)
□ <Link href> values use route() helper or valid paths
□ External links use <a> with target="_blank" and rel="noopener noreferrer"
□ No <Link> components point to external URLs (breaks Inertia)
□ No links point to "#" or "javascript:void(0)"
□ Links that perform POST actions use: <Link method="post" as="button">
□ Breadcrumbs (if present) have correct hierarchy and valid links using <Link>
□ "Back" buttons use router.visit() with the correct route (not window.history.back())
□ Pagination links use <Link> with preserveScroll and preserveState where appropriate
□ Navigation that changes filters uses replace: true (no extra history entries)
□ route() calls reference valid registered route names (cross-check with php artisan route:list)
□ route() calls pass all required parameters: route('article.show', { slug: article.slug })
```

### CHECK 6: Interactive Elements (INERTIA-SPECIFIC)
```
□ Every button has an onClick handler that does something
□ No buttons are present that do nothing when clicked
□ Forms use Inertia's useForm() hook (NOT raw fetch/axios for standard form submissions)
□ useForm() is initialized with correct default values
□ form.data is bound to input values via onChange → form.setData()
□ form.post() / form.put() / form.patch() / form.delete() targets the correct route
□ form.processing is used to disable submit button during submission (prevents double-submit)
□ form.errors is checked and displayed inline for EVERY form field
□ form.errors display clears when user corrects the field (form.clearErrors)
□ form.reset() is called after successful submission where appropriate
□ 422 validation errors are handled automatically by Inertia (verify they display)
□ Success callbacks use onSuccess to show feedback or redirect
□ Error callbacks use onError for non-validation errors
□ preserveScroll: true is set on forms that should not scroll to top after submit
□ Modals/popups open and close correctly
□ Modals have a close button AND close on backdrop click
□ Dropdown menus populate with correct data
□ Search inputs debounce before calling router.reload({ only: [...] })
□ File upload forms use forceFormData: true in form.post() options
□ Delete actions require confirmation dialog before calling form.delete()
□ Flash message toast appears after successful form submission
```

### CHECK 7: Tailwind & Styling
```
□ No invalid Tailwind class names
□ No custom CSS classes used without definition
□ Responsive classes are applied (sm:, md:, lg: breakpoints)
□ Dark mode classes if applicable
□ No conflicting utility classes (e.g., both text-left and text-right)
□ Proper spacing (no elements touching edges, consistent padding)
□ Text is readable (sufficient contrast, appropriate sizes)
□ Truncation/overflow is handled for long text (truncate, line-clamp)
```

### CHECK 8: shadcn/ui Components
```
□ All shadcn components are properly imported from @/components/ui
□ Required props are passed to shadcn components
□ Variants match the intended UI (destructive, outline, ghost, etc.)
□ Dialog/Modal components use proper open/close state management
□ Toast notifications are configured and working
□ Form components use proper react-hook-form integration
□ Select/Combobox components receive proper option arrays
```

### CHECK 9: API Calls & Data Fetching (INERTIA-SPECIFIC)
```
□ Standard form submissions use Inertia useForm() (CSRF is handled automatically)
□ Non-navigation API calls (likes, votes, toggles) that use raw fetch/axios include:
    - X-CSRF-TOKEN header from meta tag OR use axios withCredentials
    - Proper error handling (try/catch)
    - Loading state management
□ API endpoints referenced in fetch/axios calls exist in routes/api.php
□ Inertia partial reloads use router.reload({ only: ['propName'] }) correctly
□ Success feedback shows after API calls (toast notification or inline update)
□ Failed requests show user-friendly error messages (not raw error objects)
□ Loading indicators show during async operations
□ No duplicate API calls on mount (useEffect dependency arrays are correct)
□ Polling/real-time updates (if any) clean up on component unmount
```

### CHECK 10: Database Dependencies
```
□ Every table referenced by the page's controller exists in migrations
□ Every column used in queries exists in the table
□ Every relationship used (->author, ->region, ->category) is defined on the model
□ Relationship types are correct (belongsTo vs hasMany vs belongsToMany)
□ Foreign key columns exist and have proper indexes
□ No queries use raw column names that don't exist
□ Enum values in code match database enum definitions
```

### CHECK 11: Inertia <Head> & SEO (PUBLIC PAGES ONLY)
```
□ <Head> component from @inertiajs/react is imported and used
□ <Head title="..."> sets a descriptive, dynamic browser tab title
□ Meta description is set with page-specific content
□ Open Graph tags are set (og:title, og:description, og:image, og:url)
□ Twitter card tags are set
□ Canonical URL is set for the page
□ Title includes app name and region: "Article Title | Day.News Tampa"
□ Dynamic content (article title, event name) is interpolated into tags
□ Special characters in titles are HTML-escaped
```

### CHECK 12: SSR Safety
```
□ No browser APIs (window, document, localStorage, navigator) used during component render
□ All browser API usage is inside useEffect() or event handlers
□ OR guarded with: typeof window !== 'undefined'
□ No third-party libraries that access browser APIs are imported at module level
□ Component renders without error in a Node.js environment (SSR)
□ No conditional rendering that differs between server and client (hydration mismatch)
```

---

## DAY.NEWS SPECIFIC CHECKS

### Article Detail Page — Extra Verification
```
□ Article slug routing works for all valid slugs
□ 404 is returned for non-existent slugs (not 500)
□ Virtual journalist/author avatar displays or shows fallback
□ Category badge displays with correct color
□ Publication date displays in human-readable format
□ Article body renders HTML content safely (XSS prevention)
□ Image carousel/gallery works if article has multiple images
□ Share buttons (social media, email, copy link) all function
□ Reaction buttons (like, heart, surprised, etc.) work
□ Comment section loads and displays existing comments
□ Comment submission works for authenticated users
□ Comment section shows "login to comment" for unauthenticated users
□ Related articles section shows relevant content
□ Article "save for later" / bookmark functionality works
□ Print-friendly view works if applicable
□ Schema.org structured data is in the page head for SEO
```

### Poll Pages — Extra Verification
```
□ Poll voting works without authentication (public access)
□ Direct link via /poll/{slug} works from email/social sharing
□ Voting form shows all options with correct display order
□ Basic, Featured, and Premium Sponsor option cards render correctly
□ Featured options show image, description, and special offer
□ Countdown timer displays correctly and updates
□ Vote submission works and shows confirmation
□ "Already Voted" state is preserved (cookie/IP check)
□ Results display shows percentages and vote counts
□ Share buttons generate correct URLs
□ Embed widget renders correctly in iframe context
□ Copy link input works
□ Best Of pages show winner badges on businesses
```

### Home Page — Extra Verification
```
□ Hero/featured story loads with large image and headline
□ Category navigation shows all active categories
□ Latest news feed loads with proper pagination
□ Event sidebar (if present) shows upcoming events
□ Region/city header shows the correct community name
□ IP-based geographic routing resolves to correct region
□ User can change their community/region
```

---

## ISSUE SEVERITY LEVELS

| Level | Definition | Action |
|-------|-----------|--------|
| **CRITICAL** | Page crashes, 500 error, data not loading, complete feature broken | Fix immediately, blocks release |
| **HIGH** | Button doesn't work, link goes nowhere, form doesn't submit, "undefined" shown to user | Fix before release |
| **MEDIUM** | Styling issue, minor layout problem, missing loading state, inconsistent spacing | Fix before release if possible |
| **LOW** | Minor text, unused import, code style, optimization opportunity | Fix if time permits |

---

## COMPLETION CRITERIA FOR PHASE 2

Phase 2 is COMPLETE when:

1. ✅ Every Day.News page from the Phase 1 checklist has been inspected using ALL 12 checks above
2. ✅ Every Day.News-specific check has been executed
3. ✅ Every finding is logged in the audit log with the required JSON format
4. ✅ Every CRITICAL and HIGH severity issue has been FIXED and VERIFIED
5. ✅ The `QA_MASTER_CHECKLIST.md` has been updated (status changed from ⬜ to ✅ or ❌)
6. ✅ All changes committed to `qa/pre-production-phase-2` branch
7. ✅ `QA_AUDIT_LOG_PHASE_2.json` generated and committed

**Do not proceed to Phase 3 until Phase 2 is fully complete.**
