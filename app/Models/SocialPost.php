<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class SocialPost extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'user_id',
        'content',
        'media',
        'visibility',
        'location',
        'is_active',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(SocialPostLike::class, 'post_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(SocialPostComment::class, 'post_id');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(SocialPostShare::class, 'post_id');
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

    public function commentsCount(): int
    {
        return $this->comments()->where('is_active', true)->count();
    }

    public function sharesCount(): int
    {
        return $this->shares()->count();
    }

    protected function casts(): array
    {
        return [
            'media' => 'array',
            'location' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
