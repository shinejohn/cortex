# Mock Data Review Report
**Date:** January 2025  
**Scope:** Application code only (excludes magic-spec, tests, seeders, factories)

---

## Executive Summary

Found **mock data and empty arrays** in several locations that should be replaced with real database queries. Most are in route closures and controller methods that pass empty arrays to Inertia pages.

**Total Issues Found:** 15 locations with mock/empty data

---

## 🔴 CRITICAL - Empty Arrays in Routes (Must Fix)

### Location: `routes/web.php`

These routes pass empty arrays to Inertia pages instead of fetching real data:

#### 1. Success Stories Page (Line 62-65)
```php
Route::get('/success-stories', function () {
    return Inertia::render('event-city/marketing/success-stories', [
        'stories' => [],  // ❌ EMPTY ARRAY
    ]);
})->name('success-stories');
```
**Fix Required:** Create controller method to fetch success stories from database

#### 2. Press Page (Line 73-77)
```php
Route::get('/press', function () {
    return Inertia::render('event-city/marketing/press', [
        'pressReleases' => [],  // ❌ EMPTY ARRAY
        'mediaContacts' => [],  // ❌ EMPTY ARRAY
    ]);
})->name('press');
```
**Fix Required:** Create controller method to fetch press releases and media contacts

#### 3. Careers Page (Line 79-82)
```php
Route::get('/careers', function () {
    return Inertia::render('event-city/marketing/careers', [
        'jobs' => [],  // ❌ EMPTY ARRAY
    ]);
})->name('careers');
```
**Fix Required:** Create controller method to fetch job listings

#### 4. Gear Page (Line 84-88)
```php
Route::get('/gear', function () {
    return Inertia::render('event-city/marketing/gear', [
        'products' => [],  // ❌ EMPTY ARRAY
        'categories' => [],  // ❌ EMPTY ARRAY
    ]);
})->name('gear');
```
**Fix Required:** Create controller method to fetch products and categories

#### 5. Performers Discovery Page (Line 103-107)
```php
Route::get('/performers/discovery', function () {
    return Inertia::render('event-city/performers/discovery', [
        'performers' => [],  // ❌ EMPTY ARRAY
        'filters' => [],  // ❌ EMPTY ARRAY
    ]);
})->name('performers.discovery');
```
**Fix Required:** Create controller method to fetch performers with filters

#### 6. Performers Market Report Page (Line 109-114)
```php
Route::get('/performers/market-report', function () {
    return Inertia::render('event-city/performers/market-report', [
        'marketData' => [],  // ❌ EMPTY ARRAY
        'locations' => [],  // ❌ EMPTY ARRAY
        'genres' => [],  // ❌ EMPTY ARRAY
    ]);
})->name('performers.market-report');
```
**Fix Required:** Create controller method to fetch market report data

---

## 🟡 HIGH PRIORITY - Mock Data in Controllers

### Location: `app/Http/Controllers/VenueController.php`

#### 7. Upcoming Events (Line 185-186)
```php
// Get upcoming events at venues (mock data for now)
$upcomingEvents = [];  // ❌ EMPTY ARRAY
```
**Fix Required:** Query actual upcoming events:
```php
$upcomingEvents = Event::published()
    ->upcoming()
    ->whereHas('venue')
    ->with(['venue', 'performer'])
    ->take(10)
    ->get();
```

#### 8. Events This Week Stat (Line 202)
```php
'eventsThisWeek' => 427, // Mock data  // ❌ HARDCODED VALUE
```
**Fix Required:** Calculate actual count:
```php
'eventsThisWeek' => Event::published()
    ->whereBetween('event_date', [now()->startOfWeek(), now()->endOfWeek()])
    ->count(),
```

---

## 🟡 HIGH PRIORITY - Mock Data in Dashboard Routes

### Location: `routes/web.php` (Dashboard Routes)

