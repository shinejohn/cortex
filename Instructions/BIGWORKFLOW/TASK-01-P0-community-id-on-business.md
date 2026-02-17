# TASK-01-P0: Add community_id to Business Model + Migration + Backfill

## Context

The `Business` model currently links to communities ONLY through a many-to-many `business_region` pivot table. There is no direct `community_id` foreign key on the `businesses` table. This means `BusinessMatchingService::findMatch()` cannot efficiently query businesses by community, and the entire rollout system cannot attribute a business to its primary community.

**Depends on:** Nothing — this is P0, the absolute foundation.

### Existing Code: BusinessDiscoveryService.php (relevant section)

```php
public function upsertBusiness(array $data, Region $region): Business
{
    $googlePlaceId = $data['google_place_id'];
    if (! $googlePlaceId) {
        throw new Exception('Business data missing google_place_id');
    }
    $business = Business::where('google_place_id', $googlePlaceId)->first();

    $businessFields = [
        'name' => $data['name'],
        'description' => $data['description'],
        'address' => $data['address'],
        'city' => $data['city'] ?? null,
        'state' => $data['state'] ?? null,
        'postal_code' => $data['postal_code'] ?? null,
        'latitude' => $data['latitude'],
        'longitude' => $data['longitude'],
        'rating' => $data['rating'],
        'reviews_count' => $data['reviews_count'],
        'phone' => $data['phone'],
        'website' => $data['website'],
        'categories' => $data['categories'],
        'primary_type' => $data['primary_type'] ?? null,
        'opening_hours' => $data['opening_hours'],
        'price_level' => $data['price_level'] ?? null,
        'images' => $data['images'] ?? [],
        'serp_metadata' => $data['serp_metadata'],
        'serp_source' => $data['serp_source'] ?? 'google_places',
        'serp_last_synced_at' => now(),
    ];

    if ($business) {
        $business->update($businessFields);
    } else {
        $business = Business::create([
            'google_place_id' => $googlePlaceId,
            ...$businessFields,
        ]);
    }
    return $business;
}

public function assignToRegion(Business $business, Region $region): void
{
    $exists = DB::table('business_region')
        ->where('business_id', $business->id)
        ->where('region_id', $region->id)
        ->exists();

    if (! $exists) {
        DB::table('business_region')->insert([
            'business_id' => $business->id,
            'region_id' => $region->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
```

### Existing Code: BusinessMatchingService.php (the query that needs community_id)

The `BusinessMatchingService::findMatch()` method currently tries to query businesses by `community_id`, but the column does not exist on the `businesses` table — it only exists on the pivot. This causes the match to fail silently or return zero results.

---

## Objective

Add a `community_id` column to the `businesses` table, update the Business model, update `BusinessDiscoveryService::upsertBusiness()` to set it, and backfill all existing records from the `business_region` pivot table.

---

## Files to Create or Modify

### 1. CREATE: Migration

**File:** `database/migrations/2026_02_16_000001_add_community_id_to_businesses_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add the column
        Schema::table('businesses', function (Blueprint $table) {
            $table->uuid('community_id')->nullable()->after('id');
            $table->index('community_id');
        });

        // Step 2: Backfill from business_region pivot
        // Uses the region's community_id (regions belong to communities)
        // If business_region links directly to community_id, use that.
        // Otherwise, derive from region → community relationship.
        DB::statement("
            UPDATE businesses b
            SET community_id = (
                SELECT br.region_id
                FROM business_region br
                WHERE br.business_id = b.id
                LIMIT 1
            )
            WHERE b.community_id IS NULL
        ");

        // NOTE: If your schema uses a separate communities table and regions
        // belong to communities, adjust the subquery:
        //
        // UPDATE businesses b
        // SET community_id = (
        //     SELECT r.community_id
        //     FROM business_region br
        //     JOIN regions r ON r.id = br.region_id
        //     WHERE br.business_id = b.id
        //     LIMIT 1
        // )
        // WHERE b.community_id IS NULL;
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropIndex(['community_id']);
            $table->dropColumn('community_id');
        });
    }
};
```

