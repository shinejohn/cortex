<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Poll extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'region_id',
        'calendar_entry_id',
        'created_by',
        'slug',
        'title',
        'description',
        'featured_image_url',
        'poll_type',
        'category',
        'topic',
        'voting_starts_at',
        'voting_ends_at',
        'is_active',
        'allow_write_ins',
        'show_results_during_voting',
        'require_login_to_vote',
        'max_votes_per_user',
        'total_votes',
        'total_participants',
        'winner_option_id',
        'results_article_id',
        'results_published_at',
        'seo_metadata',
    ];

    protected $attributes = [
        'max_votes_per_user' => 1,
        'is_active' => false,
        'total_votes' => 0,
        'total_participants' => 0,
    ];

    protected $casts = [
        'voting_starts_at' => 'datetime',
        'voting_ends_at' => 'datetime',
        'results_published_at' => 'datetime',
        'is_active' => 'boolean',
        'allow_write_ins' => 'boolean',
        'show_results_during_voting' => 'boolean',
        'require_login_to_vote' => 'boolean',
        'seo_metadata' => 'array',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(PollOption::class)->orderBy('display_order');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(PollVote::class);
    }

    public function discussions(): HasMany
    {
        return $this->hasMany(PollDiscussion::class);
    }
}
