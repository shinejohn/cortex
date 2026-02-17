# TASK-02-P1: Create State Rollout Tracking Tables

## Context

The rollout system needs three new tables to manage the systematic activation of communities state-by-state with progress monitoring, cost tracking, and quality gates. No rollout infrastructure currently exists.

**Depends on:** Nothing (can run in parallel with TASK-01).

---

## Objective

Create `state_rollouts`, `community_rollouts`, and `rollout_api_usage` tables with their corresponding Eloquent models.

---

## Files to Create

### 1. CREATE: Migration

**File:** `database/migrations/2026_02_16_000002_create_state_rollout_tables.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('state_rollouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('state_code', 2)->unique();
            $table->string('state_name');
            $table->string('status')->default('planned'); // planned|in_progress|completed|paused
            $table->integer('total_communities')->default(0);
            $table->integer('completed_communities')->default(0);
            $table->integer('failed_communities')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->decimal('total_api_cost', 10, 2)->default(0);
            $table->integer('total_businesses_discovered')->default(0);
            $table->integer('total_news_sources_created')->default(0);
            $table->jsonb('settings')->nullable(); // batch_size, throttle_ms, concurrent_communities, skip_enrichment, priority_communities
            $table->string('initiated_by')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('state_code');
        });

        Schema::create('community_rollouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('state_rollout_id');
            $table->uuid('community_id');
            $table->string('status')->default('queued'); // queued|phase_1_discovery|phase_2_scanning|phase_3_sources|phase_4_enrichment|phase_5_verification|completed|failed|paused
            $table->integer('current_phase')->default(0); // 1-6

            // Per-phase tracking
            $table->string('phase_1_status')->default('pending'); // pending|running|completed|failed
            $table->string('phase_2_status')->default('pending');
            $table->string('phase_3_status')->default('pending');
            $table->string('phase_4_status')->default('pending');
            $table->string('phase_5_status')->default('pending');
            $table->string('phase_6_status')->default('pending');

            $table->timestamp('phase_1_started_at')->nullable();
            $table->timestamp('phase_1_completed_at')->nullable();
            $table->timestamp('phase_2_started_at')->nullable();
            $table->timestamp('phase_2_completed_at')->nullable();
            $table->timestamp('phase_3_started_at')->nullable();
            $table->timestamp('phase_3_completed_at')->nullable();
            $table->timestamp('phase_4_started_at')->nullable();
            $table->timestamp('phase_4_completed_at')->nullable();
            $table->timestamp('phase_5_started_at')->nullable();
            $table->timestamp('phase_5_completed_at')->nullable();
            $table->timestamp('phase_6_started_at')->nullable();
            $table->timestamp('phase_6_completed_at')->nullable();

            // Outcome counters
            $table->integer('businesses_discovered')->default(0);
            $table->integer('businesses_with_websites')->default(0);
            $table->integer('news_sources_created')->default(0);
            $table->integer('collection_methods_created')->default(0);
            $table->integer('events_venues_created')->default(0);
            $table->integer('directory_listings_created')->default(0);
            $table->integer('crm_leads_created')->default(0);

            // Cost tracking
            $table->integer('api_calls_made')->default(0);
            $table->decimal('api_cost_estimate', 10, 4)->default(0);

            // Error handling
            $table->jsonb('error_log')->nullable();
            $table->integer('retry_count')->default(0);

            $table->timestamps();

            $table->foreign('state_rollout_id')->references('id')->on('state_rollouts')->cascadeOnDelete();
            $table->index(['state_rollout_id', 'status']);
            $table->index('community_id');
            $table->index('status');
        });

        Schema::create('rollout_api_usage', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('community_rollout_id');
            $table->string('api_name'); // google_places|serpapi|scrapingbee|openrouter|unsplash
            $table->string('endpoint'); // text_search|nearby_search|place_details|place_photos
            $table->string('sku_tier'); // essentials|pro|enterprise
            $table->integer('request_count')->default(1);
            $table->decimal('estimated_cost', 10, 4)->default(0);
            $table->integer('actual_response_count')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('community_rollout_id')->references('id')->on('community_rollouts')->cascadeOnDelete();
            $table->index(['community_rollout_id', 'api_name']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rollout_api_usage');
        Schema::dropIfExists('community_rollouts');
        Schema::dropIfExists('state_rollouts');
    }
};
```

