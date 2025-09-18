<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CommunityThread extends Model
{
    /** @use HasFactory<\Database\Factories\CommunityThreadFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'title',
        'content',
        'preview',
        'type',
        'tags',
        'images',
        'is_pinned',
        'is_locked',
        'is_featured',
        'last_reply_at',
        'last_reply_by',
        'community_id',
        'author_id',
    ];

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function lastReplyBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_reply_by');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(CommunityThreadReply::class, 'thread_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(CommunityThreadView::class, 'thread_id');
    }

    public function topLevelReplies(): HasMany
    {
        return $this->hasMany(CommunityThreadReply::class, 'thread_id')->topLevel();
    }

    public function solutions(): HasMany
    {
        return $this->hasMany(CommunityThreadReply::class, 'thread_id')->solutions();
    }

    // Computed attributes
    public function getViewsCountAttribute(): int
    {
        return $this->views()->count();
    }

    public function getReplyCountAttribute(): int
    {
        return $this->replies()->count();
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeUnlocked($query)
    {
        return $query->where('is_locked', false);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'images' => 'array',
            'is_pinned' => 'boolean',
            'is_locked' => 'boolean',
            'is_featured' => 'boolean',
            'last_reply_at' => 'datetime',
        ];
    }
}
