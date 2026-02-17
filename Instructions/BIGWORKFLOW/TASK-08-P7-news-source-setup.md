# TASK-08-P7: Add evaluateAndSetupNewsSource() to BusinessDiscoveryService

## Context

After TASK-07 created the `WebsiteScannerService`, this task connects it to the `BusinessDiscoveryService` so that business discovery automatically triggers website scanning for businesses with websites. This bridges Phase 1 (discovery) into Phase 2 (scanning).

**Depends on:** TASK-07 (WebsiteScannerService must exist).

---

## Objective

Add `evaluateAndSetupNewsSource()` to `BusinessDiscoveryService` that takes a discovered business, checks if it has a website, and dispatches a `ProcessWebsiteScanJob` to create `NewsSource` + `CollectionMethod` records.

---

## Files to Modify

### MODIFY: BusinessDiscoveryService.php

**Add this import at the top:**

```php
use App\Jobs\Rollout\ProcessWebsiteScanJob;
use App\Models\NewsSource;
use App\Models\Rollout\CommunityRollout;
```

**Add this method to the class:**

```php
/**
 * Evaluate a discovered business for news source potential and set up collection.
 * Dispatches async website scanning for businesses with websites.
 *
 * @param Business $business The discovered business
 * @param CommunityRollout|null $communityRollout For rollout tracking (optional)
 * @return bool Whether a scan job was dispatched
 */
public function evaluateAndSetupNewsSource(Business $business, ?CommunityRollout $communityRollout = null): bool
{
    // Skip if no website
    if (empty($business->website)) {
        return false;
    }

    // Skip if NewsSource already exists for this business
    if (NewsSource::where('business_id', $business->id)->exists()) {
        Log::debug('NewsSource already exists for business', [
            'business_id' => $business->id,
            'name' => $business->name,
        ]);
        return false;
    }

    // Dispatch async website scan job
    ProcessWebsiteScanJob::dispatch($business, $communityRollout)
        ->onQueue('scanning');

    Log::info('Dispatched website scan for business', [
        'business_id' => $business->id,
        'name' => $business->name,
        'website' => $business->website,
    ]);

    return true;
}

/**
 * Run discovery for a community with full news source evaluation.
 * This is the rollout-aware version of discoverBusinesses().
 *
 * @param \App\Models\Region $region The region to discover businesses in
 * @param CommunityRollout|null $communityRollout For rollout tracking
 * @return array{businesses: int, scans_dispatched: int}
 */
public function discoverAndEvaluate(\App\Models\Region $region, ?CommunityRollout $communityRollout = null): array
{
    $businessCount = $this->discoverBusinesses($region);
    $scansDispatched = 0;

    // Get all businesses in this region with websites that don't yet have a NewsSource
    $businesses = Business::where('community_id', $region->community_id ?? $region->id)
        ->whereNotNull('website')
        ->where('website', '!=', '')
        ->whereDoesntHave('newsSource')
        ->get();

    foreach ($businesses as $business) {
        if ($this->evaluateAndSetupNewsSource($business, $communityRollout)) {
            $scansDispatched++;
        }
    }

    Log::info('Discovery and evaluation complete', [
        'region' => $region->name,
        'businesses_discovered' => $businessCount,
        'scan_jobs_dispatched' => $scansDispatched,
    ]);

    return [
        'businesses' => $businessCount,
        'scans_dispatched' => $scansDispatched,
    ];
}
```

**Also add this relationship to the Business model (if not already present):**

**File:** `app/Models/Business.php`

```php
public function newsSource(): \Illuminate\Database\Eloquent\Relations\HasOne
{
    return $this->hasOne(\App\Models\NewsSource::class, 'business_id');
}
```

---

## Verification

```bash
php artisan tinker --execute="
    \$bds = app(\App\Services\News\BusinessDiscoveryService::class);
    echo 'evaluateAndSetupNewsSource exists: ' . (method_exists(\$bds, 'evaluateAndSetupNewsSource') ? 'YES' : 'NO') . PHP_EOL;
    echo 'discoverAndEvaluate exists: ' . (method_exists(\$bds, 'discoverAndEvaluate') ? 'YES' : 'NO') . PHP_EOL;
"
```