### 2. MODIFY: Business Model

**File:** `app/Models/Business.php`

Add `community_id` to the `$fillable` array. Add the `community()` relationship.

**Find this in $fillable array and add `'community_id'` to it:**

```php
// ADD 'community_id' to the existing $fillable array, near the top
'community_id',
```

**Add this relationship method to the Business model class:**

```php
/**
 * The community this business primarily belongs to.
 */
public function community(): \Illuminate\Database\Eloquent\Relations\BelongsTo
{
    return $this->belongsTo(\App\Models\Community::class);
}

/**
 * Scope: businesses in a specific community
 */
public function scopeInCommunity($query, string $communityId)
{
    return $query->where('community_id', $communityId);
}
```

### 3. MODIFY: BusinessDiscoveryService.php

**File:** `app/Services/News/BusinessDiscoveryService.php`

In the `upsertBusiness()` method, add `community_id` to the business fields. The community_id comes from the Region's community.

**Find this block in upsertBusiness():**

```php
$businessFields = [
    'name' => $data['name'],
```

**Replace the entire $businessFields assignment with:**

```php
$businessFields = [
    'name' => $data['name'],
    'description' => $data['description'],
    'address' => $data['address'],
    'city' => $data['city'] ?? null,
    'state' => $data['state'] ?? null,
    'postal_code' => $data['postal_code'] ?? null,
    'latitude' => $data['latitude'],
    'longitude' => $data['longitude'],
    'rating' => $data['rating'],
    'reviews_count' => $data['reviews_count'],
    'phone' => $data['phone'],
    'website' => $data['website'],
    'categories' => $data['categories'],
    'primary_type' => $data['primary_type'] ?? null,
    'opening_hours' => $data['opening_hours'],
    'price_level' => $data['price_level'] ?? null,
    'images' => $data['images'] ?? [],
    'serp_metadata' => $data['serp_metadata'],
    'serp_source' => $data['serp_source'] ?? 'google_places',
    'serp_last_synced_at' => now(),
    'community_id' => $region->community_id ?? $region->id,
];
```

The key change is the last line: `'community_id' => $region->community_id ?? $region->id`. If Region has a `community_id` FK, use that. Otherwise, fall back to region ID (for schemas where regions ARE communities).

---

## Implementation Steps

1. Create the migration file at the exact path above.
2. Add `'community_id'` to the Business model's `$fillable` array.
3. Add the `community()` relationship and `scopeInCommunity()` scope to the Business model.
4. Modify `BusinessDiscoveryService::upsertBusiness()` to include `community_id` in `$businessFields`.
5. Run the migration: `php artisan migrate`
6. Verify the backfill populated existing records.

---

## Verification

```bash
# Run the migration
php artisan migrate

# Verify column exists
php artisan tinker --execute="echo Schema::hasColumn('businesses', 'community_id') ? 'YES' : 'NO';"

# Check backfill results — count of businesses WITH community_id set
php artisan tinker --execute="echo 'Backfilled: ' . \App\Models\Business::whereNotNull('community_id')->count() . ' / ' . \App\Models\Business::count();"

# Verify BusinessMatchingService can now query by community
php artisan tinker --execute="\$b = \App\Models\Business::whereNotNull('community_id')->first(); echo 'Business: ' . \$b->name . ' | community_id: ' . \$b->community_id;"
```

**Expected output:**
- Column exists: `YES`
- Backfilled count should be > 0 (ideally matching total count)
- Individual business should show a non-null community_id

---

## Critical Warning

Without this backfill, every existing `BusinessMatchingService` query returns zero results even after the column exists. The migration MUST include the backfill SQL. If the backfill query needs adjustment based on your actual schema (e.g., if `business_region` uses `community_id` directly vs `region_id`), inspect the pivot table first:

```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'business_region';
```

Adjust the backfill subquery accordingly.
