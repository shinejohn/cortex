<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class ArticleComment extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'article_id',
        'user_id',
        'parent_id',
        'content',
        'is_active',
        'is_pinned',
        'reports_count',
    ];

    public function article(): BelongsTo
    {
        return $this->belongsTo(DayNewsPost::class, 'article_id');
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
        return $this->hasMany(ArticleCommentLike::class, 'comment_id');
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

    // Scopes
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    public function scopeBest($query)
    {
        // Sort by likes count, then by created_at
        return $query->withCount('likes')
            ->orderBy('likes_count', 'desc')
            ->orderBy('created_at', 'desc');
    }

    public function scopeNewest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeOldest($query)
    {
        return $query->orderBy('created_at', 'asc');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_pinned' => 'boolean',
            'reports_count' => 'integer',
        ];
    }
}

