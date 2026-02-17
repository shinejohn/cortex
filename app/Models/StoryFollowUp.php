<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class StoryFollowUp extends Model
{
    use HasUuids;

    protected $fillable = [
        'story_thread_id', 'type', 'trigger', 'description',
        'source_content_id', 'generated_article_id',
        'status', 'scheduled_for', 'completed_at',
    ];

    public function storyThread()
    {
        return $this->belongsTo(StoryThread::class);
    }

    protected function casts(): array
    {
        return [
            'scheduled_for' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
