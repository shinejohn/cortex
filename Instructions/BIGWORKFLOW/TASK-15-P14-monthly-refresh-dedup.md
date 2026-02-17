# TASK-15-P14: Monthly Refresh Job + Dedup Logic

## Context

After initial rollout, a monthly refresh discovers new businesses and detects changes. Must be staggered to avoid colliding with the daily 6:00 AM news workflow. Process ~33 communities/day for large states.

**Depends on:** TASK-05 (Essentials field mask), TASK-06 (rollout infrastructure).

---

## Objective

Create `ProcessMonthlyRefreshJob` that re-runs Text Search for all parent categories with pagination, compares against existing `google_place_id` values, creates new businesses, and flags disappeared businesses after 3 consecutive absences.

---

## Files to Create

### 1. CREATE: Migration (add refresh tracking to businesses)

**File:** `database/migrations/2026_02_16_000006_add_refresh_tracking_to_businesses.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->timestamp('last_refreshed_at')->nullable()->after('serp_last_synced_at');
            $table->integer('consecutive_absences')->default(0)->after('last_refreshed_at');
            $table->boolean('is_active')->default(true)->after('consecutive_absences');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['last_refreshed_at', 'consecutive_absences', 'is_active']);
        });
    }
};
```

### 2. CREATE: ProcessMonthlyRefreshJob

**File:** `app/Jobs/Rollout/ProcessMonthlyRefreshJob.php`

```php
<?php

declare(strict_types=1);

namespace App\Jobs\Rollout;

use App\Models\Business;
use App\Models\Community;
use App\Services\News\BusinessDiscoveryService;
use App\Services\News\GooglePlacesService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMonthlyRefreshJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hour
    public $tries = 1;

    /**
     * @param int $batchNumber Which batch of communities to process (for staggering)
     * @param int $batchSize How many communities per batch
     */
    public function __construct(
        public int $batchNumber = 0,
        public int $batchSize = 33,
    ) {}

    public function handle(
        GooglePlacesService $googlePlaces,
        BusinessDiscoveryService $businessDiscovery,
    ): void {
        // Get communities for this batch
        $communities = Community::whereHas('regions')
            ->orderBy('id')
            ->offset($this->batchNumber * $this->batchSize)
            ->limit($this->batchSize)
            ->get();

        if ($communities->isEmpty()) {
            Log::info('Monthly refresh: No more communities to process', [
                'batch' => $this->batchNumber,
            ]);
            return;
        }

        Log::info('Monthly refresh: Starting batch', [
            'batch' => $this->batchNumber,
            'communities' => $communities->count(),
        ]);

        $stats = ['new_businesses' => 0, 'updated' => 0, 'marked_absent' => 0, 'deactivated' => 0];

        foreach ($communities as $community) {
            try {
                $result = $this->refreshCommunity($community, $googlePlaces, $businessDiscovery);
                $stats['new_businesses'] += $result['new'];
                $stats['updated'] += $result['updated'];
                $stats['marked_absent'] += $result['absent'];
                $stats['deactivated'] += $result['deactivated'];
            } catch (\Exception $e) {
                Log::error('Monthly refresh failed for community', [
                    'community' => $community->name,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Monthly refresh: Batch complete', [
            'batch' => $this->batchNumber,
            'stats' => $stats,
        ]);

        // Dispatch next batch
        $nextBatch = $this->batchNumber + 1;
        $hasMore = Community::whereHas('regions')
            ->offset($nextBatch * $this->batchSize)
            ->limit(1)
            ->exists();

        if ($hasMore) {
            self::dispatch($nextBatch, $this->batchSize)
                ->onQueue('refresh')
                ->delay(now()->addDay()); // Process one batch per day
        }
    }

    private function refreshCommunity(
        Community $community,
        GooglePlacesService $googlePlaces,
        BusinessDiscoveryService $businessDiscovery,
    ): array {
        $region = $community->regions()->first();
        if (!$region) return ['new' => 0, 'updated' => 0, 'absent' => 0, 'deactivated' => 0];

        $denseCategories = config('news-workflow.business_discovery.dense_categories', []);
        $stats = ['new' => 0, 'updated' => 0, 'absent' => 0, 'deactivated' => 0];

        // Collect all discovered place IDs in this refresh
        $discoveredPlaceIds = [];

        foreach ($denseCategories as $category) {
            try {
                $results = $googlePlaces->searchTextPlaces($region, $category);

                foreach ($results as $data) {
                    $placeId = $data['google_place_id'] ?? null;
                    if (!$placeId) continue;

                    $discoveredPlaceIds[] = $placeId;

                    // Check if business exists
                    $existing = Business::where('google_place_id', $placeId)->first();

                    if ($existing) {
                        // Update existing - check for name/address changes
                        $changed = false;
                        if ($existing->name !== ($data['name'] ?? $existing->name)) $changed = true;
                        if ($existing->address !== ($data['address'] ?? $existing->address)) $changed = true;

                        $existing->update([
                            'last_refreshed_at' => now(),
                            'consecutive_absences' => 0, // Reset absence counter
                        ]);

                        if ($changed) {
                            $businessDiscovery->upsertBusiness($data, $region);
                            $stats['updated']++;
                        }
                    } else {
                        // New business
                        $business = $businessDiscovery->upsertBusiness($data, $region);
                        $businessDiscovery->assignToRegion($business, $region);
                        $stats['new']++;
                    }
                }

                usleep(100 * 1000); // 100ms throttle
            } catch (\Exception $e) {
                Log::warning("Monthly refresh: Category failed", [
                    'community' => $community->name,
                    'category' => $category,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Mark businesses NOT found in this refresh
        // Don't deactivate immediately — wait for 3 consecutive absences
        $communityBusinesses = Business::where('community_id', $community->id)
            ->where('is_active', true)
            ->whereNotNull('google_place_id')
            ->get();

        foreach ($communityBusinesses as $business) {
            if (!in_array($business->google_place_id, $discoveredPlaceIds)) {
                $business->increment('consecutive_absences');
                $business->update(['last_refreshed_at' => now()]);
                $stats['absent']++;

                // Deactivate after 3 consecutive absences
                if ($business->consecutive_absences >= 3) {
                    $business->update(['is_active' => false]);
                    $stats['deactivated']++;

                    Log::info('Monthly refresh: Business deactivated after 3 absences', [
                        'business' => $business->name,
                        'place_id' => $business->google_place_id,
                    ]);
                }
            }
        }

        return $stats;
    }
}
```

