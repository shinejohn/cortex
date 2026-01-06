# Routing and Inertia Page Issues - Diagnosis Report

**Date:** December 31, 2025  
**Issue:** Some pages cannot be viewed

---

## Issues Found

### 1. Missing Controller: CalendarController ❌

**Error:**
```
ReflectionException: Class "App\Http\Controllers\CalendarController" does not exist
```

**Location:** `routes/web.php` line 90
```php
Route::get('/calendar', [CalendarController::class, 'publicIndex'])->name('calendar.index');
```

**Impact:** The `/calendar` route will fail, causing a 500 error.

**Fix Required:** 
- Either create `CalendarController` 
- Or change the route to use a closure like other marketing pages

---

## Potential Issues to Check

### 2. Missing Inertia Page Components

**Routes that reference pages - need to verify existence:**

#### Event City Routes:
- ✅ `event-city/about` - EXISTS
- ✅ `event-city/contact` - EXISTS  
- ✅ `event-city/how-it-works` - EXISTS
- ✅ `event-city/marketing/success-stories` - EXISTS
- ✅ `event-city/marketing/advertise` - EXISTS
- ✅ `event-city/marketing/partner` - EXISTS
- ✅ `event-city/marketing/press` - EXISTS
- ✅ `event-city/marketing/careers` - EXISTS
- ✅ `event-city/marketing/gear` - EXISTS
- ❌ `event-city/calendar/index` - Route exists but controller missing
- ✅ `event-city/performers/discovery` - EXISTS
- ✅ `event-city/performers/market-report` - EXISTS
- ✅ `event-city/venues/submit` - EXISTS
- ✅ `event-city/community/impact` - EXISTS
- ✅ `event-city/dashboard/fan` - EXISTS
- ✅ `event-city/dashboard/organizer` - EXISTS
- ✅ `event-city/dashboard/performer` - EXISTS
- ✅ `event-city/dashboard/venue-owner` - EXISTS
- ✅ `event-city/dashboard/calendar` - EXISTS

#### Day News Routes:
- ✅ `day-news/index` - EXISTS

#### Downtown Guide Routes:
- ✅ `downtown-guide/home` - EXISTS

---

## Common Inertia Issues

### 1. Case Sensitivity
Inertia page paths are **case-sensitive**. Make sure:
- Route: `Inertia::render('event-city/about')`
- File: `resources/js/pages/event-city/about.tsx` ✅

### 2. File Extension
Pages must have `.tsx` extension (or `.jsx`, `.vue`, etc.)

### 3. Default Export
Pages must have a default export:
```typescript
export default function About() {
    return <div>...</div>;
}
```

### 4. Path Matching
The path in `Inertia::render()` must exactly match the file path relative to `resources/js/pages/`:
- Route: `'event-city/marketing/success-stories'`
- File: `resources/js/pages/event-city/marketing/success-stories.tsx`

---

## Testing Recommendations

### 1. Check Laravel Logs
```bash
tail -f storage/logs/laravel.log
```

Look for:
- `Unable to resolve page component`
- `Page component not found`
- `ReflectionException`

### 2. Check Browser Console
Look for:
- 404 errors for page components
- Inertia errors
- JavaScript errors

### 3. Test Routes
```bash
php artisan route:list | grep -i "calendar"
```

### 4. Verify Page Components Exist
```bash
# Check if page file exists
ls -la resources/js/pages/event-city/calendar/index.tsx

# List all pages
find resources/js/pages -name "*.tsx" | sort
```

---

## Quick Fixes

### Fix 1: Calendar Route
**Option A:** Create CalendarController
**Option B:** Use closure (like other marketing pages)

```php
Route::get('/calendar', function () {
    return Inertia::render('event-city/calendar/index', [
        'events' => [],
        'selectedDate' => now()->toDateString(),
        'viewMode' => 'list',
    ]);
})->name('calendar.index');
```

---

## Next Steps

1. ✅ Fix CalendarController issue
2. ⏳ Test all routes to identify which pages fail
3. ⏳ Check browser console for specific errors
4. ⏳ Verify all Inertia page components exist
5. ⏳ Check for TypeScript/compilation errors

---

**Status:** 🔴 Critical issue found - CalendarController missing