### 2. CREATE: StateRollout Model

**File:** `app/Models/Rollout/StateRollout.php`

```php
<?php

declare(strict_types=1);

namespace App\Models\Rollout;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StateRollout extends Model
{
    use HasUuids;

    protected $fillable = [
        'state_code', 'state_name', 'status', 'total_communities',
        'completed_communities', 'failed_communities', 'started_at', 'completed_at',
        'total_api_cost', 'total_businesses_discovered', 'total_news_sources_created',
        'settings', 'initiated_by',
    ];

    protected $casts = [
        'settings' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'total_api_cost' => 'decimal:2',
    ];

    public const STATUS_PLANNED = 'planned';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_PAUSED = 'paused';

    public function communityRollouts()
    {
        return $this->hasMany(CommunityRollout::class);
    }

    public function scopeByState($query, string $stateCode)
    {
        return $query->where('state_code', strtoupper($stateCode));
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_communities === 0) return 0;
        return round(($this->completed_communities / $this->total_communities) * 100, 1);
    }

    public function incrementCompleted(): void
    {
        $this->increment('completed_communities');
        if ($this->completed_communities >= $this->total_communities) {
            $this->update(['status' => self::STATUS_COMPLETED, 'completed_at' => now()]);
        }
    }

    public function incrementFailed(): void
    {
        $this->increment('failed_communities');
    }

    public function addCost(float $cost): void
    {
        $this->increment('total_api_cost', $cost);
    }
}
```

### 3. CREATE: CommunityRollout Model

**File:** `app/Models/Rollout/CommunityRollout.php`

```php
<?php

declare(strict_types=1);

namespace App\Models\Rollout;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CommunityRollout extends Model
{
    use HasUuids;

    protected $fillable = [
        'state_rollout_id', 'community_id', 'status', 'current_phase',
        'phase_1_status', 'phase_2_status', 'phase_3_status',
        'phase_4_status', 'phase_5_status', 'phase_6_status',
        'phase_1_started_at', 'phase_1_completed_at',
        'phase_2_started_at', 'phase_2_completed_at',
        'phase_3_started_at', 'phase_3_completed_at',
        'phase_4_started_at', 'phase_4_completed_at',
        'phase_5_started_at', 'phase_5_completed_at',
        'phase_6_started_at', 'phase_6_completed_at',
        'businesses_discovered', 'businesses_with_websites',
        'news_sources_created', 'collection_methods_created',
        'events_venues_created', 'directory_listings_created', 'crm_leads_created',
        'api_calls_made', 'api_cost_estimate', 'error_log', 'retry_count',
    ];

    protected $casts = [
        'error_log' => 'array',
        'api_cost_estimate' => 'decimal:4',
        'phase_1_started_at' => 'datetime', 'phase_1_completed_at' => 'datetime',
        'phase_2_started_at' => 'datetime', 'phase_2_completed_at' => 'datetime',
        'phase_3_started_at' => 'datetime', 'phase_3_completed_at' => 'datetime',
        'phase_4_started_at' => 'datetime', 'phase_4_completed_at' => 'datetime',
        'phase_5_started_at' => 'datetime', 'phase_5_completed_at' => 'datetime',
        'phase_6_started_at' => 'datetime', 'phase_6_completed_at' => 'datetime',
    ];

    public const STATUS_QUEUED = 'queued';
    public const STATUS_PHASE_1 = 'phase_1_discovery';
    public const STATUS_PHASE_2 = 'phase_2_scanning';
    public const STATUS_PHASE_3 = 'phase_3_sources';
    public const STATUS_PHASE_4 = 'phase_4_enrichment';
    public const STATUS_PHASE_5 = 'phase_5_verification';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_PAUSED = 'paused';

    public const PHASE_PENDING = 'pending';
    public const PHASE_RUNNING = 'running';
    public const PHASE_COMPLETED = 'completed';
    public const PHASE_FAILED = 'failed';

    public function stateRollout()
    {
        return $this->belongsTo(StateRollout::class);
    }

    public function community()
    {
        return $this->belongsTo(\App\Models\Community::class);
    }

    public function apiUsage()
    {
        return $this->hasMany(RolloutApiUsage::class);
    }

    public function startPhase(int $phase): void
    {
        $phaseStatuses = [
            1 => ['status' => self::STATUS_PHASE_1, 'field' => 'phase_1'],
            2 => ['status' => self::STATUS_PHASE_2, 'field' => 'phase_2'],
            3 => ['status' => self::STATUS_PHASE_3, 'field' => 'phase_3'],
            4 => ['status' => self::STATUS_PHASE_4, 'field' => 'phase_4'],
            5 => ['status' => self::STATUS_PHASE_5, 'field' => 'phase_5'],
            6 => ['status' => self::STATUS_PHASE_5, 'field' => 'phase_6'],
        ];

        $config = $phaseStatuses[$phase] ?? null;
        if (!$config) return;

        $this->update([
            'status' => $config['status'],
            'current_phase' => $phase,
            "{$config['field']}_status" => self::PHASE_RUNNING,
            "{$config['field']}_started_at" => now(),
        ]);
    }

    public function completePhase(int $phase): void
    {
        $field = "phase_{$phase}";
        $this->update([
            "{$field}_status" => self::PHASE_COMPLETED,
            "{$field}_completed_at" => now(),
        ]);
    }

    public function failPhase(int $phase, string $error): void
    {
        $field = "phase_{$phase}";
        $errors = $this->error_log ?? [];
        $errors[] = ['phase' => $phase, 'error' => $error, 'at' => now()->toIso8601String()];

        $this->update([
            "{$field}_status" => self::PHASE_FAILED,
            'error_log' => $errors,
        ]);
    }

    public function markCompleted(): void
    {
        $this->update(['status' => self::STATUS_COMPLETED]);
        $this->stateRollout->incrementCompleted();
    }

    public function markFailed(): void
    {
        $this->update(['status' => self::STATUS_FAILED]);
        $this->stateRollout->incrementFailed();
    }

    public function logApiUsage(string $apiName, string $endpoint, string $skuTier, int $requestCount, float $cost, int $responseCount = 0): void
    {
        $this->apiUsage()->create([
            'api_name' => $apiName,
            'endpoint' => $endpoint,
            'sku_tier' => $skuTier,
            'request_count' => $requestCount,
            'estimated_cost' => $cost,
            'actual_response_count' => $responseCount,
        ]);

        $this->increment('api_calls_made', $requestCount);
        $this->increment('api_cost_estimate', $cost);
        $this->stateRollout->addCost($cost);
    }
}
```

