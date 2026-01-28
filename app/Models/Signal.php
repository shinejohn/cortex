<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Signal extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'metadata' => 'array',
        'published_at' => 'datetime',
    ];

    public function relatedStory(): BelongsTo
    {
        return $this->belongsTo(StoryThread::class, 'related_story_id');
    }
}
