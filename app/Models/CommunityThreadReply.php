<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class CommunityThreadReply extends Model
{
    /** @use HasFactory<\Database\Factories\CommunityThreadReplyFactory> */
    use HasFactory, HasUuid;

    protected $fillable = [
        'thread_id',
        'user_id',
        'content',
        'images',
        'likes_count',
        'is_solution',
        'is_pinned',
        'is_edited',
        'edited_at',
        'reply_to_id',
    ];

    public function thread(): BelongsTo
    {
        return $this->belongsTo(CommunityThread::class, 'thread_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'reply_to_id');
    }

    // Scopes
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeSolutions($query)
    {
        return $query->where('is_solution', true);
    }

    public function scopeTopLevel($query)
    {
        return $query->whereNull('reply_to_id');
    }

    public function scopeByUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeRecent($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'is_solution' => 'boolean',
            'is_pinned' => 'boolean',
            'is_edited' => 'boolean',
            'edited_at' => 'datetime',
        ];
    }
}
