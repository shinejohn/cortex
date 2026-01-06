# Page Viewing Issues - Diagnosis & Testing Guide

**Date:** December 31, 2025  
**Issue:** Some pages cannot be viewed

---

## Summary

I've identified potential routing and Inertia issues. Here's what I found and how to test:

---

## Issues Found

### 1. ✅ CalendarController EXISTS
- **File:** `app/Http/Controllers/CalendarController.php` ✅
- **Namespace:** `App\Http\Controllers\CalendarController` ✅
- **Route:** Line 90 in `routes/web.php` ✅
- **Status:** Controller exists and syntax is valid

**Note:** The route:list error was likely due to cache issues or database connection timeout.

---

## Common Causes of Pages Not Loading

### 1. **Missing Inertia Page Component**
**Symptom:** 500 error or "Unable to resolve page component"

**Check:**
- Route renders: `Inertia::render('event-city/about')`
- File exists: `resources/js/pages/event-city/about.tsx`
- File has default export: `export default function About() {...}`

### 2. **Case Sensitivity**
**Symptom:** Page component not found

**Issue:** Inertia paths are case-sensitive
- ✅ Route: `'event-city/about'`
- ✅ File: `event-city/about.tsx` (lowercase)
- ❌ File: `Event-City/About.tsx` (wrong case)

### 3. **Missing Default Export**
**Symptom:** Component loads but shows blank page

**Check:**
```typescript
// ✅ Correct
export default function About() {
    return <div>...</div>;
}

// ❌ Wrong
export function About() {
    return <div>...</div>;
}
```

### 4. **TypeScript/Compilation Errors**
**Symptom:** Page fails to compile

**Check:**
```bash
npm run build
# or
npm run dev
```

### 5. **Route Not Registered**
**Symptom:** 404 error

**Check:**
```bash
php artisan route:list | grep "route-name"
```

### 6. **Middleware Blocking Access**
**Symptom:** Redirects or 403 errors

**Check:** Route middleware requirements in `routes/web.php`

---

## Testing Steps

### Step 1: Check Laravel Logs
```bash
tail -f storage/logs/laravel.log
```

**Look for:**
- `Unable to resolve page component`
- `Page component not found`
- `ReflectionException`
- `Class not found`

### Step 2: Check Browser Console
**Open browser DevTools → Console**

**Look for:**
- 404 errors for page components
- Inertia errors
- JavaScript errors
- Network errors

### Step 3: Verify Routes
```bash
# List all routes
php artisan route:list

# Check specific route
php artisan route:list --name=calendar.index
```

### Step 4: Verify Page Components Exist
```bash
# Check if specific page exists
ls -la resources/js/pages/event-city/about.tsx

# List all pages
find resources/js/pages -name "*.tsx" | sort
```

### Step 5: Check for Compilation Errors
```bash
# Build assets
npm run build

# Or watch for errors
npm run dev
```

### Step 6: Test Specific Pages

**Test these common pages:**

1. **Marketing Pages:**
   - `/about` → `event-city/about.tsx`
   - `/contact` → `event-city/contact.tsx`
   - `/how-it-works` → `event-city/how-it-works.tsx`
   - `/success-stories` → `event-city/marketing/success-stories.tsx`

2. **Calendar:**
   - `/calendar` → `event-city/calendar/index.tsx` (via CalendarController)

3. **Dashboards:**
   - `/dashboard/fan` → `event-city/dashboard/fan.tsx`
   - `/dashboard/organizer` → `event-city/dashboard/organizer.tsx`

---

## Quick Diagnostic Script

Create a test script to verify all routes and pages:

```bash
#!/bin/bash
# test-pages.sh

echo "Testing Inertia Pages..."

# Get all Inertia::render calls
grep -r "Inertia::render" routes/ | while read line; do
    # Extract page path
    page=$(echo "$line" | grep -oP "Inertia::render\('\K[^']+")
    
    # Check if file exists
    file="resources/js/pages/${page}.tsx"
    if [ -f "$file" ]; then
        echo "✅ $page"
    else
        echo "❌ $page - FILE MISSING: $file"
    fi
done
```

---

## Common Fixes

### Fix 1: Missing Page Component
**Create the missing page file:**
```typescript
// resources/js/pages/event-city/missing-page.tsx
import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function MissingPage() {
    return (
        <AppLayout>
            <Head title="Missing Page" />
            <div>Page content</div>
        </AppLayout>
    );
}
```

### Fix 2: Case Sensitivity
**Ensure route path matches file path exactly:**
- Route: `'event-city/about'`
- File: `event-city/about.tsx` (not `About.tsx`)

### Fix 3: Missing Default Export
**Add default export:**
```typescript
export default function PageName() {
    // ...
}
```

### Fix 4: Clear Caches
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
npm run build
```

---

## Next Steps

1. **Identify which specific pages fail** - Check browser console and Laravel logs
2. **Verify page components exist** - Use the diagnostic script above
3. **Check for compilation errors** - Run `npm run build`
4. **Test routes** - Use `php artisan route:list`
5. **Check middleware** - Ensure routes aren't blocked by auth/verification middleware

---

## Need More Info?

To help diagnose further, please provide:
1. **Which specific pages fail?** (URLs)
2. **What error message appears?** (Browser console, Laravel logs)
3. **When does it fail?** (On load, on navigation, etc.)
4. **Any patterns?** (All pages, specific apps, authenticated pages, etc.)

---

**Status:** ⚠️ Ready for testing - Need specific page URLs that fail

