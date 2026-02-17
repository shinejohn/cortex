<?php

declare(strict_types=1);

namespace App\Models\Rollout;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class StateRollout extends Model
{
    use HasUuids;

    public const STATUS_PLANNED = 'planned';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_PAUSED = 'paused';

    protected $fillable = [
        'state_code', 'state_name', 'status', 'total_communities',
        'completed_communities', 'failed_communities', 'started_at', 'completed_at',
        'total_api_cost', 'total_businesses_discovered', 'total_news_sources_created',
        'settings', 'initiated_by',
    ];

    public function communityRollouts()
    {
        return $this->hasMany(CommunityRollout::class);
    }

    public function scopeByState($query, string $stateCode)
    {
        return $query->where('state_code', mb_strtoupper($stateCode));
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function getProgressPercentageAttribute(): float
    {
        if ($this->total_communities === 0) {
            return 0;
        }

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

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'total_api_cost' => 'decimal:2',
        ];
    }
}