### 4. CREATE: RolloutApiUsage Model

**File:** `app/Models/Rollout/RolloutApiUsage.php`

```php
<?php

declare(strict_types=1);

namespace App\Models\Rollout;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class RolloutApiUsage extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'rollout_api_usage';

    protected $fillable = [
        'community_rollout_id', 'api_name', 'endpoint', 'sku_tier',
        'request_count', 'estimated_cost', 'actual_response_count',
    ];

    protected $casts = [
        'estimated_cost' => 'decimal:4',
        'created_at' => 'datetime',
    ];

    public function communityRollout()
    {
        return $this->belongsTo(CommunityRollout::class);
    }

    public function scopeByApi($query, string $apiName)
    {
        return $query->where('api_name', $apiName);
    }

    public function scopeBySku($query, string $sku)
    {
        return $query->where('sku_tier', $sku);
    }
}
```

---

## Implementation Steps

1. Create the migration file.
2. Create the `app/Models/Rollout/` directory.
3. Create all three model files.
4. Run `php artisan migrate`.

---

## Verification

```bash
php artisan migrate

# Verify tables exist
php artisan tinker --execute="
    echo 'state_rollouts: ' . (Schema::hasTable('state_rollouts') ? 'YES' : 'NO') . PHP_EOL;
    echo 'community_rollouts: ' . (Schema::hasTable('community_rollouts') ? 'YES' : 'NO') . PHP_EOL;
    echo 'rollout_api_usage: ' . (Schema::hasTable('rollout_api_usage') ? 'YES' : 'NO') . PHP_EOL;
"

# Test creating a state rollout
php artisan tinker --execute="
    \$sr = \App\Models\Rollout\StateRollout::create([
        'state_code' => 'TX',
        'state_name' => 'Texas',
        'status' => 'planned',
        'total_communities' => 50,
        'settings' => ['batch_size' => 5, 'throttle_ms' => 100],
    ]);
    echo 'Created StateRollout: ' . \$sr->id;
    \$sr->delete();
"
```
