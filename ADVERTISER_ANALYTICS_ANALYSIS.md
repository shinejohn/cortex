# Advertiser Analytics & Reporting Analysis

**Date:** December 23, 2025  
**Question:** Can advertisers see when/where their ads played, impressions, clicks, and other analytics?

---

## ✅ Current Analytics Capabilities

### 1. **Admin Panel (Filament)** - ✅ EXISTS

**Location:** `/admin/advertisements` (Admin-only)

**What Advertisers Can See:**
- ✅ **Impressions Count** - Total impressions per ad
- ✅ **Clicks Count** - Total clicks per ad
- ✅ **CTR (Click-Through Rate)** - Calculated percentage
- ✅ **Platform** - Which platform (day_news, event_city, downtown_guide)
- ✅ **Placement** - Where ad appears (sidebar, banner, inline, featured)
- ✅ **Status** - Active/Inactive
- ✅ **Schedule** - Start date, expiration date
- ✅ **Content** - What content is being advertised

**Limitations:**
- ❌ **Admin-only** - Not accessible to advertisers
- ❌ **No time-series data** - Can't see impressions/clicks over time
- ❌ **No region breakdown** - Can't see performance by region
- ❌ **No placement comparison** - Can't compare performance across placements
- ❌ **No export** - Can't download reports
- ❌ **No charts/graphs** - No visual analytics

---

## ❌ Missing: Advertiser-Facing Dashboard

### What's NOT Available to Advertisers:

1. **No Advertiser Portal**
   - ❌ No user-facing dashboard
   - ❌ No "My Ads" page
   - ❌ No advertiser login/account
   - ❌ No self-service ad management

2. **No Detailed Analytics**
   - ❌ No time-series charts (impressions/clicks over time)
   - ❌ No region performance breakdown
   - ❌ No placement performance comparison
   - ❌ No page/URL breakdown (where ads were shown)
   - ❌ No device/browser breakdown
   - ❌ No conversion tracking

3. **No Reporting Features**
   - ❌ No scheduled email reports
   - ❌ No PDF export
   - ❌ No CSV export
   - ❌ No custom date ranges
   - ❌ No comparison reports

4. **No Real-Time Data**
   - ❌ No live impression tracking
   - ❌ No real-time click tracking
   - ❌ No current active ads status

---

## 📊 Current Data Tracking

### What IS Being Tracked:

```php
// Advertisement Model
- impressions_count (total)
- clicks_count (total)
- platform (which site)
- placement (where on page)
- regions (target regions)
- starts_at (when ad started)
- expires_at (when ad expires)
- is_active (current status)
```

### What IS NOT Being Tracked:

- ❌ **Time-series data** - No daily/hourly breakdown
- ❌ **Region performance** - No per-region analytics
- ❌ **Page/URL tracking** - No record of which pages showed the ad
- ❌ **User demographics** - No age, gender, location data
- ❌ **Device data** - No mobile vs desktop breakdown
- ❌ **Conversion events** - No post-click conversions
- ❌ **Viewability** - No viewability metrics (50% visible, etc.)

---

## 🎯 Recommended Implementation

### Phase 1: Advertiser Portal (High Priority)

**Create advertiser-facing dashboard:**

1. **Database Schema:**
```sql
-- Link ads to advertisers (workspaces/users)
ALTER TABLE advertisements ADD COLUMN advertiser_id (workspace_id or user_id)
ALTER TABLE advertisements ADD COLUMN advertiser_type (workspace|user)

-- Track detailed impressions/clicks
CREATE TABLE advertisement_impressions (
    id BIGINT PRIMARY KEY,
    advertisement_id BIGINT,
    region_id BIGINT,
    page_url VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    viewed_at TIMESTAMP,
    INDEX(advertisement_id, viewed_at)
);

CREATE TABLE advertisement_clicks (
    id BIGINT PRIMARY KEY,
    advertisement_id BIGINT,
    impression_id BIGINT, -- Link to impression
    region_id BIGINT,
    page_url VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    clicked_at TIMESTAMP,
    INDEX(advertisement_id, clicked_at)
);
```

2. **Controller:**
```php
// app/Http/Controllers/Advertiser/AdDashboardController.php
- index() - List advertiser's ads
- show($ad) - Detailed analytics for one ad
- analytics($ad) - JSON API for charts
- export($ad) - CSV/PDF export
```

3. **Frontend Pages:**
```tsx
// resources/js/pages/advertiser/dashboard.tsx
- List of ads with summary stats
- Quick filters (active, expired, all)
- Total impressions, clicks, CTR

// resources/js/pages/advertiser/ads/[id]/analytics.tsx
- Time-series charts (impressions/clicks over time)
- Region breakdown
- Placement comparison
- Export buttons
```

