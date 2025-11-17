<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

final class DayNewsPost extends Model
{
    /** @use HasFactory<\Database\Factories\DayNewsPostFactory> */
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'author_id',
        'rss_feed_id',
        'rss_feed_item_id',
        'source_type',
        'type',
        'category',
        'title',
        'slug',
        'content',
        'excerpt',
        'featured_image',
        'metadata',
        'status',
        'published_at',
        'expires_at',
        'view_count',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class, 'day_news_post_region')
            ->withTimestamps();
    }

    public function payment(): HasOne
    {
        return $this->hasOne(DayNewsPostPayment::class, 'post_id');
    }

    public function advertisements(): MorphMany
    {
        return $this->morphMany(Advertisement::class, 'advertable');
    }

    public function rssFeed(): BelongsTo
    {
        return $this->belongsTo(RssFeed::class);
    }

    public function rssFeedItem(): BelongsTo
    {
        return $this->belongsTo(RssFeedItem::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeActive($query)
    {
        return $query->published();
    }

    public function scopeForRegion($query, int $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
            ->orWhere(function ($q) {
                $q->whereNotNull('expires_at')
                    ->where('expires_at', '<=', now());
            });
    }

    public function scopeForWorkspace($query, int $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function incrementViewCount(): void
    {
        $this->increment('view_count');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isFreeCategory(): bool
    {
        return in_array($this->category, config('services.day_news.free_categories', []));
    }

    protected static function booted(): void
    {
        self::creating(function (DayNewsPost $post): void {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
        });
    }

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
            'view_count' => 'integer',
        ];
    }
}
