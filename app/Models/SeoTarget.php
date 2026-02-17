<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class SeoTarget extends Model
{
    use HasUuids;

    public const SERVICE_FILLER = 'filler';

    public const SERVICE_TOP_LIST = 'top_list';

    public const SERVICE_ARTICLE_GENERATION = 'article_generation';

    protected $fillable = [
        'region_id',
        'target_keyword',
        'search_volume',
        'competition_level',
        'content_gap_score',
        'assigned_service',
        'article_id',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_service')->whereNull('article_id');
    }

    public function scopeByGapScore($query, string $direction = 'desc')
    {
        return $query->orderBy('content_gap_score', $direction);
    }
}
