<?php

declare(strict_types=1);

namespace App\Models;

use App\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class RssFeedItem extends Model
{
    /** @use HasFactory<\Database\Factories\RssFeedItemFactory> */
    use HasFactory, HasUuid, SoftDeletes;

    protected $fillable = [
        'rss_feed_id',
        'guid',
        'title',
        'description',
        'content',
        'url',
        'author',
        'published_at',
        'categories',
        'metadata',
        'processed',
        'processed_at',
    ];

    public function rssFeed(): BelongsTo
    {
        return $this->belongsTo(RssFeed::class);
    }

    public function dayNewsPosts(): HasMany
    {
        return $this->hasMany(DayNewsPost::class);
    }

    // Scopes
    public function scopeProcessed($query)
    {
        return $query->where('processed', true);
    }

    public function scopeUnprocessed($query)
    {
        return $query->where('processed', false);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('published_at', '>=', now()->subDays($days));
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->whereJsonContains('categories', $category);
    }

    // Helper methods
    public function isProcessed(): bool
    {
        return $this->processed === true;
    }

    public function markAsProcessed(): void
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
        ]);
    }

    public function markAsUnprocessed(): void
    {
        $this->update([
            'processed' => false,
            'processed_at' => null,
        ]);
    }

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'metadata' => 'array',
            'processed' => 'boolean',
            'published_at' => 'datetime',
            'processed_at' => 'datetime',
        ];
    }
}
