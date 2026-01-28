<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ReaderProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'topic_interests',
        'preferred_categories',
        'preferred_content_types',
        'preferred_reading_times',
        'engagement_score',
        'total_articles_read',
        'total_events_viewed',
        'total_polls_voted',
        'total_comments',
        'total_shares',
        'poll_request_credits',
        'last_poll_request_at',
        'is_influencer',
        'is_expert',
        'is_sponsor',
        'last_active_at',
    ];

    protected $casts = [
        'topic_interests' => 'array',
        'preferred_categories' => 'array',
        'preferred_content_types' => 'array',
        'preferred_reading_times' => 'array',
        'last_poll_request_at' => 'datetime',
        'last_active_at' => 'datetime',
        'is_influencer' => 'boolean',
        'is_expert' => 'boolean',
        'is_sponsor' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