### Phase 2: Enhanced Analytics (Medium Priority)

**Add detailed tracking:**

1. **Update Tracking:**
```php
// Track each impression with details
public function trackImpression(Advertisement $ad, Request $request): void
{
    AdvertisementImpression::create([
        'advertisement_id' => $ad->id,
        'region_id' => $request->input('region_id'),
        'page_url' => $request->input('page_url'),
        'user_agent' => $request->userAgent(),
        'ip_address' => $request->ip(),
        'viewed_at' => now(),
    ]);
    
    $ad->incrementImpressions();
}
```

2. **Analytics Service:**
```php
// app/Services/AdvertisementAnalyticsService.php
- getTimeSeriesData($ad, $startDate, $endDate)
- getRegionBreakdown($ad)
- getPlacementComparison($ad)
- getPageBreakdown($ad)
- getDeviceBreakdown($ad)
```

### Phase 3: Reporting (Low Priority)

**Add reporting features:**

1. **Email Reports:**
```php
// app/Jobs/SendAdvertiserReportJob.php
- Weekly/monthly email reports
- Summary stats
- Top performing ads
- Recommendations
```

2. **Export Features:**
```php
// Export to CSV/PDF
- Date range selection
- Custom metrics
- Charts included
```

---

## 📋 Current Status Summary

### ✅ What EXISTS:
- Basic impression/click tracking
- CTR calculation
- Admin panel (Filament) with basic stats
- Platform/placement tracking
- Schedule tracking

### ❌ What's MISSING:
- Advertiser-facing dashboard
- Time-series analytics
- Region breakdown
- Page/URL tracking
- Export capabilities
- Email reports
- Real-time data
- Visual charts/graphs

---

## 🚀 Quick Win: Add Advertiser Dashboard

**Minimum Viable Implementation:**

1. **Create Route:**
```php
Route::middleware(['auth'])->prefix('advertiser')->group(function () {
    Route::get('/ads', [AdvertiserAdController::class, 'index']);
    Route::get('/ads/{ad}', [AdvertiserAdController::class, 'show']);
    Route::get('/ads/{ad}/analytics', [AdvertiserAdController::class, 'analytics']);
});
```

2. **Create Controller:**
```php
// Show ads for current user's workspace
public function index(Request $request)
{
    $workspace = $request->user()->currentWorkspace;
    $ads = Advertisement::where('advertiser_id', $workspace->id)
        ->with('advertable')
        ->latest()
        ->paginate(20);
    
    return Inertia::render('advertiser/ads/index', [
        'ads' => $ads,
    ]);
}
```

3. **Create Frontend Page:**
```tsx
// Show list of ads with basic stats
// Link to detailed analytics page
```

**This would give advertisers:**
- ✅ View their ads
- ✅ See impressions/clicks/CTR
- ✅ See schedule (start/end dates)
- ✅ See platform/placement
- ✅ Basic self-service access

---

## 📊 Recommended Analytics Dashboard Features

### Dashboard Overview:
- Total ads (active, expired, all)
- Total impressions (today, week, month, all-time)
- Total clicks (today, week, month, all-time)
- Average CTR
- Top performing ads
- Recent activity

### Ad Detail Page:
- **Overview:**
  - Impressions, clicks, CTR
  - Schedule (start/end dates)
  - Platform, placement, regions
  - Status (active/inactive/expired)

- **Charts:**
  - Impressions over time (line chart)
  - Clicks over time (line chart)
  - Impressions by region (bar chart)
  - Clicks by region (bar chart)
  - Performance by placement (comparison)

- **Tables:**
  - Daily breakdown (last 30 days)
  - Region breakdown
  - Page/URL breakdown (if tracked)
  - Device breakdown (if tracked)

- **Actions:**
  - Export CSV
  - Export PDF
  - Schedule email report
  - Edit ad
  - Pause/Resume ad

---

## 🎯 Answer to User's Question

**Current State:**
- ✅ **Impressions:** Tracked (total count)
- ✅ **Clicks:** Tracked (total count)
- ✅ **CTR:** Calculated (percentage)
- ⚠️ **When:** Only start/end dates (no time-series)
- ⚠️ **Where:** Platform and placement (no page/URL breakdown)
- ❌ **Advertiser Access:** Admin-only (no self-service)

**Recommendation:**
Implement advertiser-facing dashboard with:
1. List of advertiser's ads
2. Basic stats (impressions, clicks, CTR)
3. Time-series charts
4. Region breakdown
5. Export capabilities

**Priority:** High - Advertisers need self-service access to their analytics.

