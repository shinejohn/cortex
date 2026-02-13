<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

/**
 * Tracks fetch performance per source to feed back into platform profile learning.
 */
final class FetchPerformanceLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'source_id', 'collection_method_id', 'platform_slug', 'fetch_method',
        'success', 'response_time_ms', 'content_length', 'items_extracted',
        'content_quality_score', 'content_changed', 'error_message', 'metadata',
    ];

    protected $casts = [
        'success' => 'boolean',
        'content_changed' => 'boolean',
        'metadata' => 'array',
    ];

    public function source()
    {
        return $this->belongsTo(NewsSource::class, 'source_id');
    }

    public function collectionMethod()
    {
        return $this->belongsTo(CollectionMethod::class);
    }
}