#### 9. Fan Dashboard (Line 294-306)
```php
Route::get('/dashboard/fan', function (Request $request) {
    return Inertia::render('event-city/dashboard/fan', [
        'user' => $request->user(),
        'upcomingEvents' => [],  // ❌ EMPTY ARRAY
        'pastEvents' => [],  // ❌ EMPTY ARRAY
        'plannedEvents' => [],  // ❌ EMPTY ARRAY
        'stats' => [
            'total_events_attended' => 0,  // ❌ HARDCODED
            'upcoming_events' => 0,  // ❌ HARDCODED
            'total_spent' => 0,  // ❌ HARDCODED
            'favorite_performers' => 0,  // ❌ HARDCODED
        ],
    ]);
})->name('dashboard.fan');
```
**Fix Required:** Create `DashboardController@fan` method to fetch real data

#### 10. Organizer Dashboard (Line 308-318)
```php
Route::get('/dashboard/organizer', function (Request $request) {
    return Inertia::render('event-city/dashboard/organizer', [
        'events' => [],  // ❌ EMPTY ARRAY
        'stats' => [
            'total_events' => 0,  // ❌ HARDCODED
            'upcoming_events' => 0,  // ❌ HARDCODED
            'total_revenue' => 0,  // ❌ HARDCODED
            'total_attendees' => 0,  // ❌ HARDCODED
            'ticket_sales' => 0,  // ❌ HARDCODED
        ],
    ]);
})->name('dashboard.organizer');
```
**Fix Required:** Create `DashboardController@organizer` method

#### 11. Performer Dashboard (Line 320-331)
```php
Route::get('/dashboard/performer', function (Request $request) {
    return Inertia::render('event-city/dashboard/performer', [
        'performer' => [],  // ❌ EMPTY ARRAY
        'upcomingGigs' => [],  // ❌ EMPTY ARRAY
        'pastGigs' => [],  // ❌ EMPTY ARRAY
        'stats' => [
            'total_gigs' => 0,  // ❌ HARDCODED
            'total_revenue' => 0,  // ❌ HARDCODED
            'average_rating' => 0,  // ❌ HARDCODED
            'upcoming_shows' => 0,  // ❌ HARDCODED
        ],
    ]);
})->name('dashboard.performer');
```
**Fix Required:** Create `DashboardController@performer` method

#### 12. Venue Owner Dashboard (Line 333-343)
```php
Route::get('/dashboard/venue-owner', function (Request $request) {
    return Inertia::render('event-city/dashboard/venue-owner', [
        'venues' => [],  // ❌ EMPTY ARRAY
        'upcomingBookings' => [],  // ❌ EMPTY ARRAY
        'stats' => [
            'total_venues' => 0,  // ❌ HARDCODED
            'total_bookings' => 0,  // ❌ HARDCODED
            'total_revenue' => 0,  // ❌ HARDCODED
            'upcoming_bookings' => 0,  // ❌ HARDCODED
        ],
    ]);
})->name('dashboard.venue-owner');
```
**Fix Required:** Create `DashboardController@venueOwner` method

#### 13. Calendar Dashboard (Line 345-349)
```php
Route::get('/dashboard/calendar', function (Request $request) {
    return Inertia::render('event-city/dashboard/calendar', [
        'events' => [],  // ❌ EMPTY ARRAY
        'currentDate' => now()->toDateString(),
    ]);
})->name('dashboard.calendar');
```
**Fix Required:** Create `DashboardController@calendar` method

---

## 🟢 MEDIUM PRIORITY - Placeholder Values

### Location: `app/Http/Controllers/VenueController.php`

#### 14. Distance Placeholder (Line 136)
```php
'distance' => 0, // Placeholder - would be calculated based on user location
```
**Status:** ⚠️ Acceptable placeholder (requires user location)
**Note:** This is acceptable as it requires user location detection

### Location: `app/Http/Controllers/EventController.php`

