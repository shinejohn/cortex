<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class CommunityLeader extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'region_id',
        'name',
        'title',
        'organization',
        'email',
        'phone',
        'preferred_contact_method',
        'category',
        'expertise_topics',
        'organization_affiliations',
        'is_influencer',
        'influence_score',
        'social_media_handles',
        'follower_count',
        'times_contacted',
        'times_responded',
        'times_quoted',
        'avg_response_time_hours',
        'last_contacted_at',
        'last_responded_at',
        'notes',
        'is_verified',
        'is_active',
        'do_not_contact',
    ];

    protected $casts = [
        'expertise_topics' => 'array',
        'organization_affiliations' => 'array',
        'social_media_handles' => 'array',
        'is_influencer' => 'boolean',
        'is_verified' => 'boolean',
        'is_active' => 'boolean',
        'do_not_contact' => 'boolean',
        'last_contacted_at' => 'datetime',
        'last_responded_at' => 'datetime',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function quoteRequests(): HasMany
    {
        return $this->hasMany(QuoteRequest::class, 'leader_id');
    }
}
