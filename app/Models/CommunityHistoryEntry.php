<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CommunityHistoryEntry extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'region_id',
        'content_type',
        'content_id',
        'event_date',
        'event_time',
        'duration_minutes',
        'recurrence_pattern',
        'location_name',
        'location_address',
        'affected_zip_codes',
        'topic_tags',
        'categories',
        'controversy_level',
        'resolution_status',
        'ai_summary',
        'key_facts',
        'affected_entities',
        'ongoing_implications',
        'related_entry_ids',
        'parent_story_id',
        'search_text',
    ];

    protected $casts = [
        'event_date' => 'date',
        'affected_zip_codes' => 'array',
        'topic_tags' => 'array',
        'categories' => 'array',
        'key_facts' => 'array',
        'affected_entities' => 'array',
        'related_entry_ids' => 'array',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function people(): HasMany
    {
        return $this->hasMany(CommunityHistoryPerson::class, 'history_entry_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(CommunityHistoryVote::class, 'history_entry_id');
    }
}
