<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class WireServiceRun extends Model
{
    use HasUuids;

    protected $fillable = [
        'feed_id', 'items_found', 'items_new', 'items_duplicate',
        'items_filtered_geo', 'started_at', 'completed_at', 'status', 'error',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function feed()
    {
        return $this->belongsTo(WireServiceFeed::class, 'feed_id');
    }
}
