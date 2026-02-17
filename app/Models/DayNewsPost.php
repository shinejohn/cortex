<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasReviewsAndRatings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Str;

final class DayNewsPost extends Model
{
    /** @use HasFactory<\Database\Factories\DayNewsPostFactory> */
    use \App\Traits\RelatableToOrganizations, HasFactory, HasReviewsAndRatings;

    protected $fillable = [
        'workspace_id',
        'author_id',
        'writer_agent_id',
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
        'featured_image_path',
        'featured_image_disk',
        'metadata',
        'social_share_status',
        'status',
        'published_at',
        'expires_at',
        'view_count',
        'likes_count',
        'shares_count',
        'comments_count',
        'engagement_score',
        'engagement_calculated_at',
        'is_national',
        'moderation_status',
        'moderation_removal_reason',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function writerAgent(): BelongsTo
    {
        return $this->belongsTo(WriterAgent::class);
    }

    /**
     * Get the display author name (author or writer agent).
     */
    public function getDisplayAuthorAttribute(): ?string
    {
        if ($this->author) {
            return $this->author->name;
        }

        if ($this->writerAgent) {
            return $this->writerAgent->name;
        }

        return null;
    }

    /**
     * Get the display author avatar URL.
     */
    public function getDisplayAuthorAvatarAttribute(): ?string
    {
        if ($this->author) {
            return $this->author->profile_photo_url ?? null;
        }

        if ($this->writerAgent) {
            return $this->writerAgent->avatar_url;
        }

        return null;
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

    public function comments(): HasMany
    {
        return $this->hasMany(ArticleComment::class, 'article_id');
    }

    public function activeComments(): HasMany
    {
        return $this->comments()->where('is_active', true);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'day_news_post_tag')
            ->withTimestamps();
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(SocialActivity::class, 'subject');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->whereNotNull('published_at')
            ->where(function ($q) {
                $q->where('moderation_status', 'published')
                    ->orWhereNull('moderation_status');
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            });
    }

    public function scopeActive($query)
    {
        return $query->published();
    }

    public function scopeForRegion($query, string $regionId)
    {
        return $query->whereHas('regions', function ($q) use ($regionId) {
            $q->where('region_id', $regionId);
        });
    }

    public function scopeNational($query)
    {
        return $query->where('is_national', true);
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

    public function getFeaturedImageAttribute(): ?string
    {
        // Priority: local storage > original URL > null
        if ($this->featured_image_path && $this->featured_image_disk) {
            return \Illuminate\Support\Facades\Storage::disk($this->featured_image_disk)->url($this->featured_image_path);
        }

        return $this->attributes['featured_image'] ?? null;
    }

    /**
     * Calculate and update engagement score
     *
     * Formula: Weighted combination of views, likes, shares, comments
     * Weights: views=1, likes=3, shares=5, comments=4
     */
    public function calculateEngagementScore(): float
    {
        $score = (
            ($this->view_count * 1) +
            ($this->likes_count * 3) +
            ($this->shares_count * 5) +
            ($this->comments_count * 4)
        );

        // Normalize to 0-100 scale (adjust divisor based on your traffic)
        $normalized = min(100, $score / 10);

        $this->update([
            'engagement_score' => $normalized,
            'engagement_calculated_at' => now(),
        ]);

        return $normalized;
    }

    /**
     * Increment a specific engagement metric
     */
    public function incrementEngagement(string $type): void
    {
        $column = match ($type) {
            'view' => 'view_count',
            'like' => 'likes_count',
            'share' => 'shares_count',
            'comment' => 'comments_count',
            default => null,
        };

        if ($column) {
            $this->increment($column);
        }
    }

    /**
     * Scope: High engagement posts
     */
    public function scopeHighEngagement($query, float $minScore = 75.0)
    {
        return $query->where('engagement_score', '>=', $minScore);
    }

    /**
     * Scope: Posts needing engagement recalculation
     */
    public function scopeNeedsEngagementUpdate($query, int $hoursOld = 6)
    {
        return $query->where(function ($q) use ($hoursOld) {
            $q->whereNull('engagement_calculated_at')
                ->orWhere('engagement_calculated_at', '<', now()->subHours($hoursOld));
        });
    }

    /**
     * Get story threads this post belongs to
     */
    public function storyThreads(): BelongsToMany
    {
        // Links to StoryThreads via story_thread_articles pivot
        // Assuming this post corresponds to 'news_article_id' in the pivot
        return $this->belongsToMany(StoryThread::class, 'story_thread_articles', 'news_article_id', 'story_thread_id')
            ->withPivot(['sequence_number', 'narrative_role', 'contribution_summary']);
    }

    protected static function booted(): void
    {
        self::creating(function (DayNewsPost $post): void {
            if (empty($post->slug)) {
                $post->slug = static::generateUniqueSlug($post->title);
            }
        });
    }

    protected static function generateUniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        while (self::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count;
            $count++;
        }

        return $slug;
    }

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
            'view_count' => 'integer',
            'likes_count' => 'integer',
            'shares_count' => 'integer',
            'comments_count' => 'integer',
            'engagement_calculated_at' => 'datetime',
            'is_national' => 'boolean',
            'social_share_status' => 'array',
        ];
    }
}