### 3. UPDATE: routes/console.php

**Uncomment the monthly refresh schedule entry from TASK-13:**

```php
// Monthly business refresh (1st of month at 2:00 AM UTC)
Schedule::job(new \App\Jobs\Rollout\ProcessMonthlyRefreshJob(0, 33))
    ->monthlyOn(1, '02:00')
    ->withoutOverlapping()
    ->onQueue('refresh')
    ->description('Monthly business discovery refresh — batch 0');
```

### 4. MODIFY: Business model

**Add to `$fillable`:**

```php
'last_refreshed_at', 'consecutive_absences', 'is_active',
```

**Add to `$casts`:**

```php
'last_refreshed_at' => 'datetime',
'is_active' => 'boolean',
```

**Add scope:**

```php
public function scopeActive($query)
{
    return $query->where('is_active', true);
}
```

---

## Verification

```bash
php artisan migrate

php artisan tinker --execute="
    echo 'has last_refreshed_at: ' . (Schema::hasColumn('businesses', 'last_refreshed_at') ? 'YES' : 'NO') . PHP_EOL;
    echo 'has consecutive_absences: ' . (Schema::hasColumn('businesses', 'consecutive_absences') ? 'YES' : 'NO') . PHP_EOL;
    echo 'has is_active: ' . (Schema::hasColumn('businesses', 'is_active') ? 'YES' : 'NO') . PHP_EOL;
    echo 'ProcessMonthlyRefreshJob: ' . (class_exists(\App\Jobs\Rollout\ProcessMonthlyRefreshJob::class) ? 'OK' : 'MISSING') . PHP_EOL;
"

php artisan schedule:list | grep -i refresh
# Expected: Monthly refresh entry appears on the 1st at 02:00
```

**Cost per month at 1,000 communities:** ~33 communities/day × 30 days × ~$1.07/community = ~$1,070/month
