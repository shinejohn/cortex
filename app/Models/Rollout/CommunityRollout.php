<?php

declare(strict_types=1);

namespace App\Models\Rollout;

use App\Models\Community;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class CommunityRollout extends Model
{
    use HasUuids;

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

    public function stateRollout()
    {
        return $this->belongsTo(StateRollout::class);
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
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
        if (! $config) {
            return;
        }

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

    protected function casts(): array
    {
        return [
            'error_log' => 'array',
            'api_cost_estimate' => 'decimal:4',
            'phase_1_started_at' => 'datetime', 'phase_1_completed_at' => 'datetime',
            'phase_2_started_at' => 'datetime', 'phase_2_completed_at' => 'datetime',
            'phase_3_started_at' => 'datetime', 'phase_3_completed_at' => 'datetime',
            'phase_4_started_at' => 'datetime', 'phase_4_completed_at' => 'datetime',
            'phase_5_started_at' => 'datetime', 'phase_5_completed_at' => 'datetime',
            'phase_6_started_at' => 'datetime', 'phase_6_completed_at' => 'datetime',
        ];
    }
}
