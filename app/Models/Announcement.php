<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use App\Traits\HasReviewsAndRatings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

final class Announcement extends Model
{
    use \App\Traits\RelatableToOrganizations, HasFactory, HasReviewsAndRatings, HasUuid;

    protected $fillable = [
        'user_id',
        'workspace_id',
        'type',
        'title',
        'content',
        'image',
        'location',
        'event_date',
        'status',
        'published_at',
        'expires_at',
        'views_count',
        'reactions_count',
        'comments_count',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'announcement_region')
            ->withTimestamps();
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(ArticleComment::class, 'article_id'); // Reuse ArticleComment pattern
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeUpcoming($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('event_date')
                ->orWhere('event_date', '>=', now()->toDateString());
        });
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function incrementReactionsCount(): void
    {
        $this->increment('reactions_count');
    }

    public function incrementCommentsCount(): void
    {
        $this->increment('comments_count');
    }

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
            'views_count' => 'integer',
            'reactions_count' => 'integer',
            'comments_count' => 'integer',
        ];
    }
}
