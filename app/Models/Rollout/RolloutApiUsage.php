<?php

declare(strict_types=1);

namespace App\Models\Rollout;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class RolloutApiUsage extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $table = 'rollout_api_usage';

    protected $fillable = [
        'community_rollout_id', 'api_name', 'endpoint', 'sku_tier',
        'request_count', 'estimated_cost', 'actual_response_count',
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

    protected function casts(): array
    {
        return [
            'estimated_cost' => 'decimal:4',
            'created_at' => 'datetime',
        ];
    }
}
