<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TopListArticle extends Model
{
    use HasUuids;

    public const STATUS_EDITORIAL_PUBLISHED = 'editorial_published';

    public const STATUS_VOTING = 'voting';

    public const STATUS_RESULTS_PUBLISHED = 'results_published';

    protected $fillable = [
        'topic_id',
        'region_id',
        'editorial_post_id',
        'poll_id',
        'results_post_id',
        'status',
    ];

    public function topic(): BelongsTo
    {
        return $this->belongsTo(TopListTopic::class, 'topic_id');
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function editorialPost(): BelongsTo
    {
        return $this->belongsTo(DayNewsPost::class, 'editorial_post_id');
    }

    public function poll(): BelongsTo
    {
        return $this->belongsTo(Poll::class, 'poll_id');
    }

    public function resultsPost(): BelongsTo
    {
        return $this->belongsTo(DayNewsPost::class, 'results_post_id');
    }
}
