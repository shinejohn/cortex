<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class SocialPostComment extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'post_id',
        'user_id',
        'parent_id',
        'content',
        'is_active',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(SocialPost::class, 'post_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(SocialCommentLike::class, 'comment_id');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(SocialActivity::class, 'subject');
    }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function likesCount(): int
    {
        return $this->likes()->count();
    }

    public function repliesCount(): int
    {
        return $this->replies()->where('is_active', true)->count();
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