#### 15. Discussion Thread ID (Line 460)
```php
'discussion_thread_id' => 'thread-'.fake()->randomNumber(6),
```
**Status:** ⚠️ Uses `fake()` helper
**Note:** This generates a random thread ID. Consider using a proper ID generation method or creating actual discussion threads.

### Location: `app/Services/Cies/OpportunityAnalyzerService.php`

#### 16. Mock AI Analysis (Line 59, 92)
```php
// 3. AI Analysis (Mocked for Phase 4 MVP)
$opportunityData = $this->mockAiAnalysis($post);

private function mockAiAnalysis(DayNewsPost $post): ?array
```
**Status:** ⚠️ Mock AI analysis method
**Note:** This is intentionally mocked for MVP. Should be replaced with real AI service integration when available.

---

## ✅ ACCEPTABLE - Commented Out Mock Data

### Location: `resources/js/components/day-news/announcements-section.tsx`

#### Line 19-24
```typescript
/* 
// SPEC MOCK DATA (kept for reference but commented out as per rules)
const mockAnnouncements = [
  { id: 1, title: 'Local Student Graduates with Honors', region: 'Clearwater', image: '...' },
  { id: 2, title: 'Dunedin Downtown Market Returns', region: 'Dunedin', image: '...' }
];
*/
```
**Status:** ✅ **ACCEPTABLE** - Properly commented out, not active code

---

## ✅ ACCEPTABLE - UI Placeholders

These are UI placeholder text (not mock data):
- Form input placeholders (`placeholder="Enter name"`)
- Select dropdown placeholders (`placeholder="Select option"`)
- Image placeholders (`/images/placeholder.jpg`) - fallback images
- Filament admin placeholders (`->placeholder('-')`)

**Status:** ✅ **ACCEPTABLE** - These are UI elements, not mock data

---

## Summary by Priority

### 🔴 Critical (Must Fix Immediately)
- **6 routes** with empty arrays in `routes/web.php` (marketing pages, discovery pages)
- **2 mock data values** in `VenueController.php`

### 🟡 High Priority (Fix Soon)
- **5 dashboard routes** with empty arrays and hardcoded stats
- **1 empty array** for upcoming events in VenueController

### 🟢 Medium Priority (Consider Fixing)
- **1 placeholder** distance calculation (acceptable)
- **1 fake()** usage for thread ID (consider proper ID generation)

### ✅ Acceptable
- Commented out mock data (properly disabled)
- UI placeholders (form inputs, images, etc.)

---

## Recommendations

### Immediate Actions:
1. **Create controllers** for all marketing pages (success-stories, press, careers, gear)
2. **Create DashboardController** with methods for each dashboard type
3. **Replace empty arrays** with database queries
4. **Replace hardcoded stats** with calculated values

### Example Fix Pattern:

**Before:**
```php
Route::get('/success-stories', function () {
    return Inertia::render('event-city/marketing/success-stories', [
        'stories' => [],
    ]);
});
```

**After:**
```php
Route::get('/success-stories', [MarketingController::class, 'successStories'])
    ->name('success-stories');
```

```php
// In MarketingController.php
public function successStories(): Response
{
    $stories = SuccessStory::published()
        ->orderBy('published_at', 'desc')
        ->get();
    
    return Inertia::render('event-city/marketing/success-stories', [
        'stories' => $stories,
    ]);
}
```

---

## Files Requiring Changes

1. `routes/web.php` - Replace route closures with controller methods
2. `app/Http/Controllers/VenueController.php` - Replace mock data with queries
3. `app/Http/Controllers/EventController.php` - Replace fake() with proper ID generation
4. **New:** `app/Http/Controllers/MarketingController.php` - Create for marketing pages
5. **New:** `app/Http/Controllers/DashboardController.php` - Create for dashboard pages

---

**Review Completed:** January 2025  
**Total Mock Data Locations:** 16  
**Critical Issues:** 8  
**High Priority:** 6  
**Medium Priority:** 2
